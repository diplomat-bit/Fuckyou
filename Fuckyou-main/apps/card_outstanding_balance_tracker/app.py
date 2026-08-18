import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import os

# Set page configuration
st.set_page_config(
    page_title="Credit Utilization & Outstanding Balance Tracker",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- MOCK DATA GENERATOR ---
def generate_mock_data():
    np.random.seed(42)
    names = [
        "Liam Neeson", "Olivia Wilde", "Noah Centineo", "Emma Watson", 
        "Oliver Stark", "Ava DuVernay", "Elijah Wood", "Charlotte Rampling", 
        "William Shatner", "Sophia Loren", "James Corden", "Amelia Earhart", 
        "Benjamin Franklin", "Isabella Rossellini", "Lucas Hedges", "Mia Farrow"
    ]
    card_types = ["Visa Classic", "Visa Gold", "Mastercard Platinum", "Amex Centurion", "Visa Signature"]
    data = []
    for i, name in enumerate(names):
        credit_limit = float(np.random.choice([3000, 5000, 10000, 15000, 25000, 50000]))
        # 30% chance of having a temporary limit
        temp_limit = float(np.random.choice([0, 1000, 2000, 5000], p=[0.7, 0.15, 0.1, 0.05]))
        
        # Generate realistic outstanding balances (some high, some low)
        util_rate = np.random.beta(a=2, b=2)  # Centered around 0.5
        if np.random.rand() > 0.8:  # 20% chance of very high utilization
            util_rate = np.random.uniform(0.85, 1.05)
        
        total_limit = credit_limit + temp_limit
        outstanding = round(total_limit * util_rate, 2)
        # Ensure outstanding doesn't randomly go negative
        outstanding = max(0.0, outstanding)
        
        card_num = f"**** **** **** {np.random.randint(1000, 9999)}"
        status = np.random.choice(["Active", "Suspended", "Overlimit"], p=[0.85, 0.10, 0.05])
        
        data.append({
            "Card Number": card_num,
            "Cardholder Name": name,
            "Card Type": np.random.choice(card_types),
            "Credit Limit": credit_limit,
            "Temporary Limit": temp_limit,
            "Outstanding Balance": outstanding,
            "Status": status
        })
    return pd.DataFrame(data)

# --- DATA LOADING ---
@st.cache_data
def load_data():
    csv_path = "api/card-listing.csv"
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            # Normalize column names to match expected schema
            rename_dict = {}
            for col in df.columns:
                col_lower = col.lower().replace("_", " ").replace("-", " ")
                if "number" in col_lower:
                    rename_dict[col] = "Card Number"
                elif "name" in col_lower or "holder" in col_lower:
                    rename_dict[col] = "Cardholder Name"
                elif "type" in col_lower:
                    rename_dict[col] = "Card Type"
                elif "credit limit" in col_lower or "limit" in col_lower and "temp" not in col_lower:
                    rename_dict[col] = "Credit Limit"
                elif "temp" in col_lower:
                    rename_dict[col] = "Temporary Limit"
                elif "outstanding" in col_lower or "balance" in col_lower:
                    rename_dict[col] = "Outstanding Balance"
                elif "status" in col_lower:
                    rename_dict[col] = "Status"
            
            df = df.rename(columns=rename_dict)
            
            # Fill missing columns if any
            required_cols = {
                "Card Number": "Unknown",
                "Cardholder Name": "Unknown",
                "Card Type": "Standard",
                "Credit Limit": 5000.0,
                "Temporary Limit": 0.0,
                "Outstanding Balance": 0.0,
                "Status": "Active"
            }
            for col, default in required_cols.items():
                if col not in df.columns:
                    df[col] = default
            
            # Ensure correct data types
            df["Credit Limit"] = pd.to_numeric(df["Credit Limit"], errors="coerce").fillna(5000.0)
            df["Temporary Limit"] = pd.to_numeric(df["Temporary Limit"], errors="coerce").fillna(0.0)
            df["Outstanding Balance"] = pd.to_numeric(df["Outstanding Balance"], errors="coerce").fillna(0.0)
            return df
        except Exception as e:
            st.sidebar.warning(f"Error loading CSV: {e}. Using mock data instead.")
            return generate_mock_data()
    else:
        return generate_mock_data()

# Load initial data
df_raw = load_data()

# --- APP HEADER ---
st.title("💳 Credit Utilization & Outstanding Balance Tracker")
st.markdown("""
This dashboard provides real-time monitoring of credit limits, temporary limits, and outstanding balances. 
Analyze utilization ratios, simulate credit limit adjustments, and identify high-risk accounts instantly.
""")

# --- SIDEBAR FILTERS & SIMULATION ---
st.sidebar.header("🔍 Filters & Controls")

# Filter: Card Type
all_card_types = sorted(df_raw["Card Type"].unique().tolist())
selected_card_types = st.sidebar.multiselect("Card Type", all_card_types, default=all_card_types)

# Filter: Status
all_statuses = sorted(df_raw["Status"].unique().tolist())
selected_statuses = st.sidebar.multiselect("Account Status", all_statuses, default=all_statuses)

# Filter: Risk Threshold
risk_threshold = st.sidebar.slider(
    "High-Risk Utilization Threshold (%)", 
    min_value=50, 
    max_value=100, 
    value=80, 
    step=5
) / 100.0

st.sidebar.markdown("---")
st.sidebar.header("🛠️ Simulation Sandbox")
st.sidebar.markdown("Simulate adjustments to credit limits to see the impact on overall utilization and risk profiles.")

# Simulation 1: Global Temporary Limit Increase
apply_global_temp = st.sidebar.checkbox("Apply Global Temp Limit Increase")
global_temp_amount = 0.0
if apply_global_temp:
    global_temp_amount = st.sidebar.number_input(
        "Add Temp Limit to All Active Cards ($)", 
        min_value=0, 
        max_value=10000, 
        value=1000, 
        step=500
    )

# Simulation 2: Targeted Credit Limit Adjustment
apply_targeted_adj = st.sidebar.checkbox("Targeted Limit Adjustment")
target_cardholder = None
adj_percentage = 0.0

if apply_targeted_adj:
    target_cardholder = st.sidebar.selectbox("Select Cardholder", df_raw["Cardholder Name"].unique())
    adj_percentage = st.sidebar.slider(
        "Adjust Credit Limit (%)", 
        min_value=-50, 
        max_value=100, 
        value=0, 
        step=10
    )

# --- DATA PROCESSING & SIMULATION ---
# Create a working copy
df = df_raw.copy()

# Apply Filters
df = df[df["Card Type"].isin(selected_card_types) & df["Status"].isin(selected_statuses)]

# Calculate Original Metrics
df["Original Total Limit"] = df["Credit Limit"] + df["Temporary Limit"]
df["Original Utilization"] = (df["Outstanding Balance"] / df["Original Total Limit"]).replace([np.inf, -np.inf], 0).fillna(0)

# Apply Simulations
df["Simulated Credit Limit"] = df["Credit Limit"]
df["Simulated Temporary Limit"] = df["Temporary Limit"]

if apply_global_temp:
    # Apply only to active accounts
    df.loc[df["Status"] == "Active", "Simulated Temporary Limit"] += global_temp_amount

if apply_targeted_adj and target_cardholder:
    multiplier = 1 + (adj_percentage / 100.0)
    df.loc[df["Cardholder Name"] == target_cardholder, "Simulated Credit Limit"] *= multiplier

# Calculate Simulated Metrics
df["Simulated Total Limit"] = df["Simulated Credit Limit"] + df["Simulated Temporary Limit"]
df["Simulated Utilization"] = (df["Outstanding Balance"] / df["Simulated Total Limit"]).replace([np.inf, -np.inf], 0).fillna(0)
df["Available Credit"] = df["Simulated Total Limit"] - df["Outstanding Balance"]

# Flag High Risk
df["High Risk Flag"] = df["Simulated Utilization"] >= risk_threshold

# --- KPI METRICS ---
st.subheader("📊 Key Performance Indicators")

# Calculate aggregates for Original vs Simulated
total_outstanding = df["Outstanding Balance"].sum()
orig_total_limit = df["Original Total Limit"].sum()
sim_total_limit = df["Simulated Total Limit"].sum()

orig_avg_util = (total_outstanding / orig_total_limit) if orig_total_limit > 0 else 0
sim_avg_util = (total_outstanding / sim_total_limit) if sim_total_limit > 0 else 0

orig_high_risk_count = (df["Original Utilization"] >= risk_threshold).sum()
sim_high_risk_count = df["High Risk Flag"].sum()

total_available_credit = df["Available Credit"].sum()
orig_available_credit = (df["Original Total Limit"] - df["Outstanding Balance"]).sum()

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        label="Total Outstanding Balance",
        value=f"${total_outstanding:,.2f}",
        help="Sum of all outstanding balances across filtered accounts."
    )

with col2:
    util_delta = sim_avg_util - orig_avg_util
    st.metric(
        label="Average Utilization Ratio",
        value=f"{sim_avg_util * 100:.2f}%",
        delta=f"{util_delta * 100:+.2f}%" if util_delta != 0 else None,
        delta_color="inverse",
        help="Total Outstanding Balance divided by Total Credit Limit (including temporary limits)."
    )

with col3:
    risk_delta = int(sim_high_risk_count - orig_high_risk_count)
    st.metric(
        label="High-Risk Accounts",
        value=f"{sim_high_risk_count}",
        delta=f"{risk_delta:+.0f}" if risk_delta != 0 else None,
        delta_color="inverse",
        help=f"Accounts with utilization ratio >= {risk_threshold * 100:.0f}%"
    )

with col4:
    avail_delta = total_available_credit - orig_available_credit
    st.metric(
        label="Total Available Credit",
        value=f"${total_available_credit:,.2f}",
        delta=f"${avail_delta:,.2f}" if avail_delta != 0 else None,
        help="Total Limit minus Outstanding Balance."
    )

# --- VISUALIZATIONS ---
st.markdown("---")
st.subheader("📈 Visual Analytics")

chart_col1, chart_col2 = st.columns(2)

with chart_col1:
    st.markdown("#### Outstanding Balance vs. Total Limit")
    # Sort by outstanding balance for better visualization
    df_sorted = df.sort_values(by="Outstanding Balance", ascending=False)
    
    fig_limits = go.Figure()
    fig_limits.add_trace(go.Bar(
        x=df_sorted["Cardholder Name"],
        y=df_sorted["Outstanding Balance"],
        name="Outstanding Balance",
        marker_color="#EF553B"
    ))
    fig_limits.add_trace(go.Bar(
        x=df_sorted["Cardholder Name"],
        y=df_sorted["Simulated Total Limit"] - df_sorted["Outstanding Balance"],
        name="Remaining Available Limit",
        marker_color="#636EFA"
    ))
    
    fig_limits.update_layout(
        barmode="stack",
        xaxis_title="Cardholder",
        yaxis_title="Amount ($)",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(t=30, b=40, l=40, r=20),
        height=400
    )
    st.plotly_chart(fig_limits, use_container_width=True)

with chart_col2:
    st.markdown("#### Utilization Distribution & Risk Threshold")
    
    fig_dist = px.histogram(
        df, 
        x="Simulated Utilization", 
        nbins=10,
        labels={"Simulated Utilization": "Utilization Ratio"},
        color_discrete_sequence=["#00CC96"]
    )
    
    # Add vertical line for risk threshold
    fig_dist.add_vline(
        x=risk_threshold, 
        line_dash="dash", 
        line_color="red", 
        annotation_text=f"Risk Threshold ({risk_threshold*100:.0f}%)",
        annotation_position="top right"
    )
    
    fig_dist.update_layout(
        xaxis_tickformat=".0%",
        yaxis_title="Count of Accounts",
        margin=dict(t=30, b=40, l=40, r=20),
        height=400
    )
    st.plotly_chart(fig_dist, use_container_width=True)

# --- DETAILED DATA TABLE & RISK ANALYSIS ---
st.markdown("---")
st.subheader("📋 Account Details & Risk Analysis")

# Highlight function for high-risk accounts
def highlight_high_risk(row):
    color = 'background-color: rgba(239, 85, 59, 0.2)' if row['High Risk Flag'] else ''
    return [color] * len(row)

# Prepare display dataframe
display_cols = [
    "Cardholder Name", "Card Number", "Card Type", "Status", 
    "Simulated Credit Limit", "Simulated Temporary Limit", "Simulated Total Limit",
    "Outstanding Balance", "Simulated Utilization", "High Risk Flag"
]

df_display = df[display_cols].copy()
df_display = df_display.rename(columns={
    "Simulated Credit Limit": "Credit Limit",
    "Simulated Temporary Limit": "Temporary Limit",
    "Simulated Total Limit": "Total Limit",
    "Simulated Utilization": "Utilization Ratio"
})

# Format columns for display
formatted_df = df_display.style.apply(highlight_high_risk, axis=1)\
    .format({
        "Credit Limit": "${:,.2f}",
        "Temporary Limit": "${:,.2f}",
        "Total Limit": "${:,.2f}",
        "Outstanding Balance": "${:,.2f}",
        "Utilization Ratio": "{:.2%}"
    })

st.dataframe(formatted_df, use_container_width=True)

# --- SIMULATION IMPACT SUMMARY ---
st.markdown("---")
st.subheader("🔄 Simulation Impact Summary")

sim_col1, sim_col2 = st.columns(2)

with sim_col1:
    st.markdown("#### Risk Mitigation Analysis")
    resolved_accounts = int(orig_high_risk_count - sim_high_risk_count)
    if resolved_accounts > 0:
        st.success(f"🎉 The simulated limit adjustments successfully brought **{resolved_accounts}** account(s) below the high-risk threshold!")
    elif resolved_accounts < 0:
        st.warning(f"⚠️ Warning: The simulated adjustments increased the number of high-risk accounts by **{abs(resolved_accounts)}**.")
    else:
        st.info("ℹ️ The simulated adjustments did not change the number of high-risk accounts.")

    # Show list of currently flagged high-risk accounts
    high_risk_list = df[df["High Risk Flag"]]
    if not high_risk_list.empty():
        st.markdown("**Currently Flagged High-Risk Accounts:**")
        for _, row in high_risk_list.iterrows():
            st.write(f"- **{row['Cardholder Name']}** ({row['Card Type']}): **{row['Simulated Utilization']*100:.1f}%** utilization (${row['Outstanding Balance']:,.2f} / ${row['Simulated Total Limit']:,.2f})")
    else:
        st.success("No accounts are currently flagged as high-risk under the simulated parameters.")

with sim_col2:
    st.markdown("#### Export Simulated Data")
    st.markdown("Download the current simulated dataset with updated limits and utilization ratios for further reporting.")
    
    # Prepare CSV download
    csv_data = df_display.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Download Simulation Results (CSV)",
        data=csv_data,
        file_name="simulated_card_utilization.csv",
        mime="text/csv"
    )

# --- FOOTER ---
st.markdown("---")
st.caption("Dashboard developed for Credit Risk Management. Data sourced from 'api/card-listing.csv' with dynamic simulation capabilities.")