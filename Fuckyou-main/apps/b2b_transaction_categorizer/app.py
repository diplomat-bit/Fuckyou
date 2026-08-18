import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import random
import json

# Set page configuration
st.set_page_config(
    page_title="B2B Multi-Account Transaction Categorizer & Anomaly Detector",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- MOCK B2B API ENGINE ---
class MockB2BAPI:
    """Simulates a B2B Open Banking API delivering multi-account transaction feeds."""
    
    MCC_MAP = {
        "5411": {"category": "Groceries & Food", "name": "Supermarket/Grocery"},
        "5812": {"category": "Dining & Entertainment", "name": "Restaurant/Eating Place"},
        "4814": {"category": "Utilities & SaaS", "name": "Telecommunication Services"},
        "4900": {"category": "Utilities & SaaS", "name": "Utilities - Electric/Gas/Water"},
        "5541": {"category": "Logistics & Travel", "name": "Service Stations/Fuel"},
        "6011": {"category": "Treasury & Cash", "name": "ATM/Cash Disbursement"},
        "6211": {"category": "Investments", "name": "Security Brokers/Dealers"},
        "8011": {"category": "Healthcare & Benefits", "name": "Doctors/Physicians"},
        "7399": {"category": "Business Operations", "name": "Business Services / SaaS"},
        "5045": {"category": "IT Infrastructure", "name": "Computers & Software"},
        "8742": {"category": "Professional Services", "name": "Consulting & PR"},
        "9399": {"category": "Taxes & Fees", "name": "Government Services"}
    }

    MERCHANTS = {
        "5411": ["Costco Wholesale", "Sysco Food Services", "Whole Foods Market", "US Foods Inc."],
        "5812": ["Catering Express", "The Boardroom Bistro", "Corporate Dining Solutions", "Starbucks Corporate"],
        "4814": ["Verizon Wireless", "AT&T Business", "Comcast Business", "Twilio API"],
        "4900": ["Pacific Gas & Electric", "ConEd Power", "City Water & Waste", "NextEra Energy"],
        "5541": ["Shell Fleet", "ExxonMobil Business", "Chevron Station", "Wex Fuel Card"],
        "6011": ["Chase ATM", "Bank of America ATM", "Wells Fargo Cash Vault"],
        "6211": ["Fidelity Investments", "Charles Schwab", "Vanguard Group", "Morgan Stanley"],
        "8011": ["Blue Cross Corporate", "Quest Diagnostics", "One Medical Group", "MetLife Dental"],
        "7399": ["Amazon Web Services", "Salesforce.com", "Slack Technologies", "Google Cloud Platform", "Zoom Video Communications"],
        "5045": ["CDW Direct", "Dell Marketing", "Apple Store Corporate", "HP Enterprise"],
        "8742": ["McKinsey & Co", "Deloitte Consulting", "Accenture LLP", "LegalZoom Business"],
        "9399": ["Internal Revenue Service", "State Franchise Tax Board", "US Customs & Border Protection"]
    }

    ACCOUNTS = {
        "ACC-CH-9081": {"type": "Checking", "name": "Primary Operating Account", "balance": 450000.00},
        "ACC-SV-4412": {"type": "Savings", "name": "Treasury Reserve Account", "balance": 1250000.00},
        "ACC-CC-3309": {"type": "Credit Card", "name": "Corporate Executive Card", "balance": -45200.00},
        "ACC-LN-8810": {"type": "Loan", "name": "Equipment Term Loan", "balance": -320000.00},
        "ACC-BR-5543": {"type": "Brokerage", "name": "Short-Term Liquidity Fund", "balance": 850000.00}
    }

    @classmethod
    def generate_transactions(cls, num_days=30, seed=42):
        random.seed(seed)
        np.random.seed(seed)
        transactions = []
        start_date = datetime.now() - timedelta(days=num_days)
        
        # Base transaction generation
        tx_id_counter = 10001
        
        for day in range(num_days):
            current_date = start_date + timedelta(days=day)
            # Determine number of transactions for this day (B2B volume)
            num_tx = random.randint(5, 15)
            
            for _ in range(num_tx):
                account_id = random.choice(list(cls.ACCOUNTS.keys()))
                account_info = cls.ACCOUNTS[account_id]
                
                # Select MCC and Merchant
                mcc = random.choice(list(cls.MCC_MAP.keys()))
                merchant = random.choice(cls.MERCHANTS[mcc])
                category = cls.MCC_MAP[mcc]["category"]
                
                # Determine transaction type based on account and MCC
                if account_info["type"] == "Credit Card":
                    tx_type = "DEBIT"  # Charges are debits to the card balance
                    amount = round(float(np.random.exponential(scale=800) + 10), 2)
                elif account_info["type"] == "Brokerage":
                    tx_type = random.choice(["DEBIT", "CREDIT"])
                    amount = round(float(np.random.exponential(scale=15000) + 500), 2)
                elif account_info["type"] == "Loan":
                    tx_type = "DEBIT" if random.random() > 0.85 else "CREDIT" # Mostly payments (CREDIT to balance)
                    amount = round(float(np.random.exponential(scale=5000) + 1000), 2)
                else: # Checking / Savings
                    tx_type = random.choice(["DEBIT", "CREDIT", "TRANSFER"])
                    if tx_type == "TRANSFER":
                        amount = round(float(np.random.exponential(scale=10000) + 100), 2)
                    else:
                        amount = round(float(np.random.exponential(scale=2500) + 5), 2)
                
                # Timestamps spread throughout the day
                hour = random.randint(8, 18)
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                tx_time = current_date.replace(hour=hour, minute=minute, second=second)
                
                transactions.append({
                    "transaction_id": f"TXN-{tx_id_counter}",
                    "account_id": account_id,
                    "account_name": account_info["name"],
                    "account_type": account_info["type"],
                    "timestamp": tx_time,
                    "mcc": mcc,
                    "merchant": merchant,
                    "category": category,
                    "type": tx_type,
                    "amount": amount,
                    "status": "COMPLETED"
                })
                tx_id_counter += 1

        # --- INJECT ANOMALIES ---
        # 1. Duplicate Charges (Same merchant, same amount, same day, within minutes)
        for _ in range(5):
            base_tx = random.choice(transactions)
            # Create duplicate
            dup_tx = base_tx.copy()
            dup_tx["transaction_id"] = f"TXN-{tx_id_counter}"
            dup_tx["timestamp"] = base_tx["timestamp"] + timedelta(minutes=random.randint(1, 5))
            transactions.append(dup_tx)
            tx_id_counter += 1

        # 2. High-Value Transfers (Out of pattern)
        for _ in range(3):
            account_id = "ACC-CH-9081" # Primary Operating
            account_info = cls.ACCOUNTS[account_id]
            tx_time = start_date + timedelta(days=random.randint(1, num_days-1), hour=23, minute=15) # Late night
            transactions.append({
                "transaction_id": f"TXN-{tx_id_counter}",
                "account_id": account_id,
                "account_name": account_info["name"],
                "account_type": account_info["type"],
                "timestamp": tx_time,
                "mcc": "7399",
                "merchant": "Unknown Offshore Consulting LLC",
                "category": "Professional Services",
                "type": "TRANSFER",
                "amount": round(random.uniform(120000, 250000), 2),
                "status": "COMPLETED"
            })
            tx_id_counter += 1

        # 3. Rapid Successive Transactions (Velocity Anomaly)
        velocity_base_time = start_date + timedelta(days=random.randint(1, num_days-1), hour=14)
        for i in range(4):
            transactions.append({
                "transaction_id": f"TXN-{tx_id_counter}",
                "account_id": "ACC-CC-3309",
                "account_name": "Corporate Executive Card",
                "account_type": "Credit Card",
                "timestamp": velocity_base_time + timedelta(seconds=i * 45),
                "mcc": "5045",
                "merchant": "Apple Store Corporate",
                "category": "IT Infrastructure",
                "type": "DEBIT",
                "amount": 3299.00,
                "status": "COMPLETED"
            })
            tx_id_counter += 1

        # Sort transactions by timestamp descending
        transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        return transactions

# --- CATEGORIZATION & ANOMALY DETECTION ENGINE ---
class TransactionProcessor:
    """Processes, categorizes, and flags anomalies in the transaction dataset."""
    
    def __init__(self, high_value_threshold=50000.0, duplicate_window_minutes=15):
        self.high_value_threshold = high_value_threshold
        self.duplicate_window_minutes = duplicate_window_minutes

    def process(self, df_raw):
        df = df_raw.copy()
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values(by='timestamp').reset_index(drop=True)
        
        # Initialize anomaly flags
        df['is_duplicate'] = False
        df['is_high_value'] = False
        df['is_velocity_anomaly'] = False
        df['anomaly_score'] = 0
        df['flag_reasons'] = [[] for _ in range(len(df))]

        # 1. Detect Duplicates
        # Group by account, merchant, amount and check time difference
        for idx, row in df.iterrows():
            # Look back at previous transactions to find duplicates
            lookback_window = df[
                (df['account_id'] == row['account_id']) &
                (df['merchant'] == row['merchant']) &
                (df['amount'] == row['amount']) &
                (df['timestamp'] < row['timestamp']) &
                (df['timestamp'] >= row['timestamp'] - timedelta(minutes=self.duplicate_window_minutes)) &
                (df['transaction_id'] != row['transaction_id'])
            ]
            if not lookback_window.empty:
                df.at[idx, 'is_duplicate'] = True
                df.at[idx, 'anomaly_score'] += 50
                df.at[idx, 'flag_reasons'].append(f"Duplicate charge within {self.duplicate_window_minutes} mins")
                # Also flag the original transaction in the lookback window if not already flagged
                orig_idx = lookback_window.index[0]
                df.at[orig_idx, 'is_duplicate'] = True
                if "Potential duplicate source" not in df.at[orig_idx, 'flag_reasons']:
                    df.at[orig_idx, 'flag_reasons'].append("Potential duplicate source")
                    df.at[orig_idx, 'anomaly_score'] += 30

        # 2. Detect High-Value Transfers
        for idx, row in df.iterrows():
            if row['amount'] >= self.high_value_threshold:
                df.at[idx, 'is_high_value'] = True
                df.at[idx, 'anomaly_score'] += 40
                df.at[idx, 'flag_reasons'].append(f"High-value transaction (>= ${self.high_value_threshold:,.2f})")

        # 3. Detect Velocity Anomalies (Rapid successive transactions on same account)
        velocity_threshold_count = 3
        velocity_window_minutes = 5
        for idx, row in df.iterrows():
            recent_txs = df[
                (df['account_id'] == row['account_id']) &
                (df['timestamp'] <= row['timestamp']) &
                (df['timestamp'] >= row['timestamp'] - timedelta(minutes=velocity_window_minutes))
            ]
            if len(recent_txs) >= velocity_threshold_count:
                df.at[idx, 'is_velocity_anomaly'] = True
                df.at[idx, 'anomaly_score'] += 30
                df.at[idx, 'flag_reasons'].append(f"High velocity: {len(recent_txs)} txs in {velocity_window_minutes} mins")

        # Consolidate anomaly status
        df['is_anomaly'] = df['is_duplicate'] | df['is_high_value'] | df['is_velocity_anomaly']
        df['flag_reasons_str'] = df['flag_reasons'].apply(lambda x: ", ".join(x) if x else "None")
        
        return df.sort_values(by='timestamp', ascending=False).reset_index(drop=True)

# --- STREAMLIT UI ---

# Initialize Session State
if 'raw_data' not in st.session_state:
    st.session_state['raw_data'] = MockB2BAPI.generate_transactions(num_days=45)
if 'high_value_threshold' not in st.session_state:
    st.session_state['high_value_threshold'] = 50000.0
if 'duplicate_window' not in st.session_state:
    st.session_state['duplicate_window'] = 15
if 'mcc_custom_rules' not in st.session_state:
    st.session_state['mcc_custom_rules'] = MockB2BAPI.MCC_MAP.copy()

# Sidebar Controls
st.sidebar.image("https://img.icons8.com/fluency/96/000000/safe-in-cloud.png", width=80)
st.sidebar.title("B2B Treasury Control")
st.sidebar.markdown("---")

st.sidebar.subheader("🔌 B2B API Connection")
api_endpoint = st.sidebar.text_input("API Endpoint", value="https://api.treasury-flow.io/v2/transactions")
api_key = st.sidebar.text_input("API Key", value="••••••••••••••••••••", type="password")

st.sidebar.subheader("⚙️ Anomaly Detection Rules")
high_val_input = st.sidebar.number_input(
    "High-Value Threshold ($)", 
    min_value=1000.0, 
    max_value=1000000.0, 
    value=st.session_state['high_value_threshold'], 
    step=5000.0
)
st.session_state['high_value_threshold'] = high_val_input

dup_window_input = st.sidebar.slider(
    "Duplicate Window (Minutes)", 
    min_value=1, 
    max_value=120, 
    value=st.session_state['duplicate_window']
)
st.session_state['duplicate_window'] = dup_window_input

# Trigger API Fetch Simulation
st.sidebar.markdown("---")
if st.sidebar.button("🔄 Force API Sync / Refresh"):
    with st.spinner("Fetching live transaction feeds from B2B API..."):
        # Simulate network delay
        import time
        time.sleep(1.2)
        st.session_state['raw_data'] = MockB2BAPI.generate_transactions(num_days=45, seed=random.randint(1, 1000))
        st.sidebar.success("Successfully synced with B2B API!")

# Process Data
processor = TransactionProcessor(
    high_value_threshold=st.session_state['high_value_threshold'],
    duplicate_window_minutes=st.session_state['duplicate_window']
)
df_raw = pd.DataFrame(st.session_state['raw_data'])
df_processed = processor.process(df_raw)

# Main Dashboard Title
st.title("💼 B2B Multi-Account Transaction Categorizer & Anomaly Detector")
st.markdown("Real-time ingestion, MCC-based categorization, and automated risk/anomaly detection for corporate treasury.")

# --- METRIC CARDS ---
total_volume = df_processed['amount'].sum()
total_txs = len(df_processed)
anomalies_df = df_processed[df_processed['is_anomaly']]
total_anomalies = len(anomalies_df)
anomaly_rate = (total_anomalies / total_txs) * 100 if total_txs > 0 else 0

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric(
        label="Total Ingested Volume", 
        value=f"${total_volume:,.2f}", 
        delta=f"{len(df_processed['account_id'].unique())} Active Accounts"
    )
with col2:
    st.metric(
        label="Total Transactions", 
        value=f"{total_txs:,}", 
        delta="Live Feed Active"
    )
with col3:
    st.metric(
        label="Flagged Anomalies", 
        value=f"{total_anomalies}", 
        delta=f"{anomaly_rate:.1f}% Anomaly Rate",
        delta_color="inverse"
    )
with col4:
    high_risk_count = len(df_processed[df_processed['anomaly_score'] >= 50])
    st.metric(
        label="High Risk Alerts (Score >= 50)", 
        value=f"{high_risk_count}", 
        delta="Requires Immediate Action",
        delta_color="off"
    )

# --- TABS INTERFACE ---
tab_dashboard, tab_ledger, tab_anomalies, tab_rules = st.tabs([
    "📊 Treasury Dashboard", 
    "📑 Transaction Ledger", 
    "🚨 Anomaly Investigation Center", 
    "🛠️ MCC & Categorization Rules"
])

# --- TAB 1: DASHBOARD ---
with tab_dashboard:
    st.subheader("Treasury Analytics & Insights")
    
    # Filters for Dashboard
    dash_cols = st.columns(3)
    with dash_cols[0]:
        selected_accounts = st.multiselect(
            "Filter by Account", 
            options=df_processed['account_name'].unique(),
            default=df_processed['account_name'].unique()
        )
    with dash_cols[1]:
        selected_categories = st.multiselect(
            "Filter by Category", 
            options=df_processed['category'].unique(),
            default=df_processed['category'].unique()
        )
    with dash_cols[2]:
        date_range = st.date_input(
            "Date Range",
            value=(df_processed['timestamp'].min().date(), df_processed['timestamp'].max().date())
        )

    # Apply filters
    if len(date_range) == 2:
        start_dt, end_dt = pd.to_datetime(date_range[0]), pd.to_datetime(date_range[1]) + timedelta(days=1)
    else:
        start_dt, end_dt = df_processed['timestamp'].min(), df_processed['timestamp'].max()

    filtered_df = df_processed[
        (df_processed['account_name'].isin(selected_accounts)) &
        (df_processed['category'].isin(selected_categories)) &
        (df_processed['timestamp'] >= start_dt) &
        (df_processed['timestamp'] <= end_dt)
    ]

    # Visualizations Row 1
    vis_col1, vis_col2 = st.columns(2)
    
    with vis_col1:
        st.markdown("### 📈 Spending & Volume by Category")
        cat_summary = filtered_df.groupby('category')['amount'].sum().reset_index()
        fig_pie = px.pie(
            cat_summary, 
            values='amount', 
            names='category', 
            hole=0.4,
            color_discrete_sequence=px.colors.qualitative.Pastel
        )
        fig_pie.update_layout(margin=dict(t=20, b=20, l=20, r=20), height=350)
        st.plotly_chart(fig_pie, use_container_width=True)

    with vis_col2:
        st.markdown("### 🏦 Account Balance Distribution")
        # Calculate cumulative balances over time per account
        balance_chart_data = []
        for acc_id, acc_info in MockB2BAPI.ACCOUNTS.items():
            acc_txs = filtered_df[filtered_df['account_id'] == acc_id].sort_values('timestamp')
            if acc_txs.empty:
                continue
            # Reconstruct balance history backwards or forwards
            current_bal = acc_info['balance']
            balances = []
            # Sort descending to calculate backwards
            acc_txs_desc = acc_txs.sort_values('timestamp', ascending=False)
            for _, row in acc_txs_desc.iterrows():
                balances.append((row['timestamp'], current_bal))
                # Reverse the transaction effect to find previous balance
                if row['type'] == 'DEBIT':
                    current_bal += row['amount']
                elif row['type'] == 'CREDIT':
                    current_bal -= row['amount']
                # Transfers depend on direction, simplified here
            
            acc_bal_df = pd.DataFrame(balances, columns=['timestamp', 'balance']).sort_values('timestamp')
            acc_bal_df['Account'] = acc_info['name']
            balance_chart_data.append(acc_bal_df)
        
        if balance_chart_data:
            df_balances = pd.concat(balance_chart_data)
            fig_line = px.line(
                df_balances, 
                x='timestamp', 
                y='balance', 
                color='Account',
                labels={'balance': 'Estimated Balance ($)', 'timestamp': 'Date'}
            )
            fig_line.update_layout(margin=dict(t=20, b=20, l=20, r=20), height=350)
            st.plotly_chart(fig_line, use_container_width=True)
        else:
            st.info("No balance data available for selected filters.")

    # Visualizations Row 2
    st.markdown("### 📅 Daily Transaction Volume & Anomaly Overlay")
    daily_vol = filtered_df.groupby(filtered_df['timestamp'].dt.date).agg(
        total_amount=('amount', 'sum'),
        tx_count=('transaction_id', 'count'),
        anomaly_count=('is_anomaly', 'sum')
    ).reset_index()
    
    fig_bar = go.Figure()
    fig_bar.add_trace(go.Bar(
        x=daily_vol['timestamp'],
        y=daily_vol['total_amount'],
        name='Total Volume ($)',
        marker_color='rgb(55, 83, 109)'
    ))
    fig_bar.add_trace(go.Scatter(
        x=daily_vol['timestamp'],
        y=daily_vol['anomaly_count'] * (daily_vol['total_amount'].max() / (daily_vol['anomaly_count'].max() + 1)), # Scale for visibility
        name='Anomaly Count (Scaled)',
        line=dict(color='firebrick', width=2, dash='dot'),
        yaxis='y2'
    ))
    
    fig_bar.update_layout(
        yaxis=dict(title='Total Volume ($)'),
        yaxis2=dict(
            title='Anomaly Count',
            overlaying='y',
            side='right'
        ),
        margin=dict(t=20, b=20, l=20, r=20),
        height=300,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    st.plotly_chart(fig_bar, use_container_width=True)

# --- TAB 2: TRANSACTION LEDGER ---
with tab_ledger:
    st.subheader("Comprehensive Transaction Ledger")
    st.markdown("Search, filter, and audit all multi-account transactions ingested from the B2B API.")

    # Ledger Filters
    col_l1, col_l2, col_l3 = st.columns([2, 1, 1])
    with col_l1:
        search_query = st.text_input("🔍 Search by Merchant, ID, or Account", "")
    with col_l2:
        type_filter = st.multiselect("Transaction Type", ["DEBIT", "CREDIT", "TRANSFER"], default=["DEBIT", "CREDIT", "TRANSFER"])
    with col_l3:
        anomaly_filter = st.selectbox("Anomaly Status", ["All Transactions", "Anomalies Only", "Clean Transactions Only"])

    # Apply Ledger Filters
    ledger_df = df_processed.copy()
    if search_query:
        ledger_df = ledger_df[
            ledger_df['merchant'].str.contains(search_query, case=False) |
            ledger_df['transaction_id'].str.contains(search_query, case=False) |
            ledger_df['account_name'].str.contains(search_query, case=False)
        ]
    ledger_df = ledger_df[ledger_df['type'].isin(type_filter)]
    
    if anomaly_filter == "Anomalies Only":
        ledger_df = ledger_df[ledger_df['is_anomaly'] == True]
    elif anomaly_filter == "Clean Transactions Only":
        ledger_df = ledger_df[ledger_df['is_anomaly'] == False]

    # Format Ledger for Display
    display_df = ledger_df[[
        'transaction_id', 'timestamp', 'account_name', 'account_type', 
        'merchant', 'mcc', 'category', 'type', 'amount', 'anomaly_score', 'flag_reasons_str'
    ]].copy()
    
    display_df['amount'] = display_df['amount'].map('${:,.2f}'.format)
    display_df['timestamp'] = display_df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')

    # Highlight anomalies in dataframe
    def highlight_anomalies(row):
        score = row['anomaly_score']
        if score >= 50:
            return ['background-color: #ffcccc'] * len(row)
        elif score > 0:
            return ['background-color: #fff0b3'] * len(row)
        return [''] * len(row)

    st.dataframe(
        display_df.style.apply(highlight_anomalies, axis=1),
        use_container_width=True,
        height=500
    )

    # Export Options
    csv = ledger_df.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Export Filtered Ledger to CSV",
        data=csv,
        file_name=f"b2b_transactions_export_{datetime.now().strftime('%Y%m%d')}.csv",
        mime='text/csv',
    )

# --- TAB 3: ANOMALY INVESTIGATION CENTER ---
with tab_anomalies:
    st.subheader("🚨 Treasury Risk & Anomaly Investigation")
    st.markdown("Deep-dive analysis of flagged transactions requiring compliance review or treasury approval.")

    anomalies_only = df_processed[df_processed['is_anomaly'] == True].sort_values(by='anomaly_score', ascending=False)

    if anomalies_only.empty:
        st.success("✅ No anomalies detected in the current transaction batch.")
    else:
        col_an1, col_an2 = st.columns([1, 2])
        
        with col_an1:
            st.markdown("### 🚩 Flagged Queue")
            selected_tx_id = st.selectbox(
                "Select Transaction to Investigate",
                options=anomalies_only['transaction_id'].tolist(),
                format_func=lambda x: f"{x} - {anomalies_only[anomalies_only['transaction_id'] == x]['merchant'].values[0]} (${anomalies_only[anomalies_only['transaction_id'] == x]['amount'].values[0]:,.2f})"
            )
            
            # Quick stats on anomalies
            st.info(f"Total Flagged: {len(anomalies_only)} transactions\n\n"
                    f"• Duplicates: {len(anomalies_only[anomalies_only['is_duplicate']])}\n"
                    f"• High-Value: {len(anomalies_only[anomalies_only['is_high_value']])}\n"
                    f"• Velocity Alerts: {len(anomalies_only[anomalies_only['is_velocity_anomaly']])}")

        with col_an2:
            st.markdown("### 🔍 Investigation Details")
            tx_detail = anomalies_only[anomalies_only['transaction_id'] == selected_tx_id].iloc[0]
            
            # Risk Score Indicator
            score = tx_detail['anomaly_score']
            if score >= 50:
                severity = "🔴 HIGH RISK"
                color = "red"
            else:
                severity = "🟡 MEDIUM RISK"
                color = "orange"
                
            st.markdown(f"**Risk Level:** <span style='color:{color}; font-weight:bold; font-size:1.2em;'>{severity} (Score: {score}/100)</span>", unsafe_allow_html=True)
            
            # Detail Card
            with st.container():
                st.markdown(f"""
                | Field | Value |
                | --- | --- |
                | **Transaction ID** | `{tx_detail['transaction_id']}` |
                | **Account** | {tx_detail['account_name']} ({tx_detail['account_type']}) |
                | **Timestamp** | {tx_detail['timestamp'].strftime('%Y-%m-%d %H:%M:%S')} |
                | **Merchant** | **{tx_detail['merchant']}** |
                | **MCC / Category** | {tx_detail['mcc']} - {tx_detail['category']} |
                | **Type** | `{tx_detail['type']}` |
                | **Amount** | <span style='font-size:1.1em; font-weight:bold; color:{"green" if tx_detail["type"] == "CREDIT" else "black"};'>${tx_detail['amount']:,.2f}</span> |
                """, unsafe_allow_html=True)
                
                st.markdown("#### 🚨 Flagged Reasons:")
                for reason in tx_detail['flag_reasons']:
                    st.markdown(f"- `{reason}`")

            # Action Buttons
            st.markdown("---")
            st.markdown("#### Treasury Action Panel")
            act_col1, act_col2, act_col3 = st.columns(3)
            with act_col1:
                if st.button("✅ Approve & Clear Flag", key="approve_btn"):
                    st.success(f"Transaction {selected_tx_id} approved.")
            with act_col2:
                if st.button("🛑 Freeze Account / Hold", key="freeze_btn"):
                    st.error(f"Account {tx_detail['account_id']} frozen. Transaction held.")
            with act_col3:
                if st.button("📧 Escalate to Auditor", key="escalate_btn"):
                    st.warning(f"Escalation email sent to compliance team.")

# --- TAB 4: MCC & CATEGORIZATION RULES ---
with tab_rules:
    st.subheader("🛠️ Merchant Category Code (MCC) & Rule Configuration")
    st.markdown("Customize how the B2B engine maps MCCs to corporate expense categories and adjust risk parameters.")

    # Display current rules
    st.markdown("### Current MCC Mappings")
    
    mcc_data = []
    for code, info in st.session_state['mcc_custom_rules'].items():
        mcc_data.append({
            "MCC Code": code,
            "Standard Name": info["name"],
            "Assigned Category": info["category"]
        })
    df_mcc_rules = pd.DataFrame(mcc_data)
    
    # Allow editing of categories
    edited_mcc_df = st.data_editor(
        df_mcc_rules,
        column_config={
            "Assigned Category": st.column_config.SelectboxColumn(
                "Assigned Category",
                help="The corporate category this MCC maps to",
                width="medium",
                options=[
                    "Groceries & Food", "Dining & Entertainment", "Utilities & SaaS", 
                    "Logistics & Travel", "Treasury & Cash", "Investments", 
                    "Healthcare & Benefits", "Business Operations", "IT Infrastructure", 
                    "Professional Services", "Taxes & Fees"
                ],
                required=True,
            )
        },
        disabled=["MCC Code", "Standard Name"],
        key="mcc_editor"
    )

    # Save Rules Button
    if st.button("💾 Save & Apply Custom MCC Rules"):
        # Reconstruct the MCC map from the editor
        new_mcc_map = {}
        for _, row in edited_mcc_df.iterrows():
            new_mcc_map[row["MCC Code"]] = {
                "name": row["Standard Name"],
                "category": row["Assigned Category"]
            }
        st.session_state['mcc_custom_rules'] = new_mcc_map
        st.success("MCC rules updated successfully! Re-processing transactions...")
        # Update raw data categories based on new rules
        for tx in st.session_state['raw_data']:
            mcc = tx['mcc']
            if mcc in new_mcc_map:
                tx['category'] = new_mcc_map[mcc]['category']
        st.rerun()

    # Developer API Payload Preview
    st.markdown("---")
    st.markdown("### 💻 Developer API Payload Preview")
    st.markdown("This is the raw JSON payload ingested from the B2B API before processing.")
    st.json(st.session_state['raw_data'][:3]) # Show first 3 raw transactions as sample