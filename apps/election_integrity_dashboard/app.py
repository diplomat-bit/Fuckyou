import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# Set page configuration
st.set_page_config(
    page_title="Election Integrity & Compliance Dashboard",
    page_icon="🗳️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional styling
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .metric-card {
        background-color: #ffffff;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .section-header {
        color: #1e3d59;
        border-bottom: 2px solid #ff6e40;
        padding-bottom: 8px;
        margin-top: 30px;
        margin-bottom: 20px;
    }
    .framework-card {
        background-color: #ffffff;
        border-left: 5px solid #1e3d59;
        border-radius: 4px;
        padding: 15px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .framework-card-compliant {
        border-left: 5px solid #2ec4b6;
    }
    .framework-card-noncompliant {
        border-left: 5px solid #e71d36;
    }
    </style>
""", unsafe_allow_html=True)

# --- MOCK DATA GENERATION ---
@st.cache_data
def generate_mock_data():
    states = ["Georgia", "Arizona", "Wisconsin", "Pennsylvania", "Michigan", "Nevada"]
    counties = {
        "Georgia": ["Fulton", "Gwinnett", "Cobb", "DeKalb", "Chatham"],
        "Arizona": ["Maricopa", "Pima", "Pinal", "Yuma", "Coconino"],
        "Wisconsin": ["Milwaukee", "Dane", "Waukesha", "Brown", "Outagamie"],
        "Pennsylvania": ["Philadelphia", "Allegheny", "Montgomery", "Bucks", "Delaware"],
        "Michigan": ["Wayne", "Oakland", "Macomb", "Kent", "Genesee"],
        "Nevada": ["Clark", "Washoe", "Lyon", "Elko", "Douglas"]
    }
    
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    data = []
    np.random.seed(42) # For reproducible mock data
    
    for state in states:
        for county in counties[state]:
            for i, month in enumerate(months):
                # Simulate realistic growth and seasonal patterns
                base_records = np.random.randint(10000, 50000)
                verification_successes = int(base_records * np.random.uniform(0.92, 0.97))
                pending_verifications = int((base_records - verification_successes) * np.random.uniform(0.6, 0.8))
                data_corrections = base_records - verification_successes - pending_verifications
                
                data.append({
                    "Month": month,
                    "Month_Num": i + 1,
                    "State": state,
                    "County": county,
                    "Total_Records": base_records,
                    "Verification_Successes": verification_successes,
                    "Pending_Verifications": pending_verifications,
                    "Data_Corrections": data_corrections
                })
                
    return pd.DataFrame(data)

df_raw = generate_mock_data()

# --- 15-POINT IRAN FRAMEWORK DATA ---
if 'framework_status' not in st.session_state:
    st.session_state.framework_status = {
        1: {"title": "Foreign IP Blocking", "desc": "Block known hostile state actors and foreign IP ranges from accessing voter registration databases.", "status": True, "notes": "Geo-blocking active. Cloudflare WAF configured for strict country-based blocking."},
        2: {"title": "Multi-Factor Authentication (MFA)", "desc": "Enforce hardware-based or app-based MFA for all election administrators and database operators.", "status": True, "notes": "YubiKeys deployed to all county election administrators."},
        3: {"title": "Air-gapped Tabulation Systems", "desc": "Ensure tabulation systems are physically isolated from the internet and local networks.", "status": True, "notes": "Physical audits confirm zero network connectivity on tabulation machines."},
        4: {"title": "Paper Ballot Backup & Audit Trail", "desc": "Maintain a 100% voter-verifiable paper audit trail (VVPAT) for all electronic votes.", "status": True, "notes": "All voting machines print physical paper ballots verified by voters before casting."},
        5: {"title": "Continuous Voter Roll Verification", "desc": "Cross-reference voter rolls monthly with national change-of-address (NCOA) and death registries.", "status": False, "notes": "Monthly sync active, but integration with state vital statistics has a 5-day latency."},
        6: {"title": "Secure Chain of Custody", "desc": "Implement GPS-tracked transport and dual-custody logs for all physical ballots and memory cards.", "status": True, "notes": "GPS tracking active on all transport vehicles. Dual-signature logs verified daily."},
        7: {"title": "Real-time Intrusion Detection Systems (IDS)", "desc": "Deploy active network monitoring and endpoint detection on all election office networks.", "status": True, "notes": "CrowdStrike Falcon deployed on all endpoints; Albert sensors active on network perimeter."},
        8: {"title": "Regular Penetration Testing", "desc": "Conduct third-party vulnerability assessments and penetration testing quarterly.", "status": False, "notes": "Q3 pen-test scheduled for next week. Q2 remediation completed."},
        9: {"title": "Signature Verification Auditing", "desc": "Implement standardized, audited training and automated verification tools for mail-in ballot signatures.", "status": True, "notes": "Bipartisan signature review panels trained and certified."},
        10: {"title": "Secure Storage of Ballots", "desc": "Store physical ballots in 24/7 video-monitored, dual-lock facilities with restricted access control.", "status": True, "notes": "Live feeds active. Access logs integrated with central security dashboard."},
        11: {"title": "Background Checks for Election Staff", "desc": "Perform comprehensive background checks on all permanent, temporary, and volunteer election workers.", "status": True, "notes": "100% of active staff cleared through state police background checks."},
        12: {"title": "Encrypted Data Transmission", "desc": "Encrypt all election-related data in transit and at rest using AES-256 or equivalent standards.", "status": True, "notes": "All database volumes encrypted. TLS 1.3 enforced for all internal APIs."},
        13: {"title": "Publicly Verifiable Hash Chains", "desc": "Publish cryptographic hashes of daily transaction logs to prevent retroactive tampering.", "status": False, "notes": "Implementation in progress. Target completion: next month."},
        14: {"title": "Disaster Recovery & Offline Failover", "desc": "Maintain hot-standby database replicas and paper-based backup procedures for all polling places.", "status": True, "notes": "Paper pollbooks printed and distributed to all precincts as emergency backup."},
        15: {"title": "Post-Election Risk-Limiting Audits (RLA)", "desc": "Mandate and execute statistically sound risk-limiting audits prior to final certification.", "status": True, "notes": "RLA protocols approved by State Board of Elections."}
    }

# --- SIDEBAR FILTERS ---
st.sidebar.image("https://img.icons8.com/fluency/96/000000/checked-user-male.png", width=80)
st.sidebar.title("Election Integrity Portal")
st.sidebar.markdown("### Public Dashboard & Compliance Tracker")
st.sidebar.markdown("---")

# Navigation
app_mode = st.sidebar.radio("Navigate to:", ["Section 18.0: Public Dashboard", "Section 5.0: 15-Point Iran Framework"])

st.sidebar.markdown("---")
st.sidebar.markdown("### Data Filters")

# State Filter
selected_states = st.sidebar.multiselect("Select States", options=sorted(df_raw["State"].unique()), default=sorted(df_raw["State"].unique()))

# County Filter (Dynamic based on selected states)
filtered_counties_options = sorted(df_raw[df_raw["State"].isin(selected_states)]["County"].unique()) if selected_states else []
selected_counties = st.sidebar.multiselect("Select Counties", options=filtered_counties_options, default=filtered_counties_options[:5] if filtered_counties_options else [])

# Month Filter
selected_months = st.sidebar.multiselect("Select Months", options=df_raw["Month"].unique(), default=df_raw["Month"].unique()[:6])

# Filter Data
df_filtered = df_raw[
    (df_raw["State"].isin(selected_states)) &
    (df_raw["County"].isin(selected_counties)) &
    (df_raw["Month"].isin(selected_months))
]

# --- MAIN CONTENT ---

if app_mode == "Section 18.0: Public Dashboard":
    st.title("🗳️ Section 18.0: Public Election Integrity Dashboard")
    st.markdown("""
    This public-facing dashboard visualizes anonymized monthly aggregates of voter registration verification successes, 
    pending verifications, and data correction rates at the state and county levels. 
    *All data is fully anonymized to protect voter privacy in compliance with federal and state regulations.*
    """)
    
    if df_filtered.empty:
        st.warning("No data matches the selected filters. Please adjust your filters in the sidebar.")
    else:
        # --- KPI METRICS ---
        total_records = df_filtered["Total_Records"].sum()
        total_success = df_filtered["Verification_Successes"].sum()
        total_pending = df_filtered["Pending_Verifications"].sum()
        total_corrections = df_filtered["Data_Corrections"].sum()
        
        success_rate = (total_success / total_records) * 100 if total_records > 0 else 0
        pending_rate = (total_pending / total_records) * 100 if total_records > 0 else 0
        correction_rate = (total_corrections / total_records) * 100 if total_records > 0 else 0
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <p style="color: #6c757d; margin-bottom: 5px; font-size: 14px; font-weight: bold;">TOTAL RECORDS PROCESSED</p>
                <h2 style="color: #1e3d59; margin: 0;">{total_records:,}</h2>
                <p style="color: #2ec4b6; margin-top: 5px; font-size: 12px;">100% Anonymized Aggregates</p>
            </div>
            """, unsafe_allow_html=True)
        with col2:
            st.markdown(f"""
            <div class="metric-card">
                <p style="color: #6c757d; margin-bottom: 5px; font-size: 14px; font-weight: bold;">VERIFICATION SUCCESS RATE</p>
                <h2 style="color: #2ec4b6; margin: 0;">{success_rate:.2f}%</h2>
                <p style="color: #6c757d; margin-top: 5px; font-size: 12px;">{total_success:,} Records Verified</p>
            </div>
            """, unsafe_allow_html=True)
        with col3:
            st.markdown(f"""
            <div class="metric-card">
                <p style="color: #6c757d; margin-bottom: 5px; font-size: 14px; font-weight: bold;">PENDING VERIFICATIONS</p>
                <h2 style="color: #ff6e40; margin: 0;">{pending_rate:.2f}%</h2>
                <p style="color: #6c757d; margin-top: 5px; font-size: 12px;">{total_pending:,} Awaiting Verification</p>
            </div>
            """, unsafe_allow_html=True)
        with col4:
            st.markdown(f"""
            <div class="metric-card">
                <p style="color: #6c757d; margin-bottom: 5px; font-size: 14px; font-weight: bold;">DATA CORRECTION RATE</p>
                <h2 style="color: #e71d36; margin: 0;">{correction_rate:.2f}%</h2>
                <p style="color: #6c757d; margin-top: 5px; font-size: 12px;">{total_corrections:,} Discrepancies Resolved</p>
            </div>
            """, unsafe_allow_html=True)
            
        # --- CHARTS SECTION ---
        st.markdown("<h3 class='section-header'>Verification Trends & Performance Metrics</h3>", unsafe_allow_html=True)
        
        chart_col1, chart_col2 = st.columns(2)
        
        with chart_col1:
            st.subheader("Monthly Verification Status Breakdown")
            # Aggregate by month
            df_monthly = df_filtered.groupby(["Month_Num", "Month"])[["Verification_Successes", "Pending_Verifications", "Data_Corrections"]].sum().reset_index()
            df_monthly = df_monthly.sort_values("Month_Num")
            
            fig_monthly = go.Figure()
            fig_monthly.add_trace(go.Bar(x=df_monthly["Month"], y=df_monthly["Verification_Successes"], name="Successes", marker_color="#2ec4b6"))
            fig_monthly.add_trace(go.Bar(x=df_monthly["Month"], y=df_monthly["Pending_Verifications"], name="Pending", marker_color="#ff6e40"))
            fig_monthly.add_trace(go.Bar(x=df_monthly["Month"], y=df_monthly["Data_Corrections"], name="Corrections", marker_color="#e71d36"))
            
            fig_monthly.update_layout(
                barmode='stack',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                margin=dict(l=20, r=20, t=30, b=20),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
            )
            st.plotly_chart(fig_monthly, use_container_width=True)
            
        with chart_col2:
            st.subheader("Data Correction Rates by State")
            # Aggregate by State
            df_state = df_filtered.groupby("State")[["Total_Records", "Data_Corrections"]].sum().reset_index()
            df_state["Correction_Rate"] = (df_state["Data_Corrections"] / df_state["Total_Records"]) * 100
            
            fig_state = px.bar(
                df_state, 
                x="State", 
                y="Correction_Rate", 
                text="Correction_Rate",
                labels={"Correction_Rate": "Correction Rate (%)"},
                color="State",
                color_discrete_sequence=px.colors.qualitative.Safe
            )
            fig_state.update_traces(texttemplate='%{text:.2f}%', textposition='outside')
            fig_state.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                margin=dict(l=20, r=20, t=30, b=20),
                showlegend=False
            )
            st.plotly_chart(fig_state, use_container_width=True)

        # --- COUNTY LEVEL ANALYSIS ---
        st.markdown("<h3 class='section-header'>County-Level Granular Performance</h3>", unsafe_allow_html=True)
        
        # Aggregate by County
        df_county = df_filtered.groupby(["State", "County"])[["Total_Records", "Verification_Successes", "Pending_Verifications", "Data_Corrections"]].sum().reset_index()
        df_county["Success_Rate (%)"] = np.round((df_county["Verification_Successes"] / df_county["Total_Records"]) * 100, 2)
        df_county["Pending_Rate (%)"] = np.round((df_county["Pending_Verifications"] / df_county["Total_Records"]) * 100, 2)
        df_county["Correction_Rate (%)"] = np.round((df_county["Data_Corrections"] / df_county["Total_Records"]) * 100, 2)
        
        # Search and filter table
        search_query = st.text_input("🔍 Search County or State", "")
        if search_query:
            df_county_display = df_county[
                df_county["State"].str.contains(search_query, case=False) | 
                df_county["County"].str.contains(search_query, case=False)
            ]
        else:
            df_county_display = df_county
            
        st.dataframe(
            df_county_display.style.background_gradient(subset=["Success_Rate (%)"], cmap="YlGn")
            .background_gradient(subset=["Correction_Rate (%)"], cmap="OrRd"),
            use_container_width=True,
            hide_index=True
        )
        
        # --- EXPORT SECTION ---
        st.markdown("### 📥 Export Anonymized Public Data")
        csv = df_filtered.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="Download Filtered Dataset (CSV)",
            data=csv,
            file_name=f"election_integrity_export_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv"
        )

elif app_mode == "Section 5.0: 15-Point Iran Framework":
    st.title("🛡️ Section 5.0: The 15-Point Iran Framework Compliance Tracker")
    st.markdown("""
    The **15-Point Iran Framework** is a rigorous national security checklist designed to safeguard election infrastructure 
    against sophisticated foreign state-sponsored cyber threats, influence campaigns, and infrastructure penetration.
    """)
    
    # Calculate compliance metrics
    total_points = len(st.session_state.framework_status)
    compliant_points = sum(1 for item in st.session_state.framework_status.values() if item["status"])
    compliance_percentage = (compliant_points / total_points) * 100
    
    # Compliance Progress Bar
    st.markdown("### Overall Framework Compliance Status")
    col_metric, col_progress = st.columns([1, 3])
    with col_metric:
        st.metric(label="Compliance Score", value=f"{compliant_points} / {total_points}", delta=f"{compliance_percentage:.1f}% Complete")
    with col_progress:
        st.markdown("<br>", unsafe_allow_html=True)
        st.progress(compliance_percentage / 100)
        
    st.markdown("<h3 class='section-header'>Interactive Compliance Checklist</h3>", unsafe_allow_html=True)
    st.info("💡 **Compliance Officers:** You can toggle the compliance status of each point below and update audit notes in real-time.")
    
    # Render the 15 points
    for key, item in st.session_state.framework_status.items():
        card_class = "framework-card-compliant" if item["status"] else "framework-card-noncompliant"
        status_label = "🟢 COMPLIANT" if item["status"] else "🔴 NON-COMPLIANT / ACTION REQUIRED"
        
        with st.container():
            st.markdown(f"""
            <div class="framework-card {card_class}">
                <span style="font-size: 12px; font-weight: bold; color: {'#2ec4b6' if item['status'] else '#e71d36'}">{status_label}</span>
                <h4 style="margin: 5px 0 10px 0; color: #1e3d59;">Point {key}: {item['title']}</h4>
                <p style="font-size: 14px; color: #495057; margin-bottom: 10px;">{item['desc']}</p>
            </div>
            """, unsafe_allow_html=True)
            
            # Interactive controls inside an expander to keep UI clean
            with st.expander(f"Audit & Edit Point {key}"):
                col_toggle, col_notes = st.columns([1, 3])
                with col_toggle:
                    new_status = st.checkbox("Mark as Compliant", value=item["status"], key=f"status_{key}")
                    if new_status != item["status"]:
                        st.session_state.framework_status[key]["status"] = new_status
                        st.rerun()
                with col_notes:
                    new_notes = st.text_area("Audit Notes / Remediation Plan", value=item["notes"], key=f"notes_{key}")
                    if new_notes != item["notes"]:
                        st.session_state.framework_status[key]["notes"] = new_notes
                        
    # --- AUDIT LOG EXPORT ---
    st.markdown("<h3 class='section-header'>Generate Official Compliance Report</h3>", unsafe_allow_html=True)
    st.markdown("Generate a signed, timestamped PDF/Text report of the current compliance posture for submission to state authorities.")
    
    report_text = f"""==================================================
ELECTION INTEGRITY COMPLIANCE REPORT
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Framework: Section 5.0 (The 15-Point Iran Framework)
Overall Compliance Score: {compliance_percentage:.1f}% ({compliant_points}/{total_points} Points Met)
==================================================\n\n"""

    for key, item in st.session_state.framework_status.items():
        status_str = "COMPLIANT" if item["status"] else "NON-COMPLIANT"
        report_text += f"Point {key}: {item['title']}\n"
        report_text += f"Status: {status_str}\n"
        report_text += f"Description: {item['desc']}\n"
        report_text += f"Audit Notes: {item['notes']}\n"
        report_text += "-" * 50 + "\n"
        
    st.download_button(
        label="📥 Export Official Compliance Report (.TXT)",
        data=report_text,
        file_name=f"iran_framework_compliance_report_{datetime.now().strftime('%Y%m%d')}.txt",
        mime="text/plain"
    )

# --- FOOTER ---
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #6c757d; font-size: 12px; padding: 20px 0;">
    <strong>Election Integrity Portal</strong> • Secure, Transparent, and Verifiable Elections.<br>
    This portal complies with Section 18.0 (Public Dashboard) and Section 5.0 (The 15-Point Iran Framework) guidelines.<br>
    © 2024 State Board of Election Commissioners. All rights reserved.
</div>
""", unsafe_allow_html=True)