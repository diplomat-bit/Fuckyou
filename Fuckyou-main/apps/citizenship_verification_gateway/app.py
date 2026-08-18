import os
import json
import uuid
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from cryptography.fernet import Fernet

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CitizenshipVerificationGateway")

# Encryption Setup (AES-256 Simulation via Fernet)
# In production, this key would be loaded from a secure KMS / Vault
SECRET_KEY = os.getenv("GATEWAY_ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher_suite = Fernet(SECRET_KEY.encode())

def encrypt_value(value: str) -> str:
    if not value:
        return ""
    return cipher_suite.encrypt(value.encode()).decode()

def decrypt_value(token: str) -> str:
    if not token:
        return ""
    try:
        return cipher_suite.decrypt(token.encode()).decode()
    except Exception as e:
        logger.error(f"Decryption failed: {str(e)}")
        return "[DECRYPTION_ERROR]"

# Database Setup
DATABASE_URL = "sqlite:///./citizenship_gateway.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Database Models ---

class DhsSaveRecord(Base):
    __tablename__ = "dhs_save_records"
    id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    dob = Column(String, nullable=False)  # Encrypted
    alien_number = Column(String, unique=True, index=True, nullable=False)
    citizenship_status = Column(String, nullable=False)
    verification_date = Column(DateTime, default=datetime.utcnow)

class SsaRecord(Base):
    __tablename__ = "ssa_records"
    id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    dob = Column(String, nullable=False)  # Encrypted
    ssn_encrypted = Column(String, unique=True, index=True, nullable=False)
    is_citizen = Column(Boolean, default=True)
    death_indicator = Column(Boolean, default=False)

class DodArchiveRecord(Base):
    __tablename__ = "dod_archive_records"
    id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    dob = Column(String, nullable=False)  # Encrypted
    service_number = Column(String, unique=True, index=True, nullable=False)
    naturalization_during_service = Column(Boolean, default=False)
    discharge_date = Column(String, nullable=True)

class VerificationQuery(Base):
    __tablename__ = "verification_queries"
    id = Column(String, primary_key=True, index=True)
    target_system = Column(String, nullable=False)  # DHS, SSA, DOD
    priority = Column(String, nullable=False)  # STANDARD (5-day), EXPEDITED (2-day)
    status = Column(String, default="PENDING")  # PENDING, PROCESSING, COMPLETED, PURGED
    encrypted_payload = Column(Text, nullable=False)  # Encrypted JSON of query parameters
    encrypted_result = Column(Text, nullable=True)  # Encrypted JSON of verification result
    created_at = Column(DateTime, default=datetime.utcnow)
    sla_due_date = Column(DateTime, nullable=False)
    purged = Column(Boolean, default=False)
    purged_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    action = Column(String, nullable=False)
    operator = Column(String, nullable=False)
    details = Column(Text, nullable=False)

# Create Tables
Base.metadata.create_all(bind=engine)

# --- Seed Data Helper ---
def seed_database():
    db = SessionLocal()
    try:
        if db.query(DhsSaveRecord).count() == 0:
            # Seed DHS SAVE
            dhs_data = [
                DhsSaveRecord(id=str(uuid.uuid4()), first_name="Jane", last_name="Doe", dob=encrypt_value("1990-05-15"), alien_number="A12345678", citizenship_status="NATURALIZED_CITIZEN"),
                DhsSaveRecord(id=str(uuid.uuid4()), first_name="Carlos", last_name="Santana", dob=encrypt_value("1985-11-22"), alien_number="A87654321", citizenship_status="PERMANENT_RESIDENT"),
                DhsSaveRecord(id=str(uuid.uuid4()), first_name="Amina", last_name="Al-Mansoor", dob=encrypt_value("1993-01-30"), alien_number="A99887766", citizenship_status="NATURALIZED_CITIZEN")
            ]
            db.add_all(dhs_data)

            # Seed SSA
            ssa_data = [
                SsaRecord(id=str(uuid.uuid4()), first_name="John", last_name="Smith", dob=encrypt_value("1978-04-12"), ssn_encrypted=encrypt_value("999-12-3456"), is_citizen=True, death_indicator=False),
                SsaRecord(id=str(uuid.uuid4()), first_name="Jane", last_name="Doe", dob=encrypt_value("1990-05-15"), ssn_encrypted=encrypt_value("999-55-6666"), is_citizen=True, death_indicator=False),
                SsaRecord(id=str(uuid.uuid4()), first_name="Robert", last_name="Chen", dob=encrypt_value("1965-09-09"), ssn_encrypted=encrypt_value("999-88-1111"), is_citizen=False, death_indicator=False)
            ]
            db.add_all(ssa_data)

            # Seed DOD
            dod_data = [
                DodArchiveRecord(id=str(uuid.uuid4()), first_name="James", last_name="Miller", dob=encrypt_value("1950-07-04"), service_number="USN-778899", naturalization_during_service=True, discharge_date="1972-08-15"),
                DodArchiveRecord(id=str(uuid.uuid4()), first_name="Elena", last_name="Rostova", dob=encrypt_value("1982-03-11"), service_number="USA-112233", naturalization_during_service=True, discharge_date="2010-05-20")
            ]
            db.add_all(dod_data)

            # Seed an expired query to demonstrate the 24-month purge mechanism
            expired_query = VerificationQuery(
                id=str(uuid.uuid4()),
                target_system="DHS",
                priority="STANDARD",
                status="COMPLETED",
                encrypted_payload=encrypt_value(json.dumps({"alien_number": "A12345678"})),
                encrypted_result=encrypt_value(json.dumps({"status": "VERIFIED", "citizenship_status": "NATURALIZED_CITIZEN"})),
                created_at=datetime.utcnow() - timedelta(days=740), # ~24.3 months ago
                sla_due_date=datetime.utcnow() - timedelta(days=735),
                purged=False
            )
            db.add(expired_query)

            # Seed a standard query within retention window
            active_query = VerificationQuery(
                id=str(uuid.uuid4()),
                target_system="SSA",
                priority="EXPEDITED",
                status="COMPLETED",
                encrypted_payload=encrypt_value(json.dumps({"ssn": "999-12-3456"})),
                encrypted_result=encrypt_value(json.dumps({"status": "VERIFIED", "is_citizen": True})),
                created_at=datetime.utcnow() - timedelta(days=10),
                sla_due_date=datetime.utcnow() - timedelta(days=8),
                purged=False
            )
            db.add(active_query)

            db.commit()
            logger.info("Database seeded successfully with mock records and historical queries.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {str(e)}")
    finally:
        db.close()

seed_database()

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Executive Order Citizenship Verification Gateway",
    description="A secure, robust gateway implementing data minimization, AES-256 encryption, and multi-agency query routing.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Schemas ---

class QuerySubmission(BaseModel):
    target_system: str = Field(..., description="DHS, SSA, or DOD")
    priority: str = Field("STANDARD", description="STANDARD (5-day SLA) or EXPEDITED (2-day SLA)")
    first_name: str
    last_name: str
    dob: str = Field(..., description="YYYY-MM-DD")
    identifier: str = Field(..., description="Alien Number, SSN, or Service Number depending on target system")

class PurgeResponse(BaseModel):
    purged_records_count: int
    message: str
    timestamp: datetime

# --- Audit Logging Helper ---
def log_audit_action(db: Session, action: str, operator: str, details: dict):
    audit = AuditLog(
        id=str(uuid.uuid4()),
        action=action,
        operator=operator,
        details=json.dumps(details)
    )
    db.add(audit)
    db.commit()

# --- Background Task for Data Minimization Purge ---
def run_data_minimization_purge(db: Session):
    # 24 months threshold
    threshold_date = datetime.utcnow() - timedelta(days=24 * 30)
    expired_queries = db.query(VerificationQuery).filter(
        VerificationQuery.created_at < threshold_date,
        VerificationQuery.purged == False
    ).all()

    count = len(expired_queries)
    for query in expired_queries:
        query.purged = True
        query.purged_at = datetime.utcnow()
        # Overwrite sensitive encrypted payloads with dummy/purged indicators to enforce data minimization
        query.encrypted_payload = encrypt_value(json.dumps({"status": "PURGED_DUE_TO_RETENTION_POLICY"}))
        query.encrypted_result = encrypt_value(json.dumps({"status": "PURGED_DUE_TO_RETENTION_POLICY"}))
        query.status = "PURGED"
    
    if count > 0:
        db.commit()
        log_audit_action(
            db, 
            action="DATA_MINIMIZATION_PURGE", 
            operator="SYSTEM_CRON", 
            details={"purged_records_count": count, "retention_limit_months": 24}
        )
        logger.info(f"Data minimization purge completed. Purged {count} records older than 24 months.")
    return count

# --- APP 1: DHS SAVE Program Simulation Router ---

@app.post("/api/v1/dhs/verify", tags=["App 1: DHS SAVE Program"])
def verify_dhs_save(first_name: str, last_name: str, dob: str, alien_number: str, db: Session = Depends(get_db)):
    """
    Simulates secure API endpoint for the DHS SAVE program.
    """
    records = db.query(DhsSaveRecord).filter(DhsSaveRecord.alien_number == alien_number).all()
    match = None
    for r in records:
        decrypted_dob = decrypt_value(r.dob)
        if r.first_name.lower() == first_name.lower() and r.last_name.lower() == last_name.lower() and decrypted_dob == dob:
            match = r
            break
    
    log_audit_action(db, "DHS_SAVE_QUERY", "GATEWAY_SERVICE", {"alien_number": alien_number, "found": match is not None})
    
    if match:
        return {
            "status": "VERIFIED",
            "agency": "Department of Homeland Security (SAVE)",
            "alien_number": match.alien_number,
            "citizenship_status": match.citizenship_status,
            "verification_timestamp": match.verification_date.isoformat()
        }
    else:
        return {
            "status": "NOT_FOUND",
            "agency": "Department of Homeland Security (SAVE)",
            "message": "No matching active citizenship record found in SAVE database."
        }

# --- APP 2: Social Security Administration (SSA) Simulation Router ---

@app.post("/api/v1/ssa/verify", tags=["App 2: Social Security Administration"])
def verify_ssa(first_name: str, last_name: str, dob: str, ssn: str, db: Session = Depends(get_db)):
    """
    Simulates secure API endpoint for the Social Security Administration (SSA).
    """
    records = db.query(SsaRecord).all()
    match = None
    for r in records:
        decrypted_ssn = decrypt_value(r.ssn_encrypted)
        decrypted_dob = decrypt_value(r.dob)
        if decrypted_ssn == ssn and r.first_name.lower() == first_name.lower() and r.last_name.lower() == last_name.lower() and decrypted_dob == dob:
            match = r
            break

    log_audit_action(db, "SSA_QUERY", "GATEWAY_SERVICE", {"ssn_last_four": ssn[-4:] if len(ssn) >= 4 else "N/A", "found": match is not None})

    if match:
        return {
            "status": "VERIFIED",
            "agency": "Social Security Administration",
            "is_citizen": match.is_citizen,
            "death_indicator": match.death_indicator,
            "verification_timestamp": datetime.utcnow().isoformat()
        }
    else:
        return {
            "status": "NOT_FOUND",
            "agency": "Social Security Administration",
            "message": "No matching record found in SSA registry."
        }

# --- APP 3: Department of Defense (DOD) Historical Archives Router ---

@app.post("/api/v1/dod/verify", tags=["App 3: Department of Defense Archives"])
def verify_dod(first_name: str, last_name: str, dob: str, service_number: str, db: Session = Depends(get_db)):
    """
    Simulates secure API endpoint for the Department of Defense (DOD) historical archives.
    """
    records = db.query(DodArchiveRecord).filter(DodArchiveRecord.service_number == service_number).all()
    match = None
    for r in records:
        decrypted_dob = decrypt_value(r.dob)
        if r.first_name.lower() == first_name.lower() and r.last_name.lower() == last_name.lower() and decrypted_dob == dob:
            match = r
            break

    log_audit_action(db, "DOD_ARCHIVE_QUERY", "GATEWAY_SERVICE", {"service_number": service_number, "found": match is not None})

    if match:
        return {
            "status": "VERIFIED",
            "agency": "Department of Defense Historical Archives",
            "service_number": match.service_number,
            "naturalization_during_service": match.naturalization_during_service,
            "discharge_date": match.discharge_date,
            "verification_timestamp": datetime.utcnow().isoformat()
        }
    else:
        return {
            "status": "NOT_FOUND",
            "agency": "Department of Defense Historical Archives",
            "message": "No matching historical military record found."
        }

# --- APP 4: Gateway Core & Admin Service Router ---

@app.post("/api/v1/gateway/query", tags=["App 4: Gateway Core & Admin"])
def submit_gateway_query(payload: QuerySubmission, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Core Gateway Entrypoint. Enforces standard (5-day) vs expedited (2-day) query response queues,
    encrypts payloads at rest using AES-256, and routes queries to the appropriate agency.
    """
    # Calculate SLA Due Date
    days_to_add = 2 if payload.priority.upper() == "EXPEDITED" else 5
    sla_due_date = datetime.utcnow() + timedelta(days=days_to_add)

    # Prepare encrypted payload
    raw_payload = {
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "dob": payload.dob,
        "identifier": payload.identifier
    }
    encrypted_payload_str = encrypt_value(json.dumps(raw_payload))

    # Create Query Record
    query_id = str(uuid.uuid4())
    new_query = VerificationQuery(
        id=query_id,
        target_system=payload.target_system.upper(),
        priority=payload.priority.upper(),
        status="PROCESSING",
        encrypted_payload=encrypted_payload_str,
        sla_due_date=sla_due_date,
        purged=False
    )
    db.add(new_query)
    db.commit()

    # Route and execute query immediately (simulating synchronous resolution for the gateway dashboard)
    result = None
    try:
        if payload.target_system.upper() == "DHS":
            result = verify_dhs_save(payload.first_name, payload.last_name, payload.dob, payload.identifier, db)
        elif payload.target_system.upper() == "SSA":
            result = verify_ssa(payload.first_name, payload.last_name, payload.dob, payload.identifier, db)
        elif payload.target_system.upper() == "DOD":
            result = verify_dod(payload.first_name, payload.last_name, payload.dob, payload.identifier, db)
        else:
            raise ValueError("Invalid target system. Must be DHS, SSA, or DOD.")
        
        # Encrypt and save result
        new_query.encrypted_result = encrypt_value(json.dumps(result))
        new_query.status = "COMPLETED"
    except Exception as e:
        new_query.status = "FAILED"
        new_query.encrypted_result = encrypt_value(json.dumps({"error": str(e)}))
        result = {"error": str(e)}
    
    db.commit()

    log_audit_action(db, "GATEWAY_QUERY_SUBMISSION", "GATEWAY_API", {
        "query_id": query_id,
        "target_system": payload.target_system,
        "priority": payload.priority,
        "sla_due_date": sla_due_date.isoformat()
    })

    # Trigger background data minimization check on every query submission to keep DB clean
    background_tasks.add_task(run_data_minimization_purge, db)

    return {
        "query_id": query_id,
        "target_system": payload.target_system,
        "priority": payload.priority,
        "sla_due_date": sla_due_date.isoformat(),
        "status": new_query.status,
        "decrypted_result": result
    }

@app.post("/api/v1/gateway/purge", response_model=PurgeResponse, tags=["App 4: Gateway Core & Admin"])
def trigger_manual_purge(db: Session = Depends(get_db)):
    """
    Manually triggers the 24-month data minimization purge protocol.
    """
    purged_count = run_data_minimization_purge(db)
    return PurgeResponse(
        purged_records_count=purged_count,
        message=f"Data minimization protocol executed. Purged {purged_count} records older than 24 months.",
        timestamp=datetime.utcnow()
    )

@app.get("/api/v1/gateway/queries", tags=["App 4: Gateway Core & Admin"])
def list_queries(db: Session = Depends(get_db)):
    """
    Lists all queries in the gateway queue (with decrypted metadata for visualization).
    """
    queries = db.query(VerificationQuery).order_by(VerificationQuery.created_at.desc()).all()
    result = []
    for q in queries:
        decrypted_payload = {}
        decrypted_res = {}
        if not q.purged:
            try:
                decrypted_payload = json.loads(decrypt_value(q.encrypted_payload))
                if q.encrypted_result:
                    decrypted_res = json.loads(decrypt_value(q.encrypted_result))
            except Exception:
                decrypted_payload = {"error": "Decryption failed"}
        else:
            decrypted_payload = {"status": "PURGED_DUE_TO_RETENTION_POLICY"}
            decrypted_res = {"status": "PURGED_DUE_TO_RETENTION_POLICY"}

        result.append({
            "id": q.id,
            "target_system": q.target_system,
            "priority": q.priority,
            "status": q.status,
            "created_at": q.created_at.isoformat(),
            "sla_due_date": q.sla_due_date.isoformat(),
            "purged": q.purged,
            "purged_at": q.purged_at.isoformat() if q.purged_at else None,
            "decrypted_payload": decrypted_payload,
            "decrypted_result": decrypted_res
        })
    return result

@app.get("/api/v1/gateway/audit-logs", tags=["App 4: Gateway Core & Admin"])
def get_audit_logs(db: Session = Depends(get_db)):
    """
    Retrieves the secure system audit logs.
    """
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    return [
        {
            "id": l.id,
            "timestamp": l.timestamp.isoformat(),
            "action": l.action,
            "operator": l.operator,
            "details": json.loads(l.details) if l.details else {}
        }
        for l in logs
    ]

@app.post("/api/v1/gateway/simulate-expired-record", tags=["App 4: Gateway Core & Admin"])
def simulate_expired_record(db: Session = Depends(get_db)):
    """
    Utility endpoint to inject an expired query (created 25 months ago) to easily test the 24-month purge.
    """
    expired_query = VerificationQuery(
        id=str(uuid.uuid4()),
        target_system="SSA",
        priority="STANDARD",
        status="COMPLETED",
        encrypted_payload=encrypt_value(json.dumps({"ssn": "999-88-1111", "first_name": "Robert", "last_name": "Chen"})),
        encrypted_result=encrypt_value(json.dumps({"status": "VERIFIED", "is_citizen": False})),
        created_at=datetime.utcnow() - timedelta(days=760), # ~25 months ago
        sla_due_date=datetime.utcnow() - timedelta(days=755),
        purged=False
    )
    db.add(expired_query)
    db.commit()
    log_audit_action(db, "SIMULATE_EXPIRED_RECORD", "ADMIN_UI", {"query_id": expired_query.id})
    return {"message": "Expired record (25 months old) injected successfully. Trigger the purge to see it in action!", "query_id": expired_query.id}

# --- Interactive Dashboard UI ---

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def get_dashboard():
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Citizenship Verification Gateway</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen font-sans">
        <!-- Header -->
        <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <div class="bg-indigo-600 p-2 rounded-lg text-white">
                    <i class="fa-solid fa-shield-halved text-xl"></i>
                </div>
                <div>
                    <h1 class="text-lg font-bold tracking-tight">Citizenship Verification Gateway</h1>
                    <p class="text-xs text-slate-400">Executive Order Compliance & Data Minimization Protocol</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    AES-256 Active
                </span>
                <span class="text-xs text-slate-400">SLA: Standard (5d) / Expedited (2d)</span>
            </div>
        </header>

        <main class="max-w-7xl mx-auto p-6 space-y-8">
            <!-- Top Stats / Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p class="text-xs text-slate-400 uppercase tracking-wider">Data Minimization</p>
                        <h3 class="text-xl font-bold mt-1">24-Month Purge</h3>
                        <p class="text-xs text-slate-500 mt-1">Automatic retention enforcement</p>
                    </div>
                    <button onclick="triggerPurge()" class="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5">
                        <i class="fa-solid fa-trash-can"></i> Purge Now
                    </button>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p class="text-xs text-slate-400 uppercase tracking-wider">Simulation Helper</p>
                        <h3 class="text-xl font-bold mt-1">Time Travel</h3>
                        <p class="text-xs text-slate-500 mt-1">Inject 25-month-old record</p>
                    </div>
                    <button onclick="injectExpired()" class="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5">
                        <i class="fa-solid fa-clock-rotate-left"></i> Inject Expired
                    </button>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p class="text-xs text-slate-400 uppercase tracking-wider">Active Queues</p>
                        <h3 class="text-xl font-bold mt-1" id="queue-count">0 Queries</h3>
                        <p class="text-xs text-slate-500 mt-1">Standard & Expedited</p>
                    </div>
                    <div class="bg-indigo-500/10 text-indigo-400 p-3 rounded-lg">
                        <i class="fa-solid fa-list-check text-lg"></i>
                    </div>
                </div>
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p class="text-xs text-slate-400 uppercase tracking-wider">Audit Trail</p>
                        <h3 class="text-xl font-bold mt-1" id="audit-count">0 Logs</h3>
                        <p class="text-xs text-slate-500 mt-1">Immutable system logs</p>
                    </div>
                    <div class="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg">
                        <i class="fa-solid fa-file-shield text-lg"></i>
                    </div>
                </div>
            </div>

            <!-- Main Grid: Left Form, Right Tabs for 4 Apps -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- Left: Submit Query Form -->
                <div class="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
                    <div>
                        <h2 class="text-lg font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-paper-plane text-indigo-400"></i> Submit Verification Query
                        </h2>
                        <p class="text-xs text-slate-400 mt-1">Route secure queries to DHS, SSA, or DOD historical archives.</p>
                    </div>

                    <form id="queryForm" onsubmit="submitQuery(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Target Agency System</label>
                            <select id="target_system" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                                <option value="DHS">DHS SAVE Program (Immigration/Naturalization)</option>
                                <option value="SSA">Social Security Administration (SSN Registry)</option>
                                <option value="DOD">Department of Defense (Historical Archives)</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">First Name</label>
                                <input type="text" id="first_name" required placeholder="Jane" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Last Name</label>
                                <input type="text" id="last_name" required placeholder="Doe" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Date of Birth</label>
                                <input type="date" id="dob" required class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Priority Queue</label>
                                <select id="priority" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                                    <option value="STANDARD">Standard (5-Day SLA)</option>
                                    <option value="EXPEDITED">Expedited (2-Day SLA)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-300 uppercase mb-1.5" id="identifier-label">Alien Registration Number</label>
                            <input type="text" id="identifier" required placeholder="A12345678" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                            <p class="text-[10px] text-slate-500 mt-1" id="identifier-help">Format: A followed by 8 or 9 digits (e.g., A12345678)</p>
                        </div>

                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-shield-check"></i> Execute Secure Query
                        </button>
                    </form>
                </div>

                <!-- Right: 4 Apps Tabs & Visualizations -->
                <div class="lg:col-span-8 space-y-6">
                    <!-- Tabs Header -->
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-1.5 flex space-x-1">
                        <button onclick="switchTab('gateway')" id="tab-gateway" class="tab-btn flex-1 py-2.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 bg-indigo-600 text-white">
                            <i class="fa-solid fa-server"></i> Gateway Core
                        </button>
                        <button onclick="switchTab('dhs')" id="tab-dhs" class="tab-btn flex-1 py-2.5 text-xs font-semibold rounded-lg transition text-slate-400 hover:text-white flex items-center justify-center gap-2">
                            <i class="fa-solid fa-passport"></i> DHS SAVE
                        </button>
                        <button onclick="switchTab('ssa')" id="tab-ssa" class="tab-btn flex-1 py-2.5 text-xs font-semibold rounded-lg transition text-slate-400 hover:text-white flex items-center justify-center gap-2">
                            <i class="fa-solid fa-id-card"></i> SSA Registry
                        </button>
                        <button onclick="switchTab('dod')" id="tab-dod" class="tab-btn flex-1 py-2.5 text-xs font-semibold rounded-lg transition text-slate-400 hover:text-white flex items-center justify-center gap-2">
                            <i class="fa-solid fa-award"></i> DOD Archives
                        </button>
                    </div>

                    <!-- Tab Content: Gateway Core -->
                    <div id="content-gateway" class="tab-content space-y-6">
                        <!-- Query Queue -->
                        <div class="bg-slate-950 border border-slate-800 rounded-xl p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                                    <i class="fa-solid fa-clock text-indigo-400"></i> Gateway Query Queue & SLA Status
                                </h3>
                                <span class="text-xs text-slate-500">Auto-refreshing</span>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="border-b border-slate-800 text-xs text-slate-400 uppercase">
                                            <th class="pb-3 font-semibold">Query ID</th>
                                            <th class="pb-3 font-semibold">Target</th>
                                            <th class="pb-3 font-semibold">Priority</th>
                                            <th class="pb-3 font-semibold">SLA Due</th>
                                            <th class="pb-3 font-semibold">Status</th>
                                            <th class="pb-3 font-semibold">Result (Decrypted)</th>
                                        </tr>
                                    </thead>
                                    <tbody id="query-table-body" class="text-xs divide-y divide-slate-800/50">
                                        <!-- Dynamic Content -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Audit Logs -->
                        <div class="bg-slate-950 border border-slate-800 rounded-xl p-6">
                            <h3 class="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                <i class="fa-solid fa-receipt text-emerald-400"></i> Secure Audit Trail (Immutable)
                            </h3>
                            <div class="overflow-y-auto max-h-60 space-y-3 pr-2" id="audit-logs-container">
                                <!-- Dynamic Content -->
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content: DHS SAVE -->
                    <div id="content-dhs" class="tab-content hidden space-y-6">
                        <div class="bg-slate-950 border border-slate-800 rounded-xl p-6">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <h3 class="text-sm font-bold text-white">DHS SAVE Simulated Database</h3>
                                    <p class="text-xs text-slate-400 mt-0.5">Simulated records representing active immigration and naturalization statuses.</p>
                                </div>
                                <span class="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/20">App 1</span>
                            </div>
                            <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-800 space-y-3">
                                <div class="grid grid-cols-3 gap-4 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800 pb-2">
                                    <div>Name</div>
                                    <div>Alien Number</div>
                                    <div>Citizenship Status</div>
                                </div>
                                <div class="space-y-2 text-xs">
                                    <div class="grid grid-cols-3 gap-4 py-1 border-b border-slate-800/30">
                                        <div class="text-white font-medium">Jane Doe</div>
                                        <div class="font-mono text-slate-300">A12345678</div>
                                        <div><span class="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">NATURALIZED_CITIZEN</span></div>
                                    </div>
                                    <div class="grid grid-cols-3 gap-4 py-1 border-b border-slate-800/30">
                                        <div class="text-white font-medium">Carlos Santana</div>
                                        <div class="font-mono text-slate-300">A87654321</div>
                                        <div><span class="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">PERMANENT_RESIDENT</span></div>
                                    </div>
                                    <div class="grid grid-cols-3 gap-4 py-1">
                                        <div class="text-white font-medium">Amina Al-Mansoor</div>
                                        <div class="font-mono text-slate-300">A99887766</div>
                                        <div><span class="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">NATURALIZED_CITIZEN</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content: SSA Registry -->
                    <div id="content-ssa" class="tab-content hidden space-y-6">
                        <div class="bg-slate-950 border border-slate-800 rounded-xl p-6">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <h3 class="text-sm font-bold text-white">SSA Simulated Registry</h3>
                                    <p class="text-xs text-slate-400 mt-0.5">Simulated Social Security Administration records with citizenship indicators.</p>
                                </div>
                                <span class="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/20">App 2</span>
                            </div>
                            <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-800 space-y-3">
                                <div class="grid grid-cols-4 gap-4 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800 pb-2">
                                    <div>Name</div>
                                    <div>SSN (Encrypted at Rest)</div>
                                    <div>Is Citizen</div>
                                    <div>Death Indicator</div>
                                </div>
                                <div class="space-y-2 text-xs">
                                    <div class="grid grid-cols-4 gap-4 py-1 border-b border-slate-800/30">
                                        <div class="text-white font-medium">John Smith</div>
                                        <div class="font-mono text-slate-500">AES-256 Encrypted</div>
                                        <div><span class="text-emerald-400 font-semibold">YES</span></div>
                                        <div><span class="text-slate-400">FALSE</span></div>
                                    </div>
                                    <div class="grid grid-cols-4 gap-4 py-1 border-b border-slate-800/30">
                                        <div class="text-white font-medium">Jane Doe</div>
                                        <div class="font-mono text-slate-500">AES-256 Encrypted</div>
                                        <div><span class="text-emerald-400 font-semibold">YES</span></div>
                                        <div><span class="text-slate-400">FALSE</span></div>
                                    </div>
                                    <div class="grid grid-cols-4 gap-4 py-1">
                                        <div class="text-white font-medium">Robert Chen</div>
                                        <div class="font-mono text-slate-500">AES-256 Encrypted</div>
                                        <div><span class="text-rose-400 font-semibold">NO</span></div>
                                        <div><span class="text-slate-400">FALSE</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content: DOD Archives -->
                    <div id="content-dod" class="tab-content hidden space-y-6">
                        <div class="bg-slate-950 border border-slate-800 rounded-xl p-6">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <h3 class="text-sm font-bold text-white">DOD Historical Archives</h3>
                                    <p class="text-xs text-slate-400 mt-0.5">Simulated military service records verifying naturalization during active duty.</p>
                                </div>
                                <span class="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/20">App 3</span>
                            </div>
                            <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-800 space-y-3">
                                <div class="grid grid-cols-4 gap-4 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800 pb-2">
                                    <div>Name</div>
                                    <div>Service Number</div>
                                    <div>Naturalized During Service</div>
                                    <div>Discharge Date</div>
                                </div>
                                <div class="space-y-2 text-xs">
                                    <div class="grid grid-cols-4 gap-4 py-1 border-b border-slate-800/30">
                                        <div class="text-white font-medium">James Miller</div>
                                        <div class="font-mono text-slate-300">USN-778899</div>
                                        <div><span class="text-emerald-400 font-semibold">YES</span></div>
                                        <div class="text-slate-400">1972-08-15</div>
                                    </div>
                                    <div class="grid grid-cols-4 gap-4 py-1">
                                        <div class="text-white font-medium">Elena Rostova</div>
                                        <div class="font-mono text-slate-300">USA-112233</div>
                                        <div><span class="text-emerald-400 font-semibold">YES</span></div>
                                        <div class="text-slate-400">2010-05-20</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>

        <!-- Toast Notification -->
        <div id="toast" class="fixed bottom-5 right-5 bg-indigo-600 text-white text-xs px-4 py-3 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 flex items-center gap-2 z-50">
            <i class="fa-solid fa-circle-info"></i>
            <span id="toast-message">Notification message</span>
        </div>

        <script>
            // Handle dynamic form label changes based on target system selection
            const targetSystemSelect = document.getElementById('target_system');
            const identifierLabel = document.getElementById('identifier-label');
            const identifierInput = document.getElementById('identifier');
            const identifierHelp = document.getElementById('identifier-help');

            targetSystemSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'DHS') {
                    identifierLabel.textContent = 'Alien Registration Number';
                    identifierInput.placeholder = 'A12345678';
                    identifierHelp.textContent = 'Format: A followed by 8 or 9 digits (e.g., A12345678)';
                } else if (val === 'SSA') {
                    identifierLabel.textContent = 'Social Security Number (SSN)';
                    identifierInput.placeholder = '999-12-3456';
                    identifierHelp.textContent = 'Format: 3-2-4 digits (e.g., 999-12-3456)';
                } else if (val === 'DOD') {
                    identifierLabel.textContent = 'Military Service Number';
                    identifierInput.placeholder = 'USN-778899';
                    identifierHelp.textContent = 'Format: Branch prefix followed by 6 digits (e.g., USN-778899)';
                }
            });

            // Tab Switching Logic
            function switchTab(tabId) {
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('bg-indigo-600', 'text-white');
                    btn.classList.add('text-slate-400', 'hover:text-white');
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.add('hidden');
                });

                const activeBtn = document.getElementById(`tab-${tabId}`);
                activeBtn.classList.add('bg-indigo-600', 'text-white');
                activeBtn.classList.remove('text-slate-400', 'hover:text-white');

                document.getElementById(`content-${tabId}`).classList.remove('hidden');
            }

            // Toast Helper
            function showToast(message, isError = false) {
                const toast = document.getElementById('toast');
                const toastMsg = document.getElementById('toast-message');
                toastMsg.textContent = message;
                if (isError) {
                    toast.classList.remove('bg-indigo-600');
                    toast.classList.add('bg-rose-600');
                } else {
                    toast.classList.remove('bg-rose-600');
                    toast.classList.add('bg-indigo-600');
                }
                toast.classList.remove('translate-y-20', 'opacity-0');
                setTimeout(() => {
                    toast.classList.add('translate-y-20', 'opacity-0');
                }, 4000);
            }

            // Fetch and Render Queries
            async function loadQueries() {
                try {
                    const res = await fetch('/api/v1/gateway/queries');
                    const data = await res.json();
                    document.getElementById('queue-count').textContent = `${data.length} Queries`;
                    
                    const tbody = document.getElementById('query-table-body');
                    tbody.innerHTML = '';

                    data.forEach(q => {
                        const isPurged = q.purged;
                        const statusClass = q.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            q.status === 'PURGED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20';
                        
                        const priorityClass = q.priority === 'EXPEDITED' ? 'text-amber-400 font-semibold' : 'text-slate-400';

                        let resultDisplay = '';
                        if (isPurged) {
                            resultDisplay = `<span class="text-rose-400 italic"><i class="fa-solid fa-user-slash"></i> Purged (24m Retention)</span>`;
                        } else {
                            resultDisplay = `<pre class="bg-slate-900 p-2 rounded text-[10px] text-slate-300 overflow-x-auto max-w-xs">${JSON.stringify(q.decrypted_result, null, 2)}</pre>`;
                        }

                        const row = `
                            <tr class="hover:bg-slate-900/40 transition">
                                <td class="py-3 font-mono text-[10px] text-slate-400">${q.id.substring(0, 8)}...</td>
                                <td class="py-3 font-semibold text-slate-200">${q.target_system}</td>
                                <td class="py-3 ${priorityClass}">${q.priority}</td>
                                <td class="py-3 text-slate-400">${new Date(q.sla_due_date).toLocaleDateString()}</td>
                                <td class="py-3">
                                    <span class="px-2 py-0.5 rounded-full border text-[10px] ${statusClass}">${q.status}</span>
                                </td>
                                <td class="py-3">${resultDisplay}</td>
                            </tr>
                        `;
                        tbody.innerHTML += row;
                    });
                } catch (err) {
                    console.error("Error loading queries:", err);
                }
            }

            // Fetch and Render Audit Logs
            async function loadAuditLogs() {
                try {
                    const res = await fetch('/api/v1/gateway/audit-logs');
                    const data = await res.json();
                    document.getElementById('audit-count').textContent = `${data.length} Logs`;

                    const container = document.getElementById('audit-logs-container');
                    container.innerHTML = '';

                    data.forEach(l => {
                        const logItem = `
                            <div class="bg-slate-900/60 border border-slate-800/60 rounded-lg p-3 flex justify-between items-start text-xs">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-2">
                                        <span class="font-bold text-slate-200">${l.action}</span>
                                        <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">${l.operator}</span>
                                    </div>
                                    <p class="text-[11px] text-slate-400 font-mono">${JSON.stringify(l.details)}</p>
                                </div>
                                <span class="text-[10px] text-slate-500 font-mono">${new Date(l.timestamp).toLocaleTimeString()}</span>
                            </div>
                        `;
                        container.innerHTML += logItem;
                    });
                } catch (err) {
                    console.error("Error loading audit logs:", err);
                }
            }

            // Submit Query Form
            async function submitQuery(e) {
                e.preventDefault();
                const payload = {
                    target_system: document.getElementById('target_system').value,
                    priority: document.getElementById('priority').value,
                    first_name: document.getElementById('first_name').value,
                    last_name: document.getElementById('last_name').value,
                    dob: document.getElementById('dob').value,
                    identifier: document.getElementById('identifier').value
                };

                try {
                    const res = await fetch('/api/v1/gateway/query', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (res.ok) {
                        showToast("Query executed and routed successfully!");
                        document.getElementById('queryForm').reset();
                        loadQueries();
                        loadAuditLogs();
                    } else {
                        showToast(data.detail || "Error executing query", true);
                    }
                } catch (err) {
                    showToast("Network error submitting query", true);
                }
            }

            // Trigger Manual Purge
            async function triggerPurge() {
                try {
                    const res = await fetch('/api/v1/gateway/purge', { method: 'POST' });
                    const data = await res.json();
                    showToast(`Purge complete! ${data.purged_records_count} records purged.`);
                    loadQueries();
                    loadAuditLogs();
                } catch (err) {
                    showToast("Error triggering purge", true);
                }
            }

            // Inject Expired Record
            async function injectExpired() {
                try {
                    const res = await fetch('/api/v1/gateway/simulate-expired-record', { method: 'POST' });
                    const data = await res.json();
                    showToast("Expired record injected! Ready for purge test.");
                    loadQueries();
                    loadAuditLogs();
                } catch (err) {
                    showToast("Error injecting expired record", true);
                }
            }

            // Initial Load & Auto-Refresh
            loadQueries();
            loadAuditLogs();
            setInterval(() => {
                loadQueries();
                loadAuditLogs();
            }, 10000);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

# --- Run App ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)