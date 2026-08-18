import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import uuid
import random

# Set page configuration
st.set_page_config(
    page_title="Balance Transfer Disbursement Orchestrator",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# SESSION STATE INITIALIZATION (MOCK DB)
# ==========================================
if 'audit_log' not in st.session_state:
    # Generate some realistic mock historical data
    options = ["LOAN_PAYMENT", "CREDIT_CARD", "DIRECT_DEPOSIT"]
    plans = ["Promo 0% APR 12m", "Standard 5.9% 24m", "Flex 8.9% 36m"]
    statuses = ["COMPLETED", "FAILED", "PENDING_VALIDATION"]
    
    mock_logs = []
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(45):
        amount = round(random.uniform(1000, 15000), 2)
        fee = round(amount * 0.03, 2)
        opt = random.choice(options)
        plan = random.choice(plans)
        status = random.choice(statuses) if i < 40 else "COMPLETED" # Ensure mostly completed
        dt = base_date + timedelta(days=random.uniform(0, 30))
        
        mock_logs.append({
            "transaction_id": str(uuid.uuid4())[:8].upper(),
            "timestamp": dt.strftime("%Y-%m-%d %H:%M:%S"),
            "disbursement_option": opt,
            "payment_plan": plan,
            "amount": amount,
            "fee": fee,
            "total_outstanding_impact": amount + fee,
            "status": status,
            "account_ending": f"*{random.randint(1000, 9999)}"
        })
    st.session_state.audit_log = pd.DataFrame(mock_logs)

if 'ledger_templates' not in st.session_state:
    st.session_state.ledger_templates = {
        "LOAN_PAYMENT": [
            {"account": "1100 - Balance Transfer Receivables", "type": "Debit", "multiplier": 1.0, "desc": "Increase customer outstanding balance"},
            {"account": "1200 - Disbursement Clearing (Loan Payoff)", "type": "Credit", "multiplier": 1.0, "desc": "Disburse funds to external loan provider"},
            {"account": "1150 - Balance Transfer Fee Receivable", "type": "Debit", "multiplier": "fee", "desc": "Record transfer fee to customer account"},
            {"account": "4100 - Fee Revenue", "type": "Credit", "multiplier": "fee", "desc": "Recognize balance transfer fee revenue"}
        ],
        "CREDIT_CARD": [
            {"account": "1100 - Balance Transfer Receivables", "type": "Debit", "multiplier": 1.0, "desc": "Increase customer outstanding balance"},
            {"account": "1210 - Disbursement Clearing (Credit Card Payoff)", "type": "Credit", "multiplier": 1.0, "desc": "Disburse funds to external card issuer"},
            {"account": "1150 - Balance Transfer Fee Receivable", "type": "Debit", "multiplier": "fee", "desc": "Record transfer fee to customer account"},
            {"account": "4100 - Fee Revenue", "type": "Credit", "multiplier": "fee", "desc": "Recognize balance transfer fee revenue"}
        ],
        "DIRECT_DEPOSIT": [
            {"account": "1100 - Balance Transfer Receivables", "type": "Debit", "multiplier": 1.0, "desc": "Increase customer outstanding balance"},
            {"account": "1010 - Cash / Operating Account", "type": "Credit", "multiplier": 1.0, "desc": "Direct deposit ACH transfer to customer"},
            {"account": "1150 - Balance Transfer Fee Receivable", "type": "Debit", "multiplier": "fee", "desc": "Record transfer fee to customer account"},
            {"account": "4100 - Fee Revenue", "type": "Credit", "multiplier": "fee", "desc": "Recognize balance transfer fee revenue"}
        ]
    }

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def validate_eligibility(amount, option, plan, credit_score, dti):
    rules = []
    passed = True
    
    # Rule 1: Amount Limits
    if option == "LOAN_PAYMENT" and amount > 25000:
        rules.append(("❌ Amount Limit", "Loan payments cannot exceed $25,000.", False))
        passed = False
    elif option == "CREDIT_CARD" and amount > 15000:
        rules.append(("❌ Amount Limit", "Credit card payoffs cannot exceed $15,000.", False))
        passed = False
    elif option == "DIRECT_DEPOSIT" and amount > 10000:
        rules.append(("❌ Amount Limit", "Direct deposits cannot exceed $10,000.", False))
        passed = False
    else:
        rules.append(("✅ Amount Limit", f"Amount ${amount:,.2f} is within the allowed limit for {option}.", True))
        
    # Rule 2: Credit Score Requirements
    if plan == "Promo 0% APR 12m" and credit_score < 680:
        rules.append(("❌ Credit Score", "Promo 0% APR requires a minimum credit score of 680.", False))
        passed = False
    elif plan == "Standard 5.9% 24m" and credit_score < 620:
        rules.append(("❌ Credit Score", "Standard 5.9% plan requires a minimum credit score of 620.", False))
        passed = False
    else:
        rules.append(("✅ Credit Score", f"Credit score of {credit_score} is eligible for {plan}.", True))
        
    # Rule 3: Debt-to-Income (DTI) Ratio
    if dti > 45.0:
        rules.append(("❌ DTI Ratio", "Debt-to-Income ratio exceeds the maximum threshold of 45%.", False))
        passed = False
    else:
        rules.append(("✅ DTI Ratio", f"DTI ratio of {dti}% is within acceptable limits.", True))
        
    # Rule 4: Minimum Amount
    if amount < 500:
        rules.append(("❌ Minimum Amount", "Minimum balance transfer amount is $500.", False))
        passed = False
    else:
        rules.append(("✅ Minimum Amount", "Amount meets the minimum requirement of $500.", True))

    return passed, rules

def simulate_ledger_entries(amount, option, fee_rate=0.03):
    fee = round(amount * fee_rate, 2)
    template = st.session_state.ledger_templates.get(option, [])
    entries = []
    
    for t in template:
        mult = t["multiplier"]
        val = fee if mult == "fee" else amount * mult
        entries.append({
            "Account": t["account"],
            "Type": t["type"],
            "Debit ($)": val if t["type"] == "Debit" else 0.0,
            "Credit ($)": val if t["type"] == "Credit" else 0.0,
            "Description": t["desc"]
        })
    return pd.DataFrame(entries), fee

# ==========================================
# SIDEBAR NAVIGATION
# ==========================================
st.sidebar.title("🏦 Disbursement Orchestrator")
st.sidebar.markdown("Manage, validate, and simulate balance transfer disbursements in real-time.")
st.sidebar.divider()

app_mode = st.sidebar.radio(
    "Select Sub-Application:",
    [
        "📋 1. Eligibility & Validation Engine",
        "🏦 2. Ledger Entry Simulator",
        "⚙️ 3. Orchestration Pipeline",
        "📊 4. Analytics & Audit Dashboard"
    ]
)

st.sidebar.divider()
st.sidebar.info(
    "**Microservice Status:**\n"
    "🟢 API Gateway: Connected\n"
    "🟢 Ledger Service: Online\n"
    "🟢 Core Banking: Online"
)

# ==========================================
# APP 1: ELIGIBILITY & VALIDATION ENGINE
# ==========================================
if app_mode == "📋 1. Eligibility & Validation Engine":
    st.title("📋 Eligibility & Validation Engine")
    st.markdown("Validate balance transfer requests against risk, credit, and product eligibility rules.")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Transfer Parameters")
        amount = st.number_input("Transfer Amount ($)", min_value=100.0, max_value=50000.0, value=5000.0, step=500.0)
        disbursement_option = st.selectbox("Disbursement Option", ["LOAN_PAYMENT", "CREDIT_CARD", "DIRECT_DEPOSIT"])
        payment_plan = st.selectbox("Payment Plan", ["Promo 0% APR 12m", "Standard 5.9% 24m", "Flex 8.9% 36m"])
        
        st.subheader("Customer Risk Profile")
        credit_score = st.slider("Credit Score (FICO)", 300, 850, 700)
        dti = st.slider("Debt-to-Income (DTI) Ratio (%)", 0.0, 100.0, 35.0, step=0.5)
        
        validate_btn = st.button("Run Validation Rules", type="primary", use_container_width=True)

    with col2:
        st.subheader("Validation Results")
        if validate_btn:
            passed, rules = validate_eligibility(amount, disbursement_option, payment_plan, credit_score, dti)
            
            if passed:
                st.success("🎉 ELIGIBILITY PASSED: This transfer is safe to disburse!")
            else:
                st.error("🚨 ELIGIBILITY FAILED: One or more business rules were violated.")
                
            st.markdown("### Rule Execution Details")
            for title, desc, status in rules:
                with st.expander(f"{title}", expanded=True):
                    st.write(desc)
                    if status:
                        st.caption("🟢 Rule Passed")
                    else:
                        st.caption("🔴 Rule Violated")
        else:
            st.info("Adjust parameters on the left and click 'Run Validation Rules' to evaluate eligibility.")

# ==========================================
# APP 2: LEDGER ENTRY SIMULATOR
# ==========================================
elif app_mode == "🏦 2. Ledger Entry Simulator":
    st.title("🏦 Double-Entry Ledger Simulator")
    st.markdown("Simulate the exact double-entry accounting postings generated during the disbursement phase.")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Simulation Inputs")
        sim_amount = st.number_input("Disbursement Amount ($)", min_value=100.0, max_value=100000.0, value=7500.0, step=500.0)
        sim_option = st.selectbox("Disbursement Target", ["LOAN_PAYMENT", "CREDIT_CARD", "DIRECT_DEPOSIT"], key="sim_opt")
        fee_rate = st.slider("Balance Transfer Fee Rate (%)", 0.0, 10.0, 3.0, step=0.5) / 100.0
        
        st.divider()
        st.markdown("### Ledger Accounting Rules")
        st.caption("Every disbursement triggers a balanced set of debits and credits to track outstanding customer balances and external payouts.")

    with col2:
        st.subheader("Simulated Journal Entries")
        df_ledger, fee_amount = simulate_ledger_entries(sim_amount, sim_option, fee_rate)
        
        st.dataframe(df_ledger.style.format({
            "Debit ($)": "${:,.2f}",
            "Credit ($)": "${:,.2f}"
        }), use_container_width=True, hide_index=True)
        
        # Verify Balance
        total_debits = df_ledger["Debit ($)"].sum()
        total_credits = df_ledger["Credit ($)"].sum()
        
        col_deb, col_cred, col_diff = st.columns(3)
        col_deb.metric("Total Debits", f"${total_debits:,.2f}")
        col_cred.metric("Total Credits", f"${total_credits:,.2f}")
        
        diff = abs(total_debits - total_credits)
        if diff < 0.01:
            col_diff.metric("Ledger Status", "Balanced ✅", delta_color="normal")
        else:
            col_diff.metric("Ledger Status", f"Unbalanced (Diff: ${diff:,.2f}) ❌", delta_color="inverse")
            
        # Visualizing T-Accounts
        st.subheader("T-Account Balance Impact")
        fig = go.Figure(data=[
            go.Bar(name='Debits', x=df_ledger['Account'], y=df_ledger['Debit ($)'], marker_color='#2ecc71'),
            go.Bar(name='Credits', x=df_ledger['Account'], y=df_ledger['Credit ($)'], marker_color='#e74c3c')
        ])
        fig.update_layout(barmode='group', height=300, margin=dict(l=20, r=20, t=20, b=20))
        st.plotly_chart(fig, use_container_width=True)

# ==========================================
# APP 3: ORCHESTRATION PIPELINE
# ==========================================
elif app_mode == "⚙️ 3. Orchestration Pipeline":
    st.title("⚙️ Disbursement Orchestration Pipeline")
    st.markdown("Execute the end-to-end balance transfer disbursement workflow step-by-step.")
    
    # Initialize pipeline state
    if 'pipeline_step' not in st.session_state:
        st.session_state.pipeline_step = 0
    if 'pipe_data' not in st.session_state:
        st.session_state.pipe_data = {}

    # Reset button
    if st.button("Reset Pipeline"):
        st.session_state.pipeline_step = 0
        st.session_state.pipe_data = {}
        st.rerun()

    steps = ["1. Input Details", "2. Run Validation", "3. Simulate Ledger", "4. Execute & Update Balance"]
    
    # Render progress bar
    progress_val = (st.session_state.pipeline_step) / 4.0
    st.progress(progress_val, text=f"Current Phase: {steps[min(st.session_state.pipeline_step, 3)]}")
    
    # ------------------ STEP 0: INPUTS ------------------
    if st.session_state.pipeline_step == 0:
        st.subheader("Step 1: Enter Transfer Details")
        col1, col2 = st.columns(2)
        with col1:
            p_amount = st.number_input("Transfer Amount ($)", min_value=500.0, max_value=50000.0, value=4500.0)
            p_option = st.selectbox("Disbursement Option", ["LOAN_PAYMENT", "CREDIT_CARD", "DIRECT_DEPOSIT"], key="p_opt")
            p_plan = st.selectbox("Payment Plan", ["Promo 0% APR 12m", "Standard 5.9% 24m", "Flex 8.9% 36m"], key="p_plan")
        with col2:
            p_credit = st.slider("Customer Credit Score", 300, 850, 720, key="p_cred")
            p_dti = st.slider("Customer DTI (%)", 0.0, 100.0, 28.0, key="p_dti")
            p_target = st.text_input("Target Account Number", value="1234567890")
            
        if st.button("Proceed to Validation ➡️", type="primary"):
            st.session_state.pipe_data = {
                "amount": p_amount,
                "option": p_option,
                "plan": p_plan,
                "credit": p_credit,
                "dti": p_dti,
                "target": p_target
            }
            st.session_state.pipeline_step = 1
            st.rerun()

    # ------------------ STEP 1: VALIDATION ------------------
    elif st.session_state.pipeline_step == 1:
        st.subheader("Step 2: Eligibility Validation Engine")
        data = st.session_state.pipe_data
        
        passed, rules = validate_eligibility(data["amount"], data["option"], data["plan"], data["credit"], data["dti"])
        
        for title, desc, status in rules:
            if status:
                st.success(f"{title}: {desc}")
            else:
                st.error(f"{title}: {desc}")
                
        if passed:
            st.success("✅ All validation checks passed successfully!")
            if st.button("Proceed to Ledger Simulation ➡️", type="primary"):
                st.session_state.pipeline_step = 2
                st.rerun()
        else:
            st.error("❌ Validation failed. Please reset the pipeline and adjust inputs.")

    # ------------------ STEP 2: LEDGER SIMULATION ------------------
    elif st.session_state.pipeline_step == 2:
        st.subheader("Step 3: Ledger Entry Simulation")
        data = st.session_state.pipe_data
        
        df_ledger, fee = simulate_ledger_entries(data["amount"], data["option"])
        st.session_state.pipe_data["fee"] = fee
        st.session_state.pipe_data["total_impact"] = data["amount"] + fee
        
        st.write("The following double-entry postings will be committed to the ledger:")
        st.dataframe(df_ledger.style.format({
            "Debit ($)": "${:,.2f}",
            "Credit ($)": "${:,.2f}"
        }), use_container_width=True)
        
        col1, col2 = st.columns(2)
        col1.metric("Principal Amount", f"${data['amount']:,.2f}")
        col2.metric("Calculated Fee (3%)", f"${fee:,.2f}")
        
        if st.button("Authorize & Execute Disbursement 🚀", type="primary"):
            st.session_state.pipeline_step = 3
            st.rerun()

    # ------------------ STEP 3: EXECUTION & UPDATE ------------------
    elif st.session_state.pipeline_step == 3:
        st.subheader("Step 4: Execution & Outstanding Balance Update")
        data = st.session_state.pipe_data
        
        # Simulate API call delay
        with st.spinner("Orchestrating disbursement... updating ledger and outstanding balances..."):
            # Create new audit log entry
            new_entry = {
                "transaction_id": str(uuid.uuid4())[:8].upper(),
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "disbursement_option": data["option"],
                "payment_plan": data["plan"],
                "amount": data["amount"],
                "fee": data["fee"],
                "total_outstanding_impact": data["total_impact"],
                "status": "COMPLETED",
                "account_ending": f"*{data['target'][-4:]}"
            }
            
            # Append to session state audit log
            st.session_state.audit_log = pd.concat([
                pd.DataFrame([new_entry]), 
                st.session_state.audit_log
            ], ignore_index=True)
            
        st.balloons()
        st.success("🎉 Disbursement Orchestrated Successfully!")
        
        # Display Receipt
        st.markdown("### 🧾 Disbursement Receipt")
        col1, col2 = st.columns(2)
        with col1:
            st.write(f"**Transaction ID:** {new_entry['transaction_id']}")
            st.write(f"**Timestamp:** {new_entry['timestamp']}")
            st.write(f"**Disbursement Option:** {new_entry['disbursement_option']}")
            st.write(f"**Target Account:** {new_entry['account_ending']}")
        with col2:
            st.write(f"**Principal Disbursed:** ${new_entry['amount']:,.2f}")
            st.write(f"**Orchestration Fee:** ${new_entry['fee']:,.2f}")
            st.markdown(f"### **New Outstanding Balance:** ${new_entry['total_outstanding_impact']:,.2f}")
            
        if st.button("Start New Transfer Pipeline"):
            st.session_state.pipeline_step = 0
            st.session_state.pipe_data = {}
            st.rerun()

# ==========================================
# APP 4: ANALYTICS & AUDIT DASHBOARD
# ==========================================
elif app_mode == "📊 4. Analytics & Audit Dashboard":
    st.title("📊 Orchestrator Analytics & Audit Log")
    st.markdown("Real-time monitoring of all balance transfer disbursements, outstanding balance impacts, and system health.")
    
    df = st.session_state.audit_log
    
    # KPI Metrics Row
    total_disbursed = df[df["status"] == "COMPLETED"]["amount"].sum()
    total_fees = df[df["status"] == "COMPLETED"]["fee"].sum()
    total_outstanding = df[df["status"] == "COMPLETED"]["total_outstanding_impact"].sum()
    success_rate = (len(df[df["status"] == "COMPLETED"]) / len(df)) * 100
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Disbursed Principal", f"${total_disbursed:,.2f}")
    col2.metric("Total Fees Collected", f"${total_fees:,.2f}")
    col3.metric("Total Outstanding Balance Created", f"${total_outstanding:,.2f}")
    col4.metric("Orchestration Success Rate", f"{success_rate:.1f}%")
    
    st.divider()
    
    # Charts Row
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        st.subheader("Disbursements by Option")
        fig_pie = px.pie(
            df, 
            names="disbursement_option", 
            values="amount", 
            hole=0.4,
            color_discrete_sequence=px.colors.qualitative.Pastel
        )
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with col_chart2:
        st.subheader("Outstanding Balance Impact Trend")
        # Sort by timestamp for line chart
        df_sorted = df.copy()
        df_sorted["timestamp"] = pd.to_datetime(df_sorted["timestamp"])
        df_sorted = df_sorted.sort_values("timestamp")
        df_sorted["cumulative_outstanding"] = df_sorted["total_outstanding_impact"].cumsum()
        
        fig_line = px.line(
            df_sorted, 
            x="timestamp", 
            y="cumulative_outstanding",
            labels={"cumulative_outstanding": "Cumulative Outstanding ($)", "timestamp": "Date"},
            color_discrete_sequence=["#2ecc71"]
        )
        st.plotly_chart(fig_line, use_container_width=True)
        
    # Audit Log Table
    st.subheader("📋 System Audit Log")
    
    # Filter controls
    col_f1, col_f2 = st.columns(2)
    with col_f1:
        search_query = st.text_input("Search by Transaction ID or Account", "")
    with col_f2:
        status_filter = st.multiselect("Filter by Status", options=["COMPLETED", "FAILED", "PENDING_VALIDATION"], default=["COMPLETED", "FAILED", "PENDING_VALIDATION"])
        
    # Apply filters
    filtered_df = df[df["status"].isin(status_filter)]
    if search_query:
        filtered_df = filtered_df[
            filtered_df["transaction_id"].str.contains(search_query, case=False) | 
            filtered_df["account_ending"].str.contains(search_query, case=False)
        ]
        
    st.dataframe(
        filtered_df.style.format({
            "amount": "${:,.2f}",
            "fee": "${:,.2f}",
            "total_outstanding_impact": "${:,.2f}"
        }), 
        use_container_width=True, 
        hide_index=True
    )