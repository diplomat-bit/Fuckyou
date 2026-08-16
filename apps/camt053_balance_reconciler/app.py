import streamlit as st
import pandas as pd
import xml.etree.ElementTree as ET
import re
import io
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# Set page configuration
st.set_page_config(
    page_title="CAMT.053 Balance Reconciler Suite",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .reportview-container {
        background: #f5f7f9;
    }
    .card {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }
    .metric-label {
        font-size: 0.9rem;
        color: #6c757d;
        font-weight: 500;
    }
    .metric-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: #1e293b;
    }
    .status-match {
        color: #10b981;
        font-weight: bold;
        background-color: #ecfdf5;
        padding: 4px 8px;
        border-radius: 4px;
    }
    .status-mismatch {
        color: #ef4444;
        font-weight: bold;
        background-color: #fef2f2;
        padding: 4px 8px;
        border-radius: 4px;
    }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------

def strip_namespace(xml_str):
    """Removes namespaces from XML string to simplify parsing."""
    # Remove xmlns declarations
    xml_str = re.sub(r'\sxmlns[^"\'\s]*="[^"\']*"', '', xml_str)
    xml_str = re.sub(r'\sxmlns[^"\'\s]*=\'[^\'\s]*\'', '', xml_str)
    # Remove namespace prefixes from tags (e.g., <ns2:Document> -> <Document>)
    xml_str = re.sub(r'<[a-zA-Z0-9_]+:([a-zA-Z0-9_]+)', r'<\1', xml_str)
    xml_str = re.sub(r'</[a-zA-Z0-9_]+:([a-zA-Z0-9_]+)', r'</\1', xml_str)
    return xml_str

def parse_camt053(xml_content):
    """Parses CAMT.053 XML content and extracts statements and transactions."""
    try:
        xml_clean = strip_namespace(xml_content)
        root = ET.fromstring(xml_clean)
    except Exception as e:
        raise ValueError(f"Invalid XML format: {str(e)}")
    
    statements = []
    # Find all Stmt elements
    stmts = root.findall('.//Stmt')
    if not stmts:
        stmts = root.findall('.//BkToCstmrStmt/Stmt')
        
    for stmt in stmts:
        stmt_id = stmt.findtext('Id', 'N/A')
        cre_dt_tm = stmt.findtext('CreDtTm', 'N/A')
        
        # Account Info
        acct = stmt.find('Acct')
        iban = 'N/A'
        if acct is not None:
            iban_elem = acct.find('.//IBAN')
            if iban_elem is not None:
                iban = iban_elem.text
            else:
                othr_id = acct.find('.//Othr/Id')
                if othr_id is not None:
                    iban = othr_id.text
        
        # Balances
        balances = stmt.findall('Bal')
        op_bal = 0.0
        cl_bal = 0.0
        op_bal_ind = 'CRDT'
        cl_bal_ind = 'CRDT'
        op_date = 'N/A'
        cl_date = 'N/A'
        currency = 'EUR'
        
        for bal in balances:
            tp = bal.find('.//Tp/CdOrPrtry/Cd')
            if tp is not None:
                tp_val = tp.text
                amt_elem = bal.find('Amt')
                if amt_elem is not None:
                    amt = float(amt_elem.text)
                    currency = amt_elem.get('Ccy', currency)
                    ind = bal.findtext('CdtDbtInd', 'CRDT')
                    
                    # Date
                    dt_elem = bal.find('.//Dt/Dt')
                    dt_val = dt_elem.text if dt_elem is not None else 'N/A'
                    
                    if tp_val in ['OPBD', 'PRCD']:  # Opening Booked or Previous Closing Booked
                        op_bal = amt
                        op_bal_ind = ind
                        op_date = dt_val
                    elif tp_val in ['CLBD', 'ITBD']:  # Closing Booked or Interim Booked
                        cl_bal = amt
                        cl_bal_ind = ind
                        cl_date = dt_val
        
        # Transactions
        entries = []
        ntries = stmt.findall('Ntry')
        for ntry in ntries:
            amt_elem = ntry.find('Amt')
            amt = float(amt_elem.text) if amt_elem is not None else 0.0
            ccy = amt_elem.get('Ccy', currency) if amt_elem is not None else currency
            ind = ntry.findtext('CdtDbtInd', 'CRDT')
            status = ntry.findtext('Sts', 'BOOK')
            booking_dt = ntry.findtext('.//BookgDt/Dt', 'N/A')
            if booking_dt == 'N/A':
                booking_dt = ntry.findtext('.//BookgDt/DtTm', 'N/A')
                if booking_dt != 'N/A':
                    booking_dt = booking_dt[:10]  # Keep only date part
            
            val_dt = ntry.findtext('.//ValDt/Dt', 'N/A')
            
            # References
            ref = ntry.findtext('.//AcctSvcrRef', 'N/A')
            if ref == 'N/A':
                ref = ntry.findtext('.//EndToEndId', 'N/A')
            
            # Tx details / Remittance Info
            rem_info = ntry.findtext('.//RmtInf/Ustrd', 'N/A')
            
            # Counterparty
            prop_name = ntry.findtext('.//RltdPties/Dbtr/Nm', 'N/A')
            if prop_name == 'N/A':
                prop_name = ntry.findtext('.//RltdPties/Cdtr/Nm', 'N/A')
            
            entries.append({
                'Amount': amt,
                'Currency': ccy,
                'Indicator': ind,
                'Status': status,
                'BookingDate': booking_dt,
                'ValueDate': val_dt,
                'Reference': ref,
                'Counterparty': prop_name,
                'Details': rem_info
            })
        
        statements.append({
            'StatementID': stmt_id,
            'CreationDateTime': cre_dt_tm,
            'IBAN': iban,
            'Currency': currency,
            'OpeningBalance': op_bal,
            'OpeningIndicator': op_bal_ind,
            'OpeningDate': op_date,
            'ClosingBalance': cl_bal,
            'ClosingIndicator': cl_bal_ind,
            'ClosingDate': cl_date,
            'Entries': entries
        })
    return statements

def calculate_reconciliation(stmt):
    """Calculates expected closing balance and checks for discrepancies."""
    op_mult = 1 if stmt['OpeningIndicator'] == 'CRDT' else -1
    cl_mult = 1 if stmt['ClosingIndicator'] == 'CRDT' else -1
    
    signed_op = stmt['OpeningBalance'] * op_mult
    signed_cl = stmt['ClosingBalance'] * cl_mult
    
    total_credits = 0.0
    total_debits = 0.0
    
    for entry in stmt['Entries']:
        if entry['Indicator'] == 'CRDT':
            total_credits += entry['Amount']
        else:
            total_debits += entry['Amount']
            
    expected_cl = signed_op + total_credits - total_debits
    discrepancy = signed_cl - expected_cl
    
    return {
        'SignedOpening': signed_op,
        'SignedClosing': signed_cl,
        'TotalCredits': total_credits,
        'TotalDebits': total_debits,
        'ExpectedClosing': expected_cl,
        'Discrepancy': round(discrepancy, 2),
        'IsReconciled': abs(discrepancy) < 0.01
    }

def generate_sample_xml(reconciled=True):
    """Generates a sample CAMT.053 XML string for testing."""
    mismatch_offset = 0.0 if reconciled else 150.00
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>MSG20231027001</MsgId>
      <CreDtTm>2023-10-27T15:30:00Z</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>STMT-2023-0042</Id>
      <CreDtTm>2023-10-27T15:30:00Z</CreDtTm>
      <Acct>
        <Id>
          <IBAN>NL99ABNA0123456789</IBAN>
        </Id>
        <Ccy>EUR</Ccy>
      </Acct>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>OPBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="EUR">10000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt>
          <Dt>2023-10-01</Dt>
        </Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">1500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-10-05</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-10-05</Dt>
        </ValDt>
        <AcctSvcrRef>REF-TX-001</AcctSvcrRef>
        <RltdPties>
          <Dbtr>
            <Nm>ACME Corp</Nm>
          </Dbtr>
        </RltdPties>
        <RmtInf>
          <Ustrd>Invoice 10244 payment</Ustrd>
        </RmtInf>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">450.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-10-12</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-10-12</Dt>
        </ValDt>
        <AcctSvcrRef>REF-TX-002</AcctSvcrRef>
        <RltdPties>
          <Cdtr>
            <Nm>Global Utilities Ltd</Nm>
          </Cdtr>
        </RltdPties>
        <RmtInf>
          <Ustrd>Electricity Bill Oct 2023</Ustrd>
        </RmtInf>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">2300.50</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-10-20</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-10-20</Dt>
        </ValDt>
        <AcctSvcrRef>REF-TX-003</AcctSvcrRef>
        <RltdPties>
          <Dbtr>
            <Nm>John Doe Consulting</Nm>
          </Dbtr>
        </RltdPties>
        <RmtInf>
          <Ustrd>Project Milestone 2</Ustrd>
        </RmtInf>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">1200.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>2023-10-25</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2023-10-25</Dt>
        </ValDt>
        <AcctSvcrRef>REF-TX-004</AcctSvcrRef>
        <RltdPties>
          <Cdtr>
            <Nm>Office Supplies Inc</Nm>
          </Cdtr>
        </RltdPties>
        <RmtInf>
          <Ustrd>New Ergonomic Chairs</Ustrd>
        </RmtInf>
      </Ntry>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>CLBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="EUR">{12150.50 + mismatch_offset:.2f}</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt>
          <Dt>2023-10-27</Dt>
        </Dt>
      </Bal>
    </Stmt>
  </BkToCstmrStmt>
</Document>
"""

# -----------------------------------------------------------------------------
# SIDEBAR NAVIGATION
# -----------------------------------------------------------------------------

st.sidebar.title("🏦 CAMT.053 Suite")
st.sidebar.markdown("Select one of the 4 integrated applications below:")

app_mode = st.sidebar.radio(
    "Choose Application",
    [
        "1. Single Statement Reconciler",
        "2. Batch Statement Reconciler",
        "3. Manual Entry Sandbox",
        "4. Schema & XPath Explorer"
    ]
)

st.sidebar.markdown("---")
st.sidebar.subheader("Quick Actions")
if st.sidebar.button("Download Sample XML (Reconciled)"):
    st.sidebar.download_button(
        label="Click to Save Reconciled XML",
        data=generate_sample_xml(reconciled=True),
        file_name="camt053_reconciled_sample.xml",
        mime="text/xml"
    )
if st.sidebar.button("Download Sample XML (Mismatch)"):
    st.sidebar.download_button(
        label="Click to Save Mismatch XML",
        data=generate_sample_xml(reconciled=False),
        file_name="camt053_mismatch_sample.xml",
        mime="text/xml"
    )

st.sidebar.markdown("---")
st.sidebar.info(
    "**About CAMT.053**\n\n"
    "The CAMT.053 XML format is the ISO 20022 standard for Bank-to-Customer Statement reporting, "
    "providing detailed transactional activity and balance updates."
)

# -----------------------------------------------------------------------------
# APP 1: SINGLE STATEMENT RECONCILER
# -----------------------------------------------------------------------------

if app_mode == "1. Single Statement Reconciler":
    st.title("🔍 Single Statement Reconciler")
    st.markdown("Upload a single CAMT.053 XML file to parse, analyze, and reconcile its balances against transaction entries.")
    
    uploaded_file = st.file_uploader("Upload CAMT.053 XML File", type=["xml"])
    
    # Use sample if no file uploaded
    use_sample = st.checkbox("Use Sample Reconciled Statement instead")
    
    xml_data = None
    if uploaded_file is not None:
        xml_data = uploaded_file.read().decode("utf-8")
    elif use_sample:
        xml_data = generate_sample_xml(reconciled=True)
        
    if xml_data:
        try:
            statements = parse_camt053(xml_data)
            
            if not statements:
                st.error("No statement data found in the XML file.")
            else:
                # Handle multiple statements in a single file
                if len(statements) > 1:
                    stmt_options = {f"Statement {s['StatementID']} ({s['IBAN']})": idx for idx, s in enumerate(statements)}
                    selected_stmt_name = st.selectbox("Select Statement to Analyze", list(stmt_options.keys()))
                    stmt_idx = stmt_options[selected_stmt_name]
                else:
                    stmt_idx = 0
                    
                stmt = statements[stmt_idx]
                recon = calculate_reconciliation(stmt)
                
                # Metadata Header
                st.markdown("### 📋 Statement Metadata")
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("Statement ID", stmt['StatementID'])
                with col2:
                    st.metric("Account IBAN", stmt['IBAN'])
                with col3:
                    st.metric("Currency", stmt['Currency'])
                with col4:
                    st.metric("Creation Date", stmt['CreationDateTime'][:10])
                
                # Reconciliation Status Card
                st.markdown("### ⚖️ Reconciliation Status")
                
                if recon['IsReconciled']:
                    st.success(f"🎉 **Reconciliation Successful!** All transaction entries perfectly match the opening and closing balances.")
                else:
                    st.error(f"⚠️ **Reconciliation Failed!** There is a discrepancy of **{recon['Discrepancy']:.2f} {stmt['Currency']}** between the transactions and the reported closing balance.")
                
                # Balance Breakdown Metrics
                col_b1, col_b2, col_b3, col_b4, col_b5 = st.columns(5)
                with col_b1:
                    st.metric("Opening Balance", f"{recon['SignedOpening']:.2f} {stmt['Currency']}")
                with col_b2:
                    st.metric("Total Credits (+)", f"{recon['TotalCredits']:.2f} {stmt['Currency']}", delta_color="normal")
                with col_b3:
                    st.metric("Total Debits (-)", f"-{recon['TotalDebits']:.2f} {stmt['Currency']}", delta_color="inverse")
                with col_b4:
                    st.metric("Expected Closing", f"{recon['ExpectedClosing']:.2f} {stmt['Currency']}")
                with col_b5:
                    st.metric("Actual Closing", f"{recon['SignedClosing']:.2f} {stmt['Currency']}", 
                              delta=f"{recon['Discrepancy']:.2f}" if recon['Discrepancy'] != 0 else None,
                              delta_color="inverse" if recon['Discrepancy'] != 0 else "normal")
                
                # Visualizations
                st.markdown("### 📊 Financial Insights")
                v_col1, v_col2 = st.columns([2, 1])
                
                # Prepare transaction dataframe
                df_entries = pd.DataFrame(stmt['Entries'])
                
                with v_col1:
                    # Cumulative Balance Chart
                    if not df_entries.empty:
                        df_sorted = df_entries.sort_values('BookingDate').copy()
                        running_bal = recon['SignedOpening']
                        balances_over_time = []
                        
                        # Add starting point
                        balances_over_time.append({
                            'Date': stmt['OpeningDate'],
                            'Balance': running_bal,
                            'Type': 'Opening Balance',
                            'Reference': 'START'
                        })
                        
                        for _, row in df_sorted.iterrows():
                            if row['Indicator'] == 'CRDT':
                                running_bal += row['Amount']
                            else:
                                running_bal -= row['Amount']
                            balances_over_time.append({
                                'Date': row['BookingDate'],
                                'Balance': running_bal,
                                'Type': 'Credit' if row['Indicator'] == 'CRDT' else 'Debit',
                                'Reference': row['Reference']
                            })
                            
                        df_chart = pd.DataFrame(balances_over_time)
                        fig = px.line(
                            df_chart, 
                            x='Date', 
                            y='Balance', 
                            title="Cumulative Balance Progression",
                            markers=True,
                            hover_data=['Type', 'Reference']
                        )
                        fig.update_layout(template="plotly_white")
                        st.plotly_chart(fig, use_container_width=True)
                    else:
                        st.info("No transactions to plot cumulative balance.")
                        
                with v_col2:
                    # Credit vs Debit Pie Chart
                    if not df_entries.empty:
                        fig_pie = px.pie(
                            values=[recon['TotalCredits'], recon['TotalDebits']],
                            names=['Total Credits', 'Total Debits'],
                            color=['Total Credits', 'Total Debits'],
                            color_discrete_map={'Total Credits': '#10b981', 'Total Debits': '#ef4444'},
                            title="Volume Breakdown"
                        )
                        st.plotly_chart(fig_pie, use_container_width=True)
                    else:
                        st.info("No transactions to plot breakdown.")
                
                # Transaction Table
                st.markdown("### 🧾 Transaction Entries")
                if not df_entries.empty:
                    # Format table for display
                    df_display = df_entries.copy()
                    df_display['Amount'] = df_display.apply(
                        lambda r: f"+{r['Amount']:.2f}" if r['Indicator'] == 'CRDT' else f"-{r['Amount']:.2f}", axis=1
                    )
                    st.dataframe(df_display, use_container_width=True)
                    
                    # Download CSV
                    csv = df_entries.to_csv(index=False).encode('utf-8')
                    st.download_button(
                        label="📥 Download Transactions as CSV",
                        data=csv,
                        file_name=f"transactions_{stmt['StatementID']}.csv",
                        mime="text/csv"
                    )
                else:
                    st.warning("No transaction entries found in this statement.")
                    
        except Exception as e:
            st.error(f"An error occurred while parsing the file: {str(e)}")

# -----------------------------------------------------------------------------
# APP 2: BATCH STATEMENT RECONCILER
# -----------------------------------------------------------------------------

elif app_mode == "2. Batch Statement Reconciler":
    st.title("🗂️ Batch Statement Reconciler")
    st.markdown("Upload multiple CAMT.053 XML files to perform bulk reconciliation and generate a consolidated compliance report.")
    
    uploaded_files = st.file_uploader("Upload Multiple CAMT.053 XML Files", type=["xml"], accept_multiple_files=True)
    
    if uploaded_files:
        batch_results = []
        total_files = len(uploaded_files)
        reconciled_count = 0
        mismatch_count = 0
        
        progress_bar = st.progress(0)
        
        for idx, file in enumerate(uploaded_files):
            try:
                content = file.read().decode("utf-8")
                statements = parse_camt053(content)
                
                for stmt in statements:
                    recon = calculate_reconciliation(stmt)
                    status = "Reconciled" if recon['IsReconciled'] else "Mismatch"
                    
                    if recon['IsReconciled']:
                        reconciled_count += 1
                    else:
                        mismatch_count += 1
                        
                    batch_results.append({
                        'File Name': file.name,
                        'Statement ID': stmt['StatementID'],
                        'IBAN': stmt['IBAN'],
                        'Currency': stmt['Currency'],
                        'Opening Balance': recon['SignedOpening'],
                        'Closing Balance': recon['SignedClosing'],
                        'Expected Closing': recon['ExpectedClosing'],
                        'Discrepancy': recon['Discrepancy'],
                        'Status': status,
                        'Tx Count': len(stmt['Entries'])
                    })
            except Exception as e:
                batch_results.append({
                    'File Name': file.name,
                    'Statement ID': 'ERROR',
                    'IBAN': 'N/A',
                    'Currency': 'N/A',
                    'Opening Balance': 0.0,
                    'Closing Balance': 0.0,
                    'Expected Closing': 0.0,
                    'Discrepancy': 0.0,
                    'Status': f"Error: {str(e)[:30]}",
                    'Tx Count': 0
                })
            progress_bar.progress((idx + 1) / total_files)
            
        df_batch = pd.DataFrame(batch_results)
        
        # Batch Summary Metrics
        st.markdown("### 📊 Batch Summary")
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Statements Processed", len(df_batch))
        with col2:
            st.metric("Successfully Reconciled", reconciled_count, delta=f"{reconciled_count/len(df_batch)*100:.1f}%" if len(df_batch) > 0 else None)
        with col3:
            st.metric("Mismatches Detected", mismatch_count, delta=f"-{mismatch_count}" if mismatch_count > 0 else None, delta_color="inverse")
        with col4:
            total_txs = df_batch['Tx Count'].sum()
            st.metric("Total Transactions Audited", int(total_txs))
            
        # Visual Breakdown
        st.markdown("### 📈 Batch Insights")
        b_col1, b_col2 = st.columns(2)
        with b_col1:
            fig_status = px.pie(
                df_batch, 
                names='Status', 
                title="Reconciliation Status Distribution",
                color='Status',
                color_discrete_map={'Reconciled': '#10b981', 'Mismatch': '#ef4444'}
            )
            st.plotly_chart(fig_status, use_container_width=True)
        with b_col2:
            fig_tx = px.bar(
                df_batch, 
                x='Statement ID', 
                y='Tx Count', 
                color='Status',
                title="Transaction Count per Statement",
                color_discrete_map={'Reconciled': '#10b981', 'Mismatch': '#ef4444'}
            )
            st.plotly_chart(fig_tx, use_container_width=True)
            
        # Detailed Batch Table
        st.markdown("### 📋 Detailed Batch Report")
        
        # Highlight mismatches in the table
        def highlight_status(val):
            if val == "Reconciled":
                return 'background-color: #ecfdf5; color: #10b981; font-weight: bold;'
            elif "Error" in val or val == "Mismatch":
                return 'background-color: #fef2f2; color: #ef4444; font-weight: bold;'
            return ''
            
        styled_df = df_batch.style.applymap(highlight_status, subset=['Status'])
        st.dataframe(styled_df, use_container_width=True)
        
        # Export Batch Report
        csv_batch = df_batch.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Consolidated Batch Report (CSV)",
            data=csv_batch,
            file_name="camt053_batch_reconciliation_report.csv",
            mime="text/csv"
        )
    else:
        st.info("Please upload one or more CAMT.053 XML files to begin batch processing.")

# -----------------------------------------------------------------------------
# APP 3: MANUAL ENTRY SANDBOX
# -----------------------------------------------------------------------------

elif app_mode == "3. Manual Entry Sandbox":
    st.title("🧪 Manual Entry Sandbox")
    st.markdown(
        "Don't have a CAMT.053 file? Simulate a statement reconciliation by manually entering "
        "opening/closing balances and adding transaction entries in the interactive table below."
    )
    
    col_setup1, col_setup2 = st.columns(2)
    
    with col_setup1:
        st.markdown("### 🏦 Statement Setup")
        currency = st.text_input("Currency Code", value="EUR")
        op_bal = st.number_input("Opening Balance Amount", value=5000.00, step=100.0)
        op_ind = st.selectbox("Opening Balance Indicator", ["CRDT (Credit/Positive)", "DBIT (Debit/Negative)"])
        
    with col_setup2:
        st.markdown("### 🏁 Target Closing")
        cl_bal = st.number_input("Target Closing Balance Amount", value=6200.00, step=100.0)
        cl_ind = st.selectbox("Closing Balance Indicator", ["CRDT (Credit/Positive)", "DBIT (Debit/Negative)"])
        
    st.markdown("### 🧾 Transaction Ledger")
    st.markdown("Add, edit, or delete transaction rows in the table below. The reconciliation status will update in real-time.")
    
    # Default transaction data
    default_txs = pd.DataFrame([
        {"Booking Date": "2023-10-01", "Reference": "TX-001", "Counterparty": "Client Alpha", "Amount": 1500.00, "Type": "Credit", "Details": "Consulting Fee"},
        {"Booking Date": "2023-10-05", "Reference": "TX-002", "Counterparty": "Office Depot", "Amount": 300.00, "Type": "Debit", "Details": "Stationery supplies"}
    ])
    
    # Interactive Data Editor
    edited_df = st.data_editor(
        default_txs,
        num_rows="dynamic",
        column_config={
            "Booking Date": st.column_config.DateColumn("Booking Date", required=True),
            "Reference": st.column_config.TextColumn("Reference", required=True),
            "Counterparty": st.column_config.TextColumn("Counterparty"),
            "Amount": st.column_config.NumberColumn("Amount", min_value=0.0, format="%.2f", required=True),
            "Type": st.column_config.SelectboxColumn("Type", options=["Credit", "Debit"], required=True),
            "Details": st.column_config.TextColumn("Details")
        },
        use_container_width=True
    )
    
    # Perform Sandbox Reconciliation
    signed_op = op_bal * (1 if "CRDT" in op_ind else -1)
    signed_cl = cl_bal * (1 if "CRDT" in cl_ind else -1)
    
    total_credits = 0.0
    total_debits = 0.0
    
    for _, row in edited_df.iterrows():
        if pd.isna(row['Amount']):
            continue
        if row['Type'] == "Credit":
            total_credits += float(row['Amount'])
        else:
            total_debits += float(row['Amount'])
            
    expected_cl = signed_op + total_credits - total_debits
    discrepancy = signed_cl - expected_cl
    is_reconciled = abs(discrepancy) < 0.01
    
    # Display Sandbox Results
    st.markdown("### ⚖️ Sandbox Reconciliation Results")
    
    if is_reconciled:
        st.success(f"🎉 **Reconciled!** The manual ledger perfectly balances to the target closing balance.")
    else:
        st.error(f"⚠️ **Mismatch!** Discrepancy of **{discrepancy:.2f} {currency}** detected.")
        
    col_res1, col_res2, col_res3, col_res4 = st.columns(4)
    with col_res1:
        st.metric("Opening Balance", f"{signed_op:.2f} {currency}")
    with col_res2:
        st.metric("Total Credits (+)", f"{total_credits:.2f} {currency}")
    with col_res3:
        st.metric("Total Debits (-)", f"-{total_debits:.2f} {currency}")
    with col_res4:
        st.metric("Expected Closing", f"{expected_cl:.2f} {currency}", delta=f"{discrepancy:.2f}" if discrepancy != 0 else None, delta_color="inverse")
        
    # Export Sandbox Statement to Mock CAMT.053 XML
    st.markdown("### 📤 Export Sandbox Data")
    
    # Generate mock XML based on sandbox inputs
    def generate_sandbox_xml():
        entries_xml = ""
        for idx, row in edited_df.iterrows():
            if pd.isna(row['Amount']):
                continue
            ind = "CRDT" if row['Type'] == "Credit" else "DBIT"
            entries_xml += f"""
          <Ntry>
            <Amt Ccy="{currency}">{row['Amount']:.2f}</Amt>
            <CdtDbtInd>{ind}</CdtDbtInd>
            <Sts>BOOK</Sts>
            <BookgDt>
              <Dt>{row['Booking Date']}</Dt>
            </BookgDt>
            <AcctSvcrRef>{row['Reference']}</AcctSvcrRef>
            <RltdPties>
              <Dbtr>
                <Nm>{row['Counterparty']}</Nm>
              </Dbtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>{row['Details']}</Ustrd>
            </RmtInf>
          </Ntry>"""
          
        mock_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>SANDBOX-MSG-{datetime.now().strftime('%Y%m%d%H%M%S')}</MsgId>
      <CreDtTm>{datetime.now().isoformat()}Z</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>SANDBOX-STMT-001</Id>
      <Acct>
        <Id>
          <IBAN>NL99SANDBOX1234567890</IBAN>
        </Id>
        <Ccy>{currency}</Ccy>
      </Acct>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>OPBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="{currency}">{op_bal:.2f}</Amt>
        <CdtDbtInd>{"CRDT" if "CRDT" in op_ind else "DBIT"}</CdtDbtInd>
      </Bal>{entries_xml}
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>CLBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="{currency}">{cl_bal:.2f}</Amt>
        <CdtDbtInd>{"CRDT" if "CRDT" in cl_ind else "DBIT"}</CdtDbtInd>
      </Bal>
    </Stmt>
  </BkToCstmrStmt>
</Document>"""
        return mock_xml

    col_exp1, col_exp2 = st.columns(2)
    with col_exp1:
        st.download_button(
            label="📥 Download Sandbox Ledger as CSV",
            data=edited_df.to_csv(index=False).encode('utf-8'),
            file_name="sandbox_ledger.csv",
            mime="text/csv",
            use_container_width=True
        )
    with col_exp2:
        st.download_button(
            label="📥 Download Sandbox as CAMT.053 XML",
            data=generate_sandbox_xml(),
            file_name="sandbox_camt053.xml",
            mime="text/xml",
            use_container_width=True
        )

# -----------------------------------------------------------------------------
# APP 4: SCHEMA & XPATH EXPLORER
# -----------------------------------------------------------------------------

elif app_mode == "4. Schema & XPath Explorer":
    st.title("🧩 Schema & XPath Explorer")
    st.markdown(
        "Inspect the raw XML structure of your CAMT.053 files, run custom XPath queries to extract "
        "specific data points, and learn about the ISO 20022 standard."
    )
    
    uploaded_file = st.file_uploader("Upload CAMT.053 XML File to Explore", type=["xml"])
    
    # Use sample if no file uploaded
    use_sample = st.checkbox("Use Sample Statement instead")
    
    xml_data = None
    if uploaded_file is not None:
        xml_data = uploaded_file.read().decode("utf-8")
    elif use_sample:
        xml_data = generate_sample_xml(reconciled=True)
        
    if xml_data:
        tab1, tab2, tab3 = st.tabs(["🔍 XPath Query Sandbox", "📄 Raw XML Viewer", "📚 CAMT.053 Schema Guide"])
        
        with tab1:
            st.markdown("### 🔎 XPath Query Sandbox")
            st.markdown(
                "Query the XML document directly using XPath expressions. Namespaces have been stripped "
                "for ease of querying (e.g., use `.//Ntry/Amt` instead of `.//ns:Ntry/ns:Amt`)."
            )
            
            xpath_query = st.text_input("Enter XPath Expression", value=".//Ntry/Amt")
            
            if xpath_query:
                try:
                    xml_clean = strip_namespace(xml_data)
                    root = ET.fromstring(xml_clean)
                    elements = root.findall(xpath_query)
                    
                    st.success(f"Found {len(elements)} matching elements.")
                    
                    results = []
                    for idx, elem in enumerate(elements):
                        attribs = str(elem.attrib) if elem.attrib else "None"
                        results.append({
                            "Match #": idx + 1,
                            "Tag": elem.tag,
                            "Text Value": elem.text.strip() if elem.text else "None",
                            "Attributes": attribs
                        })
                        
                    if results:
                        st.dataframe(pd.DataFrame(results), use_container_width=True)
                    else:
                        st.info("No text values or attributes found for the matching elements.")
                except Exception as e:
                    st.error(f"XPath Query Error: {str(e)}")
                    
        with tab2:
            st.markdown("### 📄 Raw XML Viewer")
            st.code(xml_data, language="xml")
            
        with tab3:
            st.markdown("### 📚 CAMT.053 Schema Guide")
            st.markdown("""
            The CAMT.053 statement is structured hierarchically. Below are the key elements and their meanings:
            
            *   **`<GrpHdr>` (Group Header):** Contains metadata about the message, such as Message ID (`<MsgId>`) and Creation Date/Time (`<CreDtTm>`).
            *   **`<Stmt>` (Statement):** Represents a single bank statement. A file can contain multiple statements.
                *   **`<Acct>` (Account):** Identifies the bank account (usually via `<IBAN>`).
                *   **`<Bal>` (Balance):** Holds balance information.
                    *   **`<Tp>` (Type):** Specifies the balance type:
                        *   `OPBD` (Opening Booked): The starting balance of the statement period.
                        *   `CLBD` (Closing Booked): The final balance of the statement period.
                        *   `PRCD` (Previous Closing Booked): Used by some banks instead of OPBD.
                    *   **`<Amt>` (Amount):** The balance amount (with a `Ccy` attribute for currency).
                    *   **`<CdtDbtInd>` (Credit/Debit Indicator):** `CRDT` for positive/credit balance, `DBIT` for negative/debit balance.
                *   **`<Ntry>` (Entry):** Represents an individual transaction entry.
                    *   **`<Amt>` (Amount):** Transaction amount.
                    *   **`<CdtDbtInd>` (Credit/Debit Indicator):** `CRDT` for incoming funds (Credit), `DBIT` for outgoing funds (Debit).
                    *   **`<BookgDt>` (Booking Date):** The date the transaction was officially booked.
                    *   **`<ValDt>` (Value Date):** The date interest/value begins to accrue.
                    *   **`<RltdPties>` (Related Parties):** Contains counterparty information (Debtor/Creditor names).
                    *   **`<RmtInf>` (Remittance Information):** Payment details or reference text (`<Ustrd>`).
            """)
    else:
        st.info("Please upload an XML file or select the sample checkbox to explore the schema.")