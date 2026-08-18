import streamlit as st
import pandas as pd
import numpy as np
import datetime
import hashlib
import uuid
import plotly.express as px
import plotly.graph_objects as go
from io import BytesIO

# Set page configuration
st.set_page_config(
    page_title="Audit & Compliance Tracker",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional styling
st.markdown("""
<style>
    .reportview-container {
        background: #f5f7f9;
    }
    .main .block-container {
        padding-top: 2rem;
    }
    .stMetric {
        background-color: #ffffff;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #0066cc;
    }
    .integrity-valid {
        color: #2e7d32;
        font-weight: bold;
        background-color: #e8f5e9;
        padding: 5px 10px;
        border-radius: 4px;
    }
    .integrity-invalid {
        color: #c62828;
        font-weight: bold;
        background-color: #ffebee;
        padding: 5px 10px;
        border-radius: 4px;
    }
</style>
""", unsafe_allow_html=True)

# --- SESSION STATE INITIALIZATION ---
if 'statements' not in st.session_state:
    # Seed some initial statements
    st.session_state.statements = [
        {
            "statement_id": "STMT-2023-001",
            "filename": "Q1_Financial_Statement_2023.pdf",
            "created_at": "2023-04-15 10:30:00",
            "created_by": "finance_system_auto",
            "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "content_payload": "Q1 2023 Financials: Revenue $12.4M, Net Income $2.1M. Approved by Board.",
            "tampered": False
        },
        {
            "statement_id": "STMT-2023-002",
            "filename": "Q2_Financial_Statement_2023.pdf",
            "created_at": "2023-07-15 11:15:00",
            "created_by": "finance_system_auto",
            "checksum": "8f42a33b2e991c149afbf4c8996fb92427ae41e4649b934ca495991b7852b123",
            "content_payload": "Q2 2023 Financials: Revenue $14.1M, Net Income $2.8M. Approved by Board.",
            "tampered": False
        },
        {
            "statement_id": "STMT-2023-003",
            "filename": "Q3_Financial_Statement_2023.pdf",
            "created_at": "2023-10-15 09:00:00",
            "created_by": "finance_system_auto",
            "checksum": "5a12c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999",
            "content_payload": "Q3 2023 Financials: Revenue $13.8M, Net Income $2.5M. Approved by Board.",
            "tampered": False
        },
        {
            "statement_id": "STMT-2023-004",
            "filename": "HR_Annual_Compliance_Report_2023.pdf",
            "created_at": "2023-12-20 14:45:00",
            "created_by": "hr_system_auto",
            "checksum": "7d22a44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b444",
            "content_payload": "HR Compliance Report 2023: 100% training completion rate. No major incidents.",
            "tampered": False
        }
    ]

if 'retrieval_logs' not in st.session_state:
    # Seed some initial retrieval logs
    st.session_state.retrieval_logs = [
        {
            "log_id": "LOG-89213",
            "timestamp": "2023-10-16 11:20:15",
            "statement_id": "STMT-2023-001",
            "retrieved_by": "auditor_sarah",
            "department": "Internal Audit",
            "purpose": "Routine Q3 Audit Review",
            "ip_address": "192.168.10.45",
            "integrity_verified": True
        },
        {
            "log_id": "LOG-89214",
            "timestamp": "2023-10-17 14:05:22",
            "statement_id": "STMT-2023-002",
            "retrieved_by": "auditor_sarah",
            "department": "Internal Audit",
            "purpose": "Routine Q3 Audit Review",
            "ip_address": "192.168.10.45",
            "integrity_verified": True
        },
        {
            "log_id": "LOG-89215",
            "timestamp": "2023-11-02 09:12:00",
            "statement_id": "STMT-2023-003",
            "retrieved_by": "compliance_officer_john",
            "department": "Compliance & Risk",
            "purpose": "External Regulatory Filing Prep",
            "ip_address": "192.168.12.101",
            "integrity_verified": True
        },
        {
            "log_id": "LOG-89216",
            "timestamp": "2023-12-21 16:30:10",
            "statement_id": "STMT-2023-004",
            "retrieved_by": "hr_director_mary",
            "department": "Human Resources",
            "purpose": "Year-end Board Presentation",
            "ip_address": "192.168.20.15",
            "integrity_verified": True
        }
    ]

# --- HELPER FUNCTIONS ---
def calculate_sha256(text: str) -> str:
    """Calculates SHA-256 checksum of a given string."""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def log_retrieval_event(statement_id, user, department, purpose, ip):
    """Logs a statement retrieval event and verifies integrity."""
    # Find statement
    stmt = next((s for s in st.session_state.statements if s["statement_id"] == statement_id), None)
    
    if stmt:
        # Verify integrity: recalculate checksum of current payload and compare with stored checksum
        current_checksum = calculate_sha256(stmt["content_payload"])
        integrity_passed = (current_checksum == stmt["checksum"]) and not stmt["tampered"]
        
        new_log = {
            "log_id": f"LOG-{uuid.uuid4().hex[:6].upper()}",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "statement_id": statement_id,
            "retrieved_by": user,
            "department": department,
            "purpose": purpose,
            "ip_address": ip,
            "integrity_verified": integrity_passed
        }
        st.session_state.retrieval_logs.append(new_log)
        return new_log
    return None

# --- SIDEBAR NAVIGATION ---
st.sidebar.title("🛡️ Audit & Compliance")
st.sidebar.markdown("---")
menu = st.sidebar.radio(
    "Navigation",
    [
        "Dashboard Overview",
        "Log Statement Retrieval",
        "Statement Registry",
        "Audit Trail & Reports",
        "System Integrity Verification"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    "**System Status:** Active\n\n"
    "This system tracks statement retrieval events, stores cryptographic checksums, "
    "and provides tamper-evident verification for internal auditors."
)

# --- PAGE 1: DASHBOARD OVERVIEW ---
if menu == "Dashboard Overview":
    st.title("📊 Audit & Compliance Dashboard")
    st.markdown("Real-time monitoring of statement retrievals, system integrity, and compliance metrics.")
    
    # Calculate Metrics
    total_statements = len(st.session_state.statements)
    total_retrievals = len(st.session_state.retrieval_logs)
    
    # Check for any integrity failures
    integrity_failures = sum(1 for log in st.session_state.retrieval_logs if not log["integrity_verified"])
    tampered_statements = sum(1 for s in st.session_state.statements if s["tampered"])
    
    # Layout Metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Registered Statements", total_statements)
    with col2:
        st.metric("Total Retrieval Events Logged", total_retrievals)
    with col3:
        st.metric(
            "Integrity Failures Detected", 
            integrity_failures, 
            delta="- Alert" if integrity_failures > 0 else "Normal",
            delta_color="inverse" if integrity_failures > 0 else "normal"
        )
    with col4:
        st.metric(
            "Tampered Statements", 
            tampered_statements,
            delta="Critical" if tampered_statements > 0 else "Secure",
            delta_color="inverse" if tampered_statements > 0 else "normal"
        )
        
    st.markdown("---")
    
    # Visualizations
    col_chart1, col_chart2 = st.columns(2)
    
    df_logs = pd.DataFrame(st.session_state.retrieval_logs)
    df_stmts = pd.DataFrame(st.session_state.statements)
    
    with col_chart1:
        st.subheader("Retrievals by Department")
        if not df_logs.empty:
            dept_counts = df_logs['department'].value_counts().reset_index()
            dept_counts.columns = ['Department', 'Retrievals']
            fig = px.pie(dept_counts, values='Retrievals', names='Department', 
                         color_discrete_sequence=px.colors.qualitative.Pastel)
            fig.update_layout(margin=dict(t=20, b=20, l=20, r=20))
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No retrieval data available.")
            
    with col_chart2:
        st.subheader("Retrieval Purpose Distribution")
        if not df_logs.empty:
            purpose_counts = df_logs['purpose'].value_counts().reset_index()
            purpose_counts.columns = ['Purpose', 'Count']
            fig = px.bar(purpose_counts, x='Count', y='Purpose', orientation='h',
                         color='Purpose', color_discrete_sequence=px.colors.qualitative.Safe)
            fig.update_layout(showlegend=False, margin=dict(t=20, b=20, l=20, r=20))
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No retrieval data available.")

    # Recent Activity Table
    st.subheader("Recent Retrieval Events")
    if not df_logs.empty:
        # Merge with statements to get filenames
        df_display = df_logs.merge(df_stmts[['statement_id', 'filename']], on='statement_id', how='left')
        df_display = df_display.sort_values(by='timestamp', ascending=False).head(5)
        
        # Format integrity column
        df_display['integrity_verified'] = df_display['integrity_verified'].apply(
            lambda x: "✅ Valid" if x else "❌ Compromised"
        )
        
        st.dataframe(
            df_display[['timestamp', 'log_id', 'filename', 'retrieved_by', 'department', 'purpose', 'integrity_verified']],
            use_container_width=True
        )
    else:
        st.info("No recent activity.")

# --- PAGE 2: LOG STATEMENT RETRIEVAL ---
elif menu == "Log Statement Retrieval":
    st.title("📝 Log Statement Retrieval Event")
    st.markdown("Use this form to log and authorize the retrieval of a registered statement. The system will automatically verify the cryptographic integrity of the statement upon retrieval.")
    
    # Form layout
    with st.form("retrieval_form", clear_on_submit=True):
        st.subheader("Retrieval Details")
        
        # Dropdown of registered statements
        stmt_options = {s["statement_id"]: f"{s['statement_id']} - {s['filename']}" for s in st.session_state.statements}
        selected_stmt_id = st.selectbox("Select Statement to Retrieve", options=list(stmt_options.keys()), format_func=lambda x: stmt_options[x])
        
        col1, col2 = st.columns(2)
        with col1:
            retrieved_by = st.text_input("Auditor / User Name", placeholder="e.g., auditor_sarah")
            department = st.selectbox("Department", ["Internal Audit", "Compliance & Risk", "Human Resources", "Finance", "Legal", "External Auditor"])
        with col2:
            ip_address = st.text_input("IP Address", value="192.168.10.45")
            purpose = st.text_input("Purpose of Retrieval", placeholder="e.g., Annual Tax Audit")
            
        submit_btn = st.form_submit_button("Retrieve & Log Event")
        
        if submit_btn:
            if not retrieved_by or not purpose:
                st.error("Please fill in all required fields (Auditor Name and Purpose).")
            else:
                # Log the event
                log_entry = log_retrieval_event(selected_stmt_id, retrieved_by, department, purpose, ip_address)
                
                if log_entry:
                    st.success(f"Event logged successfully! Log ID: {log_entry['log_id']}")
                    
                    # Display Integrity Status
                    if log_entry['integrity_verified']:
                        st.markdown("<div class='integrity-valid'>✅ INTEGRITY VERIFIED: Cryptographic checksum matches the registry. The statement has not been tampered with.</div>", unsafe_allow_html=True)
                    else:
                        st.markdown("<div class='integrity-invalid'>⚠️ INTEGRITY FAILURE: Cryptographic checksum mismatch! The statement content may have been altered since registration.</div>", unsafe_allow_html=True)
                    
                    # Show retrieved content
                    stmt = next(s for s in st.session_state.statements if s["statement_id"] == selected_stmt_id)
                    st.markdown("### Retrieved Statement Content Preview")
                    st.info(stmt["content_payload"])
                else:
                    st.error("Error retrieving statement. Statement ID not found.")

# --- PAGE 3: STATEMENT REGISTRY ---
elif menu == "Statement Registry":
    st.title("🗄️ Statement Registry")
    st.markdown("Register new statements, generate cryptographic SHA-256 checksums, and manage existing records.")
    
    # Register New Statement Form
    with st.expander("➕ Register New Statement", expanded=False):
        with st.form("register_form", clear_on_submit=True):
            st.subheader("Statement Metadata")
            col1, col2 = st.columns(2)
            with col1:
                stmt_id = st.text_input("Statement ID (Unique)", value=f"STMT-{datetime.datetime.now().year}-{uuid.uuid4().hex[:3].upper()}")
                filename = st.text_input("Filename", placeholder="e.g., Q4_Financial_Statement_2023.pdf")
            with col2:
                created_by = st.text_input("Created By / System Source", value="finance_system_auto")
                
            content_payload = st.text_area("Statement Content / Payload (Used to generate checksum)", placeholder="Enter the text content of the statement here...")
            
            register_btn = st.form_submit_button("Register Statement")
            
            if register_btn:
                # Validation
                if not filename or not content_payload:
                    st.error("Filename and Content Payload are required.")
                elif any(s["statement_id"] == stmt_id for s in st.session_state.statements):
                    st.error("Statement ID already exists. Please use a unique ID.")
                else:
                    # Calculate checksum
                    checksum = calculate_sha256(content_payload)
                    
                    # Add to session state
                    new_stmt = {
                        "statement_id": stmt_id,
                        "filename": filename,
                        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "created_by": created_by,
                        "checksum": checksum,
                        "content_payload": content_payload,
                        "tampered": False
                    }
                    st.session_state.statements.append(new_stmt)
                    st.success(f"Statement '{filename}' successfully registered with SHA-256 Checksum: {checksum}")

    # Display Registered Statements
    st.subheader("Registered Statements")
    df_stmts = pd.DataFrame(st.session_state.statements)
    
    if not df_stmts.empty:
        # Format display
        df_display = df_stmts.copy()
        df_display['tampered_status'] = df_display['tampered'].apply(lambda x: "⚠️ Tampered" if x else "✅ Secure")
        
        st.dataframe(
            df_display[['statement_id', 'filename', 'created_at', 'created_by', 'checksum', 'tampered_status']],
            use_container_width=True
        )
        
        # Detail view
        st.markdown("### View Statement Details")
        selected_detail_id = st.selectbox("Select Statement to View Details", options=df_stmts['statement_id'].tolist())
        if selected_detail_id:
            selected_stmt = next(s for s in st.session_state.statements if s["statement_id"] == selected_detail_id)
            st.json(selected_stmt)
    else:
        st.info("No statements registered yet.")

# --- PAGE 4: AUDIT TRAIL & REPORTS ---
elif menu == "Audit Trail & Reports":
    st.title("📋 Compliance Reporting & Audit Trail")
    st.markdown("Filter, analyze, and export statement retrieval logs for internal and external compliance audits.")
    
    df_logs = pd.DataFrame(st.session_state.retrieval_logs)
    df_stmts = pd.DataFrame(st.session_state.statements)
    
    if not df_logs.empty:
        # Merge to get filename
        df_report = df_logs.merge(df_stmts[['statement_id', 'filename']], on='statement_id', how='left')
        
        # Filters
        st.subheader("Filter Logs")
        col1, col2, col3 = st.columns(3)
        with col1:
            filter_user = st.multiselect("Filter by Auditor/User", options=df_report['retrieved_by'].unique())
        with col2:
            filter_dept = st.multiselect("Filter by Department", options=df_report['department'].unique())
        with col3:
            filter_status = st.multiselect("Filter by Integrity Status", options=["Valid", "Compromised"])
            
        # Apply filters
        if filter_user:
            df_report = df_report[df_report['retrieved_by'].isin(filter_user)]
        if filter_dept:
            df_report = df_report[df_report['department'].isin(filter_dept)]
        if filter_status:
            status_bools = []
            if "Valid" in filter_status:
                status_bools.append(True)
            if "Compromised" in filter_status:
                status_bools.append(False)
            df_report = df_report[df_report['integrity_verified'].isin(status_bools)]
            
        # Display filtered results
        st.markdown(f"Showing **{len(df_report)}** log entries")
        
        # Format for display
        df_report_display = df_report.copy()
        df_report_display['integrity_verified'] = df_report_display['integrity_verified'].apply(
            lambda x: "✅ Valid" if x else "❌ Compromised"
        )
        
        st.dataframe(df_report_display, use_container_width=True)
        
        # Export options
        st.subheader("Export Audit Report")
        col_exp1, col_exp2 = st.columns(2)
        
        # CSV Export
        csv = df_report.to_csv(index=False).encode('utf-8')
        with col_exp1:
            st.download_button(
                label="📥 Download Report as CSV",
                data=csv,
                file_name=f"audit_report_{datetime.date.today()}.csv",
                mime="text/csv"
            )
            
        # JSON Export
        json_str = df_report.to_json(orient="records", indent=4)
        with col_exp2:
            st.download_button(
                label="📥 Download Report as JSON",
                data=json_str,
                file_name=f"audit_report_{datetime.date.today()}.json",
                mime="application/json"
            )
    else:
        st.info("No retrieval logs available to report.")

# --- PAGE 5: SYSTEM INTEGRITY VERIFICATION ---
elif menu == "System Integrity Verification":
    st.title("🛡️ Cryptographic System Integrity Verification")
    st.markdown(
        "This interface allows auditors to verify the cryptographic integrity of all registered statements. "
        "By recalculating the SHA-256 hash of the current statement content and comparing it with the registered checksum, "
        "we can instantly detect unauthorized modifications (tampering)."
    )
    
    # Simulation Section
    st.subheader("🛠️ Simulate Tampering (For Demonstration)")
    st.warning(
        "Use this section to simulate an unauthorized database modification. "
        "This demonstrates how the system instantly flags tampered files during audit checks."
    )
    
    stmt_to_tamper = st.selectbox(
        "Select a Statement to Tamper With", 
        options=[s["statement_id"] for s in st.session_state.statements]
    )
    
    col_tamp1, col_tamp2 = st.columns(2)
    with col_tamp1:
        if st.button("⚠️ Tamper with Selected Statement Content", use_container_width=True):
            for s in st.session_state.statements:
                if s["statement_id"] == stmt_to_tamper:
                    s["content_payload"] += " [UNAUTHORIZED ALTERATION: Changed Net Income to $10.0M]"
                    s["tampered"] = True
                    st.error(f"Statement {stmt_to_tamper} content has been altered in the database!")
                    
    with col_tamp2:
        if st.button("🔄 Restore All Statements to Original State", use_container_width=True):
            # Reset to original state
            st.session_state.statements = [
                {
                    "statement_id": "STMT-2023-001",
                    "filename": "Q1_Financial_Statement_2023.pdf",
                    "created_at": "2023-04-15 10:30:00",
                    "created_by": "finance_system_auto",
                    "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "content_payload": "Q1 2023 Financials: Revenue $12.4M, Net Income $2.1M. Approved by Board.",
                    "tampered": False
                },
                {
                    "statement_id": "STMT-2023-002",
                    "filename": "Q2_Financial_Statement_2023.pdf",
                    "created_at": "2023-07-15 11:15:00",
                    "created_by": "finance_system_auto",
                    "checksum": "8f42a33b2e991c149afbf4c8996fb92427ae41e4649b934ca495991b7852b123",
                    "content_payload": "Q2 2023 Financials: Revenue $14.1M, Net Income $2.8M. Approved by Board.",
                    "tampered": False
                },
                {
                    "statement_id": "STMT-2023-003",
                    "filename": "Q3_Financial_Statement_2023.pdf",
                    "created_at": "2023-10-15 09:00:00",
                    "created_by": "finance_system_auto",
                    "checksum": "5a12c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999",
                    "content_payload": "Q3 2023 Financials: Revenue $13.8M, Net Income $2.5M. Approved by Board.",
                    "tampered": False
                },
                {
                    "statement_id": "STMT-2023-004",
                    "filename": "HR_Annual_Compliance_Report_2023.pdf",
                    "created_at": "2023-12-20 14:45:00",
                    "created_by": "hr_system_auto",
                    "checksum": "7d22a44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b444",
                    "content_payload": "HR Compliance Report 2023: 100% training completion rate. No major incidents.",
                    "tampered": False
                }
            ]
            st.success("All statements restored to original secure state.")

    st.markdown("---")
    
    # Verification Engine
    st.subheader("🔍 Run System-Wide Integrity Check")
    if st.button("🚀 Run Cryptographic Audit Verification", type="primary"):
        verification_results = []
        all_passed = True
        
        for s in st.session_state.statements:
            current_hash = calculate_sha256(s["content_payload"])
            registered_hash = s["checksum"]
            match = (current_hash == registered_hash) and not s["tampered"]
            
            if not match:
                all_passed = False
                
            verification_results.append({
                "Statement ID": s["statement_id"],
                "Filename": s["filename"],
                "Registered Checksum": registered_hash,
                "Current Checksum": current_hash,
                "Status": "✅ SECURE" if match else "❌ COMPROMISED"
            })
            
        df_results = pd.DataFrame(verification_results)
        
        if all_passed:
            st.balloons()
            st.success("🎉 SYSTEM INTEGRITY VERIFIED: All registered statements match their cryptographic signatures perfectly!")
        else:
            st.error("🚨 SYSTEM INTEGRITY COMPROMISED: One or more statements failed the cryptographic verification check!")
            
        st.table(df_results)