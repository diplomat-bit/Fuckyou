import streamlit as st
import json
import uuid as uuid_tool
import datetime
import pandas as pd

# Set page config
st.set_page_config(
    page_title="Balance Transfer Eligibility API Mock & Client",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# OpenAPI 3.0.3 Schema Definition
OPENAPI_SCHEMA = {
  "openapi": "3.0.3",
  "info": {
    "title": "CardAccountBalanceTransferEligibility API",
    "version": "1.0.0",
    "description": "API to check balance transfer eligibility for card accounts."
  },
  "paths": {
    "/v1/card-accounts/balance-transfer-eligibility": {
      "get": {
        "summary": "Check Balance Transfer Eligibility",
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "required": True,
            "schema": { "type": "string", "example": "Bearer token123" }
          },
          {
            "name": "uuid",
            "in": "header",
            "required": True,
            "schema": { "type": "string", "format": "uuid" }
          },
          {
            "name": "client_id",
            "in": "header",
            "required": True,
            "schema": { "type": "string" }
          },
          {
            "name": "clientDetails",
            "in": "header",
            "required": False,
            "schema": { "type": "string" }
          },
          {
            "name": "btSupportedAccountGroup",
            "in": "query",
            "required": True,
            "schema": {
              "type": "string",
              "enum": ["CREDIT_CARD", "PERSONAL_LOAN", "ALL"]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EligibilityResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "EligibilityResponse": {
        "type": "object",
        "required": ["eligible", "accountId", "btSupportedAccountGroup", "offers"],
        "properties": {
          "eligible": { "type": "boolean" },
          "accountId": { "type": "string" },
          "btSupportedAccountGroup": { "type": "string" },
          "reasonCode": { "type": "string" },
          "reasonDescription": { "type": "string" },
          "maxTransferLimit": { "type": "number" },
          "minTransferLimit": { "type": "number" },
          "offers": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BalanceTransferOffer"
            }
          }
        }
      },
      "BalanceTransferOffer": {
        "type": "object",
        "required": ["offerId", "apr", "promoDurationMonths", "feePercentage"],
        "properties": {
          "offerId": { "type": "string" },
          "apr": { "type": "number" },
          "promoDurationMonths": { "type": "integer" },
          "feePercentage": { "type": "number" },
          "disbursementOptions": {
            "type": "array",
            "items": { "type": "string", "enum": ["ACH", "CHECK", "DIRECT_DEPOSIT"] }
          }
        }
      }
    }
  }
}

# Pre-configured Scenarios
SCENARIOS = {
    "Fully Eligible (Multiple Offers)": {
        "eligible": True,
        "reasonCode": "ELIGIBLE",
        "reasonDescription": "Account meets all criteria for balance transfer.",
        "minTransferLimit": 500.0,
        "maxTransferLimit": 15000.0,
        "offers": [
            {"offerId": "OFFER-0%APR-12M", "apr": 0.0, "promoDurationMonths": 12, "feePercentage": 3.0, "disbursementOptions": ["ACH", "CHECK"]},
            {"offerId": "OFFER-1.9%APR-18M", "apr": 1.9, "promoDurationMonths": 18, "feePercentage": 2.0, "disbursementOptions": ["ACH", "DIRECT_DEPOSIT"]}
        ],
        "btSupportedAccountGroup": "ALL",
        "auth_header": "Bearer mock-token-valid-001",
        "client_id": "client-portal-prod",
        "client_details": "device=desktop,os=macos,browser=chrome"
    },
    "Eligible (Single Low-APR Offer)": {
        "eligible": True,
        "reasonCode": "ELIGIBLE_PROMO",
        "reasonDescription": "Eligible for promotional low APR transfer.",
        "minTransferLimit": 100.0,
        "maxTransferLimit": 5000.0,
        "offers": [
            {"offerId": "OFFER-2.99%APR-24M", "apr": 2.99, "promoDurationMonths": 24, "feePercentage": 1.5, "disbursementOptions": ["ACH"]}
        ],
        "btSupportedAccountGroup": "CREDIT_CARD",
        "auth_header": "Bearer mock-token-valid-002",
        "client_id": "client-mobile-ios",
        "client_details": "device=mobile,os=ios,version=16.2"
    },
    "Ineligible (Low Credit Score)": {
        "eligible": False,
        "reasonCode": "CREDIT_SCORE_BELOW_THRESHOLD",
        "reasonDescription": "The account holder's current credit score does not meet the minimum requirement for balance transfers.",
        "minTransferLimit": 0.0,
        "maxTransferLimit": 0.0,
        "offers": [],
        "btSupportedAccountGroup": "ALL",
        "auth_header": "Bearer mock-token-valid-003",
        "client_id": "client-portal-prod",
        "client_details": "device=desktop,os=windows"
    },
    "Ineligible (Account Delinquent)": {
        "eligible": False,
        "reasonCode": "ACCOUNT_DELINQUENT",
        "reasonDescription": "Balance transfers are not permitted while the account is in a delinquent or past-due status.",
        "minTransferLimit": 0.0,
        "maxTransferLimit": 0.0,
        "offers": [],
        "btSupportedAccountGroup": "PERSONAL_LOAN",
        "auth_header": "Bearer mock-token-valid-004",
        "client_id": "client-mobile-android",
        "client_details": "device=mobile,os=android,version=13"
    },
    "Invalid Request (Missing Headers)": {
        "eligible": True,
        "reasonCode": "ELIGIBLE",
        "reasonDescription": "Account is eligible.",
        "minTransferLimit": 500.0,
        "maxTransferLimit": 10000.0,
        "offers": [],
        "btSupportedAccountGroup": "ALL",
        "auth_header": "", 
        "client_id": "", 
        "client_details": ""
    }
}

# Initialize Session States
if 'history' not in st.session_state:
    st.session_state.history = []

if 'uuid_val' not in st.session_state:
    st.session_state.uuid_val = str(uuid_tool.uuid4())

if 'last_response' not in st.session_state:
    st.session_state.last_response = None

# Initialize input states
if 'input_auth_header' not in st.session_state:
    st.session_state.input_auth_header = "Bearer mock-token-valid-001"
if 'input_uuid' not in st.session_state:
    st.session_state.input_uuid = st.session_state.uuid_val
if 'input_client_id' not in st.session_state:
    st.session_state.input_client_id = "client-portal-prod"
if 'input_client_details' not in st.session_state:
    st.session_state.input_client_details = "device=desktop,os=macos,browser=chrome"
if 'input_bt_group' not in st.session_state:
    st.session_state.input_bt_group = "ALL"

# Initialize mock response states
if 'mock_eligible' not in st.session_state:
    st.session_state.mock_eligible = True
if 'mock_reason_code' not in st.session_state:
    st.session_state.mock_reason_code = "ELIGIBLE"
if 'mock_reason_desc' not in st.session_state:
    st.session_state.mock_reason_desc = "Account meets all criteria for balance transfer."
if 'mock_min_limit' not in st.session_state:
    st.session_state.mock_min_limit = 500.0
if 'mock_max_limit' not in st.session_state:
    st.session_state.mock_max_limit = 15000.0
if 'mock_offers' not in st.session_state:
    st.session_state.mock_offers = [
        {"offerId": "OFFER-0%APR-12M", "apr": 0.0, "promoDurationMonths": 12, "feePercentage": 3.0, "disbursementOptions": ["ACH", "CHECK"]},
        {"offerId": "OFFER-1.9%APR-18M", "apr": 1.9, "promoDurationMonths": 18, "feePercentage": 2.0, "disbursementOptions": ["ACH", "DIRECT_DEPOSIT"]}
    ]

# Load Scenario Helper
def load_scenario(scenario_name):
    sc = SCENARIOS[scenario_name]
    st.session_state.input_auth_header = sc["auth_header"]
    st.session_state.input_client_id = sc["client_id"]
    st.session_state.input_client_details = sc["client_details"]
    st.session_state.input_bt_group = sc["btSupportedAccountGroup"]
    
    st.session_state.mock_eligible = sc["eligible"]
    st.session_state.mock_reason_code = sc["reasonCode"]
    st.session_state.mock_reason_desc = sc["reasonDescription"]
    st.session_state.mock_min_limit = sc["minTransferLimit"]
    st.session_state.mock_max_limit = sc["maxTransferLimit"]
    st.session_state.mock_offers = sc["offers"]
    
    # Clear dynamic offer keys from session state so they get re-initialized
    keys_to_delete = [k for k in st.session_state.keys() if k.startswith("offer_")]
    for k in keys_to_delete:
        del st.session_state[k]

# Request Validation Helper
def validate_request(headers, query_params):
    errors = []
    
    # Validate Authorization
    auth = headers.get("Authorization", "")
    if not auth:
        errors.append("Header 'Authorization' is required and cannot be empty.")
    elif not auth.startswith("Bearer "):
        errors.append("Header 'Authorization' must use the 'Bearer <token>' format.")
        
    # Validate uuid
    uid = headers.get("uuid", "")
    if not uid:
        errors.append("Header 'uuid' is required.")
    else:
        try:
            uuid_tool.UUID(uid)
        except ValueError:
            errors.append("Header 'uuid' must be a valid UUID (v4) format.")
            
    # Validate client_id
    cid = headers.get("client_id", "")
    if not cid:
        errors.append("Header 'client_id' is required.")
        
    # Validate btSupportedAccountGroup
    bt_group = query_params.get("btSupportedAccountGroup", "")
    if not bt_group:
        errors.append("Query parameter 'btSupportedAccountGroup' is required.")
    elif bt_group not in ["CREDIT_CARD", "PERSONAL_LOAN", "ALL"]:
        errors.append(f"Query parameter 'btSupportedAccountGroup' must be one of: CREDIT_CARD, PERSONAL_LOAN, ALL. Received: '{bt_group}'")
        
    return len(errors) == 0, errors

# --- SIDEBAR LAYOUT ---
st.sidebar.header("🚀 Scenario Quick-Loader")
selected_scenario = st.sidebar.selectbox("Choose a pre-configured scenario:", list(SCENARIOS.keys()))
if st.sidebar.button("Load Scenario"):
    load_scenario(selected_scenario)
    st.sidebar.success(f"Loaded: {selected_scenario}")

st.sidebar.markdown("---")
st.sidebar.header("📥 Request Configuration")

# Headers
st.sidebar.subheader("HTTP Headers")
auth_header = st.sidebar.text_input("Authorization", value=st.session_state.input_auth_header, key="input_auth_header")

col_uuid, col_gen = st.sidebar.columns([3, 1])
with col_uuid:
    uuid_header = st.sidebar.text_input("uuid", value=st.session_state.input_uuid, key="input_uuid")
with col_gen:
    st.sidebar.markdown("<div style='height: 28px;'></div>", unsafe_allowed_html=True)
    if st.sidebar.button("🔄 New UUID"):
        st.session_state.input_uuid = str(uuid_tool.uuid4())
        st.rerun()

client_id_header = st.sidebar.text_input("client_id", value=st.session_state.input_client_id, key="input_client_id")
client_details_header = st.sidebar.text_input("clientDetails (Optional)", value=st.session_state.input_client_details, key="input_client_details")

# Query Params
st.sidebar.subheader("Query Parameters")
bt_group_param = st.sidebar.selectbox(
    "btSupportedAccountGroup",
    options=["CREDIT_CARD", "PERSONAL_LOAN", "ALL"],
    index=["CREDIT_CARD", "PERSONAL_LOAN", "ALL"].index(st.session_state.input_bt_group) if st.session_state.input_bt_group in ["CREDIT_CARD", "PERSONAL_LOAN", "ALL"] else 0,
    key="input_bt_group"
)

# --- MAIN PANEL LAYOUT ---
st.title("💳 CardAccountBalanceTransferEligibility API Mock & Client")
st.markdown(
    """
    Welcome to the interactive testing client and mock server for the **CardAccountBalanceTransferEligibility API**.
    This tool allows you to simulate API requests, validate them against the OpenAPI 3.0 schema, and customize mock responses to test various edge cases and scenarios.
    """
)

tab1, tab2, tab3, tab4 = st.tabs([
    "🔌 Interactive Client & Mock Server",
    "⚙️ Mock Response Customizer",
    "📋 OpenAPI Schema & Docs",
    "📜 Request History & Logs"
])

# --- TAB 1: INTERACTIVE CLIENT & MOCK SERVER ---
with tab1:
    st.subheader("🔌 Interactive Client")
    st.markdown("Simulate sending a request to the mock server with the configured headers and query parameters.")
    
    # Construct request details
    request_url = f"https://api.mock-server.local/v1/card-accounts/balance-transfer-eligibility?btSupportedAccountGroup={bt_group_param}"
    request_headers = {
        "Authorization": auth_header,
        "uuid": uuid_header,
        "client_id": client_id_header,
    }
    if client_details_header:
        request_headers["clientDetails"] = client_details_header

    # Display Request Code Block
    st.markdown("### 📤 Outgoing HTTP Request")
    req_col1, req_col2 = st.columns([3, 1])
    with req_col1:
        st.code(
            f"GET {request_url}\n" +
            "\n".join([f"{k}: {v}" for k, v in request_headers.items()]),
            language="http"
        )
    with req_col2:
        st.markdown("<div style='height: 20px;'></div>", unsafe_allowed_html=True)
        send_btn = st.button("⚡ Send Request", type="primary", use_container_width=True)

    if send_btn:
        is_valid, validation_errors = validate_request(request_headers, {"btSupportedAccountGroup": bt_group_param})
        
        response_headers = {
            "Content-Type": "application/json",
            "X-Request-ID": uuid_header,
            "Date": datetime.datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S GMT"),
            "Server": "MockBalanceTransferEligibilityServer/1.0"
        }
        
        if is_valid:
            status_code = 200
            response_body = {
                "eligible": st.session_state.mock_eligible,
                "accountId": "ACC-MOCK-98765",
                "btSupportedAccountGroup": bt_group_param,
                "reasonCode": st.session_state.mock_reason_code,
                "reasonDescription": st.session_state.mock_reason_desc,
                "maxTransferLimit": st.session_state.mock_max_limit if st.session_state.mock_eligible else 0.0,
                "minTransferLimit": st.session_state.mock_min_limit if st.session_state.mock_eligible else 0.0,
                "offers": st.session_state.mock_offers if st.session_state.mock_eligible else []
            }
        else:
            status_code = 400
            response_body = {
                "error": "Bad Request",
                "message": "Validation failed against OpenAPI schema.",
                "details": validation_errors,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            }
            
        st.session_state.last_response = {
            "status_code": status_code,
            "headers": response_headers,
            "body": response_body,
            "is_valid": is_valid,
            "validation_errors": validation_errors
        }
        
        # Save to history
        st.session_state.history.append({
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "method": "GET",
            "endpoint": "/v1/card-accounts/balance-transfer-eligibility",
            "status": status_code,
            "valid": "✅ Valid" if is_valid else "❌ Invalid",
            "errors": ", ".join(validation_errors) if validation_errors else "None"
        })

    # Render Response if available
    if st.session_state.last_response:
        resp = st.session_state.last_response
        status_code = resp["status_code"]
        response_headers = resp["headers"]
        response_body = resp["body"]
        is_valid = resp["is_valid"]
        validation_errors = resp["validation_errors"]
        
        st.markdown("---")
        st.markdown("### 📥 Incoming HTTP Response")

        resp_col1, resp_col2 = st.columns([2, 3])

        with resp_col1:
            st.markdown("#### Response Metadata")
            if status_code == 200:
                st.success(f"Status: {status_code} OK")
            else:
                st.error(f"Status: {status_code} Bad Request")
                
            st.markdown("**Headers:**")
            st.code("\n".join([f"{k}: {v}" for k, v in response_headers.items()]), language="http")

        with resp_col2:
            st.markdown("#### Response Body (JSON)")
            st.json(response_body)
            
        st.markdown("---")
        st.markdown("### 🎨 Visual Response Inspector")

        if status_code == 200:
            if response_body["eligible"]:
                st.success("### 🎉 Account is Eligible for Balance Transfer!")
                
                lim_col1, lim_col2 = st.columns(2)
                with lim_col1:
                    st.metric("Minimum Transfer Limit", f"${response_body['minTransferLimit']:,.2f}")
                with lim_col2:
                    st.metric("Maximum Transfer Limit", f"${response_body['maxTransferLimit']:,.2f}")
                    
                st.markdown("#### Available Offers")
                if not response_body["offers"]:
                    st.info("No promotional offers available for this account group.")
                else:
                    cols = st.columns(len(response_body["offers"]))
                    for idx, offer in enumerate(response_body["offers"]):
                        with cols[idx]:
                            st.markdown(
                                f"""
                                <div style="border: 1px solid #e6e9ef; padding: 20px; border-radius: 10px; background-color: #f8f9fa; margin-bottom: 10px; box-shadow: 1px 1px 5px rgba(0,0,0,0.05);">
                                    <h4 style="color: #1f77b4; margin-top: 0; margin-bottom: 10px;">🏷️ {offer['offerId']}</h4>
                                    <p style="margin: 5px 0;"><b>APR:</b> <span style="font-size: 1.2em; color: #2ca02c; font-weight: bold;">{offer['apr']}%</span></p>
                                    <p style="margin: 5px 0;"><b>Duration:</b> {offer['promoDurationMonths']} Months</p>
                                    <p style="margin: 5px 0;"><b>Transfer Fee:</b> {offer['feePercentage']}%</p>
                                    <p style="margin: 5px 0;"><b>Disbursement:</b> {', '.join(offer['disbursementOptions'])}</p>
                                </div>
                                """,
                                unsafe_allowed_html=True
                            )
            else:
                st.warning("### ⚠️ Account is Not Eligible")
                st.markdown(f"**Reason Code:** `{response_body['reasonCode']}`")
                st.markdown(f"**Description:** {response_body['reasonDescription']}")
        else:
            st.error("### ❌ Request Validation Failed")
            st.markdown("The mock server rejected the request because it did not comply with the OpenAPI specification.")
            for err in validation_errors:
                st.markdown(f"- 🔴 {err}")
    else:
        st.info("💡 Click **⚡ Send Request** to simulate the API call and view the response.")

# --- TAB 2: MOCK RESPONSE CUSTOMIZER ---
with tab2:
    st.subheader("⚙️ Mock Response Customization")
    st.markdown("Configure the response payload returned by the mock server for successful (200 OK) requests.")

    col1, col2 = st.columns(2)
    with col1:
        eligible = st.checkbox("Is Eligible?", value=st.session_state.mock_eligible, key="mock_eligible")
        reason_code = st.text_input("Reason Code", value=st.session_state.mock_reason_code, key="mock_reason_code")
        reason_desc = st.text_area("Reason Description", value=st.session_state.mock_reason_desc, key="mock_reason_desc")

    with col2:
        min_limit = st.number_input("Minimum Transfer Limit ($)", value=float(st.session_state.mock_min_limit), step=50.0, key="mock_min_limit")
        max_limit = st.number_input("Maximum Transfer Limit ($)", value=float(st.session_state.mock_max_limit), step=100.0, key="mock_max_limit")

    st.markdown("---")
    st.subheader("🎁 Balance Transfer Offers")
    st.markdown("Manage the promotional offers returned in the response.")

    # Display existing offers
    offers = st.session_state.mock_offers
    updated_offers = []

    for idx, offer in enumerate(offers):
        with st.expander(f"Offer {idx + 1}: {offer.get('offerId', 'New Offer')}", expanded=True):
            col_id, col_apr, col_dur, col_fee, col_disb, col_del = st.columns([2, 1, 1, 1, 2, 1])
            with col_id:
                o_id = st.text_input(f"Offer ID", value=offer.get("offerId", ""), key=f"offer_id_{idx}")
            with col_apr:
                o_apr = st.number_input(f"APR (%)", value=float(offer.get("apr", 0.0)), step=0.1, key=f"offer_apr_{idx}")
            with col_dur:
                o_dur = st.number_input(f"Duration (Months)", value=int(offer.get("promoDurationMonths", 12)), step=1, key=f"offer_dur_{idx}")
            with col_fee:
                o_fee = st.number_input(f"Fee (%)", value=float(offer.get("feePercentage", 3.0)), step=0.1, key=f"offer_fee_{idx}")
            with col_disb:
                o_disb = st.multiselect(f"Disbursement Options", options=["ACH", "CHECK", "DIRECT_DEPOSIT"], default=offer.get("disbursementOptions", ["ACH"]), key=f"offer_disb_{idx}")
            with col_del:
                st.markdown("<div style='height: 28px;'></div>", unsafe_allowed_html=True)
                delete_clicked = st.button("🗑️ Delete", key=f"offer_del_btn_{idx}")
                
            if not delete_clicked:
                updated_offers.append({
                    "offerId": o_id,
                    "apr": o_apr,
                    "promoDurationMonths": o_dur,
                    "feePercentage": o_fee,
                    "disbursementOptions": o_disb
                })

    st.session_state.mock_offers = updated_offers

    # Add new offer button
    if st.button("➕ Add New Offer"):
        st.session_state.mock_offers.append({
            "offerId": f"OFFER-NEW-{len(st.session_state.mock_offers)+1}",
            "apr": 0.0,
            "promoDurationMonths": 12,
            "feePercentage": 3.0,
            "disbursementOptions": ["ACH"]
        })
        st.rerun()

# --- TAB 3: OPENAPI SCHEMA & DOCS ---
with tab3:
    st.subheader("📋 OpenAPI 3.0.3 Specification")
    st.markdown("This mock server and client are fully compliant with the following OpenAPI schema.")

    # Download button
    schema_json = json.dumps(OPENAPI_SCHEMA, indent=2)
    st.download_button(
        label="📥 Download OpenAPI Schema (JSON)",
        data=schema_json,
        file_name="balance_transfer_eligibility_openapi.json",
        mime="application/json"
    )

    st.markdown("### Schema Viewer")
    st.json(OPENAPI_SCHEMA)

# --- TAB 4: REQUEST HISTORY & LOGS ---
with tab4:
    st.subheader("📜 Request History & Logs")
    st.markdown("Track all requests sent to the mock server during this session.")

    if st.session_state.history:
        df = pd.DataFrame(st.session_state.history)
        st.dataframe(df, use_container_width=True)
        
        if st.button("🗑️ Clear History"):
            st.session_state.history = []
            st.rerun()
    else:
        st.info("No requests have been sent yet. Go to the **Interactive Client** tab to send your first request!")