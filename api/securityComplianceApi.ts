export interfaceimport {

export interfaceimport {

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | nullimport { z } from 'zod';

export type SecuritySeverity = 'info' | '

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | nullimport { z } from 'zod';

export type SecuritySeverity = 'info' | '

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | '

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | '

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsentsimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsentsimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  constimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  constimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useStateimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  |

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useStateimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  |

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  constimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  |

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async ()import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  |

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async ()import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  |

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  |

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ?import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ?import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assigned

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assigned

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assigned

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async ()import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async ()import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data =import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      constimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  active

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      constimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  active

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      Securityimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;


export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      Securityimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;


export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;


export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: stringimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: stringimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === idimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Errorimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriod

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Errorimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriod

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriod

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSONimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSONimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  },import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsentimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsentimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consentsimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  last

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consentsimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  last

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() =>import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  last

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  },import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  },import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', borderimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', borderimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizingimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' }import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' }import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'securityimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('himport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('himport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('himport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logsimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logsimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,


export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,


export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-G

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-G

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section',import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overall

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section',import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overall

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consentimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consentimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status:

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pending

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pending

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  Securityimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {


export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  Securityimport { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {


export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceState

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceStateStore();
    }
    return SecurityComplianceStateStore.instance;
  }

  public getConfig(): Security

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceStateStore();
    }
    return SecurityComplianceStateStore.instance;
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceStateStore();
    }
    return SecurityComplianceStateStore.instance;
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public get

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceStateStore();
    }
    return SecurityComplianceStateStore.instance;
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getLogsMap(): Map<string, SecurityLog> {
    return this.securityLogs;
  }

  public get

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceStateStore();
    }
    return SecurityComplianceStateStore.instance;
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getLogsMap(): Map<string, SecurityLog> {
    return this.securityLogs;
  }

  public getConsentMap(): Map<string, ConsentRecord> {
    return this.consentRecords;
  }

  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceStateStore();
    }
    return SecurityComplianceStateStore.instance;
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getLogsMap(): Map<string, SecurityLog> {
    return this.securityLogs;
  }

  public getConsentMap(): Map<string, ConsentRecord> {
    return this.consentRecords;
  }

  public getComplianceCache(): ComplianceStatus {
    return { ...this.complianceStatusCache };
  }

  public set

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceStateStore();
    }
    return SecurityComplianceStateStore.instance;
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getLogsMap(): Map<string, SecurityLog> {
    return this.securityLogs;
  }

  public getConsentMap(): Map<string, ConsentRecord> {
    return this.consentRecords;
  }

  public getComplianceCache(): ComplianceStatus {
    return { ...this.complianceStatusCache };
  }

  public setComplianceCache(status: ComplianceStatus): void {
    this.complianceStatusCache = { ...status };
  

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceStateStore();
    }
    return SecurityComplianceStateStore.instance;
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getLogsMap(): Map<string, SecurityLog> {
    return this.securityLogs;
  }

  public getConsentMap(): Map<string, ConsentRecord> {
    return this.consentRecords;
  }

  public getComplianceCache(): ComplianceStatus {
    return { ...this.complianceStatusCache };
  }

  public setComplianceCache(status: ComplianceStatus): void {
    this.complianceStatusCache = { ...status };
  }

  public resetStore(): void {
    this.securityLogs.clear();
    this.consentRecords

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};import { z } from 'zod';

export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';
export type ComplianceState = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Under-Review' | 'Remediation-Required';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending-verification';
export type SecurityEventType = 
  | 'AUTH_FAILURE' 
  | 'UNAUTHORIZED_ACCESS' 
  | 'PRIVILEGE_ESCALATION' 
  | 'DATA_EXFILTRATION_ATTEMPT' 
  | 'ENCRYPTION_KEY_ROTATION' 
  | 'POLICY_VIOLATION' 
  | 'GDPR_DATA_REQUEST' 
  | 'HIPAA_AUDIT_TRIGGER';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: SecurityEventType | string;
  severity: SecuritySeverity;
  sourceIp?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  checksum: string;
}

export interface ComplianceControl {
  controlId: string;
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  name: string;
  status: ComplianceState;
  lastEvaluated: string;
  assignedAuditor?: string;
  remediationSteps?: string[];
}

export interface ComplianceStatus {
  overallStatus: ComplianceState;
  score: number; // 0 to 100
  lastAuditTimestamp: string;
  activeFrameworks: ComplianceControl[];
  pendingActionsCount: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  status: ConsentStatus;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface SecurityComplianceQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity;
  status?: ComplianceState;
  userId?: string;
}

export interface SecurityConfig {
  enableAuditLogging: boolean;
  retentionPeriodDays: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  strictMode: boolean;
  alertWebhookUrl?: string;
}

export const SecurityLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  event: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical', 'emergency']),
  sourceIp: z.string().ip().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  checksum: z.string().min(1),
});

export const ComplianceControlSchema = z.object({
  controlId: z.string().min(1),
  framework: z.enum(['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS']),
  name: z.string().min(1),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  lastEvaluated: z.string().datetime(),
  assignedAuditor: z.string().optional(),
  remediationSteps: z.array(z.string()).optional(),
});

export const ComplianceStatusSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending', 'Under-Review', 'Remediation-Required']),
  score: z.number().min(0).max(100),
  lastAuditTimestamp: z.string().datetime(),
  activeFrameworks: z.array(ComplianceControlSchema),
  pendingActionsCount: z.number().int().nonnegative(),
});

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  consentType: z.string().min(1),
  status: z.enum(['granted', 'revoked', 'expired', 'pending-verification']),
  version: z.string().min(1),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const RevokeConsentRequestSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(3, 'Revocation reason must be at least 3 characters long'),
  revokedBy: z.string().min(1),
});

export class SecurityComplianceStateStore {
  private static instance: SecurityComplianceStateStore;
  private securityLogs: Map<string, SecurityLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private complianceStatusCache: ComplianceStatus;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableAuditLogging: true,
      retentionPeriodDays: 365,
      encryptionAlgorithm: 'AES-256-GCM',
      strictMode: true,
    };

    this.complianceStatusCache = {
      overallStatus: 'Compliant',
      score: 98.5,
      lastAuditTimestamp: new Date().toISOString(),
      activeFrameworks: [
        {
          controlId: 'SOC2-CC6.1',
          framework: 'SOC2',
          name: 'Logical Access Controls',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        },
        {
          controlId: 'GDPR-ART32',
          framework: 'GDPR',
          name: 'Security of Processing',
          status: 'Compliant',
          lastEvaluated: new Date().toISOString(),
        }
      ],
      pendingActionsCount: 0,
    };
  }

  public static getInstance(): SecurityComplianceStateStore {
    if (!SecurityComplianceStateStore.instance) {
      SecurityComplianceStateStore.instance = new SecurityComplianceStateStore();
    }
    return SecurityComplianceStateStore.instance;
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getLogsMap(): Map<string, SecurityLog> {
    return this.securityLogs;
  }

  public getConsentMap(): Map<string, ConsentRecord> {
    return this.consentRecords;
  }

  public getComplianceCache(): ComplianceStatus {
    return { ...this.complianceStatusCache };
  }

  public setComplianceCache(status: ComplianceStatus): void {
    this.complianceStatusCache = { ...status };
  }

  public resetStore(): void {
    this.securityLogs.clear();
    this.consentRecords.clear();
  }
}

export const globalStateStore = SecurityComplianceStateStore.getInstance();

export interface SecurityComplianceHookResult {
  logs: SecurityLog[];
  compliance: ComplianceStatus | null;
  consents: ConsentRecord[];
  loading: boolean;
  error: Error | null;
  fetchLogs: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchConsents: () => Promise<void>;
  revokeConsent: (id: string) => Promise<boolean>;
  exportAuditReport: () => Promise<Blob>;
}

export const useSecurityCompliance = (): SecurityComplianceHookResult => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchLogs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchCompliance', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConsentRecords();
      setConsents(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.fetchConsents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await revokeConsentRecord(id);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked', updatedAt: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.revokeConsent', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportAuditReport = useCallback(async (): Promise<Blob> => {
    try {
      const payload = JSON.stringify({ logs, compliance, consents, exportedAt: new Date().toISOString() }, null, 2);
      return new Blob([payload], { type: 'application/json' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      SecurityComplianceTelemetry.trackError('useSecurityCompliance.exportAuditReport', e);
      throw e;
    }
  }, [logs, compliance, consents]);

  return {
    logs,
    compliance,
    consents,
    loading,
    error,
    fetchLogs,
    fetchCompliance,
    fetchConsents,
    revokeConsent,
    exportAuditReport
  };
};

export interface SecurityComplianceWidgetProps {
  className?: string;
  onAlertTriggered?: (log: SecurityLog) => void;
}

export const SecurityComplianceWidget: React.FC<SecurityComplianceWidgetProps> = ({ className, onAlertTriggered }) => {
  const { logs, compliance, consents, loading, error, fetchLogs, fetchCompliance, fetchConsents, revokeConsent } = useSecurityCompliance();

  useEffect(() => {
    fetchLogs();
    fetchCompliance();
    fetchConsents();
  }, [fetchLogs, fetchCompliance, fetchConsents]);

  useEffect(() => {
    logs.forEach(log => {
      if (log.severity === 'error' && onAlertTriggered) {
        onAlertTriggered(log);
      }
    });
  }, [logs, onAlertTriggered]);

  return React.createElement(
    'div',
    { className: `security-compliance-widget ${className || ''}`, style: { padding: '16px', border: '1px solid #ccc', borderRadius: '8px' } },
    React.createElement('h3', null, 'Security & Compliance Dashboard'),
    loading && React.createElement('p', null, 'Synchronizing security layers...'),
    error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error.message}`),
    compliance && React.createElement(
      'div',
      { className: 'compliance-badge' },
      React.createElement('strong', null, 'Status: '),
      React.createElement('span', { style: { color: compliance.status === 'Compliant' ? 'green' : 'orange' } }, compliance.status)
    ),
    React.createElement(
      'div',
      { className: 'security-logs-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'Active Security Logs'),
      React.createElement(
        'ul',
        null,
        logs.map(log => React.createElement(
          'li',
          { key: log.id },
          `[${log.severity.toUpperCase()}] ${log.timestamp}: ${log.event}`
        ))
      )
    ),
    React.createElement(
      'div',
      { className: 'consent-records-section', style: { marginTop: '12px' } },
      React.createElement('h4', null, 'User Consent Management'),
      React.createElement(
        'ul',
        null,
        consents.map(consent => React.createElement(
          'li',
          { key: consent.id },
          `${consent.userId} - ${consent.consentType}: ${consent.status} `,
          consent.status === 'granted' && React.createElement(
            'button',
            { onClick: () => revokeConsent(consent.id) },
            'Revoke'
          )
        ))
      )
    )
  );
};

export default {
  getSecurityLogs,
  getComplianceStatus,
  getConsentRecords,
  revokeConsentRecord,
  useSecurityCompliance,
  SecurityComplianceWidget
};