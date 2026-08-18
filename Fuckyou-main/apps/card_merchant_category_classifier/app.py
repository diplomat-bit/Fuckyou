import streamlit as st
import pandas as pd
import plotly.express as px
import re
import io

# Set page configuration
st.set_page_config(
    page_title="MCC Classifier & Rewards Optimizer",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State for Rules and Cards to share across all 4 sub-apps
if "rules" not in st.session_state:
    st.session_state.rules = {
        "Dining (5812/5814)": {
            "mcc": "5812",
            "keywords": ["mcdonald", "starbucks", "subway", "burger", "pizza", "restaurant", "cafe", "bistro", "grill", "diner", "pub", "bar", "sushi", "eats", "sweetgreen", "chipotle", "dunkin", "taco bell", "kfc", "dominos", "bakery", "blue bottle"],
            "color": "#FF4B4B"
        },
        "Groceries (5411)": {
            "mcc": "5411",
            "keywords": ["walmart", "target", "kroger", "safeway", "wholefds", "whole foods", "trader joe", "aldi", "costco", "supermarket", "grocery", "h-mart", "instacart", "publix", "heb", "wegmans", "sprouts"],
            "color": "#2ECC71"
        },
        "Gas / Fuel (5541)": {
            "mcc": "5541",
            "keywords": ["shell", "exxon", "chevron", "bp", "mobil", "speedway", "7-eleven", "gas", "fuel", "wawa", "circle k", "valero", "sunoco", "sheetz"],
            "color": "#3498DB"
        },
        "Travel (4111/4511)": {
            "mcc": "4511",
            "keywords": ["uber", "lyft", "delta", "united air", "american air", "airbnb", "hotel", "expedia", "booking", "amtrak", "flight", "taxi", "subway transit", "railway", "jetblue", "southwest", "hertz", "avis"],
            "color": "#9B59B6"
        },
        "Subscriptions / Utilities (4899)": {
            "mcc": "4899",
            "keywords": ["netflix", "spotify", "hulu", "disney", "comcast", "verizon", "at&t", "aws", "google cloud", "microsoft", "zoom", "slack", "adobe", "nytimes", "youtube premium"],
            "color": "#F1C40F"
        },
        "Shopping / Retail (5311)": {
            "mcc": "5311",
            "keywords": ["amazon", "ebay", "zara", "h&m", "nike", "macys", "nordstrom", "best buy", "apple store", "target retail", "etsy", "sephora", "home depot", "lowes", "ikea"],
            "color": "#E67E22"
        }
    }

if "cards" not in st.session_state:
    st.session_state.cards = {
        "Gold Premium Card": {
            "Dining (5812/5814)": 4.0,
            "Groceries (5411)": 4.0,
            "Travel (4111/4511)": 3.0,
            "Gas / Fuel (5541)": 1.0,
            "Subscriptions / Utilities (4899)": 1.0,
            "Shopping / Retail (5311)": 1.0,
            "Other (5999)": 1.0
        },
        "Sapphire Preferred": {
            "Dining (5812/5814)": 3.0,
            "Groceries (5411)": 1.0,
            "Travel (4111/4511)": 2.0,
            "Gas / Fuel (5541)": 1.0,
            "Subscriptions / Utilities (4899)": 3.0,
            "Shopping / Retail (5311)": 1.0,
            "Other (5999)": 1.0
        },
        "Everyday Cash Back": {
            "Dining (5812/5814)": 1.5,
            "Groceries (5411)": 3.0,
            "Travel (4111/4511)": 1.5,
            "Gas / Fuel (5541)": 3.0,
            "Subscriptions / Utilities (4899)": 1.0,
            "Shopping / Retail (5311)": 1.0,
            "Other (5999)": 1.0
        }
    }

# Helper Classification Function
def classify_transaction(description, rules):
    desc_lower = description.lower()
    best_match = "Other (5999)"
    best_mcc = "5999"
    max_score = 0
    
    for category, info in rules.items():
        for kw in info["keywords"]:
            # Check for exact word boundary or substring match
            if re.search(r'\b' + re.escape(kw) + r'\b', desc_lower):
                score = len(kw) + 10  # Higher score for longer keyword matches with word boundaries
                if score > max_score:
                    max_score = score
                    best_match = category
                    best_mcc = info["mcc"]
            elif kw in desc_lower:
                score = len(kw)  # Substring match score
                if score > max_score:
                    max_score = score
                    best_match = category
                    best_mcc = info["mcc"]
                    
    confidence = "High" if max_score > 12 else ("Medium" if max_score > 0 else "Low (Default)")
    return best_match, best_mcc, confidence

# Sidebar Navigation
st.sidebar.title("💳 MCC Classifier Suite")
st.sidebar.markdown("Analyze, optimize, and audit credit card transactions using rule-based heuristics.")
st.sidebar.divider()

app_mode = st.sidebar.radio(
    "Select an Application Module:",
    [
        "🔍 Single Transaction Classifier",
        "📊 Batch Processor & Visualizer",
        "⚙️ Rule & Reward Engine Customizer",
        "🚨 Audit & Fraud Detector"
    ]
)

st.sidebar.divider()
st.sidebar.info(
    "**How it works:**\n"
    "1. Heuristics scan transaction descriptions for merchant keywords.\n"
    "2. Transactions are mapped to standard Merchant Category Codes (MCC).\n"
    "3. Rewards are calculated based on card profiles.\n"
    "4. Mismatches between reported and heuristic MCCs are flagged."
)

# ==========================================
# APP 1: SINGLE TRANSACTION CLASSIFIER
# ==========================================
if app_mode == "🔍 Single Transaction Classifier":
    st.title("🔍 Single Transaction Classifier & Reward Calculator")
    st.markdown("Instantly classify a single transaction description, calculate rewards, and check for MCC mismatches.")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Transaction Details")
        description = st.text_input("Transaction Description", "STARBUCKS COFFEE #48291 SEATTLE WA")
        amount = st.number_input("Transaction Amount ($)", min_value=0.0, value=14.50, step=0.5)
        
        selected_card = st.selectbox("Select Credit Card Profile", list(st.session_state.cards.keys()))
        
        with st.expander("Advanced: Simulate Reported MCC (for mismatch testing)"):
            reported_mcc_input = st.text_input("Reported MCC (e.g., 5812, 5411, 5541)", "5812")
            st.caption("If the reported MCC differs from our heuristic classification, a mismatch flag will trigger.")

    # Run classification
    classified_cat, classified_mcc, confidence = classify_transaction(description, st.session_state.rules)
    
    # Calculate rewards
    card_multipliers = st.session_state.cards[selected_card]
    multiplier = card_multipliers.get(classified_cat, card_multipliers.get("Other (5999)", 1.0))
    points_earned = amount * multiplier
    
    # Check mismatch
    mismatch_detected = False
    if reported_mcc_input and reported_mcc_input.strip() != classified_mcc:
        # Find category name of reported MCC
        reported_cat_name = "Unknown / Other"
        for cat, info in st.session_state.rules.items():
            if info["mcc"] == reported_mcc_input.strip():
                reported_cat_name = cat
                break
        mismatch_detected = True

    with col2:
        st.subheader("Classification & Rewards Analysis")
        
        # Metrics
        m1, m2, m3 = st.columns(3)
        m1.metric("Classified MCC", f"{classified_mcc}", classified_cat.split(" ")[0])
        m2.metric("Multiplier", f"{multiplier}x", selected_card.split(" ")[0])
        m3.metric("Points Earned", f"{points_earned:,.2f} pts")
        
        # Confidence Indicator
        if confidence == "High":
            st.success(f"Confidence Level: **{confidence}** (Strong keyword match)")
        elif confidence == "Medium":
            st.warning(f"Confidence Level: **{confidence}** (Partial keyword match)")
        else:
            st.info(f"Confidence Level: **{confidence}** (Fallback to default category)")
            
        # Mismatch Alert Box
        if mismatch_detected:
            st.error(
                f"🚨 **Suspicious MCC Mismatch Detected!**\n\n"
                f"- **Heuristic Classification:** {classified_cat} (MCC {classified_mcc})\n"
                f"- **Reported Merchant MCC:** {reported_cat_name} (MCC {reported_mcc_input})\n\n"
                f"This could indicate a misconfigured merchant terminal or potential rewards gaming."
            )
        else:
            st.success("✅ **MCC Match Verified:** The reported MCC aligns with the transaction description heuristics.")
            
        # Rule Explanation
        st.markdown("### Heuristic Match Details")
        matched_kw = None
        if classified_cat != "Other (5999)":
            for kw in st.session_state.rules[classified_cat]["keywords"]:
                if kw in description.lower():
                    matched_kw = kw
                    break
        
        if matched_kw:
            st.markdown(f"Matched keyword **'{matched_kw}'** belonging to the **{classified_cat}** rule set.")
        else:
            st.markdown("No specific keywords matched. Defaulted to **Other (5999)**.")

# ==========================================
# APP 2: BATCH TRANSACTION PROCESSOR
# ==========================================
elif app_mode == "📊 Batch Processor & Visualizer":
    st.title("📊 Batch Transaction Processor & Visualizer")
    st.markdown("Upload a CSV of transactions or use our pre-loaded mock statement to classify in bulk and visualize rewards.")
    
    # Mock Data Generator
    mock_data = """Date,Description,Amount,Reported MCC
2023-10-01,MCDONALD'S F1234 CHICAGO IL,12.45,5814
2023-10-02,SAFEWAY STORE 0482 OAKLAND CA,84.20,5411
2023-10-02,SHELL OIL 1204892 SAN JOSE CA,45.00,5541
2023-10-03,NETFLIX.COM NETFLIX CA,15.49,4899
2023-10-04,AMZN MKTP US*AMAZON.COM,124.50,5311
2023-10-05,UBER TRIP RIDE HELP,24.30,4111
2023-10-06,STARBUCKS COFFEE SEATTLE WA,6.75,5812
2023-10-07,WALMART SUPERCENTER MIAMI FL,112.10,5411
2023-10-08,DELTA AIRLINES FLIGHTS,450.00,4511
2023-10-09,SPOTIFY PREMIUM SWEDEN,10.99,4899
2023-10-10,LOCAL GAS STATION (MISCLASSIFIED),35.00,5812"""

    st.sidebar.subheader("Batch Settings")
    selected_card = st.sidebar.selectbox("Select Card Profile for Batch", list(st.session_state.cards.keys()))
    
    data_source = st.radio("Choose Data Source:", ["Use Mock Transaction Statement", "Upload Custom CSV File"])
    
    if data_source == "Use Mock Transaction Statement":
        df = pd.read_csv(io.StringIO(mock_data))
        st.info("Loaded mock transaction statement containing 11 transactions.")
    else:
        uploaded_file = st.file_uploader("Upload CSV File (Must contain 'Description' and 'Amount' columns, optionally 'Reported MCC')", type=["csv"])
        if uploaded_file is not None:
            df = pd.read_csv(uploaded_file)
        else:
            st.warning("Please upload a CSV file. Falling back to mock data for preview.")
            df = pd.read_csv(io.StringIO(mock_data))

    # Process Dataframe
    classified_categories = []
    classified_mccs = []
    confidences = []
    multipliers = []
    points_earned_list = []
    mismatch_flags = []

    card_multipliers = st.session_state.cards[selected_card]

    for idx, row in df.iterrows():
        desc = str(row["Description"])
        cat, mcc, conf = classify_transaction(desc, st.session_state.rules)
        
        # Multiplier & Points
        mult = card_multipliers.get(cat, card_multipliers.get("Other (5999)", 1.0))
        pts = row["Amount"] * mult
        
        # Mismatch check
        mismatch = "No"
        if "Reported MCC" in df.columns:
            rep_mcc = str(row["Reported MCC"]).strip()
            if rep_mcc and rep_mcc != "nan" and rep_mcc != mcc:
                mismatch = "🚨 Mismatch"
                
        classified_categories.append(cat)
        classified_mccs.append(mcc)
        confidences.append(conf)
        multipliers.append(mult)
        points_earned_list.append(pts)
        mismatch_flags.append(mismatch)

    df["Classified Category"] = classified_categories
    df["Classified MCC"] = classified_mccs
    df["Confidence"] = confidences
    df["Multiplier"] = multipliers
    df["Points Earned"] = points_earned_list
    if "Reported MCC" in df.columns:
        df["MCC Status"] = mismatch_flags

    # Display Results
    st.subheader("Processed Transactions")
    st.dataframe(df, use_container_width=True)
    
    # Download Button
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    st.download_button(
        label="📥 Download Processed CSV",
        data=csv_buffer.getvalue(),
        file_name="processed_transactions.csv",
        mime="text/csv"
    )
    
    st.divider()
    
    # Visualizations
    st.subheader("Spend & Rewards Analytics Dashboard")
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        # Spend by Category
        spend_by_cat = df.groupby("Classified Category")["Amount"].sum().reset_index()
        fig_spend = px.pie(
            spend_by_cat, 
            values="Amount", 
            names="Classified Category", 
            title="Total Spend by Classified Category ($)",
            hole=0.4,
            color_discrete_sequence=px.colors.qualitative.Pastel
        )
        st.plotly_chart(fig_spend, use_container_width=True)
        
    with col_chart2:
        # Points Earned by Category
        points_by_cat = df.groupby("Classified Category")["Points Earned"].sum().reset_index()
        fig_points = px.bar(
            points_by_cat,
            x="Classified Category",
            y="Points Earned",
            title="Points Earned by Category",
            color="Classified Category",
            color_discrete_sequence=px.colors.qualitative.Safe
        )
        st.plotly_chart(fig_points, use_container_width=True)

# ==========================================
# APP 3: RULE & REWARD ENGINE CUSTOMIZER
# ==========================================
elif app_mode == "⚙️ Rule & Reward Engine Customizer":
    st.title("⚙️ Rule & Reward Engine Customizer")
    st.markdown("Modify classification keywords, add new categories, and customize credit card reward multipliers in real-time.")
    
    tab1, tab2, tab3 = st.tabs(["🏷️ Edit Classification Rules", "💳 Customize Card Profiles", "🧪 Live Sandbox Tester"])
    
    with tab1:
        st.subheader("Manage Heuristic Rules")
        st.markdown("Add or remove keywords associated with each Merchant Category Code (MCC).")
        
        # Select category to edit
        selected_cat_to_edit = st.selectbox("Select Category to Edit", list(st.session_state.rules.keys()))
        
        current_mcc = st.session_state.rules[selected_cat_to_edit]["mcc"]
        current_keywords = st.session_state.rules[selected_cat_to_edit]["keywords"]
        
        new_mcc = st.text_input("MCC Code", value=current_mcc)
        keywords_text = st.text_area("Keywords (comma-separated)", value=", ".join(current_keywords))
        
        if st.button("Save Category Rules"):
            updated_keywords = [kw.strip().lower() for kw in keywords_text.split(",") if kw.strip()]
            st.session_state.rules[selected_cat_to_edit]["mcc"] = new_mcc
            st.session_state.rules[selected_cat_to_edit]["keywords"] = updated_keywords
            st.success(f"Successfully updated rules for **{selected_cat_to_edit}**!")
            
        st.divider()
        
        # Add a completely new category
        st.subheader("➕ Add New Custom Category")
        new_cat_name = st.text_input("New Category Name (e.g., Entertainment (7997))")
        new_cat_mcc = st.text_input("New Category MCC", "7997")
        new_cat_kws = st.text_area("New Category Keywords (comma-separated)", "netflix, cinema, theater, concert")
        
        if st.button("Create Category"):
            if new_cat_name and new_cat_mcc:
                kws_list = [k.strip().lower() for k in new_cat_kws.split(",") if k.strip()]
                st.session_state.rules[new_cat_name] = {
                    "mcc": new_cat_mcc,
                    "keywords": kws_list,
                    "color": "#9E9E9E"
                }
                # Also add default 1x multiplier to all cards for this new category
                for card in st.session_state.cards:
                    st.session_state.cards[card][new_cat_name] = 1.0
                st.success(f"Created new category **{new_cat_name}**!")
                st.rerun()

    with tab2:
        st.subheader("Customize Card Reward Multipliers")
        st.markdown("Adjust the points multiplier for each card profile across all categories.")
        
        selected_card_to_edit = st.selectbox("Select Card to Customize", list(st.session_state.cards.keys()))
        
        multipliers_to_update = {}
        for cat in st.session_state.rules.keys():
            current_mult = st.session_state.cards[selected_card_to_edit].get(cat, 1.0)
            multipliers_to_update[cat] = st.number_input(f"Multiplier for {cat}", min_value=0.0, max_value=10.0, value=float(current_mult), step=0.5, key=f"mult_{cat}")
            
        # Other category multiplier
        current_other = st.session_state.cards[selected_card_to_edit].get("Other (5999)", 1.0)
        multipliers_to_update["Other (5999)"] = st.number_input("Multiplier for Other (5999)", min_value=0.0, max_value=10.0, value=float(current_other), step=0.5)
        
        if st.button("Save Card Multipliers"):
            st.session_state.cards[selected_card_to_edit] = multipliers_to_update
            st.success(f"Successfully updated multipliers for **{selected_card_to_edit}**!")
            
        st.divider()
        
        # Add a new card profile
        st.subheader("➕ Create Custom Card Profile")
        new_card_name = st.text_input("New Card Name (e.g., Cash Back Elite)")
        if st.button("Create Card Profile"):
            if new_card_name:
                # Initialize with 1x for all categories
                st.session_state.cards[new_card_name] = {cat: 1.0 for cat in st.session_state.rules.keys()}
                st.session_state.cards[new_card_name]["Other (5999)"] = 1.0
                st.success(f"Created card profile **{new_card_name}**!")
                st.rerun()

    with tab3:
        st.subheader("🧪 Live Sandbox Tester")
        st.markdown("Test your customized rules and card profiles instantly below.")
        
        sandbox_desc = st.text_input("Sandbox Transaction Description", "AMAZON COFFEE SHOP")
        sandbox_amount = st.number_input("Sandbox Amount ($)", min_value=0.0, value=25.0)
        sandbox_card = st.selectbox("Sandbox Card Profile", list(st.session_state.cards.keys()))
        
        s_cat, s_mcc, s_conf = classify_transaction(sandbox_desc, st.session_state.rules)
        s_mult = st.session_state.cards[sandbox_card].get(s_cat, st.session_state.cards[sandbox_card].get("Other (5999)", 1.0))
        
        st.markdown("### Sandbox Results")
        st.write(f"**Classified Category:** {s_cat}")
        st.write(f"**MCC Code:** {s_mcc}")
        st.write(f"**Confidence:** {s_conf}")
        st.write(f"**Multiplier:** {s_mult}x")
        st.write(f"**Points Earned:** {sandbox_amount * s_mult:,.2f} points")

# ==========================================
# APP 4: AUDIT & FRAUD DETECTOR
# ==========================================
elif app_mode == "🚨 Audit & Fraud Detector":
    st.title("🚨 Audit & Fraud Detector")
    st.markdown(
        "Identify potential **interchange fee avoidance**, **rewards gaming**, or **merchant terminal misconfigurations** "
        "by comparing reported MCCs against heuristic classifications."
    )
    
    # Explanation of MCC Fraud/Mismatches
    with st.expander("ℹ️ What is MCC Mismatching & Why does it matter?"):
        st.markdown(
            "1. **Interchange Fee Avoidance:** Merchants sometimes register under incorrect MCCs (e.g., registering a restaurant as a grocery store or service provider) to pay lower transaction processing fees to credit card networks.\n"
            "2. **Rewards Gaming:** Consumers or merchants might exploit terminal configurations to trigger higher reward multipliers (e.g., a gas station convenience store reporting as a gas pump to trigger 5% cash back on general merchandise).\n"
            "3. **Terminal Misconfiguration:** Small businesses often set up payment terminals incorrectly, leading to lost rewards for consumers who expected dining or travel multipliers."
        )

    # Generate Audit Dataset
    audit_data = [
        {"Date": "2023-10-01", "Merchant": "STARBUCKS COFFEE", "Amount": 8.50, "Reported MCC": "5541", "Reported Category": "Gas / Fuel", "Explanation": "Terminal misconfigured as Gas Station instead of Dining."},
        {"Date": "2023-10-02", "Merchant": "SHELL OIL", "Amount": 52.00, "Reported MCC": "5541", "Reported Category": "Gas / Fuel", "Explanation": "Correctly configured."},
        {"Date": "2023-10-03", "Merchant": "WHOLE FOODS MARKET", "Amount": 120.40, "Reported MCC": "5411", "Reported Category": "Groceries", "Explanation": "Correctly configured."},
        {"Date": "2023-10-04", "Merchant": "MCDONALDS FAST FOOD", "Amount": 14.20, "Reported MCC": "5311", "Reported Category": "Shopping / Retail", "Explanation": "Merchant using retail MCC to avoid higher restaurant interchange fees."},
        {"Date": "2023-10-05", "Merchant": "NETFLIX SUBSCRIPTION", "Amount": 15.49, "Reported MCC": "4899", "Reported Category": "Subscriptions", "Explanation": "Correctly configured."},
        {"Date": "2023-10-06", "Merchant": "UBER RIDE", "Amount": 32.10, "Reported MCC": "5812", "Reported Category": "Dining", "Explanation": "Ride-sharing terminal misconfigured as Dining."},
        {"Date": "2023-10-07", "Merchant": "WALMART SUPERCENTER", "Amount": 95.00, "Reported MCC": "5411", "Reported Category": "Groceries", "Explanation": "Correctly configured."},
        {"Date": "2023-10-08", "Merchant": "LOCAL BISTRO & BAR", "Amount": 75.00, "Reported MCC": "5999", "Reported Category": "Other / General", "Explanation": "Small business using generic payment processor terminal without setting up dining MCC."}
    ]
    
    audit_df = pd.DataFrame(audit_data)
    
    # Run Heuristic Audit
    heuristic_cats = []
    heuristic_mccs = []
    statuses = []
    
    for idx, row in audit_df.iterrows():
        h_cat, h_mcc, _ = classify_transaction(row["Merchant"], st.session_state.rules)
        heuristic_cats.append(h_cat)
        heuristic_mccs.append(h_mcc)
        
        if h_mcc != row["Reported MCC"]:
            statuses.append("🚨 High Risk Mismatch")
        else:
            statuses.append("✅ Verified Match")
            
    audit_df["Heuristic Category"] = heuristic_cats
    audit_df["Heuristic MCC"] = heuristic_mccs
    audit_df["Audit Status"] = statuses
    
    # Metrics
    total_audited = len(audit_df)
    mismatches_count = sum(1 for s in statuses if "Mismatch" in s)
    mismatch_rate = (mismatches_count / total_audited) * 100
    
    col_m1, col_m2, col_m3 = st.columns(3)
    col_m1.metric("Total Audited Transactions", f"{total_audited}")
    col_m2.metric("Mismatches Detected", f"{mismatches_count}", delta=f"{mismatch_rate:.1f}% Rate", delta_color="inverse")
    col_m3.metric("Estimated Lost Rewards (Points)", f"{mismatches_count * 25} pts", help="Estimated points lost due to incorrect lower-tier MCC classification.")
    
    st.subheader("Audit Log & Discrepancy Report")
    
    # Filter by Status
    status_filter = st.multiselect("Filter by Audit Status:", ["🚨 High Risk Mismatch", "✅ Verified Match"], default=["🚨 High Risk Mismatch", "✅ Verified Match"])
    filtered_audit_df = audit_df[audit_df["Audit Status"].isin(status_filter)]
    
    st.dataframe(filtered_audit_df, use_container_width=True)
    
    st.divider()
    
    # Detailed Investigation Section
    st.subheader("🔍 Investigate Selected Discrepancy")
    mismatch_only_df = audit_df[audit_df["Audit Status"] == "🚨 High Risk Mismatch"]
    
    if not mismatch_only_df.empty:
        selected_merchant = st.selectbox("Select a mismatched merchant to investigate:", mismatch_only_df["Merchant"].unique())
        merchant_row = audit_df[audit_df["Merchant"] == selected_merchant].iloc[0]
        
        col_inv1, col_inv2 = st.columns(2)
        with col_inv1:
            st.info(
                f"**Merchant:** {merchant_row['Merchant']}\n\n"
                f"- **Reported MCC:** {merchant_row['Reported MCC']} ({merchant_row['Reported Category']})\n"
                f"- **Heuristic MCC:** {merchant_row['Heuristic MCC']} ({merchant_row['Heuristic Category']})\n"
                f"- **Transaction Amount:** ${merchant_row['Amount']:.2f}"
            )
        with col_inv2:
            st.warning(
                f"**Audit Finding:**\n"
                f"{merchant_row['Explanation']}\n\n"
                f"*Action Recommended:* Contact merchant services or file an MCC correction request with the card issuer to ensure customers receive correct rewards."
            )
    else:
        st.success("No mismatches found in the current filter selection.")