import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import random
import datetime

# Set up Streamlit page configuration
st.set_page_config(
    page_title="ApexTrade - Brokerage Order Execution Simulator",
    layout="wide",
    page_icon="⚡",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional trading terminal styling
st.markdown("""
    <style>
    .reportview-container {
        background: #0e1117;
    }
    .metric-card {
        background-color: #1e222b;
        border-radius: 8px;
        padding: 15px;
        border: 1px solid #2a2e39;
    }
    .stButton>button {
        width: 100%;
    }
    .success-text {
        color: #00e676;
        font-weight: bold;
    }
    .danger-text {
        color: #ff1744;
        font-weight: bold;
    }
    </style>
""", unsafe_allow_index=True)

# ---------------------------------------------------------
# SESSION STATE INITIALIZATION
# ---------------------------------------------------------
if 'initialized' not in st.session_state:
    st.session_state.cash = 100000.00
    st.session_state.portfolio = {
        "AAPL": 50.0,
        "TSLA": 20.0,
        "MSFT": 15.0,
        "NVDA": 30.0,
        "BTC": 0.5,
        "ETH": 3.0,
        "SOL": 25.0,
        "DOGE": 5000.0
    }
    st.session_state.prices = {
        "AAPL": 175.50,
        "TSLA": 180.20,
        "MSFT": 420.10,
        "NVDA": 875.00,
        "BTC": 65000.00,
        "ETH": 3500.00,
        "SOL": 140.00,
        "DOGE": 0.15
    }
    # Generate some mock historical data for charts
    st.session_state.price_history = {}
    for asset, price in st.session_state.prices.items():
        history = []
        current_p = price
        for _ in range(30):
            current_p = round(current_p * (1 + random.uniform(-0.03, 0.03)), 2)
            history.append(current_p)
        history.append(price)
        st.session_state.price_history[asset] = history

    # Transaction Ledger
    st.session_state.transactions = [
        {
            "Timestamp": (datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"),
            "Asset": "AAPL",
            "Type": "BUY",
            "Order Type": "MARKET",
            "Quantity": 50.0,
            "Price": 172.10,
            "Commission": 4.95,
            "Total Value": 8609.95,
            "Status": "FILLED"
        },
        {
            "Timestamp": (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"),
            "Asset": "BTC",
            "Type": "BUY",
            "Order Type": "MARKET",
            "Quantity": 0.5,
            "Price": 62000.00,
            "Commission": 155.00,
            "Total Value": 31155.00,
            "Status": "FILLED"
        }
    ]
    st.session_state.limit_orders = []
    st.session_state.initialized = True

# Asset categories
EQUITIES = ["AAPL", "TSLA", "MSFT", "NVDA"]
CRYPTOS = ["BTC", "ETH", "SOL", "DOGE"]

# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------
def get_commission(asset, quantity, price, order_type):
    """Calculates commission: Flat fee for equities, percentage for crypto."""
    if order_type == "LIMIT":
        # Limit orders get a slight discount
        if asset in EQUITIES:
            return 2.95
        else:
            return round((quantity * price) * 0.0025, 2) # 0.25%
    else:
        if asset in EQUITIES:
            return 4.95
        else:
            return round((quantity * price) * 0.005, 2) # 0.5%

def simulate_market_tick(volatility=1.0):
    """Simulates a price tick for all assets and checks pending limit orders."""
    for asset in st.session_state.prices:
        # Volatility multiplier
        change_percent = random.uniform(-0.02, 0.02) * volatility
        old_price = st.session_state.prices[asset]
        new_price = round(old_price * (1 + change_percent), 4 if asset == "DOGE" else 2)
        if new_price <= 0:
            new_price = 0.01
        st.session_state.prices[asset] = new_price
        st.session_state.price_history[asset].append(new_price)
        if len(st.session_state.price_history[asset]) > 50:
            st.session_state.price_history[asset].pop(0)
    
    check_limit_orders()

def check_limit_orders():
    """Checks and executes pending limit orders if price conditions are met."""
    remaining_orders = []
    for order in st.session_state.limit_orders:
        asset = order["Asset"]
        current_price = st.session_state.prices[asset]
        limit_price = order["Limit Price"]
        qty = order["Quantity"]
        commission = order["Commission"]
        order_type = order["Type"]
        
        executed = False
        if order_type == "BUY" and current_price <= limit_price:
            total_cost = (qty * current_price) + commission
            if st.session_state.cash >= total_cost:
                st.session_state.cash -= total_cost
                st.session_state.portfolio[asset] = st.session_state.portfolio.get(asset, 0.0) + qty
                executed = True
        elif order_type == "SELL" and current_price >= limit_price:
            if st.session_state.portfolio.get(asset, 0.0) >= qty:
                total_revenue = (qty * current_price) - commission
                st.session_state.cash += total_revenue
                st.session_state.portfolio[asset] -= qty
                executed = True
                
        if executed:
            st.session_state.transactions.append({
                "Timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Asset": asset,
                "Type": order_type,
                "Order Type": "LIMIT (TRIGGERED)",
                "Quantity": qty,
                "Price": current_price,
                "Commission": commission,
                "Total Value": (qty * current_price) + (commission if order_type == "BUY" else -commission),
                "Status": "FILLED"
            })
            st.toast(f"Limit Order Executed: {order_type} {qty} {asset} @ ${current_price:,.2f}", icon="✅")
        else:
            remaining_orders.append(order)
            
    st.session_state.limit_orders = remaining_orders

# ---------------------------------------------------------
# SIDEBAR - ACCOUNT SUMMARY & CONTROLS
# ---------------------------------------------------------
with st.sidebar:
    st.title("⚡ ApexTrade Engine")
    st.write("---")
    
    # Market Status Indicator
    st.markdown("### **Market Status: 🟢 OPEN**")
    
    # Volatility Control
    volatility = st.slider("Market Volatility Multiplier", min_value=0.5, max_value=3.0, value=1.0, step=0.1)
    
    if st.button("🔄 Simulate Market Tick", type="primary"):
        simulate_market_tick(volatility)
        st.rerun()
        
    st.write("---")
    st.subheader("💰 Quick Account Actions")
    
    # Deposit/Withdraw Mock Funds
    action_type = st.radio("Action", ["Deposit Funds", "Withdraw Funds"])
    amount = st.number_input("Amount ($)", min_value=10.0, max_value=100000.0, value=1000.0, step=100.0)
    
    if st.button("Submit Cash Transaction"):
        if action_type == "Deposit Funds":
            st.session_state.cash += amount
            st.success(f"Deposited ${amount:,.2f} successfully!")
        else:
            if st.session_state.cash >= amount:
                st.session_state.cash -= amount
                st.success(f"Withdrew ${amount:,.2f} successfully!")
            else:
                st.error("Insufficient cash balance!")
        st.rerun()

# Calculate Portfolio Metrics
total_assets_value = sum(st.session_state.portfolio.get(asset, 0.0) * price for asset, price in st.session_state.prices.items())
total_portfolio_value = st.session_state.cash + total_assets_value

# ---------------------------------------------------------
# MAIN INTERFACE - 4 APPS IN 1 DASHBOARD
# ---------------------------------------------------------
st.title("Brokerage Order Execution Simulator")
st.write("A high-fidelity simulation of an institutional order routing and execution engine.")

# Top level metrics bar
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Total Portfolio Value", f"${total_portfolio_value:,.2f}")
with col2:
    st.metric("Cash Balance", f"${st.session_state.cash:,.2f}")
with col3:
    st.metric("Invested Assets Value", f"${total_assets_value:,.2f}")
with col4:
    st.metric("Pending Limit Orders", f"{len(st.session_state.limit_orders)} Active")

# Create 4 distinct tabs representing the 4 sub-apps
tab1, tab2, tab3, tab4 = st.tabs([
    "📈 App 1: Trading Terminal", 
    "💼 App 2: Portfolio & Account Manager", 
    "📊 App 3: Market Data & Order Book", 
    "📜 App 4: Ledger & Analytics"
])

# =========================================================
# APP 1: TRADING TERMINAL
# =========================================================
with tab1:
    st.header("Order Entry Terminal")
    
    t_col1, t_col2 = st.columns([2, 1])
    
    with t_col1:
        st.subheader("Configure Order")
        
        # Asset Selection
        asset_type = st.radio("Asset Class", ["Equities (Stocks)", "Cryptocurrency"], horizontal=True)
        available_assets = EQUITIES if asset_type == "Equities (Stocks)" else CRYPTOS
        
        asset = st.selectbox("Select Asset Symbol", available_assets)
        current_price = st.session_state.prices[asset]
        
        st.info(f"Current Market Price for **{asset}**: **${current_price:,.4f if asset == 'DOGE' else ',.2f'}**")
        
        # Order Parameters
        o_col1, o_col2, o_col3 = st.columns(3)
        with o_col1:
            side = st.radio("Order Side", ["BUY", "SELL"])
        with o_col2:
            order_type = st.radio("Order Type", ["MARKET", "LIMIT"])
        with o_col3:
            quantity = st.number_input("Quantity", min_value=0.0001 if asset_type == "Cryptocurrency" else 1.0, value=1.0, step=1.0)
            
        limit_price = current_price
        if order_type == "LIMIT":
            limit_price = st.number_input("Limit Price ($)", min_value=0.0001, value=current_price, step=0.1)
            
        # Calculations
        subtotal = quantity * limit_price
        commission = get_commission(asset, quantity, limit_price, order_type)
        total_cost = subtotal + commission if side == "BUY" else subtotal - commission
        
    with t_col2:
        st.subheader("Order Preview & Validation")
        
        # Validation Checks
        is_valid = True
        validation_msg = []
        
        if side == "BUY":
            if total_cost > st.session_state.cash:
                is_valid = False
                validation_msg.append("❌ Insufficient cash balance to cover order + commission.")
            else:
                validation_msg.append("✅ Cash balance verified.")
        else: # SELL
            available_qty = st.session_state.portfolio.get(asset, 0.0)
            if quantity > available_qty:
                is_valid = False
                validation_msg.append(f"❌ Insufficient asset holdings. You own {available_qty} {asset}.")
            else:
                validation_msg.append(f"✅ Asset holdings verified ({available_qty} {asset} available).")
                
        if quantity <= 0:
            is_valid = False
            validation_msg.append("❌ Quantity must be greater than zero.")
            
        # Display Order Ticket
        st.markdown(f"""
        **Order Summary:**
        * **Action:** {side} {quantity} {asset}
        * **Execution Type:** {order_type}
        * **Estimated Price:** ${limit_price:,.4f if asset == 'DOGE' else ',.2f'}
        * **Subtotal:** ${subtotal:,.2f}
        * **Commission:** ${commission:,.2f}
        * **Total Estimated {'Cost' if side == 'BUY' else 'Credit'}:** **${total_cost:,.2f}**
        """)
        
        st.write("---")
        for msg in validation_msg:
            st.write(msg)
            
        if st.button("🚀 Transmit Order to Engine", disabled=not is_valid, type="primary"):
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            if order_type == "MARKET":
                # Execute immediately
                if side == "BUY":
                    st.session_state.cash -= total_cost
                    st.session_state.portfolio[asset] = st.session_state.portfolio.get(asset, 0.0) + quantity
                else: # SELL
                    st.session_state.cash += total_cost
                    st.session_state.portfolio[asset] = st.session_state.portfolio.get(asset, 0.0) - quantity
                    
                st.session_state.transactions.append({
                    "Timestamp": timestamp,
                    "Asset": asset,
                    "Type": side,
                    "Order Type": "MARKET",
                    "Quantity": quantity,
                    "Price": current_price,
                    "Commission": commission,
                    "Total Value": total_cost,
                    "Status": "FILLED"
                })
                st.success(f"Market Order Executed! Filled {quantity} {asset} @ ${current_price:,.2f}")
            else:
                # Place Limit Order
                st.session_state.limit_orders.append({
                    "Timestamp": timestamp,
                    "Asset": asset,
                    "Type": side,
                    "Order Type": "LIMIT",
                    "Quantity": quantity,
                    "Limit Price": limit_price,
                    "Commission": commission,
                    "Total Value": total_cost,
                    "Status": "PENDING"
                })
                st.info(f"Limit Order Placed! {side} {quantity} {asset} @ ${limit_price:,.2f}")
                
            st.rerun()

# =========================================================
# APP 2: PORTFOLIO & ACCOUNT MANAGER
# =========================================================
with tab2:
    st.header("Portfolio & Asset Allocation")
    
    p_col1, p_col2 = st.columns([3, 2])
    
    with p_col1:
        st.subheader("Current Holdings")
        
        # Build holdings dataframe
        holdings_data = []
        for asset, qty in st.session_state.portfolio.items():
            if qty > 0:
                price = st.session_state.prices[asset]
                market_value = qty * price
                allocation = (market_value / total_portfolio_value) * 100
                holdings_data.append({
                    "Asset": asset,
                    "Quantity Owned": qty,
                    "Current Price": f"${price:,.4f if asset == 'DOGE' else ',.2f'}",
                    "Market Value": market_value,
                    "Allocation %": allocation
                })
                
        if holdings_data:
            df_holdings = pd.DataFrame(holdings_data)
            # Format Market Value and Allocation for display
            df_display = df_holdings.copy()
            df_display["Market Value"] = df_display["Market Value"].map(lambda x: f"${x:,.2f}")
            df_display["Allocation %"] = df_display["Allocation %"].map(lambda x: f"{x:.2f}%")
            st.dataframe(df_display, use_container_width=True, hide_index=True)
        else:
            st.info("No active asset holdings. Go to the Trading Terminal to buy assets!")
            
    with p_col2:
        st.subheader("Asset Allocation Chart")
        if holdings_data:
            # Add cash to allocation chart
            chart_data = pd.DataFrame(holdings_data)
            cash_row = pd.DataFrame([{
                "Asset": "CASH",
                "Quantity Owned": st.session_state.cash,
                "Current Price": "$1.00",
                "Market Value": st.session_state.cash,
                "Allocation %": (st.session_state.cash / total_portfolio_value) * 100
            }])
            chart_data = pd.concat([chart_data, cash_row], ignore_index=True)
            
            fig = px.pie(
                chart_data, 
                values="Market Value", 
                names="Asset", 
                hole=0.4,
                color_discrete_sequence=px.colors.qualitative.Pastel
            )
            fig.update_layout(margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.write("No data to display allocation chart.")

# =========================================================
# APP 3: MARKET DATA & ORDER BOOK
# =========================================================
with tab3:
    st.header("Market Data & Order Book Depth")
    
    m_col1, m_col2 = st.columns([3, 2])
    
    with m_col1:
        st.subheader("Historical Price Chart")
        selected_chart_asset = st.selectbox("Select Asset for Charting", list(st.session_state.prices.keys()))
        
        # Plotly line chart of price history
        history_prices = st.session_state.price_history[selected_chart_asset]
        fig_chart = px.line(
            x=list(range(len(history_prices))), 
            y=history_prices,
            labels={"x": "Ticks", "y": "Price ($)"},
            title=f"{selected_chart_asset} Price Trend"
        )
        fig_chart.update_traces(line_color="#00e676" if history_prices[-1] >= history_prices[0] else "#ff1744")
        st.plotly_chart(fig_chart, use_container_width=True)
        
    with m_col2:
        st.subheader("Simulated Order Book Depth")
        current_p = st.session_state.prices[selected_chart_asset]
        
        # Generate mock order book depth
        bids = []
        asks = []
        for i in range(1, 6):
            bid_p = round(current_p * (1 - (i * 0.002)), 4 if selected_chart_asset == "DOGE" else 2)
            bid_size = round(random.uniform(10, 500) / (1 if selected_chart_asset in EQUITIES else 0.01), 2)
            bids.append({"Bid Price": bid_p, "Size": bid_size})
            
            ask_p = round(current_p * (1 + (i * 0.002)), 4 if selected_chart_asset == "DOGE" else 2)
            ask_size = round(random.uniform(10, 500) / (1 if selected_chart_asset in EQUITIES else 0.01), 2)
            asks.append({"Ask Price": ask_p, "Size": ask_size})
            
        df_bids = pd.DataFrame(bids).sort_values(by="Bid Price", ascending=False)
        df_asks = pd.DataFrame(asks).sort_values(by="Ask Price", ascending=True)
        
        st.write(f"**Asset:** {selected_chart_asset} | **Spread:** ${(df_asks['Ask Price'].iloc[0] - df_bids['Bid Price'].iloc[0]):,.4f if selected_chart_asset == 'DOGE' else ',.2f'}")
        
        ob_col1, ob_col2 = st.columns(2)
        with ob_col1:
            st.markdown("<span class='success-text'>BIDS (BUY)</span>", unsafe_allow_index=True)
            st.dataframe(df_bids, use_container_width=True, hide_index=True)
        with ob_col2:
            st.markdown("<span class='danger-text'>ASKS (SELL)</span>", unsafe_allow_index=True)
            st.dataframe(df_asks, use_container_width=True, hide_index=True)

# =========================================================
# APP 4: LEDGER & ANALYTICS
# =========================================================
with tab4:
    st.header("Transaction Ledger & Performance Analytics")
    
    # Active Limit Orders Section
    st.subheader("⏳ Pending Limit Orders")
    if st.session_state.limit_orders:
        df_limits = pd.DataFrame(st.session_state.limit_orders)
        
        # Add a cancel button for each limit order
        for idx, order in enumerate(st.session_state.limit_orders):
            col_o, col_c = st.columns([5, 1])
            with col_o:
                st.info(f"Order #{idx+1}: {order['Type']} {order['Quantity']} {order['Asset']} @ Limit Price ${order['Limit Price']:,.2f}")
            with col_c:
                if st.button("Cancel", key=f"cancel_{idx}"):
                    st.session_state.limit_orders.pop(idx)
                    st.toast("Limit Order Cancelled", icon="ℹ️")
                    st.rerun()
    else:
        st.write("No pending limit orders.")
        
    st.write("---")
    
    # Transaction History Section
    st.subheader("📜 Executed Transaction History")
    if st.session_state.transactions:
        df_tx = pd.DataFrame(st.session_state.transactions)
        # Sort by timestamp descending
        df_tx = df_tx.sort_values(by="Timestamp", ascending=False)
        st.dataframe(df_tx, use_container_width=True, hide_index=True)
        
        # Download Ledger Button
        csv = df_tx.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Transaction Ledger CSV",
            data=csv,
            file_name="apex_trade_ledger.csv",
            mime="text/csv"
        )
    else:
        st.info("No transactions recorded yet.")
        
    st.write("---")
    
    # Analytics Section
    st.subheader("📊 Execution Analytics")
    if st.session_state.transactions:
        df_tx_filled = df_tx[df_tx["Status"] == "FILLED"]
        total_volume = df_tx_filled["Total Value"].sum()
        total_commissions = df_tx_filled["Commission"].sum()
        trade_count = len(df_tx_filled)
        
        a_col1, a_col2, a_col3 = st.columns(3)
        with a_col1:
            st.metric("Total Traded Volume", f"${total_volume:,.2f}")
        with a_col2:
            st.metric("Total Commissions Paid", f"${total_commissions:,.2f}")
        with a_col3:
            st.metric("Total Executed Trades", f"{trade_count}")
            
        # Simple bar chart of trades per asset
        fig_analytics = px.bar(
            df_tx_filled, 
            x="Asset", 
            y="Total Value", 
            color="Type", 
            title="Trading Volume Breakdown by Asset & Side",
            barmode="group"
        )
        st.plotly_chart(fig_analytics, use_container_width=True)
    else:
        st.write("No analytics available. Execute trades to populate metrics.")