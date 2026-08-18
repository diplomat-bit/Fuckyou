import streamlit as st
import pandas as pd
import requests
import json
import time
import uuid
from datetime import datetime

# Configuration
CSV_PATH = "api/activate-and-deactivate-card.csv"
DEFAULT_HOST = "http://localhost:8080"

st.set_page_config(page_title="Card Lifecycle Compliance Dashboard", layout="wide")

def load_test_cases():
    try:
        return pd.read_csv(CSV_PATH)
    except Exception as e:
        st.error(f"Error loading CSV: {e}")
        return pd.DataFrame()

def execute_test(row, base_url):
    url = f"{base_url}{row['endpoint']}"
    headers = {
        "Content-Type": "application/json",
        "Citiuuid": str(uuid.uuid4()),
        "Uuid": str(uuid.uuid4())
    }
    payload = json.loads(row['payload'])
    
    start_time = time.time()
    try:
        response = requests.request(row['method'], url, json=payload, headers=headers, timeout=5)
        latency = (time.time() - start_time) * 1000
        
        expected_status = int(row['expected_status'])
        passed = response.status_code == expected_status
        
        # Validate error payload if applicable
        if 'expected_error_code' in row and pd.notna(row['expected_error_code']):
            resp_json = response.json()
            passed = passed and resp_json.get('errorCode') == row['expected_error_code']
            
        return {
            "status": "PASS" if passed else "FAIL",
            "actual_status": response.status_code,
            "latency": f"{latency:.2f}ms",
            "response": response.json()
        }
    except Exception as e:
        return {"status": "ERROR", "actual_status": "N/A", "latency": "0ms", "response": str(e)}

st.title("💳 Card Lifecycle Compliance Checker")

host = st.text_input("Target Host URL", DEFAULT_HOST)
df = load_test_cases()

if not df.empty:
    if st.button("Run All Compliance Tests"):
        results = []
        progress_bar = st.progress(0)
        for i, row in df.iterrows():
            res = execute_test(row, host)
            results.append(res)
            progress_bar.progress((i + 1) / len(df))
        
        df_results = pd.concat([df, pd.DataFrame(results)], axis=1)
        
        # Dashboard Metrics
        col1, col2, col3 = st.columns(3)
        col1.metric("Total Tests", len(df_results))
        col2.metric("Pass Rate", f"{(df_results['status'] == 'PASS').mean()*100:.1f}%")
        col3.metric("Avg Latency", f"{df_results['latency'].str.replace('ms','').astype(float).mean():.2f}ms")
        
        st.subheader("Detailed Results")
        st.dataframe(df_results[['test_id', 'status', 'actual_status', 'latency', 'response']])
        
        # Export
        csv = df_results.to_csv(index=False).encode('utf-8')
        st.download_button("Download Report", csv, "compliance_report.csv", "text/csv")
    else:
        st.write("Test cases loaded. Click the button above to execute against the target host.")
        st.dataframe(df)
else:
    st.warning("No test cases found. Please ensure `api/activate-and-deactivate-card.csv` exists.")