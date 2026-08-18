import os
import json
import datetime
import base64
import copy
from flask import Flask, render_template_string, jsonify, request

app = Flask(__name__)

# Seed Data
INITIAL_CARDS = {
    "card-1111": {
        "cardId": "card-1111",
        "cardNumber": "4111 2222 3333 1111",
        "type": "Primary",
        "status": "INACTIVE",
        "cvv": "123",
        "expiryDate": "12/28",
        "attempts": 0,
        "maxAttempts": 3
    },
    "card-2222": {
        "cardId": "card-2222",
        "cardNumber": "4111 2222 3333 2222",
        "type": "Supplementary",
        "status": "ACTIVE",
        "cvv": "456",
        "expiryDate": "08/27",
        "attempts": 0,
        "maxAttempts": 3
    },
    "card-3333": {
        "cardId": "card-3333",
        "cardNumber": "4111 2222 3333 3333",
        "type": "Primary",
        "status": "BLOCKED",
        "cvv": "789",
        "expiryDate": "05/26",
        "attempts": 3,
        "maxAttempts": 3
    }
}

# In-memory database
cards_db = copy.deepcopy(INITIAL_CARDS)
logs = []

def add_log(method, path, status_code, req_body, res_body):
    status_text = {
        200: "OK",
        201: "Created",
        400: "Bad Request",
        404: "Not Found",
        500: "Internal Server Error"
    }.get(status_code, "Unknown")

    req_str = json.dumps(req_body, indent=2) if req_body else "{}"
    res_str = json.dumps(res_body, indent=2) if res_body else "{}"

    raw_log = (
        f"{method} {path} HTTP/1.1\n"
        f"Content-Type: application/json\n"
        f"Host: api.gcbap.simulator\n\n"
        f"{req_str}\n\n"
        f"--------------------------------------------------\n\n"
        f"HTTP/1.1 {status_code} {status_text}\n"
        f"Content-Type: application/json\n\n"
        f"{res_str}"
    )

    logs.insert(0, {
        "id": len(logs) + 1,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
        "method": method,
        "path": path,
        "status": status_code,
        "raw": raw_log
    })

def decrypt_cvv(encrypted_val):
    """
    Simulates decryption.
    Supports:
    1. Plain text (fallback)
    2. Prefix 'ENC_' (e.g., ENC_123 -> 123)
    3. Base64 encoded strings
    """
    if not encrypted_val:
        return ""
    
    if encrypted_val.startswith("ENC_"):
        return encrypted_val.replace("ENC_", "")
    
    try:
        decoded = base64.b64decode(encrypted_val).decode('utf-8')
        # Ensure it looks like a 3-digit CVV
        if decoded.isdigit() and len(decoded) in [3, 4]:
            return decoded
    except Exception:
        pass

    return encrypted_val

# --- API Endpoints ---

@app.route('/gcbap/api/v1/cards/<cardId>/activations/ACTIVATE', methods=['POST'])
def activate_card(cardId):
    data = request.get_json() or {}
    encrypted_cvv = data.get("encryptedCvv", "")
    expiry_date = data.get("expiryDate", "")

    if cardId not in cards_db:
        res_body = {
            "error": "CARD_NOT_FOUND",
            "message": f"Card with ID '{cardId}' was not found in the system."
        }
        add_log("POST", request.path, 404, data, res_body)
        return jsonify(res_body), 404

    card = cards_db[cardId]

    # Check if already blocked
    if card["status"] == "BLOCKED" or card["attempts"] >= card["maxAttempts"]:
        res_body = {
            "error": "maximumAttemptsLimitExceeded",
            "message": "The maximum number of activation attempts has been exceeded. This card is blocked."
        }
        card["status"] = "BLOCKED"  # Ensure state is synchronized
        add_log("POST", request.path, 400, data, res_body)
        return jsonify(res_body), 400

    # Check if already active
    if card["status"] == "ACTIVE":
        res_body = {
            "error": "CARD_ALREADY_ACTIVE",
            "message": "This card is already active and cannot be activated again."
        }
        add_log("POST", request.path, 400, data, res_body)
        return jsonify(res_body), 400

    # Decrypt and validate CVV
    decrypted = decrypt_cvv(encrypted_cvv)
    
    if decrypted != card["cvv"]:
        card["attempts"] += 1
        if card["attempts"] >= card["maxAttempts"]:
            card["status"] = "BLOCKED"
            res_body = {
                "error": "maximumAttemptsLimitExceeded",
                "message": "Incorrect CVV. Maximum activation attempts exceeded. The card has been blocked."
            }
        else:
            remaining = card["maxAttempts"] - card["attempts"]
            res_body = {
                "error": "INVALID_CVV",
                "message": f"The CVV provided is incorrect. Remaining attempts: {remaining}."
            }
        add_log("POST", request.path, 400, data, res_body)
        return jsonify(res_body), 400

    # Success path
    card["status"] = "ACTIVE"
    card["attempts"] = 0  # Reset attempts on successful activation
    res_body = {
        "status": "SUCCESS",
        "message": "Card activated successfully.",
        "cardId": cardId,
        "activationTimestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    add_log("POST", request.path, 200, data, res_body)
    return jsonify(res_body), 200


@app.route('/gcbap/api/v1/cards/<cardId>/activations/DEACTIVATE', methods=['POST'])
def deactivate_card(cardId):
    data = request.get_json() or {}
    reason = data.get("reason", "User requested deactivation")

    if cardId not in cards_db:
        res_body = {
            "error": "CARD_NOT_FOUND",
            "message": f"Card with ID '{cardId}' was not found in the system."
        }
        add_log("POST", request.path, 404, data, res_body)
        return jsonify(res_body), 404

    card = cards_db[cardId]

    # Check if already inactive
    if card["status"] == "INACTIVE":
        res_body = {
            "error": "CARD_ALREADY_INACTIVE",
            "message": "This card is already inactive."
        }
        add_log("POST", request.path, 400, data, res_body)
        return jsonify(res_body), 400

    # Deactivate card
    card["status"] = "INACTIVE"
    res_body = {
        "status": "SUCCESS",
        "message": "Card deactivated successfully.",
        "cardId": cardId,
        "deactivationTimestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "reason": reason
    }
    add_log("POST", request.path, 200, data, res_body)
    return jsonify(res_body), 200


# --- UI Support Endpoints ---

@app.route('/api/cards', methods=['GET', 'POST'])
def manage_cards():
    if request.method == 'POST':
        data = request.get_json() or {}
        card_id = data.get("cardId")
        if not card_id or card_id in cards_db:
            return jsonify({"error": "Invalid or duplicate Card ID"}), 400
        
        cards_db[card_id] = {
            "cardId": card_id,
            "cardNumber": data.get("cardNumber", "4111 2222 3333 0000"),
            "type": data.get("type", "Primary"),
            "status": data.get("status", "INACTIVE"),
            "cvv": data.get("cvv", "123"),
            "expiryDate": data.get("expiryDate", "12/28"),
            "attempts": 0,
            "maxAttempts": int(data.get("maxAttempts", 3))
        }
        return jsonify({"status": "success", "card": cards_db[card_id]})
    
    return jsonify(list(cards_db.values()))


@app.route('/api/logs', methods=['GET'])
def get_logs():
    return jsonify(logs)


@app.route('/api/reset', methods=['POST'])
def reset_db():
    global cards_db, logs
    cards_db = copy.deepcopy(INITIAL_CARDS)
    logs.clear()
    return jsonify({"status": "success", "message": "Database and logs reset successfully."})


@app.route('/api/clear-logs', methods=['POST'])
def clear_logs():
    global logs
    logs.clear()
    return jsonify({"status": "success", "message": "Logs cleared."})


# --- Web UI ---

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GCBAP Card Activation Simulator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .navbar-brand {
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .card-shadow {
            box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
            border: none;
            border-radius: 10px;
        }
        .terminal {
            background-color: #1e1e1e;
            color: #d4d4d4;
            font-family: 'Courier New', Courier, monospace;
            padding: 15px;
            border-radius: 8px;
            max-height: 500px;
            overflow-y: auto;
            font-size: 0.9rem;
            white-space: pre-wrap;
            border: 1px solid #333;
        }
        .badge-active { background-color: #198754; }
        .badge-inactive { background-color: #6c757d; }
        .badge-blocked { background-color: #dc3545; }
        .log-item {
            border-bottom: 1px solid #2d2d2d;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        .log-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .nav-tabs .nav-link.active {
            background-color: #fff;
            border-bottom-color: transparent;
            font-weight: 600;
        }
    </style>
</head>
<body>

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div class="container-fluid px-4">
            <span class="navbar-brand"><i class="bi bi-credit-card-2-front-fill me-2 text-primary"></i> GCBAP Card Activation Simulator</span>
            <div class="d-flex">
                <button class="btn btn-outline-danger btn-sm me-2" onclick="resetDatabase()"><i class="bi bi-arrow-counterclockwise me-1"></i> Reset System</button>
                <button class="btn btn-outline-secondary btn-sm" onclick="clearLogs()"><i class="bi bi-trash me-1"></i> Clear Logs</button>
            </div>
        </div>
    </nav>

    <div class="container-fluid px-4">
        <div class="row g-4">
            
            <!-- Left Column: Card Database & Control Panel -->
            <div class="col-lg-7">
                
                <!-- Card Database -->
                <div class="card card-shadow mb-4">
                    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 text-dark fw-bold"><i class="bi bi-database me-2 text-secondary"></i> In-Memory Card Database</h5>
                        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addCardModal"><i class="bi bi-plus-lg me-1"></i> Add Card</button>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th class="ps-3">Card ID</th>
                                        <th>Card Number</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>CVV</th>
                                        <th>Expiry</th>
                                        <th class="pe-3">Attempts</th>
                                    </tr>
                                </thead>
                                <tbody id="cards-table-body">
                                    <!-- Dynamic Content -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Interactive API Client -->
                <div class="card card-shadow">
                    <div class="card-header bg-white py-3">
                        <h5 class="mb-0 text-dark fw-bold"><i class="bi bi-send me-2 text-primary"></i> Interactive API Client</h5>
                    </div>
                    <div class="card-body">
                        <form id="api-form" onsubmit="sendRequest(event)">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Select Target Card</label>
                                    <select class="form-select" id="client-card-id" onchange="onCardSelect()" required>
                                        <!-- Dynamic Options -->
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Action / Endpoint</label>
                                    <select class="form-select" id="client-action" onchange="toggleActionFields()" required>
                                        <option value="ACTIVATE">ACTIVATE (/activations/ACTIVATE)</option>
                                        <option value="DEACTIVATE">DEACTIVATE (/activations/DEACTIVATE)</option>
                                    </select>
                                </div>

                                <!-- Activation Fields -->
                                <div class="col-md-6 activation-field">
                                    <label class="form-label fw-semibold">CVV Input</label>
                                    <input type="text" class="form-control" id="client-cvv" placeholder="e.g. 123" maxlength="4">
                                    <div class="form-text">Will be automatically encrypted as <code id="encryption-preview">ENC_123</code> for the payload.</div>
                                </div>
                                <div class="col-md-6 activation-field">
                                    <label class="form-label fw-semibold">Expiry Date</label>
                                    <input type="text" class="form-control" id="client-expiry" placeholder="MM/YY" maxlength="5">
                                </div>

                                <!-- Deactivation Fields -->
                                <div class="col-12 deactivation-field d-none">
                                    <label class="form-label fw-semibold">Deactivation Reason</label>
                                    <input type="text" class="form-control" id="client-reason" placeholder="e.g. Card lost, customer request">
                                </div>

                                <div class="col-12 text-end mt-4">
                                    <button type="submit" class="btn btn-primary px-4"><i class="bi bi-play-fill me-1"></i> Execute Request</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </div>

            <!-- Right Column: Live HTTP Logs -->
            <div class="col-lg-5">
                <div class="card card-shadow h-100">
                    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 text-dark fw-bold"><i class="bi bi-terminal me-2 text-success"></i> Raw HTTP Request/Response Logs</h5>
                        <span class="badge bg-secondary" id="log-count">0 logs</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="terminal flex-grow-1" id="terminal-logs">
                            <div class="text-muted text-center py-5">No HTTP requests captured yet. Trigger an action to see raw logs.</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Add Card Modal -->
    <div class="modal fade" id="addCardModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Add New Mock Card</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="add-card-form" onsubmit="addNewCard(event)">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Card ID</label>
                            <input type="text" class="form-control" id="modal-card-id" placeholder="e.g. card-4444" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Card Number</label>
                            <input type="text" class="form-control" id="modal-card-number" placeholder="4111 2222 3333 4444" required>
                        </div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Type</label>
                                <select class="form-select" id="modal-card-type">
                                    <option value="Primary">Primary</option>
                                    <option value="Supplementary">Supplementary</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Initial Status</label>
                                <select class="form-select" id="modal-card-status">
                                    <option value="INACTIVE">INACTIVE</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="BLOCKED">BLOCKED</option>
                                </select>
                            </div>
                        </div>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">CVV</label>
                                <input type="text" class="form-control" id="modal-card-cvv" placeholder="123" maxlength="4" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Expiry Date</label>
                                <input type="text" class="form-control" id="modal-card-expiry" placeholder="12/28" maxlength="5" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Max Attempts</label>
                                <input type="number" class="form-control" id="modal-card-max" value="3" min="1" max="10" required>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Card</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        let currentCards = {};

        document.addEventListener("DOMContentLoaded", () => {
            loadCards();
            loadLogs();
            
            // Real-time encryption preview helper
            document.getElementById('client-cvv').addEventListener('input', (e) => {
                const val = e.target.value;
                document.getElementById('encryption-preview').innerText = val ? `ENC_${val}` : 'ENC_123';
            });
        });

        async function loadCards() {
            const res = await fetch('/api/cards');
            const cards = await res.json();
            
            const tableBody = document.getElementById('cards-table-body');
            const selectDropdown = document.getElementById('client-card-id');
            
            tableBody.innerHTML = '';
            const previousSelection = selectDropdown.value;
            selectDropdown.innerHTML = '';

            cards.forEach(card => {
                currentCards[card.cardId] = card;

                // Status Badge
                let badgeClass = 'badge-inactive';
                if (card.status === 'ACTIVE') badgeClass = 'badge-active';
                if (card.status === 'BLOCKED') badgeClass = 'badge-blocked';

                // Append to Table
                tableBody.innerHTML += `
                    <tr>
                        <td class="ps-3 fw-semibold">${card.cardId}</td>
                        <td><code>${card.cardNumber}</code></td>
                        <td><span class="badge bg-light text-dark border">${card.type}</span></td>
                        <td><span class="badge ${badgeClass}">${card.status}</span></td>
                        <td><code>${card.cvv}</code></td>
                        <td>${card.expiryDate}</td>
                        <td class="pe-3">
                            <span class="${card.attempts >= card.maxAttempts ? 'text-danger fw-bold' : 'text-muted'}">
                                ${card.attempts} / ${card.maxAttempts}
                            </span>
                        </td>
                    </tr>
                `;

                // Append to Dropdown
                const option = document.createElement('option');
                option.value = card.cardId;
                option.text = `${card.cardId} (${card.cardNumber.slice(-4)}) - ${card.status}`;
                selectDropdown.appendChild(option);
            });

            if (previousSelection && currentCards[previousSelection]) {
                selectDropdown.value = previousSelection;
            }
            onCardSelect();
        }

        async function loadLogs() {
            const res = await fetch('/api/logs');
            const logs = await res.json();
            
            const terminal = document.getElementById('terminal-logs');
            document.getElementById('log-count').innerText = `${logs.length} logs`;

            if (logs.length === 0) {
                terminal.innerHTML = '<div class="text-muted text-center py-5">No HTTP requests captured yet. Trigger an action to see raw logs.</div>';
                return;
            }

            terminal.innerHTML = logs.map(log => `
                <div class="log-item">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-secondary">${log.timestamp}</span>
                        <span class="badge ${log.status === 200 ? 'bg-success' : 'bg-danger'}">HTTP ${log.status}</span>
                    </div>
                    <pre class="mb-0 text-info" style="white-space: pre-wrap; font-size: 0.85rem;">${escapeHtml(log.raw)}</pre>
                </div>
            `).join('');
        }

        function escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function onCardSelect() {
            const cardId = document.getElementById('client-card-id').value;
            if (!cardId || !currentCards[cardId]) return;

            const card = currentCards[cardId];
            document.getElementById('client-expiry').value = card.expiryDate;
            document.getElementById('client-cvv').value = '';
            document.getElementById('encryption-preview').innerText = 'ENC_123';
        }

        function toggleActionFields() {
            const action = document.getElementById('client-action').value;
            const activationFields = document.querySelectorAll('.activation-field');
            const deactivationFields = document.querySelectorAll('.deactivation-field');

            if (action === 'ACTIVATE') {
                activationFields.forEach(el => el.classList.remove('d-none'));
                deactivationFields.forEach(el => el.classList.add('d-none'));
            } else {
                activationFields.forEach(el => el.classList.add('d-none'));
                deactivationFields.forEach(el => el.classList.remove('d-none'));
            }
        }

        async function sendRequest(event) {
            event.preventDefault();
            const cardId = document.getElementById('client-card-id').value;
            const action = document.getElementById('client-action').value;
            
            let url = `/gcbap/api/v1/cards/${cardId}/activations/${action}`;
            let payload = {};

            if (action === 'ACTIVATE') {
                const cvv = document.getElementById('client-cvv').value;
                payload = {
                    encryptedCvv: `ENC_${cvv}`,
                    expiryDate: document.getElementById('client-expiry').value
                };
            } else {
                payload = {
                    reason: document.getElementById('client-reason').value || "User requested deactivation"
                };
            }

            try {
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                console.error("Request failed", err);
            }

            // Refresh UI
            await loadCards();
            await loadLogs();
        }

        async function addNewCard(event) {
            event.preventDefault();
            const payload = {
                cardId: document.getElementById('modal-card-id').value,
                cardNumber: document.getElementById('modal-card-number').value,
                type: document.getElementById('modal-card-type').value,
                status: document.getElementById('modal-card-status').value,
                cvv: document.getElementById('modal-card-cvv').value,
                expiryDate: document.getElementById('modal-card-expiry').value,
                maxAttempts: document.getElementById('modal-card-max').value
            };

            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Close modal
                const modalEl = document.getElementById('addCardModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                
                // Reset form
                document.getElementById('add-card-form').reset();
                
                await loadCards();
            } else {
                const err = await res.json();
                alert("Error adding card: " + err.error);
            }
        }

        async function resetDatabase() {
            if (confirm("Are you sure you want to reset the database and clear all logs?")) {
                await fetch('/api/reset', { method: 'POST' });
                await loadCards();
                await loadLogs();
            }
        }

        async function clearLogs() {
            await fetch('/api/clear-logs', { method: 'POST' });
            await loadLogs();
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)