

// --- CONSOLIDATED FROM: ./components/types/b2bRoutingResolver.ts ---

export type PaymentRail = 'ACH' | 'Fedwire' | 'RTP' | 'SWIFT' | 'BookTransfer';

export type RoutingStatus = 'Active' | 'Retired' | 'Suspended';

export interface BankDetails {
  routingNumber: string;
  bankName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  telephone: string;
  status: RoutingStatus;
  supportedRails: PaymentRail[];
  officeCode: string;
  recordType: string;
  revisionDate: string;
}

export interface ResolverResult {
  isValid: boolean;
  bankDetails?: BankDetails;
  error?: string;
  lookupTimestamp: string;
}

export type JweAlgorithm = 'RSA-OAEP' | 'RSA-OAEP-256' | 'ECDH-ES';
export type JweEncryption = 'A128GCM' | 'A256GCM' | 'A128CBC-HS256' | 'A256CBC-HS512';

export interface JweKeyPair {
  publicKey: string;
  privateKey: string;
  kid: string;
  algorithm: JweAlgorithm;
  createdAt: string;
}

export interface JweEncryptRequest {
  plaintext: string;
  publicKey: string;
  alg: JweAlgorithm;
  enc: JweEncryption;
  kid?: string;
  customHeaders?: Record<string, any>;
}

export interface JweParts {
  protectedHeader: string;
  encryptedKey: string;
  iv: string;
  ciphertext: string;
  tag: string;
}

export interface JweEncryptResponse {
  jwe: string;
  parts: JweParts;
  decodedHeader: Record<string, any>;
}

export interface JweDecryptRequest {
  jwe: string;
  privateKey: string;
}

export interface JweDecryptResponse {
  plaintext: string;
  headers: Record<string, any>;
  decryptedTimestamp: string;
}

export type PaymentPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface PaymentInstruction {
  id: string;
  amount: number;
  currency: string;
  senderRouting: string;
  senderAccount: string;
  receiverRouting: string;
  receiverAccount: string;
  receiverName: string;
  priority: PaymentPriority;
  memo?: string;
  createdAt: string;
}

export type RuleConditionField = 'amount' | 'receiverRouting' | 'priority' | 'currency' | 'senderRouting';
export type RuleOperator = 'gt' | 'lt' | 'eq' | 'contains' | 'startsWith' | 'endsWith';

export interface RoutingRule {
  id: string;
  name: string;
  conditionField: RuleConditionField;
  operator: RuleOperator;
  value: string | number;
  targetRail: PaymentRail;
  isActive: boolean;
  priority: number; // Execution order (lower runs first)
  description?: string;
}

export type RoutingDecisionStatus = 'Routed' | 'Failed' | 'HeldForReview';

export interface RoutingDecision {
  instructionId: string;
  selectedRail: PaymentRail;
  appliedRuleId?: string;
  appliedRuleName?: string;
  estimatedFee: number;
  estimatedSettlementTime: string; // e.g., "Instant", "1 Business Day"
  status: RoutingDecisionStatus;
  reason: string;
  routedAt: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface MockEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  responseStatus: number;
  responseBody: string; // JSON string
  delayMs: number;
  isActive: boolean;
  description?: string;
}

export interface ApiRequestLog {
  id: string;
  timestamp: string;
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  requestBody?: string;
  responseStatus: number;
  responseBody?: string;
  durationMs: number;
}

export interface SandboxState {
  bankDirectory: Record<string, BankDetails>;
  keyPairs: JweKeyPair[];
  routingRules: RoutingRule[];
  mockEndpoints: MockEndpoint[];
  requestLogs: ApiRequestLog[];
  paymentHistory: { instruction: PaymentInstruction; decision: RoutingDecision }[];
}