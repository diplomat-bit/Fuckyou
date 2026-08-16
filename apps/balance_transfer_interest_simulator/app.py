import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px

# Set page configuration
st.set_page_config(
    page_title="Balance Transfer Interest Simulator",
    page_icon="💳",
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
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-left: 5px solid #007bff;
        margin-bottom: 15px;
    }
    .metric-card-savings {
        background-color: #e2f0d9;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-left: 5px solid #385723;
        margin-bottom: 15px;
    }
    .stButton>button {
        width: 100%;
    }
    </style>
""", unsafe_allow_html=True)

# --- MOCK API FOR BALANCE TRANSFER ELIGIBILITY ---
def get_balance_transfer_offers(credit_score, balance):
    """
    Simulates an API call to retrieve eligible balance transfer offers
    based on the user's credit score and current debt balance.
    """
    # Base offers database
    all_offers = [
        {
            "id": "bt_zero_12",
            "provider": "Apex Card Services",
            "name": "Platinum Zero Intro",
            "tenor_months": 12,
            "promo_apr": 0.0,
            "processing_fee_pct": 3.0,
            "min_credit_score": 670,
            "max_transfer_limit": 15000,
            "post_promo_apr": 21.99
        },
        {
            "id": "bt_zero_18",
            "provider": "Horizon Finance",
            "name": "ClearPath Transfer",
            "tenor_months": 18,
            "promo_apr": 0.0,
            "processing_fee_pct": 4.0,
            "min_credit_score": 700,
            "max_transfer_limit": 25000,
            "post_promo_apr": 22.49
        },
        {
            "id": "bt_low_apr_24",
            "provider": "Summit Trust",
            "name": "Extended Pay Plan",
            "tenor_months": 24,
            "promo_apr": 1.99,
            "processing_fee_pct": 2.5,
            "min_credit_score": 720,
            "max_transfer_limit": 30000,
            "post_promo_apr": 19.99
        },
        {
            "id": "bt_fair_12",
            "provider": "Beacon Credit",
            "name": "Fresh Start Transfer",
            "tenor_months": 12,
            "promo_apr": 3.99,
            "processing_fee_pct": 4.5,
            "min_credit_score": 580,
            "max_transfer_limit": 8000,
            "post_promo_apr": 24.99
        },
        {
            "id": "bt_ultra_21",
            "provider": "Vanguard Premium",
            "name": "Elite Balance Transfer",
            "tenor_months": 21,
            "promo_apr": 0.0,
            "processing_fee_pct": 5.0,
            "min_credit_score": 740,
            "max_transfer_limit": 50000,
            "post_promo_apr": 18.99
        }
    ]
    
    # Filter offers based on credit score and balance limits
    eligible_offers = []
    for offer in all_offers:
        if credit_score >= offer["min_credit_score"] and balance <= offer["max_transfer_limit"]:
            eligible_offers.append(offer)
            
    return eligible_offers

# --- AMORTIZATION CALCULATORS ---
def calculate_current_amortization(balance, apr, monthly_payment):
    """
    Calculates the payoff schedule for the current high-interest credit card.
    """
    monthly_rate = (apr / 100) / 12
    records = []
    current_balance = balance
    total_interest = 0
    month = 0
    
    # Safety check to prevent infinite loop if payment is less than interest
    if monthly_payment <= current_balance * monthly_rate:
        return None, "Your monthly payment is too low to cover the accruing interest. The debt will never be paid off."

    while current_balance > 0 and month < 360: # Max 30 years
        month += 1
        interest_accrued = current_balance * monthly_rate
        principal_paid = min(monthly_payment - interest_accrued, current_balance)
        current_balance -= principal_paid
        total_interest += interest_accrued
        
        records.append({
            "Month": month,
            "Payment": principal_paid + interest_accrued,
            "Principal Paid": principal_paid,
            "Interest Paid": interest_accrued,
            "Cumulative Interest": total_interest,
            "Remaining Balance": max(0.0, current_balance)
        })
        
    return pd.DataFrame(records), None

def calculate_bt_amortization(balance, promo_apr, tenor, processing_fee_pct):
    """
    Calculates the payoff schedule for the Balance Transfer option.
    Assumes the processing fee is added to the initial balance and fully paid off within the tenor.
    """
    fee_amount = balance * (processing_fee_pct / 100)
    initial_bt_balance = balance + fee_amount
    monthly_rate = (promo_apr / 100) / 12
    
    # Calculate required monthly payment to fully amortize over the tenor
    if monthly_rate > 0:
        monthly_payment = initial_bt_balance * (monthly_rate * (1 + monthly_rate)**tenor) / ((1 + monthly_rate)**tenor - 1)
    else:
        monthly_payment = initial_bt_balance / tenor
        
    records = []
    current_balance = initial_bt_balance
    total_interest = 0
    
    for month in range(1, tenor + 1):
        interest_accrued = current_balance * monthly_rate
        principal_paid = min(monthly_payment - interest_accrued, current_balance)
        current_balance -= principal_paid
        total_interest += interest_accrued
        
        records.append({
            "Month": month,
            "Payment": principal_paid + interest_accrued,
            "Principal Paid": principal_paid,
            "Interest Paid": interest_accrued,
            "Cumulative Interest": total_interest,
            "Remaining Balance": max(0.0, current_balance)
        })
        
    return pd.DataFrame(records), fee_amount, monthly_payment

# --- APP HEADER ---
st.title("💳 Balance Transfer Interest Savings Simulator")
st.markdown("""
    Compare your current high-interest credit card debt against eligible balance transfer offers. 
    See how much you can save on interest and how much faster you can become debt-free!
""")

# --- SIDEBAR INPUTS ---
st.sidebar.header("1. Your Current Debt Profile")
current_balance = st.sidebar.number_input("Current Credit Card Balance ($)", min_value=500, max_value=100000, value=5000, step=500)
current_apr = st.sidebar.slider("Current APR (%)", min_value=5.0, max_value=36.0, value=22.9, step=0.1)

payment_strategy = st.sidebar.radio("Monthly Payment Strategy", ["Fixed Monthly Payment", "Target Payoff Timeline"])

if payment_strategy == "Fixed Monthly Payment":
    # Default to a reasonable payment (approx 3% of balance or minimum $100)
    default_payment = max(100.0, round(current_balance * 0.03, -1))
    current_payment = st.sidebar.number_input("Current Monthly Payment ($)", min_value=10.0, max_value=10000.0, value=default_payment, step=10.0)
    target_months = None
else:
    target_months = st.sidebar.slider("Target Payoff Timeline (Months)", min_value=6, max_value=60, value=24, step=1)
    # Calculate required payment for target months
    r = (current_apr / 100) / 12
    if r > 0:
        current_payment = current_balance * (r * (1 + r)**target_months) / ((1 + r)**target_months - 1)
    else:
        current_payment = current_balance / target_months
    st.sidebar.info(f"Required Monthly Payment: **${current_payment:,.2f}**")

st.sidebar.header("2. Credit Profile (For API Eligibility)")
credit_score = st.sidebar.slider("Your Credit Score", min_value=300, max_value=850, value=710, step=5)

# --- API CALL SIMULATION ---
eligible_offers = get_balance_transfer_offers(credit_score, current_balance)

# --- MAIN CONTENT ---

# Calculate Current Amortization
current_df, error_msg = calculate_current_amortization(current_balance, current_apr, current_payment)

if error_msg:
    st.error(error_msg)
    st.stop()

current_total_interest = current_df["Interest Paid"].sum()
current_payoff_months = len(current_df)
current_total_cost = current_balance + current_total_interest

# Tabs for different views
tab1, tab2, tab3 = st.tabs(["🔍 Eligible Offers & Savings", "📊 Detailed Comparison Charts", "📚 How Balance Transfers Work"])

with tab1:
    st.subheader("Eligible Balance Transfer Offers")
    st.caption(f"Retrieved {len(eligible_offers)} offers from the Balance Transfer Eligibility API based on your profile.")
    
    if not eligible_offers:
        st.warning("No eligible balance transfer offers found for your current credit score and balance. Try adjusting your inputs or improving your credit score.")
    else:
        # Display offers in a grid
        for idx, offer in enumerate(eligible_offers):
            # Calculate BT Amortization for this offer
            bt_df, fee_amount, bt_payment = calculate_bt_amortization(current_balance, offer["promo_apr"], offer["tenor_months"], offer["processing_fee_pct"])
            
            bt_total_interest = bt_df["Interest Paid"].sum()
            bt_total_cost = current_balance + fee_amount + bt_total_interest
            net_savings = current_total_cost - bt_total_cost
            
            col1, col2, col3, col4 = st.columns([2, 1, 1, 1.5])
            
            with col1:
                st.markdown(f"### {offer['provider']}")
                st.markdown(f"**{offer['name']}**")
                st.write(f"Tenor: **{offer['tenor_months']} Months** | Promo APR: **{offer['promo_apr']}%**")
                st.caption(f"Processing Fee: {offer['processing_fee_pct']}% (${fee_amount:,.2f}) | Post-Promo APR: {offer['post_promo_apr']}%")
                
            with col2:
                st.metric("New Monthly Payment", f"${bt_payment:,.2f}")
                
            with col3:
                st.metric("Total Cost (with Fee)", f"${bt_total_cost:,.2f}")
                
            with col4:
                if net_savings > 0:
                    st.metric("Estimated Savings", f"${net_savings:,.2f}", delta=f"Save {net_savings/current_total_cost*100:.1f}%", delta_color="normal")
                else:
                    st.metric("Estimated Savings", f"${net_savings:,.2f}", delta="No Savings", delta_color="inverse")
            
            # Expandable details for each offer
            with st.expander(f"View payoff comparison for {offer['provider']}"):
                comp_col1, comp_col2 = st.columns(2)
                with comp_col1:
                    st.markdown("#### Current Plan vs. Balance Transfer")
                    comparison_data = {
                        "Metric": ["Payoff Period", "Monthly Payment", "Upfront Fee", "Total Interest Paid", "Total Cost"],
                        "Current Card": [f"{current_payoff_months} months", f"${current_payment:,.2f}", "$0.00", f"${current_total_interest:,.2f}", f"${current_total_cost:,.2f}"],
                        f"BT ({offer['provider']})": [f"{offer['tenor_months']} months", f"${bt_payment:,.2f}", f"${fee_amount:,.2f}", f"${bt_total_interest:,.2f}", f"${bt_total_cost:,.2f}"]
                    }
                    st.table(pd.DataFrame(comparison_data))
                
                with comp_col2:
                    st.markdown("#### Savings Breakdown")
                    # Pie chart of costs
                    fig_pie = go.Figure(data=[go.Pie(
                        labels=['Original Principal', 'Processing Fee', 'Interest Paid'],
                        values=[current_balance, fee_amount, bt_total_interest],
                        hole=.3,
                        marker_colors=['#007bff', '#ffc107', '#dc3545']
                    )])
                    fig_pie.update_layout(title_text="Balance Transfer Cost Breakdown", height=250, margin=dict(l=20, r=20, t=40, b=20))
                    st.plotly_chart(fig_pie, use_container_width=True)
                    
            st.markdown("---")

with tab2:
    st.subheader("Visualizing Your Savings")
    
    if eligible_offers:
        selected_offer_name = st.selectbox("Select a Balance Transfer Offer to Compare:", [f"{o['provider']} - {o['name']}" for o in eligible_offers])
        selected_offer = next(o for o in eligible_offers if f"{o['provider']} - {o['name']}" == selected_offer_name)
        
        # Recalculate selected BT
        bt_df, fee_amount, bt_payment = calculate_bt_amortization(current_balance, selected_offer["promo_apr"], selected_offer["tenor_months"], selected_offer["processing_fee_pct"])
        bt_total_interest = bt_df["Interest Paid"].sum()
        bt_total_cost = current_balance + fee_amount + bt_total_interest
        net_savings = current_total_cost - bt_total_cost
        
        # Metric Cards
        m1, m2, m3 = st.columns(3)
        with m1:
            st.markdown(f"""
                <div class="metric-card">
                    <h3>Current Payoff Cost</h3>
                    <h2 style="color: #dc3545;">${current_total_cost:,.2f}</h2>
                    <p>Paid over {current_payoff_months} months</p>
                </div>
            """, unsafe_allow_html=True)
        with m2:
            st.markdown(f"""
                <div class="metric-card">
                    <h3>Balance Transfer Cost</h3>
                    <h2 style="color: #007bff;">${bt_total_cost:,.2f}</h2>
                    <p>Paid over {selected_offer['tenor_months']} months</p>
                </div>
            """, unsafe_allow_html=True)
        with m3:
            st.markdown(f"""
                <div class="metric-card-savings">
                    <h3>Total Interest Savings</h3>
                    <h2 style="color: #28a745;">${net_savings:,.2f}</h2>
                    <p>With {selected_offer['provider']}</p>
                </div>
            """, unsafe_allow_html=True)
            
        # Chart 1: Cumulative Interest Over Time
        st.markdown("### Cumulative Interest Accrual Comparison")
        
        # Align timelines for chart
        max_months = max(current_payoff_months, selected_offer["tenor_months"])
        timeline = list(range(0, max_months + 1))
        
        current_interest_curve = [0]
        for m in range(1, max_months + 1):
            if m <= current_payoff_months:
                current_interest_curve.append(current_df.loc[current_df["Month"] == m, "Cumulative Interest"].values[0])
            else:
                current_interest_curve.append(current_total_interest)
                
        bt_interest_curve = [0]
        for m in range(1, max_months + 1):
            if m <= selected_offer["tenor_months"]:
                bt_interest_curve.append(bt_df.loc[bt_df["Month"] == m, "Cumulative Interest"].values[0] + fee_amount) # Treat fee as upfront cost
            else:
                bt_interest_curve.append(bt_total_interest + fee_amount)
                
        fig_line = go.Figure()
        fig_line.add_trace(go.Scatter(x=timeline, y=current_interest_curve, name="Current Card (Interest Only)", line=dict(color='#dc3545', width=3)))
        fig_line.add_trace(go.Scatter(x=timeline, y=bt_interest_curve, name="Balance Transfer (Interest + Fee)", line=dict(color='#007bff', width=3)))
        
        fig_line.update_layout(
            xaxis_title="Month",
            yaxis_title="Cumulative Cost ($)",
            hovermode="x unified",
            legend=dict(yanchor="top", y=0.99, xanchor="left", x=0.01)
        )
        st.plotly_chart(fig_line, use_container_width=True)
        
        # Chart 2: Balance Paydown Timeline
        st.markdown("### Balance Paydown Timeline")
        
        current_balance_curve = [current_balance]
        for m in range(1, max_months + 1):
            if m <= current_payoff_months:
                current_balance_curve.append(current_df.loc[current_df["Month"] == m, "Remaining Balance"].values[0])
            else:
                current_balance_curve.append(0)
                
        bt_balance_curve = [current_balance + fee_amount]
        for m in range(1, max_months + 1):
            if m <= selected_offer["tenor_months"]:
                bt_balance_curve.append(bt_df.loc[bt_df["Month"] == m, "Remaining Balance"].values[0])
            else:
                bt_balance_curve.append(0)
                
        fig_balance = go.Figure()
        fig_balance.add_trace(go.Scatter(x=timeline, y=current_balance_curve, name="Current Card Balance", line=dict(color='#dc3545', width=3, dash='dash')))
        fig_balance.add_trace(go.Scatter(x=timeline, y=bt_balance_curve, name="Balance Transfer Balance", line=dict(color='#007bff', width=3)))
        
        fig_balance.update_layout(
            xaxis_title="Month",
            yaxis_title="Remaining Balance ($)",
            hovermode="x unified",
            legend=dict(yanchor="top", y=0.99, xanchor="right", x=0.99)
        )
        st.plotly_chart(fig_balance, use_container_width=True)
        
    else:
        st.info("Please adjust your credit score or balance in the sidebar to view eligible offers and charts.")

with tab3:
    st.subheader("Educational Guide: Understanding Balance Transfers")
    
    st.markdown("""
    ### What is a Balance Transfer?
    A balance transfer is a financial strategy where you move outstanding debt from one high-interest credit card to a new card with a lower interest rate (often **0% introductory APR**) for a promotional period (usually 6 to 21 months).
    
    ### Key Terms to Know:
    1. **Introductory/Promo APR:** The temporary low interest rate offered on transferred balances.
    2. **Tenor (Promo Period):** The duration of the promotional rate. You should aim to pay off the entire balance before this period ends.
    3. **Processing/Transfer Fee:** A one-time fee charged by the new card issuer to perform the transfer. This is typically **3% to 5%** of the transferred amount and is added to your new balance.
    4. **Post-Promo APR:** The standard interest rate that applies to any remaining balance after the promotional period expires. This rate is usually high (18% - 25%+).
    
    ### Pros & Cons of Balance Transfers
    
    | Pros | Cons |
    | :--- | :--- |
    | **Save Money:** Drastically reduces the amount of interest you pay. | **Upfront Fees:** The 3% to 5% transfer fee can add up on large balances. |
    | **Consolidate Debt:** Combine multiple card payments into one monthly bill. | **Strict Deadlines:** If you don't pay off the balance in time, high interest resumes. |
    | **Faster Payoff:** More of your monthly payment goes toward the principal balance. | **Credit Check:** Applying for a new card triggers a hard inquiry, temporarily affecting your credit score. |
    
    ### 💡 Pro-Tips for Success:
    * **Do not make new purchases** on the balance transfer card. New purchases often do not qualify for the 0% APR and can complicate your payoff strategy.
    * **Set up autopay** to ensure you never miss a payment. A single late payment can void your promotional 0% APR.
    * **Calculate the fee impact:** Always ensure the interest saved is significantly higher than the upfront processing fee.
    """)

# --- FOOTER ---
st.markdown("---")
st.markdown("<p style='text-align: center; color: gray;'>Disclaimer: This simulator is for educational purposes only. Actual balance transfer offers, eligibility, and terms are subject to credit approval by the respective financial institutions.</p>", unsafe_allow_html=True)