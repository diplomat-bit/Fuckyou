import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import json
import time
import random
from datetime import datetime, timedelta

# Set page configuration
st.set_page_config(
    page_title="Balance Transfer Batch Suite",
    page_icon="🔄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session States
if 'portfolio_df' not in st.session_state:
    st.session_state.portfolio_df = None
if 'eligible_df' not in st.session_state:
    st.session_state.eligible_df = None
if 'filtered_df' not in st.session_state:
    st.session_state.filtered_df = None
if 'schedules' not in st.session_state:
    st.session_state.schedules = [
        {
            "id": "SCH-001",
            "name": "Daily High-Value Sweep",
            "cron": "0 2 * * *",
            "target_api": "https://api.bank.internal/v1/eligibility",
            "min_score": 720,
            "min_amount": 15000,
            "status": "Active",
            "last_run": "2023-10-26 02:00:00"
        },
        {
            "id": "SCH-002",
            "name": "Weekly Standard Portfolio Run",
            "cron": "0 4 * * 0",
            "target_api": "https://api.bank.internal/v1/eligibility",
            "min_score": 660,
            "min_amount": 5000,
            "status": "Active",
            "last_run": "2023-10-22 04:00:00"
        }
    ]
if 'logs' not in st.session_state:
    st.session_state.logs = [
        "2023-10-26 02:00:00 - INFO - Starting scheduled job SCH-001 (Daily High-Value Sweep)",
        "2023-10-26 02:00:05 - INFO - Querying Balance Transfer Eligibility API for 500 accounts...",
        "2023-10-26 02:00:12 - INFO - API response received. 142 accounts eligible.",
        "2023-10-26 02:00:15 - INFO - Filter applied: Min Score >= 720, Min Amount >= $15,000. 48 candidates matched.",
        "2023-10-26 02:00:18 - INFO - Generated 48 personalized campaign payloads.",
        "2023-10-26 02:00:20 - INFO - Dispatched 48 payloads to downstream notification router. Job SCH-001 completed successfully."
    ]
if 'campaigns' not in st.session_state:
    st.session_state.campaigns = None
if 'dispatched' not in st.session_state:
    st.session_state.dispatched = False

# Helper: Generate Mock Portfolio Data
def generate_mock_portfolio(n_accounts=100):
    first_names = ["John", "Jane", "Michael", "Emily", "David", "Sarah", "James", "Jessica", "Robert", "Karen", "William", "Lisa", "Richard", "Nancy", "Thomas", "Betty"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"]
    
    data = []
    for i in range(n_accounts):
        acct_id = f"ACC-{random.randint(100000, 999999)}"
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        email = f"{name.lower().replace(' ', '.')}@example.com"
        phone = f"+1 ({random.randint(200, 999)}) 555-{random.randint(1000, 9999)}"
        current_balance = round(random.uniform(2000, 25000), 2)
        current_apr = round(random.uniform(14.99, 29.99), 2)
        credit_score = random.randint(580, 850)
        dti = round(random.uniform(0.10, 0.55), 2)
        
        data.append({
            "Account ID": acct_id,
            "Customer Name": name,
            "Email": email,
            "Phone": phone,
            "Current Balance ($)": current_balance,
            "Current APR (%)": current_apr,
            "Credit Score": credit_score,
            "Debt-to-Income Ratio": dti
        })
    return pd.DataFrame(data)

# Helper: Simulate API Call for Eligibility
def query_eligibility_api(df):
    eligible_data = []
    for idx, row in df.iterrows():
        # Mocking API logic based on credit score and balance
        score = row["Credit Score"]
        balance = row["Current Balance ($)"]
        
        if score >= 620:
            is_eligible = True
            # Higher credit score gets higher max loan and lower offered APR
            if score >= 750:
                max_eligible = round(balance * random.uniform(1.2, 1.5), -2)
                offered_apr = round(random.uniform(0.0, 4.99), 2)
                fee_percent = 3.0
            elif score >= 680:
                max_eligible = round(balance * random.uniform(1.0, 1.2), -2)
                offered_apr = round(random.uniform(5.99, 9.99), 2)
                fee_percent = 4.0
            else:
                max_eligible = round(balance * random.uniform(0.8, 1.0), -2)
                offered_apr = round(random.uniform(10.99, 15.99), 2)
                fee_percent = 5.0
        else:
            is_eligible = False
            max_eligible = 0.0
            offered_apr = 0.0
            fee_percent = 0.0
            
        eligible_data.append({
            "Account ID": row["Account ID"],
            "Customer Name": row["Customer Name"],
            "Email": row["Email"],
            "Phone": row["Phone"],
            "Current Balance ($)": row["Current Balance ($)"],
            "Current APR (%)": row["Current APR (%)"],
            "Credit Score": row["Credit Score"],
            "Debt-to-Income Ratio": row["Debt-to-Income Ratio"],
            "Eligible Status": "Eligible" if is_eligible else "Ineligible",
            "Max Eligible Loan ($)": max_eligible,
            "Offered APR (%)": offered_apr,
            "Transfer Fee (%)": fee_percent
        })
    return pd.DataFrame(eligible_data)

# Sidebar Navigation
st.sidebar.title("🔄 Balance Transfer Suite")
st.sidebar.markdown("### Batch Processing & Scheduling")
app_mode = st.sidebar.radio(
    "Select Application Module",
    [
        "1. Portfolio Batch Processor",
        "2. Batch Scheduler & Automation",
        "3. Campaign & Personalization Engine",
        "4. Analytics & Dispatcher Dashboard"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    "This suite automates the end-to-end pipeline of querying eligibility APIs, "
    "scheduling batch runs, generating personalized promotional campaigns, and dispatching payloads."
)

# ==========================================
# APP 1: PORTFOLIO BATCH PROCESSOR
# ==========================================
if app_mode == "1. Portfolio Batch Processor":
    st.title("📋 Portfolio Batch Processor & Eligibility Filter")
    st.write("Upload or generate a portfolio of accounts, query the Balance Transfer Eligibility API, and filter high-value candidates.")

    col1, col2 = st.columns([1, 3])
    
    with col1:
        st.subheader("Data Source")
        data_source = st.radio("Choose Data Source", ["Generate Mock Portfolio", "Upload CSV File"])
        
        if data_source == "Generate Mock Portfolio":
            portfolio_size = st.slider("Portfolio Size (Accounts)", 10, 500, 100, step=10)
            if st.button("Generate Portfolio", use_container_width=True):
                st.session_state.portfolio_df = generate_mock_portfolio(portfolio_size)
                st.session_state.eligible_df = None
                st.session_state.filtered_df = None
                st.success(f"Generated {portfolio_size} mock accounts!")
        else:
            uploaded_file = st.file_uploader("Upload Portfolio CSV", type=["csv"])
            if uploaded_file is not None:
                try:
                    st.session_state.portfolio_df = pd.read_csv(uploaded_file)
                    st.session_state.eligible_df = None
                    st.session_state.filtered_df = None
                    st.success("Portfolio uploaded successfully!")
                except Exception as e:
                    st.error(f"Error reading CSV: {e}")

        if st.session_state.portfolio_df is not None:
            st.markdown("---")
            st.subheader("API Query Settings")
            api_endpoint = st.text_input("Eligibility API Endpoint", "https://api.bank.internal/v1/eligibility")
            api_timeout = st.slider("API Timeout (seconds)", 5, 30, 15)
            
            if st.button("Run Eligibility Batch Query", type="primary", use_container_width=True):
                with st.spinner("Querying Balance Transfer Eligibility API..."):
                    # Simulate API latency
                    progress_bar = st.progress(0)
                    for percent_complete in range(100):
                        time.sleep(0.01)
                        progress_bar.progress(percent_complete + 1)
                    
                    st.session_state.eligible_df = query_eligibility_api(st.session_state.portfolio_df)
                    st.success("API Query Completed! Eligibility status fetched.")

    with col2:
        st.subheader("Portfolio Data & Filtering")
        
        if st.session_state.portfolio_df is None:
            st.info("Please generate or upload a portfolio to begin.")
            # Show a preview of what the data looks like
            st.markdown("### Sample Portfolio Schema")
            sample_df = generate_mock_portfolio(5)
            st.dataframe(sample_df, use_container_width=True)
        else:
            tab1, tab2, tab3 = st.tabs(["Raw Portfolio", "API Eligibility Results", "Filtered Candidates"])
            
            with tab1:
                st.dataframe(st.session_state.portfolio_df, use_container_width=True)
                st.metric("Total Accounts", len(st.session_state.portfolio_df))
                
            with tab2:
                if st.session_state.eligible_df is None:
                    st.warning("Please run the Eligibility Batch Query to view API results.")
                else:
                    st.dataframe(st.session_state.eligible_df, use_container_width=True)
                    eligible_count = len(st.session_state.eligible_df[st.session_state.eligible_df["Eligible Status"] == "Eligible"])
                    st.metric("Eligible Accounts", f"{eligible_count} / {len(st.session_state.eligible_df)}")
                    
            with tab3:
                if st.session_state.eligible_df is None:
                    st.warning("Please run the Eligibility Batch Query first.")
                else:
                    st.markdown("#### Filter Criteria for Targeted Campaign")
                    f_col1, f_col2, f_col3 = st.columns(3)
                    with f_col1:
                        min_credit = st.number_input("Min Credit Score", 300, 850, 680)
                    with f_col2:
                        min_loan = st.number_input("Min Max Eligible Loan ($)", 0, 50000, 10000, step=1000)
                    with f_col3:
                        max_apr = st.number_input("Max Offered APR (%)", 0.0, 30.0, 12.0, step=0.5)
                        
                    # Apply filters
                    df_elig = st.session_state.eligible_df
                    filtered = df_elig[
                        (df_elig["Eligible Status"] == "Eligible") &
                        (df_elig["Credit Score"] >= min_credit) &
                        (df_elig["Max Eligible Loan ($)"] >= min_loan) &
                        (df_elig["Offered APR (%)"] <= max_apr)
                    ]
                    
                    st.session_state.filtered_df = filtered
                    
                    st.dataframe(filtered, use_container_width=True)
                    
                    f_col_m1, f_col_m2, f_col_m3 = st.columns(3)
                    f_col_m1.metric("Filtered Candidates", len(filtered))
                    f_col_m2.metric("Total Eligible Volume", f"${filtered['Max Eligible Loan ($)'].sum():,.2f}")
                    avg_apr_savings = (filtered["Current APR (%)"] - filtered["Offered APR (%)"]).mean()
                    f_col_m3.metric("Avg. APR Reduction", f"{avg_apr_savings:.2f}%" if not np.isnan(avg_apr_savings) else "0.00%")
                    
                    if len(filtered) > 0:
                        csv = filtered.to_csv(index=False).encode('utf-8')
                        st.download_button(
                            label="Download Filtered Candidates CSV",
                            data=csv,
                            file_name="filtered_balance_transfer_candidates.csv",
                            mime="text/csv",
                            use_container_width=True
                        )

# ==========================================
# APP 2: BATCH SCHEDULER & AUTOMATION
# ==========================================
elif app_mode == "2. Batch Scheduler & Automation":
    st.title("⏱️ Batch Scheduler & Automation Manager")
    st.write("Configure, schedule, and monitor automated batch runs for the Balance Transfer Eligibility pipeline.")

    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Create New Scheduled Job")
        with st.form("schedule_form"):
            job_name = st.text_input("Job Name", placeholder="e.g., Monthly High-Score Sweep")
            cron_exp = st.text_input("Cron Expression", value="0 0 1 * *", help="Standard cron format: min hour day-of-month month day-of-week")
            target_api = st.text_input("Target API Endpoint", value="https://api.bank.internal/v1/eligibility")
            
            st.markdown("**Filtering Thresholds**")
            min_score = st.slider("Minimum Credit Score", 580, 850, 700)
            min_amount = st.number_input("Minimum Eligible Loan Amount ($)", 1000, 50000, 10000, step=1000)
            
            submit_btn = st.form_submit_button("Schedule Job", use_container_width=True)
            
            if submit_btn:
                if not job_name:
                    st.error("Job Name is required.")
                else:
                    new_job = {
                        "id": f"SCH-{random.randint(100, 999)}",
                        "name": job_name,
                        "cron": cron_exp,
                        "target_api": target_api,
                        "min_score": min_score,
                        "min_amount": min_amount,
                        "status": "Active",
                        "last_run": "Never"
                    }
                    st.session_state.schedules.append(new_job)
                    st.session_state.logs.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - INFO - Created new scheduled job {new_job['id']} ({job_name})")
                    st.success(f"Job {job_name} scheduled successfully!")

    with col2:
        st.subheader("Active Schedules")
        if not st.session_state.schedules:
            st.info("No active schedules configured.")
        else:
            sched_df = pd.DataFrame(st.session_state.schedules)
            st.dataframe(sched_df, use_container_width=True)
            
            # Actions for schedules
            st.markdown("#### Manage Schedules")
            selected_job_id = st.selectbox("Select Job to Run/Delete", [job["id"] for job in st.session_state.schedules])
            
            act_col1, act_col2 = st.columns(2)
            with act_col1:
                if st.button("Run Selected Job Now", type="primary", use_container_width=True):
                    job = next(item for item in st.session_state.schedules if item["id"] == selected_job_id)
                    st.session_state.logs.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - INFO - Manual trigger initiated for job {job['id']} ({job['name']})")
                    
                    # Simulate running
                    with st.spinner(f"Executing {job['name']}..."):
                        time.sleep(1.5)
                        # Generate mock run results
                        mock_portfolio = generate_mock_portfolio(150)
                        mock_elig = query_eligibility_api(mock_portfolio)
                        mock_filtered = mock_elig[
                            (mock_elig["Eligible Status"] == "Eligible") &
                            (mock_elig["Credit Score"] >= job["min_score"]) &
                            (mock_elig["Max Eligible Loan ($)"] >= job["min_amount"])
                        ]
                        
                        # Update last run time
                        for item in st.session_state.schedules:
                            if item["id"] == selected_job_id:
                                item["last_run"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                                
                        st.session_state.logs.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - INFO - Job {job['id']} completed. Processed 150 accounts. Found {len(mock_filtered)} eligible candidates.")
                        st.success(f"Job {job['name']} executed successfully! Found {len(mock_filtered)} candidates.")
                        
            with act_col2:
                if st.button("Delete Selected Job", use_container_width=True):
                    st.session_state.schedules = [item for item in st.session_state.schedules if item["id"] != selected_job_id]
                    st.session_state.logs.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - WARNING - Deleted job {selected_job_id}")
                    st.warning(f"Job {selected_job_id} deleted.")
                    st.rerun()

        st.markdown("---")
        st.subheader("System Execution Logs")
        log_text = "\n".join(st.session_state.logs[::-1]) # Show latest logs first
        st.text_area("Logs Console", value=log_text, height=250, disabled=True)
        if st.button("Clear Logs", use_container_width=True):
            st.session_state.logs = []
            st.rerun()

# ==========================================
# APP 3: CAMPAIGN & PERSONALIZATION ENGINE
# ==========================================
elif app_mode == "3. Campaign & Personalization Engine":
    st.title("✍️ Campaign Generator & Personalization Engine")
    st.write("Generate highly targeted promotional copy and notification payloads for eligible candidates.")

    if st.session_state.filtered_df is None or len(st.session_state.filtered_df) == 0:
        st.warning("⚠️ No filtered candidates available. Please go to '1. Portfolio Batch Processor', run the query, and filter candidates first.")
        if st.button("Load Sample Filtered Data for Demo"):
            mock_port = generate_mock_portfolio(50)
            mock_elig = query_eligibility_api(mock_port)
            st.session_state.filtered_df = mock_elig[
                (mock_elig["Eligible Status"] == "Eligible") &
                (mock_elig["Credit Score"] >= 680) &
                (mock_elig["Max Eligible Loan ($)"] >= 8000)
            ]
            st.rerun()
    else:
        col1, col2 = st.columns([1, 1])
        
        with col1:
            st.subheader("Campaign Template Configuration")
            channel = st.selectbox("Notification Channel", ["Email", "SMS", "Push Notification"])
            tone = st.selectbox("Campaign Tone", ["Professional & Financial", "Urgent / Limited Time", "Friendly & Helpful"])
            
            # Default templates
            if channel == "Email":
                default_subject = "Great News {first_name}! You are pre-approved for a {max_loan} Balance Transfer"
                default_body = (
                    "Dear {customer_name},\n\n"
                    "We noticed you are currently paying {current_apr}% APR on your external balances. "
                    "Based on your excellent credit profile, we are pleased to offer you a promotional Balance Transfer "
                    "rate of just {offered_apr}% APR with a low {fee_percent}% transfer fee!\n\n"
                    "You are pre-approved to transfer up to {max_loan}. This could save you hundreds of dollars in interest "
                    "over the next 12 months.\n\n"
                    "Click below to claim this offer in your dashboard.\n\n"
                    "Best regards,\nYour Financial Team"
                )
            elif channel == "SMS":
                default_subject = "SMS Alert"
                default_body = (
                    "Hi {first_name}! Save big on interest. Transfer your high-APR balance to us and get {offered_apr}% APR "
                    "on up to {max_loan}. Apply in 2 taps: bank.app/bt"
                )
            else: # Push
                default_subject = "Pre-approved: Save on Interest!"
                default_body = "Hi {first_name}, you're pre-approved to transfer up to {max_loan} at {offered_apr}% APR. Tap to save!"

            subject_template = st.text_input("Subject Template", value=default_subject)
            body_template = st.text_area("Body Template", value=default_body, height=250)
            
            st.markdown("**Available Placeholders:** `{customer_name}`, `{first_name}`, `{max_loan}`, `{offered_apr}`, `{current_apr}`, `{fee_percent}`")
            
            if st.button("Generate Personalized Campaigns", type="primary", use_container_width=True):
                campaigns = []
                for idx, row in st.session_state.filtered_df.iterrows():
                    first_name = row["Customer Name"].split()[0]
                    max_loan_formatted = f"${row['Max Eligible Loan ($)']:,.2f}"
                    
                    # Replace placeholders
                    subj = subject_template.replace("{customer_name}", row["Customer Name"])\
                                           .replace("{first_name}", first_name)\
                                           .replace("{max_loan}", max_loan_formatted)\
                                           .replace("{offered_apr}", str(row["Offered APR (%)"]))\
                                           .replace("{current_apr}", str(row["Current APR (%)"]))\
                                           .replace("{fee_percent}", str(row["Transfer Fee (%)"]))
                                           
                    body = body_template.replace("{customer_name}", row["Customer Name"])\
                                         .replace("{first_name}", first_name)\
                                         .replace("{max_loan}", max_loan_formatted)\
                                         .replace("{offered_apr}", str(row["Offered APR (%)"]))\
                                         .replace("{current_apr}", str(row["Current APR (%)"]))\
                                         .replace("{fee_percent}", str(row["Transfer Fee (%)"]))
                    
                    # Generate JSON payload
                    payload = {
                        "to": row["Email"] if channel == "Email" else row["Phone"],
                        "channel": channel,
                        "account_id": row["Account ID"],
                        "meta": {
                            "customer_name": row["Customer Name"],
                            "max_eligible_loan": row["Max Eligible Loan ($)"],
                            "offered_apr": row["Offered APR (%)"],
                            "transfer_fee_percent": row["Transfer Fee (%)"]
                        },
                        "message": {
                            "subject": subj if channel != "SMS" else "",
                            "body": body
                        }
                    }
                    
                    campaigns.append({
                        "Account ID": row["Account ID"],
                        "Customer Name": row["Customer Name"],
                        "Subject": subj,
                        "Body": body,
                        "Payload": payload
                    })
                
                st.session_state.campaigns = pd.DataFrame(campaigns)
                st.session_state.dispatched = False
                st.success(f"Successfully generated {len(campaigns)} personalized campaigns!")

        with col2:
            st.subheader("Campaign Preview & Payloads")
            if st.session_state.campaigns is None:
                st.info("Configure the template and click 'Generate Personalized Campaigns' to preview.")
            else:
                st.metric("Generated Campaigns", len(st.session_state.campaigns))
                
                # Select a candidate to preview
                candidate_names = st.session_state.campaigns["Customer Name"].tolist()
                selected_candidate = st.selectbox("Select Candidate to Preview", candidate_names)
                
                cand_data = st.session_state.campaigns[st.session_state.campaigns["Customer Name"] == selected_candidate].iloc[0]
                
                st.markdown("### 📱 Live Preview")
                with st.container():
                    st.markdown(
                        f"""
                        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 10px; background-color: #f9f9f9; color: #333;">
                            <strong>Channel:</strong> {channel} <br>
                            <strong>To:</strong> {cand_data['Payload']['to']} <br>
                            {"<strong>Subject:</strong> " + cand_data['Subject'] if channel != 'SMS' else ''}
                            <hr style="margin: 10px 0;">
                            <p style="white-space: pre-wrap;">{cand_data['Body']}</p>
                        </div>
                        """,
                        unsafe_allowed_html=True
                    )
                
                st.markdown("### ⚙️ Dispatch JSON Payload")
                st.json(cand_data["Payload"])

# ==========================================
# APP 4: ANALYTICS & DISPATCHER DASHBOARD
# ==========================================
elif app_mode == "4. Analytics & Dispatcher Dashboard":
    st.title("📊 Analytics & Notification Payload Dispatcher")
    st.write("Monitor campaign performance metrics, analyze portfolio distributions, and dispatch payloads to downstream notification systems.")

    if st.session_state.filtered_df is None or len(st.session_state.filtered_df) == 0:
        st.warning("⚠️ No filtered candidates available. Please run the pipeline in App 1 first.")
        if st.button("Load Sample Data for Analytics Demo"):
            mock_port = generate_mock_portfolio(100)
            st.session_state.eligible_df = query_eligibility_api(mock_port)
            st.session_state.filtered_df = st.session_state.eligible_df[
                (st.session_state.eligible_df["Eligible Status"] == "Eligible") &
                (st.session_state.eligible_df["Credit Score"] >= 660) &
                (st.session_state.eligible_df["Max Eligible Loan ($)"] >= 5000)
            ]
            # Generate campaigns too
            campaigns = []
            for idx, row in st.session_state.filtered_df.iterrows():
                campaigns.append({
                    "Account ID": row["Account ID"],
                    "Customer Name": row["Customer Name"],
                    "Subject": "Pre-approved Balance Transfer",
                    "Body": f"Hi {row['Customer Name']}, transfer up to {row['Max Eligible Loan ($)']} at {row['Offered APR (%)']}% APR.",
                    "Payload": {"to": row["Email"], "channel": "Email", "account_id": row["Account ID"], "message": {"body": "..."}}
                })
            st.session_state.campaigns = pd.DataFrame(campaigns)
            st.rerun()
    else:
        # Metrics Row
        m_col1, m_col2, m_col3, m_col4 = st.columns(4)
        
        total_eligible_vol = st.session_state.filtered_df["Max Eligible Loan ($)"].sum()
        avg_offered_apr = st.session_state.filtered_df["Offered APR (%)"].mean()
        avg_current_apr = st.session_state.filtered_df["Current APR (%)"].mean()
        est_interest_savings = (avg_current_apr - avg_offered_apr) / 100 * total_eligible_vol
        
        m_col1.metric("Total Target Candidates", len(st.session_state.filtered_df))
        m_col2.metric("Total Eligible Volume", f"${total_eligible_vol:,.2f}")
        m_col3.metric("Avg. Offered APR", f"{avg_offered_apr:.2f}%")
        m_col4.metric("Est. Annual Customer Savings", f"${est_interest_savings:,.2f}")
        
        st.markdown("---")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Credit Score vs. Max Eligible Loan")
            fig = px.scatter(
                st.session_state.filtered_df,
                x="Credit Score",
                y="Max Eligible Loan ($)",
                color="Offered APR (%)",
                size="Current Balance ($)",
                hover_name="Customer Name",
                title="Candidate Distribution (Size = Current Balance)",
                color_continuous_scale=px.colors.sequential.Viridis
            )
            st.plotly_chart(fig, use_container_width=True)
            
        with col2:
            st.subheader("APR Reduction Distribution")
            df_apr = st.session_state.filtered_df.copy()
            df_apr["APR Reduction (%)"] = df_apr["Current APR (%)"] - df_apr["Offered APR (%)"]
            
            fig2 = px.histogram(
                df_apr,
                x="APR Reduction (%)",
                nbins=15,
                title="Distribution of APR Reductions (Current APR - Offered APR)",
                color_discrete_sequence=["#2ca02c"]
            )
            st.plotly_chart(fig2, use_container_width=True)

        st.markdown("---")
        
        # Dispatcher Section
        st.subheader("🚀 Downstream Payload Dispatcher")
        
        if st.session_state.campaigns is None:
            st.warning("No campaigns generated yet. Please go to '3. Campaign & Personalization Engine' to generate payloads.")
        else:
            st.write(f"Ready to dispatch {len(st.session_state.campaigns)} personalized payloads to downstream notification routers (e.g., Twilio, SendGrid, Webhooks).")
            
            dispatch_target = st.selectbox("Select Downstream Router / API", ["SendGrid Email Gateway", "Twilio SMS Gateway", "Internal Notification Webhook"])
            
            if st.session_state.dispatched:
                st.success("🎉 All payloads successfully dispatched to downstream systems!")
                if st.button("Reset Dispatch Status"):
                    st.session_state.dispatched = False
                    st.rerun()
            else:
                if st.button("Dispatch All Payloads Now", type="primary", use_container_width=True):
                    progress_bar = st.progress(0)
                    status_text = st.empty()
                    
                    for i, row in st.session_state.campaigns.iterrows():
                        # Simulate network dispatch latency
                        time.sleep(0.05)
                        progress_bar.progress((i + 1) / len(st.session_state.campaigns))
                        status_text.text(f"Dispatching payload {i+1}/{len(st.session_state.campaigns)} for {row['Customer Name']}...")
                    
                    st.session_state.dispatched = True
                    st.session_state.logs.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - INFO - Dispatched {len(st.session_state.campaigns)} payloads to {dispatch_target}")
                    st.rerun()
                    
            # Show payload queue preview
            st.markdown("### Payload Queue Preview")
            st.dataframe(st.session_state.campaigns[["Account ID", "Customer Name", "Subject"]], use_container_width=True)