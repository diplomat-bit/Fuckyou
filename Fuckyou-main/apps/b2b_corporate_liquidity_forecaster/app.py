import streamlit as pd
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

# Set page configuration
st.set_page_config(
    page_title="Corporate Liquidity Forecaster",
    page_icon="💼",
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
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #1E3A8A;
    }
    .metric-card-warning {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #D97706;
    }
    .metric-card-danger {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #DC2626;
    }
    .metric-card-success {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #059669;
    }
    </style>
""", unsafe_allow_html=True)

# --- MOCK DATA GENERATION ---
@st.cache_data
def generate_historical_data():
    np.random.seed(42)
    dates = pd.date_range(start=datetime.now() - timedelta(days=180), end=datetime.now(), freq='D')
    
    # Generate realistic daily cash flows
    # Inflows: Large enterprise payments (weekly/monthly), daily SaaS subscriptions
    # Outflows: Daily operational costs, bi-weekly payroll, monthly rent/cloud
    inflows = []
    outflows = []
    
    for date in dates:
        # Base daily SaaS inflow
        daily_saas = np.random.normal(15000, 2000)
        # Enterprise payments on Fridays
        ent_payment = np.random.choice([0, 75000, 120000], p=[0.7, 0.2, 0.1]) if date.weekday() == 4 else 0
        inflows.append(daily_saas + ent_payment)
        
        # Base daily outflow
        daily_ops = np.random.normal(8000, 1000)
        # Bi-weekly payroll (15th and 30th/last day)
        payroll = 180000 if date.day in [15, 28, 29, 30, 31] and date.day == dates[dates.month == date.month].day.max() or date.day == 15 else 0
        # Monthly rent & cloud (1st of month)
        monthly_bills = 45000 if date.day == 1 else 0
        outflows.append(daily_ops + payroll + monthly_bills)
        
    df = pd.DataFrame({
        'Date': dates,
        'Inflow': inflows,
        'Outflow': outflows
    })
    df['Net_Flow'] = df['Inflow'] - df['Outflow']
    return df

historical_df = generate_historical_data()

# Current Balances
balances = {
    "Operating Checking (Chase)": 1250000.00,
    "Payroll Checking (SVB)": 450000.00,
    "Treasury Savings (Fidelity)": 3500000.00,
    "Corporate Credit Card (Amex)": -120000.00,
    "Line of Credit (BofA)": -400000.00
}
limits = {
    "Corporate Credit Card (Amex)": 500000.00,
    "Line of Credit (BofA)": 2000000.00
}

# --- SIDEBAR NAVIGATION ---
st.sidebar.image("https://img.icons8.com/fluency/96/000000/combo-chart.png", width=80)
st.sidebar.title("B2B Liquidity Engine")
st.sidebar.markdown("### Corporate Cash Flow & Forecasting")
st.sidebar.markdown("---")

app_mode = st.sidebar.radio(
    "Select Sub-Application",
    [
        "📊 Consolidated Liquidity Dashboard",
        "📈 Cash Flow Forecaster",
        "⚡ Scenario Planner & Stress Tester",
        "🚨 Smart Alerts & Action Center"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    "💡 **Quick Tip:** Use the Scenario Planner to stress-test your cash position against delayed client payments or sudden market downturns."
)

# --- APP 1: CONSOLIDATED LIQUIDITY DASHBOARD ---
if app_mode == "📊 Consolidated Liquidity Dashboard":
    st.title("📊 Consolidated Liquidity Dashboard")
    st.markdown("Real-time consolidation of cash, credit, and debt positions across all corporate accounts.")
    
    # Metrics Row
    total_cash = balances["Operating Checking (Chase)"] + balances["Payroll Checking (SVB)"] + balances["Treasury Savings (Fidelity)"]
    total_debt = abs(balances["Corporate Credit Card (Amex)"]) + abs(balances["Line of Credit (BofA)"])
    net_liquidity = total_cash - total_debt
    available_credit = (limits["Corporate Credit Card (Amex)"] + balances["Corporate Credit Card (Amex)"]) + \
                       (limits["Line of Credit (BofA)"] + balances["Line of Credit (BofA)"])
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
            <div class="metric-card-success">
                <p style="color: #6B7280; font-size: 0.9rem; margin: 0;">Total Cash & Cash Equiv.</p>
                <h2 style="color: #059669; margin: 5px 0 0 0;">${total_cash:,.2f}</h2>
            </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
            <div class="metric-card-danger">
                <p style="color: #6B7280; font-size: 0.9rem; margin: 0;">Total Outstanding Debt</p>
                <h2 style="color: #DC2626; margin: 5px 0 0 0;">${total_debt:,.2f}</h2>
            </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
            <div class="metric-card">
                <p style="color: #6B7280; font-size: 0.9rem; margin: 0;">Net Liquidity Position</p>
                <h2 style="color: #1E3A8A; margin: 5px 0 0 0;">${net_liquidity:,.2f}</h2>
            </div>
        """, unsafe_allow_html=True)
    with col4:
        st.markdown(f"""
            <div class="metric-card-warning">
                <p style="color: #6B7280; font-size: 0.9rem; margin: 0;">Available Credit Lines</p>
                <h2 style="color: #D97706; margin: 5px 0 0 0;">${available_credit:,.2f}</h2>
            </div>
        """, unsafe_allow_html=True)

    st.markdown("### Account Breakdown")
    col_left, col_right = st.columns([1, 1])
    
    with col_left:
        # Balance Sheet Table
        st.markdown("#### Current Balances")
        balance_data = []
        for acc, bal in balances.items():
            limit_val = limits.get(acc, "N/A")
            limit_str = f"${limit_val:,.2f}" if isinstance(limit_val, float) else limit_val
            balance_data.append({
                "Account Name": acc,
                "Type": "Asset (Cash)" if bal > 0 else "Liability (Debt)",
                "Balance": f"${bal:,.2f}" if bal >= 0 else f"-${abs(bal):,.2f}",
                "Limit / Capacity": limit_str
            })
        st.table(pd.DataFrame(balance_data))
        
    with col_right:
        # Donut Chart of Assets
        asset_balances = {k: v for k, v in balances.items() if v > 0}
        fig = px.pie(
            names=list(asset_balances.keys()),
            values=list(asset_balances.values()),
            hole=0.4,
            title="Cash Allocation",
            color_discrete_sequence=px.colors.qualitative.Pastel
        )
        fig.update_layout(margin=dict(t=40, b=0, l=0, r=0))
        st.plotly_chart(fig, use_container_width=True)

    # Historical Trend Chart
    st.markdown("### Historical Cash Flow Trend (Last 6 Months)")
    historical_df['Cumulative_Cash'] = total_cash + (historical_df['Net_Flow'].cumsum() - historical_df['Net_Flow'].sum())
    
    fig_trend = go.Figure()
    fig_trend.add_trace(go.Scatter(
        x=historical_df['Date'], 
        y=historical_df['Cumulative_Cash'],
        mode='lines',
        name='Net Cash Position',
        line=dict(color='#1E3A8A', width=3),
        fill='tozeroy',
        fillcolor='rgba(30, 58, 138, 0.1)'
    ))
    fig_trend.update_layout(
        title="Historical Net Cash Position",
        xaxis_title="Date",
        yaxis_title="Balance ($)",
        hovermode="x unified",
        template="plotly_white"
    )
    st.plotly_chart(fig_trend, use_container_width=True)

# --- APP 2: CASH FLOW FORECASTER ---
elif app_mode == "📈 Cash Flow Forecaster":
    st.title("📈 Cash Flow Forecaster")
    st.markdown("Model future cash positions based on historical transaction trends and customizable growth/burn rates.")
    
    # Forecast Controls
    st.markdown("### Forecast Parameters")
    col1, col2, col3 = st.columns(3)
    with col1:
        forecast_days = st.slider("Forecast Horizon (Days)", 30, 180, 90, step=30)
    with col2:
        rev_growth = st.slider("Expected Monthly Revenue Growth (%)", -20.0, 50.0, 5.0, step=0.5) / 100.0
    with col3:
        exp_growth = st.slider("Expected Monthly Expense Increase (%)", -10.0, 30.0, 2.0, step=0.5) / 100.0

    # Calculate baseline historical averages
    avg_daily_inflow = historical_df['Inflow'].mean()
    avg_daily_outflow = historical_df['Outflow'].mean()
    
    # Generate Forecast Data
    future_dates = pd.date_range(start=datetime.now() + timedelta(days=1), periods=forecast_days, freq='D')
    forecast_inflows = []
    forecast_outflows = []
    
    current_cash = balances["Operating Checking (Chase)"] + balances["Payroll Checking (SVB)"] + balances["Treasury Savings (Fidelity)"]
    
    for i, date in enumerate(future_dates):
        # Apply monthly compounding growth to daily rates
        month_factor = i / 30.0
        daily_inflow_rate = avg_daily_inflow * ((1 + rev_growth) ** month_factor)
        daily_outflow_rate = avg_daily_outflow * ((1 + exp_growth) ** month_factor)
        
        # Add some realistic variance
        inflow = np.random.normal(daily_inflow_rate, daily_inflow_rate * 0.1)
        outflow = np.random.normal(daily_outflow_rate, daily_outflow_rate * 0.05)
        
        # Weekly/Monthly patterns
        if date.weekday() == 4:  # Friday enterprise payments
            inflow += np.random.choice([0, 80000, 130000], p=[0.7, 0.2, 0.1])
        if date.day in [15, 28, 29, 30, 31] and date.day == future_dates[future_dates.month == date.month].day.max() or date.day == 15:
            outflow += 180000  # Payroll
        if date.day == 1:
            outflow += 45000   # Rent/Cloud
            
        forecast_inflows.append(inflow)
        forecast_outflows.append(outflow)
        
    forecast_df = pd.DataFrame({
        'Date': future_dates,
        'Inflow': forecast_inflows,
        'Outflow': forecast_outflows
    })
    forecast_df['Net_Flow'] = forecast_df['Inflow'] - forecast_df['Outflow']
    forecast_df['Projected_Cash'] = current_cash + forecast_df['Net_Flow'].cumsum()
    
    # Forecast Metrics
    ending_cash = forecast_df['Projected_Cash'].iloc[-1]
    min_cash = forecast_df['Projected_Cash'].min()
    min_cash_date = forecast_df.loc[forecast_df['Projected_Cash'].idxmin(), 'Date'].strftime('%Y-%m-%d')
    runway_days = int(current_cash / avg_daily_outflow) if avg_daily_outflow > 0 else 999
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Projected Ending Cash", f"${ending_cash:,.2f}", delta=f"${(ending_cash - current_cash):,.2f}")
    with col2:
        st.metric("Minimum Cash Position", f"${min_cash:,.2f}", delta="Lowest Point", delta_color="inverse")
    with col3:
        st.metric("Date of Lowest Cash", min_cash_date)
    with col4:
        st.metric("Current Runway (Days)", f"{runway_days} Days")
        
    # Forecast Chart
    fig_forecast = go.Figure()
    # Historical
    fig_forecast.add_trace(go.Scatter(
        x=historical_df['Date'], 
        y=historical_df['Cumulative_Cash'],
        mode='lines',
        name='Historical Cash',
        line=dict(color='#9CA3AF', width=2)
    ))
    # Forecasted
    fig_forecast.add_trace(go.Scatter(
        x=forecast_df['Date'], 
        y=forecast_df['Projected_Cash'],
        mode='lines',
        name='Projected Cash (Baseline)',
        line=dict(color='#10B981', width=3, dash='dash')
    ))
    # Minimum Buffer Line
    buffer_limit = 500000.00
    fig_forecast.add_trace(go.Scatter(
        x=list(historical_df['Date']) + list(forecast_df['Date']),
        y=[buffer_limit] * (len(historical_df) + len(forecast_df)),
        mode='lines',
        name='Min Cash Buffer ($500k)',
        line=dict(color='#EF4444', width=1.5, dash='dot')
    ))
    
    fig_forecast.update_layout(
        title="Cash Flow Forecast & Runway Projection",
        xaxis_title="Date",
        yaxis_title="Balance ($)",
        hovermode="x unified",
        template="plotly_white"
    )
    st.plotly_chart(fig_forecast, use_container_width=True)

# --- APP 3: SCENARIO PLANNER & STRESS TESTER ---
elif app_mode == "⚡ Scenario Planner & Stress Tester":
    st.title("⚡ Scenario Planner & Stress Tester")
    st.markdown("Simulate 'what-if' scenarios to stress-test your liquidity against unexpected market events.")
    
    # Scenario Selection
    scenario = st.selectbox(
        "Choose a Stress Scenario to Model:",
        [
            "Standard Baseline",
            "Delayed Enterprise Payments (30-day delay on 40% of inflows)",
            "Severe Market Downturn (30% drop in recurring revenue)",
            "Aggressive Expansion (Double marketing spend + 5 new hires)",
            "Custom Scenario"
        ]
    )
    
    # Custom Scenario Controls
    custom_rev_change = 0.0
    custom_exp_change = 0.0
    one_time_hit = 0.0
    
    if scenario == "Custom Scenario":
        st.markdown("#### Custom Scenario Parameters")
        col1, col2, col3 = st.columns(3)
        with col1:
            custom_rev_change = st.slider("Revenue Change (%)", -50.0, 50.0, -10.0, step=5.0) / 100.0
        with col2:
            custom_exp_change = st.slider("Expense Change (%)", -20.0, 100.0, 20.0, step=5.0) / 100.0
        with col3:
            one_time_hit = st.number_input("One-time Cash Event (e.g., Tax/Fine/CapEx)", value=100000.0, step=10000.0)

    # Generate Baseline Forecast
    forecast_days = 90
    future_dates = pd.date_range(start=datetime.now() + timedelta(days=1), periods=forecast_days, freq='D')
    avg_daily_inflow = historical_df['Inflow'].mean()
    avg_daily_outflow = historical_df['Outflow'].mean()
    current_cash = balances["Operating Checking (Chase)"] + balances["Payroll Checking (SVB)"] + balances["Treasury Savings (Fidelity)"]
    
    baseline_cash = []
    scenario_cash = []
    
    temp_baseline = current_cash
    temp_scenario = current_cash
    
    for i, date in enumerate(future_dates):
        # Baseline calculations
        inflow_base = np.random.normal(avg_daily_inflow, avg_daily_inflow * 0.05)
        outflow_base = np.random.normal(avg_daily_outflow, avg_daily_outflow * 0.05)
        
        # Add baseline patterns
        if date.weekday() == 4: inflow_base += 50000
        if date.day in [15, 28, 29, 30, 31] and date.day == future_dates[future_dates.month == date.month].day.max() or date.day == 15:
            outflow_base += 180000
        if date.day == 1: outflow_base += 45000
            
        temp_baseline += (inflow_base - outflow_base)
        baseline_cash.append(temp_baseline)
        
        # Scenario modifications
        inflow_scen = inflow_base
        outflow_scen = outflow_base
        
        if scenario == "Delayed Enterprise Payments (30-day delay on 40% of inflows)":
            # Reduce inflows by 40% for the first 30 days, recover them in the next 30 days
            if i < 30:
                inflow_scen = inflow_base * 0.6
            elif i < 60:
                inflow_scen = inflow_base * 1.4
        elif scenario == "Severe Market Downturn (30% drop in recurring revenue)":
            inflow_scen = inflow_base * 0.7
        elif scenario == "Aggressive Expansion (Double marketing spend + 5 new hires)":
            outflow_scen = outflow_base * 1.35 + 5000  # Extra daily burn
        elif scenario == "Custom Scenario":
            inflow_scen = inflow_base * (1 + custom_rev_change)
            outflow_scen = outflow_base * (1 + custom_exp_change)
            if i == 15:  # Apply one-time hit on day 15
                outflow_scen += one_time_hit
                
        temp_scenario += (inflow_scen - outflow_scen)
        scenario_cash.append(temp_scenario)
        
    # Plotly Comparison Chart
    fig_scen = go.Figure()
    fig_scen.add_trace(go.Scatter(x=future_dates, y=baseline_cash, name="Baseline Forecast", line=dict(color='#10B981', width=2)))
    fig_scen.add_trace(go.Scatter(x=future_dates, y=scenario_cash, name=f"Scenario: {scenario}", line=dict(color='#EF4444', width=3)))
    
    # Add critical threshold line
    fig_scen.add_trace(go.Scatter(
        x=future_dates, y=[500000]*len(future_dates), 
        name="Critical Buffer ($500k)", 
        line=dict(color='#DC2626', width=1.5, dash='dot')
    ))
    
    fig_scen.update_layout(
        title="Stress Test: Cash Position Comparison",
        xaxis_title="Date",
        yaxis_title="Projected Cash ($)",
        hovermode="x unified",
        template="plotly_white"
    )
    st.plotly_chart(fig_scen, use_container_width=True)
    
    # Scenario Analysis & Alerts
    min_scen_cash = min(scenario_cash)
    if min_scen_cash < 500000:
        days_to_shortfall = next((i for i, val in enumerate(scenario_cash) if val < 500000), None)
        shortfall_date = future_dates[days_to_shortfall].strftime('%Y-%m-%d') if days_to_shortfall is not None else "N/A"
        st.error(f"⚠️ **Liquidity Shortfall Alert!** Under this scenario, your cash position will drop below the critical $500,000 buffer on **{shortfall_date}** (in {days_to_shortfall} days).")
    else:
        st.success("✅ **Liquidity Buffer Maintained.** Even under this stress scenario, your cash position remains above the critical threshold.")

# --- APP 4: SMART ALERTS & ACTION CENTER ---
elif app_mode == "🚨 Smart Alerts & Action Center":
    st.title("🚨 Smart Alerts & Action Center")
    st.markdown("Automated risk detection and actionable recommendations to optimize corporate liquidity.")
    
    # Generate a standard 90-day forecast to analyze
    forecast_days = 90
    future_dates = pd.date_range(start=datetime.now() + timedelta(days=1), periods=forecast_days, freq='D')
    avg_daily_inflow = historical_df['Inflow'].mean()
    avg_daily_outflow = historical_df['Outflow'].mean()
    current_cash = balances["Operating Checking (Chase)"] + balances["Payroll Checking (SVB)"] + balances["Treasury Savings (Fidelity)"]
    
    # Simulate a slight downward trend for demonstration of alerts
    forecast_cash = []
    temp_cash = current_cash
    for i, date in enumerate(future_dates):
        inflow = np.random.normal(avg_daily_inflow * 0.9, avg_daily_inflow * 0.05) # 10% drop
        outflow = np.random.normal(avg_daily_outflow * 1.05, avg_daily_outflow * 0.05) # 5% increase
        if date.day in [15, 28, 29, 30, 31] and date.day == future_dates[future_dates.month == date.month].day.max() or date.day == 15:
            outflow += 180000
        temp_cash += (inflow - outflow)
        forecast_cash.append(temp_cash)
        
    # Alert Engine
    st.markdown("### Active Liquidity Alerts")
    
    # Alert 1: Buffer Breach
    min_projected = min(forecast_cash)
    if min_projected < 500000:
        st.markdown("""
            <div style="background-color: #FEE2E2; border-left: 6px solid #DC2626; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
                <h4 style="color: #991B1B; margin: 0 0 5px 0;">🔴 CRITICAL: Cash Buffer Breach Projected</h4>
                <p style="color: #7F1D1D; margin: 0;">Based on current trends, consolidated cash is projected to drop to <strong>${:,.2f}</strong> within the next 60 days, breaching your minimum $500,000 buffer.</p>
            </div>
        """.format(min_projected), unsafe_allow_html=True)
        
    # Alert 2: Credit Card Utilization
    cc_utilization = abs(balances["Corporate Credit Card (Amex)"]) / limits["Corporate Credit Card (Amex)"] * 100
    if cc_utilization > 70:
        st.markdown(f"""
            <div style="background-color: #FEF3C7; border-left: 6px solid #D97706; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
                <h4 style="color: #92400E; margin: 0 0 5px 0;">🟡 WARNING: High Credit Card Utilization</h4>
                <p style="color: #78350F; margin: 0;">Amex Corporate Credit Card is at <strong>{cc_utilization:.1f}%</strong> utilization (${abs(balances['Corporate Credit Card (Amex)']):,.2f} of ${limits['Corporate Credit Card (Amex)']:,.2f}).</p>
            </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
            <div style="background-color: #ECFDF5; border-left: 6px solid #10B981; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
                <h4 style="color: #065F46; margin: 0 0 5px 0;">🟢 HEALTHY: Credit Card Utilization</h4>
                <p style="color: #047857; margin: 0;">Amex Corporate Credit Card is at <strong>{cc_utilization:.1f}%</strong> utilization. Well within safe limits.</p>
            </div>
        """, unsafe_allow_html=True)

    # Action Center / Recommendations
    st.markdown("### 🛠️ Recommended Actions & Optimization Simulator")
    st.markdown("Select actions below to simulate their impact on your 90-day cash forecast.")
    
    # Interactive Action Checkboxes
    action_1 = st.checkbox("Draw $300,000 from BofA Line of Credit (Interest rate: 6.5% APR)")
    action_2 = st.checkbox("Delay AWS Cloud Infrastructure payment by 30 days (Saves $45,000 in Month 1)")
    action_3 = st.checkbox("Sweep $1,000,000 from Treasury Savings to Operating Checking")
    action_4 = st.checkbox("Accelerate collection of $150,000 in outstanding AR via 2% Net-10 discount")
    
    # Recalculate forecast based on selected actions
    adjusted_cash = []
    temp_adjusted = current_cash
    
    # Apply immediate actions
    if action_1:
        temp_adjusted += 300000
    if action_3:
        # Sweeping doesn't change consolidated cash, but let's assume it prevents overdraft fees or optimizes operating cash
        pass
    if action_4:
        temp_adjusted += 150000
        
    for i, date in enumerate(future_dates):
        inflow = np.random.normal(avg_daily_inflow * 0.9, avg_daily_inflow * 0.05)
        outflow = np.random.normal(avg_daily_outflow * 1.05, avg_daily_outflow * 0.05)
        
        # Apply delayed payment action
        if action_2 and date.day == 1 and i < 30:
            outflow -= 45000  # Save in month 1
        elif action_2 and date.day == 1 and 30 <= i < 60:
            outflow += 45000  # Pay in month 2
            
        if date.day in [15, 28, 29, 30, 31] and date.day == future_dates[future_dates.month == date.month].day.max() or date.day == 15:
            outflow += 180000
            
        temp_adjusted += (inflow - outflow)
        adjusted_cash.append(temp_adjusted)
        
    # Plotly Comparison Chart for Actions
    fig_action = go.Figure()
    fig_action.add_trace(go.Scatter(x=future_dates, y=forecast_cash, name="Original Forecast", line=dict(color='#EF4444', width=2, dash='dash')))
    fig_action.add_trace(go.Scatter(x=future_dates, y=adjusted_cash, name="Adjusted Forecast (With Actions)", line=dict(color='#10B981', width=3)))
    fig_action.add_trace(go.Scatter(x=future_dates, y=[500000]*len(future_dates), name="Min Cash Buffer ($500k)", line=dict(color='#374151', width=1.5, dash='dot')))
    
    fig_action.update_layout(
        title="Impact of Selected Actions on Cash Runway",
        xaxis_title="Date",
        yaxis_title="Projected Cash ($)",
        hovermode="x unified",
        template="plotly_white"
    )
    st.plotly_chart(fig_action, use_container_width=True)
    
    # Final Status after Actions
    new_min = min(adjusted_cash)
    if new_min >= 500000:
        st.balloons()
        st.success(f"🎉 **Success!** The selected actions successfully keep your cash position above the $500,000 buffer. Minimum projected cash is now **${new_min:,.2f}**.")
    else:
        st.warning(f"⚠️ **Buffer Still Breached.** Even with selected actions, cash drops to **${new_min:,.2f}**. Consider drawing more from your Line of Credit or implementing further cost-cutting measures.")