import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import random
import uuid
import io

# Set page configuration
st.set_page_config(
    page_title="Treasury Reconciliation Suite",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State for cross-app data persistence
if 'initialized' not in st.session_state:
    st.session_state.initialized = True
    st.session_state.statements = pd.DataFrame()
    st.session_state.ledger = pd.DataFrame()
    st.session_state.matches = pd.DataFrame()
    st.session_state.unmatched_statements = pd.DataFrame()
    st.session_state.unmatched_ledger = pd.DataFrame()
    st.session_state.journals = pd.DataFrame()
    st.session_state.audit_log = []
    st.session_state.recon_status = "Not Started"
    st.session_state.selected_bank = "Apex Global Bank"

# Helper function to log actions to the audit trail
def log_action(action, details, user="Treasury_AI_Agent"):
    st.session_state.audit_log.append({
        "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "Action": action,
        "Details": details,
        "User": user
    })

# Helper function to generate mock data
def generate_mock_data():
    np.random.seed(42)
    random.seed(42)
    
    # Generate Bank Statement Data
    statement_records = []
    start_date = datetime.now() - timedelta(days=5)
    
    # Common transaction templates
    descriptions = [
        ("FX Settlement", "DEP", 150000.00),
        ("Vendor Pay - Acme Corp", "WD", 45200.00),
        ("Customer Wire - TechCorp", "DEP", 89300.50),
        ("Intercompany Transfer", "DEP", 500000.00),
        ("Merchant Fees", "WD", 1250.00),
        ("Payroll Funding", "WD", 320000.00),
        ("Tax Payment", "WD", 85000.00),
        ("Interest Credit", "DEP", 450.25),
        ("Lockbox Deposit", "DEP", 12450.80),
        ("SaaS Subscription", "WD", 8900.00)
    ]
    
    # Generate 30 statement transactions
    for i in range(30):
        tx_date = start_date + timedelta(days=random.randint(0, 4), hours=random.randint(8, 18))
        desc_template = random.choice(descriptions)
        
        # Add slight variance to amounts for some transactions to simulate discrepancies
        variance = 0.0
        if random.random() < 0.15: # 15% chance of minor discrepancy
            variance = round(random.uniform(-5.0, 5.0), 2)
            
        amount = max(10.0, desc_template[2] + variance)
        tx_type = desc_template[1]
        
        ref_id = f"TXN-{100000 + i}"
        bank_ref = f"BNK-{uuid.uuid4().hex[:8].upper()}"
        
        statement_records.append({
            "Statement_ID": f"STMT-2023-Q4-{100 + i//10}",
            "Transaction_ID": ref_id,
            "Bank_Reference": bank_ref,
            "Value_Date": tx_date.strftime("%Y-%m-%d"),
            "Description": desc_template[0],
            "Type": tx_type,
            "Amount": amount,
            "Currency": "USD",
            "Status": "Pending"
        })
        
    df_statements = pd.DataFrame(statement_records)
    
    # Generate Ledger Data (Internal ERP)
    ledger_records = []
    for idx, row in df_statements.iterrows():
        # 80% of transactions match perfectly
        # 10% have timing differences (different date)
        # 5% have amount discrepancies
        # 5% are missing from ledger entirely (e.g. bank fees, interest)
        
        rand_val = random.random()
        
        if rand_val < 0.80:
            # Perfect Match
            ledger_records.append({
                "Ledger_ID": f"LED-{200000 + idx}",
                "Matching_Ref": row["Transaction_ID"],
                "Post_Date": row["Value_Date"],
                "Description": row["Description"],
                "Type": row["Type"],
                "Amount": row["Amount"],
                "Currency": "USD",
                "Account_Code": "10100-Cash-Operating"
            })
        elif rand_val < 0.90:
            # Timing Difference (Date shifted by 1-2 days)
            shifted_date = datetime.strptime(row["Value_Date"], "%Y-%m-%d") + timedelta(days=random.choice([-1, 1, 2]))
            ledger_records.append({
                "Ledger_ID": f"LED-{200000 + idx}",
                "Matching_Ref": row["Transaction_ID"],
                "Post_Date": shifted_date.strftime("%Y-%m-%d"),
                "Description": row["Description"],
                "Type": row["Type"],
                "Amount": row["Amount"],
                "Currency": "USD",
                "Account_Code": "10100-Cash-Operating"
            })
        elif rand_val < 0.95:
            # Amount Discrepancy (e.g., human error in manual ledger entry)
            discrepancy_amount = row["Amount"] + random.choice([-10.0, 10.0, -100.0, 100.0])
            ledger_records.append({
                "Ledger_ID": f"LED-{200000 + idx}",
                "Matching_Ref": row["Transaction_ID"],
                "Post_Date": row["Value_Date"],
                "Description": row["Description"],
                "Type": row["Type"],
                "Amount": max(10.0, discrepancy_amount),
                "Currency": "USD",
                "Account_Code": "10100-Cash-Operating"
            })
        else:
            # Missing from ledger (Do not add to ledger records)
            pass
            
    # Add some ledger entries that are NOT in the bank statement (unmatched ledger items, e.g., outstanding checks)
    for j in range(3):
        tx_date = start_date + timedelta(days=random.randint(0, 4))
        ledger_records.append({
            "Ledger_ID": f"LED-90000{j}",
            "Matching_Ref": f"TXN-99900{j}",
            "Post_Date": tx_date.strftime("%Y-%m-%d"),
            "Description": "O/S Check - Vendor Payment",
            "Type": "WD",
            "Amount": random.choice([1500.00, 4500.00, 12000.00]),
            "Currency": "USD",
            "Account_Code": "10100-Cash-Operating"
        })
        
    df_ledger = pd.DataFrame(ledger_records)
    
    st.session_state.statements = df_statements
    st.session_state.ledger = df_ledger
    st.session_state.unmatched_statements = df_statements.copy()
    st.session_state.unmatched_ledger = df_ledger.copy()
    st.session_state.matches = pd.DataFrame()
    st.session_state.journals = pd.DataFrame()
    st.session_state.recon_status = "Data Loaded"
    log_action("System Initialization", "Generated mock bank statements and internal ledger records.")

# Initialize data if empty
if st.session_state.statements.empty:
    generate_mock_data()

# Sidebar Navigation for the 4 Apps
st.sidebar.image("https://img.icons8.com/fluency/96/bank.png", width=80)
st.sidebar.title("Treasury Recon Suite")
st.sidebar.markdown("---")

app_selection = st.sidebar.radio(
    "Select Application Module",
    [
        "1. Statement Retrieval & Parser",
        "2. Ledger Matching Engine",
        "3. Automated Balancing & Journaling",
        "4. Analytics & Audit Dashboard"
    ]
)

st.sidebar.markdown("---")
st.sidebar.subheader("System Status")
st.sidebar.info(f"Recon Status: **{st.session_state.recon_status}**")
st.sidebar.info(f"Active Bank: **{st.session_state.selected_bank}**")

if st.sidebar.button("Reset & Regenerate Data"):
    generate_mock_data()
    st.sidebar.success("Data reset successfully!")
    st.rerun()

# ==========================================
# APP 1: STATEMENT RETRIEVAL & PARSER
# ==========================================
if app_selection == "1. Statement Retrieval & Parser":
    st.title("📥 Bank Statement Retrieval & Parser")
    st.markdown("""
    This module simulates automated retrieval of bank statements via API/SFTP endpoints, 
    parses raw formats (MT940, BAI2, CAMT.053, or CSV), and normalizes them into standard treasury schemas.
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Retrieval Configuration")
        bank_provider = st.selectbox("Select Bank Institution", ["Apex Global Bank", "Summit Trust", "Horizon Clearing", "Global Liquidity Corp"])
        st.session_state.selected_bank = bank_provider
        
        retrieval_method = st.radio("Retrieval Protocol", ["Secure API (REST/JSON)", "SFTP (BAI2/MT940)", "Manual File Upload"])
        
        st.markdown("---")
        st.subheader("Parser Settings")
        file_format = st.selectbox("Target Parser Format", ["ISO 20022 (CAMT.053)", "BAI2 Standard", "SWIFT MT940", "Standard CSV"])
        encoding = st.selectbox("Character Encoding", ["UTF-8", "ASCII", "ISO-8859-1"])
        
        if st.button("Trigger Automated Retrieval", type="primary"):
            with st.spinner("Connecting to secure bank gateway..."):
                # Simulate network latency
                import time
                time.sleep(1.5)
                
                # Update status
                st.session_state.recon_status = "Statements Retrieved"
                log_action("Statement Retrieval", f"Successfully pulled statements from {bank_provider} via {retrieval_method}.")
                st.success(f"Successfully retrieved and parsed statements from {bank_provider}!")
                
    with col2:
        st.subheader("Parsed Statement Stream")
        
        # Filter options
        status_filter = st.multiselect("Filter by Transaction Type", ["DEP", "WD"], default=["DEP", "WD"])
        search_term = st.text_input("Search Description / Reference", "")
        
        # Apply filters
        df_display = st.session_state.statements.copy()
        df_display = df_display[df_display["Type"].isin(status_filter)]
        if search_term:
            df_display = df_display[df_display["Description"].str.contains(search_term, case=False) | df_display["Transaction_ID"].str.contains(search_term, case=False)]
            
        st.dataframe(df_display, use_container_width=True, height=400)
        
        # Download parsed data
        csv_buffer = io.StringIO()
        df_display.to_csv(csv_buffer, index=False)
        st.download_button(
            label="📥 Export Normalized Statement (CSV)",
            data=csv_buffer.getvalue(),
            file_name=f"normalized_statement_{bank_provider.lower().replace(' ', '_')}.csv",
            mime="text/csv"
        )
        
    st.markdown("---")
    st.subheader("Raw Transmission Log (Simulation)")
    raw_log_sample = f"""
    [INFO] {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} - Initiating handshake with {bank_provider} SFTP gateway...
    [INFO] {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} - SSH Key Exchange verified.
    [INFO] {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} - Found file: /incoming/stmt_20231024_0915.bai2
    [INFO] {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} - Downloading file (45.2 KB)...
    [INFO] {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} - Parsing BAI2 records: Record 01 (Header), Record 03 (Account Identifier), Record 16 (Transaction Detail)...
    [SUCCESS] {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} - Parsed {len(st.session_state.statements)} transaction records. Normalization complete.
    """
    st.code(raw_log_sample, language="bash")

# ==========================================
# APP 2: LEDGER MATCHING ENGINE
# ==========================================
elif app_selection == "2. Ledger Matching Engine":
    st.title("⚙️ Automated Ledger Matching Engine")
    st.markdown("""
    This module executes multi-way matching rules to pair bank statement transactions with internal ledger entries.
    Configure matching tolerances and execute the engine to identify perfect matches, timing differences, and discrepancies.
    """)
    
    # Matching Rules Configuration
    st.sidebar.subheader("Matching Rules Configuration")
    exact_ref = st.sidebar.checkbox("Exact Reference ID Match", value=True)
    date_tolerance = st.sidebar.slider("Date Tolerance Window (Days)", 0, 7, 2)
    amount_tolerance = st.sidebar.number_input("Amount Tolerance ($)", min_value=0.0, max_value=100.0, value=0.0, step=0.01)
    
    col1, col2 = st.columns([1, 3])
    
    with col1:
        st.subheader("Engine Control Panel")
        st.write("Configure rules in the sidebar and trigger the matching engine below.")
        
        if st.button("Run Matching Engine", type="primary", use_container_width=True):
            with st.spinner("Executing matching algorithms..."):
                import time
                time.sleep(1)
                
                # Matching Logic
                statements_df = st.session_state.statements.copy()
                ledger_df = st.session_state.ledger.copy()
                
                matched_records = []
                unmatched_stmt_ids = set(statements_df["Transaction_ID"])
                unmatched_ledger_ids = set(ledger_df["Ledger_ID"])
                
                # 1. Exact Match Pass (Ref, Amount, Date within tolerance)
                for idx_s, stmt in statements_df.iterrows():
                    # Find potential ledger matches by reference
                    potential_ledgers = ledger_df[ledger_df["Matching_Ref"] == stmt["Transaction_ID"]]
                    
                    for idx_l, led in potential_ledgers.iterrows():
                        if led["Ledger_ID"] not in unmatched_ledger_ids:
                            continue
                            
                        # Check date tolerance
                        stmt_date = datetime.strptime(stmt["Value_Date"], "%Y-%m-%d")
                        led_date = datetime.strptime(led["Post_Date"], "%Y-%m-%d")
                        days_diff = abs((stmt_date - led_date).days)
                        
                        # Check amount tolerance
                        amt_diff = abs(stmt["Amount"] - led["Amount"])
                        
                        if days_diff <= date_tolerance and amt_diff <= amount_tolerance:
                            # Match found!
                            match_type = "Perfect Match" if amt_diff == 0 and days_diff == 0 else "Fuzzy Match"
                            if amt_diff > 0:
                                match_type = "Amount Discrepancy"
                            elif days_diff > 0:
                                match_type = "Timing Difference"
                                
                            matched_records.append({
                                "Match_ID": f"MCH-{uuid.uuid4().hex[:6].upper()}",
                                "Statement_ID": stmt["Statement_ID"],
                                "Transaction_ID": stmt["Transaction_ID"],
                                "Ledger_ID": led["Ledger_ID"],
                                "Description": stmt["Description"],
                                "Statement_Amount": stmt["Amount"],
                                "Ledger_Amount": led["Amount"],
                                "Discrepancy": stmt["Amount"] - led["Amount"],
                                "Statement_Date": stmt["Value_Date"],
                                "Ledger_Date": led["Post_Date"],
                                "Match_Type": match_type,
                                "Status": "Matched"
                            })
                            
                            unmatched_stmt_ids.discard(stmt["Transaction_ID"])
                            unmatched_ledger_ids.discard(led["Ledger_ID"])
                            break # Move to next statement
                
                # Update Session State
                st.session_state.matches = pd.DataFrame(matched_records)
                st.session_state.unmatched_statements = statements_df[statements_df["Transaction_ID"].isin(unmatched_stmt_ids)]
                st.session_state.unmatched_ledger = ledger_df[ledger_df["Ledger_ID"].isin(unmatched_ledger_ids)]
                st.session_state.recon_status = "Matching Complete"
                
                log_action("Matching Engine Run", f"Matched {len(matched_records)} items. Unmatched: {len(unmatched_stmt_ids)} statements, {len(unmatched_ledger_ids)} ledger entries.")
                st.success("Matching Engine completed successfully!")
                
        # Display Quick Stats
        if not st.session_state.matches.empty:
            st.markdown("---")
            st.subheader("Match Summary")
            total_items = len(st.session_state.statements)
            matched_count = len(st.session_state.matches)
            match_rate = (matched_count / total_items) * 100
            
            st.metric("Match Rate", f"{match_rate:.1f}%")
            st.metric("Matched Items", matched_count)
            st.metric("Unmatched Statements", len(st.session_state.unmatched_statements))
            st.metric("Unmatched Ledger", len(st.session_state.unmatched_ledger))

    with col2:
        st.subheader("Matching Results Workspace")
        
        if st.session_state.matches.empty:
            st.info("Please run the Matching Engine to view results.")
        else:
            tab1, tab2, tab3 = st.tabs(["Matched Pairs", "Unmatched Statements", "Unmatched Ledger"])
            
            with tab1:
                st.dataframe(st.session_state.matches, use_container_width=True)
                
                # Manual Override / Unmatch Action
                st.markdown("### Manual Override Actions")
                selected_match = st.selectbox("Select Match to Break/Override", st.session_state.matches["Match_ID"].unique())
                if st.button("Break Selected Match"):
                    # Logic to break match and return to unmatched
                    match_row = st.session_state.matches[st.session_state.matches["Match_ID"] == selected_match].iloc[0]
                    
                    # Add back to unmatched
                    stmt_to_add = st.session_state.statements[st.session_state.statements["Transaction_ID"] == match_row["Transaction_ID"]]
                    led_to_add = st.session_state.ledger[st.session_state.ledger["Ledger_ID"] == match_row["Ledger_ID"]]
                    
                    st.session_state.unmatched_statements = pd.concat([st.session_state.unmatched_statements, stmt_to_add]).drop_duplicates()
                    st.session_state.unmatched_ledger = pd.concat([st.session_state.unmatched_ledger, led_to_add]).drop_duplicates()
                    
                    # Remove from matches
                    st.session_state.matches = st.session_state.matches[st.session_state.matches["Match_ID"] != selected_match]
                    
                    log_action("Manual Match Break", f"Broke match {selected_match} manually.")
                    st.warning(f"Match {selected_match} broken. Items returned to unmatched pools.")
                    st.rerun()
                    
            with tab2:
                st.dataframe(st.session_state.unmatched_statements, use_container_width=True)
                st.info("These transactions appeared on the bank statement but have no matching internal ledger entry.")
                
            with tab3:
                st.dataframe(st.session_state.unmatched_ledger, use_container_width=True)
                st.info("These transactions were recorded in the internal ledger but have not cleared the bank.")

# ==========================================
# APP 3: AUTOMATED BALANCING & JOURNALING
# ==========================================
elif app_selection == "3. Automated Balancing & Journaling":
    st.title("⚖️ Automated Ledger Balancing & Journaling")
    st.markdown("""
    This module resolves discrepancies and unmatched items by generating adjusting journal entries 
    (e.g., bank fees, interest income, FX adjustments) to balance the general ledger with the bank statement.
    """)
    
    if st.session_state.matches.empty:
        st.warning("⚠️ Please run the Matching Engine (Module 2) first to identify unmatched items and discrepancies.")
    else:
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.subheader("Balancing & Resolution Rules")
            st.write("Select resolution strategies for unmatched items:")
            
            auto_fee_writeoff = st.checkbox("Auto-write off Bank Fees (< $50)", value=True)
            auto_interest = st.checkbox("Auto-journal Interest Income", value=True)
            discrepancy_threshold = st.number_input("Max Auto-Balancing Tolerance ($)", min_value=0.0, max_value=500.0, value=10.0)
            
            st.markdown("---")
            st.subheader("Target GL Accounts")
            cash_acct = st.text_input("Cash Account", "10100-Cash-Operating")
            fee_acct = st.text_input("Bank Fees Expense Account", "65400-Bank-Service-Charges")
            interest_acct = st.text_input("Interest Income Account", "48200-Interest-Income")
            suspense_acct = st.text_input("Reconciliation Suspense Account", "10999-Recon-Suspense")
            
            if st.button("Execute Automated Balancing", type="primary", use_container_width=True):
                with st.spinner("Generating adjusting journal entries..."):
                    import time
                    time.sleep(1.2)
                    
                    journal_entries = []
                    resolved_stmt_ids = []
                    resolved_ledger_ids = []
                    
                    # 1. Resolve Unmatched Statements (e.g. Bank Fees, Interest)
                    for idx, row in st.session_state.unmatched_statements.iterrows():
                        # Check if it's a bank fee
                        if "fee" in row["Description"].lower() or "subscription" in row["Description"].lower():
                            if auto_fee_writeoff and row["Amount"] < 500.0:
                                # Generate Journal Entry
                                je_id = f"JE-{uuid.uuid4().hex[:6].upper()}"
                                # Debit Bank Fee Expense, Credit Cash
                                journal_entries.append({
                                    "JE_ID": je_id,
                                    "Date": row["Value_Date"],
                                    "Account_Code": fee_acct,
                                    "Debit": row["Amount"],
                                    "Credit": 0.0,
                                    "Description": f"Auto-adj: {row['Description']}"
                                })
                                journal_entries.append({
                                    "JE_ID": je_id,
                                    "Date": row["Value_Date"],
                                    "Account_Code": cash_acct,
                                    "Debit": 0.0,
                                    "Credit": row["Amount"],
                                    "Description": f"Auto-adj: {row['Description']}"
                                })
                                resolved_stmt_ids.append(row["Transaction_ID"])
                                
                        # Check if it's interest income
                        elif "interest" in row["Description"].lower():
                            if auto_interest:
                                je_id = f"JE-{uuid.uuid4().hex[:6].upper()}"
                                # Debit Cash, Credit Interest Income
                                journal_entries.append({
                                    "JE_ID": je_id,
                                    "Date": row["Value_Date"],
                                    "Account_Code": cash_acct,
                                    "Debit": row["Amount"],
                                    "Credit": 0.0,
                                    "Description": f"Auto-adj: {row['Description']}"
                                })
                                journal_entries.append({
                                    "JE_ID": je_id,
                                    "Date": row["Value_Date"],
                                    "Account_Code": interest_acct,
                                    "Debit": 0.0,
                                    "Credit": row["Amount"],
                                    "Description": f"Auto-adj: {row['Description']}"
                                })
                                resolved_stmt_ids.append(row["Transaction_ID"])
                                
                    # 2. Resolve Amount Discrepancies from Matches
                    for idx, row in st.session_state.matches.iterrows():
                        if abs(row["Discrepancy"]) > 0 and abs(row["Discrepancy"]) <= discrepancy_threshold:
                            je_id = f"JE-{uuid.uuid4().hex[:6].upper()}"
                            disc = row["Discrepancy"]
                            
                            if disc > 0: # Statement amount > Ledger amount (Under-recorded in ledger)
                                journal_entries.append({
                                    "JE_ID": je_id,
                                    "Date": row["Statement_Date"],
                                    "Account_Code": cash_acct,
                                    "Debit": abs(disc),
                                    "Credit": 0.0,
                                    "Description": f"Discrepancy Adj: {row['Description']}"
                                })
                                journal_entries.append({
                                    "JE_ID": je_id,
                                    "Date": row["Statement_Date"],
                                    "Account_Code": suspense_acct,
                                    "Debit": 0.0,
                                    "Credit": abs(disc),
                                    "Description": f"Discrepancy Adj: {row['Description']}"
                                })
                            else: # Statement amount < Ledger amount (Over-recorded in ledger)
                                journal_entries.append({
                                    "JE_ID": je_id,
                                    "Date": row["Statement_Date"],
                                    "Account_Code": suspense_acct,
                                    "Debit": abs(disc),
                                    "Credit": 0.0,
                                    "Description": f"Discrepancy Adj: {row['Description']}"
                                })
                                journal_entries.append({
                                    "JE_ID": je_id,
                                    "Date": row["Statement_Date"],
                                    "Account_Code": cash_acct,
                                    "Debit": 0.0,
                                    "Credit": abs(disc),
                                    "Description": f"Discrepancy Adj: {row['Description']}"
                                })
                                
                    # Update Session State
                    st.session_state.journals = pd.DataFrame(journal_entries)
                    
                    # Remove resolved items from unmatched lists
                    st.session_state.unmatched_statements = st.session_state.unmatched_statements[
                        ~st.session_state.unmatched_statements["Transaction_ID"].isin(resolved_stmt_ids)
                    ]
                    
                    st.session_state.recon_status = "Balanced & Journaled"
                    log_action("Automated Balancing", f"Generated {len(st.session_state.journals)} adjusting journal lines. Resolved {len(resolved_stmt_ids)} unmatched items.")
                    st.success("Automated balancing complete! Adjusting journal entries generated.")
                    st.rerun()
                    
        with col2:
            st.subheader("Generated Adjusting Journal Entries")
            if st.session_state.journals.empty:
                st.info("No adjusting journal entries generated yet. Click 'Execute Automated Balancing' to run.")
            else:
                st.dataframe(st.session_state.journals, use_container_width=True, height=300)
                
                # Total Debits and Credits check
                total_debits = st.session_state.journals["Debit"].sum()
                total_credits = st.session_state.journals["Credit"].sum()
                
                c1, c2, c3 = st.columns(3)
                c1.metric("Total Debits", f"${total_debits:,.2f}")
                c2.metric("Total Credits", f"${total_credits:,.2f}")
                c3.metric("Net Balance Impact", f"${(total_debits - total_credits):,.2f}")
                
                if abs(total_debits - total_credits) < 0.01:
                    st.success("✅ Journals are perfectly balanced (Debits = Credits). Ready for ERP posting.")
                else:
                    st.error("❌ Out of balance! Please review the generated entries.")
                    
                # ERP Posting Simulation
                if st.button("Post Journals to ERP (General Ledger)", type="primary"):
                    with st.spinner("Posting to ERP Gateway..."):
                        import time
                        time.sleep(1.5)
                        log_action("ERP Posting", f"Posted {len(st.session_state.journals)} journal lines to ERP General Ledger.")
                        st.success("Successfully posted adjusting journals to ERP General Ledger!")
                        st.session_state.journals = pd.DataFrame() # Clear after posting

# ==========================================
# APP 4: ANALYTICS & AUDIT DASHBOARD
# ==========================================
elif app_selection == "4. Analytics & Audit Dashboard":
    st.title("📊 Treasury Analytics & Audit Trail")
    st.markdown("""
    This dashboard provides real-time visibility into treasury reconciliation performance, 
    outstanding exposure, and a complete, immutable audit trail of all automated and manual actions.
    """)
    
    # KPI Metrics Row
    total_stmt_count = len(st.session_state.statements)
    matched_count = len(st.session_state.matches) if not st.session_state.matches.empty else 0
    recon_rate = (matched_count / total_stmt_count * 100) if total_stmt_count > 0 else 0
    
    unmatched_stmt_val = st.session_state.unmatched_statements["Amount"].sum() if not st.session_state.unmatched_statements.empty else 0.0
    unmatched_led_val = st.session_state.unmatched_ledger["Amount"].sum() if not st.session_state.unmatched_ledger.empty else 0.0
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Reconciliation Rate", f"{recon_rate:.1f}%", delta=f"{recon_rate - 80:.1f}% vs Target")
    col2.metric("Matched Transactions", f"{matched_count} / {total_stmt_count}")
    col3.metric("Unmatched Bank Exposure", f"${unmatched_stmt_val:,.2f}", delta="Action Required", delta_color="inverse")
    col4.metric("Unmatched Ledger Exposure", f"${unmatched_led_val:,.2f}", delta="Outstanding Checks", delta_color="off")
    
    st.markdown("---")
    
    # Visualizations
    c1, c2 = st.columns(2)
    
    with c1:
        st.subheader("Match Status Breakdown")
        if not st.session_state.matches.empty:
            match_types = st.session_state.matches["Match_Type"].value_counts().reset_index()
            match_types.columns = ["Type", "Count"]
            
            # Add unmatched counts to the chart
            unmatched_stmt_count = len(st.session_state.unmatched_statements)
            unmatched_led_count = len(st.session_state.unmatched_ledger)
            
            new_rows = pd.DataFrame([
                {"Type": "Unmatched Bank", "Count": unmatched_stmt_count},
                {"Type": "Unmatched Ledger", "Count": unmatched_led_count}
            ])
            match_types = pd.concat([match_types, new_rows], ignore_index=True)
            
            fig = px.pie(match_types, values="Count", names="Type", hole=0.4,
                         color_discrete_sequence=px.colors.qualitative.Pastel)
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No matching data available. Run the matching engine to populate charts.")
            
    with c2:
        st.subheader("Transaction Volume & Value Trend")
        if not st.session_state.statements.empty:
            trend_df = st.session_state.statements.groupby("Value_Date").agg(
                Total_Value=("Amount", "sum"),
                Tx_Count=("Transaction_ID", "count")
            ).reset_index()
            
            fig = go.Figure()
            fig.add_trace(go.Bar(
                x=trend_df["Value_Date"],
                y=trend_df["Total_Value"],
                name="Total Value ($)",
                yaxis="y",
                marker_color="rgb(55, 83, 109)"
            ))
            fig.add_trace(go.Scatter(
                x=trend_df["Value_Date"],
                y=trend_df["Tx_Count"],
                name="Tx Count",
                yaxis="y2",
                line=dict(color="rgb(26, 118, 255)", width=3)
            ))
            
            fig.update_layout(
                yaxis=dict(title="Total Value ($)"),
                yaxis2=dict(title="Transaction Count", overlaying="y", side="right"),
                legend=dict(x=0.1, y=1.1, orientation="h"),
                margin=dict(l=40, r=40, t=40, b=40)
            )
            st.plotly_chart(fig, use_container_width=True)
            
    st.markdown("---")
    
    # Audit Trail Table
    st.subheader("📋 Immutable Audit Trail")
    if st.session_state.audit_log:
        audit_df = pd.DataFrame(st.session_state.audit_log)
        st.dataframe(audit_df, use_container_width=True)
        
        # Export Audit Log
        audit_csv = io.StringIO()
        audit_df.to_csv(audit_csv, index=False)
        st.download_button(
            label="📥 Export Audit Trail (CSV)",
            data=audit_csv.getvalue(),
            file_name="treasury_recon_audit_trail.csv",
            mime="text/csv"
        )
    else:
        st.info("No audit logs recorded yet.")