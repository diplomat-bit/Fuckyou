import streamlit as pd
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import io

# Set page configuration
st.set_page_config(
    page_title="Broker Compliance Trade Auditor",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional styling
st.markdown("""
    <style>
    .main-header {
        font-size: 2.2rem;
        color: #1E3A8A;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #4B5563;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #F3F4F6;
        padding: 1.25rem;
        border-radius: 0.5rem;
        border-left: 5px solid #3B82F6;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .metric-card-viol {
        background-color: #FEF2F2;
        padding: 1.25rem;
        border-radius: 0.5rem;
        border-left: 5px solid #EF4444;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .metric-title {
        font-size: 0.9rem;
        color: #6B7280;
        text-transform: uppercase;
        font-weight: bold;
    }
    .metric-value {
        font-size: 1.8rem;
        color: #111827;
        font-weight: bold;
    }
    </style>
""", unsafe_allow_html=True)

# --- MOCK DATA GENERATION ---
@st.cache_data
def generate_mock_data():
    np.random.seed(42)
    base_time = datetime.now() - timedelta(days=10)
    
    # Generate 500 random trades
    symbols = ["AAPL", "MSFT", "TSLA", "AMZN", "NVDA", "GOOGL", "META", "NFLX", "AMD", "BABA"]
    accounts = [f"ACC-{i:04d}" for i in range(101, 125)]
    traders = [f"TRD-{i:03d}" for i in range(11, 25)]
    
    trades = []
    for i in range(1000):
        trade_id = f"TXN-{i:06d}"
        timestamp = base_time + timedelta(
            days=np.random.randint(0, 10),
            hours=np.random.randint(9, 16),
            minutes=np.random.randint(0, 60),
            seconds=np.random.randint(0, 60)
        )
        symbol = np.random.choice(symbols)
        side = np.random.choice(["BUY", "SELL"])
        qty = int(np.random.exponential(scale=5000)) + 10
        price = round(float(np.random.uniform(50, 500)), 2)
        account = np.random.choice(accounts)
        trader = np.random.choice(traders)
        
        trades.append({
            "Trade ID": trade_id,
            "Timestamp": timestamp,
            "Account ID": account,
            "Trader ID": trader,
            "Symbol": symbol,
            "Side": side,
            "Quantity": qty,
            "Price": price,
            "Total Value": round(qty * price, 2)
        })
        
    trades_df = pd.DataFrame(trades)
    
    # Inject Wash Trading Violations (Same account, same symbol, opposite side, close timestamp, close price)
    wash_time_1 = base_time + timedelta(days=2, hours=10, minutes=15)
    trades_df = pd.concat([trades_df, pd.DataFrame([
        {"Trade ID": "WSH-001", "Timestamp": wash_time_1, "Account ID": "ACC-0101", "Trader ID": "TRD-011", "Symbol": "AAPL", "Side": "BUY", "Quantity": 10000, "Price": 150.00, "Total Value": 1500000.00},
        {"Trade ID": "WSH-002", "Timestamp": wash_time_1 + timedelta(seconds=15), "Account ID": "ACC-0101", "Trader ID": "TRD-011", "Symbol": "AAPL", "Side": "SELL", "Quantity": 10000, "Price": 150.05, "Total Value": 1500500.00},
        {"Trade ID": "WSH-003", "Timestamp": wash_time_1 + timedelta(minutes=2), "Account ID": "ACC-0102", "Trader ID": "TRD-012", "Symbol": "TSLA", "Side": "SELL", "Quantity": 5000, "Price": 220.00, "Total Value": 1100000.00},
        {"Trade ID": "WSH-004", "Timestamp": wash_time_1 + timedelta(minutes=2, seconds=45), "Account ID": "ACC-0102", "Trader ID": "TRD-012", "Symbol": "TSLA", "Side": "BUY", "Quantity": 5000, "Price": 220.10, "Total Value": 1100500.00}
    ])], ignore_index=True)

    # Inject Insider Trading Violations (Trades right before major corporate announcements)
    announcements = [
        {"Symbol": "NVDA", "Announcement Date": base_time + timedelta(days=5, hours=17), "Event": "Earnings Release - Beat expectations by 25%"},
        {"Symbol": "AMZN", "Announcement Date": base_time + timedelta(days=7, hours=16, minutes=30), "Event": "Acquisition of Robotics Firm"},
        {"Symbol": "NFLX", "Announcement Date": base_time + timedelta(days=3, hours=8), "Event": "CEO Resignation Announcement"}
    ]
    announcements_df = pd.DataFrame(announcements)
    
    # Inject suspicious trades before announcements
    trades_df = pd.concat([trades_df, pd.DataFrame([
        {"Trade ID": "INS-001", "Timestamp": base_time + timedelta(days=5, hours=11), "Account ID": "ACC-0115", "Trader ID": "TRD-019", "Symbol": "NVDA", "Side": "BUY", "Quantity": 45000, "Price": 420.00, "Total Value": 18900000.00},
        {"Trade ID": "INS-002", "Timestamp": base_time + timedelta(days=7, hours=10), "Account ID": "ACC-0120", "Trader ID": "TRD-022", "Symbol": "AMZN", "Side": "BUY", "Quantity": 30000, "Price": 130.00, "Total Value": 3900000.00},
        {"Trade ID": "INS-003", "Timestamp": base_time + timedelta(days=2, hours=15), "Account ID": "ACC-0105", "Trader ID": "TRD-014", "Symbol": "NFLX", "Side": "SELL", "Quantity": 25000, "Price": 380.00, "Total Value": 9500000.00}
    ])], ignore_index=True)

    # Restricted Stock List
    restricted_list = [
        {"Symbol": "MSFT", "Reason": "M&A Advisory Role", "Restricted From": base_time, "Restricted To": base_time + timedelta(days=15)},
        {"Symbol": "BABA", "Reason": "Regulatory Investigation", "Restricted From": base_time + timedelta(days=2), "Restricted To": base_time + timedelta(days=8)},
        {"Symbol": "GOOGL", "Reason": "Underwriting Lock-up", "Restricted From": base_time + timedelta(days=4), "Restricted To": base_time + timedelta(days=12)}
    ]
    restricted_df = pd.DataFrame(restricted_list)

    # Inject Restricted List Violations
    trades_df = pd.concat([trades_df, pd.DataFrame([
        {"Trade ID": "RST-001", "Timestamp": base_time + timedelta(days=1), "Account ID": "ACC-0108", "Trader ID": "TRD-015", "Symbol": "MSFT", "Side": "BUY", "Quantity": 1500, "Price": 320.00, "Total Value": 480000.00},
        {"Trade ID": "RST-002", "Timestamp": base_time + timedelta(days=5), "Account ID": "ACC-0112", "Trader ID": "TRD-017", "Symbol": "BABA", "Side": "SELL", "Quantity": 8000, "Price": 85.00, "Total Value": 680000.00}
    ])], ignore_index=True)

    # Sort trades chronologically
    trades_df = trades_df.sort_values(by="Timestamp").reset_index(drop=True)
    return trades_df, restricted_df, announcements_df

# Load initial data
trades_df, restricted_df, announcements_df = generate_mock_data()

# --- SIDEBAR NAVIGATION ---
st.sidebar.image("https://img.icons8.com/fluency/96/000000/shield-with-key.png", width=80)
st.sidebar.title("Compliance Suite")
st.sidebar.markdown("---")

app_mode = st.sidebar.radio(
    "Select Compliance Application",
    [
        "🛡️ 1. Wash Trading Detector",
        "📈 2. Insider Trading Scanner",
        "🛑 3. Order Size Limit Auditor",
        "🚫 4. Restricted List Screener"
    ]
)

st.sidebar.markdown("---")
st.sidebar.subheader("Data Source Settings")
data_source = st.sidebar.selectbox("Data Source", ["Use Simulated Live Feed", "Upload Custom Trade Log"])

uploaded_file = None
if data_source == "Upload Custom Trade Log":
    uploaded_file = st.sidebar.file_uploader("Upload CSV File", type=["csv"])
    st.sidebar.info("Expected columns: Trade ID, Timestamp, Account ID, Trader ID, Symbol, Side, Quantity, Price, Total Value")

# Load custom data if uploaded
if uploaded_file is not None:
    try:
        custom_df = pd.read_csv(uploaded_file)
        custom_df['Timestamp'] = pd.to_datetime(custom_df['Timestamp'])
        trades_df = custom_df
        st.sidebar.success("Custom data loaded successfully!")
    except Exception as e:
        st.sidebar.error(f"Error loading file: {e}. Using simulated data instead.")

# --- APP 1: WASH TRADING DETECTOR ---
if app_mode == "🛡️ 1. Wash Trading Detector":
    st.markdown('<div class="main-header">Wash Trading Detector</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Scans trade logs for potential wash trading (same account/related accounts buying and selling the same security at similar prices within a short time window).</div>', unsafe_allow_html=True)

    # Parameters
    col1, col2, col3 = st.columns(3)
    with col1:
        time_window = st.slider("Time Window (Minutes)", min_value=1, max_value=60, value=5, help="Maximum time difference between buy and sell trades.")
    with col2:
        price_tolerance = st.slider("Price Difference Tolerance (%)", min_value=0.0, max_value=5.0, value=0.5, step=0.1, help="Maximum price variance between buy and sell trades.")
    with col3:
        min_qty_match = st.slider("Quantity Match Tolerance (%)", min_value=0, max_value=20, value=5, help="Allowed difference in quantity between buy and sell trades.")

    # Detection Logic
    st.write("### Analysis Results")
    
    # Sort trades for window analysis
    df_sorted = trades_df.sort_values(by=["Account ID", "Symbol", "Timestamp"]).copy()
    
    violations = []
    
    for i in range(len(df_sorted)):
        current_trade = df_sorted.iloc[i]
        
        # Look ahead for matching trades within the time window
        for j in range(i + 1, len(df_sorted)):
            next_trade = df_sorted.iloc[j]
            
            # Check if same account and same symbol
            if (current_trade["Account ID"] != next_trade["Account ID"]) or (current_trade["Symbol"] != next_trade["Symbol"]):
                break
                
            # Check time window
            time_diff = (next_trade["Timestamp"] - current_trade["Timestamp"]).total_seconds() / 60.0
            if time_diff > time_window:
                break
                
            # Check opposite side
            if current_trade["Side"] != next_trade["Side"]:
                # Check price tolerance
                price_diff_pct = abs(current_trade["Price"] - next_trade["Price"]) / current_trade["Price"] * 100.0
                # Check quantity tolerance
                qty_diff_pct = abs(current_trade["Quantity"] - next_trade["Quantity"]) / current_trade["Quantity"] * 100.0
                
                if price_diff_pct <= price_tolerance and qty_diff_pct <= min_qty_match:
                    violations.append({
                        "Account ID": current_trade["Account ID"],
                        "Symbol": current_trade["Symbol"],
                        "Trade 1 ID": current_trade["Trade ID"],
                        "Trade 1 Side": current_trade["Side"],
                        "Trade 1 Time": current_trade["Timestamp"],
                        "Trade 1 Qty": current_trade["Quantity"],
                        "Trade 1 Price": current_trade["Price"],
                        "Trade 2 ID": next_trade["Trade ID"],
                        "Trade 2 Side": next_trade["Side"],
                        "Trade 2 Time": next_trade["Timestamp"],
                        "Trade 2 Qty": next_trade["Quantity"],
                        "Trade 2 Price": next_trade["Price"],
                        "Time Diff (Sec)": int(time_diff * 60),
                        "Price Diff (%)": round(price_diff_pct, 2)
                    })

    viol_df = pd.DataFrame(violations)

    # Metrics
    m1, m2, m3 = st.columns(3)
    with m1:
        st.markdown(f'<div class="metric-card"><div class="metric-title">Total Trades Audited</div><div class="metric-value">{len(trades_df)}</div></div>', unsafe_allow_html=True)
    with m2:
        st.markdown(f'<div class="metric-card-viol"><div class="metric-title">Wash Trade Alerts</div><div class="metric-value">{len(viol_df)}</div></div>', unsafe_allow_html=True)
    with m3:
        wash_volume = viol_df["Trade 1 Qty"].sum() * 2 if len(viol_df) > 0 else 0
        st.markdown(f'<div class="metric-card-viol"><div class="metric-title">Flagged Volume (Shares)</div><div class="metric-value">{wash_volume:,}</div></div>', unsafe_allow_html=True)

    st.markdown("---")

    if len(viol_df) > 0:
        st.warning(f"⚠️ Detected {len(viol_df)} potential wash trading patterns based on current parameters.")
        st.dataframe(viol_df, use_container_width=True)
        
        # Download Report
        csv = viol_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Wash Trading Audit Report",
            data=csv,
            file_name="wash_trading_audit_report.csv",
            mime="text/csv"
        )
        
        # Visualization
        st.write("### Wash Trading Activity Timeline")
        fig = px.scatter(
            viol_df, 
            x="Trade 1 Time", 
            y="Symbol", 
            size="Trade 1 Qty", 
            color="Account ID",
            hover_data=["Account ID", "Trade 1 ID", "Trade 2 ID", "Price Diff (%)"],
            title="Flagged Wash Trades by Symbol and Account"
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.success("✅ No wash trading patterns detected with the current parameters.")

# --- APP 2: INSIDER TRADING SCANNER ---
elif app_mode == "📈 2. Insider Trading Scanner":
    st.markdown('<div class="main-header">Insider Trading & MNPI Scanner</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Correlates trade logs with corporate announcement dates to detect suspicious trading activity prior to material non-public information (MNPI) releases.</div>', unsafe_allow_html=True)

    # Parameters
    col1, col2 = st.columns(2)
    with col1:
        lookback_days = st.slider("Lookback Window (Days before announcement)", min_value=1, max_value=10, value=3)
    with col2:
        min_trade_value = st.number_input("Minimum Trade Value to Flag ($)", min_value=10000, max_value=50000000, value=100000, step=50000)

    # Display Corporate Announcements
    with st.expander("📅 View Corporate Announcements Calendar"):
        st.dataframe(announcements_df, use_container_width=True)

    # Detection Logic
    suspicious_trades = []
    
    for _, ann in announcements_df.iterrows():
        ann_symbol = ann["Symbol"]
        ann_date = pd.to_datetime(ann["Announcement Date"])
        start_window = ann_date - timedelta(days=lookback_days)
        
        # Filter trades in the symbol within the lookback window before the announcement
        symbol_trades = trades_df[
            (trades_df["Symbol"] == ann_symbol) & 
            (trades_df["Timestamp"] >= start_window) & 
            (trades_df["Timestamp"] <= ann_date) &
            (trades_df["Total Value"] >= min_trade_value)
        ]
        
        for _, trade in symbol_trades.iterrows():
            suspicious_trades.append({
                "Trade ID": trade["Trade ID"],
                "Timestamp": trade["Timestamp"],
                "Account ID": trade["Account ID"],
                "Trader ID": trade["Trader ID"],
                "Symbol": trade["Symbol"],
                "Side": trade["Side"],
                "Quantity": trade["Quantity"],
                "Price": trade["Price"],
                "Total Value": trade["Total Value"],
                "Announcement Event": ann["Event"],
                "Announcement Date": ann_date,
                "Hours Before Announcement": round((ann_date - trade["Timestamp"]).total_seconds() / 3600.0, 1)
            })
            
    susp_df = pd.DataFrame(suspicious_trades)

    # Metrics
    m1, m2, m3 = st.columns(3)
    with m1:
        st.markdown(f'<div class="metric-card"><div class="metric-title">Announcements Monitored</div><div class="metric-value">{len(announcements_df)}</div></div>', unsafe_allow_html=True)
    with m2:
        st.markdown(f'<div class="metric-card-viol"><div class="metric-title">Suspicious Trades Flagged</div><div class="metric-value">{len(susp_df)}</div></div>', unsafe_allow_html=True)
    with m3:
        total_susp_val = susp_df["Total Value"].sum() if len(susp_df) > 0 else 0
        st.markdown(f'<div class="metric-card-viol"><div class="metric-title">Total Flagged Value</div><div class="metric-value">${total_susp_val:,.2f}</div></div>', unsafe_allow_html=True)

    st.markdown("---")

    if len(susp_df) > 0:
        st.warning(f"⚠️ Detected {len(susp_df)} trades executed shortly before major corporate announcements.")
        st.dataframe(susp_df, use_container_width=True)
        
        # Download Report
        csv = susp_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Insider Trading Audit Report",
            data=csv,
            file_name="insider_trading_audit_report.csv",
            mime="text/csv"
        )
        
        # Visualization
        st.write("### Timeline of Suspicious Trades vs Announcements")
        fig = px.scatter(
            susp_df,
            x="Timestamp",
            y="Symbol",
            size="Total Value",
            color="Side",
            hover_data=["Account ID", "Announcement Event", "Hours Before Announcement"],
            title="Suspicious Trades Leading Up to Announcements"
        )
        # Add vertical lines for announcements
        for _, ann in announcements_df.iterrows():
            fig.add_vline(x=ann["Announcement Date"], line_dash="dash", line_color="red", annotation_text=f"Ann: {ann['Symbol']}")
            
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.success("✅ No suspicious trading patterns detected prior to corporate announcements.")

# --- APP 3: ORDER SIZE LIMIT AUDITOR ---
elif app_mode == "🛑 3. Order Size Limit Auditor":
    st.markdown('<div class="main-header">Order Size & Value Limit Auditor</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Audits trades against maximum order size (quantity) and maximum order value (notional) limits to prevent fat-finger errors or unauthorized trading sizes.</div>', unsafe_allow_html=True)

    # Parameters
    col1, col2 = st.columns(2)
    with col1:
        max_qty_limit = st.number_input("Maximum Allowed Quantity (Shares)", min_value=1000, max_value=1000000, value=25000, step=5000)
    with col2:
        max_value_limit = st.number_input("Maximum Allowed Value ($)", min_value=10000, max_value=100000000, value=1000000, step=100000)

    # Detection Logic
    qty_violations = trades_df[trades_df["Quantity"] > max_qty_limit].copy()
    qty_violations["Violation Type"] = "Quantity Limit Exceeded"
    qty_violations["Threshold"] = max_qty_limit
    qty_violations["Excess Amount"] = qty_violations["Quantity"] - max_qty_limit

    val_violations = trades_df[trades_df["Total Value"] > max_value_limit].copy()
    val_violations["Violation Type"] = "Value Limit Exceeded"
    val_violations["Threshold"] = max_value_limit
    val_violations["Excess Amount"] = val_violations["Total Value"] - max_value_limit

    all_limit_violations = pd.concat([qty_violations, val_violations]).drop_duplicates(subset=["Trade ID"])

    # Metrics
    m1, m2, m3 = st.columns(3)
    with m1:
        st.markdown(f'<div class="metric-card"><div class="metric-title">Total Trades Audited</div><div class="metric-value">{len(trades_df)}</div></div>', unsafe_allow_html=True)
    with m2:
        st.markdown(f'<div class="metric-card-viol"><div class="metric-title">Quantity Violations</div><div class="metric-value">{len(qty_violations)}</div></div>', unsafe_allow_html=True)
    with m3:
        st.markdown(f'<div class="metric-card-viol"><div class="metric-title">Value Violations</div><div class="metric-value">{len(val_violations)}</div></div>', unsafe_allow_html=True)

    st.markdown("---")

    if len(all_limit_violations) > 0:
        st.warning(f"⚠️ Detected {len(all_limit_violations)} unique trades exceeding pre-configured limits.")
        st.dataframe(all_limit_violations, use_container_width=True)
        
        # Download Report
        csv = all_limit_violations.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Limit Violations Report",
            data=csv,
            file_name="limit_violations_report.csv",
            mime="text/csv"
        )
        
        # Visualization
        st.write("### Distribution of Trade Values & Limit Violations")
        fig = px.histogram(
            trades_df, 
            x="Total Value", 
            nbins=50, 
            title="Trade Value Distribution with Limit Threshold",
            color_discrete_sequence=["#3B82F6"]
        )
        fig.add_vline(x=max_value_limit, line_dash="dash", line_color="red", annotation_text="Max Value Limit")
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.success("✅ All trades are within the configured quantity and value limits.")

# --- APP 4: RESTRICTED LIST SCREENER ---
elif app_mode == "🚫 4. Restricted List Screener":
    st.markdown('<div class="main-header">Restricted List & Sanctions Screener</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Cross-references trade logs against dynamic restricted stock lists, blacklisted entities, or grey lists during specific restriction windows.</div>', unsafe_allow_html=True)

    # Dynamic Restricted List Editor
    st.write("### 📋 Active Restricted Stock List")
    edited_restricted_df = st.data_editor(
        restricted_df, 
        num_rows="dynamic", 
        use_container_width=True,
        column_config={
            "Restricted From": st.column_config.DatetimeColumn("Restricted From"),
            "Restricted To": st.column_config.DatetimeColumn("Restricted To")
        }
    )

    # Detection Logic
    restricted_violations = []
    
    for _, trade in trades_df.iterrows():
        trade_symbol = trade["Symbol"]
        trade_time = pd.to_datetime(trade["Timestamp"])
        
        # Find if symbol is on restricted list
        matches = edited_restricted_df[edited_restricted_df["Symbol"] == trade_symbol]
        
        for _, match in matches.iterrows():
            from_date = pd.to_datetime(match["Restricted From"])
            to_date = pd.to_datetime(match["Restricted To"])
            
            if from_date <= trade_time <= to_date:
                restricted_violations.append({
                    "Trade ID": trade["Trade ID"],
                    "Timestamp": trade["Timestamp"],
                    "Account ID": trade["Account ID"],
                    "Trader ID": trade["Trader ID"],
                    "Symbol": trade["Symbol"],
                    "Side": trade["Side"],
                    "Quantity": trade["Quantity"],
                    "Price": trade["Price"],
                    "Total Value": trade["Total Value"],
                    "Restriction Reason": match["Reason"],
                    "Restricted From": from_date,
                    "Restricted To": to_date
                })
                
    rest_viol_df = pd.DataFrame(restricted_violations)

    # Metrics
    m1, m2, m3 = st.columns(3)
    with m1:
        st.markdown(f'<div class="metric-card"><div class="metric-title">Restricted Symbols</div><div class="metric-value">{len(edited_restricted_df["Symbol"].unique())}</div></div>', unsafe_allow_html=True)
    with m2:
        st.markdown(f'<div class="metric-card-viol"><div class="metric-title">Restricted Trade Violations</div><div class="metric-value">{len(rest_viol_df)}</div></div>', unsafe_allow_html=True)
    with m3:
        viol_value = rest_viol_df["Total Value"].sum() if len(rest_viol_df) > 0 else 0
        st.markdown(f'<div class="metric-card-viol"><div class="metric-title">Violating Trade Value</div><div class="metric-value">${viol_value:,.2f}</div></div>', unsafe_allow_html=True)

    st.markdown("---")

    if len(rest_viol_df) > 0:
        st.error(f"🚨 Detected {len(rest_viol_df)} trades executed on restricted securities during active restriction periods!")
        st.dataframe(rest_viol_df, use_container_width=True)
        
        # Download Report
        csv = rest_viol_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Restricted List Violations Report",
            data=csv,
            file_name="restricted_list_violations_report.csv",
            mime="text/csv"
        )
        
        # Visualization
        st.write("### Restricted Violations by Reason")
        fig = px.pie(
            rest_viol_df, 
            names="Restriction Reason", 
            values="Total Value", 
            title="Value of Violations by Restriction Reason",
            color_discrete_sequence=px.colors.sequential.RdBu
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.success("✅ No restricted list violations detected.")