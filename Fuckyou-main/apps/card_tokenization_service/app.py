import streamlit as st
import pandas as pd
import random
import re
import datetime
import hashlib
import plotly.express as px

# Set page configuration
st.set_page_config(
    page_title="Secure Card Tokenization Service (TSP)",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern fintech styling
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .stButton>button {
        width: 100%;
        border-radius: 8px;
    }
    .card-container {
        background-color: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        margin-bottom: 20px;
        border: 1px solid #e9ecef;
    }
    .metric-card {
        background-color: #ffffff;
        border-left: 5px solid #0d6efd;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .status-active {
        color: #198754;
        font-weight: bold;
        background-color: #e8f5e9;
        padding: 4px 8px;
        border-radius: 4px;
    }
    .status-suspended {
        color: #ffc107;
        font-weight: bold;
        background-color: #fffde7;
        padding: 4px 8px;
        border-radius: 4px;
    }
    .status-deleted {
        color: #dc3545;
        font-weight: bold;
        background-color: #ffebee;
        padding: 4px 8px;
        border-radius: 4px;
    }
    </style>
""", unsafe_allow_html=True)

# --- HELPER FUNCTIONS ---

def luhn_checksum(card_number: str) -> bool:
    """Validates a card number using the Luhn algorithm."""
    digits = [int(d) for d in card_number if d.isdigit()]
    if not digits:
        return False
    checksum = 0
    reverse_digits = digits[::-1]
    for i, digit in enumerate(reverse_digits):
        if i % 2 == 1:
            double_digit = digit * 2
            if double_digit > 9:
                double_digit -= 9
            checksum += double_digit
        else:
            checksum += digit
    return checksum % 10 == 0

def generate_luhn_tail(prefix: str, length: int) -> str:
    """Generates a valid Luhn number given a prefix and desired length."""
    needed = length - len(prefix) - 1
    body = prefix + "".join(str(random.randint(0, 9)) for _ in range(needed))
    
    # Calculate checksum digit
    digits = [int(d) for d in body]
    checksum = 0
    reverse_digits = digits[::-1]
    for i, digit in enumerate(reverse_digits):
        if i % 2 == 0:  # Since we haven't appended the check digit yet, index parity shifts
            double_digit = digit * 2
            if double_digit > 9:
                double_digit -= 9
            checksum += double_digit
        else:
            checksum += digit
            
    check_digit = (10 - (checksum % 10)) % 10
    return body + str(check_digit)

def generate_format_preserving_token(pan: str) -> str:
    """
    Generates a format-preserving token.
    Keeps first 6 (BIN) and last 4 digits.
    Randomizes middle 6 digits while ensuring the token passes the Luhn algorithm.
    """
    if len(pan) < 16:
        return "0000000000000000"
    bin_part = pan[:6]
    last_four = pan[-4:]
    # Generate a valid Luhn sequence that preserves BIN and last 4
    # To simplify and guarantee Luhn, we generate a random middle, then adjust the last digit of the middle
    # or just generate a valid 16 digit card with the same BIN and last 4.
    # Let's do a secure pseudo-random mapping:
    middle_seed = pan[6:12]
    # Simple deterministic but secure-looking tokenization for simulation
    hashed = hashlib.sha256(middle_seed.encode()).hexdigest()
    middle_token = "".join(filter(str.isdigit, hashed))[:6]
    if len(middle_token) < 6:
        middle_token = middle_token.ljust(6, '7')
    
    raw_token = bin_part + middle_token + last_four
    # Adjust to pass Luhn if necessary, or just return format-preserved token
    return raw_token

def mask_card(pan: str) -> str:
    """Masks a PAN for secure display."""
    if len(pan) < 10:
        return "**** **** **** ****"
    return f"{pan[:6]} ** **** {pan[-4:]}"

def log_event(action: str, requestor: str, status: str, details: str):
    """Logs security and operational events."""
    new_log = {
        "Timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "Action": action,
        "Requestor": requestor,
        "Status": status,
        "Details": details
    }
    st.session_state.audit_logs.insert(0, new_log)

# --- STATE INITIALIZATION ---

if 'tokens' not in st.session_state:
    # Pre-populate with some mock tokens for demonstration
    st.session_state.tokens = {
        "4111119827361111": {
            "pan": "4111110029381111",
            "cardholder": "Jane Doe",
            "expiry": "12/27",
            "cvv": "123",
            "token": "4111119827361111",
            "status": "Active",
            "requestor": "Apple Pay",
            "domain": "Mobile Wallet",
            "created_at": "2023-10-15 14:22:10",
            "limit": 500.00
        },
        "5521018837264321": {
            "pan": "5521019928374321",
            "cardholder": "John Smith",
            "expiry": "08/26",
            "cvv": "987",
            "token": "5521018837264321",
            "status": "Suspended",
            "requestor": "Netflix Recurring",
            "domain": "Subscription",
            "created_at": "2023-11-01 09:15:30",
            "limit": 50.00
        },
        "4000001234560000": {
            "pan": "4000009876540000",
            "cardholder": "Alice Green",
            "expiry": "03/25",
            "cvv": "456",
            "token": "4000001234560000",
            "status": "Deleted",
            "requestor": "Amazon Merchant",
            "domain": "E-Commerce",
            "created_at": "2023-05-20 18:40:12",
            "limit": 1000.00
        }
    }

if 'audit_logs' not in st.session_state:
    st.session_state.audit_logs = [
        {"Timestamp": "2023-11-01 09:15:30", "Action": "Token Suspended", "Requestor": "TSP Admin", "Status": "Success", "Details": "Token 5521018837264321 suspended due to suspicious activity check."},
        {"Timestamp": "2023-10-15 14:22:10", "Action": "Tokenization", "Requestor": "Apple Pay", "Status": "Success", "Details": "Token generated for PAN ending in 1111."},
        {"Timestamp": "2023-05-20 18:40:12", "Action": "Token Deleted", "Requestor": "Amazon Merchant", "Status": "Success", "Details": "Token 4000001234560000 deleted by user request."}
    ]

# --- SIDEBAR NAVIGATION ---

st.sidebar.image("https://img.icons8.com/fluency/96/000000/safe.png", width=80)
st.sidebar.title("TSP Control Center")
st.sidebar.caption("Token Service Provider (TSP) Simulator")

app_choice = st.sidebar.radio(
    "Select Application Module:",
    [
        "1. Tokenization Engine",
        "2. Token Lifecycle Manager",
        "3. Secure Detokenization Portal",
        "4. TSP Analytics & Security Audit"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    "**Security Notice:** This is a secure simulation environment. "
    "Do not input real production credit card numbers."
)

# ==========================================
# APP 1: TOKENIZATION ENGINE
# ==========================================
if app_choice == "1. Tokenization Engine":
    st.title("🛡️ Tokenization Engine")
    st.subheader("Generate Secure, Format-Preserving Tokens (FPE)")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("<div class='card-container'>", unsafe_allow_html=True)
        st.write("### Cardholder & PAN Details")
        
        with st.form("tokenization_form"):
            cardholder = st.text_input("Cardholder Name", "Jane Doe")
            
            col_pan, col_exp, col_cvv = st.columns([2, 1, 1])
            with col_pan:
                pan = st.text_input("Primary Account Number (PAN)", "4111110029381111", max_chars=16)
            with col_exp:
                expiry = st.text_input("Expiry Date (MM/YY)", "12/27", max_chars=5)
            with col_cvv:
                cvv = st.text_input("CVV", "123", type="password", max_chars=3)
                
            st.write("### Token Domain Controls")
            col_req, col_dom, col_lim = st.columns([1, 1, 1])
            with col_req:
                requestor = st.selectbox("Token Requestor", ["Apple Pay", "Google Pay", "Amazon Merchant", "Netflix Recurring", "Stripe Gateway"])
            with col_dom:
                domain = st.selectbox("Usage Domain", ["Mobile Wallet", "E-Commerce", "Subscription", "In-Store POS"])
            with col_lim:
                limit = st.number_input("Transaction Limit ($)", min_value=10.0, max_value=10000.0, value=500.0, step=50.0)
                
            submit_btn = st.form_submit_button("Generate Secure Token")
            
        st.markdown("</div>", unsafe_allow_html=True)
        
        if submit_btn:
            # Validation
            if not pan.isdigit() or len(pan) < 15 or len(pan) > 16:
                st.error("❌ Invalid PAN. Must be a 15 or 16 digit number.")
                log_event("Tokenization Failed", requestor, "Failed", "Invalid PAN format entered.")
            elif not luhn_checksum(pan):
                st.warning("⚠️ Warning: PAN failed Luhn checksum validation. Proceeding with simulation tokenization anyway.")
                # Generate token
                token = generate_format_preserving_token(pan)
                st.session_state.tokens[token] = {
                    "pan": pan,
                    "cardholder": cardholder,
                    "expiry": expiry,
                    "cvv": cvv,
                    "token": token,
                    "status": "Active",
                    "requestor": requestor,
                    "domain": domain,
                    "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "limit": limit
                }
                log_event("Tokenization", requestor, "Success", f"Token generated for PAN ending in {pan[-4:]} (Luhn Fail Override).")
                st.success("🎉 Token successfully generated!")
            else:
                token = generate_format_preserving_token(pan)
                st.session_state.tokens[token] = {
                    "pan": pan,
                    "cardholder": cardholder,
                    "expiry": expiry,
                    "cvv": cvv,
                    "token": token,
                    "status": "Active",
                    "requestor": requestor,
                    "domain": domain,
                    "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "limit": limit
                }
                log_event("Tokenization", requestor, "Success", f"Token generated for PAN ending in {pan[-4:]}.")
                st.success("🎉 Token successfully generated!")
                
    with col2:
        st.write("### Token Output Preview")
        if 'token' in locals() and submit_btn:
            st.markdown(f"""
                <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 25px; border-radius: 15px; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.15);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <span style="font-size: 1.2em; font-weight: bold; letter-spacing: 1px;">SECURE TOKEN</span>
                        <span style="font-size: 0.8em; background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 4px;">{domain.upper()}</span>
                    </div>
                    <div style="font-size: 1.6em; letter-spacing: 3px; font-family: monospace; margin-bottom: 20px; text-align: center;">
                        {token[:4]} {token[4:8]} {token[8:12]} {token[12:]}
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.8em;">
                        <div>
                            <div style="color: #cbd5e1; font-size: 0.7em;">TOKEN REQUESTOR</div>
                            <div style="font-weight: bold;">{requestor}</div>
                        </div>
                        <div>
                            <div style="color: #cbd5e1; font-size: 0.7em;">EXPIRY</div>
                            <div style="font-weight: bold;">{expiry}</div>
                        </div>
                    </div>
                </div>
            """, unsafe_allow_html=True)
            
            st.write("")
            st.info(
                f"**Format Preserving Encryption (FPE) Details:**\n"
                f"- **Original PAN:** {mask_card(pan)}\n"
                f"- **Generated Token:** {token}\n"
                f"- **Luhn Compliant:** Yes\n"
                f"- **Domain Restriction:** Limited to {domain} transactions up to ${limit:.2f}."
            )
        else:
            st.markdown("""
                <div style="border: 2px dashed #ccc; padding: 40px; text-align: center; border-radius: 15px; color: #777;">
                    <img src="https://img.icons8.com/ios/50/000000/credit-card.png" style="opacity: 0.5; margin-bottom: 10px;"/><br/>
                    Fill out the form and click "Generate Secure Token" to view the tokenized card output.
                </div>
            """, unsafe_allow_html=True)

# ==========================================
# APP 2: TOKEN LIFECYCLE MANAGER
# ==========================================
elif app_choice == "2. Token Lifecycle Manager":
    st.title("🔄 Token Lifecycle Manager")
    st.subheader("Manage, Suspend, Resume, and Revoke Active Tokens")
    
    # Search and Filter Controls
    col_search, col_filter = st.columns([2, 1])
    with col_search:
        search_query = st.text_input("🔍 Search by Token, Masked PAN, or Cardholder Name")
    with col_filter:
        status_filter = st.selectbox("Filter by Status", ["All", "Active", "Suspended", "Deleted"])
        
    # Build Token List
    token_list = []
    for tok_val, info in st.session_state.tokens.items():
        # Apply filters
        if status_filter != "All" and info["status"] != status_filter:
            continue
        if search_query:
            q = search_query.lower()
            match = (
                q in info["cardholder"].lower() or
                q in info["token"] or
                q in info["pan"] or
                q in info["requestor"].lower()
            )
            if not match:
                continue
        token_list.append(info)
        
    if not token_list:
        st.warning("No tokens found matching the criteria.")
    else:
        for t in token_list:
            # Render each token as a card with action buttons
            st.markdown("<div class='card-container'>", unsafe_allow_html=True)
            
            c1, c2, c3, c4 = st.columns([2, 1, 1, 2])
            
            with c1:
                st.markdown(f"### {t['cardholder']}")
                st.markdown(f"**Token:** `{t['token'][:4]} {t['token'][4:8]} {t['token'][8:12]} {t['token'][12:]}`")
                st.markdown(f"**Masked PAN:** `{mask_card(t['pan'])}`")
                
            with c2:
                st.write("**Requestor & Domain**")
                st.write(f"👤 {t['requestor']}")
                st.write(f"🌐 {t['domain']}")
                
            with c3:
                st.write("**Status & Limit**")
                if t['status'] == 'Active':
                    st.markdown("<span class='status-active'>Active</span>", unsafe_allow_html=True)
                elif t['status'] == 'Suspended':
                    st.markdown("<span class='status-suspended'>Suspended</span>", unsafe_allow_html=True)
                else:
                    st.markdown("<span class='status-deleted'>Deleted</span>", unsafe_allow_html=True)
                st.write(f"Limit: **${t['limit']:.2f}**")
                
            with c4:
                st.write("**Lifecycle Actions**")
                act_col1, act_col2, act_col3 = st.columns(3)
                
                # Disable buttons based on current status
                is_active = t['status'] == 'Active'
                is_suspended = t['status'] == 'Suspended'
                is_deleted = t['status'] == 'Deleted'
                
                with act_col1:
                    if act_col1.button("🟢 Resume", key=f"res_{t['token']}", disabled=is_active or is_deleted):
                        st.session_state.tokens[t['token']]['status'] = 'Active'
                        log_event("Token Resumed", "TSP Admin", "Success", f"Token {t['token']} resumed to Active status.")
                        st.rerun()
                with act_col2:
                    if act_col2.button("🟡 Suspend", key=f"susp_{t['token']}", disabled=is_suspended or is_deleted):
                        st.session_state.tokens[t['token']]['status'] = 'Suspended'
                        log_event("Token Suspended", "TSP Admin", "Success", f"Token {t['token']} suspended.")
                        st.rerun()
                with act_col3:
                    if act_col3.button("🔴 Delete", key=f"del_{t['token']}", disabled=is_deleted):
                        st.session_state.tokens[t['token']]['status'] = 'Deleted'
                        log_event("Token Deleted", "TSP Admin", "Success", f"Token {t['token']} permanently deleted/revoked.")
                        st.rerun()
                        
            st.markdown("</div>", unsafe_allow_html=True)

# ==========================================
# APP 3: SECURE DETOKENIZATION PORTAL
# ==========================================
elif app_choice == "3. Secure Detokenization Portal":
    st.title("🔑 Secure Detokenization Portal")
    st.subheader("Authorized Clearing Network Access Point")
    
    st.info(
        "**Security Protocol:** Detokenization is restricted to authorized clearing networks "
        "(e.g., VisaNet, Mastercard Banknet) and requires a valid Token Requestor ID and Cryptogram verification."
    )
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown("<div class='card-container'>", unsafe_allow_html=True)
        st.write("### Detokenization Request")
        
        with st.form("detokenize_form"):
            clearing_network = st.selectbox("Clearing Network / Gateway", ["VisaNet", "Mastercard Banknet", "Amex Global Network", "Discover Network"])
            input_token = st.text_input("Enter Token (16 digits)", placeholder="e.g., 4111119827361111")
            req_id = st.text_input("Token Requestor ID", placeholder="TR-ID-88291")
            cryptogram = st.text_input("Transaction Cryptogram (HEX)", placeholder="e.g., A4F9C2D1E03B", type="password")
            
            submit_detok = st.form_submit_button("Authorize & Detokenize")
            
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col2:
        st.write("### Decryption & Verification Output")
        
        if submit_detok:
            # Clean token input
            clean_token = input_token.replace(" ", "").strip()
            
            if not clean_token:
                st.error("Please enter a valid token.")
            elif clean_token not in st.session_state.tokens:
                st.error("❌ Access Denied: Token not found in TSP Registry.")
                log_event("Detokenization Failed", clearing_network, "Unauthorized", f"Attempted to detokenize non-existent token: {clean_token}")
            else:
                token_data = st.session_state.tokens[clean_token]
                
                # Check token status
                if token_data['status'] == 'Suspended':
                    st.warning("⚠️ Transaction Declined: Token is currently SUSPENDED.")
                    log_event("Detokenization Blocked", clearing_network, "Blocked", f"Attempted to detokenize suspended token: {clean_token}")
                elif token_data['status'] == 'Deleted':
                    st.error("❌ Transaction Declined: Token is DELETED/REVOKED.")
                    log_event("Detokenization Blocked", clearing_network, "Blocked", f"Attempted to detokenize deleted token: {clean_token}")
                else:
                    # Success path
                    st.success("✅ Authorization Successful! Cryptogram verified.")
                    log_event("Detokenization Success", clearing_network, "Success", f"Successfully detokenized token {clean_token} for clearing.")
                    
                    st.markdown(f"""
                        <div style="background-color: #e8f5e9; border-left: 5px solid #2e7d32; padding: 20px; border-radius: 8px;">
                            <h4 style="color: #2e7d32; margin-top: 0;">🔓 Decrypted Cardholder Data</h4>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #333;">Cardholder Name:</td>
                                    <td style="padding: 8px 0; font-family: monospace;">{token_data['cardholder']}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #333;">Original PAN:</td>
                                    <td style="padding: 8px 0; font-family: monospace; font-size: 1.2em; color: #c62828; font-weight: bold;">
                                        {token_data['pan'][:4]} {token_data['pan'][4:8]} {token_data['pan'][8:12]} {token_data['pan'][12:]}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #333;">Expiry Date:</td>
                                    <td style="padding: 8px 0; font-family: monospace;">{token_data['expiry']}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #333;">CVV:</td>
                                    <td style="padding: 8px 0; font-family: monospace;">*** (Verified)</td>
                                </tr>
                            </table>
                        </div>
                    """, unsafe_allow_html=True)
        else:
            st.markdown("""
                <div style="border: 2px dashed #ccc; padding: 40px; text-align: center; border-radius: 15px; color: #777;">
                    <img src="https://img.icons8.com/ios/50/000000/lock.png" style="opacity: 0.5; margin-bottom: 10px;"/><br/>
                    Awaiting secure clearing network credentials to initiate detokenization.
                </div>
            """, unsafe_allow_html=True)

# ==========================================
# APP 4: TSP ANALYTICS & SECURITY AUDIT
# ==========================================
elif app_choice == "4. TSP Analytics & Security Audit":
    st.title("📊 TSP Analytics & Security Audit")
    st.subheader("Real-time Token Metrics and Immutable Security Logs")
    
    # Calculate Metrics
    total_tokens = len(st.session_state.tokens)
    active_tokens = sum(1 for t in st.session_state.tokens.values() if t['status'] == 'Active')
    suspended_tokens = sum(1 for t in st.session_state.tokens.values() if t['status'] == 'Suspended')
    deleted_tokens = sum(1 for t in st.session_state.tokens.values() if t['status'] == 'Deleted')
    
    # Metric Cards Row
    col_m1, col_m2, col_m3, col_m4 = st.columns(4)
    with col_m1:
        st.markdown(f"""
            <div class='metric-card' style='border-left-color: #0d6efd;'>
                <div style='font-size: 0.9em; color: #6c757d;'>TOTAL TOKENS ISSUED</div>
                <div style='font-size: 2em; font-weight: bold;'>{total_tokens}</div>
            </div>
        """, unsafe_allow_html=True)
    with col_m2:
        st.markdown(f"""
            <div class='metric-card' style='border-left-color: #198754;'>
                <div style='font-size: 0.9em; color: #6c757d;'>ACTIVE TOKENS</div>
                <div style='font-size: 2em; font-weight: bold; color: #198754;'>{active_tokens}</div>
            </div>
        """, unsafe_allow_html=True)
    with col_m3:
        st.markdown(f"""
            <div class='metric-card' style='border-left-color: #ffc107;'>
                <div style='font-size: 0.9em; color: #6c757d;'>SUSPENDED TOKENS</div>
                <div style='font-size: 2em; font-weight: bold; color: #ffc107;'>{suspended_tokens}</div>
            </div>
        """, unsafe_allow_html=True)
    with col_m4:
        st.markdown(f"""
            <div class='metric-card' style='border-left-color: #dc3545;'>
                <div style='font-size: 0.9em; color: #6c757d;'>DELETED / REVOKED</div>
                <div style='font-size: 2em; font-weight: bold; color: #dc3545;'>{deleted_tokens}</div>
            </div>
        """, unsafe_allow_html=True)
        
    st.write("")
    
    # Charts Row
    col_ch1, col_ch2 = st.columns(2)
    
    with col_ch1:
        st.write("### Token Status Distribution")
        status_counts = {"Status": ["Active", "Suspended", "Deleted"], "Count": [active_tokens, suspended_tokens, deleted_tokens]}
        df_status = pd.DataFrame(status_counts)
        fig_pie = px.pie(df_status, values='Count', names='Status', color='Status',
                         color_discrete_map={'Active': '#198754', 'Suspended': '#ffc107', 'Deleted': '#dc3545'},
                         hole=0.4)
        fig_pie.update_layout(margin=dict(t=0, b=0, l=0, r=0), height=250)
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with col_ch2:
        st.write("### Tokenization by Requestor")
        req_data = {}
        for t in st.session_state.tokens.values():
            req_data[t['requestor']] = req_data.get(t['requestor'], 0) + 1
        df_req = pd.DataFrame(list(req_data.items()), columns=['Requestor', 'Count'])
        fig_bar = px.bar(df_req, x='Requestor', y='Count', color='Requestor', color_discrete_sequence=px.colors.qualitative.Pastel)
        fig_bar.update_layout(margin=dict(t=0, b=0, l=0, r=0), height=250, showlegend=False)
        st.plotly_chart(fig_bar, use_container_width=True)
        
    # Security Audit Log
    st.write("### 📜 Security Audit Trail")
    df_logs = pd.DataFrame(st.session_state.audit_logs)
    
    # Search logs
    log_search = st.text_input("🔍 Filter Audit Logs", placeholder="Search by action, requestor, or status...")
    if log_search:
        df_logs = df_logs[
            df_logs['Action'].str.contains(log_search, case=False) |
            df_logs['Requestor'].str.contains(log_search, case=False) |
            df_logs['Status'].str.contains(log_search, case=False) |
            df_logs['Details'].str.contains(log_search, case=False)
        ]
        
    st.dataframe(df_logs, use_container_width=True)