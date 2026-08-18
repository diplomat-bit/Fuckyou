import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from io import StringIO

# Set page configuration
st.set_page_config(
    page_title="Credit Limit Utilization & Risk Monitor",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .metric-card {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        border-left: 5px solid #007bff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .metric-card-warning {
        background-color: #fff3cd;
        border-radius: 8px;
        padding: 15px;
        border-left: 5px solid #ffc107;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .metric-card-danger {
        background-color: #f8d7da;
        border-radius: 8px;
        padding: 15px;
        border-left: 5px solid #dc3545;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .metric-card-success {
        background-color: #d1e7dd;
        border-radius: 8px;
        padding: 15px;
        border-left: 5px solid #198754;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
</style>
""", unsafe_allow_html=True)

# Helper function to generate mock data
def generate_mock_data():
    np.random.seed(42)
    names = [
        "Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince", "Evan Wright",
        "Fiona Gallagher", "George Clark", "Hannah Abbott", "Ian Malcolm", "Julia Roberts",
        "Kevin Bacon", "Laura Croft", "Michael Scott", "Nina Simone", "Oscar Wilde"
    ]
    
    card_types = ["Visa Signature", "Mastercard World Elite", "Amex Platinum", "Visa Platinum", "Everyday Cashback"]
    
    data = []
    for i, name in enumerate(names):
        acct_id = f"XXXX-XXXX-XXXX-{1000 + i}"
        card = np.random.choice(card_types)
        limit = float(np.random.choice([2000, 5000, 7500, 10000, 15000, 20000, 25000]))
        # Generate balances with varying utilization rates
        util_rate = np.random.beta(a=2, b=2) # Centered around 50%
        if i in [2, 5, 12]: # Force a few high utilization/over-limit accounts
            util_rate = np.random.uniform(0.75, 1.05)
        elif i in [0, 8, 14]: # Force a few low utilization accounts
            util_rate = np.random.uniform(0.02, 0.15)
            
        balance = round(limit * util_rate, 2)
        min_payment = round(max(25.0, balance * 0.02), 2) if balance > 0 else 0.0
        
        data.append({
            "Account ID": acct_id,
            "Cardholder Name": name,
            "Card Type": card,
            "Credit Limit ($)": limit,
            "Current Balance ($)": balance,
            "Minimum Payment Due ($)": min_payment
        })
        
    return pd.DataFrame(data)

# Initialize session state for data
if 'df' not in st.session_state:
    st.session_state.df = generate_mock_data()

# Sidebar controls
st.sidebar.title("Navigation & Controls")

# File uploader
st.sidebar.subheader("1. Data Source")
uploaded_file = st.sidebar.file_uploader("Upload Credit Accounts CSV", type=["csv"])

if uploaded_file is not None:
    try:
        uploaded_df = pd.read_csv(uploaded_file)
        required_cols = ["Account ID", "Cardholder Name", "Card Type", "Credit Limit ($)", "Current Balance ($)", "Minimum Payment Due ($)"]
        if all(col in uploaded_df.columns for col in required_cols):
            st.session_state.df = uploaded_df
            st.sidebar.success("CSV loaded successfully!")
        else:
            st.sidebar.error(f"CSV must contain columns: {', '.join(required_cols)}")
    except Exception as e:
        st.sidebar.error(f"Error reading file: {e}")

# Reset to mock data button
if st.sidebar.button("Reset to Default Mock Data"):
    st.session_state.df = generate_mock_data()
    st.sidebar.info("Reset to default mock data.")

# Threshold configuration
st.sidebar.subheader("2. Risk Thresholds")
danger_threshold = st.sidebar.slider(
    "High Risk Threshold (Utilization %)", 
    min_value=50, 
    max_value=100, 
    value=70, 
    step=5,
    help="Accounts with utilization above this percentage will be flagged as High Risk."
)
warning_threshold = st.sidebar.slider(
    "Warning Threshold (Utilization %)", 
    min_value=30, 
    max_value=danger_threshold - 5, 
    value=50, 
    step=5,
    help="Accounts with utilization between this and the High Risk threshold will be flagged as Warning."
)

# Download template CSV
st.sidebar.subheader("3. Export Template")
template_df = pd.DataFrame(columns=["Account ID", "Cardholder Name", "Card Type", "Credit Limit ($)", "Current Balance ($)", "Minimum Payment Due ($)"])
template_csv = template_df.to_csv(index=False)
st.sidebar.download_button(
    label="Download CSV Template",
    data=template_csv,
    file_name="credit_accounts_template.csv",
    mime="text/csv"
)

# Main Dashboard Title
st.title("💳 Credit Limit Utilization & Risk Monitor")
st.markdown("Monitor credit card account utilization, identify high-risk accounts, and simulate the impact of payments or limit increases.")

# Calculate metrics on current dataframe
df = st.session_state.df.copy()
df["Utilization (%)"] = round((df["Current Balance ($)"] / df["Credit Limit ($)"]) * 100, 2)
df["Available Credit ($)"] = df["Credit Limit ($)"] - df["Current Balance ($)"]

# Assign Risk Status
def assign_risk(util):
    if util >= danger_threshold:
        return "High Risk"
    elif util >= warning_threshold:
        return "Warning"
    else:
        return "Safe"

df["Risk Status"] = df["Utilization (%)"].apply(assign_risk)

# KPI Summary Cards
total_limit = df["Credit Limit ($)"].sum()
total_balance = df["Current Balance ($)"].sum()
overall_utilization = (total_balance / total_limit) * 100 if total_limit > 0 else 0
high_risk_count = df[df["Risk Status"] == "High Risk"].shape[0]
warning_count = df[df["Risk Status"] == "Warning"].shape[0]

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown(f"""
    <div class="metric-card">
        <p style="margin:0; font-size:14px; color:#6c757d; font-weight:bold;">TOTAL CREDIT LIMIT</p>
        <h2 style="margin:5px 0 0 0; color:#0d6efd;">${total_limit:,.2f}</h2>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown(f"""
    <div class="metric-card">
        <p style="margin:0; font-size:14px; color:#6c757d; font-weight:bold;">TOTAL OUTSTANDING BALANCE</p>
        <h2 style="margin:5px 0 0 0; color:#212529;">${total_balance:,.2f}</h2>
    </div>
    """, unsafe_allow_html=True)

with col3:
    util_class = "metric-card-success" if overall_utilization < warning_threshold else ("metric-card-warning" if overall_utilization < danger_threshold else "metric-card-danger")
    st.markdown(f"""
    <div class="{util_class}">
        <p style="margin:0; font-size:14px; color:#6c757d; font-weight:bold;">OVERALL UTILIZATION</p>
        <h2 style="margin:5px 0 0 0;">{overall_utilization:.2f}%</h2>
    </div>
    """, unsafe_allow_html=True)

with col4:
    risk_class = "metric-card-danger" if high_risk_count > 0 else "metric-card-success"
    st.markdown(f"""
    <div class="{risk_class}">
        <p style="margin:0; font-size:14px; color:#6c757d; font-weight:bold;">HIGH RISK ACCOUNTS</p>
        <h2 style="margin:5px 0 0 0;">{high_risk_count} <span style="font-size:14px; color:#6c757d;">/ {df.shape[0]} total</span></h2>
    </div>
    """, unsafe_allow_html=True)

st.write("---")

# Main Tabs
tab1, tab2, tab3 = st.tabs(["📊 Portfolio Overview", "🔄 Simulation Sandbox", "📋 Account Details & Export"])

with tab1:
    st.subheader("Portfolio Risk Analysis")
    
    # Visualizations Row 1
    v_col1, v_col2 = st.columns([2, 1])
    
    with v_col1:
        # Utilization Bar Chart
        fig_bar = px.bar(
            df.sort_values(by="Utilization (%)", ascending=False),
            x="Cardholder Name",
            y="Utilization (%)",
            color="Risk Status",
            color_discrete_map={"High Risk": "#dc3545", "Warning": "#ffc107", "Safe": "#198754"},
            title="Utilization Rate by Cardholder",
            text="Utilization (%)",
            hover_data=["Credit Limit ($)", "Current Balance ($)"]
        )
        fig_bar.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
        fig_bar.add_hline(y=danger_threshold, line_dash="dash", line_color="#dc3545", annotation_text=f"High Risk Threshold ({danger_threshold}%)")
        fig_bar.add_hline(y=warning_threshold, line_dash="dash", line_color="#ffc107", annotation_text=f"Warning Threshold ({warning_threshold}%)")
        fig_bar.update_layout(yaxis_range=[0, max(df["Utilization (%)"].max() + 15, 110)])
        st.plotly_chart(fig_bar, use_container_width=True)
        
    with v_col2:
        # Risk Status Pie Chart
        fig_pie = px.pie(
            df, 
            names="Risk Status", 
            title="Portfolio Risk Distribution",
            color="Risk Status",
            color_discrete_map={"High Risk": "#dc3545", "Warning": "#ffc107", "Safe": "#198754"},
            hole=0.4
        )
        st.plotly_chart(fig_pie, use_container_width=True)

    # Visualizations Row 2
    v_col3, v_col4 = st.columns(2)
    
    with v_col3:
        # Balance vs Limit Scatter Plot
        fig_scatter = px.scatter(
            df,
            x="Credit Limit ($)",
            y="Current Balance ($)",
            color="Risk Status",
            color_discrete_map={"High Risk": "#dc3545", "Warning": "#ffc107", "Safe": "#198754"},
            size="Utilization (%)",
            hover_name="Cardholder Name",
            title="Balance vs. Credit Limit (Size = Utilization %)",
            trendline="ols",
            trendline_scope="overall"
        )
        # Add 100% utilization line
        max_val = max(df["Credit Limit ($)"].max(), df["Current Balance ($)"].max())
        fig_scatter.add_trace(go.Scatter(
            x=[0, max_val],
            y=[0, max_val],
            mode='lines',
            name='100% Utilization Line',
            line=dict(color='red', dash='dot')
        ))
        st.plotly_chart(fig_scatter, use_container_width=True)
        
    with v_col4:
        # Card Type Breakdown
        card_summary = df.groupby("Card Type").agg(
            Total_Balance=("Current Balance ($)", "sum"),
            Avg_Utilization=("Utilization (%)", "mean"),
            Count=("Account ID", "count")
        ).reset_index()
        
        fig_card = px.bar(
            card_summary,
            x="Card Type",
            y="Total_Balance",
            color="Avg_Utilization",
            color_continuous_scale="RdYlGn_r",
            title="Total Balance & Average Utilization by Card Type",
            labels={"Total_Balance": "Total Balance ($)", "Avg_Utilization": "Avg Utilization (%)"},
            text="Count"
        )
        fig_card.update_traces(texttemplate='Count: %{text}', textposition='outside')
        st.plotly_chart(fig_card, use_container_width=True)

with tab2:
    st.subheader("What-If Simulation Sandbox")
    st.markdown("Simulate the impact of making payments or requesting credit limit increases on individual accounts or the entire portfolio.")
    
    sim_mode = st.radio("Simulation Mode", ["Single Account Simulation", "Global Portfolio Simulation"])
    
    if sim_mode == "Single Account Simulation":
        selected_acct = st.selectbox("Select Account to Simulate", df["Cardholder Name"].tolist())
        acct_data = df[df["Cardholder Name"] == selected_acct].iloc[0]
        
        col_sim1, col_sim2 = st.columns(2)
        
        with col_sim1:
            st.markdown("### Current Status")
            st.write(f"**Account ID:** {acct_data['Account ID']}")
            st.write(f"**Card Type:** {acct_data['Card Type']}")
            st.write(f"**Current Credit Limit:** ${acct_data['Credit Limit ($)']:,.2f}")
            st.write(f"**Current Balance:** ${acct_data['Current Balance ($)']:,.2f}")
            st.write(f"**Current Utilization:** {acct_data['Utilization (%)']:.2f}%")
            
            # Current Status Badge
            if acct_data['Risk Status'] == "High Risk":
                st.error(f"Risk Status: {acct_data['Risk Status']}")
            elif acct_data['Risk Status'] == "Warning":
                st.warning(f"Risk Status: {acct_data['Risk Status']}")
            else:
                st.success(f"Risk Status: {acct_data['Risk Status']}")
                
        with col_sim2:
            st.markdown("### Simulation Controls")
            payment_input = st.number_input(
                "Simulate Payment ($)", 
                min_value=0.0, 
                max_value=float(acct_data['Current Balance ($)']), 
                value=0.0, 
                step=100.0,
                help="Enter an amount to pay down the current balance."
            )
            
            limit_increase_type = st.selectbox("Credit Limit Increase Type", ["Flat Amount ($)", "Percentage Increase (%)"])
            if limit_increase_type == "Flat Amount ($)":
                limit_increase = st.number_input("Simulate Limit Increase ($)", min_value=0.0, value=0.0, step=500.0)
                new_limit = acct_data['Credit Limit ($)'] + limit_increase
            else:
                pct_increase = st.slider("Simulate Limit Increase (%)", min_value=0, max_value=100, value=0, step=5)
                new_limit = acct_data['Credit Limit ($)'] * (1 + pct_increase / 100.0)
                
            new_balance = acct_data['Current Balance ($)'] - payment_input
            new_util = (new_balance / new_limit) * 100 if new_limit > 0 else 0
            new_risk = assign_risk(new_util)
            
            st.markdown("### Simulated Status")
            st.write(f"**New Credit Limit:** ${new_limit:,.2f}")
            st.write(f"**New Balance:** ${new_balance:,.2f}")
            st.write(f"**New Utilization:** {new_util:.2f}%")
            
            # Simulated Status Badge
            if new_risk == "High Risk":
                st.error(f"Simulated Risk Status: {new_risk}")
            elif new_risk == "Warning":
                st.warning(f"Simulated Risk Status: {new_risk}")
            else:
                st.success(f"Simulated Risk Status: {new_risk}")
                
        # Visual Comparison
        st.markdown("### Visual Comparison")
        comp_df = pd.DataFrame({
            "Metric": ["Credit Limit ($)", "Current Balance ($)", "Utilization (%)"],
            "Current": [acct_data['Credit Limit ($)'], acct_data['Current Balance ($)'], acct_data['Utilization (%)']],
            "Simulated": [new_limit, new_balance, new_util]
        })
        
        fig_comp = go.Figure()
        fig_comp.add_trace(go.Bar(
            x=comp_df["Metric"][:2],
            y=comp_df["Current"][:2],
            name='Current',
            marker_color='#6c757d'
        ))
        fig_comp.add_trace(go.Bar(
            x=comp_df["Metric"][:2],
            y=comp_df["Simulated"][:2],
            name='Simulated',
            marker_color='#0d6efd'
        ))
        fig_comp.update_layout(barmode='group', title="Limit & Balance Comparison ($)")
        
        fig_comp_util = go.Figure()
        fig_comp_util.add_trace(go.Bar(
            x=["Utilization (%)"],
            y=[acct_data['Utilization (%)']],
            name='Current',
            marker_color='#ffc107' if acct_data['Risk Status'] == "Warning" else ('#dc3545' if acct_data['Risk Status'] == "High Risk" else '#198754')
        ))
        fig_comp_util.add_trace(go.Bar(
            x=["Utilization (%)"],
            y=[new_util],
            name='Simulated',
            marker_color='#ffc107' if new_risk == "Warning" else ('#dc3545' if new_risk == "High Risk" else '#198754')
        ))
        fig_comp_util.update_layout(barmode='group', title="Utilization Comparison (%)", yaxis_range=[0, max(100, acct_data['Utilization (%)'], new_util) + 10])
        
        c_col1, c_col2 = st.columns(2)
        with c_col1:
            st.plotly_chart(fig_comp, use_container_width=True)
        with c_col2:
            st.plotly_chart(fig_comp_util, use_container_width=True)

    elif sim_mode == "Global Portfolio Simulation":
        st.markdown("### Apply Global Changes")
        st.write("Simulate a uniform action across all accounts in the portfolio (e.g., a general credit limit increase or a standard payment).")
        
        g_col1, g_col2 = st.columns(2)
        with g_col1:
            global_payment_pct = st.slider("Simulate Global Payment (% of Balance Paid)", min_value=0, max_value=100, value=0, step=5)
        with g_col2:
            global_limit_inc_pct = st.slider("Simulate Global Credit Limit Increase (%)", min_value=0, max_value=100, value=0, step=5)
            
        # Calculate simulated portfolio
        sim_df = df.copy()
        sim_df["Simulated Limit ($)"] = sim_df["Credit Limit ($)"] * (1 + global_limit_inc_pct / 100.0)
        sim_df["Simulated Balance ($)"] = sim_df["Current Balance ($)"] * (1 - global_payment_pct / 100.0)
        sim_df["Simulated Utilization (%)"] = round((sim_df["Simulated Balance ($)"] / sim_df["Simulated Limit ($)"]) * 100, 2)
        sim_df["Simulated Risk Status"] = sim_df["Simulated Utilization (%)"].apply(assign_risk)
        
        # Global Comparison Metrics
        sim_total_limit = sim_df["Simulated Limit ($)"].sum()
        sim_total_balance = sim_df["Simulated Balance ($)"].sum()
        sim_overall_util = (sim_total_balance / sim_total_limit) * 100 if sim_total_limit > 0 else 0
        sim_high_risk = sim_df[sim_df["Simulated Risk Status"] == "High Risk"].shape[0]
        
        st.markdown("### Simulated Portfolio Impact")
        sc1, sc2, sc3, sc4 = st.columns(4)
        
        with sc1:
            st.metric("Simulated Total Limit", f"${sim_total_limit:,.2f}", delta=f"${sim_total_limit - total_limit:,.2f}")
        with sc2:
            st.metric("Simulated Total Balance", f"${sim_total_balance:,.2f}", delta=f"${sim_total_balance - total_balance:,.2f}")
        with sc3:
            st.metric("Simulated Overall Utilization", f"{sim_overall_util:.2f}%", delta=f"{sim_overall_util - overall_utilization:.2f}%", delta_color="inverse")
        with sc4:
            st.metric("Simulated High Risk Accounts", f"{sim_high_risk}", delta=f"{sim_high_risk - high_risk_count}", delta_color="inverse")
            
        # Comparison Chart
        fig_global_comp = go.Figure()
        fig_global_comp.add_trace(go.Bar(
            x=sim_df["Cardholder Name"],
            y=sim_df["Utilization (%)"],
            name="Current Utilization",
            marker_color="#6c757d"
        ))
        fig_global_comp.add_trace(go.Bar(
            x=sim_df["Cardholder Name"],
            y=sim_df["Simulated Utilization (%)"],
            name="Simulated Utilization",
            marker_color="#0d6efd"
        ))
        fig_global_comp.update_layout(barmode='group', title="Current vs. Simulated Utilization by Account")
        st.plotly_chart(fig_global_comp, use_container_width=True)

with tab3:
    st.subheader("Account Details & Export")
    
    # Filter controls
    f_col1, f_col2, f_col3 = st.columns(3)
    with f_col1:
        risk_filter = st.multiselect("Filter by Risk Status", options=["High Risk", "Warning", "Safe"], default=["High Risk", "Warning", "Safe"])
    with f_col2:
        card_filter = st.multiselect("Filter by Card Type", options=df["Card Type"].unique().tolist(), default=df["Card Type"].unique().tolist())
    with f_col3:
        search_query = st.text_input("Search Cardholder Name", "")
        
    # Apply filters
    filtered_df = df[
        (df["Risk Status"].isin(risk_filter)) & 
        (df["Card Type"].isin(card_filter)) & 
        (df["Cardholder Name"].str.contains(search_query, case=False))
    ]
    
    # Display interactive table with styling
    st.dataframe(
        filtered_df.style.format({
            "Credit Limit ($)": "${:,.2f}",
            "Current Balance ($)": "${:,.2f}",
            "Available Credit ($)": "${:,.2f}",
            "Minimum Payment Due ($)": "${:,.2f}",
            "Utilization (%)": "{:.2f}%"
        }).background_gradient(
            subset=["Utilization (%)"],
            cmap="YlOrRd",
            vmin=0,
            vmax=100
        ),
        use_container_width=True,
        hide_index=True
    )
    
    # Export options
    st.subheader("Export Data")
    export_format = st.radio("Export Format", ["CSV", "JSON"], horizontal=True)
    
    if export_format == "CSV":
        csv_data = filtered_df.to_csv(index=False)
        st.download_button(
            label="📥 Download Filtered Accounts (CSV)",
            data=csv_data,
            file_name="filtered_credit_accounts.csv",
            mime="text/csv"
        )
    else:
        json_data = filtered_df.to_json(orient="records", indent=4)
        st.download_button(
            label="📥 Download Filtered Accounts (JSON)",
            data=json_data,
            file_name="filtered_credit_accounts.json",
            mime="application/json"
        )

# Footer / Documentation
st.write("---")
st.markdown("""
### 💡 Quick Guide & Best Practices
* **Credit Utilization Ratio:** It is generally recommended to keep your credit utilization below **30%** to maintain a healthy credit score. Utilization above **70%** is considered high risk and can negatively impact credit ratings.
* **Simulations:** Use the **Simulation Sandbox** to plan payments or request credit limit increases to see how they immediately affect your utilization metrics before executing them in real life.
* **Custom Data:** You can upload your own credit card portfolio using the CSV template provided in the sidebar.
""")