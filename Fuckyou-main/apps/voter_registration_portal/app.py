import streamlit as st
import pandas as pd
import datetime
import uuid
import random

# Set page configuration
st.set_page_config(
    page_title="State DMV & Voter Registration Portal",
    page_icon="🗳️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional state-portal styling
st.markdown("""
    <style>
    .main-header {
        font-size: 2.2rem;
        color: #1e3a8a;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #4b5563;
        margin-bottom: 2rem;
    }
    .card {
        background-color: #f8fafc;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 5px solid #1e3a8a;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .card-warning {
        background-color: #fffbeb;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 5px solid #d97706;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .card-success {
        background-color: #f0fdf4;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border-left: 5px solid #16a34a;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .metric-val {
        font-size: 1.8rem;
        font-weight: bold;
        color: #1e3a8a;
    }
    </style>
""", unsafe_allowed_html=True)

# Initialize Session State for persistent data across the 4 sub-apps
if 'initialized' not in st.session_state:
    st.session_state.initialized = True
    
    # Mock registrations database
    st.session_state.registrations = [
        {
            "id": "REG-8821",
            "name": "Eleanor Vance",
            "dob": datetime.date(1982, 4, 14),
            "license": "DL-9928112",
            "ssn": "4432",
            "address": "104 Oak Lane, Capital City, ST 12001",
            "party": "Independent",
            "citizenship_status": "Verified",
            "status": "Approved",
            "accommodation": "None",
            "created_at": datetime.datetime.now() - datetime.timedelta(hours=12)
        },
        {
            "id": "REG-4092",
            "name": "Marcus Aurelius",
            "dob": datetime.date(1975, 11, 23),
            "license": "DL-4412990",
            "ssn": "8812",
            "address": "456 Forum Way, Westside, ST 12005",
            "party": "Democratic",
            "citizenship_status": "Unverified",
            "status": "Provisional (Pending Cure)",
            "accommodation": "Mobile Unit Requested",
            "created_at": datetime.datetime.now() - datetime.timedelta(hours=23) # 25 hours left
        },
        {
            "id": "REG-1102",
            "name": "Sarah Jenkins",
            "dob": datetime.date(1995, 8, 30),
            "license": "DL-8830123",
            "ssn": "1092",
            "address": "789 Pine Road, Eastside, ST 12009",
            "party": "Republican",
            "citizenship_status": "Unverified",
            "status": "Provisional (Expired)",
            "accommodation": "None",
            "created_at": datetime.datetime.now() - datetime.timedelta(hours=50) # Expired (48h window passed)
        }
    ]
    
    # Mock Gateway Logs
    st.session_state.gateway_logs = [
        {"timestamp": datetime.datetime.now() - datetime.timedelta(hours=12), "voter": "Eleanor Vance", "status": "SUCCESS", "details": "SAVE Database Match: US Citizen confirmed."},
        {"timestamp": datetime.datetime.now() - datetime.timedelta(hours=23), "voter": "Marcus Aurelius", "status": "FAILED", "details": "No matching record in DHS/SAVE database."},
        {"timestamp": datetime.datetime.now() - datetime.timedelta(hours=50), "voter": "Sarah Jenkins", "status": "FAILED", "details": "No matching record in DHS/SAVE database."}
    ]
    
    # Mock Mobile Unit Schedule
    st.session_state.mobile_units = [
        {"id": "MOB-101", "voter": "Marcus Aurelius", "address": "456 Forum Way, Westside, ST 12005", "date": datetime.date.today() + datetime.timedelta(days=1), "time": datetime.time(10, 0), "status": "Scheduled"}
    ]

# Sidebar Navigation representing the 4 integrated apps
st.sidebar.image("https://img.icons8.com/fluency/96/000000/government.png", width=80)
st.sidebar.title("State Election Portal")
st.sidebar.subheader("DMV & Voter Registration Suite")

app_mode = st.sidebar.radio(
    "Select Application Module",
    [
        "📝 DMV Voter Registration Intake",
        "🛡️ Citizenship Verification Gateway",
        "⏳ Provisional Ballot & Cure Tracker",
        "♿ Disability Accommodations & Mobile Units"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    "**System Status:** 🟢 Online\n\n"
    "**Gateway Connection:** Secure (SSL)\n\n"
    "**Cure Window Policy:** 48 Hours"
)

# Helper function to generate unique IDs
def generate_id(prefix="REG"):
    return f"{prefix}-{random.randint(1000, 9999)}"


# ==========================================
# APP 1: DMV Voter Registration Intake
# ==========================================
if app_mode == "📝 DMV Voter Registration Intake":
    st.markdown('<div class="main-header">DMV Integrated Voter Registration Intake</div>', unsafe_allowed_html=True)
    st.markdown('<div class="sub-header">Official portal for state DMV agents to register eligible citizens during licensing transactions.</div>', unsafe_allowed_html=True)

    col1, col2 = st.columns([2, 1])

    with col1:
        st.subheader("Voter Application Form")
        with st.form("registration_form", clear_on_submit=True):
            name = st.text_input("Full Legal Name", placeholder="John Doe")
            
            c1, c2 = st.columns(2)
            with c1:
                dob = st.date_input("Date of Birth", min_value=datetime.date(1900, 1, 1), max_value=datetime.date.today() - datetime.timedelta(days=18*365))
            with c2:
                license_num = st.text_input("DMV Driver's License / ID Number", placeholder="DL-XXXXXXX")
                
            c3, c4 = st.columns(2)
            with c3:
                ssn = st.text_input("Social Security Number (Last 4 Digits)", max_chars=4, placeholder="XXXX")
            with c4:
                party = st.selectbox("Party Affiliation", ["Democratic", "Republican", "Independent", "Green", "Libertarian", "Unaffiliated"])
                
            address = st.text_area("Residential Address", placeholder="123 Main St, City, ST, Zip")
            
            st.markdown("---")
            st.subheader("Declarations & Accommodations")
            
            citizenship_declared = st.checkbox("I declare under penalty of perjury that I am a citizen of the United States and eligible to register to vote.")
            
            accommodation_needed = st.checkbox("Voter requires disability accommodations (e.g., remote document upload, mobile voting unit).")
            
            accommodation_type = "None"
            if accommodation_needed:
                accommodation_type = st.selectbox(
                    "Select Accommodation Type",
                    ["Remote Document Upload", "Mobile Unit Requested", "Sign Language Interpreter", "Wheelchair Access"]
                )
            
            st.markdown("---")
            st.markdown("**Simulation Settings (For Testing & Demo)**")
            force_fail_citizenship = st.checkbox("Simulate Citizenship Verification Failure (Triggers Provisional Status)")

            submit_btn = st.form_submit_button("Submit Registration & Verify Citizenship")

        if submit_btn:
            if not name or not license_num or not ssn or not address:
                st.error("Please fill out all required fields.")
            elif not citizenship_declared:
                st.error("The voter must declare US citizenship to proceed with registration.")
            else:
                # Process registration
                reg_id = generate_id()
                timestamp = datetime.datetime.now()
                
                # Simulate Gateway Check
                if force_fail_citizenship:
                    citizenship_status = "Unverified"
                    status = "Provisional (Pending Cure)"
                    gateway_status = "FAILED"
                    gateway_details = "No matching record in DHS/SAVE database. Flagged for 48-hour cure window."
                else:
                    citizenship_status = "Verified"
                    status = "Approved"
                    gateway_status = "SUCCESS"
                    gateway_details = "SAVE Database Match: US Citizen confirmed."

                # Save to session state
                new_reg = {
                    "id": reg_id,
                    "name": name,
                    "dob": dob,
                    "license": license_num,
                    "ssn": ssn,
                    "address": address,
                    "party": party,
                    "citizenship_status": citizenship_status,
                    "status": status,
                    "accommodation": accommodation_type,
                    "created_at": timestamp
                }
                st.session_state.registrations.append(new_reg)
                
                # Log to Gateway
                st.session_state.gateway_logs.append({
                    "timestamp": timestamp,
                    "voter": name,
                    "status": gateway_status,
                    "details": gateway_details
                })

                # Show results
                if status == "Approved":
                    st.balloons()
                    st.markdown(f"""
                        <div class="card-success">
                            <h4>✅ Registration Approved Successfully!</h4>
                            <p><strong>Voter ID:</strong> {reg_id}</p>
                            <p><strong>Citizenship Status:</strong> Verified via Real-Time Gateway</p>
                            <p>The voter has been added to the active rolls.</p>
                        </div>
                    """, unsafe_allowed_html=True)
                else:
                    st.markdown(f"""
                        <div class="card-warning">
                            <h4>⚠️ Citizenship Verification Failed - Provisional Status Issued</h4>
                            <p><strong>Voter ID:</strong> {reg_id}</p>
                            <p><strong>Status:</strong> Provisional (Pending Cure)</p>
                            <p>The real-time citizenship check could not verify status. The voter has <strong>48 hours</strong> to cure this exception at the local election office or via the online portal.</p>
                        </div>
                    """, unsafe_allowed_html=True)

    with col2:
        st.subheader("Recent Registrations")
        if st.session_state.registrations:
            for reg in reversed(st.session_state.registrations[-5:]):
                status_color = "green" if reg["status"] == "Approved" else "orange" if "Pending" in reg["status"] else "red"
                st.markdown(f"""
                    <div style="border: 1px solid #e2e8f0; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                        <strong>{reg['name']}</strong> ({reg['id']})<br>
                        <small>Party: {reg['party']} | Status: <span style="color:{status_color}; font-weight:bold;">{reg['status']}</span></small><br>
                        <small>Submitted: {reg['created_at'].strftime('%Y-%m-%d %H:%M')}</small>
                    </div>
                """, unsafe_allowed_html=True)
        else:
            st.info("No registrations submitted yet in this session.")


# ==========================================
# APP 2: Citizenship Verification Gateway
# ==========================================
elif app_mode == "🛡️ Citizenship Verification Gateway":
    st.markdown('<div class="main-header">Citizenship Verification Gateway & Audit Log</div>', unsafe_allowed_html=True)
    st.markdown('<div class="sub-header">Real-time interface with the Department of Homeland Security (DHS) Systematic Alien Verification for Entitlements (SAVE) database.</div>', unsafe_allowed_html=True)

    # Metrics
    total_checks = len(st.session_state.gateway_logs)
    successful_checks = sum(1 for log in st.session_state.gateway_logs if log["status"] == "SUCCESS")
    failed_checks = total_checks - successful_checks
    success_rate = (successful_checks / total_checks * 100) if total_checks > 0 else 100

    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.metric("Total Gateway Queries", total_checks)
    with m2:
        st.metric("Verified Citizens", successful_checks)
    with m3:
        st.metric("Unverified Flags", failed_checks)
    with m4:
        st.metric("Gateway Success Rate", f"{success_rate:.1f}%")

    st.markdown("---")

    col1, col2 = st.columns([2, 1])

    with col1:
        st.subheader("Gateway Audit Log")
        df_logs = pd.DataFrame(st.session_state.gateway_logs)
        if not df_logs.empty:
            # Format timestamp for display
            df_logs['timestamp'] = df_logs['timestamp'].apply(lambda x: x.strftime('%Y-%m-%d %H:%M:%S'))
            st.dataframe(df_logs, use_container_width=True)
        else:
            st.info("No gateway logs available.")

    with col2:
        st.subheader("Manual Override & Verification")
        st.write("If a voter presents physical proof of citizenship (e.g., US Passport, Birth Certificate) directly to an official, the status can be manually overridden here.")
        
        unverified_voters = [r for r in st.session_state.registrations if r["citizenship_status"] == "Unverified"]
        
        if unverified_voters:
            voter_options = {v["name"]: v for v in unverified_voters}
            selected_voter_name = st.selectbox("Select Voter to Manually Verify", list(voter_options.keys()))
            selected_voter = voter_options[selected_voter_name]
            
            override_reason = st.selectbox("Verification Document Presented", [
                "US Passport (Valid)",
                "US Birth Certificate (Certified Copy)",
                "Certificate of Naturalization",
                "Consular Report of Birth Abroad"
            ])
            
            override_notes = st.text_area("Official Audit Notes", placeholder="Enter document serial numbers or verification details...")
            
            if st.button("Approve Manual Override"):
                # Update voter status
                for reg in st.session_state.registrations:
                    if reg["id"] == selected_voter["id"]:
                        reg["citizenship_status"] = "Verified (Manual)"
                        reg["status"] = "Approved"
                
                # Log the override
                st.session_state.gateway_logs.append({
                    "timestamp": datetime.datetime.now(),
                    "voter": selected_voter["name"],
                    "status": "SUCCESS",
                    "details": f"MANUAL OVERRIDE: Verified via {override_reason}. Notes: {override_notes}"
                })
                
                st.success(f"Successfully verified and approved {selected_voter['name']}!")
                st.rerun()
        else:
            st.success("🎉 No pending unverified voters requiring manual override.")


# ==========================================
# APP 3: Provisional Ballot & Cure Tracker
# ==========================================
elif app_mode == "⏳ Provisional Ballot & Cure Tracker":
    st.markdown('<div class="main-header">Provisional Ballot & 48-Hour Cure Tracker</div>', unsafe_allowed_html=True)
    st.markdown('<div class="sub-header">Track provisional registrations and manage the strict 48-hour window for voters to submit citizenship proof.</div>', unsafe_allowed_html=True)

    provisional_voters = [r for r in st.session_state.registrations if "Provisional" in r["status"]]

    if not provisional_voters:
        st.success("No active provisional ballots requiring cure actions.")
    else:
        # Display active provisional ballots with countdowns
        st.subheader("Active Provisional Registrations")
        
        for voter in provisional_voters:
            # Calculate time remaining
            elapsed = datetime.datetime.now() - voter["created_at"]
            limit = datetime.timedelta(hours=48)
            remaining = limit - elapsed
            
            is_expired = remaining.total_seconds() <= 0
            
            # Update status if expired
            if is_expired and voter["status"] != "Provisional (Expired)":
                voter["status"] = "Provisional (Expired)"
            
            # Visual styling based on status
            if is_expired:
                card_style = "card-warning"
                time_str = "EXPIRED (48-Hour Window Passed)"
                status_badge = "🔴 Expired"
            else:
                card_style = "card"
                hours, remainder = divmod(int(remaining.total_seconds()), 3600)
                minutes, _ = divmod(remainder, 60)
                time_str = f"{hours}h {minutes}m remaining"
                status_badge = "🟡 Active Cure Window"

            st.markdown(f"""
                <div class="{card_style}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4>{voter['name']} ({voter['id']})</h4>
                        <span style="font-weight: bold; padding: 5px 10px; border-radius: 15px; background-color: #e2e8f0;">{status_badge}</span>
                    </div>
                    <p><strong>Address:</strong> {voter['address']}</p>
                    <p><strong>Registration Date:</strong> {voter['created_at'].strftime('%Y-%m-%d %H:%M:%S')}</p>
                    <p style="font-size: 1.1rem; color: #b45309; font-weight: bold;">⏳ Time Remaining to Cure: {time_str}</p>
                </div>
            """, unsafe_allowed_html=True)

        st.markdown("---")
        st.subheader("Process Voter Cure Submission")
        
        # Form to cure a provisional ballot
        active_provisional_names = [v["name"] for v in provisional_voters if "Expired" not in v["status"]]
        
        if active_provisional_names:
            col1, col2 = st.columns(2)
            with col1:
                selected_cure_voter = st.selectbox("Select Voter to Cure", active_provisional_names)
                doc_type = st.selectbox("Cure Document Type", [
                    "US Birth Certificate",
                    "US Passport",
                    "Certificate of Naturalization",
                    "Tribal ID with Citizenship Declaration"
                ])
            with col2:
                uploaded_file = st.file_uploader("Upload Scanned Document / Proof", type=["pdf", "png", "jpg", "jpeg"])
                cure_notes = st.text_input("Verification Officer Notes")

            if st.button("Verify & Cure Registration"):
                if not uploaded_file:
                    st.error("Please upload a valid document to cure the registration.")
                else:
                    # Update voter status to Approved
                    for voter in st.session_state.registrations:
                        if voter["name"] == selected_cure_voter:
                            voter["status"] = "Approved"
                            voter["citizenship_status"] = "Verified (Cured)"
                    
                    # Log to Gateway
                    st.session_state.gateway_logs.append({
                        "timestamp": datetime.datetime.now(),
                        "voter": selected_cure_voter,
                        "status": "SUCCESS",
                        "details": f"CURED: Citizenship verified via uploaded {doc_type}. Officer Notes: {cure_notes}"
                    })
                    
                    st.success(f"🎉 Registration for {selected_cure_voter} has been successfully cured and approved!")
                    st.rerun()
        else:
            st.info("No active provisional registrations are currently eligible for curing (all have expired or been resolved).")


# ==========================================
# APP 4: Disability Accommodations & Mobile Units
# ==========================================
elif app_mode == "♿ Disability Accommodations & Mobile Units":
    st.markdown('<div class="main-header">Disability Accommodations & Mobile Unit Scheduler</div>', unsafe_allowed_html=True)
    st.markdown('<div class="sub-header">Manage remote document uploads and schedule mobile voting units for homebound or disabled voters.</div>', unsafe_allowed_html=True)

    tab1, tab2 = st.tabs(["♿ Accommodation Requests", "🚐 Mobile Unit Dispatch & Scheduling"])

    with tab1:
        st.subheader("Active Accommodation Requests")
        
        # Filter registrations with accommodations
        accomm_voters = [r for r in st.session_state.registrations if r["accommodation"] != "None"]
        
        if accomm_voters:
            for voter in accomm_voters:
                st.markdown(f"""
                    <div class="card">
                        <h4>{voter['name']} ({voter['id']})</h4>
                        <p><strong>Requested Accommodation:</strong> <span style="color: #1e3a8a; font-weight: bold;">{voter['accommodation']}</span></p>
                        <p><strong>Address:</strong> {voter['address']}</p>
                        <p><strong>Status:</strong> {voter['status']}</p>
                    </div>
                """, unsafe_allowed_html=True)
        else:
            st.info("No active disability accommodation requests found.")

        st.markdown("---")
        st.subheader("Remote Document Upload Portal (For Homebound Voters)")
        st.write("Voters who cannot travel to a DMV or election office can have their documents uploaded remotely by authorized mobile registrars or via secure link.")
        
        remote_voters = [v["name"] for v in accomm_voters if v["accommodation"] == "Remote Document Upload"]
        if remote_voters:
            selected_remote = st.selectbox("Select Voter for Remote Upload", remote_voters)
            remote_doc = st.file_uploader("Upload Remote Verification Document", type=["pdf", "png", "jpg"], key="remote_upload")
            
            if st.button("Submit Remote Verification"):
                if remote_doc:
                    st.success(f"Document successfully uploaded and verified for {selected_remote}!")
                else:
                    st.error("Please select a file to upload.")
        else:
            st.info("No voters currently registered for Remote Document Upload.")

    with tab2:
        st.subheader("Mobile Voting Unit Scheduler")
        st.write("Schedule a mobile voting van to visit homebound voters to complete their registration and cast their ballots securely.")

        col1, col2 = st.columns([1, 1])

        with col1:
            st.markdown("### Schedule a New Visit")
            # Filter voters who requested mobile units
            mobile_voter_names = [v["name"] for v in st.session_state.registrations if v["accommodation"] == "Mobile Unit Requested"]
            
            if mobile_voter_names:
                with st.form("schedule_form"):
                    voter_to_schedule = st.selectbox("Select Voter", mobile_voter_names)
                    visit_date = st.date_input("Scheduled Date", min_value=datetime.date.today())
                    visit_time = st.time_input("Scheduled Time", datetime.time(10, 0))
                    van_id = st.selectbox("Assign Mobile Unit Van", ["Mobile Unit Van A", "Mobile Unit Van B", "Mobile Unit Van C"])
                    
                    submit_schedule = st.form_submit_button("Schedule Mobile Visit")
                    
                    if submit_schedule:
                        # Find voter address
                        voter_address = next(r["address"] for r in st.session_state.registrations if r["name"] == voter_to_schedule)
                        
                        new_visit = {
                            "id": generate_id("MOB"),
                            "voter": voter_to_schedule,
                            "address": voter_address,
                            "date": visit_date,
                            "time": visit_time,
                            "status": "Scheduled"
                        }
                        st.session_state.mobile_units.append(new_visit)
                        st.success(f"Successfully scheduled {van_id} to visit {voter_to_schedule} on {visit_date} at {visit_time}!")
                        st.rerun()
            else:
                st.info("No voters currently requesting Mobile Unit visits.")

        with col2:
            st.markdown("### Dispatch Schedule")
            if st.session_state.mobile_units:
                df_units = pd.DataFrame(st.session_state.mobile_units)
                # Format date and time for display
                df_units['date'] = df_units['date'].apply(lambda x: x.strftime('%Y-%m-%d') if hasattr(x, 'strftime') else x)
                df_units['time'] = df_units['time'].apply(lambda x: x.strftime('%H:%M') if hasattr(x, 'strftime') else x)
                st.dataframe(df_units, use_container_width=True)
            else:
                st.info("No mobile units currently scheduled.")

            # Simulated Map View
            st.markdown("### Live Mobile Unit Map (Simulation)")
            # Generate random coordinates around a central point for simulation
            map_data = pd.DataFrame({
                'lat': [38.9072, 38.9120, 38.8951],
                'lon': [-77.0369, -77.0420, -77.0260]
            })
            st.map(map_data)