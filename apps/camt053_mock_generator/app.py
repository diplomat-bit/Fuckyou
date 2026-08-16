import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import xml.etree.ElementTree as ET
from xml.dom import minidom
import random
from datetime import datetime, timedelta
import uuid
import zipfile
import io

# Set page configuration
st.set_page_config(
    page_title="CAMT.053 Mock Generator & Suite",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional financial styling
st.markdown("""
<style>
    .reportview-container {
        background: #f8f9fa;
    }
    .sidebar .sidebar-content {
        background: #1e293b;
        color: white;
    }
    .stButton>button {
        background-color: #0f172a;
        color: white;
        border-radius: 6px;
        border: none;
        padding: 0.5rem 1rem;
        font-weight: 600;
    }
    .stButton>button:hover {
        background-color: #1e293b;
        color: #38bdf8;
    }
    .metric-card {
        background-color: white;
        padding: 1.25rem;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border-left: 5px solid #0ea5e9;
        margin-bottom: 1rem;
    }
    .metric-title {
        font-size: 0.875rem;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
    }
    .metric-value {
        font-size: 1.5rem;
        color: #0f172a;
        font-weight: 700;
        margin-top: 0.25rem;
    }
</style>
""", unsafe_allow_html=True)

# --- CONSTANTS & MOCK DATA ---
CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "JPY"]

COUNTERPARTIES = [
    "Acme Corporation", "Global Logistics Inc", "Tech Solutions Ltd", "Apex Consulting",
    "Starlight Retail", "Nova Energy", "John Doe", "Jane Smith", "Alpha Holdings",
    "Delta Airlines", "Supermarket Express", "City Water & Power", "Tax Authority",
    "Cloud Services LLC", "Office Supplies Depot", "Secure Insurance", "Prime Real Estate",
    "Velocity Ventures", "Quantum Labs", "Horizon Media", "Beacon Health"
]

REMITTANCES = [
    "Invoice #2024-8901", "Monthly Subscription Fee", "Consulting Services Oct 2024",
    "Office Rent Payment", "Utility Bill Payment", "Salary Payment", "Reimbursement for travel",
    "Refund for returned goods", "Intercompany Transfer", "Loan Repayment", "Marketing Campaign",
    "Software License Renewal", "Hardware Purchase", "Catering Services", "Tax Settlement",
    "Project Milestone 2", "Hosting Services", "Legal Advisory Fees", "Equipment Lease"
]

BICS = {
    "EUR": "DEUTDEDDXXX",
    "USD": "CHASEUS33XXX",
    "GBP": "BARCGB22XXX",
    "CHF": "UBSWCHZHXXX",
    "CAD": "RYBCCATTXXX",
    "AUD": "WSTPAU2SXXX",
    "JPY": "BOTKJPJTXXX"
}

# --- HELPER FUNCTIONS ---

def generate_random_iban(country_code="DE", currency="EUR"):
    bank_code = "".join(random.choices("0123456789", k=8))
    account_num = "".join(random.choices("0123456789", k=10))
    checksum = "21"  # Simplified checksum for mock generation
    return f"{country_code}{checksum}{bank_code}{account_num}"

def generate_transactions(num_tx, start_date, op_bal, scenario="Standard"):
    tx_list = []
    current_bal = op_bal
    
    for i in range(num_tx):
        # Determine transaction direction and amount based on scenario
        if scenario == "All Credits":
            is_credit = True
        elif scenario == "All Debits":
            is_credit = False
        elif scenario == "High Volume":
            is_credit = random.random() > 0.4  # Slightly more credits
        elif scenario == "Zero & Negative Balances":
            # Force balance to go negative
            is_credit = current_bal < -1000 or (random.random() > 0.7 if current_bal > 0 else random.random() > 0.3)
        else:  # Standard
            is_credit = random.random() > 0.5
            
        # Amount generation
        if scenario == "Special Characters & Long Fields":
            amount = round(random.uniform(1.0, 50000.0), 2)
        elif scenario == "High Volume":
            amount = round(random.uniform(0.01, 500.0), 2)
        else:
            amount = round(random.uniform(5.0, 15000.0), 2)
            
        signed_amount = amount if is_credit else -amount
        current_bal += signed_amount
        
        # Date generation
        if scenario == "Weekend & Holiday Processing":
            # Force some weekend dates
            days_offset = random.randint(0, 5)
            tx_date = start_date + timedelta(days=days_offset)
            # If weekend, value date is next Monday
            if tx_date.weekday() == 5:  # Saturday
                val_date = tx_date + timedelta(days=2)
            elif tx_date.weekday() == 6:  # Sunday
                val_date = tx_date + timedelta(days=1)
            else:
                val_date = tx_date
        else:
            tx_date = start_date
            val_date = start_date
            
        # Counterparty & Remittance customization
        if scenario == "Special Characters & Long Fields":
            counterparty = random.choice(COUNTERPARTIES) + " & Söhne GmbH-Co. KG ©"
            remittance = random.choice(REMITTANCES) + " / Ref-ID: " + "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=30))
        else:
            counterparty = random.choice(COUNTERPARTIES)
            remittance = random.choice(REMITTANCES)
            
        tx_list.append({
            "amount": signed_amount,
            "booking_date": tx_date,
            "value_date": val_date,
            "ref": f"REF-{uuid.uuid4().hex[:8].upper()}",
            "e2e_id": f"E2E-{uuid.uuid4().hex[:12].upper()}",
            "counterparty": counterparty,
            "remittance": remittance,
            "status": "BOOK"
        })
        
    return tx_list, current_bal

def generate_camt053_xml(msg_id, cre_dt, stmt_id, iban, bic, currency, op_bal, cl_bal, transactions):
    # Register namespace to avoid ns0: prefixes
    ET.register_namespace('', "urn:iso:std:iso:20022:tech:xsd:camt.053.001.01")
    
    root = ET.Element("Document", {
        "xmlns": "urn:iso:std:iso:20022:tech:xsd:camt.053.001.01",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
    })
    
    bk_to_cstmr_stmt = ET.SubElement(root, "BkToCstmrStmt")
    
    # Group Header
    grp_hdr = ET.SubElement(bk_to_cstmr_stmt, "GrpHdr")
    msg_id_el = ET.SubElement(grp_hdr, "MsgId")
    msg_id_el.text = msg_id
    cre_dt_tm = ET.SubElement(grp_hdr, "CreDtTm")
    cre_dt_tm.text = cre_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Statement
    stmt = ET.SubElement(bk_to_cstmr_stmt, "Stmt")
    stmt_id_el = ET.SubElement(stmt, "Id")
    stmt_id_el.text = stmt_id
    stmt_cre_dt_tm = ET.SubElement(stmt, "CreDtTm")
    stmt_cre_dt_tm.text = cre_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    # Account Info
    acct = ET.SubElement(stmt, "Acct")
    acct_id = ET.SubElement(acct, "Id")
    iban_el = ET.SubElement(acct_id, "IBAN")
    iban_el.text = iban
    acct_cur = ET.SubElement(acct, "Cur")
    acct_cur.text = currency
    
    # Opening Balance (OPBD)
    bal_op = ET.SubElement(stmt, "Bal")
    bal_op_tp = ET.SubElement(bal_op, "Type")
    bal_op_sub_tp = ET.SubElement(bal_op_tp, "CdOrPrtry")
    bal_op_cd = ET.SubElement(bal_op_sub_tp, "Cd")
    bal_op_cd.text = "OPBD"
    
    bal_op_amt = ET.SubElement(bal_op, "Amt", {"Ccy": currency})
    bal_op_amt.text = f"{abs(op_bal):.2f}"
    
    bal_op_ind = ET.SubElement(bal_op, "CdtDbtInd")
    bal_op_ind.text = "CRDT" if op_bal >= 0 else "DBIT"
    
    bal_op_dt = ET.SubElement(bal_op, "Dt")
    bal_op_dt_val = ET.SubElement(bal_op_dt, "Dt")
    bal_op_dt_val.text = cre_dt.strftime("%Y-%m-%d")
    
    # Closing Balance (CLBD)
    bal_cl = ET.SubElement(stmt, "Bal")
    bal_cl_tp = ET.SubElement(bal_cl, "Type")
    bal_cl_sub_tp = ET.SubElement(bal_cl_tp, "CdOrPrtry")
    bal_cl_cd = ET.SubElement(bal_cl_sub_tp, "Cd")
    bal_cl_cd.text = "CLBD"
    
    bal_cl_amt = ET.SubElement(bal_cl, "Amt", {"Ccy": currency})
    bal_cl_amt.text = f"{abs(cl_bal):.2f}"
    
    bal_cl_ind = ET.SubElement(bal_cl, "CdtDbtInd")
    bal_cl_ind.text = "CRDT" if cl_bal >= 0 else "DBIT"
    
    bal_cl_dt = ET.SubElement(bal_cl, "Dt")
    bal_cl_dt_val = ET.SubElement(bal_cl_dt, "Dt")
    bal_cl_dt_val.text = cre_dt.strftime("%Y-%m-%d")
    
    # Transactions (Entries)
    for tx in transactions:
        ntry = ET.SubElement(stmt, "Ntry")
        
        amt = ET.SubElement(ntry, "Amt", {"Ccy": currency})
        amt.text = f"{abs(tx['amount']):.2f}"
        
        ind = ET.SubElement(ntry, "CdtDbtInd")
        ind.text = "CRDT" if tx['amount'] >= 0 else "DBIT"
        
        sts = ET.SubElement(ntry, "Sts")
        sts.text = tx.get('status', 'BOOK')
        
        bookg_dt = ET.SubElement(ntry, "BookgDt")
        bookg_dt_val = ET.SubElement(bookg_dt, "Dt")
        bookg_dt_val.text = tx['booking_date'].strftime("%Y-%m-%d")
        
        val_dt = ET.SubElement(ntry, "ValDt")
        val_dt_val = ET.SubElement(val_dt, "Dt")
        val_dt_val.text = tx['value_date'].strftime("%Y-%m-%d")
        
        acct_svcr_ref = ET.SubElement(ntry, "AcctSvcrRef")
        acct_svcr_ref.text = tx['ref']
            
        ntry_dtls = ET.SubElement(ntry, "NtryDtls")
        tx_dtls = ET.SubElement(ntry_dtls, "TxDtls")
        
        refs = ET.SubElement(tx_dtls, "Refs")
        e2e = ET.SubElement(refs, "EndToEndId")
        e2e.text = tx.get('e2e_id', 'NOTPROVIDED')
        
        rltd_pties = ET.SubElement(tx_dtls, "RltdPties")
        party_type = "Dbtr" if tx['amount'] >= 0 else "Cdtr"
        party = ET.SubElement(rltd_pties, party_type)
        party_nm = ET.SubElement(party, "Nm")
        party_nm.text = tx.get('counterparty', 'Unknown Party')
        
        rmt_inf = ET.SubElement(tx_dtls, "RmtInf")
        ustrd = ET.SubElement(rmt_inf, "Ustrd")
        ustrd.text = tx.get('remittance', 'General Transfer')
        
    # Convert to string and prettify
    xml_str = ET.tostring(root, encoding='utf-8')
    parsed = minidom.parseString(xml_str)
    return parsed.toprettyxml(indent="  ")

def parse_camt053_xml(xml_content):
    try:
        root = ET.fromstring(xml_content)
    except Exception as e:
        raise ValueError(f"Invalid XML format: {str(e)}")
        
    # Find namespace dynamically
    ns = ""
    if root.tag.startswith("{"):
        ns = root.tag.split("}")[0] + "}"
        
    def find_el(parent, path):
        parts = path.split("/")
        curr = parent
        for part in parts:
            if curr is None:
                return None
            curr = curr.find(f"{ns}{part}")
        return curr
        
    def find_all_el(parent, path):
        parts = path.split("/")
        curr_list = [parent]
        for part in parts[:-1]:
            next_list = []
            for c in curr_list:
                found = c.findall(f"{ns}{part}")
                if found:
                    next_list.extend(found)
            curr_list = next_list
        
        final_list = []
        for c in curr_list:
            final_list.extend(c.findall(f"{ns}{parts[-1]}"))
        return final_list

    # Extract Header Info
    msg_id = getattr(find_el(root, "BkToCstmrStmt/GrpHdr/MsgId"), 'text', 'N/A')
    cre_dt_tm = getattr(find_el(root, "BkToCstmrStmt/GrpHdr/CreDtTm"), 'text', 'N/A')
    
    # Extract Statement Info
    stmt = find_el(root, "BkToCstmrStmt/Stmt")
    if stmt is None:
        raise ValueError("No <Stmt> element found in the CAMT.053 file.")
        
    stmt_id = getattr(stmt.find(f"{ns}Id"), 'text', 'N/A')
    
    # Account details
    iban = getattr(find_el(stmt, "Acct/Id/IBAN"), 'text', '')
    if not iban:
        iban = getattr(find_el(stmt, "Acct/Id/Othr/Id"), 'text', 'Unknown Account')
        
    currency = getattr(find_el(stmt, "Acct/Cur"), 'text', 'EUR')
    
    # Balances
    balances = find_all_el(stmt, "Bal")
    op_bal = 0.0
    cl_bal = 0.0
    
    for bal in balances:
        bal_type_cd = getattr(find_el(bal, "Type/CdOrPrtry/Cd"), 'text', '')
        amt_el = find_el(bal, "Amt")
        amt = float(amt_el.text) if amt_el is not None else 0.0
        ind = getattr(find_el(bal, "CdtDbtInd"), 'text', 'CRDT')
        if ind == 'DBIT':
            amt = -amt
            
        if bal_type_cd == 'OPBD':
            op_bal = amt
        elif bal_type_cd == 'CLBD':
            cl_bal = amt
            
    # Transactions
    entries = find_all_el(stmt, "Ntry")
    tx_list = []
    for entry in entries:
        amt_el = find_el(entry, "Amt")
        amt = float(amt_el.text) if amt_el is not None else 0.0
        ind = getattr(find_el(entry, "CdtDbtInd"), 'text', 'CRDT')
        if ind == 'DBIT':
            amt = -amt
            
        status = getattr(find_el(entry, "Sts"), 'text', 'BOOK')
        booking_dt = getattr(find_el(entry, "BookgDt/Dt"), 'text', 'N/A')
        value_dt = getattr(find_el(entry, "ValDt/Dt"), 'text', 'N/A')
        ref = getattr(find_el(entry, "AcctSvcrRef"), 'text', 'N/A')
        
        counterparty = "N/A"
        remittance = "N/A"
        e2e_id = "N/A"
        
        tx_dtls = find_el(entry, "NtryDtls/TxDtls")
        if tx_dtls is not None:
            e2e_id = getattr(find_el(tx_dtls, "Refs/EndToEndId"), 'text', 'N/A')
            
            dbtr_nm = getattr(find_el(tx_dtls, "RltdPties/Dbtr/Nm"), 'text', None)
            cdtr_nm = getattr(find_el(tx_dtls, "RltdPties/Cdtr/Nm"), 'text', None)
            counterparty = dbtr_nm or cdtr_nm or "Unknown Party"
            
            remittance = getattr(find_el(tx_dtls, "RmtInf/Ustrd"), 'text', 'N/A')
            
        tx_list.append({
            "Amount": amt,
            "Direction": ind,
            "Status": status,
            "Booking Date": booking_dt,
            "Value Date": value_dt,
            "Reference": ref,
            "EndToEndId": e2e_id,
            "Counterparty": counterparty,
            "Remittance": remittance
        })
        
    return {
        "msg_id": msg_id,
        "cre_dt_tm": cre_dt_tm,
        "stmt_id": stmt_id,
        "iban": iban,
        "currency": currency,
        "op_bal": op_bal,
        "cl_bal": cl_bal,
        "transactions": tx_list
    }

# --- SIDEBAR NAVIGATION ---
st.sidebar.title("🏦 CAMT.053 Suite")
st.sidebar.markdown("Generate, simulate, and validate ISO 20022 bank-to-customer statements.")

app_mode = st.sidebar.radio(
    "Select Application Tool:",
    [
        "1. Single Statement Generator",
        "2. Batch Statement Generator",
        "3. Scenario-Based Test Suite",
        "4. CAMT.053 Parser & Inspector"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    "**About CAMT.053**\n"
    "The CAMT.053.001.01 format is used by financial institutions to deliver detailed end-of-day account statements to corporate customers."
)

# ==========================================
# APP 1: SINGLE STATEMENT GENERATOR
# ==========================================
if app_mode == "1. Single Statement Generator":
    st.title("🏦 Single Statement Generator")
    st.markdown("Configure and generate a single, highly customized CAMT.053 XML statement.")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Configuration")
        currency = st.selectbox("Currency", CURRENCIES, index=0)
        iban = st.text_input("Account IBAN", value=generate_random_iban("DE", currency))
        bic = st.text_input("Bank BIC", value=BICS.get(currency, "GENEGB22XXX"))
        
        op_bal = st.number_input("Opening Balance", value=15000.00, step=1000.00)
        num_tx = st.slider("Number of Transactions", min_value=1, max_value=100, value=10)
        stmt_date = st.date_input("Statement Date", datetime.today())
        
        generate_btn = st.button("Generate Statement", use_container_width=True)
        
    with col2:
        if generate_btn:
            with st.spinner("Generating statement..."):
                # Generate transactions
                tx_list, cl_bal = generate_transactions(num_tx, stmt_date, op_bal)
                
                # Generate XML
                msg_id = f"MSG-{uuid.uuid4().hex[:12].upper()}"
                stmt_id = f"STMT-{stmt_date.strftime('%Y%m%d')}-01"
                cre_dt = datetime.combine(stmt_date, datetime.now().time())
                
                xml_data = generate_camt053_xml(
                    msg_id, cre_dt, stmt_id, iban, bic, currency, op_bal, cl_bal, tx_list
                )
                
                # Display Metrics
                m_col1, m_col2, m_col3, m_col4 = st.columns(4)
                with m_col1:
                    st.markdown(f'<div class="metric-card"><div class="metric-title">Opening Balance</div><div class="metric-value">{currency} {op_bal:,.2f}</div></div>', unsafe_allow_html=True)
                with m_col2:
                    st.markdown(f'<div class="metric-card"><div class="metric-title">Closing Balance</div><div class="metric-value">{currency} {cl_bal:,.2f}</div></div>', unsafe_allow_html=True)
                with m_col3:
                    total_credits = sum(tx['amount'] for tx in tx_list if tx['amount'] > 0)
                    st.markdown(f'<div class="metric-card"><div class="metric-title">Total Credits</div><div class="metric-value" style="color: green;">+{currency} {total_credits:,.2f}</div></div>', unsafe_allow_html=True)
                with m_col4:
                    total_debits = sum(tx['amount'] for tx in tx_list if tx['amount'] < 0)
                    st.markdown(f'<div class="metric-card"><div class="metric-title">Total Debits</div><div class="metric-value" style="color: red;">{currency} {total_debits:,.2f}</div></div>', unsafe_allow_html=True)
                
                # Tabs for viewing data
                tab1, tab2, tab3 = st.tabs(["📊 Transaction Preview", "📄 Raw XML", "💾 Download"])
                
                with tab1:
                    df = pd.DataFrame(tx_list)
                    df['amount'] = df['amount'].apply(lambda x: f"{currency} {x:,.2f}")
                    st.dataframe(df[['booking_date', 'counterparty', 'amount', 'remittance', 'ref']], use_container_width=True)
                    
                with tab2:
                    st.code(xml_data, language="xml")
                    
                with tab3:
                    st.success("Statement generated successfully!")
                    st.download_button(
                        label="Download CAMT.053 XML File",
                        data=xml_data,
                        file_name=f"camt053_{iban}_{stmt_date.strftime('%Y%m%d')}.xml",
                        mime="application/xml",
                        use_container_width=True
                    )
        else:
            st.info("Adjust parameters on the left and click 'Generate Statement' to begin.")

# ==========================================
# APP 2: BATCH STATEMENT GENERATOR
# ==========================================
elif app_mode == "2. Batch Statement Generator":
    st.title("📦 Batch Statement Generator")
    st.markdown("Generate a ZIP archive containing multiple CAMT.053 statements across multiple accounts and dates.")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Batch Settings")
        num_accounts = st.slider("Number of Accounts", min_value=1, max_value=5, value=2)
        num_days = st.slider("Number of Days per Account", min_value=1, max_value=15, value=5)
        start_date = st.date_input("Start Date", datetime.today() - timedelta(days=5))
        currency = st.selectbox("Base Currency", CURRENCIES, index=0)
        
        st.markdown("---")
        st.markdown("### Account Details")
        accounts = []
        for i in range(num_accounts):
            acc_iban = generate_random_iban(currency=currency)
            acc_bal = st.number_input(f"Opening Bal (Acc {i+1})", value=10000.00 * (i+1), key=f"acc_bal_{i}")
            accounts.append({"iban": acc_iban, "balance": acc_bal})
            
        generate_batch_btn = st.button("Generate Batch ZIP", use_container_width=True)
        
    with col2:
        if generate_batch_btn:
            zip_buffer = io.BytesIO()
            summary_data = []
            
            with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
                for acc_idx, acc in enumerate(accounts):
                    current_balance = acc["balance"]
                    iban = acc["iban"]
                    bic = BICS.get(currency, "GENEGB22XXX")
                    
                    for day in range(num_days):
                        stmt_date = start_date + timedelta(days=day)
                        num_tx = random.randint(3, 12)
                        
                        # Generate transactions for this day
                        tx_list, next_balance = generate_transactions(num_tx, stmt_date, current_balance)
                        
                        # Generate XML
                        msg_id = f"MSG-{uuid.uuid4().hex[:12].upper()}"
                        stmt_id = f"STMT-{iban[-4:]}-{stmt_date.strftime('%Y%m%d')}"
                        cre_dt = datetime.combine(stmt_date, datetime.now().time())
                        
                        xml_data = generate_camt053_xml(
                            msg_id, cre_dt, stmt_id, iban, bic, currency, current_balance, next_balance, tx_list
                        )
                        
                        # Add to ZIP
                        filename = f"camt053_{iban[-8:]}_{stmt_date.strftime('%Y%m%d')}.xml"
                        zip_file.writestr(filename, xml_data)
                        
                        summary_data.append({
                            "Account": f"Account {acc_idx+1} (...{iban[-4:]})",
                            "Date": stmt_date.strftime("%Y-%m-%d"),
                            "Transactions": num_tx,
                            "Opening Balance": f"{currency} {current_balance:,.2f}",
                            "Closing Balance": f"{currency} {next_balance:,.2f}",
                            "File Name": filename
                        })
                        
                        # Next day's opening balance is today's closing balance
                        current_balance = next_balance
                        
            zip_buffer.seek(0)
            
            st.subheader("Batch Generation Summary")
            st.dataframe(pd.DataFrame(summary_data), use_container_width=True)
            
            st.success(f"Successfully generated {len(summary_data)} CAMT.053 files!")
            st.download_button(
                label="Download Batch ZIP Archive",
                data=zip_buffer,
                file_name=f"camt053_batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip",
                mime="application/zip",
                use_container_width=True
            )
        else:
            st.info("Configure the batch settings and click 'Generate Batch ZIP' to create the test files.")

# ==========================================
# APP 3: SCENARIO-BASED TEST SUITE
# ==========================================
elif app_mode == "3. Scenario-Based Test Suite":
    st.title("🧪 Scenario-Based Test Suite")
    st.markdown("Generate specific edge-case statements designed to stress-test financial parsers and reconciliation engines.")
    
    scenarios = {
        "High Volume Performance": "Generates a statement with 500+ transactions to test parser speed and memory limits.",
        "Zero & Negative Balances": "Simulates an account starting at zero, dipping into negative balances, and ending negative. Tests signed balance parsing.",
        "Special Characters & Long Fields": "Includes special characters (e.g., ©, Söhne, &) and extremely long remittance texts to test encoding and schema validation.",
        "Weekend & Holiday Processing": "Generates transactions booked on weekends with value dates shifted to the next business day. Tests value-date logic."
    }
    
    selected_scenario = st.selectbox("Select Test Scenario", list(scenarios.keys()))
    st.info(f"**Scenario Description:** {scenarios[selected_scenario]}")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Scenario Parameters")
        currency = st.selectbox("Currency", CURRENCIES, index=0)
        iban = generate_random_iban(currency=currency)
        bic = BICS.get(currency, "GENEGB22XXX")
        
        if selected_scenario == "High Volume Performance":
            num_tx = st.slider("Number of Transactions", min_value=100, max_value=1000, value=500)
            op_bal = 100000.00
        elif selected_scenario == "Zero & Negative Balances":
            num_tx = st.slider("Number of Transactions", min_value=5, max_value=30, value=15)
            op_bal = 0.00
        else:
            num_tx = st.slider("Number of Transactions", min_value=5, max_value=50, value=15)
            op_bal = 10000.00
            
        stmt_date = st.date_input("Statement Date", datetime.today())
        generate_scenario_btn = st.button("Generate Scenario File", use_container_width=True)
        
    with col2:
        if generate_scenario_btn:
            with st.spinner("Generating scenario statement..."):
                tx_list, cl_bal = generate_transactions(num_tx, stmt_date, op_bal, scenario=selected_scenario)
                
                msg_id = f"SCEN-{selected_scenario[:4].upper()}-{uuid.uuid4().hex[:8].upper()}"
                stmt_id = f"STMT-{selected_scenario[:4].upper()}-{stmt_date.strftime('%Y%m%d')}"
                cre_dt = datetime.combine(stmt_date, datetime.now().time())
                
                xml_data = generate_camt053_xml(
                    msg_id, cre_dt, stmt_id, iban, bic, currency, op_bal, cl_bal, tx_list
                )
                
                st.success(f"Scenario '{selected_scenario}' generated successfully!")
                
                # Metrics
                m_col1, m_col2, m_col3 = st.columns(3)
                with m_col1:
                    st.metric("Opening Balance", f"{currency} {op_bal:,.2f}")
                with m_col2:
                    st.metric("Closing Balance", f"{currency} {cl_bal:,.2f}")
                with m_col3:
                    st.metric("Total Transactions", len(tx_list))
                    
                tab1, tab2 = st.tabs(["📊 Transaction Preview", "📄 Raw XML"])
                with tab1:
                    df = pd.DataFrame(tx_list)
                    st.dataframe(df, use_container_width=True)
                with tab2:
                    st.code(xml_data, language="xml")
                    
                st.download_button(
                    label=f"Download {selected_scenario} XML",
                    data=xml_data,
                    file_name=f"camt053_{selected_scenario.lower().replace(' ', '_')}.xml",
                    mime="application/xml",
                    use_container_width=True
                )
        else:
            st.info("Click 'Generate Scenario File' to create the test case.")

# ==========================================
# APP 4: CAMT.053 PARSER & INSPECTOR
# ==========================================
elif app_mode == "4. CAMT.053 Parser & Inspector":
    st.title("🔍 CAMT.053 Parser & Inspector")
    st.markdown("Upload any CAMT.053 XML file to parse, validate, and visualize its contents instantly.")
    
    uploaded_file = st.file_uploader("Upload CAMT.053 XML File", type=["xml"])
    
    if uploaded_file is not None:
        try:
            xml_content = uploaded_file.read().decode("utf-8")
            parsed_data = parse_camt053(xml_content)
            
            st.success("File parsed successfully!")
            
            # Header Info
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.markdown(f'<div class="metric-card"><div class="metric-title">Account IBAN</div><div class="metric-value" style="font-size: 1.1rem;">{parsed_data["iban"]}</div></div>', unsafe_allow_html=True)
            with col2:
                st.markdown(f'<div class="metric-card"><div class="metric-title">Currency</div><div class="metric-value">{parsed_data["currency"]}</div></div>', unsafe_allow_html=True)
            with col3:
                st.markdown(f'<div class="metric-card"><div class="metric-title">Opening Balance</div><div class="metric-value">{parsed_data["currency"]} {parsed_data["op_bal"]:,.2f}</div></div>', unsafe_allow_html=True)
            with col4:
                st.markdown(f'<div class="metric-card"><div class="metric-title">Closing Balance</div><div class="metric-value">{parsed_data["currency"]} {parsed_data["cl_bal"]:,.2f}</div></div>', unsafe_allow_html=True)
                
            # Visualizations & Data Table
            tab1, tab2, tab3 = st.tabs(["📈 Balance Trend & Analytics", "📋 Transaction List", "📄 Raw XML Content"])
            
            with tab1:
                df_tx = pd.DataFrame(parsed_data["transactions"])
                if not df_tx.empty:
                    # Calculate running balance
                    df_tx['Booking Date'] = pd.to_datetime(df_tx['Booking Date'])
                    df_tx = df_tx.sort_values(by='Booking Date').reset_index(drop=True)
                    
                    balances = [parsed_data["op_bal"]]
                    for amt in df_tx['Amount']:
                        balances.append(balances[-1] + amt)
                    
                    # Create balance trend chart
                    fig = go.Figure()
                    fig.add_trace(go.Scatter(
                        x=[parsed_data["cre_dt_tm"]] + list(df_tx['Booking Date']),
                        y=balances,
                        mode='lines+markers',
                        name='Account Balance',
                        line=dict(color='#0ea5e9', width=3),
                        marker=dict(size=8)
                    ))
                    fig.update_layout(
                        title="Account Balance Progression",
                        xaxis_title="Date",
                        yaxis_title=f"Balance ({parsed_data['currency']})",
                        template="plotly_white"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Credit vs Debit Pie Chart
                    credits = df_tx[df_tx['Amount'] > 0]['Amount'].sum()
                    debits = abs(df_tx[df_tx['Amount'] < 0]['Amount'].sum())
                    
                    fig_pie = px.pie(
                        names=['Credits', 'Debits'],
                        values=[credits, debits],
                        color=['Credits', 'Debits'],
                        color_discrete_map={'Credits': '#22c55e', 'Debits': '#ef4444'},
                        title="Credit vs Debit Volume"
                    )
                    st.plotly_chart(fig_pie, use_container_width=True)
                else:
                    st.info("No transactions found in this statement.")
                    
            with tab2:
                if not df_tx.empty:
                    st.dataframe(df_tx, use_container_width=True)
                else:
                    st.info("No transactions to display.")
                    
            with tab3:
                st.code(xml_content, language="xml")
                
        except Exception as e:
            st.error(f"Error parsing CAMT.053 file: {str(e)}")
            st.info("Please ensure the uploaded file is a valid ISO 20022 CAMT.053 XML document.")
    else:
        st.info("Upload a CAMT.053 XML file to inspect its structure, balances, and transactions.")