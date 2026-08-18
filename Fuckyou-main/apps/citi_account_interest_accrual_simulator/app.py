import streamlit as pd
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from io import BytesIO

# Set page configuration
st.set_page_config(
    page_title="Citi Account Interest Accrual & Tax Simulator",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for premium financial styling (Citi-inspired blue theme)
st.markdown("""
    <style>
        .main {
            background-color: #f8f9fa;
        }
        .stMetric {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border-left: 5px solid #003B70;
        }
        .stButton>button {
            background-color: #003B70;
            color: white;
            border-radius: 5px;
            font-weight: bold;
        }
        .stButton>button:hover {
            background-color: #00274d;
            color: white;
        }
        h1, h2, h3 {
            color: #003B70;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        .reportview-container .main .block-container {
            padding-top: 2rem;
        }
        .sidebar .sidebar-content {
            background-color: #f1f3f5;
        }
    </style>
""", unsafe_allow_html=True)

# Title and Header
st.title("🏦 Citi Account Interest Accrual & Tax Simulator")
st.markdown("""
This application simulates interest accrual, compounding, and tax withholding over time for multi-currency accounts.
Adjust interest rates, tax rates, and compounding frequencies to run multi-year projections.
""")

# Default Mock Data
DEFAULT_ACCOUNTS = pd.DataFrame([
    {"Account Number": "Citi-USD-9821", "Account Name": "Citi Accelerate Savings", "Currency": "USD", "Balance": 150000.0, "Monthly Contribution": 1500.0},
    {"Account Number": "Citi-USD-4512", "Account Name": "Citi High Yield Savings", "Currency": "USD", "Balance": 45000.0, "Monthly Contribution": 500.0},
    {"Account Number": "Citi-EUR-0931", "Account Name": "Citi Premium Euro Account", "Currency": "EUR", "Balance": 85000.0, "Monthly Contribution": 200.0},
    {"Account Number": "Citi-GBP-8824", "Account Name": "Citi Sterling Wealth Account", "Currency": "GBP", "Balance": 120000.0, "Monthly Contribution": 400.0},
    {"Account Number": "Citi-SGD-3311", "Account Name": "Citi Singapore Dollar Savings", "Currency": "SGD", "Balance": 65000.0, "Monthly Contribution": 300.0},
])

# Default Exchange Rates to USD (for unified portfolio visualization)
DEFAULT_EXCHANGE_RATES = {
    "USD": 1.0,
    "EUR": 1.09,
    "GBP": 1.27,
    "SGD": 0.74
}

# Sidebar - File Upload & Global Settings
st.sidebar.header("📁 Data Input & Configuration")

uploaded_file = st.sidebar.file_uploader(
    "Upload Account Excel/CSV File", 
    type=["xlsx", "xls", "csv"],
    help="Upload an Excel or CSV file containing columns: Account Number, Account Name, Currency, Balance, Monthly Contribution (optional)"
)

# Load Data
if uploaded_file is not None:
    try:
        if uploaded_file.name.endswith(('.xlsx', '.xls')):
            df_input = pd.read_excel(uploaded_file)
        else:
            df_input = pd.read_csv(uploaded_file)
        
        # Ensure required columns exist
        required_cols = ["Account Number", "Account Name", "Currency", "Balance"]
        for col in required_cols:
            if col not in df_input.columns:
                st.sidebar.error(f"Missing required column: {col}")
                st.stop()
        
        if "Monthly Contribution" not in df_input.columns:
            df_input["Monthly Contribution"] = 0.0
            
        st.sidebar.success("File uploaded successfully!")
    except Exception as e:
        st.sidebar.error(f"Error loading file: {e}")
        df_input = DEFAULT_ACCOUNTS.copy()
else:
    st.sidebar.info("Using default Citi mock accounts. You can edit them below.")
    df_input = DEFAULT_ACCOUNTS.copy()

# Interactive Data Editor
st.subheader("📋 Account Portfolio Setup")
st.markdown("Review and edit your accounts, starting balances, and monthly contributions directly in the table below:")
edited_df = st.data_editor(
    df_input,
    num_rows="dynamic",
    column_config={
        "Account Number": st.column_config.TextColumn("Account Number", required=True),
        "Account Name": st.column_config.TextColumn("Account Name", required=True),
        "Currency": st.column_config.SelectboxColumn("Currency", options=["USD", "EUR", "GBP", "SGD", "AUD", "CAD", "JPY", "CHF"], required=True),
        "Balance": st.column_config.NumberColumn("Starting Balance", min_value=0.0, format="$%.2f", required=True),
        "Monthly Contribution": st.column_config.NumberColumn("Monthly Contribution", min_value=0.0, format="$%.2f")
    },
    use_container_width=True
)

# Sidebar - Simulation Parameters
st.sidebar.header("⚙️ Simulation Parameters")
years = st.sidebar.slider("Projection Period (Years)", min_value=1, max_value=30, value=5, step=1)
compounding_freq = st.sidebar.selectbox(
    "Compounding Frequency",
    options=["Monthly", "Quarterly", "Annually"],
    index=0
)

# Dynamic Currency Rates Configuration
st.sidebar.header("💱 Currency Rates & Taxes")
unique_currencies = edited_df["Currency"].unique()

rates_dict = {}
tax_dict = {}
exchange_rates = {}

# Default rates mapping for initialization
default_rates = {"USD": 4.5, "EUR": 2.5, "GBP": 3.5, "SGD": 3.0}
default_taxes = {"USD": 15.0, "EUR": 20.0, "GBP": 20.0, "SGD": 10.0}

for curr in unique_currencies:
    st.sidebar.markdown(f"**{curr} Settings**")
    col1, col2 = st.sidebar.columns(2)
    with col1:
        rates_dict[curr] = st.number_input(
            f"APY (%) - {curr}",
            min_value=0.0,
            max_value=20.0,
            value=default_rates.get(curr, 3.0),
            step=0.1,
            key=f"rate_{curr}"
        ) / 100.0
    with col2:
        tax_dict[curr] = st.number_input(
            f"Tax (%) - {curr}",
            min_value=0.0,
            max_value=50.0,
            value=default_taxes.get(curr, 15.0),
            step=0.5,
            key=f"tax_{curr}"
        ) / 100.0
        
    # Exchange rate to USD for unified reporting
    if curr != "USD":
        exchange_rates[curr] = st.sidebar.number_input(
            f"Exchange Rate ({curr}/USD)",
            min_value=0.01,
            max_value=1000.0,
            value=DEFAULT_EXCHANGE_RATES.get(curr, 1.0),
            step=0.01,
            key=f"fx_{curr}"
        )
    else:
        exchange_rates["USD"] = 1.0

# Simulation Engine
def run_simulation(df, years, compounding_freq, rates_dict, tax_dict):
    records = []
    months = years * 12
    
    for idx, row in df.iterrows():
        acc_num = row['Account Number']
        acc_name = row['Account Name']
        curr = row['Currency']
        bal = float(row['Balance'])
        contrib = float(row.get('Monthly Contribution', 0.0))
        
        rate = rates_dict.get(curr, 0.0)
        tax_rate = tax_dict.get(curr, 0.0)
        
        current_balance = bal
        cum_interest = 0.0
        cum_tax = 0.0
        accrued_interest_pool = 0.0
        
        # Month 0 (Initial State)
        records.append({
            "Month": 0,
            "Year": 0,
            "Account Number": acc_num,
            "Account Name": acc_name,
            "Currency": curr,
            "Starting Balance": bal,
            "Contribution": 0.0,
            "Interest Accrued": 0.0,
            "Tax Withheld": 0.0,
            "Ending Balance": bal,
            "Cumulative Interest": 0.0,
            "Cumulative Tax": 0.0
        })
        
        for m in range(1, months + 1):
            start_bal = current_balance
            
            # Add monthly contribution at the start of the month
            current_balance += contrib
            
            # Calculate interest accrued this month (simple monthly fraction of APY)
            interest_this_month = current_balance * (rate / 12.0)
            accrued_interest_pool += interest_this_month
            
            tax_this_month = 0.0
            interest_compounded_this_month = 0.0
            
            # Check if compounding occurs this month
            is_compounding_month = False
            if compounding_freq == "Monthly":
                is_compounding_month = True
            elif compounding_freq == "Quarterly" and m % 3 == 0:
                is_compounding_month = True
            elif compounding_freq == "Annually" and m % 12 == 0:
                is_compounding_month = True
            elif m == months:  # Force compounding at the final month of projection
                is_compounding_month = True
                
            if is_compounding_month:
                # Calculate tax on the accrued interest pool
                tax_this_month = accrued_interest_pool * tax_rate
                interest_compounded_this_month = accrued_interest_pool - tax_this_month
                
                # Add net interest to balance
                current_balance += interest_compounded_this_month
                
                # Reset accrued pool
                accrued_interest_pool = 0.0
            
            cum_interest += interest_this_month
            cum_tax += tax_this_month
            
            records.append({
                "Month": m,
                "Year": int(np.ceil(m / 12.0)),
                "Account Number": acc_num,
                "Account Name": acc_name,
                "Currency": curr,
                "Starting Balance": start_bal,
                "Contribution": contrib,
                "Interest Accrued": interest_this_month,
                "Tax Withheld": tax_this_month,
                "Ending Balance": current_balance,
                "Cumulative Interest": cum_interest,
                "Cumulative Tax": cum_tax
            })
            
    return pd.DataFrame(records)

# Run Simulation Button
if st.button("🚀 Run Multi-Year Projection"):
    with st.spinner("Simulating interest accrual and tax withholding..."):
        sim_df = run_simulation(edited_df, years, compounding_freq, rates_dict, tax_dict)
        
        # Add USD equivalent columns for unified portfolio view
        sim_df["Starting Balance (USD)"] = sim_df.apply(lambda r: r["Starting Balance"] * exchange_rates.get(r["Currency"], 1.0), axis=1)
        sim_df["Ending Balance (USD)"] = sim_df.apply(lambda r: r["Ending Balance"] * exchange_rates.get(r["Currency"], 1.0), axis=1)
        sim_df["Interest Accrued (USD)"] = sim_df.apply(lambda r: r["Interest Accrued"] * exchange_rates.get(r["Currency"], 1.0), axis=1)
        sim_df["Tax Withheld (USD)"] = sim_df.apply(lambda r: r["Tax Withheld"] * exchange_rates.get(r["Currency"], 1.0), axis=1)
        sim_df["Contribution (USD)"] = sim_df.apply(lambda r: r["Contribution"] * exchange_rates.get(r["Currency"], 1.0), axis=1)

        # --- METRICS DASHBOARD ---
        st.subheader("📊 Projection Summary (Unified in USD)")
        
        initial_portfolio_usd = sim_df[sim_df["Month"] == 0]["Starting Balance (USD)"].sum()
        final_portfolio_usd = sim_df[sim_df["Month"] == (years * 12)]["Ending Balance (USD)"].sum()
        total_contributions_usd = sim_df["Contribution (USD)"].sum()
        total_interest_usd = sim_df["Interest Accrued (USD)"].sum()
        total_tax_usd = sim_df["Tax Withheld (USD)"].sum()
        net_growth_usd = final_portfolio_usd - initial_portfolio_usd - total_contributions_usd
        
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Initial Portfolio Value", f"${initial_portfolio_usd:,.2f}")
        col2.metric("Projected Portfolio Value", f"${final_portfolio_usd:,.2f}", f"+{((final_portfolio_usd - initial_portfolio_usd)/initial_portfolio_usd)*100:.1f}%")
        col3.metric("Total Interest Accrued", f"${total_interest_usd:,.2f}")
        col4.metric("Total Tax Withheld", f"${total_tax_usd:,.2f}")
        
        col5, col6, col7, col8 = st.columns(4)
        col5.metric("Total Contributions", f"${total_contributions_usd:,.2f}")
        col6.metric("Net Growth (Interest - Tax)", f"${net_growth_usd:,.2f}")
        col7.metric("Effective Annual Yield (Avg)", f"{np.mean(list(rates_dict.values()))*100:.2f}%")
        col8.metric("Compounding Frequency", compounding_freq)

        # --- VISUALIZATIONS ---
        st.subheader("📈 Growth & Performance Analytics")
        
        tab1, tab2, tab3 = st.tabs(["Portfolio Growth", "Account Comparison", "Tax vs Net Interest"])
        
        with tab1:
            # Group by month to get total portfolio value over time
            monthly_portfolio = sim_df.groupby("Month").agg({
                "Starting Balance (USD)": "sum",
                "Ending Balance (USD)": "sum",
                "Cumulative Interest": "sum",
                "Cumulative Tax": "sum"
            }).reset_index()
            
            fig_growth = px.line(
                monthly_portfolio, 
                x="Month", 
                y="Ending Balance (USD)",
                title="Total Unified Portfolio Growth Over Time (USD)",
                labels={"Ending Balance (USD)": "Portfolio Value (USD)", "Month": "Month of Projection"},
                template="plotly_white"
            )
            fig_growth.update_traces(line_color='#003B70', line_width=3)
            st.plotly_chart(fig_growth, use_container_width=True)
            
        with tab2:
            # Compare starting vs ending balance per account
            final_month_data = sim_df[sim_df["Month"] == (years * 12)]
            start_month_data = sim_df[sim_df["Month"] == 0]
            
            comparison_df = pd.merge(
                start_month_data[["Account Number", "Account Name", "Balance", "Currency"]],
                final_month_data[["Account Number", "Ending Balance", "Cumulative Interest", "Cumulative Tax"]],
                on="Account Number"
            )
            
            fig_compare = go.Figure()
            fig_compare.add_trace(go.Bar(
                name='Starting Balance',
                x=comparison_df['Account Name'],
                y=comparison_df['Balance'],
                marker_color='#a2b9bc'
            ))
            fig_compare.add_trace(go.Bar(
                name='Projected Ending Balance',
                x=comparison_df['Account Name'],
                y=comparison_df['Ending Balance'],
                marker_color='#003B70'
            ))
            
            fig_compare.update_layout(
                barmode='group',
                title="Starting vs. Projected Ending Balance per Account (Local Currency)",
                xaxis_title="Account Name",
                yaxis_title="Balance",
                template="plotly_white"
            )
            st.plotly_chart(fig_compare, use_container_width=True)
            
        with tab3:
            # Pie chart of Net Interest vs Tax Withheld
            fig_pie = go.Figure(data=[go.Pie(
                labels=['Net Interest Retained', 'Tax Withheld'],
                values=[total_interest_usd - total_tax_usd, total_tax_usd],
                hole=.4,
                marker_colors=['#003B70', '#e06666']
            )])
            fig_pie.update_layout(
                title="Total Interest Allocation (Unified USD)",
                template="plotly_white"
            )
            st.plotly_chart(fig_pie, use_container_width=True)

        # --- DETAILED PROJECTIONS TABLE ---
        st.subheader("🗂️ Detailed Projection Ledger")
        
        # Filter by account for detailed view
        account_options = ["All Accounts"] + list(edited_df["Account Name"].unique())
        selected_acc = st.selectbox("Filter Ledger by Account:", options=account_options)
        
        if selected_acc == "All Accounts":
            ledger_display = sim_df.copy()
        else:
            ledger_display = sim_df[sim_df["Account Name"] == selected_acc].copy()
            
        # Format columns for display
        formatted_ledger = ledger_display[[
            "Month", "Year", "Account Number", "Account Name", "Currency", 
            "Starting Balance", "Contribution", "Interest Accrued", "Tax Withheld", "Ending Balance"
        ]].copy()
        
        st.dataframe(
            formatted_ledger.style.format({
                "Starting Balance": "{:,.2f}",
                "Contribution": "{:,.2f}",
                "Interest Accrued": "{:,.2f}",
                "Tax Withheld": "{:,.2f}",
                "Ending Balance": "{:,.2f}"
            }),
            use_container_width=True
        )
        
        # Export to Excel/CSV
        st.subheader("📥 Export Simulation Results")
        
        # CSV Export
        csv = formatted_ledger.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Projection Ledger as CSV",
            data=csv,
            file_name="citi_interest_projection_ledger.csv",
            mime="text/csv"
        )
        
        # Excel Export
        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            formatted_ledger.to_excel(writer, index=False, sheet_name='Projection Ledger')
            # Auto-adjust columns width
            worksheet = writer.sheets['Projection Ledger']
            for idx, col in enumerate(formatted_ledger.columns):
                series = formatted_ledger[col]
                max_len = max((
                    series.astype(str).map(len).max(),
                    len(str(col))
                )) + 2
                worksheet.set_column(idx, idx, max_len)
        
        excel_data = output.getvalue()
        st.download_button(
            label="📥 Download Projection Ledger as Excel",
            data=excel_data,
            file_name="citi_interest_projection_ledger.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

else:
    st.info("💡 Click the 'Run Multi-Year Projection' button in the sidebar or main panel to generate the simulation results.")

# Educational Section / Methodology
with st.expander("📘 Simulation Methodology & Formulas"):
    st.markdown("""
    ### Interest Accrual & Compounding Logic
    
    1. **Monthly Contribution**: Added to the account balance at the *beginning* of each month.
    2. **Interest Accrual**: Calculated monthly using the formula:
       $$\\text{Interest Accrued} = \\text{Balance} \\times \\left(\\frac{\\text{APY}}{12}\\right)$$
       This interest is added to an *accrued interest pool* and does not compound immediately unless the compounding frequency is monthly.
    3. **Compounding & Tax Withholding**:
       - **Monthly**: Compounding and tax withholding occur every month.
       - **Quarterly**: Compounding and tax withholding occur every 3rd month (Months 3, 6, 9, 12, etc.).
       - **Annually**: Compounding and tax withholding occur every 12th month (Months 12, 24, 36, etc.).
       - At the compounding interval, tax is calculated on the accumulated interest pool:
         $$\\text{Tax Withheld} = \\text{Accrued Interest Pool} \\times \\text{Tax Rate}$$
         $$\\text{Net Interest Compounded} = \\text{Accrued Interest Pool} - \\text{Tax Withheld}$$
         The *Net Interest Compounded* is then added to the principal balance, and the accrued pool resets to 0.
    """)