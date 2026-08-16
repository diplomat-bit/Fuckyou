import os
import time
import uuid
import hashlib
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template_string

app = Flask(__name__)

# --- IN-MEMORY STATE FOR HSM SIMULATION ---
class HSMState:
    def __init__(self):
        self.logs = []
        self.blocks = {}  # client_ip -> {"attempts": int, "blocked_until": datetime}
        self.current_key_id = "HSM_KEY_AES_256_V1"
        self.key_history = [
            {
                "key_id": "HSM_KEY_AES_256_V1",
                "created_at": (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d %H:%M:%S"),
                "kcv": "7F8A9B2C",
                "algorithm": "AES-256-CBC"
            }
        ]
        self.total_requests = 0
        self.failed_requests = 0
        self.blocked_requests = 0
        self.successful_requests = 0

    def add_log(self, level, action, message, payload=None):
        log_entry = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            "level": level,
            "action": action,
            "message": message,
            "payload": payload or {}
        }
        self.logs.insert(0, log_entry)
        # Keep last 100 logs
        if len(self.logs) > 100:
            self.logs.pop()

    def rotate_key(self):
        new_version = len(self.key_history) + 1
        new_key_id = f"HSM_KEY_AES_256_V{new_version}"
        kcv = hashlib.sha256(new_key_id.encode()).hexdigest()[:8].upper()
        new_key = {
            "key_id": new_key_id,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "kcv": kcv,
            "algorithm": "AES-256-CBC"
        }
        self.key_history.insert(0, new_key)
        self.current_key_id = new_key_id
        self.add_log("INFO", "KEY_ROTATION", f"New active key loaded: {new_key_id} (KCV: {kcv})")
        return new_key

    def check_rate_limit(self, ip):
        now = datetime.now()
        if ip in self.blocks:
            block_info = self.blocks[ip]
            if block_info["blocked_until"] > now:
                # Still blocked
                self.blocked_requests += 1
                return False, block_info["blocked_until"]
            elif block_info["attempts"] >= 5:
                # Block expired, reset
                self.blocks.pop(ip, None)
        return True, None

    def record_attempt(self, ip, success):
        now = datetime.now()
        if not success:
            if ip not in self.blocks:
                self.blocks[ip] = {"attempts": 1, "blocked_until": now}
            else:
                self.blocks[ip]["attempts"] += 1
                if self.blocks[ip]["attempts"] >= 5:
                    # Block for 60 seconds
                    self.blocks[ip]["blocked_until"] = now + timedelta(seconds=60)
                    self.add_log("WARNING", "RATE_LIMIT_TRIGGERED", f"IP {ip} exceeded maximum attempts. Blocked for 60s.")
        else:
            # On success, reset attempts
            self.blocks.pop(ip, None)

state = HSMState()

# Seed initial logs
state.add_log("INFO", "SYSTEM_BOOT", "HSM Mock Service initialized successfully.")
state.add_log("INFO", "KEY_LOADED", "Active key HSM_KEY_AES_256_V1 loaded into secure memory enclave.")

# --- API ENDPOINTS ---

@app.route('/decrypt', methods=['POST'])
def decrypt_cvv():
    state.total_requests += 1
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr) or "127.0.0.1"
    
    # 1. Check Rate Limiting / Block Status
    allowed, blocked_until = state.check_rate_limit(client_ip)
    if not allowed:
        state.add_log("ERROR", "DECRYPTION_BLOCKED", f"Request blocked from {client_ip}. Rate limit exceeded.", {"ip": client_ip})
        return jsonify({
            "status": "error",
            "error_code": "maximumAttemptsLimitExceeded",
            "message": "Maximum decryption attempts exceeded. IP temporarily blocked.",
            "blocked_until": blocked_until.isoformat(),
            "hsm_status_code": "05"
        }), 429

    # 2. Parse Request Payload
    data = request.get_json() or {}
    encrypted_payload = data.get("encrypted_payload", "")
    key_id = data.get("key_id", state.current_key_id)

    if not encrypted_payload:
        state.failed_requests += 1
        state.record_attempt(client_ip, False)
        state.add_log("ERROR", "INVALID_REQUEST", "Missing encrypted_payload in request body.")
        return jsonify({
            "status": "error",
            "error_code": "invalidPayload",
            "message": "encrypted_payload is required.",
            "hsm_status_code": "12"
        }), 400

    # 3. Simulate Decryption Logic & Error Signatures
    # CA_008 simulation: Specific bad signature triggers decryptionFailed
    if "CA008" in encrypted_payload or "BAD_SIG" in encrypted_payload.upper():
        state.failed_requests += 1
        state.record_attempt(client_ip, False)
        state.add_log("ERROR", "DECRYPTION_FAILED", f"Decryption failed for payload signature. Integrity check failed.", {"payload": encrypted_payload})
        return jsonify({
            "status": "error",
            "error_code": "decryptionFailed",
            "message": "HSM Decryption failed. Invalid cryptographic signature or padding.",
            "hsm_status_code": "08"
        }), 400

    # CA_005 simulation: Specific payload to force rate limit trigger instantly
    if "CA005" in encrypted_payload or "FORCE_LIMIT" in encrypted_payload.upper():
        # Force block immediately for testing
        state.blocks[client_ip] = {"attempts": 5, "blocked_until": datetime.now() + timedelta(seconds=60)}
        state.failed_requests += 1
        state.add_log("WARNING", "RATE_LIMIT_TRIGGERED", f"IP {client_ip} triggered immediate block via CA005 payload.")
        return jsonify({
            "status": "error",
            "error_code": "maximumAttemptsLimitExceeded",
            "message": "Maximum decryption attempts exceeded. IP temporarily blocked.",
            "blocked_until": state.blocks[client_ip]["blocked_until"].isoformat(),
            "hsm_status_code": "05"
        }), 429

    # 4. Successful Decryption Simulation
    # Generate a deterministic CVV based on the payload hash to look realistic
    payload_hash = hashlib.sha256(encrypted_payload.encode()).hexdigest()
    decrypted_cvv = str(int(payload_hash, 16) % 900 + 100)  # Always a 3-digit number between 100 and 999
    
    state.successful_requests += 1
    state.record_attempt(client_ip, True)
    state.add_log("INFO", "DECRYPTION_SUCCESS", f"Successfully decrypted CVV payload using {key_id}.", {
        "key_id": key_id,
        "kcv": next((k["kcv"] for k in state.key_history if k["key_id"] == key_id), "UNKNOWN")
    })

    return jsonify({
        "status": "success",
        "decrypted_cvv": decrypted_cvv,
        "key_id": key_id,
        "algorithm": "AES-256-CBC",
        "hsm_status_code": "00",
        "timestamp": datetime.now().isoformat()
    })

# --- DASHBOARD API ENDPOINTS ---

@app.route('/api/stats', methods=['GET'])
def get_stats():
    now = datetime.now()
    active_blocks = [
        {"ip": ip, "attempts": info["attempts"], "blocked_until": info["blocked_until"].strftime("%Y-%m-%d %H:%M:%S")}
        for ip, info in state.blocks.items() if info["blocked_until"] > now
    ]
    return jsonify({
        "total_requests": state.total_requests,
        "successful_requests": state.successful_requests,
        "failed_requests": state.failed_requests,
        "blocked_requests": state.blocked_requests,
        "current_key_id": state.current_key_id,
        "active_blocks": active_blocks,
        "key_history": state.key_history,
        "logs": state.logs[:30]  # Return last 30 logs for UI
    })

@app.route('/api/rotate-key', methods=['POST'])
def trigger_key_rotation():
    new_key = state.rotate_key()
    return jsonify({"status": "success", "new_key": new_key})

@app.route('/api/reset-blocks', methods=['POST'])
def reset_blocks():
    state.blocks.clear()
    state.add_log("INFO", "SYSTEM_RESET", "All active IP blocks and rate limit counters have been cleared.")
    return jsonify({"status": "success", "message": "All blocks cleared."})

# --- DASHBOARD UI ---

DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HSM Secure CVV Decryption Mock Service</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .mono {
            font-family: 'JetBrains Mono', monospace;
        }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <div class="h-8 w-8 rounded bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <svg class="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold tracking-tight">HSM-Shield v2.4</h1>
                    <p class="text-xs text-slate-400">Secure CVV Decryption Mock Service</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span class="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    FIPS 140-2 Level 3 Compliant (Mock)
                </span>
            </div>
        </div>
    </header>

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column: Controls & Simulator -->
        <div class="lg:col-span-1 space-y-6">
            
            <!-- HSM Status & Key Management -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">HSM Key Management</h2>
                <div class="space-y-4">
                    <div>
                        <label class="text-xs text-slate-500 block mb-1">Active Key ID</label>
                        <div class="mono text-sm bg-slate-950 border border-slate-800 rounded px-3 py-2 text-emerald-400 flex justify-between items-center">
                            <span id="active-key-id">Loading...</span>
                            <span class="text-xs text-slate-500" id="active-key-kcv">KCV: --</span>
                        </div>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="rotateKey()" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs py-2.5 px-4 rounded transition duration-150 flex items-center justify-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19"></path></svg>
                            <span>Rotate Key</span>
                        </button>
                        <button onclick="resetBlocks()" class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded border border-slate-700 transition duration-150 flex items-center justify-center space-x-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            <span>Clear Blocks</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Decryption Simulator -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Decryption Simulator</h2>
                <div class="space-y-4">
                    <div>
                        <label class="text-xs text-slate-500 block mb-1">Select Preset Payload</label>
                        <select id="preset-selector" onchange="applyPreset()" class="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                            <option value="valid">Valid Encrypted CVV (Success)</option>
                            <option value="ca008">Bad Signature (CA_008 Decryption Failed)</option>
                            <option value="ca005">Rate Limit Trigger (CA_005 Block)</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-slate-500 block mb-1">Encrypted Payload (Hex)</label>
                        <textarea id="payload-input" rows="3" class="w-full mono bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">4A8F9C2D1E0B3A8F</textarea>
                    </div>
                    <button onclick="simulateDecryption()" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-3 px-4 rounded transition duration-150 flex items-center justify-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <span>Execute Decryption</span>
                    </button>

                    <!-- Simulator Output -->
                    <div id="simulator-output-container" class="hidden mt-4 border-t border-slate-800 pt-4">
                        <label class="text-xs text-slate-500 block mb-1">HSM Response</label>
                        <pre id="simulator-output" class="mono text-xs bg-slate-950 border border-slate-800 rounded p-3 overflow-x-auto max-h-48 text-slate-300"></pre>
                    </div>
                </div>
            </div>

        </div>

        <!-- Right Column: Dashboard Stats & Logs -->
        <div class="lg:col-span-2 space-y-6">
            
            <!-- Stats Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                    <p class="text-xs text-slate-500 font-medium">Total Requests</p>
                    <p class="text-2xl font-bold text-slate-100 mt-1" id="stat-total">0</p>
                </div>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                    <p class="text-xs text-slate-500 font-medium">Decrypted (Success)</p>
                    <p class="text-2xl font-bold text-emerald-400 mt-1" id="stat-success">0</p>
                </div>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                    <p class="text-xs text-slate-500 font-medium">Decryption Failed</p>
                    <p class="text-2xl font-bold text-rose-400 mt-1" id="stat-failed">0</p>
                </div>
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                    <p class="text-xs text-slate-500 font-medium">Blocked Requests</p>
                    <p class="text-2xl font-bold text-amber-400 mt-1" id="stat-blocked">0</p>
                </div>
            </div>

            <!-- Active Blocks -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Active Rate-Limit Blocks</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead>
                            <tr class="border-b border-slate-800 text-slate-500 text-xs uppercase">
                                <th class="pb-3 font-semibold">Client IP</th>
                                <th class="pb-3 font-semibold">Failed Attempts</th>
                                <th class="pb-3 font-semibold">Blocked Until</th>
                                <th class="pb-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody id="blocks-table-body" class="divide-y divide-slate-800/50">
                            <!-- Dynamic content -->
                        </tbody>
                    </table>
                    <div id="no-blocks-msg" class="text-center py-6 text-slate-500 text-xs hidden">
                        No active IP blocks. System operating normally.
                    </div>
                </div>
            </div>

            <!-- HSM Operation Logs -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col h-[400px]">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">HSM Audit Logs</h2>
                    <span class="text-xs text-slate-500 animate-pulse flex items-center">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Live Monitoring
                    </span>
                </div>
                <div id="logs-container" class="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                    <!-- Dynamic logs -->
                </div>
            </div>

        </div>

    </main>

    <footer class="border-t border-slate-900 bg-slate-950 py-6 mt-auto">
        <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>&copy; HSM-Shield Mock Decryption Service. All simulated operations are secure.</p>
            <div class="flex space-x-4 mt-2 md:mt-0">
                <span>API Endpoint: <code class="bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">/decrypt</code></span>
                <span>Method: <code class="bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">POST</code></span>
            </div>
        </div>
    </footer>

    <script>
        const presets = {
            valid: "4A8F9C2D1E0B3A8F",
            ca008: "CA008_BAD_SIG_77F2",
            ca005: "CA005_LIMIT_TEST_99"
        };

        function applyPreset() {
            const selector = document.getElementById('preset-selector');
            const input = document.getElementById('payload-input');
            input.value = presets[selector.value];
        }

        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                const data = await res.json();

                // Update Stats
                document.getElementById('stat-total').innerText = data.total_requests;
                document.getElementById('stat-success').innerText = data.successful_requests;
                document.getElementById('stat-failed').innerText = data.failed_requests;
                document.getElementById('stat-blocked').innerText = data.blocked_requests;
                document.getElementById('active-key-id').innerText = data.current_key_id;
                
                const activeKey = data.key_history.find(k => k.key_id === data.current_key_id);
                if (activeKey) {
                    document.getElementById('active-key-kcv').innerText = `KCV: ${activeKey.kcv}`;
                }

                // Update Blocks Table
                const tbody = document.getElementById('blocks-table-body');
                const noBlocksMsg = document.getElementById('no-blocks-msg');
                tbody.innerHTML = '';
                
                if (data.active_blocks.length === 0) {
                    noBlocksMsg.classList.remove('hidden');
                } else {
                    noBlocksMsg.classList.add('hidden');
                    data.active_blocks.forEach(block => {
                        const tr = document.createElement('tr');
                        tr.className = 'text-xs';
                        tr.innerHTML = `
                            <td class="py-3 font-medium text-slate-300 mono">${block.ip}</td>
                            <td class="py-3 text-slate-400">${block.attempts} / 5</td>
                            <td class="py-3 text-slate-400 mono">${block.blocked_until}</td>
                            <td class="py-3">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    Blocked
                                </span>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                }

                // Update Logs
                const logsContainer = document.getElementById('logs-container');
                logsContainer.innerHTML = '';
                data.logs.forEach(log => {
                    const logDiv = document.createElement('div');
                    logDiv.className = 'p-3 rounded bg-slate-900/50 border border-slate-800/50 flex flex-col space-y-1';
                    
                    let levelColor = 'text-slate-400';
                    if (log.level === 'ERROR') levelColor = 'text-rose-400';
                    if (log.level === 'WARNING') levelColor = 'text-amber-400';
                    if (log.level === 'INFO') levelColor = 'text-emerald-400';

                    logDiv.innerHTML = `
                        <div class="flex justify-between items-center text-xs">
                            <div class="flex items-center space-x-2">
                                <span class="mono text-slate-500">${log.timestamp}</span>
                                <span class="font-bold ${levelColor}">[${log.level}]</span>
                                <span class="font-semibold text-slate-300">${log.action}</span>
                            </div>
                        </div>
                        <p class="text-xs text-slate-400">${log.message}</p>
                        ${Object.keys(log.payload).length ? `<pre class="mono text-[10px] bg-slate-950 p-1.5 rounded text-slate-500 mt-1 overflow-x-auto">${JSON.stringify(log.payload)}</pre>` : ''}
                    `;
                    logsContainer.appendChild(logDiv);
                });

            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        }

        async function rotateKey() {
            if (confirm("Are you sure you want to rotate the HSM master key? This will generate a new Key ID and KCV.")) {
                await fetch('/api/rotate-key', { method: 'POST' });
                fetchStats();
            }
        }

        async function resetBlocks() {
            await fetch('/api/reset-blocks', { method: 'POST' });
            fetchStats();
        }

        async function simulateDecryption() {
            const payload = document.getElementById('payload-input').value;
            const outputContainer = document.getElementById('simulator-output-container');
            const output = document.getElementById('simulator-output');

            outputContainer.classList.remove('hidden');
            output.innerText = "Processing decryption request in secure enclave...";

            try {
                const res = await fetch('/decrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ encrypted_payload: payload })
                });
                const data = await res.json();
                output.innerText = JSON.stringify(data, null, 2);
                
                // Highlight success/error
                if (res.ok) {
                    output.className = "mono text-xs bg-slate-950 border border-emerald-500/30 rounded p-3 overflow-x-auto max-h-48 text-emerald-400";
                } else {
                    output.className = "mono text-xs bg-slate-950 border border-rose-500/30 rounded p-3 overflow-x-auto max-h-48 text-rose-400";
                }
            } catch (err) {
                output.innerText = "Network Error: " + err.message;
                output.className = "mono text-xs bg-slate-950 border border-rose-500/30 rounded p-3 overflow-x-auto max-h-48 text-rose-400";
            }

            fetchStats();
        }

        // Initial load and polling
        applyPreset();
        fetchStats();
        setInterval(fetchStats, 3000);
    </script>
</body>
</html>
"""

@app.route('/')
def dashboard():
    return render_template_string(DASHBOARD_HTML)

if __name__ == '__main__':
    # Run Flask server
    # Port 5000 is standard, but we can bind to 0.0.0.0 to allow external access if needed
    app.run(host='0.0.0.0', port=5000, debug=True)