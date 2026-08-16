import streamlit as st
import pandas as pd
from datetime import datetime
import random

# Set page configuration
st.set_page_config(
    page_title="Card Spend Limit Manager",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State
if 'cards' not in st.session_state:
    st.session_state.cards = {
        "Visa Gold (...4321)": {
            "cardholder": "Jane Doe",
            "daily_limit": 1000.0,
            "single_limit": 500.0,
            "blocked_categories": ["Gambling", "Adult Entertainment"],
            "cumulative_spend": 150.0,
            "history": [
                {"timestamp": "2023-10-27 09:15:00", "merchant": "Starbucks", "category": "Food & Dining", "amount": 12.50, "status": "Approved", "reason": "Within limits"},
                {"timestamp": "2023-10-27 13:30:00", "merchant": "Target", "category": "Shopping", "amount": 137.50, "status": "Approved", "reason": "Within limits"}
            ]
        },
        "Mastercard Platinum (...8765)": {
            "cardholder": "John Smith",
            "daily_limit": 5000.0,
            "single_limit": 2000.0,
            "blocked_categories": ["Gaming"],
            "cumulative_spend": 0.0,
            "history": []
        }
    }

if 'selected_card_name' not in st.session_state:
    st.session_state.selected_card_name = list(st.session_state.cards.keys())[0]

# Helper to get current card data
def get_current_card():
    return st.session_state.cards[st.session_state.selected_card_name]

# Categories available
CATEGORIES = [
    "Food & Dining",
    "Shopping",
    "Travel & Transport",
    "Entertainment",
    "Gambling",
    "Adult Entertainment",
    "Gaming",
    "Utilities & Bills",
    "Groceries",
    "Other"
]

# Title and Description
st.title("💳 Card Spend Limit & Controls Manager")
st.markdown("""
Manage card spending limits, configure real-time merchant category blocklists, 
and simulate transaction authorizations instantly.
""")

# Sidebar - Card Selection & Configuration
st.sidebar.header("💳 Card Selection & Setup")

# Add a new card option
with st.sidebar.expander("➕ Add New Card"):
    new_card_name = st.text_input("Card Name / Label", placeholder="e.g., Business Visa (...9999)")
    new_cardholder = st.text_input("Cardholder Name", placeholder="e.g., Alice Smith")
    new_daily_limit = st.number_input("Daily Limit ($)", min_value=0.0, value=2000.0, step=100.0)
    new_single_limit = st.number_input("Single Transaction Limit ($)", min_value=0.0, value=1000.0, step=50.0)
    
    if st.button("Create Card", use_container_width=True):
        if new_card_name and new_cardholder:
            st.session_state.cards[new_card_name] = {
                "cardholder": new_cardholder,
                "daily_limit": new_daily_limit,
                "single_limit": new_single_limit,
                "blocked_categories": [],
                "cumulative_spend": 0.0,
                "history": []
            }
            st.session_state.selected_card_name = new_card_name
            st.success(f"Card '{new_card_name}' created successfully!")
            st.rerun()
        else:
            st.error("Please provide both Card Name and Cardholder Name.")

st.sidebar.markdown("---")

# Select Active Card
selected_card_name = st.sidebar.selectbox(
    "Select Card to Manage",
    options=list(st.session_state.cards.keys()),
    index=list(st.session_state.cards.keys()).index(st.session_state.selected_card_name)
)
st.session_state.selected_card_name = selected_card_name

card_data = get_current_card()

# Card Configuration Controls
st.sidebar.subheader("⚙️ Control Rules")

# Daily Limit Input
daily_limit = st.sidebar.number_input(
    "Daily Spend Limit ($)",
    min_value=0.0,
    value=float(card_data["daily_limit"]),
    step=50.0,
    key="daily_limit_input"
)
card_data["daily_limit"] = daily_limit

# Single Transaction Limit Input
single_limit = st.sidebar.number_input(
    "Single Transaction Limit ($)",
    min_value=0.0,
    value=float(card_data["single_limit"]),
    step=50.0,
    key="single_limit_input"
)
card_data["single_limit"] = single_limit

# Blocked Categories Multiselect
blocked_cats = st.sidebar.multiselect(
    "Block Merchant Categories",
    options=CATEGORIES,
    default=card_data["blocked_categories"],
    key="blocked_cats_input"
)
card_data["blocked_categories"] = blocked_cats

# Reset Card Data Button
if st.sidebar.button("🔄 Reset Card Spend & Logs", use_container_width=True):
    card_data["cumulative_spend"] = 0.0
    card_data["history"] = []
    st.sidebar.success("Card spend and history reset!")
    st.rerun()


# Main Dashboard Layout
col1, col2, col3 = st.columns(3)

with col1:
    st.metric(
        label="Cardholder",
        value=card_data["cardholder"]
    )

with col2:
    remaining_spend = max(0.0, card_data["daily_limit"] - card_data["cumulative_spend"])
    st.metric(
        label="Remaining Daily Spend",
        value=f"${remaining_spend:,.2f}",
        delta=f"Limit: ${card_data['daily_limit']:,.2f}",
        delta_color="normal"
    )

with col3:
    st.metric(
        label="Cumulative Spend Today",
        value=f"${card_data['cumulative_spend']:,.2f}",
        delta=f"Single Tx Limit: ${card_data['single_limit']:,.2f}",
        delta_color="inverse"
    )

# Progress Bar for Daily Limit
progress_percentage = 0.0
if card_data["daily_limit"] > 0:
    progress_percentage = min(1.0, card_data["cumulative_spend"] / card_data["daily_limit"])

st.markdown("### Daily Limit Usage")
st.progress(progress_percentage)
st.caption(f"Spent: ${card_data['cumulative_spend']:,.2f} of ${card_data['daily_limit']:,.2f} ({progress_percentage * 100:.1f}%)")

st.markdown("---")

# Two Column Layout for Simulator and History
left_col, right_col = st.columns([1, 1.2])

with left_col:
    st.subheader("⚡ Real-Time Transaction Simulator")
    st.markdown("Simulate a live transaction to test your configured rules instantly.")
    
    # Quick Templates
    st.markdown("**Quick Templates:**")
    quick_cols = st.columns(3)
    
    template_triggered = False
    t_merchant, t_category, t_amount = "", "", 0.0
    
    if quick_cols[0].button("☕ Coffee ($4.50)", use_container_width=True):
        t_merchant, t_category, t_amount = "Local Coffee Shop", "Food & Dining", 4.50
        template_triggered = True
    if quick_cols[1].button("🎰 Casino ($600)", use_container_width=True):
        t_merchant, t_category, t_amount = "Vegas Slots", "Gambling", 600.00
        template_triggered = True
    if quick_cols[2].button("💻 Laptop ($1200)", use_container_width=True):
        t_merchant, t_category, t_amount = "Tech Store", "Shopping", 1200.00
        template_triggered = True

    # Transaction Form
    with st.form("transaction_form", clear_on_submit=False):
        merchant = st.text_input(
            "Merchant Name", 
            value=t_merchant if template_triggered else "Amazon",
            placeholder="e.g., Walmart, Netflix"
        )
        
        category = st.selectbox(
            "Merchant Category",
            options=CATEGORIES,
            index=CATEGORIES.index(t_category) if template_triggered and t_category in CATEGORIES else 0
        )
        
        amount = st.number_input(
            "Transaction Amount ($)",
            min_value=0.01,
            value=t_amount if template_triggered else 25.00,
            step=5.0,
            format="%.2f"
        )
        
        submit_tx = st.form_submit_button("🚀 Authorize Transaction", use_container_width=True)
        
        if submit_tx:
            # Authorization Logic
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            approved = True
            reason = "Approved"
            
            # Rule 1: Blocked Category
            if category in card_data["blocked_categories"]:
                approved = False
                reason = f"Declined: Category '{category}' is blocked on this card."
            
            # Rule 2: Single Transaction Limit
            elif amount > card_data["single_limit"]:
                approved = False
                reason = f"Declined: Amount ${amount:,.2f} exceeds Single Transaction Limit of ${card_data['single_limit']:,.2f}."
            
            # Rule 3: Daily Limit
            elif card_data["cumulative_spend"] + amount > card_data["daily_limit"]:
                approved = False
                reason = f"Declined: Transaction of ${amount:,.2f} would exceed remaining Daily Limit of ${(card_data['daily_limit'] - card_data['cumulative_spend']):,.2f}."
            
            # Process Result
            if approved:
                card_data["cumulative_spend"] += amount
                card_data["history"].insert(0, {
                    "timestamp": timestamp,
                    "merchant": merchant,
                    "category": category,
                    "amount": amount,
                    "status": "Approved",
                    "reason": "Authorized successfully"
                })
                st.success(f"✅ **Approved!** Authorized ${amount:,.2f} at {merchant}.")
            else:
                card_data["history"].insert(0, {
                    "timestamp": timestamp,
                    "merchant": merchant,
                    "category": category,
                    "amount": amount,
                    "status": "Declined",
                    "reason": reason
                })
                st.error(f"❌ **Declined!** {reason}")
                
            st.rerun()

with right_col:
    st.subheader("📋 Transaction History & Logs")
    
    if not card_data["history"]:
        st.info("No transactions recorded yet. Use the simulator on the left to run transactions!")
    else:
        # Convert history to DataFrame for display
        df = pd.DataFrame(card_data["history"])
        
        # Style helper
        def style_status(val):
            color = '#2ecc71' if val == 'Approved' else '#e74c3c'
            return f'color: {color}; font-weight: bold;'
        
        # Format DataFrame
        df_display = df.copy()
        df_display['amount'] = df_display['amount'].apply(lambda x: f"${x:,.2f}")
        
        # Display interactive table
        st.dataframe(
            df_display,
            column_config={
                "timestamp": "Timestamp",
                "merchant": "Merchant",
                "category": "Category",
                "amount": "Amount",
                "status": "Status",
                "reason": "Auth Message"
            },
            hide_index=True,
            use_container_width=True
        )
        
        # Summary Statistics
        approved_txs = [tx for tx in card_data["history"] if tx["status"] == "Approved"]
        declined_txs = [tx for tx in card_data["history"] if tx["status"] == "Declined"]
        
        st.markdown("### Quick Stats")
        stat_col1, stat_col2, stat_col3 = st.columns(3)
        stat_col1.metric("Total Attempts", len(card_data["history"]))
        stat_col2.metric("Approved Txs", len(approved_txs))
        stat_col3.metric("Declined Txs", len(declined_txs))

# Footer / Rule Explanation
st.markdown("---")
with st.expander("ℹ️ How the Authorization Engine Works"):
    st.markdown("""
    When a transaction is simulated, the engine evaluates rules in the following order:
    1. **Category Blocklist Check**: If the merchant category matches any category in the card's blocklist, the transaction is immediately declined.
    2. **Single Transaction Limit Check**: If the transaction amount exceeds the configured single transaction limit, it is declined.
    3. **Daily Spend Limit Check**: If the transaction amount plus the cumulative spend for today exceeds the daily limit, it is declined.
    4. **Approval**: If all checks pass, the transaction is approved, and the cumulative spend is updated.
    """)