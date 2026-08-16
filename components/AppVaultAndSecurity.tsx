import React, { useState, useEffect } from 'react';

// Types and Interfaces
export interface AppSecret {
  id: string;
  name: string;
  category: 'API_KEY' | 'OAUTH_CLIENT' | 'PRIVATE_KEY' | 'DB_CREDENTIAL' | 'WEBHOOK_SECRET' | 'PQC_SEED';
  environment: 'PRODUCTION' | 'STAGING' | 'SANDBOX' | 'GOV_CLOUD';
  value: string;
  accessLevel: 'ADMIN_ONLY' | 'SERVICE_PRINCIPAL' | 'READ_WRITE' | 'RESTRICTED';
  lastRotated: string;
  expiresInDays: number;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'REVOKED' | 'ROTATION_REQUIRED';
  associatedService: string;
}

export interface SecurityAuditCheck {
  id: string;
  framework: 'SOC2_TYPE2' | 'FEDRAMP_HIGH' | 'PCI_DSS_v4' | 'FAPI_2_0' | 'ISO_27001' | 'UCC_COMPLIANT';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'IN_PROGRESS';
  category: 'CRYPTOGRAPHY' | 'IAM_ACCESS' | 'NETWORK_ISOLATION' | 'SECRET_LEAKAGE' | 'AUDIT_TRAIL';
  lastChecked: string;
  remediationAction?: string;
}

export interface SecretAccessLog {
  id: string;
  timestamp: string;
  actor: string;
  action: 'READ' | 'ROTATE' | 'CREATE' | 'REVOKE' | 'AUDIT_TRIGGERED';
  targetSecret: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
}

export interface HSMEngineStatus {
  hsmProvider: 'Azure Dedicated HSM' | 'HashiCorp Vault Enterprise' | 'GCP Cloud KMS' | 'Quantum Secure Element';
  status: 'HEALTHY' | 'DEGRADED' | 'KEY_ROTATION_IN_PROGRESS';
  activeKeysCount: number;
  quantumResistantEngine: boolean;
  masterEntropyScore: number; // 0 - 100
  lastMasterBackup: string;
  fips140Level: 'FIPS 140-2 Level 3' | 'FIPS 140-3 Level 4';
}

// Inline Icon Components
const LockIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ShieldAlertIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const KeyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
  </svg>
);

const RefreshCwIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.959 8.959 0 013.122-.563c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-3.125-3.125a3 3 0 01-4.243-4.243m4.243 4.243L3 3l18 18" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Trash2Icon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ActivityIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CpuIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ZapIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Initial Mock Data
const INITIAL_SECRETS: AppSecret[] = [
  {
    id: 'sec-001',
    name: 'CITI_CONNECT_OAUTH_PRIVATE_KEY',
    category: 'PRIVATE_KEY',
    environment: 'PRODUCTION',
    value: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6Y...\n-----END PRIVATE KEY-----',
    accessLevel: 'ADMIN_ONLY',
    lastRotated: '2025-02-10 14:22:10 UTC',
    expiresInDays: 14,
    status: 'EXPIRING_SOON',
    associatedService: 'CitiConnect Integration Gateway'
  },
  {
    id: 'sec-002',
    name: 'AZURE_GOV_FEDRAMP_SERVICE_PRINCIPAL',
    category: 'OAUTH_CLIENT',
    environment: 'GOV_CLOUD',
    value: 'sec_client_secret_994a38bf000f2e8d1a37c44',
    accessLevel: 'SERVICE_PRINCIPAL',
    lastRotated: '2025-01-15 08:00:00 UTC',
    expiresInDays: 78,
    status: 'ACTIVE',
    associatedService: 'FedRAMP Compliance Monitor'
  },
  {
    id: 'sec-003',
    name: 'ALPACA_BROKERAGE_TRADING_API_KEY',
    category: 'API_KEY',
    environment: 'PRODUCTION',
    value: 'AK_LIVE_9823419082349012384',
    accessLevel: 'RESTRICTED',
    lastRotated: '2025-02-20 11:30:45 UTC',
    expiresInDays: 165,
    status: 'ACTIVE',
    associatedService: 'Alpaca Broker Integration'
  },
  {
    id: 'sec-004',
    name: 'PQC_DILITHIUM3_MASTER_SEED',
    category: 'PQC_SEED',
    environment: 'PRODUCTION',
    value: 'pqc_seed_dilithium3_v2_91823091823098123091823',
    accessLevel: 'ADMIN_ONLY',
    lastRotated: '2024-11-01 00:00:00 UTC',
    expiresInDays: 0,
    status: 'ROTATION_REQUIRED',
    associatedService: 'PQC Crypto Bridge Simulator'
  },
  {
    id: 'sec-005',
    name: 'SOVEREIGN_ID_DATABASE_DATABASE_URL',
    category: 'DB_CREDENTIAL',
    environment: 'STAGING',
    value: 'postgresql://db_admin:P%40ssw0rd2025@pg-vault-primary.internal:5432/sovereign_identity',
    accessLevel: 'READ_WRITE',
    lastRotated: '2025-02-01 18:45:12 UTC',
    expiresInDays: 45,
    status: 'ACTIVE',
    associatedService: 'Sovereign ID Cryptography'
  },
  {
    id: 'sec-006',
    name: 'STRIPE_WEBHOOK_SIGNING_SECRET',
    category: 'WEBHOOK_SECRET',
    environment: 'SANDBOX',
    value: 'whsec_a87f12938b01293c8d712390a',
    accessLevel: 'RESTRICTED',
    lastRotated: '2025-02-18 09:12:00 UTC',
    expiresInDays: 120,
    status: 'ACTIVE',
    associatedService: 'Billing & Subscriptions'
  }
];

const INITIAL_AUDITS: SecurityAuditCheck[] = [
  {
    id: 'chk-101',
    framework: 'FAPI_2_0',
    title: 'mTLS Client Certificate Conformance',
    description: 'Verifies all Open Banking endpoints require strictly bound x590 mutual TLS client certificates.',
    severity: 'CRITICAL',
    status: 'PASSED',
    category: 'CRYPTOGRAPHY',
    lastChecked: '5 mins ago'
  },
  {
    id: 'chk-102',
    framework: 'FEDRAMP_HIGH',
    title: 'Secret Storage Rotation Policy (< 90 Days)',
    description: 'Ensures no master secret or service principal key remains un-rotated beyond 90 days.',
    severity: 'HIGH',
    status: 'WARNING',
    category: 'SECRET_LEAKAGE',
    lastChecked: '12 mins ago',
    remediationAction: 'Trigger automated key rotation for PQC_DILITHIUM3_MASTER_SEED'
  },
  {
    id: 'chk-103',
    framework: 'SOC2_TYPE2',
    title: 'Database Password Hardcoding Inspection',
    description: 'Scans source repositories and runtime environment variables for plain text database credentials.',
    severity: 'HIGH',
    status: 'FAILED',
    category: 'SECRET_LEAKAGE',
    lastChecked: '2 mins ago',
    remediationAction: 'Migrate staging Postgres connection URI to Azure Key Vault reference'
  },
  {
    id: 'chk-104',
    framework: 'PCI_DSS_v4',
    title: 'Hardware Secure Module (HSM) FIPS-140-3 Validation',
    description: 'Checks cryptographic boundary controls and key isolation inside physical enclave.',
    severity: 'CRITICAL',
    status: 'PASSED',
    category: 'CRYPTOGRAPHY',
    lastChecked: '1 hour ago'
  },
  {
    id: 'chk-105',
    framework: 'UCC_COMPLIANT',
    title: 'Immutable Audit Log Tamper Verification',
    description: 'Calculates cryptographic merkle chain hash across all historical access logs.',
    severity: 'MEDIUM',
    status: 'PASSED',
    category: 'AUDIT_TRAIL',
    lastChecked: '15 mins ago'
  },
  {
    id: 'chk-106',
    framework: 'ISO_27001',
    title: 'Zero-Trust Role Principle Access Delegation',
    description: 'Validates that service accounts have narrow scope and expiration limits.',
    severity: 'MEDIUM',
    status: 'PASSED',
    category: 'IAM_ACCESS',
    lastChecked: '30 mins ago'
  }
];

const INITIAL_LOGS: SecretAccessLog[] = [
  {
    id: 'log-801',
    timestamp: '2025-02-23 09:41:02 UTC',
    actor: 'automated-compliance-bot@internal',
    action: 'AUDIT_TRIGGERED',
    targetSecret: 'SYSTEM_WIDE_AUDIT',
    ipAddress: '10.240.0.14',
    userAgent: 'FedRAMP-AuditRunner/3.2',
    status: 'SUCCESS'
  },
  {
    id: 'log-802',
    timestamp: '2025-02-23 09:35:18 UTC',
    actor: 'sec-admin-sarah@citi.gov.cloud',
    action: 'READ',
    targetSecret: 'CITI_CONNECT_OAUTH_PRIVATE_KEY',
    ipAddress: '198.51.100.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'SUCCESS'
  },
  {
    id: 'log-803',
    timestamp: '2025-02-23 08:12:00 UTC',
    actor: 'service-principal-alpaca-executor',
    action: 'READ',
    targetSecret: 'ALPACA_BROKERAGE_TRADING_API_KEY',
    ipAddress: '10.240.4.88',
    userAgent: 'Alpaca-WorkerDaemon/1.0',
    status: 'SUCCESS'
  },
  {
    id: 'log-804',
    timestamp: '2025-02-23 06:01:23 UTC',
    actor: 'unknown-external-client',
    action: 'READ',
    targetSecret: 'PQC_DILITHIUM3_MASTER_SEED',
    ipAddress: '185.220.101.5',
    userAgent: 'python-requests/2.28.1',
    status: 'DENIED'
  }
];

const INITIAL_HSM: HSMEngineStatus = {
  hsmProvider: 'Quantum Secure Element',
  status: 'HEALTHY',
  activeKeysCount: 142,
  quantumResistantEngine: true,
  masterEntropyScore: 99.8,
  lastMasterBackup: '2025-02-22 23:59:59 UTC',
  fips140Level: 'FIPS 140-3 Level 4'
};

export const AppVaultAndSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vault' | 'audit' | 'logs' | 'hsm'>('vault');
  const [secrets, setSecrets] = useState<AppSecret[]>(INITIAL_SECRETS);
  const [audits, setAudits] = useState<SecurityAuditCheck[]>(INITIAL_AUDITS);
  const [logs, setLogs] = useState<SecretAccessLog[]>(INITIAL_LOGS);
  const [hsmStatus, setHsmStatus] = useState<HSMEngineStatus>(INITIAL_HSM);

  // Visibility state for secrets
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  
  // Filter and search
  const [searchTerm, setSearchTerm] = useState('');
  const [envFilter, setEnvFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for adding new secret
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSecretForm, setNewSecretForm] = useState<{
    name: string;
    category: AppSecret['category'];
    environment: AppSecret['environment'];
    value: string;
    accessLevel: AppSecret['accessLevel'];
    associatedService: string;
  }>({
    name: '',
    category: 'API_KEY',
    environment: 'PRODUCTION',
    value: '',
    accessLevel: 'RESTRICTED',
    associatedService: ''
  });

  // Toggle secret visibility
  const toggleVisibility = (id: string, name: string) => {
    setVisibleSecrets((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        // Log the read action
        const newLog: SecretAccessLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          actor: 'current-user-session',
          action: 'READ',
          targetSecret: name,
          ipAddress: '127.0.0.1 (Session)',
          userAgent: navigator.userAgent,
          status: 'SUCCESS'
        };
        setLogs((prevLogs) => [newLog, ...prevLogs]);
      }
      return { ...prev, [id]: nextState };
    });
  };

  // Copy value to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Rotate Secret
  const rotateSecret = (id: string) => {
    setSecrets((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newVal = `rot_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
          return {
            ...s,
            value: newVal,
            lastRotated: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            expiresInDays: 90,
            status: 'ACTIVE'
          };
        }
        return s;
      })
    );

    const secretObj = secrets.find((s) => s.id === id);
    if (secretObj) {
      const newLog: SecretAccessLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        actor: 'security-admin-action',
        action: 'ROTATE',
        targetSecret: secretObj.name,
        ipAddress: '127.0.0.1',
        userAgent: 'VaultControlPanel/2.0',
        status: 'SUCCESS'
      };
      setLogs((prevLogs) => [newLog, ...prevLogs]);
    }
  };

  // Revoke Secret
  const revokeSecret = (id: string) => {
    setSecrets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'REVOKED' } : s))
    );
  };

  // Trigger Full Security Scan
  const runSecurityScan = () => {
    setIsScanning(true);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          // Mark all audits as freshly verified
          setAudits((prevAudits) =>
            prevAudits.map((a) => ({
              ...a,
              lastChecked: 'Just now'
            }))
          );
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Add new secret handler
  const handleAddSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretForm.name || !newSecretForm.value) return;

    const created: AppSecret = {
      id: `sec-${Date.now().toString().slice(-4)}`,
      name: newSecretForm.name.toUpperCase().replace(/\s+/g, '_'),
      category: newSecretForm.category,
      environment: newSecretForm.environment,
      value: newSecretForm.value,
      accessLevel: newSecretForm.accessLevel,
      lastRotated: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      expiresInDays: 90,
      status: 'ACTIVE',
      associatedService: newSecretForm.associatedService || 'Custom Application Module'
    };

    setSecrets([created, ...secrets]);
    setShowAddModal(false);
    setNewSecretForm({
      name: '',
      category: 'API_KEY',
      environment: 'PRODUCTION',
      value: '',
      accessLevel: 'RESTRICTED',
      associatedService: ''
    });

    const newLog: SecretAccessLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'security-admin-action',
      action: 'CREATE',
      targetSecret: created.name,
      ipAddress: '127.0.0.1',
      userAgent: 'VaultControlPanel/2.0',
      status: 'SUCCESS'
    };
    setLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  // Filtered Secrets List
  const filteredSecrets = secrets.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.associatedService.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnv = envFilter === 'ALL' || s.environment === envFilter;
    const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesSearch && matchesEnv && matchesCat;
  });

  // Calculate Metrics
  const totalSecrets = secrets.length;
  const expiringSecrets = secrets.filter((s) => s.status === 'EXPIRING_SOON' || s.status === 'ROTATION_REQUIRED').length;
  const criticalAuditFailures = audits.filter((a) => a.status === 'FAILED' && a.severity === 'CRITICAL').length;
  const complianceScore = Math.round(
    (audits.filter((a) => a.status === 'PASSED').length / (audits.length || 1)) * 100
  );

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <LockIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                App Vault & Automated Security Compliance
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  FIPS 140-3
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Quantum-resistant secret management, automated policy audits, and cryptographically verified access logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={runSecurityScan}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            <RefreshCwIcon className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? `Scanning (${scanProgress}%)` : 'Run Compliance Audit'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-950/40"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Store New Secret</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Vault Secrets</span>
            <KeyIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{totalSecrets}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Encrypted</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Compliance</span>
            <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{complianceScore}%</span>
            <span className="text-xs text-slate-400">{audits.filter(a => a.status === 'PASSED').length}/{audits.length} Checks</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${complianceScore}%` }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Secrets Needing Rotation</span>
            <ShieldAlertIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{expiringSecrets}</span>
            {expiringSecrets > 0 ? (
              <span className="text-xs text-amber-400 font-medium">Action Required</span>
            ) : (
              <span className="text-xs text-emerald-400 font-medium">All Fresh</span>
            )}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(expiringSecrets / (totalSecrets || 1)) * 100}%` }} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">HSM Health & PQC</span>
            <CpuIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{hsmStatus.masterEntropyScore}%</span>
            <span className="text-xs text-cyan-400 font-medium">{hsmStatus.fips140Level}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${hsmStatus.masterEntropyScore}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-1 border-b border-slate-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'vault'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <LockIcon className="w-4 h-4" />
          <span>Secret Vault ({secrets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'audit'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Compliance Audits ({audits.length})</span>
          {criticalAuditFailures > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-bold bg-rose-950 text-rose-400 rounded-full border border-rose-800">
              {criticalAuditFailures}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <ActivityIcon className="w-4 h-4" />
          <span>Access Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('hsm')}
          className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'hsm'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <CpuIcon className="w-4 h-4" />
          <span>HSM & Crypto Engine</span>
        </button>
      </div>

      {/* TAB 1: SECRET VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          {/* Controls / Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search secrets by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={envFilter}
                onChange={(e) => setEnvFilter(e.target.value)}
                className="bg-slate-950 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Environments</option>
                <option value="PRODUCTION">Production</option>
                <option value="GOV_CLOUD">Gov Cloud</option>
                <option value="STAGING">Staging</option>
                <option value="SANDBOX">Sandbox</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="API_KEY">API Keys</option>
                <option value="OAUTH_CLIENT">OAuth Clients</option>
                <option value="PRIVATE_KEY">Private Keys</option>
                <option value="DB_CREDENTIAL">Database Credentials</option>
                <option value="WEBHOOK_SECRET">Webhook Secrets</option>
                <option value="PQC_SEED">PQC Seeds</option>
              </select>
            </div>
          </div>

          {/* Secrets List */}
          <div className="grid grid-cols-1 gap-3">
            {filteredSecrets.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                <LockIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 font-medium">No app secrets match the selected filters.</p>
              </div>
            ) : (
              filteredSecrets.map((secret) => {
                const isVisible = !!visibleSecrets[secret.id];

                return (
                  <div
                    key={secret.id}
                    className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 transition-all hover:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-indigo-300">
                          {secret.name}
                        </span>

                        {/* Environment Tag */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            secret.environment === 'PRODUCTION'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                              : secret.environment === 'GOV_CLOUD'
                              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                              : secret.environment === 'STAGING'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {secret.environment}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            secret.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : secret.status === 'EXPIRING_SOON'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : secret.status === 'ROTATION_REQUIRED'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {secret.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>Service: <strong className="text-slate-300">{secret.associatedService}</strong></span>
                        <span>Access: <strong className="text-slate-300">{secret.accessLevel}</strong></span>
                        <span>Rotated: <strong className="text-slate-300">{secret.lastRotated}</strong></span>
                      </div>

                      {/* Value Display Box */}
                      <div className="mt-2 flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-xs">
                        <span className="flex-1 overflow-x-auto text-slate-300 whitespace-nowrap scrollbar-none">
                          {isVisible ? secret.value : '••••••••••••••••••••••••••••••••••••••••••••••••'}
                        </span>

                        <button
                          onClick={() => toggleVisibility(secret.id, secret.name)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title={isVisible ? 'Hide Secret' : 'Reveal Secret'}
                        >
                          {isVisible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => copyToClipboard(secret.value, secret.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 relative"
                          title="Copy to Clipboard"
                        >
                          {copiedId === secret.id ? (
                            <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <CopyIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 lg:flex-col lg:items-end justify-end border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                      <button
                        onClick={() => rotateSecret(secret.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-medium transition-colors"
                      >
                        <RefreshCwIcon className="w-3.5 h-3.5" />
                        <span>Rotate Key</span>
                      </button>

                      <button
                        onClick={() => revokeSecret(secret.id)}
                        disabled={secret.status === 'REVOKED'}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded bg-rose-950/50 hover:bg-rose-900/80 border border-rose-900 text-rose-300 text-xs font-medium transition-colors disabled:opacity-40"
                      >
                        <Trash2Icon className="w-3.5 h-3.5" />
                        <span>Revoke Access</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPLIANCE AUDITS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Automated Policy Guardrails
                <span className="text-xs font-normal text-slate-400">
                  (FedRAMP, FAPI 2.0, SOC2, PCI-DSS v4)
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Continuous compliance checks running against infrastructure, API specs, and crypto configurations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded border border-emerald-800">
                Rule Engine: Active (v4.1)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {audits.map((chk) => (
              <div
                key={chk.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                        chk.status === 'PASSED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : chk.status === 'WARNING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                      }`}
                    >
                      {chk.status}
                    </span>

                    <span className="text-xs font-bold font-mono text-slate-300">
                      [{chk.framework}]
                    </span>

                    <h4 className="text-sm font-semibold text-white">{chk.title}</h4>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        chk.severity === 'CRITICAL'
                          ? 'bg-rose-900/40 text-rose-300 border border-rose-800'
                          : chk.severity === 'HIGH'
                          ? 'bg-amber-900/40 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {chk.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{chk.description}</p>

                  {chk.remediationAction && (
                    <div className="mt-2 text-xs bg-slate-950 p-2 rounded border border-slate-800 text-amber-300 flex items-center gap-2">
                      <ZapIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span><strong>Auto Fix Suggestion:</strong> {chk.remediationAction}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 justify-end text-xs text-slate-500 whitespace-nowrap">
                  <span>Last check: {chk.lastChecked}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACCESS LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Immutable Audit Ledger (SHA-256 Merkle Secured)
            </span>
            <button
              onClick={() => alert('Exporting encrypted CSV log file...')}
              className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span>Export Audit Trail</span>
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor / Principal</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Secret</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400">{log.timestamp}</td>
                      <td className="p-3 font-semibold text-slate-200">{log.actor}</td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            log.action === 'READ'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : log.action === 'ROTATE'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : log.action === 'CREATE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-indigo-300">{log.targetSecret}</td>
                      <td className="p-3 text-slate-400">{log.ipAddress}</td>
                      <td className="p-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'text-emerald-400 bg-emerald-950/60'
                              : 'text-rose-400 bg-rose-950/60'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HSM & CRYPTO ENGINE */}
      {activeTab === 'hsm' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <CpuIcon className="w-5 h-5 text-indigo-400" />
              Hardware Secure Module (HSM) Status
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Dedicated isolated cryptographic execution boundary compliant with FIPS 140-3 Level 4 specs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold">HSM Enclave Engine</span>
                <p className="text-lg font-bold text-indigo-300 mt-1">{hsmStatus.hsmProvider}</p>
                <p className="text-xs text-emerald-400 mt-1">Status: {hsmStatus.status}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold">Active Managed Keys</span>
                <p className="text-lg font-bold text-white mt-1">{hsmStatus.activeKeysCount} Active Keys</p>
                <p className="text-xs text-slate-400 mt-1">Automatic Cloud Key Vault Sync</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold">Post-Quantum Cryptography</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  {hsmStatus.quantumResistantEngine ? 'DILITHIUM-3 Active' : 'Standard RSA/ECC'}
                </p>
                <p className="text-xs text-slate-400 mt-1">NIST Post-Quantum Standardized</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                <span>Master Backup Verification: </span>
                <strong className="text-slate-200">{hsmStatus.lastMasterBackup}</strong>
              </div>

              <button
                onClick={() => alert('Initiating HSM Zeroization test sequence in sandbox...')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                Trigger Key Enclave Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW SECRET */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-indigo-400" />
              Store New App Secret
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Secrets are client-side encrypted before submission to the HSM vault.
            </p>

            <form onSubmit={handleAddSecretSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Secret Key Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. CITI_OAUTH_CLIENT_SECRET"
                  value={newSecretForm.name}
                  onChange={(e) => setNewSecretForm({ ...newSecretForm, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newSecretForm.category}
                    onChange={(e) => setNewSecretForm({ ...newSecretForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="API_KEY">API Key</option>
                    <option value="OAUTH_CLIENT">OAuth Client Secret</option>
                    <option value="PRIVATE_KEY">Private Key</option>
                    <option value="DB_CREDENTIAL">Database Credential</option>
                    <option value="WEBHOOK_SECRET">Webhook Secret</option>
                    <option value="PQC_SEED">PQC Seed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Environment</label>
                  <select
                    value={newSecretForm.environment}
                    onChange={(e) => setNewSecretForm({ ...newSecretForm, environment: e.target.value as any })}
                    className="w-full bg-slate-950 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PRODUCTION">Production</option>
                    <option value="GOV_CLOUD">Gov Cloud</option>
                    <option value="STAGING">Staging</option>
                    <option value="SANDBOX">Sandbox</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Associated App / Module</label>
                <input
                  type="text"
                  placeholder="e.g. CitiConnect Integration Gateway"
                  value={newSecretForm.associatedService}
                  onChange={(e) => setNewSecretForm({ ...newSecretForm, associatedService: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-sm px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Secret Value</label>
                <textarea
                  rows={3}
                  placeholder="Paste confidential secret value here..."
                  value={newSecretForm.value}
                  onChange={(e) => setNewSecretForm({ ...newSecretForm, value: e.target.value })}
                  required
                  className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-md"
                >
                  Save Secret
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppVaultAndSecurity;