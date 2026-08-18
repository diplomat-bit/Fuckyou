import streamlit as st
import json
import fnmatch
import requests
import pandas as pd
from datetime import datetime
import os

# Set page configuration
st.set_page_config(
    page_title="Schema Conformance Audit Tool",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .reportview-container {
        background: #f5f7f9;
    }
    .metric-card {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        border-top: 4px solid #4CAF50;
    }
    .metric-card.uncovered {
        border-top: 4px solid #f44336;
    }
    .metric-card.neutral {
        border-top: 4px solid #2196F3;
    }
    .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 12px;
    }
    .status-covered {
        background-color: #e8f5e9;
        color: #2e7d32;
    }
    .status-uncovered {
        background-color: #ffebee;
        color: #c62828;
    }
</style>
""", unsafe_allow_html=True)

# Default Schemas
DEFAULT_SCHEMAS = [
    {
        "name": "Package JSON Schema",
        "url": "https://json.schemastore.org/package.json",
        "fileMatch": ["package.json"]
    },
    {
        "name": "GitHub Workflow Schema",
        "url": "https://json.schemastore.org/github-workflow.json",
        "fileMatch": [".github/workflows/*.yml", ".github/workflows/*.yaml"]
    },
    {
        "name": "TSConfig Schema",
        "url": "https://json.schemastore.org/tsconfig.json",
        "fileMatch": ["tsconfig.json", "tsconfig.*.json"]
    },
    {
        "name": "Docker Compose Schema",
        "url": "https://raw.githubusercontent.com/compose-spec/compose-spec/master/schema/compose-spec.json",
        "fileMatch": ["docker-compose.yml", "docker-compose.yaml"]
    },
    {
        "name": "Kubernetes Deployment Schema",
        "url": "https://raw.githubusercontent.com/instrumenta/kubernetes-json-schema/master/v1.18.0/deployment-apps-v1.json",
        "fileMatch": ["*deployment*.yaml", "*deployment*.yml", "k8s/*.yaml"]
    },
    {
        "name": "Broken Schema Example",
        "url": "https://json.schemastore.org/non-existent-schema-xyz.json",
        "fileMatch": ["invalid-config.json"]
    }
]

# Default Files
DEFAULT_FILES = [
    "package.json",
    "tsconfig.json",
    "tsconfig.build.json",
    ".github/workflows/ci.yml",
    ".github/workflows/deploy.yaml",
    "docker-compose.yml",
    "src/index.ts",
    "src/utils.ts",
    "README.md",
    "invalid-config.json",
    "k8s/deployment.yaml",
    "k8s/service.yaml",
    "src/config.json"
]

# Initialize Session State
if "schemas" not in st.session_state:
    st.session_state.schemas = list(DEFAULT_SCHEMAS)

if "files" not in st.session_state:
    st.session_state.files = list(DEFAULT_FILES)

if "health_results" not in st.session_state:
    st.session_state.health_results = {}

# Helper Functions
def file_matches_pattern(filepath, pattern):
    # Normalize paths to use forward slashes
    filepath = filepath.replace("\\", "/")
    pattern = pattern.replace("\\", "/")
    
    # If pattern doesn't contain slashes, match against the basename
    if "/" not in pattern:
        basename = os.path.basename(filepath)
        return fnmatch.fnmatch(basename, pattern)
    
    # Otherwise, match against the full path
    # Support globstar (**/) style matching simply by replacing with * for fnmatch
    if "**/" in pattern:
        # Simple approximation for fnmatch
        pattern = pattern.replace("**/", "*/")
    
    return fnmatch.fnmatch(filepath, pattern) or fnmatch.fnmatch(filepath, "*/" + pattern)

def check_schema_health(url):
    try:
        # Use GET with a stream/timeout to check validity quickly
        response = requests.get(url, timeout=3.0, stream=True)
        status_code = response.status_code
        is_healthy = status_code == 200
        error_msg = None if is_healthy else f"HTTP Status {status_code}"
        return is_healthy, status_code, error_msg
    except Exception as e:
        return False, None, str(e)

def run_audit(files, schemas):
    audit_results = []
    covered_count = 0
    
    for filepath in files:
        matching_schemas = []
        for schema in schemas:
            for pattern in schema["fileMatch"]:
                if file_matches_pattern(filepath, pattern):
                    matching_schemas.append({
                        "name": schema["name"],
                        "pattern": pattern,
                        "url": schema["url"]
                    })
                    break # Avoid duplicate matches for the same schema
        
        is_covered = len(matching_schemas) > 0
        if is_covered:
            covered_count += 1
            
        audit_results.append({
            "file": filepath,
            "status": "Covered" if is_covered else "Uncovered",
            "matched_schemas": matching_schemas
        })
        
    coverage_pct = (covered_count / len(files)) * 100 if files else 0
    return audit_results, coverage_pct, covered_count

# Sidebar - Schema Catalog Management
st.sidebar.title("🛠️ Schema Catalog Manager")
st.sidebar.markdown("Manage the schemas used to audit your workspace files.")

# Add New Schema Form
with st.sidebar.expander("➕ Add Custom Schema", expanded=False):
    with st.form("add_schema_form", clear_on_submit=True):
        new_name = st.text_input("Schema Name", placeholder="e.g., ESLint Config")
        new_url = st.text_input("Schema URL", placeholder="https://json.schemastore.org/eslintrc.json")
        new_patterns_raw = st.text_input("File Match Patterns (comma-separated)", placeholder=".eslintrc, .eslintrc.json")
        
        submit_button = st.form_submit_button("Add Schema")
        if submit_button:
            if new_name and new_url and new_patterns_raw:
                patterns = [p.strip() for p in new_patterns_raw.split(",") if p.strip()]
                st.session_state.schemas.append({
                    "name": new_name,
                    "url": new_url,
                    "fileMatch": patterns
                })
                st.success(f"Added schema: {new_name}")
                st.rerun()
            else:
                st.error("Please fill in all fields.")

# List and Delete Schemas
st.sidebar.markdown("### Current Catalog")
for idx, schema in enumerate(st.session_state.schemas):
    with st.sidebar.expander(f"📄 {schema['name']}", expanded=False):
        st.markdown(f"**URL:** [{schema['url']}]({schema['url']})")
        st.markdown(f"**Patterns:** `{', '.join(schema['fileMatch'])}`")
        if st.button("🗑️ Delete Schema", key=f"del_{idx}"):
            st.session_state.schemas.pop(idx)
            st.success(f"Deleted {schema['name']}")
            st.rerun()

# Reset Catalog Button
if st.sidebar.button("🔄 Reset to Default Catalog"):
    st.session_state.schemas = list(DEFAULT_SCHEMAS)
    st.session_state.health_results = {}
    st.success("Reset catalog to defaults!")
    st.rerun()


# Main Application Layout
st.title("🛡️ Schema Conformance Audit Tool")
st.markdown(
    "Audit your project workspace files against a catalog of JSON/YAML schemas. "
    "Ensure configuration files conform to industry standards and verify schema health."
)

# Tabs
tab_workspace, tab_audit, tab_health, tab_export = st.tabs([
    "📂 Workspace Files", 
    "📊 Audit Dashboard", 
    "🩺 Schema Health Check", 
    "📥 Export Report"
])

# --- TAB 1: WORKSPACE FILES ---
with tab_workspace:
    st.header("Define Workspace Files")
    st.markdown(
        "Simulate your project directory by listing the files present in your workspace. "
        "Enter one file path per line."
    )
    
    files_text = st.text_area(
        "Workspace Files (one per line)", 
        value="\n".join(st.session_state.files),
        height=300
    )
    
    col1, col2 = st.columns([1, 5])
    with col1:
        if st.button("💾 Save Workspace"):
            parsed_files = [line.strip() for line in files_text.split("\n") if line.strip()]
            st.session_state.files = parsed_files
            st.success("Workspace files updated!")
    with col2:
        if st.button("🔄 Reset to Default Files"):
            st.session_state.files = list(DEFAULT_FILES)
            st.success("Reset workspace files to defaults!")
            st.rerun()

# Run the audit engine
audit_results, coverage_pct, covered_count = run_audit(st.session_state.files, st.session_state.schemas)
uncovered_count = len(st.session_state.files) - covered_count

# --- TAB 2: AUDIT DASHBOARD ---
with tab_audit:
    st.header("Audit Dashboard")
    
    # Metrics Row
    m_col1, m_col2, m_col3, m_col4 = st.columns(4)
    with m_col1:
        st.markdown(f"""
            <div class="metric-card neutral">
                <h3>Total Files</h3>
                <h2>{len(st.session_state.files)}</h2>
            </div>
        """, unsafe_allow_html=True)
    with m_col2:
        st.markdown(f"""
            <div class="metric-card">
                <h3>Covered Files</h3>
                <h2>{covered_count}</h2>
            </div>
        """, unsafe_allow_html=True)
    with m_col3:
        st.markdown(f"""
            <div class="metric-card uncovered">
                <h3>Uncovered Files</h3>
                <h2>{uncovered_count}</h2>
            </div>
        """, unsafe_allow_html=True)
    with m_col4:
        # Color coverage based on percentage
        cov_color = "#4CAF50" if coverage_pct >= 80 else "#FF9800" if coverage_pct >= 50 else "#f44336"
        st.markdown(f"""
            <div class="metric-card" style="border-top: 4px solid {cov_color};">
                <h3>Schema Coverage</h3>
                <h2>{coverage_pct:.1f}%</h2>
            </div>
        """, unsafe_allow_html=True)
        
    st.markdown("---")
    
    # Detailed Audit Table
    st.subheader("Detailed File Audit Results")
    
    filter_status = st.selectbox("Filter by Status", ["All", "Covered", "Uncovered"])
    
    audit_table_data = []
    for res in audit_results:
        if filter_status != "All" and res["status"] != filter_status:
            continue
            
        matched_names = [m["name"] for m in res["matched_schemas"]]
        matched_patterns = [m["pattern"] for m in res["matched_schemas"]]
        
        audit_table_data.append({
            "File Path": res["file"],
            "Status": res["status"],
            "Matching Schemas": ", ".join(matched_names) if matched_names else "None",
            "Matched Patterns": ", ".join(matched_patterns) if matched_patterns else "N/A"
        })
        
    df_audit = pd.DataFrame(audit_table_data)
    if not df_audit.empty:
        # Style the status column
        def style_status(val):
            color = 'background-color: #e8f5e9; color: #2e7d32; font-weight: bold;' if val == 'Covered' else 'background-color: #ffebee; color: #c62828; font-weight: bold;'
            return color
            
        st.dataframe(
            df_audit.style.applymap(style_status, subset=['Status']),
            use_container_width=True,
            hide_index=True
        )
    else:
        st.info("No files match the selected filter.")

# --- TAB 3: SCHEMA HEALTH CHECK ---
with tab_health:
    st.header("Schema Health Check")
    st.markdown(
        "Verify if the schema URLs defined in your catalog are reachable and valid. "
        "This ensures your CI/CD pipelines or IDEs won't fail when fetching these schemas."
    )
    
    if st.button("🔍 Run Health Check on All Schemas"):
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        for idx, schema in enumerate(st.session_state.schemas):
            status_text.text(f"Checking {schema['name']}...")
            is_healthy, code, err = check_schema_health(schema["url"])
            st.session_state.health_results[schema["url"]] = {
                "healthy": is_healthy,
                "code": code,
                "error": err
            }
            progress_bar.progress((idx + 1) / len(st.session_state.schemas))
            
        status_text.text("Health check complete!")
        progress_bar.empty()
        
    # Display Health Results Table
    health_table_data = []
    for schema in st.session_state.schemas:
        url = schema["url"]
        health_info = st.session_state.health_results.get(url, {"healthy": "Unchecked", "code": "-", "error": "-"})
        
        status_str = "Unchecked"
        if health_info["healthy"] is True:
            status_str = "🟢 Healthy"
        elif health_info["healthy"] is False:
            status_str = "🔴 Broken"
            
        health_table_data.append({
            "Schema Name": schema["name"],
            "URL": url,
            "Status": status_str,
            "HTTP Code": health_info["code"] if health_info["code"] is not None else "-",
            "Details / Error": health_info["error"] if health_info["error"] else "OK"
        })
        
    df_health = pd.DataFrame(health_table_data)
    
    def style_health(val):
        if "Healthy" in str(val):
            return 'background-color: #e8f5e9; color: #2e7d32; font-weight: bold;'
        elif "Broken" in str(val):
            return 'background-color: #ffebee; color: #c62828; font-weight: bold;'
        return 'background-color: #fff3e0; color: #e65100; font-weight: bold;'

    st.dataframe(
        df_health.style.applymap(style_health, subset=['Status']),
        use_container_width=True,
        hide_index=True
    )

# --- TAB 4: EXPORT REPORT ---
with tab_export:
    st.header("Export Audit Report")
    st.markdown("Generate and download the schema conformance audit report in JSON or Markdown format.")
    
    # Build Report Data Structure
    report_data = {
        "audit_metadata": {
            "timestamp": datetime.now().isoformat(),
            "total_files": len(st.session_state.files),
            "covered_files": covered_count,
            "uncovered_files": uncovered_count,
            "coverage_percentage": round(coverage_pct, 2)
        },
        "schemas_configured": [
            {
                "name": s["name"],
                "url": s["url"],
                "fileMatch": s["fileMatch"],
                "health": st.session_state.health_results.get(s["url"], {"healthy": "Unchecked"})
            } for s in st.session_state.schemas
        ],
        "file_audit_results": audit_results
    }
    
    # Markdown Report Generation
    markdown_report = f"""# Schema Conformance Audit Report
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary Metrics
- **Total Files Scanned:** {len(st.session_state.files)}
- **Covered Files:** {covered_count}
- **Uncovered Files:** {uncovered_count}
- **Schema Coverage:** {coverage_pct:.2f}%

## Detailed File Audit Results
| File Path | Status | Matching Schemas |
| --- | --- | --- |
"""
    for res in audit_results:
        matched_names = ", ".join([m["name"] for m in res["matched_schemas"]]) if res["matched_schemas"] else "None"
        status_emoji = "✅ Covered" if res["status"] == "Covered" else "❌ Uncovered"
        markdown_report += f"| `{res['file']}` | {status_emoji} | {matched_names} |\n"
        
    markdown_report += "\n## Configured Schema Catalog & Health Status\n"
    markdown_report += "| Schema Name | Match Patterns | URL | Health Status |\n"
    markdown_report += "| --- | --- | --- | --- |\n"
    for schema in st.session_state.schemas:
        health_info = st.session_state.health_results.get(schema["url"], {"healthy": "Unchecked"})
        h_status = "🟢 Healthy" if health_info.get("healthy") is True else "🔴 Broken" if health_info.get("healthy") is False else "⚪ Unchecked"
        markdown_report += f"| {schema['name']} | `{', '.join(schema['fileMatch'])}` | [{schema['url']}]({schema['url']}) | {h_status} |\n"

    # Export UI
    col_json, col_md = st.columns(2)
    
    with col_json:
        st.subheader("JSON Format")
        st.markdown("Best for machine processing, CI/CD integration, or archiving.")
        st.json(report_data, expanded=False)
        
        st.download_button(
            label="📥 Download JSON Report",
            data=json.dumps(report_data, indent=2),
            file_name=f"schema-audit-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json",
            mime="application/json"
        )
        
    with col_md:
        st.subheader("Markdown Format")
        st.markdown("Best for documentation, GitHub PR comments, or human reading.")
        st.text_area("Markdown Preview", value=markdown_report, height=300)
        
        st.download_button(
            label="📥 Download Markdown Report",
            data=markdown_report,
            file_name=f"schema-audit-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.md",
            mime="text/markdown"
        )