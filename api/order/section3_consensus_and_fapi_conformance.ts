import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { Router, Request, Response } from 'express';

// ============================================================================
// SHARED CRYPTOGRAPHIC & JWT UTILITIES
// ============================================================================

export class CryptoUtils {
  static base64UrlEncode(str: string | Buffer): string {
    const buf = Buffer.isBuffer(str) ? str : Buffer.from(str);
    return buf.toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  static base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  static generateRSAKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return { publicKey, privateKey };
  }

  static signJwt(payload: object, privateKeyPem: string, headers: object = {}): string {
    const header = { alg: 'RS256', typ: 'JWT', ...headers };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signatureInput);
    const signature = signer.sign(privateKeyPem, 'base64');
    const encodedSignature = this.base64UrlEncode(Buffer.from(signature, 'base64'));
    
    return `${signatureInput}.${encodedSignature}`;
  }

  static verifyJwt(jwt: string, publicKeyPem: string): { header: any; payload: any; valid: boolean } {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(signatureInput);
      
      const signatureBuf = Buffer.from(encodedSignature.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
      const valid = verifier.verify(publicKeyPem, signatureBuf);
      
      const header = JSON.parse(this.base64UrlDecode(encodedHeader));
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
      
      return { header, payload, valid };
    } catch (err) {
      return { header: null, payload: null, valid: false };
    }
  }

  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

// ============================================================================
// APP 1: REAL-TIME VALUE ATTESTATION CALLBACK
// ============================================================================

export interface AttestationPayload {
  assetId: string;
  value: number;
  currency: string;
  timestamp: number;
  attestorId: string;
}

export interface AttestationCallbackConfig {
  endpointUrl: string;
  secretToken: string;
  minThreshold: number;
}

export class ValueAttestationCallback {
  private config: AttestationCallbackConfig;
  private privateKey: string;
  public publicKey: string;

  constructor(config: AttestationCallbackConfig) {
    this.config = config;
    const keys = CryptoUtils.generateRSAKeyPair();
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
  }

  public processAttestation(payload: AttestationPayload): { success: boolean; callbackPayload?: string; error?: string } {
    if (payload.value < this.config.minThreshold) {
      return { success: false, error: `Value ${payload.value} is below the minimum threshold of ${this.config.minThreshold}` };
    }

    const callbackData = {
      ...payload,
      verifiedAt: Date.now(),
      status: 'VERIFIED',
      nonce: crypto.randomBytes(16).toString('hex')
    };

    // Sign the callback payload to ensure authenticity
    const signedJwt = CryptoUtils.signJwt(callbackData, this.privateKey, { kid: 'attestation-key-1' });

    return {
      success: true,
      callbackPayload: signedJwt
    };
  }

  public verifyCallbackPayload(jwt: string): { valid: boolean; payload?: any } {
    const result = CryptoUtils.verifyJwt(jwt, this.publicKey);
    if (result.valid) {
      return { valid: true, payload: result.payload };
    }
    return { valid: false };
  }
}

// ============================================================================
// APP 2: 57-HOUR INSCRIPTION SCHEDULER
// ============================================================================

export interface InscriptionTask {
  id: string;
  data: string;
  scheduledTime: Date;
  executed: boolean;
  cancelled: boolean;
}

export class InscriptionScheduler extends EventEmitter {
  private tasks: Map<string, InscriptionTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  public static readonly DELAY_HOURS = 57;
  public static readonly DELAY_MS = InscriptionScheduler.DELAY_HOURS * 60 * 60 * 1000;

  constructor() {
    super();
  }

  public schedule(data: string): string {
    const id = crypto.randomBytes(16).toString('hex');
    const scheduledTime = new Date(Date.now() + InscriptionScheduler.DELAY_MS);

    const task: InscriptionTask = {
      id,
      data,
      scheduledTime,
      executed: false,
      cancelled: false
    };

    this.tasks.set(id, task);

    // Set a real timer (for demonstration, we also allow manual triggering in tests)
    const timer = setTimeout(() => {
      this.executeTask(id);
    }, InscriptionScheduler.DELAY_MS);

    this.timers.set(id, timer);
    this.emit('scheduled', task);
    return id;
  }

  public cancel(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task || task.executed || task.cancelled) {
      return false;
    }

    task.cancelled = true;
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.emit('cancelled', task);
    return true;
  }

  public executeTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task || task.executed || task.cancelled) {
      return false;
    }

    task.executed = true;
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.emit('executed', task);
    return true;
  }

  public getTask(id: string): InscriptionTask | undefined {
    return this.tasks.get(id);
  }

  public listPending(): InscriptionTask[] {
    return Array.from(this.tasks.values()).filter(t => !t.executed && !t.cancelled);
  }
}

// ============================================================================
// APP 3: FAPI CONFORMANCE WALL VALIDATOR
// ============================================================================

export interface FAPIRequest {
  headers: Record<string, string>;
  method: string;
  url: string;
  body?: any;
  tlsCipher?: string;
  clientCertPresented?: boolean;
}

export interface ConformanceReport {
  compliant: boolean;
  errors: string[];
  warnings: string[];
}

export class FAPIConformanceWallValidator {
  private allowedSigningAlgs = ['PS256', 'ES256'];
  private secureCiphers = [
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384'
  ];

  public validateRequest(req: FAPIRequest): ConformanceReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check x-fapi-interaction-id
    const interactionId = req.headers['x-fapi-interaction-id'];
    if (!interactionId) {
      errors.push('Missing required FAPI header: x-fapi-interaction-id');
    } else {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{10,12}$/i;
      if (!uuidRegex.test(interactionId)) {
        errors.push('x-fapi-interaction-id must be a valid UUID');
      }
    }

    // 2. Check TLS Cipher Suite
    if (req.tlsCipher && !this.secureCiphers.includes(req.tlsCipher)) {
      errors.push(`Insecure TLS cipher suite: ${req.tlsCipher}. FAPI requires strong cipher suites.`);
    }

    // 3. Check Client Certificate (mTLS) or DPoP
    const hasMTLS = req.clientCertPresented === true;
    const hasDPoP = !!req.headers['dpop'];
    if (!hasMTLS && !hasDPoP) {
      errors.push('FAPI requires sender-constraining mechanism: either mTLS or DPoP must be present');
    }

    // 4. Check Authorization Header
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      if (hasDPoP && !authHeader.startsWith('DPoP ')) {
        errors.push('Authorization header must use DPoP scheme when DPoP is presented');
      } else if (!hasDPoP && !authHeader.startsWith('Bearer ')) {
        errors.push('Authorization header must use Bearer scheme when mTLS is used');
      }
    } else {
      errors.push('Missing Authorization header');
    }

    return {
      compliant: errors.length === 0,
      errors,
      warnings
    };
  }
}

// ============================================================================
// APP 4: SENDER-CONSTRAINED TOKEN BINDER
// ============================================================================

export interface DPoPProof {
  jkt: string;
  htm: string;
  htu: string;
  iat: number;
  jti: string;
}

export class SenderConstrainedTokenBinder {
  private usedJtis: Set<string> = new Set();

  public generateDPoPProof(
    privateKeyPem: string,
    publicKeyPem: string,
    htm: string,
    htu: string
  ): string {
    const jwkThumbprint = CryptoUtils.sha256(publicKeyPem);
    const payload: DPoPProof = {
      jkt: jwkThumbprint,
      htm,
      htu,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomBytes(16).toString('hex')
    };

    return CryptoUtils.signJwt(payload, privateKeyPem, {
      typ: 'dpop+jwt',
      jwk: {
        kty: 'RSA',
        n: CryptoUtils.base64UrlEncode(publicKeyPem),
        e: 'AQAB'
      }
    });
  }

  public verifyAndBind(
    dpopProofJwt: string,
    publicKeyPem: string,
    expectedHtm: string,
    expectedHtu: string
  ): { success: boolean; tokenBindingHash?: string; error?: string } {
    const { header, payload, valid } = CryptoUtils.verifyJwt(dpopProofJwt, publicKeyPem);

    if (!valid) {
      return { success: false, error: 'Invalid cryptographic signature on DPoP proof' };
    }

    if (header.typ !== 'dpop+jwt') {
      return { success: false, error: 'Invalid typ header in DPoP proof' };
    }

    const proof = payload as DPoPProof;

    if (proof.htm !== expectedHtm) {
      return { success: false, error: `Method mismatch: expected ${expectedHtm}, got ${proof.htm}` };
    }

    if (proof.htu !== expectedHtu) {
      return { success: false, error: `URI mismatch: expected ${expectedHtu}, got ${proof.htu}` };
    }

    // Replay attack check
    if (this.usedJtis.has(proof.jti)) {
      return { success: false, error: 'Replay attack detected: JTI already used' };
    }
    this.usedJtis.add(proof.jti);

    // Expiry check (5 minutes window)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - proof.iat) > 300) {
      return { success: false, error: 'DPoP proof expired or clock skew too high' };
    }

    // Generate binding hash (jkt)
    const tokenBindingHash = CryptoUtils.sha256(publicKeyPem);

    return {
      success: true,
      tokenBindingHash
    };
  }
}

// ============================================================================
// APP 5: JARM RESPONSE MODE GENERATOR
// ============================================================================

export interface JARMResponseParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
  iss: string;
  aud: string;
}

export class JARMResponseModeGenerator {
  private privateKey: string;
  public publicKey: string;

  constructor() {
    const keys = CryptoUtils.generateRSAKeyPair();
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
  }

  public generateResponseJwt(params: JARMResponseParams): string {
    const payload = {
      ...params,
      exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes expiry
      iat: Math.floor(Date.now() / 1000)
    };

    return CryptoUtils.signJwt(payload, this.privateKey, { kid: 'jarm-signing-key' });
  }

  public constructRedirectUri(redirectUri: string, responseJwt: string): string {
    const url = new URL(redirectUri);
    url.searchParams.set('response', responseJwt);
    return url.toString();
  }
}

// ============================================================================
// APP 6: PRIVATE KEY JWT AUTHENTICATOR
// ============================================================================

export class PrivateKeyJWTAuthenticator {
  private registeredClients: Map<string, string> = new Map(); // clientId -> publicKeyPem
  private usedJtis: Set<string> = new Set();

  public registerClient(clientId: string, publicKeyPem: string): void {
    this.registeredClients.set(clientId, publicKeyPem);
  }

  public authenticate(clientAssertion: string, expectedAudience: string): { success: boolean; clientId?: string; error?: string } {
    // 1. Decode JWT without verification first to find the issuer/client_id
    const parts = clientAssertion.split('.');
    if (parts.length !== 3) {
      return { success: false, error: 'Malformed JWT' };
    }

    let payload: any;
    try {
      payload = JSON.parse(CryptoUtils.base64UrlDecode(parts[1]));
    } catch (e) {
      return { success: false, error: 'Invalid JSON payload' };
    }

    const clientId = payload.iss;
    if (!clientId || payload.sub !== clientId) {
      return { success: false, error: 'Issuer (iss) and Subject (sub) must match and contain the client_id' };
    }

    const publicKey = this.registeredClients.get(clientId);
    if (!publicKey) {
      return { success: false, error: `Client ${clientId} is not registered` };
    }

    // 2. Verify signature
    const verification = CryptoUtils.verifyJwt(clientAssertion, publicKey);
    if (!verification.valid) {
      return { success: false, error: 'Invalid cryptographic signature' };
    }

    // 3. Validate audience
    if (payload.aud !== expectedAudience) {
      return { success: false, error: `Audience mismatch: expected ${expectedAudience}, got ${payload.aud}` };
    }

    // 4. Validate expiration
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return { success: false, error: 'Assertion has expired' };
    }

    // 5. Prevent replay attacks
    if (!payload.jti) {
      return { success: false, error: 'Missing required jti claim' };
    }
    if (this.usedJtis.has(payload.jti)) {
      return { success: false, error: 'Replay attack detected: JTI already used' };
    }
    this.usedJtis.add(payload.jti);

    return {
      success: true,
      clientId
    };
  }
}

// ============================================================================
// APP 7: AETHEL SYNTAX PARSER
// ============================================================================

export type TokenType = 'IF' | 'THEN' | 'ELSE' | 'SET' | 'IDENTIFIER' | 'NUMBER' | 'STRING' | 'EQUALS' | 'GREATER' | 'LESS' | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
}

export class AethelSyntaxParser {
  private tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
      const char = input[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      if (char === '=') {
        tokens.push({ type: 'EQUALS', value: '=' });
        i++;
        continue;
      }

      if (char === '>') {
        tokens.push({ type: 'GREATER', value: '>' });
        i++;
        continue;
      }

      if (char === '<') {
        tokens.push({ type: 'LESS', value: '<' });
        i++;
        continue;
      }

      if (char === '"') {
        let str = '';
        i++;
        while (i < input.length && input[i] !== '"') {
          str += input[i];
          i++;
        }
        i++; // skip closing quote
        tokens.push({ type: 'STRING', value: str });
        continue;
      }

      if (/[0-9]/.test(char)) {
        let num = '';
        while (i < input.length && /[0-9]/.test(input[i])) {
          num += input[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: num });
        continue;
      }

      if (/[a-zA-Z_]/.test(char)) {
        let ident = '';
        while (i < input.length && /[a-zA-Z0-9_.]/.test(input[i])) {
          ident += input[i];
          i++;
        }

        if (ident === 'IF') tokens.push({ type: 'IF', value: 'IF' });
        else if (ident === 'THEN') tokens.push({ type: 'THEN', value: 'THEN' });
        else if (ident === 'ELSE') tokens.push({ type: 'ELSE', value: 'ELSE' });
        else if (ident === 'SET') tokens.push({ type: 'SET', value: 'SET' });
        else tokens.push({ type: 'IDENTIFIER', value: ident });
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    tokens.push({ type: 'EOF', value: '' });
    return tokens;
  }

  public evaluate(script: string, context: Record<string, any>): Record<string, any> {
    const tokens = this.tokenize(script);
    let current = 0;

    const peek = () => tokens[current];
    const consume = (type: TokenType) => {
      if (tokens[current].type === type) {
        return tokens[current++];
      }
      throw new Error(`Expected token ${type}, got ${tokens[current].type}`);
    };

    const localContext = { ...context };

    const parseStatement = () => {
      const token = peek();
      if (token.type === 'IF') {
        consume('IF');
        const left = consume('IDENTIFIER').value;
        const op = peek().type;
        if (op !== 'EQUALS' && op !== 'GREATER' && op !== 'LESS') {
          throw new Error(`Expected comparison operator, got ${op}`);
        }
        consume(op);
        const rightToken = peek();
        let rightValue: any;
        if (rightToken.type === 'NUMBER') {
          rightValue = Number(consume('NUMBER').value);
        } else if (rightToken.type === 'STRING') {
          rightValue = consume('STRING').value;
        } else {
          throw new Error(`Expected literal value, got ${rightToken.type}`);
        }

        // Evaluate condition
        const leftValue = left.split('.').reduce((obj, key) => obj?.[key], localContext);
        let conditionMet = false;
        if (op === 'EQUALS') conditionMet = leftValue === rightValue;
        else if (op === 'GREATER') conditionMet = leftValue > rightValue;
        else if (op === 'LESS') conditionMet = leftValue < rightValue;

        consume('THEN');
        if (conditionMet) {
          parseAction();
          if (peek().type === 'ELSE') {
            consume('ELSE');
            // Skip else action
            consume('SET');
            consume('IDENTIFIER');
            consume('EQUALS');
            if (peek().type === 'NUMBER') consume('NUMBER');
            else consume('STRING');
          }
        } else {
          // Skip then action
          consume('SET');
          consume('IDENTIFIER');
          consume('EQUALS');
          if (peek().type === 'NUMBER') consume('NUMBER');
          else consume('STRING');

          if (peek().type === 'ELSE') {
            consume('ELSE');
            parseAction();
          }
        }
      } else if (token.type === 'SET') {
        parseAction();
      }
    };

    const parseAction = () => {
      consume('SET');
      const target = consume('IDENTIFIER').value;
      consume('EQUALS');
      const valToken = peek();
      let val: any;
      if (valToken.type === 'NUMBER') {
        val = Number(consume('NUMBER').value);
      } else if (valToken.type === 'STRING') {
        val = consume('STRING').value;
      } else {
        throw new Error(`Expected value, got ${valToken.type}`);
      }
      localContext[target] = val;
    };

    while (peek().type !== 'EOF') {
      parseStatement();
    }

    return localContext;
  }
}

// ============================================================================
// APP 8: M2M SETTLEMENT NETTING ENGINE
// ============================================================================

export interface Transaction {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

export interface NetSettlement {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

export class M2MSettlementNettingEngine {
  public computeNetSettlements(transactions: Transaction[]): NetSettlement[] {
    const currencies = Array.from(new Set(transactions.map(t => t.currency)));
    const finalSettlements: NetSettlement[] = [];

    for (const currency of currencies) {
      const currencyTx = transactions.filter(t => t.currency === currency);
      const balances: Record<string, number> = {};

      // Calculate net balance for each participant
      for (const tx of currencyTx) {
        balances[tx.from] = (balances[tx.from] || 0) - tx.amount;
        balances[tx.to] = (balances[tx.to] || 0) + tx.amount;
      }

      // Separate debtors and creditors
      const debtors: { id: string; amount: number }[] = [];
      const creditors: { id: string; amount: number }[] = [];

      for (const [id, balance] of Object.entries(balances)) {
        if (balance < -0.0001) {
          debtors.push({ id, amount: -balance });
        } else if (balance > 0.0001) {
          creditors.push({ id, amount: balance });
        }
      }

      // Sort to optimize netting (greedy approach)
      debtors.sort((a, b) => b.amount - a.amount);
      creditors.sort((a, b) => b.amount - a.amount);

      let dIdx = 0;
      let cIdx = 0;

      while (dIdx < debtors.length && cIdx < creditors.length) {
        const debtor = debtors[dIdx];
        const creditor = creditors[cIdx];

        const settleAmount = Math.min(debtor.amount, creditor.amount);

        finalSettlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: parseFloat(settleAmount.toFixed(4)),
          currency
        });

        debtor.amount -= settleAmount;
        creditor.amount -= settleAmount;

        if (debtor.amount < 0.0001) dIdx++;
        if (creditor.amount < 0.0001) cIdx++;
      }
    }

    return finalSettlements;
  }
}

// ============================================================================
// APP 9: CRYPTOGRAPHIC ARBITRATION ORACLE
// ============================================================================

export interface DisputePackage {
  contractId: string;
  partyA: { id: string; signature: string; claim: string };
  partyB: { id: string; signature: string; claim: string };
  evidenceHash: string;
}

export class CryptographicArbitrationOracle {
  private privateKey: string;
  public publicKey: string;
  private registeredParties: Map<string, string> = new Map(); // partyId -> publicKey

  constructor() {
    const keys = CryptoUtils.generateRSAKeyPair();
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
  }

  public registerParty(partyId: string, publicKeyPem: string): void {
    this.registeredParties.set(partyId, publicKeyPem);
  }

  public arbitrate(dispute: DisputePackage): { success: boolean; awardJwt?: string; error?: string } {
    const keyA = this.registeredParties.get(dispute.partyA.id);
    const keyB = this.registeredParties.get(dispute.partyB.id);

    if (!keyA || !keyB) {
      return { success: false, error: 'One or both parties are not registered with the Oracle' };
    }

    // Verify Party A's signature on their claim
    const verifyA = crypto.createVerify('SHA256');
    verifyA.update(dispute.partyA.claim + dispute.evidenceHash);
    const sigABuf = Buffer.from(dispute.partyA.signature, 'base64');
    if (!verifyA.verify(keyA, sigABuf)) {
      return { success: false, error: `Invalid signature for Party A (${dispute.partyA.id})` };
    }

    // Verify Party B's signature on their claim
    const verifyB = crypto.createVerify('SHA256');
    verifyB.update(dispute.partyB.claim + dispute.evidenceHash);
    const sigBBuf = Buffer.from(dispute.partyB.signature, 'base64');
    if (!verifyB.verify(keyB, sigBBuf)) {
      return { success: false, error: `Invalid signature for Party B (${dispute.partyB.id})` };
    }

    // Simple deterministic arbitration logic for demonstration:
    // In production, this would evaluate smart contract rules or multi-sig conditions.
    const decision = dispute.partyA.claim.includes('breach') ? dispute.partyA.id : dispute.partyB.id;

    const awardPayload = {
      contractId: dispute.contractId,
      winner: decision,
      arbitrator: 'CryptographicArbitrationOracle v1.0',
      timestamp: Date.now(),
      evidenceHash: dispute.evidenceHash
    };

    const awardJwt = CryptoUtils.signJwt(awardPayload, this.privateKey, { kid: 'oracle-key-1' });

    return {
      success: true,
      awardJwt
    };
  }
}

// ============================================================================
// APP 10: WORM LOG ARCHIVER (Write-Once-Read-Many)
// ============================================================================

export interface LogEntry {
  index: number;
  timestamp: number;
  data: string;
  previousHash: string;
  hash: string;
}

export class WORMLogArchiver {
  private chain: LogEntry[] = [];

  constructor() {
    // Create Genesis Block
    this.appendGenesis();
  }

  private appendGenesis(): void {
    const index = 0;
    const timestamp = 1700000000000; // Fixed genesis timestamp
    const data = 'GENESIS_WORM_LOG';
    const previousHash = '0'.repeat(64);
    const hash = this.calculateHash(index, timestamp, data, previousHash);

    this.chain.push({ index, timestamp, data, previousHash, hash });
  }

  private calculateHash(index: number, timestamp: number, data: string, previousHash: string): string {
    return CryptoUtils.sha256(`${index}-${timestamp}-${data}-${previousHash}`);
  }

  public append(data: string): LogEntry {
    const lastBlock = this.chain[this.chain.length - 1];
    const index = lastBlock.index + 1;
    const timestamp = Date.now();
    const previousHash = lastBlock.hash;
    const hash = this.calculateHash(index, timestamp, data, previousHash);

    const newEntry: LogEntry = {
      index,
      timestamp,
      data,
      previousHash,
      hash
    };

    this.chain.push(newEntry);
    return newEntry;
  }

  public verifyIntegrity(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Verify current block hash
      const recalculatedHash = this.calculateHash(current.index, current.timestamp, current.data, current.previousHash);
      if (current.hash !== recalculatedHash) {
        return false;
      }

      // Verify link to previous block
      if (current.previousHash !== previous.hash) {
        return false;
      }
    }
    return true;
  }

  public getLogs(): LogEntry[] {
    // Return a deep copy to prevent external modification
    return JSON.parse(JSON.stringify(this.chain));
  }
}

// ============================================================================
// EXPRESS API ROUTER INTEGRATION
// ============================================================================

const router = Router();

// Singletons / Instances
const attestationService = new ValueAttestationCallback({
  endpointUrl: process.env.ATTESTATION_ENDPOINT || 'http://localhost:3000/callback',
  secretToken: process.env.ATTESTATION_SECRET || 'default-secret-token',
  minThreshold: Number(process.env.ATTESTATION_MIN_THRESHOLD) || 1000
});

const schedulerService = new InscriptionScheduler();
const fapiValidator = new FAPIConformanceWallValidator();
const tokenBinder = new SenderConstrainedTokenBinder();
const jarmGenerator = new JARMResponseModeGenerator();
const m2mAuthenticator = new PrivateKeyJWTAuthenticator();
const aethelParser = new AethelSyntaxParser();
const nettingEngine = new M2MSettlementNettingEngine();
const arbitrationOracle = new CryptographicArbitrationOracle();
const wormArchiver = new WORMLogArchiver();

// 1. Attestation Callback Routes
router.post('/attestation/process', (req: Request, res: Response) => {
  try {
    const payload: AttestationPayload = req.body;
    if (!payload || typeof payload.value !== 'number' || !payload.assetId) {
      return res.status(400).json({ success: false, error: 'Invalid attestation payload' });
    }
    const result = attestationService.processAttestation(payload);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/attestation/verify', (req: Request, res: Response) => {
  try {
    const { jwt } = req.body;
    if (!jwt) {
      return res.status(400).json({ success: false, error: 'Missing jwt parameter' });
    }
    const result = attestationService.verifyCallbackPayload(jwt);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Inscription Scheduler Routes
router.post('/scheduler/schedule', (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: 'Missing data parameter' });
    }
    const id = schedulerService.schedule(data);
    return res.json({ success: true, id });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/scheduler/cancel', (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing id parameter' });
    }
    const success = schedulerService.cancel(id);
    return res.json({ success });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/scheduler/execute', (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing id parameter' });
    }
    const success = schedulerService.executeTask(id);
    return res.json({ success });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/scheduler/pending', (req: Request, res: Response) => {
  try {
    const pending = schedulerService.listPending();
    return res.json(pending);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. FAPI Conformance Wall Validator Routes
router.post('/fapi/validate', (req: Request, res: Response) => {
  try {
    const fapiRequest: FAPIRequest = req.body;
    if (!fapiRequest || !fapiRequest.headers || !fapiRequest.method || !fapiRequest.url) {
      return res.status(400).json({ success: false, error: 'Invalid FAPI request payload' });
    }
    const report = fapiValidator.validateRequest(fapiRequest);
    return res.json(report);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Sender-Constrained Token Binder Routes
router.post('/token-binder/generate', (req: Request, res: Response) => {
  try {
    const { privateKeyPem, publicKeyPem, htm, htu } = req.body;
    if (!privateKeyPem || !publicKeyPem || !htm || !htu) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const proof = tokenBinder.generateDPoPProof(privateKeyPem, publicKeyPem, htm, htu);
    return res.json({ proof });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/token-binder/verify', (req: Request, res: Response) => {
  try {
    const { dpopProofJwt, publicKeyPem, expectedHtm, expectedHtu } = req.body;
    if (!dpopProofJwt || !publicKeyPem || !expectedHtm || !expectedHtu) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const result = tokenBinder.verifyAndBind(dpopProofJwt, publicKeyPem, expectedHtm, expectedHtu);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. JARM Response Mode Generator Routes
router.post('/jarm/generate', (req: Request, res: Response) => {
  try {
    const params: JARMResponseParams = req.body;
    if (!params || !params.iss || !params.aud) {
      return res.status(400).json({ success: false, error: 'Missing required JARM parameters' });
    }
    const jwt = jarmGenerator.generateResponseJwt(params);
    return res.json({ jwt });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/jarm/redirect', (req: Request, res: Response) => {
  try {
    const { redirectUri, responseJwt } = req.body;
    if (!redirectUri || !responseJwt) {
      return res.status(400).json({ success: false, error: 'Missing redirectUri or responseJwt' });
    }
    const redirectUrl = jarmGenerator.constructRedirectUri(redirectUri, responseJwt);
    return res.json({ redirectUrl });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Private Key JWT Authenticator Routes
router.post('/m2m-auth/register', (req: Request, res: Response) => {
  try {
    const { clientId, publicKeyPem } = req.body;
    if (!clientId || !publicKeyPem) {
      return res.status(400).json({ success: false, error: 'Missing clientId or publicKeyPem' });
    }
    m2mAuthenticator.registerClient(clientId, publicKeyPem);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/m2m-auth/authenticate', (req: Request, res: Response) => {
  try {
    const { clientAssertion, expectedAudience } = req.body;
    if (!clientAssertion || !expectedAudience) {
      return res.status(400).json({ success: false, error: 'Missing clientAssertion or expectedAudience' });
    }
    const result = m2mAuthenticator.authenticate(clientAssertion, expectedAudience);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Aethel Syntax Parser Routes
router.post('/aethel/evaluate', (req: Request, res: Response) => {
  try {
    const { script, context } = req.body;
    if (!script || !context) {
      return res.status(400).json({ success: false, error: 'Missing script or context' });
    }
    const result = aethelParser.evaluate(script, context);
    return res.json({ success: true, result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 8. M2M Settlement Netting Engine Routes
router.post('/netting/compute', (req: Request, res: Response) => {
  try {
    const { transactions } = req.body;
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ success: false, error: 'Missing or invalid transactions array' });
    }
    const result = nettingEngine.computeNetSettlements(transactions);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Cryptographic Arbitration Oracle Routes
router.post('/arbitration/register', (req: Request, res: Response) => {
  try {
    const { partyId, publicKeyPem } = req.body;
    if (!partyId || !publicKeyPem) {
      return res.status(400).json({ success: false, error: 'Missing partyId or publicKeyPem' });
    }
    arbitrationOracle.registerParty(partyId, publicKeyPem);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/arbitration/arbitrate', (req: Request, res: Response) => {
  try {
    const dispute: DisputePackage = req.body;
    if (!dispute || !dispute.contractId || !dispute.partyA || !dispute.partyB || !dispute.evidenceHash) {
      return res.status(400).json({ success: false, error: 'Invalid dispute package' });
    }
    const result = arbitrationOracle.arbitrate(dispute);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 10. WORM Log Archiver Routes
router.post('/worm/append', (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: 'Missing data parameter' });
    }
    const entry = wormArchiver.append(data);
    return res.json(entry);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/worm/verify', (req: Request, res: Response) => {
  try {
    const valid = wormArchiver.verifyIntegrity();
    return res.json({ valid });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/worm/logs', (req: Request, res: Response) => {
  try {
    const logs = wormArchiver.getLogs();
    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export { router as section3Router };
export default router;