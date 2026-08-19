

// --- CONSOLIDATED FROM: ./api/utils/vault.ts ---

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  createHmac,
  timingSafeEqual,
  generateKeyPairSync,
  sign,
  verify,
} from 'crypto';
import { Request, Response, Router } from 'express';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export interface EncryptedDataPayload {
  encrypted: string;
  iv: string;
  tag: string;
  salt?: string;
  algorithm?: string;
  version?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface BibliographyPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  doi?: string;
  abstract: string;
  keyContributions: string[];
  vaultImplementationNotes: string;
  domain: 'CRYPTOGRAPHY' | 'AI_TRANSFORMER' | 'FINTECH' | 'SOVEREIGN_GOVERNANCE' | 'REAL_ESTATE_SMART_CONTRACTS';
  fullTextExcerpt: string;
}

export interface BankingVaultPayload {
  transactionId: string;
  senderAccount: string;
  recipientAccount: string;
  amount: number;
  currency: string;
  encryptedMetadata: EncryptedDataPayload;
  sovereignProof: string;
  timestamp: string;
  status: 'SETTLED' | 'PENDING_AI_AUDIT' | 'ESCROWED';
}

export interface PropertyTitleVaultPayload {
  parcelId: string;
  propertyAddress: string;
  legalDescription: string;
  assessedValueUSD: number;
  ownerIdentityHash: string;
  titleDeedEncrypted: EncryptedDataPayload;
  escrowStatus: 'CLEAR_TITLE' | 'ESCROW_ACTIVE' | 'GOVERNMENT_STAMPED' | 'TRANSFERRED';
  sovereignRegistrySignature: string;
  timestamp: string;
}

export interface SovereignGovernmentRecord {
  citizenIdHash: string;
  serviceType: 'PASSPORT_VERIFICATION' | 'TAX_SETTLEMENT' | 'PROPERTY_DEED_REGISTRATION' | 'DISASTER_RELIEF_DISBURSEMENT' | 'SOVEREIGN_VOTE_PROOF';
  encryptedRecord: EncryptedDataPayload;
  jurisdictionCode: string;
  verificationProof: string;
  authorizedByAI: boolean;
  timestamp: string;
}

export interface AIInteractionResponse {
  paperId: string;
  paperTitle: string;
  userPrompt: string;
  aiThoughtProcess: string;
  response: string;
  appliedCryptographicTheorem: string;
  suggestedAction?: {
    actionType: 'EXECUTE_TRANSFER' | 'ACQUIRE_HOUSE_ESCROW' | 'ISSUE_GOVERNMENT_DEED' | 'QUERY_CITATION';
    payload: Record<string, any>;
  };
}

export const VAULT_BIBLIOGRAPHY: BibliographyPaper[] = [
  {
    id: 'nist-sp800-38d',
    title: 'Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC',
    authors: ['Morris Dworkin'],
    year: 2007,
    venue: 'NIST Special Publication 800-38D',
    doi: '10.6028/NIST.SP.800-38D',
    abstract: 'This publication specifies the Galois/Counter Mode (GCM) of operation for symmetric key block ciphers.',
    keyContributions: ['Provable security bound', 'High-throughput hardware', 'GHASH polynomial multiplication'],
    vaultImplementationNotes: 'Foundation of Vault encrypt/decrypt pipelines.',
    domain: 'CRYPTOGRAPHY',
    fullTextExcerpt: 'Galois/Counter Mode (GCM) is an authenticated encryption mode.',
  }
];

export class Vault {
  private readonly masterKey: Buffer;
  private readonly salt: string;

  constructor(secret: string = process.env.VAULT_SECRET || 'default-secret', salt: string = process.env.VAULT_SALT || 'default-salt') {
    this.salt = salt;
    this.masterKey = scryptSync(secret, salt, KEY_LENGTH);
  }

  public encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.masterKey, iv, { authTagLength: AUTH_TAG_LENGTH });
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    return { encrypted: encrypted.toString('hex'), iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex') };
  }

  public decrypt(encryptedHex: string, ivHex: string, tagHex: string): string {
    const decipher = createDecipheriv(ALGORITHM, this.masterKey, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
  }

  public encryptPayload(data: string, metadata?: Record<string, any>): EncryptedDataPayload {
    const res = this.encrypt(data);
    return { ...res, salt: this.salt, algorithm: ALGORITHM, version: 'v2.5-sovereign', timestamp: Date.now(), metadata };
  }

  public static generateSecureKey(): string { return randomBytes(64).toString('hex'); }
}

export const vaultRouter = Router();

vaultRouter.post('/encrypt', (req: Request, res: Response) => {
  const { secret, salt, data } = req.body;
  const v = new Vault(secret, salt);
  res.json(v.encryptPayload(JSON.stringify(data)));
});

vaultRouter.post('/decrypt', (req: Request, res: Response) => {
  const { secret, salt, payload } = req.body;
  const v = new Vault(secret, salt);
  res.json({ decrypted: JSON.parse(v.decrypt(payload.encrypted, payload.iv, payload.tag)) });
});

vaultRouter.get('/bibliography', (req: Request, res: Response) => {
  res.json(VAULT_BIBLIOGRAPHY);
});

export default Vault;
export const vault = new Vault();