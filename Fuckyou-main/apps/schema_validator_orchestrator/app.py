import streamlit as st
import json
import yaml
import jsonschema
from jsonschema import Draft7Validator, exceptions
import requests
import re
from typing import Dict, Any, Tuple, List, Optional

# Set page configuration
st.set_page_config(
    page_title="Schema Validator & Orchestrator Suite",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- MOCK SCHEMAS & FALLBACKS ---
# These ensure the app is fully functional offline or if external URLs are blocked.
MOCK_SCHEMAS = {
    "Docker Compose (Simplified)": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Docker Compose",
        "type": "object",
        "properties": {
            "version": {"type": "string", "pattern": "^[23](\\.[0-9]+)?$"},
            "services": {
                "type": "object",
                "additionalProperties": {
                    "type": "object",
                    "properties": {
                        "image": {"type": "string"},
                        "ports": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "pattern": "^[0-9]+:[0-9]+$"
                            }
                        },
                        "environment": {
                            "oneOf": [
                                {
                                    "type": "object",
                                    "additionalProperties": {"type": ["string", "number", "boolean", "null"]}
                                },
                                {
                                    "type": "array",
                                    "items": {"type": "string"}
                                }
                            ]
                        },
                        "volumes": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "restart": {"type": "string", "enum": ["no", "always", "on-failure", "unless-stopped"]}
                    },
                    "required": ["image"]
                }
            },
            "volumes": {
                "type": "object"
            }
        },
        "required": ["version", "services"]
    },
    "GitHub Actions Workflow (Simplified)": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "GitHub Actions Workflow",
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "on": {
                "oneOf": [
                    {"type": "string", "enum": ["push", "pull_request", "workflow_dispatch"]},
                    {"type": "array", "items": {"type": "string"}},
                    {
                        "type": "object",
                        "properties": {
                            "push": {"type": ["object", "null"]},
                            "pull_request": {"type": ["object", "null"]},
                            "workflow_dispatch": {"type": ["object", "null"]}
                        },
                        "additionalProperties": False
                    }
                ]
            },
            "jobs": {
                "type": "object",
                "additionalProperties": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "runs-on": {"type": "string", "enum": ["ubuntu-latest", "windows-latest", "macos-latest"]},
                        "steps": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "uses": {"type": "string"},
                                    "run": {"type": "string"},
                                    "with": {"type": "object"}
                                },
                                "additionalProperties": True
                            }
                        }
                    },
                    "required": ["runs-on", "steps"]
                }
            }
        },
        "required": ["on", "jobs"]
    },
    "Kubernetes Deployment (Simplified)": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Kubernetes Deployment",
        "type": "object",
        "properties": {
            "apiVersion": {"type": "string", "enum": ["apps/v1"]},
            "kind": {"type": "string", "enum": ["Deployment"]},
            "metadata": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "labels": {"type": "object"}
                },
                "required": ["name"]
            },
            "spec": {
                "type": "object",
                "properties": {
                    "replicas": {"type": "integer", "minimum": 1},
                    "selector": {
                        "type": "object",
                        "properties": {
                            "matchLabels": {"type": "object"}
                        },
                        "required": ["matchLabels"]
                    },
                    "template": {
                        "type": "object",
                        "properties": {
                            "metadata": {"type": "object"},
                            "spec": {
                                "type": "object",
                                "properties": {
                                    "containers": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": {"type": "string"},
                                                "image": {"type": "string"},
                                                "ports": {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "object",
                                                        "properties": {
                                                            "containerPort": {"type": "integer"}
                                                        },
                                                        "required": ["containerPort"]
                                                    }
                                                }
                                            },
                                            "required": ["name", "image"]
                                        }
                                    }
                                },
                                "required": ["containers"]
                            }
                        },
                        "required": ["spec"]
                    }
                },
                "required": ["selector", "template"]
            }
        },
        "required": ["apiVersion", "kind", "metadata", "spec"]
    },
    "App Configuration Schema": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "App Configuration",
        "type": "object",
        "properties": {
            "appName": {"type": "string", "minLength": 3, "maxLength": 50},
            "environment": {"type": "string", "enum": ["development", "staging", "production"]},
            "port": {"type": "integer", "minimum": 80, "maximum": 65535},
            "debug": {"type": "boolean"},
            "database": {
                "type": "object",
                "properties": {
                    "host": {"type": "string"},
                    "port": {"type": "integer"},
                    "username": {"type": "string"},
                    "password": {"type": "string"},
                    "ssl": {"type": "boolean"}
                },
                "required": ["host", "port", "username"]
            },
            "features": {
                "type": "array",
                "items": {"type": "string"}
            }
        },
        "required": ["appName", "environment", "port"]
    }
}

SCHEMA_CATALOG = [
    {
        "name": "Docker Compose",
        "url": "https://raw.githubusercontent.com/compose-spec/compose-spec/master/schema/compose-spec.json",
        "fallback_key": "Docker Compose (Simplified)",
        "patterns": [r"docker-compose\.ya?ml", r"compose\.ya?ml"]
    },
    {
        "name": "GitHub Actions Workflow",
        "url": "https://json.schemastore.org/github-workflow.json",
        "fallback_key": "GitHub Actions Workflow (Simplified)",
        "patterns": [r"\.github/workflows/.*\.ya?ml", r"workflow\.ya?ml"]
    },
    {
        "name": "Kubernetes Deployment",
        "url": "https://raw.githubusercontent.com/instrumenta/kubernetes-json-schema/master/v1.18.0/deployment-apps-v1.json",
        "fallback_key": "Kubernetes Deployment (Simplified)",
        "patterns": [r"deployment\.ya?ml", r"k8s-deploy\.ya?ml", r"k8s\.ya?ml"]
    },
    {
        "name": "App Configuration",
        "url": "",
        "fallback_key": "App Configuration Schema",
        "patterns": [r"config\.json", r"config\.ya?ml", r"appsettings\.json"]
    }
]

# --- HELPER FUNCTIONS ---

def fetch_schema(catalog_item: Dict[str, Any]) -> Tuple[Dict[str, Any], str]:
    """Fetches schema from URL with robust fallback to mock schemas."""
    url = catalog_item.get("url")
    fallback_key = catalog_item.get("fallback_key")
    
    if not url:
        return MOCK_SCHEMAS[fallback_key], "Loaded local/mock schema (No URL defined)."
        
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json(), f"Successfully fetched schema from: {url}"
        else:
            return MOCK_SCHEMAS[fallback_key], f"Failed to fetch from URL (HTTP {response.status_code}). Loaded fallback schema."
    except Exception as e:
        return MOCK_SCHEMAS[fallback_key], f"Network error: {str(e)}. Loaded fallback schema."

def detect_schema_by_filename(filename: str) -> Optional[Dict[str, Any]]:
    """Detects schema from catalog based on filename regex patterns."""
    for item in SCHEMA_CATALOG:
        for pattern in item["patterns"]:
            if re.search(pattern, filename, re.IGNORECASE):
                return item
    return None

def parse_payload(content: str, file_type: str) -> Tuple[Optional[Any], Optional[str]]:
    """Parses JSON or YAML content safely."""
    if not content.strip():
        return None, "Content is empty."
    try:
        if file_type == "JSON":
            return json.loads(content), None
        else:
            return yaml.safe_load(content), None
    except json.JSONDecodeError as je:
        return None, f"JSON Parsing Error: {str(je)}"
    except yaml.YAMLError as ye:
        return None, f"YAML Parsing Error: {str(ye)}"
    except Exception as e:
        return None, f"Parsing Error: {str(e)}"

def format_path(path_deque) -> str:
    """Formats validation error path into a readable JSON path."""
    path_list = list(path_deque)
    if not path_list:
        return "root"
    formatted = "$"
    for item in path_list:
        if isinstance(item, int):
            formatted += f"[{item}]"
        else:
            formatted += f".{item}"
    return formatted

def generate_suggestion(error: jsonschema.ValidationError) -> str:
    """Generates helpful suggestions based on validation error types."""
    validator_type = error.validator
    path = format_path(error.absolute_path)
    
    if validator_type == "required":
        missing = list(error.validator_value)
        # Filter out missing fields that are actually missing
        actual_missing = [m for m in missing if m not in error.instance]
        return f"Add the missing required field(s): {', '.join(f'`{m}`' for m in actual_missing)} at `{path}`."
    elif validator_type == "type":
        return f"Change the value type at `{path}` to `{error.validator_value}`. Current value is of type `{type(error.instance).__name__}`."
    elif validator_type == "enum":
        allowed = ", ".join([f"'{x}'" for x in error.validator_value])
        return f"Change the value at `{path}` to one of the allowed options: [{allowed}]."
    elif validator_type == "pattern":
        return f"Ensure the value at `{path}` matches the regular expression pattern: `{error.validator_value}`."
    elif validator_type == "additionalProperties" and not error.validator_value:
        # Find which properties are extra
        return f"Remove unexpected property/properties at `{path}`. Extra fields are not allowed by this schema."
    elif validator_type == "minimum":
        return f"Increase the value at `{path}` to be at least `{error.validator_value}`."
    elif validator_type == "maximum":
        return f"Decrease the value at `{path}` to be at most `{error.validator_value}`."
    elif validator_type == "minLength":
        return f"Increase the length of the text at `{path}` to be at least {error.validator_value} characters."
    elif validator_type == "maxLength":
        return f"Decrease the length of the text at `{path}` to be at most {error.validator_value} characters."
    
    return f"Verify that the value at `{path}` complies with the `{validator_type}` rule defined in the schema."

def validate_payload(payload: Any, schema: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Validates payload against schema and returns structured error details."""
    errors = []
    try:
        validator = Draft7Validator(schema)
        for error in validator.iter_errors(payload):
            errors.append({
                "message": error.message,
                "path": format_path(error.absolute_path),
                "rule": error.validator,
                "expected": str(error.validator_value),
                "suggestion": generate_suggestion(error)
            })
    except Exception as e:
        errors.append({
            "message": f"Schema compilation/validation engine error: {str(e)}",
            "path": "root",
            "rule": "system",
            "expected": "N/A",
            "suggestion": "Check if the schema itself is valid Draft-07 JSON Schema."
        })
    return errors

# --- STREAMLIT UI ---

st.title("🛡️ Schema Validator & Orchestrator Suite")
st.markdown("An enterprise-grade orchestration tool to validate, explore, evolve, and build JSON/YAML configurations against standard and custom schemas.")

# Sidebar Navigation for 4 Apps
app_mode = sidebar_selection = st.sidebar.radio(
    "Select Application Tool",
    [
        "1. Multi-Schema Validator (Core)",
        "2. Schema Catalog Explorer & Template Generator",
        "3. Schema Evolution & Compatibility Analyzer",
        "4. Custom Rule Orchestrator & Schema Builder"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    "💡 **Tip:** This suite supports both JSON and YAML formats. "
    "It automatically falls back to offline mock schemas if external registries are unreachable."
)

# ==========================================
# APP 1: MULTI-SCHEMA VALIDATOR (CORE)
# ==========================================
if app_mode == "1. Multi-Schema Validator (Core)":
    st.header("🔍 Multi-Schema Validator & Auto-Detector")
    st.markdown("Upload a configuration file or paste content. The system will auto-detect the schema or let you select one manually.")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("1. Input Configuration")
        uploaded_file = st.file_uploader("Upload Config File (JSON or YAML)", type=["json", "yaml", "yml"])
        
        # Auto-detection logic
        detected_catalog_item = None
        if uploaded_file:
            detected_catalog_item = detect_schema_by_filename(uploaded_file.name)
            if detected_catalog_item:
                st.success(f"🎯 Auto-detected schema: **{detected_catalog_item['name']}** based on filename `{uploaded_file.name}`")
            else:
                st.info("ℹ️ Filename didn't match auto-detect patterns. Please select schema manually below.")

        # Manual Schema Selection
        schema_names = [item["name"] for item in SCHEMA_CATALOG] + ["Custom Schema (Paste URL/JSON)"]
        default_index = 0
        if detected_catalog_item:
            default_index = schema_names.index(detected_catalog_item["name"])
            
        selected_schema_name = st.selectbox("Select Target Schema", schema_names, index=default_index)

        # Handle Custom Schema Input
        custom_schema_json = None
        if selected_schema_name == "Custom Schema (Paste URL/JSON)":
            custom_mode = st.radio("Custom Schema Source", ["Paste JSON Schema", "Fetch from URL"])
            if custom_mode == "Paste JSON Schema":
                custom_schema_str = st.text_area("Paste JSON Schema here", height=200, value='{\n  "type": "object"\n}')
                try:
                    custom_schema_json = json.loads(custom_schema_str)
                except Exception as e:
                    st.error(f"Invalid Custom Schema JSON: {str(e)}")
            else:
                custom_url = st.text_input("Enter Schema URL", value="https://json.schemastore.org/composer.json")
                if custom_url:
                    try:
                        res = requests.get(custom_url, timeout=5)
                        custom_schema_json = res.json()
                        st.success("Successfully fetched custom schema!")
                    except Exception as e:
                        st.error(f"Failed to fetch custom schema: {str(e)}")

        # Input Payload Area
        input_format = st.radio("Input Format", ["YAML", "JSON"], horizontal=True)
        
        default_payload = ""
        if uploaded_file:
            try:
                default_payload = uploaded_file.read().decode("utf-8")
            except Exception as e:
                st.error(f"Error reading file: {str(e)}")
        else:
            if selected_schema_name == "Docker Compose":
                default_payload = "version: '3'\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - \"80:80\"\n    restart: always"
            elif selected_schema_name == "GitHub Actions Workflow":
                default_payload = "name: CI\non: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Checkout\n        uses: actions/checkout@v2"
            elif selected_schema_name == "Kubernetes Deployment":
                default_payload = "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:1.14.2\n        ports:\n        - containerPort: 80"
            else:
                default_payload = "appName: MyAwesomeApp\nenvironment: production\nport: 8080\ndebug: false\ndatabase:\n  host: localhost\n  port: 5432\n  username: admin"

        payload_content = st.text_area("Configuration Payload", value=default_payload, height=300)

    with col2:
        st.subheader("2. Validation Results")
        
        # Resolve Schema
        active_schema = None
        schema_status = ""
        
        if selected_schema_name == "Custom Schema (Paste URL/JSON)":
            active_schema = custom_schema_json
            schema_status = "Using user-provided custom schema."
        else:
            catalog_item = next(item for item in SCHEMA_CATALOG if item["name"] == selected_schema_name)
            active_schema, schema_status = fetch_schema(catalog_item)
            
        st.caption(f"**Schema Status:** {schema_status}")
        
        if not active_schema:
            st.warning("Please provide a valid schema to begin validation.")
        else:
            # Parse Payload
            parsed_payload, parse_error = parse_payload(payload_content, input_format)
            
            if parse_error:
                st.error(f"❌ **Parsing Failed!**\n{parse_error}")
            else:
                st.success("✅ **Syntax Check Passed!** (Valid JSON/YAML syntax)")
                
                # Validate
                validation_errors = validate_payload(parsed_payload, active_schema)
                
                if not validation_errors:
                    st.balloons()
                    st.success("🎉 **Validation Successful!** The configuration perfectly matches the schema rules.")
                    st.json(parsed_payload)
                else:
                    st.error(f"❌ **Validation Failed!** Found {len(validation_errors)} error(s).")
                    
                    # Display structured errors
                    for idx, err in enumerate(validation_errors):
                        with st.expander(f"Error #{idx+1}: {err['path']} - {err['rule']}", expanded=True):
                            st.markdown(f"**Message:** {err['message']}")
                            st.markdown(f"**JSON Path:** `{err['path']}`")
                            st.markdown(f"**Rule Violated:** `{err['rule']}` (Expected: `{err['expected']}`)")
                            st.info(f"💡 **Suggestion:** {err['suggestion']}")

# ==========================================
# APP 2: SCHEMA CATALOG EXPLORER & TEMPLATE GENERATOR
# ==========================================
elif app_mode == "2. Schema Catalog Explorer & Template Generator":
    st.header("🗂️ Schema Catalog Explorer & Template Generator")
    st.markdown("Browse the built-in schema catalog, inspect schema definitions, and generate valid starter templates.")

    selected_catalog_name = st.selectbox("Select Schema to Explore", [item["name"] for item in SCHEMA_CATALOG])
    catalog_item = next(item for item in SCHEMA_CATALOG if item["name"] == selected_catalog_name)
    
    schema_json, status_msg = fetch_schema(catalog_item)
    
    st.info(status_msg)
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Schema Metadata & Structure")
        st.markdown(f"**Title:** {schema_json.get('title', 'N/A')}")
        st.markdown(f"**Schema Draft:** {schema_json.get('$schema', 'N/A')}")
        st.markdown(f"**Description:** {schema_json.get('description', 'No description provided.')}")
        
        # Show properties
        properties = schema_json.get("properties", {})
        required_fields = schema_json.get("required", [])
        
        st.markdown("### Properties Defined:")
        prop_data = []
        for prop, details in properties.items():
            prop_type = details.get("type", "any")
            is_req = "Yes" if prop in required_fields else "No"
            desc = details.get("description", "")
            prop_data.append({"Property": prop, "Type": str(prop_type), "Required": is_req, "Description": desc})
            
        st.dataframe(prop_data, use_container_width=True)

    with col2:
        st.subheader("Starter Template Generator")
        output_format = st.radio("Template Format", ["YAML", "JSON"], key="template_fmt")
        
        # Generate a basic template based on schema properties
        template_obj = {}
        for prop, details in properties.items():
            prop_type = details.get("type")
            
            # Assign default values based on type
            if prop_type == "string":
                if "enum" in details:
                    template_obj[prop] = details["enum"][0]
                else:
                    template_obj[prop] = f"sample_{prop}"
            elif prop_type == "integer" or prop_type == "number":
                template_obj[prop] = details.get("minimum", 1)
            elif prop_type == "boolean":
                template_obj[prop] = False
            elif prop_type == "array":
                template_obj[prop] = []
            elif prop_type == "object":
                template_obj[prop] = {}
            else:
                template_obj[prop] = None
                
        # Ensure required fields are present
        for req in required_fields:
            if req not in template_obj:
                template_obj[req] = "required_value"

        if output_format == "JSON":
            template_str = json.dumps(template_obj, indent=2)
            st.code(template_str, language="json")
        else:
            template_str = yaml.dump(template_obj, default_flow_style=False)
            st.code(template_str, language="yaml")
            
        st.download_button(
            label=f"Download Starter {output_format}",
            data=template_str,
            file_name=f"starter_{selected_catalog_name.lower().replace(' ', '_')}.{output_format.lower()}",
            mime="text/plain"
        )

# ==========================================
# APP 3: SCHEMA EVOLUTION & COMPATIBILITY ANALYZER
# ==========================================
elif app_mode == "3. Schema Evolution & Compatibility Analyzer":
    st.header("🔄 Schema Evolution & Compatibility Analyzer")
    st.markdown("Validate a single configuration payload against two different versions of a schema to analyze backward/forward compatibility.")

    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Schema Version A (Older/Base)")
        schema_a_source = st.selectbox("Select Schema A", ["App Configuration (v1 Mock)", "Custom Schema A"])
        if schema_a_source == "App Configuration (v1 Mock)":
            schema_a = {
                "type": "object",
                "properties": {
                    "appName": {"type": "string"},
                    "port": {"type": "integer"}
                },
                "required": ["appName", "port"]
            }
        else:
            schema_a_str = st.text_area("Paste Schema A JSON", value='{"type": "object"}', height=150)
            schema_a = json.loads(schema_a_str)
        st.json(schema_a)

    with col2:
        st.subheader("Schema Version B (Newer/Evolved)")
        schema_b_source = st.selectbox("Select Schema B", ["App Configuration (v2 Mock - Strict)", "Custom Schema B"])
        if schema_b_source == "App Configuration (v2 Mock - Strict)":
            schema_b = {
                "type": "object",
                "properties": {
                    "appName": {"type": "string", "minLength": 5},
                    "port": {"type": "integer", "minimum": 1024},
                    "environment": {"type": "string", "enum": ["dev", "prod"]}
                },
                "required": ["appName", "port", "environment"]
            }
        else:
            schema_b_str = st.text_area("Paste Schema B JSON", value='{"type": "object"}', height=150)
            schema_b = json.loads(schema_b_str)
        st.json(schema_b)

    st.markdown("---")
    st.subheader("Test Payload Compatibility")
    test_payload_str = st.text_area("Enter Test Payload (JSON)", value='{\n  "appName": "App",\n  "port": 80\n}', height=120)
    
    try:
        test_payload = json.loads(test_payload_str)
        
        errors_a = validate_payload(test_payload, schema_a)
        errors_b = validate_payload(test_payload, schema_b)
        
        res_col1, res_col2 = st.columns(2)
        
        with res_col1:
            st.markdown("### Results for Schema A")
            if not errors_a:
                st.success("✅ Fully Compatible with Schema A")
            else:
                st.error(f"❌ Incompatible with Schema A ({len(errors_a)} errors)")
                for e in errors_a:
                    st.warning(f"**{e['path']}**: {e['message']}")
                    
        with res_col2:
            st.markdown("### Results for Schema B")
            if not errors_b:
                st.success("✅ Fully Compatible with Schema B")
            else:
                st.error(f"❌ Incompatible with Schema B ({len(errors_b)} errors)")
                for e in errors_b:
                    st.warning(f"**{e['path']}**: {e['message']}")
                    
        # Compatibility Summary
        st.markdown("### Compatibility Matrix Summary")
        if not errors_a and not errors_b:
            st.success("🔄 **Perfect Compatibility:** This payload works seamlessly across both schema versions!")
        elif not errors_a and errors_b:
            st.info("⚠️ **Forward Compatibility Issue:** The payload is valid for the older schema but fails the newer, stricter rules.")
        elif errors_a and not errors_b:
            st.info("⚠️ **Backward Compatibility Issue:** The payload is valid for the newer schema but fails older legacy rules.")
        else:
            st.error("🚨 **Incompatible:** The payload is invalid for both versions of the schema.")
            
    except Exception as e:
        st.error(f"Invalid Test Payload JSON: {str(e)}")

# ==========================================
# APP 4: CUSTOM RULE ORCHESTRATOR & SCHEMA BUILDER
# ==========================================
elif app_mode == "4. Custom Rule Orchestrator & Schema Builder":
    st.header("🛠️ Custom Rule Orchestrator & Schema Builder")
    st.markdown("Build a custom JSON schema interactively and layer custom validation rules (e.g., cross-field checks) on top.")

    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("1. Interactive Schema Builder")
        
        app_title = st.text_input("Schema Title", value="My Custom Schema")
        
        st.markdown("#### Define Fields")
        
        # Simple state management for fields
        if "fields" not in st.session_state:
            st.session_state.fields = [
                {"name": "username", "type": "string", "required": True},
                {"name": "age", "type": "integer", "required": False}
            ]
            
        # Add field form
        with st.form("add_field_form"):
            new_name = st.text_input("Field Name")
            new_type = st.selectbox("Field Type", ["string", "integer", "number", "boolean"])
            new_req = st.checkbox("Required?")
            submitted = st.form_submit_button("Add Field")
            if submitted and new_name:
                st.session_state.fields.append({"name": new_name, "type": new_type, "required": new_req})
                st.success(f"Added field '{new_name}'")
                
        # Display and allow clearing fields
        st.markdown("**Current Fields:**")
        for idx, f in enumerate(st.session_state.fields):
            st.markdown(f"- `{f['name']}` ({f['type']}) - {'*Required*' if f['required'] else 'Optional'}")
            
        if st.button("Clear All Fields"):
            st.session_state.fields = []
            st.experimental_rerun()

        # Build the JSON Schema object
        built_schema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": app_title,
            "type": "object",
            "properties": {},
            "required": []
        }
        
        for f in st.session_state.fields:
            built_schema["properties"][f["name"]] = {"type": f["type"]}
            if f["required"]:
                built_schema["required"].append(f["name"])
                
        st.subheader("2. Custom Orchestration Rules")
        st.markdown("Add rules that standard JSON Schema can't easily express (e.g., conditional logic).")
        
        rule_type = st.selectbox("Select Custom Rule Type", [
            "None",
            "Cross-Field Comparison (e.g., Field A must be greater than Field B)",
            "Value Dependency (e.g., If Field A is 'X', then Field B must be present)"
        ])
        
        custom_rules = []
        if rule_type == "Cross-Field Comparison (e.g., Field A must be greater than Field B)":
            field_a = st.text_input("Field A (e.g., max_limit)")
            field_b = st.text_input("Field B (e.g., min_limit)")
            if field_a and field_b:
                custom_rules.append({
                    "type": "comparison",
                    "field_a": field_a,
                    "field_b": field_b,
                    "desc": f"Value of '{field_a}' must be greater than '{field_b}'"
                })
        elif rule_type == "Value Dependency (e.g., If Field A is 'X', then Field B must be present)":
            field_dep_a = st.text_input("Trigger Field (Field A)")
            val_dep_a = st.text_input("Trigger Value")
            field_dep_b = st.text_input("Dependent Field (Field B)")
            if field_dep_a and val_dep_a and field_dep_b:
                custom_rules.append({
                    "type": "dependency",
                    "field_a": field_dep_a,
                    "val_a": val_dep_a,
                    "field_b": field_dep_b,
                    "desc": f"If '{field_dep_a}' is '{val_dep_a}', then '{field_dep_b}' must be provided."
                })

    with col2:
        st.subheader("Generated Schema JSON")
        st.json(built_schema)
        
        st.subheader("Test Your Custom Schema & Rules")
        test_data_str = st.text_area("Enter Test Data (JSON)", value='{\n  "username": "john_doe",\n  "age": 30\n}', height=150)
        
        try:
            test_data = json.loads(test_data_str)
            
            # Standard Validation
            std_errors = validate_payload(test_data, built_schema)
            
            # Custom Rule Validation
            custom_errors = []
            for rule in custom_rules:
                if rule["type"] == "comparison":
                    val_a = test_data.get(rule["field_a"])
                    val_b = test_data.get(rule["field_b"])
                    if val_a is not None and val_b is not None:
                        if not (val_a > val_b):
                            custom_errors.append(f"Custom Rule Violation: {rule['desc']} (Got {val_a} and {val_b})")
                elif rule["type"] == "dependency":
                    val_a = test_data.get(rule["field_a"])
                    if str(val_a) == str(rule["val_a"]):
                        if rule["field_b"] not in test_data:
                            custom_errors.append(f"Custom Rule Violation: {rule['desc']}")
                            
            # Display Results
            if not std_errors and not custom_errors:
                st.success("🎉 All standard and custom rules passed successfully!")
            else:
                if std_errors:
                    st.error("❌ Standard Schema Validation Errors:")
                    for e in std_errors:
                        st.write(f"- **{e['path']}**: {e['message']}")
                if custom_errors:
                    st.error("❌ Custom Orchestration Rule Violations:")
                    for ce in custom_errors:
                        st.warning(ce)
                        
        except Exception as e:
            st.error(f"Invalid Test Data JSON: {str(e)}")