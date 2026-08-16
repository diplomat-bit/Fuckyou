import streamlit as st
import json
import os

# Set page configuration
st.set_page_config(
    page_title="Schema Catalog Custom Registry",
    page_icon="🗂️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Default fallback catalog if api/catalog.txt.json is missing
DEFAULT_CATALOG = {
    "$schema": "https://json.schemastore.org/schema-catalog.json",
    "version": 1,
    "schemas": [
        {
            "name": "package.json",
            "description": "npm package configuration file",
            "fileMatch": ["package.json"],
            "url": "https://json.schemastore.org/package.json"
        },
        {
            "name": "tsconfig.json",
            "description": "TypeScript compiler configuration file",
            "fileMatch": ["tsconfig.json", "tsconfig.*.json"],
            "url": "https://json.schemastore.org/tsconfig.json"
        },
        {
            "name": "docker-compose.yml",
            "description": "Docker Compose configuration file",
            "fileMatch": ["docker-compose.yml", "docker-compose.yaml"],
            "url": "https://raw.githubusercontent.com/compose-spec/compose-spec/master/schema/compose-spec.json"
        }
    ]
}

def load_base_catalog():
    """Loads the base catalog from api/catalog.txt.json or fallback paths."""
    paths = [
        "api/catalog.txt.json",
        "../api/catalog.txt.json",
        "../../api/catalog.txt.json"
    ]
    for path in paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict) and "schemas" in data:
                        return data
            except Exception as e:
                st.sidebar.warning(f"Error reading {path}: {e}")
    return DEFAULT_CATALOG

# Initialize Session State
if "catalog" not in st.session_state:
    st.session_state.catalog = load_base_catalog()

if "search_query" not in st.session_state:
    st.session_state.search_query = ""

# Helper to get schemas list
def get_schemas():
    return st.session_state.catalog.get("schemas", [])

# Helper to set schemas list
def set_schemas(schemas_list):
    st.session_state.catalog["schemas"] = schemas_list

# Conflict Detection Logic
def detect_conflicts(schemas):
    """Detects if multiple schemas match the same file pattern."""
    pattern_map = {}
    for idx, schema in enumerate(schemas):
        name = schema.get("name", f"Unnamed Schema #{idx}")
        file_matches = schema.get("fileMatch", [])
        for pattern in file_matches:
            if pattern not in pattern_map:
                pattern_map[pattern] = []
            pattern_map[pattern].append(name)
    
    # Filter only patterns with more than one schema matching
    conflicts = {pattern: names for pattern, names in pattern_map.items() if len(names) > 1}
    return conflicts

# App Header
st.title("🗂️ Schema Catalog Custom Registry")
st.markdown(
    """
    Manage, extend, and customize your JSON/YAML Schema Catalog. 
    This tool allows you to add custom schemas, edit existing ones, detect file-match conflicts, 
    and export a valid schema-catalog specification.
    """
)

# Sidebar - Actions & Add Schema
st.sidebar.header("Registry Controls")

# Reset / Load Custom File
with st.sidebar.expander("Reset & Import Options"):
    if st.button("Reset to Base Catalog", use_container_width=True):
        st.session_state.catalog = load_base_catalog()
        st.success("Reset to base catalog successfully!")
        st.rerun()
        
    uploaded_file = st.file_uploader("Upload Custom Catalog JSON", type=["json"])
    if uploaded_file is not None:
        try:
            uploaded_data = json.load(uploaded_file)
            if "schemas" in uploaded_data:
                st.session_state.catalog = uploaded_data
                st.success("Custom catalog loaded successfully!")
                st.rerun()
            else:
                st.error("Invalid catalog format. Must contain a 'schemas' array.")
        except Exception as e:
            st.error(f"Error parsing JSON: {e}")

# Sidebar Form: Add New Schema
st.sidebar.markdown("---")
st.sidebar.subheader("➕ Add Custom Schema")
with st.sidebar.form("add_schema_form", clear_on_submit=True):
    new_name = st.text_input("Schema Name*", placeholder="e.g., My Custom Config")
    new_desc = st.text_area("Description", placeholder="Describe what this schema validates...")
    new_matches_raw = st.text_input("File Matches*", placeholder="e.g., config.json, *.myconfig.json")
    new_url = st.text_input("Schema URL*", placeholder="https://example.com/schema.json")
    
    st.markdown("**Versions (Optional)**")
    new_versions_raw = st.text_area(
        "Versions JSON Map", 
        placeholder='{\n  "1.0": "https://example.com/v1.json",\n  "2.0": "https://example.com/v2.json"\n}',
        height=100
    )
    
    submit_add = st.form_submit_button("Add Schema to Catalog", use_container_width=True)
    
    if submit_add:
        if not new_name or not new_matches_raw or not new_url:
            st.error("Name, File Matches, and Schema URL are required fields.")
        else:
            # Parse file matches
            file_matches = [x.strip() for x in new_matches_raw.split(",") if x.strip()]
            
            # Parse versions
            versions = {}
            if new_versions_raw.strip():
                try:
                    versions = json.loads(new_versions_raw)
                    if not isinstance(versions, dict):
                        st.error("Versions must be a valid JSON object (key-value pairs).")
                        versions = {}
                except Exception as e:
                    st.error(f"Failed to parse Versions JSON: {e}")
                    versions = {}
            
            # Create new schema object
            new_schema = {
                "name": new_name,
                "description": new_desc,
                "fileMatch": file_matches,
                "url": new_url
            }
            if versions:
                new_schema["versions"] = versions
                
            # Append to session state
            current_schemas = get_schemas()
            current_schemas.append(new_schema)
            set_schemas(current_schemas)
            st.success(f"Added '{new_name}' successfully!")
            st.rerun()

# Main Panel Layout
col_stats, col_search = st.columns([2, 3])

# Calculate Stats
schemas = get_schemas()
conflicts = detect_conflicts(schemas)
total_patterns = sum(len(s.get("fileMatch", [])) for s in schemas)

with col_stats:
    st.markdown("### Catalog Statistics")
    stat_col1, stat_col2, stat_col3 = st.columns(3)
    stat_col1.metric("Total Schemas", len(schemas))
    stat_col2.metric("File Patterns", total_patterns)
    stat_col3.metric("Conflicts", len(conflicts), delta=f"{len(conflicts)} active" if conflicts else "None", delta_color="inverse" if conflicts else "normal")

with col_search:
    st.markdown("### Search & Filter")
    st.session_state.search_query = st.text_input(
        "Search schemas by name, description, or file pattern", 
        value=st.session_state.search_query,
        placeholder="Type to filter..."
    )

# Display Conflict Alerts
if conflicts:
    st.error("⚠️ **Conflict Detected!** Multiple schemas are matching the same file pattern(s):")
    for pattern, names in conflicts.items():
        st.markdown(f"- **`{pattern}`** is claimed by: {', '.join([f'`{n}`' for n in names])}")
    st.info("To resolve conflicts, edit the file matches of the conflicting schemas below.")

# Filter Schemas based on search query
filtered_schemas = []
for idx, schema in enumerate(schemas):
    q = st.session_state.search_query.lower()
    name = schema.get("name", "").lower()
    desc = schema.get("description", "").lower()
    matches = " ".join(schema.get("fileMatch", [])).lower()
    
    if not q or q in name or q in desc or q in matches:
        filtered_schemas.append((idx, schema))

# Tabs for Managing Schemas and Exporting
tab_manage, tab_export = st.tabs(["📋 Manage Schemas", "💾 Export Catalog"])

with tab_manage:
    st.subheader(f"Active Schemas ({len(filtered_schemas)} shown)")
    
    if not filtered_schemas:
        st.info("No schemas match your search criteria or the catalog is empty.")
    
    for original_idx, schema in filtered_schemas:
        with st.expander(f"🔍 {schema.get('name', 'Unnamed Schema')} — `{', '.join(schema.get('fileMatch', []))}`"):
            # Edit Form inside Expander
            with st.form(f"edit_form_{original_idx}"):
                col1, col2 = st.columns(2)
                with col1:
                    edit_name = st.text_input("Schema Name", value=schema.get("name", ""), key=f"name_{original_idx}")
                    edit_desc = st.text_area("Description", value=schema.get("description", ""), key=f"desc_{original_idx}")
                with col2:
                    edit_matches_raw = st.text_input(
                        "File Matches (comma-separated)", 
                        value=", ".join(schema.get("fileMatch", [])), 
                        key=f"matches_{original_idx}"
                    )
                    edit_url = st.text_input("Schema URL", value=schema.get("url", ""), key=f"url_{original_idx}")
                
                # Versions handling
                versions_val = schema.get("versions", {})
                versions_str = json.dumps(versions_val, indent=2) if versions_val else ""
                edit_versions_raw = st.text_area(
                    "Versions JSON Map (Optional)", 
                    value=versions_str, 
                    key=f"versions_{original_idx}",
                    height=100
                )
                
                # Form Actions
                btn_col1, btn_col2, btn_col3 = st.columns([2, 2, 8])
                with btn_col1:
                    save_changes = st.form_submit_button("Save Changes", use_container_width=True)
                with btn_col2:
                    delete_schema = st.form_submit_button("🗑️ Delete", use_container_width=True)
                
                if save_changes:
                    # Update schema in session state
                    updated_matches = [x.strip() for x in edit_matches_raw.split(",") if x.strip()]
                    
                    updated_versions = {}
                    if edit_versions_raw.strip():
                        try:
                            updated_versions = json.loads(edit_versions_raw)
                            if not isinstance(updated_versions, dict):
                                st.error("Versions must be a valid JSON object.")
                                updated_versions = {}
                        except Exception as e:
                            st.error(f"Failed to parse Versions JSON: {e}")
                            updated_versions = {}
                    
                    schemas[original_idx] = {
                        "name": edit_name,
                        "description": edit_desc,
                        "fileMatch": updated_matches,
                        "url": edit_url
                    }
                    if updated_versions:
                        schemas[original_idx]["versions"] = updated_versions
                        
                    set_schemas(schemas)
                    st.success("Schema updated successfully!")
                    st.rerun()
                    
                if delete_schema:
                    # Remove schema from session state
                    schemas.pop(original_idx)
                    set_schemas(schemas)
                    st.success("Schema deleted successfully!")
                    st.rerun()

with tab_export:
    st.subheader("Export Customized Catalog")
    st.markdown(
        "Review the generated JSON catalog below. You can download it directly to use in your IDE or schema registry."
    )
    
    # Construct final catalog JSON
    final_catalog = {
        "$schema": st.session_state.catalog.get("$schema", "https://json.schemastore.org/schema-catalog.json"),
        "version": st.session_state.catalog.get("version", 1),
        "schemas": get_schemas()
    }
    
    catalog_json_str = json.dumps(final_catalog, indent=2)
    
    # Download Button
    st.download_button(
        label="📥 Download catalog.json",
        data=catalog_json_str,
        file_name="catalog.json",
        mime="application/json",
        use_container_width=True
    )
    
    # JSON Preview
    st.markdown("### Live JSON Preview")
    st.code(catalog_json_str, language="json")