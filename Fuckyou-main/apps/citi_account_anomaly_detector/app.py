import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.ensemble import IsolationForest
import io

# Set page configuration
st.set_page_config(
    page_title="Citi Account Anomaly Detector",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Citi-like branding (Deep Blue and Red accents)
st.markdown("""
    <style>
        .main {
            background-color: #f8f9fa;
        }
        .sidebar .sidebar-content {
            background-color: #002D62;
            color: white;
        }
        h1, h2, h3 {
            color: #003B70;
            font-family: 'Arial', sans-serif;
        }
        .stButton>button {
            background-color: #003B70;
            color: white;
            border-radius: 4px;
            border: none;
            padding: 0.5rem 1rem;
        }
        .stButton>button:hover {
            background-color: #FF0000;
            color: white;
        }
        .metric-card {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 5px solid #003B70;
            margin-bottom: 15px;
        }
        .metric-card-anomaly {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 5px solid #FF0000;
            margin-bottom: 15px;
        }
    </style>
""", unsafe_scale=True, unsafe_allow_html=True)

# Helper function to generate realistic Citi Account Mock Data with injected anomalies
def generate_mock_data(num_records=500):
    np.random.seed(42)
    
    countries = ["United States", "United Kingdom", "Singapore", "Japan", "Germany", "Hong Kong", "Brazil", "India"]
    currencies = {
        "United States": "USD",
        "United Kingdom": "GBP",
        "Singapore": "SGD",
        "Japan": "JPY",
        "Germany": "EUR",
        "Hong Kong": "HKD",
        "Brazil": "BRL",
        "India": "INR"
    }
    account_types = ["Retail Checking", "Citigold Wealth", "Corporate Operating", "Citi Private Bank", "High Yield Savings"]
    
    data = []
    
    # Generate normal records
    for i in range(num_records - 15):  # Leave room for 15 explicit anomalies
        country = np.random.choice(countries)
        currency = currencies[country]
        acc_type = np.random.choice(account_types, p=[0.4, 0.2, 0.2, 0.05, 0.15])
        
        # Base balances and limits based on account type
        if acc_type == "Citi Private Bank":
            balance = np.random.lognormal(mean=15, sigma=1.0)
            credit_limit = np.random.uniform(500000, 5000000)
        elif acc_type == "Citigold Wealth":
            balance = np.random.lognormal(mean=12.5, sigma=0.8)
            credit_limit = np.random.uniform(100000, 1000000)
        elif acc_type == "Corporate Operating":
            balance = np.random.lognormal(mean=14, sigma=1.2)
            credit_limit = np.random.uniform(200000, 3000000)
        else:
            balance = np.random.lognormal(mean=9.5, sigma=1.1)
            credit_limit = np.random.uniform(5000, 50000)
            
        acc_num = f"CITI-{np.random.randint(10000000, 99999999)}"
        cust_id = f"CUST-{np.random.randint(100000, 999999)}"
        
        data.append({
            "Account_Number": acc_num,
            "Customer_ID": cust_id,
            "Country": country,
            "Currency": currency,
            "Account_Type": acc_type,
            "Balance_USD": round(balance, 2),
            "Credit_Limit_USD": round(credit_limit, 2),
            "Transaction_Volume_30D": np.random.randint(5, 120),
            "Risk_Score_Base": round(np.random.uniform(10, 60), 2)
        })
        
    # Inject Specific Anomalies
    # 1. Duplicate Account Numbers (3 cases)
    dup_acc = "CITI-88888888"
    for _ in range(2):
        data.append({
            "Account_Number": dup_acc,
            "Customer_ID": f"CUST-{np.random.randint(100000, 999999)}",
            "Country": "United States",
            "Currency": "USD",
            "Account_Type": "Retail Checking",
            "Balance_USD": 5400.00,
            "Credit_Limit_USD": 10000.00,
            "Transaction_Volume_30D": 12,
            "Risk_Score_Base": 15.5
        })
        
    # 2. Extreme Balance Outliers (Z-score triggers) (4 cases)
    for _ in range(3):
        data.append({
            "Account_Number": f"CITI-{np.random.randint(10000000, 99999999)}",
            "Customer_ID": f"CUST-{np.random.randint(100000, 999999)}",
            "Country": "United States",
            "Currency": "USD",
            "Account_Type": "Retail Checking",
            "Balance_USD": 145000000.00,  # Massive balance for retail checking
            "Credit_Limit_USD": 5000.00,
            "Transaction_Volume_30D": 4,
            "Risk_Score_Base": 85.0
        })
        
    # 3. Unusual Currency-Country Pairings (4 cases)
    # e.g., Germany using JPY, or US using INR
    weird_pairings = [("Germany", "JPY"), ("United States", "INR"), ("Japan", "BRL"), ("Brazil", "SGD")]
    for country, currency in weird_pairings:
        data.append({
            "Account_Number": f"CITI-{np.random.randint(10000000, 99999999)}",
            "Customer_ID": f"CUST-{np.random.randint(100000, 999999)}",
            "Country": country,
            "Currency": currency,
            "Account_Type": "Citigold Wealth",
            "Balance_USD": 450000.00,
            "Credit_Limit_USD": 200000.00,
            "Transaction_Volume_30D": 45,
            "Risk_Score_Base": 40.0
        })
        
    # 4. Outlier Credit Limits relative to Account Type (4 cases)
    for _ in range(4):
        data.append({
            "Account_Number": f"CITI-{np.random.randint(10000000, 99999999)}",
            "Customer_ID": f"CUST-{np.random.randint(100000, 999999)}",
            "Country": "Singapore",
            "Currency": "SGD",
            "Account_Type": "Retail Checking",
            "Balance_USD": 1200.00,
            "Credit_Limit_USD": 75000000.00,  # Massive credit limit for retail checking
            "Transaction_Volume_30D": 15,
            "Risk_Score_Base": 90.0
        })

    return pd.DataFrame(data)

# App Header
st.image("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Citibank.svg/1200px-Citibank.svg.png", width=150)
st.title("Citi Account Anomaly Detector")
st.markdown("An enterprise-grade statistical and machine learning suite for detecting operational, transactional, and structural anomalies in Citi accounts.")

# Sidebar Controls
st.sidebar.header("Configuration & Parameters")

# Data Source Selection
data_source = st.sidebar.radio("Data Source", ["Use Sample Citi Dataset", "Upload Excel/CSV File"])

uploaded_file = None
if data_source == "Upload Excel/CSV File":
    uploaded_file = st.sidebar.file_uploader("Upload Account Data File", type=["xlsx", "xls", "csv"])
    st.sidebar.info("Ensure your file contains columns like: Account_Number, Country, Currency, Balance_USD, Credit_Limit_USD, Account_Type")

# Algorithm Parameters
st.sidebar.subheader("Detection Thresholds")
z_score_threshold = st.sidebar.slider("Z-Score Threshold (Balances)", 1.5, 5.0, 3.0, step=0.1)
contamination_rate = st.sidebar.slider("Isolation Forest Contamination", 0.01, 0.15, 0.03, step=0.01)

# Load Data
if uploaded_file is not None:
    try:
        if uploaded_file.name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(uploaded_file)
        else:
            df = pd.read_csv(uploaded_file)
        st.sidebar.success("File loaded successfully!")
    except Exception as e:
        st.sidebar.error(f"Error loading file: {e}")
        df = generate_mock_data()
else:
    df = generate_mock_data()
    st.sidebar.success("Using generated sample Citi account dataset.")

# Ensure necessary columns exist or map them
required_cols = ["Account_Number", "Country", "Currency", "Balance_USD", "Credit_Limit_USD", "Account_Type"]
missing_cols = [col for col in required_cols if col not in df.columns]
if missing_cols:
    st.warning(f"Missing expected columns: {missing_cols}. The app will attempt to auto-generate or map them.")
    # Fallback/Auto-mapping logic if needed, but for safety we'll use mock data if critical columns are missing
    if len(missing_cols) > 3:
        st.error("Too many missing columns. Reverting to Sample Citi Dataset.")
        df = generate_mock_data()

# --- ANOMALY DETECTION ENGINE ---

# 1. Duplicate Account Numbers
df['Anomaly_Duplicate'] = df.duplicated(subset=['Account_Number'], keep=False)

# 2. Z-Score on Balances (Global and Group-by Account Type)
df['Balance_Z_Score'] = (df['Balance_USD'] - df['Balance_USD'].mean()) / df['Balance_USD'].std()
df['Anomaly_Balance_Z'] = np.abs(df['Balance_Z_Score']) > z_score_threshold

# Group-by Account Type Z-Score (more robust for mixed portfolios)
df['Balance_Z_Score_Group'] = df.groupby('Account_Type')['Balance_USD'].transform(lambda x: (x - x.mean()) / (x.std() if x.std() != 0 else 1))
df['Anomaly_Balance_Z_Group'] = np.abs(df['Balance_Z_Score_Group']) > z_score_threshold

# 3. Unusual Currency-Country Pairings
# Calculate frequency of each pairing
pairing_counts = df.groupby(['Country', 'Currency']).size().reset_index(name='Pairing_Count')
total_country_counts = df.groupby('Country').size().reset_index(name='Country_Total')
pairing_freq = pd.merge(pairing_counts, total_country_counts, on='Country')
pairing_freq['Pairing_Ratio'] = pairing_freq['Pairing_Count'] / pairing_freq['Country_Total']

# Flag pairings that represent less than 5% of that country's accounts
rare_pairings = pairing_freq[pairing_freq['Pairing_Ratio'] < 0.05]
df = pd.merge(df, rare_pairings[['Country', 'Currency', 'Pairing_Ratio']], on=['Country', 'Currency'], how='left')
df['Anomaly_Currency_Country'] = df['Pairing_Ratio'].notna()
df['Pairing_Ratio'] = df['Pairing_Ratio'].fillna(1.0) # Normal ratio for non-flagged

# 4. Outlier Credit Limits (Isolation Forest & Group-based Z-score)
df['Credit_Limit_Z_Group'] = df.groupby('Account_Type')['Credit_Limit_USD'].transform(lambda x: (x - x.mean()) / (x.std() if x.std() != 0 else 1))
df['Anomaly_Credit_Limit_Z'] = np.abs(df['Credit_Limit_Z_Group']) > z_score_threshold

# 5. Multi-dimensional Anomaly Detection (Isolation Forest)
# Features: Balance_USD, Credit_Limit_USD, Transaction_Volume_30D
features = ['Balance_USD', 'Credit_Limit_USD', 'Transaction_Volume_30D']
# Handle NaNs
X = df[features].fillna(0)
iso_forest = IsolationForest(contamination=contamination_rate, random_state=42)
df['Isolation_Forest_Score'] = iso_forest.fit_predict(X)
df['Anomaly_Isolation_Forest'] = df['Isolation_Forest_Score'] == -1

# Combine Anomalies into a Master Flag
df['Total_Anomaly_Flags'] = (
    df['Anomaly_Duplicate'].astype(int) +
    df['Anomaly_Balance_Z_Group'].astype(int) +
    df['Anomaly_Currency_Country'].astype(int) +
    df['Anomaly_Credit_Limit_Z'].astype(int) +
    df['Anomaly_Isolation_Forest'].astype(int)
)
df['Is_Anomaly'] = df['Total_Anomaly_Flags'] > 0

# --- DASHBOARD LAYOUT ---

# Top Metrics Row
total_accounts = len(df)
total_anomalies = df['Is_Anomaly'].sum()
anomaly_rate = (total_anomalies / total_accounts) * 100

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.markdown(f"""
        <div class="metric-card">
            <p style="color: #666; font-size: 14px; margin-bottom: 5px;">TOTAL ACCOUNTS AUDITED</p>
            <h2 style="margin: 0; color: #003B70;">{total_accounts:,}</h2>
        </div>
    """, unsafe_allow_html=True)
with col2:
    st.markdown(f"""
        <div class="metric-card-anomaly">
            <p style="color: #666; font-size: 14px; margin-bottom: 5px;">TOTAL ANOMALIES DETECTED</p>
            <h2 style="margin: 0; color: #FF0000;">{total_anomalies:,}</h2>
        </div>
    """, unsafe_allow_html=True)
with col3:
    st.markdown(f"""
        <div class="metric-card-anomaly">
            <p style="color: #666; font-size: 14px; margin-bottom: 5px;">ANOMALY DETECTION RATE</p>
            <h2 style="margin: 0; color: #FF0000;">{anomaly_rate:.2f}%</h2>
        </div>
    """, unsafe_allow_html=True)
with col4:
    st.markdown(f"""
        <div class="metric-card">
            <p style="color: #666; font-size: 14px; margin-bottom: 5px;">CRITICAL RISK ACCOUNTS</p>
            <h2 style="margin: 0; color: #003B70;">{len(df[df['Total_Anomaly_Flags'] >= 3]):,}</h2>
        </div>
    """, unsafe_allow_html=True)

# Tabs for different views
tab1, tab2, tab3, tab4 = st.tabs(["📊 Executive Dashboard", "🔍 Anomaly Explorer", "📈 Statistical Deep-Dive", "⚙️ Data Management"])

with tab1:
    st.subheader("Portfolio Anomaly Overview")
    
    col_left, col_right = st.columns([2, 1])
    
    with col_left:
        # Scatter Plot: Balance vs Credit Limit with Anomalies Highlighted
        fig = px.scatter(
            df, 
            x="Balance_USD", 
            y="Credit_Limit_USD", 
            color="Is_Anomaly",
            color_discrete_map={True: "#FF0000", False: "#003B70"},
            hover_data=["Account_Number", "Account_Type", "Country", "Total_Anomaly_Flags"],
            title="Account Balance vs. Credit Limit (Anomalies in Red)",
            log_x=True,
            log_y=True
        )
        fig.update_layout(
            plot_bgcolor="white",
            paper_bgcolor="white",
            font=dict(color="#333"),
            legend_title_text="Is Anomaly?"
        )
        st.plotly_chart(fig, use_container_width=True)
        
    with col_right:
        # Pie Chart: Breakdown of Anomaly Types
        anomaly_types = {
            "Duplicate Accounts": df['Anomaly_Duplicate'].sum(),
            "Balance Outliers (Z-Score)": df['Anomaly_Balance_Z_Group'].sum(),
            "Unusual Currency-Country": df['Anomaly_Currency_Country'].sum(),
            "Credit Limit Outliers": df['Anomaly_Credit_Limit_Z'].sum(),
            "Isolation Forest Flag": df['Anomaly_Isolation_Forest'].sum()
        }
        df_anomaly_types = pd.DataFrame(list(anomaly_types.items()), columns=["Anomaly Type", "Count"])
        
        fig_pie = px.pie(
            df_anomaly_types, 
            values="Count", 
            names="Anomaly Type", 
            title="Distribution of Anomaly Triggers",
            color_discrete_sequence=px.colors.sequential.Reds_r
        )
        fig_pie.update_layout(showlegend=False)
        st.plotly_chart(fig_pie, use_container_width=True)

    # Row 2: Anomalies by Country and Account Type
    col_b1, col_b2 = st.columns(2)
    with col_b1:
        # Bar Chart: Anomalies by Country
        country_anom = df.groupby('Country')['Is_Anomaly'].sum().reset_index()
        fig_country = px.bar(
            country_anom, 
            x='Country', 
            y='Is_Anomaly', 
            title='Anomalies Detected by Country',
            color_discrete_sequence=['#003B70']
        )
        fig_country.update_layout(plot_bgcolor="white")
        st.plotly_chart(fig_country, use_container_width=True)
        
    with col_b2:
        # Bar Chart: Anomalies by Account Type
        acc_anom = df.groupby('Account_Type')['Is_Anomaly'].sum().reset_index()
        fig_acc = px.bar(
            acc_anom, 
            x='Account_Type', 
            y='Is_Anomaly', 
            title='Anomalies Detected by Account Type',
            color_discrete_sequence=['#FF0000']
        )
        fig_acc.update_layout(plot_bgcolor="white")
        st.plotly_chart(fig_acc, use_container_width=True)

with tab2:
    st.subheader("Interactive Anomaly Explorer")
    st.markdown("Filter and inspect specific flagged accounts. Select rows to view detailed diagnostic reports.")
    
    # Filter controls
    col_f1, col_f2, col_f3 = st.columns(3)
    with col_f1:
        filter_type = st.selectbox("Filter by Anomaly Trigger", [
            "All Flagged Anomalies", 
            "Duplicate Account Numbers", 
            "Balance Outliers (Z-Score)", 
            "Unusual Currency-Country Pairings", 
            "Credit Limit Outliers",
            "Multi-dimensional (Isolation Forest)"
        ])
    with col_f2:
        filter_acc_type = st.multiselect("Filter by Account Type", df['Account_Type'].unique(), default=df['Account_Type'].unique())
    with col_f3:
        min_flags = st.slider("Minimum Anomaly Flags Triggered", 1, 5, 1)

    # Apply filters
    filtered_df = df[df['Is_Anomaly'] == True]
    
    if filter_type == "Duplicate Account Numbers":
        filtered_df = filtered_df[filtered_df['Anomaly_Duplicate'] == True]
    elif filter_type == "Balance Outliers (Z-Score)":
        filtered_df = filtered_df[filtered_df['Anomaly_Balance_Z_Group'] == True]
    elif filter_type == "Unusual Currency-Country Pairings":
        filtered_df = filtered_df[filtered_df['Anomaly_Currency_Country'] == True]
    elif filter_type == "Credit Limit Outliers":
        filtered_df = filtered_df[filtered_df['Anomaly_Credit_Limit_Z'] == True]
    elif filter_type == "Multi-dimensional (Isolation Forest)":
        filtered_df = filtered_df[filtered_df['Anomaly_Isolation_Forest'] == True]
        
    filtered_df = filtered_df[filtered_df['Account_Type'].isin(filter_acc_type)]
    filtered_df = filtered_df[filtered_df['Total_Anomaly_Flags'] >= min_flags]

    # Display Table
    st.markdown(f"Showing **{len(filtered_df)}** flagged accounts matching criteria.")
    
    display_cols = [
        "Account_Number", "Customer_ID", "Country", "Currency", "Account_Type", 
        "Balance_USD", "Credit_Limit_USD", "Total_Anomaly_Flags"
    ]
    
    st.dataframe(
        filtered_df[display_cols].style.background_gradient(subset=['Total_Anomaly_Flags'], cmap='Reds'),
        use_container_width=True
    )
    
    # Detailed Diagnostic Panel
    if not filtered_df.empty:
        st.markdown("---")
        st.subheader("Account Diagnostic Panel")
        selected_acc = st.selectbox("Select an Account to Run Diagnostics", filtered_df['Account_Number'].unique())
        
        acc_details = filtered_df[filtered_df['Account_Number'] == selected_acc].iloc[0]
        
        col_d1, col_d2 = st.columns(2)
        with col_d1:
            st.markdown(f"### Account: **{acc_details['Account_Number']}**")
            st.markdown(f"**Customer ID:** {acc_details['Customer_ID']}")
            st.markdown(f"**Jurisdiction:** {acc_details['Country']} ({acc_details['Currency']})")
            st.markdown(f"**Account Type:** {acc_details['Account_Type']}")
            st.markdown(f"**Current Balance:** ${acc_details['Balance_USD']:,.2f}")
            st.markdown(f"**Credit Limit:** ${acc_details['Credit_Limit_USD']:,.2f}")
            
        with col_d2:
            st.markdown("### Anomaly Diagnostic Checklist")
            
            def check_indicator(condition, text):
                if condition:
                    return f"🔴 **FAIL**: {text}"
                return f"🟢 **PASS**: {text}"
                
            st.markdown(check_indicator(acc_details['Anomaly_Duplicate'], "Duplicate Account Number detected in system."))
            st.markdown(check_indicator(acc_details['Anomaly_Balance_Z_Group'], f"Balance Z-Score ({acc_details['Balance_Z_Score_Group']:.2f}) exceeds threshold of {z_score_threshold}."))
            st.markdown(check_indicator(acc_details['Anomaly_Currency_Country'], f"Unusual Currency-Country pairing (Ratio: {acc_details['Pairing_Ratio']*100:.1f}% of country accounts)."))
            st.markdown(check_indicator(acc_details['Anomaly_Credit_Limit_Z'], f"Credit Limit Z-Score ({acc_details['Credit_Limit_Z_Group']:.2f}) exceeds threshold of {z_score_threshold}."))
            st.markdown(check_indicator(acc_details['Anomaly_Isolation_Forest'], "Multi-dimensional Isolation Forest flagged this account as an outlier."))

with tab3:
    st.subheader("Statistical Deep-Dive & Distributions")
    st.markdown("Explore the underlying statistical distributions of the account portfolio to understand how thresholds are determined.")
    
    # Distribution of Balances
    st.markdown("### Balance Distribution by Account Type")
    fig_dist = px.box(
        df, 
        x="Account_Type", 
        y="Balance_USD", 
        color="Account_Type",
        points="outliers",
        log_y=True,
        title="Log-Scale Balance Distribution (Outliers plotted individually)"
    )
    fig_dist.update_layout(plot_bgcolor="white", showlegend=False)
    st.plotly_chart(fig_dist, use_container_width=True)
    
    # Currency-Country Heatmap
    st.markdown("### Currency-Country Pairing Matrix")
    st.markdown("This matrix highlights standard vs. non-standard currency usage across different jurisdictions.")
    
    pivot_df = df.pivot_table(index='Country', columns='Currency', aggfunc='size', fill_value=0)
    fig_heat = px.imshow(
        pivot_df, 
        text_auto=True, 
        color_continuous_scale='Blues',
        title="Account Count by Country and Currency"
    )
    st.plotly_chart(fig_heat, use_container_width=True)

with tab4:
    st.subheader("Data Management & Export")
    st.markdown("Export flagged anomalies for audit, or download the current dataset.")
    
    # Export options
    col_ex1, col_ex2 = st.columns(2)
    
    with col_ex1:
        st.markdown("### Export Flagged Anomalies")
        st.markdown("Download a CSV report containing all flagged accounts and their specific anomaly indicators for compliance review.")
        
        # Generate CSV
        csv_buffer = io.StringIO()
        df[df['Is_Anomaly'] == True].to_csv(csv_buffer, index=False)
        csv_data = csv_buffer.getvalue()
        
        st.download_button(
            label="📥 Download Anomaly Report (CSV)",
            data=csv_data,
            file_name="citi_flagged_anomalies.csv",
            mime="text/csv"
        )
        
    with col_ex2:
        st.markdown("### Download Full Audited Dataset")
        st.markdown("Download the complete dataset including all normal accounts, anomaly scores, and statistical metrics.")
        
        csv_buffer_all = io.StringIO()
        df.to_csv(csv_buffer_all, index=False)
        csv_data_all = csv_buffer_all.getvalue()
        
        st.download_button(
            label="📥 Download Full Audited Dataset (CSV)",
            data=csv_data_all,
            file_name="citi_audited_accounts_all.csv",
            mime="text/csv"
        )

# Footer
st.markdown("---")
st.markdown(
    "<p style='text-align: center; color: #666; font-size: 12px;'>"
    "Citi Account Anomaly Detector • Internal Audit & Compliance Division • Confidential & Proprietary"
    "</p>", 
    unsafe_allow_html=True
)