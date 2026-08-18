import streamlit as pd
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import io

# Set page configuration
st.set_page_config(
    page_title="B2B Cash Flow Stress Tester",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- SESSION STATE INITIALIZATION ---
if 'cash_balances' not in st.session_state:
    st.session_state.cash_balances = pd.DataFrame([
        {"Account Name": "Operating Checking", "Institution": "Chase", "Balance": 250000.0},
        {"Account Name": "Payroll Savings", "Institution": "SVB", "Balance": 120000.0},
        {"Account Name": "Treasury Account", "Institution": "Fidelity", "Balance": 450000.0}
    ])

if 'brokerage_holdings' not in st.session_state:
    st.session_state.brokerage_holdings = pd.DataFrame([
        {"Asset Name": "US Treasury Bills", "Category": "Cash Equivalents", "Value": 300000.0, "Liquidity Days": 1},
        {"Asset Name": "S&P 500 Index Fund", "Category": "Equities", "Value": 150000.0, "Liquidity Days": 3},
        {"Asset Name": "Corporate Bonds (A-Rated)", "Category": "Fixed Income", "Value": 100000.0, "Liquidity Days": 5}
    ])

if 'credit_limits' not in st.session_state:
    st.session_state.credit_limits = pd.DataFrame([
        {"Lender": "Amex Business", "Facility Type": "Revolving Card", "Limit": 100000.0, "Utilized": 20000.0},
        {"Lender": "Bridge Bank", "Facility Type": "Working Capital Line", "Limit": 250000.0, "Utilized": 50000.0}
    ])

if 'transactions' not in st.session_state:
    # Generate 90 days of realistic historical transactions
    np.random.seed(42)
    dates = [datetime.now() - timedelta(days=i) for i in range(90)]
    dates.reverse()
    
    categories = ["SaaS Revenue", "Enterprise Contract", "Payroll", "Cloud Infrastructure", "Marketing", "Office Rent", "Consulting Fees"]
    types = ["Inflow", "Inflow", "Outflow", "Outflow", "Outflow", "Outflow", "Outflow"]
    amounts = [12000, 45000, -35000, -8000, -12000, -6000, -4000]
    
    mock_tx = []
    for i, date in enumerate(dates):
        # Weekly payroll
        if i % 7 == 0:
            mock_tx.append({
                "Date": date.strftime("%Y-%m-%d"),
                "Description": "Payroll Processing",
                "Category": "Payroll",
                "Type": "Outflow",
                "Amount": -32000.0
            })
        # Monthly Rent
        if i % 30 == 0:
            mock_tx.append({
                "Date": date.strftime("%Y-%m-%d"),
                "Description": "HQ Office Rent",
                "Category": "Office Rent",
                "Type": "Outflow",
                "Amount": -7500.0
            })
        # Random daily transactions
        if np.random.rand() > 0.4:
            idx = np.random.randint(0, len(categories))
            amt = amounts[idx] * np.random.uniform(0.8, 1.2)
            mock_tx.append({
                "Date": date.strftime("%Y-%m-%d"),
                "Description": f"Tx: {categories[idx]}",
                "Category": categories[idx],
                "Type": "Inflow" if amt > 0 else "Outflow",
                "Amount": round(amt, 2)
            })
            
    st.session_state.transactions = pd.DataFrame(mock_tx)

# --- HELPER FUNCTIONS ---
def calculate_metrics(cash_df, brokerage_df, credit_df):
    total_cash = cash_df["Balance"].sum()
    total_brokerage = brokerage_df["Value"].sum()
    total_credit_limit = credit_df["Limit"].sum()
    total_credit_utilized = credit_df["Utilized"].sum()
    available_credit = max(0.0, total_credit_limit - total_credit_utilized)
    
    total_liquidity = total_cash + total_brokerage + available_credit
    return total_cash, total_brokerage, available_credit, total_liquidity

# --- SIDEBAR / CONTROLS ---
st.sidebar.title("🛠️ Stress Test Parameters")

st.sidebar.subheader("Projection Settings")
projection_days = st.sidebar.slider("Projection Horizon (Days)", min_value=30, max_value=365, value=90, step=15)

st.sidebar.subheader("Asset Haircuts")
brokerage_haircut = st.sidebar.slider("Brokerage Asset Haircut (%)", min_value=0, max_value=100, value=20, step=5) / 100.0
credit_reduction = st.sidebar.slider("Credit Limit Reduction (%)", min_value=0, max_value=100, value=50, step=5) / 100.0

st.sidebar.subheader("Cash Flow Shocks")
revenue_drop = st.sidebar.slider("Revenue / Inflow Drop (%)", min_value=0, max_value=100, value=30, step=5) / 100.0
expense_spike = st.sidebar.slider("Operating Expense Spike (%)", min_value=0, max_value=100, value=15, step=5) / 100.0
receivables_delay = st.sidebar.slider("Receivables Delay (Days)", min_value=0, max_value=90, value=30, step=5)

# --- MAIN INTERFACE ---
st.title("📊 Corporate Cash Flow Stress Tester")
st.markdown("""
This application evaluates your company's liquidity resilience under severe macroeconomic and operational stress scenarios. 
Adjust the stress parameters in the sidebar to simulate asset haircuts, credit freezes, and cash flow shocks.
""")

# Calculate current baseline metrics
total_cash, total_brokerage, available_credit, total_liquidity = calculate_metrics(
    st.session_state.cash_balances, 
    st.session_state.brokerage_holdings, 
    st.session_state.credit_limits
)

# Calculate stressed metrics
stressed_brokerage = total_brokerage * (1 - brokerage_haircut)
stressed_credit_limit = st.session_state.credit_limits["Limit"].sum() * (1 - credit_reduction)
stressed_available_credit = max(0.0, stressed_credit_limit - st.session_state.credit_limits["Utilized"].sum())
stressed_liquidity = total_cash + stressed_brokerage + stressed_available_credit

# Metric Cards Row
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric(
        label="Total Cash & Equivalents", 
        value=f"${total_cash:,.2f}"
    )
with col2:
    st.metric(
        label="Brokerage Value (Stressed)", 
        value=f"${stressed_brokerage:,.2f}", 
        delta=f"-{brokerage_haircut*100:.0f}% Haircut" if brokerage_haircut > 0 else None,
        delta_color="inverse"
    )
with col3:
    st.metric(
        label="Available Credit (Stressed)", 
        value=f"${stressed_available_credit:,.2f}", 
        delta=f"-{credit_reduction*100:.0f}% Limit Cut" if credit_reduction > 0 else None,
        delta_color="inverse"
    )
with col4:
    st.metric(
        label="Total Stressed Liquidity", 
        value=f"${stressed_liquidity:,.2f}", 
        delta=f"${stressed_liquidity - total_liquidity:,.2f} vs Baseline",
        delta_color="inverse"
    )

# --- TABS SYSTEM ---
tab1, tab2, tab3, tab4 = st.tabs([
    "📈 Liquidity Projection & Runway", 
    "🏦 Asset & Credit Portfolio", 
    "📝 Transaction Ledger", 
    "📋 Stress Test Report"
])

# --- TAB 1: LIQUIDITY PROJECTION ---
with tab1:
    st.header("Liquidity Runway Projection")
    
    # Calculate historical daily averages
    tx_df = st.session_state.transactions.copy()
    tx_df['Date'] = pd.to_datetime(tx_df['Date'])
    
    # Daily averages
    inflows = tx_df[tx_df['Amount'] > 0]['Amount'].sum()
    outflows = tx_df[tx_df['Amount'] < 0]['Amount'].sum()
    total_days_hist = (tx_df['Date'].max() - tx_df['Date'].min()).days or 1
    
    avg_daily_inflow = inflows / total_days_hist
    avg_daily_outflow = abs(outflows) / total_days_hist
    
    # Simulation
    dates_proj = [datetime.now() + timedelta(days=i) for i in range(projection_days)]
    
    # Baseline Projection Arrays
    baseline_cash_path = []
    baseline_total_path = []
    
    # Stressed Projection Arrays
    stressed_cash_path = []
    stressed_total_path = []
    
    # Initial states
    b_cash = total_cash
    b_total = total_liquidity
    
    s_cash = total_cash
    s_total = stressed_liquidity
    
    for day in range(projection_days):
        # Baseline calculations
        b_in = avg_daily_inflow
        b_out = avg_daily_outflow
        
        b_cash += (b_in - b_out)
        b_total += (b_in - b_out)
        
        baseline_cash_path.append(max(0.0, b_cash))
        baseline_total_path.append(max(0.0, b_total))
        
        # Stressed calculations
        # Apply revenue drop
        s_in = avg_daily_inflow * (1 - revenue_drop)
        # Apply receivables delay (0 inflow for the first N days)
        if day < receivables_delay:
            s_in = 0.0
            
        # Apply expense spike
        s_out = avg_daily_outflow * (1 + expense_spike)
        
        s_cash += (s_in - s_out)
        s_total += (s_in - s_out)
        
        stressed_cash_path.append(max(0.0, s_cash))
        stressed_total_path.append(max(0.0, s_total))
        
    # Create Projection DataFrame
    proj_df = pd.DataFrame({
        "Date": dates_proj,
        "Baseline Cash": baseline_cash_path,
        "Baseline Total Liquidity": baseline_total_path,
        "Stressed Cash": stressed_cash_path,
        "Stressed Total Liquidity": stressed_total_path
    })
    
    # Find Runway Days (days until liquidity hits 0)
    baseline_runway = next((i for i, val in enumerate(baseline_total_path) if val <= 0), projection_days)
    stressed_runway = next((i for i, val in enumerate(stressed_total_path) if val <= 0), projection_days)
    
    # Runway Metrics
    r_col1, r_col2, r_col3 = st.columns(3)
    with r_col1:
        st.info(f"**Baseline Runway:** {f'{baseline_runway} Days' if baseline_runway < projection_days else f'{projection_days}+ Days'}")
    with r_col2:
        if stressed_runway < projection_days:
            st.error(f"**Stressed Runway:** {stressed_runway} Days")
        else:
            st.success(f"**Stressed Runway:** {projection_days}+ Days")
    with r_col3:
        runway_delta = stressed_runway - baseline_runway
        st.warning(f"**Runway Reduction:** {abs(runway_delta)} Days shorter" if runway_delta < 0 else "No Runway Reduction")

    # Plotly Chart
    fig = go.Figure()
    
    # Baseline Total Liquidity
    fig.add_trace(go.Scatter(
        x=proj_df["Date"], y=proj_df["Baseline Total Liquidity"],
        mode='lines', name='Baseline Total Liquidity',
        line=dict(color='#2ecc71', width=3)
    ))
    
    # Stressed Total Liquidity
    fig.add_trace(go.Scatter(
        x=proj_df["Date"], y=proj_df["Stressed Total Liquidity"],
        mode='lines', name='Stressed Total Liquidity',
        line=dict(color='#e74c3c', width=3, dash='dash')
    ))
    
    # Baseline Cash Only
    fig.add_trace(go.Scatter(
        x=proj_df["Date"], y=proj_df["Baseline Cash"],
        mode='lines', name='Baseline Cash Only',
        line=dict(color='#27ae60', width=1.5, shape='linear')
    ))
    
    # Stressed Cash Only
    fig.add_trace(go.Scatter(
        x=proj_df["Date"], y=proj_df["Stressed Cash"],
        mode='lines', name='Stressed Cash Only',
        line=dict(color='#c0392b', width=1.5, dash='dot')
    ))
    
    fig.update_layout(
        title="Liquidity Runway Projection (Baseline vs. Stressed)",
        xaxis_title="Date",
        yaxis_title="Liquidity ($)",
        legend=dict(yanchor="top", y=0.99, xanchor="left", x=0.01),
        hovermode="x unified",
        template="plotly_white"
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Projection Data Table
    with st.expander("View Day-by-Day Projection Data"):
        st.dataframe(proj_df.style.format({
            "Baseline Cash": "${:,.2f}",
            "Baseline Total Liquidity": "${:,.2f}",
            "Stressed Cash": "${:,.2f}",
            "Stressed Total Liquidity": "${:,.2f}"
        }))

# --- TAB 2: ASSET & CREDIT PORTFOLIO ---
with tab2:
    st.header("Asset & Credit Portfolio Management")
    st.markdown("Edit your current balances, brokerage holdings, and credit facilities below to update the stress test model.")
    
    col_left, col_right = st.columns(2)
    
    with col_left:
        st.subheader("Cash & Checking Accounts")
        edited_cash = st.data_editor(
            st.session_state.cash_balances, 
            num_rows="dynamic", 
            key="cash_editor"
        )
        if st.button("Save Cash Balances"):
            st.session_state.cash_balances = edited_cash
            st.success("Cash balances updated!")
            st.rerun()
            
        st.subheader("Brokerage Holdings")
        edited_brokerage = st.data_editor(
            st.session_state.brokerage_holdings, 
            num_rows="dynamic", 
            key="brokerage_editor"
        )
        if st.button("Save Brokerage Holdings"):
            st.session_state.brokerage_holdings = edited_brokerage
            st.success("Brokerage holdings updated!")
            st.rerun()

    with col_right:
        st.subheader("Credit Facilities & Debt Limits")
        edited_credit = st.data_editor(
            st.session_state.credit_limits, 
            num_rows="dynamic", 
            key="credit_editor"
        )
        if st.button("Save Credit Facilities"):
            st.session_state.credit_limits = edited_credit
            st.success("Credit facilities updated!")
            st.rerun()
            
        # Asset Allocation Chart
        st.subheader("Asset Allocation Breakdown")
        labels = ['Cash', 'Brokerage', 'Available Credit']
        values = [total_cash, total_brokerage, available_credit]
        
        fig_pie = go.Figure(data=[go.Pie(labels=labels, values=values, hole=.3)])
        fig_pie.update_layout(margin=dict(t=0, b=0, l=0, r=0), height=250)
        st.plotly_chart(fig_pie, use_container_width=True)

# --- TAB 3: TRANSACTION LEDGER ---
with tab3:
    st.header("Historical Transaction Ledger")
    st.markdown("Upload your company's transaction history (CSV format) or edit the generated mock ledger below.")
    
    # File Uploader
    uploaded_file = st.file_uploader("Upload Transaction History CSV", type=["csv"])
    if uploaded_file is not None:
        try:
            uploaded_df = pd.read_csv(uploaded_file)
            # Validate columns
            required_cols = ["Date", "Description", "Category", "Type", "Amount"]
            if all(col in uploaded_df.columns for col in required_cols):
                st.session_state.transactions = uploaded_df
                st.success("Successfully loaded transaction history!")
                st.rerun()
            else:
                st.error(f"CSV must contain the following columns: {', '.join(required_cols)}")
        except Exception as e:
            st.error(f"Error parsing CSV: {e}")
            
    # Transaction Table
    st.subheader("Current Transaction Ledger")
    edited_tx = st.data_editor(
        st.session_state.transactions, 
        num_rows="dynamic", 
        key="tx_editor"
    )
    if st.button("Save Transaction Ledger"):
        st.session_state.transactions = edited_tx
        st.success("Transaction ledger updated!")
        st.rerun()
        
    # Transaction Analytics
    st.subheader("Historical Cash Flow Analysis (Last 90 Days)")
    tx_df = st.session_state.transactions.copy()
    tx_df['Date'] = pd.to_datetime(tx_df['Date'])
    
    # Inflow vs Outflow over time
    tx_grouped = tx_df.groupby([pd.Grouper(key='Date', freq='W'), 'Type'])['Amount'].sum().unstack().fillna(0)
    
    fig_bar = go.Figure()
    if 'Inflow' in tx_grouped.columns:
        fig_bar.add_trace(go.Bar(x=tx_grouped.index, y=tx_grouped['Inflow'], name='Inflow', marker_color='#2ecc71'))
    if 'Outflow' in tx_grouped.columns:
        fig_bar.add_trace(go.Bar(x=tx_grouped.index, y=tx_grouped['Outflow'].abs(), name='Outflow', marker_color='#e74c3c'))
        
    fig_bar.update_layout(
        title="Weekly Inflows vs Outflows",
        barmode='group',
        xaxis_title="Week",
        yaxis_title="Amount ($)",
        template="plotly_white"
    )
    st.plotly_chart(fig_bar, use_container_width=True)

# --- TAB 4: STRESS TEST REPORT ---
with tab4:
    st.header("Stress Test Report & Risk Assessment")
    
    # Risk Rating Calculation
    risk_score = 0
    reasons = []
    
    if stressed_runway < 30:
        risk_score += 40
        reasons.append("Stressed runway is critically low (< 30 days).")
    elif stressed_runway < 90:
        risk_score += 20
        reasons.append("Stressed runway is moderate (< 90 days).")
        
    if brokerage_haircut > 0.3:
        risk_score += 15
        reasons.append("High exposure to volatile brokerage assets.")
        
    if credit_reduction > 0.5:
        risk_score += 15
        reasons.append("High reliance on credit facilities vulnerable to freezes.")
        
    if revenue_drop > 0.4:
        risk_score += 20
        reasons.append("Severe vulnerability to customer concentration or market downturns.")
        
    # Determine Risk Category
    if risk_score >= 60:
        risk_level = "CRITICAL"
        risk_color = "red"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
        risk_color = "orange"
    else:
        risk_level = "LOW"
        risk_color = "green"
        
    st.markdown(f"### Overall Risk Rating: :{risk_color}[{risk_level}]")
    
    # Progress bar for risk score
    st.progress(min(100, risk_score) / 100.0)
    
    st.subheader("Key Vulnerabilities Identified")
    if reasons:
        for reason in reasons:
            st.markdown(f"- ⚠️ {reason}")
    else:
        st.markdown("- ✅ No major vulnerabilities identified under current stress parameters.")
        
    st.subheader("Stress Scenario Summary Table")
    
    summary_data = {
        "Metric": [
            "Total Cash & Equivalents",
            "Brokerage Holdings Value",
            "Available Credit Facilities",
            "Total Liquidity Pool",
            "Projected Daily Inflow",
            "Projected Daily Outflow",
            "Estimated Runway (Days)"
        ],
        "Baseline Scenario": [
            f"${total_cash:,.2f}",
            f"${total_brokerage:,.2f}",
            f"${available_credit:,.2f}",
            f"${total_liquidity:,.2f}",
            f"${avg_daily_inflow:,.2f}",
            f"${avg_daily_outflow:,.2f}",
            f"{baseline_runway} Days" if baseline_runway < projection_days else f"{projection_days}+ Days"
        ],
        "Stressed Scenario": [
            f"${total_cash:,.2f}",
            f"${stressed_brokerage:,.2f}",
            f"${stressed_available_credit:,.2f}",
            f"${stressed_liquidity:,.2f}",
            f"${avg_daily_inflow * (1 - revenue_drop):,.2f} (Delayed {receivables_delay}d)",
            f"${avg_daily_outflow * (1 + expense_spike):,.2f}",
            f"{stressed_runway} Days" if stressed_runway < projection_days else f"{projection_days}+ Days"
        ]
    }
    
    summary_df = pd.DataFrame(summary_data)
    st.table(summary_df)
    
    # Downloadable Report
    st.subheader("Export Stress Test Results")
    
    # Generate CSV of the summary
    csv_buffer = io.StringIO()
    summary_df.to_csv(csv_buffer, index=False)
    csv_data = csv_buffer.getvalue()
    
    st.download_button(
        label="📥 Download Stress Test Report (CSV)",
        data=csv_data,
        file_name=f"stress_test_report_{datetime.now().strftime('%Y%m%d')}.csv",
        mime="text/csv"
    )