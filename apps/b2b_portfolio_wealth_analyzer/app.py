import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import json
from datetime import datetime, timedelta

# Set page configuration
st.set_page_config(
    page_title="B2B Portfolio & Wealth Analyzer",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional look
st.markdown("""
<style>
    .reportview-container {
        background: #f8f9fa;
    }
    .metric-card {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #0066cc;
    }
    .metric-label {
        font-size: 0.9rem;
        color: #6c757d;
        font-weight: 600;
    }
    .metric-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: #212529;
    }
</style>
""", unsafe_allow_html=True)

# --- SWAGGER SCHEMA DEFINITION ---
SWAGGER_SCHEMA = {
    "openapi": "3.0.0",
    "info": {
        "title": "B2B Portfolio Wealth Analyzer API",
        "version": "1.0.0",
        "description": "API for parsing, analyzing, and stress-testing B2B brokerage and retirement portfolios."
    },
    "paths": {
        "/analyze": {
            "post": {
                "summary": "Analyze portfolio holdings",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/PortfolioRequest"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Successful analysis response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/PortfolioAnalysisResponse"
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {
            "PortfolioRequest": {
                "type": "object",
                "required": ["account_id", "account_name", "account_type", "holdings"],
                "properties": {
                    "account_id": {"type": "string", "example": "ACC-99281"},
                    "account_name": {"type": "string", "example": "Acme Corp 401(k) Plan"},
                    "account_type": {"type": "string", "enum": ["Brokerage", "Retirement", "Treasury"], "example": "Retirement"},
                    "holdings": {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/Holding"
                        }
                    }
                }
            },
            "Holding": {
                "type": "object",
                "required": ["ticker", "name", "asset_class", "quantity", "price"],
                "properties": {
                    "ticker": {"type": "string", "example": "AAPL"},
                    "name": {"type": "string", "example": "Apple Inc."},
                    "asset_class": {"type": "string", "enum": ["Equities", "Fixed Income", "Cash", "Mutual Funds"], "example": "Equities"},
                    "quantity": {"type": "number", "format": "float", "example": 150.0},
                    "price": {"type": "number", "format": "float", "example": 175.50}
                }
            },
            "PortfolioAnalysisResponse": {
                "type": "object",
                "properties": {
                    "total_value": {"type": "number"},
                    "asset_distribution": {
                        "type": "object",
                        "additionalProperties": {"type": "number"}
                    },
                    "metrics": {
                        "type": "object",
                        "properties": {
                            "expected_return": {"type": "number"},
                            "volatility": {"type": "number"},
                            "sharpe_ratio": {"type": "number"}
                        }
                    }
                }
            }
        }
    }
}

# --- DEFAULT MOCK DATA ---
DEFAULT_ACCOUNTS = [
    {
        "account_id": "ACC-B2B-001",
        "account_name": "Acme Corp Treasury & Surplus",
        "account_type": "Treasury",
        "holdings": [
            {"ticker": "SHV", "name": "iShares Short Treasury Bond ETF", "asset_class": "Cash", "quantity": 12000, "price": 110.25},
            {"ticker": "AGG", "name": "iShares Core U.S. Aggregate Bond ETF", "asset_class": "Fixed Income", "quantity": 8500, "price": 98.40},
            {"ticker": "SPY", "name": "SPDR S&P 500 ETF Trust", "asset_class": "Equities", "quantity": 1500, "price": 510.30},
            {"ticker": "VMFXX", "name": "Vanguard Federal Money Market Fund", "asset_class": "Cash", "quantity": 500000, "price": 1.00}
        ]
    },
    {
        "account_id": "ACC-B2B-002",
        "account_name": "Apex Tech Growth 401(k) Plan",
        "account_type": "Retirement",
        "holdings": [
            {"ticker": "VOO", "name": "Vanguard S&P 500 ETF", "asset_class": "Equities", "quantity": 4500, "price": 468.20},
            {"ticker": "QQQ", "name": "Invesco QQQ Trust", "asset_class": "Equities", "quantity": 3200, "price": 438.90},
            {"ticker": "BND", "name": "Vanguard Total Bond Market ETF", "asset_class": "Fixed Income", "quantity": 12000, "price": 72.15},
            {"ticker": "VTSAX", "name": "Vanguard Total Stock Market Index Fund", "asset_class": "Mutual Funds", "quantity": 8000, "price": 122.50},
            {"ticker": "SPAXX", "name": "Fidelity Government Money Market", "asset_class": "Cash", "quantity": 150000, "price": 1.00}
        ]
    },
    {
        "account_id": "ACC-B2B-003",
        "account_name": "Global Logistics Brokerage Reserve",
        "account_type": "Brokerage",
        "holdings": [
            {"ticker": "MSFT", "name": "Microsoft Corporation", "asset_class": "Equities", "quantity": 2500, "price": 415.50},
            {"ticker": "JNJ", "name": "Johnson & Johnson", "asset_class": "Equities", "quantity": 3000, "price": 156.20},
            {"ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "asset_class": "Fixed Income", "quantity": 9000, "price": 92.80},
            {"ticker": "SWVXX", "name": "Schwab Value Advantage Money Fund", "asset_class": "Cash", "quantity": 350000, "price": 1.00}
        ]
    }
]

# --- HELPER FUNCTIONS ---
def calculate_portfolio_metrics(holdings):
    df = pd.DataFrame(holdings)
    if df.empty:
        return df, 0, {}, 0, 0, 0
    
    df['value'] = df['quantity'] * df['price']
    total_value = df['value'].sum()
    df['weight'] = df['value'] / total_value if total_value > 0 else 0
    
    # Asset class distribution
    distribution = df.groupby('asset_class')['value'].sum().to_dict()
    dist_weights = df.groupby('asset_class')['weight'].sum().to_dict()
    
    # Simulated asset class performance metrics (Expected Return, Volatility)
    # Equities: 9% return, 16% vol
    # Fixed Income: 4.5% return, 6% vol
    # Cash: 5.0% return, 0.5% vol
    # Mutual Funds: 7.5% return, 12% vol
    asset_metrics = {
        "Equities": {"return": 0.095, "vol": 0.16},
        "Fixed Income": {"return": 0.045, "vol": 0.055},
        "Cash": {"return": 0.050, "vol": 0.005},
        "Mutual Funds": {"return": 0.075, "vol": 0.11}
    }
    
    weighted_return = 0.0
    weighted_vol = 0.0
    
    for asset_class, weight in dist_weights.items():
        metrics = asset_metrics.get(asset_class, {"return": 0.05, "vol": 0.10})
        weighted_return += metrics["return"] * weight
        weighted_vol += metrics["vol"] * weight  # Simplified linear combination for UI simulation
        
    # Risk-free rate assumed at 4.5% (current high-yield cash environment)
    rf_rate = 0.045
    sharpe_ratio = (weighted_return - rf_rate) / weighted_vol if weighted_vol > 0 else 0
    
    return df, total_value, distribution, weighted_return, weighted_vol, sharpe_ratio

def run_monte_carlo(total_value, expected_return, volatility, years=10, simulations=100):
    dt = 1 / 252
    trading_days = int(years * 252)
    results = np.zeros((trading_days, simulations))
    results[0] = total_value
    
    # Daily drift and shock
    daily_return = expected_return / 252
    daily_vol = volatility / np.sqrt(252)
    
    for t in range(1, trading_days):
        shocks = np.random.normal(0, 1, simulations)
        results[t] = results[t-1] * (1 + daily_return + daily_vol * shocks)
        
    return results

# --- APP LAYOUT ---

st.title("💼 B2B Portfolio & Wealth Analyzer")
st.markdown("Analyze corporate treasury, brokerage, and retirement accounts. Parse holdings, evaluate asset distributions, and run stress-test simulations.")

# Sidebar Controls
st.sidebar.header("Portfolio Source")
source_option = st.sidebar.radio(
    "Select Input Method:",
    ["Preloaded B2B Accounts", "Upload Custom JSON (Swagger Schema)", "Manual Holdings Entry"]
)

selected_portfolio = None

if source_option == "Preloaded B2B Accounts":
    account_names = [acc["account_name"] for acc in DEFAULT_ACCOUNTS]
    selected_acc_name = st.sidebar.selectbox("Select B2B Account:", account_names)
    selected_portfolio = next(acc for acc in DEFAULT_ACCOUNTS if acc["account_name"] == selected_acc_name)

elif source_option == "Upload Custom JSON (Swagger Schema)":
    st.sidebar.markdown("### Upload JSON")
    uploaded_file = st.sidebar.file_uploader("Upload portfolio JSON file", type=["json"])
    
    # Provide a template download
    template_json = json.dumps(DEFAULT_ACCOUNTS[0], indent=2)
    st.sidebar.download_button(
        label="📥 Download Schema Template",
        data=template_json,
        file_name="b2b_portfolio_template.json",
        mime="application/json"
    )
    
    if uploaded_file is not None:
        try:
            selected_portfolio = json.load(uploaded_file)
            st.sidebar.success("Portfolio loaded successfully!")
        except Exception as e:
            st.sidebar.error(f"Invalid JSON format: {e}")
    else:
        st.sidebar.info("Please upload a JSON file matching the Swagger schema. Using default Acme Corp Treasury as fallback.")
        selected_portfolio = DEFAULT_ACCOUNTS[0]

else:  # Manual Holdings Entry
    st.sidebar.markdown("### Create Custom Portfolio")
    acc_name = st.sidebar.text_input("Account Name", "Custom Enterprise Fund")
    acc_type = st.sidebar.selectbox("Account Type", ["Brokerage", "Retirement", "Treasury"])
    
    # Simple dynamic input for 3 holdings
    st.sidebar.markdown("#### Holdings")
    holdings = []
    
    for i in range(1, 4):
        st.sidebar.markdown(f"**Asset #{i}**")
        col1, col2 = st.sidebar.columns(2)
        with col1:
            ticker = st.text_input(f"Ticker #{i}", value=f"TKR{i}", key=f"t_{i}")
            asset_class = st.selectbox(f"Class #{i}", ["Equities", "Fixed Income", "Cash", "Mutual Funds"], key=f"c_{i}")
        with col2:
            qty = st.number_input(f"Qty #{i}", min_value=0.0, value=1000.0, step=100.0, key=f"q_{i}")
            price = st.number_input(f"Price #{i}", min_value=0.0, value=100.0, step=10.0, key=f"p_{i}")
        
        holdings.append({
            "ticker": ticker,
            "name": f"Asset {ticker}",
            "asset_class": asset_class,
            "quantity": qty,
            "price": price
        })
        
    selected_portfolio = {
        "account_id": "ACC-CUSTOM-99",
        "account_name": acc_name,
        "account_type": acc_type,
        "holdings": holdings
    }

# --- MAIN DASHBOARD ---

if selected_portfolio:
    # Parse and calculate
    df_holdings, total_val, dist, exp_ret, vol, sharpe = calculate_portfolio_metrics(selected_portfolio["holdings"])
    
    # Header Info
    col_header1, col_header2 = st.columns([2, 1])
    with col_header1:
        st.subheader(f"Account: {selected_portfolio['account_name']}")
        st.caption(f"ID: {selected_portfolio['account_id']} | Type: {selected_portfolio['account_type']}")
    with col_header2:
        st.metric(label="Total Portfolio Value", value=f"${total_val:,.2f}")

    # Tabs for different analysis views
    tab_summary, tab_holdings, tab_projections, tab_stress, tab_schema = st.tabs([
        "📊 Portfolio Summary", 
        "📋 Holdings Detail", 
        "📈 Future Projections", 
        "⚡ Stress Testing",
        "⚙️ API Swagger Schema"
    ])

    # --- TAB 1: SUMMARY ---
    with tab_summary:
        # KPI Cards
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Expected Annual Return</div>
                <div class="metric-value">{exp_ret*100:.2f}%</div>
            </div>
            """, unsafe_allow_html=True)
        with col2:
            st.markdown(f"""
            <div class="metric-card" style="border-left-color: #ff9900;">
                <div class="metric-label">Portfolio Volatility</div>
                <div class="metric-value">{vol*100:.2f}%</div>
            </div>
            """, unsafe_allow_html=True)
        with col3:
            st.markdown(f"""
            <div class="metric-card" style="border-left-color: #2ca02c;">
                <div class="metric-label">Sharpe Ratio (Rf=4.5%)</div>
                <div class="metric-value">{sharpe:.2f}</div>
            </div>
            """, unsafe_allow_html=True)
        with col4:
            cash_drag = dist.get("Cash", 0) / total_val if total_val > 0 else 0
            st.markdown(f"""
            <div class="metric-card" style="border-left-color: #d62728;">
                <div class="metric-label">Cash Drag Ratio</div>
                <div class="metric-value">{cash_drag*100:.1f}%</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("---")

        # Charts Section
        col_chart1, col_chart2 = st.columns([1, 1])
        
        with col_chart1:
            st.markdown("### Asset Class Allocation")
            if dist:
                fig_pie = px.pie(
                    names=list(dist.keys()),
                    values=list(dist.values()),
                    hole=0.4,
                    color_discrete_sequence=px.colors.qualitative.Pastel
                )
                fig_pie.update_layout(margin=dict(t=20, b=20, l=20, r=20))
                st.plotly_chart(fig_pie, use_container_width=True)
            else:
                st.info("No asset distribution data available.")

        with col_chart2:
            st.markdown("### Holdings Weight Distribution")
            if not df_holdings.empty:
                fig_bar = px.bar(
                    df_holdings.sort_values(by="weight", ascending=True),
                    x="weight",
                    y="ticker",
                    orientation='h',
                    text="ticker",
                    labels={"weight": "Weight in Portfolio", "ticker": "Asset Ticker"},
                    color="asset_class",
                    color_discrete_sequence=px.colors.qualitative.Safe
                )
                fig_bar.update_layout(margin=dict(t=20, b=20, l=20, r=20), showlegend=False)
                st.plotly_chart(fig_bar, use_container_width=True)
            else:
                st.info("No holdings data available.")

    # --- TAB 2: HOLDINGS DETAIL ---
    with tab_holdings:
        st.markdown("### Current Holdings Analysis")
        if not df_holdings.empty:
            # Format dataframe for display
            display_df = df_holdings.copy()
            display_df['price'] = display_df['price'].map('${:,.2f}'.format)
            display_df['value'] = display_df['value'].map('${:,.2f}'.format)
            display_df['weight'] = display_df['weight'].map('{:.2%}'.format)
            display_df['quantity'] = display_df['quantity'].map('{:,.2f}'.format)
            
            st.dataframe(
                display_df[['ticker', 'name', 'asset_class', 'quantity', 'price', 'value', 'weight']],
                use_container_width=True,
                hide_index=True
            )
            
            # Export CSV Option
            csv = df_holdings.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Export Holdings CSV",
                data=csv,
                file_name=f"holdings_{selected_portfolio['account_id']}.csv",
                mime='text/csv'
            )
        else:
            st.warning("No holdings found in this portfolio.")

    # --- TAB 3: FUTURE PROJECTIONS ---
    with tab_projections:
        st.markdown("### Monte Carlo Wealth Projection")
        st.markdown("Simulate 100 potential future paths for this portfolio over the next 10 years based on its current asset allocation, expected return, and volatility.")
        
        col_proj1, col_proj2 = st.columns([1, 3])
        with col_proj1:
            years = st.slider("Simulation Horizon (Years)", min_value=1, max_value=20, value=10)
            sims = st.slider("Number of Simulations", min_value=10, max_value=500, value=100)
            run_sim = st.button("Run Simulation", type="primary")
            
        with col_proj2:
            if run_sim or 'sim_results' not in st.session_state:
                sim_results = run_monte_carlo(total_val, exp_ret, vol, years=years, simulations=sims)
                st.session_state['sim_results'] = sim_results
                st.session_state['sim_years'] = years
            else:
                sim_results = st.session_state['sim_results']
                years = st.session_state['sim_years']
                
            # Plotting Monte Carlo
            time_axis = np.linspace(0, years, sim_results.shape[0])
            fig_mc = go.Figure()
            
            # Plot individual paths with low opacity
            for i in range(min(sims, 50)):  # Limit to 50 lines for performance
                fig_mc.add_trace(go.Scatter(
                    x=time_axis, y=sim_results[:, i], 
                    mode='lines', 
                    line=dict(width=1, color='rgba(0, 102, 204, 0.15)'),
                    showlegend=False
                ))
                
            # Plot Percentiles
            p10 = np.percentile(sim_results, 10, axis=1)
            p50 = np.percentile(sim_results, 50, axis=1)
            p90 = np.percentile(sim_results, 90, axis=1)
            
            fig_mc.add_trace(go.Scatter(x=time_axis, y=p90, mode='lines', line=dict(color='green', width=2, dash='dash'), name='90th Percentile (Optimistic)'))
            fig_mc.add_trace(go.Scatter(x=time_axis, y=p50, mode='lines', line=dict(color='blue', width=3), name='50th Percentile (Median)'))
            fig_mc.add_trace(go.Scatter(x=time_axis, y=p10, mode='lines', line=dict(color='red', width=2, dash='dash'), name='10th Percentile (Conservative)'))
            
            fig_mc.update_layout(
                title=f"Wealth Projection Over {years} Years",
                xaxis_title="Years",
                yaxis_title="Portfolio Value ($)",
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
                margin=dict(t=80, b=40, l=40, r=40)
            )
            st.plotly_chart(fig_mc, use_container_width=True)

    # --- TAB 4: STRESS TESTING ---
    with tab_stress:
        st.markdown("### Macroeconomic Stress Testing")
        st.markdown("Evaluate how your current portfolio allocation would perform under historical and hypothetical macroeconomic shock scenarios.")
        
        scenarios = {
            "2008 Financial Crisis": {
                "Equities": -0.38, "Fixed Income": 0.05, "Cash": 0.02, "Mutual Funds": -0.25,
                "desc": "Severe global equity sell-off with flight to quality in government bonds."
            },
            "High Inflation & Rate Hike": {
                "Equities": -0.12, "Fixed Income": -0.08, "Cash": 0.05, "Mutual Funds": -0.10,
                "desc": "Rapid interest rate increases to combat inflation, hurting both long-duration bonds and growth equities."
            },
            "Tech Sector Bull Run": {
                "Equities": 0.25, "Fixed Income": 0.02, "Cash": 0.01, "Mutual Funds": 0.15,
                "desc": "Rapid expansion of technology and growth stocks driving broad market indices upward."
            },
            "Stagflation Scenario": {
                "Equities": -0.15, "Fixed Income": -0.02, "Cash": 0.04, "Mutual Funds": -0.08,
                "desc": "Stagnant economic growth coupled with high inflation, challenging traditional 60/40 portfolios."
            }
        }
        
        selected_scenario = st.selectbox("Select Stress Scenario:", list(scenarios.keys()))
        scenario_data = scenarios[selected_scenario]
        
        st.info(f"**Scenario Description:** {scenario_data['desc']}")
        
        # Calculate impact
        impact_details = []
        total_impact_val = 0.0
        
        for _, row in df_holdings.iterrows():
            asset_class = row['asset_class']
            shock = scenario_data.get(asset_class, 0.0)
            current_val = row['value']
            impact_val = current_val * shock
            new_val = current_val + impact_val
            total_impact_val += impact_val
            
            impact_details.append({
                "Ticker": row['ticker'],
                "Asset Class": asset_class,
                "Current Value": current_val,
                "Shock Applied": f"{shock*100:+.1f}%",
                "Estimated Impact": impact_val,
                "New Value": new_val
            })
            
        df_impact = pd.DataFrame(impact_details)
        
        # Scenario Metrics
        col_s1, col_s2, col_s3 = st.columns(3)
        with col_s1:
            st.metric("Current Portfolio Value", f"${total_val:,.2f}")
        with col_s2:
            color_metric = "normal" if total_impact_val >= 0 else "inverse"
            st.metric(
                "Estimated Scenario Impact", 
                f"${total_impact_val:,.2f}", 
                delta=f"{(total_impact_val/total_val)*100:.2f}%" if total_val > 0 else "0%",
                delta_color=color_metric
            )
        with col_s3:
            st.metric("Stressed Portfolio Value", f"${total_val + total_impact_val:,.2f}")
            
        st.markdown("#### Asset-Level Impact Breakdown")
        
        # Format impact table
        df_impact_disp = df_impact.copy()
        df_impact_disp['Current Value'] = df_impact_disp['Current Value'].map('${:,.2f}'.format)
        df_impact_disp['Estimated Impact'] = df_impact_disp['Estimated Impact'].map('${:,.2f}'.format)
        df_impact_disp['New Value'] = df_impact_disp['New Value'].map('${:,.2f}'.format)
        
        st.dataframe(df_impact_disp, use_container_width=True, hide_index=True)

    # --- TAB 5: SWAGGER SCHEMA ---
    with tab_schema:
        st.markdown("### OpenAPI / Swagger Schema Specification")
        st.markdown("This application is built to consume and produce data matching the following OpenAPI 3.0 specification. Integrate your B2B backend directly with this schema structure.")
        
        st.json(SWAGGER_SCHEMA)

else:
    st.warning("Please select or upload a portfolio to begin analysis.")