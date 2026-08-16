import streamlit as st
import hashlib
import os
import time
import pandas as pd
import binascii

# Set page configuration
st.set_page_config(
    page_title="Card PIN Cryptographic Suite",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State Database
if 'card_db' not in st.session_state:
    # Pre-populate with some mock data for demonstration
    st.session_state.card_db = {
        "4111111111111111": {
            "holder": "Jane Doe",
            "salt": "a1b2c3d4e5f6g7h8",
            "hash": "8f9c7b6a5d4c3b2a1f0e9d8c7b6a5d4c3b2a1f0e9d8c7b6a5d4c3b2a1f0e9d8c", # Mock hash
            "iterations": 100000,
            "algo": "sha256",
            "failed_attempts": 0,
            "locked": False,
            "pin_length": 4
        }
    }

# Helper Cryptographic Functions
def generate_salt(length=16):
    return binascii.hexlify(os.urandom(length)).decode('utf-8')

def hash_pin(pin: str, salt: str, iterations: int, algo: str) -> str:
    salt_bytes = salt.encode('utf-8')
    pin_bytes = pin.encode('utf-8')
    hash_bytes = hashlib.pbkdf2_hmac(algo, pin_bytes, salt_bytes, iterations)
    return binascii.hexlify(hash_bytes).decode('utf-8')

def generate_random_pin(length=4):
    import random
    return "".join([str(random.randint(0, 9)) for _ in range(length)])

# Sidebar Navigation
st.sidebar.title("💳 PIN Security Suite")
st.sidebar.write("Explore secure PIN management, hashing, validation, and brute-force protection.")

app_mode = st.sidebar.radio(
    "Select Application Module",
    [
        "1. PIN Generator & Hasher",
        "2. ATM PIN Validator",
        "3. Brute-Force & Lockout Simulator",
        "4. Cryptographic Benchmarker"
    ]
)

st.sidebar.markdown("---")
st.sidebar.subheader("Database Status")
st.sidebar.metric("Registered Cards", len(st.session_state.card_db))

# ---------------------------------------------------------
# APP 1: PIN GENERATOR & HASHER
# ---------------------------------------------------------
if app_mode == "1. PIN Generator & Hasher":
    st.title("🔑 Secure PIN Generator & PBKDF2 Hasher")
    st.write("""
        This module simulates how financial institutions securely generate and store PINs. 
        Instead of storing plaintext PINs, we use **PBKDF2 (Password-Based Key Derivation Function 2)** 
        with a unique cryptographic salt per card and high iteration counts to prevent rainbow table attacks.
    """)

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Cardholder Registration")
        holder_name = st.text_input("Cardholder Name", "John Doe")
        card_number = st.text_input("Card Number (16 digits)", "4532718293810293")
        pin_length = st.selectbox("PIN Length", [4, 6], index=0)
        
        st.markdown("##### Cryptographic Parameters")
        iterations = st.number_input("PBKDF2 Iterations", min_value=1000, max_value=500000, value=100000, step=10000)
        hash_algo = st.selectbox("Hash Algorithm", ["sha256", "sha512"], index=0)
        salt_length = st.slider("Salt Length (Bytes)", 8, 32, 16)

        generate_btn = st.button("Generate & Register Card", type="primary")

    with col2:
        st.subheader("Generated Credentials & Security Metadata")
        if generate_btn:
            if not card_number.isdigit() or len(card_number) != 16:
                st.error("⚠️ Card number must be exactly 16 digits.")
            elif card_number in st.session_state.card_db:
                st.warning("⚠️ This card number is already registered. Overwriting existing record.")
            
            # Generate PIN and Salt
            generated_pin = generate_random_pin(pin_length)
            salt = generate_salt(salt_length)
            hashed_pin = hash_pin(generated_pin, salt, iterations, hash_algo)

            # Save to Session State DB
            st.session_state.card_db[card_number] = {
                "holder": holder_name,
                "salt": salt,
                "hash": hashed_pin,
                "iterations": iterations,
                "algo": hash_algo,
                "failed_attempts": 0,
                "locked": False,
                "pin_length": pin_length
            }

            st.success("🎉 Card successfully registered and securely hashed!")
            
            # Display credentials securely
            st.info("🚨 **Write down the PIN now!** For security, the plaintext PIN is never stored in the database.")
            st.code(f"Plaintext PIN: {generated_pin}", language="text")
            
            # Display database record
            st.markdown("### Database Record (Stored on Server)")
            record_data = {
                "Cardholder": holder_name,
                "Card Number": f"**** **** **** {card_number[-4:]}",
                "Salt (Hex)": salt,
                "PBKDF2 Hash": hashed_pin,
                "Iterations": f"{iterations:,}",
                "Algorithm": hash_algo
            }
            st.json(record_data)
        else:
            st.info("Fill out the form on the left and click 'Generate & Register Card' to see the cryptographic output.")

    # Database Viewer
    st.markdown("---")
    st.subheader("🗄️ Active Card Database (Simulated)")
    if st.session_state.card_db:
        db_display = []
        for card, data in st.session_state.card_db.items():
            db_display.append({
                "Card Number": f"**** **** **** {card[-4:]}",
                "Holder": data["holder"],
                "Salt (Truncated)": data["salt"][:10] + "...",
                "Hash (Truncated)": data["hash"][:15] + "...",
                "Iterations": data["iterations"],
                "Algo": data["algo"],
                "Failed Attempts": data["failed_attempts"],
                "Locked": "🔒 Yes" if data["locked"] else "🔓 No"
            })
        st.table(pd.DataFrame(db_display))
    else:
        st.write("No cards registered yet.")

# ---------------------------------------------------------
# APP 2: ATM PIN VALIDATOR
# ---------------------------------------------------------
elif app_mode == "2. ATM PIN Validator":
    st.title("🏧 ATM PIN Verification Terminal")
    st.write("""
        This module simulates an ATM terminal validating a user's PIN. 
        When you insert a card and enter a PIN, the system retrieves the unique salt and iteration count 
        for that card, hashes your input, and compares it to the stored hash.
    """)

    if not st.session_state.card_db:
        st.warning("⚠️ No cards registered in the database. Please go to the 'PIN Generator & Hasher' tab to register a card first.")
    else:
        col1, col2 = st.columns([1, 1])

        with col1:
            st.subheader("ATM Interface")
            card_options = {f"**** **** **** {card[-4:]} ({data['holder']})": card for card, data in st.session_state.card_db.items()}
            selected_card_label = st.selectbox("Insert Card", list(card_options.keys()))
            selected_card_num = card_options[selected_card_label]
            
            card_data = st.session_state.card_db[selected_card_num]
            
            # PIN Input
            pin_input = st.text_input("Enter PIN", type="password", max_chars=card_data["pin_length"])
            
            validate_btn = st.button("Verify PIN", type="primary")

        with col2:
            st.subheader("Verification Logs & Mechanics")
            if validate_btn:
                if card_data["locked"]:
                    st.error("❌ ACCESS DENIED: This card is locked due to too many failed attempts.")
                else:
                    # Perform verification
                    start_time = time.perf_counter()
                    computed_hash = hash_pin(pin_input, card_data["salt"], card_data["iterations"], card_data["algo"])
                    elapsed_time = (time.perf_counter() - start_time) * 1000 # in ms
                    
                    st.write(f"⏱️ **Hashing Time:** {elapsed_time:.2f} ms")
                    
                    if computed_hash == card_data["hash"]:
                        st.success("✅ PIN VERIFIED SUCCESSFUL! Access Granted.")
                        # Reset failed attempts on success
                        st.session_state.card_db[selected_card_num]["failed_attempts"] = 0
                    else:
                        st.session_state.card_db[selected_card_num]["failed_attempts"] += 1
                        attempts_left = 3 - st.session_state.card_db[selected_card_num]["failed_attempts"]
                        
                        st.error("❌ INVALID PIN!")
                        
                        if attempts_left <= 0:
                            st.session_state.card_db[selected_card_num]["locked"] = True
                            st.error("🔒 CARD LOCKED! Too many incorrect attempts.")
                        else:
                            st.warning(f"Warning: {attempts_left} attempts remaining before lockout.")
            
            # Display current card status
            st.markdown("### Card Status")
            st.write(f"**Cardholder:** {card_data['holder']}")
            st.write(f"**Status:** {'🔒 Locked' if card_data['locked'] else '🔓 Active'}")
            st.write(f"**Failed Attempts:** {card_data['failed_attempts']} / 3")
            
            if card_data["locked"]:
                if st.button("Admin Unlock Card"):
                    st.session_state.card_db[selected_card_num]["locked"] = False
                    st.session_state.card_db[selected_card_num]["failed_attempts"] = 0
                    st.success("Card unlocked successfully!")
                    st.rerun()

# ---------------------------------------------------------
# APP 3: BRUTE-FORCE & LOCKOUT SIMULATOR
# ---------------------------------------------------------
elif app_mode == "3. Brute-Force & Lockout Simulator":
    st.title("🛡️ Brute-Force Attack & Lockout Simulator")
    st.write("""
        This simulator demonstrates how a brute-force attack works against a PIN, and how 
        automatic lockout mechanisms completely mitigate this threat. 
        Without lockout, a 4-digit PIN (10,000 combinations) can be cracked in seconds.
    """)

    if not st.session_state.card_db:
        st.warning("⚠️ Please register a card in Tab 1 first.")
    else:
        card_options = {f"**** **** **** {card[-4:]} ({data['holder']})": card for card, data in st.session_state.card_db.items()}
        selected_card_label = st.selectbox("Select Target Card for Attack Simulation", list(card_options.keys()))
        selected_card_num = card_options[selected_card_label]
        card_data = st.session_state.card_db[selected_card_num]

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("Attack Parameters")
            enable_lockout = st.checkbox("Enable Lockout Protection (3 Failed Attempts)", value=True)
            attack_speed = st.slider("Simulation Speed (Attempts per second)", 1, 20, 5)
            max_attempts = st.number_input("Max Attempts to Try", min_value=1, max_value=10000, value=10)
            
            start_attack = st.button("Launch Attack Simulation", type="secondary")

        with col2:
            st.subheader("Live Attack Console")
            if start_attack:
                # Reset card state for clean simulation
                st.session_state.card_db[selected_card_num]["failed_attempts"] = 0
                st.session_state.card_db[selected_card_num]["locked"] = False
                
                log_area = st.empty()
                progress_bar = st.progress(0)
                status_area = st.empty()
                
                logs = []
                locked_triggered = False
                success = False
                
                # We will simulate guessing PINs sequentially starting from "0000"
                for attempt in range(1, max_attempts + 1):
                    guess_pin = f"{attempt-1:0{card_data['pin_length']}d}"
                    
                    # Check if locked
                    if enable_lockout and st.session_state.card_db[selected_card_num]["locked"]:
                        locked_triggered = True
                        logs.append(f"Attempt {attempt}: [BLOCKED] Card is locked. Guess '{guess_pin}' rejected.")
                        break
                    
                    # Hash and verify
                    computed_hash = hash_pin(guess_pin, card_data["salt"], card_data["iterations"], card_data["algo"])
                    
                    if computed_hash == card_data["hash"]:
                        logs.append(f"Attempt {attempt}: [SUCCESS] Guess '{guess_pin}' matches!")
                        success = True
                        break
                    else:
                        logs.append(f"Attempt {attempt}: [FAILED] Guess '{guess_pin}' is incorrect.")
                        if enable_lockout:
                            st.session_state.card_db[selected_card_num]["failed_attempts"] += 1
                            if st.session_state.card_db[selected_card_num]["failed_attempts"] >= 3:
                                st.session_state.card_db[selected_card_num]["locked"] = True
                    
                    # Update UI
                    log_text = "\n".join(logs[-8:]) # Show last 8 logs
                    log_area.code(log_text, language="text")
                    progress_bar.progress(attempt / max_attempts)
                    time.sleep(1.0 / attack_speed)
                
                # Final Status
                if success:
                    status_area.success("🔓 Attack Succeeded! The PIN was cracked.")
                elif locked_triggered:
                    status_area.error("🔒 Attack Blocked! Lockout mechanism triggered successfully.")
                else:
                    status_area.warning("⚠️ Attack Finished. PIN not found within max attempts.")
                
                # Show full log in expander
                with st.expander("View Full Attack Log"):
                    st.write(logs)
            else:
                st.info("Click 'Launch Attack Simulation' to start.")

# ---------------------------------------------------------
# APP 4: CRYPTOGRAPHIC BENCHMARKER
# ---------------------------------------------------------
elif app_mode == "4. Cryptographic Benchmarker":
    st.title("📊 Cryptographic Parameter Benchmarker")
    st.write("""
        PBKDF2 is intentionally designed to be slow (computationally expensive) to resist brute-force attacks. 
        This benchmark tool lets you compare how different iteration counts and hashing algorithms 
        affect the time it takes to verify a single PIN, and how that scales to protect against attackers.
    """)

    col1, col2 = st.columns([1, 2])

    with col1:
        st.subheader("Benchmark Settings")
        test_pin = st.text_input("Test PIN", "1234")
        test_salt = "benchmarksalt1234"
        
        iterations_presets = [1000, 10000, 50000, 100000, 200000]
        selected_algos = st.multiselect("Algorithms to Test", ["sha256", "sha512"], default=["sha256", "sha512"])
        
        run_benchmark = st.button("Run Benchmark", type="primary")

    with col2:
        st.subheader("Performance Results")
        if run_benchmark:
            results = []
            
            progress_bar = st.progress(0)
            total_steps = len(iterations_presets) * len(selected_algos)
            step = 0
            
            for algo in selected_algos:
                for iter_count in iterations_presets:
                    # Measure execution time
                    start_time = time.perf_counter()
                    # Run 5 times to get an average
                    for _ in range(5):
                        hash_pin(test_pin, test_salt, iter_count, algo)
                    end_time = time.perf_counter()
                    
                    avg_time_ms = ((end_time - start_time) / 5) * 1000
                    
                    # Calculate estimated time for an attacker to brute-force 10,000 combinations (4-digit PIN)
                    # assuming a single GPU/CPU thread doing sequential guesses
                    brute_force_4_digit_seconds = (avg_time_ms / 1000) * 10000
                    
                    results.append({
                        "Algorithm": algo,
                        "Iterations": iter_count,
                        "Avg Time (ms)": round(avg_time_ms, 2),
                        "4-Digit Brute Force Time (Sec)": round(brute_force_4_digit_seconds, 2)
                    })
                    
                    step += 1
                    progress_bar.progress(step / total_steps)
            
            df = pd.DataFrame(results)
            st.dataframe(df)
            
            # Visualizations
            st.subheader("Visualizing Hashing Delay (Higher is more secure)")
            st.bar_chart(data=df, x="Iterations", y="Avg Time (ms)", color="Algorithm")
            
            st.info("""
                💡 **Security Insight:** 
                Increasing iterations directly increases the time required for an attacker to guess PINs. 
                While a 0.5ms delay is unnoticeable to a single user at an ATM, it makes automated offline 
                cracking attempts extremely slow and expensive for attackers.
            """)
        else:
            st.info("Click 'Run Benchmark' to measure cryptographic performance on your current hardware.")