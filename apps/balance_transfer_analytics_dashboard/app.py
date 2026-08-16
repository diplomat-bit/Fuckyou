import streamlit as pd
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# Set page configuration
st.set_page_config(
    page_title="Balance Transfer Analytics Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
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
    .metric-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: #1F2937;
    }
    .metric-label {
        font-size: 0.875rem;
        color: #6B7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    </style>
""", unsafe_allow_html=True)

# Generate Mock Data
@st.cache_data
def generate_mock_data(records=1500):
    np.random.seed(42)
    
    # Account Groups
    account_groups = ["READY_CREDIT", "SIGNATURE_CARD", "PLATINUM_VISA", "REVOLVING_LINE", "PREMIER_GOLD"]
    group_probs = [0.35, 0.25, 0.20, 0.12, 0.08]
    
    # Payment Plans
    payment_plans = [
        "12 Months @ 0.00% APR",
        "18 Months @ 1.99% APR",
        "24 Months @ 2.99% APR",
        "36 Months @ 4.99% APR"
    ]
    plan_probs = [0.40, 0.30, 0.20, 0.10]
    
    # Generate base fields
    customer_ids = [f"CUST-{10000 + i}" for i in range(records)]
    acc_groups = np.random.choice(account_groups, size=records, p=group_probs)
    credit_scores = np.random.normal(loc=710, scale=55, size=records).astype(int)
    credit_scores = np.clip(credit_scores, 580, 850)
    
    # Calculate eligibility and amounts based on credit score and account group
    eligible_amounts = []
    eligibility_status = []
    preferred_plans = []
    
    for score, group in zip(credit_scores, acc_groups):
        # Base eligibility logic
        if score < 620:
            status = "Ineligible"
            amount = 0.0
            plan = "None"
        elif score < 670:
            status = "Conditionally Eligible"
            # Lower limits
            base_amt = np.random.uniform(1000, 5000)
            multiplier = 1.2 if group in ["READY_CREDIT", "PREMIER_GOLD"] else 1.0
            amount = round(base_amt * multiplier, -2)
            plan = np.random.choice(payment_plans[2:], p=[0.6, 0.4]) # Only higher rate plans
        else:
            status = "Eligible"
            # Higher limits
            base_amt = np.random.uniform(5000, 25000)
            multiplier = 1.4 if group in ["READY_CREDIT", "PREMIER_GOLD"] else 1.1
            amount = round(base_amt * multiplier, -2)
            plan = np.random.choice(payment_plans, p=plan_probs)
            
        eligible_amounts.append(amount)
        eligibility_status.append(status)
        preferred_plans.append(plan)
        
    # Debt to Income Ratio (DTI)
    dti = np.random.beta(a=2, b=5, size=records) * 100
    dti = np.round(dti, 1)
    
    df = pd.DataFrame({
        "Customer ID": customer_ids,
        "Account Group": acc_groups,
        "Credit Score": credit_scores,
        "Eligibility Status": eligibility_status,
        "Eligible Amount ($)": eligible_amounts,
        "Preferred Plan": preferred_plans,
        "DTI Ratio (%)": dti
    })
    
    return df

# Load data
df = generate_mock_data()

# Sidebar Filters
st.sidebar.header("Dashboard Filters")

# Filter 1: Account Group
all_groups = ["All"] + list(df["Account Group"].unique())
selected_groups = st.sidebar.multiselect("Account Groups", options=df["Account Group"].unique(), default=df["Account Group"].unique())

# Filter 2: Eligibility Status
selected_status = st.sidebar.multiselect("Eligibility Status", options=df["Eligibility Status"].unique(), default=["Eligible", "Conditionally Eligible"])

# Filter 3: Credit Score Range
min_score, max_score = int(df["Credit Score"].min()), int(df["Credit Score"].max())
selected_score_range = st.sidebar.slider("Credit Score Range", min_score, max_score, (620, 850))

# Filter 4: Minimum Eligible Amount
max_eligible_amt = float(df["Eligible Amount ($)"].max())
selected_min_amt = st.sidebar.slider("Minimum Eligible Amount ($)", 0.0, max_eligible_amt, 2000.0, step=500.0)

# Apply Filters to Dataframe
filtered_df = df[
    (df["Account Group"].isin(selected_groups)) &
    (df["Eligibility Status"].isin(selected_status)) &
    (df["Credit Score"].between(selected_score_range[0], selected_score_range[1])) &
    (df["Eligible Amount ($)"] >= selected_min_amt)
]

# Main Dashboard Header
st.markdown('<div class="main-header">Balance Transfer Eligibility Analytics</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Real-time portfolio insights, eligibility distributions, and payment plan configurations.</div>', unsafe_allow_html=True)

# KPI Metrics Row
col1, col2, col3, col4 = st.columns(4)

with col1:
    total_customers = len(filtered_df)
    st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Filtered Customers</div>
            <div class="metric-value">{total_customers:,}</div>
        </div>
    """, unsafe_allow_html=True)

with col2:
    avg_eligible = filtered_df[filtered_df["Eligible Amount ($)"] > 0]["Eligible Amount ($)"].mean()
    avg_eligible_val = f"${avg_eligible:,.2f}" if not np.isnan(avg_eligible) else "$0.00"
    st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Avg. Eligible Amount</div>
            <div class="metric-value">{avg_eligible_val}</div>
        </div>
    """, unsafe_allow_html=True)

with col3:
    total_pipeline = filtered_df["Eligible Amount ($)"].sum()
    st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Total Eligible Volume</div>
            <div class="metric-value">${total_pipeline:,.0f}</div>
        </div>
    """, unsafe_allow_html=True)

with col4:
    avg_credit_score = filtered_df["Credit Score"].mean()
    avg_score_val = f"{avg_credit_score:.0f}" if not np.isnan(avg_credit_score) else "N/A"
    st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Avg. Credit Score</div>
            <div class="metric-value">{avg_score_val}</div>
        </div>
    """, unsafe_allow_html=True)

st.write("")

# Visualizations Section
chart_col1, chart_col2 = st.columns(2)

with chart_col1:
    st.subheader("Distribution of Supported Account Groups")
    if not filtered_df.empty:
        group_counts = filtered_df["Account Group"].value_counts().reset_index()
        group_counts.columns = ["Account Group", "Count"]
        fig_pie = px.pie(
            group_counts, 
            values="Count", 
            names="Account Group", 
            hole=0.4,
            color_discrete_sequence=px.colors.qualitative.Pastel
        )
        fig_pie.update_layout(margin=dict(t=20, b=20, l=20, r=20), height=350)
        st.plotly_chart(fig_pie, use_container_width=True)
    else:
        st.info("No data available for the selected filters.")

with chart_col2:
    st.subheader("Popular Payment Plan Configurations")
    if not filtered_df.empty:
        # Filter out 'None' plans for visualization
        plan_df = filtered_df[filtered_df["Preferred Plan"] != "None"]
        if not plan_df.empty:
            plan_counts = plan_df["Preferred Plan"].value_counts().reset_index()
            plan_counts.columns = ["Payment Plan", "Count"]
            fig_bar = px.bar(
                plan_counts,
                x="Count",
                y="Payment Plan",
                orientation="h",
                color="Payment Plan",
                color_discrete_sequence=px.colors.qualitative.Safe,
                text="Count"
            )
            fig_bar.update_layout(
                showlegend=False,
                xaxis_title="Number of Customers",
                yaxis_title=None,
                margin=dict(t=20, b=20, l=20, r=20),
                height=350
            )
            st.plotly_chart(fig_bar, use_container_width=True)
        else:
            st.info("No active payment plans in the filtered selection.")
    else:
        st.info("No data available for the selected filters.")

# Second Row of Charts
chart_col3, chart_col4 = st.columns(2)

with chart_col3:
    st.subheader("Eligible Loan Amount Distribution")
    if not filtered_df.empty and filtered_df["Eligible Amount ($)"].sum() > 0:
        fig_hist = px.histogram(
            filtered_df[filtered_df["Eligible Amount ($)"] > 0],
            x="Eligible Amount ($)",
            nbins=20,
            color="Account Group",
            marginal="box",
            color_discrete_sequence=px.colors.qualitative.Vivid
        )
        fig_hist.update_layout(
            xaxis_title="Eligible Amount ($)",
            yaxis_title="Count",
            margin=dict(t=20, b=20, l=20, r=20),
            height=380,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_hist, use_container_width=True)
    else:
        st.info("No eligible amounts to display.")

with chart_col4:
    st.subheader("Credit Score vs. Eligible Loan Amount")
    if not filtered_df.empty:
        fig_scatter = px.scatter(
            filtered_df,
            x="Credit Score",
            y="Eligible Amount ($)",
            color="Account Group",
            size="DTI Ratio (%)",
            hover_data=["Customer ID", "Eligibility Status", "Preferred Plan"],
            color_discrete_sequence=px.colors.qualitative.Vivid,
            opacity=0.7
        )
        fig_scatter.update_layout(
            xaxis_title="Credit Score",
            yaxis_title="Eligible Amount ($)",
            margin=dict(t=20, b=20, l=20, r=20),
            height=380,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_scatter, use_container_width=True)
    else:
        st.info("No data available for scatter plot.")

# Interactive Calculator & Data Explorer Tabs
st.write("---")
tab1, tab2 = st.tabs(["🔍 Customer Eligibility Explorer", "🧮 Balance Transfer Calculator Simulation"])

with tab1:
    st.subheader("Detailed Customer Eligibility Records")
    st.markdown("Explore, search, and download the filtered customer eligibility dataset.")
    
    # Search bar
    search_query = st.text_input("Search by Customer ID", "")
    
    display_df = filtered_df.copy()
    if search_query:
        display_df = display_df[display_df["Customer ID"].str.contains(search_query, case=False)]
        
    st.dataframe(
        display_df.style.format({
            "Eligible Amount ($)": "${:,.2f}",
            "DTI Ratio (%)": "{:.1f}%",
            "Credit Score": "{:d}"
        }),
        use_container_width=True,
        hide_index=True
    )
    
    # Download Button
    csv = display_df.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Download Filtered Dataset as CSV",
        data=csv,
        file_name="balance_transfer_eligibility_export.csv",
        mime="text/csv"
    )

with tab2:
    st.subheader("Balance Transfer Calculator Simulation")
    st.markdown("Simulate monthly payments and interest savings for a customer based on standard payment plan configurations.")
    
    calc_col1, calc_col2 = st.columns([1, 2])
    
    with calc_col1:
        transfer_amount = st.number_input("Transfer Amount ($)", min_value=500.0, max_value=50000.0, value=5000.0, step=500.0)
        current_apr = st.slider("Current Card APR (%)", min_value=12.0, max_value=29.99, value=19.99, step=0.25)
        one_time_fee_pct = st.slider("Balance Transfer Fee (%)", min_value=0.0, max_value=5.0, value=3.0, step=0.5)
        
    with calc_col2:
        # Calculate options
        plans_data = [
            {"Plan": "12 Months @ 0.00% APR", "Months": 12, "Promo APR": 0.00},
            {"Plan": "18 Months @ 1.99% APR", "Months": 18, "Promo APR": 1.99},
            {"Plan": "24 Months @ 2.99% APR", "Months": 24, "Promo APR": 2.99},
            {"Plan": "36 Months @ 4.99% APR", "Months": 36, "Promo APR": 4.99}
        ]
        
        results = []
        for p in plans_data:
            months = p["Months"]
            promo_apr = p["Promo APR"] / 100.0
            
            # Transfer Fee
            fee = transfer_amount * (one_time_fee_pct / 100.0)
            total_financed = transfer_amount + fee
            
            # Monthly Payment (Amortization formula or simple division for 0% APR)
            if promo_apr == 0:
                monthly_payment = total_financed / months
                total_interest = 0.0
            else:
                r = promo_apr / 12.0
                monthly_payment = total_financed * (r * (1 + r)**months) / ((1 + r)**months - 1)
                total_interest = (monthly_payment * months) - total_financed
                
            total_cost = total_financed + total_interest
            
            # Current Card Cost (Assuming minimum payment of 3% or interest accumulation)
            # For comparison, we calculate simple interest cost on current card over the same period
            current_r = (current_apr / 100.0) / 12.0
            current_monthly = transfer_amount * (current_r * (1 + current_r)**months) / ((1 + current_r)**months - 1)
            current_total_cost = current_monthly * months
            estimated_savings = current_total_cost - total_cost
            
            results.append({
                "Plan Option": p["Plan"],
                "Monthly Payment": monthly_payment,
                "Transfer Fee": fee,
                "Total Interest": total_interest,
                "Total Cost": total_cost,
                "Est. Savings vs Current Card": max(0.0, estimated_savings)
            })
            
        results_df = pd.DataFrame(results)
        
        # Display results table
        st.dataframe(
            results_df.style.format({
                "Monthly Payment": "${:,.2f}",
                "Transfer Fee": "${:,.2f}",
                "Total Interest": "${:,.2f}",
                "Total Cost": "${:,.2f}",
                "Est. Savings vs Current Card": "${:,.2f}"
            }),
            use_container_width=True,
            hide_index=True
        )
        
        # Savings visualization
        fig_savings = px.bar(
            results_df,
            x="Plan Option",
            y="Est. Savings vs Current Card",
            text="Est. Savings vs Current Card",
            title="Estimated Savings by Plan Option",
            color="Plan Option",
            color_discrete_sequence=px.colors.qualitative.Safe
        )
        fig_savings.update_traces(texttemplate='$%{text:,.2f}', textposition='outside')
        fig_savings.update_layout(
            yaxis_title="Savings ($)",
            xaxis_title=None,
            showlegend=False,
            height=280,
            margin=dict(t=40, b=20, l=20, r=20)
        )
        st.plotly_chart(fig_savings, use_container_width=True)