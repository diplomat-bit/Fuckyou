import os
import json
import uuid
import hashlib
from datetime import datetime
from flask import Flask, request, jsonify, render_template_string

app = Flask(__name__)

# In-memory database for audit logs and compliance evidence
AUDIT_LOGS = []

# Mock databases for AML/KYC checks
SDN_LIST = [
    "vladimir petrov", 
    "saddam hussein", 
    "kim jong un", 
    "sinaloa cartel", 
    "yakuza syndicate",
    "al-qaeda association"
]

HIGH_RISK_COUNTRIES = [
    "North Korea", "Iran", "Syria", "Myanmar", "South Sudan", "Yemen"
]

# Helper function to generate cryptographic evidence hash
def generate_evidence_hash(payload):
    serialized = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

# Helper to log compliance events
def log_compliance_event(guardrail_type, inputs, evaluation_results, verdict):
    evidence_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    evidence_payload = {
        "evidence_id": evidence_id,
        "timestamp": timestamp,
        "guardrail_type": guardrail_type,
        "inputs": inputs,
        "evaluation_results": evaluation_results,
        "verdict": verdict
    }
    
    evidence_hash = generate_evidence_hash(evidence_payload)
    evidence_payload["cryptographic_hash"] = evidence_hash
    
    # Insert at the beginning of the log
    AUDIT_LOGS.insert(0, evidence_payload)
    return evidence_payload

# --- Flask Routes ---

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/audit-log', methods=['GET'])
def get_audit_log():
    return jsonify(AUDIT_LOGS)

@app.route('/api/clear-log', methods=['POST'])
def clear_log():
    AUDIT_LOGS.clear()
    return jsonify({"status": "success", "message": "Audit log cleared."})

# 1. FINRA-4210 Margin Requirements Guardrail
@app.route('/api/finra-4210', methods=['POST'])
def check_finra_4210():
    data = request.json or {}
    try:
        position_type = data.get('position_type', 'Long') # Long or Short
        market_value = float(data.get('market_value', 0))
        debit_balance = float(data.get('debit_balance', 0)) # For Long
        credit_balance = float(data.get('credit_balance', 0)) # For Short
        
        # Calculations
        if position_type == 'Long':
            equity = market_value - debit_balance
            maintenance_requirement_pct = 25.0
            required_maintenance = market_value * 0.25
        else: # Short
            equity = credit_balance - market_value
            maintenance_requirement_pct = 30.0
            required_maintenance = market_value * 0.30
            
        margin_percentage = (equity / market_value * 100) if market_value > 0 else 0
        margin_call_active = equity < required_maintenance
        margin_call_amount = max(0.0, required_maintenance - equity) if margin_call_active else 0.0
        
        rules = [
            {
                "rule_id": "FINRA-4210-R1",
                "description": f"Maintenance margin requirement must be at least {maintenance_requirement_pct}% of market value.",
                "threshold": f"${required_maintenance:,.2f}",
                "actual": f"${equity:,.2f}",
                "status": "PASS" if not margin_call_active else "FAIL"
            }
        ]
        
        verdict = "COMPLIANT" if not margin_call_active else "MARGIN_CALL_TRIGGERED"
        
        evaluation_results = {
            "equity": equity,
            "margin_percentage": margin_percentage,
            "required_maintenance": required_maintenance,
            "margin_call_active": margin_call_active,
            "margin_call_amount": margin_call_amount,
            "rules": rules
        }
        
        evidence = log_compliance_event("FINRA-4210", data, evaluation_results, verdict)
        return jsonify(evidence)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 2. SEC-15C3-3 Customer Protection Asset Segregation Guardrail
@app.route('/api/sec-15c3-3', methods=['POST'])
def check_sec_15c3_3():
    data = request.json or {}
    try:
        # Credits (Rule 15c3-3 Formula items 1-9)
        free_credit_balances = float(data.get('free_credit_balances', 0))
        other_credit_balances = float(data.get('other_credit_balances', 0))
        monies_borrowed_collateralized = float(data.get('monies_borrowed_collateralized', 0))
        
        # Debits (Rule 15c3-3 Formula items 10-14)
        debit_balances_margin = float(data.get('debit_balances_margin', 0))
        other_debit_balances = float(data.get('other_debit_balances', 0))
        
        actual_reserve_deposit = float(data.get('actual_reserve_deposit', 0))
        
        total_credits = free_credit_balances + other_credit_balances + monies_borrowed_collateralized
        total_debits = debit_balances_margin + other_debit_balances
        
        # Reserve Requirement calculation
        required_reserve = max(0.0, total_credits - total_debits)
        reserve_deficit = max(0.0, required_reserve - actual_reserve_deposit)
        is_compliant = reserve_deficit <= 0
        
        rules = [
            {
                "rule_id": "SEC-15C3-3-R1",
                "description": "Special Reserve Bank Account balance must equal or exceed the excess of total credits over total debits.",
                "threshold": f"${required_reserve:,.2f}",
                "actual": f"${actual_reserve_deposit:,.2f}",
                "status": "PASS" if is_compliant else "FAIL"
            }
        ]
        
        verdict = "COMPLIANT" if is_compliant else "RESERVE_DEFICIT_VIOLATION"
        
        evaluation_results = {
            "total_credits": total_credits,
            "total_debits": total_debits,
            "required_reserve": required_reserve,
            "actual_reserve_deposit": actual_reserve_deposit,
            "reserve_deficit": reserve_deficit,
            "rules": rules
        }
        
        evidence = log_compliance_event("SEC-15C3-3", data, evaluation_results, verdict)
        return jsonify(evidence)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 3. AML-KYC Compliance Guardrail
@app.route('/api/aml-kyc', methods=['POST'])
def check_aml_kyc():
    data = request.json or {}
    try:
        customer_name = data.get('customer_name', '').strip()
        country = data.get('country', 'United States').strip()
        is_pep = data.get('is_pep', False) # Politically Exposed Person
        transaction_amount = float(data.get('transaction_amount', 0))
        payment_method = data.get('payment_method', 'Wire Transfer') # Cash, Wire, Crypto
        
        rules = []
        risk_score = 0
        flags = []
        
        # Rule 1: OFAC SDN List Check
        sdn_match = customer_name.lower() in SDN_LIST
        if sdn_match:
            risk_score += 100
            flags.append("OFAC SDN MATCH DETECTED")
            rules.append({
                "rule_id": "AML-KYC-R1",
                "description": "Customer name must not match any entity on the OFAC SDN List.",
                "threshold": "No Match",
                "actual": f"MATCH FOUND: {customer_name}",
                "status": "FAIL"
            })
        else:
            rules.append({
                "rule_id": "AML-KYC-R1",
                "description": "Customer name must not match any entity on the OFAC SDN List.",
                "threshold": "No Match",
                "actual": "No Match",
                "status": "PASS"
            })
            
        # Rule 2: High Risk Country Check
        is_high_risk_country = country in HIGH_RISK_COUNTRIES
        if is_high_risk_country:
            risk_score += 40
            flags.append("HIGH RISK JURISDICTION")
            rules.append({
                "rule_id": "AML-KYC-R2",
                "description": "Customer jurisdiction must not be on the FATF High-Risk/Non-Cooperative list.",
                "threshold": "Standard Jurisdiction",
                "actual": f"High-Risk Country: {country}",
                "status": "FAIL"
            })
        else:
            rules.append({
                "rule_id": "AML-KYC-R2",
                "description": "Customer jurisdiction must not be on the FATF High-Risk/Non-Cooperative list.",
                "threshold": "Standard Jurisdiction",
                "actual": f"Standard Country: {country}",
                "status": "PASS"
            })
            
        # Rule 3: PEP Screening
        if is_pep:
            risk_score += 30
            flags.append("POLITICALLY EXPOSED PERSON (PEP)")
            rules.append({
                "rule_id": "AML-KYC-R3",
                "description": "Enhanced Due Diligence (EDD) required for Politically Exposed Persons.",
                "threshold": "Standard Customer",
                "actual": "PEP Flagged",
                "status": "WARNING"
            })
        else:
            rules.append({
                "rule_id": "AML-KYC-R3",
                "description": "Enhanced Due Diligence (EDD) required for Politically Exposed Persons.",
                "threshold": "Standard Customer",
                "actual": "Standard Customer",
                "status": "PASS"
            })
            
        # Rule 4: CTR (Currency Transaction Report) Trigger
        ctr_triggered = transaction_amount > 10000 and payment_method == 'Cash'
        if ctr_triggered:
            risk_score += 20
            flags.append("CTR FILING REQUIRED (> $10,000 Cash)")
            rules.append({
                "rule_id": "AML-KYC-R4",
                "description": "Cash transactions exceeding $10,000 require a Currency Transaction Report (CTR).",
                "threshold": "<= $10,000 Cash",
                "actual": f"${transaction_amount:,.2f} Cash",
                "status": "WARNING"
            })
        else:
            rules.append({
                "rule_id": "AML-KYC-R4",
                "description": "Cash transactions exceeding $10,000 require a Currency Transaction Report (CTR).",
                "threshold": "<= $10,000 Cash",
                "actual": f"${transaction_amount:,.2f} {payment_method}",
                "status": "PASS"
            })
            
        # Rule 5: Structuring Check (Suspicious Activity Report trigger)
        structuring_suspected = (9000 <= transaction_amount < 10000) and payment_method == 'Cash'
        if structuring_suspected:
            risk_score += 50
            flags.append("SUSPECTED STRUCTURING (SAR TRIGGER)")
            rules.append({
                "rule_id": "AML-KYC-R5",
                "description": "Detect potential structuring of cash transactions designed to evade CTR thresholds ($9,000 - $9,999).",
                "threshold": "No Structuring Indicators",
                "actual": f"Suspicious Cash Amount: ${transaction_amount:,.2f}",
                "status": "FAIL"
            })
        else:
            rules.append({
                "rule_id": "AML-KYC-R5",
                "description": "Detect potential structuring of cash transactions designed to evade CTR thresholds ($9,000 - $9,999).",
                "threshold": "No Structuring Indicators",
                "actual": "No Structuring Indicators",
                "status": "PASS"
            })

        # Determine overall risk category
        if risk_score >= 100:
            verdict = "REJECTED"
            risk_level = "CRITICAL"
        elif risk_score >= 50:
            verdict = "SUSPENDED_FOR_REVIEW"
            risk_level = "HIGH"
        elif risk_score >= 20:
            verdict = "ENHANCED_DUE_DILIGENCE_REQUIRED"
            risk_level = "MEDIUM"
        else:
            verdict = "APPROVED"
            risk_level = "LOW"
            
        evaluation_results = {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "flags": flags,
            "rules": rules
        }
        
        evidence = log_compliance_event("AML-KYC", data, evaluation_results, verdict)
        return jsonify(evidence)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 4. RESPA Section 8 & Escrow Limits Guardrail
@app.route('/api/respa-sec-8', methods=['POST'])
def check_respa_sec_8():
    data = request.json or {}
    try:
        # Escrow Cushion Inputs (RESPA Section 10)
        annual_property_tax = float(data.get('annual_property_tax', 0))
        annual_insurance = float(data.get('annual_insurance', 0))
        current_escrow_cushion = float(data.get('current_escrow_cushion', 0))
        
        # Section 8 Kickback Inputs
        referral_fee_paid = float(data.get('referral_fee_paid', 0))
        services_rendered = data.get('services_rendered', '').strip()
        
        # Calculations - Section 10 Escrow Cushion (Max 1/6th of annual disbursements)
        total_annual_disbursements = annual_property_tax + annual_insurance
        max_allowable_cushion = total_annual_disbursements / 6.0 # 2 months equivalent
        escrow_violation = current_escrow_cushion > max_allowable_cushion
        excess_cushion = max(0.0, current_escrow_cushion - max_allowable_cushion)
        
        # Calculations - Section 8 Kickbacks (Prohibits unearned fees/referrals)
        kickback_violation = False
        kickback_reason = ""
        if referral_fee_paid > 0:
            # If fee is paid but no actual, distinct services were rendered
            if not services_rendered or services_rendered.lower() in ['none', 'referral only', 'lead', 'marketing only']:
                kickback_violation = True
                kickback_reason = "Referral fee paid without actual, distinct settlement services rendered."
        
        rules = [
            {
                "rule_id": "RESPA-SEC-10",
                "description": "Escrow account cushion must not exceed 1/6th (2 months) of total annual disbursements.",
                "threshold": f"${max_allowable_cushion:,.2f}",
                "actual": f"${current_escrow_cushion:,.2f}",
                "status": "PASS" if not escrow_violation else "FAIL"
            },
            {
                "rule_id": "RESPA-SEC-8",
                "description": "Prohibits giving or accepting any fee, kickback, or thing of value for referrals of settlement services.",
                "threshold": "$0.00 Unearned Fees",
                "actual": f"${referral_fee_paid:,.2f} paid for '{services_rendered or 'N/A'}'",
                "status": "PASS" if not kickback_violation else "FAIL"
            }
        ]
        
        if escrow_violation or kickback_violation:
            verdict = "NON_COMPLIANT"
        else:
            verdict = "COMPLIANT"
            
        evaluation_results = {
            "total_annual_disbursements": total_annual_disbursements,
            "max_allowable_cushion": max_allowable_cushion,
            "excess_cushion": excess_cushion,
            "kickback_violation": kickback_violation,
            "kickback_reason": kickback_reason,
            "rules": rules
        }
        
        evidence = log_compliance_event("RESPA-SEC-8", data, evaluation_results, verdict)
        return jsonify(evidence)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# --- HTML Template ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Regulatory Guardrails Simulator</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .tab-btn.active {
            border-color: #4f46e5;
            color: #4f46e5;
            background-color: #f5f3ff;
        }
    </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen font-sans">

    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-950 py-4 px-6 sticky top-0 z-50 shadow-md">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-3">
                <div class="bg-indigo-600 p-2.5 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                    <i class="fa-solid fa-shield-halved text-2xl"></i>
                </div>
                <div>
                    <h1 class="text-xl font-bold tracking-tight text-white">FinGuard Pro</h1>
                    <p class="text-xs text-slate-400">Real-Time Financial Regulatory Guardrails & Compliance Engine</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Engine Active
                </span>
                <button onclick="clearAuditLogs()" class="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition">
                    <i class="fa-solid fa-trash-can mr-1"></i> Clear Audit Logs
                </button>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Column: Navigation & Guardrail Simulators (8 Cols) -->
        <div class="lg:col-span-8 space-y-6">
            
            <!-- Guardrail Tabs Navigation -->
            <div class="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-wrap gap-1 shadow-xl">
                <button onclick="switchTab('dashboard')" id="btn-dashboard" class="tab-btn active flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-chart-pie"></i> Dashboard
                </button>
                <button onclick="switchTab('finra')" id="btn-finra" class="tab-btn flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-scale-balanced"></i> FINRA-4210
                </button>
                <button onclick="switchTab('sec')" id="btn-sec" class="tab-btn flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-vault"></i> SEC-15C3-3
                </button>
                <button onclick="switchTab('aml')" id="btn-aml" class="tab-btn flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-user-shield"></i> AML-KYC
                </button>
                <button onclick="switchTab('respa')" id="btn-respa" class="tab-btn flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-house-laptop"></i> RESPA Sec 8
                </button>
            </div>

            <!-- TAB: Dashboard Overview -->
            <div id="tab-dashboard" class="tab-content active space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg">
                        <div class="flex justify-between items-start">
                            <p class="text-sm font-medium text-slate-400">Total Evaluated</p>
                            <span class="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg"><i class="fa-solid fa-clipboard-list"></i></span>
                        </div>
                        <p id="stat-total" class="text-3xl font-bold text-white mt-2">0</p>
                        <p class="text-xs text-slate-500 mt-1">Compliance checks executed</p>
                    </div>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg">
                        <div class="flex justify-between items-start">
                            <p class="text-sm font-medium text-slate-400">Compliant / Passed</p>
                            <span class="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><i class="fa-solid fa-circle-check"></i></span>
                        </div>
                        <p id="stat-passed" class="text-3xl font-bold text-emerald-400 mt-2">0</p>
                        <p class="text-xs text-slate-500 mt-1">No violations detected</p>
                    </div>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg">
                        <div class="flex justify-between items-start">
                            <p class="text-sm font-medium text-slate-400">Violations / Alerts</p>
                            <span class="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"><i class="fa-solid fa-triangle-exclamation"></i></span>
                        </div>
                        <p id="stat-failed" class="text-3xl font-bold text-rose-400 mt-2">0</p>
                        <p class="text-xs text-slate-500 mt-1">Requires immediate action</p>
                    </div>
                </div>

                <!-- Quick Intro Card -->
                <div class="bg-gradient-to-r from-indigo-950 to-slate-950 border border-indigo-500/20 rounded-xl p-6 shadow-xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                    <h3 class="text-lg font-bold text-white mb-2">Interactive Compliance Sandbox</h3>
                    <p class="text-slate-300 text-sm leading-relaxed mb-4">
                        This simulator models critical financial regulatory guardrails. Select a guardrail tab above, load a pre-configured demo scenario or input custom transaction parameters, and execute real-time compliance checks. The engine generates cryptographic evidence logs for audit readiness.
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                            <i class="fa-solid fa-shield text-indigo-400 text-lg"></i>
                            <div>
                                <h4 class="text-xs font-bold text-white">FINRA Rule 4210</h4>
                                <p class="text-[11px] text-slate-400">Margin requirements & maintenance limits</p>
                            </div>
                        </div>
                        <div class="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                            <i class="fa-solid fa-vault text-indigo-400 text-lg"></i>
                            <div>
                                <h4 class="text-xs font-bold text-white">SEC Rule 15c3-3</h4>
                                <p class="text-[11px] text-slate-400">Customer protection & asset segregation</p>
                            </div>
                        </div>
                        <div class="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                            <i class="fa-solid fa-user-shield text-indigo-400 text-lg"></i>
                            <div>
                                <h4 class="text-xs font-bold text-white">AML-KYC Screening</h4>
                                <p class="text-[11px] text-slate-400">OFAC SDN, PEP, and cash structuring</p>
                            </div>
                        </div>
                        <div class="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                            <i class="fa-solid fa-house-laptop text-indigo-400 text-lg"></i>
                            <div>
                                <h4 class="text-xs font-bold text-white">RESPA Section 8 & 10</h4>
                                <p class="text-[11px] text-slate-400">Escrow cushions & kickback detection</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity / Live Stream -->
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-clock-rotate-left text-indigo-400"></i> Recent Compliance Activity
                    </h3>
                    <div id="dashboard-activity-list" class="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        <!-- Dynamic content -->
                        <p class="text-sm text-slate-500 text-center py-8">No compliance checks executed yet. Run a simulation to see activity.</p>
                    </div>
                </div>
            </div>

            <!-- TAB: FINRA-4210 Margin Requirements -->
            <div id="tab-finra" class="tab-content space-y-6">
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-lg font-bold text-white">FINRA Rule 4210 Margin Guardrail</h2>
                            <p class="text-xs text-slate-400">Simulates maintenance margin requirements for long and short positions.</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="loadScenario('finra', 'healthy_long')" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition">Healthy Long</button>
                            <button onclick="loadScenario('finra', 'margin_call_short')" class="px-2.5 py-1 text-xs bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 rounded border border-rose-800/50 transition">Margin Call Short</button>
                        </div>
                    </div>

                    <form id="form-finra" onsubmit="submitFinra(event)" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Position Type</label>
                                <select id="finra-position-type" onchange="toggleFinraInputs()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                                    <option value="Long">Long Position (25% Maintenance)</option>
                                    <option value="Short">Short Position (30% Maintenance)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Market Value of Securities ($)</label>
                                <input type="number" id="finra-market-value" value="100000" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div id="finra-debit-container">
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Debit Balance (Borrowed Funds) ($)</label>
                                <input type="number" id="finra-debit-balance" value="70000" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                            </div>
                            <div id="finra-credit-container" class="hidden">
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Credit Balance (Short Sale Proceeds + Margin) ($)</label>
                                <input type="number" id="finra-credit-balance" value="120000" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                            </div>
                        </div>

                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-indigo-500/20">
                            Evaluate Margin Compliance
                        </button>
                    </form>
                </div>

                <!-- Visual Feedback for Margin -->
                <div id="finra-results-card" class="hidden bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <h3 class="text-base font-bold text-white mb-4">Compliance Verdict & Analysis</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-slate-900 p-4 rounded-lg border border-slate-800">
                            <p class="text-xs text-slate-400">Current Equity</p>
                            <p id="finra-res-equity" class="text-xl font-bold text-white mt-1">$0.00</p>
                        </div>
                        <div class="bg-slate-900 p-4 rounded-lg border border-slate-800">
                            <p class="text-xs text-slate-400">Required Maintenance</p>
                            <