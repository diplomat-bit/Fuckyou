

// --- CONSOLIDATED FROM: ./components/utils/azureAdAuditUtils.ts ---

export interface Owner {
  id: string;
  displayName: string;
  userPrincipalName?: string;
  mail?: string;
  active?: boolean;
}

export interface PasswordCredential {
  customKeyIdentifier?: string | null;
  displayName?: string | null;
  endDateTime: string;
  hint?: string | null;
  keyId: string;
  startDateTime: string;
}

export interface KeyCredential {
  customKeyIdentifier?: string | null;
  displayName?: string | null;
  endDateTime: string;
  keyId: string;
  startDateTime: string;
  type?: string;
  usage?: string;
}

export interface ResourceAccess {
  id: string; // Permission ID
  type: "Role" | "Scope"; // Role = Application, Scope = Delegated
}

export interface RequiredResourceAccess {
  resourceAppId: string; // e.g., Microsoft Graph App ID
  resourceAccess: ResourceAccess[];
}

export interface AzureAdApplication {
  id: string; // Object ID
  appId: string; // Client ID
  displayName: string;
  createdDateTime?: string;
  signInAudience?: string;
  owners?: Owner[];
  passwordCredentials?: PasswordCredential[];
  keyCredentials?: KeyCredential[];
  requiredResourceAccess?: RequiredResourceAccess[];
  web?: {
    redirectUris?: string[];
  };
  spa?: {
    redirectUris?: string[];
  };
  publicClient?: {
    redirectUris?: string[];
  };
}

export interface CredentialDetail {
  id: string;
  type: "Secret" | "Certificate";
  displayName: string;
  startDateTime: string;
  endDateTime: string;
  daysRemaining: number;
  status: "Active" | "Expiring Soon" | "Expired";
}

export interface PermissionDetail {
  resourceAppId: string;
  resourceName: string;
  permissionId: string;
  permissionName: string;
  type: "Application" | "Delegated";
  riskLevel: "High" | "Medium" | "Low";
  description: string;
}

export interface EnrichedApplication extends AzureAdApplication {
  isOrphaned: boolean;
  orphanedReason?: string;
  credentialsStatus: {
    expiredCount: number;
    expiringSoonCount: number;
    activeCount: number;
    totalCount: number;
    details: CredentialDetail[];
  };
  highPrivilegePermissions: PermissionDetail[];
  hasHighPrivilegePermissions: boolean;
  insecureRedirectUris: string[];
  hasInsecureRedirectUris: boolean;
  complianceScore: number;
  complianceIssues: string[];
}

// Known high-privilege MS Graph permissions (App Roles & Scopes)
// Microsoft Graph App ID: 00000003-0000-0000-c000-000000000000
const MS_GRAPH_APP_ID = "00000003-0000-0000-c000-000000000000";

const HIGH_PRIVILEGE_PERMISSIONS: Record<string, { name: string; risk: "High" | "Medium"; desc: string }> = {
  // Application Permissions (Roles)
  "19ec0e23-ef2c-4506-b437-d2e10fc2c117": {
    name: "Directory.ReadWrite.All",
    risk: "High",
    desc: "Allows the app to read and write entire directory data, including users, groups, and apps, without a signed-in user.",
  },
  "1bfefb4e-e0b5-418b-a88f-73c46d2cc8e9": {
    name: "Application.ReadWrite.All",
    risk: "High",
    desc: "Allows the app to create, update, and delete all applications and service principals without a signed-in user.",
  },
  "9e3f62cf-ca93-4989-b6ce-bfdcdfc35cd5": {
    name: "RoleManagement.ReadWrite.Directory",
    risk: "High",
    desc: "Allows the app to manage Microsoft Entra role assignments and definitions without a signed-in user.",
  },
  "06b70847-cd36-42d0-b8fb-aefd25726b45": {
    name: "AppRoleAssignment.ReadWrite.All",
    risk: "High",
    desc: "Allows the app to manage permission grants for any app without a signed-in user.",
  },
  "741f1158-a059-4c05-9000-ada0a72a005a": {
    name: "User.ReadWrite.All",
    risk: "High",
    desc: "Allows the app to read and write all user profiles, and reset passwords, without a signed-in user.",
  },
  "49847397-b335-4906-bf9c-ed93f293f143": {
    name: "Domain.ReadWrite.All",
    risk: "High",
    desc: "Allows the app to manage domains in the organization's directory without a signed-in user.",
  },
  "024d486e-b451-4ac3-b830-3e1890563717": {
    name: "Group.ReadWrite.All",
    risk: "High",
    desc: "Allows the app to create, read, update, and delete all groups without a signed-in user.",
  },
  // Delegated Permissions (Scopes)
  "b272e9a1-1a16-464b-a615-6ba1ee5193ca": {
    name: "Directory.ReadWrite.All",
    risk: "High",
    desc: "Allows the app to read and write directory data on behalf of the signed-in user.",
  },
  "c58215c8-14a3-4453-9890-cf3126442a03": {
    name: "Application.ReadWrite.All",
    risk: "High",
    desc: "Allows the app to manage all applications and service principals on behalf of the signed-in user.",
  },
  "2217bda5-81e3-451c-b658-000000000000": {
    name: "RoleManagement.ReadWrite.Directory",
    risk: "High",
    desc: "Allows the app to manage Microsoft Entra role assignments on behalf of the signed-in user.",
  },
};

/**
 * Detects if an application is orphaned (has no owners or all owners are inactive).
 */
export function detectOrphanedStatus(owners?: Owner[]): { isOrphaned: boolean; reason?: string } {
  if (!owners || owners.length === 0) {
    return { isOrphaned: true, reason: "Application has no registered owners." };
  }

  const activeOwners = owners.filter((owner) => owner.active !== false);
  if (activeOwners.length === 0) {
    return { isOrphaned: true, reason: "All registered owners are inactive/disabled accounts." };
  }

  return { isOrphaned: false };
}

/**
 * Analyzes credentials (secrets and certificates) for expiration status.
 * Expiring soon threshold defaults to 30 days.
 */
export function analyzeCredentials(
  passwordCredentials: PasswordCredential[] = [],
  keyCredentials: KeyCredential[] = [],
  expiringSoonDaysThreshold = 30
): EnrichedApplication["credentialsStatus"] {
  const details: CredentialDetail[] = [];
  let expiredCount = 0;
  let expiringSoonCount = 0;
  let activeCount = 0;

  const now = new Date();

  const processCred = (
    cred: PasswordCredential | KeyCredential,
    type: "Secret" | "Certificate"
  ) => {
    const end = new Date(cred.endDateTime);
    const diffTime = end.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: "Active" | "Expiring Soon" | "Expired" = "Active";
    if (daysRemaining <= 0) {
      status = "Expired";
      expiredCount++;
    } else if (daysRemaining <= expiringSoonDaysThreshold) {
      status = "Expiring Soon";
      expiringSoonCount++;
    } else {
      activeCount++;
    }

    details.push({
      id: cred.keyId,
      type,
      displayName: cred.displayName || (type === "Secret" ? `Secret (Hint: ${('hint' in cred ? cred.hint : '') || 'N/A'})` : "Certificate"),
      startDateTime: cred.startDateTime,
      endDateTime: cred.endDateTime,
      daysRemaining,
      status,
    });
  };

  passwordCredentials.forEach((c) => processCred(c, "Secret"));
  keyCredentials.forEach((c) => processCred(c, "Certificate"));

  return {
    expiredCount,
    expiringSoonCount,
    activeCount,
    totalCount: passwordCredentials.length + keyCredentials.length,
    details,
  };
}

/**
 * Detects high-privilege permissions assigned to the application.
 */
export function detectHighPrivilegePermissions(
  requiredResourceAccess: RequiredResourceAccess[] = []
): PermissionDetail[] {
  const highPrivilegeList: PermissionDetail[] = [];

  requiredResourceAccess.forEach((resource) => {
    const isMsGraph = resource.resourceAppId === MS_GRAPH_APP_ID;
    const resourceName = isMsGraph ? "Microsoft Graph" : `API (${resource.resourceAppId})`;

    resource.resourceAccess.forEach((access) => {
      const knownPerm = HIGH_PRIVILEGE_PERMISSIONS[access.id];
      if (knownPerm) {
        highPrivilegeList.push({
          resourceAppId: resource.resourceAppId,
          resourceName,
          permissionId: access.id,
          permissionName: knownPerm.name,
          type: access.type === "Role" ? "Application" : "Delegated",
          riskLevel: knownPerm.risk,
          description: knownPerm.desc,
        });
      }
    });
  });

  return highPrivilegeList;
}

/**
 * Detects insecure redirect URIs (e.g., HTTP without localhost, wildcards).
 */
export function detectInsecureRedirectUris(app: AzureAdApplication): string[] {
  const insecureUris: string[] = [];
  const allUris = [
    ...(app.web?.redirectUris || []),
    ...(app.spa?.redirectUris || []),
    ...(app.publicClient?.redirectUris || []),
  ];

  allUris.forEach((uri) => {
    try {
      const url = new URL(uri);
      
      // Check for HTTP protocol (except localhost / 127.0.0.1)
      if (url.protocol === "http:") {
        const isLocalhost =
          url.hostname === "localhost" ||
          url.hostname === "127.0.0.1" ||
          url.hostname.endsWith(".localhost");
        if (!isLocalhost) {
          insecureUris.push(uri);
          return;
        }
      }

      // Check for wildcard characters in host or path (Azure AD generally blocks, but legacy/custom setups might have them)
      if (uri.includes("*")) {
        insecureUris.push(uri);
      }
    } catch {
      // If it's not a valid URL structure, flag it if it contains wildcards or insecure patterns
      if (uri.startsWith("http://") && !uri.includes("localhost") && !uri.includes("127.0.0.1")) {
        insecureUris.push(uri);
      } else if (uri.includes("*")) {
        insecureUris.push(uri);
      }
    }
  });

  return Array.from(new Set(insecureUris)); // Deduplicate
}

/**
 * Calculates compliance score and compiles list of compliance issues.
 * Score starts at 100 and deducts points based on severity of findings.
 */
export function calculateCompliance(
  isOrphaned: boolean,
  credentialsStatus: EnrichedApplication["credentialsStatus"],
  highPrivilegePermissions: PermissionDetail[],
  insecureRedirectUris: string[]
): { complianceScore: number; complianceIssues: string[] } {
  let score = 100;
  const complianceIssues: string[] = [];

  // 1. Orphaned Status (Critical)
  if (isOrphaned) {
    score -= 25;
    complianceIssues.push("Application is orphaned (no active owners assigned).");
  }

  // 2. Expired Credentials (Critical)
  if (credentialsStatus.expiredCount > 0) {
    score -= 20;
    complianceIssues.push(`${credentialsStatus.expiredCount} credential(s) are expired.`);
  }

  // 3. Expiring Soon Credentials (Medium)
  if (credentialsStatus.expiringSoonCount > 0) {
    score -= 10;
    complianceIssues.push(`${credentialsStatus.expiringSoonCount} credential(s) are expiring soon.`);
  }

  // 4. High-Privilege Permissions (High)
  if (highPrivilegePermissions.length > 0) {
    const highRiskCount = highPrivilegePermissions.filter((p) => p.riskLevel === "High").length;
    if (highRiskCount > 0) {
      score -= 25;
      complianceIssues.push(`Application holds ${highRiskCount} high-privilege permission(s).`);
    } else {
      score -= 10;
      complianceIssues.push(`Application holds medium-privilege permission(s).`);
    }
  }

  // 5. Insecure Redirect URIs (High)
  if (insecureRedirectUris.length > 0) {
    score -= 15;
    complianceIssues.push(`Application configures ${insecureRedirectUris.length} insecure redirect URI(s).`);
  }

  // Ensure score stays within 0 - 100 range
  const complianceScore = Math.max(0, Math.min(100, score));

  return {
    complianceScore,
    complianceIssues,
  };
}

/**
 * Main orchestrator function to enrich raw Azure AD Application data with security and compliance insights.
 */
export function enrichApplicationData(
  app: AzureAdApplication,
  expiringSoonDaysThreshold = 30
): EnrichedApplication {
  const { isOrphaned, reason: orphanedReason } = detectOrphanedStatus(app.owners);
  const credentialsStatus = analyzeCredentials(
    app.passwordCredentials,
    app.keyCredentials,
    expiringSoonDaysThreshold
  );
  const highPrivilegePermissions = detectHighPrivilegePermissions(app.requiredResourceAccess);
  const insecureRedirectUris = detectInsecureRedirectUris(app);

  const { complianceScore, complianceIssues } = calculateCompliance(
    isOrphaned,
    credentialsStatus,
    highPrivilegePermissions,
    insecureRedirectUris
  );

  return {
    ...app,
    isOrphaned,
    orphanedReason,
    credentialsStatus,
    highPrivilegePermissions,
    hasHighPrivilegePermissions: highPrivilegePermissions.length > 0,
    insecureRedirectUris,
    hasInsecureRedirectUris: insecureRedirectUris.length > 0,
    complianceScore,
    complianceIssues,
  };
}

/**
 * Helper to aggregate metrics across a collection of enriched applications.
 */
export interface AuditSummary {
  totalApps: number;
  averageComplianceScore: number;
  orphanedCount: number;
  appsWithExpiredCredsCount: number;
  appsWithExpiringSoonCredsCount: number;
  appsWithHighPrivilegeCount: number;
  appsWithInsecureUrisCount: number;
}

export function generateAuditSummary(apps: EnrichedApplication[]): AuditSummary {
  if (apps.length === 0) {
    return {
      totalApps: 0,
      averageComplianceScore: 100,
      orphanedCount: 0,
      appsWithExpiredCredsCount: 0,
      appsWithExpiringSoonCredsCount: 0,
      appsWithHighPrivilegeCount: 0,
      appsWithInsecureUrisCount: 0,
    };
  }

  const totalApps = apps.length;
  const sumCompliance = apps.reduce((acc, app) => acc + app.complianceScore, 0);
  const orphanedCount = apps.filter((app) => app.isOrphaned).length;
  const appsWithExpiredCredsCount = apps.filter((app) => app.credentialsStatus.expiredCount > 0).length;
  const appsWithExpiringSoonCredsCount = apps.filter((app) => app.credentialsStatus.expiringSoonCount > 0).length;
  const appsWithHighPrivilegeCount = apps.filter((app) => app.hasHighPrivilegePermissions).length;
  const appsWithInsecureUrisCount = apps.filter((app) => app.hasInsecureRedirectUris).length;

  return {
    totalApps,
    averageComplianceScore: Math.round(sumCompliance / totalApps),
    orphanedCount,
    appsWithExpiredCredsCount,
    appsWithExpiringSoonCredsCount,
    appsWithHighPrivilegeCount,
    appsWithInsecureUrisCount,
  };
}