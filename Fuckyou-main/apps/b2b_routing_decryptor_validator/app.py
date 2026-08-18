import streamlit as st
import json
import base64
import os
import datetime
import pandas as pd
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography import x509
from cryptography.x509.oid import NameOID

# Set page configuration
st.set_page_config(
    page_title="B2B Routing & JWE Cryptographic Playground",
    page_icon="🔐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .reportview-container {
        background: #f5f7f9;
    }
    .main .block-container {
        padding-top: 2rem;
    }
    .crypto-header {
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        color: #1E3A8A;
    }
    .jwe-part {
        padding: 8px;
        border-radius: 4px;
        margin: 2px 0;
        font-family: monospace;
        word-break: break-all;
    }
</style>
""", unsafe_allow_html=True)

# --- MOCK DATABASE FOR ROUTING NUMBERS ---
MOCK_ROUTING_DB = {
    "021000021": {"bank": "JPMorgan Chase Bank, N.A.", "city": "New York", "state": "NY"},
    "121000248": {"bank": "Wells Fargo Bank, N.A.", "city": "San Francisco", "state": "CA"},
    "021100756": {"bank": "The Bank of New York Mellon", "city": "New York", "state": "NY"},
    "031000053": {"bank": "PNC Bank, N.A.", "city": "Philadelphia", "state": "PA"},
    "071000013": {"bank": "JPMorgan Chase Bank, N.A.", "city": "Chicago", "state": "IL"},
    "111000025": {"bank": "Bank of America, N.A.", "city": "Dallas", "state": "TX"},
    "122000247": {"bank": "Bank of America, N.A.", "city": "San Francisco", "state": "CA"},
    "051000017": {"bank": "Bank of America, N.A.", "city": "Richmond", "state": "VA"},
    "091000019": {"bank": "Wells Fargo Bank, N.A.", "city": "Minneapolis", "state": "MN"},
    "101000019": {"bank": "Commerce Bank", "city": "Kansas City", "state": "MO"}
}

# --- CRYPTOGRAPHIC HELPER FUNCTIONS ---

def generate_key_pair():
    """Generates a real RSA key pair and a self-signed certificate for x5c simulation."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    public_key = private_key.public_key()
    
    # Generate self-signed cert for x5c
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, u"b2b-routing-validator.example.com"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"B2B Cryptographic Services Inc."),
    ])
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        public_key
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.datetime.utcnow() - datetime.timedelta(days=1)
    ).not_valid_after(
        datetime.datetime.utcnow() + datetime.timedelta(days=365)
    ).sign(private_key, hashes.SHA256())
    
    cert_der = cert.public_bytes(serialization.Encoding.DER)
    cert_b64 = base64.b64encode(cert_der).decode()
    
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode()
    
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode()
    
    return private_pem, public_pem, cert_b64

def encrypt_jwe(payload_str, public_key_pem, kid="key-auth-b2b-01", x5c_b64=None):
    """Encrypts a payload into a standard JWE compact serialization format."""
    public_key = serialization.load_pem_public_key(public_key_pem.encode())
    
    # 1. Header
    header = {
        "alg": "RSA-OAEP-256",
        "enc": "A256GCM",
        "kid": kid
    }
    if x5c_b64:
        header["x5c"] = [x5c_b64]
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    
    # 2. Generate Content Encryption Key (CEK)
    cek = AESGCM.generate_key(bit_length=256)
    
    # 3. Encrypt CEK with RSA Public Key
    encrypted_key = public_key.encrypt(
        cek,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    encrypted_key_b64 = base64.urlsafe_b64encode(encrypted_key).decode().rstrip("=")
    
    # 4. Initialization Vector (IV)
    iv = os.urandom(12)
    iv_b64 = base64.urlsafe_b64encode(iv).decode().rstrip("=")
    
    # 5. Ciphertext & Authentication Tag
    aesgcm = AESGCM(cek)
    aad = header_b64.encode()
    ciphertext_with_tag = aesgcm.encrypt(iv, payload_str.encode(), aad)
    
    # AESGCM in cryptography returns ciphertext + 16-byte tag
    ciphertext = ciphertext_with_tag[:-16]
    tag = ciphertext_with_tag[-16:]
    
    ciphertext_b64 = base64.urlsafe_b64encode(ciphertext).decode().rstrip("=")
    tag_b64 = base64.urlsafe_b64encode(tag).decode().rstrip("=")
    
    return f"{header_b64}.{encrypted_key_b64}.{iv_b64}.{ciphertext_b64}.{tag_b64}"

def decrypt_jwe(jwe_str, private_key_pem):
    """Decrypts a standard JWE compact serialization string."""
    private_key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
    
    parts = jwe_str.split(".")
    if len(parts) != 5:
        raise ValueError("Invalid JWE format. Must have exactly 5 parts separated by dots.")
    
    header_b64, encrypted_key_b64, iv_b64, ciphertext_b64, tag_b64 = parts
    
    def b64_decode(s):
        s += "=" * ((4 - len(s) % 4) % 4)
        return base64.urlsafe_b64decode(s)
    
    header = json.loads(b64_decode(header_b64).decode())
    encrypted_key = b64_decode(encrypted_key_b64)
    iv = b64_decode(iv_b64)
    ciphertext = b64_decode(ciphertext_b64)
    tag = b64_decode(tag_b64)
    
    # Decrypt CEK
    cek = private_key.decrypt(
        encrypted_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    # Decrypt Ciphertext
    aesgcm = AESGCM(cek)
    aad = header_b64.encode()
    decrypted_payload = aesgcm.decrypt(iv, ciphertext + tag, aad)
    
    return header, decrypted_payload.decode()

# --- ABA ROUTING NUMBER VALIDATION ---

def validate_aba_routing(routing_num: str):
    """Validates a 9-digit ABA routing number using the standard checksum formula."""
    clean_num = "".join(c for c in routing_num if c.isdigit())
    if len(clean_num) != 9:
        return False, "Routing number must be exactly 9 digits.", None, None
    
    d = [int(char) for char in clean_num]
    # Checksum formula: 3(d1 + d4 + d7) + 7(d2 + d5 + d8) + (d3 + d6 + d9)
    checksum = (3 * (d[0] + d[3] + d[6]) +
                7 * (d[1] + d[4] + d[7]) +
                1 * (d[2] + d[5] + d[8])) % 10
    
    is_valid = (checksum == 0)
    
    bank_info = MOCK_ROUTING_DB.get(clean_num, {
        "bank": "Unknown / Unregistered Bank",
        "city": "Unknown",
        "state": "Unknown"
    })
    
    steps = {
        "digits": d,
        "formula": f"3*({d[0]} + {d[3]} + {d[6]}) + 7*({d[1]} + {d[4]} + {d[7]}) + 1*({d[2]} + {d[5]} + {d[8]})",
        "sum_calc": f"3*({d[0]+d[3]+d[6]}) + 7*({d[1]+d[4]+d[7]}) + 1*({d[2]+d[5]+d[8]}) = {3*(d[0]+d[3]+d[6]) + 7*(d[1]+d[4]+d[7]) + 1*(d[2]+d[5]+d[8])}",
        "mod_calc": f"{3*(d[0]+d[3]+d[6]) + 7*(d[1]+d[4]+d[7]) + 1*(d[2]+d[5]+d[8])} mod 10 = {checksum}",
        "checksum": checksum
    }
    
    if is_valid:
        return True, "Valid ABA Routing Number.", bank_info, steps
    else:
        return False, f"Invalid checksum. Expected remainder 0, got {checksum}.", bank_info, steps

# --- SESSION STATE INITIALIZATION ---
if "private_key_pem" not in st.session_state:
    priv, pub, cert = generate_key_pair()
    st.session_state.private_key_pem = priv
    st.session_state.public_key_pem = pub
    st.session_state.cert_b64 = cert

# --- SIDEBAR NAVIGATION ---
st.sidebar.title("🔐 B2B Crypto Suite")
st.sidebar.markdown("---")
app_mode = st.sidebar.radio(
    "Select Application Tool:",
    [
        "1. JWE Decryptor & Header Inspector",
        "2. ABA Routing Number Validator",
        "3. JWE Mock Generator (Encryptor)",
        "4. Batch Pipeline Simulator"
    ]
)

st.sidebar.markdown("---")
st.sidebar.subheader("🔑 Active Keypair (Auto-Generated)")
with st.sidebar.expander("View Public Key / Cert"):
    st.code(st.session_state.public_key_pem, language="text")
    st.caption("X.509 Certificate (Base64 DER):")
    st.code(st.session_state.cert_b64[:60] + "...", language="text")

if st.sidebar.button("🔄 Regenerate Keypair"):
    priv, pub, cert = generate_key_pair()
    st.session_state.private_key_pem = priv
    st.session_state.public_key_pem = pub
    st.session_state.cert_b64 = cert
    st.sidebar.success("New keypair generated!")
    st.rerun()

# --- APP 1: JWE DECRYPTOR & HEADER INSPECTOR ---
if app_mode == "1. JWE Decryptor & Header Inspector":
    st.title("🔐 JWE Decryptor & Header Inspector")
    st.markdown("""
    This tool simulates the decryption of a JSON Web Encryption (JWE) compact serialization token. 
    It parses the 5 distinct parts of the JWE, extracts the protected headers (including `alg`, `enc`, `kid`, and `x5c`), 
    and decrypts the payload using the corresponding private key.
    """)

    col1, col2 = st.columns([2, 1])

    with col2:
        st.subheader("💡 Quick Sample")
        if st.button("Load Sample JWE Token"):
            sample_payload = json.dumps({
                "account_number": "9876543210",
                "routing_number": "021000021",
                "holder_name": "Acme Corp Treasury"
            })
            sample_jwe = encrypt_jwe(
                sample_payload, 
                st.session_state.public_key_pem, 
                kid="key-auth-b2b-01", 
                x5c_b64=st.session_state.cert_b64
            )
            st.session_state.sample_jwe_input = sample_jwe
            st.success("Sample JWE loaded into input field!")

    with col1:
        jwe_input = st.text_area(
            "Paste JWE Compact Serialization String:",
            value=st.session_state.get("sample_jwe_input", ""),
            placeholder="header.encryptedKey.iv.ciphertext.tag",
            height=150
        )

    if jwe_input:
        parts = jwe_input.strip().split(".")
        if len(parts) != 5:
            st.error("❌ Invalid JWE format. A valid JWE compact serialization must contain exactly 5 parts separated by dots.")
        else:
            st.success("✅ Valid JWE structure detected (5 parts).")
            
            # Color-coded visualization
            st.subheader("📦 JWE Structure Breakdown")
            colors = ["#FF4B4B", "#1C83E1", "#00C0F2", "#FFD166", "#06D6A0"]
            labels = ["1. Protected Header", "2. Encrypted Key", "3. Initialization Vector", "4. Ciphertext", "5. Authentication Tag"]
            
            for i, part in enumerate(parts):
                st.markdown(f"""
                <div style="border-left: 5px solid {colors[i]}; padding-left: 10px; margin-bottom: 10px;">
                    <strong style="color: {colors[i]};">{labels[i]}</strong><br/>
                    <span style="font-family: monospace; word-break: break-all; font-size: 12px; color: #555;">{part}</span>
                </div>
                """, unsafe_allow_html=True)

            # Header Inspection
            st.subheader("🔍 Header Inspection")
            try:
                header_padding = parts[0] + "=" * ((4 - len(parts[0]) % 4) % 4)
                header_json = json.loads(base64.urlsafe_b64decode(header_padding).decode())
                st.json(header_json)
                
                # Highlight key headers
                h_col1, h_col2, h_col3 = st.columns(3)
                h_col1.metric("Algorithm (alg)", header_json.get("alg", "N/A"))
                h_col2.metric("Encryption (enc)", header_json.get("enc", "N/A"))
                h_col3.metric("Key ID (kid)", header_json.get("kid", "N/A"))
                
                if "x5c" in header_json:
                    with st.expander("📜 View X.509 Certificate Chain (x5c)"):
                        st.info("The x5c header contains the X.509 public key certificate corresponding to the key used to encrypt the data.")
                        st.code(header_json["x5c"][0], language="text")
            except Exception as e:
                st.error(f"Failed to parse JWE Header: {str(e)}")

            # Decryption
            st.subheader("🔓 Decrypted Payload")
            private_key_input = st.text_area(
                "Private Key for Decryption (PEM format):",
                value=st.session_state.private_key_pem,
                height=150
            )
            
            if st.button("Decrypt JWE"):
                try:
                    header, decrypted_text = decrypt_jwe(jwe_input.strip(), private_key_input)
                    st.success("🎉 Decryption Successful!")
                    
                    # Try parsing as JSON for pretty printing
                    try:
                        decrypted_json = json.loads(decrypted_text)
                        st.json(decrypted_json)
                        
                        # Check if routing number is present and validate it
                        if "routing_number" in decrypted_json:
                            st.markdown("---")
                            st.subheader("🔍 Auto-Detected Routing Number Validation")
                            rn = decrypted_json["routing_number"]
                            valid, msg, bank, steps = validate_aba_routing(rn)
                            if valid:
                                st.success(f"✅ Routing Number {rn} is VALID: {bank['bank']} ({bank['city']}, {bank['state']})")
                            else:
                                st.error(f"❌ Routing Number {rn} is INVALID: {msg}")
                    except json.JSONDecodeError:
                        st.code(decrypted_text, language="text")
                except Exception as e:
                    st.error(f"❌ Decryption Failed: {str(e)}")
                    st.info("Ensure you are using the correct private key that matches the public key used for encryption.")

# --- APP 2: ABA ROUTING NUMBER VALIDATION ---
elif app_mode == "2. ABA Routing Number Validator":
    st.title("🔢 ABA Routing Number Validator")
    st.markdown("""
    Validate any 9-digit American Bankers Association (ABA) routing transit number (RTN) using the standard checksum formula.
    The formula is:
    $$\\text{Checksum} = [3(d_1 + d_4 + d_7) + 7(d_2 + d_5 + d_8) + (d_3 + d_6 + d_9)] \\pmod{10} == 0$$
    """)

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Validate Routing Number")
        routing_input = st.text_input("Enter 9-Digit Routing Number:", value="021000021", max_chars=12)
        
        if routing_input:
            is_valid, message, bank_info, steps = validate_aba_routing(routing_input)
            
            if is_valid:
                st.success(f"✅ **{message}**")
                st.metric("Bank Name", bank_info["bank"])
                st.metric("Location", f"{bank_info['city']}, {bank_info['state']}")
            else:
                st.error(f"❌ **{message}**")
                if bank_info and bank_info["bank"] != "Unknown / Unregistered Bank":
                    st.warning(f"Note: Matches mock database for '{bank_info['bank']}' but failed checksum.")

    with col2:
        st.subheader("🧮 Checksum Math Breakdown")
        if routing_input and len("".join(c for c in routing_input if c.isdigit())) == 9:
            st.markdown(f"**Digits extracted:** `{steps['digits']}`")
            st.markdown(f"**Formula applied:**")
            st.latex(r"3(d_1 + d_4 + d_7) + 7(d_2 + d_5 + d_8) + 1(d_3 + d_6 + d_9)")
            st.markdown(f"**Calculation:**")
            st.code(steps["sum_calc"], language="text")
            st.code(steps["mod_calc"], language="text")
            
            if steps["checksum"] == 0:
                st.info("Since the remainder is 0, the routing number is mathematically valid.")
            else:
                st.error(f"Since the remainder is {steps['checksum']} (not 0), the routing number is invalid.")
        else:
            st.info("Enter a valid 9-digit routing number to see the step-by-step mathematical validation.")

    st.markdown("---")
    st.subheader("📋 Quick Reference / Test Cases")
    st.markdown("Use these valid routing numbers from our mock database to test:")
    
    ref_data = []
    for k, v in MOCK_ROUTING_DB.items():
        ref_data.append({"Routing Number": k, "Bank": v["bank"], "Location": f"{v['city']}, {v['state']}"})
    st.table(pd.DataFrame(ref_data))

# --- APP 3: JWE MOCK GENERATOR (ENCRYPTOR) ---
elif app_mode == "3. JWE Mock Generator (Encryptor)":
    st.title("🛠️ JWE Mock Generator (Encryptor)")
    st.markdown("""
    Generate standard JWE-encrypted payloads containing sensitive B2B routing and account details. 
    This tool uses the public key from the active keypair to perform RSA-OAEP-256 key encryption and AES-256-GCM content encryption.
    """)

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("📝 Payload Configuration")
        account_num = st.text_input("Account Number:", value="1234567890")
        routing_num = st.selectbox("Routing Number (Select or Type):", list(MOCK_ROUTING_DB.keys()))
        holder_name = st.text_input("Account Holder Name:", value="Acme Corporation")
        
        custom_payload = {
            "account_number": account_num,
            "routing_number": routing_num,
            "holder_name": holder_name,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        st.markdown("**Payload Preview (JSON):**")
        st.json(custom_payload)

    with col2:
        st.subheader("⚙️ Encryption Settings")
        alg = st.selectbox("Key Encryption Algorithm (alg):", ["RSA-OAEP-256"])
        enc = st.selectbox("Content Encryption Algorithm (enc):", ["A256GCM"])
        kid = st.text_input("Key ID (kid):", value="key-auth-b2b-01")
        include_x5c = st.checkbox("Include X.509 Certificate Chain (x5c) in Header", value=True)
        
        public_key_input = st.text_area(
            "Recipient Public Key (PEM):",
            value=st.session_state.public_key_pem,
            height=120
        )

    if st.button("⚡ Generate JWE Token"):
        try:
            x5c_val = st.session_state.cert_b64 if include_x5c else None
            jwe_token = encrypt_jwe(
                json.dumps(custom_payload),
                public_key_input,
                kid=kid,
                x5c_b64=x5c_val
            )
            st.success("🎉 JWE Token Generated Successfully!")
            
            st.subheader("📦 Compact JWE Token")
            st.code(jwe_token, language="text")
            
            # Color-coded breakdown
            parts = jwe_token.split(".")
            colors = ["#FF4B4B", "#1C83E1", "#00C0F2", "#FFD166", "#06D6A0"]
            labels = ["Header", "Encrypted Key", "IV", "Ciphertext", "Tag"]
            
            st.markdown("**Color-Coded JWE Parts:**")
            html_str = "<div style='font-family: monospace; word-break: break-all; font-size: 14px; line-height: 1.8;'>"
            for i, part in enumerate(parts):
                html_str += f"<span style='color: {colors[i]}; font-weight: bold;' title='{labels[i]}'>{part}</span>"
                if i < 4:
                    html_str += "<span style='color: #888;'>.</span>"
            html_str += "</div>"
            st.markdown(html_str, unsafe_allow_html=True)
            
        except Exception as e:
            st.error(f"Encryption failed: {str(e)}")

# --- APP 4: BATCH PIPELINE SIMULATOR ---
elif app_mode == "4. Batch Pipeline Simulator":
    st.title("📊 Batch Pipeline Simulator")
    st.markdown("""
    Simulate a high-throughput B2B payment processing pipeline. Upload or generate a batch of transactions, 
    decrypt the payloads, validate the routing numbers, and view the pipeline metrics.
    """)

    # Generate Mock Batch Data
    if st.button("🔄 Generate Mock Batch Data"):
        batch_data = []
        # 1. Valid JPMorgan Chase
        p1 = json.dumps({"account_number": "100020003", "routing_number": "021000021", "holder": "Alpha LLC"})
        j1 = encrypt_jwe(p1, st.session_state.public_key_pem, x5c_b64=st.session_state.cert_b64)
        batch_data.append({"Transaction ID": "TXN-001", "Encrypted Payload (JWE)": j1, "Expected Status": "Valid"})
        
        # 2. Valid Wells Fargo
        p2 = json.dumps({"account_number": "555666777", "routing_number": "121000248", "holder": "Beta Corp"})
        j2 = encrypt_jwe(p2, st.session_state.public_key_pem, x5c_b64=st.session_state.cert_b64)
        batch_data.append({"Transaction ID": "TXN-002", "Encrypted Payload (JWE)": j2, "Expected Status": "Valid"})
        
        # 3. Invalid Routing Number Checksum
        p3 = json.dumps({"account_number": "999999999", "routing_number": "121000249", "holder": "Gamma Inc"}) # Last digit changed to 9
        j3 = encrypt_jwe(p3, st.session_state.public_key_pem, x5c_b64=st.session_state.cert_b64)
        batch_data.append({"Transaction ID": "TXN-003", "Encrypted Payload (JWE)": j3, "Expected Status": "Invalid Routing Checksum"})
        
        # 4. Malformed JWE
        batch_data.append({"Transaction ID": "TXN-004", "Encrypted Payload (JWE)": "eyJhbGciOiJSU0EtT0FFUC0yNTYifQ.malformed.token", "Expected Status": "Malformed JWE"})
        
        st.session_state.batch_df = pd.DataFrame(batch_data)
        st.success("Generated 4 mock transactions in the pipeline!")

    if "batch_df" in st.session_state:
        st.subheader("📥 Input Batch Data")
        st.dataframe(st.session_state.batch_df, use_container_width=True)
        
        if st.button("🚀 Run Pipeline Processing"):
            results = []
            valid_count = 0
            invalid_count = 0
            malformed_count = 0
            
            for index, row in st.session_state.batch_df.iterrows():
                txn_id = row["Transaction ID"]
                jwe_str = row["Encrypted Payload (JWE)"]
                
                try:
                    # Decrypt
                    header, decrypted_text = decrypt_jwe(jwe_str, st.session_state.private_key_pem)
                    payload = json.loads(decrypted_text)
                    
                    # Validate Routing
                    rn = payload.get("routing_number", "")
                    is_valid, msg, bank_info, _ = validate_aba_routing(rn)
                    
                    if is_valid:
                        status = "SUCCESS"
                        details = f"Decrypted. Valid Routing: {bank_info['bank']}"
                        valid_count += 1
                    else:
                        status = "FAILED_VALIDATION"
                        details = f"Decrypted. Invalid Routing: {msg}"
                        invalid_count += 1
                        
                    results.append({
                        "Transaction ID": txn_id,
                        "Status": status,
                        "Account Holder": payload.get("holder", "N/A"),
                        "Routing Number": rn,
                        "Bank Name": bank_info.get("bank", "N/A") if bank_info else "N/A",
                        "Details": details
                    })
                except Exception as e:
                    status = "DECRYPTION_FAILED"
                    malformed_count += 1
                    results.append({
                        "Transaction ID": txn_id,
                        "Status": status,
                        "Account Holder": "N/A",
                        "Routing Number": "N/A",
                        "Bank Name": "N/A",
                        "Details": f"Error: {str(e)}"
                    })
            
            results_df = pd.DataFrame(results)
            
            st.markdown("---")
            st.subheader("📊 Pipeline Execution Dashboard")
            
            # Metrics
            m_col1, m_col2, m_col3, m_col4 = st.columns(4)
            m_col1.metric("Total Processed", len(results_df))
            m_col2.metric("Success (Valid)", valid_count, delta_color="normal")
            m_col3.metric("Failed Validation", invalid_count, delta_color="inverse")
            m_col4.metric("Decryption Failures", malformed_count, delta_color="inverse")
            
            st.subheader("📋 Processed Results")
            
            # Style helper for dataframe
            def style_status(val):
                if val == "SUCCESS":
                    return "background-color: #d4edda; color: #155724;"
                elif val == "FAILED_VALIDATION":
                    return "background-color: #fff3cd; color: #856404;"
                else:
                    return "background-color: #f8d7da; color: #721c24;"
            
            st.dataframe(results_df.style.applymap(style_status, subset=["Status"]), use_container_width=True)
            
            # Download Results
            csv = results_df.to_csv(index=False).encode('utf-8')
            st.download_button(
                "📥 Download Pipeline Report (CSV)",
                csv,
                "b2b_pipeline_report.csv",
                "text/csv",
                key="download-csv"
            )
    else:
        st.info("Click 'Generate Mock Batch Data' above to populate the pipeline simulator with test transactions.")