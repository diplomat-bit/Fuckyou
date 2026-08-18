import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from io import BytesIO

# Set page configuration
st.set_page_config(
    page_title="Credit Risk Analyzer",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .metric-card {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #007bff;
        margin-bottom: 15px;
    }
    .metric-card-high-risk {
        border-left: 5px solid #dc3545;
    }
    .metric-card-warning {
        border-left: 5px solid #ffc107;
    }
    .metric-card-success {
        border-left: 5px solid #28a745;
    }
    .metric-title {
        font-size: 14px;
        color: #6c757d;
        font-weight: bold;
        text-transform: uppercase;
    }
    .metric-value {
        font-size: 24px;
        font-weight: bold;
        color: #343a40;
        margin-top: 5px;
    }
    .flag-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        display: inline-block;
    }
    .flag-high {
        background-color: #f8d7da;
        color: #721c24;
    }
    .flag-normal {
        background-color: #d4edda;
        color: #155724;
    }
    </style>
""", unsafe_allow_html=True)

@st.cache_data
def generate_mock_data():
    """Generates realistic credit account data for demonstration purposes."""
    np.random.seed(42)
    n = 200
    
    account_ids = [f"ACC-{1000+i}" for i in range(n)]
    
    first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", 
                   "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", 
                   "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", 
                  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", 
                  "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    
    names = [f"{np.random.choice(first_names)} {np.random.choice(last_names)}" for _ in range(n)]
    
    credit_limits = np.random.choice(
        [1500, 3000, 5000, 10000, 15000, 20000, 30000, 50000], 
        size=n, 
        p=[0.1, 0.15, 0.2, 0.2, 0.15, 0.1, 0.07, 0.03]
    )
    
    # Generate utilization targets using beta distribution (skewed towards lower utilization)
    utilization_target = np.random.beta(a=2, b=5, size=n)
    # Force some accounts to have very high utilization (>80%)
    high_util_indices = np.random.choice(n, int(n * 0.15), replace=False)
    utilization_target[high_util_indices] = np.random.uniform(0.81, 0.99, len(high_util_indices))
    
    current_balances = np.round(credit_limits * utilization_target, 2)
    
    # Cash advance limits (typically 20% of credit limit)
    cash_advance_limits = np.round(credit_limits * 0.20, 2)
    # Cash advance balances (mostly zero or very low, some high)
    cash_advance_balances = np.zeros(n)
    cash_adv_users = np.random.choice(n, int(n * 0.25), replace=False)
    cash_advance_balances[cash_adv_users] = np.round(
        cash_advance_limits[cash_adv_users] * np.random.beta(a=1, b=3, size=len(cash_adv_users)), 2
    )
    
    # Minimum payments (typically 3% of balance or $25, whichever is greater)
    min_payments = np.round(current_balances * 0.03, 2)
    min_payments = np.where(min_payments < 25, np.minimum(current_balances, 25.0), min_payments)
    
    # Payment behaviors
    payment_behavior = np.random.choice(
        ["full", "above_min", "min", "missed"], 
        size=n, 
        p=[0.35, 0.35, 0.20, 0.10]
    )
    
    last_payments = []
    overdue_days = []
    
    for i in range(n):
        bal = current_balances[i]
        mp = min_payments[i]
        beh = payment_behavior[i]
        
        if bal == 0:
            last_payments.append(0.0)
            overdue_days.append(0)
        elif beh == "full":
            last_payments.append(bal)
            overdue_days.append(0)
        elif beh == "above_min":
            last_payments.append(np.round(np.random.uniform(mp, bal * 0.6), 2))
            overdue_days.append(0)
        elif beh == "min":
            last_payments.append(mp)
            overdue_days.append(0)
        else:  # missed
            last_payments.append(0.0)
            overdue_days.append(np.random.choice([15, 30, 45, 60, 90, 120], p=[0.4, 0.3, 0.15, 0.08, 0.05, 0.02]))
            
    df = pd.DataFrame({
        "Account ID": account_ids,
        "Customer Name": names,
        "Credit Limit ($)": credit_limits,
        "Current Balance ($)": current_balances,
        "Cash Advance Limit ($)": cash_advance_limits,
        "Cash Advance Balance ($)": cash_advance_balances,
        "Last Payment Amount ($)": last_payments,
        "Minimum Payment Due ($)": min_payments,
        "Overdue Days": overdue_days
    })
    
    return df

def calculate_metrics(df):
    """Calculates key credit risk metrics and flags."""
    # 1. Credit Utilization Ratio (%)
    df["Credit Utilization (%)"] = np.round((df["Current Balance ($)"] / df["Credit Limit ($)"]) * 100, 2)
    
    # 2. Cash Advance Utilization (%)
    df["Cash Advance Utilization (%)"] = np.round(
        np.where(df["Cash Advance Limit ($)"] > 0, 
                 (df["Cash Advance Balance ($)"] / df["Cash Advance Limit ($)"]) * 100, 
                 0.0), 2
    )
    
    # 3. Payment-to-Debt Ratio (%)
    df["Payment-to-Debt Ratio (%)"] = np.round(
        np.where(df["Current Balance ($)"] > 0,
                 (df["Last Payment Amount ($)"] / df["Current Balance ($)"]) * 100,
                 100.0), 2
    )
    
    # Flags
    df["High Utilization Flag"] = df["Credit Utilization (%)"] > 80
    df["Overdue Flag"] = df["Overdue Days"] > 0
    
    # Risk Score Calculation (0 to 100)
    # Weighted formula: Utilization (40%), Overdue Severity (40%), Cash Advance Utilization (20%)
    util_score = df["Credit Utilization (%)"]
    
    # Overdue score: 0 days = 0, up to 90+ days = 100
    overdue_score = np.minimum((df["Overdue Days"] / 90) * 100, 100)
    
    cash_score = df["Cash Advance Utilization (%)"]
    
    df["Risk Score"] = np.round((util_score * 0.4) + (overdue_score * 0.4) + (cash_score * 0.2), 1)
    
    # Risk Category
    def get_risk_category(score):
        if score < 30:
            return "Low"
        elif score < 65:
            return "Medium"
        else:
            return "High"
            
    df["Risk Category"] = df["Risk Score"].apply(get_risk_category)
    
    return df

# Title and Sidebar
st.title("📊 Credit Risk Analyzer & Portfolio Dashboard")
st.markdown("An interactive platform for credit analysts to monitor portfolio health, evaluate account-level risk, and identify high-risk exposures.")

st.sidebar.header("Data Source Configuration")
data_option = st.sidebar.radio("Select Data Input Method:", ("Use Demo Portfolio Data", "Upload Custom Portfolio CSV"))

# Load Data
if data_option == "Use Demo Portfolio Data":
    raw_df = generate_mock_data()
    st.sidebar.success("Loaded demo portfolio with 200 active accounts.")
else:
    uploaded_file = st.sidebar.file_uploader("Upload your portfolio CSV file", type=["csv"])
    if uploaded_file is not None:
        try:
            raw_df = pd.read_csv(uploaded_file)
            required_cols = ["Account ID", "Customer Name", "Credit Limit ($)", "Current Balance ($)", 
                             "Cash Advance Limit ($)", "Cash Advance Balance ($)", "Last Payment Amount ($)", 
                             "Minimum Payment Due ($)", "Overdue Days"]
            if not all(col in raw_df.columns for col in required_cols):
                st.sidebar.error(f"CSV must contain these columns: {', '.join(required_cols)}")
                st.stop()
        except Exception as e:
            st.sidebar.error(f"Error reading file: {e}")
            st.stop()
    else:
        st.sidebar.info("Please upload a CSV file. Using demo data in the meantime.")
        raw_df = generate_mock_data()

# Process metrics
df = calculate_metrics(raw_df.copy())

# Sidebar Filters
st.sidebar.header("Portfolio Filters")

# Risk Category Filter
risk_categories = ["All", "High", "Medium", "Low"]
selected_risk = st.sidebar.selectbox("Filter by Risk Category:", risk_categories)

# Utilization Filter
util_filter = st.sidebar.slider("Credit Utilization Range (%)", 0, 100, (0, 100))

# Overdue Filter
overdue_filter = st.sidebar.selectbox("Overdue Status:", ["All Accounts", "Overdue Only", "On-Time Only"])

# Apply Filters to DataFrame
filtered_df = df.copy()
if selected_risk != "All":
    filtered_df = filtered_df[filtered_df["Risk Category"] == selected_risk]

filtered_df = filtered_df[
    (filtered_df["Credit Utilization (%)"] >= util_filter[0]) & 
    (filtered_df["Credit Utilization (%)"] <= util_filter[1])
]

if overdue_filter == "Overdue Only":
    filtered_df = filtered_df[filtered_df["Overdue Flag"] == True]
elif overdue_filter == "On-Time Only":
    filtered_df = filtered_df[filtered_df["Overdue Flag"] == False]

# Tabs for Dashboard Navigation
tab1, tab2, tab3 = st.tabs(["📈 Portfolio Overview", "🔍 Account Deep-Dive", "⚠️ Risk Mitigation & Actions"])

# ==================== TAB 1: PORTFOLIO OVERVIEW ====================
with tab1:
    st.subheader("Portfolio Performance & Risk Distribution")
    
    # KPI Metrics Row
    col1, col2, col3, col4 = st.columns(4)
    
    total_portfolio_val = filtered_df["Current Balance ($)"].sum()
    avg_utilization = filtered_df["Credit Utilization (%)"].mean()
    high_risk_count = len(filtered_df[filtered_df["Risk Category"] == "High"])
    total_overdue_val = filtered_df[filtered_df["Overdue Flag"] == True]["Current Balance ($)"].sum()
    
    with col1:
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-title">Total Outstanding Balance</div>
                <div class="metric-value">${total_portfolio_val:,.2f}</div>
            </div>
        """, unsafe_allow_html=True)
        
    with col2:
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-title">Average Credit Utilization</div>
                <div class="metric-value">{avg_utilization:.2f}%</div>
            </div>
        """, unsafe_allow_html=True)
        
    with col3:
        card_class = "metric-card-high-risk" if high_risk_count > 0 else "metric-card-success"
        st.markdown(f"""
            <div class="metric-card {card_class}">
                <div class="metric-title">High Risk Accounts</div>
                <div class="metric-value">{high_risk_count} <span style="font-size:14px; font-weight:normal;">({(high_risk_count/len(filtered_df)*100 if len(filtered_df)>0 else 0):.1f}%)</span></div>
            </div>
        """, unsafe_allow_html=True)
        
    with col4:
        card_class = "metric-card-warning" if total_overdue_val > 0 else "metric-card-success"
        st.markdown(f"""
            <div class="metric-card {card_class}">
                <div class="metric-title">Total Overdue Balance</div>
                <div class="metric-value">${total_overdue_val:,.2f}</div>
            </div>
        """, unsafe_allow_html=True)

    # Visualizations Row 1
    st.markdown("---")
    v_col1, v_col2 = st.columns(2)
    
    with v_col1:
        # Risk Category Pie Chart
        risk_counts = filtered_df["Risk Category"].value_counts().reset_index()
        risk_counts.columns = ["Risk Category", "Count"]
        fig_pie = px.pie(
            risk_counts, 
            values="Count", 
            names="Risk Category", 
            title="Portfolio Risk Category Distribution",
            color="Risk Category",
            color_discrete_map={"Low": "#28a745", "Medium": "#ffc107", "High": "#dc3545"},
            hole=0.4
        )
        fig_pie.update_layout(margin=dict(t=40, b=0, l=0, r=0))
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with v_col2:
        # Credit Limit vs Current Balance Scatter Plot
        fig_scatter = px.scatter(
            filtered_df, 
            x="Credit Limit ($)", 
            y="Current Balance ($)",
            color="Risk Category",
            size="Risk Score",
            hover_data=["Account ID", "Customer Name", "Credit Utilization (%)"],
            color_discrete_map={"Low": "#28a745", "Medium": "#ffc107", "High": "#dc3545"},
            title="Credit Limit vs. Current Balance (Size = Risk Score)"
        )
        fig_scatter.add_shape(
            type="line", line=dict(dash="dash", color="red", width=1.5),
            x0=0, y0=0, x1=filtered_df["Credit Limit ($)"].max(), y1=filtered_df["Credit Limit ($)"].max() * 0.8,
            name="80% Utilization Threshold"
        )
        fig_scatter.update_layout(margin=dict(t=40, b=0, l=0, r=0))
        st.plotly_chart(fig_scatter, use_container_width=True)

    # Visualizations Row 2
    st.markdown("---")
    v_col3, v_col4 = st.columns(2)
    
    with v_col3:
        # Credit Utilization Distribution Histogram
        fig_hist = px.histogram(
            filtered_df, 
            x="Credit Utilization (%)", 
            nbins=20,
            title="Distribution of Credit Utilization Ratio",
            color_discrete_sequence=["#17a2b8"]
        )
        fig_hist.add_vline(x=80, line_dash="dash", line_color="red", annotation_text="High Risk (>80%)")
        fig_hist.update_layout(yaxis_title="Account Count", margin=dict(t=40, b=0, l=0, r=0))
        st.plotly_chart(fig_hist, use_container_width=True)
        
    with v_col4:
        # Overdue Days Distribution
        overdue_only = filtered_df[filtered_df["Overdue Days"] > 0]
        if not overdue_only.empty:
            fig_bar = px.histogram(
                overdue_only, 
                x="Overdue Days", 
                nbins=15,
                title="Distribution of Overdue Days (Delinquent Accounts Only)",
                color_discrete_sequence=["#e83e8c"]
            )
            fig_bar.update_layout(yaxis_title="Account Count", margin=dict(t=40, b=0, l=0, r=0))
            st.plotly_chart(fig_bar, use_container_width=True)
        else:
            st.info("No overdue accounts found in the current filtered selection.")

    # Interactive Data Table
    st.markdown("---")
    st.subheader("Filtered Portfolio Data Table")
    
    # Format columns for display
    display_df = filtered_df.copy()
    display_df["Credit Limit ($)"] = display_df["Credit Limit ($)"].map("${:,.2f}".format)
    display_df["Current Balance ($)"] = display_df["Current Balance ($)"].map("${:,.2f}".format)
    display_df["Credit Utilization (%)"] = display_df["Credit Utilization (%)"].map("{:.1f}%".format)
    display_df["Risk Score"] = display_df["Risk Score"].map("{:.1f}".format)
    
    st.dataframe(
        display_df[["Account ID", "Customer Name", "Credit Limit ($)", "Current Balance ($)", 
                    "Credit Utilization (%)", "Overdue Days", "Risk Score", "Risk Category"]],
        use_container_width=True,
        hide_index=True
    )

# ==================== TAB 2: ACCOUNT DEEP-DIVE ====================
with tab2:
    st.subheader("Individual Account Risk Profile")
    
    # Account Selector
    account_list = df["Account ID"].tolist()
    selected_acc_id = st.selectbox("Search and Select Account ID:", account_list)
    
    if selected_acc_id:
        acc_data = df[df["Account ID"] == selected_acc_id].iloc[0]
        
        # Account Header Info
        h_col1, h_col2, h_col3 = st.columns([2, 1, 1])
        with h_col1:
            st.markdown(f"### **Customer:** {acc_data['Customer Name']}")
            st.markdown(f"**Account ID:** {acc_data['Account ID']}")
        with h_col2:
            risk_color = "#28a745" if acc_data["Risk Category"] == "Low" else "#ffc107" if acc_data["Risk Category"] == "Medium" else "#dc3545"
            st.markdown(f"""
                <div style="text-align: center; padding: 10px; background-color: {risk_color}22; border: 2px solid {risk_color}; border-radius: 8px;">
                    <span style="font-size: 14px; color: #555; font-weight: bold;">RISK CATEGORY</span><br>
                    <span style="font-size: 24px; color: {risk_color}; font-weight: bold;">{acc_data['Risk Category']}</span>
                </div>
            """, unsafe_allow_html=True)
        with h_col3:
            st.markdown(f"""
                <div style="text-align: center; padding: 10px; background-color: #f1f3f5; border: 2px solid #ced4da; border-radius: 8px;">
                    <span style="font-size: 14px; color: #555; font-weight: bold;">RISK SCORE</span><br>
                    <span style="font-size: 24px; color: #495057; font-weight: bold;">{acc_data['Risk Score']} / 100</span>
                </div>
            """, unsafe_allow_html=True)
            
        st.markdown("---")
        
        # Metrics & Gauges Row
        g_col1, g_col2, g_col3 = st.columns([1, 1, 1])
        
        with g_col1:
            # Credit Utilization Gauge
            fig_util_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=acc_data["Credit Utilization (%)"],
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "Credit Utilization Ratio (%)", 'font': {'size': 16}},
                gauge={
                    'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
                    'bar': {'color': "#007bff"},
                    'bgcolor': "white",
                    'borderwidth': 2,
                    'bordercolor': "gray",
                    'steps': [
                        {'range': [0, 50], 'color': '#d4edda'},
                        {'range': [50, 80], 'color': '#fff3cd'},
                        {'range': [80, 100], 'color': '#f8d7da'}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 80
                    }
                }
            ))
            fig_util_gauge.update_layout(height=250, margin=dict(t=50, b=0, l=10, r=10))
            st.plotly_chart(fig_util_gauge, use_container_width=True)
            
        with g_col2:
            # Cash Advance Utilization Gauge
            fig_cash_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=acc_data["Cash Advance Utilization (%)"],
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "Cash Advance Utilization (%)", 'font': {'size': 16}},
                gauge={
                    'axis': {'range': [0, 100], 'tickwidth': 1},
                    'bar': {'color': "#17a2b8"},
                    'bgcolor': "white",
                    'borderwidth': 2,
                    'bordercolor': "gray",
                    'steps': [
                        {'range': [0, 30], 'color': '#e2f0d9'},
                        {'range': [30, 60], 'color': '#fff2cc'},
                        {'range': [60, 100], 'color': '#fce4d6'}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 60
                    }
                }
            ))
            fig_cash_gauge.update_layout(height=250, margin=dict(t=50, b=0, l=10, r=10))
            st.plotly_chart(fig_cash_gauge, use_container_width=True)
            
        with g_col3:
            # Payment-to-Debt Ratio Gauge
            fig_pay_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=acc_data["Payment-to-Debt Ratio (%)"],
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "Payment-to-Debt Ratio (%)", 'font': {'size': 16}},
                gauge={
                    'axis': {'range': [0, 100], 'tickwidth': 1},
                    'bar': {'color': "#28a745"},
                    'bgcolor': "white",
                    'borderwidth': 2,
                    'bordercolor': "gray",
                    'steps': [
                        {'range': [0, 10], 'color': '#f8d7da'},
                        {'range': [10, 50], 'color': '#fff3cd'},
                        {'range': [50, 100], 'color': '#d4edda'}
                    ],
                    'threshold': {
                        'line': {'color': "green", 'width': 4},
                        'thickness': 0.75,
                        'value': 10
                    }
                }
            ))
            fig_pay_gauge.update_layout(height=250, margin=dict(t=50, b=0, l=10, r=10))
            st.plotly_chart(fig_pay_gauge, use_container_width=True)

        # Detailed Account Metrics Table
        st.markdown("### Account Financial Details")
        det_col1, det_col2 = st.columns(2)
        
        with det_col1:
            st.markdown(f"**Credit Limit:** ${acc_data['Credit Limit ($)']:,.2f}")
            st.markdown(f"**Current Balance:** ${acc_data['Current Balance ($)']:,.2f}")
            st.markdown(f"**Cash Advance Limit:** ${acc_data['Cash Advance Limit ($)']:,.2f}")
            st.markdown(f"**Cash Advance Balance:** ${acc_data['Cash Advance Balance ($)']:,.2f}")
        
        with det_col2:
            st.markdown(f"**Last Payment Amount:** ${acc_data['Last Payment Amount ($)']:,.2f}")
            st.markdown(f"**Minimum Payment Due:** ${acc_data['Minimum Payment Due ($)']:,.2f}")
            st.markdown(f"**Overdue Days:** {acc_data['Overdue Days']} Days")
            
            # Overdue Status Badge
            if acc_data["Overdue Flag"]:
                st.markdown(f"**Payment Status:** <span class='flag-badge flag-high'>DELINQUENT ({acc_data['Overdue Days']} Days Overdue)</span>", unsafe_allow_html=True)
            else:
                st.markdown("**Payment Status:** <span class='flag-badge flag-normal'>CURRENT / ON-TIME</span>", unsafe_allow_html=True)

        # Risk Flags & Recommendations
        st.markdown("---")
        st.markdown("### 🛡️ Risk Assessment & Action Plan")
        
        flags_triggered = []
        if acc_data["High Utilization Flag"]:
            flags_triggered.append("⚠️ **High Credit Utilization (>80%):** The customer is utilizing a critical portion of their credit limit, indicating potential financial stress or over-leverage.")
        if acc_data["Overdue Flag"]:
            flags_triggered.append(f"🚨 **Delinquent Account Status:** The account has an active overdue balance of {acc_data['Overdue Days']} days. Immediate collection action is recommended.")
        if acc_data["Cash Advance Utilization (%)"] > 50:
            flags_triggered.append("⚠️ **High Cash Advance Usage:** High reliance on cash advances is historically correlated with elevated default risk.")
            
        if flags_triggered:
            st.error("#### Risk Flags Triggered:")
            for flag in flags_triggered:
                st.markdown(flag)
                
            # Custom Recommendations
            st.markdown("#### Recommended Actions:")
            if acc_data["Overdue Days"] > 60:
                st.markdown("- 📞 **Immediate Action:** Initiate formal collection procedures and temporarily freeze the account to prevent further transactions.")
                st.markdown("- 📉 **Credit Limit Action:** Reduce credit limit to current outstanding balance to mitigate further exposure.")
            elif acc_data["Overdue Days"] > 0:
                st.markdown("- ✉️ **Action:** Send automated payment reminder and contact customer to establish a repayment schedule.")
            elif acc_data["High Utilization Flag"]:
                st.markdown("- 🔍 **Action:** Monitor account closely. Restrict credit limit increases until utilization drops below 70%.")
                st.markdown("- 📊 **Action:** Offer balance transfer options or structured repayment plans if the customer shows signs of distress.")
        else:
            st.success("✅ **Healthy Account Profile:** No risk flags triggered. This account is in good standing. Eligible for standard credit limit reviews or promotional offers.")

# ==================== TAB 3: RISK MITIGATION & ACTIONS ====================
with tab3:
    st.subheader("Portfolio Risk Mitigation & Action Center")
    st.markdown("This control center filters and lists accounts requiring immediate attention based on risk thresholds.")
    
    # Action Filters
    action_col1, action_col2 = st.columns(2)
    with action_col1:
        action_type = st.selectbox(
            "Select Action Category:",
            ["All Actionable Accounts", "High Utilization Only (>80%)", "Delinquent Accounts Only", "High Cash Advance Users"]
        )
    with action_col2:
        min_risk_score = st.slider("Minimum Risk Score for Action List:", 0.0, 100.0, 50.0)
        
    # Filter logic
    action_df = df.copy()
    
    if action_type == "High Utilization Only (>80%)":
        action_df = action_df[action_df["High Utilization Flag"] == True]
    elif action_type == "Delinquent Accounts Only":
        action_df = action_df[action_df["Overdue Flag"] == True]
    elif action_type == "High Cash Advance Users":
        action_df = action_df[action_df["Cash Advance Utilization (%)"] > 50]
    else:
        # All Actionable: either high util, overdue, or high risk score
        action_df = action_df[(action_df["High Utilization Flag"] == True) | (action_df["Overdue Flag"] == True) | (action_df["Risk Score"] >= min_risk_score)]
        
    action_df = action_df[action_df["Risk Score"] >= min_risk_score]
    
    st.markdown(f"### Accounts Requiring Action ({len(action_df)} accounts found)")
    
    if not action_df.empty:
        # Add recommended action column dynamically
        def assign_action(row):
            if row["Overdue Days"] >= 60:
                return "Freeze Account & Initiate Collections"
            elif row["Overdue Days"] > 0:
                return "Send Payment Reminder & Call Customer"
            elif row["Credit Utilization (%)"] > 90:
                return "Decrease Credit Limit / Restrict Spending"
            else:
                return "Monitor & Review Next Cycle"
                
        action_df["Recommended Action"] = action_df.apply(assign_action, axis=1)
        
        # Display table
        display_action_df = action_df.copy()
        display_action_df["Credit Limit ($)"] = display_action_df["Credit Limit ($)"].map("${:,.2f}".format)
        display_action_df["Current Balance ($)"] = display_action_df["Current Balance ($)"].map("${:,.2f}".format)
        display_action_df["Credit Utilization (%)"] = display_action_df["Credit Utilization (%)"].map("{:.1f}%".format)
        display_action_df["Risk Score"] = display_action_df["Risk Score"].map("{:.1f}".format)
        
        st.dataframe(
            display_action_df[["Account ID", "Customer Name", "Credit Limit ($)", "Current Balance ($)", 
                               "Credit Utilization (%)", "Overdue Days", "Risk Score", "Recommended Action"]],
            use_container_width=True,
            hide_index=True
        )
        
        # Export Action List
        st.markdown("### Export Action List")
        st.markdown("Download this list as a CSV file to import into your CRM or collections management system.")
        
        # Convert dataframe to CSV bytes
        csv_buffer = BytesIO()
        action_df.to_csv(csv_buffer, index=False)
        csv_bytes = csv_buffer.getvalue()
        
        st.download_button(
            label="📥 Download Action List (CSV)",
            data=csv_bytes,
            file_name="credit_risk_action_list.csv",
            mime="text/csv"
        )
    else:
        st.success("🎉 No accounts meet the current action criteria. The portfolio is performing exceptionally well!")