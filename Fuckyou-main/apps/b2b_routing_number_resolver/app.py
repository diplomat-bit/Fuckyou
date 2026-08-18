import streamlit as st
import json
import base64
import os
import time
import pandas as pd
from datetime import datetime

# Cryptography imports for real JWE simulation
try:
    from cryptography.hazmat.primitives.asymmetric import rsa, padding
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False

# -----------------------------------------------------------------------------
# CONSTANTS & REGISTRY DATA
# -----------------------------------------------------------------------------
ABA_REGISTRY = {
    "021000021": {
        "bank_name": "JPMorgan Chase Bank, N.A.",
        "city": "New York",
        "state": "NY",
        "ach": True,
        "wire": True,
        "rtp": True,
        "fednow": True,
        "status": "Active"
    },
    "121000248": {
        "bank_name": "Wells Fargo Bank, N.A.",
        "city": "San Francisco",
        "state": "CA",
        "ach": True,
        "wire": True,
        "rtp": True,
        "fednow": True,
        "status": "Active"
    },
    "026009593": {
        "bank_name": "Bank of America, N.A.",
        "city": "Charlotte",
        "state": "NC",
        "ach": True,
        "wire": True,
        "rtp": True,
        "fednow": False,
        "status": "Active"
    },
    "021000089": {
        "bank_name": "Citibank, N.A.",
        "city": "New York",
        "state": "NY",
        "ach": True,
        "wire": True,
        "rtp": True,
        "fednow": False,
        "status": "Active"
    },
    "071000013": {
        "bank_name": "Harris N.A.",
        "city": "Chicago",
        "state": "IL",
        "ach": True,
        "wire": True,
        "rtp": False,
        "fednow": False,
        "status": "Active"
    },
    "043000096": {
        "bank_name": "KeyBank N.A.",
        "city": "Cleveland",
        "state": "OH",
        "ach": True,
        "wire": True,
        "rtp": True,
        "fednow": True,
        "status": "Active"
    },
    "121140399": {
        "bank_name": "Silicon Valley Bank (Bridge)",
        "city": "Santa Clara",
        "state": "CA",
        "ach": True,
        "wire": True,
        "rtp": False,
        "fednow": False,
        "status": "Active"
    },
    "021200025": {
        "bank_name": "The Bank of New York Mellon",
        "city": "New York",
        "state": "NY",
        "ach": True,
        "wire": True,
        "rtp": True,
        "fednow": True,
        "status": "Active"
    },
}

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------
def validate_aba_checksum(routing: str) -> bool:
    """Validates ABA routing number using the standard checksum formula."""
    if not routing or len(routing) != 9 or not routing.isdigit():
        return False
    d = [int(char) for char in routing]
    checksum = (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10
    return checksum == 0

def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def b64url_decode(data: str) -> bytes:
    padding = '=' * (4 - len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

# -----------------------------------------------------------------------------
# JWE SIMULATOR CLASS
# -----------------------------------------------------------------------------
class JWESimulator:
    @staticmethod
    def generate_key_pair():
        if not CRYPTOGRAPHY_AVAILABLE:
            return None, None
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()
        
        # Serialize keys to PEM
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode('utf-8')
        
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
        
        return private_pem, public_pem

    @staticmethod
    def encrypt(payload_dict: dict, public_key_pem: str) -> dict:
        if not CRYPTOGRAPHY_AVAILABLE:
            # Fallback mock encryption if cryptography is not installed
            mock_payload = json.dumps(payload_dict).encode('utf-8')
            mock_b64 = base64.b64encode(mock_payload).decode('utf-8')
            return {
                "jwe_compact": f"eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0..bW9ja19rZXk.{mock_b64}.bW9ja190YWc",
                "header": {"alg": "RSA-OAEP-256", "enc": "A256GCM"},
                "encrypted_key": "mock_encrypted_key",
                "iv": "mock_iv",
                "ciphertext": mock_b64,
                "tag": "mock_tag",
                "aad": "eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0"
            }

        try:
            # Load public key
            public_key = serialization.load_pem_public_key(public_key_pem.encode('utf-8'))
            
            # 1. Generate random 256-bit Content Encryption Key (CEK)
            cek = os.urandom(32)
            
            # 2. Encrypt CEK with RSA-OAEP-256
            encrypted_key = public_key.encrypt(
                cek,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # 3. Generate 96-bit IV
            iv = os.urandom(12)
            
            # 4. Prepare Protected Header
            header = {"alg": "RSA-OAEP-256", "enc": "A256GCM"}
            header_json = json.dumps(header).encode('utf-8')
            aad = b64url_encode(header_json)
            
            # 5. Encrypt payload with AES-GCM
            aesgcm = AESGCM(cek)
            payload_bytes = json.dumps(payload_dict).encode('utf-8')
            
            # AESGCM encrypt returns ciphertext + tag concatenated
            ciphertext_with_tag = aesgcm.encrypt(iv, payload_bytes, aad.encode('utf-8'))
            
            # Split ciphertext and tag (AES-GCM tag is 16 bytes)
            ciphertext = ciphertext_with_tag[:-16]
            tag = ciphertext_with_tag[-16:]
            
            # 6. Construct JWE Compact Serialization
            jwe_compact = (
                f"{aad}."
                f"{b64url_encode(encrypted_key)}."
                f"{b64url_encode(iv)}."
                f"{b64url_encode(ciphertext)}."
                f"{b64url_encode(tag)}"
            )
            
            return {
                "jwe_compact": jwe_compact,
                "header": header,
                "encrypted_key": b64url_encode(encrypted_key),
                "iv": b64url_encode(iv),
                "ciphertext": b64url_encode(ciphertext),
                "tag": b64url_encode(tag),
                "aad": aad
            }
        except Exception as e:
            raise ValueError(f"Encryption failed: {str(e)}")

    @staticmethod
    def decrypt(jwe_compact: str, private_key_pem: str) -> dict:
        if not CRYPTOGRAPHY_AVAILABLE:
            # Fallback mock decryption
            try:
                parts = jwe_compact.split('.')
                if len(parts) == 5:
                    decoded = base64.b64decode(parts[3]).decode('utf-8')
                    return json.loads(decoded)
                raise ValueError("Invalid JWE structure")
            except Exception:
                return {"error": "Mock decryption failed. Ensure valid mock JWE format."}

        try:
            parts = jwe_compact.split('.')
            if len(parts) != 5:
                raise ValueError("JWE Compact representation must have exactly 5 parts separated by dots.")
            
            aad_b64, enc_key_b64, iv_b64, ciphertext_b64, tag_b64 = parts
            
            # Decode parts
            encrypted_key = b64url_decode(enc_key_b64)
            iv = b64url_decode(iv_b64)
            ciphertext = b64url_decode(ciphertext_b64)
            tag = b64url_decode(tag_b64)
            
            # Load private key
            private_key = serialization.load_pem_private_key(
                private_key_pem.encode('utf-8'),
                password=None
            )
            
            # Decrypt CEK
            cek = private_key.decrypt(
                encrypted_key,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Reconstruct ciphertext with tag for cryptography library
            ciphertext_with_tag = ciphertext + tag
            
            # Decrypt payload
            aesgcm = AESGCM(cek)
            decrypted_bytes = aesgcm.decrypt(iv, ciphertext_with_tag, aad_b64.encode('utf-8'))
            
            return json.loads(decrypted_bytes.decode('utf-8'))
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")

# -----------------------------------------------------------------------------
# STREAMLIT APP SETUP
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="B2B Routing & JWE Sandbox",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state for keys
if "private_key" not in st.session_state or "public_key" not in st.session_state:
    if CRYPTOGRAPHY_AVAILABLE:
        priv, pub = JWESimulator.generate_key_pair()
        st.session_state["private_key"] = priv
        st.session_state["public_key"] = pub
    else:
        st.session_state["private_key"] = "MOCK_PRIVATE_KEY"
        st.session_state["public_key"] = "MOCK_PUBLIC_KEY"

# -----------------------------------------------------------------------------
# SIDEBAR
# -----------------------------------------------------------------------------
with st.sidebar:
    st.title("⚙️ Sandbox Settings")
    st.markdown("Configure the cryptographic keys and environment parameters for the B2B routing simulator.")
    
    st.subheader("🔑 RSA Key Pair (2048-bit)")
    if st.button("🔄 Regenerate Key Pair"):
        if CRYPTOGRAPHY_AVAILABLE:
            priv, pub = JWESimulator.generate_key_pair()
            st.session_state["private_key"] = priv
            st.session_state["public_key"] = pub
            st.success("New RSA key pair generated!")
        else:
            st.warning("Cryptography library not available. Using mock keys.")
            
    st.text_area("Public Key (PEM)", st.session_state["public_key"], height=120, disabled=True)
    st.text_area("Private Key (PEM)", st.session_state["private_key"], height=120, disabled=True)
    
    st.markdown("---")
    st.markdown("### 🛠️ System Status")
    if CRYPTOGRAPHY_AVAILABLE:
        st.success("Real Cryptography Active (AES-GCM / RSA-OAEP-256)")
    else:
        st.warning("Mock Cryptography Active (Base64 Fallback)")
    st.info(f"Registry Size: {len(ABA_REGISTRY)} Banks")

# -----------------------------------------------------------------------------
# MAIN INTERFACE
# -----------------------------------------------------------------------------
st.title("💳 B2B Routing Number Resolver & JWE Sandbox")
st.markdown(
    "This application simulates secure B2B payment routing, validates ABA routing numbers, "
    "and provides a complete cryptographic sandbox for JWE (JSON Web Encryption) payloads."
)

# Create 4 distinct sub-apps using tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "🔍 ABA Routing Validator",
    "🔐 JWE Cryptography Sandbox",
    "⚡ B2B Payment Router",
    "🔌 API Endpoint Mock"
])

# =============================================================================
# APP 1: ABA ROUTING VALIDATOR
# =============================================================================
with tab1:
    st.header("🔍 ABA Routing Number Registry & Validator")
    st.markdown(
        "Validate American Bankers Association (ABA) routing numbers using the standard Mod 10 checksum algorithm "
        "and cross-reference them against our built-in high-value B2B clearing registry."
    )
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Validate Routing Number")
        input_routing = st.text_input("Enter 9-Digit Routing Number", value="021000021", max_chars=9)
        
        if input_routing:
            is_valid_format = len(input_routing) == 9 and input_routing.isdigit()
            is_valid_checksum = validate_aba_checksum(input_routing)
            in_registry = input_routing in ABA_REGISTRY
            
            # Visual feedback
            if not is_valid_format:
                st.error("❌ Invalid Format: Must be exactly 9 digits.")
            elif not is_valid_checksum:
                st.error("❌ Invalid Checksum: Failed Mod 10 validation.")
            else:
                st.success("✅ Valid ABA Routing Number (Checksum Passed)")
                
                if in_registry:
                    bank_info = ABA_REGISTRY[input_routing]
                    st.info(f"🏦 **Registry Match Found!**\n\n"
                            f"**Bank:** {bank_info['bank_name']}\n\n"
                            f"**Location:** {bank_info['city']}, {bank_info['state']}\n\n"
                            f"**Status:** {bank_info['status']}")
                else:
                    st.warning("⚠️ Valid checksum, but not found in our high-value B2B registry.")
                    
            # Checksum breakdown explanation
            with st.expander("ℹ️ How the Mod 10 Checksum Works"):
                st.markdown("""
                The formula for validating an ABA routing number ($d_1$ to $d_9$) is:
                $$\sum = 3(d_1 + d_4 + d_7) + 7(d_2 + d_5 + d_8) + (d_3 + d_6 + d_9)$$
                If $\sum \pmod{10} \equiv 0$, the routing number is mathematically valid.
                """)
                if is_valid_format:
                    d = [int(x) for x in input_routing]
                    sum_val = 3*(d[0]+d[3]+d[6]) + 7*(d[1]+d[4]+d[7]) + (d[2]+d[5]+d[8])
                    st.code(f"3*({d[0]}+{d[3]}+{d[6]}) + 7*({d[1]}+{d[4]}+{d[7]}) + ({d[2]}+{d[5]}+{d[8]}) = {sum_val}\n"
                            f"{sum_val} % 10 = {sum_val % 10} ({'Passed' if sum_val % 10 == 0 else 'Failed'})")

    with col2:
        st.subheader("Built-in B2B Clearing Registry")
        st.markdown("This registry simulates the Federal Reserve's E-Payments Routing Directory for high-value B2B participants.")
        
        # Convert registry to DataFrame for display
        registry_data = []
        for r_num, info in ABA_REGISTRY.items():
            registry_data.append({
                "Routing Number": r_num,
                "Bank Name": info["bank_name"],
                "City/State": f"{info['city']}, {info['state']}",
                "ACH": "✅ Yes" if info["ach"] else "❌ No",
                "Wire": "✅ Yes" if info["wire"] else "❌ No",
                "RTP": "✅ Yes" if info["rtp"] else "❌ No",
                "FedNow": "✅ Yes" if info["fednow"] else "❌ No",
                "Status": info["status"]
            })
        
        df_registry = pd.DataFrame(registry_data)
        st.dataframe(df_registry, use_container_width=True)
        
        # Add custom bank to registry for session
        with st.expander("➕ Add Custom Bank to Registry (Sandbox Session Only)"):
            new_routing = st.text_input("New Routing Number", max_chars=9)
            new_name = st.text_input("Bank Name", value="Sandbox Federal Credit Union")
            new_city = st.text_input("City", value="Austin")
            new_state = st.text_input("State", value="TX")
            
            col_a, col_b, col_c, col_d = st.columns(4)
            new_ach = col_a.checkbox("ACH Support", value=True)
            new_wire = col_b.checkbox("Wire Support", value=True)
            new_rtp = col_c.checkbox("RTP Support", value=False)
            new_fednow = col_d.checkbox("FedNow Support", value=False)
            
            if st.button("Register Bank"):
                if not validate_aba_checksum(new_routing):
                    st.error("Cannot register: Routing number fails checksum validation.")
                else:
                    ABA_REGISTRY[new_routing] = {
                        "bank_name": new_name,
                        "city": new_city,
                        "state": new_state,
                        "ach": new_ach,
                        "wire": new_wire,
                        "rtp": new_rtp,
                        "fednow": new_fednow,
                        "status": "Active"
                    }
                    st.success(f"Successfully registered {new_name} ({new_routing})!")
                    st.rerun()

# =============================================================================
# APP 2: JWE CRYPTOGRAPHY SANDBOX
# =============================================================================
with tab2:
    st.header("🔐 JWE Encrypter / Decrypter Sandbox")
    st.markdown(
        "Simulate the secure exchange of sensitive payment credentials. This sandbox encrypts and decrypts "
        "account and routing numbers using the **JSON Web Encryption (JWE)** standard (RFC 7516)."
    )
    
    jwe_col1, jwe_col2 = st.columns(2)
    
    with jwe_col1:
        st.subheader("🔒 Encrypt Payload")
        st.markdown("Encrypt sensitive bank details into a secure JWE compact token.")
        
        enc_routing = st.selectbox("Select Routing Number", list(ABA_REGISTRY.keys()), index=0)
        enc_account = st.text_input("Account Number", value="123456789012")
        enc_account_type = st.selectbox("Account Type", ["Checking", "Savings", "Corporate Clearing"])
        
        payload_to_encrypt = {
            "routingNumber": enc_routing,
            "accountNumber": enc_account,
            "accountType": enc_account_type,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        st.markdown("**Payload Preview (JSON):**")
        st.json(payload_to_encrypt)
        
        if st.button("🔐 Generate JWE Token"):
            try:
                jwe_result = JWESimulator.encrypt(payload_to_encrypt, st.session_state["public_key"])
                st.session_state["last_jwe"] = jwe_result["jwe_compact"]
                
                st.success("JWE Token Generated Successfully!")
                st.text_area("JWE Compact Representation (Copy this)", jwe_result["jwe_compact"], height=120)
                
                with st.expander("🔍 Inspect JWE Decoded Structure"):
                    st.markdown("**JWE Header (Protected):**")
                    st.json(jwe_result["header"])
                    st.markdown(f"**Encrypted Key (Base64URL):**\n`{jwe_result['encrypted_key']}`")
                    st.markdown(f"**Initialization Vector (Base64URL):**\n`{jwe_result['iv']}`")
                    st.markdown(f"**Ciphertext (Base64URL):**\n`{jwe_result['ciphertext']}`")
                    st.markdown(f"**Authentication Tag (Base64URL):**\n`{jwe_result['tag']}`")
                    st.markdown(f"**AAD (Additional Authenticated Data):**\n`{jwe_result['aad']}`")
            except Exception as e:
                st.error(f"Encryption Error: {str(e)}")

    with jwe_col2:
        st.subheader("🔓 Decrypt JWE Token")
        st.markdown("Decrypt a JWE compact token back into plaintext using the private key.")
        
        default_jwe = st.session_state.get("last_jwe", "")
        input_jwe = st.text_area("Paste JWE Compact Token here", value=default_jwe, height=120)
        
        if st.button("🔓 Decrypt Payload"):
            if not input_jwe:
                st.warning("Please enter a JWE token to decrypt.")
            else:
                try:
                    decrypted_payload = JWESimulator.decrypt(input_jwe, st.session_state["private_key"])
                    st.success("Decryption Successful!")
                    st.markdown("**Decrypted Plaintext Payload:**")
                    st.json(decrypted_payload)
                    
                    # Validate routing number inside decrypted payload
                    dec_routing = decrypted_payload.get("routingNumber", "")
                    if dec_routing:
                        is_valid = validate_aba_checksum(dec_routing)
                        if is_valid:
                            bank_name = ABA_REGISTRY.get(dec_routing, {}).get("bank_name", "Unknown Bank")
                            st.info(f"✅ Decrypted Routing Number `{dec_routing}` is VALID. Bank: **{bank_name}**")
                        else:
                            st.error(f"❌ Decrypted Routing Number `{dec_routing}` is INVALID.")
                except Exception as e:
                    st.error(f"Decryption Failed: {str(e)}")
                    st.info("Ensure you are using the correct private key corresponding to the public key used for encryption.")

# =============================================================================
# APP 3: B2B PAYMENT ROUTING SIMULATOR
# =============================================================================
with tab3:
    st.header("⚡ B2B Payment Routing Simulator")
    st.markdown(
        "Simulate end-to-end B2B payment routing. This tool analyzes the capabilities of both the sender "
        "and receiver banks, validates the routing numbers, and selects the optimal payment rail (ACH, Wire, RTP, FedNow)."
    )
    
    col_pay1, col_pay2 = st.columns(2)
    
    with col_pay1:
        st.subheader("Payment Details")
        sender_routing = st.selectbox("Sender Bank Routing", list(ABA_REGISTRY.keys()), index=0, key="send_r")
        sender_acc = st.text_input("Sender Account Number", value="9988776655", key="send_a")
        
        receiver_routing = st.selectbox("Receiver Bank Routing", list(ABA_REGISTRY.keys()), index=1, key="recv_r")
        receiver_acc = st.text_input("Receiver Account Number", value="1122334455", key="recv_a")
        
        payment_amount = st.number_input("Payment Amount ($)", min_value=1.0, value=50000.0, step=1000.0)
        payment_priority = st.selectbox("Payment Priority", ["Standard (Cost Optimized)", "High (Same-Day)", "Instant (Real-Time)"])

    with col_pay2:
        st.subheader("Routing Decision Engine")
        
        if sender_routing == receiver_routing:
            st.warning("ℹ️ Book Transfer: Both accounts are at the same financial institution. Internal ledger transfer will be used.")
            rail_decision = "Book Transfer"
            processing_time = "Instant"
            estimated_cost = "$0.00"
        else:
            sender_info = ABA_REGISTRY[sender_routing]
            receiver_info = ABA_REGISTRY[receiver_routing]
            
            # Decision Logic
            if payment_priority == "Instant (Real-Time)" and sender_info["fednow"] and receiver_info["fednow"]:
                rail_decision = "FedNow"
                processing_time = "Real-Time (Seconds)"
                estimated_cost = "$0.05"
            elif payment_priority == "Instant (Real-Time)" and sender_info["rtp"] and receiver_info["rtp"]:
                rail_decision = "RTP (Real-Time Payments)"
                processing_time = "Real-Time (Seconds)"
                estimated_cost = "$0.10"
            elif payment_priority == "High (Same-Day)" or payment_amount >= 100000.0:
                rail_decision = "Fedwire (Wire Transfer)"
                processing_time = "Same-Day (Minutes)"
                estimated_cost = "$15.00 - $25.00"
            else:
                rail_decision = "ACH (Automated Clearing House)"
                processing_time = "1-2 Business Days"
                estimated_cost = "$0.15"
                
        # Display Decision Metrics
        st.metric(label="Selected Payment Rail", value=rail_decision)
        
        m_col1, m_col2 = st.columns(2)
        m_col1.metric(label="Processing Time", value=processing_time)
        m_col2.metric(label="Estimated Network Fee", value=estimated_cost)
        
        # Generate ISO 20022 XML snippet
        st.subheader("📄 Generated ISO 20022 Message (pacs.008)")
        st.markdown("Financial institutions communicate B2B payments using ISO 20022 XML standards.")
        
        iso_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>B2B-{int(time.time())}</MsgId>
      <CreDtTm>{datetime.utcnow().isoformat()}Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys>
          <Prtry>{rail_decision.split()[0]}</Prtry>
        </ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-{int(time.time())}</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">{payment_amount:.2f}</IntrBkSttlmAmt>
      <Dbtr>
        <Nm>B2B Sender Corp</Nm>
      </Dbtr>
      <DbtrAgt>
        <FinInstnId>
          <ClrSysMmbId>
            <MmbId>{sender_routing}</MmbId>
          </ClrSysMmbId>
        </FinInstnId>
      </DbtrAgt>
      <CdtrAgt>
        <FinInstnId>
          <ClrSysMmbId>
            <MmbId>{receiver_routing}</MmbId>
          </ClrSysMmbId>
        </FinInstnId>
      </CdtrAgt>
      <Cdtr>
        <Nm>B2B Receiver Corp</Nm>
      </Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>"""
        st.code(iso_xml, language="xml")

# =============================================================================
# APP 4: API ENDPOINT MOCK
# =============================================================================
with tab4:
    st.header("🔌 API Endpoint Mock & Developer Sandbox")
    st.markdown(
        "Simulate the `/accounts/{accountId}/encrypt/accountRoutingNumber` endpoint. "
        "Configure mock responses, test API payloads, and generate production-ready integration code."
    )
    
    api_col1, api_col2 = st.columns([1, 1])
    
    with api_col1:
        st.subheader("Configure Mock Endpoint")
        mock_account_id = st.text_input("Account ID Path Parameter", value="acc_8839201")
        mock_status_code = st.selectbox("Simulated HTTP Status Code", [200, 400, 401, 422, 500])
        
        st.markdown("### Request Payload (POST)")
        req_routing = st.text_input("Routing Number", value="021000021", key="api_r")
        req_account = st.text_input("Account Number", value="987654321", key="api_a")
        
        # Generate Response based on configuration
        st.markdown("### Simulated API Response")
        
        if mock_status_code == 200:
            # Generate valid JWE
            payload = {"routingNumber": req_routing, "accountNumber": req_account}
            try:
                jwe_data = JWESimulator.encrypt(payload, st.session_state["public_key"])
                response_body = {
                    "status": "SUCCESS",
                    "accountId": mock_account_id,
                    "encryptedPayload": jwe_data["jwe_compact"],
                    "keyId": "kid_sandbox_rsa_01",
                    "algorithm": "RSA-OAEP-256",
                    "encryption": "A256GCM"
                }
            except Exception as e:
                response_body = {"error": f"Encryption failed: {str(e)}"}
        elif mock_status_code == 400:
            response_body = {
                "error": "BAD_REQUEST",
                "message": "The request payload is malformed or missing required fields."
            }
        elif mock_status_code == 401:
            response_body = {
                "error": "UNAUTHORIZED",
                "message": "Invalid or expired API credentials provided."
            }
        elif mock_status_code == 422:
            response_body = {
                "error": "UNPROCESSABLE_ENTITY",
                "message": "The routing number failed checksum validation.",
                "details": {
                    "routingNumber": "Invalid Mod 10 checksum"
                }
            }
        else:
            response_body = {
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred on the server."
            }
            
        st.code(f"HTTP/1.1 {mock_status_code}\nContent-Type: application/json\n\n{json.dumps(response_body, indent=2)}", language="json")

    with api_col2:
        st.subheader("💻 Developer Integration Code")
        st.markdown("Use the following code snippets to integrate this secure endpoint into your B2B payment flow.")
        
        code_tab1, code_tab2 = st.tabs(["Python (Requests)", "cURL"])
        
        with code_tab1:
            python_code = f"""import requests
import json

url = "https://api.b2b-payments.sandbox/accounts/{mock_account_id}/encrypt/accountRoutingNumber"
headers = {{
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_SANDBOX_API_KEY"
}}
payload = {{
    "routingNumber": "{req_routing}",
    "accountNumber": "{req_account}"
}}

response = requests.post(url, headers=headers, json=payload)

if response.status_code == 200:
    data = response.json()
    print("Encrypted JWE Payload:", data["encryptedPayload"])
else:
    print(f"Error {{response.status_code}}:", response.json())
"""
            st.code(python_code, language="python")
            
        with code_tab2:
            curl_code = f"""curl -X POST \\
  https://api.b2b-payments.sandbox/accounts/{mock_account_id}/encrypt/accountRoutingNumber \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_SANDBOX_API_KEY' \\
  -d '{{
    "routingNumber": "{req_routing}",
    "accountNumber": "{req_account}"
  }}'"""
            st.code(curl_code, language="bash")
            
        st.info(
            "💡 **Security Best Practice:** Always perform JWE decryption inside a secure, "
            "isolated environment (HSM or secure enclave) to prevent exposure of raw account numbers."
        )