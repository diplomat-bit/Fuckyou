import streamlit as st
import pandas as pd
import numpy as np
import json
import os
import plotly.express as px

# Set page configuration
st.set_page_config(
    page_title="Card Access Control & Policy Engine",
    layout="wide",
    page_icon="🔒",
    initial_sidebar_state="expanded"
)

# File path configuration
CSV_FILE_PATH = "api/card-listing.csv"

# -----------------------------------------------------------------------------
# DATA INITIALIZATION & SESSION STATE MANAGEMENT
# -----------------------------------------------------------------------------
def get_default_mock_data():
    """Generates a robust default dataset if the CSV file is missing."""
    return pd.DataFrame([
        {
            "card_number": "4111-XXXX-XXXX-1111",
            "cardholder_name": "Alice Smith",
            "card_type": "PRIMARY",
            "card_status": "ACTIVE",
            "credit_limit": 10000.0,
            "current_balance": 2500.0,
            "allowed_functions": "VIEW_BALANCE,DOMESTIC_TX,INTERNATIONAL_TX,RESET_ATM_PIN,CREDIT_LIMIT_INCREASE"
        },
        {
            "card_number": "4111-XXXX-XXXX-2222",
            "cardholder_name": "Bob Smith",
            "card_type": "SUPPLEMENTARY",
            "card_status": "ACTIVE",
            "credit_limit": 2000.0,
            "current_balance": 450.0,
            "allowed_functions": "VIEW_BALANCE,DOMESTIC_TX,RESET_ATM_PIN"
        },
        {
            "card_number": "5222-XXXX-XXXX-3333",
            "cardholder_name": "Charlie Brown",
            "card_type": "PRIMARY",
            "card_status": "BLOCKED",
            "credit_limit": 5000.0,
            "current_balance": 4900.0,
            "allowed_functions": "VIEW_BALANCE"
        },
        {
            "card_number": "5222-XXXX-XXXX-4444",
            "cardholder_name": "Diana Prince",
            "card_type": "PRIMARY",
            "card_status": "ACTIVE",
            "credit_limit": 25000.0,
            "current_balance": 12000.0,
            "allowed_functions": "VIEW_BALANCE,DOMESTIC_TX,INTERNATIONAL_TX,RESET_ATM_PIN,CREDIT_LIMIT_INCREASE,ACCOUNT_CLOSURE"
        },
        {
            "card_number": "3782-XXXX-XXXX-5555",
            "cardholder_name": "Evan Wright",
            "card_type": "SUPPLEMENTARY",
            "card_status": "ACTIVE",
            "credit_limit": 5000.0,
            "current_balance": 1500.0,
            "allowed_functions": "VIEW_BALANCE,DOMESTIC_TX,CREDIT_LIMIT_INCREASE"  # Violation: Supp card has credit limit increase
        },
        {
            "card_number": "4111-XXXX-XXXX-6666",
            "cardholder_name": "Fiona Gallagher",
            "card_type": "PRIMARY",
            "card_status": "EXPIRED",
            "credit_limit": 3000.0,
            "current_balance": 0.0,
            "allowed_functions": "VIEW_BALANCE,DOMESTIC_TX,RESET_ATM_PIN"  # Violation: Expired card has active functions
        },
        {
            "card_number": "4111-XXXX-XXXX-7777",
            "cardholder_name": "George Costanza",
            "card_type": "SUPPLEMENTARY",
            "card_status": "CLOSED",
            "credit_limit": 0.0,
            "current_balance": 0.0,
            "allowed_functions": "VIEW_BALANCE,RESET_ATM_PIN"  # Violation: Closed card has active functions
        }
    ])

def load_data():
    """Loads data from CSV or falls back to mock data."""
    if os.path.exists(CSV_FILE_PATH):
        try:
            df = pd.read_csv(CSV_FILE_PATH)
            # Ensure required columns exist
            required_cols = ["card_number", "cardholder_name", "card_type", "card_status", "credit_limit", "current_balance", "allowed_functions"]
            for col in required_cols:
                if col not in df.columns:
                    raise ValueError(f"Missing column: {col}")
            df["credit_limit"] = df["credit_limit"].astype(float)
            df["current_balance"] = df["current_balance"].astype(float)
            return df, "Loaded from api/card-listing.csv"
        except Exception as e:
            st.sidebar.warning(f"Error reading CSV: {e}. Using mock data instead.")
            return get_default_mock_data(), "Using Mock Data (CSV Read Error)"
    else:
        # Create directory and save mock data if possible
        df = get_default_mock_data()
        try:
            os.makedirs(os.path.dirname(CSV_FILE_PATH), exist_ok=True)
            df.to_csv(CSV_FILE_PATH, index=False)
            return df, "Created and loaded api/card-listing.csv"
        except Exception:
            return df, "Using Mock Data (Read-Only Mode)"

# Initialize Session State
if "cards_df" not in st.session_state:
    df, source_msg = load_data()
    st.session_state.cards_df = df
    st.session_state.data_source_msg = source_msg

if "custom_rules" not in st.session_state:
    st.session_state.custom_rules = [
        {
            "id": 1,
            "attribute": "card_type",
            "operator": "==",
            "value": "SUPPLEMENTARY",
            "effect": "DENY",
            "action": "CREDIT_LIMIT_INCREASE",
            "description": "Prevent supplementary cards from requesting credit limit increases."
        },
        {
            "id": 2,
            "attribute": "card_status",
            "operator": "!=",
            "value": "ACTIVE",
            "effect": "DENY",
            "action": "ALL",
            "description": "Deny all actions for non-active cards."
        }
    ]

# Helper to save state back to CSV if possible
def save_state_to_csv():
    try:
        os.makedirs(os.path.dirname(CSV_FILE_PATH), exist_ok=True)
        st.session_state.cards_df.to_csv(CSV_FILE_PATH, index=False)
        st.session_state.data_source_msg = "Saved and loaded from api/card-listing.csv"
        return True
    except Exception as e:
        st.error(f"Could not save to CSV: {e}")
        return False

# -----------------------------------------------------------------------------
# POLICY EVALUATION ENGINE LOGIC
# -----------------------------------------------------------------------------
def evaluate_policy(card, action, role, channel, amount=0.0, custom_rules=None):
    trace = []
    trace.append(f"ℹ️ **Initiating evaluation** for Action: `{action}` | Role: `{role}` | Channel: `{channel}`")
    
    # 1. Card Status Check
    status = card['card_status']
    trace.append(f"🔍 Card Status is **{status}**.")
    if status in ['BLOCKED', 'EXPIRED', 'CLOSED']:
        if action != 'VIEW_BALANCE':
            trace.append(f"❌ **DENIED**: Card is {status}. Only `VIEW_BALANCE` is permitted on inactive cards.")
            return False, trace
        else:
            trace.append(f"⚠️ **WARNING**: Card is {status}, but allowing `VIEW_BALANCE` check.")

    # 2. Allowed Functions Check (from CSV/Database)
    allowed_funcs = [f.strip() for f in str(card['allowed_functions']).split(',') if f.strip()]
    trace.append(f"🔍 Card's allowed functions: `{allowed_funcs}`")
    if action not in allowed_funcs:
        trace.append(f"❌ **DENIED**: Action `{action}` is not explicitly allowed in the card's profile.")
        return False, trace
    else:
        trace.append(f"✔️ Action `{action}` is present in the card's allowed functions.")

    # 3. Role-based Access Control (RBAC)
    card_type = card['card_type']
    trace.append(f"🔍 Card Type is **{card_type}**.")
    
    if role == 'SUPPLEMENTARY_CARDHOLDER':
        if card_type == 'PRIMARY':
            trace.append("❌ **DENIED**: Supplementary cardholder cannot perform actions on a Primary card.")
            return False, trace
        if action in ['CREDIT_LIMIT_INCREASE', 'ACCOUNT_CLOSURE']:
            trace.append(f"❌ **DENIED**: Supplementary cardholders are not authorized for high-privilege action `{action}`.")
            return False, trace
            
    if role == 'PRIMARY_CARDHOLDER':
        if card_type == 'SUPPLEMENTARY':
            trace.append("✔️ **INFO**: Primary cardholder authorized to manage Supplementary card.")
            
    # 4. Channel & Action constraints
    if action == 'ACCOUNT_CLOSURE':
        if channel != 'BRANCH':
            trace.append("❌ **DENIED**: Account closure can only be executed in-person at a physical `BRANCH`.")
            return False, trace
        if role not in ['PRIMARY_CARDHOLDER', 'SYSTEM_ADMIN']:
            trace.append("❌ **DENIED**: Only the Primary Cardholder or System Admin can close an account.")
            return False, trace
            
    if action == 'CREDIT_LIMIT_INCREASE':
        if amount <= 0:
            trace.append("❌ **DENIED**: Credit limit increase amount must be greater than zero.")
            return False, trace
        max_allowed_increase = float(card['credit_limit']) * 0.5
        if amount > max_allowed_increase:
            trace.append(f"❌ **DENIED**: Requested increase (${amount:,.2f}) exceeds maximum single-request threshold of 50% of current limit (${max_allowed_increase:,.2f}).")
            return False, trace
        trace.append(f"✔️ Requested increase (${amount:,.2f}) is within the 50% limit threshold (${max_allowed_increase:,.2f}).")

    # 5. Custom Rules Evaluation
    if custom_rules:
        trace.append("⚙️ **Evaluating Custom Policy Rules...**")
        for rule in custom_rules:
            attr = rule.get("attribute")
            op = rule.get("operator")
            val = rule.get("value")
            effect = rule.get("effect")
            rule_action = rule.get("action")
            
            if rule_action == "ALL" or rule_action == action:
                card_val = str(card.get(attr, ""))
                match = False
                if op == "==" and card_val.upper() == str(val).upper():
                    match = True
                elif op == "!=" and card_val.upper() != str(val).upper():
                    match = True
                
                if match:
                    trace.append(f"⚠️ **Custom Rule Triggered**: If `{attr}` `{op}` `{val}` then `{effect}` `{rule_action}`")
                    if effect == "DENY":
                        trace.append(f"❌ **DENIED** by Custom Policy Rule: *{rule.get('description')}*")
                        return False, trace
                    elif effect == "ALLOW":
                        trace.append(f"✔️ **ALLOWED** by Custom Policy Rule: *{rule.get('description')}*")
                        return True, trace

    trace.append("🎉 **SUCCESS**: All policy checks passed successfully.")
    return True, trace

# -----------------------------------------------------------------------------
# SIDEBAR NAVIGATION
# -----------------------------------------------------------------------------
st.sidebar.title("🔒 Card Policy Engine")
st.sidebar.markdown("---")

app_mode = st.sidebar.radio(
    "Select Application Module:",
    [
        "🔍 Policy Simulator & Evaluator",
        "📊 Bulk Policy Auditor & Dashboard",
        "🎨 Access Control Policy Designer",
        "⚙️ Card Permissions Manager"
    ]
)

st.sidebar.markdown("---")
st.sidebar.subheader("Data Source Status")
st.sidebar.info(st.session_state.data_source_msg)

if st.sidebar.button("🔄 Reload Original Data"):
    if os.path.exists(CSV_FILE_PATH):
        os.remove(CSV_FILE_PATH)
    df = get_default_mock_data()
    st.session_state.cards_df = df
    st.session_state.data_source_msg = "Reset to default mock data"
    st.sidebar.success("Data reset successfully!")
    st.rerun()

# -----------------------------------------------------------------------------
# APP 1: POLICY SIMULATOR & EVALUATION ENGINE
# -----------------------------------------------------------------------------
if app_mode == "🔍 Policy Simulator & Evaluator":
    st.title("🔍 Policy Simulator & Evaluation Engine")
    st.markdown("""
    Simulate and test access control policies in real-time. Select a card, define the context of the request, 
    and evaluate whether the action is permitted under current policy rules.
    """)
    
    df = st.session_state.cards_df
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Simulation Context")
        
        # Card Selection
        card_options = [f"{row['cardholder_name']} ({row['card_number']}) - {row['card_type']}" for _, row in df.iterrows()]
        selected_card_idx = st.selectbox("Select Card to Test:", range(len(card_options)), format_func=lambda x: card_options[x])
        selected_card = df.iloc[selected_card_idx]
        
        # Action Selection
        action = st.selectbox(
            "Action to Perform:",
            ["CREDIT_LIMIT_INCREASE", "RESET_ATM_PIN", "ACCOUNT_CLOSURE", "DOMESTIC_TX", "INTERNATIONAL_TX", "VIEW_BALANCE"]
        )
        
        # Requestor Role
        role = st.selectbox(
            "Requestor Role:",
            ["PRIMARY_CARDHOLDER", "SUPPLEMENTARY_CARDHOLDER", "BANK_AGENT", "SYSTEM_ADMIN"]
        )
        
        # Channel
        channel = st.selectbox(
            "Request Channel:",
            ["MOBILE_APP", "ATM", "BRANCH", "WEB_PORTAL"]
        )
        
        # Conditional inputs
        amount = 0.0
        if action == "CREDIT_LIMIT_INCREASE":
            amount = st.number_input("Requested Credit Limit Increase ($):", min_value=0.0, value=1000.0, step=100.0)
            
        st.markdown("---")
        st.markdown("### Selected Card Details")
        st.json({
            "Cardholder": selected_card["cardholder_name"],
            "Type": selected_card["card_type"],
            "Status": selected_card["card_status"],
            "Limit": f"${selected_card['credit_limit']:,.2f}",
            "Balance": f"${selected_card['current_balance']:,.2f}",
            "Allowed Functions": selected_card["allowed_functions"].split(",")
        })

    with col2:
        st.subheader("Evaluation Result")
        
        # Run evaluation
        allowed, trace = evaluate_policy(
            selected_card, 
            action, 
            role, 
            channel, 
            amount, 
            st.session_state.custom_rules
        )
        
        # Display Result Banner
        if allowed:
            st.success("### ✅ ACCESS GRANTED")
            st.balloons()
        else:
            st.error("### ❌ ACCESS DENIED")
            
        st.markdown("### Policy Evaluation Trace Log")
        for log in trace:
            if "❌" in log:
                st.error(log)
            elif "✔️" in log:
                st.success(log)
            elif "⚠️" in log:
                st.warning(log)
            else:
                st.info(log)
                
        # Quick Scenario Tests
        st.markdown("---")
        st.subheader("Quick Scenario Presets")
        scenarios = [
            {"name": "Supplementary Cardholder trying to increase limit", "action": "CREDIT_LIMIT_INCREASE", "role": "SUPPLEMENTARY_CARDHOLDER", "channel": "MOBILE_APP", "amount": 1000.0},
            {"name": "Primary Cardholder closing account via Mobile App", "action": "ACCOUNT_CLOSURE", "role": "PRIMARY_CARDHOLDER", "channel": "MOBILE_APP", "amount": 0.0},
            {"name": "Primary Cardholder closing account at Branch", "action": "ACCOUNT_CLOSURE", "role": "PRIMARY_CARDHOLDER", "channel": "BRANCH", "amount": 0.0},
            {"name": "Resetting PIN on a Blocked Card", "action": "RESET_ATM_PIN", "role": "PRIMARY_CARDHOLDER", "channel": "ATM", "amount": 0.0}
        ]
        
        cols = st.columns(2)
        for i, sc in enumerate(scenarios):
            with cols[i % 2]:
                if st.button(sc["name"], key=f"sc_{i}"):
                    # Find a card that matches the scenario context if possible
                    test_card = selected_card
                    allowed_sc, trace_sc = evaluate_policy(test_card, sc["action"], sc["role"], sc["channel"], sc["amount"], st.session_state.custom_rules)
                    st.markdown(f"**Result:** {'✅ Allowed' if allowed_sc else '❌ Denied'}")
                    with st.expander("View Scenario Trace"):
                        for log in trace_sc:
                            st.write(log)

# -----------------------------------------------------------------------------
# APP 2: BULK POLICY AUDITOR & COMPLIANCE DASHBOARD
# -----------------------------------------------------------------------------
elif app_mode == "📊 Bulk Policy Auditor & Dashboard":
    st.title("📊 Bulk Policy Auditor & Compliance Dashboard")
    st.markdown("""
    Audit all cards in the system against standard compliance rules and custom policies. 
    Identify policy violations, view compliance metrics, and perform bulk remediation.
    """)
    
    df = st.session_state.cards_df
    
    # Define Compliance Rules
    # Rule 1: Supplementary cards must not have CREDIT_LIMIT_INCREASE or ACCOUNT_CLOSURE
    # Rule 2: Inactive cards (BLOCKED, EXPIRED, CLOSED) must not have active transaction functions
    # Rule 3: Credit limit must not be exceeded by current balance
    
    violations = []
    
    for idx, row in df.iterrows():
        funcs = [f.strip() for f in str(row['allowed_functions']).split(',') if f.strip()]
        
        # Check Rule 1
        if row['card_type'] == 'SUPPLEMENTARY':
            if 'CREDIT_LIMIT_INCREASE' in funcs:
                violations.append({
                    "card_number": row['card_number'],
                    "cardholder_name": row['cardholder_name'],
                    "rule_violated": "Supplementary Card with Limit Increase Privilege",
                    "severity": "HIGH",
                    "remediation": "Remove CREDIT_LIMIT_INCREASE from allowed functions"
                })
            if 'ACCOUNT_CLOSURE' in funcs:
                violations.append({
                    "card_number": row['card_number'],
                    "cardholder_name": row['cardholder_name'],
                    "rule_violated": "Supplementary Card with Account Closure Privilege",
                    "severity": "CRITICAL",
                    "remediation": "Remove ACCOUNT_CLOSURE from allowed functions"
                })
                
        # Check Rule 2
        if row['card_status'] in ['BLOCKED', 'EXPIRED', 'CLOSED']:
            active_funcs = [f for f in funcs if f != 'VIEW_BALANCE']
            if len(active_funcs) > 0:
                violations.append({
                    "card_number": row['card_number'],
                    "cardholder_name": row['cardholder_name'],
                    "rule_violated": f"Inactive Card ({row['card_status']}) with Active Privileges",
                    "severity": "HIGH",
                    "remediation": "Restrict allowed functions to VIEW_BALANCE or empty"
                })
                
        # Check Rule 3
        if row['current_balance'] > row['credit_limit']:
            violations.append({
                "card_number": row['card_number'],
                "cardholder_name": row['cardholder_name'],
                "rule_violated": "Balance Exceeds Credit Limit",
                "severity": "MEDIUM",
                "remediation": "Adjust credit limit or request payment"
            })

    # Metrics
    total_cards = len(df)
    cards_with_violations = len(set([v['card_number'] for v in violations]))
    compliant_cards = total_cards - cards_with_violations
    compliance_score = (compliant_cards / total_cards) * 100 if total_cards > 0 else 100
    
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total Cards Audited", total_cards)
    m2.metric("Compliant Cards", compliant_cards)
    m3.metric("Non-Compliant Cards", cards_with_violations, delta=f"{cards_with_violations} issues", delta_color="inverse")
    m4.metric("Compliance Score", f"{compliance_score:.1f}%")
    
    # Visualizations
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Card Status Distribution")
        status_counts = df['card_status'].value_counts().reset_index()
        status_counts.columns = ['Status', 'Count']
        fig = px.pie(status_counts, values='Count', names='Status', color='Status',
                     color_discrete_map={'ACTIVE': '#2ecc71', 'BLOCKED': '#e74c3c', 'EXPIRED': '#f1c40f', 'CLOSED': '#95a5a6'})
        st.plotly_chart(fig, use_container_width=True)
        
    with col2:
        st.subheader("Violations by Severity")
        if violations:
            v_df = pd.DataFrame(violations)
            sev_counts = v_df['severity'].value_counts().reset_index()
            sev_counts.columns = ['Severity', 'Count']
            fig2 = px.bar(sev_counts, x='Severity', y='Count', color='Severity',
                          color_discrete_map={'CRITICAL': '#c0392b', 'HIGH': '#e67e22', 'MEDIUM': '#f1c40f'})
            st.plotly_chart(fig2, use_container_width=True)
        else:
            st.info("No violations detected! System is 100% compliant.")

    # Violations Table & Remediation
    st.subheader("Detected Policy Violations")
    if violations:
        violations_df = pd.DataFrame(violations)
        st.dataframe(violations_df, use_container_width=True)
        
        # Bulk Remediation Button
        if st.button("⚡ Auto-Remediate All Violations"):
            for v in violations:
                card_num = v['card_number']
                rule = v['rule_violated']
                
                # Apply remediation logic
                idx = df[df['card_number'] == card_num].index[0]
                current_funcs = [f.strip() for f in df.at[idx, 'allowed_functions'].split(',')]
                
                if "Supplementary Card" in rule:
                    # Remove high-privilege functions
                    current_funcs = [f for f in current_funcs if f not in ['CREDIT_LIMIT_INCREASE', 'ACCOUNT_CLOSURE']]
                elif "Inactive Card" in rule:
                    # Restrict to VIEW_BALANCE
                    current_funcs = ['VIEW_BALANCE']
                elif "Balance Exceeds" in rule:
                    # Increase limit to match balance + 10% buffer
                    df.at[idx, 'credit_limit'] = float(df.at[idx, 'current_balance']) * 1.1
                    
                df.at[idx, 'allowed_functions'] = ",".join(current_funcs)
                
            st.session_state.cards_df = df
            save_state_to_csv()
            st.success("All violations auto-remediated successfully!")
            st.rerun()
    else:
        st.success("🎉 Excellent! No policy violations found in the current card database.")

# -----------------------------------------------------------------------------
# APP 3: ACCESS CONTROL POLICY DESIGNER
# -----------------------------------------------------------------------------
elif app_mode == "🎨 Access Control Policy Designer":
    st.title("🎨 Access Control Policy Designer")
    st.markdown("""
    Design, customize, and test Attribute-Based Access Control (ABAC) and Role-Based Access Control (RBAC) policies.
    These rules are evaluated dynamically by the policy engine.
    """)
    
    # Display Current Rules
    st.subheader("Active Policy Rules")
    
    rules_df = pd.DataFrame(st.session_state.custom_rules)
    if not rules_df.empty:
        st.dataframe(rules_df[["id", "attribute", "operator", "value", "effect", "action", "description"]], use_container_width=True)
    else:
        st.info("No custom rules defined yet.")
        
    # Rule Creator Form
    st.markdown("---")
    st.subheader("Create New Policy Rule")
    
    with st.form("new_rule_form"):
        col1, col2, col3 = st.columns(3)
        with col1:
            attribute = st.selectbox("Card Attribute:", ["card_type", "card_status", "credit_limit", "current_balance"])
            operator = st.selectbox("Operator:", ["==", "!="])
        with col2:
            value = st.text_input("Value to Compare (e.g., SUPPLEMENTARY, ACTIVE, BLOCKED):")
            action_scope = st.selectbox("Action Scope:", ["ALL", "CREDIT_LIMIT_INCREASE", "RESET_ATM_PIN", "ACCOUNT_CLOSURE", "DOMESTIC_TX", "INTERNATIONAL_TX"])
        with col3:
            effect = st.selectbox("Effect:", ["DENY", "ALLOW"])
            description = st.text_input("Rule Description / Reason:")
            
        submitted = st.form_submit_button("➕ Add Rule to Policy")
        if submitted:
            if not value or not description:
                st.error("Please fill in all fields.")
            else:
                new_id = max([r["id"] for r in st.session_state.custom_rules]) + 1 if st.session_state.custom_rules else 1
                new_rule = {
                    "id": new_id,
                    "attribute": attribute,
                    "operator": operator,
                    "value": value,
                    "effect": effect,
                    "action": action_scope,
                    "description": description
                }
                st.session_state.custom_rules.append(new_rule)
                st.success(f"Rule #{new_id} added successfully!")
                st.rerun()

    # Delete Rule Section
    if st.session_state.custom_rules:
        st.markdown("---")
        st.subheader("Manage Rules")
        rule_to_delete = st.selectbox("Select Rule to Delete:", [f"#{r['id']} - {r['description']}" for r in st.session_state.custom_rules])
        if st.button("🗑️ Delete Selected Rule"):
            rule_id = int(rule_to_delete.split(" ")[0].replace("#", ""))
            st.session_state.custom_rules = [r for r in st.session_state.custom_rules if r["id"] != rule_id]
            st.success("Rule deleted!")
            st.rerun()

    # Export / Import Policy
    st.markdown("---")
    st.subheader("Export / Import Policy Configuration")
    col_exp, col_imp = st.columns(2)
    
    with col_exp:
        st.markdown("### Export Policy")
        policy_json = json.dumps(st.session_state.custom_rules, indent=4)
        st.download_button(
            label="📥 Download Policy JSON",
            data=policy_json,
            file_name="card_access_policy.json",
            mime="application/json"
        )
        st.code(policy_json, language="json")
        
    with col_imp:
        st.markdown("### Import Policy")
        uploaded_file = st.file_uploader("Upload Policy JSON File", type=["json"])
        if uploaded_file is not None:
            try:
                imported_rules = json.load(uploaded_file)
                st.session_state.custom_rules = imported_rules
                st.success("Policy imported successfully!")
                st.rerun()
            except Exception as e:
                st.error(f"Failed to parse JSON: {e}")

# -----------------------------------------------------------------------------
# APP 4: CARD PERMISSIONS & FUNCTION MANAGER
# -----------------------------------------------------------------------------
elif app_mode == "⚙️ Card Permissions Manager":
    st.title("⚙️ Card Permissions & Function Manager")
    st.markdown("""
    Directly manage card profiles, toggle allowed functions, adjust credit limits, 
    and update card statuses. Changes are saved directly to the card database.
    """)
    
    df = st.session_state.cards_df
    
    # Search and Filter
    st.subheader("Search & Filter Cards")
    col1, col2, col3 = st.columns(3)
    with col1:
        search_query = st.text_input("Search by Cardholder Name or Card Number:")
    with col2:
        filter_type = st.multiselect("Filter by Card Type:", ["PRIMARY", "SUPPLEMENTARY"], default=["PRIMARY", "SUPPLEMENTARY"])
    with col3:
        filter_status = st.multiselect("Filter by Status:", ["ACTIVE", "BLOCKED", "EXPIRED", "CLOSED"], default=["ACTIVE", "BLOCKED", "EXPIRED", "CLOSED"])
        
    # Apply filters
    filtered_df = df.copy()
    if search_query:
        filtered_df = filtered_df[
            filtered_df['cardholder_name'].str.contains(search_query, case=False) |
            filtered_df['card_number'].str.contains(search_query, case=False)
        ]
    filtered_df = filtered_df[filtered_df['card_type'].isin(filter_type)]
    filtered_df = filtered_df[filtered_df['card_status'].isin(filter_status)]
    
    st.dataframe(filtered_df, use_container_width=True)
    
    # Edit Card Details
    st.markdown("---")
    st.subheader("Edit Card Profile & Allowed Functions")
    
    if not filtered_df.empty:
        card_to_edit_num = st.selectbox(
            "Select Card to Edit:",
            filtered_df['card_number'].tolist(),
            format_func=lambda x: f"{filtered_df[filtered_df['card_number'] == x]['cardholder_name'].values[0]} ({x})"
        )
        
        card_idx = df[df['card_number'] == card_to_edit_num].index[0]
        card_data = df.loc[card_idx]
        
        with st.form("edit_card_form"):
            col_left, col_right = st.columns(2)
            
            with col_left:
                st.markdown(f"**Cardholder:** {card_data['cardholder_name']}")
                st.markdown(f"**Card Number:** {card_data['card_number']}")
                
                new_status = st.selectbox(
                    "Card Status:",
                    ["ACTIVE", "BLOCKED", "EXPIRED", "CLOSED"],
                    index=["ACTIVE", "BLOCKED", "EXPIRED", "CLOSED"].index(card_data['card_status'])
                )
                
                new_limit = st.number_input(
                    "Credit Limit ($):",
                    min_value=0.0,
                    value=float(card_data['credit_limit']),
                    step=500.0
                )
                
                new_balance = st.number_input(
                    "Current Balance ($):",
                    min_value=0.0,
                    value=float(card_data['current_balance']),
                    step=100.0
                )
                
            with col_right:
                st.markdown("**Allowed Functions / Privileges:**")
                all_possible_functions = [
                    "VIEW_BALANCE",
                    "DOMESTIC_TX",
                    "INTERNATIONAL_TX",
                    "RESET_ATM_PIN",
                    "CREDIT_LIMIT_INCREASE",
                    "ACCOUNT_CLOSURE"
                ]
                
                current_allowed = [f.strip() for f in str(card_data['allowed_functions']).split(',') if f.strip()]
                
                selected_functions = []
                for func in all_possible_functions:
                    if st.checkbox(func, value=(func in current_allowed)):
                        selected_functions.append(func)
                        
            submitted_edit = st.form_submit_button("💾 Save Changes to Card Profile")
            if submitted_edit:
                df.at[card_idx, 'card_status'] = new_status
                df.at[card_idx, 'credit_limit'] = new_limit
                df.at[card_idx, 'current_balance'] = new_balance
                df.at[card_idx, 'allowed_functions'] = ",".join(selected_functions)
                
                st.session_state.cards_df = df
                if save_state_to_csv():
                    st.success("Card profile updated and saved to CSV successfully!")
                    st.rerun()
    else:
        st.warning("No cards match the current filter criteria.")

    # Add New Card Profile
    st.markdown("---")
    st.subheader("➕ Register New Card Profile")
    with st.form("add_card_form"):
        col_a, col_b = st.columns(2)
        with col_a:
            new_holder = st.text_input("Cardholder Name:")
            new_num = st.text_input("Card Number (Format: XXXX-XXXX-XXXX-XXXX):", value="4111-XXXX-XXXX-")
            new_type = st.selectbox("Card Type:", ["PRIMARY", "SUPPLEMENTARY"])
            new_status_add = st.selectbox("Initial Status:", ["ACTIVE", "BLOCKED"])
        with col_b:
            new_limit_add = st.number_input("Credit Limit ($):", min_value=0.0, value=5000.0)
            new_balance_add = st.number_input("Current Balance ($):", min_value=0.0, value=0.0)
            st.markdown("**Initial Allowed Functions:**")
            add_funcs = []
            for func in ["VIEW_BALANCE", "DOMESTIC_TX", "INTERNATIONAL_TX", "RESET_ATM_PIN", "CREDIT_LIMIT_INCREASE"]:
                if st.checkbox(func, value=True, key=f"add_{func}"):
                    add_funcs.append(func)
                    
        submitted_add = st.form_submit_button("Register Card")
        if submitted_add:
            if not new_holder or not new_num:
                st.error("Please fill in all required fields.")
            else:
                new_row = {
                    "card_number": new_num,
                    "cardholder_name": new_holder,
                    "card_type": new_type,
                    "card_status": new_status_add,
                    "credit_limit": float(new_limit_add),
                    "current_balance": float(new_balance_add),
                    "allowed_functions": ",".join(add_funcs)
                }
                df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
                st.session_state.cards_df = df
                if save_state_to_csv():
                    st.success("New card registered and saved successfully!")
                    st.rerun()