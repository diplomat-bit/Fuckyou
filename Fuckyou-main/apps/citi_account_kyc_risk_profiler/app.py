import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import io

# Set page configuration
st.set_page_config(
    page_title="Citi Account KYC Risk Profiler",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Citi-like branding (Navy Blue and Red accents)
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .stButton>button {
        background-color: #002D62;
        color: white;
        border-radius: 4px;
    }
    .stButton>button:hover {
        background-color: #004B87;
        color: white;
    }
    h1, h2, h3 {
        color: #002D62;
    }
    .metric-card {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        border-left: 5px solid #002D62;
    }
    .metric-card-high {
        border-left: 5px solid #D32F2F;
    }
    .metric-card-medium {
        border-left: 5px solid #F57C00;
    }
    .metric-card-low {
        border-left: 5px solid #388E3C;
    }
    </style>
""", unsafe_allow_html=True)

# Helper function to generate mock data
def generate_mock_data(num_records=100):
    np.random.seed(42)
    countries = [
        "United States", "United Kingdom", "Germany", "Switzerland", "Singapore",
        "Cayman Islands", "Panama", "United Arab Emirates", "Bahamas", "Luxembourg",
        "Iran", "North Korea", "Syria", "Cyprus", "British Virgin Islands"
    ]
    country_probs = [0.3, 0.15, 0.1, 0.1, 0.1, 0.05, 0.04, 0.05, 0.03, 0.03, 0.01, 0.01, 0.01, 0.01, 0.01]
    country_probs = np.array(country_probs) / sum(country_probs)
    
    currencies = ["USD", "EUR", "GBP", "CHF", "SGD", "AED", "RUB", "CNY"]
    currency_probs = [0.4, 0.2, 0.15, 0.08, 0.07, 0.05, 0.03, 0.02]
    
    account_types = ["Individual", "Corporate", "Trust", "PEP (Politically Exposed Person)"]
    account_type_probs = [0.6, 0.25, 0.1, 0.05]

    data = {
        "Account_ID": [f"ACT-{100000 + i}" for i in range(num_records)],
        "Customer_Name": [f"Client_{i+1}" for i in range(num_records)],
        "Country_of_Origin": np.random.choice(countries, size=num_records, p=country_probs),
        "Account_Balance_USD": np.round(np.random.exponential(scale=500000, size=num_records) + 5000, 2),
        "Currency": np.random.choice(currencies, size=num_records, p=currency_probs),
        "Monthly_Transaction_Count": np.random.randint(1, 150, size=num_records),
        "Account_Type": np.random.choice(account_types, size=num_records, p=account_type_probs),
        "Last_KYC_Review_Months_Ago": np.random.randint(1, 36, size=num_records)
    }
    return pd.DataFrame(data)

# Default Risk Configurations
DEFAULT_HIGH_RISK_COUNTRIES = ["Iran", "North Korea", "Syria", "Cayman Islands", "Panama", "British Virgin Islands"]
DEFAULT_MEDIUM_RISK_COUNTRIES = ["United Arab Emirates", "Cyprus", "Bahamas", "Luxembourg"]

# Title and Header
st.title("🏦 Citi Account KYC Risk Profiler")
st.subheader("Automated AML/KYC Risk Assessment & Compliance Reporting Tool")

# Sidebar Configuration
st.sidebar.header("⚙️ Configuration & Upload")

# File Upload
uploaded_file = st.sidebar.file_uploader("Upload Account Excel/CSV File", type=["xlsx", "csv"])

# Risk Weights Configuration
st.sidebar.subheader("⚖️ Risk Scoring Weights")
w_country = st.sidebar.slider("Country Risk Weight", 0.0, 1.0, 0.35, 0.05)
w_balance = st.sidebar.slider("Balance Size Weight", 0.0, 1.0, 0.20, 0.05)
w_tx = st.sidebar.slider("Transaction Frequency Weight", 0.0, 1.0, 0.25, 0.05)
w_type = st.sidebar.slider("Account Type Weight", 0.0, 1.0, 0.20, 0.05)

# Normalize weights
total_w = w_country + w_balance + w_tx + w_type
if total_w > 0:
    w_country /= total_w
    w_balance /= total_w
    w_tx /= total_w
    w_type /= total_w

# Thresholds Configuration
st.sidebar.subheader("📊 Thresholds")
high_balance_threshold = st.sidebar.number_input("High Balance Threshold (USD)", value=1000000, step=100000)
medium_balance_threshold = st.sidebar.number_input("Medium Balance Threshold (USD)", value=100000, step=10000)

high_tx_threshold = st.sidebar.number_input("High Monthly Tx Count", value=80, step=10)
medium_tx_threshold = st.sidebar.number_input("Medium Monthly Tx Count", value=20, step=5)

# Load Data
if uploaded_file is not None:
    try:
        if uploaded_file.name.endswith('.xlsx'):
            df = pd.read_excel(uploaded_file)
        else:
            df = pd.read_csv(uploaded_file)
        st.sidebar.success("File uploaded successfully!")
    except Exception as e:
        st.sidebar.error(f"Error loading file: {e}")
        df = generate_mock_data()
else:
    st.sidebar.info("Using simulated mock data. Upload your own Excel/CSV file to analyze real accounts.")
    df = generate_mock_data()

# Risk Profiling Engine
def profile_risk(row):
    # 1. Country Risk Score (1 to 3)
    if row['Country_of_Origin'] in DEFAULT_HIGH_RISK_COUNTRIES:
        country_score = 3.0
    elif row['Country_of_Origin'] in DEFAULT_MEDIUM_RISK_COUNTRIES:
        country_score = 2.0
    else:
        country_score = 1.0
        
    # 2. Balance Risk Score (1 to 3)
    if row['Account_Balance_USD'] >= high_balance_threshold:
        balance_score = 3.0
    elif row['Account_Balance_USD'] >= medium_balance_threshold:
        balance_score = 2.0
    else:
        balance_score = 1.0
        
    # 3. Transaction Frequency Risk Score (1 to 3)
    if row['Monthly_Transaction_Count'] >= high_tx_threshold:
        tx_score = 3.0
    elif row['Monthly_Transaction_Count'] >= medium_tx_threshold:
        tx_score = 2.0
    else:
        tx_score = 1.0
        
    # 4. Account Type Risk Score (1 to 3)
    if row['Account_Type'] == "PEP (Politically Exposed Person)":
        type_score = 3.0
    elif row['Account_Type'] in ["Trust", "Corporate"]:
        type_score = 2.0
    else:
        type_score = 1.0
        
    # Weighted Score Calculation
    final_score = (
        (country_score * w_country) +
        (balance_score * w_balance) +
        (tx_score * w_tx) +
        (type_score * w_type)
    )
    
    # Map to Risk Category
    if final_score >= 2.3:
        risk_level = "High"
    elif final_score >= 1.5:
        risk_level = "Medium"
    else:
        risk_level = "Low"
        
    return pd.Series([final_score, risk_level, country_score, balance_score, tx_score, type_score])

# Apply Risk Profiling
df[['Risk_Score', 'Risk_Level', 'Country_Risk_Score', 'Balance_Risk_Score', 'Tx_Risk_Score', 'Type_Risk_Score']] = df.apply(profile_risk, axis=1)

# Main Dashboard Tabs
tab1, tab2, tab3, tab4 = st.tabs(["📊 Executive Dashboard", "🔍 Account Risk Profiler", "📋 KYC Compliance Report", "🛠️ Risk Rules & Data Preview"])

with tab1:
    st.header("Executive KYC Risk Dashboard")
    
    # Metrics Row
    total_accounts = len(df)
    high_risk_count = len(df[df['Risk_Level'] == 'High'])
    medium_risk_count = len(df[df['Risk_Level'] == 'Medium'])
    low_risk_count = len(df[df['Risk_Level'] == 'Low'])
    
    high_risk_pct = (high_risk_count / total_accounts) * 100
    avg_risk_score = df['Risk_Score'].mean()
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
            <div class="metric-card">
                <p style="font-size:14px; color:#666; margin:0;">Total Accounts Profiled</p>
                <h2 style="margin:5px 0 0 0; color:#002D62;">{total_accounts:,}</h2>
            </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
            <div class="metric-card metric-card-high">
                <p style="font-size:14px; color:#666; margin:0;">High Risk Accounts</p>
                <h2 style="margin:5px 0 0 0; color:#D32F2F;">{high_risk_count} ({high_risk_pct:.1f}%)</h2>
            </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
            <div class="metric-card metric-card-medium">
                <p style="font-size:14px; color:#666; margin:0;">Medium Risk Accounts</p>
                <h2 style="margin:5px 0 0 0; color:#F57C00;">{medium_risk_count}</h2>
            </div>
        """, unsafe_allow_html=True)
    with col4:
        st.markdown(f"""
            <div class="metric-card metric-card-low">
                <p style="font-size:14px; color:#666; margin:0;">Average Risk Score</p>
                <h2 style="margin:5px 0 0 0; color:#388E3C;">{avg_risk_score:.2f} / 3.00</h2>
            </div>
        """, unsafe_allow_html=True)
        
    st.markdown("---")
    
    # Charts Row
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        st.subheader("Risk Level Distribution")
        fig_pie = px.pie(
            df, 
            names='Risk_Level', 
            color='Risk_Level',
            color_discrete_map={'High': '#D32F2F', 'Medium': '#F57C00', 'Low': '#388E3C'},
            hole=0.4
        )
        fig_pie.update_layout(margin=dict(t=20, b=20, l=20, r=20))
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with col_chart2:
        st.subheader("Risk Score vs Account Balance")
        fig_scatter = px.scatter(
            df,
            x="Account_Balance_USD",
            y="Risk_Score",
            color="Risk_Level",
            size="Monthly_Transaction_Count",
            hover_name="Customer_Name",
            hover_data=["Country_of_Origin", "Account_Type"],
            color_discrete_map={'High': '#D32F2F', 'Medium': '#F57C00', 'Low': '#388E3C'},
            labels={"Account_Balance_USD": "Account Balance (USD)", "Risk_Score": "Calculated Risk Score"}
        )
        st.plotly_chart(fig_scatter, use_container_width=True)

    st.markdown("---")
    
    # Country Risk Analysis
    st.subheader("Geographic Risk Concentration")
    country_risk = df.groupby('Country_of_Origin').agg(
        Total_Accounts=('Account_ID', 'count'),
        Avg_Risk_Score=('Risk_Score', 'mean'),
        High_Risk_Accounts=('Risk_Level', lambda x: (x == 'High').sum())
    ).reset_index().sort_values(by='Avg_Risk_Score', ascending=False)
    
    fig_country = px.bar(
        country_risk,
        x='Country_of_Origin',
        y='Avg_Risk_Score',
        color='High_Risk_Accounts',
        color_continuous_scale='Reds',
        title="Average Risk Score by Country of Origin",
        labels={'Avg_Risk_Score': 'Avg Risk Score', 'Country_of_Origin': 'Country'}
    )
    st.plotly_chart(fig_country, use_container_width=True)

with tab2:
    st.header("Account Risk Profiler & Search")
    
    # Filters
    col_f1, col_f2, col_f3 = st.columns(3)
    with col_f1:
        search_query = st.text_input("🔍 Search by Customer Name or Account ID")
    with col_f2:
        risk_filter = st.multiselect("Filter by Risk Level", options=["High", "Medium", "Low"], default=["High", "Medium", "Low"])
    with col_f3:
        country_filter = st.multiselect("Filter by Country", options=df['Country_of_Origin'].unique())
        
    # Apply Filters
    filtered_df = df.copy()
    if search_query:
        filtered_df = filtered_df[
            filtered_df['Customer_Name'].str.contains(search_query, case=False) | 
            filtered_df['Account_ID'].str.contains(search_query, case=False)
        ]
    if risk_filter:
        filtered_df = filtered_df[filtered_df['Risk_Level'].isin(risk_filter)]
    if country_filter:
        filtered_df = filtered_df[filtered_df['Country_of_Origin'].isin(country_filter)]
        
    st.dataframe(
        filtered_df[[
            'Account_ID', 'Customer_Name', 'Country_of_Origin', 'Account_Type', 
            'Account_Balance_USD', 'Currency', 'Monthly_Transaction_Count', 'Risk_Score', 'Risk_Level'
        ]].style.format({
            'Account_Balance_USD': '${:,.2f}',
            'Risk_Score': '{:.2f}'
        }).background_gradient(subset=['Risk_Score'], cmap='YlOrRd'),
        use_container_width=True
    )
    
    # Detailed Account View
    st.markdown("---")
    st.subheader("Detailed Account Investigation")
    selected_account_id = st.selectbox("Select an Account to Investigate", options=filtered_df['Account_ID'].unique())
    
    if selected_account_id:
        account_details = df[df['Account_ID'] == selected_account_id].iloc[0]
        
        col_det1, col_det2 = st.columns(2)
        with col_det1:
            st.write(f"**Account ID:** {account_details['Account_ID']}")
            st.write(f"**Customer Name:** {account_details['Customer_Name']}")
            st.write(f"**Country of Origin:** {account_details['Country_of_Origin']}")
            st.write(f"**Account Type:** {account_details['Account_Type']}")
            st.write(f"**Account Balance:** {account_details['Currency']} {account_details['Account_Balance_USD']:,.2f}")
            st.write(f"**Monthly Transaction Count:** {account_details['Monthly_Transaction_Count']}")
            
        with col_det2:
            # Gauge Chart for Risk Score
            fig_gauge = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = account_details['Risk_Score'],
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': f"Risk Level: {account_details['Risk_Level']}", 'font': {'size': 20}},
                gauge = {
                    'axis': {'range': [1, 3], 'tickwidth': 1, 'tickcolor': "darkblue"},
                    'bar': {'color': "#002D62"},
                    'bgcolor': "white",
                    'borderwidth': 2,
                    'bordercolor': "gray",
                    'steps': [
                        {'range': [1, 1.5], 'color': '#388E3C'},
                        {'range': [1.5, 2.3], 'color': '#F57C00'},
                        {'range': [2.3, 3], 'color': '#D32F2F'}
                    ],
                }
            ))
            fig_gauge.update_layout(height=250, margin=dict(t=40, b=10, l=10, r=10))
            st.plotly_chart(fig_gauge, use_container_width=True)

with tab3:
    st.header("📋 KYC Compliance & Audit Report")
    st.write("Generate and download a comprehensive compliance report for internal audit and regulatory submission.")
    
    # Compliance Metrics
    st.subheader("Compliance Summary Statistics")
    
    overdue_kyc = df[df['Last_KYC_Review_Months_Ago'] > 12]
    high_risk_overdue = overdue_kyc[overdue_kyc['Risk_Level'] == 'High']
    
    col_c1, col_c2, col_c3 = st.columns(3)
    with col_c1:
        st.metric("Accounts Overdue for KYC (>12 Months)", len(overdue_kyc))
    with col_c2:
        st.metric("High Risk Accounts Overdue", len(high_risk_overdue))
    with col_c3:
        st.metric("Compliance Health Score", f"{((total_accounts - len(overdue_kyc))/total_accounts)*100:.1f}%")
        
    # Actionable Insights / Flags
    st.subheader("⚠️ Immediate Action Required Flags")
    
    flags = []
    
    # Flag 1: High Risk & Overdue KYC
    for idx, row in high_risk_overdue.iterrows():
        flags.append({
            "Account_ID": row['Account_ID'],
            "Customer_Name": row['Customer_Name'],
            "Issue": "HIGH RISK & KYC OVERDUE",
            "Details": f"Risk Score: {row['Risk_Score']:.2f}, Last Review: {row['Last_KYC_Review_Months_Ago']} months ago",
            "Severity": "CRITICAL"
        })
        
    # Flag 2: High Balance in High Risk Country
    high_bal_high_risk_country = df[(df['Account_Balance_USD'] >= high_balance_threshold) & (df['Country_of_Origin'].isin(DEFAULT_HIGH_RISK_COUNTRIES))]
    for idx, row in high_bal_high_risk_country.iterrows():
        flags.append({
            "Account_ID": row['Account_ID'],
            "Customer_Name": row['Customer_Name'],
            "Issue": "HIGH BALANCE IN HIGH RISK JURISDICTION",
            "Details": f"Balance: ${row['Account_Balance_USD']:,.2f} in {row['Country_of_Origin']}",
            "Severity": "HIGH"
        })
        
    # Flag 3: PEP with High Transaction Volume
    pep_high_tx = df[(df['Account_Type'] == "PEP (Politically Exposed Person)") & (df['Monthly_Transaction_Count'] >= medium_tx_threshold)]
    for idx, row in pep_high_tx.iterrows():
        flags.append({
            "Account_ID": row['Account_ID'],
            "Customer_Name": row['Customer_Name'],
            "Issue": "PEP WITH HIGH TRANSACTION FREQUENCY",
            "Details": f"Monthly Tx Count: {row['Monthly_Transaction_Count']}",
            "Severity": "HIGH"
        })
        
    if flags:
        flags_df = pd.DataFrame(flags)
        st.dataframe(
            flags_df.style.map(
                lambda x: 'background-color: #FFCDD2; color: #B71C1C; font-weight: bold;' if x in ['CRITICAL', 'HIGH'] else '',
                subset=['Severity']
            ),
            use_container_width=True
        )
    else:
        st.success("No critical compliance flags detected!")
        
    # Export Report
    st.markdown("---")
    st.subheader("📥 Export Compliance Report")
    
    # Create Excel Report in memory
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
        # Sheet 1: Summary
        summary_data = pd.DataFrame({
            "Metric": ["Total Accounts Profiled", "High Risk Accounts", "Medium Risk Accounts", "Low Risk Accounts", "KYC Overdue Accounts", "Compliance Health Score"],
            "Value": [total_accounts, high_risk_count, medium_risk_count, low_risk_count, len(overdue_kyc), f"{((total_accounts - len(overdue_kyc))/total_accounts)*100:.1f}%"]
        })
        summary_data.to_excel(writer, sheet_name="Summary Dashboard", index=False)
        
        # Sheet 2: All Profiled Accounts
        df.to_excel(writer, sheet_name="All Profiled Accounts", index=False)
        
        # Sheet 3: High Risk Accounts
        df[df['Risk_Level'] == 'High'].to_excel(writer, sheet_name="High Risk Flagged", index=False)
        
        # Sheet 4: Compliance Flags
        if flags:
            flags_df.to_excel(writer, sheet_name="Compliance Flags", index=False)
            
    st.download_button(
        label="📥 Download Comprehensive Excel KYC Report",
        data=buffer.getvalue(),
        file_name="Citi_KYC_Compliance_Report.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

with tab4:
    st.header("Rules Configuration & Raw Data Preview")
    
    col_r1, col_r2 = st.columns(2)
    with col_r1:
        st.subheader("High Risk Jurisdictions")
        st.write(DEFAULT_HIGH_RISK_COUNTRIES)
        
        st.subheader("Medium Risk Jurisdictions")
        st.write(DEFAULT_MEDIUM_RISK_COUNTRIES)
        
    with col_r2:
        st.subheader("Risk Scoring Formula")
        st.latex(r"""
        \text{Risk Score} = (C \times W_c) + (B \times W_b) + (T \times W_t) + (A \times W_a)
        """)
        st.write("""
        Where:
        - $C$ = Country Risk Score (1-3)
        - $B$ = Balance Risk Score (1-3)
        - $T$ = Transaction Frequency Risk Score (1-3)
        - $A$ = Account Type Risk Score (1-3)
        - $W$ = Configured Weights
        """)
        
    st.markdown("---")
    st.subheader("Raw Data Preview")
    st.dataframe(df, use_container_width=True)