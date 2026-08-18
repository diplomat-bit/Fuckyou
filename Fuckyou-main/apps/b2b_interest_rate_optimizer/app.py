import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import json

# Set page configuration
st.set_page_config(
    page_title="B2B Interest Rate Optimizer",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional look
st.markdown("""
<style>
    .reportview-container {
        background: #f5f7f9;
    }
    .main .block-container {
        padding-top: 2rem;
    }
    .metric-card {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        border: 1px solid #eef2f6;
    }
    .metric-title {
        font-size: 14px;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
    }
    .metric-value {
        font-size: 28px;
        color: #1e293b;
        font-weight: 700;
        margin: 5px 0;
    }
    .metric-delta {
        font-size: 14px;
        font-weight: 600;
    }
    .delta-positive {
        color: #10b981;
    }
    .delta-negative {
        color: #ef4444;
    }
</style>
""", unsafe_allow_html=True)

# Initialize Session State for Accounts Data
if 'accounts_df' not in st.session_state:
    # Default Mock Data representing Accounts API response
    default_accounts = [
        {"id": "ACC-001", "name": "Primary Operating Checking", "type": "Asset", "subtype": "Checking", "balance": 350000.00, "apr": 0.15, "institution": "Chase Business"},
        {"id": "ACC-002", "name": "Standard Business Savings", "type": "Asset", "subtype": "Savings", "balance": 180000.00, "apr": 1.20, "institution": "Chase Business"},
        {"id": "ACC-003", "name": "High-Yield Treasury Reserve", "type": "Asset", "subtype": "HYS", "balance": 120000.00, "apr": 4.85, "institution": "Vanguard"},
        {"id": "ACC-004", "name": "Corporate Credit Card", "type": "Liability", "subtype": "Credit Card", "balance": 45000.00, "apr": 18.99, "institution": "American Express"},
        {"id": "ACC-005", "name": "Equipment Term Loan", "type": "Liability", "subtype": "Loan", "balance": 150000.00, "apr": 7.25, "institution": "SBA / Wells Fargo"},
        {"id": "ACC-006", "name": "Working Capital Line of Credit", "type": "Liability", "subtype": "Line of Credit", "balance": 85000.00, "apr": 8.50, "institution": "Silicon Valley Bank"}
    ]
    st.session_state.accounts_df = pd.DataFrame(default_accounts)

# Sidebar Controls
st.sidebar.image("https://img.icons8.com/external-flatart-icons-flat-flatarticons/128/external-optimization-web-development-flatart-icons-flat-flatarticons.png", width=80)
st.sidebar.title("Treasury Optimizer")
st.sidebar.markdown("Optimize corporate cash allocations, minimize debt costs, and maximize Net Interest Margin (NIM).")

st.sidebar.header("Optimization Parameters")
min_checking_buffer = st.sidebar.number_input(
    "Min Checking Buffer ($)", 
    min_value=10000, 
    max_value=500000, 
    value=75000, 
    step=5000,
    help="Minimum operational cash required to stay in the primary checking account for daily liquidity."
)

target_hys_rate = st.sidebar.slider(
    "Target High-Yield Rate (%)", 
    min_value=3.0, 
    max_value=6.0, 
    value=5.10, 
    step=0.05,
    help="The market rate currently achievable for high-yield savings or treasury sweep accounts."
)

debt_paydown_priority = st.sidebar.selectbox(
    "Debt Paydown Strategy",
    ["Highest APR First (Avalanche)", "Lowest Balance First (Snowball)", "Pro-Rata Allocation"],
    help="Strategy used to allocate excess cash to outstanding liabilities."
)

st.sidebar.markdown("---")
st.sidebar.subheader("Accounts API Status")
st.sidebar.success("🟢 Connected to Accounts API")
if st.sidebar.button("Reset to Default API Data"):
    st.session_state.accounts_df = pd.DataFrame(default_accounts)
    st.rerun()

# Main Application Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Dashboard & Optimization", 
    "🏦 Account Manager", 
    "📈 WACC & Financial Analysis",
    "🔌 API Explorer"
])

# ---------------------------------------------------------
# TAB 1: DASHBOARD & OPTIMIZATION
# ---------------------------------------------------------
with tab1:
    st.title("Corporate Interest Rate Optimizer")
    st.markdown("Analyze current asset yields vs. liability costs and execute optimal reallocation strategies.")

    # Fetch current state
    df = st.session_state.accounts_df.copy()
    
    # Calculations for Current State
    assets_df = df[df['type'] == 'Asset']
    liabilities_df = df[df['type'] == 'Liability']
    
    total_assets = assets_df['balance'].sum()
    total_liabilities = liabilities_df['balance'].sum()
    net_liquidity = total_assets - total_liabilities
    
    # Weighted Average Yield on Assets (WAYA)
    total_asset_interest_annual = (assets_df['balance'] * (assets_df['apr'] / 100)).sum()
    waya = (total_asset_interest_annual / total_assets) * 100 if total_assets > 0 else 0
    
    # Weighted Average Cost of Debt (WACD)
    total_debt_interest_annual = (liabilities_df['balance'] * (liabilities_df['apr'] / 100)).sum()
    wacd = (total_debt_interest_annual / total_liabilities) * 100 if total_liabilities > 0 else 0
    
    # Net Interest Margin / Spread
    net_interest_spread = waya - wacd
    net_annual_interest_expense = total_debt_interest_annual - total_asset_interest_annual

    # ---------------------------------------------------------
    # OPTIMIZATION ENGINE
    # ---------------------------------------------------------
    # 1. Identify excess cash in checking/savings
    checking_accs = assets_df[assets_df['subtype'] == 'Checking']
    savings_accs = assets_df[assets_df['subtype'] == 'Savings']
    hys_accs = assets_df[assets_df['subtype'] == 'HYS']
    
    current_checking_balance = checking_accs['balance'].sum()
    current_savings_balance = savings_accs['balance'].sum()
    
    excess_checking = max(0.0, current_checking_balance - min_checking_buffer)
    # We assume standard savings can be fully reallocated to higher yield or debt paydown
    reallocatable_cash = excess_checking + current_savings_balance
    
    # Track actions
    actions = []
    optimized_df = df.copy()
    
    # Allocate excess cash to liabilities first (if strategy is Avalanche or Snowball)
    remaining_cash = reallocatable_cash
    
    # Sort liabilities based on strategy
    if debt_paydown_priority == "Highest APR First (Avalanche)":
        sorted_liabilities = liabilities_df.sort_values(by='apr', ascending=False)
    elif debt_paydown_priority == "Lowest Balance First (Snowball)":
        sorted_liabilities = liabilities_df.sort_values(by='balance', ascending=True)
    else: # Pro-rata
        sorted_liabilities = liabilities_df.copy()
        total_l = sorted_liabilities['balance'].sum()
        sorted_liabilities['weight'] = sorted_liabilities['balance'] / total_l if total_l > 0 else 0
    
    paid_debts = {}
    
    if debt_paydown_priority == "Pro-Rata Allocation":
        for idx, row in sorted_liabilities.iterrows():
            if remaining_cash <= 0:
                break
            allocated_paydown = min(row['balance'], remaining_cash * row['weight'])
            paid_debts[row['id']] = allocated_paydown
            remaining_cash -= allocated_paydown
    else:
        for idx, row in sorted_liabilities.iterrows():
            if remaining_cash <= 0:
                break
            paydown_amount = min(row['balance'], remaining_cash)
            paid_debts[row['id']] = paydown_amount
            remaining_cash -= paydown_amount

    # Apply changes to optimized dataframe
    # Reduce checking/savings
    # For checking:
    checking_reduction = min(excess_checking, reallocatable_cash - remaining_cash)
    optimized_df.loc[optimized_df['subtype'] == 'Checking', 'balance'] -= checking_reduction
    if checking_reduction > 0:
        actions.append({
            "Action": "Withdraw Excess Cash",
            "Source": "Primary Operating Checking",
            "Destination": "Allocation Pool",
            "Amount": checking_reduction,
            "Reason": f"Keep only the required ${min_checking_buffer:,.2f} buffer."
        })
        
    # For savings:
    savings_reduction = min(current_savings_balance, (reallocatable_cash - checking_reduction) - remaining_cash)
    optimized_df.loc[optimized_df['subtype'] == 'Savings', 'balance'] -= savings_reduction
    if savings_reduction > 0:
        actions.append({
            "Action": "Empty Low-Yield Savings",
            "Source": "Standard Business Savings",
            "Destination": "Allocation Pool",
            "Amount": savings_reduction,
            "Reason": "Reallocate low-yield assets (1.20% APR) to higher-performing options."
        })

    # Apply debt paydowns
    for debt_id, amount in paid_debts.items():
        if amount > 0:
            debt_name = df[df['id'] == debt_id]['name'].values[0]
            debt_apr = df[df['id'] == debt_id]['apr'].values[0]
            optimized_df.loc[optimized_df['id'] == debt_id, 'balance'] -= amount
            actions.append({
                "Action": "Pay Down Debt",
                "Source": "Allocation Pool",
                "Destination": debt_name,
                "Amount": amount,
                "Reason": f"Reduce high-interest liability costing {debt_apr:.2f}% APR."
            })

    # Any remaining cash goes to High-Yield Savings (HYS)
    if remaining_cash > 0:
        # If HYS exists, add to it, otherwise simulate creating one
        hys_exists = not optimized_df[optimized_df['subtype'] == 'HYS'].empty
        if hys_exists:
            optimized_df.loc[optimized_df['subtype'] == 'HYS', 'balance'] += remaining_cash
            hys_name = optimized_df[optimized_df['subtype'] == 'HYS']['name'].values[0]
        else:
            # Create a mock HYS account
            new_hys = pd.DataFrame([{
                "id": "ACC-OPT-HYS",
                "name": "Optimized High-Yield Sweep",
                "type": "Asset",
                "subtype": "HYS",
                "balance": remaining_cash,
                "apr": target_hys_rate,
                "institution": "Partner Treasury Bank"
            }])
            optimized_df = pd.concat([optimized_df, new_hys], ignore_index=True)
            hys_name = "Optimized High-Yield Sweep"
            
        actions.append({
            "Action": "Maximize Yield",
            "Source": "Allocation Pool",
            "Destination": hys_name,
            "Amount": remaining_cash,
            "Reason": f"Deploy remaining idle cash to earn {target_hys_rate:.2f}% APR."
        })
        
        # Adjust checking/savings balances in optimized df to reflect the transfer out
        # Total transferred out of checking/savings is (reallocatable_cash - remaining_cash) + remaining_cash = reallocatable_cash
        # Let's make sure the math balances perfectly:
        total_withdrawn = excess_checking + current_savings_balance
        optimized_df.loc[optimized_df['subtype'] == 'Checking', 'balance'] = current_checking_balance - excess_checking
        optimized_df.loc[optimized_df['subtype'] == 'Savings', 'balance'] = 0.0

    # Recalculate Optimized Metrics
    opt_assets_df = optimized_df[optimized_df['type'] == 'Asset']
    opt_liabilities_df = optimized_df[optimized_df['type'] == 'Liability']
    
    opt_total_assets = opt_assets_df['balance'].sum()
    opt_total_liabilities = opt_liabilities_df['balance'].sum()
    
    opt_total_asset_interest_annual = (opt_assets_df['balance'] * (opt_assets_df['apr'] / 100)).sum()
    opt_waya = (opt_total_asset_interest_annual / opt_total_assets) * 100 if opt_total_assets > 0 else 0
    
    opt_total_debt_interest_annual = (opt_liabilities_df['balance'] * (opt_liabilities_df['apr'] / 100)).sum()
    opt_wacd = (opt_total_debt_interest_annual / opt_total_liabilities) * 100 if opt_total_liabilities > 0 else 0
    
    opt_net_annual_interest_expense = opt_total_debt_interest_annual - opt_total_asset_interest_annual
    annual_savings = net_annual_interest_expense - opt_net_annual_interest_expense

    # ---------------------------------------------------------
    # METRIC CARDS ROW
    # ---------------------------------------------------------
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Annual Net Interest Cost</div>
            <div class="metric-value">${opt_net_annual_interest_expense:,.2f}</div>
            <div class="metric-delta delta-positive">Before: ${net_annual_interest_expense:,.2f}</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Guaranteed Annual Savings</div>
            <div class="metric-value" style="color: #10b981;">${annual_savings:,.2f}</div>
            <div class="metric-delta delta-positive">📈 +{((net_annual_interest_expense - opt_net_annual_interest_expense)/max(1, abs(net_annual_interest_expense))*100):.1f}% Efficiency</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Weighted Asset Yield (WAYA)</div>
            <div class="metric-value">{opt_waya:.2f}%</div>
            <div class="metric-delta delta-positive">Before: {waya:.2f}% (▲ {(opt_waya - waya):+.2f}%)</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Weighted Cost of Debt (WACD)</div>
            <div class="metric-value">{opt_wacd:.2f}%</div>
            <div class="metric-delta delta-positive" style="color: #10b981;">Before: {wacd:.2f}% (▼ {(wacd - opt_wacd):-.2f}%)</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # ---------------------------------------------------------
    # CHARTS & VISUALIZATIONS
    # ---------------------------------------------------------
    g1, g2 = st.columns(2)
    
    with g1:
        st.subheader("Asset & Liability Allocation (Before vs. After)")
        
        # Prepare data for comparison chart
        comp_data = []
        for _, r in df.iterrows():
            comp_data.append({"Account": r['name'], "Type": r['type'], "State": "Current", "Balance": r['balance']})
        for _, r in optimized_df.iterrows():
            comp_data.append({"Account": r['name'], "Type": r['type'], "State": "Optimized", "Balance": r['balance']})
            
        comp_df = pd.DataFrame(comp_data)
        
        fig = px.bar(
            comp_df, 
            x="State", 
            y="Balance", 
            color="Account", 
            barmode="stack",
            title="Balance Reallocation Breakdown",
            color_discrete_sequence=px.colors.qualitative.Pastel,
            text_auto='.2s'
        )
        fig.update_layout(height=400, margin=dict(l=20, r=20, t=40, b=20))
        st.plotly_chart(fig, use_container_width=True)

    with g2:
        st.subheader("Net Interest Spread Comparison")
        
        categories = ['Current WAYA (Yield)', 'Optimized WAYA (Yield)', 'Current WACD (Cost)', 'Optimized WACD (Cost)']
        values = [waya, opt_waya, wacd, opt_wacd]
        colors = ['#93c5fd', '#3b82f6', '#fca5a5', '#ef4444']
        
        fig_spread = go.Figure(data=[
            go.Bar(
                x=categories, 
                y=values,
                marker_color=colors,
                text=[f"{v:.2f}%" for v in values],
                textposition='auto'
            )
        ])
        fig_spread.update_layout(
            title="Yield on Assets vs. Cost of Debt",
            yaxis_title="Percentage (%)",
            height=400,
            margin=dict(l=20, r=20, t=40, b=20)
        )
        st.plotly_chart(fig_spread, use_container_width=True)

    # ---------------------------------------------------------
    # ACTIONABLE REALLOCATION PLAN
    # ---------------------------------------------------------
    st.subheader("📋 Recommended Treasury Action Plan")
    if len(actions) == 0:
        st.info("Your corporate treasury is already fully optimized based on current parameters!")
    else:
        actions_df = pd.DataFrame(actions)
        
        # Style the action plan table
        def style_actions(val):
            if val == "Pay Down Debt":
                return 'background-color: #fee2e2; color: #991b1b; font-weight: bold;'
            elif val == "Maximize Yield":
                return 'background-color: #dcfce7; color: #166534; font-weight: bold;'
            return ''

        st.dataframe(
            actions_df.style.applymap(style_actions, subset=['Action']),
            use_container_width=True,
            hide_index=True
        )
        
        # Download Action Plan
        csv = actions_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Export Action Plan to CSV",
            data=csv,
            file_name="treasury_optimization_plan.csv",
            mime="text/csv"
        )

# ---------------------------------------------------------
# TAB 2: ACCOUNT MANAGER
# ---------------------------------------------------------
with tab2:
    st.title("🏦 Corporate Accounts Manager")
    st.markdown("View, edit, or add corporate accounts connected via the Accounts API.")
    
    # Editable Dataframe
    edited_df = st.data_editor(
        st.session_state.accounts_df,
        num_rows="dynamic",
        column_config={
            "id": st.column_config.TextColumn("Account ID", disabled=True),
            "name": st.column_config.TextColumn("Account Name", required=True),
            "type": st.column_config.SelectboxColumn("Type", options=["Asset", "Liability"], required=True),
            "subtype": st.column_config.SelectboxColumn("Subtype", options=["Checking", "Savings", "HYS", "Loan", "Credit Card", "Line of Credit"], required=True),
            "balance": st.column_config.NumberColumn("Balance ($)", min_value=0.0, format="$%.2f", required=True),
            "apr": st.column_config.NumberColumn("APR / Yield (%)", min_value=0.0, max_value=100.0, format="%.2f%%", required=True),
            "institution": st.column_config.TextColumn("Financial Institution", required=True)
        },
        use_container_width=True,
        key="accounts_editor"
    )
    
    col_btn1, col_btn2 = st.columns([1, 5])
    with col_btn1:
        if st.button("💾 Save Changes", type="primary"):
            st.session_state.accounts_df = edited_df
            st.success("Accounts updated successfully!")
            st.rerun()
    with col_btn2:
        if st.button("🔄 Reload API Data"):
            st.rerun()

    # Quick Stats on Current Accounts
    st.markdown("---")
    st.subheader("Current Portfolio Summary")
    s_col1, s_col2, s_col3 = st.columns(3)
    with s_col1:
        st.metric("Total Connected Assets", f"${total_assets:,.2f}")
    with s_col2:
        st.metric("Total Connected Liabilities", f"${total_liabilities:,.2f}")
    with s_col3:
        st.metric("Net Corporate Liquidity", f"${net_liquidity:,.2f}")

# ---------------------------------------------------------
# TAB 3: WACC & FINANCIAL ANALYSIS
# ---------------------------------------------------------
with tab3:
    st.title("📈 Weighted Average Cost of Capital (WACC) & Treasury Analysis")
    st.markdown("Deep dive into corporate capital structure, cost of debt, and interest optimization metrics.")

    # Let's calculate a simplified WACC
    # For a corporate entity, WACC = (E/V * Re) + (D/V * Rd * (1 - Tc))
    # We will let the user input Equity value and Cost of Equity to make this a complete professional tool.
    
    st.subheader("Capital Structure Inputs")
    w_col1, w_col2, w_col3 = st.columns(3)
    
    with w_col1:
        market_equity = st.number_input("Market Value of Equity ($)", min_value=0.0, value=1000000.0, step=50000.0, help="Total value of company equity/valuation.")
    with w_col2:
        cost_of_equity = st.number_input("Cost of Equity (%)", min_value=0.0, max_value=100.0, value=12.0, step=0.5, help="Expected return required by equity investors (Re).")
    with w_col3:
        tax_rate = st.number_input("Corporate Tax Rate (%)", min_value=0.0, max_value=100.0, value=21.0, step=1.0, help="Federal + State marginal corporate tax rate.")

    # Calculations
    total_debt = total_liabilities
    total_capital = market_equity + total_debt
    
    equity_weight = market_equity / total_capital if total_capital > 0 else 0
    debt_weight = total_debt / total_capital if total_capital > 0 else 0
    
    # Current vs Optimized WACC
    current_after_tax_cod = (wacd / 100) * (1 - (tax_rate / 100))
    current_wacc = (equity_weight * (cost_of_equity / 100)) + (debt_weight * current_after_tax_cod)
    
    opt_after_tax_cod = (opt_wacd / 100) * (1 - (tax_rate / 100))
    opt_wacc = (equity_weight * (cost_of_equity / 100)) + (debt_weight * opt_after_tax_cod)

    st.markdown("---")
    st.subheader("WACC Comparison")
    
    wc1, wc2, wc3 = st.columns(3)
    with wc1:
        st.metric("Current WACC", f"{current_wacc*100:.2f}%", help="Weighted Average Cost of Capital before optimization.")
    with wc2:
        st.metric("Optimized WACC", f"{opt_wacc*100:.2f}%", delta=f"{(opt_wacc - current_wacc)*100:.3f}%", delta_color="inverse", help="Weighted Average Cost of Capital after optimizing debt allocations.")
    with wc3:
        capital_unlocked = total_debt - opt_total_liabilities
        st.metric("Capital Unlocked / Debt Paid", f"${capital_unlocked:,.2f}", help="Total debt principal paid off using idle cash.")

    # Capital Structure Chart
    st.markdown("---")
    st.subheader("Capital Structure Breakdown")
    
    cap_labels = ['Equity', 'Debt']
    cap_values = [market_equity, total_debt]
    
    fig_cap = px.pie(
        names=cap_labels, 
        values=cap_values, 
        title="Current Capital Structure (Debt vs. Equity)",
        color_discrete_sequence=['#1e3a8a', '#ef4444']
    )
    fig_cap.update_layout(height=350)
    st.plotly_chart(fig_cap, use_container_width=True)

# ---------------------------------------------------------
# TAB 4: API EXPLORER
# ---------------------------------------------------------
with tab4:
    st.title("🔌 Accounts API Explorer")
    st.markdown("This tab simulates the raw JSON payloads exchanged with the corporate banking Accounts API (e.g., Plaid, Codat, or direct Open Banking APIs).")
    
    st.subheader("GET /api/v1/accounts")
    st.markdown("Below is the raw JSON response payload fetched from the connected financial institutions.")
    
    # Convert dataframe back to JSON structure
    api_payload = {
        "status": "success",
        "timestamp": "2023-10-27T14:20:11Z",
        "data": {
            "accounts": df.to_dict(orient="records"),
            "summary": {
                "total_assets": total_assets,
                "total_liabilities": total_liabilities,
                "net_liquidity": net_liquidity,
                "weighted_average_asset_yield_pct": waya,
                "weighted_average_debt_cost_pct": wacd
            }
        }
    }
    
    st.json(api_payload)
    
    st.subheader("POST /api/v1/treasury/reallocate")
    st.markdown("Simulated payload sent to the treasury execution engine to perform the recommended transfers and debt paydowns.")
    
    execution_payload = {
        "strategy_applied": debt_paydown_priority,
        "minimum_checking_buffer": min_checking_buffer,
        "target_hys_rate": target_hys_rate,
        "instructions": actions
    }
    
    st.json(execution_payload)