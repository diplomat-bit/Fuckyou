import streamlit as st
import pandas as pd
import requests
import json
import difflib
import os
import time
import re
from typing import Dict, Any, Tuple, List

# Set page configuration
st.set_page_config(
    page_title="Card API Conformance Analyzer",
    page_icon="🃏",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Define paths
CSV_DIR = "api"
CSV_PATH = os.path.join(CSV_DIR, "card-listing.csv")

# Default Test Cases (CA_001 to CA_018)
DEFAULT_TEST_CASES = [
    {
        "Test Case ID": "CA_001",
        "Name": "Get All Cards",
        "Description": "Retrieve a list of all cards. Expects 200 OK and an array of card objects.",
        "Method": "GET",
        "Path": "/cards",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "array", "items": {"type": "object", "required": ["id", "name", "type", "rarity", "power"]}}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_002",
        "Name": "Get Card by Valid ID",
        "Description": "Retrieve a single card by its valid ID. Expects 200 OK and the card object.",
        "Method": "GET",
        "Path": "/cards/1",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["id", "name", "type", "rarity", "power"]}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_003",
        "Name": "Get Card by Invalid ID",
        "Description": "Attempt to retrieve a card with a non-existent ID. Expects 404 Not Found.",
        "Method": "GET",
        "Path": "/cards/999",
        "Expected Status": 404,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["error"]}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_004",
        "Name": "Create Card - Valid Data",
        "Description": "Create a new card with valid parameters. Expects 201 Created and the created card object.",
        "Method": "POST",
        "Path": "/cards",
        "Expected Status": 201,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["id", "name", "type", "rarity", "power"]}',
        "Request Body": '{"name": "Black Lotus", "type": "Artifact", "rarity": "Rare", "power": 0}'
    },
    {
        "Test Case ID": "CA_005",
        "Name": "Create Card - Missing Required Fields",
        "Description": "Attempt to create a card missing the 'name' field. Expects 400 Bad Request.",
        "Method": "POST",
        "Path": "/cards",
        "Expected Status": 400,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["error"]}',
        "Request Body": '{"type": "Artifact", "rarity": "Rare", "power": 0}'
    },
    {
        "Test Case ID": "CA_006",
        "Name": "Create Card - Invalid Data Types",
        "Description": "Attempt to create a card with an invalid data type (power as string). Expects 400 Bad Request.",
        "Method": "POST",
        "Path": "/cards",
        "Expected Status": 400,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["error"]}',
        "Request Body": '{"name": "Mox Sapphire", "type": "Artifact", "rarity": "Rare", "power": "high"}'
    },
    {
        "Test Case ID": "CA_007",
        "Name": "Update Card - Valid",
        "Description": "Update an existing card with valid parameters. Expects 200 OK and the updated card object.",
        "Method": "PUT",
        "Path": "/cards/1",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["id", "name", "type", "rarity", "power"]}',
        "Request Body": '{"name": "Shivan Dragon (Evolved)", "type": "Creature", "rarity": "Rare", "power": 8}'
    },
    {
        "Test Case ID": "CA_008",
        "Name": "Update Card - Non-existent ID",
        "Description": "Attempt to update a card that does not exist. Expects 404 Not Found.",
        "Method": "PUT",
        "Path": "/cards/999",
        "Expected Status": 404,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["error"]}',
        "Request Body": '{"name": "Ghost Card", "type": "Creature", "rarity": "Common", "power": 1}'
    },
    {
        "Test Case ID": "CA_009",
        "Name": "Delete Card - Valid",
        "Description": "Delete an existing card. Expects 200 OK or 204 No Content.",
        "Method": "DELETE",
        "Path": "/cards/2",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["message"]}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_010",
        "Name": "Delete Card - Non-existent ID",
        "Description": "Attempt to delete a card that does not exist. Expects 404 Not Found.",
        "Method": "DELETE",
        "Path": "/cards/999",
        "Expected Status": 404,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["error"]}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_011",
        "Name": "Filter Cards by Type",
        "Description": "Filter cards by type 'Creature'. Expects 200 OK and a filtered array.",
        "Method": "GET",
        "Path": "/cards?type=Creature",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "array", "items": {"type": "object", "properties": {"type": {"const": "Creature"}}}}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_012",
        "Name": "Filter Cards by Rarity",
        "Description": "Filter cards by rarity 'Rare'. Expects 200 OK and a filtered array.",
        "Method": "GET",
        "Path": "/cards?rarity=Rare",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "array", "items": {"type": "object", "properties": {"rarity": {"const": "Rare"}}}}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_013",
        "Name": "Pagination - Limit and Offset",
        "Description": "Request cards with limit=2 and offset=1. Expects 200 OK and a paginated array.",
        "Method": "GET",
        "Path": "/cards?limit=2&offset=1",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "array"}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_014",
        "Name": "Search Cards by Name",
        "Description": "Search cards containing 'Dragon' in their name. Expects 200 OK and matching array.",
        "Method": "GET",
        "Path": "/cards?search=Dragon",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "array"}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_015",
        "Name": "Header Validation - Missing Accept Header",
        "Description": "Send request with missing Accept header. Expects standard JSON response.",
        "Method": "GET",
        "Path": "/cards",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "array"}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_016",
        "Name": "Rate Limiting Check",
        "Description": "Verify rate limit headers are present in the response.",
        "Method": "GET",
        "Path": "/cards",
        "Expected Status": 200,
        "Expected Headers": '{"X-RateLimit-Limit": "100"}',
        "Expected Schema": '{"type": "array"}',
        "Request Body": ""
    },
    {
        "Test Case ID": "CA_017",
        "Name": "Patch Card - Partial Update",
        "Description": "Partially update a card's power. Expects 200 OK and updated card object.",
        "Method": "PATCH",
        "Path": "/cards/1",
        "Expected Status": 200,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["power"]}',
        "Request Body": '{"power": 10}'
    },
    {
        "Test Case ID": "CA_018",
        "Name": "Invalid HTTP Method",
        "Description": "Attempt to POST to a GET-only endpoint. Expects 405 Method Not Allowed.",
        "Method": "POST",
        "Path": "/cards/1",
        "Expected Status": 405,
        "Expected Headers": '{"Content-Type": "application/json"}',
        "Expected Schema": '{"type": "object", "required": ["error"]}',
        "Request Body": '{"name": "Invalid"}'
    }
]

# Ensure CSV exists
def ensure_csv_exists():
    if not os.path.exists(CSV_DIR):
        os.makedirs(CSV_DIR)
    if not os.path.exists(CSV_PATH):
        df = pd.DataFrame(DEFAULT_TEST_CASES)
        df.to_csv(CSV_PATH, index=False)

ensure_csv_exists()

# Load Test Cases
@st.cache_data(ttl=60)
def load_test_cases() -> pd.DataFrame:
    try:
        df = pd.read_csv(CSV_PATH)
        # Ensure all required columns exist
        required_cols = ["Test Case ID", "Name", "Description", "Method", "Path", "Expected Status", "Expected Headers", "Expected Schema", "Request Body"]
        for col in required_cols:
            if col not in df.columns:
                df[col] = ""
        return df
    except Exception as e:
        st.error(f"Error loading CSV: {e}")
        return pd.DataFrame(DEFAULT_TEST_CASES)

# Mock Database State for Built-in Mock API
if "mock_db" not in st.session_state:
    st.session_state.mock_db = [
        {"id": 1, "name": "Shivan Dragon", "type": "Creature", "rarity": "Rare", "power": 5},
        {"id": 2, "name": "Giant Growth", "type": "Instant", "rarity": "Common", "power": 3},
        {"id": 3, "name": "Counterspell", "type": "Instant", "rarity": "Uncommon", "power": 0},
        {"id": 4, "name": "Black Vise", "type": "Artifact", "rarity": "Uncommon", "power": 1}
    ]

# Reset Mock Database
def reset_mock_db():
    st.session_state.mock_db = [
        {"id": 1, "name": "Shivan Dragon", "type": "Creature", "rarity": "Rare", "power": 5},
        {"id": 2, "name": "Giant Growth", "type": "Instant", "rarity": "Common", "power": 3},
        {"id": 3, "name": "Counterspell", "type": "Instant", "rarity": "Uncommon", "power": 0},
        {"id": 4, "name": "Black Vise", "type": "Artifact", "rarity": "Uncommon", "power": 1}
    ]

# Built-in Mock API Router
class MockAPI:
    def __init__(self, simulate_bugs: List[str] = None):
        self.simulate_bugs = simulate_bugs or []

    def handle_request(self, method: str, path: str, body: str = "", headers: Dict = None) -> Tuple[int, Dict[str, str], Any]:
        # Simulate network latency
        time.sleep(0.05)

        # Parse query params if any
        query_params = {}
        if "?" in path:
            path, query_str = path.split("?", 1)
            for param in query_str.split("&"):
                if "=" in param:
                    k, v = param.split("=", 1)
                    query_params[k] = v

        # Parse body
        parsed_body = {}
        if body:
            try:
                parsed_body = json.loads(body)
            except json.JSONDecodeError:
                return 400, {"Content-Type": "application/json"}, {"error": "Invalid JSON body"}

        # Default Headers
        resp_headers = {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "99",
            "X-RateLimit-Reset": "3600"
        }

        # Bug Simulation: Missing Headers
        if "Missing Headers" in self.simulate_bugs:
            resp_headers.pop("Content-Type", None)
            resp_headers.pop("X-RateLimit-Limit", None)

        # Route matching
        # GET /cards
        if method == "GET" and path == "/cards":
            cards = list(st.session_state.mock_db)

            # Apply filters
            if "type" in query_params:
                cards = [c for c in cards if c["type"].lower() == query_params["type"].lower()]
            if "rarity" in query_params:
                cards = [c for c in cards if c["rarity"].lower() == query_params["rarity"].lower()]
            if "search" in query_params:
                search_term = query_params["search"].lower()
                cards = [c for c in cards if search_term in c["name"].lower()]
            
            # Apply pagination
            if "offset" in query_params:
                try:
                    offset = int(query_params["offset"])
                    cards = cards[offset:]
                except ValueError:
                    pass
            if "limit" in query_params:
                try:
                    limit = int(query_params["limit"])
                    cards = cards[:limit]
                except ValueError:
                    pass

            # Bug Simulation: Invalid Data Types
            if "Invalid Data Types" in self.simulate_bugs:
                cards = [dict(c, power=str(c["power"])) for c in cards]

            return 200, resp_headers, cards

        # GET /cards/{id}
        match_get_id = re.match(r"^/cards/(\d+)$", path)
        if method == "GET" and match_get_id:
            card_id = int(match_get_id.group(1))
            card = next((c for c in st.session_state.mock_db if c["id"] == card_id), None)
            if card:
                # Bug Simulation: Missing JSON Fields
                if "Missing JSON Fields" in self.simulate_bugs:
                    card_copy = dict(card)
                    card_copy.pop("rarity", None)
                    return 200, resp_headers, card_copy
                
                return 200, resp_headers, card
            return 404, resp_headers, {"error": f"Card with ID {card_id} not found"}

        # POST /cards
        if method == "POST" and path == "/cards":
            # Validation
            if "name" not in parsed_body or "type" not in parsed_body:
                return 400, resp_headers, {"error": "Missing required fields: name, type"}
            
            # Check data types
            if not isinstance(parsed_body.get("power", 0), int) and "Invalid Data Types" not in self.simulate_bugs:
                return 400, resp_headers, {"error": "Field 'power' must be an integer"}

            new_id = max([c["id"] for c in st.session_state.mock_db], default=0) + 1
            new_card = {
                "id": new_id,
                "name": parsed_body["name"],
                "type": parsed_body["type"],
                "rarity": parsed_body.get("rarity", "Common"),
                "power": parsed_body.get("power", 0)
            }
            st.session_state.mock_db.append(new_card)

            # Bug Simulation: Wrong Status Codes
            if "Wrong Status Codes" in self.simulate_bugs:
                return 200, resp_headers, new_card

            return 201, resp_headers, new_card

        # PUT /cards/{id}
        match_put_id = re.match(r"^/cards/(\d+)$", path)
        if method == "PUT" and match_put_id:
            card_id = int(match_put_id.group(1))
            card_idx = next((i for i, c in enumerate(st.session_state.mock_db) if c["id"] == card_id), None)
            if card_idx is not None:
                updated_card = {
                    "id": card_id,
                    "name": parsed_body.get("name", st.session_state.mock_db[card_idx]["name"]),
                    "type": parsed_body.get("type", st.session_state.mock_db[card_idx]["type"]),
                    "rarity": parsed_body.get("rarity", st.session_state.mock_db[card_idx]["rarity"]),
                    "power": parsed_body.get("power", st.session_state.mock_db[card_idx]["power"])
                }
                st.session_state.mock_db[card_idx] = updated_card
                return 200, resp_headers, updated_card
            return 404, resp_headers, {"error": f"Card with ID {card_id} not found"}

        # PATCH /cards/{id}
        match_patch_id = re.match(r"^/cards/(\d+)$", path)
        if method == "PATCH" and match_patch_id:
            card_id = int(match_patch_id.group(1))
            card_idx = next((i for i, c in enumerate(st.session_state.mock_db) if c["id"] == card_id), None)
            if card_idx is not None:
                for k, v in parsed_body.items():
                    if k in st.session_state.mock_db[card_idx]:
                        st.session_state.mock_db[card_idx][k] = v
                return 200, resp_headers, st.session_state.mock_db[card_idx]
            return 404, resp_headers, {"error": f"Card with ID {card_id} not found"}

        # DELETE /cards/{id}
        match_delete_id = re.match(r"^/cards/(\d+)$", path)
        if method == "DELETE" and match_delete_id:
            card_id = int(match_delete_id.group(1))
            card = next((c for c in st.session_state.mock_db if c["id"] == card_id), None)
            if card:
                st.session_state.mock_db = [c for c in st.session_state.mock_db if c["id"] != card_id]
                return 200, resp_headers, {"message": f"Card {card_id} deleted successfully"}
            return 404, resp_headers, {"error": f"Card with ID {card_id} not found"}

        # Invalid HTTP Method on specific endpoints
        if path.startswith("/cards/") and method not in ["GET", "PUT", "PATCH", "DELETE"]:
            return 405, resp_headers, {"error": "Method Not Allowed"}

        return 404, resp_headers, {"error": "Endpoint not found"}

# Validation Engine
def validate_response(
    expected_status: int,
    expected_headers: Dict[str, str],
    expected_schema: Dict[str, Any],
    actual_status: int,
    actual_headers: Dict[str, str],
    actual_body: Any
) -> Tuple[bool, List[str], str]:
    
    errors = []
    
    # 1. Validate Status Code
    if actual_status != expected_status:
        errors.append(f"Status Code Mismatch: Expected {expected_status}, got {actual_status}")

    # 2. Validate Headers
    for k, v in expected_headers.items():
        actual_val = actual_headers.get(k) or actual_headers.get(k.lower())
        if not actual_val:
            errors.append(f"Missing Expected Header: '{k}'")
        elif v.lower() not in actual_val.lower():
            errors.append(f"Header Value Mismatch for '{k}': Expected to contain '{v}', got '{actual_val}'")

    # 3. Validate JSON Structure / Schema (Lightweight custom validator)
    schema_type = expected_schema.get("type")
    
    if schema_type == "array":
        if not isinstance(actual_body, list):
            errors.append(f"Schema Mismatch: Expected JSON Array, got {type(actual_body).__name__}")
        else:
            # Validate items if specified
            items_schema = expected_schema.get("items", {})
            if items_schema:
                req_fields = items_schema.get("required", [])
                properties = items_schema.get("properties", {})
                for idx, item in enumerate(actual_body):
                    if not isinstance(item, dict):
                        errors.append(f"Schema Mismatch: Array item at index {idx} is not an object")
                        continue
                    for field in req_fields:
                        if field not in item:
                            errors.append(f"Schema Mismatch: Array item at index {idx} missing required field '{field}'")
                    for prop_k, prop_v in properties.items():
                        if prop_k in item:
                            if "const" in prop_v and item[prop_k] != prop_v["const"]:
                                errors.append(f"Schema Mismatch: Array item at index {idx} field '{prop_k}' expected const '{prop_v['const']}', got '{item[prop_k]}'")

    elif schema_type == "object":
        if not isinstance(actual_body, dict):
            errors.append(f"Schema Mismatch: Expected JSON Object, got {type(actual_body).__name__}")
        else:
            req_fields = expected_schema.get("required", [])
            for field in req_fields:
                if field not in actual_body:
                    errors.append(f"Schema Mismatch: Missing required field '{field}'")

    # Generate Diff
    expected_json_str = json.dumps(actual_body, indent=2) # Default to actual for baseline
    # Create a mock "perfect" response for diffing based on schema
    perfect_mock = {}
    if schema_type == "object":
        perfect_mock = {f: "<present>" for f in expected_schema.get("required", [])}
        if "error" in perfect_mock:
            perfect_mock["error"] = "Error message details"
    elif schema_type == "array":
        perfect_mock = [{f: "<present>" for f in expected_schema.get("items", {}).get("required", [])}]

    perfect_json_str = json.dumps(perfect_mock, indent=2)
    actual_json_str = json.dumps(actual_body, indent=2)

    diff = list(difflib.unified_diff(
        perfect_json_str.splitlines(),
        actual_json_str.splitlines(),
        fromfile="Expected Schema Template",
        tofile="Actual Response JSON",
        lineterm=""
    ))
    diff_str = "\n".join(diff)

    return len(errors) == 0, errors, diff_str

# Streamlit UI Layout
st.title("🃏 Card API Conformance Analyzer")
st.markdown("""
This tool executes a comprehensive conformance test suite (**CA_001 to CA_018**) against a target Card API.
It validates status codes, headers, and JSON response structures, providing detailed diffs and compliance reports.
""")

# Sidebar Configuration
st.sidebar.header("⚙️ Test Runner Configuration")

target_type = st.sidebar.radio(
    "Target API Endpoint",
    ["Built-in Mock API", "External API URL"]
)

external_url = ""
custom_headers_str = "{}"
simulate_bugs = []

if target_type == "Built-in Mock API":
    st.sidebar.info("Using the built-in mock card database. You can inject bugs to test the analyzer's detection capabilities!")
    simulate_bugs = st.sidebar.multiselect(
        "Inject Bugs / Non-Conformance",
        ["Wrong Status Codes", "Missing JSON Fields", "Invalid Data Types", "Missing Headers"],
        help="Select which non-conforming behaviors the mock API should exhibit."
    )
    if st.sidebar.button("🔄 Reset Mock Database"):
        reset_mock_db()
        st.sidebar.success("Mock database reset!")
else:
    external_url = st.sidebar.text_input("Base URL", "http://localhost:8000/api")
    custom_headers_str = st.sidebar.text_area("Custom Headers (JSON)", "{\n  \"Authorization\": \"Bearer test-token\"\n}")

# Load test cases
test_cases_df = load_test_cases()

# Tabs
tab_runner, tab_spec, tab_sandbox = st.tabs(["🚀 Test Runner & Dashboard", "📋 Test Suite Specification", "🧪 Mock API Sandbox"])

# --- TAB 1: RUNNER & DASHBOARD ---
with tab_runner:
    col_run, col_stats = st.columns([1, 3])
    
    with col_run:
        st.subheader("Execution Control")
        run_all = st.button("▶️ Run Full Conformance Suite", type="primary", use_container_width=True)
        
        selected_test_to_run = st.selectbox(
            "Or Run Single Test Case",
            ["None"] + test_cases_df["Test Case ID"].tolist()
        )
        run_single = st.button("▶️ Run Selected Test", use_container_width=True)

    # Execution Logic
    results = []
    to_run = []
    
    if run_all:
        to_run = test_cases_df.to_dict(orient="records")
    elif run_single and selected_test_to_run != "None":
        to_run = test_cases_df[test_cases_df["Test Case ID"] == selected_test_to_run].to_dict(orient="records")

    if to_run:
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        mock_api = MockAPI(simulate_bugs=simulate_bugs)
        
        for idx, tc in enumerate(to_run):
            status_text.text(f"Executing {tc['Test Case ID']}: {tc['Name']}...")
            
            # Prepare Request
            method = tc["Method"]
            path = tc["Path"]
            body = tc["Request Body"] if pd.notna(tc["Request Body"]) else ""
            
            # Parse expected headers & schema
            try:
                expected_headers = json.loads(tc["Expected Headers"]) if pd.notna(tc["Expected Headers"]) else {}
            except:
                expected_headers = {}
                
            try:
                expected_schema = json.loads(tc["Expected Schema"]) if pd.notna(tc["Expected Schema"]) else {}
            except:
                expected_schema = {}

            actual_status = 0
            actual_headers = {}
            actual_body = None
            error_msg = ""
            
            start_time = time.time()
            
            if target_type == "Built-in Mock API":
                # Execute via Mock Router
                actual_status, actual_headers, actual_body = mock_api.handle_request(method, path, body)
            else:
                # Execute via HTTP Request
                url = f"{external_url.rstrip('/')}{path}"
                try:
                    req_headers = {}
                    if custom_headers_str:
                        req_headers = json.loads(custom_headers_str)
                    
                    resp = requests.request(
                        method=method,
                        url=url,
                        headers=req_headers,
                        data=body,
                        timeout=5
                    )
                    actual_status = resp.status_code
                    actual_headers = dict(resp.headers)
                    try:
                        actual_body = resp.json()
                    except:
                        actual_body = resp.text
                except Exception as e:
                    error_msg = str(e)
                    actual_status = 0
                    actual_headers = {}
                    actual_body = {"error": f"Failed to connect to external API: {error_msg}"}
            
            latency = (time.time() - start_time) * 1000
            
            # Validate
            passed, val_errors, diff_str = validate_response(
                expected_status=int(tc["Expected Status"]),
                expected_headers=expected_headers,
                expected_schema=expected_schema,
                actual_status=actual_status,
                actual_headers=actual_headers,
                actual_body=actual_body
            )
            
            results.append({
                "id": tc["Test Case ID"],
                "name": tc["Name"],
                "description": tc["Description"],
                "method": method,
                "path": path,
                "body": body,
                "expected_status": tc["Expected Status"],
                "actual_status": actual_status,
                "passed": passed,
                "errors": val_errors,
                "diff": diff_str,
                "actual_body": actual_body,
                "actual_headers": actual_headers,
                "latency": latency
            })
            
            progress_bar.progress((idx + 1) / len(to_run))
            
        status_text.text("Execution complete!")
        st.session_state.last_results = results
        progress_bar.empty()

    # Display Results Dashboard
    if "last_results" in st.session_state and st.session_state.last_results:
        res_list = st.session_state.last_results
        total = len(res_list)
        passed_count = sum(1 for r in res_list if r["passed"])
        failed_count = total - passed_count
        score = (passed_count / total) * 100 if total > 0 else 0
        
        with col_stats:
            st.subheader("Conformance Scorecard")
            m_col1, m_col2, m_col3, m_col4 = st.columns(4)
            m_col1.metric("Total Executed", total)
            m_col2.metric("Passed", passed_count, delta=f"{passed_count} tests" if passed_count > 0 else None)
            m_col3.metric("Failed", failed_count, delta=f"-{failed_count} tests" if failed_count > 0 else None, delta_color="inverse")
            m_col4.metric("Conformance Score", f"{score:.1f}%")
            
            # Progress bar visual
            st.progress(score / 100)

        st.markdown("---")
        st.subheader("Detailed Test Execution Logs")
        
        for r in res_list:
            status_icon = "✅ PASS" if r["passed"] else "❌ FAIL"
            status_color = "green" if r["passed"] else "red"
            
            with st.expander(f"**{r['id']} - {r['name']}** | {r['method']} {r['path']} | :{status_color}[{status_icon}] ({r['latency']:.1f}ms)"):
                st.markdown(f"**Description:** {r['description']}")
                
                col_req, col_resp = st.columns(2)
                
                with col_req:
                    st.markdown("### 📤 Request Details")
                    st.code(f"{r['method']} {r['path']}\nHeaders: {custom_headers_str if target_type != 'Built-in Mock API' else 'Built-in Mock'}")
                    if r["body"]:
                        st.markdown("**Request Body:**")
                        st.json(r["body"])
                        
                with col_resp:
                    st.markdown("### 📥 Response Details")
                    st.markdown(f"**Status Code:** {r['actual_status']} (Expected: {r['expected_status']})")
                    st.markdown("**Headers:**")
                    st.json(r["actual_headers"])
                    st.markdown("**Response Body:**")
                    st.json(r["actual_body"])

                if not r["passed"]:
                    st.markdown("### ⚠️ Validation Failures")
                    for err in r["errors"]:
                        st.error(err)
                    
                    st.markdown("### 🔍 Schema Diff (Unified Diff)")
                    st.code(r["diff"], language="diff")
                else:
                    st.success("All assertions passed! Status code, headers, and JSON schema conform perfectly.")
                    
        # Export Report
        st.markdown("---")
        st.subheader("Export Conformance Report")
        report_data = []
        for r in res_list:
            report_data.append({
                "Test Case ID": r["id"],
                "Name": r["name"],
                "Method": r["method"],
                "Path": r["path"],
                "Status": "PASS" if r["passed"] else "FAIL",
                "Latency (ms)": round(r["latency"], 2),
                "Errors": "; ".join(r["errors"])
            })
        report_df = pd.DataFrame(report_data)
        
        csv_report = report_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Conformance Report (CSV)",
            data=csv_report,
            file_name=f"conformance_report_{int(time.time())}.csv",
            mime="text/csv"
        )
    else:
        with col_stats:
            st.info("👈 Click 'Run Full Conformance Suite' or select a single test case to begin analysis.")

# --- TAB 2: TEST SUITE SPECIFICATION ---
with tab_spec:
    st.subheader("Parsed Test Cases (CA_001 to CA_018)")
    st.markdown("These test cases are loaded directly from `api/card-listing.csv`.")
    
    # Display editable dataframe or standard table
    st.dataframe(
        test_cases_df,
        use_container_width=True,
        column_config={
            "Expected Headers": st.column_config.TextColumn(width="medium"),
            "Expected Schema": st.column_config.TextColumn(width="large"),
            "Request Body": st.column_config.TextColumn(width="medium")
        }
    )
    
    st.markdown("### 📝 Edit Test Suite Specification")
    st.markdown("You can modify the test cases below and save them back to the CSV file.")
    
    edited_df = st.data_editor(
        test_cases_df,
        num_rows="dynamic",
        use_container_width=True,
        key="test_cases_editor"
    )
    
    if st.button("💾 Save Changes to api/card-listing.csv"):
        try:
            edited_df.to_csv(CSV_PATH, index=False)
            st.success("Successfully saved changes to api/card-listing.csv!")
            st.cache_data.clear()
        except Exception as e:
            st.error(f"Failed to save changes: {e}")

# --- TAB 3: MOCK API SANDBOX ---
with tab_sandbox:
    st.subheader("🧪 Interactive Mock API Sandbox")
    st.markdown("Manually test and query the built-in Mock Card API to inspect its behavior.")
    
    col_sb_req, col_sb_resp = st.columns(2)
    
    with col_sb_req:
        st.markdown("### Request Builder")
        sb_method = st.selectbox("HTTP Method", ["GET", "POST", "PUT", "PATCH", "DELETE"])
        sb_path = st.text_input("Endpoint Path", "/cards")
        sb_body = st.text_area("JSON Body (for POST/PUT/PATCH)", "{\n  \"name\": \"Ancestral Recall\",\n  \"type\": \"Instant\",\n  \"rarity\": \"Rare\",\n  \"power\": 3\n}")
        
        send_req = st.button("🚀 Send Request", type="primary")
        
    with col_sb_resp:
        st.markdown("### Response")
        if send_req:
            sandbox_api = MockAPI(simulate_bugs=simulate_bugs)
            sb_status, sb_headers, sb_body_res = sandbox_api.handle_request(sb_method, sb_path, sb_body)
            
            st.markdown(f"**Status Code:** `{sb_status}`")
            st.markdown("**Headers:**")
            st.json(sb_headers)
            st.markdown("**Body:**")
            st.json(sb_body_res)
        else:
            st.info("Configure the request and click 'Send Request' to see the response.")
            
    st.markdown("---")
    st.subheader("📦 Current Mock Database State")
    st.dataframe(pd.DataFrame(st.session_state.mock_db), use_container_width=True)