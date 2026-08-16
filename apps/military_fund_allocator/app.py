import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# Set page configuration
st.set_page_config(
    page_title="Military Fund Allocator & Financial Manager",
    page_icon="🎖️",
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
        margin-bottom: 1.5rem;
    }
    .section-card {
        background-color: #F3F4F6;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 5px solid #1E3A8A;
        margin-bottom: 1rem;
    }
    .metric-card {
        background-color: #FFFFFF;
        padding: 1rem;
        border-radius: 0.375rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #E5E7EB;
    }
    </style>
""", unsafe_allow_html=True)

# State Voting-Age Population (VAP) Data (Approximate based on recent census data)
STATE_VAP = {
    "Alabama": 3900000, "Alaska": 550000, "Arizona": 5600000, "Arkansas": 2300000,
    "California": 30000000, "Colorado": 4500000, "Connecticut": 2800000, "Delaware": 780000,
    "District of Columbia": 550000, "Florida": 17500000, "Georgia": 8000000, "Hawaii": 1100000,
    "Idaho": 1400000, "Illinois": 9700000, "Indiana": 5100000, "Iowa": 2400000,
    "Kansas": 2200000, "Kentucky": 3400000, "Louisiana": 3500000, "Maine": 1100000,
    "Maryland": 4700000, "Massachusetts": 5500000, "Michigan": 7800000, "Minnesota": 4300000,
    "Mississippi": 2200000, "Missouri": 4700000, "Montana": 850000, "Nebraska": 1400000,
    "Nevada": 2400000, "New Hampshire": 1100000, "New Jersey": 7000000, "New Mexico": 1600000,
    "New York": 15500000, "North Carolina": 8100000, "North Dakota": 580000, "Ohio": 9000000,
    "Oklahoma": 3000000, "Oregon": 3300000, "Pennsylvania": 10000000, "Rhode Island": 850000,
    "South Carolina": 4000000, "South Dakota": 670000, "Tennessee": 5300000, "Texas": 21500000,
    "Utah": 2300000, "Vermont": 510000, "Virginia": 6600000, "Washington": 6000000,
    "West Virginia": 1400000, "Wisconsin": 4500000, "Wyoming": 440000
}

STATE_CODES = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL",
    "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA",
    "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN",
    "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
    "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
}

# Sidebar Controls
st.sidebar.header("⚙️ Budget & Parameter Controls")

total_budget = st.sidebar.number_input(
    "Total Military Fund Budget ($)",
    min_value=50000000,
    max_value=2000000000,
    value=500000000,
    step=10000000,
    format="%d"
)

st.sidebar.subheader("Allocation Percentages")
state_grant_pct = st.sidebar.slider("State Grants Pool (%)", 10, 90, 60)
dhs_units_pct = st.sidebar.slider("DHS Mobile Units Pool (%)", 5, 50, 25)
fee_waiver_pct = st.sidebar.slider("Fee Waivers Pool (%)", 5, 50, 15)

total_pct = state_grant_pct + dhs_units_pct + fee_waiver_pct
reserve_pct = 100 - total_pct

if reserve_pct < 0:
    st.sidebar.error(f"⚠️ Total allocation is {total_pct}%, which exceeds 100%! Please adjust the sliders.")
    st.stop()

st.sidebar.info(f"Unallocated Reserve: {reserve_pct}%")

st.sidebar.subheader("Unit Cost Parameters")
dhs_unit_cost = st.sidebar.number_input(
    "Cost per DHS Mobile Unit ($)",
    min_value=50000,
    max_value=1000000,
    value=150000,
    step=10000
)

fee_waiver_cost = st.sidebar.number_input(
    "Cost per Fee Waiver ($)",
    min_value=5,
    max_value=500,
    value=25,
    step=5
)

# Calculations
state_pool = total_budget * (state_grant_pct / 100.0)
dhs_pool = total_budget * (dhs_units_pct / 100.0)
waiver_pool = total_budget * (fee_waiver_pct / 100.0)
reserve_pool = total_budget * (reserve_pct / 100.0)

# Title & Header
st.markdown('<div class="main-header">🎖️ Military Fund Allocator & Financial Manager</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Implementation of Section 8.0 and Section 15.0 of the Executive Order: State Grant Allocations, DHS Mobile Verification Units, and Low-Income Fee Waivers.</div>', unsafe_allow_html=True)

# Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Executive Summary", 
    "🏛️ Section 8.0 & 15.0 State Grants", 
    "🚐 DHS Mobile Units", 
    "🎫 Fee Waiver Tracker"
])

# --- TAB 1: EXECUTIVE SUMMARY ---
with tab1:
    st.header("Financial Overview")
    
    # Metric Cards
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Military Fund", f"${total_budget:,.2f}")
    with col2:
        st.metric("State Grants Pool", f"${state_pool:,.2f}", f"{state_grant_pct}%")
    with col3:
        st.metric("DHS Mobile Units Pool", f"${dhs_pool:,.2f}", f"{dhs_units_pct}%")
    with col4:
        st.metric("Fee Waivers Pool", f"${waiver_pool:,.2f}", f"{fee_waiver_pct}%")

    st.markdown("---")
    
    col_left, col_right = st.columns([1, 1])
    
    with col_left:
        st.subheader("Budget Allocation Breakdown")
        labels = ['State Grants Pool', 'DHS Mobile Units Pool', 'Fee Waivers Pool', 'Unallocated Reserve']
        values = [state_pool, dhs_pool, waiver_pool, reserve_pool]
        colors = ['#1E3A8A', '#3B82F6', '#10B981', '#9CA3AF']
        
        fig_pie = go.Figure(data=[go.Pie(labels=labels, values=values, hole=.4, marker=dict(colors=colors))])
        fig_pie.update_layout(margin=dict(t=0, b=0, l=0, r=0), legend=dict(orientation="h", yanchor="bottom", y=-0.1, xanchor="center", x=0.5))
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with col_right:
        st.subheader("Key Operational Capacities")
        max_dhs_units = int(dhs_pool // dhs_unit_cost)
        max_waivers = int(waiver_pool // fee_waiver_cost)
        
        st.markdown(f"""
        <div class="section-card">
            <h4>📋 Quick Statistics</h4>
            <ul>
                <li><b>Baseline State Grant:</b> $500,000 per state/jurisdiction (Total: $25,500,000 for 51 jurisdictions)</li>
                <li><b>Proportional State Pool:</b> ${(state_pool - 25500000):,.2f} distributed by Voting-Age Population (VAP)</li>
                <li><b>DHS Mobile Units Fundable:</b> {max_dhs_units:,} units (at ${dhs_unit_cost:,.2f} each)</li>
                <li><b>Low-Income Fee Waivers Fundable:</b> {max_waivers:,} citizens (at ${fee_waiver_cost:,.2f} each)</li>
                <li><b>Unallocated Reserve:</b> ${reserve_pool:,.2f} ({reserve_pct}%)</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

# --- TAB 2: STATE GRANT ALLOCATIONS ---
with tab2:
    st.header("Section 8.0 & 15.0 State Grant Allocations")
    st.markdown("""
    Under Section 8.0 and Section 15.0, each of the 50 states (plus the District of Columbia) receives a **baseline grant of $500,000**. 
    The remaining funds in the State Grants Pool are allocated proportionally based on each state's **Voting-Age Population (VAP)**.
    """)
    
    baseline_total = 51 * 500000
    if state_pool < baseline_total:
        st.error(f"⚠️ The State Grants Pool (${state_pool:,.2f}) is insufficient to cover the mandatory baseline of $500,000 per state (Total required: ${baseline_total:,.2f}). Please increase the State Grants Pool percentage or the Total Budget in the sidebar.")
    else:
        remaining_state_pool = state_pool - baseline_total
        total_vap = sum(STATE_VAP.values())
        
        # Calculate allocations
        allocations = []
        for state, vap in STATE_VAP.items():
            prop_share = (vap / total_vap) * remaining_state_pool
            total_grant = 500000 + prop_share
            allocations.append({
                "State": state,
                "Code": STATE_CODES[state],
                "Voting-Age Population (VAP)": vap,
                "Baseline Grant ($)": 500000,
                "Proportional Grant ($)": prop_share,
                "Total Grant ($)": total_grant
            })
            
        df_allocations = pd.DataFrame(allocations)
        
        # Map Visualization
        st.subheader("State Grant Allocation Map")
        fig_map = px.choropleth(
            df_allocations,
            locations="Code",
            locationmode="USA-states",
            color="Total Grant ($)",
            hover_name="State",
            hover_data=["Voting-Age Population (VAP)", "Baseline Grant ($)", "Proportional Grant ($)", "Total Grant ($)"],
            color_continuous_scale="Blues",
            scope="usa"
        )
        fig_map.update_layout(geo=dict(bgcolor='rgba(0,0,0,0)'), margin=dict(t=0, b=0, l=0, r=0))
        st.plotly_chart(fig_map, use_container_width=True)
        
        # Data Table & Search
        st.subheader("Detailed Allocation Table")
        search_query = st.text_input("🔍 Search State", "")
        if search_query:
            df_filtered = df_allocations[df_allocations["State"].str.contains(search_query, case=False)]
        else:
            df_filtered = df_allocations
            
        st.dataframe(
            df_filtered.style.format({
                "Voting-Age Population (VAP)": "{:,}",
                "Baseline Grant ($)": "${:,.2f}",
                "Proportional Grant ($)": "${:,.2f}",
                "Total Grant ($)": "${:,.2f}"
            }),
            use_container_width=True,
            hide_index=True
        )
        
        # Download CSV
        csv = df_allocations.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Allocation Data (CSV)",
            data=csv,
            file_name="state_grant_allocations.csv",
            mime="text/csv"
        )

# --- TAB 3: DHS MOBILE VERIFICATION UNITS ---
with tab3:
    st.header("DHS Mobile Verification Units Funding")
    st.markdown("""
    This section manages the deployment and funding of **DHS Mobile Verification Units**. 
    Units are allocated to states to support mobile identity verification. 
    The allocation strategy guarantees at least **1 unit per state** (if budget permits), with the remaining units distributed proportionally based on Voting-Age Population (VAP).
    """)
    
    max_units = int(dhs_pool // dhs_unit_cost)
    st.info(f"💡 Current DHS Pool of **${dhs_pool:,.2f}** can fund up to **{max_units:,}** Mobile Verification Units at **${dhs_unit_cost:,.2f}** per unit.")
    
    if max_units == 0:
        st.warning("⚠️ The DHS Mobile Units Pool is too small to fund even a single unit. Please increase the budget or allocation percentage.")
    else:
        # Allocation Algorithm
        unit_allocations = {state: 0 for state in STATE_VAP}
        
        if max_units >= 51:
            # Base allocation of 1 to each state/DC
            for state in unit_allocations:
                unit_allocations[state] = 1
            remaining_units = max_units - 51
            
            # Proportional distribution of remaining units
            total_vap = sum(STATE_VAP.values())
            for state, vap in STATE_VAP.items():
                extra = int((vap / total_vap) * remaining_units)
                unit_allocations[state] += extra
                
            # Handle rounding leftovers by giving them to highest VAP states
            leftover = max_units - sum(unit_allocations.values())
            sorted_states = sorted(STATE_VAP.keys(), key=lambda x: STATE_VAP[x], reverse=True)
            for i in range(leftover):
                unit_allocations[sorted_states[i % len(sorted_states)]] += 1
        else:
            # If we can't even give 1 to each state, allocate to highest VAP states first
            sorted_states = sorted(STATE_VAP.keys(), key=lambda x: STATE_VAP[x], reverse=True)
            for i in range(max_units):
                unit_allocations[sorted_states[i]] = 1
                
        # Build DataFrame
        dhs_data = []
        for state, units in unit_allocations.items():
            cost = units * dhs_unit_cost
            dhs_data.append({
                "State": state,
                "Code": STATE_CODES[state],
                "VAP": STATE_VAP[state],
                "Units Allocated": units,
                "Total Cost ($)": cost
            })
            
        df_dhs = pd.DataFrame(dhs_data)
        
        # Visualizations
        col_map, col_chart = st.columns([1.2, 1])
        
        with col_map:
            st.subheader("Mobile Units Distribution Map")
            fig_dhs_map = px.choropleth(
                df_dhs,
                locations="Code",
                locationmode="USA-states",
                color="Units Allocated",
                hover_name="State",
                hover_data=["Units Allocated", "Total Cost ($)"],
                color_continuous_scale="Purples",
                scope="usa"
            )
            fig_dhs_map.update_layout(geo=dict(bgcolor='rgba(0,0,0,0)'), margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig_dhs_map, use_container_width=True)
            
        with col_chart:
            st.subheader("Top 10 States by Mobile Units")
            df_top10 = df_dhs.sort_values(by="Units Allocated", ascending=False).head(10)
            fig_bar = px.bar(
                df_top10,
                x="Units Allocated",
                y="State",
                orientation='h',
                color="Units Allocated",
                color_continuous_scale="Purples"
            )
            fig_bar.update_layout(yaxis={'categoryorder':'total ascending'}, margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig_bar, use_container_width=True)
            
        st.subheader("Detailed DHS Unit Allocation Table")
        st.dataframe(
            df_dhs.style.format({
                "VAP": "{:,}",
                "Units Allocated": "{:,}",
                "Total Cost ($)": "${:,.2f}"
            }),
            use_container_width=True,
            hide_index=True
        )

# --- TAB 4: FEE WAIVER TRACKER ---
with tab4:
    st.header("Low-Income Fee Waiver Tracker")
    st.markdown("""
    This module tracks and simulates the allocation of **Fee Waivers** for low-income citizens. 
    The total capacity is determined by the Fee Waivers Pool and the cost per waiver. 
    Use the simulation controls below to estimate demand and check budget utilization.
    """)
    
    max_waivers = int(waiver_pool // fee_waiver_cost)
    
    # Simulation Controls
    st.subheader("Simulate Waiver Demand")
    col_sim1, col_sim2 = st.columns(2)
    with col_sim1:
        est_low_income_pct = st.slider("Estimated Low-Income Population (% of VAP)", 5.0, 30.0, 12.0, step=0.5)
    with col_sim2:
        est_request_rate = st.slider("Waiver Request Rate among Low-Income (%)", 1.0, 100.0, 15.0, step=1.0)
        
    # Calculations for simulation
    total_estimated_requests = 0
    waiver_sim_data = []
    
    for state, vap in STATE_VAP.items():
        low_income_pop = vap * (est_low_income_pct / 100.0)
        requested_waivers = int(low_income_pop * (est_request_rate / 100.0))
        total_estimated_requests += requested_waivers
        
        waiver_sim_data.append({
            "State": state,
            "Code": STATE_CODES[state],
            "VAP": vap,
            "Estimated Low-Income Pop": int(low_income_pop),
            "Estimated Requests": requested_waivers,
            "Estimated Cost ($)": requested_waivers * fee_waiver_cost
        })
        
    df_waiver_sim = pd.DataFrame(waiver_sim_data)
    total_sim_cost = total_estimated_requests * fee_waiver_cost
    utilization_rate = (total_sim_cost / waiver_pool) * 100
    
    # Metrics
    col_m1, col_m2, col_m3 = st.columns(3)
    with col_m1:
        st.metric("Total Waiver Pool", f"${waiver_pool:,.2f}")
    with col_m2:
        st.metric("Simulated Requests Cost", f"${total_sim_cost:,.2f}", f"{utilization_rate:.1f}% Utilized")
    with col_m3:
        remaining_waiver_funds = waiver_pool - total_sim_cost
        if remaining_waiver_funds >= 0:
            st.metric("Remaining Waiver Funds", f"${remaining_waiver_funds:,.2f}", "Surplus", delta_color="normal")
        else:
            st.metric("Remaining Waiver Funds", f"${remaining_waiver_funds:,.2f}", "Deficit", delta_color="inverse")
            
    # Warning if over budget
    if total_sim_cost > waiver_pool:
        st.error(f"🚨 **Budget Deficit!** The simulated waiver requests exceed the allocated pool by **${abs(remaining_waiver_funds):,.2f}**. Consider increasing the Fee Waivers Pool percentage in the sidebar or reducing the request rate.")
    else:
        st.success("✅ **Budget Safe!** The allocated Fee Waivers Pool is sufficient to cover the simulated demand.")
        
    # Visualization of Waiver Demand
    st.subheader("Simulated Waiver Requests by State")
    fig_waiver_map = px.choropleth(
        df_waiver_sim,
        locations="Code",
        locationmode="USA-states",
        color="Estimated Requests",
        hover_name="State",
        hover_data=["Estimated Low-Income Pop", "Estimated Requests", "Estimated Cost ($)"],
        color_continuous_scale="Teal",
        scope="usa"
    )
    fig_waiver_map.update_layout(geo=dict(bgcolor='rgba(0,0,0,0)'), margin=dict(t=0, b=0, l=0, r=0))
    st.plotly_chart(fig_waiver_map, use_container_width=True)
    
    # Detailed Simulation Table
    st.subheader("Detailed Waiver Simulation Table")
    st.dataframe(
        df_waiver_sim.style.format({
            "VAP": "{:,}",
            "Estimated Low-Income Pop": "{:,}",
            "Estimated Requests": "{:,}",
            "Estimated Cost ($)": "${:,.2f}"
        }),
        use_container_width=True,
        hide_index=True
    )