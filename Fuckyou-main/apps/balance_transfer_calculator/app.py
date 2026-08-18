import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px

# Page Configuration
st.set_page_config(
    page_title="Smart Balance Transfer Calculator",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        color: #1E3A8A;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #4B5563;
        margin-bottom: 2rem;
    }
    .card {
        background-color: #F3F4F6;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 5px solid #3B82F6;
        margin-bottom: 1rem;
    }
    .metric-card {
        background-color: #FFFFFF;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #E5E7EB;
        text-align: center;
    }
    .metric-value {
        font-size: 1.8rem;
        font-weight: 700;
        color: #10B981;
    }
    .metric-label {
        font-size: 0.9rem;
        color: #6B7280;
    }
    </style>
""", unsafe_style_with_html=True)

# Initialize Session State for Custom Offers
if 'offers' not in st.session_state:
    st.session_state.offers = [
        {"name": "Zero Interest Promo (12M)", "tenor_months": 12, "promo_apr": 0.0, "fee_percent": 3.0, "post_promo_apr": 21.99},
        {"name": "Low Rate Extended (18M)", "tenor_months": 18, "promo_apr": 1.99, "fee_percent": 2.0, "post_promo_apr": 22.99},
        {"name": "Long-Term Relief (24M)", "tenor_months": 24, "promo_apr": 3.99, "fee_percent": 1.5, "post_promo_apr": 24.99}
    ]

# Helper Functions
def calculate_exact_payment(balance, apr, months):
    """Calculate fixed monthly payment to amortize balance over given months."""
    r = (apr / 100.0) / 12.0
    if r == 0:
        return balance / months
    return balance * (r * (1 + r)**months) / ((1 + r)**months - 1)

def simulate_payoff(balance, apr, monthly_payment, fee=0, fee_added_to_balance=True, max_months=120, promo_months=None, post_promo_apr=None):
    """Simulate month-by-month payoff schedule."""
    current_balance = balance
    if fee_added_to_balance:
        current_balance += fee
        
    records = []
    total_interest = 0.0
    total_fees = fee
    
    # Month 0
    records.append({
        "Month": 0,
        "Balance": round(current_balance, 2),
        "Interest Paid": 0.0,
        "Principal Paid": 0.0,
        "Cumulative Interest": 0.0,
        "Cumulative Payments": fee if not fee_added_to_balance else 0.0
    })
    
    cum_interest = 0.0
    cum_payments = fee if not fee_added_to_balance else 0.0
    
    for month in range(1, max_months + 1):
        if current_balance <= 0.01:
            break
            
        # Determine active APR
        active_apr = apr
        if promo_months is not None and post_promo_apr is not None:
            if month > promo_months:
                active_apr = post_promo_apr
        
        monthly_rate = (active_apr / 100.0) / 12.0
        interest_this_month = current_balance * monthly_rate
        
        # Check if payment covers interest
        if monthly_payment <= interest_this_month:
            # Debt grows infinitely, cap simulation to prevent infinite loop
            payment_applied = monthly_payment
        else:
            payment_applied = min(monthly_payment, current_balance + interest_this_month)
            
        principal_this_month = payment_applied - interest_this_month
        current_balance = current_balance + interest_this_month - payment_applied
        
        if current_balance < 0.01:
            current_balance = 0.0
            
        total_interest += interest_this_month
        cum_interest += interest_this_month
        cum_payments += payment_applied
        
        records.append({
            "Month": month,
            "Balance": round(current_balance, 2),
            "Interest Paid": round(interest_this_month, 2),
            "Principal Paid": round(principal_this_month, 2),
            "Cumulative Interest": round(cum_interest, 2),
            "Cumulative Payments": round(cum_payments, 2)
        })
        
    return pd.DataFrame(records), total_interest, total_fees

# Sidebar - Inputs
st.sidebar.header("💳 Current Debt Profile")
current_balance = st.sidebar.number_input("Current Card Balance ($)", min_value=500.0, max_value=100000.0, value=10000.0, step=500.0)
current_apr = st.sidebar.slider("Current Card APR (%)", min_value=5.0, max_value=36.0, value=22.0, step=0.5)
current_monthly_payment = st.sidebar.number_input("Current Monthly Payment ($)", min_value=50.0, max_value=10000.0, value=350.0, step=50.0)

st.sidebar.markdown("---")
st.sidebar.header("⚙️ Balance Transfer Settings")
fee_treatment = st.sidebar.radio(
    "How to pay the transfer fee?",
    ["Add fee to transferred balance", "Pay fee upfront out-of-pocket"],
    index=0
)
fee_added = (fee_treatment == "Add fee to transferred balance")

# Sidebar - Add Custom Offer
st.sidebar.markdown("---")
with st.sidebar.expander("➕ Add Custom Offer", expanded=False):
    custom_name = st.text_input("Offer Name", value="My Custom Offer")
    custom_tenor = st.number_input("Tenor (Months)", min_value=3, max_value=60, value=12, step=1)
    custom_promo_apr = st.number_input("Promo APR (%)", min_value=0.0, max_value=20.0, value=0.0, step=0.1)
    custom_fee = st.number_input("Transfer Fee (%)", min_value=0.0, max_value=10.0, value=3.0, step=0.1)
    custom_post_apr = st.number_input("Post-Promo APR (%)", min_value=5.0, max_value=36.0, value=24.99, step=0.1)
    
    if st.button("Add Offer to List"):
        new_offer = {
            "name": custom_name,
            "tenor_months": int(custom_tenor),
            "promo_apr": float(custom_promo_apr),
            "fee_percent": float(custom_fee),
            "post_promo_apr": float(custom_post_apr)
        }
        st.session_state.offers.append(new_offer)
        st.success(f"Added '{custom_name}' successfully!")

if st.sidebar.button("Reset to Default Offers"):
    st.session_state.offers = [
        {"name": "Zero Interest Promo (12M)", "tenor_months": 12, "promo_apr": 0.0, "fee_percent": 3.0, "post_promo_apr": 21.99},
        {"name": "Low Rate Extended (18M)", "tenor_months": 18, "promo_apr": 1.99, "fee_percent": 2.0, "post_promo_apr": 22.99},
        {"name": "Long-Term Relief (24M)", "tenor_months": 24, "promo_apr": 3.99, "fee_percent": 1.5, "post_promo_apr": 24.99}
    ]
    st.rerun()

# Main Panel Header
st.markdown('<div class="main-header">Smart Balance Transfer Calculator</div>', unsafe_style_with_html=True)
st.markdown('<div class="sub-header">Compare balance transfer offers side-by-side, analyze payoff strategies, and visualize your savings.</div>', unsafe_style_with_html=True)

# Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Offer Comparison Dashboard", 
    "🔍 Detailed Offer Breakdown", 
    "💡 Custom Payoff Scenarios", 
    "📚 Educational Guide"
])

# Check if current payment covers interest
min_interest_current = current_balance * (current_apr / 100.0) / 12.0
if current_monthly_payment <= min_interest_current:
    st.warning(f"⚠️ Your current monthly payment of **${current_monthly_payment:,.2f}** is less than or equal to the monthly interest accrued (**${min_interest_current:,.2f}**). Under your current plan, this debt will grow indefinitely. Consider increasing your payment or utilizing a balance transfer.")

with tab1:
    st.subheader("Choose Your Payoff Strategy")
    strategy = st.radio(
        "How do you want to compare these offers?",
        [
            "Strategy A: Pay off the balance fully within the promotional period (Recommended)",
            "Strategy B: Keep my current monthly payment constant across all options"
        ],
        help="Strategy A calculates the exact monthly payment needed to reach $0 balance by the end of the promo period. Strategy B keeps your monthly payment identical to your current card payment and shows how much faster you pay off the debt."
    )
    
    # Run Simulations
    results = []
    trajectories = {}
    
    # Baseline: Current Card
    if "Strategy A" in strategy:
        # For Strategy A, we compare each offer's tenor. So current card payoff is simulated for each specific tenor.
        pass 
    else:
        # Strategy B: Constant payment
        df_curr, int_curr, fee_curr = simulate_payoff(
            balance=current_balance,
            apr=current_apr,
            monthly_payment=current_monthly_payment,
            fee=0,
            fee_added_to_balance=False
        )
        trajectories["Current Card"] = df_curr
        curr_months = len(df_curr) - 1
        curr_total_cost = int_curr
        curr_total_paid = current_balance + int_curr

    # Process Offers
    for offer in st.session_state.offers:
        fee_amount = current_balance * (offer["fee_percent"] / 100.0)
        
        if "Strategy A" in strategy:
            # Calculate exact payment needed to pay off within promo tenor
            target_balance = current_balance + fee_amount if fee_added else current_balance
            required_payment = calculate_exact_payment(target_balance, offer["promo_apr"], offer["tenor_months"])
            
            # Simulate Offer
            df_off, int_off, fee_off = simulate_payoff(
                balance=current_balance,
                apr=offer["promo_apr"],
                monthly_payment=required_payment,
                fee=fee_amount,
                fee_added_to_balance=fee_added,
                max_months=offer["tenor_months"],
                promo_months=offer["tenor_months"],
                post_promo_apr=offer["post_promo_apr"]
            )
            
            # Simulate Current Card over the same tenor for fair comparison
            curr_payment_for_tenor = calculate_exact_payment(current_balance, current_apr, offer["tenor_months"])
            df_curr_tenor, int_curr_tenor, _ = simulate_payoff(
                balance=current_balance,
                apr=current_apr,
                monthly_payment=curr_payment_for_tenor,
                fee=0,
                fee_added_to_balance=False,
                max_months=offer["tenor_months"]
            )
            
            total_cost_off = int_off + fee_off
            total_cost_curr = int_curr_tenor
            savings = total_cost_curr - total_cost_off
            
            results.append({
                "Offer Name": offer["name"],
                "Tenor (Months)": offer["tenor_months"],
                "Promo APR": f"{offer['promo_apr']}%",
                "Transfer Fee": f"{offer['fee_percent']}% (${fee_amount:,.2f})",
                "Monthly Payment": required_payment,
                "Current Card Payment (Same Tenor)": curr_payment_for_tenor,
                "Monthly Savings": curr_payment_for_tenor - required_payment,
                "Total Interest Paid": int_off,
                "Total Fees Paid": fee_off,
                "Total Cost (Interest + Fees)": total_cost_off,
                "Net Savings": savings,
                "Payoff Time": f"{offer['tenor_months']} Months"
            })
            trajectories[offer["name"]] = df_off
            trajectories[f"Current Card ({offer['tenor_months']}M Payoff)"] = df_curr_tenor
            
        else:
            # Strategy B: Constant Payment
            df_off, int_off, fee_off = simulate_payoff(
                balance=current_balance,
                apr=offer["promo_apr"],
                monthly_payment=current_monthly_payment,
                fee=fee_amount,
                fee_added_to_balance=fee_added,
                max_months=120,
                promo_months=offer["tenor_months"],
                post_promo_apr=offer["post_promo_apr"]
            )
            
            months_to_pay = len(df_off) - 1
            total_cost_off = int_off + fee_off
            savings = curr_total_cost - total_cost_off
            time_saved = curr_months - months_to_pay
            
            results.append({
                "Offer Name": offer["name"],
                "Tenor (Months)": offer["tenor_months"],
                "Promo APR": f"{offer['promo_apr']}%",
                "Transfer Fee": f"{offer['fee_percent']}% (${fee_amount:,.2f})",
                "Monthly Payment": current_monthly_payment,
                "Total Interest Paid": int_off,
                "Total Fees Paid": fee_off,
                "Total Cost (Interest + Fees)": total_cost_off,
                "Net Savings": savings,
                "Payoff Time": f"{months_to_pay} Months",
                "Months Saved": time_saved
            })
            trajectories[offer["name"]] = df_off

    # Display Metrics
    df_results = pd.DataFrame(results)
    
    if not df_results.empty:
        best_offer = df_results.loc[df_results["Net Savings"].idxmax()]
        
        st.markdown("### 🏆 Best Option Summary")
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">Recommended Offer</div>
                    <div class="metric-value" style="color: #1E3A8A; font-size: 1.4rem;">{best_offer['Offer Name']}</div>
                </div>
            """, unsafe_style_with_html=True)
        with col2:
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">Estimated Net Savings</div>
                    <div class="metric-value">${best_offer['Net Savings']:,.2f}</div>
                </div>
            """, unsafe_style_with_html=True)
        with col3:
            if "Strategy A" in strategy:
                st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-label">Monthly Payment Savings</div>
                        <div class="metric-value">${best_offer['Monthly Savings']:,.2f}/mo</div>
                    </div>
                """, unsafe_style_with_html=True)
            else:
                st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-label">Time Saved to Debt-Free</div>
                        <div class="metric-value">{best_offer['Months Saved']} Months</div>
                    </div>
                """, unsafe_style_with_html=True)
        with col4:
            st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-label">Total Cost of Best Offer</div>
                    <div class="metric-value" style="color: #EF4444;">${best_offer['Total Cost (Interest + Fees)']:,.2f}</div>
                </div>
            """, unsafe_style_with_html=True)

        st.markdown("---")
        st.subheader("📊 Side-by-Side Comparison Table")
        
        # Format Table for Display
        display_cols = ["Offer Name", "Promo APR", "Transfer Fee", "Payoff Time", "Total Interest Paid", "Total Fees Paid", "Total Cost (Interest + Fees)", "Net Savings"]
        if "Strategy A" in strategy:
            display_cols.insert(4, "Monthly Payment")
        else:
            display_cols.append("Months Saved")
            
        formatted_df = df_results[display_cols].copy()
        
        st.dataframe(
            formatted_df.style.format({
                "Monthly Payment": "${:,.2f}",
                "Total Interest Paid": "${:,.2f}",
                "Total Fees Paid": "${:,.2f}",
                "Total Cost (Interest + Fees)": "${:,.2f}",
                "Net Savings": "${:,.2f}",
            }).background_gradient(subset=["Net Savings"], cmap="Greens"),
            use_container_width=True
        )

        # Visualizations
        st.markdown("---")
        st.subheader("📈 Visualizing Your Debt Paydown")
        
        col_chart1, col_chart2 = st.columns(2)
        
        with col_chart1:
            # Line Chart: Balance Over Time
            fig_line = go.Figure()
            
            if "Strategy B" in strategy:
                # Add current card trajectory
                fig_line.add_trace(go.Scatter(
                    x=trajectories["Current Card"]["Month"],
                    y=trajectories["Current Card"]["Balance"],
                    mode='lines',
                    name='Current Card (No Transfer)',
                    line=dict(color='#EF4444', width=3, dash='dash')
                ))
            
            for name, df_traj in trajectories.items():
                if "Strategy A" in strategy and "Current Card" in name:
                    # Show current card comparison lines in lighter red/orange
                    fig_line.add_trace(go.Scatter(
                        x=df_traj["Month"],
                        y=df_traj["Balance"],
                        mode='lines',
                        name=name,
                        line=dict(width=1.5, dash='dot')
                    ))
                elif "Current Card" not in name:
                    fig_line.add_trace(go.Scatter(
                        x=df_traj["Month"],
                        y=df_traj["Balance"],
                        mode='lines',
                        name=name,
                        line=dict(width=2.5)
                    ))
                    
            fig_line.update_layout(
                title="Debt Balance Trajectory Over Time",
                xaxis_title="Month",
                yaxis_title="Remaining Balance ($)",
                legend_title="Payoff Plans",
                hovermode="x unified",
                template="plotly_white"
            )
            st.plotly_chart(fig_line, use_container_width=True)
            
        with col_chart2:
            # Bar Chart: Cost Breakdown
            fig_bar = go.Figure()
            
            categories = []
            interest_costs = []
            fee_costs = []
            
            if "Strategy B" in strategy:
                categories.append("Current Card")
                interest_costs.append(curr_total_cost)
                fee_costs.append(0)
                
            for index, row in df_results.iterrows():
                categories.append(row["Offer Name"])
                interest_costs.append(row["Total Interest Paid"])
                fee_costs.append(row["Total Fees Paid"])
                
            fig_bar.add_trace(go.Bar(
                name='Interest Cost',
                x=categories,
                y=interest_costs,
                marker_color='#F59E0B'
            ))
            fig_bar.add_trace(go.Bar(
                name='Transfer Fee Cost',
                x=categories,
                y=fee_costs,
                marker_color='#3B82F6'
            ))
            
            fig_bar.update_layout(
                barmode='stack',
                title="Total Cost Breakdown (Interest vs. Fees)",
                xaxis_title="Offer",
                yaxis_title="Cost ($)",
                template="plotly_white"
            )
            st.plotly_chart(fig_bar, use_container_width=True)

with tab2:
    st.subheader("🔍 Detailed Offer Breakdown & Amortization Schedule")
    
    selected_offer_name = st.selectbox(
        "Select an offer to inspect in detail:",
        options=[off["name"] for off in st.session_state.offers]
    )
    
    # Find selected offer details
    selected_offer = next(off for off in st.session_state.offers if off["name"] == selected_offer_name)
    fee_amount = current_balance * (selected_offer["fee_percent"] / 100.0)
    
    # Let user customize payment for this specific breakdown
    st.markdown("#### Customize Payoff Parameters for this Offer")
    col_p1, col_p2 = st.columns(2)
    with col_p1:
        custom_pay_mode = st.radio(
            "Payment Mode for Detailed View",
            ["Pay off exactly within promo period", "Make a custom monthly payment"],
            key="detailed_pay_mode"
        )
    with col_p2:
        if custom_pay_mode == "Pay off exactly within promo period":
            target_bal = current_balance + fee_amount if fee_added else current_balance
            calc_pay = calculate_exact_payment(target_bal, selected_offer["promo_apr"], selected_offer["tenor_months"])
            detailed_payment = st.number_input("Calculated Monthly Payment ($)", value=round(calc_pay, 2), disabled=True)
        else:
            detailed_payment = st.number_input("Custom Monthly Payment ($)", min_value=50.0, max_value=10000.0, value=current_monthly_payment)

    # Run detailed simulation
    df_detailed, int_detailed, fee_detailed = simulate_payoff(
        balance=current_balance,
        apr=selected_offer["promo_apr"],
        monthly_payment=detailed_payment,
        fee=fee_amount,
        fee_added_to_balance=fee_added,
        max_months=120,
        promo_months=selected_offer["tenor_months"],
        post_promo_apr=selected_offer["post_promo_apr"]
    )
    
    # Metrics for detailed offer
    total_payments = df_detailed["Principal Paid"].sum() + df_detailed["Interest Paid"].sum() + (0 if fee_added else fee_detailed)
    
    col_m1, col_m2, col_m3, col_m4 = st.columns(4)
    with col_m1:
        st.metric("Months to Pay Off", f"{len(df_detailed)-1} Months")
    with col_m2:
        st.metric("Total Interest Paid", f"${int_detailed:,.2f}")
    with col_m3:
        st.metric("Upfront Transfer Fee", f"${fee_detailed:,.2f}")
    with col_m4:
        st.metric("Total Cost of Debt", f"${(int_detailed + fee_detailed):,.2f}")
        
    # Pie Chart of Total Payments
    st.markdown("---")
    col_pie, col_table = st.columns([1, 2])
    
    with col_pie:
        st.markdown("##### Payment Allocation")
        labels = ['Original Principal', 'Total Interest', 'Transfer Fee']
        values = [current_balance, int_detailed, fee_detailed]
        
        fig_pie = go.Figure(data=[go.Pie(labels=labels, values=values, hole=.3, marker=dict(colors=['#10B981', '#F59E0B', '#3B82F6']))])
        fig_pie.update_layout(showlegend=True, legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5))
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with col_table:
        st.markdown("##### Amortization Schedule")
        st.dataframe(
            df_detailed.style.format({
                "Balance": "${:,.2f}",
                "Interest Paid": "${:,.2f}",
                "Principal Paid": "${:,.2f}",
                "Cumulative Interest": "${:,.2f}",
                "Cumulative Payments": "${:,.2f}"
            }),
            use_container_width=True,
            height=350
        )

with tab3:
    st.subheader("💡 Custom Payoff Scenarios & Stress Testing")
    st.markdown("""
        **The Balance Transfer Trap:** Many customers fail to pay off their balance before the promotional period ends. 
        When this happens, the remaining balance is hit with the high **Post-Promo APR**. 
        Use this interactive sandbox to see how different payment behaviors affect your total savings.
    """)
    
    col_s1, col_s2 = st.columns(2)
    with col_s1:
        st.markdown("#### 1. Select Offer to Stress Test")
        sandbox_offer_name = st.selectbox(
            "Select Offer:",
            options=[off["name"] for off in st.session_state.offers],
            key="sandbox_offer"
        )
        sandbox_offer = next(off for off in st.session_state.offers if off["name"] == sandbox_offer_name)
        
        st.markdown("#### 2. Define Your Payment Behavior")
        promo_payment_behavior = st.radio(
            "What is your payment strategy during the promotional period?",
            [
                "Pay only the minimum required (e.g., 2% of balance)",
                "Pay a fixed monthly amount",
                "Pay off exactly 50% of the balance by the end of promo"
            ]
        )
        
        if "minimum required" in promo_payment_behavior:
            min_pay_pct = st.slider("Minimum Payment Percentage (%)", min_value=1.0, max_value=5.0, value=2.0, step=0.5)
            # Calculate average payment during promo
            promo_payment = (current_balance * (min_pay_pct / 100.0))
        elif "fixed monthly amount" in promo_payment_behavior:
            promo_payment = st.number_input("Monthly Payment during Promo ($)", min_value=50.0, max_value=5000.0, value=150.0)
        else:
            # Pay off 50%
            target_payoff = current_balance * 0.5
            promo_payment = target_payoff / sandbox_offer["tenor_months"]
            
        post_promo_payment = st.number_input(
            "Monthly Payment AFTER promo period ends ($)", 
            min_value=50.0, 
            max_value=5000.0, 
            value=current_monthly_payment,
            help="This is the payment you will make once the high post-promo APR kicks in."
        )
        
    with col_s2:
        st.markdown("#### 📊 Scenario Simulation Results")
        
        # Run custom simulation
        # Phase 1: Promo Period
        fee_amt = current_balance * (sandbox_offer["fee_percent"] / 100.0)
        df_promo, int_promo, fee_promo = simulate_payoff(
            balance=current_balance,
            apr=sandbox_offer["promo_apr"],
            monthly_payment=promo_payment,
            fee=fee_amt,
            fee_added_to_balance=fee_added,
            max_months=sandbox_offer["tenor_months"],
            promo_months=sandbox_offer["tenor_months"],
            post_promo_apr=sandbox_offer["post_promo_apr"]
        )
        
        remaining_balance = df_promo.iloc[-1]["Balance"]
        
        # Phase 2: Post-Promo Period
        df_post, int_post, _ = simulate_payoff(
            balance=remaining_balance,
            apr=sandbox_offer["post_promo_apr"],
            monthly_payment=post_promo_payment,
            fee=0,
            fee_added_to_balance=False,
            max_months=120
        )
        
        # Combine schedules
        if len(df_post) > 1:
            df_post_adjusted = df_post.iloc[1:].copy()
            df_post_adjusted["Month"] = df_post_adjusted["Month"] + sandbox_offer["tenor_months"]
            df_post_adjusted["Cumulative Interest"] = df_post_adjusted["Cumulative Interest"] + int_promo
            df_post_adjusted["Cumulative Payments"] = df_post_adjusted["Cumulative Payments"] + df_promo.iloc[-1]["Cumulative Payments"]
            df_combined = pd.concat([df_promo, df_post_adjusted], ignore_index=True)
        else:
            df_combined = df_promo
            
        total_interest_accrued = int_promo + int_post
        total_cost_sandbox = total_interest_accrued + fee_promo
        
        # Compare with doing nothing (Current Card at current monthly payment)
        df_baseline, int_baseline, _ = simulate_payoff(
            balance=current_balance,
            apr=current_apr,
            monthly_payment=current_monthly_payment,
            fee=0,
            fee_added_to_balance=False
        )
        baseline_cost = int_baseline
        sandbox_savings = baseline_cost - total_cost_sandbox
        
        # Display Warning if remaining balance is high
        if remaining_balance > 0:
            st.warning(f"⚠️ You will have **${remaining_balance:,.2f}** remaining on your balance when the promotional period ends. This remaining balance will immediately start accruing interest at **{sandbox_offer['post_promo_apr']}% APR**.")
            
        if sandbox_savings < 0:
            st.error(f"❌ **Negative Savings!** Under this scenario, you will end up paying **${abs(sandbox_savings):,.2f} MORE** than if you had just kept your current card. This is due to the high post-promo APR on the remaining balance.")
        else:
            st.success(f"✅ Even with this scenario, you still save **${sandbox_savings:,.2f}** compared to your current card.")
            
        # Plotly Chart for Sandbox
        fig_sandbox = go.Figure()
        fig_sandbox.add_trace(go.Scatter(
            x=df_combined["Month"],
            y=df_combined["Balance"],
            mode='lines',
            name='Sandbox Scenario',
            line=dict(color='#EF4444', width=3)
        ))
        fig_sandbox.add_trace(go.Scatter(
            x=df_baseline["Month"],
            y=df_baseline["Balance"],
            mode='lines',
            name='Current Card Baseline',
            line=dict(color='#9CA3AF', width=2, dash='dash')
        ))
        fig_sandbox.add_vline(x=sandbox_offer["tenor_months"], line_dash="dot", line_color="red", annotation_text="Promo Ends")
        fig_sandbox.update_layout(
            title="Sandbox Paydown Trajectory",
            xaxis_title="Month",
            yaxis_title="Balance ($)",
            template="plotly_white"
        )
        st.plotly_chart(fig_sandbox, use_container_width=True)

with tab4:
    st.subheader("📚 Educational Guide: Understanding Balance Transfers")
    
    st.markdown("""
    ### What is a Balance Transfer?
    A balance transfer is a debt consolidation tool that allows you to move high-interest credit card debt from one or more cards to a new credit card with a lower interest rate (often 0% for a promotional period of 12 to 24 months).
    
    ### Key Terms to Know:
    *   **Tenor (Promotional Period):** The duration of the low-interest or 0% interest offer (e.g., 12, 18, or 24 months).
    *   **Promo APR:** The annual percentage rate applied to the transferred balance during the promotional period.
    *   **Balance Transfer Fee:** An upfront fee charged by the new card issuer to perform the transfer. This is typically **3% to 5%** of the transferred amount.
    *   **Post-Promo APR:** The standard purchase or cash advance APR that kicks in after the promotional period ends. Any remaining balance will be charged this rate.
    *   **EIR (Effective Interest Rate):** The true cost of the loan, taking into account the compounding interest and upfront fees.
    
    ### ⚠️ Crucial Tips for Success:
    1.  **Avoid New Purchases:** Do not use the new balance transfer card for everyday purchases. Often, promotional rates only apply to the transferred balance, and new purchases may accrue interest at the standard high rate immediately.
    2.  **Pay On Time:** A single late payment can instantly void your promotional 0% APR, reverting your card to the standard high APR.
    3.  **Set a Payoff Calendar:** Divide your total balance (including the transfer fee) by the number of promotional months. Try to pay this exact amount every month to ensure you reach $0 before the promo ends.
    4.  **Understand Fee Capitalization:** Adding the transfer fee to your balance means you pay interest on the fee itself if your promo APR is higher than 0%.
    """)
    
    st.info("💡 **Disclaimer:** This calculator is for educational purposes only. Actual terms, fees, and eligibility are determined by your credit card issuer and financial profile.")