import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import random
import time

# Set page configuration
st.set_page_config(
    page_title="Cross-Cloud Federation Manager",
    page_icon="🌐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State with Mock Data if not already present
if 'initialized' not in st.session_state:
    st.session_state.initialized = True
    
    # Mock Federation Trusts
    st.session_state.trusts = [
        {
            "id": "TR-001",
            "name": "Azure Commercial to Azure Gov",
            "source_cloud": "Azure Commercial (Tenant-A)",
            "target_cloud": "Azure Government (Tenant-G)",
            "protocol": "SAML 2.0",
            "status": "Active",
            "last_verified": "2023-10-24 08:30",
            "encryption": "AES-256-GCM",
            "signing_cert_expiry": "2025-12-31"
        },
        {
            "id": "TR-002",
            "name": "AWS Commercial to AWS GovCloud",
            "source_cloud": "AWS Commercial (Acme-Prod)",
            "target_cloud": "AWS GovCloud (Acme-Gov)",
            "protocol": "OIDC / OAuth 2.0",
            "status": "Active",
            "last_verified": "2023-10-24 09:15",
            "encryption": "AES-256-GCM",
            "signing_cert_expiry": "2024-08-15"
        },
        {
            "id": "TR-003",
            "name": "GCP Commercial to AWS GovCloud (Cross-Provider)",
            "source_cloud": "GCP Commercial (GCP-Prod)",
            "target_cloud": "AWS GovCloud (Acme-Gov)",
            "protocol": "SAML 2.0",
            "status": "Pending Verification",
            "last_verified": "Never",
            "encryption": "AES-256-CBC",
            "signing_cert_expiry": "2024-01-10"
        },
        {
            "id": "TR-004",
            "name": "Azure Commercial to AWS GovCloud",
            "source_cloud": "Azure Commercial (Tenant-B)",
            "target_cloud": "AWS GovCloud (Acme-Gov)",
            "protocol": "OIDC / OAuth 2.0",
            "status": "Suspended",
            "last_verified": "2023-10-10 14:22",
            "encryption": "AES-256-GCM",
            "signing_cert_expiry": "2023-10-11"
        }
    ]

    # Mock Identity Mappings
    st.session_state.mappings = [
        {"id": "MAP-001", "source_identity": "alice.smith@commercial.com", "target_identity": "a.smith@gov.internal", "type": "User", "trust_id": "TR-001", "status": "Mapped"},
        {"id": "MAP-002", "source_identity": "bob.jones@commercial.com", "target_identity": "b.jones@gov.internal", "type": "User", "trust_id": "TR-001", "status": "Mapped"},
        {"id": "MAP-003", "source_identity": "billing-app-sp", "target_identity": "gov-billing-runner", "type": "Service Principal", "trust_id": "TR-002", "status": "Mapped"},
        {"id": "MAP-004", "source_identity": "devops-deployer", "target_identity": "gov-deployer-role", "type": "Role / Group", "trust_id": "TR-002", "status": "Mapped"},
        {"id": "MAP-005", "source_identity": "charlie.brown@commercial.com", "target_identity": "c.brown@gov.internal", "type": "User", "trust_id": "TR-001", "status": "Pending Approval"}
    ]

    # Mock Sync History
    st.session_state.sync_runs = [
        {"run_id": "SR-901", "pipeline": "User Identity Sync (Azure Comm -> Gov)", "timestamp": "2023-10-24 10:00", "duration": "12s", "synced_items": 142, "status": "Success", "errors": 0},
        {"run_id": "SR-902", "pipeline": "Service Principal Sync (AWS Comm -> GovCloud)", "timestamp": "2023-10-24 09:45", "duration": "8s", "synced_items": 15, "status": "Success", "errors": 0},
        {"run_id": "SR-903", "pipeline": "Role Mapping Sync (GCP -> AWS GovCloud)", "timestamp": "2023-10-24 09:30", "duration": "4s", "synced_items": 0, "status": "Failed", "errors": 3},
        {"run_id": "SR-904", "pipeline": "User Identity Sync (Azure Comm -> Gov)", "timestamp": "2023-10-24 09:00", "duration": "15s", "synced_items": 139, "status": "Success", "errors": 0},
        {"run_id": "SR-905", "pipeline": "Service Principal Sync (AWS Comm -> GovCloud)", "timestamp": "2023-10-24 08:45", "duration": "9s", "synced_items": 12, "status": "Warning", "errors": 1}
    ]

    # Mock Audit Logs
    st.session_state.audit_logs = [
        {"timestamp": "2023-10-24 10:05:12", "actor": "admin@commercial.com", "action": "Triggered Manual Sync", "target": "User Identity Sync Pipeline", "severity": "Info"},
        {"timestamp": "2023-10-24 09:30:45", "actor": "System", "action": "Sync Failure Alert", "target": "GCP -> AWS GovCloud Pipeline", "severity": "High"},
        {"timestamp": "2023-10-24 09:15:22", "actor": "sec-ops@gov.internal", "action": "Approved Trust Relationship", "target": "TR-002 (AWS Comm to GovCloud)", "severity": "Medium"},
        {"timestamp": "2023-10-24 08:10:01", "actor": "admin@commercial.com", "action": "Created Identity Mapping", "target": "MAP-005 (charlie.brown)", "severity": "Info"},
        {"timestamp": "2023-10-23 17:45:30", "actor": "System", "action": "Certificate Expiry Warning", "target": "TR-004 (Azure Comm to AWS GovCloud)", "severity": "Medium"}
    ]

# Sidebar Navigation
st.sidebar.title("🌐 Federation Manager")
st.sidebar.markdown("Manage secure cross-tenant & cross-cloud identity federation pipelines.")
st.sidebar.divider()

app_mode = st.sidebar.radio(
    "Select Application Module:",
    [
        "🤝 Trust Configurator",
        "🆔 Identity Mapper",
        "🔄 Sync Pipeline Monitor",
        "🛡️ Security & Audit Log"
    ]
)

st.sidebar.divider()
st.sidebar.info(
    "**Environment Status:**\n\n"
    "🟢 Commercial Cloud: Connected\n\n"
    "🟢 Government Cloud: Connected\n\n"
    "🔒 FIPS 140-2 Mode: Enforced"
)

# Helper function to add audit log
def add_audit_log(actor, action, target, severity):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    st.session_state.audit_logs.insert(0, {
        "timestamp": now,
        "actor": actor,
        "action": action,
        "target": target,
        "severity": severity
    })

# ==========================================
# APP 1: FEDERATION TRUST CONFIGURATOR
# ==========================================
if app_mode == "🤝 Trust Configurator":
    st.title("🤝 Cross-Cloud Federation Trust Configurator")
    st.markdown("Establish, verify, and manage cryptographic trust relationships between Commercial and Government cloud tenants.")

    # Metrics Row
    col1, col2, col3, col4 = st.columns(4)
    active_trusts = sum(1 for t in st.session_state.trusts if t["status"] == "Active")
    pending_trusts = sum(1 for t in st.session_state.trusts if t["status"] == "Pending Verification")
    suspended_trusts = sum(1 for t in st.session_state.trusts if t["status"] == "Suspended")
    
    col1.metric("Active Trusts", active_trusts, delta="Stable")
    col2.metric("Pending Verification", pending_trusts, delta="Action Required", delta_color="inverse")
    col3.metric("Suspended Trusts", suspended_trusts, delta="Security Risk", delta_color="inverse")
    col4.metric("Compliance Standard", "NIST SP 800-53", help="Aligned with FedRAMP High requirements")

    st.divider()

    # Tabs for viewing and creating trusts
    tab1, tab2 = st.tabs(["📋 Active Trust Relationships", "➕ Establish New Trust"])

    with tab1:
        st.subheader("Configured Federation Trusts")
        
        # Convert to DataFrame for display
        df_trusts = pd.DataFrame(st.session_state.trusts)
        
        # Custom display with action buttons
        for index, row in df_trusts.iterrows():
            with st.expander(f"🔗 {row['name']} ({row['id']}) - Status: {row['status']}", expanded=True):
                c1, c2, c3 = st.columns(3)
                with c1:
                    st.markdown(f"**Source Tenant:** `{row['source_cloud']}`")
                    st.markdown(f"**Target Tenant:** `{row['target_cloud']}`")
                with c2:
                    st.markdown(f"**Protocol:** `{row['protocol']}`")
                    st.markdown(f"**Encryption:** `{row['encryption']}`")
                with c3:
                    st.markdown(f"**Last Verified:** `{row['last_verified']}`")
                    st.markdown(f"**Cert Expiry:** `{row['signing_cert_expiry']}`")
                
                # Action buttons inside expander
                act_col1, act_col2, act_col3, act_col4 = st.columns(4)
                if row['status'] != 'Active':
                    if act_col1.button("Verify & Activate", key=f"verify_{row['id']}"):
                        st.session_state.trusts[index]['status'] = 'Active'
                        st.session_state.trusts[index]['last_verified'] = datetime.now().strftime("%Y-%m-%d %H:%M")
                        add_audit_log("admin@commercial.com", "Verified & Activated Trust", row['name'], "High")
                        st.success(f"Trust {row['id']} successfully verified and activated!")
                        st.rerun()
                else:
                    if act_col1.button("Test Connection", key=f"test_{row['id']}"):
                        with st.spinner("Testing cryptographic handshake..."):
                            time.sleep(1)
                        st.success("Handshake successful! Latency: 42ms. Token validation: OK.")
                        st.session_state.trusts[index]['last_verified'] = datetime.now().strftime("%Y-%m-%d %H:%M")
                        add_audit_log("System", "Tested Connection", row['name'], "Info")
                
                if row['status'] != 'Suspended':
                    if act_col2.button("Suspend Trust", key=f"suspend_{row['id']}"):
                        st.session_state.trusts[index]['status'] = 'Suspended'
                        add_audit_log("admin@commercial.com", "Suspended Trust", row['name'], "High")
                        st.warning(f"Trust {row['id']} suspended.")
                        st.rerun()
                else:
                    if act_col2.button("Re-Enable Trust", key=f"enable_{row['id']}"):
                        st.session_state.trusts[index]['status'] = 'Active'
                        add_audit_log("admin@commercial.com", "Re-enabled Trust", row['name'], "High")
                        st.success(f"Trust {row['id']} re-enabled.")
                        st.rerun()

                if act_col3.button("Rotate Keys", key=f"rotate_{row['id']}"):
                    st.session_state.trusts[index]['signing_cert_expiry'] = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
                    add_audit_log("admin@commercial.com", "Rotated Signing Keys", row['name'], "Medium")
                    st.success("Cryptographic keys rotated. New certificate valid for 365 days.")
                    st.rerun()

                if act_col4.button("Delete Trust", key=f"delete_{row['id']}", type="primary"):
                    st.session_state.trusts.pop(index)
                    add_audit_log("admin@commercial.com", "Deleted Trust Relationship", row['name'], "High")
                    st.error("Trust relationship deleted.")
                    st.rerun()

    with tab2:
        st.subheader("Configure Cross-Cloud Trust Parameters")
        with st.form("new_trust_form"):
            trust_name = st.text_input("Trust Relationship Name", placeholder="e.g., Commercial Prod to Gov High-Impact")
            
            col_s, col_t = st.columns(2)
            with col_s:
                source_cloud = st.selectbox("Source Cloud / Tenant", [
                    "Azure Commercial (Tenant-A)", 
                    "AWS Commercial (Acme-Prod)", 
                    "GCP Commercial (GCP-Prod)",
                    "Azure Commercial (Tenant-B)"
                ])
            with col_t:
                target_cloud = st.selectbox("Target Government Cloud / Tenant", [
                    "Azure Government (Tenant-G)", 
                    "AWS GovCloud (Acme-Gov)", 
                    "GCP Assured Workloads (Gov-Enclave)"
                ])
                
            col_p, col_e = st.columns(2)
            with col_p:
                protocol = st.selectbox("Federation Protocol", ["SAML 2.0", "OIDC / OAuth 2.0", "WS-Federation"])
            with col_e:
                encryption = st.selectbox("Encryption Algorithm", ["AES-256-GCM (Recommended)", "AES-256-CBC", "Chacha20-Poly1305"])
                
            st.markdown("### Cryptographic Metadata Exchange")
            metadata_type = st.radio("Metadata Import Method", ["Metadata URL", "Upload Metadata XML File", "Manual Configuration"])
            
            if metadata_type == "Metadata URL":
                st.text_input("Federation Metadata URL", value="https://identity.commercial.com/federation/metadata.xml")
            elif metadata_type == "Upload Metadata XML File":
                st.file_uploader("Upload Identity Provider Metadata XML")
            else:
                st.text_area("Signing Certificate (PEM format)", placeholder="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----")
                st.text_input("Entity ID / Issuer URI")
                st.text_input("Single Sign-On Service URL")

            submitted = st.form_submit_button("Establish Trust Relationship")
            if submitted:
                if trust_name:
                    new_id = f"TR-00{len(st.session_state.trusts) + 1}"
                    new_trust = {
                        "id": new_id,
                        "name": trust_name,
                        "source_cloud": source_cloud,
                        "target_cloud": target_cloud,
                        "protocol": protocol,
                        "status": "Pending Verification",
                        "last_verified": "Never",
                        "encryption": encryption.split(" ")[0],
                        "signing_cert_expiry": (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
                    }
                    st.session_state.trusts.append(new_trust)
                    add_audit_log("admin@commercial.com", "Created Trust Relationship", trust_name, "Medium")
                    st.success(f"Trust relationship '{trust_name}' created successfully! Status set to 'Pending Verification'.")
                else:
                    st.error("Please provide a name for the trust relationship.")

# ==========================================
# APP 2: CROSS-CLOUD IDENTITY MAPPER
# ==========================================
elif app_mode == "🆔 Identity Mapper":
    st.title("🆔 Cross-Cloud Identity Mapper")
    st.markdown("Map user accounts, service principals, and security groups from Commercial directories to Government-compliant identities.")

    # Metrics
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Mapped Identities", len(st.session_state.mappings))
    col2.metric("Pending Approvals", sum(1 for m in st.session_state.mappings if m["status"] == "Pending Approval"))
    col3.metric("Mapping Compliance Rate", "100%", help="All active mappings conform to GovCloud naming conventions")

    st.divider()

    tab1, tab2, tab3 = st.tabs(["🔍 View & Manage Mappings", "➕ Create Single Mapping", "📤 Bulk Import Mappings"])

    with tab1:
        st.subheader("Active Identity Mappings")
        
        # Filter controls
        f_col1, f_col2 = st.columns(2)
        with f_col1:
            search_query = st.text_input("Search Identities (Source or Target)", "")
        with f_col2:
            filter_type = st.selectbox("Filter by Type", ["All", "User", "Service Principal", "Role / Group"])

        # Filter logic
        filtered_mappings = st.session_state.mappings
        if search_query:
            filtered_mappings = [m for m in filtered_mappings if search_query.lower() in m["source_identity"].lower() or search_query.lower() in m["target_identity"].lower()]
        if filter_type != "All":
            filtered_mappings = [m for m in filtered_mappings if m["type"] == filter_type]

        if not filtered_mappings:
            st.info("No identity mappings found matching the criteria.")
        else:
            df_map = pd.DataFrame(filtered_mappings)
            
            # Display interactive table
            for index, row in df_map.iterrows():
                with st.container():
                    c1, c2, c3, c4, c5 = st.columns([1, 2, 2, 1, 1])
                    c1.markdown(f"**{row['type']}**")
                    c2.markdown(f"**Source:** `{row['source_identity']}`")
                    c3.markdown(f"**Target:** `{row['target_identity']}`")
                    
                    # Status badge
                    if row['status'] == 'Mapped':
                        c4.success("🟢 Mapped")
                    else:
                        c4.warning("🟡 Pending Approval")
                        
                    # Actions
                    with c5:
                        act_col1, act_col2 = st.columns(2)
                        if row['status'] == 'Pending Approval':
                            if act_col1.button("✅", key=f"app_map_{row['id']}", help="Approve Mapping"):
                                # Find index in original list
                                orig_idx = next(i for i, m in enumerate(st.session_state.mappings) if m["id"] == row["id"])
                                st.session_state.mappings[orig_idx]["status"] = "Mapped"
                                add_audit_log("admin@commercial.com", "Approved Identity Mapping", row['source_identity'], "Medium")
                                st.success("Mapping approved!")
                                st.rerun()
                        
                        if act_col2.button("🗑️", key=f"del_map_{row['id']}", help="Delete Mapping"):
                            orig_idx = next(i for i, m in enumerate(st.session_state.mappings) if m["id"] == row["id"])
                            st.session_state.mappings.pop(orig_idx)
                            add_audit_log("admin@commercial.com", "Deleted Identity Mapping", row['source_identity'], "Medium")
                            st.error("Mapping deleted.")
                            st.rerun()
                    st.divider()

    with tab2:
        st.subheader("Create Single Identity Mapping")
        with st.form("single_mapping_form"):
            mapping_type = st.selectbox("Identity Type", ["User", "Service Principal", "Role / Group"])
            
            col_s, col_t = st.columns(2)
            with col_s:
                source_id = st.text_input("Source Identity (Commercial)", placeholder="e.g., user@commercial.com")
            with col_t:
                target_id = st.text_input("Target Identity (Government)", placeholder="e.g., user@gov.internal")
                
            associated_trust = st.selectbox("Associated Federation Trust", [t["name"] for t in st.session_state.trusts])
            
            st.info("💡 **GovCloud Compliance Rule:** Government identities must end with `.gov.internal` or `.mil` to pass automated validation.")
            
            submitted = st.form_submit_button("Create Mapping")
            if submitted:
                if source_id and target_id:
                    # Validate target identity suffix
                    if not (target_id.endswith(".gov.internal") or target_id.endswith(".mil") or "gov" in target_id):
                        st.warning("⚠️ Target identity does not strictly match standard GovCloud naming conventions, but mapping will be created as 'Pending Approval'.")
                        status = "Pending Approval"
                    else:
                        status = "Mapped"
                        
                    trust_id = next(t["id"] for t in st.session_state.trusts if t["name"] == associated_trust)
                    
                    new_map = {
                        "id": f"MAP-00{len(st.session_state.mappings) + 1}",
                        "source_identity": source_id,
                        "target_identity": target_id,
                        "type": mapping_type,
                        "trust_id": trust_id,
                        "status": status
                    }
                    st.session_state.mappings.append(new_map)
                    add_audit_log("admin@commercial.com", "Created Identity Mapping", source_id, "Medium")
                    st.success(f"Identity mapping created successfully with status: {status}!")
                else:
                    st.error("Please fill in both source and target identity fields.")

    with tab3:
        st.subheader("Bulk Import Identity Mappings")
        st.markdown("Upload a CSV file containing bulk identity mappings. The system will automatically validate and stage them.")
        
        # Sample CSV template download
        sample_df = pd.DataFrame({
            "Source Identity": ["user1@commercial.com", "app-sp-01"],
            "Target Identity": ["user1@gov.internal", "gov-app-sp-01"],
            "Type": ["User", "Service Principal"],
            "Trust ID": ["TR-001", "TR-002"]
        })
        
        st.download_button(
            label="📥 Download CSV Template",
            data=sample_df.to_csv(index=False),
            file_name="identity_mapping_template.csv",
            mime="text/csv"
        )
        
        uploaded_file = st.file_uploader("Upload Mapping CSV", type=["csv"])
        if uploaded_file is not None:
            try:
                uploaded_df = pd.read_csv(uploaded_file)
                st.write("### Preview Uploaded Data")
                st.dataframe(uploaded_df)
                
                if st.button("Process and Import Mappings"):
                    count = 0
                    for _, row in uploaded_df.iterrows():
                        new_id = f"MAP-00{len(st.session_state.mappings) + 1}"
                        st.session_state.mappings.append({
                            "id": new_id,
                            "source_identity": row["Source Identity"],
                            "target_identity": row["Target Identity"],
                            "type": row["Type"],
                            "trust_id": row["Trust ID"],
                            "status": "Mapped"
                        })
                        count += 1
                    add_audit_log("admin@commercial.com", f"Bulk Imported {count} Mappings", "CSV Upload", "Medium")
                    st.success(f"Successfully imported {count} identity mappings!")
            except Exception as e:
                st.error(f"Error parsing CSV file: {e}")

# ==========================================
# APP 3: SYNC PIPELINE MONITOR
# ==========================================
elif app_mode == "🔄 Sync Pipeline Monitor":
    st.title("🔄 Cross-Cloud Sync Pipeline Monitor")
    st.markdown("Monitor real-time synchronization pipelines transferring identity states, group memberships, and credentials across clouds.")

    # Metrics Row
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Active Pipelines", "3 / 4", delta="1 Paused")
    col2.metric("Avg Sync Latency", "8.4s", delta="-1.2s (Optimized)")
    col3.metric("Success Rate (24h)", "98.2%", delta="Stable")
    col4.metric("Total Synced Objects", "1,248", delta="+45 today")

    st.divider()

    # Simulated Sync Control Panel
    st.subheader("Pipeline Control Center")
    
    p_col1, p_col2, p_col3 = st.columns(3)
    
    with p_col1:
        st.info("**Pipeline A:** User Identity Sync\n\n*Status:* 🟢 Running (Interval: 15m)")
        if st.button("Trigger Manual Sync A"):
            with st.spinner("Syncing User Identities..."):
                time.sleep(1.5)
            new_run = {
                "run_id": f"SR-{random.randint(910, 999)}",
                "pipeline": "User Identity Sync (Azure Comm -> Gov)",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "duration": "11s",
                "synced_items": random.randint(10, 50),
                "status": "Success",
                "errors": 0
            }
            st.session_state.sync_runs.insert(0, new_run)
            add_audit_log("admin@commercial.com", "Triggered Manual Sync", "User Identity Sync", "Info")
            st.success("Sync completed successfully!")
            st.rerun()

    with p_col2:
        st.info("**Pipeline B:** Service Principal Sync\n\n*Status:* 🟢 Running (Interval: 30m)")
        if st.button("Trigger Manual Sync B"):
            with st.spinner("Syncing Service Principals..."):
                time.sleep(1.5)
            new_run = {
                "run_id": f"SR-{random.randint(910, 999)}",
                "pipeline": "Service Principal Sync (AWS Comm -> GovCloud)",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "duration": "7s",
                "synced_items": random.randint(2, 10),
                "status": "Success",
                "errors": 0
            }
            st.session_state.sync_runs.insert(0, new_run)
            add_audit_log("admin@commercial.com", "Triggered Manual Sync", "Service Principal Sync", "Info")
            st.success("Sync completed successfully!")
            st.rerun()

    with p_col3:
        st.info("**Pipeline C:** Role Mapping Sync\n\n*Status:* 🔴 Failed (Last run failed)")
        if st.button("Troubleshoot & Run Sync C"):
            with st.spinner("Running diagnostics and retrying..."):
                time.sleep(2)
            new_run = {
                "run_id": f"SR-{random.randint(910, 999)}",
                "pipeline": "Role Mapping Sync (GCP -> AWS GovCloud)",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "duration": "5s",
                "synced_items": 4,
                "status": "Success",
                "errors": 0
            }
            st.session_state.sync_runs.insert(0, new_run)
            add_audit_log("System", "Resolved Sync Failure", "Role Mapping Sync", "Medium")
            st.success("Diagnostics passed! Sync completed successfully.")
            st.rerun()

    st.divider()

    # Charts Section
    st.subheader("Sync Performance Analytics")
    
    # Generate mock chart data
    chart_data = pd.DataFrame({
        'Time': [datetime.now() - timedelta(hours=i) for i in range(12, 0, -1)],
        'Synced Objects': [random.randint(50, 150) for _ in range(12)],
        'Latency (s)': [random.uniform(5.0, 12.0) for _ in range(12)]
    })

    fig = go.Figure()
    fig.add_trace(go.Scatter(x=chart_data['Time'], y=chart_data['Synced Objects'], name='Synced Objects', mode='lines+markers', line=dict(color='#1f77b4')))
    fig.add_trace(go.Scatter(x=chart_data['Time'], y=chart_data['Latency (s)'], name='Latency (seconds)', mode='lines+markers', line=dict(color='#ff7f0e'), yaxis='y2'))

    fig.update_layout(
        title='Sync Volume vs Latency (Last 12 Hours)',
        xaxis=dict(title='Time'),
        yaxis=dict(title='Synced Objects Count'),
        yaxis2=dict(title='Latency (seconds)', overlaying='y', side='right'),
        legend=dict(x=0.01, y=0.99)
    )
    st.plotly_chart(fig, use_container_width=True)

    # Sync History Table
    st.subheader("Recent Sync Execution History")
    df_sync = pd.DataFrame(st.session_state.sync_runs)
    
    # Style helper
    def color_status(val):
        if val == 'Success':
            return 'background-color: #d4edda; color: #155724'
        elif val == 'Warning':
            return 'background-color: #fff3cd; color: #856404'
        else:
            return 'background-color: #f8d7da; color: #721c24'

    st.dataframe(df_sync.style.applymap(color_status, subset=['status']), use_container_width=True)

# ==========================================
# APP 4: SECURITY & AUDIT LOG
# ==========================================
elif app_mode == "🛡️ Security & Audit Log":
    st.title("🛡️ Federation Security & Audit Log")
    st.markdown("Audit all federation trust modifications, token exchanges, and run automated security compliance scans.")

    # Security Alerts Banner
    st.warning("⚠️ **Security Advisory:** 1 Trust Relationship is currently suspended due to certificate expiration (TR-004).")

    # Tabs
    tab1, tab2, tab3 = st.tabs(["📋 Audit Trail", "🔍 Token Decoder & Validator", "🛡️ Compliance Scanner"])

    with tab1:
        st.subheader("System Audit Logs")
        
        # Filter logs
        severity_filter = st.multiselect("Filter by Severity", ["Info", "Medium", "High"], default=["Info", "Medium", "High"])
        
        filtered_logs = [log for log in st.session_state.audit_logs if log["severity"] in severity_filter]
        
        if not filtered_logs:
            st.info("No logs found matching the selected severity levels.")
        else:
            df_logs = pd.DataFrame(filtered_logs)
            
            # Color coding severity
            def color_severity(val):
                if val == 'High':
                    return 'color: red; font-weight: bold'
                elif val == 'Medium':
                    return 'color: orange; font-weight: bold'
                return 'color: gray'
                
            st.dataframe(df_logs.style.applymap(color_severity, subset=['severity']), use_container_width=True)

    with tab2:
        st.subheader("SAML / JWT Token Decoder")
        st.markdown("Simulate decoding and validating a cross-cloud federation token to verify claims and signatures.")
        
        mock_token = (
            "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImZlZC1rZXktMSJ9."
            "eyJpc3MiOiJodHRwczovL2lkZW50aXR5LmNvbW1lcmNpYWwuY29tIiwic3ViIjoiYWxpY2Uuc21pdGhAY29tbWVyY2lhbC5jb20iLCJhdWQiOiJodHRwczovL2dvdi1lbmNsYXZlLmludGVybmFsIiwiZXhwIjoxNzMwMDAwMDAwLCJpYXQiOjE2OTgwMDAwMDAsImNsaWVudF9pZCI6ImNvbW0tc3luYy1zZXJ2aWNlIiwicm9sZXMiOlsiR292LURldmVsb3BlciIsIkdvdi1SZWFkZXIiXSwiZm9yY2VfbWZhIjp0cnVlfQ."
            "Signature_Verification_Simulated_FIPS_140_2"
        )
        
        token_input = st.text_area("Paste Federation Token (JWT or SAML Assertion)", value=mock_token, height=150)
        
        if st.button("Decode & Validate Token"):
            try:
                # Simple mock JWT decoder
                parts = token_input.split('.')
                if len(parts) == 3:
                    import base64
                    import json
                    
                    # Decode Header
                    header_pad = parts[0] + '=' * (4 - len(parts[0]) % 4)
                    header = json.loads(base64.b64decode(header_pad).decode('utf-8'))
                    
                    # Decode Payload
                    payload_pad = parts[1] + '=' * (4 - len(parts[1]) % 4)
                    payload = json.loads(base64.b64decode(payload_pad).decode('utf-8'))
                    
                    st.success("✅ Token Signature Verified using FIPS-compliant public key!")
                    
                    col_h, col_p = st.columns(2)
                    with col_h:
                        st.markdown("### Header")
                        st.json(header)
                    with col_p:
                        st.markdown("### Payload / Claims")
                        st.json(payload)
                else:
                    st.error("Invalid token format. Please provide a valid 3-part JWT.")
            except Exception as e:
                st.error(f"Failed to decode token: {e}")

    with tab3:
        st.subheader("Automated Compliance & Security Scan")
        st.markdown("Scan active federation configurations against FedRAMP High and NIST SP 800-53 security controls.")
        
        if st.button("Run Compliance Scan Now"):
            with st.spinner("Scanning cryptographic protocols, certificate validity, and identity mappings..."):
                time.sleep(2)
                
            st.markdown("### Scan Results")
            
            # Compliance Checklist
            checks = [
                {"control": "AC-2 (Account Management)", "desc": "All mapped identities have corresponding active trust anchors.", "status": "Pass"},
                {"control": "IA-2 (Identification & Authentication)", "desc": "MFA enforcement claim verified on all active federation tokens.", "status": "Pass"},
                {"control": "SC-13 (Cryptographic Protection)", "desc": "FIPS 140-2 validated encryption algorithms (AES-256-GCM) in use.", "status": "Pass"},
                {"control": "SC-8 (Transmission Integrity)", "desc": "TLS 1.3 enforced on all sync pipeline endpoints.", "status": "Pass"},
                {"control": "SC-12 (Cryptographic Key Establishment)", "desc": "Trust TR-004 has an expired signing certificate.", "status": "Fail"}
            ]
            
            for check in checks:
                col_c, col_d, col_s = st.columns([2, 5, 1])
                col_c.markdown(f"**{check['control']}**")
                col_d.write(check['desc'])
                if check['status'] == 'Pass':
                    col_s.success("🟢 Pass")
                else:
                    col_s.error("🔴 Fail")
            
            add_audit_log("System", "Executed Compliance Scan", "All Trusts & Mappings", "Medium")