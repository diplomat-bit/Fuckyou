import streamlit as st
import pandas as pd
import os
import socket
import threading
import time
import json
import uuid
from datetime import datetime
from urllib.parse import urlencode
import requests

# FastAPI imports
from fastapi import FastAPI, Header, Query, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# --- Configuration & Constants ---
PORT = 8081
CSV_DIR = "api"
CSV_PATH = os.path.join(CSV_DIR, "card-listing.csv")

# --- Global Shared State for Logs ---
logs_lock = threading.Lock()
API_LOGS = []

# --- Ensure CSV Database Exists ---
def ensure_csv_exists():
    if not os.path.exists(CSV_DIR):
        os.makedirs(CSV_DIR)
    if not os.path.exists(CSV_PATH):
        # Create default mock data with realistic card listing payloads
        data = [
            {
                "cardId": "C001",
                "cardName": "Sapphire Premier Credit",
                "cardFunction": "Credit",
                "linkedSupplementaryCardIndicator": "N",
                "cardType": "Visa Signature",
                "annualFee": 95.0,
                "interestRate": 18.24,
                "creditLimitMax": 50000,
                "rewardsRate": 0.02,
                "status": "Active",
                "allowedClientId": "client_abc_123"
            },
            {
                "cardId": "C002",
                "cardName": "Sapphire Premier Supplementary",
                "cardFunction": "Credit",
                "linkedSupplementaryCardIndicator": "Y",
                "cardType": "Visa Signature",
                "annualFee": 0.0,
                "interestRate": 18.24,
                "creditLimitMax": 10000,
                "rewardsRate": 0.02,
                "status": "Active",
                "allowedClientId": "client_abc_123"
            },
            {
                "cardId": "C003",
                "cardName": "Freedom Unlimited Debit",
                "cardFunction": "Debit",
                "linkedSupplementaryCardIndicator": "N",
                "cardType": "Mastercard Debit",
                "annualFee": 0.0,
                "interestRate": 0.0,
                "creditLimitMax": 0,
                "rewardsRate": 0.005,
                "status": "Active",
                "allowedClientId": "client_xyz_789"
            },
            {
                "cardId": "C004",
                "cardName": "Gold Premium Credit",
                "cardFunction": "Credit",
                "linkedSupplementaryCardIndicator": "N",
                "cardType": "Amex Gold",
                "annualFee": 250.0,
                "interestRate": 20.99,
                "creditLimitMax": 100000,
                "rewardsRate": 0.04,
                "status": "Active",
                "allowedClientId": "client_abc_123"
            },
            {
                "cardId": "C005",
                "cardName": "Everyday Cash Prepaid",
                "cardFunction": "Prepaid",
                "linkedSupplementaryCardIndicator": "N",
                "cardType": "Visa Prepaid",
                "annualFee": 4.95,
                "interestRate": 0.0,
                "creditLimitMax": 5000,
                "rewardsRate": 0.01,
                "status": "Active",
                "allowedClientId": "client_any"
            },
            {
                "cardId": "C006",
                "cardName": "Business Elite Credit",
                "cardFunction": "Credit",
                "linkedSupplementaryCardIndicator": "N",
                "cardType": "Mastercard World Elite",
                "annualFee": 450.0,
                "interestRate": 15.99,
                "creditLimitMax": 250000,
                "rewardsRate": 0.03,
                "status": "Active",
                "allowedClientId": "client_biz_999"
            },
            {
                "cardId": "C007",
                "cardName": "Business Elite Supplementary",
                "cardFunction": "Credit",
                "linkedSupplementaryCardIndicator": "Y",
                "cardType": "Mastercard World Elite",
                "annualFee": 50.0,
                "interestRate": 15.99,
                "creditLimitMax": 50000,
                "rewardsRate": 0.03,
                "status": "Active",
                "allowedClientId": "client_biz_999"
            },
            {
                "cardId": "C008",
                "cardName": "Student Starter Debit",
                "cardFunction": "Debit",
                "linkedSupplementaryCardIndicator": "N",
                "cardType": "Visa Debit",
                "annualFee": 0.0,
                "interestRate": 0.0,
                "creditLimitMax": 0,
                "rewardsRate": 0.0,
                "status": "Active",
                "allowedClientId": "client_any"
            }
        ]
        df = pd.DataFrame(data)
        df.to_csv(CSV_PATH, index=False)

ensure_csv_exists()

def load_cards_from_csv():
    if os.path.exists(CSV_PATH):
        try:
            return pd.read_csv(CSV_PATH)
        except Exception:
            return pd.DataFrame()
    return pd.DataFrame()

# --- FastAPI Mock Server Setup ---
app_api = FastAPI(
    title="Card Listing Mock API",
    description="Dynamically serves card listings parsed from CSV",
    version="1.0.0"
)

# Enable CORS for local development testing
app_api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app_api.middleware("http")
async def log_and_delay_middleware(request: Request, call_next):
    # Handle simulated latency via custom header
    latency_header = request.headers.get("x-mock-latency")
    if latency_header:
        try:
            delay = float(latency_header) / 1000.0
            time.sleep(delay)
        except ValueError:
            pass

    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000

    # Log request details safely
    log_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
        "method": request.method,
        "path": request.url.path,
        "query_params": dict(request.query_params),
        "headers": {k: v for k, v in request.headers.items() if k in ["client_id", "uuid", "x-mock-latency", "user-agent"]},
        "status_code": response.status_code,
        "latency_ms": round(process_time, 2)
    }
    
    with logs_lock:
        API_LOGS.append(log_entry)
        if len(API_LOGS) > 150:
            API_LOGS.pop(0)
            
    return response

@app_api.get("/api/v1/cards")
def get_cards(
    cardFunction: str = Query(None, description="Filter by card function (e.g., Credit, Debit, Prepaid)"),
    linkedSupplementaryCardIndicator: str = Query(None, description="Filter by linked supplementary card indicator (Y/N)"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    client_id: str = Header(None, alias="client_id"),
    uuid: str = Header(None, alias="uuid")
):
    df = load_cards_from_csv()
    if df.empty:
        return {
            "status": "success",
            "data": [],
            "meta": {"total": 0, "limit": limit, "offset": offset}
        }

    filtered_df = df.copy()

    # Apply query parameter filters (case-insensitive)
    if cardFunction:
        filtered_df = filtered_df[filtered_df['cardFunction'].str.lower() == cardFunction.lower()]
        
    if linkedSupplementaryCardIndicator:
        filtered_df = filtered_df[filtered_df['linkedSupplementaryCardIndicator'].str.upper() == linkedSupplementaryCardIndicator.upper()]

    # Apply client_id header filter if present in data
    if 'allowedClientId' in filtered_df.columns:
        if client_id:
            filtered_df = filtered_df[
                (filtered_df['allowedClientId'].isna()) | 
                (filtered_df['allowedClientId'] == 'client_any') | 
                (filtered_df['allowedClientId'] == client_id)
            ]
        else:
            filtered_df = filtered_df[
                (filtered_df['allowedClientId'].isna()) | 
                (filtered_df['allowedClientId'] == 'client_any')
            ]

    total_records = len(filtered_df)
    
    # Apply pagination safely
    paginated_df = filtered_df.iloc[offset : offset + limit]
    records = paginated_df.to_dict(orient="records")

    return {
        "status": "success",
        "data": records,
        "meta": {
            "total": total_records,
            "limit": limit,
            "offset": offset,
            "uuid_tracked": uuid
        }
    }

# --- Background Server Thread Management ---
def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def run_server():
    uvicorn.run(app_api, host="127.0.0.1", port=PORT, log_level="warning")

# Start background server if not already running
if not is_port_in_use(PORT):
    thread = threading.Thread(target=run_server, daemon=True)
    thread.start()
    time.sleep(1)  # Allow server to initialize

# --- Streamlit UI Setup ---
st.set_page_config(
    page_title="Card Listing Mock Server & Explorer",
    page_icon="💳",
    layout="wide"
)

# Custom CSS for polished look
st.markdown("""
    <style>
    .main-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1E3A8A;
        margin-bottom: 0.5rem;
    }
    .sub-title {
        font-size: 1.1rem;
        color: #4B5563;
        margin-bottom: 2rem;
    }
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.875rem;
    }
    .status-active {
        background-color: #D1FAE5;
        color: #065F46;
    }
    .status-inactive {
        background-color: #FEE2E2;
        color: #991B1B;
    }
    </style>
""", unsafe_allow_html=True)

# --- Sidebar ---
st.sidebar.title("⚙️ Mock Server Control")
server_active = is_port_in_use(PORT)

if server_active:
    st.sidebar.markdown(
        '<span class="status-badge status-active">● Server Active</span>', 
        unsafe_allow_html=True
    )
    st.sidebar.info(f"Listening on: **http://127.0.0.1:{PORT}**")
else:
    st.sidebar.markdown(
        '<span class="status-badge status-inactive">● Server Offline</span>', 
        unsafe_allow_html=True
    )

st.sidebar.markdown("---")
st.sidebar.subheader("Database Quick Stats")
df_stats = load_cards_from_csv()
if not df_stats.empty:
    st.sidebar.metric("Total Cards in CSV", len(df_stats))
    st.sidebar.metric("Credit Cards", len(df_stats[df_stats['cardFunction'] == 'Credit']))
    st.sidebar.metric("Debit/Prepaid", len(df_stats[df_stats['cardFunction'].isin(['Debit', 'Prepaid'])]))
else:
    st.sidebar.warning("No data loaded.")

# --- Main Header ---
st.markdown('<div class="main-title">💳 Card Listing Mock Server & API Explorer</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-title">An interactive playground and mock server that parses <code>api/card-listing.csv</code> '
    'to dynamically serve card listing payloads based on query parameters and headers.</div>', 
    unsafe_allow_html=True
)

# --- Tabs ---
tab_explorer, tab_db, tab_logs, tab_docs = st.tabs([
    "🚀 Interactive API Explorer", 
    "📂 Database Manager (CSV)", 
    "📊 Live Server Logs", 
    "📖 API Documentation"
])

# --- Tab 1: Interactive API Explorer ---
with tab_explorer:
    st.subheader("Simulate API Request")
    st.write("Configure query parameters and headers below to test the mock server's matching logic.")
    
    col_params, col_headers = st.columns(2)
    
    with col_params:
        st.markdown("### **Query Parameters**")
        card_function = st.selectbox(
            "cardFunction", 
            ["All", "Credit", "Debit", "Prepaid"], 
            help="Filters cards by their primary function."
        )
        supplementary_indicator = st.selectbox(
            "linkedSupplementaryCardIndicator", 
            ["All", "Y", "N"], 
            help="Filters cards based on whether they are supplementary cards."
        )
        col_pag1, col_pag2 = st.columns(2)
        with col_pag1:
            limit = st.number_input("limit", min_value=1, max_value=100, value=10)
        with col_pag2:
            offset = st.number_input("offset", min_value=0, value=0)

    with col_headers:
        st.markdown("### **Headers**")
        client_id = st.text_input(
            "client_id", 
            value="client_abc_123", 
            help="Simulates client-specific catalog access. Try 'client_abc_123', 'client_xyz_789', or leave empty."
        )
        
        col_uuid, col_gen = st.columns([3, 1])
        with col_uuid:
            req_uuid = st.text_input(
                "uuid", 
                value=str(uuid.uuid4()), 
                help="Unique request identifier for tracking."
            )
        with col_gen:
            st.write("") # spacing
            st.write("")
            if st.button("🔄 New"):
                st.rerun()
                
        latency = st.slider(
            "Simulated Latency (ms)", 
            min_value=0, 
            max_value=3000, 
            value=0, 
            step=100,
            help="Simulates network delay using the custom 'x-mock-latency' header."
        )

    st.markdown("---")
    
    # Build Request URL and Headers
    params = {}
    if card_function != "All":
        params["cardFunction"] = card_function
    if supplementary_indicator != "All":
        params["linkedSupplementaryCardIndicator"] = supplementary_indicator
    params["limit"] = limit
    params["offset"] = offset

    headers = {
        "client_id": client_id,
        "uuid": req_uuid
    }
    if latency > 0:
        headers["x-mock-latency"] = str(latency)

    # Display equivalent curl command
    query_string = urlencode(params)
    full_url = f"http://localhost:{PORT}/api/v1/cards"
    if query_string:
        full_url += f"?{query_string}"
        
    curl_headers = " ".join([f"-H '{k}: {v}'" for k, v in headers.items() if v])
    curl_command = f"curl -X GET '{full_url}' {curl_headers}"
    
    st.markdown("#### **Equivalent Curl Command**")
    st.code(curl_command, language="bash")

    # Send Request Button
    if st.button("🚀 Send Mock Request", type="primary"):
        try:
            start_time = time.time()
            response = requests.get(
                f"http://127.0.0.1:{PORT}/api/v1/cards", 
                params=params, 
                headers=headers
            )
            elapsed_time = (time.time() - start_time) * 1000
            
            st.markdown("### **Response Inspector**")
            
            col_resp_meta1, col_resp_meta2, col_resp_meta3 = st.columns(3)
            with col_resp_meta1:
                status_code = response.status_code
                if status_code == 200:
                    st.success(f"Status: {status_code} OK")
                else:
                    st.error(f"Status: {status_code}")
            with col_resp_meta2:
                st.info(f"Roundtrip Latency: {elapsed_time:.2f} ms")
            with col_resp_meta3:
                st.metric("Records Returned", len(response.json().get("data", [])))

            col_payload, col_resp_headers = st.columns([2, 1])
            
            with col_payload:
                st.markdown("#### **JSON Payload**")
                st.json(response.json())
                
            with col_resp_headers:
                st.markdown("#### **Response Headers**")
                st.write(dict(response.headers))
                
                # Custom Schema Validation
                st.markdown("#### **Schema Validation**")
                resp_data = response.json()
                errors = []
                if not isinstance(resp_data, dict):
                    errors.append("Response is not a valid JSON object.")
                else:
                    if "status" not in resp_data:
                        errors.append("Missing 'status' field.")
                    if "data" not in resp_data:
                        errors.append("Missing 'data' field.")
                    elif not isinstance(resp_data["data"], list):
                        errors.append("'data' field must be an array.")
                    if "meta" not in resp_data:
                        errors.append("Missing 'meta' field.")
                
                if not errors:
                    st.success("✅ Response matches standard Card Listing schema!")
                else:
                    for err in errors:
                        st.error(f"❌ {err}")
                        
        except Exception as e:
            st.error(f"Failed to connect to mock server: {e}")

# --- Tab 2: Database Manager ---
with tab_db:
    st.subheader("Manage Card Database (CSV)")
    st.write(
        "The mock server reads directly from `api/card-listing.csv`. "
        "You can edit the database below in real-time, add new cards, or reset to default mock data."
    )
    
    df_db = load_cards_from_csv()
    
    if not df_db.empty:
        edited_df = st.data_editor(
            df_db, 
            num_rows="dynamic", 
            use_container_width=True,
            key="db_editor"
        )
        
        col_db_actions1, col_db_actions2 = st.columns(2)
        with col_db_actions1:
            if st.button("💾 Save Changes to CSV", type="primary"):
                try:
                    edited_df.to_csv(CSV_PATH, index=False)
                    st.success("Database updated successfully! The API will now serve the updated data.")
                    st.rerun()
                except Exception as e:
                    st.error(f"Failed to save changes: {e}")
        with col_db_actions2:
            if st.button("🔄 Reset to Default Database"):
                if os.path.exists(CSV_PATH):
                    os.remove(CSV_PATH)
                ensure_csv_exists()
                st.success("Database reset to default mock data!")
                st.rerun()
    else:
        st.warning("No database found or CSV is empty.")
        if st.button("Create Default Database"):
            ensure_csv_exists()
            st.rerun()

    # Add New Card Form
    st.markdown("---")
    st.subheader("➕ Add New Card Record")
    with st.form("add_card_form", clear_on_submit=True):
        c1, c2, c3 = st.columns(3)
        with c1:
            new_id = st.text_input("Card ID", value=f"C{len(df_db)+1:03d}" if not df_db.empty else "C001")
            new_name = st.text_input("Card Name", placeholder="e.g. Sapphire Elite")
            new_function = st.selectbox("Card Function", ["Credit", "Debit", "Prepaid"])
        with c2:
            new_supp = st.selectbox("Supplementary Card?", ["N", "Y"])
            new_type = st.text_input("Card Type", placeholder="e.g. Visa Infinite")
            new_fee = st.number_input("Annual Fee", min_value=0.0, step=10.0, value=0.0)
        with c3:
            new_rate = st.number_input("Interest Rate (%)", min_value=0.0, step=0.1, value=15.0)
            new_limit = st.number_input("Max Credit Limit", min_value=0, step=1000, value=20000)
            new_client = st.text_input("Allowed Client ID", value="client_any")
            
        if st.form_submit_button("Add Card to Database"):
            new_row = {
                "cardId": new_id,
                "cardName": new_name,
                "cardFunction": new_function,
                "linkedSupplementaryCardIndicator": new_supp,
                "cardType": new_type,
                "annualFee": new_fee,
                "interestRate": new_rate,
                "creditLimitMax": new_limit,
                "rewardsRate": 0.01, # default
                "status": "Active",
                "allowedClientId": new_client
            }
            df_updated = pd.concat([df_db, pd.DataFrame([new_row])], ignore_index=True)
            df_updated.to_csv(CSV_PATH, index=False)
            st.success(f"Card '{new_name}' added successfully!")
            st.rerun()

# --- Tab 3: Live Server Logs ---
with tab_logs:
    st.subheader("Live Request Logs")
    st.write("This panel displays real-time requests received by the background FastAPI mock server.")
    
    col_log_ctrl1, col_log_ctrl2 = st.columns([4, 1])
    with col_log_ctrl2:
        if st.button("🗑️ Clear Logs", use_container_width=True):
            with logs_lock:
                API_LOGS.clear()
            st.rerun()
            
    with logs_lock:
        current_logs = list(API_LOGS)
        
    if current_logs:
        logs_df = pd.DataFrame(current_logs)
        # Reverse to show newest first
        logs_df = logs_df.iloc[::-1]
        st.dataframe(logs_df, use_container_width=True)
    else:
        st.info("No requests received yet. Use the API Explorer or external tools (like Postman/curl) to send requests!")

# --- Tab 4: API Documentation ---
with tab_docs:
    st.subheader("API Documentation & Integration Guide")
    st.markdown(f"""
    ### **Base URL**

    http://localhost:{PORT}


    ### **Endpoints**
    
    #### **1. Get Card Listings**
    `GET /api/v1/cards`
    
    Retrieves a list of available cards filtered by query parameters and client headers.

    **Query Parameters:**
    *   `cardFunction` *(string, optional)*: Filter by card function. Allowed values: `Credit`, `Debit`, `Prepaid`.
    *   `linkedSupplementaryCardIndicator` *(string, optional)*: Filter by supplementary status. Allowed values: `Y`, `N`.
    *   `limit` *(integer, optional)*: Number of records to return. Default: `10`.
    *   `offset` *(integer, optional)*: Number of records to skip. Default: `0`.

    **Headers:**
    *   `client_id` *(string, optional)*: Used to filter card catalogs restricted to specific clients.
    *   `uuid` *(string, optional)*: Request tracking identifier.
    *   `x-mock-latency` *(integer, optional)*: Simulates network latency in milliseconds.

    ### **Sample Response**

    {{
      "status": "success",
      "data": [
        {{
          "cardId": "C001",
          "cardName": "Sapphire Premier Credit",
          "cardFunction": "Credit",
          "linkedSupplementaryCardIndicator": "N",
          "cardType": "Visa Signature",
          "annualFee": 95.0,
          "interestRate": 18.24,
          "creditLimitMax": 50000,
          "rewardsRate": 0.02,
          "status": "Active",
          "allowedClientId": "client_abc_123"
        }}
      ],
      "meta": {{
        "total": 1,
        "limit": 10,
        "offset": 0,
        "uuid_tracked": "d3b07384-d113-4956-a5e1-2199b35d440d"
      }}
    }}

    """)