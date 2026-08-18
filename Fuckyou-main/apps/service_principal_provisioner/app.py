import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import uuid
import hashlib
import random

# Set page configuration
st.set_page_config(
    page_title="Enterprise Service Principal Provisioner",
    page_icon="🔐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- SESSION STATE INITIALIZATION ---
if "initialized" not in st.session_state:
    st.session_state.initialized = True
    
    # Default Service Principals
    st.session_state.service_principals = [
        {
            "id": "sp-9081-1a2b",
            "name": "PaymentGateway-API",
            "client_id": "3b8f9c12-8d3e-4f1a-9b2c-5d6e7f8a9b0c",
            "tenant_id": "8f9e0d1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
            "environment": "Production",
            "status": "Active",
            "owner": "Finance Engineering",
            "created_at": (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d"),
            "secrets": [
                {
                    "id": "sec-1",
                    "name": "Prod-Secret-Primary",
                    "value": "sp8~8Q_Xj2.Hk9_asdf891234",
                    "created_at": (datetime.now() - timedelta(days=120)).strftime("%Y-%m-%d"),
                    "expires_at": (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
                    "status": "Active"
                },
                {
                    "id": "sec-2",
                    "name": "Prod-Secret-Legacy",
                    "value": "sp8~1A_Zp9.Lm2_qwer567890",
                    "created_at": (datetime.now() - timedelta(days=350)).strftime("%Y-%m-%d"),
                    "expires_at": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"),
                    "status": "Expired"
                }
            ],
            "certificates": [
                {
                    "id": "cert-1",
                    "name": "PaymentGateway-Prod-Cert",
                    "thumbprint": "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0",
                    "expires_at": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"),
                    "status": "Active"
                }
            ],
            "permissions": [
                {"api": "Microsoft Graph", "scope": "User.Read", "type": "Delegated", "status": "Granted"},
                {"api": "Microsoft Graph", "scope": "Directory.Read.All", "type": "Application", "status": "Granted"},
                {"api": "Custom-Billing-API", "scope": "Billing.Write", "type": "Application", "status": "Pending Consent"}
            ]
        },
        {
            "id": "sp-4432-7x8y",
            "name": "Reporting-Dashboard-App",
            "client_id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
            "tenant_id": "8f9e0d1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
            "environment": "Staging",
            "status": "Active",
            "owner": "Data Analytics Team",
            "created_at": (datetime.now() - timedelta(days=45)).strftime("%Y-%m-%d"),
            "secrets": [
                {
                    "id": "sec-3",
                    "name": "Staging-Secret-01",
                    "value": "st9~9W_Yk3.Pl0_zxcv123456",
                    "created_at": (datetime.now() - timedelta(days=45)).strftime("%Y-%m-%d"),
                    "expires_at": (datetime.now() + timedelta(days=135)).strftime("%Y-%m-%d"),
                    "status": "Active"
                }
            ],
            "certificates": [],
            "permissions": [
                {"api": "Microsoft Graph", "scope": "Reports.Read.All", "type": "Application", "status": "Granted"},
                {"api": "SharePoint Online", "scope": "Sites.Read.All", "type": "Delegated", "status": "Granted"}
            ]
        },
        {
            "id": "sp-1122-33aa",
            "name": "Developer-Sandbox-SP",
            "client_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
            "tenant_id": "8f9e0d1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
            "environment": "Development",
            "status": "Suspended",
            "owner": "DevOps Core",
            "created_at": (datetime.now() - timedelta(days=200)).strftime("%Y-%m-%d"),
            "secrets": [
                {
                    "id": "sec-4",
                    "name": "Dev-Secret-Expired",
                    "value": "dv1~2A_Bc3.De4_fghj789012",
                    "created_at": (datetime.now() - timedelta(days=200)).strftime("%Y-%m-%d"),
                    "expires_at": (datetime.now() - timedelta(days=20)).strftime("%Y-%m-%d"),
                    "status": "Expired"
                }
            ],
            "certificates": [],
            "permissions": [
                {"api": "Microsoft Graph", "scope": "User.Read.All", "type": "Delegated", "status": "Pending Consent"}
            ]
        }
    ]

    # Audit Logs
    st.session_state.audit_logs = [
        {"timestamp": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S"), "actor": "admin@company.onmicrosoft.com", "action": "Secret Rotation", "target": "PaymentGateway-API", "details": "Rotated Prod-Secret-Primary"},
        {"timestamp": (datetime.now() - timedelta(days=12)).strftime("%Y-%m-%d %H:%M:%S"), "actor": "sec-ops@company.onmicrosoft.com", "action": "Certificate Upload", "target": "PaymentGateway-API", "details": "Uploaded PaymentGateway-Prod-Cert"},
        {"timestamp": (datetime.now() - timedelta(days=15)).strftime("%Y-%m-%d %H:%M:%S"), "actor": "admin@company.onmicrosoft.com", "action": "Admin Consent Granted", "target": "Reporting-Dashboard-App", "details": "Granted consent for Reports.Read.All"},
        {"timestamp": (datetime.now() - timedelta(days=20)).strftime("%Y-%m-%d %H:%M:%S"), "actor": "system@company.onmicrosoft.com", "action": "Status Change", "target": "Developer-Sandbox-SP", "details": "Service Principal suspended due to inactivity"}
    ]

# --- HELPER FUNCTIONS ---
def add_audit_log(actor: str, action: str, target: str, details: str):
    st.session_state.audit_logs.insert(0, {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "actor": actor,
        "action": action,
        "target": target,
        "details": details
    })

def generate_mock_secret():
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    prefix = "sp_sec_"
    body = "".join(random.choice(chars) for _ in range(24))
    return f"{prefix}{body}"

def generate_mock_thumbprint():
    return hashlib.sha1(str(uuid.uuid4()).encode()).hexdigest().upper()

# --- SIDEBAR BRANDING & GLOBAL METRICS ---
with st.sidebar:
    st.title("🔐 SP Provisioner")
    st.caption("Enterprise Service Principal Lifecycle Management")
    st.markdown("---")
    
    # Global Stats Widget
    st.subheader("Global Directory Health")
    total_sps = len(st.session_state.service_principals)
    active_sps = sum(1 for sp in st.session_state.service_principals if sp["status"] == "Active")
    
    # Calculate expiring credentials
    expiring_soon_count = 0
    expired_count = 0
    today = datetime.now().date()
    
    for sp in st.session_state.service_principals:
        for sec in sp["secrets"]:
            exp_date = datetime.strptime(sec["expires_at"], "%Y-%m-%d").date()
            if exp_date < today:
                expired_count += 1
            elif (exp_date - today).days <= 30:
                expiring_soon_count += 1
        for cert in sp["certificates"]:
            exp_date = datetime.strptime(cert["expires_at"], "%Y-%m-%d").date()
            if exp_date < today:
                expired_count += 1
            elif (exp_date - today).days <= 30:
                expiring_soon_count += 1

    st.metric("Total Service Principals", total_sps)
    st.metric("Active Principals", f"{active_sps} / {total_sps}")
    
    if expired_count > 0:
        st.error(f"🚨 {expired_count} Expired Credentials")
    else:
        st.success("✅ No Expired Credentials")
        
    if expiring_soon_count > 0:
        st.warning(f"⚠️ {expiring_soon_count} Expiring in < 30 Days")

    st.markdown("---")
    # App Selector (The 4 Apps)
    st.subheader("Navigation")
    app_mode = st.radio(
        "Select Application Module:",
        [
            "App 1: Provisioning & Directory",
            "App 2: Credential Lifecycle Manager",
            "App 3: API Permission & Consent Admin",
            "App 4: Expiration Tracker & Audit Logs"
        ]
    )
    
    st.markdown("---")
    st.caption("Simulated Azure AD / Entra ID Tenant Environment")

# --- APP 1: PROVISIONING & DIRECTORY ---
if app_mode == "App 1: Provisioning & Directory":
    st.title("📋 Service Principal Directory & Provisioner")
    st.markdown("Register, provision, and manage the lifecycle status of enterprise Service Principals across environments.")

    # Tabs for Directory View vs Provisioning Form
    tab1, tab2 = st.tabs(["🔍 Directory Explorer", "➕ Provision New Service Principal"])

    with tab1:
        st.subheader("Active Directory Registry")
        
        # Search and Filter
        col1, col2, col3 = st.columns([2, 1, 1])
        with col1:
            search_query = st.text_input("Search by Name or Client ID", "")
        with col2:
            env_filter = st.selectbox("Filter by Environment", ["All", "Production", "Staging", "Development"])
        with col3:
            status_filter = st.selectbox("Filter by Status", ["All", "Active", "Suspended"])

        # Filter Logic
        filtered_sps = st.session_state.service_principals
        if search_query:
            filtered_sps = [sp for sp in filtered_sps if search_query.lower() in sp["name"].lower() or search_query.lower() in sp["client_id"].lower()]
        if env_filter != "All":
            filtered_sps = [sp for sp in filtered_sps if sp["environment"] == env_filter]
        if status_filter != "All":
            filtered_sps = [sp for sp in filtered_sps if sp["status"] == status_filter]

        # Display Directory
        if not filtered_sps:
            st.info("No Service Principals found matching the criteria.")
        else:
            for sp in filtered_sps:
                with st.expander(f"🏢 {sp['name']} ({sp['environment']}) - Status: {sp['status']}", expanded=True):
                    c1, c2, c3 = st.columns(3)
                    with c1:
                        st.markdown(f"**Application (Client) ID:**\n`{sp['client_id']}`")
                        st.markdown(f"**Directory (Tenant) ID:**\n`{sp['tenant_id']}`")
                    with c2:
                        st.markdown(f"**Owner Team:** {sp['owner']}")
                        st.markdown(f"**Created On:** {sp['created_at']}")
                    with c3:
                        # Actions
                        st.markdown("**Lifecycle Actions:**")
                        action_cols = st.columns(2)
                        
                        # Toggle Status Button
                        if sp["status"] == "Active":
                            if action_cols[0].button("Suspend SP", key=f"susp-{sp['id']}", type="secondary"):
                                sp["status"] = "Suspended"
                                add_audit_log("admin@company.onmicrosoft.com", "Status Change", sp["name"], "Suspended Service Principal")
                                st.toast(f"Suspended {sp['name']}", icon="⚠️")
                                st.rerun()
                        else:
                            if action_cols[0].button("Activate SP", key=f"act-{sp['id']}", type="primary"):
                                sp["status"] = "Active"
                                add_audit_log("admin@company.onmicrosoft.com", "Status Change", sp["name"], "Activated Service Principal")
                                st.toast(f"Activated {sp['name']}", icon="✅")
                                st.rerun()
                                
                        # Delete Button
                        if action_cols[1].button("Delete SP", key=f"del-{sp['id']}", type="secondary", help="Permanently delete this service principal"):
                            st.session_state.service_principals.remove(sp)
                            add_audit_log("admin@company.onmicrosoft.com", "Deletion", sp["name"], "Deleted Service Principal and all associated credentials")
                            st.toast(f"Deleted {sp['name']}", icon="🗑️")
                            st.rerun()

                    # Quick stats inside expander
                    st.markdown("---")
                    sc1, sc2, sc3 = st.columns(3)
                    sc1.metric("Active Secrets", len([s for s in sp["secrets"] if s["status"] == "Active"]))
                    sc2.metric("Active Certificates", len([c for c in sp["certificates"] if c["status"] == "Active"]))
                    sc3.metric("Configured API Permissions", len(sp["permissions"]))

    with tab2:
        st.subheader("Provision New Enterprise Identity")
        st.markdown("This wizard registers a new Application and automatically provisions its corresponding Service Principal in the selected environment.")
        
        with st.form("provision_form", clear_on_submit=True):
            col_f1, col_f2 = st.columns(2)
            with col_f1:
                sp_name = st.text_input("Application Name", placeholder="e.g., Inventory-Sync-Service")
                owner_team = st.text_input("Owner / Custodian Team", placeholder="e.g., Logistics IT")
                environment = st.selectbox("Target Environment", ["Development", "Staging", "Production"])
            with col_f2:
                initial_secret_name = st.text_input("Initial Secret Name", value="Default-Client-Secret")
                secret_expiry_months = st.selectbox("Secret Validity Period", [3, 6, 12, 24], index=2)
                initial_scope = st.text_input("Initial Requested Scope (Optional)", placeholder="e.g., User.Read")

            submit_btn = st.form_submit_button("Provision Service Principal", type="primary")

            if submit_btn:
                if not sp_name or not owner_team:
                    st.error("Please fill in all required fields (Application Name and Owner Team).")
                else:
                    # Generate IDs
                    new_sp_id = f"sp-{random.randint(1000, 9999)}-{uuid.uuid4().hex[:4]}"
                    new_client_id = str(uuid.uuid4())
                    new_tenant_id = "8f9e0d1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a" # Mock constant tenant
                    
                    # Generate Secret
                    secret_val = generate_mock_secret()
                    expiry_date = (datetime.now() + timedelta(days=secret_expiry_months * 30)).strftime("%Y-%m-%d")
                    
                    new_secret = {
                        "id": f"sec-{random.randint(100, 999)}",
                        "name": initial_secret_name if initial_secret_name else "Default-Client-Secret",
                        "value": secret_val,
                        "created_at": datetime.now().strftime("%Y-%m-%d"),
                        "expires_at": expiry_date,
                        "status": "Active"
                    }
                    
                    # Initial Permissions
                    permissions = []
                    if initial_scope:
                        permissions.append({
                            "api": "Microsoft Graph",
                            "scope": initial_scope,
                            "type": "Delegated",
                            "status": "Pending Consent"
                        })
                    
                    # Create SP Object
                    new_sp = {
                        "id": new_sp_id,
                        "name": sp_name,
                        "client_id": new_client_id,
                        "tenant_id": new_tenant_id,
                        "environment": environment,
                        "status": "Active",
                        "owner": owner_team,
                        "created_at": datetime.now().strftime("%Y-%m-%d"),
                        "secrets": [new_secret],
                        "certificates": [],
                        "permissions": permissions
                    }
                    
                    st.session_state.service_principals.append(new_sp)
                    
                    # Log Audit
                    add_audit_log(
                        "admin@company.onmicrosoft.com", 
                        "Provisioning", 
                        sp_name, 
                        f"Provisioned SP in {environment} with client ID {new_client_id}"
                    )
                    
                    st.success(f"🎉 Service Principal **{sp_name}** successfully provisioned!")
                    st.info(f"**Client ID:** `{new_client_id}`\n\n**Initial Secret Value (Save now, won't be shown again!):** `{secret_val}`")

# --- APP 2: CREDENTIAL LIFECYCLE MANAGER ---
elif app_mode == "App 2: Credential Lifecycle Manager":
    st.title("🔑 Credential Lifecycle Manager")
    st.markdown("Rotate client secrets, upload/generate certificates, and manage credential expiration timelines.")

    # Select Service Principal to manage
    sp_names = [sp["name"] for sp in st.session_state.service_principals]
    selected_sp_name = st.selectbox("Select Service Principal to Manage Credentials", sp_names)
    
    # Find selected SP
    sp = next(item for item in st.session_state.service_principals if item["name"] == selected_sp_name)

    st.markdown(f"### Managing Credentials for: **{sp['name']}**")
    st.caption(f"Client ID: `{sp['client_id']}` | Environment: **{sp['environment']}**")

    col_sec, col_cert = st.columns(2)

    # Left Column: Client Secrets
    with col_sec:
        st.subheader("🔐 Client Secrets")
        
        # Form to add/rotate secret
        with st.expander("➕ Generate / Rotate Client Secret", expanded=False):
            with st.form("rotate_secret_form"):
                secret_name = st.text_input("Secret Description / Name", placeholder="e.g., App-Secret-2024")
                expiry_days = st.selectbox("Expiration Period", [90, 180, 365, 730], format_func=lambda x: f"{x} Days")
                submit_rot = st.form_submit_button("Generate New Secret", type="primary")
                
                if submit_rot:
                    if not secret_name:
                        st.error("Please provide a description name for the secret.")
                    else:
                        new_val = generate_mock_secret()
                        exp_date = (datetime.now() + timedelta(days=expiry_days)).strftime("%Y-%m-%d")
                        new_sec = {
                            "id": f"sec-{random.randint(100, 999)}",
                            "name": secret_name,
                            "value": new_val,
                            "created_at": datetime.now().strftime("%Y-%m-%d"),
                            "expires_at": exp_date,
                            "status": "Active"
                        }
                        sp["secrets"].append(new_sec)
                        add_audit_log("admin@company.onmicrosoft.com", "Secret Rotation", sp["name"], f"Generated new secret: {secret_name}")
                        st.success(f"Secret Generated! Value: `{new_val}`")
                        st.toast("Secret rotated successfully!", icon="🔑")
                        st.rerun()

        # List existing secrets
        if not sp["secrets"]:
            st.info("No client secrets configured.")
        else:
            for sec in sp["secrets"]:
                # Check expiration status
                exp_date = datetime.strptime(sec["expires_at"], "%Y-%m-%d").date()
                today = datetime.now().date()
                
                if exp_date < today:
                    status_badge = "🔴 Expired"
                    sec["status"] = "Expired"
                elif (exp_date - today).days <= 30:
                    status_badge = "🟡 Expiring Soon"
                else:
                    status_badge = "🟢 Active"

                with st.container(border=True):
                    sc1, sc2 = st.columns([3, 1])
                    with sc1:
                        st.markdown(f"**{sec['name']}** ({status_badge})")
                        st.markdown(f"Value: `••••••••••••••••` (Created: {sec['created_at']})")
                        st.markdown(f"Expires: **{sec['expires_at']}**")
                    with sc2:
                        if st.button("Revoke", key=f"rev-sec-{sec['id']}", type="secondary"):
                            sp["secrets"].remove(sec)
                            add_audit_log("admin@company.onmicrosoft.com", "Secret Revocation", sp["name"], f"Revoked secret: {sec['name']}")
                            st.toast(f"Revoked secret {sec['name']}", icon="🗑️")
                            st.rerun()

    # Right Column: Certificates
    with col_cert:
        st.subheader("📜 Certificates")
        
        # Form to upload/generate certificate
        with st.expander("➕ Upload or Generate Certificate", expanded=False):
            cert_type = st.radio("Method", ["Generate Self-Signed Certificate", "Upload Public Key (.cer/.pem)"])
            
            if cert_type == "Generate Self-Signed Certificate":
                with st.form("gen_cert_form"):
                    cert_name = st.text_input("Certificate Name", placeholder="e.g., Auth-Cert-2024")
                    cert_expiry_years = st.selectbox("Validity Period", [1, 2, 3], format_func=lambda x: f"{x} Year(s)")
                    submit_cert_gen = st.form_submit_button("Generate & Bind Certificate", type="primary")
                    
                    if submit_cert_gen:
                        if not cert_name:
                            st.error("Please provide a certificate name.")
                        else:
                            thumbprint = generate_mock_thumbprint()
                            exp_date = (datetime.now() + timedelta(days=cert_expiry_years * 365)).strftime("%Y-%m-%d")
                            new_cert = {
                                "id": f"cert-{random.randint(100, 999)}",
                                "name": cert_name,
                                "thumbprint": thumbprint,
                                "expires_at": exp_date,
                                "status": "Active"
                            }
                            sp["certificates"].append(new_cert)
                            add_audit_log("admin@company.onmicrosoft.com", "Certificate Generation", sp["name"], f"Generated self-signed cert: {cert_name}")
                            st.success(f"Certificate generated and bound! Thumbprint: `{thumbprint}`")
                            st.toast("Certificate generated successfully!", icon="📜")
                            st.rerun()
                            
            else:
                uploaded_file = st.file_uploader("Choose a certificate file", type=["cer", "pem", "crt"])
                if uploaded_file is not None:
                    cert_name = st.text_input("Certificate Name (Friendly Name)", value=uploaded_file.name)
                    if st.button("Upload & Bind Certificate", type="primary"):
                        thumbprint = generate_mock_thumbprint()
                        exp_date = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d") # Default 1 year for uploaded
                        new_cert = {
                            "id": f"cert-{random.randint(100, 999)}",
                            "name": cert_name,
                            "thumbprint": thumbprint,
                            "expires_at": exp_date,
                            "status": "Active"
                        }
                        sp["certificates"].append(new_cert)
                        add_audit_log("admin@company.onmicrosoft.com", "Certificate Upload", sp["name"], f"Uploaded cert: {cert_name}")
                        st.success(f"Certificate '{cert_name}' uploaded successfully!")
                        st.toast("Certificate uploaded!", icon="📤")
                        st.rerun()

        # List existing certificates
        if not sp["certificates"]:
            st.info("No certificates configured.")
        else:
            for cert in sp["certificates"]:
                # Check expiration status
                exp_date = datetime.strptime(cert["expires_at"], "%Y-%m-%d").date()
                today = datetime.now().date()
                
                if exp_date < today:
                    status_badge = "🔴 Expired"
                    cert["status"] = "Expired"
                elif (exp_date - today).days <= 30:
                    status_badge = "🟡 Expiring Soon"
                else:
                    status_badge = "🟢 Active"

                with st.container(border=True):
                    cc1, cc2 = st.columns([3, 1])
                    with cc1:
                        st.markdown(f"**{cert['name']}** ({status_badge})")
                        st.markdown(f"Thumbprint: `{cert['thumbprint']}`")
                        st.markdown(f"Expires: **{cert['expires_at']}**")
                    with cc2:
                        if st.button("Delete", key=f"del-cert-{cert['id']}", type="secondary"):
                            sp["certificates"].remove(cert)
                            add_audit_log("admin@company.onmicrosoft.com", "Certificate Deletion", sp["name"], f"Deleted cert: {cert['name']}")
                            st.toast(f"Deleted certificate {cert['name']}", icon="🗑️")
                            st.rerun()

# --- APP 3: API PERMISSION & CONSENT ADMIN ---
elif app_mode == "App 3: API Permission & Consent Admin":
    st.title("🛡️ API Permission & Consent Administrator")
    st.markdown("Manage OAuth 2.0 / OIDC scopes, request new API permissions, and grant/revoke tenant-wide Admin Consent.")

    # Select Service Principal
    sp_names = [sp["name"] for sp in st.session_state.service_principals]
    selected_sp_name = st.selectbox("Select Service Principal to Manage Permissions", sp_names)
    sp = next(item for item in st.session_state.service_principals if item["name"] == selected_sp_name)

    st.markdown(f"### Permissions for: **{sp['name']}**")
    st.caption(f"Client ID: `{sp['client_id']}`")

    # Layout: Request Permission Form & Current Permissions Table
    col_req, col_list = st.columns([1, 2])

    with col_req:
        st.subheader("➕ Request API Permission")
        with st.form("request_permission_form", clear_on_submit=True):
            api_choice = st.selectbox("Target API", ["Microsoft Graph", "Azure Key Vault", "SharePoint Online", "Custom API"])
            
            # Dynamic scopes based on API choice
            if api_choice == "Microsoft Graph":
                scopes_list = ["User.Read", "User.Read.All", "Directory.ReadWrite.All", "Mail.Send", "Files.ReadWrite.All", "Reports.Read.All"]
            elif api_choice == "Azure Key Vault":
                scopes_list = ["Secrets.Get", "Secrets.List", "Keys.Wrap", "Certificates.Manage"]
            elif api_choice == "SharePoint Online":
                scopes_list = ["Sites.Read.All", "Sites.FullControl.All"]
            else:
                scopes_list = ["Custom.Read", "Custom.Write"]
                
            scope_choice = st.selectbox("Scope / Permission Name", scopes_list)
            permission_type = st.radio("Permission Type", ["Delegated (User Context)", "Application (App-only Context)"])
            
            submit_req = st.form_submit_button("Request Permission", type="primary")
            
            if submit_req:
                # Check if already exists
                exists = any(p["api"] == api_choice and p["scope"] == scope_choice for p in sp["permissions"])
                if exists:
                    st.warning("This permission is already requested or granted.")
                else:
                    p_type = "Delegated" if "Delegated" in permission_type else "Application"
                    sp["permissions"].append({
                        "api": api_choice,
                        "scope": scope_choice,
                        "type": p_type,
                        "status": "Pending Consent"
                    })
                    add_audit_log("admin@company.onmicrosoft.com", "Permission Requested", sp["name"], f"Requested {api_choice} -> {scope_choice}")
                    st.success(f"Requested {scope_choice} successfully!")
                    st.rerun()

    with col_list:
        st.subheader("🛡️ Configured Permissions & Consent Status")
        
        if not sp["permissions"]:
            st.info("No permissions configured for this Service Principal.")
        else:
            # Convert to DataFrame for nice display
            df_perms = pd.DataFrame(sp["permissions"])
            
            # Display permissions with custom UI
            for idx, perm in enumerate(sp["permissions"]):
                with st.container(border=True):
                    p_col1, p_col2, p_col3 = st.columns([2, 1, 1])
                    with p_col1:
                        st.markdown(f"**API:** {perm['api']}")
                        st.markdown(f"**Scope:** `{perm['scope']}` | **Type:** {perm['type']}")
                    with p_col2:
                        if perm["status"] == "Granted":
                            st.success("🟢 Granted")
                        else:
                            st.warning("🟡 Pending Consent")
                    with p_col3:
                        # Action buttons
                        btn_cols = st.columns(2)
                        if perm["status"] == "Pending Consent":
                            if btn_cols[0].button("Grant", key=f"grant-{idx}", type="primary", help="Grant Admin Consent"):
                                perm["status"] = "Granted"
                                add_audit_log("admin@company.onmicrosoft.com", "Admin Consent Granted", sp["name"], f"Granted consent for {perm['api']} -> {perm['scope']}")
                                st.toast(f"Granted consent for {perm['scope']}", icon="✅")
                                st.rerun()
                        if btn_cols[1].button("Revoke", key=f"rev-perm-{idx}", type="secondary", help="Remove permission"):
                            sp["permissions"].remove(perm)
                            add_audit_log("admin@company.onmicrosoft.com", "Permission Revoked", sp["name"], f"Revoked {perm['api']} -> {perm['scope']}")
                            st.toast(f"Revoked {perm['scope']}", icon="🗑️")
                            st.rerun()

            # Bulk Action: Grant Consent to All Pending
            pending_count = sum(1 for p in sp["permissions"] if p["status"] == "Pending Consent")
            if pending_count > 0:
                st.markdown("---")
                if st.button("⚡ Grant Tenant-Wide Admin Consent for All Pending Permissions", type="primary", use_container_width=True):
                    for p in sp["permissions"]:
                        if p["status"] == "Pending Consent":
                            p["status"] = "Granted"
                    add_audit_log("admin@company.onmicrosoft.com", "Admin Consent Granted", sp["name"], "Granted bulk tenant-wide consent for all pending permissions")
                    st.success("Tenant-wide admin consent granted successfully!")
                    st.rerun()

# --- APP 4: EXPIRATION TRACKER & AUDIT LOGS ---
elif app_mode == "App 4: Expiration Tracker & Audit Logs":
    st.title("📊 Expiration Tracker & Audit Logs")
    st.markdown("Track credential expiration timelines visually and review administrative audit logs for compliance.")

    tab_track, tab_audit = st.tabs(["📅 Expiration Timeline Tracker", "📜 Security Audit Logs"])

    with tab_track:
        st.subheader("Credential Expiration Timeline")
        st.markdown("Visual representation of client secrets and certificates expiration dates across all Service Principals.")

        # Gather all credentials
        cred_data = []
        today = datetime.now().date()
        
        for sp in st.session_state.service_principals:
            for sec in sp["secrets"]:
                exp_date = datetime.strptime(sec["expires_at"], "%Y-%m-%d").date()
                days_remaining = (exp_date - today).days
                cred_data.append({
                    "Service Principal": sp["name"],
                    "Credential Name": sec["name"],
                    "Type": "Client Secret",
                    "Expiration Date": sec["expires_at"],
                    "Days Remaining": days_remaining,
                    "Status": "Expired" if days_remaining < 0 else ("Expiring Soon (<30d)" if days_remaining <= 30 else "Healthy")
                })
            for cert in sp["certificates"]:
                exp_date = datetime.strptime(cert["expires_at"], "%Y-%m-%d").date()
                days_remaining = (exp_date - today).days
                cred_data.append({
                    "Service Principal": sp["name"],
                    "Credential Name": cert["name"],
                    "Type": "Certificate",
                    "Expiration Date": cert["expires_at"],
                    "Days Remaining": days_remaining,
                    "Status": "Expired" if days_remaining < 0 else ("Expiring Soon (<30d)" if days_remaining <= 30 else "Healthy")
                })

        if not cred_data:
            st.info("No credentials found to track.")
        else:
            df_creds = pd.DataFrame(cred_data)
            
            # Color mapping for status
            color_map = {
                "Expired": "#EF553B",
                "Expiring Soon (<30d)": "#FECB52",
                "Healthy": "#636EFA"
            }

            # Plotly Bar Chart
            fig = px.bar(
                df_creds,
                x="Days Remaining",
                y="Credential Name",
                color="Status",
                hover_data=["Service Principal", "Type", "Expiration Date"],
                title="Days Remaining Until Expiration",
                orientation="h",
                color_discrete_map=color_map,
                category_orders={"Status": ["Expired", "Expiring Soon (<30d)", "Healthy"]}
            )
            
            fig.update_layout(
                yaxis={"categoryorder": "total ascending"},
                xaxis_title="Days Remaining",
                yaxis_title="Credential Name",
                legend_title="Status"
            )
            
            # Add a vertical line at 0 (today) and 30 days
            fig.add_vline(x=0, line_dash="dash", line_color="red", annotation_text="Today")
            fig.add_vline(x=30, line_dash="dash", line_color="orange", annotation_text="30 Days Warning")

            st.plotly_chart(fig, use_container_width=True)

            # Detailed Table View
            st.subheader("Credential Expiration Registry")
            
            # Style helper
            def style_status(val):
                if val == "Expired":
                    return "background-color: #ffcccc; color: black;"
                elif "Expiring Soon" in val:
                    return "background-color: #fff2cc; color: black;"
                return "background-color: #e2f0d9; color: black;"

            df_styled = df_creds.style.applymap(style_status, subset=["Status"])
            st.dataframe(df_styled, use_container_width=True)

    with tab_audit:
        st.subheader("Security & Compliance Audit Logs")
        st.markdown("Immutable record of all administrative actions performed on Service Principals.")

        # Search and Filter Audit Logs
        col_a1, col_a2 = st.columns([2, 1])
        with col_a1:
            search_audit = st.text_input("Search Audit Logs (Actor, Action, Target)", "")
        with col_a2:
            action_filter = st.selectbox("Filter by Action Type", ["All", "Provisioning", "Secret Rotation", "Certificate Upload", "Certificate Generation", "Admin Consent Granted", "Permission Requested", "Permission Revoked", "Status Change", "Deletion"])

        # Filter Logic
        filtered_logs = st.session_state.audit_logs
        if search_audit:
            filtered_logs = [
                log for log in filtered_logs 
                if search_audit.lower() in log["actor"].lower() 
                or search_audit.lower() in log["action"].lower() 
                or search_audit.lower() in log["target"].lower()
                or search_audit.lower() in log["details"].lower()
            ]
        if action_filter != "All":
            filtered_logs = [log for log in filtered_logs if log["action"] == action_filter]

        if not filtered_logs:
            st.info("No audit logs found matching the criteria.")
        else:
            df_logs = pd.DataFrame(filtered_logs)
            st.dataframe(
                df_logs,
                column_config={
                    "timestamp": "Timestamp",
                    "actor": "Actor / Admin",
                    "action": "Action",
                    "target": "Target SP",
                    "details": "Details"
                },
                use_container_width=True,
                hide_index=True
            )
            
            # Export Logs Button
            csv = df_logs.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Export Audit Logs to CSV",
                data=csv,
                file_name=f"sp_audit_logs_{datetime.now().strftime('%Y%m%d')}.csv",
                mime="text/csv",
            )