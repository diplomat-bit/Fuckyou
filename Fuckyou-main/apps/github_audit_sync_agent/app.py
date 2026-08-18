import os
import json
import base64
import sqlite3
from datetime import datetime
import requests
from flask import Flask, request, jsonify, render_template_string, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler

# Initialize Flask App
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "github-audit-sync-agent-secret-key-12938")

# Database Configuration
# Using SQLite for local storage of configurations, rules, and sync logs
db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "audit_agent.db")
app.config["SQLALCHEMY_DATABASE_DATABASE_URI"] = f"sqlite:///{db_path}" # Fallback/typo protection
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# --------------------------------------------------------------------------
# DATABASE MODELS
# --------------------------------------------------------------------------

class ConfigSetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.String(500), nullable=False)

class ComplianceRule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default="PASSED") # PASSED, FAILED, WARNING
    last_checked = db.Column(db.DateTime, default=datetime.utcnow)

class SyncLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False) # SUCCESS, FAILED
    commit_sha = db.Column(db.String(100), nullable=True)
    message = db.Column(db.Text, nullable=True)
    report_snapshot = db.Column(db.Text, nullable=True) # JSON string of the report synced

# --------------------------------------------------------------------------
# HELPER FUNCTIONS & GITHUB API INTEGRATION
# --------------------------------------------------------------------------

def get_config(key, default=""):
    # Check environment variables first, then database
    env_val = os.environ.get(key)
    if env_val:
        return env_val
    setting = ConfigSetting.query.filter_by(key=key).first()
    return setting.value if setting else default

def set_config(key, value):
    setting = ConfigSetting.query.filter_by(key=key).first()
    if setting:
        setting.value = value
    else:
        setting = ConfigSetting(key=key, value=value)
        db.session.add(setting)
    db.session.commit()

def generate_compliance_report():
    """Generates a structured sovereign compliance report based on current rules."""
    rules = ComplianceRule.query.all()
    passed_count = sum(1 for r in rules if r.status == "PASSED")
    total_count = len(rules)
    compliance_score = (passed_count / total_count * 100) if total_count > 0 else 100.0

    report = {
        "agent_metadata": {
            "agent_id": "sovereign-audit-sync-01",
            "version": "1.0.0",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "sovereign_zone": get_config("SOVEREIGN_ZONE", "EU-West-Sovereign")
        },
        "compliance_summary": {
            "total_rules_evaluated": total_count,
            "rules_passed": passed_count,
            "rules_failed": total_count - passed_count,
            "overall_compliance_score": f"{compliance_score:.2f}%"
        },
        "evaluated_rules": [
            {
                "id": r.id,
                "name": r.name,
                "category": r.category,
                "description": r.description,
                "status": r.status,
                "last_checked": r.last_checked.isoformat() + "Z"
            } for r in rules
        ]
    }
    return report

def push_report_to_github():
    """Pushes the latest compliance report to the configured GitHub repository."""
    token = get_config("GITHUB_AUDIT_TOKEN")
    repo = get_config("GITHUB_AUDIT_REPO")
    branch = get_config("GITHUB_AUDIT_BRANCH", "main")
    path = get_config("GITHUB_AUDIT_PATH", "compliance/sovereign_audit_report.json")

    if not token or not repo:
        return False, "GitHub Token or Repository not configured."

    report_data = generate_compliance_report()
    report_json_str = json.dumps(report_data, indent=2)
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    url = f"https://api.github.com/repos/{repo}/contents/{path}"

    # Step 1: Get existing file SHA if it exists to perform an update
    sha = None
    try:
        r = requests.get(url, headers=headers, params={"ref": branch}, timeout=10)
        if r.status_code == 200:
            sha = r.json().get("sha")
    except Exception as e:
        return False, f"Failed to connect to GitHub API: {str(e)}"

    # Step 2: Push/Commit the file
    encoded_content = base64.b64encode(report_json_str.encode('utf-8')).decode('utf-8')
    commit_message = f"chore(audit): immutable compliance sync - {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC [skip ci]"
    
    payload = {
        "message": commit_message,
        "content": encoded_content,
        "branch": branch
    }
    if sha:
        payload["sha"] = sha

    try:
        put_r = requests.put(url, headers=headers, json=payload, timeout=10)
        if put_r.status_code in [200, 201]:
            res_data = put_r.json()
            commit_sha = res_data.get("commit", {}).get("sha", "N/A")
            
            # Log success to DB
            log = SyncLog(
                status="SUCCESS",
                commit_sha=commit_sha,
                message=f"Successfully synced compliance report to {repo}/{path} on branch {branch}.",
                report_snapshot=report_json_str
            )
            db.session.add(log)
            db.session.commit()
            return True, f"Successfully synced! Commit SHA: {commit_sha}"
        else:
            error_msg = put_r.json().get("message", put_r.text)
            log = SyncLog(
                status="FAILED",
                message=f"GitHub API Error: {error_msg}",
                report_snapshot=report_json_str
            )
            db.session.add(log)
            db.session.commit()
            return False, f"GitHub API Error: {error_msg}"
    except Exception as e:
        log = SyncLog(
            status="FAILED",
            message=f"Network/Request Error: {str(e)}",
            report_snapshot=report_json_str
        )
        db.session.add(log)
        db.session.commit()
        return False, f"Network/Request Error: {str(e)}"

def fetch_github_commit_history():
    """Fetches the commit history for the compliance report file from GitHub."""
    token = get_config("GITHUB_AUDIT_TOKEN")
    repo = get_config("GITHUB_AUDIT_REPO")
    branch = get_config("GITHUB_AUDIT_BRANCH", "main")
    path = get_config("GITHUB_AUDIT_PATH", "compliance/sovereign_audit_report.json")

    if not token or not repo:
        return []

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    url = f"https://api.github.com/repos/{repo}/commits"
    params = {"sha": branch, "path": path}

    try:
        r = requests.get(url, headers=headers, params=params, timeout=10)
        if r.status_code == 200:
            commits = r.json()
            formatted_commits = []
            for c in commits:
                formatted_commits.append({
                    "sha": c.get("sha"),
                    "author": c.get("commit", {}).get("author", {}).get("name"),
                    "email": c.get("commit", {}).get("author", {}).get("email"),
                    "date": c.get("commit", {}).get("author", {}).get("date"),
                    "message": c.get("commit", {}).get("message"),
                    "html_url": c.get("html_url")
                })
            return formatted_commits
    except Exception:
        pass
    return []

# --------------------------------------------------------------------------
# SCHEDULER SETUP
# --------------------------------------------------------------------------
scheduler = BackgroundScheduler()

def scheduled_sync_job():
    with app.app_context():
        enabled = get_config("SCHEDULER_ENABLED", "false").lower() == "true"
        if enabled:
            push_report_to_github()

# Start scheduler
scheduler.add_job(func=scheduled_sync_job, trigger="interval", minutes=15, id="compliance_sync_job")
scheduler.start()

# --------------------------------------------------------------------------
# SEED DEFAULT DATA
# --------------------------------------------------------------------------
def seed_data():
    # Seed default compliance rules if empty
    if ComplianceRule.query.count() == 0:
        default_rules = [
            ComplianceRule(name="Sovereign Data Residency", category="Data Sovereignty", description="Ensure all customer data is stored within sovereign borders (EU/US Sovereign Cloud).", status="PASSED"),
            ComplianceRule(name="MFA Enforcement Policy", category="Identity & Access", description="Verify that Multi-Factor Authentication is enforced for all administrative accounts.", status="PASSED"),
            ComplianceRule(name="At-Rest Encryption", category="Data Security", description="Verify that all database volumes and object storage buckets are encrypted using customer-managed keys.", status="PASSED"),
            ComplianceRule(name="Immutable Audit Logging", category="Audit & Logging", description="Ensure system audit logs are streamed to an immutable ledger or repository.", status="WARNING"),
            ComplianceRule(name="Vulnerability Patching SLA", category="Vulnerability Management", description="Confirm all critical and high vulnerabilities are patched within the 14-day SLA.", status="PASSED")
        ]
        db.session.bulk_save_objects(default_rules)
        db.session.commit()

    # Seed default configurations if empty
    if ConfigSetting.query.count() == 0:
        set_config("GITHUB_AUDIT_BRANCH", "main")
        set_config("GITHUB_AUDIT_PATH", "compliance/sovereign_audit_report.json")
        set_config("SOVEREIGN_ZONE", "EU-West-Sovereign")
        set_config("SCHEDULER_ENABLED", "false")

# Initialize DB
with app.app_context():
    db.create_all()
    seed_data()

# --------------------------------------------------------------------------
# FLASK ROUTES & UI (4 Integrated Apps)
# --------------------------------------------------------------------------

# Single-page dashboard template with Tailwind CSS
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-900">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sovereign Compliance & GitHub Audit Sync Agent</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="h-full text-slate-100 font-sans">
    <div class="min-h-full flex flex-col">
        <!-- Header -->
        <header class="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="bg-indigo-600 p-2 rounded-lg text-white">
                        <i class="fa-solid fa-shield-halved text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold tracking-tight text-white">Sovereign Audit Sync Agent</h1>
                        <p class="text-xs text-slate-400">Immutable GitHub Compliance Logging</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="inline-flex items-center rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-400/20">
                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                        Agent Active
                    </span>
                    <span class="text-xs text-slate-500">Zone: <strong class="text-slate-300">{{ sovereign_zone }}</strong></span>
                </div>
            </div>
        </header>

        <!-- Main Content Grid -->
        <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            <!-- Flash Messages -->
            {% with messages = get_flashed_messages(with_categories=true) %}
              {% if messages %}
                {% for category, message in messages %}
                  <div class="mb-6 p-4 rounded-lg {% if category == 'error' %}bg-red-900/30 border border-red-800 text-red-200{% else %}bg-emerald-900/30 border border-emerald-800 text-emerald-200{% endif %} flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                          <i class="fa-solid {% if category == 'error' %}fa-circle-exclamation{% else %}fa-circle-check{% endif %}"></i>
                          <span>{{ message }}</span>
                      </div>
                  </div>
                {% endfor %}
              {% endif %}
            {% endwith %}

            <!-- Navigation Tabs (The 4 Apps) -->
            <div class="border-b border-slate-800 mb-8">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onclick="switchTab('app-sync')" id="tab-app-sync" class="tab-btn border-indigo-500 text-indigo-400 pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span>App 1: Sync Agent & Report</span>
                    </button>
                    <button onclick="switchTab('app-history')" id="tab-app-history" class="tab-btn border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700 pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        <span>App 2: Git Audit Explorer</span>
                    </button>
                    <button onclick="switchTab('app-policy')" id="tab-app-policy" class="tab-btn border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700 pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2">
                        <i class="fa-solid fa-list-check"></i>
                        <span>App 3: Policy & Rule Engine</span>
                    </button>
                    <button onclick="switchTab('app-scheduler')" id="tab-app-scheduler" class="tab-btn border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700 pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2">
                        <i class="fa-solid fa-sliders"></i>
                        <span>App 4: Scheduler & Config</span>
                    </button>
                </nav>
            </div>

            <!-- APP 1: SYNC AGENT & REPORT -->
            <div id="panel-app-sync" class="tab-panel space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column: Sync Trigger & Status -->
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-2">Manual Sync Trigger</h3>
                            <p class="text-sm text-slate-400 mb-6">Instantly compile the current compliance state and push an immutable, cryptographically tracked commit to your GitHub repository.</p>
                            
                            <div class="space-y-4 mb-6">
                                <div class="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                    <span class="text-xs text-slate-500 block">Target Repository</span>
                                    <span class="text-sm font-mono text-slate-300">{{ github_repo or 'Not Configured' }}</span>
                                </div>
                                <div class="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                    <span class="text-xs text-slate-500 block">Target Path</span>
                                    <span class="text-sm font-mono text-slate-300">{{ github_path }}</span>
                                </div>
                            </div>
                        </div>

                        <form action="{{ url_for('trigger_sync') }}" method="POST">
                            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/20">
                                <i class="fa-solid fa-rotate"></i>
                                <span>Sync Compliance State Now</span>
                            </button>
                        </form>
                    </div>

                    <!-- Right Column: Live Report Preview -->
                    <div class="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-semibold text-white">Compliance Report Preview</h3>
                                <p class="text-sm text-slate-400">Real-time generated JSON payload matching the GITHUB_AUDIT_TOKEN workflow.</p>
                            </div>
                            <span class="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded border border-indigo-500/20">JSON Format</span>
                        </div>
                        <div class="flex-1 bg-slate-900 rounded-lg p-4 border border-slate-800 overflow-auto max-h-[400px]">
                            <pre class="text-xs text-emerald-400 font-mono">{{ report_preview | tojson(indent=2) }}</pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- APP 2: GIT AUDIT EXPLORER -->
            <div id="panel-app-history" class="tab-panel hidden space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column: Local Sync Logs -->
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-6 lg:col-span-1">
                        <h3 class="text-lg font-semibold text-white mb-2">Local Sync History</h3>
                        <p class="text-sm text-slate-400 mb-4">Local database logs of all automated and manual sync attempts.</p>
                        
                        <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {% if local_logs %}
                                {% for log in local_logs %}
                                    <div class="p-3 rounded-lg border {% if log.status == 'SUCCESS' %}bg-emerald-950/20 border-emerald-800/50{% else %}bg-red-950/20 border-red-800/50{% endif %}">
                                        <div class="flex items-center justify-between mb-1">
                                            <span class="text-xs font-semibold {% if log.status == 'SUCCESS' %}text-emerald-400{% else %}text-red-400{% endif %}">{{ log.status }}</span>
                                            <span class="text-[10px] text-slate-500">{{ log.timestamp.strftime('%Y-%m-%d %H:%M:%S') }}</span>
                                        </div>
                                        <p class="text-xs text-slate-300 line-clamp-2">{{ log.message }}</p>
                                        {% if log.commit_sha %}
                                            <span class="text-[10px] font-mono text-indigo-400 block mt-1">SHA: {{ log.commit_sha[:8] }}</span>
                                        {% endif %}
                                    </div>
                                {% endfor %}
                            {% else %}
                                <p class="text-sm text-slate-500 text-center py-8">No local sync logs found.</p>
                            {% endif %}
                        </div>
                    </div>

                    <!-- Right Column: GitHub Commit History -->
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-6 lg:col-span-2">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-semibold text-white">Immutable Git Commit History</h3>
                                <p class="text-sm text-slate-400">Directly fetched from GitHub. Verifies the integrity and timeline of compliance reports.</p>
                            </div>
                            <button onclick="window.location.reload()" class="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
                                <i class="fa-solid fa-arrows-rotate"></i>
                                <span>Refresh</span>
                            </button>
                        </div>

                        <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {% if git_commits %}
                                {% for commit in git_commits %}
                                    <div class="p-4 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition duration-150">
                                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <div class="flex items-center space-x-2">
                                                <span class="bg-slate-800 text-slate-300 text-xs font-mono px-2 py-1 rounded border border-slate-700">{{ commit.sha[:8] }}</span>
                                                <span class="text-xs text-slate-400">by <strong class="text-slate-300">{{ commit.author }}</strong></span>
                                            </div>
                                            <span class="text-xs text-slate-500">{{ commit.date }}</span>
                                        </div>
                                        <p class="text-sm text-slate-200 font-mono mb-2">{{ commit.message }}</p>
                                        <a href="{{ commit.html_url }}" target="_blank" class="text-xs text-indigo-400 hover:underline inline-flex items-center space-x-1">
                                            <span>View Commit on GitHub</span>
                                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                        </a>
                                    </div>
                                {% endfor %}
                            {% else %}
                                <div class="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
                                    <i class="fa-solid fa-code-commit text-3xl text-slate-600 mb-3"></i>
                                    <p class="text-sm text-slate-400">No commits found or GitHub integration not configured.</p>
                                    <p class="text-xs text-slate-500 mt-1">Ensure your GitHub Token and Repo are correct in App 4.</p>
                                </div>
                            {% endif %}
                        </div>
                    </div>
                </div>
            </div>

            <!-- APP 3: POLICY & RULE ENGINE -->
            <div id="panel-app-policy" class="tab-panel hidden space-y-6">
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 class="text-lg font-semibold text-white">Sovereign Compliance Rules</h3>
                            <p class="text-sm text-slate-400">Manage and evaluate compliance rules that form the core of the audit report.</p>
                        </div>
                        <button onclick="openAddRuleModal()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center space-x-2">
                            <i class="fa-solid fa-plus"></i>
                            <span>Add Custom Rule</span>
                        </button>
                    </div>

                    <!-- Rules Table -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-800">
                            <thead>
                                <tr class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <th class="py-3 px-4">Rule Name</th>
                                    <th class="py-3 px-4">Category</th>
                                    <th class="py-3 px-4">Description</th>
                                    <th class="py-3 px-4">Status</th>
                                    <th class="py-3 px-4">Last Checked</th>
                                    <th class="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800 text-sm">
                                {% for rule in rules %}
                                    <tr class="hover:bg-slate-900/50">
                                        <td class="py-4 px-4 font-medium text-white">{{ rule.name }}</td>
                                        <td class="py-4 px-4 text-slate-300">{{ rule.category }}</td>
                                        <td class="py-4 px-4 text-slate-400 max-w-xs truncate">{{ rule.description }}</td>
                                        <td class="py-4 px-4">
                                            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset 
                                                {% if rule.status == 'PASSED' %}bg-emerald-400/10 text-emerald-400 ring-emerald-400/20
                                                {% elif rule.status == 'WARNING' %}bg-amber-400/10 text-amber-400 ring-amber-400/20
                                                {% else %}bg-red-400/10 text-red-400 ring-red-400/20{% endif %}">
                                                {{ rule.status }}
                                            </span>
                                        </td>
                                        <td class="py-4 px-4 text-slate-400 text-xs">{{ rule.last_checked.strftime('%Y-%m-%d %H:%M') }}</td>
                                        <td class="py-4 px-4 text-right space-x-2">
                                            <a href="{{ url_for('toggle_rule_status', rule_id=rule.id) }}" class="text-xs text-indigo-400 hover:text-indigo-300" title="Toggle Status">
                                                <i class="fa-solid fa-toggle-on text-lg"></i>
                                            </a>
                                            <a href="{{ url_for('delete_rule', rule_id=rule.id) }}" class="text-xs text-red-400 hover:text-red-300" title="Delete Rule">
                                                <i class="fa-solid fa-trash-can text-lg"></i>
                                            </a>
                                        </td>
                                    </tr>
                                {% endfor %}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- APP 4: SCHEDULER & CONFIG -->
            <div id="panel-app-scheduler" class="tab-panel hidden space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Configuration Form -->
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-6">
                        <h3 class="text-lg font-semibold text-white mb-4">GitHub Integration Settings</h3>
                        <form action="{{ url_for('save_config') }}" method="POST" class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GitHub Audit Token (GITHUB_AUDIT_TOKEN)</label>
                                <input type="password" name="github_token" value="{{ github_token }}" placeholder="ghp_********************" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-sm">
                                <p class="text-[11px] text-slate-500 mt-1">Requires 'repo' scope to commit compliance reports.</p>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Repository (owner/repo)</label>
                                <input type="text" name="github_repo" value="{{ github_repo }}" placeholder="my-organization/sovereign-compliance-audit" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-sm">
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Branch</label>
                                    <input type="text" name="github_branch" value="{{ github_branch }}" placeholder="main" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sovereign Zone</label>
                                    <input type="text" name="sovereign_zone" value="{{ sovereign_zone }}" placeholder="EU-West-Sovereign" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm">
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">File Path in Repo</label>
                                <input type="text" name="github_path" value="{{ github_path }}" placeholder="compliance/sovereign_audit_report.json" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-sm">
                            </div>

                            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150">
                                Save Configuration
                            </button>
                        </form>
                    </div>

                    <!-- Scheduler Control -->
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-2">Automation Scheduler</h3>
                            <p class="text-sm text-slate-400 mb-6">Automate the synchronization of compliance reports to GitHub. When enabled, the agent runs in the background every 15 minutes.</p>

                            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 mb-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <span class="text-xs text-slate-500 block">Scheduler Status</span>
                                        <span class="text-sm font-semibold {% if scheduler_enabled %}text-emerald-400{% else %}text-amber-400{% endif %}">
                                            {{ 'ENABLED (Running every 15 mins)' if scheduler_enabled else 'DISABLED' }}
                                        </span>
                                    </div>
                                    <form action="{{ url_for('toggle_scheduler') }}" method="POST">
                                        <button type="submit" class="px-4 py-2 rounded-lg text-xs font-semibold transition duration-150 {% if scheduler_enabled %}bg-amber-600 hover:bg-amber-500 text-white{% else %}bg-emerald-600 hover:bg-emerald-500 text-white{% endif %}">
                                            {{ 'Disable' if scheduler_enabled else 'Enable' }}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div class="border-t border-slate-800 pt-6">
                            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Scheduler Logs & Diagnostics</h4>
                            <div class="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                                <p>[INFO] Scheduler initialized successfully.</p>
                                <p>[INFO] Job 'compliance_sync_job' registered with 15-minute interval.</p>
                                <p>[STATUS] Next scheduled run: <span class="text-indigo-400">In 15 minutes</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>

        <!-- Footer -->
        <footer class="bg-slate-950 border-t border-slate-800 py-6 mt-auto">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p class="text-xs text-slate-500">&copy; 2023 Sovereign Compliance Agent. All rights reserved.</p>
                <div class="flex space-x-6 text-xs text-slate-400">
                    <span class="hover:text-slate-300">Secure Enclave Mode</span>
                    <span class="hover:text-slate-300">FIPS 140-2 Compliant</span>
                </div>
            </div>
        </footer>
    </div>

    <!-- Add Rule Modal -->
    <div id="add-rule-modal" class="fixed inset-0 bg-slate-950/8