import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import json
import random
import datetime

# Set page configuration
st.set_page_config(
    page_title="Balance Transfer Compliance Auditor",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- SESSION STATE INITIALIZATION ---
if 'offers_data' not in st.session_state:
    # Generate initial mock data
    random.seed(42)
    states = ["NY", "CA", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI"]
    initial_offers = []
    
    for i in range(1, 101):
        credit_score = random.randint(500, 850)
        # Higher credit score generally gets higher transfer limits and lower APRs
        if credit_score > 740:
            requested_amount = random.randint(10000, 40000)
            offered_apr = round(random.uniform(12.0, 18.0), 2)
            promo_apr = round(random.choice([0.0, 1.99, 2.99, 4.99]), 2)
            promo_duration = random.choice([12, 15, 18, 21])
            fee_percent = round(random.uniform(2.0, 4.0), 2)
        elif credit_score > 670:
            requested_amount = random.randint(5000, 25000)
            offered_apr = round(random.uniform(16.0, 24.0), 2)
            promo_apr = round(random.choice([0.0, 3.99, 4.99, 6.99]), 2)
            promo_duration = random.choice([6, 12, 15])
            fee_percent = round(random.uniform(3.0, 5.0), 2)
        else:
            requested_amount = random.randint(1000, 12000)
            offered_apr = round(random.uniform(22.0, 29.99), 2)
            promo_apr = round(random.choice([0.0, 5.99, 8.99]), 2)
            promo_duration = random.choice([0, 6, 12])
            fee_percent = round(random.uniform(3.0, 6.0), 2)

        # Introduce some compliance violations intentionally
        is_violator = random.random() < 0.25
        if is_violator:
            violation_type = random.choice(["high_apr", "undisclosed_fee", "excessive_fee", "over_limit"])
            if violation_type == "high_apr":
                offered_apr = round(random.uniform(30.0, 36.0), 2)
            elif violation_type == "undisclosed_fee":
                fee_percent = 0.0  # Will trigger disclosure mismatch or hidden fee
            elif violation_type == "excessive_fee":
                fee_percent = round(random.uniform(6.5, 10.0), 2)
            elif violation_type == "over_limit":
                requested_amount = 45000 if credit_score < 600 else 60000

        disclosed = True if fee_percent > 0 else False
        if not disclosed and random.random() > 0.5:
            # Hidden fee scenario
            fee_percent = round(random.uniform(3.0, 5.0), 2)
            disclosed = False

        initial_offers.append({
            "offer_id": f"BT-OFFER-{1000 + i}",
            "customer_id": f"CUST-{random.randint(10000, 99999)}",
            "credit_score": credit_score,
            "requested_transfer_amount": requested_amount,
            "offered_apr": offered_apr,
            "promo_apr": promo_apr,
            "promo_duration_months": promo_duration,
            "processing_fee_percent": fee_percent,
            "processing_fee_disclosed": disclosed,
            "state": random.choice(states),
            "timestamp": (datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d %H:%M:%S"),
            "audit_status": "Pending Review",
            "audit_notes": ""
        })
    st.session_state.offers_data = initial_offers

# --- COMPLIANCE RULES ENGINE ---
def evaluate_compliance(offer, thresholds):
    """
    Evaluates a single balance transfer offer against regulatory and risk thresholds.
    """
    violations = []
    warnings = []
    score_deductions = 0
    
    # Rule 1: APR Cap Check
    state_apr_cap = thresholds['state_apr_caps'].get(offer['state'], thresholds['default_max_apr'])
    if offer['offered_apr'] > state_apr_cap:
        violations.append(f"APR of {offer['offered_apr']}% exceeds the legal cap of {state_apr_cap}% for state {offer['state']}.")
        score_deductions += 40
    elif offer['offered_apr'] > (state_apr_cap - 3.0):
        warnings.append(f"APR of {offer['offered_apr']}% is close to the legal cap of {state_apr_cap}%.")
        score_deductions += 10

    # Rule 2: Processing Fee Disclosure & Cap
    if not offer['processing_fee_disclosed']:
        violations.append("Processing fee is applied but not explicitly disclosed in the terms.")
        score_deductions += 50
    
    if offer['processing_fee_percent'] > thresholds['max_fee_percent']:
        violations.append(f"Processing fee of {offer['processing_fee_percent']}% exceeds the maximum allowed limit of {thresholds['max_fee_percent']}%.")
        score_deductions += 30
    elif offer['processing_fee_percent'] > (thresholds['max_fee_percent'] - 1.5):
        warnings.append(f"Processing fee of {offer['processing_fee_percent']}% is near the maximum limit.")
        score_deductions += 5

    # Rule 3: Credit Risk Alignment (Max Loan Limits)
    credit_score = offer['credit_score']
    amount = offer['requested_transfer_amount']
    
    # Determine max limit based on credit tier
    if credit_score < 580:
        limit = thresholds['limit_poor']
        tier = "Poor (<580)"
    elif credit_score < 670:
        limit = thresholds['limit_fair']
        tier = "Fair (580-669)"
    elif credit_score < 740:
        limit = thresholds['limit_good']
        tier = "Good (670-739)"
    else:
        limit = thresholds['limit_excellent']
        tier = "Excellent (740+)"
        
    if amount > limit:
        violations.append(f"Requested transfer amount ${amount:,} exceeds the risk policy limit of ${limit:,} for credit tier '{tier}'.")
        score_deductions += 35
    elif amount > (limit * 0.9):
        warnings.append(f"Requested transfer amount ${amount:,} is within 10% of the risk policy limit (${limit:,}).")
        score_deductions += 10

    # Rule 4: Promotional Transparency
    if offer['promo_apr'] > 0 and offer['promo_duration_months'] < 6:
        warnings.append(f"Short promotional window ({offer['promo_duration_months']} months) with non-zero promo APR ({offer['promo_apr']}%). Potential transparency risk.")
        score_deductions += 15

    # Calculate final compliance score
    compliance_score = max(0, 100 - score_deductions)
    
    # Determine overall status
    if len(violations) > 0:
        status = "Non-Compliant"
    elif len(warnings) > 0:
        status = "Needs Review"
    else:
        status = "Compliant"
        
    return {
        "status": status,
        "score": compliance_score,
        "violations": violations,
        "warnings": warnings
    }

# --- SIDEBAR CONTROLS ---
st.sidebar.title("⚖️ Compliance Settings")
st.sidebar.markdown("Configure regulatory thresholds and risk policies below to dynamically audit the balance transfer offers.")

with st.sidebar.expander("Regulatory APR Caps", expanded=True):
    default_max_apr = st.slider("Default Max APR (%)", 18.0, 36.0, 24.0, 0.5)
    st.markdown("**State-Specific Overrides:**")
    ny_cap = st.slider("New York (NY) Cap (%)", 15.0, 30.0, 16.0, 0.5)
    ca_cap = st.slider("California (CA) Cap (%)", 15.0, 30.0, 22.0, 0.5)
    tx_cap = st.slider("Texas (TX) Cap (%)", 15.0, 30.0, 24.0, 0.5)

with st.sidebar.expander("Fee & Disclosure Rules", expanded=True):
    max_fee_percent = st.slider("Max Processing Fee (%)", 1.0, 10.0, 5.0, 0.1)
    require_disclosure = st.checkbox("Flag Undisclosed Fees", value=True)

with st.sidebar.expander("Credit Risk Limits", expanded=True):
    limit_poor = st.number_input("Max Limit: Poor (<580)", 500, 10000, 5000, 500)
    limit_fair = st.number_input("Max Limit: Fair (580-669)", 1000, 25000, 15000, 1000)
    limit_good = st.number_input("Max Limit: Good (670-739)", 5000, 50000, 30000, 2500)
    limit_excellent = st.number_input("Max Limit: Excellent (740+)", 10000, 100000, 50000, 5000)

# Package thresholds
thresholds = {
    "default_max_apr": default_max_apr,
    "state_apr_caps": {
        "NY": ny_cap,
        "CA": ca_cap,
        "TX": tx_cap
    },
    "max_fee_percent": max_fee_percent,
    "require_disclosure": require_disclosure,
    "limit_poor": limit_poor,
    "limit_fair": limit_fair,
    "limit_good": limit_good,
    "limit_excellent": limit_excellent
}

# --- DATA PROCESSING ---
# Run compliance engine on all offers
audited_offers = []
for offer in st.session_state.offers_data:
    evaluation = evaluate_compliance(offer, thresholds)
    audited_offer = offer.copy()
    audited_offer.update({
        "compliance_status": evaluation["status"],
        "compliance_score": evaluation["score"],
        "violations": evaluation["violations"],
        "warnings": evaluation["warnings"]
    })
    audited_offers.append(audited_offer)

df_audited = pd.DataFrame(audited_offers)

# --- APP HEADER ---
st.title("⚖️ Balance Transfer Compliance Auditor")
st.markdown("""
This dashboard enables risk officers to monitor, audit, and verify balance transfer eligibility offers against financial regulations and internal credit risk policies.
Analyze simulated API payloads, flag violations, and export audit logs for regulatory reporting.
""")

# --- METRICS DASHBOARD ---
total_offers = len(df_audited)
non_compliant_count = len(df_audited[df_audited['compliance_status'] == 'Non-Compliant'])
needs_review_count = len(df_audited[df_audited['compliance_status'] == 'Needs Review'])
compliant_count = len(df_audited[df_audited['compliance_status'] == 'Compliant'])
avg_compliance_score = df_audited['compliance_score'].mean()

m1, m2, m3, m4, m5 = st.columns(5)
with m1:
    st.metric("Total Audited Offers", f"{total_offers:,}")
with m2:
    st.metric("Compliant Offers", f"{compliant_count:,}", f"{compliant_count/total_offers*100:.1f}% of total", delta_color="normal")
with m3:
    st.metric("Needs Review", f"{needs_review_count:,}", f"{needs_review_count/total_offers*100:.1f}% of total", delta_color="off")
with m4:
    st.metric("Non-Compliant (Violations)", f"{non_compliant_count:,}", f"{non_compliant_count/total_offers*100:.1f}% of total", delta_color="inverse")
with m5:
    st.metric("Avg Compliance Score", f"{avg_compliance_score:.1f}/100", delta=f"{avg_compliance_score - 80:.1f} vs Target (80)")

# --- TABS INTERFACE ---
tab_dashboard, tab_queue, tab_simulator = st.tabs([
    "📊 Analytics & Insights", 
    "📋 Audit Queue & Case Management", 
    "🧪 API Payload Simulator"
])

# ==================== TAB 1: DASHBOARD & ANALYTICS ====================
with tab_dashboard:
    st.subheader("Compliance Analytics Overview")
    
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        # Compliance Status Distribution
        status_counts = df_audited['compliance_status'].value_counts().reset_index()
        status_counts.columns = ['Status', 'Count']
        fig_pie = px.pie(
            status_counts, 
            values='Count', 
            names='Status', 
            title='Offers by Compliance Status',
            color='Status',
            color_discrete_map={
                'Compliant': '#2ecc71',
                'Needs Review': '#f1c40f',
                'Non-Compliant': '#e74c3c'
            },
            hole=0.4
        )
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with col_chart2:
        # Compliance Score Distribution
        fig_hist = px.histogram(
            df_audited, 
            x='compliance_score', 
            nbins=20,
            title='Distribution of Compliance Scores',
            labels={'compliance_score': 'Compliance Score'},
            color_discrete_sequence=['#3498db']
        )
        fig_hist.add_vline(x=80, line_dash="dash", line_color="orange", annotation_text="Warning Threshold (80)")
        fig_hist.add_vline(x=60, line_dash="dash", line_color="red", annotation_text="Critical Threshold (60)")
        st.plotly_chart(fig_hist, use_container_width=True)

    st.subheader("Risk & Policy Alignment Analysis")
    col_chart3, col_chart4 = st.columns(2)
    
    with col_chart3:
        # Scatter Plot: Credit Score vs Requested Amount
        fig_scatter = px.scatter(
            df_audited,
            x='credit_score',
            y='requested_transfer_amount',
            color='compliance_status',
            hover_data=['offer_id', 'offered_apr', 'processing_fee_percent'],
            title='Credit Score vs. Requested Transfer Amount',
            labels={
                'credit_score': 'Credit Score',
                'requested_transfer_amount': 'Requested Amount ($)',
                'compliance_status': 'Compliance Status'
            },
            color_discrete_map={
                'Compliant': '#2ecc71',
                'Needs Review': '#f1c40f',
                'Non-Compliant': '#e74c3c'
            }
        )
        # Add visual policy lines
        fig_scatter.add_shape(type="rect", x0=300, y0=0, x1=580, y1=limit_poor, line=dict(color="red", width=1, dash="dot"))
        fig_scatter.add_shape(type="rect", x0=580, y0=0, x1=670, y1=limit_fair, line=dict(color="orange", width=1, dash="dot"))
        fig_scatter.add_shape(type="rect", x0=670, y0=0, x1=740, y1=limit_good, line=dict(color="blue", width=1, dash="dot"))
        st.plotly_chart(fig_scatter, use_container_width=True)
        
    with col_chart4:
        # Violation Types Breakdown
        all_violations = []
        for v_list in df_audited['violations']:
            for v in v_list:
                if "APR" in v:
                    all_violations.append("APR Cap Exceeded")
                elif "disclosure" in v or "disclosed" in v:
                    all_violations.append("Undisclosed Fee")
                elif "fee" in v or "Fee" in v:
                    all_violations.append("Excessive Fee %")
                elif "limit" in v or "exceeds" in v:
                    all_violations.append("Credit Limit Violation")
                    
        for w_list in df_audited['warnings']:
            for w in w_list:
                if "promo" in w or "window" in w:
                    all_violations.append("Short Promo Window")
                elif "close to" in w:
                    all_violations.append("Near APR Cap")
                elif "within 10%" in w:
                    all_violations.append("Near Credit Limit")

        if all_violations:
            df_violations = pd.DataFrame(all_violations, columns=['Violation Type']).value_counts().reset_index()
            df_violations.columns = ['Violation Type', 'Count']
            fig_bar = px.bar(
                df_violations,
                x='Count',
                y='Violation Type',
                orientation='h',
                title='Frequency of Policy Violations & Warnings',
                color='Violation Type',
                color_discrete_sequence=px.colors.qualitative.Safe
            )
            st.plotly_chart(fig_bar, use_container_width=True)
        else:
            st.info("No violations or warnings detected with current threshold settings!")

# ==================== TAB 2: AUDIT QUEUE & CASE MANAGEMENT ====================
with tab_queue:
    st.subheader("Audited Offers Queue")
    st.markdown("Filter and select offers to perform manual overrides, add audit notes, or export compliance logs.")
    
    # Filters
    f_col1, f_col2, f_col3 = st.columns(3)
    with f_col1:
        status_filter = st.multiselect(
            "Filter by Compliance Status", 
            options=["Compliant", "Needs Review", "Non-Compliant"], 
            default=["Compliant", "Needs Review", "Non-Compliant"]
        )
    with f_col2:
        state_filter = st.multiselect(
            "Filter by State", 
            options=sorted(df_audited['state'].unique()), 
            default=sorted(df_audited['state'].unique())
        )
    with f_col3:
        score_range = st.slider("Filter by Compliance Score", 0, 100, (0, 100))

    # Apply filters
    df_filtered = df_audited[
        (df_audited['compliance_status'].isin(status_filter)) &
        (df_audited['state'].isin(state_filter)) &
        (df_audited['compliance_score'].between(score_range[0], score_range[1]))
    ]

    # Display Queue Table
    st.dataframe(
        df_filtered[[
            "offer_id", "customer_id", "credit_score", "requested_transfer_amount", 
            "offered_apr", "processing_fee_percent", "state", "compliance_status", 
            "compliance_score", "audit_status"
        ]],
        use_container_width=True,
        column_config={
            "compliance_score": st.column_config.ProgressColumn(
                "Compliance Score",
                help="Score from 0 to 100 based on rule deductions",
                format="%d",
                min_value=0,
                max_value=100
            ),
            "compliance_status": st.column_config.TextColumn(
                "Status",
                help="Automated compliance evaluation status"
            )
        }
    )

    # Export Audit Logs
    st.subheader("Export Audit Logs")
    csv_data = df_filtered.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Download Filtered Audit Log (CSV)",
        data=csv_data,
        file_name=f"compliance_audit_log_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        mime="text/csv"
    )

    # Case Detail & Manual Override Section
    st.markdown("---")
    st.subheader("🔍 Detailed Case Auditor & Manual Override")
    
    if not df_filtered.empty:
        selected_offer_id = st.selectbox("Select an Offer ID to inspect and audit:", df_filtered['offer_id'].unique())
        
        # Fetch selected offer details
        selected_offer = next(item for item in st.session_state.offers_data if item["offer_id"] == selected_offer_id)
        # Re-evaluate to get latest violations/warnings based on current sidebar thresholds
        evaluation = evaluate_compliance(selected_offer, thresholds)
        
        col_details, col_actions = st.columns([2, 1])
        
        with col_details:
            st.markdown(f"### Offer Details: **{selected_offer_id}**")
            
            # Display metrics for selected offer
            det_col1, det_col2, det_col3 = st.columns(3)
            with det_col1:
                st.metric("Customer Credit Score", selected_offer['credit_score'])
                st.metric("Requested Amount", f"${selected_offer['requested_transfer_amount']:,}")
            with det_col2:
                st.metric("Offered APR", f"{selected_offer['offered_apr']}%")
                st.metric("Promo APR / Duration", f"{selected_offer['promo_apr']}% / {selected_offer['promo_duration_months']} mo")
            with det_col3:
                st.metric("Processing Fee", f"{selected_offer['processing_fee_percent']}%")
                st.metric("Fee Disclosed", "Yes" if selected_offer['processing_fee_disclosed'] else "No")

            # Compliance Status Box
            if evaluation['status'] == 'Compliant':
                st.success(f"**Automated Status: COMPLIANT** (Score: {evaluation['score']}/100)")
            elif evaluation['status'] == 'Needs Review':
                st.warning(f"**Automated Status: NEEDS REVIEW** (Score: {evaluation['score']}/100)")
            else:
                st.error(f"**Automated Status: NON-COMPLIANT** (Score: {evaluation['score']}/100)")

            # Display Violations & Warnings
            if evaluation['violations']:
                st.markdown("**Violations Detected:**")
                for v in evaluation['violations']:
                    st.markdown(f"🔴 {v}")
            if evaluation['warnings']:
                st.markdown("**Warnings/Observations:**")
                for w in evaluation['warnings']:
                    st.markdown(f"🟡 {w}")
            if not evaluation['violations'] and not evaluation['warnings']:
                st.markdown("🟢 No compliance violations or warnings detected for this offer.")

        with col_actions:
            st.markdown("### Audit Action")
            
            # Find index in session state to update
            idx = next(i for i, item in enumerate(st.session_state.offers_data) if item["offer_id"] == selected_offer_id)
            
            current_audit_status = st.session_state.offers_data[idx].get('audit_status', 'Pending Review')
            current_notes = st.session_state.offers_data[idx].get('audit_notes', '')
            
            audit_status_options = ["Pending Review", "Approved / Compliant", "Rejected / Non-Compliant", "Escalated to Legal"]
            try:
                default_status_idx = audit_status_options.index(current_audit_status)
            except ValueError:
                default_status_idx = 0
                
            new_audit_status = st.selectbox(
                "Set Audit Status", 
                options=audit_status_options,
                index=default_status_idx
            )
            
            new_notes = st.text_area("Audit Notes / Justification", value=current_notes, placeholder="Enter compliance review notes here...")
            
            if st.button("Save Audit Decision"):
                st.session_state.offers_data[idx]['audit_status'] = new_audit_status
                st.session_state.offers_data[idx]['audit_notes'] = new_notes
                st.success(f"Audit decision saved for {selected_offer_id}!")
                st.rerun()
                
            # Show current saved status
            st.info(f"**Saved Audit Status:** {current_audit_status}\n\n**Saved Notes:** {current_notes if current_notes else 'None'}")
    else:
        st.info("No offers match the selected filters.")

# ==================== TAB 3: API PAYLOAD SIMULATOR ====================
with tab_simulator:
    st.subheader("Simulate & Test API Payloads")
    st.markdown("""
    Paste a raw JSON payload representing a balance transfer offer API response to run a real-time compliance audit. 
    You can also generate a random payload to test the rules engine.
    """)

    # Sample JSON Generator
    sample_payload = {
        "offer_id": f"BT-OFFER-{random.randint(2000, 9999)}",
        "customer_id": f"CUST-{random.randint(10000, 99999)}",
        "credit_score": 680,
        "requested_transfer_amount": 18000,
        "offered_apr": 21.5,
        "promo_apr": 0.0,
        "promo_duration_months": 12,
        "processing_fee_percent": 3.5,
        "processing_fee_disclosed": True,
        "state": "NY",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    col_sim_left, col_sim_right = st.columns([1, 1])

    with col_sim_left:
        st.markdown("### Input JSON Payload")
        
        if st.button("Generate Random Sample Payload"):
            # Randomize sample payload
            sample_payload["offer_id"] = f"BT-OFFER-{random.randint(2000, 9999)}"
            sample_payload["customer_id"] = f"CUST-{random.randint(10000, 99999)}"
            sample_payload["credit_score"] = random.randint(500, 850)
            sample_payload["requested_transfer_amount"] = random.randint(1000, 45000)
            sample_payload["offered_apr"] = round(random.uniform(10.0, 35.0), 2)
            sample_payload["promo_apr"] = round(random.choice([0.0, 1.99, 4.99]), 2)
            sample_payload["promo_duration_months"] = random.choice([0, 6, 12, 18])
            sample_payload["processing_fee_percent"] = round(random.uniform(0.0, 8.0), 2)
            sample_payload["processing_fee_disclosed"] = random.choice([True, False])
            sample_payload["state"] = random.choice(["NY", "CA", "TX", "FL", "IL", "PA"])
            
        payload_text = st.text_area(
            "JSON Payload Editor", 
            value=json.dumps(sample_payload, indent=4), 
            height=350
        )

    with col_sim_right:
        st.markdown("### Real-Time Compliance Audit Results")
        
        try:
            parsed_payload = json.loads(payload_text)
            
            # Validate required fields
            required_fields = [
                "offer_id", "customer_id", "credit_score", "requested_transfer_amount", 
                "offered_apr", "promo_apr", "promo_duration_months", 
                "processing_fee_percent", "processing_fee_disclosed", "state"
            ]
            missing_fields = [field for field in required_fields if field not in parsed_payload]
            
            if missing_fields:
                st.error(f"Invalid Payload: Missing required fields: {', '.join(missing_fields)}")
            else:
                # Run evaluation
                sim_eval = evaluate_compliance(parsed_payload, thresholds)
                
                # Display Results
                if sim_eval['status'] == 'Compliant':
                    st.success(f"### ✅ COMPLIANT (Score: {sim_eval['score']}/100)")
                elif sim_eval['status'] == 'Needs Review':
                    st.warning(f"### ⚠️ NEEDS REVIEW (Score: {sim_eval['score']}/100)")
                else:
                    st.error(f"### ❌ NON-COMPLIANT (Score: {sim_eval['score']}/100)")
                
                # Violations & Warnings
                if sim_eval['violations']:
                    st.markdown("#### Violations:")
                    for v in sim_eval['violations']:
                        st.markdown(f"🔴 {v}")
                if sim_eval['warnings']:
                    st.markdown("#### Warnings:")
                    for w in sim_eval['warnings']:
                        st.markdown(f"🟡 {w}")
                if not sim_eval['violations'] and not sim_eval['warnings']:
                    st.markdown("🟢 This payload fully complies with all configured regulatory and risk thresholds.")
                
                # Add to Queue Button
                st.markdown("---")
                st.markdown("Add this simulated offer to the active audit queue for tracking.")
                if st.button("📥 Append to Audit Queue"):
                    # Check if offer_id already exists
                    exists = any(item['offer_id'] == parsed_payload['offer_id'] for item in st.session_state.offers_data)
                    if exists:
                        # Generate a new unique ID
                        parsed_payload['offer_id'] = f"BT-OFFER-{random.randint(10000, 99999)}"
                    
                    # Add default audit fields
                    parsed_payload['audit_status'] = "Pending Review"
                    parsed_payload['audit_notes'] = "Added via API Payload Simulator."
                    parsed_payload['timestamp'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    
                    st.session_state.offers_data.insert(0, parsed_payload)
                    st.success(f"Successfully added {parsed_payload['offer_id']} to the audit queue!")
                    st.rerun()
                    
        except json.JSONDecodeError:
            st.error("Invalid JSON format. Please check the syntax of your payload.")

# --- FOOTER ---
st.markdown("---")
st.markdown(
    "⚖️ **Balance Transfer Compliance Auditor** • Built for Risk & Compliance Operations • Regulatory Standards: TILA, CARD Act, State Usury Laws."
)