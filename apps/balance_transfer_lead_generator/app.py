import streamlit as st
import pandas as pd
import numpy as np
import uuid

# --- Configuration & Mock Data Generation ---
def generate_customer_data(n=50):
    data = {
        "customer_id": [str(uuid.uuid4())[:8] for _ in range(n)],
        "name": [f"Customer {i}" for i in range(n)],
        "email": [f"user{i}@example.com" for i in range(n)],
        "phone": [f"555-010{i:02}" for i in range(n)],
        "current_balance": np.random.uniform(1000, 25000, n).round(2),
        "credit_limit": np.random.uniform(5000, 30000, n).round(2),
        "apr": np.random.uniform(15.0, 29.9, n).round(2)
    }
    df = pd.DataFrame(data)
    df["utilization"] = (df["current_balance"] / df["credit_limit"]) * 100
    return df

# --- Business Logic ---
def calculate_savings(balance, current_apr, promo_apr=0.0, fee=0.03):
    # Simple 12-month savings projection
    current_interest = balance * (current_apr / 100)
    promo_interest = balance * (promo_apr / 100)
    transfer_fee = balance * fee
    savings = current_interest - (promo_interest + transfer_fee)
    return round(max(0, savings), 2)

# --- App UI ---
st.set_page_config(page_title="Balance Transfer Lead Gen", layout="wide")
st.title("🏦 Balance Transfer Lead Generation Dashboard")

if 'customers' not in st.session_state:
    st.session_state.customers = generate_customer_data()

# Sidebar Filters
st.sidebar.header("Lead Filtering")
min_util = st.sidebar.slider("Min Utilization (%)", 0, 100, 60)
df = st.session_state.customers
leads = df[df["utilization"] >= min_util].copy()

# Main Dashboard
col1, col2 = st.columns([1, 2])

with col1:
    st.metric("Total Leads Identified", len(leads))
    st.write("### High-Potential Customers")
    selected_customer_id = st.selectbox("Select Customer to Target", leads["customer_id"].tolist())

# Campaign Generation
if selected_customer_id:
    customer = leads[leads["customer_id"] == selected_customer_id].iloc[0]
    savings = calculate_savings(customer["current_balance"], customer["apr"])
    
    st.divider()
    st.subheader(f"Campaign for {customer['name']}")
    
    tab1, tab2 = st.tabs(["Email Template", "SMS Template"])
    
    with tab1:
        email_body = f"""
        Subject: Save ${savings} on your credit card debt!
        
        Hi {customer['name']},
        
        We noticed you're carrying a balance of ${customer['current_balance']}. 
        Switch to our Balance Transfer card and save an estimated ${savings} in interest over the next year.
        
        [Apply Now: https://bank.com/transfer/{customer['customer_id']}]
        """
        st.text_area("Email Draft", email_body, height=200)
        
    with tab2:
        sms_body = f"Hi {customer['name']}, save ${savings} on interest! Transfer your balance to our low-APR card today: https://bank.com/t/{customer['customer_id']}"
        st.text_area("SMS Draft", sms_body, height=100)

    st.write("### Customer Details")
    st.table(customer)

# Data Table
st.divider()
st.write("### Full Lead Database")
st.dataframe(leads.style.format({"current_balance": "${:.2f}", "utilization": "{:.1f}%"}))