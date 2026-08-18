import streamlit as st
import json
import os
import fnmatch
from urllib.parse import urlparse
import pandas as pd
from collections import Counter
import requests

# Set page configuration
st.set_page_config(
    page_title="JSON Schema Catalog Explorer",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1E3A8A;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #4B5563;
        margin-bottom: 2rem;
    }
    .card {
        background-color: #F3F4F6;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 5px solid #3B82F6;
        margin-bottom: 1rem;
    }
    .card-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #1F2937;
    }
    .card-desc {
        color: #4B5563;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .tag {
        display: inline-block;
        background-color: #E5E7EB;
        color: #374151;
        padding: 0.2rem 0.6rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
        margin-right: 0.5rem;
        margin-top: 0.25rem;
    }
    .tag-url {
        background-color: #DBEAFE;
        color: #1E40AF;
    }
</style>
""", unsafe_allow_html=True)

# Fallback catalog data in case of loading failures
FALLBACK_CATALOG = {
    "schemas": [
        {
            "name": "package.json",
            "description": "npm package configuration file",
            "url": "https://json.schemastore.org/package.json",
            "fileMatch": ["package.json"]
        },
        {
            "name": "docker-compose.yml",
            "description": "Docker Compose file format",
            "url": "https://raw.githubusercontent.com/compose-spec/compose-spec/master/schema/compose-spec.json",
            "fileMatch": ["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"]
        },
        {
            "name": "tsconfig.json",
            "description": "TypeScript compiler configuration file",
            "url": "https://json.schemastore.org/tsconfig.json",
            "fileMatch": ["tsconfig.json"]
        },
        {
            "name": "github-workflow.json",
            "description": "GitHub workflow execution file",
            "url": "https://json.schemastore.org/github-workflow.json",
            "fileMatch": [".github/workflows/*.yml", ".github/workflows/*.yaml"]
        },
        {
            "name": "prettierrc.json",
            "description": "Prettier configuration file",
            "url": "https://json.schemastore.org/prettierrc.json",
            "fileMatch": [".prettierrc", ".prettierrc.json", ".prettierrc.yml", ".prettierrc.yaml"]
        },
        {
            "name": "cargo.toml",
            "description": "Cargo package manifest",
            "url": "https://json.schemastore.org/cargo.json",
            "fileMatch": ["Cargo.toml"]
        }
    ]
}

@st.cache_data(show_spinner="Loading Schema Catalog...")
def load_catalog():
    """Loads the schema catalog from local file, remote URL, or fallback."""
    # 1. Try local file path specified in the prompt
    local_paths = ["api/catalog.txt.json", "catalog.txt.json", "catalog.json"]
    for path in local_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "schemas" in data:
                        return data, f"Loaded from local file: `{path}`"
            except Exception as e:
                st.warning(f"Failed to parse local file {path}: {e}")

    # 2. Try fetching from official SchemaStore API
    remote_url = "https://www.schemastore.org/api/json/catalog.json"
    try:
        response = requests.get(remote_url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "schemas" in data:
                return data, "Loaded live from SchemaStore API"
    except Exception as e:
        st.warning(f"Failed to fetch live catalog from SchemaStore: {e}")

    # 3. Fallback to hardcoded catalog
    return FALLBACK_CATALOG, "Loaded offline fallback catalog"

# Load data
catalog_data, source_info = load_catalog()
schemas = catalog_data.get("schemas", [])

# Helper functions for processing
def get_domain(url_str):
    try:
        parsed = urlparse(url_str)
        return parsed.netloc if parsed.netloc else "Unknown"
    except Exception:
        return "Unknown"

def get_extension(pattern):
    if "." in pattern:
        parts = pattern.split(".")
        # Return the last part if it doesn't contain wildcards, or the whole extension
        ext = parts[-1]
        if "*" not in ext and "?" not in ext:
            return f".{ext.lower()}"
    return "No Extension / Custom"

# Process statistics
domains = []
extensions = []
total_patterns = 0

for schema in schemas:
    url = schema.get("url", "")
    if url:
        domains.append(get_domain(url))
    
    patterns = schema.get("fileMatch", [])
    if patterns:
        total_patterns += len(patterns)
        for pat in patterns:
            extensions.append(get_extension(pat))

domain_counts = Counter(domains)
ext_counts = Counter(extensions)

# Sidebar
st.sidebar.image("https://upload.wikimedia.org/wikipedia/commons/c/c9/JSON_vector_logo.svg", width=80)
st.sidebar.title("Schema Catalog")
st.sidebar.info(source_info)

st.sidebar.markdown("### Catalog Quick Stats")
st.sidebar.metric("Total Schemas", len(schemas))
st.sidebar.metric("Unique Domains", len(domain_counts))
st.sidebar.metric("File Match Patterns", total_patterns)

st.sidebar.markdown("---")
st.sidebar.markdown("### About")
st.sidebar.write(
    "This application allows you to search, explore, and test file matches against the "
    "JSON Schema Catalog. It helps developers find the correct schema definitions for their configuration files."
)

# Main App Layout
st.markdown('<div class="main-header">JSON Schema Catalog Explorer</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Search, analyze, and test file matches against standard JSON schemas</div>', unsafe_allow_html=True)

# Tabs
tab_search, tab_tester, tab_stats = st.tabs([
    "🔍 Search & Explore", 
    "🧪 File Match Tester", 
    "📊 Catalog Insights"
])

# TAB 1: Search & Explore
with tab_search:
    st.subheader("Search Schemas")
    
    col_search, col_domain_filter = st.columns([2, 1])
    
    with col_search:
        search_query = st.text_input("Search by name, description, or file pattern...", placeholder="e.g., docker, package, .json")
    
    with col_domain_filter:
        top_domains = [d[0] for d in domain_counts.most_common(15)]
        domain_filter = st.multiselect("Filter by Provider Domain", options=["All"] + top_domains, default="All")

    # Filter logic
    filtered_schemas = []
    for schema in schemas:
        name = schema.get("name", "").lower()
        desc = schema.get("description", "").lower()
        url = schema.get("url", "")
        domain = get_domain(url)
        patterns = [p.lower() for p in schema.get("fileMatch", [])]
        
        # Domain filter
        if "All" not in domain_filter and domain_filter:
            if domain not in domain_filter:
                continue
                
        # Search query filter
        if search_query:
            q = search_query.lower()
            matches_name = q in name
            matches_desc = q in desc
            matches_pattern = any(q in pat for pat in patterns)
            matches_url = q in url.lower()
            
            if not (matches_name or matches_desc or matches_pattern or matches_url):
                continue
                
        filtered_schemas.append(schema)

    st.write(f"Showing **{len(filtered_schemas)}** of **{len(schemas)}** schemas")

    # Display results
    if not filtered_schemas:
        st.warning("No schemas found matching your criteria.")
    else:
        for schema in filtered_schemas[:100]:  # Limit to 100 for performance
            name = schema.get("name", "Unnamed Schema")
            desc = schema.get("description", "No description provided.")
            url = schema.get("url", "#")
            patterns = schema.get("fileMatch", [])
            domain = get_domain(url)
            
            with st.container():
                st.markdown(f"""
                <div class="card">
                    <div class="card-title">{name}</div>
                    <div class="card-desc">{desc}</div>
                    <div>
                        <span class="tag tag-url">🌐 {domain}</span>
                        {" ".join([f'<span class="tag">📄 {p}</span>' for p in patterns[:5]])}
                        {f'<span class="tag">+{len(patterns)-5} more</span>' if len(patterns) > 5 else ''}
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                # Expandable details
                with st.expander(f"View Details & Raw Schema Link for {name}"):
                    col1, col2 = st.columns([3, 1])
                    with col1:
                        st.markdown(f"**Schema URL:** [{url}]({url})")
                        if patterns:
                            st.markdown(f"**All File Matches:** `{', '.join(patterns)}`")
                    with col2:
                        if url.startswith("http"):
                            st.link_button("Open Schema JSON", url, use_container_width=True)
                            
                            # Fetch preview button
                            if st.button("Preview Schema Structure", key=f"prev_{name}"):
                                try:
                                    res = requests.get(url, timeout=3)
                                    if res.status_code == 200:
                                        st.json(res.json())
                                    else:
                                        st.error("Could not fetch schema preview.")
                                except Exception as e:
                                    st.error(f"Error fetching preview: {e}")
                st.markdown("<br>", unsafe_allow_html=True)
        
        if len(filtered_schemas) > 100:
            st.info("Showing the first 100 results. Please refine your search query to find more specific schemas.")

# TAB 2: File Match Tester
with tab_tester:
    st.subheader("File Match Tester")
    st.write("Input a filename to find which JSON schemas match it based on their defined file patterns.")
    
    test_filename = st.text_input("Enter a filename to test:", placeholder="e.g., docker-compose.yml, package.json, tsconfig.json")
    
    if test_filename:
        test_filename_clean = test_filename.strip()
        matches = []
        
        for schema in schemas:
            patterns = schema.get("fileMatch", [])
            matched_patterns = []
            for pattern in patterns:
                # Use fnmatch for glob pattern matching
                if fnmatch.fnmatch(test_filename_clean.lower(), pattern.lower()):
                    matched_patterns.append(pattern)
            
            if matched_patterns:
                matches.append({
                    "schema": schema,
                    "matched_patterns": matched_patterns
                })
                
        if matches:
            st.success(f"Found **{len(matches)}** matching schema(s) for `{test_filename_clean}`!")
            
            for match in matches:
                schema = match["schema"]
                matched_pats = match["matched_patterns"]
                
                st.markdown(f"""
                <div class="card" style="border-left-color: #10B981;">
                    <div class="card-title">✅ {schema.get('name')}</div>
                    <div class="card-desc">{schema.get('description', 'No description')}</div>
                    <div style="margin-top: 0.5rem;">
                        <strong>Matched Pattern(s):</strong> {" ".join([f'<span class="tag" style="background-color: #D1FAE5; color: #065F46;">{p}</span>' for p in matched_pats])}
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                with st.expander(f"View Schema Details for {schema.get('name')}"):
                    st.write(f"**URL:** {schema.get('url')}")
                    st.write(f"**All File Matches:** {', '.join(schema.get('fileMatch', []))}")
                    if schema.get('url'):
                        st.link_button("Go to Schema Source", schema.get('url'))
        else:
            st.error(f"No schemas in the catalog match the filename `{test_filename_clean}`.")
            st.info("Try testing common filenames like `package.json`, `docker-compose.yml`, `.prettierrc`, or `tsconfig.json`.")

# TAB 3: Catalog Insights & Analytics
with tab_stats:
    st.subheader("Catalog Insights & Analytics")
    
    col_stat1, col_stat2 = st.columns(2)
    
    with col_stat1:
        st.markdown("### Top Schema Providers (Domains)")
        # Convert to DataFrame
        df_domains = pd.DataFrame(domain_counts.most_common(15), columns=["Domain", "Count"])
        st.bar_chart(data=df_domains, x="Domain", y="Count", use_container_width=True)
        
        with st.expander("View Domain Distribution Table"):
            st.dataframe(df_domains, use_container_width=True)
            
    with col_stat2:
        st.markdown("### Most Common File Extensions / Patterns")
        # Convert to DataFrame
        df_ext = pd.DataFrame(ext_counts.most_common(15), columns=["Extension", "Count"])
        st.bar_chart(data=df_ext, x="Extension", y="Count", use_container_width=True)
        
        with st.expander("View Extension Distribution Table"):
            st.dataframe(df_ext, use_container_width=True)

    st.markdown("---")
    st.markdown("### Schema Catalog Raw Data Explorer")
    st.write("Explore the raw catalog data directly in a tabular format.")
    
    # Build a clean dataframe for display
    table_data = []
    for schema in schemas:
        table_data.append({
            "Name": schema.get("name", ""),
            "Description": schema.get("description", ""),
            "URL": schema.get("url", ""),
            "File Matches": ", ".join(schema.get("fileMatch", [])),
            "Domain": get_domain(schema.get("url", ""))
        })
    
    df_table = pd.DataFrame(table_data)
    st.dataframe(df_table, use_container_width=True)