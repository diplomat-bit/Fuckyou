import os
import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

# Set page configuration
st.set_page_config(
    page_title="Multi-Currency Balance Consolidator",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="expanded"
)

# File path for account summary
CSV_PATH = "api/account-summary.csv"

# Base exchange rates relative to 1 USD (Anchor Currency)
BASE_RATES = {
    "USD": 1.0,
    "AUD": 1.52,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 155.50
}

# Currency Symbols
CURRENCY_SYMBOLS = {
    "USD": "$",
    "AUD": "A$",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥"
}

def load_data():
    """Loads account data from CSV or creates a default mock file if not present."""
    if os.path.exists(CSV_PATH):
        try:
            df = pd.read_csv(CSV_PATH)
            # Validate columns
            required_cols = ["Account ID", "Account Name", "Type", "Currency", "Balance"]
            if all(col in df.columns for col in required_cols):
                return df
        except Exception as e:
            st.error(f"Error reading CSV: {e}. Loading default data.")
    
    # Default Mock Data
    mock_data = pd.DataFrame([
        {"Account ID": "ACC-001", "Account Name": "Westpac Everyday", "Type": "Asset", "Currency": "AUD", "Balance": 24500.0},
        {"Account ID": "ACC-002", "Account Name": "Chase Savings", "Type": "Asset", "Currency": "USD", "Balance": 45000.0},
        {"Account ID": "ACC-003", "Account Name": "HSBC UK Premier", "Type": "Asset", "Currency": "GBP", "Balance": 12500.0},
        {"Account ID": "ACC-004", "Account Name": "Deutsche Bank Cash", "Type": "Asset", "Currency": "EUR", "Balance": 18000.0},
        {"Account ID": "ACC-005", "Account Name": "Mizuho Investment", "Type": "Asset", "Currency": "JPY", "Balance": 3200000.0},
        {"Account ID": "ACC-006", "Account Name": "Amex Platinum Card", "Type": "Liability", "Currency": "USD", "Balance": -4200.0},
        {"Account ID": "ACC-007", "Account Name": "CommBank Home Loan", "Type": "Liability", "Currency": "AUD", "Balance": -285000.0},
        {"Account ID": "ACC-008", "Account Name": "Barclays Credit Card", "Type": "Liability", "Currency": "GBP", "Balance": -1850.0}
    ])
    
    # Ensure directory exists and save mock data
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    mock_data.to_csv(CSV_PATH, index=False)
    return mock_data

def save_data(df):
    """Saves the current dataframe back to the CSV file."""
    try:
        os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
        df.to_csv(CSV_PATH, index=False)
        return True
    except Exception as e:
        st.error(f"Failed to save data: {e}")
        return False

# Initialize session state for data
if 'df' not in st.session_state:
    st.session_state.df = load_data()

# App Header
st.title("💼 Multi-Currency Balance Consolidator")
st.markdown(
    "Consolidate, simulate, and analyze your global multi-currency portfolio. "
    "Adjust exchange rates in real-time to stress-test your net worth against currency fluctuations."
)

# Sidebar - Exchange Rate Simulation & Controls
st.sidebar.header("🎛️ Simulation Controls")

# Preset Scenarios
scenario = st.sidebar.selectbox(
    "Select Preset Scenario",
    ["Current Market", "Strong USD (+15%)", "Weak USD (-15%)", "AUD Surge (+20%)", "Global Market Stress"]
)

# Adjust rates based on scenario
simulated_rates = BASE_RATES.copy()

if scenario == "Strong USD (+15%)":
    # Other currencies depreciate against USD (takes more of them to buy 1 USD)
    for k in simulated_rates:
        if k != "USD":
            simulated_rates[k] = round(BASE_RATES[k] * 1.15, 4)
elif scenario == "Weak USD (-15%)":
    # Other currencies appreciate against USD (takes less of them to buy 1 USD)
    for k in simulated_rates:
        if k != "USD":
            simulated_rates[k] = round(BASE_RATES[k] * 0.85, 4)
elif scenario == "AUD Surge (+20%)":
    # AUD appreciates significantly against USD
    simulated_rates["AUD"] = round(BASE_RATES["AUD"] * 0.80, 4)
elif scenario == "Global Market Stress":
    # High volatility simulation
    simulated_rates["EUR"] = round(BASE_RATES["EUR"] * 1.10, 4)
    simulated_rates["GBP"] = round(BASE_RATES["GBP"] * 1.12, 4)
    simulated_rates["AUD"] = round(BASE_RATES["AUD"] * 1.25, 4)
    simulated_rates["JPY"] = round(BASE_RATES["JPY"] * 0.90, 4)

# Manual Sliders for fine-tuning
st.sidebar.subheader("🔧 Fine-Tune Exchange Rates")
st.sidebar.caption("Value of 1 USD in target currency")

for curr in ["AUD", "EUR", "GBP", "JPY"]:
    simulated_rates[curr] = st.sidebar.slider(
        f"USD to {curr}",
        min_value=float(BASE_RATES[curr] * 0.5),
        max_value=float(BASE_RATES[curr] * 1.5),
        value=float(simulated_rates[curr]),
        step=0.01 if curr != "JPY" else 0.1,
        help=f"Base rate: {BASE_RATES[curr]}"
    )

# Target Display Currency
st.sidebar.markdown("---")
target_currency = st.sidebar.selectbox(
    "🎯 Primary Dashboard Currency",
    ["USD", "AUD", "EUR", "GBP", "JPY"],
    index=0
)

# Calculations Helper
def calculate_balances(df, rates, target_curr):
    """Calculates USD equivalents and target currency equivalents for all accounts."""
    calc_df = df.copy()
    
    # Convert local balance to USD first
    # USD_Value = Local_Balance / Rate_to_USD
    def to_usd(row):
        curr = row["Currency"]
        rate = rates.get(curr, 1.0)
        return row["Balance"] / rate

    calc_df["USD_Equivalent"] = calc_df.apply(to_usd, axis=1)
    
    # Convert USD equivalent to Target Currency
    target_rate = rates.get(target_curr, 1.0)
    calc_df[f"{target_curr}_Equivalent"] = calc_df["USD_Equivalent"] * target_rate
    
    return calc_df

# Perform calculations
processed_df = calculate_balances(st.session_state.df, simulated_rates, target_currency)

# Calculate Summary Metrics
total_assets_target = processed_df[processed_df["Type"] == "Asset"][f"{target_currency}_Equivalent"].sum()
total_liabilities_target = processed_df[processed_df["Type"] == "Liability"][f"{target_currency}_Equivalent"].sum()
net_worth_target = total_assets_target + total_liabilities_target # Liabilities are negative in our dataset

# Main Dashboard Metrics Row
col1, col2, col3 = st.columns(3)

symbol = CURRENCY_SYMBOLS[target_currency]

with col1:
    st.metric(
        label=f"Total Assets ({target_currency})",
        value=f"{symbol}{total_assets_target:,.2f}",
        delta=f"Base: {symbol}{calculate_balances(st.session_state.df, BASE_RATES, target_currency)[processed_df['Type'] == 'Asset'][f'{target_currency}_Equivalent'].sum():,.2f} (Original)"
    )

with col2:
    # Display liabilities as positive for standard representation, but keep track of negative impact
    st.metric(
        label=f"Total Liabilities ({target_currency})",
        value=f"{symbol}{abs(total_liabilities_target):,.2f}",
        delta=f"Base: {symbol}{abs(calculate_balances(st.session_state.df, BASE_RATES, target_currency)[processed_df['Type'] == 'Liability'][f'{target_currency}_Equivalent'].sum()):,.2f} (Original)",
        delta_color="inverse"
    )

with col3:
    st.metric(
        label=f"Net Consolidated Worth ({target_currency})",
        value=f"{symbol}{net_worth_target:,.2f}",
        delta=f"Shift: {symbol}{(net_worth_target - calculate_balances(st.session_state.df, BASE_RATES, target_currency)[f'{target_currency}_Equivalent'].sum()):,.2f} vs Base Rates"
    )

st.markdown("---")

# Visualizations Section
st.subheader("📊 Portfolio Analytics & Distribution")

viz_col1, viz_col2 = st.columns(2)

with viz_col1:
    # Asset vs Liability Distribution
    fig_asset_liab = go.Figure()
    
    assets_val = total_assets_target
    liab_val = abs(total_liabilities_target)
    
    fig_asset_liab.add_trace(go.Pie(
        labels=["Assets", "Liabilities"],
        values=[assets_val, liab_val],
        hole=0.4,
        marker_colors=["#2ecc71", "#e74c3c"],
        textinfo='percent+label'
    ))
    
    fig_asset_liab.update_layout(
        title_text="Asset vs. Liability Ratio",
        annotations=[dict(text='Portfolio', x=0.5, y=0.5, font_size=20, showarrow=False)],
        margin=dict(l=20, r=20, t=40, b=20),
        height=350
    )
    st.plotly_chart(fig_asset_liab, use_container_width=True)

with viz_col2:
    # Currency Exposure Distribution
    currency_exposure = processed_df.groupby("Currency")[f"{target_currency}_Equivalent"].apply(lambda x: x.abs().sum()).reset_index()
    
    fig_curr = px.pie(
        currency_exposure,
        names="Currency",
        values=f"{target_currency}_Equivalent",
        hole=0.4,
        color_discrete_sequence=px.colors.qualitative.Pastel,
        title="Absolute Currency Exposure (Assets + Liabilities)"
    )
    fig_curr.update_layout(
        margin=dict(l=20, r=20, t=40, b=20),
        height=350
    )
    st.plotly_chart(fig_curr, use_container_width=True)

# Account Breakdown Chart
st.subheader("🏦 Account-wise Breakdown")
processed_df_sorted = processed_df.sort_values(by=f"{target_currency}_Equivalent", ascending=True)

# Color code assets vs liabilities
processed_df_sorted["Color"] = processed_df_sorted["Type"].apply(lambda x: "#2ecc71" if x == "Asset" else "#e74c3c")

fig_bar = go.Figure()
fig_bar.add_trace(go.Bar(
    y=processed_df_sorted["Account Name"],
    x=processed_df_sorted[f"{target_currency}_Equivalent"],
    orientation='h',
    marker_color=processed_df_sorted["Color"],
    text=processed_df_sorted[f"{target_currency}_Equivalent"].apply(lambda x: f"{symbol}{x:,.2f}"),
    textposition='auto'
))

fig_bar.update_layout(
    title=f"Account Balances in {target_currency} (Simulated)",
    xaxis_title=f"Equivalent Value ({target_currency})",
    yaxis_title="Account Name",
    height=400,
    margin=dict(l=20, r=20, t=40, b=20)
)
st.plotly_chart(fig_bar, use_container_width=True)

st.markdown("---")

# Detailed Data Table & Management
st.subheader("📋 Consolidated Account Ledger")

# Format dataframe for display
display_df = processed_df.copy()
display_df["Original Balance"] = display_df.apply(lambda r: f"{CURRENCY_SYMBOLS.get(r['Currency'], '$')}{r['Balance']:,.2f}", axis=1)
display_df[f"Simulated Value ({target_currency})"] = display_df[f"{target_currency}_Equivalent"].apply(lambda x: f"{symbol}{x:,.2f}")
display_df["USD Equivalent"] = display_df["USD_Equivalent"].apply(lambda x: f"${x:,.2f}")

st.dataframe(
    display_df[["Account ID", "Account Name", "Type", "Currency", "Original Balance", "USD Equivalent", f"Simulated Value ({target_currency})"]],
    use_container_width=True,
    hide_index=True
)

# Multi-Currency Target Matrix
st.subheader("🌐 Multi-Currency Target Matrix")
st.markdown("See your total portfolio value converted across all major target currencies simultaneously under current simulated rates:")

matrix_data = []
for curr, sym in CURRENCY_SYMBOLS.items():
    t_rate = simulated_rates.get(curr, 1.0)
    assets_val = processed_df[processed_df["Type"] == "Asset"]["USD_Equivalent"].sum() * t_rate
    liab_val = processed_df[processed_df["Type"] == "Liability"]["USD_Equivalent"].sum() * t_rate
    net_val = assets_val + liab_val
    matrix_data.append({
        "Currency": curr,
        "Exchange Rate (per USD)": f"{t_rate:,.4f}",
        "Total Assets": f"{sym}{assets_val:,.2f}",
        "Total Liabilities": f"{sym}{abs(liab_val):,.2f}",
        "Net Worth": f"{sym}{net_val:,.2f}"
    })

st.table(pd.DataFrame(matrix_data))

# Account Management Section (Add / Edit / Delete)
st.markdown("---")
with st.expander("⚙️ Manage Accounts & Portfolio Data"):
    tab1, tab2 = st.tabs(["➕ Add New Account", "🗑️ Delete / Edit Accounts"])
    
    with tab1:
        st.write("Add a new asset or liability account to your consolidated portfolio:")
        with st.form("add_account_form", clear_on_submit=True):
            col_a, col_b = st.columns(2)
            with col_a:
                new_id = f"ACC-{len(st.session_state.df) + 1:03d}"
                new_name = st.text_input("Account Name", placeholder="e.g. Vanguard ETF")
                new_type = st.selectbox("Account Type", ["Asset", "Liability"])
            with col_b:
                new_curr = st.selectbox("Account Currency", ["USD", "AUD", "EUR", "GBP", "JPY"])
                new_bal = st.number_input("Current Balance (Local Currency)", value=0.0, step=100.0)
            
            submit_btn = st.form_submit_button("Add Account to Ledger")
            if submit_btn:
                if not new_name:
                    st.error("Account Name cannot be empty.")
                else:
                    # Adjust balance sign based on type
                    final_bal = -abs(new_bal) if new_type == "Liability" else abs(new_bal)
                    new_row = pd.DataFrame([{
                        "Account ID": new_id,
                        "Account Name": new_name,
                        "Type": new_type,
                        "Currency": new_curr,
                        "Balance": final_bal
                    }])
                    st.session_state.df = pd.concat([st.session_state.df, new_row], ignore_index=True)
                    if save_data(st.session_state.df):
                        st.success(f"Successfully added {new_name}!")
                        st.rerun()

    with tab2:
        st.write("Remove accounts from your consolidated ledger:")
        account_to_delete = st.selectbox(
            "Select Account to Remove",
            options=st.session_state.df["Account Name"].tolist()
        )
        
        if st.button("Delete Selected Account", type="primary"):
            st.session_state.df = st.session_state.df[st.session_state.df["Account Name"] != account_to_delete]
            if save_data(st.session_state.df):
                st.success(f"Removed {account_to_delete} successfully.")
                st.rerun()

# Footer / Info
st.markdown("---")
st.caption(
    "Disclaimer: This dashboard is for simulation and portfolio consolidation purposes only. "
    "Exchange rates simulated here do not represent real-time financial market feeds unless manually configured."
)