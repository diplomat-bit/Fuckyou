export type Severity = 'critical' | 'warning' | 'info' | 'success';

export interface KeyCredential {
  keyId: string;
  displayName: string;
  startDateTime: string;
  endDateTime: string;
  type: string;
  usage: string;
  customKeyIdentifier?: string;
  daysRemaining: number;
  status: 'active' | 'expiring' | 'expired';
}

export interface PasswordCredential {
  keyId: string;
  displayName: string;
  startDateTime: string;
  endDateTime: string;
  hint?: string;
  daysRemaining: number;
  status: 'active' | 'expiring' | 'expired';
}

export interface AppOwner {
  id: string;
  displayName: string;
  userPrincipalName?: string;
  mail?: string;
  type: 'User' | 'ServicePrincipal' | 'Group' | 'Unknown';
}

export interface RedirectUri {
  uri: string;
  type: 'Web' | 'Spa' | 'PublicClient';
}

export interface RequiredResourceAccess {
  resourceAppId: string;
  resourceAccess: Array<{
    id: string;
    type: 'Role' | 'Scope';
  }>;
}

export interface AuditIssue {
  id: string;
  category: 'Credentials' | 'Certificates' | 'Secrets' | 'Owners' | 'RedirectUris' | 'Permissions' | 'General';
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  affectedItem?: string;
}

export interface AppRegistration {
  id: string; // Object ID
  appId: string; // Application (client) ID
  displayName: string;
  createdDateTime: string;
  signInAudience: string;
  publisherDomain?: string;
  verifiedPublisher?: boolean;
  owners: AppOwner[];
  keyCredentials: KeyCredential[];
  passwordCredentials: PasswordCredential[];
  replyUrlsWithType: RedirectUri[];
  requiredResourceAccess: RequiredResourceAccess[];
  api?: {
    oauth2PermissionScopes: Array<{
      id: string;
      value: string;
      type: string;
      isEnabled: boolean;
    }>;
    preAuthorizedApplications: any[];
  };
  web?: {
    redirectUris: string[];
    implicitGrantSettings?: {
      enableIdTokenIssuance: boolean;
      enableAccessTokenIssuance: boolean;
    };
  };
  spa?: {
    redirectUris: string[];
  };
  publicClient?: {
    redirectUris: string[];
  };
  
  // Calculated/Audited fields
  auditIssues: AuditIssue[];
  auditScore: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
}

export interface AuditSummary {
  totalApps: number;
  criticalIssuesCount: number;
  warningIssuesCount: number;
  infoIssuesCount: number;
  healthyAppsCount: number;
  averageAuditScore: number;
  expiredSecretsCount: number;
  expiringSecretsCount: number;
  expiredCertsCount: number;
  expiringCertsCount: number;
  appsWithNoOwnersCount: number;
  wildcardRedirectsCount: number;
  httpRedirectsCount: number;
}

export interface FilterState {
  searchQuery: string;
  severity: 'all' | Severity;
  status: 'all' | 'healthy' | 'warning' | 'critical';
  credentialType: 'all' | 'secrets' | 'certificates' | 'none' | 'both';
  ownerStatus: 'all' | 'hasOwners' | 'noOwners';
  sortBy: 'displayName' | 'createdDateTime' | 'auditScore' | 'issuesCount';
  sortOrder: 'asc' | 'desc';
}