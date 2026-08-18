export interface JWK {
  kty: string;
  use?: string;
  key_ops?: string[];
  alg?: string;
  kid?: string;
  x5u?: string;
  x5c?: string[];
  x5t?: string;
  "x5t#S256"?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  y?: string;
  k?: string;
  d?: string;
  p?: string;
  q?: string;
  dp?: string;
  dq?: string;
  qi?: string;
}

export interface KeyMetadata {
  id: string;
  algorithm: string;
  purpose: 'encryption' | 'signature';
  publicKey: string | JWK;
  createdAt: string;
  expiresAt?: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface JWEHeader {
  alg: string;
  enc: string;
  kid?: string;
  zip?: string;
  crit?: string[];
  cty?: string;
  [key: string]: any;
}

export interface RoutingNumberDetails {
  routingNumber: string;
  bankName: string;
  bankAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  supportedRailTypes: ('ACH' | 'FedWire' | 'Swift' | 'RTP')[];
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface TransactionPayload {
  amount: number;
  currency: string;
  senderAccountNumber: string;
  senderRoutingNumber: string;
  receiverAccountNumber: string;
  receiverRoutingNumber: string;
  referenceMessage?: string;
  metadata?: Record<string, any>;
}

export interface BatchTransaction {
  id: string;
  batchId: string;
  payload: TransactionPayload;
  encryptedPayload?: string;
  status: TransactionStatus;
  errorMessage?: string;
  errorCode?: string;
  processedAt?: string;
  createdAt: string;
}

export interface BatchPipeline {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  totalTransactions: number;
  processedTransactions: number;
  failedTransactions: number;
  transactions: BatchTransaction[];
  encryptionKeyId?: string;
  createdAt: string;
  updatedAt: string;
}