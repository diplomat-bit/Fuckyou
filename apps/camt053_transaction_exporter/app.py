import streamlit as st
import pandas as pd
import json
import io
import datetime
import random
import plotly.express as px
import plotly.graph_objects as go

# Set page configuration
st.set_page_config(
    page_title="CAMT.053 Transaction Exporter Suite",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- SAMPLE DATA GENERATOR FOR DEMO PURPOSES ---
def generate_sample_camt053_json():
    """Generates a realistic CAMT.053 JSON structure for testing."""
    now = datetime.datetime.now()
    sample_data = {
        "Document": {
            "BkToCstmrStmt": {
                "GrpHdr": {
                    "MsgId": f"MSG-{random.randint(100000, 999999)}",
                    "CreDtTm": now.isoformat(),
                    "InitgPty": {"Nm": "GLOBAL CORP SERVICES LTD"}
                },
                "Stmt": [
                    {
                        "Id": f"STMT-2023-{random.randint(100, 999)}",
                        "ElctrncSeqNb": 42,
                        "CreDtTm": now.isoformat(),
                        "Acct": {
                            "Id": {"IBAN": "NL89ABNA0417123456"},
                            "Ccy": "EUR",
                            "Nm": "Main Operating Account"
                        },
                        "Bal": [
                            {
                                "Tp": {"OPBD": {"Cd": "OPBD"}}, # Opening Booked
                                "Amt": {"Ccy": "EUR", "Value": 150230.45},
                                "Dt": {"Dt": (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d")},
                                "CdtDbtInd": "CRDT"
                            },
                            {
                                "Tp": {"CLBD": {"Cd": "CLBD"}}, # Closing Booked
                                "Amt": {"Ccy": "EUR", "Value": 162450.10},
                                "Dt": {"Dt": now.strftime("%Y-%m-%d")},
                                "CdtDbtInd": "CRDT"
                            }
                        ],
                        "Ntry": [
                            {
                                "NtryRef": "TX-2023-001",
                                "Amt": {"Ccy": "EUR", "Value": 12500.00},
                                "CdtDbtInd": "CRDT",
                                "Sts": "BOOK",
                                "BookgDt": {"Dt": now.strftime("%Y-%m-%d")},
                                "ValDt": {"Dt": now.strftime("%Y-%m-%d")},
                                "AcctSvcrRef": "ASR-99812",
                                "NtryDtls": {
                                    "TxDtls": {
                                        "Refs": {"EndToEndId": "E2E-992103"},
                                        "Amt": {"Ccy": "EUR", "Value": 12500.00},
                                        "RltdPties": {
                                            "Dbtr": {"Nm": "ACME INDUSTRIAL SUPPLIES"},
                                            "DbtrAcct": {"Id": {"IBAN": "DE89UTB0000112233"}}
                                        },
                                        "RmtInf": {"Ustrd": "INVOICE INV-2023-8891"}
                                    }
                                }
                            },
                            {
                                "NtryRef": "TX-2023-002",
                                "Amt": {"Ccy": "EUR", "Value": 450.35},
                                "CdtDbtInd": "DBIT",
                                "Sts": "BOOK",
                                "BookgDt": {"Dt": now.strftime("%Y-%m-%d")},
                                "ValDt": {"Dt": now.strftime("%Y-%m-%d")},
                                "AcctSvcrRef": "ASR-99813",
                                "NtryDtls": {
                                    "TxDtls": {
                                        "Refs": {"EndToEndId": "E2E-992104"},
                                        "Amt": {"Ccy": "EUR", "Value": 450.35},
                                        "RltdPties": {
                                            "Cdtr": {"Nm": "CLOUD HOSTING SOLUTIONS"},
                                            "CdtrAcct": {"Id": {"IBAN": "IE12IPMS3000112233"}}
                                        },
                                        "RmtInf": {"Ustrd": "OCTOBER HOSTING FEES"}
                                    }
                                }
                            },
                            {
                                "NtryRef": "TX-2023-003",
                                "Amt": {"Ccy": "EUR", "Value": 3200.00},
                                "CdtDbtInd": "CRDT",
                                "Sts": "BOOK",
                                "BookgDt": {"Dt": (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d")},
                                "ValDt": {"Dt": (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d")},
                                "AcctSvcrRef": "ASR-99814",
                                "NtryDtls": {
                                    "TxDtls": {
                                        "Refs": {"EndToEndId": "E2E-992105"},
                                        "Amt": {"Ccy": "EUR", "Value": 3200.00},
                                        "RltdPties": {
                                            "Dbtr": {"Nm": "DELTA CONSULTING GROUP"},
                                            "DbtrAcct": {"Id": {"IBAN": "FR76BNPA0000112233"}}
                                        },
                                        "RmtInf": {"Ustrd": "PROJECT MILESTONE 2"}
                                    }
                                }
                            },
                            {
                                "NtryRef": "TX-2023-004",
                                "Amt": {"Ccy": "EUR", "Value": 2530.00},
                                "CdtDbtInd": "DBIT",
                                "Sts": "BOOK",
                                "BookgDt": {"Dt": (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d")},
                                "ValDt": {"Dt": (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d")},
                                "AcctSvcrRef": "ASR-99815",
                                "NtryDtls": {
                                    "TxDtls": {
                                        "Refs": {"EndToEndId": "E2E-992106"},
                                        "Amt": {"Ccy": "EUR", "Value": 2530.00},
                                        "RltdPties": {
                                            "Cdtr": {"Nm": "OFFICE DEPOT"},
                                            "CdtrAcct": {"Id": {"IBAN": "NL44INGB0000112233"}}
                                        },
                                        "RmtInf": {"Ustrd": "OFFICE SUPPLIES AND FURNITURE"}
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    }
    return sample_data

# --- PARSING UTILITIES ---
def parse_camt053_json_to_df(json_data):
    """Parses CAMT.053 JSON structure into a flat pandas DataFrame."""
    rows = []
    try:
        doc = json_data.get("Document", {})
        stmt_list = doc.get("BkToCstmrStmt", {}).get("Stmt", [])
        if not isinstance(stmt_list, list):
            stmt_list = [stmt_list]
            
        for stmt in stmt_list:
            stmt_id = stmt.get("Id")
            acct_iban = stmt.get("Acct", {}).get("Id", {}).get("IBAN", "N/A")
            acct_ccy = stmt.get("Acct", {}).get("Ccy", "EUR")
            acct_nm = stmt.get("Acct", {}).get("Nm", "N/A")
            
            entries = stmt.get("Ntry", [])
            if not isinstance(entries, list):
                entries = [entries]
                
            for entry in entries:
                ntry_ref = entry.get("NtryRef", "N/A")
                raw_amt = float(entry.get("Amt", {}).get("Value", 0))
                indicator = entry.get("CdtDbtInd", "CRDT")
                # Apply sign based on Credit/Debit Indicator
                amt = raw_amt if indicator == "CRDT" else -raw_amt
                
                booking_dt = entry.get("BookgDt", {}).get("Dt", "N/A")
                val_dt = entry.get("ValDt", {}).get("Dt", "N/A")
                status = entry.get("Sts", "N/A")
                
                # Extract nested transaction details
                tx_dtls = entry.get("NtryDtls", {}).get("TxDtls", {})
                e2e_id = tx_dtls.get("Refs", {}).get("EndToEndId", "N/A")
                
                # Determine counterparty name and account
                related_parties = tx_dtls.get("RltdPties", {})
                counterparty_name = "N/A"
                counterparty_iban = "N/A"
                
                if indicator == "CRDT":
                    # If Credit, the sender is the Debtor
                    counterparty_name = related_parties.get("Dbtr", {}).get("Nm", "N/A")
                    counterparty_iban = related_parties.get("DbtrAcct", {}).get("Id", {}).get("IBAN", "N/A")
                else:
                    # If Debit, the receiver is the Creditor
                    counterparty_name = related_parties.get("Cdtr", {}).get("Nm", "N/A")
                    counterparty_iban = related_parties.get("CdtrAcct", {}).get("Id", {}).get("IBAN", "N/A")
                
                remittance_info = tx_dtls.get("RmtInf", {}).get("Ustrd", "N/A")
                
                rows.append({
                    "Statement ID": stmt_id,
                    "Account IBAN": acct_iban,
                    "Account Name": acct_nm,
                    "Currency": acct_ccy,
                    "Entry Reference": ntry_ref,
                    "End-to-End ID": e2e_id,
                    "Booking Date": booking_dt,
                    "Value Date": val_dt,
                    "Status": status,
                    "Direction": "Credit" if indicator == "CRDT" else "Debit",
                    "Amount": amt,
                    "Counterparty Name": counterparty_name,
                    "Counterparty IBAN": counterparty_iban,
                    "Remittance Info": remittance_info
                })
    except Exception as e:
        st.error(f"Error parsing CAMT.053 JSON: {str(e)}")
    
    return pd.DataFrame(rows)

# --- APP INITIALIZATION ---
if "camt_json" not in st.session_state:
    st.session_state["camt_json"] = generate_sample_camt053_json()

# --- SIDEBAR NAVIGATION ---
st.sidebar.title("💼 CAMT.053 Exporter Suite")
st.sidebar.markdown("Manage, analyze, and export your ISO 20022 CAMT.053 bank statement data.")

app_mode = st.sidebar.radio(
    "Select Sub-Application:",
    [
        "1. CAMT.053 Exporter & Converter",
        "2. Financial Analytics Dashboard",
        "3. ERP Integration & API Formatter",
        "4. Transaction Audit & Reconciliation"
    ]
)

st.sidebar.markdown("---")
st.sidebar.subheader("Data Source")
data_source = st.sidebar.radio("Choose Data Source:", ["Use Demo Data", "Upload CAMT.053 JSON"])

if data_source == "Upload CAMT.053 JSON":
    uploaded_file = st.sidebar.file_uploader("Upload JSON File", type=["json"])
    if uploaded_file is not None:
        try:
            st.session_state["camt_json"] = json.load(uploaded_file)
            st.sidebar.success("File uploaded successfully!")
        except Exception as e:
            st.sidebar.error(f"Invalid JSON file: {e}")
else:
    if st.sidebar.button("Regenerate Demo Data"):
        st.session_state["camt_json"] = generate_sample_camt053_json()
        st.sidebar.success("New demo data generated!")

# Parse current data
df_transactions = parse_camt053_json_to_df(st.session_state["camt_json"])

# ==========================================
# APP 1: CAMT.053 EXPORTER & CONVERTER
# ==========================================
if app_mode == "1. CAMT.053 Exporter & Converter":
    st.title("📥 CAMT.053 Exporter & Converter")
    st.markdown("Convert parsed CAMT.053 JSON bank statements into standard business formats like CSV, Excel, or clean JSON.")
    
    if df_transactions.empty:
        st.warning("No transaction data available. Please check your input data.")
    else:
        st.subheader("Transaction Preview")
        st.dataframe(df_transactions, use_container_width=True)
        
        col1, col2, col3 = st.columns(3)
        
        # CSV Export
        with col1:
            st.info("### Export to CSV")
            st.write("Standard comma-separated values format, compatible with almost all database and spreadsheet software.")
            csv_data = df_transactions.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="Download CSV",
                data=csv_data,
                file_name=f"camt053_export_{datetime.date.today()}.csv",
                mime="text/csv",
                use_container_width=True
            )
            
        # Excel Export
        with col2:
            st.info("### Export to Excel")
            st.write("Formatted Excel spreadsheet with auto-adjusted column widths and native numeric formats.")
            
            # Create Excel in memory
            excel_buffer = io.BytesIO()
            with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                df_transactions.to_excel(writer, index=False, sheet_name="Transactions")
            excel_data = excel_buffer.getvalue()
            
            st.download_button(
                label="Download Excel (.xlsx)",
                data=excel_data,
                file_name=f"camt053_export_{datetime.date.today()}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                use_container_width=True
            )
            
        # JSON Export (Flattened)
        with col3:
            st.info("### Export Flattened JSON")
            st.write("A simplified, flat JSON array of transaction objects, ideal for custom webhooks or lightweight integrations.")
            flat_json = df_transactions.to_json(orient="records", indent=4)
            st.download_button(
                label="Download Flattened JSON",
                data=flat_json,
                file_name=f"camt053_flat_{datetime.date.today()}.json",
                mime="application/json",
                use_container_width=True
            )

        st.markdown("---")
        st.subheader("Raw CAMT.053 JSON Structure")
        with st.expander("View Raw JSON"):
            st.json(st.session_state["camt_json"])

# ==========================================
# APP 2: FINANCIAL ANALYTICS DASHBOARD
# ==========================================
elif app_mode == "2. Financial Analytics Dashboard":
    st.title("📊 Financial Analytics Dashboard")
    st.markdown("Visualize cash flows, transaction volumes, and counterparty distributions from your CAMT.053 statement.")
    
    if df_transactions.empty:
        st.warning("No transaction data available to analyze.")
    else:
        # Metrics Row
        total_credits = df_transactions[df_transactions["Amount"] > 0]["Amount"].sum()
        total_debits = df_transactions[df_transactions["Amount"] < 0]["Amount"].sum()
        net_flow = total_credits + total_debits
        tx_count = len(df_transactions)
        
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Total Inflow (Credits)", f"€{total_credits:,.2f}", delta_color="normal")
        m2.metric("Total Outflow (Debits)", f"€{abs(total_debits):,.2f}", delta_color="inverse")
        m3.metric("Net Cash Flow", f"€{net_flow:,.2f}", delta="Positive" if net_flow >= 0 else "Negative")
        m4.metric("Transaction Count", tx_count)
        
        st.markdown("---")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Transaction Volume & Value by Date")
            # Group by Booking Date
            df_grouped = df_transactions.groupby("Booking Date").agg(
                Inflow=("Amount", lambda x: x[x > 0].sum()),
                Outflow=("Amount", lambda x: abs(x[x < 0].sum())),
                Count=("Amount", "count")
            ).reset_index()
            
            fig = go.Figure()
            fig.add_trace(go.Bar(x=df_grouped["Booking Date"], y=df_grouped["Inflow"], name="Inflow (Credits)", marker_color="green"))
            fig.add_trace(go.Bar(x=df_grouped["Booking Date"], y=df_grouped["Outflow"], name="Outflow (Debits)", marker_color="red"))
            fig.update_layout(barmode='group', xaxis_title="Booking Date", yaxis_title="Amount (€)", legend_title="Flow Type")
            st.plotly_chart(fig, use_container_width=True)
            
        with col2:
            st.subheader("Top Counterparties by Volume")
            df_counterparty = df_transactions.groupby(["Counterparty Name", "Direction"]).agg(
                Total_Amount=("Amount", lambda x: abs(x).sum())
            ).reset_index().sort_values(by="Total_Amount", ascending=False)
            
            fig2 = px.bar(
                df_counterparty, 
                x="Total_Amount", 
                y="Counterparty Name", 
                color="Direction",
                orientation='h',
                title="Top Counterparties (Absolute Value)",
                labels={"Total_Amount": "Total Volume (€)", "Counterparty Name": "Counterparty"},
                color_discrete_map={"Credit": "green", "Debit": "red"}
            )
            st.plotly_chart(fig2, use_container_width=True)

        st.markdown("---")
        st.subheader("Detailed Transaction Breakdown")
        st.dataframe(
            df_transactions[["Booking Date", "Counterparty Name", "Direction", "Amount", "Remittance Info", "Entry Reference"]],
            use_container_width=True
        )

# ==========================================
# APP 3: ERP INTEGRATION & API FORMATTER
# ==========================================
elif app_mode == "3. ERP Integration & API Formatter":
    st.title("🔌 ERP Integration & API Formatter")
    st.markdown("Format and map your CAMT.053 transaction data to match specific ERP schemas and simulate API delivery.")
    
    erp_target = st.selectbox(
        "Select Target ERP System:",
        ["SAP S/4HANA (Multi-Cash Format)", "NetSuite (Bank Statement Parser)", "Odoo Accounting (JSON-RPC)", "QuickBooks Online (QBO Mock)"]
    )
    
    st.markdown("### Schema Mapping & Transformation")
    
    if erp_target == "SAP S/4HANA (Multi-Cash Format)":
        st.info("SAP Multi-Cash format requires a Statement File (UMSATZ.TXT) and a Posting File (AUSZUG.TXT). Below is the mapped representation.")
        
        sap_mapped = df_transactions.map(lambda x: x if not isinstance(x, str) else x.upper()) # SAP often prefers uppercase
        sap_df = pd.DataFrame({
            "VALUTADATUM": sap_mapped["Value Date"].str.replace("-", ""),
            "BUCHUNGSDATUM": sap_mapped["Booking Date"].str.replace("-", ""),
            "BETRAG": sap_mapped["Amount"].apply(lambda x: f"{abs(x):.2f}"),
            "SOLL_HABEN": sap_mapped["Direction"].apply(lambda x: "S" if x == "Debit" else "H"),
            "VERWENDUNGSZWECK": sap_mapped["Remittance Info"].str.slice(0, 27),
            "PARTNER_NAME": sap_mapped["Counterparty Name"].str.slice(0, 35),
            "PARTNER_IBAN": sap_mapped["Counterparty IBAN"]
        })
        st.dataframe(sap_df, use_container_width=True)
        
    elif erp_target == "NetSuite (Bank Statement Parser)":
        st.info("NetSuite Bank Statement Parser format requires specific column headers for automated reconciliation.")
        ns_df = pd.DataFrame({
            "Transaction Date": df_transactions["Booking Date"],
            "Transaction ID": df_transactions["Entry Reference"],
            "Amount": df_transactions["Amount"],
            "Transaction Type": df_transactions["Direction"].apply(lambda x: "Deposit" if x == "Credit" else "Payment"),
            "Payee Name": df_transactions["Counterparty Name"],
            "Memo/Notes": df_transactions["Remittance Info"],
            "External ID": df_transactions["End-to-End ID"]
        })
        st.dataframe(ns_df, use_container_width=True)
        
    elif erp_target == "Odoo Accounting (JSON-RPC)":
        st.info("Odoo JSON-RPC payload format for direct bank statement injection.")
        odoo_payloads = []
        for _, row in df_transactions.iterrows():
            odoo_payloads.append({
                "jsonrpc": "2.0",
                "method": "call",
                "params": {
                    "model": "account.bank.statement.line",
                    "method": "create",
                    "args": [{
                        "date": row["Booking Date"],
                        "name": row["Remittance Info"],
                        "ref": row["Entry Reference"],
                        "amount": row["Amount"],
                        "partner_name": row["Counterparty Name"],
                        "account_number": row["Counterparty IBAN"]
                    }]
                },
                "id": random.randint(1000, 9999)
            })
        st.json(odoo_payloads[:2])
        st.caption("Showing first 2 transaction payloads of the batch.")
        
    elif erp_target == "QuickBooks Online (QBO Mock)":
        st.info("QuickBooks Online standard CSV import format.")
        qbo_df = pd.DataFrame({
            "Date": pd.to_datetime(df_transactions["Booking Date"]).dt.strftime("%m/%d/%Y"),
            "Description": df_transactions["Counterparty Name"] + " - " + df_transactions["Remittance Info"],
            "Amount": df_transactions["Amount"]
        })
        st.dataframe(qbo_df, use_container_width=True)

    st.markdown("---")
    st.subheader("Simulate API Export")
    st.write("Test the connection and push the formatted transactions to your ERP endpoint.")
    
    api_url = st.text_input("ERP Endpoint URL", value="https://api.yourcompany.erp/v1/bank-statements")
    
    if st.button("🚀 Push Transactions to ERP"):
        with st.spinner("Connecting to ERP and transmitting payloads..."):
            # Simulate network latency
            import time
            time.sleep(1.5)
            st.success(f"Successfully exported {len(df_transactions)} transactions to {erp_target} at {api_url}!")
            st.balloons()

# ==========================================
# APP 4: TRANSACTION AUDIT & RECONCILIATION
# ==========================================
elif app_mode == "4. Transaction Audit & Reconciliation":
    st.title("🔍 Transaction Audit & Reconciliation")
    st.markdown("Match CAMT.053 bank transactions against your internal General Ledger (GL) to identify discrepancies.")
    
    # Generate a mock General Ledger for matching
    def generate_mock_ledger(bank_df):
        ledger_rows = []
        # We will make some match perfectly, some have amount mismatches, and some be missing entirely.
        for idx, row in bank_df.iterrows():
            # 75% chance of perfect match
            rand_val = random.random()
            if rand_val < 0.70:
                ledger_rows.append({
                    "GL Ref": f"GL-{row['Entry Reference']}",
                    "Date": row["Booking Date"],
                    "Amount": row["Amount"],
                    "Description": row["Remittance Info"],
                    "Status": "Posted"
                })
            elif rand_val < 0.85:
                # Amount mismatch
                ledger_rows.append({
                    "GL Ref": f"GL-{row['Entry Reference']}",
                    "Date": row["Booking Date"],
                    "Amount": row["Amount"] * 1.05, # 5% difference
                    "Description": f"MISMATCH: {row['Remittance Info']}",
                    "Status": "Posted"
                })
            # Remaining 15% will not be added to GL (representing missing entries in GL)
            
        # Add some entries in GL that are NOT in the bank statement (representing outstanding checks/deposits)
        ledger_rows.append({
            "GL Ref": "GL-OUTSTANDING-001",
            "Date": datetime.date.today().strftime("%Y-%m-%d"),
            "Amount": -1200.00,
            "Description": "Outstanding Vendor Payment",
            "Status": "Pending"
        })
        return pd.DataFrame(ledger_rows)

    if df_transactions.empty:
        st.warning("No bank transactions available for reconciliation.")
    else:
        st.subheader("Internal General Ledger (GL) Source")
        
        # Option to upload or use mock
        gl_source = st.radio("GL Data Source:", ["Generate Mock General Ledger", "Upload GL CSV"], horizontal=True)
        
        if gl_source == "Generate Mock General Ledger":
            df_ledger = generate_mock_ledger(df_transactions)
        else:
            uploaded_gl = st.file_uploader("Upload GL CSV File", type=["csv"])
            if uploaded_gl is not None:
                df_ledger = pd.read_csv(uploaded_gl)
            else:
                df_ledger = generate_mock_ledger(df_transactions)
                st.info("Awaiting GL upload. Using generated mock GL for demonstration.")
                
        st.markdown("### General Ledger Preview")
        st.dataframe(df_ledger, use_container_width=True)
        
        st.markdown("---")
        st.subheader("Reconciliation Engine")
        
        # Reconciliation Logic
        reconciled_rows = []
        unmatched_bank = []
        unmatched_gl = df_ledger.copy()
        
        for _, bank_row in df_transactions.iterrows():
            # Try to find a match in GL
            # Match criteria: Date matches and Amount matches (or is very close)
            matched_index = None
            match_type = "Unmatched"
            gl_ref = "N/A"
            gl_amount = 0.0
            
            for idx, gl_row in unmatched_gl.iterrows():
                # Check exact match
                if gl_row["Date"] == bank_row["Booking Date"] and abs(gl_row["Amount"] - bank_row["Amount"]) < 0.01:
                    matched_index = idx
                    match_type = "Exact Match"
                    gl_ref = gl_row["GL Ref"]
                    gl_amount = gl_row["Amount"]
                    break
                # Check partial match (Date matches, amount differs slightly)
                elif gl_row["Date"] == bank_row["Booking Date"] and abs(gl_row["Amount"] - bank_row["Amount"]) / max(abs(bank_row["Amount"]), 1) < 0.10:
                    matched_index = idx
                    match_type = "Amount Mismatch"
                    gl_ref = gl_row["GL Ref"]
                    gl_amount = gl_row["Amount"]
                    break
            
            if matched_index is not None:
                reconciled_rows.append({
                    "Bank Ref": bank_row["Entry Reference"],
                    "GL Ref": gl_ref,
                    "Date": bank_row["Booking Date"],
                    "Bank Amount": bank_row["Amount"],
                    "GL Amount": gl_amount,
                    "Difference": bank_row["Amount"] - gl_amount,
                    "Status": match_type
                })
                unmatched_gl = unmatched_gl.drop(matched_index)
            else:
                reconciled_rows.append({
                    "Bank Ref": bank_row["Entry Reference"],
                    "GL Ref": "N/A",
                    "Date": bank_row["Booking Date"],
                    "Bank Amount": bank_row["Amount"],
                    "GL Amount": 0.0,
                    "Difference": bank_row["Amount"],
                    "Status": "Missing in GL"
                })
                
        # Remaining items in unmatched_gl are "Missing in Bank"
        for _, gl_row in unmatched_gl.iterrows():
            reconciled_rows.append({
                "Bank Ref": "N/A",
                "GL Ref": gl_row["GL Ref"],
                "Date": gl_row["Date"],
                "Bank Amount": 0.0,
                "GL Amount": gl_row["Amount"],
                "Difference": -gl_row["Amount"],
                "Status": "Missing in Bank"
            })
            
        df_recon = pd.DataFrame(reconciled_rows)
        
        # Display Reconciliation Summary
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Exact Matches", len(df_recon[df_recon["Status"] == "Exact Match"]))
        c2.metric("Amount Mismatches", len(df_recon[df_recon["Status"] == "Amount Mismatch"]))
        c3.metric("Missing in GL", len(df_recon[df_recon["Status"] == "Missing in GL"]))
        c4.metric("Missing in Bank", len(df_recon[df_recon["Status"] == "Missing in Bank"]))
        
        st.markdown("### Reconciliation Report")
        
        # Color coding helper
        def color_status(val):
            if val == "Exact Match":
                return "background-color: #d4edda; color: #155724;"
            elif val == "Amount Mismatch":
                return "background-color: #fff3cd; color: #856404;"
            else:
                return "background-color: #f8d7da; color: #721c24;"
                
        st.dataframe(
            df_recon.style.applymap(color_status, subset=["Status"]),
            use_container_width=True
        )
        
        # Download Report
        recon_csv = df_recon.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="Download Reconciliation Report (CSV)",
            data=recon_csv,
            file_name=f"reconciliation_report_{datetime.date.today()}.csv",
            mime="text/csv"
        )