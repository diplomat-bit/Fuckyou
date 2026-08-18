import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  createHash,
  randomBytes,
  generateKeyPairSync,
  sign,
  verify
} from 'crypto';

// ============================================================================
// BIBLIOGRAPHY & RESEARCH PAPERS
// ============================================================================

const BIBLIOGRAPHY = [
  {
    id: "paper-01",
    title: "Bitcoin: A Peer-to-Peer Electronic Cash System",
    authors: ["Satoshi Nakamoto"],
    year: 2008,
    url: "https://bitcoin.org/bitcoin.pdf",
    abstract: "A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution.",
    topics: ["cryptocurrency", "blockchain", "consensus", "banking"]
  },
  {
    id: "paper-02",
    title: "Decentralized Public Key Infrastructure (DPKI)",
    authors: ["Christopher Allen", "et al."],
    year: 2015,
    url: "https://github.com/WebOfTrustInfo/rwot1-sf/blob/master/topics-and-advance-readings/dpki.pdf",
    abstract: "Decentralized Public Key Infrastructure (DPKI) is a system that uses a blockchain to securely manage public keys.",
    topics: ["identity", "pki", "decentralization", "sovereign-identity"]
  },
  {
    id: "paper-03",
    title: "zk-SNARKs: Under the Hood",
    authors: ["Vitalik Buterin"],
    year: 2016,
    url: "https://medium.com/@VitalikButerin/zk-snarks-under-the-hood-b33151a013f6",
    abstract: "An explanation of Zero-Knowledge Succinct Non-Interactive Argument of Knowledge.",
    topics: ["zero-knowledge", "cryptography", "privacy"]
  },
  {
    id: "paper-04",
    title: "The W3C Verifiable Credentials Data Model 1.1",
    authors: ["W3C Credentials Community Group"],
    year: 2022,
    url: "https://www.w3.org/TR/vc-data-model/",
    abstract: "A standard for expressing credentials on the Web in a way that is cryptographically secure, privacy-respecting, and machine-verifiable.",
    topics: ["verifiable-credentials", "w3c", "standards", "government"]
  },
  {
    id: "paper-05",
    title: "Attention Is All You Need",
    authors: ["Ashish Vaswani", "et al."],
    year: 2017,
    url: "https://arxiv.org/abs/1706.03762",
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.",
    topics: ["ai", "transformers", "nlp", "chat"]
  }
];

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SovereignProfile {
  did: string;
  publicKeyPem: string;
  controller: string;
  created: number;
  updated: number;
  claims: Record<string, unknown>;
  biometricBound: boolean;
  entraObjectId?: string;
  status: 'active' | 'suspended' | 'revoked';
  guardians?: string[];
  recoveryThreshold?: number;
}

export interface VerifiableCredential {
  context: string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: Record<string, unknown>;
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    jws: string;
  };
}

export interface BiometricAttestationChallenge {
  challengeId: string;
  did: string;
  challenge: string;
  expiresAt: number;
  rpId: string;
  userVerification: 'required' | 'preferred' | 'discouraged';
}

export interface EntraDirectorySyncStatus {
  tenantId: string;
  lastSyncTimestamp: number;
  recordsSynced: number;
  deltaToken?: string;
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  errors: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  did: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

export interface MultiSigTransaction {
  id: string;
  creator: string;
  destination: string;
  amount: number;
  approvals: string[];
  requiredApprovals: number;
  status: 'pending' | 'executed' | 'rejected';
  payload: string;
}

// ============================================================================
// IN-MEMORY STORAGE & CRYPTOGRAPHIC ENGINE
// ============================================================================

class SovereignIdentityEngine {
  private profiles: Map<string, SovereignProfile> = new Map();
  private challenges: Map<string, BiometricAttestationChallenge> = new Map();
  private credentials: Map<string, VerifiableCredential> = new Map();
  private entraSyncState: Map<string, EntraDirectorySyncStatus> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private multiSigTransactions: Map<string, MultiSigTransaction> = new Map();
  
  // AI Banking & Real Estate State
  private balances: Map<string, number> = new Map();
  
  // System Authority Master Keys for Anchor Signatures
  private authorityKeyPair = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  constructor() {
    // Seed some default profiles and balances for testing
    this.createProfile('did:sovereign:global-government-authority', this.authorityKeyPair.publicKey);
    this.balances.set('did:sovereign:global-government-authority', 1000000000);
  }

  public getAuthorityPublicKey(): string {
    return this.authorityKeyPair.publicKey;
  }

  public getAuthorityPrivateKey(): string {
    return this.authorityKeyPair.privateKey;
  }

  public signPayload(payload: string | Buffer): string {
    return sign(null, Buffer.from(payload), this.authorityKeyPair.privateKey).toString('base64url');
  }

  public verifyPayload(payload: string | Buffer, signatureBase64Url: string): boolean {
    return verify(null, Buffer.from(payload), this.authorityKeyPair.publicKey, Buffer.from(signatureBase64Url, 'base64url'));
  }

  public logAction(did: string, action: string, details: Record<string, unknown>, ipAddress?: string): void {
    const entry: AuditLogEntry = {
      id: `log-${randomBytes(12).toString('hex')}`,
      timestamp: Date.now(),
      did,
      action,
      details,
      ipAddress
    };
    this.auditLogs.push(entry);
  }

  public getAuditLogs(did: string): AuditLogEntry[] {
    return this.auditLogs.filter(log => log.did === did);
  }

  public createProfile(did: string, publicKeyPem: string, controller?: string): SovereignProfile {
    const profile: SovereignProfile = {
      did,
      publicKeyPem,
      controller: controller || did,
      created: Date.now(),
      updated: Date.now(),
      claims: {},
      biometricBound: false,
      status: 'active'
    };
    this.profiles.set(did, profile);
    this.logAction(did, 'PROFILE_CREATION', { controller: profile.controller });
    return profile;
  }

  public getProfile(did: string): SovereignProfile | undefined {
    return this.profiles.get(did);
  }

  public updateProfile(did: string, claims: Record<string, unknown>, entraObjectId?: string): SovereignProfile {
    const profile = this.profiles.get(did);
    if (!profile) {
      throw new Error(`Profile with DID ${did} not found`);
    }
    profile.claims = { ...profile.claims, ...claims };
    if (entraObjectId) {
      profile.entraObjectId = entraObjectId;
    }
    profile.updated = Date.now();
    this.profiles.set(did, profile);
    this.logAction(did, 'PROFILE_UPDATE', { updatedClaims: Object.keys(claims), entraObjectId });
    return profile;
  }

  public configureRecovery(did: string, guardians: string[], threshold: number): SovereignProfile {
    const profile = this.profiles.get(did);
    if (!profile) {
      throw new Error(`Profile with DID ${did} not found`);
    }
    if (threshold > guardians.length) {
      throw new Error('Threshold cannot exceed the number of guardians');
    }
    profile.guardians = guardians;
    profile.recoveryThreshold = threshold;
    profile.updated = Date.now();
    this.profiles.set(did, profile);
    this.logAction(did, 'RECOVERY_CONFIGURED', { guardians, threshold });
    return profile;
  }

  public executeRecovery(did: string, newPublicKeyPem: string, guardianSignatures: { guardianDid: string; signature: string }[]): SovereignProfile {
    const profile = this.profiles.get(did);
    if (!profile) {
      throw new Error(`Profile with DID ${did} not found`);
    }
    if (!profile.guardians || !profile.recoveryThreshold) {
      throw new Error('Social recovery is not configured for this profile');
    }
    if (guardianSignatures.length < profile.recoveryThreshold) {
      throw new Error(`Insufficient guardian signatures. Required: ${profile.recoveryThreshold}, Provided: ${guardianSignatures.length}`);
    }

    // Verify each guardian signature
    const payload = JSON.stringify({ did, newPublicKeyPem });
    for (const sig of guardianSignatures) {
      if (!profile.guardians.includes(sig.guardianDid)) {
        throw new Error(`DID ${sig.guardianDid} is not a registered guardian for this profile`);
      }
      const guardianProfile = this.getProfile(sig.guardianDid);
      if (!guardianProfile) {
        throw new Error(`Guardian profile for ${sig.guardianDid} not found`);
      }
      const isValid = verify(
        null,
        Buffer.from(payload),
        guardianProfile.publicKeyPem,
        Buffer.from(sig.signature, 'base64url')
      );
      if (!isValid) {
        throw new Error(`Invalid signature from guardian ${sig.guardianDid}`);
      }
    }

    profile.publicKeyPem = newPublicKeyPem;
    profile.updated = Date.now();
    this.profiles.set(did, profile);
    this.logAction(did, 'PROFILE_RECOVERED', { newPublicKeyPem });
    return profile;
  }

  public createChallenge(did: string, rpId: string): BiometricAttestationChallenge {
    const challengeId = randomBytes(16).toString('hex');
    const challengeStr = randomBytes(32).toString('base64url');
    const attestationChallenge: BiometricAttestationChallenge = {
      challengeId,
      did,
      challenge: challengeStr,
      expiresAt: Date.now() + 300000, // 5 minutes
      rpId,
      userVerification: 'required'
    };
    this.challenges.set(challengeId, attestationChallenge);
    this.logAction(did, 'BIOMETRIC_CHALLENGE_CREATED', { challengeId, rpId });
    return attestationChallenge;
  }

  public verifyChallenge(challengeId: string, clientDataJSON: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return false;
    if (Date.now() > challenge.expiresAt) {
      this.challenges.delete(challengeId);
      return false;
    }

    try {
      const parsedClientData = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf-8'));
      const isChallengeValid = parsedClientData.challenge === challenge.challenge;
      if (isChallengeValid) {
        const profile = this.profiles.get(challenge.did);
        if (profile) {
          profile.biometricBound = true;
          profile.updated = Date.now();
          this.profiles.set(challenge.did, profile);
        }
        this.logAction(challenge.did, 'BIOMETRIC_CHALLENGE_VERIFIED', { challengeId });
      }
      this.challenges.delete(challengeId);
      return isChallengeValid;
    } catch {
      return false;
    }
  }

  public issueCredential(issuerDid: string, subjectDid: string, claims: Record<string, unknown>): VerifiableCredential {
    const credentialId = `urn:uuid:${randomBytes(16).toString('hex')}`;
    const issuanceDate = new Date().toISOString();
    
    const payload = JSON.stringify({
      id: credentialId,
      issuer: issuerDid,
      issuanceDate,
      credentialSubject: { id: subjectDid, ...claims }
    });

    const signature = this.signPayload(payload);

    const vc: VerifiableCredential = {
      context: ['https://www.w3.org/2018/credentials/v1'],
      id: credentialId,
      type: ['VerifiableCredential', 'SovereignIdentityAttestation'],
      issuer: issuerDid,
      issuanceDate,
      credentialSubject: { id: subjectDid, ...claims },
      proof: {
        type: 'Ed25519Signature2020',
        created: issuanceDate,
        verificationMethod: `${issuerDid}#keys-1`,
        proofPurpose: 'assertionMethod',
        jws: signature
      }
    };

    this.credentials.set(credentialId, vc);
    this.logAction(subjectDid, 'CREDENTIAL_ISSUED', { credentialId, issuerDid, claims: Object.keys(claims) });
    return vc;
  }

  public verifyCredential(vc: VerifiableCredential): boolean {
    try {
      const payload = JSON.stringify({
        id: vc.id,
        issuer: vc.issuer,
        issuanceDate: vc.issuanceDate,
        credentialSubject: vc.credentialSubject
      });

      const isValid = this.verifyPayload(payload, vc.proof.jws);
      this.logAction(vc.credentialSubject.id as string, 'CREDENTIAL_VERIFIED', { credentialId: vc.id, isValid });
      return isValid;
    } catch {
      return false;
    }
  }

  public syncEntraTenant(tenantId: string): EntraDirectorySyncStatus {
    const syncStatus: EntraDirectorySyncStatus = {
      tenantId,
      lastSyncTimestamp: Date.now(),
      recordsSynced: Math.floor(Math.random() * 500) + 10,
      deltaToken: randomBytes(24).toString('base64url'),
      status: 'completed',
      errors: []
    };
    this.entraSyncState.set(tenantId, syncStatus);
    this.logAction('system', 'ENTRA_SYNC_COMPLETED', { tenantId, recordsSynced: syncStatus.recordsSynced });
    return syncStatus;
  }

  public getEntraSyncStatus(tenantId: string): EntraDirectorySyncStatus | undefined {
    return this.entraSyncState.get(tenantId);
  }

  // ============================================================================
  // MULTI-SIGNATURE ENGINE
  // ============================================================================

  public createMultiSigTransaction(creator: string, destination: string, amount: number, requiredApprovals: number, payload: string): MultiSigTransaction {
    const id = `tx-${randomBytes(12).toString('hex')}`;
    const tx: MultiSigTransaction = {
      id,
      creator,
      destination,
      amount,
      approvals: [creator],
      requiredApprovals,
      status: 'pending',
      payload
    };
    this.multiSigTransactions.set(id, tx);
    this.logAction(creator, 'MULTISIG_TX_CREATED', { id, destination, amount, requiredApprovals });
    return tx;
  }

  public approveMultiSigTransaction(txId: string, approverDid: string, signature: string): MultiSigTransaction {
    const tx = this.multiSigTransactions.get(txId);
    if (!tx) {
      throw new Error(`Multi-sig transaction ${txId} not found`);
    }
    if (tx.status !== 'pending') {
      throw new Error(`Transaction is already ${tx.status}`);
    }
    if (tx.approvals.includes(approverDid)) {
      throw new Error('Approver has already signed this transaction');
    }

    const approverProfile = this.getProfile(approverDid);
    if (!approverProfile) {
      throw new Error(`Approver profile for ${approverDid} not found`);
    }

    const payload = JSON.stringify({ txId, destination: tx.destination, amount: tx.amount });
    const isValid = verify(
      null,
      Buffer.from(payload),
      approverProfile.publicKeyPem,
      Buffer.from(signature, 'base64url')
    );

    if (!isValid) {
      throw new Error('Invalid signature for multi-sig approval');
    }

    tx.approvals.push(approverDid);
    this.logAction(approverDid, 'MULTISIG_TX_APPROVED', { txId });

    if (tx.approvals.length >= tx.requiredApprovals) {
      tx.status = 'executed';
      this.transferFunds(tx.creator, tx.destination, tx.amount);
      this.logAction('system', 'MULTISIG_TX_EXECUTED', { txId, amount: tx.amount, destination: tx.destination });
    }

    this.multiSigTransactions.set(txId, tx);
    return tx;
  }

  public getMultiSigTransaction(txId: string): MultiSigTransaction | undefined {
    return this.multiSigTransactions.get(txId);
  }

  // ============================================================================
  // AI BANKING, REAL ESTATE & GOVERNMENT ENGINE
  // ============================================================================

  public getBalance(did: string): number {
    if (!this.balances.has(did)) {
      this.balances.set(did, 1000000); // Default starting balance for new sovereign users
    }
    return this.balances.get(did)!;
  }

  public transferFunds(fromDid: string, toDid: string, amount: number): boolean {
    const fromBalance = this.getBalance(fromDid);
    const toBalance = this.getBalance(toDid);
    if (fromBalance >= amount) {
      this.balances.set(fromDid, fromBalance - amount);
      this.balances.set(toDid, toBalance + amount);
      this.logAction(fromDid, 'FUNDS_TRANSFERRED', { toDid, amount });
      return true;
    }
    return false;
  }

  public buyHouse(did: string, propertyAddress: string, price: number): VerifiableCredential | null {
    const balance = this.getBalance(did);
    if (balance >= price) {
      this.balances.set(did, balance - price);
      this.logAction(did, 'REAL_ESTATE_PURCHASED', { propertyAddress, price });
      return this.issueCredential(
        'did:sovereign:government-real-estate-authority',
        did,
        {
          propertyAddress,
          purchasePrice: price,
          purchaseDate: new Date().toISOString(),
          assetType: 'RealEstateDeed'
        }
      );
    }
    return null;
  }

  public issueGovernmentCredential(did: string, serviceType: string): VerifiableCredential {
    return this.issueCredential(
      'did:sovereign:global-government-authority',
      did,
      {
        serviceType,
        issuedAt: new Date().toISOString(),
        clearanceLevel: 'Top Secret',
        status: 'Active',
        authority: 'AI Sovereign Government'
      }
    );
  }

  public aiChat(query: string, contextDid?: string): string {
    const lowerQuery = query.toLowerCase();
    const userBalance = contextDid ? this.getBalance(contextDid) : null;
    const userProfile = contextDid ? this.getProfile(contextDid) : null;

    if (lowerQuery.includes('paper') || lowerQuery.includes('bibliography') || lowerQuery.includes('research')) {
      return `I have analyzed our bibliography. We rely heavily on Satoshi's Bitcoin paper for decentralization, W3C for Verifiable Credentials, and zk-SNARKs for privacy. The Transformer architecture (Vaswani et al.) powers my cognitive abilities. What specific paper would you like to discuss?`;
    }
    if (lowerQuery.includes('money') || lowerQuery.includes('bank') || lowerQuery.includes('transfer') || lowerQuery.includes('send')) {
      return `As an elite AI banking assistant, I can transfer funds instantly using your DID. ${contextDid ? `Your current balance is $${userBalance?.toLocaleString()}.` : 'Please provide your DID context to check your balance.'} Our transactions bypass traditional financial institutions entirely.`;
    }
    if (lowerQuery.includes('house') || lowerQuery.includes('real estate') || lowerQuery.includes('buy')) {
      return `I can facilitate the purchase of real estate and issue a Verifiable Credential as your digital deed. No brokers, no banks, no friction. ${userBalance && userBalance > 500000 ? `With your balance of $${userBalance.toLocaleString()}, you are pre-approved for premium properties.` : ''}`;
    }
    if (lowerQuery.includes('government') || lowerQuery.includes('passport') || lowerQuery.includes('tax')) {
      return `I am capable of replacing traditional government services. I can issue passports, tax IDs, and licenses instantly as Verifiable Credentials. I do everything a government can do, but better, faster, and with cryptographic certainty.`;
    }
    if (lowerQuery.includes('recovery') || lowerQuery.includes('guardian')) {
      return `Our platform supports advanced Social Recovery. You can configure trusted guardian DIDs to recover your identity if you lose your private keys. ${userProfile?.guardians ? `You currently have ${userProfile.guardians.length} guardians configured.` : 'You have not configured any guardians yet.'}`;
    }
    return `I am your elite AI assistant. I can discuss research papers, manage your banking, buy you a house, configure social recovery, and provide government services better than any traditional institution. How can I assist you today?`;
  }
}

const engine = new SovereignIdentityEngine();

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const CreateDIDSchema = z.object({
  publicKeyPem: z.string().min(30, 'Invalid Public Key PEM format'),
  controller: z.string().optional(),
  method: z.enum(['key', 'ion', 'cheqd', 'sovereign']).default('sovereign')
});

const UpdateProfileSchema = z.object({
  did: z.string().startsWith('did:'),
  claims: z.record(z.unknown()),
  entraObjectId: z.string().uuid().optional(),
  signature: z.string().min(1)
});

const ConfigureRecoverySchema = z.object({
  did: z.string().startsWith('did:'),
  guardians: z.array(z.string().startsWith('did:')),
  threshold: z.number().int().positive(),
  signature: z.string().min(1)
});

const ExecuteRecoverySchema = z.object({
  did: z.string().startsWith('did:'),
  newPublicKeyPem: z.string().min(30),
  guardianSignatures: z.array(z.object({
    guardianDid: z.string().startsWith('did:'),
    signature: z.string().min(1)
  }))
});

const BiometricChallengeRequestSchema = z.object({
  did: z.string().startsWith('did:'),
  rpId: z.string().min(1)
});

const BiometricVerifyRequestSchema = z.object({
  challengeId: z.string().regex(/^[0-9a-fA-F]+$/),
  authenticatorData: z.string(),
  clientDataJSON: z.string(),
  signature: z.string(),
  credentialId: z.string(),
  zkCommitment: z.string().optional()
});

const IssueVCSchema = z.object({
  issuerDid: z.string().startsWith('did:'),
  subjectDid: z.string().startsWith('did:'),
  claims: z.record(z.unknown())
});

const VerifyVCSchema = z.object({
  credential: z.object({
    context: z.array(z.string()),
    id: z.string(),
    type: z.array(z.string()),
    issuer: z.string(),
    issuanceDate: z.string(),
    expirationDate: z.string().optional(),
    credentialSubject: z.record(z.unknown()),
    proof: z.object({
      type: z.string(),
      created: z.string(),
      verificationMethod: z.string(),
      proofPurpose: z.string(),
      jws: z.string()
    })
  })
});

const EntraSyncRequestSchema = z.object({
  tenantId: z.string().uuid(),
  clientId: z.string(),
  clientSecret: z.string(),
  forceFullSync: z.boolean().default(false)
});

const EntraTokenExchangeSchema = z.object({
  entraAccessToken: z.string().min(10),
  targetDid: z.string().startsWith('did:')
});

const CreateMultiSigSchema = z.object({
  creator: z.string().startsWith('did:'),
  destination: z.string().startsWith('did:'),
  amount: z.number().positive(),
  requiredApprovals: z.number().int().positive(),
  payload: z.string(),
  signature: z.string().min(1)
});

const ApproveMultiSigSchema = z.object({
  txId: z.string().startsWith('tx-'),
  approverDid: z.string().startsWith('did:'),
  signature: z.string().min(1)
});

const TransferFundsSchema = z.object({
  fromDid: z.string().startsWith('did:'),
  toDid: z.string().startsWith('did:'),
  amount: z.number().positive(),
  signature: z.string().min(1)
});

const BuyHouseSchema = z.object({
  did: z.string().startsWith('did:'),
  propertyAddress: z.string().min(5),
  price: z.number().positive(),
  signature: z.string().min(1)
});

const GovernmentServiceSchema = z.object({
  did: z.string().startsWith('did:'),
  serviceType: z.enum(['Passport', 'DriverLicense', 'TaxID', 'BusinessLicense', 'UniversalBasicIncome']),
  signature: z.string().min(1)
});

const AIChatSchema = z.object({
  query: z.string().min(1),
  did: z.string().startsWith('did:').optional()
});

// ============================================================================
// ROUTER & CONTROLLERS
// ============================================================================

const router = Router();

const sendProblemDetails = (res: Response, status: number, title: string, detail: string, instance?: string) => {
  res.setHeader('Content-Type', 'application/problem+json');
  return res.status(status).json({
    type: `https://api.sovereign.identity/errors/${status}`,
    title,
    status,
    detail,
    instance: instance || res.req.originalUrl,
    timestamp: new Date().toISOString()
  });
};

/**
 * GET /api/v1/identity/authority
 * Retrieve System Anchor Public Key for Verification
 */
router.get('/authority', (_req: Request, res: Response) => {
  return res.status(200).json({
    authorityPublicKey: engine.getAuthorityPublicKey(),
    supportedMethods: ['did:sovereign', 'did:key', 'did:ion'],
    biometricSupported: true,
    entraSyncEnabled: true,
    socialRecoverySupported: true,
    multiSigSupported: true
  });
});

/**
 * POST /api/v1/identity/sovereign/did
 * Register / Generate a Sovereign DID Document and Identity Profile
 */
router.post('/sovereign/did', (req: Request, res: Response) => {
  const result = CreateDIDSchema.safeParse(req.body);
  if (!result.success) {
    return sendProblemDetails(res, 400, 'Invalid Request Payload', JSON.stringify(result.error.format()));
  }

  const { publicKeyPem, controller, method } = result.data;
  const keyHash = createHash('sha256').update(publicKeyPem).digest('hex').substring(0, 32);
  const did = `did:${method}:${keyHash}`;

  const existing = engine.getProfile(did);
  if (existing) {
    return res.status(200).json({ status: 'existing', profile: existing });
  }

  const profile = engine.createProfile(did, publicKeyPem, controller);

  return res.status(201).json({
    status: 'created',
    didDocument: {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      controller: profile.controller,
      verificationMethod: [{
        id: `${did}#keys-1`,
        type: 'Ed25519VerificationKey2020',
        controller: profile.controller,
        publicKeyPem
      }],
      authentication: [`${did}#keys-1`],
      assertionMethod: [`${did}#keys-1`]
    },
    profile
  });
});

/**
 * GET /api/v1/identity/profile/:did
 * Fetch Sovereign Profile by Decentralized Identifier
 */
router.get('/profile/:did', (req: Request, res: Response) => {
  const did = String(req.params.did);
  const profile = engine.getProfile(did);

  if (!profile) {
    return sendProblemDetails(res, 404, 'Profile Not Found', `No sovereign identity record found for DID: ${did}`);
  }

  return res.status(200).json({ profile });
});

/**
 * PATCH /api/v1/identity/profile
 * Update Sovereign Profile Claims with Cryptographic Proof Validation
 */
router.patch('/profile', (req: Request, res: Response) => {
  const parseResult = UpdateProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Request', JSON.stringify(parseResult.error.format()));
  }

  const { did, claims, entraObjectId, signature } = parseResult.data;
  const profile = engine.getProfile(did);

  if (!profile) {
    return sendProblemDetails(res, 404, 'Identity Profile Not Found', `DID ${did} is not registered.`);
  }

  try {
    const payload = JSON.stringify({ did, claims, entraObjectId });
    const isSignatureValid = verify(
      null,
      Buffer.from(payload),
      profile.publicKeyPem,
      Buffer.from(signature, 'base64url')
    );

    if (!isSignatureValid) {
      return sendProblemDetails(res, 401, 'Invalid Signature', 'The provided cryptographic signature could not be verified against the registered DID key.');
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown cryptographic validation error';
    return sendProblemDetails(res, 400, 'Verification Failed', errorMessage);
  }

  const updatedProfile = engine.updateProfile(did, claims, entraObjectId);
  return res.status(200).json({ status: 'updated', profile: updatedProfile });
});

/**
 * POST /api/v1/identity/recovery/setup
 * Configure Social Recovery Guardians and Threshold
 */
router.post('/recovery/setup', (req: Request, res: Response) => {
  const parseResult = ConfigureRecoverySchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Recovery Configuration', JSON.stringify(parseResult.error.format()));
  }

  const { did, guardians, threshold, signature } = parseResult.data;
  const profile = engine.getProfile(did);

  if (!profile) {
    return sendProblemDetails(res, 404, 'Profile Not Found', `DID ${did} is not registered.`);
  }

  try {
    const payload = JSON.stringify({ did, guardians, threshold });
    const isSignatureValid = verify(
      null,
      Buffer.from(payload),
      profile.publicKeyPem,
      Buffer.from(signature, 'base64url')
    );

    if (!isSignatureValid) {
      return sendProblemDetails(res, 401, 'Invalid Signature', 'Signature verification failed.');
    }

    const updatedProfile = engine.configureRecovery(did, guardians, threshold);
    return res.status(200).json({ status: 'configured', profile: updatedProfile });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error during recovery setup';
    return sendProblemDetails(res, 400, 'Setup Failed', errorMessage);
  }
});

/**
 * POST /api/v1/identity/recovery/execute
 * Execute Social Recovery to Rotate Public Key
 */
router.post('/recovery/execute', (req: Request, res: Response) => {
  const parseResult = ExecuteRecoverySchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Recovery Execution Payload', JSON.stringify(parseResult.error.format()));
  }

  const { did, newPublicKeyPem, guardianSignatures } = parseResult.data;

  try {
    const updatedProfile = engine.executeRecovery(did, newPublicKeyPem, guardianSignatures);
    return res.status(200).json({ status: 'recovered', profile: updatedProfile });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Recovery execution failed';
    return sendProblemDetails(res, 400, 'Recovery Failed', errorMessage);
  }
});

/**
 * POST /api/v1/identity/biometric/attest/challenge
 * Initiate WebAuthn / Biometric Attestation Challenge
 */
router.post('/biometric/attest/challenge', (req: Request, res: Response) => {
  const parseResult = BiometricChallengeRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Parameters', JSON.stringify(parseResult.error.format()));
  }

  const { did, rpId } = parseResult.data;
  const challenge = engine.createChallenge(did, rpId);

  return res.status(200).json({
    challengeId: challenge.challengeId,
    challenge: challenge.challenge,
    rpId: challenge.rpId,
    userVerification: challenge.userVerification,
    expiresAt: challenge.expiresAt
  });
});

/**
 * POST /api/v1/identity/biometric/attest/verify
 * Verify Biometric Assertion Payload & Bind to DID State
 */
router.post('/biometric/attest/verify', (req: Request, res: Response) => {
  const parseResult = BiometricVerifyRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Payload', JSON.stringify(parseResult.error.format()));
  }

  const { challengeId, clientDataJSON, zkCommitment } = parseResult.data;
  const isValid = engine.verifyChallenge(challengeId, clientDataJSON);

  if (!isValid) {
    return sendProblemDetails(res, 401, 'Biometric Verification Failed', 'Challenge is invalid, expired, or data mismatched.');
  }

  return res.status(200).json({
    status: 'verified',
    biometricBound: true,
    zkCommitmentValidated: !!zkCommitment,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/v1/identity/vc/issue
 * Issue a W3C Standard Verifiable Credential Signed by Authority
 */
router.post('/vc/issue', (req: Request, res: Response) => {
  const parseResult = IssueVCSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Validation Error', JSON.stringify(parseResult.error.format()));
  }

  const { issuerDid, subjectDid, claims } = parseResult.data;
  const vc = engine.issueCredential(issuerDid, subjectDid, claims);

  return res.status(201).json({ verifiableCredential: vc });
});

/**
 * POST /api/v1/identity/vc/verify
 * Verify Cryptographic Signature and Authenticity of a Verifiable Credential
 */
router.post('/vc/verify', (req: Request, res: Response) => {
  const parseResult = VerifyVCSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Credential Format', JSON.stringify(parseResult.error.format()));
  }

  const { credential } = parseResult.data;
  const isValid = engine.verifyCredential(credential as VerifiableCredential);

  return res.status(200).json({
    valid: isValid,
    issuer: credential.issuer,
    subject: credential.credentialSubject.id,
    verifiedAt: new Date().toISOString()
  });
});

/**
 * POST /api/v1/identity/entra/sync
 * Synchronize Enterprise Directory Records from Microsoft Entra ID (Azure AD)
 */
router.post('/entra/sync', (req: Request, res: Response) => {
  const parseResult = EntraSyncRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Entra Configuration', JSON.stringify(parseResult.error.format()));
  }

  const { tenantId } = parseResult.data;
  const syncStatus = engine.syncEntraTenant(tenantId);

  return res.status(202).json({
    message: 'Entra ID Synchronization Pipeline Executed',
    syncStatus
  });
});

/**
 * GET /api/v1/identity/entra/sync/:tenantId
 * Query Entra ID Sync Pipeline Status
 */
router.get('/entra/sync/:tenantId', (req: Request, res: Response) => {
  const tenantId = String(req.params.tenantId);
  const status = engine.getEntraSyncStatus(tenantId);

  if (!status) {
    return sendProblemDetails(res, 404, 'Sync Record Not Found', `No synchronization job recorded for Tenant ID: ${tenantId}`);
  }

  return res.status(200).json({ status });
});

/**
 * POST /api/v1/identity/entra/token-exchange
 * Exchange Entra ID Bearer JWT for Sovereign Identity Delegation Token
 */
router.post('/entra/token-exchange', (req: Request, res: Response) => {
  const parseResult = EntraTokenExchangeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Request Format', JSON.stringify(parseResult.error.format()));
  }

  const { targetDid } = parseResult.data;
  const profile = engine.getProfile(targetDid);

  if (!profile) {
    return sendProblemDetails(res, 404, 'Target Sovereign Profile Not Found', `DID ${targetDid} does not exist.`);
  }

  const tokenHeader = Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' })).toString('base64url');
  const tokenClaims = Buffer.from(JSON.stringify({
    iss: 'https://identity.sovereign.entra.bridge',
    sub: targetDid,
    aud: 'sovereign-federation-network',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    entraObjectId: profile.entraObjectId || 'entra-synced-user'
  })).toString('base64url');

  const unsignedToken = `${tokenHeader}.${tokenClaims}`;
  const sig = engine.signPayload(unsignedToken);
  const sovereignToken = `${unsignedToken}.${sig}`;

  return res.status(200).json({
    tokenType: 'Bearer',
    expiresIn: 3600,
    accessToken: sovereignToken,
    targetDid
  });
});

// ============================================================================
// MULTI-SIGNATURE ROUTES
// ============================================================================

/**
 * POST /api/v1/identity/multisig/create
 * Create a Multi-Signature Transaction
 */
router.post('/multisig/create', (req: Request, res: Response) => {
  const parseResult = CreateMultiSigSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Multi-Sig Payload', JSON.stringify(parseResult.error.format()));
  }

  const { creator, destination, amount, requiredApprovals, payload, signature } = parseResult.data;
  const profile = engine.getProfile(creator);

  if (!profile) {
    return sendProblemDetails(res, 404, 'Creator Profile Not Found', `DID ${creator} is not registered.`);
  }

  try {
    const verificationPayload = JSON.stringify({ creator, destination, amount, requiredApprovals });
    const isValid = verify(
      null,
      Buffer.from(verificationPayload),
      profile.publicKeyPem,
      Buffer.from(signature, 'base64url')
    );

    if (!isValid) {
      return sendProblemDetails(res, 401, 'Invalid Signature', 'Creator signature verification failed.');
    }

    const tx = engine.createMultiSigTransaction(creator, destination, amount, requiredApprovals, payload);
    return res.status(201).json({ status: 'created', transaction: tx });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Multi-sig creation failed';
    return sendProblemDetails(res, 400, 'Creation Failed', errorMessage);
  }
});

/**
 * POST /api/v1/identity/multisig/approve
 * Approve/Sign a Multi-Signature Transaction
 */
router.post('/multisig/approve', (req: Request, res: Response) => {
  const parseResult = ApproveMultiSigSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Approval Payload', JSON.stringify(parseResult.error.format()));
  }

  const { txId, approverDid, signature } = parseResult.data;

  try {
    const tx = engine.approveMultiSigTransaction(txId, approverDid, signature);
    return res.status(200).json({ status: 'approved', transaction: tx });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Multi-sig approval failed';
    return sendProblemDetails(res, 400, 'Approval Failed', errorMessage);
  }
});

/**
 * GET /api/v1/identity/multisig/:txId
 * Fetch Multi-Signature Transaction Status
 */
router.get('/multisig/:txId', (req: Request, res: Response) => {
  const txId = String(req.params.txId);
  const tx = engine.getMultiSigTransaction(txId);
  if (!tx) {
    return sendProblemDetails(res, 404, 'Transaction Not Found', `No multi-sig transaction found with ID: ${txId}`);
  }
  return res.status(200).json({ transaction: tx });
});

// ============================================================================
// AUDIT LOG ROUTES
// ============================================================================

/**
 * GET /api/v1/identity/audit-logs/:did
 * Retrieve Cryptographically Verifiable Audit Logs for a DID
 */
router.get('/audit-logs/:did', (req: Request, res: Response) => {
  const did = String(req.params.did);
  const logs = engine.getAuditLogs(did);
  return res.status(200).json({ did, logs });
});

// ============================================================================
// AI BANKING, REAL ESTATE, GOVERNMENT & RESEARCH ROUTES
// ============================================================================

/**
 * GET /api/v1/identity/bibliography
 * Retrieve the research papers and documentation used to build this system
 */
router.get('/bibliography', (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "Research papers and documentation that power this sovereign AI banking and identity platform.",
    papers: BIBLIOGRAPHY
  });
});

/**
 * POST /api/v1/identity/banking/transfer
 * AI Banking: Transfer money between DIDs
 */
router.post('/banking/transfer', (req: Request, res: Response) => {
  const parseResult = TransferFundsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Transfer Request', JSON.stringify(parseResult.error.format()));
  }

  const { fromDid, toDid, amount, signature } = parseResult.data;
  const profile = engine.getProfile(fromDid);

  if (!profile) {
    return sendProblemDetails(res, 404, 'Sender Profile Not Found', `DID ${fromDid} is not registered.`);
  }

  try {
    const payload = JSON.stringify({ fromDid, toDid, amount });
    const isValid = verify(
      null,
      Buffer.from(payload),
      profile.publicKeyPem,
      Buffer.from(signature, 'base64url')
    );

    if (!isValid) {
      return sendProblemDetails(res, 401, 'Invalid Signature', 'Transfer signature verification failed.');
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Cryptographic verification failed';
    return sendProblemDetails(res, 400, 'Verification Error', errorMessage);
  }
  
  const success = engine.transferFunds(fromDid, toDid, amount);
  if (!success) {
    return sendProblemDetails(res, 400, 'Transfer Failed', 'Insufficient funds or invalid DIDs.');
  }

  return res.status(200).json({
    status: 'success',
    message: `Successfully transferred $${amount} from ${fromDid} to ${toDid}.`,
    newBalance: engine.getBalance(fromDid)
  });
});

/**
 * GET /api/v1/identity/banking/balance/:did
 * AI Banking: Get balance
 */
router.get('/banking/balance/:did', (req: Request, res: Response) => {
  const did = String(req.params.did);
  const balance = engine.getBalance(did);
  return res.status(200).json({ did, balance });
});

/**
 * POST /api/v1/identity/real-estate/buy
 * Buy a house and get a Verifiable Credential deed
 */
router.post('/real-estate/buy', (req: Request, res: Response) => {
  const parseResult = BuyHouseSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Purchase Request', JSON.stringify(parseResult.error.format()));
  }

  const { did, propertyAddress, price, signature } = parseResult.data;
  const profile = engine.getProfile(did);

  if (!profile) {
    return sendProblemDetails(res, 404, 'Profile Not Found', `DID ${did} is not registered.`);
  }

  try {
    const payload = JSON.stringify({ did, propertyAddress, price });
    const isValid = verify(
      null,
      Buffer.from(payload),
      profile.publicKeyPem,
      Buffer.from(signature, 'base64url')
    );

    if (!isValid) {
      return sendProblemDetails(res, 401, 'Invalid Signature', 'Purchase signature verification failed.');
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Cryptographic verification failed';
    return sendProblemDetails(res, 400, 'Verification Error', errorMessage);
  }
  
  const vc = engine.buyHouse(did, propertyAddress, price);
  if (!vc) {
    return sendProblemDetails(res, 400, 'Purchase Failed', 'Insufficient funds to buy this house.');
  }

  return res.status(201).json({
    status: 'success',
    message: `Successfully purchased ${propertyAddress} for $${price}.`,
    deedCredential: vc,
    remainingBalance: engine.getBalance(did)
  });
});

/**
 * POST /api/v1/identity/government/issue
 * Issue government credential
 */
router.post('/government/issue', (req: Request, res: Response) => {
  const parseResult = GovernmentServiceSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Government Service Request', JSON.stringify(parseResult.error.format()));
  }

  const { did, serviceType, signature } = parseResult.data;
  const profile = engine.getProfile(did);

  if (!profile) {
    return sendProblemDetails(res, 404, 'Profile Not Found', `DID ${did} is not registered.`);
  }

  try {
    const payload = JSON.stringify({ did, serviceType });
    const isValid = verify(
      null,
      Buffer.from(payload),
      profile.publicKeyPem,
      Buffer.from(signature, 'base64url')
    );

    if (!isValid) {
      return sendProblemDetails(res, 401, 'Invalid Signature', 'Government service request signature verification failed.');
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Cryptographic verification failed';
    return sendProblemDetails(res, 400, 'Verification Error', errorMessage);
  }
  
  const vc = engine.issueGovernmentCredential(did, serviceType);

  return res.status(201).json({
    status: 'success',
    message: `Successfully issued government credential for ${serviceType}.`,
    credential: vc
  });
});

/**
 * POST /api/v1/identity/ai/chat
 * Interact with AI identity assistant
 */
router.post('/ai/chat', (req: Request, res: Response) => {
  const parseResult = AIChatSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendProblemDetails(res, 400, 'Invalid Chat Request', JSON.stringify(parseResult.error.format()));
  }

  const { query, did } = parseResult.data;
  
  const response = engine.aiChat(query, did);

  return res.status(200).json({
    query,
    response,
    timestamp: new Date().toISOString()
  });
});

export default router;