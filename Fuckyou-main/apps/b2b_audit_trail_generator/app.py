import streamlit as st
import pandas as pd
import datetime
import hashlib
import json
import hmac
import plotly.express as px
import plotly.graph_objects as go

# Set Streamlit page configuration
st.set_page_config(
    page_title="B2B Audit Trail Generator & Verifier",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- MOCK B2B ACCOUNTS API ---
class MockB2BAccountsAPI:
    """
    Simulates a secure B2B Core Banking / Accounts API.
    Provides corporate account details and transaction histories.
    """
    def __init__(self):
        self.accounts = {
            "ACC-OP-9921": {"name": "Operating Checking", "type": "CHECKING", "currency": "USD", "balance": 1450230.45},
            "ACC-TR-4412": {"name": "Treasury Reserve", "type": "SAVINGS", "currency": "USD", "balance": 5200110.80},
            "ACC-CC-8831": {"name": "Corporate Travel Card", "type": "CREDITCARD", "currency": "USD", "balance": -45230.12},
            "ACC-INV-1102": {"name": "Strategic Investment", "type": "INVESTMENT", "currency": "USD", "balance": 850000.00},
            "ACC-EU-7741": {"name": "EU Operations", "type": "CHECKING", "currency": "EUR", "balance": 320450.00}
        }
        
        # Base transactions to generate deterministic history
        self.raw_transactions = [
            {"tx_id": "TXN-2023-001", "timestamp": "2023-10-01T09:15:00Z", "account_id": "ACC-OP-9921", "amount": -12500.00, "counterparty": "AWS Cloud Services", "category": "Infrastructure"},
            {"tx_id": "TXN-2023-002", "timestamp": "2023-10-01T14:30:00Z", "account_id": "ACC-OP-9921", "amount": 45000.00, "counterparty": "Acme Corp Client", "category": "Receivables"},
            {"tx_id": "TXN-2023-003", "timestamp": "2023-10-02T10:00:00Z", "account_id": "ACC-CC-8831", "amount": -1250.45, "counterparty": "Delta Airlines", "category": "Travel"},
            {"tx_id": "TXN-2023-004", "timestamp": "2023-10-02T16:45:00Z", "account_id": "ACC-TR-4412", "amount": 500000.00, "counterparty": "Treasury Bond Yield", "category": "Investment Income"},
            {"tx_id": "TXN-2023-005", "timestamp": "2023-10-03T11:20:00Z", "account_id": "ACC-OP-9921", "amount": -8500.00, "counterparty": "Slack Technologies", "category": "SaaS Subscriptions"},
            {"tx_id": "TXN-2023-006", "timestamp": "2023-10-03T15:30:00Z", "account_id": "ACC-EU-7741", "amount": -4200.00, "counterparty": "Munich Office Rent", "category": "Real Estate"},
            {"tx_id": "TXN-2023-007", "timestamp": "2023-10-04T09:00:00Z", "account_id": "ACC-OP-9921", "amount": -150000.00, "counterparty": "Global Payroll Corp", "category": "Payroll"},
            {"tx_id": "TXN-2023-008", "timestamp": "2023-10-04T13:10:00Z", "account_id": "ACC-INV-1102", "amount": 25000.00, "counterparty": "Alpha Venture Fund", "category": "Dividends"},
            {"tx_id": "TXN-2023-009", "timestamp": "2023-10-05T10:05:00Z", "account_id": "ACC-CC-8831", "amount": -350.20, "counterparty": "Uber Business", "category": "Travel"},
            {"tx_id": "TXN-2023-010", "timestamp": "2023-10-05T17:00:00Z", "account_id": "ACC-OP-9921", "amount": 98000.00, "counterparty": "Beta Partners LLC", "category": "Receivables"},
            {"tx_id": "TXN-2023-011", "timestamp": "2023-10-06T08:30:00Z", "account_id": "ACC-EU-7741", "amount": -1500.00, "counterparty": "Orange Telecom", "category": "Utilities"},
            {"tx_id": "TXN-2023-012", "timestamp": "2023-10-06T12:00:00Z", "account_id": "ACC-TR-4412", "amount": -1000000.00, "counterparty": "Strategic Reserve Transfer", "category": "Internal Transfer"}
        ]

    def get_accounts(self):
        return self.accounts

    def get_transactions(self):
        # Enrich transactions with account metadata
        enriched = []
        for tx in self.raw_transactions:
            acc_info = self.accounts.get(tx["account_id"], {"name": "Unknown", "type": "UNKNOWN", "currency": "USD"})
            enriched.append({
                **tx,
                "account_name": acc_info["name"],
                "account_type": acc_info["type"],
                "currency": acc_info["currency"]
            })
        return enriched

# Initialize API Client
api_client = MockB2BAccountsAPI()

# --- CRYPTOGRAPHIC UTILITIES ---
def calculate_sha256(data_string: str) -> str:
    """Calculates SHA-256 hash of a given string."""
    return hashlib.sha256(data_string.encode('utf-8')).hexdigest()

def generate_chained_audit_trail(transactions: list) -> list:
    """
    Generates a tamper-proof audit trail where each block/record contains
    the hash of the previous record, forming a cryptographic chain.
    """
    # Sort transactions chronologically to ensure deterministic chaining
    sorted_tx = sorted(transactions, key=lambda x: x['timestamp'])
    
    chained_trail = []
    previous_hash = "0" * 64  # Genesis block previous hash
    
    for idx, tx in enumerate(sorted_tx):
        # Create a clean, ordered dictionary of the transaction data to hash
        block_data = {
            "index": idx,
            "transaction_id": tx["tx_id"],
            "timestamp": tx["timestamp"],
            "account_id": tx["account_id"],
            "account_name": tx["account_name"],
            "account_type": tx["account_type"],
            "amount": float(tx["amount"]),
            "currency": tx["currency"],
            "counterparty": tx["counterparty"],
            "category": tx["category"],
            "previous_hash": previous_hash
        }
        
        # Serialize to a stable JSON string for hashing
        serialized_data = json.dumps(block_data, sort_keys=True)
        current_hash = calculate_sha256(serialized_data)
        
        # Append hash to the record
        block_data["current_hash"] = current_hash
        chained_trail.append(block_data)
        
        # Update previous hash for the next block
        previous_hash = current_hash
        
    return chained_trail

def verify_audit_trail_integrity(trail: list) -> tuple:
    """
    Verifies the integrity of the chained audit trail.
    Returns (is_valid, error_index, details)
    """
    previous_hash = "0" * 64
    for idx, block in enumerate(trail):
        # Reconstruct the block data exactly as it was hashed (excluding current_hash)
        block_data = {
            "index": block["index"],
            "transaction_id": block["transaction_id"],
            "timestamp": block["timestamp"],
            "account_id": block["account_id"],
            "account_name": block["account_name"],
            "account_type": block["account_type"],
            "amount": float(block["amount"]),
            "currency": block["currency"],
            "counterparty": block["counterparty"],
            "category": block["category"],
            "previous_hash": block["previous_hash"]
        }
        
        # Verify previous hash link
        if block["previous_hash"] != previous_hash:
            return False, idx, f"Chain broken at index {idx}: Previous hash mismatch. Expected '{previous_hash}', got '{block['previous_hash']}'."
        
        # Recalculate current hash
        serialized_data = json.dumps(block_data, sort_keys=True)
        recalculated_hash = calculate_sha256(serialized_data)
        
        if recalculated_hash != block["current_hash"]:
            return False, idx, f"Data tampered at index {idx}: Hash mismatch. Recalculated '{recalculated_hash}', recorded '{block['current_hash']}'."
        
        previous_hash = block["current_hash"]
        
    return True, -1, "Audit trail integrity verified successfully. All cryptographic links are intact."

def sign_audit_report(report_data: dict, secret_key: str) -> str:
    """Generates an HMAC-SHA256 signature for the entire audit report."""
    serialized_report = json.dumps(report_data, sort_keys=True)
    signature = hmac.new(
        secret_key.encode('utf-8'),
        serialized_report.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature

# --- STREAMLIT STATE MANAGEMENT ---
if "audit_trail" not in st.session_state:
    # Fetch initial transactions and build the chain
    raw_txs = api_client.get_transactions()
    st.session_state.audit_trail = generate_chained_audit_trail(raw_txs)

if "tampered_indices" not in st.session_state:
    st.session_state.tampered_indices = []

# --- UI LAYOUT ---

# Sidebar Configuration
st.sidebar.image("https://img.icons8.com/fluency/96/000000/shield-with-blockchain.png", width=80)
st.sidebar.title("B2B Audit Engine")
st.sidebar.markdown("---")

st.sidebar.subheader("🔌 API Connection Settings")
api_endpoint = st.sidebar.text_input("Accounts API Endpoint", value="https://api.corebanking.internal/v2/accounts")
api_key = st.sidebar.text_input("API Bearer Token", value="••••••••••••••••••••••••", type="password")
corporate_id = st.sidebar.text_input("Corporate ID", value="CORP-GLOBAL-8821-X")

st.sidebar.markdown("---")
st.sidebar.subheader("🔍 Audit Filters")

# Filter options
account_types = ["ALL", "CHECKING", "SAVINGS", "CREDITCARD", "INVESTMENT"]
selected_type = st.sidebar.selectbox("Account Type", account_types)

min_amount = st.sidebar.number_input("Min Amount ($)", value=0.0, step=100.0)
max_amount = st.sidebar.number_input("Max Amount ($)", value=2000000.0, step=1000.0)

st.sidebar.markdown("---")
st.sidebar.subheader("🔑 Cryptographic Signing")
signing_key = st.sidebar.text_input("Corporate HMAC Secret Key", value="super-secret-corporate-audit-key", type="password")

# Main Panel Header
st.title("🛡️ B2B Cryptographic Audit Trail Generator")
st.markdown(
    """
    This application connects to your secure B2B Accounts API, retrieves transaction histories, 
    and constructs a **tamper-proof, SHA-256 chained audit log**. Any unauthorized modification 
    of transaction data breaks the cryptographic chain, instantly alerting compliance officers.
    """
)

# Quick Stats / KPI Cards
st.markdown("### 📊 Real-Time Audit Metrics")
col1, col2, col3, col4 = st.columns(4)

# Calculate metrics based on current session state audit trail
current_trail = st.session_state.audit_trail
total_tx = len(current_trail)
total_volume = sum(abs(tx["amount"]) for tx in current_trail)
active_accounts = len(set(tx["account_id"] for tx in current_trail))

# Verify integrity for KPI status
is_valid, error_idx, status_msg = verify_audit_trail_integrity(current_trail)

with col1:
    st.metric("Total Audited Transactions", f"{total_tx}")
with col2:
    st.metric("Total Audited Volume", f"${total_volume:,.2f}")
with col3:
    st.metric("Monitored Accounts", f"{active_accounts}")
with col4:
    if is_valid:
        st.success("🔒 Chain Verified")
    else:
        st.error("🚨 Chain Compromised")

# --- FILTERING LOGIC ---
# Apply filters to the session state audit trail for display
filtered_trail = []
for tx in current_trail:
    # Filter by account type
    if selected_type != "ALL" and tx["account_type"] != selected_type:
        continue
    # Filter by amount range (absolute value for debit/credit)
    if not (min_amount <= abs(tx["amount"]) <= max_amount):
        continue
    filtered_trail.append(tx)

# --- TABS FOR DIFFERENT VIEWS ---
tab1, tab2, tab3, tab4 = st.tabs(["⛓️ Cryptographic Audit Trail", "📈 Financial Analytics", "⚠️ Developer Sandbox (Tamper Test)", "📤 Export Signed Report"])

with tab1:
    st.subheader("Chained Transaction Ledger")
    st.markdown(
        "Each transaction block contains a `previous_hash` linking it to the prior transaction. "
        "The `current_hash` is a SHA-256 signature of all block fields combined."
    )
    
    # Display verification status banner
    if is_valid:
        st.info(f"✅ **Integrity Check Passed:** {status_msg}")
    else:
        st.error(f"❌ **Integrity Check Failed:** {status_msg}")
        
    # Format the trail for clean display
    display_df = pd.DataFrame(filtered_trail)
    if not display_df.empty:
        # Reorder columns for better readability
        cols_to_display = ["index", "transaction_id", "timestamp", "account_name", "account_type", "amount", "currency", "counterparty", "category", "previous_hash", "current_hash"]
        display_df = display_df[cols_to_display]
        
        # Style dataframe to highlight hashes
        st.dataframe(
            display_df.style.format({
                "amount": "${:,.2f}"
            }).map(
                lambda x: "background-color: #ffe6e6;" if not is_valid and display_df.loc[display_df['current_hash'] == x].index.tolist() and display_df.loc[display_df['current_hash'] == x].index[0] >= error_idx else "",
                subset=["current_hash", "previous_hash"]
            ),
            use_container_width=True
        )
    else:
        st.warning("No transactions match the selected filters.")

with tab2:
    st.subheader("Audit Trail Financial Analytics")
    if filtered_trail:
        df_analytics = pd.DataFrame(filtered_trail)
        
        col_chart1, col_chart2 = st.columns(2)
        
        with col_chart1:
            st.markdown("#### Transaction Volume by Category")
            fig_pie = px.pie(df_analytics, values=df_analytics['amount'].abs(), names='category', hole=0.4,
                             color_discrete_sequence=px.colors.qualitative.Pastel)
            fig_pie.update_layout(margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig_pie, use_container_width=True)
            
        with col_chart2:
            st.markdown("#### Cumulative Cash Flow Over Time")
            df_analytics['timestamp_dt'] = pd.to_datetime(df_analytics['timestamp'])
            df_analytics = df_analytics.sort_values('timestamp_dt')
            df_analytics['cumulative_sum'] = df_analytics['amount'].cumsum()
            
            fig_line = px.line(df_analytics, x='timestamp_dt', y='cumulative_sum', 
                               labels={'cumulative_sum': 'Net Balance Change (USD)', 'timestamp_dt': 'Date'},
                               markers=True)
            fig_line.update_traces(line_color='#2ca02c', width=3)
            st.plotly_chart(fig_line, use_container_width=True)
    else:
        st.warning("No data available for analytics. Adjust filters.")

with tab3:
    st.subheader("🛠️ Developer Sandbox: Simulate Tampering")
    st.markdown(
        """
        To demonstrate the power of cryptographic chaining, you can simulate an unauthorized database modification.
        Select a transaction, alter its amount, and observe how the verification engine immediately detects the fraud.
        """
    )
    
    col_tamper1, col_tamper2 = st.columns([1, 2])
    
    with col_tamper1:
        st.markdown("#### 1. Select & Modify Record")
        tx_ids = [tx["transaction_id"] for tx in st.session_state.audit_trail]
        selected_tx_id = st.selectbox("Select Transaction to Tamper With", tx_ids)
        
        # Find the transaction in session state
        target_tx = next(tx for tx in st.session_state.audit_trail if tx["transaction_id"] == selected_tx_id)
        
        new_amount = st.number_input("Modify Amount ($)", value=float(target_tx["amount"]))
        
        if st.button("⚠️ Inject Malicious Modification", type="primary"):
            # Apply the tamper directly to the session state
            for tx in st.session_state.audit_trail:
                if tx["transaction_id"] == selected_tx_id:
                    tx["amount"] = new_amount
            st.session_state.tampered_indices.append(target_tx["index"])
            st.toast(f"Transaction {selected_tx_id} modified in memory!", icon="⚠️")
            st.rerun()
            
        if st.button("🔄 Reset Audit Trail to Original API State"):
            # Re-fetch and re-chain
            raw_txs = api_client.get_transactions()
            st.session_state.audit_trail = generate_chained_audit_trail(raw_txs)
            st.session_state.tampered_indices = []
            st.toast("Audit trail restored to pristine state.", icon="✅")
            st.rerun()

    with col_tamper2:
        st.markdown("#### 2. Cryptographic Impact Analysis")
        
        # Run verification
        is_valid_sandbox, error_idx_sandbox, status_msg_sandbox = verify_audit_trail_integrity(st.session_state.audit_trail)
        
        if is_valid_sandbox:
            st.success("🟢 **All Cryptographic Hashes Match.** The ledger is secure and untampered.")
            st.image("https://img.icons8.com/fluency/96/000000/ok.png", width=64)
        else:
            st.error(f"🔴 **CRITICAL ALERT: Cryptographic Chain Broken!**")
            st.markdown(f"**Failure Details:** {status_msg_sandbox}")
            
            # Visual representation of the broken chain
            st.markdown("#### Chain Visualization")
            chain_html = []
            for idx, block in enumerate(st.session_state.audit_trail):
                if idx < error_idx_sandbox:
                    color = "#d4edda"  # Green (Valid)
                    border = "1px solid #c3e6cb"
                    status_icon = "✅"
                elif idx == error_idx_sandbox:
                    color = "#f8d7da"  # Red (Tampered/Broken point)
                    border = "2px dashed #dc3545"
                    status_icon = "💥"
                else:
                    color = "#e2e3e5"  # Grey (Invalidated downstream)
                    border = "1px solid #ced4da"
                    status_icon = "🔗 (Broken Link)"
                
                chain_html.append(
                    f"<div style='background-color: {color}; border: {border}; padding: 10px; margin: 5px 0; border-radius: 5px;'>"
                    f"<strong>Block #{block['index']} ({block['transaction_id']})</strong> - {status_icon}<br/>"
                    f"<small>Hash: <code>{block['current_hash'][:24]}...</code></small><br/>"
                    f"<small>Prev Hash: <code>{block['previous_hash'][:24]}...</code></small>"
                    f"</div>"
                )
            st.markdown("".join(chain_html), unsafe_allowed_allowed=True, unsafe_allow_html=True)

with tab4:
    st.subheader("Export Signed Audit Report")
    st.markdown(
        """
        Generate a cryptographically signed JSON report of the current audit trail. 
        The report includes a manifest block containing an HMAC-SHA256 signature of the entire dataset, 
        ensuring authenticity and non-repudiation when shared with external auditors.
        """
    )
    
    # Construct the export payload
    report_metadata = {
        "corporate_id": corporate_id,
        "api_endpoint": api_endpoint,
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "record_count": len(filtered_trail),
        "integrity_status": "VERIFIED" if is_valid else "COMPROMISED",
        "filters_applied": {
            "account_type": selected_type,
            "min_amount": min_amount,
            "max_amount": max_amount
        }
    }
    
    export_payload = {
        "metadata": report_metadata,
        "audit_trail": filtered_trail
    }
    
    # Generate HMAC signature
    report_signature = sign_audit_report(export_payload, signing_key)
    
    # Append signature block
    export_payload["signature_block"] = {
        "signature_algorithm": "HMAC-SHA256",
        "signature": report_signature,
        "signing_key_identifier": calculate_sha256(signing_key)[:16]  # Masked key identifier
    }
    
    # Pretty print JSON
    json_string = json.dumps(export_payload, indent=4)
    
    st.markdown("#### Signed JSON Manifest Preview")
    st.code(json_string[:1000] + "\n\n... [Truncated for Preview] ...", language="json")
    
    st.download_button(
        label="📥 Download Signed JSON Audit Report",
        data=json_string,
        file_name=f"signed_audit_report_{corporate_id}_{datetime.date.today()}.json",
        mime="application/json"
    )

# Footer
st.markdown("---")
st.markdown(
    "<div style='text-align: center; color: gray;'>"
    "<small>B2B Audit Trail Generator • Powered by SHA-256 Cryptographic Chaining • Enterprise Grade Compliance</small>"
    "</div>",
    unsafe_allow_html=True
)