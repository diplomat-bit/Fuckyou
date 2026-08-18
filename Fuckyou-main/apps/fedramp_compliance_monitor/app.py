import os
import sqlite3
import datetime
import json
import uuid
import hashlib
import time
from flask import Flask, render_template_string, jsonify, request

app = Flask(__name__)
DATABASE = 'fedramp_compliance.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Controls Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS controls (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            family TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL, -- 'Compliant', 'Non-Compliant', 'Warning'
            last_evaluated TEXT,
            details TEXT
        )
    ''')
    
    # Create Evidence Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS evidence_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            control_id TEXT NOT NULL,
            action TEXT NOT NULL, -- 'Verification', 'Remediation'
            operator TEXT NOT NULL,
            status TEXT NOT NULL, -- 'Success', 'Failed'
            details TEXT NOT NULL,
            evidence_hash TEXT NOT NULL
        )
    ''')
    
    # Check if controls are already populated
    cursor.execute("SELECT COUNT(*) FROM controls")
    if cursor.fetchone()[0] == 0:
        default_controls = [
            (
                "AC-2",
                "Account Management",
                "Access Control",
                "Manage information system accounts, including establishing, activating, modifying, reviewing, disabling, and removing accounts in accordance with established organizational procedures.",
                "Warning",
                datetime.datetime.utcnow().isoformat() + "Z",
                "Found 3 inactive user accounts (>90 days) without MFA enabled: 'test-user-1', 'temp-admin', 'external-vendor'."
            ),
            (
                "SC-7",
                "Boundary Protection",
                "System and Communications Protection",
                "Monitor and control communications at the external boundary of the system and at key internal boundaries.",
                "Non-Compliant",
                datetime.datetime.utcnow().isoformat() + "Z",
                "Security Group 'sg-08f12a' allows unrestricted public ingress on Port 22 (SSH) and Port 3389 (RDP) from 0.0.0.0/0."
            ),
            (
                "SI-4",
                "Information System Monitoring",
                "System and Information Integrity",
                "Monitor the information system to detect attacks, indicators of potential attacks, and unauthorized local, network, and system connections.",
                "Warning",
                datetime.datetime.utcnow().isoformat() + "Z",
                "Intrusion Detection System (IDS) agent is offline on 2 of 5 production instances. SIEM log forwarder heartbeat missing."
            ),
            (
                "IA-2",
                "Identification and Authentication (Organizational Users)",
                "Identification and Authentication",
                "Uniquely identify and authenticate organizational users (and processes acting on behalf of organizational users).",
                "Compliant",
                datetime.datetime.utcnow().isoformat() + "Z",
                "MFA is enforced globally for all IAM users. Password policy requires 14+ characters, complexity, and 90-day rotation."
            )
        ]
        cursor.executemany(
            "INSERT INTO controls (id, name, family, description, status, last_evaluated, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
            default_controls
        )
        
        # Add initial evidence log
        log_id = str(uuid.uuid4())
        timestamp = datetime.datetime.utcnow().isoformat() + "Z"
        details_str = "Initial FedRAMP High compliance baseline scan executed automatically by system."
        evidence_hash = hashlib.sha256(f"{log_id}-{timestamp}-IA-2-Success-{details_str}".encode()).hexdigest()
        
        cursor.execute(
            "INSERT INTO evidence_logs (id, timestamp, control_id, action, operator, status, details, evidence_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (log_id, timestamp, "IA-2", "Verification", "System Baseline", "Success", details_str, evidence_hash)
        )
        
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# HTML Dashboard Template
DASHBOARD_TEMPLATE = """
<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FedRAMP High Compliance Monitor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .mono {
            font-family: 'JetBrains Mono', monospace;
        }
    </style>
</head>
<body class="h-full text-slate-100 flex flex-col">

    <!-- Top Navigation -->
    <header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold tracking-tight text-white">FedRAMP High</h1>
                    <p class="text-xs text-slate-400">Compliance Monitor & Remediation Console</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                    <span class="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-400"></span>
                    ATO Status: Conditional
                </span>
                <button onclick="resetDemo()" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition">
                    Reset Demo State
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Compliance</p>
                <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-3xl font-bold text-white" id="compliance-score">--%</span>
                    <span class="text-xs text-emerald-400 font-medium" id="compliance-trend">Target: 100%</span>
                </div>
                <div class="mt-3 w-full bg-slate-800 rounded-full h-1.5">
                    <div id="compliance-bar" class="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
            </div>
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Controls</p>
                <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-3xl font-bold text-white" id="total-controls">0</span>
                    <span class="text-xs text-slate-500">FedRAMP High Baseline</span>
                </div>
            </div>
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Compliant Controls</p>
                <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-3xl font-bold text-emerald-400" id="compliant-count">0</span>
                    <span class="text-xs text-emerald-500/80">Passing Checks</span>
                </div>
            </div>
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Open Findings</p>
                <div class="mt-2 flex items-baseline justify-between">
                    <span class="text-3xl font-bold text-rose-400" id="findings-count">0</span>
                    <span class="text-xs text-rose-500/80">Requires Action</span>
                </div>
            </div>
        </div>

        <!-- Dashboard Layout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left Column: Controls List (7 cols) -->
            <div class="lg:col-span-7 space-y-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-white flex items-center space-x-2">
                        <span>Control Assessment & Remediation</span>
                        <span class="text-xs font-normal text-slate-400">(FedRAMP High Baseline)</span>
                    </h2>
                    <button onclick="loadDashboardData()" class="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17"/></svg>
                        <span>Refresh</span>
                    </button>
                </div>

                <div class="space-y-4" id="controls-container">
                    <!-- Dynamic Controls will be injected here -->
                    <div class="animate-pulse space-y-4">
                        <div class="h-32 bg-slate-900 rounded-xl border border-slate-800"></div>
                        <div class="h-32 bg-slate-900 rounded-xl border border-slate-800"></div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Console & Evidence Logs (5 cols) -->
            <div class="lg:col-span-5 space-y-6">
                
                <!-- Live Remediation Console -->
                <div class="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[320px]">
                    <div class="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                            <span class="text-xs font-semibold tracking-wider uppercase text-slate-300">Live Remediation Console</span>
                        </div>
                        <button onclick="clearConsole()" class="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider">Clear</button>
                    </div>
                    <div id="console-output" class="p-4 flex-1 overflow-y-auto mono text-xs text-emerald-400 space-y-2 bg-black/40">
                        <div class="text-slate-500">&gt; Console initialized. Awaiting operator action...</div>
                    </div>
                </div>

                <!-- Evidence & Audit Log -->
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[400px]">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Evidence & Audit Log</h3>
                        <span class="text-xs text-slate-400">FIPS 140-2 Validated Hashes</span>
                    </div>
                    <div class="flex-1 overflow-y-auto space-y-3 pr-1" id="logs-container">
                        <!-- Dynamic Logs will be injected here -->
                        <div class="text-center text-slate-500 py-8 text-xs">No logs available.</div>
                    </div>
                </div>

            </div>
        </div>
    </main>

    <!-- Evidence Modal -->
    <div id="evidence-modal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 class="text-base font-semibold text-white">Cryptographic Evidence Record</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-white">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label class="text-xs font-medium text-slate-400 uppercase tracking-wider">Evidence Hash (SHA-256)</label>
                    <div class="mt-1 p-2.5 bg-slate-950 rounded border border-slate-800 text-xs mono text-indigo-400 break-all" id="modal-hash">
                        --
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-medium text-slate-400 uppercase tracking-wider">Timestamp</label>
                        <div class="mt-1 p-2 bg-slate-950 rounded border border-slate-800 text-xs text-slate-300" id="modal-timestamp">
                            --
                        </div>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-slate-400 uppercase tracking-wider">Operator</label>
                        <div class="mt-1 p-2 bg-slate-950 rounded border border-slate-800 text-xs text-slate-300" id="modal-operator">
                            --
                        </div>
                    </div>
                </div>
                <div>
                    <label class="text-xs font-medium text-slate-400 uppercase tracking-wider">System Execution Details</label>
                    <pre class="mt-1 p-3 bg-slate-950 rounded border border-slate-800 text-xs mono text-emerald-400 overflow-x-auto whitespace-pre-wrap h-40" id="modal-details">
                        --
                    </pre>
                </div>
            </div>
            <div class="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
                <button onclick="closeModal()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-medium transition">
                    Close Record
                </button>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="border-t border-slate-900 bg-slate-950 py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>&copy; FedRAMP High Compliance Monitor. Continuous Monitoring (ConMon) Engine.</p>
            <p class="mt-2 sm:mt-0">System Integrity: <span class="text-emerald-500 font-semibold">SECURE</span></p>
        </div>
    </footer>

    <script>
        // Global state
        let activeAction = false;

        // Load all dashboard data
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/dashboard');
                const data = await response.json();
                
                // Update Stats
                document.getElementById('compliance-score').innerText = `${data.stats.score}%`;
                document.getElementById('compliance-bar').style.width = `${data.stats.score}%`;
                document.getElementById('total-controls').innerText = data.stats.total;
                document.getElementById('compliant-count').innerText = data.stats.compliant;
                document.getElementById('findings-count').innerText = data.stats.findings;

                // Update Controls List
                const container = document.getElementById('controls-container');
                container.innerHTML = '';
                
                data.controls.forEach(control => {
                    let statusBadge = '';
                    let borderClass = 'border-slate-800';
                    let bgClass = 'bg-slate-900/50';
                    
                    if (control.status === 'Compliant') {
                        statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Compliant</span>`;
                        borderClass = 'border-emerald-500/20';
                    } else if (control.status === 'Warning') {
                        statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Warning</span>`;
                        borderClass = 'border-amber-500/20';
                    } else {
                        statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Non-Compliant</span>`;
                        borderClass = 'border-rose-500/20';
                    }

                    const controlHtml = `
                        <div class="bg-slate-900 border ${borderClass} rounded-xl p-5 transition hover:border-slate-700">
                            <div class="flex items-start justify-between">
                                <div class="space-y-1">
                                    <div class="flex items-center space-x-2">
                                        <span class="text-xs font-bold text-indigo-400 tracking-wider uppercase mono">${control.id}</span>
                                        <span class="text-slate-500">•</span>
                                        <span class="text-xs text-slate-400 font-medium">${control.family}</span>
                                    </div>
                                    <h3 class="text-base font-semibold text-white">${control.name}</h3>
                                </div>
                                ${statusBadge}
                            </div>
                            <p class="mt-3 text-xs text-slate-400 leading-relaxed">${control.description}</p>
                            
                            <div class="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800/60">
                                <div class="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                    <span>Assessment Details</span>
                                    <span>Last Checked: ${new Date(control.last_evaluated).toLocaleString()}</span>
                                </div>
                                <p class="mt-1.5 text-xs mono text-slate-300 break-words">${control.details}</p>
                            </div>

                            <div class="mt-4 flex items-center justify-end space-x-3">
                                <button onclick="triggerVerification('${control.id}')" ${activeAction ? 'disabled' : ''} class="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition disabled:opacity-50">
                                    Verify Status
                                </button>
                                ${control.status !== 'Compliant' ? `
                                    <button onclick="triggerRemediation('${control.id}')" ${activeAction ? 'disabled' : ''} class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded shadow-sm shadow-indigo-500/20 transition disabled:opacity-50">
                                        Auto-Remediate
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                    container.innerHTML += controlHtml;
                });

                // Update Logs
                const logsContainer = document.getElementById('logs-container');
                logsContainer.innerHTML = '';
                
                if (data.logs.length === 0) {
                    logsContainer.innerHTML = '<div class="text-center text-slate-500 py-8 text-xs">No logs available.</div>';
                } else {
                    data.logs.forEach(log => {
                        const logHtml = `
                            <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                                <div class="space-y-1">
                                    <div class="flex items-center space-x-2">
                                        <span class="text-[10px] font-bold text-indigo-400 mono">${log.control_id}</span>
                                        <span class="text-slate-600">•</span>
                                        <span class="text-[10px] text-slate-400">${new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p class="text-xs text-slate-300 font-medium">${log.action} - ${log.status}</p>
                                </div>
                                <button onclick="viewEvidence('${log.id}')" class="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase tracking-wider">
                                    Evidence
                                </button>
                            </div>
                        `;
                        logsContainer.innerHTML += logHtml;
                    });
                }

            } catch (error) {
                console.error("Error loading dashboard data:", error);
            }
        }

        // Console logging helper
        function logToConsole(message, type = 'info') {
            const consoleDiv = document.getElementById('console-output');
            const timestamp = new Date().toLocaleTimeString();
            let colorClass = 'text-emerald-400';
            if (type === 'error') colorClass = 'text-rose-400';
            if (type === 'warning') colorClass = 'text-amber-400';
            if (type === 'system') colorClass = 'text-indigo-400';

            const logLine = document.createElement('div');
            logLine.className = `${colorClass} leading-relaxed`;
            logLine.innerHTML = `<span class="text-slate-600">[${timestamp}]</span> ${message}`;
            consoleDiv.appendChild(logLine);
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        }

        function clearConsole() {
            document.getElementById('console-output').innerHTML = '<div class="text-slate-500">&gt; Console cleared.</div>';
        }

        // Trigger Verification
        async function triggerVerification(controlId) {
            if (activeAction) return;
            activeAction = true;
            loadDashboardData(); // Disable buttons

            logToConsole(`Initiating manual verification for control ${controlId}...`, 'system');
            
            try {
                const response = await fetch(`/api/verify/${controlId}`, { method: 'POST' });
                const data = await response.json();
                
                // Simulate real-time console output
                for (const step of data.steps) {
                    await new Promise(resolve => setTimeout(resolve, 600));
                    logToConsole(step, 'info');
                }
                
                logToConsole(`Verification completed for ${controlId}. Status: ${data.status}`, data.status === 'Compliant' ? 'info' : 'warning');
            } catch (error) {
                logToConsole(`Verification failed for ${controlId}: ${error.message}`, 'error');
            } finally {
                activeAction = false;
                loadDashboardData();
            }
        }

        // Trigger Remediation
        async function triggerRemediation(controlId) {
            if (activeAction) return;
            activeAction = true;
            loadDashboardData(); // Disable buttons

            logToConsole(`Triggering automated remediation for control ${controlId}...`, 'system');
            
            try {
                const response = await fetch(`/api/remediate/${controlId}`, { method: 'POST' });
                const data = await response.json();
                
                // Simulate real-time console output
                for (const step of data.steps) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    logToConsole(step, 'info');
                }
                
                logToConsole(`Remediation completed for ${controlId}. Status updated to Compliant.`, 'info');
            } catch (error) {
                logToConsole(`Remediation failed for ${controlId}: ${error.message}`, 'error');
            } finally {
                activeAction = false;
                loadDashboardData();
            }
        }

        // View Evidence Modal
        async function viewEvidence(logId) {
            try {
                const response = await fetch(`/api/evidence/${logId}`);
                const data = await response.json();
                
                document.getElementById('modal-hash').innerText = data.evidence_hash;
                document.getElementById('modal-timestamp').innerText = new Date(data.timestamp).toLocaleString();
                document.getElementById('modal-operator').innerText = data.operator;
                document.getElementById('modal-details').innerText = JSON.stringify(JSON.parse(data.details), null, 2);
                
                document.getElementById('evidence-modal').classList.remove('hidden');
                document.getElementById('evidence-modal').classList.add('flex');
            } catch (error) {
                console.error("Error loading evidence:", error);
            }
        }

        function closeModal() {
            document.getElementById('evidence-modal').classList.add('hidden');
            document.getElementById('evidence-modal').classList.remove('flex');
        }

        // Reset Demo State
        async function resetDemo() {
            if (confirm("Are you sure you want to reset the compliance state to default?")) {
                await fetch('/api/reset', { method: 'POST' });
                logToConsole("Compliance database reset to default baseline.", "system");
                loadDashboardData();
            }
        }

        // Initial Load
        window.onload = () => {
            loadDashboardData();
        };
    </script>
</body>
</html>
"""

# API Routes

@app.route('/')
def index():
    return render_template_string(DASHBOARD_TEMPLATE)

@app.route('/api/dashboard')
def get_dashboard():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch controls
    cursor.execute("SELECT * FROM controls")
    controls = [dict(row) for row in cursor.fetchall()]
    
    # Fetch recent logs
    cursor.execute("SELECT * FROM evidence_logs ORDER BY timestamp DESC LIMIT 15")
    logs = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    # Calculate stats
    total = len(controls)
    compliant = sum(1 for c in controls if c['status'] == 'Compliant')
    findings = total - compliant
    score = int((compliant / total) * 100) if total > 0 else 0
    
    return jsonify({
        'controls': controls,
        'logs': logs,
        'stats': {
            'total': total,
            'compliant': compliant,
            'findings': findings,
            'score': score
        }
    })

@app.route('/api/verify/<control_id>', methods=['POST'])
def verify_control(control_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM controls WHERE id = ?", (control_id,))
    control = cursor.fetchone()
    
    if not control:
        conn.close()
        return jsonify({'error': 'Control not found'}), 404
    
    steps = []
    status = control['status']
    details = control['details']
    
    # Simulate verification steps based on control
    if control_id == 'SC-7':
        steps = [
            "Scanning AWS Security Groups for open management ports...",
            "Analyzing ingress rules for sg-08f12a (Production-Public-ALB)...",
            "Found Port 22 (SSH) and Port 3389 (RDP) open to 0.0.0.0/0.",
            "Verification complete: Boundary protection violation detected."
        ]
        status = "Non-Compliant"
        details = "Security Group 'sg-08f12a' allows unrestricted public ingress on Port 22 (SSH) and Port 3389 (RDP) from 0.0.0.0/0."
    elif control_id == 'AC-2':
        steps = [
            "Scanning IAM directory for inactive accounts (>90 days)...",
            "Checking MFA status for all active and inactive accounts...",
            "Found 3 inactive accounts without MFA enabled.",
            "Verification complete: Account management warning detected."
        ]
        status = "Warning"
        details = "Found 3 inactive user accounts (>90 days) without MFA enabled: 'test-user-1', 'temp-admin', 'external-vendor'."
    elif control_id == 'SI-4':
        steps = [
            "Querying SIEM log ingestion endpoints...",
            "Checking status of local IDS/IPS agents on production instances...",
            "IDS agent offline on 2 of 5 production instances.",
            "Verification complete: System monitoring warning detected."
        ]
        status = "Warning"
        details = "Intrusion Detection System (IDS) agent is offline on 2 of 5 production instances. SIEM log forwarder heartbeat missing."
    elif control_id == 'IA-2':
        steps = [
            "Evaluating global IAM password policy...",
            "Verifying mandatory MFA enforcement for all console and API access...",
            "All active users have MFA configured.",
            "Verification complete: Identification and authentication compliant."
        ]
        status = "Compliant"
        details = "MFA is enforced globally for all IAM users. Password policy requires 14+ characters, complexity, and 90-day rotation."
    
    # Update control status and last evaluated timestamp
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    cursor.execute(
        "UPDATE controls SET status = ?, last_evaluated = ?, details = ? WHERE id = ?",
        (status, timestamp, details, control_id)
    )
    
    # Log evidence
    log_id = str(uuid.uuid4())
    evidence_details = {
        "control_id": control_id,
        "assessment_type": "Automated Verification",
        "steps_executed": steps,
        "result_status": status,
        "findings": details
    }
    details_str = json.dumps(evidence_details)
    evidence_hash = hashlib.sha256(f"{log_id}-{timestamp}-{control_id}-{status}-{details_str}".encode()).hexdigest()
    
    cursor.execute(
        "INSERT INTO evidence_logs (id, timestamp, control_id, action, operator, status, details, evidence_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (log_id, timestamp, control_id, "Verification", "secops-bot", "Success", details_str, evidence_hash)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'status': status,
        'steps': steps,
        'details': details
    })

@app.route('/api/remediate/<control_id>', methods=['POST'])
def remediate_control(control_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM controls WHERE id = ?", (control_id,))
    control = cursor.fetchone()
    
    if not control:
        conn.close()
        return jsonify({'error': 'Control not found'}), 404
    
    steps = []
    details = ""
    
    # Simulate remediation steps based on control
    if control_id == 'SC-7':
        steps = [
            "Initiating SC-7 Boundary Protection remediation...",
            "Executing API call: ec2:RevokeSecurityGroupIngress on sg-08f12a...",
            "Successfully removed 0.0.0.0/0 ingress rules for Port 22 and Port 3389.",
            "Adding authorized CIDR block 10.