import streamlit as st
import hashlib
import xml.etree.ElementTree as ET
import pandas as pd
import io
import binascii
from datetime import datetime

# Set page configuration
st.set_page_config(
    page_title="CitiConnect Statement Integrity Suite",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional look
st.markdown("""
<style>
    .reportview-container {
        background: #f5f7f9;
    }
    .main .block-container {
        padding-top: 2rem;
    }
    .stAlert {
        border-radius: 8px;
    }
    .metric-card {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        border: 1px solid #eef2f6;
        margin-bottom: 15px;
    }
    .hash-text {
        font-family: 'Courier New', Courier, monospace;
        word-break: break-all;
        background-color: #f1f3f5;
        padding: 8px;
        border-radius: 4px;
        font-size: 0.9rem;
    }
</style>
""", unsafe_allow_html=True)

# Helper Functions
def calculate_sha512(file_bytes):
    """Calculate SHA-512 checksum of file bytes."""
    sha512_hash = hashlib.sha512()
    sha512_hash.update(file_bytes)
    return sha512_hash.hexdigest()

def parse_citiconnect_xml(xml_bytes):
    """Parse CitiConnect XML and extract file details ignoring namespaces."""
    try:
        root = ET.fromstring(xml_bytes)
        
        # Helper to find tags ignoring namespaces
        def find_in_tree(element, target_tag):
            results = []
            for elem in element.iter():
                clean_tag = elem.tag.split('}')[-1]
                if clean_tag == target_tag:
                    results.append(elem.text)
            return results[0] if results else None

        file_name = find_in_tree(root, "fileName") or find_in_tree(root, "FileName") or "Unknown"
        checksum = find_in_tree(root, "fileCheckSum") or find_in_tree(root, "FileCheckSum") or find_in_tree(root, "checksum")
        file_size = find_in_tree(root, "fileSize") or find_in_tree(root, "FileSize") or "Unknown"
        algorithm = find_in_tree(root, "checksumAlgorithm") or find_in_tree(root, "Algorithm") or "SHA-512"
        
        return {
            "success": True,
            "file_name": file_name.strip() if file_name else "Unknown",
            "expected_checksum": checksum.strip().lower() if checksum else None,
            "file_size": file_size.strip() if file_size else "Unknown",
            "algorithm": algorithm.strip() if algorithm else "SHA-512"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_hex_dump(file_bytes, max_bytes=256):
    """Generate a hex dump of the first N bytes of a file."""
    hex_dump = []
    for i in range(0, min(len(file_bytes), max_bytes), 16):
        chunk = file_bytes[i:i+16]
        hex_vals = ' '.join(f'{b:02x}' for b in chunk)
        ascii_vals = ''.join(chr(b) if 32 <= b < 127 else '.' for b in chunk)
        hex_dump.append(f"{i:08x}  {hex_vals:<48}  |{ascii_vals}|")
    return '\n'.join(hex_dump)

# Sidebar Navigation
st.sidebar.title("CitiConnect Suite")
st.sidebar.image("https://img.icons8.com/fluency/96/000000/shield-with-key.png", width=80)
st.sidebar.markdown("### Financial Statement Verification & Security Tools")

app_mode = st.sidebar.radio(
    "Select Application Module",
    [
        "1. Single Statement Verifier",
        "2. Batch Integrity Scanner",
        "3. CitiConnect XML Generator",
        "4. Security & Tamper Analyzer"
    ]
)

st.sidebar.markdown("---")
st.sidebar.markdown("### About CitiConnect Verification")
st.sidebar.info(
    "CitiConnect statement delivery uses SHA-512 checksums embedded in companion XML metadata files "
    "to guarantee non-repudiation and verify that financial statements have not been altered during transit."
)

# ==========================================
# APP 1: SINGLE STATEMENT VERIFIER
# ==========================================
if app_mode == "1. Single Statement Verifier":
    st.title("🛡️ CitiConnect Single Statement Verifier")
    st.write("Upload a CitiConnect XML metadata file and its corresponding statement file to verify integrity.")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("1. Upload Metadata (XML)")
        xml_file = st.file_uploader("Upload CitiConnect XML File", type=["xml"], key="single_xml")
        
        # Sample XML Generator for quick testing
        if st.button("Load Sample XML & Statement Data"):
            sample_text = b"CONFIDENTIAL FINANCIAL STATEMENT - CITI BANK 2023"
            sample_hash = calculate_sha512(sample_text)
            sample_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:citi:connect:statement:retrieval">
    <FileDetails>
        <fileName>citi_statement_oct_2023.pdf</fileName>
        <fileSize>{len(sample_text)}</fileSize>
        <fileCheckSum>{sample_hash}</fileCheckSum>
        <checksumAlgorithm>SHA-512</checksumAlgorithm>
    </FileDetails>
</Document>"""
            st.session_state['sample_xml'] = sample_xml.encode('utf-8')
            st.session_state['sample_statement'] = sample_text
            st.success("Sample loaded! Download/copy them below or proceed with verification.")

    with col2:
        st.subheader("2. Upload Statement File")
        statement_file = st.file_uploader("Upload Statement File (PDF, TXT, CSV, etc.)", key="single_statement")

    # Handle Sample Data Injection
    if 'sample_xml' in st.session_state and not xml_file:
        xml_file = io.BytesIO(st.session_state['sample_xml'])
        xml_file.name = "sample_metadata.xml"
    if 'sample_statement' in st.session_state and not statement_file:
        statement_file = io.BytesIO(st.session_state['sample_statement'])
        statement_file.name = "citi_statement_oct_2023.pdf"

    if xml_file and statement_file:
        st.markdown("---")
        st.subheader("Verification Results")

        # Parse XML
        xml_bytes = xml_file.read()
        parsed_xml = parse_citiconnect_xml(xml_bytes)

        if parsed_xml["success"]:
            # Calculate Checksum
            statement_bytes = statement_file.read()
            calculated_hash = calculate_sha512(statement_bytes)
            expected_hash = parsed_xml["expected_checksum"]

            # Display Metadata
            m_col1, m_col2, m_col3 = st.columns(3)
            with m_col1:
                st.metric("XML Declared Filename", parsed_xml["file_name"])
            with m_col2:
                st.metric("Uploaded Filename", statement_file.name)
            with m_col3:
                st.metric("Algorithm", parsed_xml["algorithm"])

            # Comparison
            if expected_hash:
                match = calculated_hash.lower() == expected_hash.lower()
                
                if match:
                    st.success("✅ INTEGRITY VERIFIED: The statement file matches the CitiConnect XML checksum perfectly!")
                else:
                    st.error("🚨 INTEGRITY FAILURE: The calculated checksum does NOT match the expected XML checksum. The file may have been tampered with or corrupted.")

                # Detailed Hash View
                st.markdown("### Checksum Comparison Details")
                st.markdown(f"**Expected Checksum (from XML):**")
                st.markdown(f"<div class='hash-text'>{expected_hash}</div>", unsafe_allow_html=True)
                
                st.markdown(f"**Calculated Checksum (from File):**")
                st.markdown(f"<div class='hash-text'>{calculated_hash}</div>", unsafe_allow_html=True)
                
                # Additional Warning if filenames differ
                if parsed_xml["file_name"].lower() != statement_file.name.lower():
                    st.warning(f"⚠️ Filename Mismatch: The XML expected '{parsed_xml['file_name']}' but you uploaded '{statement_file.name}'. However, the cryptographic hash verification is what determines actual integrity.")
            else:
                st.error("Could not find '<fileCheckSum>' or equivalent tag in the uploaded XML file.")
        else:
            st.error(f"Failed to parse XML: {parsed_xml['error']}")

    elif xml_file or statement_file:
        st.info("Please upload both the XML metadata file and the corresponding statement file to run verification.")

# ==========================================
# APP 2: BATCH INTEGRITY SCANNER
# ==========================================
elif app_mode == "2. Batch Integrity Scanner":
    st.title("🗂️ Batch Statement Integrity Scanner")
    st.write("Upload multiple XML files and multiple statement files. The scanner will automatically pair them and verify integrity in bulk.")

    col1, col2 = st.columns(2)
    with col1:
        xml_files = st.file_uploader("Upload CitiConnect XML Files", type=["xml"], accept_multiple_files=True, key="batch_xml")
    with col2:
        statement_files = st.file_uploader("Upload Statement Files", accept_multiple_files=True, key="batch_statements")

    if xml_files and statement_files:
        st.markdown("---")
        st.subheader("Batch Processing Results")

        # Parse all XMLs
        xml_database = {}
        for x_file in xml_files:
            x_bytes = x_file.read()
            parsed = parse_citiconnect_xml(x_bytes)
            if parsed["success"] and parsed["expected_checksum"]:
                xml_database[parsed["file_name"].lower()] = {
                    "expected_hash": parsed["expected_checksum"],
                    "xml_source": x_file.name,
                    "declared_size": parsed["file_size"]
                }

        # Process Statement Files
        results = []
        for s_file in statement_files:
            s_bytes = s_file.read()
            calc_hash = calculate_sha512(s_bytes)
            s_name_lower = s_file.name.lower()

            # Try to find matching XML metadata
            matched_meta = xml_database.get(s_name_lower)
            
            if matched_meta:
                expected = matched_meta["expected_hash"]
                status = "✅ Match" if calc_hash.lower() == expected.lower() else "🚨 Mismatch"
                xml_src = matched_meta["xml_source"]
            else:
                # Try fuzzy matching (if XML filename is contained in statement filename or vice versa)
                matched_key = None
                for k in xml_database.keys():
                    if k in s_name_lower or s_name_lower in k:
                        matched_key = k
                        break
                
                if matched_key:
                    expected = xml_database[matched_key]["expected_hash"]
                    status = "✅ Match (Fuzzy)" if calc_hash.lower() == expected.lower() else "🚨 Mismatch (Fuzzy)"
                    xml_src = xml_database[matched_key]["xml_source"]
                else:
                    expected = "N/A"
                    status = "❓ Missing XML Metadata"
                    xml_src = "N/A"

            results.append({
                "Statement File": s_file.name,
                "Matched XML": xml_src,
                "Expected Hash (SHA-512)": expected,
                "Calculated Hash (SHA-512)": calc_hash,
                "Status": status
            })

        # Display Results Table
        df = pd.DataFrame(results)
        
        # Style helper
        def color_status(val):
            if "Match" in val:
                return 'background-color: #d4edda; color: #155724'
            elif "Mismatch" in val:
                return 'background-color: #f8d7da; color: #721c24'
            return 'background-color: #fff3cd; color: #856404'

        st.dataframe(df.style.applymap(color_status, subset=['Status']), use_container_width=True)

        # Summary Metrics
        total = len(results)
        matches = sum(1 for r in results if "Match" in r["Status"])
        mismatches = sum(1 for r in results if "Mismatch" in r["Status"])
        missing = sum(1 for r in results if "Missing" in r["Status"])

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Total Files Processed", total)
        c2.metric("Successful Matches", matches)
        c3.metric("Mismatches / Failures", mismatches)
        c4.metric("Missing Metadata", missing)

        # Export Report
        csv = df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Verification Report (CSV)",
            data=csv,
            file_name=f"citiconnect_verification_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )
    else:
        st.info("Please upload both XML metadata files and Statement files to begin batch scanning.")

# ==========================================
# APP 3: CITICONNECT XML GENERATOR
# ==========================================
elif app_mode == "3. CitiConnect XML Generator":
    st.title("✍️ CitiConnect XML Generator & Signer")
    st.write("Generate valid CitiConnect statement retrieval XML metadata files with calculated SHA-512 checksums for testing or integration purposes.")

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Statement Details")
        doc_name = st.text_input("Statement Filename", "citi_statement_2023_Q4.pdf")
        
        hash_source = st.radio("How to generate SHA-512 Checksum?", ["Upload actual file to hash", "Enter custom hash manually", "Generate random mock hash"])
        
        calculated_hash = ""
        file_size = 102400 # Default mock size
        
        if hash_source == "Upload actual file to hash":
            uploaded_source = st.file_uploader("Upload File to Hash", key="gen_source")
            if uploaded_source:
                file_bytes = uploaded_source.read()
                calculated_hash = calculate_sha512(file_bytes)
                file_size = len(file_bytes)
                st.success(f"Calculated Hash: {calculated_hash[:15]}...")
        elif hash_source == "Enter custom hash manually":
            calculated_hash = st.text_input("Enter SHA-512 Hash", "").strip()
            file_size = st.number_input("File Size (Bytes)", min_value=0, value=102400)
        else:
            calculated_hash = hashlib.sha512(str(datetime.now()).encode()).hexdigest()
            st.info(f"Generated Mock Hash: {calculated_hash[:15]}...")

        # Additional CitiConnect Fields
        msg_id = st.text_input("Message ID (MsgId)", f"CITI-RET-{datetime.now().strftime('%Y%m%d%H%M%S')}")
        retrieval_date = st.date_input("Retrieval Date", datetime.now())

    with col2:
        st.subheader("Generated CitiConnect XML")
        
        # Construct XML
        xml_template = f"""<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:citi:connect:statement:retrieval" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Header>
        <MsgId>{msg_id}</MsgId>
        <CreDtTm>{retrieval_date.strftime('%Y-%m-%dT%H:%M:%S')}.000Z</CreDtTm>
    </Header>
    <FileDetails>
        <fileName>{doc_name}</fileName>
        <fileSize>{file_size}</fileSize>
        <fileCheckSum>{calculated_hash}</fileCheckSum>
        <checksumAlgorithm>SHA-512</checksumAlgorithm>
    </FileDetails>
</Document>"""

        st.code(xml_template, language="xml")
        
        # Download Button
        st.download_button(
            label="📥 Download Generated XML",
            data=xml_template,
            file_name=f"{doc_name.split('.')[0]}_metadata.xml",
            mime="application/xml"
        )

# ==========================================
# APP 4: SECURITY & TAMPER ANALYZER
# ==========================================
elif app_mode == "4. Security & Tamper Analyzer":
    st.title("🔬 Statement Tamper & Security Analyzer")
    st.write("Explore the cryptographic strength of SHA-512 and see how even a single-character modification completely changes the file signature (Avalanche Effect).")

    uploaded_file = st.file_uploader("Upload a sample text or PDF file to analyze", key="tamper_file")

    if uploaded_file:
        file_bytes = uploaded_file.read()
        original_hash = calculate_sha512(file_bytes)

        st.markdown("---")
        col1, col2 = st.columns(2)

        with col1:
            st.subheader("Original File Analysis")
            st.metric("File Size", f"{len(file_bytes)} Bytes")
            st.markdown("**Original SHA-512 Hash:**")
            st.markdown(f"<div class='hash-text'>{original_hash}</div>", unsafe_allow_html=True)

            # Hex Dump
            st.markdown("**Hex Dump (First 128 Bytes):**")
            st.code(get_hex_dump(file_bytes, 128), language="text")

        with col2:
            st.subheader("Simulate Tampering / Modification")
            tamper_type = st.selectbox(
                "Select Tampering Method",
                [
                    "Append a single space character",
                    "Modify a byte in the header",
                    "Append malicious payload (mock)"
                ]
            )

            # Apply modification
            modified_bytes = bytearray(file_bytes)
            if tamper_type == "Append a single space character":
                modified_bytes.extend(b' ')
            elif tamper_type == "Modify a byte in the header" and len(modified_bytes) > 4:
                # Flip a bit in the 4th byte
                modified_bytes[4] = modified_bytes[4] ^ 0xFF
            elif tamper_type == "Append malicious payload (mock)":
                modified_bytes.extend(b'\n//MOCK_MALWARE_PAYLOAD_STUB\n')

            modified_hash = calculate_sha512(bytes(modified_bytes))

            st.metric("Modified File Size", f"{len(modified_bytes)} Bytes")
            st.markdown("**Modified SHA-512 Hash:**")
            st.markdown(f"<div class='hash-text'>{modified_hash}</div>", unsafe_allow_html=True)

            # Hex Dump of Modified
            st.markdown("**Modified Hex Dump (First 128 Bytes):**")
            st.code(get_hex_dump(bytes(modified_bytes), 128), language="text")

        # Security Explanation
        st.markdown("---")
        st.subheader("🛡️ Security Insights: The Avalanche Effect")
        
        # Calculate differences
        diff_chars = sum(1 for a, b in zip(original_hash, modified_hash) if a != b)
        
        st.info(
            f"Notice that although the file modification was extremely minor, **{diff_chars} out of 128 characters** "
            "in the SHA-512 hex signature changed. This is known as the **Avalanche Effect** in cryptography. "
            "It ensures that any unauthorized modification, no matter how small, is immediately detectable by the CitiConnect verifier."
        )