export interface ClientSecret {
  id: string;
  displayName: string;
  startDateTime: string;
  endDateTime: string;
  hint: string;
  value?: string;
}

export interface ApiPermission {
  resourceAppId: string;
  resourceAppName: string;
  permissions: {
    id: string;
    type: 'Role' | 'Scope';
    value: string;
    description: string;
  }[];
}

export interface AppRole {
  id: string;
  allowedMemberTypes: ('User' | 'Application')[];
  description: string;
  displayName: string;
  isEnabled: boolean;
  value: string;
}

export interface ExposedApiScope {
  id: string;
  adminConsentDescription: string;
  adminConsentDisplayName: string;
  isEnabled: boolean;
  value: string;
  type: 'User' | 'Admin';
}

export interface AzureAdApp {
  id: string; // Object ID
  appId: string; // Application (Client) ID
  displayName: string;
  createdDateTime: string;
  signInAudience: 'AzureADMyOrg' | 'AzureADMultipleOrgs' | 'AzureADandPersonalMicrosoftAccount' | 'PersonalMicrosoftAccount';
  redirectUris: {
    web: string[];
    spa: string[];
    publicClient: string[];
  };
  owners: string[];
  passwordCredentials: ClientSecret[];
  appRoles: AppRole[];
  oauth2PermissionScopes: ExposedApiScope[];
  requiredResourceAccess: ApiPermission[];
  notes?: string;
}

export const MS_GRAPH_APP_ID = "00000003-0000-0000-c000-000000000000";

export const DEFAULT_AZURE_AD_APPS: AzureAdApp[] = [
  {
    id: "6f1b8c2a-4d9e-4a1a-8f3c-2b5d7e9f1a3b",
    appId: "11111111-2222-3333-4444-555555555555",
    displayName: "Employee Portal Frontend",
    createdDateTime: "2023-01-15T08:30:00Z",
    signInAudience: "AzureADMyOrg",
    redirectUris: {
      web: [],
      spa: ["http://localhost:3000", "https://portal.company.com"],
      publicClient: []
    },
    owners: ["admin@company.onmicrosoft.com", "dev-lead@company.onmicrosoft.com"],
    passwordCredentials: [],
    appRoles: [],
    oauth2PermissionScopes: [],
    requiredResourceAccess: [
      {
        resourceAppId: MS_GRAPH_APP_ID,
        resourceAppName: "Microsoft Graph",
        permissions: [
          {
            id: "e1fe9681-0554-4972-b3f8-9e196f5d97fc",
            type: "Scope",
            value: "User.Read",
            description: "Sign in and read user profile"
          },
          {
            id: "86241b83-9572-47c6-9d53-973161e48532",
            type: "Scope",
            value: "profile",
            description: "View users' basic profile"
          }
        ]
      }
    ],
    notes: "Main single-page application for internal employee self-service portal."
  },
  {
    id: "7a2c9d3b-5e0f-4b2b-9f4d-3c6e8f0a2b4c",
    appId: "22222222-3333-4444-5555-666666666666",
    displayName: "Core Payment Gateway API",
    createdDateTime: "2022-11-01T10:15:30Z",
    signInAudience: "AzureADMyOrg",
    redirectUris: {
      web: ["https://api.payments.company.com/swagger/oauth2-redirect.html"],
      spa: [],
      publicClient: []
    },
    owners: ["finance-dev@company.onmicrosoft.com"],
    passwordCredentials: [
      {
        id: "c1b2a3f4-e5d6-4c7b-8a9f-0e1d2c3b4a5f",
        displayName: "Production Client Secret 2024",
        startDateTime: "2024-01-01T00:00:00Z",
        endDateTime: "2025-01-01T00:00:00Z",
        hint: "p8Q~",
        value: "p8Q~mock_secret_value_never_exposed_fully_xyz123"
      },
      {
        id: "d2c3b4a5-f6e7-5d8c-9b0a-1f2e3d4c5b6a",
        displayName: "Expired Legacy Secret",
        startDateTime: "2022-11-01T10:00:00Z",
        endDateTime: "2023-11-01T10:00:00Z",
        hint: "a3F~"
      }
    ],
    appRoles: [
      {
        id: "fc4c1160-1206-4505-9a76-7f543356ef82",
        allowedMemberTypes: ["Application"],
        description: "Allows daemon services to trigger automated payment settlements.",
        displayName: "Payments.Settlement.Trigger",
        isEnabled: true,
        value: "Payments.Settlement.Trigger"
      },
      {
        id: "9b123456-7890-abcd-ef01-23456789abcd",
        allowedMemberTypes: ["User"],
        description: "Full administrative access to payment configurations.",
        displayName: "Payments.Admin",
        isEnabled: true,
        value: "Payments.Admin"
      }
    ],
    oauth2PermissionScopes: [
      {
        id: "5c0b1234-5678-90ab-cdef-1234567890ab",
        adminConsentDescription: "Allows the app to read payment transactions on behalf of the signed-in user.",
        adminConsentDisplayName: "Read Transactions",
        isEnabled: true,
        value: "Transactions.Read",
        type: "User"
      },
      {
        id: "6d1b2345-6789-0abc-def0-1234567890bc",
        adminConsentDescription: "Allows the app to initiate payment transactions on behalf of the signed-in user.",
        adminConsentDisplayName: "Write Transactions",
        isEnabled: true,
        value: "Transactions.Write",
        type: "Admin"
      }
    ],
    requiredResourceAccess: [
      {
        resourceAppId: MS_GRAPH_APP_ID,
        resourceAppName: "Microsoft Graph",
        permissions: [
          {
            id: "df021288-b3fc-48a5-a68d-e18f749c2b1c",
            type: "Scope",
            value: "User.Read.All",
            description: "Read all users' full profiles"
          }
        ]
      }
    ],
    notes: "Backend API handling payment processing. Exposes scopes for frontend and roles for daemon syncs."
  },
  {
    id: "8b3d0e4c-6f1a-5c3c-0a5e-4d7f9a1b3c5d",
    appId: "33333333-4444-5555-6666-777777777777",
    displayName: "Slack Integration Connector",
    createdDateTime: "2023-06-20T14:45:00Z",
    signInAudience: "AzureADMultipleOrgs",
    redirectUris: {
      web: ["https://slack-connector.company.com/api/auth/callback"],
      spa: [],
      publicClient: []
    },
    owners: ["sa-slack@company.onmicrosoft.com"],
    passwordCredentials: [
      {
        id: "e3d4c5b6-a7f8-6e9d-0b1c-2d3e4f5a6b7c",
        displayName: "Multi-Tenant Webhook Secret",
        startDateTime: "2023-06-20T14:00:00Z",
        endDateTime: "2025-06-20T14:00:00Z",
        hint: "s9X~"
      }
    ],
    appRoles: [],
    oauth2PermissionScopes: [],
    requiredResourceAccess: [
      {
        resourceAppId: MS_GRAPH_APP_ID,
        resourceAppName: "Microsoft Graph",
        permissions: [
          {
            id: "37f7f235-527c-4136-accd-4a02d197296e",
            type: "Scope",
            value: "mail.send",
            description: "Send mail as a user"
          }
        ]
      }
    ],
    notes: "Multi-tenant application allowing external organizations to link their Slack workspaces with our directory notifications."
  },
  {
    id: "9c4e1f5d-7a2b-6d4d-1b6f-5e8a0b2c4d6e",
    appId: "44444444-5555-6666-7777-888888888888",
    displayName: "Nightly HR Sync Daemon",
    createdDateTime: "2021-03-10T22:00:00Z",
    signInAudience: "AzureADMyOrg",
    redirectUris: {
      web: [],
      spa: [],
      publicClient: []
    },
    owners: ["hr-admin@company.onmicrosoft.com", "it-ops@company.onmicrosoft.com"],
    passwordCredentials: [
      {
        id: "f4e5d6c7-b8a9-7f0e-1c2d-3e4f5a6b7c8d",
        displayName: "Sync Service Principal Key",
        startDateTime: "2023-03-10T00:00:00Z",
        endDateTime: "2026-03-10T00:00:00Z",
        hint: "z1Y~"
      }
    ],
    appRoles: [],
    oauth2PermissionScopes: [],
    requiredResourceAccess: [
      {
        resourceAppId: MS_GRAPH_APP_ID,
        resourceAppName: "Microsoft Graph",
        permissions: [
          {
            id: "1910a3b0-271b-4571-9910-297d57d31415",
            type: "Role",
            value: "Directory.ReadWrite.All",
            description: "Read and write directory data"
          },
          {
            id: "7419713a-12ef-42f4-b851-40b170934972",
            type: "Role",
            value: "User.ReadWrite.All",
            description: "Read and write all users' full profiles"
          }
        ]
      }
    ],
    notes: "Unattended background service syncing Workday HR records into Azure Active Directory."
  }
];