import streamlit as st
import xml.etree.ElementTree as ET
import uuid
from datetime import datetime
import random

# Configuration for the Mock Gateway
st.set_page_config(page_title="CitiConnect Integration Gateway", layout="wide")

def generate_mock_xml(account_id, statement_date):
    """Generates a compliant CitiConnect-style XML statement response."""
    request_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<CitiConnectResponse>
    <Header>
        <RequestId>{request_id}</RequestId>
        <Timestamp>{timestamp}</Timestamp>
        <Status>SUCCESS</Status>
    </Header>
    <Payload>
        <AccountDetails>
            <AccountId>{account_id}</AccountId>
            <Currency>USD</Currency>
            <StatementDate>{statement_date}</StatementDate>
            <Balance>{random.uniform(1000.0, 50000.0):.2f}</Balance>
        </AccountDetails>
        <Transactions>
            <Transaction>
                <Id>TXN-{random.randint(1000, 9999)}</Id>
                <Amount>-{random.uniform(10.0, 500.0):.2f}</Amount>
                <Description>Merchant Purchase</Description>
            </Transaction>
        </Transactions>
    </Payload>
</CitiConnectResponse>"""
    return xml_content

def parse_xml_metadata(xml_string):
    """Parses the XML to extract metadata for display."""
    root = ET.fromstring(xml_string)
    metadata = {
        "Request ID": root.find(".//RequestId").text,
        "Status": root.find(".//Status").text,
        "Account ID": root.find(".//AccountId").text,
        "Balance": root.find(".//Balance").text
    }
    return metadata

# App UI
st.title("🏦 CitiConnect Integration Gateway")
st.markdown("Simulate statement retrieval requests and inspect raw XML payloads.")

col1, col2 = st.columns([1, 2])

with col1:
    st.subheader("Request Parameters")
    account_id = st.text_input("Account ID", value="CITI-8892-X")
    statement_date = st.date_input("Statement Date", value=datetime.now())
    
    if st.button("Retrieve Statement"):
        st.session_state.xml_data = generate_mock_xml(account_id, statement_date.isoformat())

with col2:
    if "xml_data" in st.session_state:
        st.subheader("Gateway Response")
        
        # Display Metadata
        metadata = parse_xml_metadata(st.session_state.xml_data)
        st.table(metadata)
        
        # Display Raw XML
        st.subheader("Raw XML Payload")
        st.code(st.session_state.xml_data, language="xml")
        
        # Download button
        st.download_button(
            label="Download XML Response",
            data=st.session_state.xml_data,
            file_name="citi_response.xml",
            mime="application/xml"
        )
    else:
        st.info("Configure parameters and click 'Retrieve Statement' to see the gateway output.")

# Footer
st.markdown("---")
st.caption("CitiConnect Integration Gateway v1.0.0 | Mock Environment")