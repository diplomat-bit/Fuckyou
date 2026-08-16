import streamlit as st
import pandas as pd
import xml.etree.ElementTree as ET
from xml.dom import minidom
import datetime
import random
import string
import io
import zipfile

# Set page configuration
st.set_page_config(
    page_title="CAMT.053 Mock Generator Suite",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- HELPER FUNCTIONS ---

def generate_random_iban(country="DE"):
    """Generates a realistic-looking mock IBAN."""
    bank_code = "".join(random.choices(string.digits, k=8))
    account_num = "".join(random.choices(string.digits, k=10))
    check_digits = f"{random.randint(10, 99)}"
    return f"{country}{check_digits}{bank_code}{account_num}"

def generate_random_bic():
    """Generates a realistic-looking mock BIC."""
    bank = "".join(random.choices(string.ascii_uppercase, k=4))
    country = "".join(random.choices(string.ascii_uppercase, k=2))
    location = "".join(random.choices(string.ascii_uppercase + string.digits, k=2))
    branch = "".join(random.choices(string.ascii_uppercase + string.digits, k=3))
    return f"{bank}{country}{location}{branch}"

def create_camt053_xml(msg_id, stmt_id, cre_dt, iban, bic, currency, op_bal, cl_bal, txs):
    """Constructs a valid CAMT.053.001.02 XML string."""
    # Root element with standard namespaces
    root = ET.Element("Document", {
        "xmlns": "urn:iso:std:iso:20022:tech:xsd:camt.053.001.02",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
    })
    
    bk_to_cstmr_stmt = ET.SubElement(root, "BkToCstmrStmt")
    
    # Group Header
    grp_hdr = ET.SubElement(bk_to_cstmr_stmt, "GrpHdr")
    ET.SubElement(grp_hdr, "MsgId").text = msg_id
    ET.SubElement(grp_hdr, "CreDtTm").text = cre_dt
    
    # Statement
    stmt = ET.SubElement(bk_to_cstmr_stmt, "Stmt")
    ET.SubElement(stmt, "Id").text = stmt_id
    ET.SubElement(stmt, "ElctrncSeqNb").text = "1"
    ET.SubElement(stmt, "CreDtTm").text = cre_dt
    
    # Account
    acct = ET.SubElement(stmt, "Acct")
    acct_id = ET.SubElement(acct, "Id")
    ET.SubElement(acct_id, "IBAN").text = iban
    ET.SubElement(acct, "Ccy").text = currency
    
    # Servicer (Bank BIC)
    svcr = ET.SubElement(stmt, "Svcr")
    fin_instn_id = ET.SubElement(svcr, "FinInstnId")
    ET.SubElement(fin_instn_id, "BIC").text = bic
    
    # Opening Balance (OPBD)
    bal_op = ET.SubElement(stmt, "Bal")
    bal_op_tp = ET.SubElement(bal_op, "Tp")
    bal_op_cd_or_prtry = ET.SubElement(bal_op_tp, "CdOrPrtry")
    ET.SubElement(bal_op_cd_or_prtry, "Cd").text = "OPBD"
    bal_op_amt = ET.SubElement(bal_op, "Amt", {"Ccy": currency})
    bal_op_amt.text = f"{abs(op_bal):.2f}"
    ET.SubElement(bal_op, "CdtDbtInd").text = "CRDT" if op_bal >= 0 else "DBIT"
    bal_op_dt = ET.SubElement(bal_op, "Dt")
    ET.SubElement(bal_op_dt, "Dt").text = cre_dt[:10]
    
    # Entries (Transactions)
    for i, tx in enumerate(txs):
        ntry = ET.SubElement(stmt, "Ntry")
        ntry_amt = ET.SubElement(ntry, "Amt", {"Ccy": currency})
        ntry_amt.text = f"{abs(tx['amt']):.2f}"
        ET.SubElement(ntry, "CdtDbtInd").text = tx['dbit_crdt']
        ET.SubElement(ntry, "Sts").text = "BOOK"
        
        ntry_bk_dt = ET.SubElement(ntry, "BookgDt")
        ET.SubElement(ntry_bk_dt, "Dt").text = tx['booking_date']
        
        ntry_val_dt = ET.SubElement(ntry, "ValDt")
        ET.SubElement(ntry_val_dt, "Dt").text = tx['val_date']
        
        ET.SubElement(ntry, "AcctSvcrRef").text = f"REF-{i+1:04d}"
        
        ntry_dtls = ET.SubElement(ntry, "NtryDtls")
        tx_dtls = ET.SubElement(ntry_dtls, "TxDtls")
        
        refs = ET.SubElement(tx_dtls, "Refs")
        ET.SubElement(refs, "EndToEndId").text = tx['ref']
        
        # Related Parties
        rltd_pties = ET.SubElement(tx_dtls, "RltdPties")
        party_type = "Dbtr" if tx['dbit_crdt'] == "CRDT" else "Cdtr"
        party = ET.SubElement(rltd_pties, party_type)
        ET.SubElement(party, "Nm").text = tx['counterparty']
        
        # Remittance Info
        rmt_inf = ET.SubElement(tx_dtls, "RmtInf")
        ET.SubElement(rmt_inf, "Ustrd").text = tx['ustrd']
    
    # Closing Balance (CLBD)
    bal_cl = ET.SubElement(stmt, "Bal")
    bal_cl_tp = ET.SubElement(bal_cl, "Tp")
    bal_cl_cd_or_prtry = ET.SubElement(bal_cl_tp, "CdOrPrtry")
    ET.SubElement(bal_cl_cd_or_prtry, "Cd").text = "CLBD"
    bal_cl_amt = ET.SubElement(bal_cl, "Amt", {"Ccy": currency})
    bal_cl_amt.text = f"{abs(cl_bal):.2f}"
    ET.SubElement(bal_cl, "CdtDbtInd").text = "CRDT" if cl_bal >= 0 else "DBIT"
    bal_cl_dt = ET.SubElement(bal_cl, "Dt")
    ET.SubElement(bal_cl_dt, "Dt").text = cre_dt[:10]
    
    # Pretty print XML
    xml_str = ET.tostring(root, encoding="utf-8")
    parsed = minidom.parseString(xml_str)
    return parsed.toprettyxml(indent="  ")

def parse_camt053_xml(xml_content):
    """Parses a CAMT.053 XML file and extracts key information and transactions."""
    # Remove namespaces for easier parsing with standard ElementTree
    try:
        # Parse XML
        root = ET.fromstring(xml_content)
        
        # Helper to find elements ignoring namespaces
        def find_tag_no_ns(element, tag_name):
            for elem in element.iter():
                if elem.tag.split('}')[-1] == tag_name:
                    return elem
            return None

        def find_all_tags_no_ns(element, tag_name):
            matches = []
            for elem in element.iter():
                if elem.tag.split('}')[-1] == tag_name:
                    matches.append(elem)
            return matches

        # Extract basic info
        msg_id_elem = find_tag_no_ns(root, "MsgId")
        msg_id = msg_id_elem.text if msg_id_elem is not None else "N/A"
        
        cre_dt_elem = find_tag_no_ns(root, "CreDtTm")
        cre_dt = cre_dt_elem.text if cre_dt_elem is not None else "N/A"
        
        iban_elem = find_tag_no_ns(root, "IBAN")
        iban = iban_elem.text if iban_elem is not None else "N/A"
        
        bic_elem = find_tag_no_ns(root, "BIC")
        bic = bic_elem.text if bic_elem is not None else "N/A"
        
        # Extract Balances
        balances = find_all_tags_no_ns(root, "Bal")
        op_bal = 0.0
        cl_bal = 0.0
        currency = "EUR"
        
        for bal in balances:
            tp = find_tag_no_ns(bal, "Cd")
            amt_elem = find_tag_no_ns(bal, "Amt")
            ind_elem = find_tag_no_ns(bal, "CdtDbtInd")
            
            if amt_elem is not None:
                currency = amt_elem.attrib.get("Ccy", "EUR")
                val = float(amt_elem.text)
                if ind_elem is not None and ind_elem.text == "DBIT":
                    val = -val
                
                if tp is not None and tp.text == "OPBD":
                    op_bal = val
                elif tp is not None and tp.text == "CLBD":
                    cl_bal = val

        # Extract Transactions
        entries = find_all_tags_no_ns(root, "Ntry")
        tx_list = []
        
        for entry in entries:
            amt_elem = find_tag_no_ns(entry, "Amt")
            ind_elem = find_tag_no_ns(entry, "CdtDbtInd")
            bk_dt_elem = find_tag_no_ns(entry, "BookgDt")
            val_dt_elem = find_tag_no_ns(entry, "ValDt")
            ref_elem = find_tag_no_ns(entry, "EndToEndId")
            ustrd_elem = find_tag_no_ns(entry, "Ustrd")
            
            # Try to find counterparty name
            dbtr_elem = find_tag_no_ns(entry, "Dbtr")
            cdtr_elem = find_tag_no_ns(entry, "Cdtr")
            counterparty = "Unknown"
            if dbtr_elem is not None:
                nm = find_tag_no_ns(dbtr_elem, "Nm")
                if nm is not None:
                    counterparty = nm.text
            elif cdtr_elem is not None:
                nm = find_tag_no_ns(cdtr_elem, "Nm")
                if nm is not None:
                    counterparty = nm.text

            amt = float(amt_elem.text) if amt_elem is not None else 0.0
            ind = ind_elem.text if ind_elem is not None else "CRDT"
            if ind == "DBIT":
                amt = -amt
                
            booking_date = "N/A"
            if bk_dt_elem is not None:
                dt_elem = find_tag_no_ns(bk_dt_elem, "Dt")
                if dt_elem is not None:
                    booking_date = dt_elem.text
                    
            val_date = "N/A"
            if val_dt_elem is not None:
                dt_elem = find_tag_no_ns(val_dt_elem, "Dt")
                if dt_elem is not None:
                    val_date = dt_elem.text

            tx_list.append({
                "Amount": amt,
                "Direction": ind,
                "Booking Date": booking_date,
                "Value Date": val_date,
                "Reference": ref_elem.text if ref_elem is not None else "N/A",
                "Counterparty": counterparty,
                "Remittance Info": ustrd_elem.text if ustrd_elem is not None else "N/A"
            })
            
        return {
            "success": True,
            "msg_id": msg_id,
            "cre_dt": cre_dt,
            "iban": iban,
            "bic": bic,
            "currency": currency,
            "op_bal": op_bal,
            "cl_bal": cl_bal,
            "transactions": tx_list
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# --- APP NAVIGATION ---

st.sidebar.title("🏦 CAMT.053 Suite")
st.sidebar.markdown("Generate, validate, and synthesize ISO 20022 bank-to-customer statements.")

app_mode = st.sidebar.radio(
    "Select Application Tool",
    [
        "1. Interactive Statement Builder",
        "2. Batch Scenario Generator",
        "3. Rule-Based Synthesizer",
        "4. Statement Inspector & Validator"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    "**About CAMT.053.001.02**\n"
    "This format is used by financial institutions to deliver detailed end-of-day "
    "account statements containing opening balances, closing balances, and fully detailed transaction entries."
)

# Initialize session states for dynamic transaction lists
if "interactive_txs" not in st.session_state:
    st.session_state.interactive_txs = [
        {
            "amt": 1500.00,
            "dbit_crdt": "CRDT",
            "booking_date": datetime.date.today().strftime("%Y-%m-%d"),
            "val_date": datetime.date.today().strftime("%Y-%m-%d"),
            "ref": "PAY-99281-A",
            "counterparty": "Acme Corp Services",
            "ustrd": "Invoice payment 2023-881"
        },
        {
            "amt": 45.50,
            "dbit_crdt": "DBIT",
            "booking_date": datetime.date.today().strftime("%Y-%m-%d"),
            "val_date": datetime.date.today().strftime("%Y-%m-%d"),
            "ref": "TX-88210-Z",
            "counterparty": "Local Coffee Shop",
            "ustrd": "Catering supplies"
        }
    ]

# ==========================================
# APP 1: INTERACTIVE STATEMENT BUILDER
# ==========================================
if app_mode == "1. Interactive Statement Builder":
    st.title("🛠️ Interactive Statement Builder")
    st.markdown("Manually construct a single, highly customized CAMT.053 statement with real-time XML preview.")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("1. Statement Metadata")
        meta_col1, meta_col2 = st.columns(2)
        with meta_col1:
            msg_id = st.text_input("Message ID", f"MSG-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}")
            stmt_id = st.text_input("Statement ID", f"STMT-{datetime.datetime.now().strftime('%Y%m%d')}-01")
            currency = st.selectbox("Currency", ["EUR", "USD", "GBP", "CHF", "JPY"], index=0)
        with meta_col2:
            iban = st.text_input("Account IBAN", generate_random_iban())
            bic = st.text_input("Bank BIC", generate_random_bic())
            op_bal = st.number_input("Opening Balance", value=10000.00, step=100.0)

        st.subheader("2. Add Transaction Entry")
        with st.form("add_tx_form", clear_on_submit=True):
            tx_col1, tx_col2 = st.columns(2)
            with tx_col1:
                tx_amt = st.number_input("Amount", min_value=0.01, value=100.00, step=10.0)
                tx_dir = st.selectbox("Direction", ["CRDT (Credit / Incoming)", "DBIT (Debit / Outgoing)"])
                tx_ref = st.text_input("End-to-End Reference ID", f"E2E-{random.randint(100000, 999999)}")
            with tx_col2:
                tx_party = st.text_input("Counterparty Name", "John Doe Trading Ltd")
                tx_ustrd = st.text_input("Remittance Info (Unstructured)", "Consulting services rendered")
                tx_date = st.date_input("Booking & Value Date", datetime.date.today())

            submitted = st.form_submit_button("➕ Add Transaction to Statement")
            if submitted:
                dir_code = "CRDT" if "CRDT" in tx_dir else "DBIT"
                st.session_state.interactive_txs.append({
                    "amt": tx_amt,
                    "dbit_crdt": dir_code,
                    "booking_date": tx_date.strftime("%Y-%m-%d"),
                    "val_date": tx_date.strftime("%Y-%m-%d"),
                    "ref": tx_ref,
                    "counterparty": tx_party,
                    "ustrd": tx_ustrd
                })
                st.success("Transaction added successfully!")

    with col2:
        st.subheader("3. Current Statement Preview")
        
        # Display current transactions in a table
        if st.session_state.interactive_txs:
            df_txs = pd.DataFrame(st.session_state.interactive_txs)
            st.dataframe(df_txs, use_container_width=True)
            
            if st.button("🗑️ Clear All Transactions"):
                st.session_state.interactive_txs = []
                st.rerun()
        else:
            st.info("No transactions added yet. Use the form on the left to add entries.")

        # Calculate closing balance
        total_crdt = sum(tx['amt'] for tx in st.session_state.interactive_txs if tx['dbit_crdt'] == 'CRDT')
        total_dbit = sum(tx['amt'] for tx in st.session_state.interactive_txs if tx['dbit_crdt'] == 'DBIT')
        cl_bal = op_bal + total_crdt - total_dbit

        # Display Balance Summary
        bal_col1, bal_col2, bal_col3 = st.columns(3)
        bal_col1.metric("Opening Balance", f"{op_bal:,.2f} {currency}")
        bal_col2.metric("Net Activity", f"{(total_crdt - total_dbit):+,.2f} {currency}")
        bal_col3.metric("Calculated Closing Balance", f"{cl_bal:,.2f} {currency}")

        # Generate XML
        cre_dt = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        xml_output = create_camt053_xml(
            msg_id=msg_id,
            stmt_id=stmt_id,
            cre_dt=cre_dt,
            iban=iban,
            bic=bic,
            currency=currency,
            op_bal=op_bal,
            cl_bal=cl_bal,
            txs=st.session_state.interactive_txs
        )

        st.subheader("4. Generated CAMT.053 XML")
        st.code(xml_output, language="xml")
        
        st.download_button(
            label="📥 Download CAMT.053 XML File",
            data=xml_output,
            file_name=f"camt_053_{stmt_id}.xml",
            mime="application/xml"
        )

# ==========================================
# APP 2: BATCH SCENARIO GENERATOR
# ==========================================
elif app_mode == "2. Batch Scenario Generator":
    st.title("📦 Batch Scenario Generator")
    st.markdown("Generate multiple CAMT.053 files representing realistic business scenarios for stress testing.")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Configure Batch Parameters")
        scenario = st.selectbox(
            "Select Business Scenario",
            [
                "Daily Retail Sweep (High volume, small amounts)",
                "Corporate Payroll Run (Few large outgoing debits)",
                "End-of-Month Reconciliation (Mixed high/low value transactions)",
                "Liquidity Management (Large sweeps between internal accounts)"
            ]
        )
        
        num_files = st.slider("Number of Statement Files to Generate", 1, 10, 3)
        base_iban = st.text_input("Base Account IBAN", generate_random_iban())
        base_bic = st.text_input("Base Bank BIC", generate_random_bic())
        currency = st.selectbox("Currency", ["EUR", "USD", "GBP", "CHF"], index=0)
        start_date = st.date_input("Start Date for Statements", datetime.date.today() - datetime.timedelta(days=5))

    with col2:
        st.subheader("Scenario Details & Generation")
        
        if "Daily Retail Sweep" in scenario:
            st.markdown("""
            **Scenario Characteristics:**
            - 15 to 30 transactions per file.
            - 85% Debit transactions (card payments, utility bills, small purchases).
            - 15% Credit transactions (refunds, small incoming transfers).
            - Average transaction size: 5.00 to 150.00.
            """)
        elif "Corporate Payroll Run" in scenario:
            st.markdown("""
            **Scenario Characteristics:**
            - 5 to 10 transactions per file.
            - Large outgoing debit transactions representing salary payouts.
            - Average transaction size: 1,500.00 to 8,500.00.
            - Standardized payroll references (e.g., 'PAYROLL-OCT-2023').
            """)
        elif "End-of-Month Reconciliation" in scenario:
            st.markdown("""
            **Scenario Characteristics:**
            - 10 to 20 transactions per file.
            - Balanced mix of incoming customer invoices (Credits) and supplier payments (Debits).
            - Average transaction size: 500.00 to 12,000.00.
            """)
        else:
            st.markdown("""
            **Scenario Characteristics:**
            - 2 to 5 transactions per file.
            - Very large round-sum transfers (Sweeps) to/from treasury accounts.
            - Average transaction size: 50,000.00 to 500,000.00.
            """)

        if st.button("🚀 Generate Batch Files"):
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
                current_op_bal = 50000.00
                
                for file_idx in range(num_files):
                    stmt_date = start_date + datetime.timedelta(days=file_idx)
                    stmt_date_str = stmt_date.strftime("%Y-%m-%d")
                    cre_dt = f"{stmt_date_str}T18:00:00"
                    
                    # Generate transactions based on scenario
                    txs = []
                    num_txs = 0
                    if "Daily Retail Sweep" in scenario:
                        num_txs = random.randint(15, 30)
                    elif "Corporate Payroll Run" in scenario:
                        num_txs = random.randint(5, 10)
                    elif "End-of-Month Reconciliation" in scenario:
                        num_txs = random.randint(10, 20)
                    else:
                        num_txs = random.randint(2, 5)
                        
                    for tx_idx in range(num_txs):
                        if "Daily Retail Sweep" in scenario:
                            is_crdt = random.random() < 0.15
                            amt = round(random.uniform(5.00, 150.00), 2)
                            counterparty = random.choice(["Supermarket", "Gas Station", "Online Retailer", "Coffee Shop", "Gym"])
                            ustrd = f"Card payment at {counterparty}"
                        elif "Corporate Payroll Run" in scenario:
                            is_crdt = False
                            amt = round(random.uniform(1500.00, 8500.00), 2)
                            counterparty = f"Employee {random.randint(100, 999)}"
                            ustrd = f"Salary payment {stmt_date.strftime('%B %Y')}"
                        elif "End-of-Month Reconciliation" in scenario:
                            is_crdt = random.random() < 0.5
                            amt = round(random.uniform(500.00, 12000.00), 2)
                            counterparty = random.choice(["Supplier Corp", "Client Ltd", "Tax Authority", "Logistics Partner"])
                            ustrd = f"Invoice INV-{random.randint(10000, 99999)}"
                        else:
                            is_crdt = random.random() < 0.5
                            amt = round(random.uniform(50000.00, 500000.00), 2)
                            counterparty = "Treasury Pool Account"
                            ustrd = "Zero-balance sweep transfer"
                            
                        dbit_crdt = "CRDT" if is_crdt else "DBIT"
                        txs.append({
                            "amt": amt,
                            "dbit_crdt": dbit_crdt,
                            "booking_date": stmt_date_str,
                            "val_date": stmt_date_str,
                            "ref": f"E2E-{stmt_date.strftime('%Y%m%d')}-{tx_idx:03d}",
                            "counterparty": counterparty,
                            "ustrd": ustrd
                        })
                    
                    # Calculate closing balance
                    total_crdt = sum(t['amt'] for t in txs if t['dbit_crdt'] == 'CRDT')
                    total_dbit = sum(t['amt'] for t in txs if t['dbit_crdt'] == 'DBIT')
                    cl_bal = current_op_bal + total_crdt - total_dbit
                    
                    # Generate XML content
                    msg_id = f"MSG-{stmt_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
                    stmt_id = f"STMT-{stmt_date.strftime('%Y%m%d')}-01"
                    
                    xml_content = create_camt053_xml(
                        msg_id=msg_id,
                        stmt_id=stmt_id,
                        cre_dt=cre_dt,
                        iban=base_iban,
                        bic=base_bic,
                        currency=currency,
                        op_bal=current_op_bal,
                        cl_bal=cl_bal,
                        txs=txs
                    )
                    
                    # Add to ZIP
                    zip_file.writestr(f"camt_053_{stmt_id}.xml", xml_content)
                    
                    # Next statement's opening balance is this statement's closing balance
                    current_op_bal = cl_bal
            
            zip_buffer.seek(0)
            st.success(f"Successfully generated {num_files} CAMT.053 statement files!")
            
            st.download_button(
                label="📥 Download Batch ZIP File",
                data=zip_buffer,
                file_name=f"camt053_batch_{datetime.date.today().strftime('%Y%m%d')}.zip",
                mime="application/zip"
            )

# ==========================================
# APP 3: RULE-BASED SYNTHESIZER
# ==========================================
elif app_mode == "3. Rule-Based Synthesizer":
    st.title("🧬 Rule-Based Synthesizer")
    st.markdown("Define custom generation rules to synthesize highly realistic mock statements for testing reconciliation engines.")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Define Synthesis Rules")
        
        num_txs = st.slider("Total Transactions to Synthesize", 5, 100, 20)
        crdt_ratio = st.slider("Percentage of Credit (Incoming) Transactions", 0, 100, 40)
        
        st.markdown("**Amount Range**")
        min_amt = st.number_input("Minimum Amount", value=10.00, step=5.0)
        max_amt = st.number_input("Maximum Amount", value=5000.00, step=50.0)
        
        st.markdown("**Counterparties & Remittance Rules**")
        counterparties_input = st.text_area(
            "Allowed Counterparties (Comma-separated)",
            "Global Logistics, Power Grid Corp, Cloud Services Inc, Office Depot, Tax Office, Staff Payroll, Retail Customer A, Retail Customer B"
        )
        remittance_keywords = st.text_area(
            "Allowed Remittance Keywords (Comma-separated)",
            "Invoice payment, Monthly subscription, Reimbursement, Service fee, Tax settlement, Utility bill, Support contract"
        )
        
        iban = st.text_input("Target Account IBAN", generate_random_iban())
        bic = st.text_input("Target Bank BIC", generate_random_bic())
        currency = st.selectbox("Currency", ["EUR", "USD", "GBP"], index=0)

    with col2:
        st.subheader("Synthesized Statement Output")
        
        if st.button("⚡ Synthesize Statement"):
            # Parse inputs
            cps = [c.strip() for c in counterparties_input.split(",") if c.strip()]
            kws = [k.strip() for k in remittance_keywords.split(",") if k.strip()]
            
            if not cps:
                cps = ["Generic Counterparty"]
            if not kws:
                kws = ["Generic Payment Reference"]
                
            txs = []
            op_bal = 25000.00
            current_date = datetime.date.today()
            
            for i in range(num_txs):
                is_crdt = random.randint(1, 100) <= crdt_ratio
                dbit_crdt = "CRDT" if is_crdt else "DBIT"
                amt = round(random.uniform(min_amt, max_amt), 2)
                
                # Randomly pick counterparty and keyword
                cp = random.choice(cps)
                kw = random.choice(kws)
                ref_num = random.randint(10000, 99999)
                
                txs.append({
                    "amt": amt,
                    "dbit_crdt": dbit_crdt,
                    "booking_date": current_date.strftime("%Y-%m-%d"),
                    "val_date": current_date.strftime("%Y-%m-%d"),
                    "ref": f"SYN-{ref_num}",
                    "counterparty": cp,
                    "ustrd": f"{kw} #{ref_num}"
                })
                
            # Calculate closing balance
            total_crdt = sum(t['amt'] for t in txs if t['dbit_crdt'] == 'CRDT')
            total_dbit = sum(t['amt'] for t in txs if t['dbit_crdt'] == 'DBIT')
            cl_bal = op_bal + total_crdt - total_dbit
            
            # Generate XML
            msg_id = f"SYN-MSG-{random.randint(100000, 999999)}"
            stmt_id = f"SYN-STMT-{random.randint(100000, 999999)}"
            cre_dt = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            
            xml_output = create_camt053_xml(
                msg_id=msg_id,
                stmt_id=stmt_id,
                cre_dt=cre_dt,
                iban=iban,
                bic=bic,
                currency=currency,
                op_bal=op_bal,
                cl_bal=cl_bal,
                txs=txs
            )
            
            # Display metrics
            m_col1, m_col2, m_col3 = st.columns(3)
            m_col1.metric("Total Credits", f"{total_crdt:,.2f} {currency}")
            m_col2.metric("Total Debits", f"{total_dbit:,.2f} {currency}")
            m_col3.metric("Final Balance", f"{cl_bal:,.2f} {currency}")
            
            # Display synthesized transactions table
            df_syn = pd.DataFrame(txs)
            st.dataframe(df_syn, use_container_width=True)
            
            st.code(xml_output[:1500] + "\n\n<!-- ... [XML Truncated for Preview] ... -->", language="xml")
            
            st.download_button(
                label="📥 Download Synthesized CAMT.053 XML",
                data=xml_output,
                file_name=f"synthesized_camt053_{stmt_id}.xml",
                mime="application/xml"
            )

# ==========================================
# APP 4: STATEMENT INSPECTOR & VALIDATOR
# ==========================================
elif app_mode == "4. Statement Inspector & Validator":
    st.title("🔍 Statement Inspector & Validator")
    st.markdown("Upload any CAMT.053 XML file to validate its structure, check balance math, and inspect transactions.")

    uploaded_file = st.file_uploader("Upload CAMT.053 XML File", type=["xml"])
    
    # Provide a sample file option if no file is uploaded
    use_sample = st.checkbox("Use a pre-generated sample CAMT.053 file for testing")
    
    xml_content = None
    if uploaded_file is not None:
        xml_content = uploaded_file.read().decode("utf-8")
    elif use_sample:
        # Generate a quick sample
        sample_txs = [
            {"amt": 2500.00, "dbit_crdt": "CRDT", "booking_date": "2023-10-25", "val_date": "2023-10-25", "ref": "REF-001", "counterparty": "Employer Corp", "ustrd": "Monthly Salary"},
            {"amt": 120.50, "dbit_crdt": "DBIT", "booking_date": "2023-10-26", "val_date": "2023-10-26", "ref": "REF-002", "counterparty": "Supermarket", "ustrd": "Weekly groceries"},
            {"amt": 45.00, "dbit_crdt": "DBIT", "booking_date": "2023-10-27", "val_date": "2023-10-27", "ref": "REF-003", "counterparty": "Streaming Service", "ustrd": "Annual subscription"}
        ]
        xml_content = create_camt053_xml(
            msg_id="MSG-SAMPLE-12345",
            stmt_id="STMT-SAMPLE-12345",
            cre_dt="2023-10-27T12:00:00",
            iban="DE89370400440532013000",
            bic="DBKADEFFXXX",
            currency="EUR",
            op_bal=1000.00,
            cl_bal=3334.50,
            txs=sample_txs
        )
        st.info("Using sample CAMT.053 statement.")

    if xml_content:
        parsed_data = parse_camt053_xml(xml_content)
        
        if parsed_data["success"]:
            st.success("✅ XML Parsed Successfully!")
            
            # Display Metadata
            col1, col2, col3, col4 = st.columns(4)
            col1.metric("Account IBAN", parsed_data["iban"])
            col2.metric("Bank BIC", parsed_data["bic"])
            col3.metric("Message ID", parsed_data["msg_id"])
            col4.metric("Creation Date", parsed_data["cre_dt"])
            
            # Balance Validation
            st.subheader("Balance Validation & Math Check")
            
            op_bal = parsed_data["op_bal"]
            cl_bal = parsed_data["cl_bal"]
            txs = parsed_data["transactions"]
            currency = parsed_data["currency"]
            
            total_credits = sum(tx["Amount"] for tx in txs if tx["Amount"] > 0)
            total_debits = sum(abs(tx["Amount"]) for tx in txs if tx["Amount"] < 0)
            calculated_cl_bal = op_bal + total_credits - total_debits
            
            math_ok = abs(calculated_cl_bal - cl_bal) < 0.01
            
            v_col1, v_col2, v_col3, v_col4 = st.columns(4)
            v_col1.metric("Reported Opening Balance", f"{op_bal:,.2f} {currency}")
            v_col2.metric("Reported Closing Balance", f"{cl_bal:,.2f} {currency}")
            v_col3.metric("Calculated Closing Balance", f"{calculated_cl_bal:,.2f} {currency}")
            
            if math_ok:
                v_col4.markdown("<div style='padding:10px; background-color:#d4edda; color:#155724; border-radius:5px; text-align:center; font-weight:bold;'>✅ Balance Math Matches!</div>", unsafe_view_id=True)
            else:
                v_col4.markdown("<div style='padding:10px; background-color:#f8d7da; color:#721c24; border-radius:5px; text-align:center; font-weight:bold;'>❌ Balance Math Mismatch!</div>", unsafe_view_id=True)
                st.error(f"Warning: The reported closing balance ({cl_bal}) does not match the calculated closing balance ({calculated_cl_bal}) based on the transaction entries.")

            # Transactions Table
            st.subheader("Parsed Transaction Entries")
            if txs:
                df_parsed = pd.DataFrame(txs)
                st.dataframe(df_parsed, use_container_width=True)
                
                # Download parsed data as CSV
                csv_buffer = io.StringIO()
                df_parsed.to_csv(csv_buffer, index=False)
                st.download_button(
                    label="📥 Export Parsed Transactions to CSV",
                    data=csv_buffer.getvalue(),
                    file_name=f"parsed_camt053_txs_{parsed_data['stmt_id'] if 'stmt_id' in parsed_data else 'export'}.csv",
                    mime="text/csv"
                )
            else:
                st.info("No transaction entries found in this statement.")
                
            # Raw XML Viewer
            with st.expander("View Raw XML Content"):
                st.code(xml_content, language="xml")
        else:
            st.error(f"Failed to parse CAMT.053 XML: {parsed_data['error']}")