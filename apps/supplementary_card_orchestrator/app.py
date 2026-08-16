import streamlit as st
import pandas as pd
import graphviz
from datetime import datetime

# Set page configuration
st.set_page_config(
    page_title="Supplementary Card Orchestrator",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
    <style>
    .main-header {
        font-size: 2.2rem;
        color: #1E3A8A;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #4B5563;
        margin-bottom: 2rem;
    }
    .card-active {
        border-left: 5px solid #10B981;
        background-color: #ECFDF5;
        padding: 10px;
        border-radius: 4px;
    }
    .card-inactive {
        border-left: 5px solid #EF4444;
        background-color: #FEF2F2;
        padding: 10px;
        border-radius: 4px;
    }
    .card-suspended {
        border-left: 5px solid #F59E0B;
        background-color: #FEF3C7;
        padding: 10px;
        border-radius: 4px;
    }
    .rule-badge {
        background-color: #E0E7FF;
        color: #3730A3;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    </style>
""", unsafe_style_html=True)

# Initialize Session State with Mock Data if not present
if 'accounts' not in st.session_state:
    st.session_state.accounts = {
        "ACC-1001": {
            "account_name": "The Sterling Family",
            "primary": {
                "card_no": "4111-2222-3333-1111",
                "holder": "Eleanor Sterling",
                "status": "Active",
                "limit": 15000,
                "spent": 4200
            },
            "supplementary": [
                {
                    "card_no": "4111-2222-3333-2222",
                    "holder": "Arthur Sterling",
                    "relationship": "Spouse",
                    "status": "Active",
                    "limit": 5000,
                    "spent": 1200
                },
                {
                    "card_no": "4111-2222-3333-3333",
                    "holder": "Beatrice Sterling",
                    "relationship": "Child",
                    "status": "Inactive",
                    "limit": 2000,
                    "spent": 0
                }
            ]
        },
        "ACC-2002": {
            "account_name": "Vanderbilt Estate",
            "primary": {
                "card_no": "4222-5555-6666-1111",
                "holder": "Reginald Vanderbilt",
                "status": "Inactive",
                "limit": 25000,
                "spent": 0
            },
            "supplementary": [
                {
                    "card_no": "4222-5555-6666-2222",
                    "holder": "Gloria Vanderbilt",
                    "relationship": "Spouse",
                    "status": "Active",  # INTENTIONAL VIOLATION FOR AUDIT DEMO (CA_007)
                    "limit": 10000,
                    "spent": 3500
                }
            ]
        },
        "ACC-3003": {
            "account_name": "The Croft Portfolio",
            "primary": {
                "card_no": "4333-7777-8888-1111",
                "holder": "Lara Croft",
                "status": "Active",
                "limit": 8000,
                "spent": 1500
            },
            "supplementary": [
                {
                    "card_no": "4333-7777-8888-2222",
                    "holder": "Richard Croft",
                    "relationship": "Parent",
                    "status": "Active",  # INTENTIONAL VIOLATION FOR AUDIT DEMO (CA_008 - Limit Exceeded)
                    "limit": 12000,
                    "spent": 4000
                }
            ]
        },
        "ACC-4004": {
            "account_name": "Dupont Corporate Executive",
            "primary": {
                "card_no": "4444-9999-0000-1111",
                "holder": "Charles Dupont",
                "status": "Suspended",
                "limit": 50000,
                "spent": 12000
            },
            "supplementary": [
                {
                    "card_no": "4444-9999-0000-2222",
                    "holder": "Denise Dupont",
                    "relationship": "Sibling",
                    "status": "Suspended",
                    "limit": 15000,
                    "spent": 5000
                }
            ]
        }
    }

if 'audit_logs' not in st.session_state:
    st.session_state.audit_logs = [
        {"timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "account_id": "ACC-1001", "action": "System Initialization", "status": "Success", "details": "Orchestrator database loaded."}
    ]

# Helper Functions
def log_action(account_id, action, status, details):
    st.session_state.audit_logs.insert(0, {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "account_id": account_id,
        "action": action,
        "status": status,
        "details": details
    })

def validate_transition(account_id, target_card_type, supp_index, target_status):
    """
    Validates state transitions based on strict business rules:
    - CA_007: Supplementary card cannot be activated if Primary is inactive/suspended.
    - CA_006: Primary card can be activated while Supplementary is deactivated.
    """
    account = st.session_state.accounts[account_id]
    primary_status = account["primary"]["status"]
    
    if target_card_type == "Supplementary":
        supp_card = account["supplementary"][supp_index]
        if target_status == "Active" and primary_status != "Active":
            return False, f"Rule Violation [CA_007]: Cannot activate Supplementary card ({supp_card['holder']}) because the Primary card ({account['primary']['holder']}) is currently {primary_status}."
    
    elif target_card_type == "Primary":
        if target_status in ["Inactive", "Suspended"]:
            # Check if there are active supplementary cards that would be orphaned
            active_supps = [s["holder"] for s in account["supplementary"] if s["status"] == "Active"]
            if active_supps:
                return True, f"Warning: Transitioning Primary to {target_status} will automatically suspend/deactivate active Supplementary cards: {', '.join(active_supps)} to maintain compliance with [CA_007]."
                
    return True, "Validation Passed: Transition complies with all orchestration rules."

def execute_transition(account_id, target_card_type, supp_index, target_status):
    account = st.session_state.accounts[account_id]
    
    if target_card_type == "Primary":
        old_status = account["primary"]["status"]
        account["primary"]["status"] = target_status
        log_action(account_id, "Primary Status Change", "Success", f"Changed status from {old_status} to {target_status}")
        
        # Cascade deactivation to supplementary cards if primary is no longer active (CA_007 enforcement)
        if target_status in ["Inactive", "Suspended"]:
            for idx, supp in enumerate(account["supplementary"]):
                if supp["status"] == "Active":
                    supp["status"] = target_status
                    log_action(account_id, "Cascade Status Change", "Success", f"Automatically set Supplementary card ({supp['holder']}) to {target_status} due to Primary deactivation.")
                    
    elif target_card_type == "Supplementary":
        supp_card = account["supplementary"][supp_index]
        old_status = supp_card["status"]
        supp_card["status"] = target_status
        log_action(account_id, f"Supplementary Status Change ({supp_card['holder']})", "Success", f"Changed status from {old_status} to {target_status}")

# Sidebar Navigation
st.sidebar.image("https://img.icons8.com/fluency/96/000000/card-security.png", width=80)
st.sidebar.title("Card Orchestrator")
st.sidebar.markdown("---")
app_mode = st.sidebar.radio(
    "Select Orchestrator Module",
    [
        "1. Account Hierarchy Explorer",
        "2. State Transition Engine",
        "3. Limit Allocator & Guard",
        "4. Compliance Auditor"
    ]
)

st.sidebar.markdown("---")
st.sidebar.markdown("### 📋 Rule Reference")
st.sidebar.markdown("""
- <span class="rule-badge">CA_006</span> Primary card can be activated while Supplementary is deactivated.
- <span class="rule-badge">CA_007</span> Supplementary card **cannot** be activated if Primary is inactive/suspended.
- <span class="rule-badge">CA_008</span> Supplementary limit **cannot** exceed Primary limit.
""", unsafe_style_html=True)

# ---------------------------------------------------------
# APP 1: ACCOUNT HIERARCHY EXPLORER
# ---------------------------------------------------------
if app_mode == "1. Account Hierarchy Explorer":
    st.markdown('<div class="main-header">Account Hierarchy Explorer</div>', unsafe_style_html=True)
    st.markdown('<div class="sub-header">Visual representation of Primary and Supplementary card relationships, limits, and real-time statuses.</div>', unsafe_style_html=True)
    
    # Search and Filter
    col1, col2 = st.columns([2, 1])
    with col1:
        search_query = st.text_input("🔍 Search by Account ID, Holder Name, or Card Number", "")
    with col2:
        status_filter = st.selectbox("Filter by Primary Card Status", ["All", "Active", "Inactive", "Suspended"])
        
    # Filter accounts
    filtered_accounts = {}
    for acc_id, acc_data in st.session_state.accounts.items():
        # Apply status filter
        if status_filter != "All" and acc_data["primary"]["status"] != status_filter:
            continue
        # Apply search query
        if search_query:
            q = search_query.lower()
            match = (
                q in acc_id.lower() or
                q in acc_data["account_name"].lower() or
                q in acc_data["primary"]["holder"].lower() or
                q in acc_data["primary"]["card_no"] or
                any(q in s["holder"].lower() or q in s["card_no"] for s in acc_data["supplementary"])
            )
            if not match:
                continue
        filtered_accounts[acc_id] = acc_data

    # Display Accounts
    if not filtered_accounts:
        st.warning("No accounts found matching the criteria.")
    else:
        for acc_id, acc_data in filtered_accounts.items():
            with st.expander(f"📂 {acc_id} - {acc_data['account_name']}", expanded=True):
                col_tree, col_details = st.columns([3, 2])
                
                with col_tree:
                    st.markdown("#### 🌳 Relationship Tree")
                    # Generate Graphviz representation
                    dot = graphviz.Digraph()
                    dot.attr(rankdir='LR', size='8,5')
                    
                    # Primary Node
                    p_status = acc_data["primary"]["status"]
                    p_color = "green" if p_status == "Active" else "red" if p_status == "Inactive" else "orange"
                    p_label = f"PRIMARY\n{acc_data['primary']['holder']}\nLimit: ${acc_data['primary']['limit']:,}\nStatus: {p_status}"
                    dot.node('P', p_label, color=p_color, style='filled', fillcolor='#F3F4F6', shape='box')
                    
                    # Supplementary Nodes
                    for idx, supp in enumerate(acc_data["supplementary"]):
                        s_status = supp["status"]
                        s_color = "green" if s_status == "Active" else "red" if s_status == "Inactive" else "orange"
                        s_label = f"SUPPLEMENTARY ({supp['relationship']})\n{supp['holder']}\nLimit: ${supp['limit']:,}\nStatus: {s_status}"
                        dot.node(f'S_{idx}', s_label, color=s_color, style='filled', fillcolor='#F9FAFB', shape='ellipse')
                        dot.edge('P', f'S_{idx}', label="Manages")
                        
                    st.graphviz_chart(dot)
                    
                with col_details:
                    st.markdown("#### 💳 Card Details & Metrics")
                    
                    # Primary Card Card
                    p_status = acc_data["primary"]["status"]
                    p_class = "card-active" if p_status == "Active" else "card-inactive" if p_status == "Inactive" else "card-suspended"
                    st.markdown(f"""
                    <div class="{p_class}">
                        <strong>Primary Cardholder:</strong> {acc_data['primary']['holder']}<br/>
                        <strong>Card Number:</strong> {acc_data['primary']['card_no']}<br/>
                        <strong>Status:</strong> {p_status} | <strong>Limit:</strong> ${acc_data['primary']['limit']:,}
                    </div>
                    """, unsafe_style_html=True)
                    
                    st.markdown("<div style='margin-top: 15px;'></div>", unsafe_style_html=True)
                    
                    # Supplementary Cards
                    for supp in acc_data["supplementary"]:
                        s_status = supp["status"]
                        s_class = "card-active" if s_status == "Active" else "card-inactive" if s_status == "Inactive" else "card-suspended"
                        st.markdown(f"""
                        <div class="{s_class}" style="margin-bottom: 8px;">
                            <strong>Supplementary ({supp['relationship']}):</strong> {supp['holder']}<br/>
                            <strong>Card Number:</strong> {supp['card_no']}<br/>
                            <strong>Status:</strong> {s_status} | <strong>Limit:</strong> ${supp['limit']:,}
                        </div>
                        """, unsafe_style_html=True)

# ---------------------------------------------------------
# APP 2: STATE TRANSITION ENGINE
# ---------------------------------------------------------
elif app_mode == "2. State Transition Engine":
    st.markdown('<div class="main-header">State Transition Engine</div>', unsafe_style_html=True)
    st.markdown('<div class="sub-header">Safely transition card states with real-time rule validation and dry-run simulations.</div>', unsafe_style_html=True)
    
    col_form, col_log = st.columns([3, 2])
    
    with col_form:
        st.markdown("### ⚙️ Transition Control Panel")
        
        # Select Account
        account_options = {acc_id: f"{acc_id} - {data['account_name']}" for acc_id, data in st.session_state.accounts.items()}
        selected_acc_id = st.selectbox("Select Account", options=list(account_options.keys()), format_func=lambda x: account_options[x])
        
        account = st.session_state.accounts[selected_acc_id]
        
        # Select Card to Transition
        card_choices = [("Primary", 0, f"Primary: {account['primary']['holder']} (Current: {account['primary']['status']})")]
        for idx, supp in enumerate(account["supplementary"]):
            card_choices.append(("Supplementary", idx, f"Supplementary: {supp['holder']} (Current: {supp['status']})"))
            
        selected_card_info = st.selectbox("Select Card to Transition", options=card_choices, format_func=lambda x: x[2])
        card_type, card_idx, _ = selected_card_info
        
        # Select Target Status
        target_status = st.selectbox("Select Target Status", ["Active", "Inactive", "Suspended"])
        
        # Dry Run Validation
        st.markdown("#### 🔍 Real-Time Rule Validation")
        valid, message = validate_transition(selected_acc_id, card_type, card_idx, target_status)
        
        if valid:
            if "Warning" in message:
                st.warning(message)
            else:
                st.success(message)
        else:
            st.error(message)
            
        # Action Buttons
        col_btn1, col_btn2 = st.columns(2)
        with col_btn1:
            if st.button("Execute Transition", disabled=not valid and "Warning" not in message, use_container_width=True):
                execute_transition(selected_acc_id, card_type, card_idx, target_status)
                st.success("Transition executed successfully!")
                st.rerun()
        with col_btn2:
            if st.button("Reset Account States", type="secondary", use_container_width=True):
                # Reset to default state
                st.session_state.clear()
                st.rerun()

    with col_log:
        st.markdown("### 📜 Orchestration Audit Trail")
        log_df = pd.DataFrame(st.session_state.audit_logs)
        if not log_df.empty:
            st.dataframe(log_df, use_container_width=True, height=400)
        else:
            st.info("No audit logs available.")

# ---------------------------------------------------------
# APP 3: LIMIT ALLOCATOR & GUARD
# ---------------------------------------------------------
elif app_mode == "3. Limit Allocator & Guard":
    st.markdown('<div class="main-header">Limit Allocator & Compliance Guard</div>', unsafe_style_html=True)
    st.markdown('<div class="sub-header">Manage and reallocate credit limits between Primary and Supplementary cards with strict validation rules.</div>', unsafe_style_html=True)
    
    # Select Account
    account_options = {acc_id: f"{acc_id} - {data['account_name']}" for acc_id, data in st.session_state.accounts.items()}
    selected_acc_id = st.selectbox("Select Account to Manage Limits", options=list(account_options.keys()), format_func=lambda x: account_options[x])
    
    account = st.session_state.accounts[selected_acc_id]
    
    st.markdown("### 📊 Limit Allocation Dashboard")
    
    col_p, col_s = st.columns([1, 1])
    
    with col_p:
        st.subheader("Primary Card Limit")
        p_limit = st.number_input(
            f"Primary Limit ({account['primary']['holder']})",
            min_value=1000,
            max_value=100000,
            value=int(account['primary']['limit']),
            step=500
        )
        
        # Progress bar for primary utilization
        util_pct = min(100, int((account['primary']['spent'] / p_limit) * 100))
        st.progress(util_pct / 100)
        st.caption(f"Primary Spent: ${account['primary']['spent']:,} / ${p_limit:,} ({util_pct}% Utilized)")

    with col_s:
        st.subheader("Supplementary Card Limits")
        new_supp_limits = []
        
        for idx, supp in enumerate(account["supplementary"]):
            s_limit = st.number_input(
                f"Supplementary Limit ({supp['holder']} - {supp['relationship']})",
                min_value=500,
                max_value=100000,
                value=int(supp['limit']),
                step=500,
                key=f"supp_limit_{idx}"
            )
            new_supp_limits.append((idx, s_limit))
            
            # Progress bar for supplementary utilization
            s_util_pct = min(100, int((supp['spent'] / s_limit) * 100))
            st.progress(s_util_pct / 100)
            st.caption(f"Spent: ${supp['spent']:,} / ${s_limit:,} ({s_util_pct}% Utilized)")
            st.markdown("---")

    # Compliance Guard Validation
    st.markdown("### 🛡️ Compliance Guard Check")
    compliance_passed = True
    violations = []
    
    # Rule CA_008: Supplementary limit cannot exceed Primary limit
    for idx, s_limit in new_supp_limits:
        supp_holder = account["supplementary"][idx]["holder"]
        if s_limit > p_limit:
            compliance_passed = False
            violations.append(f"❌ **Rule Violation [CA_008]**: Supplementary card limit for **{supp_holder}** (${s_limit:,}) cannot exceed the Primary card limit (${p_limit:,}).")
            
    if compliance_passed:
        st.success("✅ All limit allocations comply with compliance rules (CA_008).")
        if st.button("Apply and Save Limits", type="primary"):
            # Save Primary Limit
            account['primary']['limit'] = p_limit
            # Save Supplementary Limits
            for idx, s_limit in new_supp_limits:
                account['supplementary'][idx]['limit'] = s_limit
            log_action(selected_acc_id, "Limit Reallocation", "Success", f"Updated limits. Primary: ${p_limit:,}")
            st.success("Limits updated successfully!")
            st.rerun()
    else:
        for violation in violations:
            st.error(violation)
        st.button("Apply and Save Limits", disabled=True)

# ---------------------------------------------------------
# APP 4: COMPLIANCE AUDITOR
# ---------------------------------------------------------
elif app_mode == "4. Compliance Auditor":
    st.markdown('<div class="main-header">Batch Rule Compliance Auditor</div>', unsafe_style_html=True)
    st.markdown('<div class="sub-header">Scans all accounts for rule violations (CA_006, CA_007, CA_008) and provides automated bulk-fix recommendations.</div>', unsafe_style_html=True)
    
    # Audit Execution
    st.markdown("### 🔍 System-Wide Audit Scan")
    
    audit_results = []
    violations_found = 0
    
    for acc_id, acc_data in st.session_state.accounts.items():
        primary_status = acc_data["primary"]["status"]
        primary_limit = acc_data["primary"]["limit"]
        
        # Check CA_007: Supplementary active while Primary is inactive/suspended
        for idx, supp in enumerate(acc_data["supplementary"]):
            supp_status = supp["status"]
            supp_limit = supp["limit"]
            
            # CA_007 Check
            if supp_status == "Active" and primary_status != "Active":
                audit_results.append({
                    "Account ID": acc_id,
                    "Account Name": acc_data["account_name"],
                    "Cardholder": supp["holder"],
                    "Type": "Supplementary",
                    "Rule Violated": "CA_007",
                    "Severity": "High",
                    "Description": f"Supplementary card is Active while Primary card ({acc_data['primary']['holder']}) is {primary_status}.",
                    "Fix Action": "Deactivate/Suspend Supplementary Card"
                })
                violations_found += 1
                
            # CA_008 Check
            if supp_limit > primary_limit:
                audit_results.append({
                    "Account ID": acc_id,
                    "Account Name": acc_data["account_name"],
                    "Cardholder": supp["holder"],
                    "Type": "Supplementary",
                    "Rule Violated": "CA_008",
                    "Severity": "Medium",
                    "Description": f"Supplementary limit (${supp_limit:,}) exceeds Primary limit (${primary_limit:,}).",
                    "Fix Action": f"Cap Supplementary limit to ${primary_limit:,}"
                })
                violations_found += 1

    # Display Audit Summary Metrics
    col_m1, col_m2, col_m3 = st.columns(3)
    with col_m1:
        st.metric("Total Accounts Audited", len(st.session_state.accounts))
    with col_m2:
        st.metric("Violations Detected", violations_found, delta=-violations_found if violations_found == 0 else violations_found, delta_color="inverse")
    with col_m3:
        compliance_rate = ((len(st.session_state.accounts) - (1 if violations_found > 0 else 0)) / len(st.session_state.accounts)) * 100
        st.metric("Compliance Rate", f"{compliance_rate:.1f}%")

    if violations_found > 0:
        st.markdown("### ⚠️ Detected Violations")
        df_audit = pd.DataFrame(audit_results)
        st.dataframe(df_audit, use_container_width=True)
        
        # Bulk Fix Action
        st.markdown("### ⚡ Automated Remediation Engine")
        st.write("The orchestrator can automatically resolve these violations to bring the portfolio back to 100% compliance.")
        
        if st.button("Execute Bulk Compliance Fix", type="primary"):
            for violation in audit_results:
                acc_id = violation["Account ID"]
                rule = violation["Rule Violated"]
                holder = violation["Cardholder"]
                
                account = st.session_state.accounts[acc_id]
                
                if rule == "CA_007":
                    # Find the supplementary card and deactivate it
                    for supp in account["supplementary"]:
                        if supp["holder"] == holder:
                            supp["status"] = account["primary"]["status"] # Match primary status
                            log_action(acc_id, "Auto-Remediation (CA_007)", "Success", f"Deactivated supplementary card for {holder} to match Primary status.")
                
                elif rule == "CA_008":
                    # Cap supplementary limit to primary limit
                    for supp in account["supplementary"]:
                        if supp["holder"] == holder:
                            supp["limit"] = account["primary"]["limit"]
                            log_action(acc_id, "Auto-Remediation (CA_008)", "Success", f"Capped supplementary limit for {holder} to ${account['primary']['limit']:,}.")
                            
            st.success("Remediation complete! All accounts are now fully compliant.")
            st.rerun()
    else:
        st.success("🎉 Perfect Compliance! No rule violations detected across the entire portfolio.")