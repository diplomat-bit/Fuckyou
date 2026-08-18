import os
import json
import uuid
import datetime
import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

# Set page config
st.set_page_config(
    page_title="Azure AD App Registration Auditor",
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
    .metric-card {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #0078d4;
    }
    .metric-card-warning {
        border-left: 5px solid #ffaa00;
    }
    .metric-card-danger {
        border-left: 5px solid #d83b01;
    }
    .metric-card-success {
        border-left: 5px solid #107c41;
    }
</style>
""", unsafe_style=True)

# Default Mock Data
DEFAULT_APPS = [
    {
        "appId": "3f8c2b1a-7d9e-4b0c-8f1a-2b3c4d5e6f7a",
        "objectId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
        "displayName": "Salesforce Cloud Sync",
        "createdDateTime": "2021-03-12T10:15:30Z",
        "signInAudience": "AzureADMyOrg",
        "publisherDomain": "contoso.onmicrosoft.com",
        "owners": ["admin@contoso.com", "sales-ops@contoso.com"],
        "hasServicePrincipal": True,
        "servicePrincipalStatus": "Active",
        "replyUrls": ["https://salesforce.contoso.com/oauth/callback"],
        "requiredResourceAccess": ["User.Read.All", "Directory.Read.All", "Contacts.Read"],
        "credentials": [
            {"name": "Client Secret 2024", "type": "Secret", "expiryDate": "2024-12-31", "status": "Valid"},
            {"name": "Legacy Cert", "type": "Certificate", "expiryDate": "2022-01-01", "status": "Expired"}
        ],
        "notes": "Syncs user profiles and sales accounts with Salesforce instance."
    },
    {
        "appId": "8e7d6c5b-4a3b-2c1d-0e9f-8a7b6c5d4e3f",
        "objectId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "displayName": "Grafana Metrics Dashboard",
        "createdDateTime": "2022-08-24T14:22:10Z",
        "signInAudience": "AzureADMyOrg",
        "publisherDomain": "contoso.onmicrosoft.com",
        "owners": [],
        "hasServicePrincipal": True,
        "servicePrincipalStatus": "Active",
        "replyUrls": ["https://grafana.internal.contoso.com/login/generic_oauth"],
        "requiredResourceAccess": ["User.Read"],
        "credentials": [
            {"name": "Grafana Secret", "type": "Secret", "expiryDate": "2023-08-24", "status": "Expired"}
        ],
        "notes": "Internal infrastructure monitoring dashboard. Owner left the company."
    },
    {
        "appId": "5c4d3e2f-1a0b-9c8d-7e6f-5a4b3c2d1e0f",
        "objectId": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
        "displayName": "Slack SSO Integration",
        "createdDateTime": "2020-11-05T09:00:00Z",
        "signInAudience": "AzureADMultipleOrgs",
        "publisherDomain": "slack.com",
        "owners": ["it-support@contoso.com"],
        "hasServicePrincipal": True,
        "servicePrincipalStatus": "Active",
        "replyUrls": ["https://slack.com/signin/find"],
        "requiredResourceAccess": ["User.Read", "Group.Read.All"],
        "credentials": [
            {"name": "Slack Secret Key", "type": "Secret", "expiryDate": "2026-06-30", "status": "Valid"}
        ],
        "notes": "SSO and user provisioning for Slack workspace."
    },
    {
        "appId": "7b6a5b4c-3d2e-1f0a-9b8c-7d6e5f4a3b2c",
        "objectId": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
        "displayName": "Legacy Reporting Tool (Deprecated)",
        "createdDateTime": "2018-05-20T16:45:00Z",
        "signInAudience": "AzureADMyOrg",
        "publisherDomain": "contoso.onmicrosoft.com",
        "owners": ["retired-employee@contoso.com"],
        "hasServicePrincipal": False,
        "servicePrincipalStatus": "None",
        "replyUrls": ["http://localhost:8080/callback"],
        "requiredResourceAccess": ["Directory.ReadWrite.All"],
        "credentials": [
            {"name": "Default Secret", "type": "Secret", "expiryDate": "2021-05-20", "status": "Expired"}
        ],
        "notes": "Old reporting tool. No longer in active use, but app registration remains."
    },
    {
        "appId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "objectId": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
        "displayName": "GitHub Enterprise SSO",
        "createdDateTime": "2023-01-10T11:00:00Z",
        "signInAudience": "AzureADMultipleOrgs",
        "publisherDomain": "github.com",
        "owners": ["devops-lead@contoso.com", "admin@contoso.com"],
        "hasServicePrincipal": True,
        "servicePrincipalStatus": "Active",
        "replyUrls": ["https://github.com/orgs/contoso/saml/consume"],
        "requiredResourceAccess": ["User.Read", "Organization.Read.All"],
        "credentials": [
            {"name": "SAML Cert 2023", "type": "Certificate", "expiryDate": "2025-01-10", "status": "Valid"}
        ],
        "notes": "SAML SSO for GitHub Enterprise Cloud organization."
    },
    {
        "appId": "9f8e7d6c-5b4a-3b2c-1d0e-9f8e7d6c5b4a",
        "objectId": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
        "displayName": "HR Payroll API Connector",
        "createdDateTime": "2023-05-15T08:00:00Z",
        "signInAudience": "AzureADMyOrg",
        "publisherDomain": "contoso.onmicrosoft.com",
        "owners": ["payroll-admin@contoso.com"],
        "hasServicePrincipal": True,
        "servicePrincipalStatus": "Disabled",
        "replyUrls": [],
        "requiredResourceAccess": ["User.Read", "Directory.Read.All"],
        "credentials": [
            {"name": "API Secret", "type": "Secret", "expiryDate": "2024-05-15", "status": "Expired"}
        ],
        "notes": "API connector for payroll system. Temporarily disabled due to security audit."
    },
    {
        "appId": "2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
        "objectId": "6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
        "displayName": "Marketing Automation Bot",
        "createdDateTime": "2023-09-01T13:10:00Z",
        "signInAudience": "AzureADMyOrg",
        "publisherDomain": "contoso.onmicrosoft.com",
        "owners": [],
        "hasServicePrincipal": False,
        "servicePrincipalStatus": "None",
        "replyUrls": ["https://marketing.contoso.com/bot"],
        "requiredResourceAccess": ["Mail.Send", "Contacts.ReadWrite"],
        "credentials": [
            {"name": "Bot Secret", "type": "Secret", "expiryDate": "2024-09-01", "status": "Expired"}
        ],
        "notes": "Automated marketing email sender. Orphaned and missing service principal."
    },
    {
        "appId": "4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d",
        "objectId": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
        "displayName": "Zoom Video Integration",
        "createdDateTime": "2021-06-18T15:30:00Z",
        "signInAudience": "AzureADandPersonalMicrosoftAccount",
        "publisherDomain": "zoom.us",
        "owners": ["it-support@contoso.com"],
        "hasServicePrincipal": True,
        "servicePrincipalStatus": "Active",
        "replyUrls": ["https://zoom.us/oauth/signin"],
        "requiredResourceAccess": ["User.Read", "Calendars.ReadWrite"],
        "credentials": [
            {"name": "Zoom OAuth Secret", "type": "Secret", "expiryDate": "2025-06-18", "status": "Valid"}
        ],
        "notes": "SSO and calendar integration for Zoom meetings."
    }
]

DATA_FILE = "api/apps.txt"

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            st.error(f"Error reading {DATA_FILE}: {e}. Loading default mock data.")
            return DEFAULT_APPS
    else:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        try:
            with open(DATA_FILE, "w") as f:
                json.dump(DEFAULT_APPS, f, indent=2)
        except Exception as e:
            st.warning(f"Could not write default data to {DATA_FILE}: {e}")
        return DEFAULT_APPS

def save_data(apps):
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, "w") as f:
            json.dump(apps, f, indent=2)
        return True
    except Exception as e:
        st.error(f"Error saving data to {DATA_FILE}: {e}")
        return False

# Load and enrich data
apps = load_data()

def enrich_apps(apps_list):
    enriched = []
    today = datetime.date.today()
    
    high_privilege_permissions = {
        "Directory.ReadWrite.All",
        "RoleManagement.ReadWrite.Directory",
        "AppRoleAssignment.ReadWrite.All",
        "User.ReadWrite.All",
        "Domain.ReadWrite.All",
        "Application.ReadWrite.All"
    }
    
    for app in apps_list:
        app_copy = app.copy()
        
        # Owner status
        app_copy["is_orphaned"] = len(app.get("owners", [])) == 0
        
        # Credential status
        has_expired = False
        has_expiring = False
        
        for cred in app.get("credentials", []):
            expiry_str = cred.get("expiryDate", "")
            if expiry_str:
                try:
                    expiry_date = datetime.datetime.strptime(expiry_str, "%Y-%m-%d").date()
                    days_left = (expiry_date - today).days
                    if days_left < 0:
                        cred["status"] = "Expired"
                        has_expired = True
                    elif days_left <= 30:
                        cred["status"] = "Expiring Soon"
                        has_expiring = True
                    else:
                        cred["status"] = "Valid"
                except ValueError:
                    pass
            if cred.get("status") == "Expired":
                has_expired = True
                
        app_copy["has_expired_credentials"] = has_expired
        app_copy["has_expiring_credentials"] = has_expiring
        
        # High privilege permissions
        app_copy["has_high_privilege"] = any(
            perm in high_privilege_permissions 
            for perm in app.get("requiredResourceAccess", [])
        )
        
        # Missing Service Principal
        app_copy["is_missing_sp"] = not app.get("hasServicePrincipal", False) or app.get("servicePrincipalStatus") == "None"
        
        # Insecure reply URLs
        insecure_urls = []
        for url in app.get("replyUrls", []):
            if url.startswith("http://") and "localhost" not in url and "127.0.0.1" not in url:
                insecure_urls.append(url)
        app_copy["is_insecure_reply_url"] = len(insecure_urls) > 0
        app_copy["insecure_urls"] = insecure_urls
        
        enriched.append(app_copy)
        
    return enriched

enriched_apps = enrich_apps(apps)

# Sidebar Filters
st.sidebar.title("🔍 Audit Filters")

search_query = st.sidebar.text_input("Search App Name / ID", "").strip().lower()

sp_filter = st.sidebar.selectbox(
    "Service Principal Status",
    ["All", "Active Service Principal", "Disabled Service Principal", "Missing Service Principal"]
)

owner_filter = st.sidebar.selectbox(
    "Owner Status",
    ["All", "Has Owners", "Orphaned (No Owners)"]
)

cred_filter = st.sidebar.selectbox(
    "Credential Status",
    ["All", "Has Expired Credentials", "Has Expiring Credentials (30 days)", "All Credentials Valid"]
)

audiences = ["All"] + list(set(app["signInAudience"] for app in enriched_apps))
audience_filter = st.sidebar.selectbox("Sign-in Audience", audiences)

# Apply Filters
filtered_apps = enriched_apps

if search_query:
    filtered_apps = [
        app for app in filtered_apps
        if search_query in app["displayName"].lower() or
           search_query in app["appId"].lower() or
           search_query in app["objectId"].lower()
    ]

if sp_filter == "Active Service Principal":
    filtered_apps = [app for app in filtered_apps if app.get("hasServicePrincipal") and app.get("servicePrincipalStatus") == "Active"]
elif sp_filter == "Disabled Service Principal":
    filtered_apps = [app for app in filtered_apps if app.get("hasServicePrincipal") and app.get("servicePrincipalStatus") == "Disabled"]
elif sp_filter == "Missing Service Principal":
    filtered_apps = [app for app in filtered_apps if app["is_missing_sp"]]

if owner_filter == "Has Owners":
    filtered_apps = [app for app in filtered_apps if not app["is_orphaned"]]
elif owner_filter == "Orphaned (No Owners)":
    filtered_apps = [app for app in filtered_apps if app["is_orphaned"]]

if cred_filter == "Has Expired Credentials":
    filtered_apps = [app for app in filtered_apps if app["has_expired_credentials"]]
elif cred_filter == "Has Expiring Credentials (30 days)":
    filtered_apps = [app for app in filtered_apps if app["has_expiring_credentials"]]
elif cred_filter == "All Credentials Valid":
    filtered_apps = [app for app in filtered_apps if not app["has_expired_credentials"] and not app["has_expiring_credentials"]]

if audience_filter != "All":
    filtered_apps = [app for app in filtered_apps if app["signInAudience"] == audience_filter]

# Main Dashboard Layout
st.title("🔐 Azure AD Enterprise App Auditor")
st.markdown("""
This interactive dashboard helps security administrators and IT auditors explore, audit, and manage Azure AD App Registrations and Enterprise Applications.
It identifies security risks, compliance issues, orphaned apps, and expiring credentials.
""")

# KPI Metrics Row
total_apps = len(enriched_apps)
orphaned_count = sum(1 for app in enriched_apps if app["is_orphaned"])
missing_sp_count = sum(1 for app in enriched_apps if app["is_missing_sp"])
expired_cred_count = sum(1 for app in enriched_apps if app["has_expired_credentials"])
expiring_cred_count = sum(1 for app in enriched_apps if app["has_expiring_credentials"])

col1, col2, col3, col4, col5 = st.columns(5)

with col1:
    st.metric("Total Apps", total_apps)
with col2:
    st.metric("Orphaned Apps", orphaned_count, delta=f"{orphaned_count/total_apps*100:.1f}% of total" if total_apps else "0%", delta_color="inverse")
with col3:
    st.metric("Missing SP", missing_sp_count, delta=f"{missing_sp_count/total_apps*100:.1f}% of total" if total_apps else "0%", delta_color="inverse")
with col4:
    st.metric("Expired Secrets", expired_cred_count, delta=f"{expired_cred_count/total_apps*100:.1f}% of total" if total_apps else "0%", delta_color="inverse")
with col5:
    st.metric("Expiring Soon", expiring_cred_count, delta="Next 30 days", delta_color="off")

# Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Dashboard & Analytics", 
    "🔍 App Explorer", 
    "🛡️ Compliance & Security Audit", 
    "➕ Register New App (Simulation)"
])

# Tab 1: Dashboard & Analytics
with tab1:
    st.subheader("Tenant Overview & Analytics")
    
    df_all = pd.DataFrame(enriched_apps)
    
    if not df_all.empty:
        col_chart1, col_chart2 = st.columns(2)
        
        with col_chart1:
            audience_counts = df_all["signInAudience"].value_counts().reset_index()
            audience_counts.columns = ["Audience", "Count"]
            fig_audience = px.pie(
                audience_counts, 
                values="Count", 
                names="Audience", 
                title="Sign-in Audience Distribution",
                color_discrete_sequence=px.colors.qualitative.Pastel
            )
            fig_audience.update_layout(margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig_audience, use_container_width=True)
            
        with col_chart2:
            domain_counts = df_all["publisherDomain"].value_counts().reset_index()
            domain_counts.columns = ["Domain", "Count"]
            fig_domain = px.bar(
                domain_counts, 
                x="Count", 
                y="Domain", 
                orientation="h",
                title="Top Publisher Domains",
                color="Count",
                color_continuous_scale="Blues"
            )
            fig_domain.update_layout(margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig_domain, use_container_width=True)
            
        col_chart3, col_chart4 = st.columns(2)
        
        with col_chart3:
            sp_counts = df_all["servicePrincipalStatus"].value_counts().reset_index()
            sp_counts.columns = ["Status", "Count"]
            fig_sp = px.bar(
                sp_counts,
                x="Status",
                y="Count",
                title="Service Principal Status",
                color="Status",
                color_discrete_map={"Active": "#107c41", "Disabled": "#d83b01", "None": "#ffaa00"}
            )
            fig_sp.update_layout(margin=dict(l=20, r=20, t=40, b=20))
            st.plotly_chart(fig_sp, use_container_width=True)
            
        with col_chart4:
            all_perms = []
            for perms in df_all["requiredResourceAccess"]:
                all_perms.extend(perms)
            
            if all_perms:
                perm_counts = pd.Series(all_perms).value_counts().reset_index()
                perm_counts.columns = ["Permission", "Count"]
                fig_perms = px.bar(
                    perm_counts.head(10),
                    x="Count",
                    y="Permission",
                    orientation="h",
                    title="Top 10 Requested API Permissions",
                    color="Count",
                    color_continuous_scale="Purples"
                )
                fig_perms.update_layout(margin=dict(l=20, r=20, t=40, b=20))
                st.plotly_chart(fig_perms, use_container_width=True)
            else:
                st.info("No API permissions requested by any app.")
    else:
        st.info("No application data available to display charts.")

# Tab 2: App Explorer
with tab2:
    st.subheader("Application Registry Explorer")
    st.markdown(f"Showing **{len(filtered_apps)}** of **{len(enriched_apps)}** applications based on active filters.")
    
    if filtered_apps:
        display_data = []
        for app in filtered_apps:
            display_data.append({
                "Display Name": app["displayName"],
                "App ID": app["appId"],
                "Audience": app["signInAudience"],
                "Publisher": app["publisherDomain"],
                "Owners": ", ".join(app["owners"]) if app["owners"] else "⚠️ None (Orphaned)",
                "SP Status": app["servicePrincipalStatus"],
                "Created Date": app["createdDateTime"][:10]
            })
        
        df_display = pd.DataFrame(display_data)
        st.dataframe(df_display, use_container_width=True, hide_index=True)
        
        st.markdown("---")
        st.subheader("🔍 Detailed Application Inspector")
        selected_app_name = st.selectbox(
            "Select an application to inspect details:",
            options=[app["displayName"] for app in filtered_apps],
            key="app_inspector_selector"
        )
        
        selected_app = next((app for app in filtered_apps if app["displayName"] == selected_app_name), None)
        
        if selected_app:
            col_det1, col_det2 = st.columns([2, 1])
            
            with col_det1:
                st.markdown(f"### {selected_app['displayName']}")
                st.markdown(f"**Description/Notes:** {selected_app.get('notes', 'No description provided.')}")
                
                info_df = pd.DataFrame([
                    {"Property": "Application (Client) ID", "Value": selected_app["appId"]},
                    {"Property": "Directory (Tenant) Object ID", "Value": selected_app["objectId"]},
                    {"Property": "Created Date/Time", "Value": selected_app["createdDateTime"]},
                    {"Property": "Sign-in Audience", "Value": selected_app["signInAudience"]},
                    {"Property": "Publisher Domain", "Value": selected_app["publisherDomain"]},
                    {"Property": "Service Principal Status", "Value": selected_app["servicePrincipalStatus"]}
                ])
                st.table(info_df)
                
                st.markdown("#### 🌐 Redirect URIs (Reply URLs)")
                if selected_app["replyUrls"]:
                    for url in selected_app["replyUrls"]:
                        if url.startswith("http://") and "localhost" not in url:
                            st.error(f"⚠️ Insecure URI: `{url}`")
                        else:
                            st.code(url)
                else:
                    st.warning("No Redirect URIs configured for this application.")
                    
            with col_det2:
                st.markdown("#### 👥 Application Owners")
                if selected_app["owners"]:
                    for owner in selected_app["owners"]:
                        st.markdown(f"- `{owner}`")
                else:
                    st.error("⚠️ **Orphaned Application**\nNo owners assigned. This is a security and operational risk.")
                
                st.markdown("#### 🔑 Required API Permissions")
                if selected_app["requiredResourceAccess"]:
                    for perm in selected_app["requiredResourceAccess"]:
                        high_privs = ["Directory.ReadWrite.All", "RoleManagement.ReadWrite.Directory", "AppRoleAssignment.ReadWrite.All", "User.ReadWrite.All"]
                        if perm in high_privs:
                            st.error(f"🔥 `{perm}` (High Privilege)")
                        else:
                            st.info(f"✔️ `{perm}`")
                else:
                    st.warning("No API permissions requested.")
                
                st.markdown("#### 🔑 Certificates & Secrets")
                if selected_app["credentials"]:
                    for cred in selected_app["credentials"]:
                        expiry_date = cred.get("expiryDate", "N/A")
                        cred_type = cred.get("type", "Secret")
                        cred_name = cred.get("name", "Unnamed")
                        
                        status = cred.get("status", "Valid")
                        if status == "Expired":
                            st.error(f"❌ **{cred_name}** ({cred_type})\nExpired: {expiry_date}")
                        elif status == "Expiring Soon":
                            st.warning(f"⚠️ **{cred_name}** ({cred_type})\nExpiring: {expiry_date}")
                        else:
                            st.success(f"✅ **{cred_name}** ({cred_type})\nExpires: {expiry_date}")
                else:
                    st.info("No credentials/secrets configured.")
    else:
        st.info("No applications match the selected filters.")

# Tab 3: Compliance & Security Audit
with tab3:
    st.subheader("🛡️ Compliance & Security Audit Report")
    st.markdown("Automated analysis of your application registrations against security best practices.")
    
    orphaned = [app for app in enriched_apps if app["is_orphaned"]]
    missing_sp = [app for app in enriched_apps if app["is_missing_sp"]]
    expired_creds = [app for app in enriched_apps if app["has_expired_credentials"]]
    insecure_redirects = [app for app in enriched_apps if app["is_insecure_reply_url"]]
    high_priv = [app for app in enriched_apps if app["has_high_privilege"]]
    
    total_checks = len(enriched_apps) * 5
    total_failures = len(orphaned) + len(missing_sp) + len(expired_creds) + len(insecure_redirects) + len(high_priv)
    compliance_score = max(0, int(((total_checks - total_failures) / total_checks) * 100)) if total_checks > 0 else 100
    
    col_score1, col_score2 = st.columns([1, 3])
    with col_score1:
        st.metric("Tenant Compliance Score", f"{compliance_score}%")
        if compliance_score >= 90:
            st.success("Excellent Security Posture!")
        elif compliance_score >= 70:
            st.warning("Needs Attention.")
        else:
            st.error("Critical Security Risks Found!")
            
    with col_score2:
        st.progress(compliance_score / 100)
        st.markdown("""
        **Audit Criteria:**
        1. **Ownership**: Every app must have at least one designated owner.
        2. **Service Principal**: Active apps must have a corresponding Service Principal.
        3. **Credential Validity**: No active credentials should be expired.
        4. **Secure Redirects**: Redirect URIs must use HTTPS (except localhost).
        5. **Least Privilege**: Limit high-privilege directory permissions.
        """)
        
    st.markdown("---")
    
    with st.expander(f"⚠️ Orphaned Applications ({len(orphaned)})", expanded=len(orphaned) > 0):
        if orphaned:
            st.error("The following applications have no owners. If the creator leaves the company, these apps become unmanaged.")
            orphaned_df = pd.DataFrame([{
                "App Name": app["displayName"],
                "App ID": app["appId"],
                "Created Date": app["createdDateTime"][:10]
            } for app in orphaned])
            st.dataframe(orphaned_df, use_container_width=True, hide_index=True)
        else:
            st.success("All applications have at least one owner.")
            
    with st.expander(f"⚠️ Missing Service Principals ({len(missing_sp)})", expanded=len(missing_sp) > 0):
        if missing_sp:
            st.warning("These app registrations do not have a corresponding Service Principal in the local tenant. They cannot be used for sign-in or token acquisition until one is created.")
            missing_sp_df = pd.DataFrame([{
                "App Name": app["displayName"],
                "App ID": app["appId"],
                "Created Date": app["createdDateTime"][:10]
            } for app in missing_sp])
            st.dataframe(missing_sp_df, use_container_width=True, hide_index=True)
        else:
            st.success("All applications have active Service Principals.")
            
    with st.expander(f"❌ Expired Credentials ({len(expired_creds)})", expanded=len(expired_creds) > 0):
        if expired_creds:
            st.error("These applications have expired client secrets or certificates. Integrations using these credentials will fail.")
            expired_df = []
            for app in expired_creds:
                for cred in app["credentials"]:
                    if cred.get("status") == "Expired":
                        expired_df.append({
                            "App Name": app["displayName"],
                            "Credential Name": cred["name"],
                            "Type": cred["type"],
                            "Expiry Date": cred["expiryDate"]
                        })
            st.dataframe(pd.DataFrame(expired_df), use_container_width=True, hide_index=True)
        else:
            st.success("No applications have expired credentials.")
            
    with st.expander(f"⚠️ Insecure Redirect URIs ({len(insecure_redirects)})", expanded=len(insecure_redirects) > 0):
        if insecure_redirects:
            st.error("The following applications use insecure HTTP redirect URIs. This exposes authorization codes and tokens to interception.")
            insecure_df = []
            for app in insecure_redirects:
                insecure_df.append({
                    "App Name": app["displayName"],
                    "Insecure URIs": ", ".join(app["insecure_urls"])
                })
            st.dataframe(pd.DataFrame(insecure_df), use_container_width=True, hide_index=True)
        else:
            st.success("All redirect URIs are secure (HTTPS or localhost).")
            
    with st.expander(f"🔥 High-Privilege Permissions ({len(high_priv)})", expanded=len(high_priv) > 0):
        if high_priv:
            st.warning("These applications have been granted high-privilege directory permissions. Ensure these are strictly necessary and regularly reviewed.")
            high_priv_df = []
            for app in high_priv:
                high_priv_df.append({
                    "App Name": app["displayName"],
                    "Permissions": ", ".join([p for p in app["requiredResourceAccess"] if p in ["Directory.ReadWrite.All", "RoleManagement.ReadWrite.Directory", "AppRoleAssignment.ReadWrite.All", "User.ReadWrite.All"]])
                })
            st.dataframe(pd.DataFrame(high_priv_df), use_container_width=True, hide_index=True)
        else:
            st.success("No applications have high-privilege directory permissions.")

# Tab 4: Register New App (Simulation)
with tab4:
    st.subheader("➕ Register New Application (Simulation)")
    st.markdown("Simulate registering a new application in Azure AD. This will save the application to `api/apps.txt` and update the dashboard.")
    
    with st.form("register_app_form"):
        col_form1, col_form2 = st.columns(2)
        
        with col_form1:
            new_display_name = st.text_input("Application Display Name", placeholder="e.g., ServiceNow Integration")
            new_audience = st.selectbox("Sign-in Audience", ["AzureADMyOrg", "AzureADMultipleOrgs", "AzureADandPersonalMicrosoftAccount"])
            new_publisher = st.text_input("Publisher Domain", value="contoso.onmicrosoft.com")
            new_owners = st.text_input("Owners (comma-separated emails)", placeholder="admin@contoso.com, dev@contoso.com")
            
        with col_form2:
            new_has_sp = st.checkbox("Create Service Principal immediately?", value=True)
            new_sp_status = st.selectbox("Service Principal Status", ["Active", "Disabled"]) if new_has_sp else "None"
            new_reply_urls = st.text_area("Redirect URIs (one per line)", placeholder="https://myapp.contoso.com/login")
            new_permissions = st.multiselect(
                "Required API Permissions",
                options=[
                    "User.Read", "User.Read.All", "User.ReadWrite.All",
                    "Directory.Read.All", "Directory.ReadWrite.All",
                    "Mail.Send", "Calendars.ReadWrite", "Group.Read.All",
                    "RoleManagement.ReadWrite.Directory"
                ],
                default=["User.Read"]
            )
            
        st.markdown("#### 🔑 Initial Client Secret (Optional)")
        col_cred1, col_cred2 = st.columns(2)
        with col_cred1:
            new_cred_name = st.text_input("Secret Name", value="Initial Client Secret")
        with col_cred2:
            new_cred_expiry = st.date_input("Secret Expiry Date", value=datetime.date.today() + datetime.timedelta(days=365))
            
        new_notes = st.text_area("Application Notes/Description", placeholder="Describe the purpose of this application...")
        
        submit_btn = st.form_submit_button("Register Application")
        
        if submit_btn:
            if not new_display_name:
                st.error("Application Display Name is required.")
            else:
                owners_list = [email.strip() for email in new_owners.split(",") if email.strip()]
                reply_urls_list = [url.strip() for url in new_reply_urls.split("\n") if url.strip()]
                
                credentials_list = []
                if new_cred_name:
                    credentials_list.append({
                        "name": new_cred_name,
                        "type": "Secret",
                        "expiryDate": new_cred_expiry.strftime("%Y-%m-%d"),
                        "status": "Valid"
                    })
                
                new_app = {
                    "appId": str(uuid.uuid4()),
                    "objectId": str(uuid.uuid4()),
                    "displayName": new_display_name,
                    "createdDateTime": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "signInAudience": new_audience,
                    "publisherDomain": new_publisher,
                    "owners": owners_list,
                    "hasServicePrincipal": new_has_sp,
                    "servicePrincipalStatus": new_sp_status if new_has_sp else "None",
                    "replyUrls": reply_urls_list,
                    "requiredResourceAccess": new_permissions,
                    "credentials": credentials_list,
                    "notes": new_notes
                }
                
                current_apps = load_data()
                current_apps.append(new_app)
                
                if save_data(current_apps):
                    st.success(f"Successfully registered application **{new_display_name}**!")
                    st.balloons()
                    st.rerun()

# Admin Actions in Sidebar
st.sidebar.markdown("---")
st.sidebar.subheader("⚙️ Admin Actions")
if st.sidebar.button("Reset to Default Mock Data"):
    if save_data(DEFAULT_APPS):
        st.sidebar.success("Data reset successfully!")
        st.rerun()