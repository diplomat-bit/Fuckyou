import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import random

# Set page configuration
st.set_page_config(
    page_title="Statement Reconciliation Portal",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State for Mock Data
def initialize_data():
    if 'accounts' not in st.session_state:
        st.session_state.accounts = {
            "ACC-9081 (Corporate Visa)": {
                "cardholder": "Sarah Jenkins",
                "department": "Marketing",
                "credit_limit": 25000.00,
                "outstanding_balance": 8450.20,
                "minimum_due": 250.00,
                "due_date": (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d"),
                "last_payment_date": "2023-10-15",
                "last_payment_amount": 1200.00,
                "statements": [
                    {"cycle": "Oct 2023", "charges": 4500.00, "payments": 4500.00, "status": "Reconciled", "notes": "All receipts matched."},
                    {"cycle": "Nov 2023", "charges": 6200.50, "payments": 6200.50, "status": "Reconciled", "notes": "Approved by finance."},
                    {"cycle": "Dec 2023", "charges": 8450.20, "payments": 0.00, "status": "Pending", "notes": "Awaiting final approval on travel expenses."}
                ],
                "transactions": [
                    {"date": "2023-12-05", "merchant": "AWS Cloud Services", "amount": 1250.00, "category": "Infrastructure", "status": "Matched"},
                    {"date": "2023-12-10", "merchant": "Adobe Creative Suite", "amount": 600.20, "category": "Software", "status": "Matched"},
                    {"date": "2023-12-15", "merchant": "Delta Airlines", "amount": 1100.00, "category": "Travel", "status": "Pending Receipt"},
                    {"date": "2023-12-18", "merchant": "Sheraton Hotels", "amount": 1500.00, "category": "Travel", "status": "Pending Receipt"},
                    {"date": "2023-12-20", "merchant": "Facebook Ads", "amount": 4000.00, "category": "Marketing", "status": "Matched"}
                ]
            },
            "ACC-4412 (Executive Amex)": {
                "cardholder": "Marcus Vance",
                "department": "Executive",
                "credit_limit": 50000.00,
                "outstanding_balance": 18200.00,
                "minimum_due": 500.00,
                "due_date": (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d"),
                "last_payment_date": "2023-10-18",
                "last_payment_amount": 5000.00,
                "statements": [
                    {"cycle": "Oct 2023", "charges": 12000.00, "payments": 12000.00, "status": "Reconciled", "notes": "Audited and closed."},
                    {"cycle": "Nov 2023", "charges": 15400.00, "payments": 15400.00, "status": "Reconciled", "notes": "Audited and closed."},
                    {"cycle": "Dec 2023", "charges": 18200.00, "payments": 0.00, "status": "Discrepancy", "notes": "Unexplained charge of $3,200 at luxury retailer."}
                ],
                "transactions": [
                    {"date": "2023-12-02", "merchant": "Private Jet Charter", "amount": 12000.00, "category": "Travel", "status": "Matched"},
                    {"date": "2023-12-08", "merchant": "Michelin Star Dining", "amount": 3000.00, "category": "Entertainment", "status": "Matched"},
                    {"date": "2023-12-14", "merchant": "Gucci Outlet", "amount": 3200.00, "category": "Personal/Discrepancy", "status": "Flagged"}
                ]
            },
            "ACC-1092 (Operations Mastercard)": {
                "cardholder": "Elena Rostova",
                "department": "Operations",
                "credit_limit": 15000.00,
                "outstanding_balance": 3150.45,
                "minimum_due": 100.00,
                "due_date": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"),
                "last_payment_date": "2023-10-22",
                "last_payment_amount": 2100.00,
                "statements": [
                    {"cycle": "Oct 2023", "charges": 2100.00, "payments": 2100.00, "status": "Reconciled", "notes": "Auto-reconciled."},
                    {"cycle": "Nov 2023", "charges": 4300.10, "payments": 4300.10, "status": "Reconciled", "notes": "Auto-reconciled."},
                    {"cycle": "Dec 2023", "charges": 3150.45, "payments": 0.00, "status": "Pending", "notes": "Awaiting receipt uploads."}
                ],
                "transactions": [
                    {"date": "2023-12-01", "merchant": "Office Depot", "amount": 450.15, "category": "Supplies", "status": "Matched"},
                    {"date": "2023-12-05", "merchant": "UPS Shipping", "amount": 200.30, "category": "Logistics", "status": "Matched"},
                    {"date": "2023-12-12", "merchant": "Grainger Industrial", "amount": 2500.00, "category": "Equipment", "status": "Matched"}
                ]
            }
        }
    if 'audit_logs' not in st.session_state:
        st.session_state.audit_logs = [
            {"timestamp": "2023-12-20 09:15", "user": "System", "action": "December statements generated automatically."},
            {"timestamp": "2023-12-20 11:30", "user": "Auditor (Admin)", "action": "Flagged transaction at Gucci Outlet on ACC-4412 as Discrepancy."}
        ]

initialize_data()

# Sidebar Controls
st.sidebar.title("💳 Portal Navigation")
user_role = st.sidebar.radio("Select User Role:", ["Cardholder View", "Auditor / Finance View"])

st.sidebar.markdown("---")
st.sidebar.subheader("Account Selector")
selected_acc_id = st.sidebar.selectbox("Choose Account:", list(st.session_state.accounts.keys()))
account = st.session_state.accounts[selected_acc_id]

# Reset Button
if st.sidebar.button("Reset Application Data"):
    st.session_state.clear()
    initialize_data()
    st.rerun()

# Main Header
st.title("📊 Statement Reconciliation Portal")
st.markdown(f"Currently viewing as: **{user_role}** | Account: **{selected_acc_id}** ({account['cardholder']})")
st.markdown("---")

# Real-time calculations
available_credit = account["credit_limit"] - account["outstanding_balance"]
utilization_rate = (account["outstanding_balance"] / account["credit_limit"]) * 100

# Top KPI Cards
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric(
        label="Outstanding Balance", 
        value=f"${account['outstanding_balance']:,.2f}", 
        delta=f"Limit: ${account['credit_limit']:,.0f}",
        delta_color="normal"
    )
with col2:
    st.metric(
        label="Available Credit", 
        value=f"${available_credit:,.2f}", 
        delta=f"{utilization_rate:.1f}% Utilized",
        delta_color="inverse"
    )
with col3:
    st.metric(
        label="Minimum Payment Due", 
        value=f"${account['minimum_due']:,.2f}", 
        delta=f"Due by: {account['due_date']}",
        delta_color="off"
    )
with col4:
    st.metric(
        label="Last Payment", 
        value=f"${account['last_payment_amount']:,.2f}", 
        delta=f"Paid on: {account['last_payment_date']}",
        delta_color="off"
    )

# Tabs for different views
tab1, tab2, tab3 = st.tabs(["💳 Payment Simulator & Details", "📑 Statement History & Reconciliation", "🔍 Audit Logs & Analytics"])

# TAB 1: Payment Simulator & Details
with tab1:
    st.subheader("Interactive Payment Simulator")
    st.info("Simulate a payment to see real-time updates to your outstanding balance and available credit.")
    
    sim_col1, sim_col2 = st.columns([1, 1])
    
    with sim_col1:
        payment_option = st.radio(
            "Choose Payment Amount:",
            ["Pay Minimum Due", "Pay Full Outstanding Balance", "Custom Amount"]
        )
        
        if payment_option == "Pay Minimum Due":
            payment_amount = account["minimum_due"]
        elif payment_option == "Pay Full Outstanding Balance":
            payment_amount = account["outstanding_balance"]
        else:
            payment_amount = st.number_input(
                "Enter Custom Amount ($):", 
                min_value=1.0, 
                max_value=float(account["outstanding_balance"]), 
                value=float(min(100.0, account["outstanding_balance"])),
                step=50.0
            )
            
        payment_method = st.selectbox("Select Payment Source:", ["Corporate Operating Account", "External Bank Transfer", "Direct Debit"])
        
        if st.button("Submit Simulated Payment", type="primary"):
            if payment_amount <= 0:
                st.error("Payment amount must be greater than zero.")
            elif payment_amount > account["outstanding_balance"]:
                st.error("Payment amount cannot exceed outstanding balance.")
            else:
                # Update State
                old_balance = account["outstanding_balance"]
                account["outstanding_balance"] -= payment_amount
                account["last_payment_amount"] = payment_amount
                account["last_payment_date"] = datetime.now().strftime("%Y-%m-%d")
                
                # Update current statement payment record
                for stmt in account["statements"]:
                    if stmt["cycle"] == "Dec 2023":
                        stmt["payments"] += payment_amount
                        if stmt["payments"] >= stmt["charges"]:
                            stmt["status"] = "Reconciled"
                
                # Log action
                log_entry = {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "user": f"{account['cardholder']} (Cardholder)",
                    "action": f"Simulated payment of ${payment_amount:,.2f} via {payment_method} for {selected_acc_id}."
                }
                st.session_state.audit_logs.insert(0, log_entry)
                
                st.success(f"🎉 Payment of ${payment_amount:,.2f} successfully processed!")
                st.balloons()
                st.rerun()

    with sim_col2:
        st.markdown("### Real-time Credit Impact")
        
        # Gauge Chart for Credit Utilization
        fig = go.Figure(go.Indicator(
            mode = "gauge+number",
            value = utilization_rate,
            domain = {'x': [0, 1], 'y': [0, 1]},
            title = {'text': "Credit Utilization Rate (%)", 'font': {'size': 18}},
            gauge = {
                'axis': {'range': [None, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
                'bar': {'color': "royalblue"},
                'bgcolor': "white",
                'borderwidth': 2,
                'bordercolor': "gray",
                'steps': [
                    {'range': [0, 30], 'color': 'rgba(0, 230, 115, 0.3)'},
                    {'range': [30, 70], 'color': 'rgba(255, 204, 0, 0.3)'},
                    {'range': [70, 100], 'color': 'rgba(255, 51, 51, 0.3)'}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': 90
                }
            }
        ))
        fig.update_layout(height=250, margin=dict(l=20, r=20, t=40, b=20))
        st.plotly_chart(fig, use_container_width=True)

    # Current Cycle Transactions
    st.markdown("---")
    st.subheader("Current Cycle Transactions (December 2023)")
    tx_df = pd.DataFrame(account["transactions"])
    
    # Style helper
    def style_status(val):
        if val in ["Matched", "Reconciled"]:
            return "background-color: rgba(0, 230, 115, 0.2); color: green;"
        elif val in ["Pending Receipt", "Pending"]:
            return "background-color: rgba(255, 204, 0, 0.2); color: orange;"
        else:
            return "background-color: rgba(255, 51, 51, 0.2); color: red;"

    st.dataframe(
        tx_df.style.applymap(style_status, subset=['status']),
        use_container_width=True,
        hide_index=True
    )

# TAB 2: Statement History & Reconciliation
with tab2:
    st.subheader("Statement History & Reconciliation Status")
    
    stmt_df = pd.DataFrame(account["statements"])
    
    # Display Statement History Table
    st.dataframe(
        stmt_df.style.applymap(style_status, subset=['status']),
        use_container_width=True,
        hide_index=True
    )
    
    # Auditor Reconciliation Tools
    if user_role == "Auditor / Finance View":
        st.markdown("---")
        st.subheader("🛠️ Auditor Reconciliation Panel")
        st.info("As an auditor, you can update statement statuses, flag discrepancies, and add audit notes.")
        
        audit_col1, audit_col2 = st.columns(2)
        
        with audit_col1:
            selected_cycle = st.selectbox("Select Statement Cycle to Audit:", [s["cycle"] for s in account["statements"]])
            new_status = st.selectbox("Update Status:", ["Reconciled", "Pending", "Discrepancy"])
            new_notes = st.text_area("Audit Notes / Discrepancy Details:")
            
            if st.button("Save Audit Update", type="primary"):
                for stmt in account["statements"]:
                    if stmt["cycle"] == selected_cycle:
                        stmt["status"] = new_status
                        if new_notes:
                            stmt["notes"] = new_notes
                
                # Log action
                log_entry = {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "user": "Auditor (Admin)",
                    "action": f"Updated {selected_cycle} status to '{new_status}' for {selected_acc_id}. Notes: {new_notes}"
                }
                st.session_state.audit_logs.insert(0, log_entry)
                
                st.success(f"Statement for {selected_cycle} updated successfully!")
                st.rerun()
                
        with audit_col2:
            st.markdown("### Quick Actions")
            st.markdown("Generate official reconciliation reports or flag entire accounts for review.")
            
            if st.button("📥 Export Reconciliation Report (CSV)"):
                csv_data = stmt_df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    label="Download CSV",
                    data=csv_data,
                    file_name=f"reconciliation_report_{selected_acc_id}.csv",
                    mime="text/csv"
                )
                st.success("Report ready for download!")
                
            if st.button("🚨 Flag Account for Executive Review"):
                log_entry = {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "user": "Auditor (Admin)",
                    "action": f"FLAGGED entire account {selected_acc_id} for executive review."
                }
                st.session_state.audit_logs.insert(0, log_entry)
                st.warning(f"Account {selected_acc_id} has been flagged in the audit logs.")
    else:
        st.markdown("---")
        st.subheader("📬 Submit Receipt / Dispute Charge")
        st.markdown("Need to upload a receipt or dispute a charge? Submit details below to notify the audit team.")
        
        disp_col1, disp_col2 = st.columns(2)
        with disp_col1:
            dispute_tx = st.selectbox("Select Transaction:", [f"{t['date']} - {t['merchant']} (${t['amount']})" for t in account["transactions"]])
            dispute_reason = st.text_area("Reason for dispute or receipt upload notes:")
            uploaded_file = st.file_file = st.file_uploader("Upload Receipt (PDF, PNG, JPG)", type=["pdf", "png", "jpg"])
            
            if st.button("Submit to Finance"):
                st.success("Receipt/Dispute submitted successfully! The audit team has been notified.")
                log_entry = {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "user": f"{account['cardholder']} (Cardholder)",
                    "action": f"Submitted receipt/dispute for transaction: {dispute_tx}. Notes: {dispute_reason}"
                }
                st.session_state.audit_logs.insert(0, log_entry)

# TAB 3: Audit Logs & Analytics
with tab3:
    st.subheader("Analytics & Audit Trail")
    
    chart_col1, chart_col2 = st.columns(2)
    
    with chart_col1:
        st.markdown("### Statement History Trend")
        # Prepare data for chart
        chart_data = []
        for acc_name, acc_data in st.session_state.accounts.items():
            for stmt in acc_data["statements"]:
                chart_data.append({
                    "Account": acc_name,
                    "Cycle": stmt["cycle"],
                    "Charges": stmt["charges"],
                    "Payments": stmt["payments"]
                })
        df_chart = pd.DataFrame(chart_data)
        
        fig_trend = px.bar(
            df_chart, 
            x="Cycle", 
            y="Charges", 
            color="Account",
            barmode="group",
            title="Charges per Statement Cycle by Account"
        )
        st.plotly_chart(fig_trend, use_container_width=True)
        
    with chart_col2:
        st.markdown("### Portfolio Credit Allocation")
        portfolio_data = []
        for acc_name, acc_data in st.session_state.accounts.items():
            portfolio_data.append({
                "Account": acc_name,
                "Outstanding Balance": acc_data["outstanding_balance"],
                "Available Credit": acc_data["credit_limit"] - acc_data["outstanding_balance"]
            })
        df_port = pd.DataFrame(portfolio_data)
        
        fig_pie = px.pie(
            df_port, 
            values="Outstanding Balance", 
            names="Account", 
            title="Outstanding Balance Distribution Across Portfolio",
            hole=0.4
        )
        st.plotly_chart(fig_pie, use_container_width=True)

    st.markdown("---")
    st.subheader("📋 System Audit Log (Immutable Trail)")
    
    # Display Audit Logs
    log_df = pd.DataFrame(st.session_state.audit_logs)
    st.dataframe(log_df, use_container_width=True, hide_index=True)

# Footer
st.markdown("---")
st.markdown(
    "<div style='text-align: center; color: gray; font-size: 0.8em;'>"
    "Statement Reconciliation Portal • Secure Auditor & Cardholder Interface • Real-time Ledger Simulation"
    "</div>", 
    unsafe_allow_html=True
)