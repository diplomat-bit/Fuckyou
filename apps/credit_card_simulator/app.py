import os
import csv
import json
from flask import Flask, request, jsonify, render_template_string, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'citi-mock-secret-key-102938'

CSV_DIR = 'api'
CSV_PATH = os.path.join(CSV_DIR, 'account-details.csv')

# Default mock data to populate if CSV doesn't exist
DEFAULT_ACCOUNTS = [
    {
        "accountId": "act12345",
        "status_code": "200",
        "client_id": "citi-client-id-999",
        "uuid": "citi-uuid-999",
        "bearer_token": "citi-token-999",
        "response_payload": json.dumps({
            "accountDetails": {
                "accountId": "act12345",
                "displayAccountNumber": "XXXX-XXXX-XXXX-1234",
                "outstandingBalance": 1250.50,
                "availableCredit": 3749.50,
                "creditLimit": 5000.00,
                "currencyCode": "USD",
                "accountStatus": "ACTIVE",
                "paymentDueDate": "2026-12-31"
            }
        })
    },
    {
        "accountId": "act67890",
        "status_code": "200",
        "client_id": "citi-client-id-888",
        "uuid": "citi-uuid-888",
        "bearer_token": "citi-token-888",
        "response_payload": json.dumps({
            "accountDetails": {
                "accountId": "act67890",
                "displayAccountNumber": "XXXX-XXXX-XXXX-5678",
                "outstandingBalance": 450.00,
                "availableCredit": 9550.00,
                "creditLimit": 10000.00,
                "currencyCode": "USD",
                "accountStatus": "ACTIVE",
                "paymentDueDate": "2026-11-15"
            }
        })
    },
    {
        "accountId": "act_error_400",
        "status_code": "400",
        "client_id": "citi-client-id-err",
        "uuid": "citi-uuid-err",
        "bearer_token": "citi-token-err",
        "response_payload": json.dumps({
            "code": "invalid_request",
            "message": "The request parameters or headers are invalid."
        })
    }
]

def init_csv():
    if not os.path.exists(CSV_DIR):
        os.makedirs(CSV_DIR)
    if not os.path.exists(CSV_PATH):
        with open(CSV_PATH, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["accountId", "status_code", "client_id", "uuid", "bearer_token", "response_payload"])
            writer.writeheader()
            for row in DEFAULT_ACCOUNTS:
                writer.writerow(row)

def read_accounts():
    init_csv()
    accounts = {}
    with open(CSV_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                payload = json.loads(row['response_payload'])
            except Exception:
                payload = {"error": "Invalid JSON payload in CSV"}
            
            accounts[row['accountId']] = {
                'accountId': row['accountId'],
                'status_code': int(row['status_code']),
                'client_id': row['client_id'],
                'uuid': row['uuid'],
                'bearer_token': row['bearer_token'],
                'response_payload': payload
            }
    return accounts

def write_accounts(accounts):
    with open(CSV_PATH, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["accountId", "status_code", "client_id", "uuid", "bearer_token", "response_payload"])
        writer.writeheader()
        for acct_id, data in accounts.items():
            writer.writerow({
                "accountId": acct_id,
                "status_code": str(data['status_code']),
                "client_id": data['client_id'],
                "uuid": data['uuid'],
                "bearer_token": data['bearer_token'],
                "response_payload": json.dumps(data['response_payload'])
            })

# HTML Template for the UI Dashboard
DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Citi Account Details API Simulator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .navbar { background-color: #004B87; }
        .card { border: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 25px; }
        .card-header { background-color: #ffffff; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #004B87; }
        .table th { color: #555; font-weight: 600; }
        .badge-success { background-color: #28a745; }
        .badge-danger { background-color: #dc3545; }
        pre { background-color: #272822; color: #f8f8f2; padding: 15px; border-radius: 8px; max-height: 300px; overflow-y: auto; }
        .btn-primary { background-color: #004B87; border-color: #004B87; }
        .btn-primary:hover { background-color: #003366; border-color: #003366; }
    </style>
</head>
<body>

    <nav class="navbar navbar-expand-lg navbar-dark mb-4">
        <div class="container">
            <a class="navbar-brand" href="#">
                <strong style="letter-spacing: 1px;">CITI</strong> Account Details API Simulator
            </a>
            <span class="navbar-text text-white-50">Mock Server & Dashboard</span>
        </div>
    </nav>

    <div class="container">
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                {% for category, message in messages %}
                    <div class="alert alert-{{ category if category != 'error' else 'danger' }} alert-dismissible fade show" role="alert">
                        {{ message }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                {% endfor %}
            {% endif %}
        {% endwith %}

        <div class="row">
            <!-- Left Column: Accounts List & Balance Modifier -->
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Simulated Accounts (from CSV)</span>
                        <span class="badge bg-secondary">Source: api/account-details.csv</span>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Account ID</th>
                                        <th>Status Code</th>
                                        <th>Outstanding Balance</th>
                                        <th>Available Credit</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {% for acct_id, data in accounts.items() %}
                                    <tr>
                                        <td>
                                            <strong>{{ acct_id }}</strong>
                                        </td>
                                        <td>
                                            <span class="badge {% if data.status_code == 200 %}bg-success{% else %}bg-danger{% endif %}">
                                                {{ data.status_code }}
                                            </span>
                                        </td>
                                        <td>
                                            {% if data.response_payload.accountDetails %}
                                                ${{ data.response_payload.accountDetails.outstandingBalance }}
                                            {% else %}
                                                <span class="text-muted">N/A</span>
                                            {% endif %}
                                        </td>
                                        <td>
                                            {% if data.response_payload.accountDetails %}
                                                ${{ data.response_payload.accountDetails.availableCredit }}
                                            {% else %}
                                                <span class="text-muted">N/A</span>
                                            {% endif %}
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editModal-{{ acct_id }}">
                                                Edit Balance
                                            </button>
                                            <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#detailsModal-{{ acct_id }}">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>

                                    <!-- Edit Balance Modal -->
                                    <div class="modal fade" id="editModal-{{ acct_id }}" tabindex="-1" aria-hidden="true">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <form action="{{ url_for('update_balance') }}" method="POST">
                                                    <div class="modal-header">
                                                        <h5 class="modal-title">Modify Balance: {{ acct_id }}</h5>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                    </div>
                                                    <div class="modal-body">
                                                        <input type="hidden" name="accountId" value="{{ acct_id }}">
                                                        {% if data.response_payload.accountDetails %}
                                                        <div class="mb-3">
                                                            <label class="form-label">Outstanding Balance ($)</label>
                                                            <input type="number" step="0.01" class="form-control" name="outstandingBalance" value="{{ data.response_payload.accountDetails.outstandingBalance }}" required>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label class="form-label">Available Credit ($)</label>
                                                            <input type="number" step="0.01" class="form-control" name="availableCredit" value="{{ data.response_payload.accountDetails.availableCredit }}" required>
                                                        </div>
                                                        {% else %}
                                                        <p class="text-danger">This account payload does not contain standard accountDetails structure to modify balance.</p>
                                                        {% endif %}
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                                        <button type="submit" class="btn btn-primary" {% if not data.response_payload.accountDetails %}disabled{% endif %}>Save Changes</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Details Modal -->
                                    <div class="modal fade" id="detailsModal-{{ acct_id }}" tabindex="-1" aria-hidden="true">
                                        <div class="modal-dialog modal-lg">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title">Account Configuration: {{ acct_id }}</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <h6>Required Headers for Validation:</h6>
                                                    <table class="table table-sm table-bordered">
                                                        <tr>
                                                            <th>Header Name</th>
                                                            <th>Expected Value</th>
                                                        </tr>
                                                        <tr>
                                                            <td><code>client_id</code></td>
                                                            <td><code>{{ data.client_id }}</code></td>
                                                        </tr>
                                                        <tr>
                                                            <td><code>uuid</code></td>
                                                            <td><code>{{ data.uuid }}</code></td>
                                                        </tr>
                                                        <tr>
                                                            <td><code>Authorization</code></td>
                                                            <td><code>Bearer {{ data.bearer_token }}</code></td>
                                                        </tr>
                                                    </table>

                                                    <h6 class="mt-4">Response Payload (JSON):</h6>
                                                    <pre><code>{{ data.response_payload | tojson(indent=2) }}</code></pre>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {% endfor %}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Interactive API Tester -->
                <div class="card">
                    <div class="card-header">Interactive API Tester</div>
                    <div class="card-body">
                        <p class="text-muted">Test the mock endpoint directly from this UI. It will perform a fetch request with the headers you specify.</p>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label">Account ID</label>
                                <select class="form-select" id="test-account-id">
                                    {% for acct_id in accounts.keys() %}
                                    <option value="{{ acct_id }}">{{ acct_id }}</option>
                                    {% endfor %}
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Client ID Header</label>
                                <input type="text" class="form-control" id="test-client-id" placeholder="e.g. citi-client-id-999">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">UUID Header</label>
                                <input type="text" class="form-control" id="test-uuid" placeholder="e.g. citi-uuid-999">
                            </div>
                            <div class="col-md-8">
                                <label class="form-label">Bearer Token</label>
                                <input type="text" class="form-control" id="test-token" placeholder="e.g. citi-token-999">
                            </div>
                            <div class="col-md-4 d-flex align-items-end">
                                <button class="btn btn-primary w-100" onclick="runTest()">Send GET Request</button>
                            </div>
                        </div>

                        <div class="mt-4 d-none" id="test-result-container">
                            <h6>Response Status: <span id="test-status" class="badge bg-secondary"></span></h6>
                            <pre><code id="test-response"></code></pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Add Account & API Info -->
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">Add Mock Account</div>
                    <div class="card-body">
                        <form action="{{ url_for('add_account') }}" method="POST">
                            <div class="mb-3">
                                <label class="form-label">Account ID</label>
                                <input type="text" class="form-control" name="accountId" placeholder="e.g. act777" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Status Code</label>
                                <input type="number" class="form-control" name="status_code" value="200" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Client ID Header</label>
                                <input type="text" class="form-control" name="client_id" placeholder="citi-client-id-777" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">UUID Header</label>
                                <input type="text" class="form-control" name="uuid" placeholder="citi-uuid-777" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Bearer Token</label>
                                <input type="text" class="form-control" name="bearer_token" placeholder="citi-token-777" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Credit Limit ($)</label>
                                <input type="number" step="0.01" class="form-control" name="creditLimit" value="5000.00" required>
                            </div>
                            <button type="submit" class="btn btn-success w-100">Create Account</button>
                        </form>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">API Endpoint Details</div>
                    <div class="card-body">
                        <h6>Endpoint:</h6>
                        <p><code>GET /gcbap/api/v1/accounts/&lt;accountId&gt;</code></p>
                        
                        <h6>Required Headers:</h6>
                        <ul>
                            <li><code>client_id</code></li>
                            <li><code>uuid</code></li>
                            <li><code>Authorization: Bearer &lt;token&gt;</code></li>
                        </ul>

                        <h6>Example Curl:</h6>
                        <pre style="font-size: 0.8rem; white-space: pre-wrap;">curl -X GET "{{ request.url_root }}gcbap/api/v1/accounts/act12345" \
  -H "client_id: citi-client-id-999" \
  -H "uuid: citi-uuid-999" \
  -H "Authorization: Bearer citi-token-999"</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function runTest() {
            const accountId = document.getElementById('test-account-id').value;
            const clientId = document.getElementById('test-client-id').value;
            const uuid = document.getElementById('test-uuid').value;
            const token = document.getElementById('test-token').value;

            const headers = new Headers();
            if (clientId) headers.append('client_id', clientId);
            if (uuid) headers.append('uuid', uuid);
            if (token) headers.append('Authorization', 'Bearer ' + token);

            const url = `/gcbap/api/v1/accounts/${accountId}`;

            fetch(url, {
                method: 'GET',
                headers: headers
            })
            .then(response => {
                const statusBadge = document.getElementById('test-status');
                statusBadge.textContent = response.status;
                if (response.status === 200) {
                    statusBadge.className = "badge bg-success";
                } else {
                    statusBadge.className = "badge bg-danger";
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('test-result-container').classList.remove('d-none');
                document.getElementById('test-response').textContent = JSON.stringify(data, null, 2);
            })
            .catch(err => {
                document.getElementById('test-result-container').classList.remove('d-none');
                document.getElementById('test-response').textContent = "Error: " + err;
            });
        }

        // Auto-fill test fields when account changes
        const accountsData = {{ accounts | tojson }};
        document.getElementById('test-account-id').addEventListener('change', function() {
            const acctId = this.value;
            if (accountsData[acctId]) {
                document.getElementById('test-client-id').value = accountsData[acctId].client_id;
                document.getElementById('test-uuid').value = accountsData[acctId].uuid;
                document.getElementById('test-token').value = accountsData[acctId].bearer_token;
            }
        });

        // Trigger initial fill
        document.getElementById('test-account-id').dispatchEvent(new Event('change'));
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    accounts = read_accounts()
    return render_template_string(DASHBOARD_HTML, accounts=accounts)

@app.route('/update-balance', methods=['POST'])
def update_balance():
    account_id = request.form.get('accountId')
    outstanding_balance = float(request.form.get('outstandingBalance', 0))
    available_credit = float(request.form.get('availableCredit', 0))

    accounts = read_accounts()
    if account_id in accounts:
        if 'accountDetails' in accounts[account_id]['response_payload']:
            accounts[account_id]['response_payload']['accountDetails']['outstandingBalance'] = outstanding_balance
            accounts[account_id]['response_payload']['accountDetails']['availableCredit'] = available_credit
            write_accounts(accounts)
            flash(f"Successfully updated balance for account {account_id}!", "success")
        else:
            flash("Account payload structure does not support standard balance updates.", "error")
    else:
        flash("Account not found.", "error")
    
    return redirect(url_for('index'))

@app.route('/add-account', methods=['POST'])
def add_account():
    account_id = request.form.get('accountId').strip()
    status_code = request.form.get('status_code', '200')
    client_id = request.form.get('client_id').strip()
    uuid = request.form.get('uuid').strip()
    bearer_token = request.form.get('bearer_token').strip()
    credit_limit = float(request.form.get('creditLimit', 5000.00))

    if not account_id or not client_id or not uuid or not bearer_token:
        flash("All fields are required to create a mock account.", "error")
        return redirect(url_for('index'))

    accounts = read_accounts()
    if account_id in accounts:
        flash(f"Account ID {account_id} already exists.", "error")
        return redirect(url_for('index'))

    # Create a standard Citi-like response payload
    payload = {
        "accountDetails": {
            "accountId": account_id,
            "displayAccountNumber": f"XXXX-XXXX-XXXX-{account_id[-4:] if len(account_id) >= 4 else '9999'}",
            "outstandingBalance": 0.00,
            "availableCredit": credit_limit,
            "creditLimit": credit_limit,
            "currencyCode": "USD",
            "accountStatus": "ACTIVE",
            "paymentDueDate": "2026-12-31"
        }
    }

    accounts[account_id] = {
        'accountId': account_id,
        'status_code': int(status_code),
        'client_id': client_id,
        'uuid': uuid,
        'bearer_token': bearer_token,
        'response_payload': payload
    }

    write_accounts(accounts)
    flash(f"Account {account_id} successfully added to CSV!", "success")
    return redirect(url_for('index'))

# The Simulated Citi Account Details API Endpoint
@app.route('/gcbap/api/v1/accounts/<accountId>', methods=['GET'])
def get_account_details(accountId):
    accounts = read_accounts()
    if accountId not in accounts:
        return jsonify({
            "code": "not_found",
            "message": f"Account with ID '{accountId}' was not found in the simulator."
        }), 404

    account = accounts[accountId]

    # Extract Headers
    client_id = request.headers.get('client_id')
    uuid = request.headers.get('uuid')
    auth_header = request.headers.get('Authorization')

    # Parse Bearer Token
    token = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]

    # Validate Headers
    errors = []
    if not client_id or client_id != account['client_id']:
        errors.append(f"Invalid or missing 'client_id' header. Expected: '{account['client_id']}'")
    if not uuid or uuid != account['uuid']:
        errors.append(f"Invalid or missing 'uuid' header. Expected: '{account['uuid']}'")
    if not token or token != account['bearer_token']:
        errors.append(f"Invalid or missing 'Authorization' Bearer token. Expected: 'Bearer {account['bearer_token']}'")

    if errors:
        return jsonify({
            "code": "bad_request",
            "message": "Header validation failed. Please check your client_id, uuid, and Bearer token.",
            "errors": errors
        }), 400

    # Return the exact payload and status code specified in the CSV
    return jsonify(account['response_payload']), account['status_code']

if __name__ == '__main__':
    # Initialize CSV file on startup
    init_csv()
    # Run Flask App
    app.run(host='0.0.0.0', port=5000, debug=True)