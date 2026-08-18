import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { Router, Request, Response } from 'express';

// ============================================================================
// APP 1: SOVEREIGN ATOM INDIVISIBILITY VALIDATOR
// ============================================================================
export interface SovereignAtom {
  id: string;
  symbol: string;
  precision: number; // Number of decimals, e.g., 8 for 10^8 subunits (indivisible limit)
  systemIdentifier: string;
}

export interface AtomTransaction {
  txId: string;
  atomId: string;
  amount: string; // String representation of the decimal amount
  sender: string;
  recipient: string;
}

export class SovereignAtomIndivisibilityValidator {
  private registeredAtoms: Map<string, SovereignAtom> = new Map();

  public registerAtom(atom: SovereignAtom): void {
    if (atom.precision < 0 || !Number.isInteger(atom.precision)) {
      throw new Error(`Invalid precision: ${atom.precision}. Must be a non-negative integer.`);
    }
    this.registeredAtoms.set(atom.id, atom);
  }

  public getAtom(atomId: string): SovereignAtom | undefined {
    return this.registeredAtoms.get(atomId);
  }

  public validateTransaction(tx: AtomTransaction): { isValid: boolean; reason?: string } {
    const atom = this.registeredAtoms.get(tx.atomId);
    if (!atom) {
      return { isValid: false, reason: `Sovereign Atom with ID ${tx.atomId} is not registered.` };
    }

    const parts = tx.amount.split('.');
    if (parts.length > 2) {
      return { isValid: false, reason: 'Invalid amount format. Multiple decimal points detected.' };
    }

    if (parts.length === 2) {
      const decimals = parts[1];
      if (decimals.length > atom.precision) {
        return {
          isValid: false,
          reason: `Transaction violates indivisibility rule. Atom ${atom.symbol} supports maximum ${atom.precision} decimal places, but received ${decimals.length}.`
        };
      }
    }

    // Ensure amount is positive and non-zero
    const numericAmount = parseFloat(tx.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return { isValid: false, reason: 'Transaction amount must be a positive, non-zero value.' };
    }

    return { isValid: true };
  }
}

// ============================================================================
// APP 2: BYTECODE INSCRIPTION COMPILER
// ============================================================================
export interface InscriptionMetadata {
  author: string;
  timestamp: number;
  payloadType: string;
  payload: string;
}

export class BytecodeInscriptionCompiler {
  private static readonly MAGIC_BYTES = Buffer.from([0x53, 0x4f, 0x56, 0x49]); // "SOVI"
  private static readonly MAX_INSCRIPTION_SIZE = 1024 * 10; // 10 KB limit

  public compile(metadata: InscriptionMetadata): Buffer {
    const payloadBuffer = Buffer.from(metadata.payload, 'utf8');
    const authorBuffer = Buffer.from(metadata.author, 'utf8');
    const typeBuffer = Buffer.from(metadata.payloadType, 'utf8');

    // Layout:
    // [4 Bytes Magic] [8 Bytes Timestamp] [2 Bytes Author Len] [Author] [2 Bytes Type Len] [Type] [4 Bytes Payload Len] [Payload] [32 Bytes SHA256 Checksum]
    
    const totalSize = 4 + 8 + 2 + authorBuffer.length + 2 + typeBuffer.length + 4 + payloadBuffer.length + 32;
    if (totalSize > BytecodeInscriptionCompiler.MAX_INSCRIPTION_SIZE) {
      throw new Error(`Inscription size exceeds maximum limit of ${BytecodeInscriptionCompiler.MAX_INSCRIPTION_SIZE} bytes.`);
    }

    const buffer = Buffer.alloc(totalSize);
    let offset = 0;

    // Magic Bytes
    BytecodeInscriptionCompiler.MAGIC_BYTES.copy(buffer, offset);
    offset += 4;

    // Timestamp
    buffer.writeBigInt64BE(BigInt(metadata.timestamp), offset);
    offset += 8;

    // Author Length & Author
    buffer.writeUInt16BE(authorBuffer.length, offset);
    offset += 2;
    authorBuffer.copy(buffer, offset);
    offset += authorBuffer.length;

    // Type Length & Type
    buffer.writeUInt16BE(typeBuffer.length, offset);
    offset += 2;
    typeBuffer.copy(buffer, offset);
    offset += typeBuffer.length;

    // Payload Length & Payload
    buffer.writeUInt32BE(payloadBuffer.length, offset);
    offset += 4;
    payloadBuffer.copy(buffer, offset);
    offset += payloadBuffer.length;

    // Calculate Checksum of everything written so far
    const dataToHash = buffer.subarray(0, offset);
    const hash = crypto.createHash('sha256').update(dataToHash).digest();
    hash.copy(buffer, offset);

    return buffer;
  }

  public decompile(compiledBuffer: Buffer): InscriptionMetadata {
    let offset = 0;

    // Verify Magic Bytes
    const magic = compiledBuffer.subarray(offset, offset + 4);
    if (!magic.equals(BytecodeInscriptionCompiler.MAGIC_BYTES)) {
      throw new Error('Invalid bytecode: Magic bytes mismatch.');
    }
    offset += 4;

    // Timestamp
    const timestamp = Number(compiledBuffer.readBigInt64BE(offset));
    offset += 8;

    // Author
    const authorLen = compiledBuffer.readUInt16BE(offset);
    offset += 2;
    const author = compiledBuffer.subarray(offset, offset + authorLen).toString('utf8');
    offset += authorLen;

    // Type
    const typeLen = compiledBuffer.readUInt16BE(offset);
    offset += 2;
    const payloadType = compiledBuffer.subarray(offset, offset + typeLen).toString('utf8');
    offset += typeLen;

    // Payload
    const payloadLen = compiledBuffer.readUInt32BE(offset);
    offset += 4;
    const payload = compiledBuffer.subarray(offset, offset + payloadLen).toString('utf8');
    offset += payloadLen;

    // Verify Checksum
    const calculatedHash = crypto.createHash('sha256').update(compiledBuffer.subarray(0, offset)).digest();
    const storedHash = compiledBuffer.subarray(offset, offset + 32);

    if (!calculatedHash.equals(storedHash)) {
      throw new Error('Invalid bytecode: Checksum verification failed.');
    }

    return { author, timestamp, payloadType, payload };
  }
}

// ============================================================================
// APP 3: mTLS 1.3 CIPHER SUITE ENFORCER
// ============================================================================
export interface ConnectionConfig {
  tlsVersion: string;
  cipherSuite: string;
  clientCertPresent: boolean;
  clientCertValid: boolean;
}

export class MtlsCipherSuiteEnforcer {
  private static readonly APPROVED_CIPHERS = new Set([
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256'
  ]);

  public validateConnection(config: ConnectionConfig): { secure: boolean; error?: string } {
    if (config.tlsVersion !== 'TLSv1.3') {
      return { secure: false, error: `Insecure TLS Version: ${config.tlsVersion}. Only TLSv1.3 is permitted.` };
    }

    if (!MtlsCipherSuiteEnforcer.APPROVED_CIPHERS.has(config.cipherSuite)) {
      return { secure: false, error: `Forbidden Cipher Suite: ${config.cipherSuite}. Must use approved TLS 1.3 suites.` };
    }

    if (!config.clientCertPresent) {
      return { secure: false, error: 'mTLS Violation: Client certificate is missing.' };
    }

    if (!config.clientCertValid) {
      return { secure: false, error: 'mTLS Violation: Client certificate is invalid or untrusted.' };
    }

    return { secure: true };
  }
}

// ============================================================================
// APP 4: FAPI CORE SECURITY PROFILE
// ============================================================================
export interface FapiRequest {
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  method: string;
  body?: any;
}

export class FapiCoreSecurityProfile {
  public validateRequest(req: FapiRequest): { compliant: boolean; violations: string[] } {
    const violations: string[] = [];

    // 1. Check for Authorization Header
    if (!req.headers['authorization']) {
      violations.push('Missing Authorization header.');
    }

    // 2. Check for FAPI Interaction ID
    if (!req.headers['x-fapi-interaction-id']) {
      violations.push('Missing required FAPI Interaction ID (x-fapi-interaction-id).');
    } else {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.headers['x-fapi-interaction-id'])) {
        violations.push('FAPI Interaction ID must be a valid UUID.');
      }
    }

    // 3. Enforce DPoP or Mutual TLS Client Certificate Bound Access Tokens
    if (!req.headers['dpop'] && !req.headers['x-ssl-client-cert']) {
      violations.push('FAPI requires sender-constraining mechanisms (either DPoP or mTLS client certificate binding).');
    }

    // 4. Validate Signing Algorithm (e.g., PS256 or ES256 required, RS256 discouraged/forbidden in strict FAPI)
    const alg = req.headers['x-jws-signature-alg'];
    if (alg && alg !== 'PS256' && alg !== 'ES256') {
      violations.push(`Insecure signing algorithm: ${alg}. FAPI Core requires PS256 or ES256.`);
    }

    return {
      compliant: violations.length === 0,
      violations
    };
  }
}

// ============================================================================
// APP 5: LOGIC TERMINATION PROTOCOL TRIGGER
// ============================================================================
export type SystemState = 'OPERATIONAL' | 'DEGRADED' | 'TERMINATING' | 'TERMINATED';

export class LogicTerminationProtocolTrigger extends EventEmitter {
  private state: SystemState = 'OPERATIONAL';
  private terminationReason: string | null = null;

  constructor() {
    super();
  }

  public getSystemState(): SystemState {
    return this.state;
  }

  public triggerEmergencyShutdown(reason: string): void {
    if (this.state === 'TERMINATING' || this.state === 'TERMINATED') {
      return; // Already triggered
    }

    this.state = 'TERMINATING';
    this.terminationReason = reason;
    this.emit('terminationInitiated', { reason, timestamp: Date.now() });

    this.executeSafeShutdownSequence();
  }

  private executeSafeShutdownSequence(): void {
    try {
      // 1. Flush active buffers / logs
      this.emit('flushLogs');

      // 2. Revoke active sessions
      this.emit('revokeSessions');

      // 3. Transition to final state
      this.state = 'TERMINATED';
      this.emit('terminationComplete', { reason: this.terminationReason, timestamp: Date.now() });
    } catch (error) {
      this.state = 'TERMINATED';
      this.emit('terminationFailed', error);
    }
  }
}

// ============================================================================
// APP 6: MEMORY SANITIZER & ZEROIZER
// ============================================================================
export class MemorySanitizer {
  /**
   * Overwrites the contents of a Buffer with zeroes to prevent memory leaks of sensitive data.
   */
  public static zeroizeBuffer(buffer: Buffer): void {
    buffer.fill(0);
  }

  /**
   * Overwrites the contents of a Uint8Array with random bytes before zeroing to disrupt forensic recovery.
   */
  public static secureDestroy(array: Uint8Array): void {
    crypto.randomFillSync(array);
    array.fill(0);
  }

  /**
   * Converts a sensitive string into a zeroizable buffer, executes a callback, and immediately sanitizes the buffer.
   */
  public static runWithSanitizedSecret<T>(secret: string, callback: (secretBuf: Buffer) => T): T {
    const buf = Buffer.from(secret, 'utf8');
    try {
      return callback(buf);
    } finally {
      this.zeroizeBuffer(buf);
    }
  }
}

// ============================================================================
// APP 7: HARDWARE SECURITY MODULE KEY BINDER
// ============================================================================
export interface HsmKeyMetadata {
  keyId: string;
  algorithm: string;
  policy: string;
  boundToHardware: boolean;
}

export class HardwareSecurityModuleKeyBinder {
  private boundKeys: Map<string, HsmKeyMetadata> = new Map();

  public bindKeyToHardware(keyId: string, algorithm: string, policy: string): HsmKeyMetadata {
    // Simulates binding a key to an HSM slot and enforcing hardware-level policies
    const metadata: HsmKeyMetadata = {
      keyId,
      algorithm,
      policy,
      boundToHardware: true
    };

    this.boundKeys.set(keyId, metadata);
    return metadata;
  }

  public signWithBoundKey(keyId: string, data: Buffer): Buffer {
    const key = this.boundKeys.get(keyId);
    if (!key || !key.boundToHardware) {
      throw new Error(`Key ${keyId} is not bound to HSM. Operation rejected.`);
    }

    // Simulate HSM signing operation using SHA256 HMAC as a mock hardware signature
    return crypto.createHmac('sha256', keyId).update(data).digest();
  }

  public verifyHardwareBinding(keyId: string): boolean {
    const key = this.boundKeys.get(keyId);
    return !!(key && key.boundToHardware);
  }
}

// ============================================================================
// APP 8: TPM ATTESTATION VERIFIER
// ============================================================================
export interface TpmQuote {
  pcrValues: Record<number, string>; // PCR Index -> Hash Value
  quoteSignature: string;
  nonce: string;
}

export class TpmAttestationVerifier {
  private trustedPcrBaselines: Map<number, string> = new Map();
  private aikPublicKey: string; // Attestation Identity Key (AIK) Public Key

  constructor(aikPublicKey: string) {
    this.aikPublicKey = aikPublicKey;
  }

  public registerPcrBaseline(pcrIndex: number, expectedHash: string): void {
    this.trustedPcrBaselines.set(pcrIndex, expectedHash);
  }

  public verifyQuote(quote: TpmQuote, expectedNonce: string): { verified: boolean; reason?: string } {
    // 1. Verify Nonce to prevent replay attacks
    if (quote.nonce !== expectedNonce) {
      return { verified: false, reason: 'Replay attack detected: Nonce mismatch.' };
    }

    // 2. Verify PCR Values against trusted baselines
    for (const [pcrIndex, expectedHash] of this.trustedPcrBaselines.entries()) {
      const actualHash = quote.pcrValues[pcrIndex];
      if (!actualHash) {
        return { verified: false, reason: `Missing PCR value for index ${pcrIndex}.` };
      }
      if (actualHash !== expectedHash) {
        return { verified: false, reason: `PCR ${pcrIndex} integrity violation. Expected ${expectedHash}, got ${actualHash}.` };
      }
    }

    // 3. Simulate cryptographic signature verification of the quote using the AIK
    // In production, this would use crypto.verify with the AIK public key over the serialized quote data.
    if (!quote.quoteSignature || quote.quoteSignature.length < 10) {
      return { verified: false, reason: 'Invalid or missing AIK signature.' };
    }

    return { verified: true };
  }
}

// ============================================================================
// APP 9: SESSION KEY REVOCATION BROADCAST
// ============================================================================
export interface RevocationMessage {
  sessionId: string;
  revocationReason: string;
  timestamp: number;
  signature: string;
}

export class SessionKeyRevocationBroadcast extends EventEmitter {
  private revokedSessions: Set<string> = new Set();
  private signingPrivateKey: string;

  constructor(signingPrivateKey: string) {
    super();
    this.signingPrivateKey = signingPrivateKey;
  }

  public broadcastRevocation(sessionId: string, reason: string): RevocationMessage {
    const timestamp = Date.now();
    const payload = `${sessionId}:${reason}:${timestamp}`;
    
    // Sign the revocation payload
    const signature = crypto
      .createHmac('sha256', this.signingPrivateKey)
      .update(payload)
      .digest('hex');

    const message: RevocationMessage = {
      sessionId,
      revocationReason: reason,
      timestamp,
      signature
    };

    this.revokedSessions.add(sessionId);
    this.emit('revocationBroadcast', message);
    return message;
  }

  public processIncomingRevocation(message: RevocationMessage, senderPublicKey: string): boolean {
    const payload = `${message.sessionId}:${message.revocationReason}:${message.timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', senderPublicKey)
      .update(payload)
      .digest('hex');

    if (message.signature !== expectedSignature) {
      return false; // Invalid signature, ignore revocation broadcast
    }

    this.revokedSessions.add(message.sessionId);
    this.emit('sessionRevoked', message.sessionId);
    return true;
  }

  public isSessionRevoked(sessionId: string): boolean {
    return this.revokedSessions.has(sessionId);
  }
}

// ============================================================================
// APP 10: CONTROL FLOW INTEGRITY MONITOR
// ============================================================================
export interface ExecutionStep {
  stepId: string;
  allowedNextSteps: string[];
}

export class ControlFlowIntegrityMonitor {
  private flowGraph: Map<string, Set<string>> = new BreakMap();

  private currentStep: string | null = null;

  public registerFlowStep(step: ExecutionStep): void {
    this.flowGraph.set(step.stepId, new Set(step.allowedNextSteps));
  }

  public initializeFlow(startingStep: string): void {
    if (!this.flowGraph.has(startingStep)) {
      throw new Error(`Invalid starting step: ${startingStep}`);
    }
    this.currentStep = startingStep;
  }

  public transitionTo(nextStep: string): { allowed: boolean; error?: string } {
    if (!this.currentStep) {
      return { allowed: false, error: 'Control flow monitor not initialized.' };
    }

    const allowedTransitions = this.flowGraph.get(this.currentStep);
    if (!allowedTransitions || !allowedTransitions.has(nextStep)) {
      return {
        allowed: false,
        error: `Control Flow Integrity Violation: Unauthorized transition from ${this.currentStep} to ${nextStep}.`
      };
    }

    this.currentStep = nextStep;
    return { allowed: true };
  }

  public getCurrentStep(): string | null {
    return this.currentStep;
  }
}

class BreakMap<K, V> extends Map<K, V> {}

// ============================================================================
// UNIFIED ORCHESTRATOR (SECTION 1 RUNNER)
// ============================================================================
export class Section1Orchestrator {
  public static runDiagnostics(): Record<string, string> {
    const results: Record<string, string> = {};

    try {
      // 1. Sovereign Atom Indivisibility Validator
      const validator = new SovereignAtomIndivisibilityValidator();
      validator.registerAtom({ id: 'sov-1', symbol: 'SVT', precision: 4, systemIdentifier: 'SOV_SYS_01' });
      const validTx = validator.validateTransaction({ txId: 'tx-1', atomId: 'sov-1', amount: '100.1234', sender: 'A', recipient: 'B' });
      const invalidTx = validator.validateTransaction({ txId: 'tx-2', atomId: 'sov-1', amount: '100.12345', sender: 'A', recipient: 'B' });
      results['App 1 (Sovereign Atom Validator)'] = validTx.isValid && !invalidTx.isValid ? 'PASS' : 'FAIL';

      // 2. Bytecode Inscription Compiler
      const compiler = new BytecodeInscriptionCompiler();
      const meta: InscriptionMetadata = { author: 'Gov', timestamp: Date.now(), payloadType: 'law', payload: 'Sec1' };
      const compiled = compiler.compile(meta);
      const decompiled = compiler.decompile(compiled);
      results['App 2 (Bytecode Inscription Compiler)'] = decompiled.payload === 'Sec1' ? 'PASS' : 'FAIL';

      // 3. mTLS 1.3 Cipher Suite Enforcer
      const enforcer = new MtlsCipherSuiteEnforcer();
      const secureConn = enforcer.validateConnection({
        tlsVersion: 'TLSv1.3',
        cipherSuite: 'TLS_AES_256_GCM_SHA384',
        clientCertPresent: true,
        clientCertValid: true
      });
      results['App 3 (mTLS 1.3 Enforcer)'] = secureConn.secure ? 'PASS' : 'FAIL';

      // 4. FAPI Core Security Profile
      const fapi = new FapiCoreSecurityProfile();
      const fapiRes = fapi.validateRequest({
        headers: {
          'authorization': 'Bearer token',
          'x-fapi-interaction-id': '123e4567-e89b-12d3-a456-426614174000',
          'dpop': 'dpop-proof',
          'x-jws-signature-alg': 'PS256'
        },
        queryParams: {},
        method: 'POST'
      });
      results['App 4 (FAPI Core Security Profile)'] = fapiRes.compliant ? 'PASS' : 'FAIL';

      // 5. Logic Termination Protocol Trigger
      const ltp = new LogicTerminationProtocolTrigger();
      let triggered = false;
      ltp.on('terminationComplete', () => { triggered = true; });
      ltp.triggerEmergencyShutdown('Security Breach');
      results['App 5 (Logic Termination Protocol)'] = triggered && ltp.getSystemState() === 'TERMINATED' ? 'PASS' : 'FAIL';

      // 6. Memory Sanitizer & Zeroizer
      const secretBuf = Buffer.from('super-secret-data');
      MemorySanitizer.zeroizeBuffer(secretBuf);
      const isZeroed = secretBuf.every(b => b === 0);
      results['App 6 (Memory Sanitizer)'] = isZeroed ? 'PASS' : 'FAIL';

      // 7. Hardware Security Module Key Binder
      const hsm = new HardwareSecurityModuleKeyBinder();
      hsm.bindKeyToHardware('key-01', 'ECDSA_P256', 'SIGN_ONLY');
      const signature = hsm.signWithBoundKey('key-01', Buffer.from('data'));
      results['App 7 (HSM Key Binder)'] = signature.length > 0 ? 'PASS' : 'FAIL';

      // 8. TPM Attestation Verifier
      const tpm = new TpmAttestationVerifier('mock-aik-key');
      tpm.registerPcrBaseline(0, 'hash0');
      const tpmRes = tpm.verifyQuote({
        pcrValues: { 0: 'hash0' },
        quoteSignature: 'valid-sig-mock',
        nonce: 'nonce-123'
      }, 'nonce-123');
      results['App 8 (TPM Attestation Verifier)'] = tpmRes.verified ? 'PASS' : 'FAIL';

      // 9. Session Key Revocation Broadcast
      const broadcaster = new SessionKeyRevocationBroadcast('secret-key');
      const msg = broadcaster.broadcastRevocation('session-abc', 'Compromised');
      const processed = broadcaster.processIncomingRevocation(msg, 'secret-key');
      results['App 9 (Session Revocation Broadcast)'] = processed && broadcaster.isSessionRevoked('session-abc') ? 'PASS' : 'FAIL';

      // 10. Control Flow Integrity Monitor
      const cfim = new ControlFlowIntegrityMonitor();
      cfim.registerFlowStep({ stepId: 'INIT', allowedNextSteps: ['AUTH'] });
      cfim.registerFlowStep({ stepId: 'AUTH', allowedNextSteps: ['PROCESS'] });
      cfim.initializeFlow('INIT');
      const step1 = cfim.transitionTo('AUTH');
      const step2 = cfim.transitionTo('INIT'); // Invalid transition
      results['App 10 (Control Flow Integrity Monitor)'] = step1.allowed && !step2.allowed ? 'PASS' : 'FAIL';

    } catch (err: any) {
      results['Diagnostics Error'] = err.message;
    }

    return results;
  }
}

// ============================================================================
// EXPRESS API ROUTER INTEGRATION
// ============================================================================
const router = Router();

// Singletons for API state
const atomValidator = new SovereignAtomIndivisibilityValidator();
const bytecodeCompiler = new BytecodeInscriptionCompiler();
const mtlsEnforcer = new MtlsCipherSuiteEnforcer();
const fapiProfile = new FapiCoreSecurityProfile();
const terminationTrigger = new LogicTerminationProtocolTrigger();
const hsmBinder = new HardwareSecurityModuleKeyBinder();
const tpmVerifier = new TpmAttestationVerifier('default-aik-key');
const sessionRevocation = new SessionKeyRevocationBroadcast('default-private-key');
const cfiMonitor = new ControlFlowIntegrityMonitor();

// 1. Sovereign Atom Indivisibility Validator Routes
router.post('/atom/register', (req: Request, res: Response) => {
  try {
    const { id, symbol, precision, systemIdentifier } = req.body;
    if (!id || !symbol || precision === undefined || !systemIdentifier) {
      return res.status(400).json({ error: 'Missing required fields: id, symbol, precision, systemIdentifier' });
    }
    atomValidator.registerAtom({ id, symbol, precision: Number(precision), systemIdentifier });
    return res.status(201).json({ message: `Atom ${symbol} registered successfully.` });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/atom/validate', (req: Request, res: Response) => {
  try {
    const { txId, atomId, amount, sender, recipient } = req.body;
    if (!txId || !atomId || !amount || !sender || !recipient) {
      return res.status(400).json({ error: 'Missing required transaction fields.' });
    }
    const result = atomValidator.validateTransaction({ txId, atomId, amount, sender, recipient });
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Bytecode Inscription Compiler Routes
router.post('/bytecode/compile', (req: Request, res: Response) => {
  try {
    const { author, timestamp, payloadType, payload } = req.body;
    if (!author || !timestamp || !payloadType || !payload) {
      return res.status(400).json({ error: 'Missing required metadata fields.' });
    }
    const compiled = bytecodeCompiler.compile({ author, timestamp: Number(timestamp), payloadType, payload });
    return res.status(200).json({ hex: compiled.toString('hex') });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/bytecode/decompile', (req: Request, res: Response) => {
  try {
    const { hex } = req.body;
    if (!hex) {
      return res.status(400).json({ error: 'Missing hex string to decompile.' });
    }
    const buffer = Buffer.from(hex, 'hex');
    const decompiled = bytecodeCompiler.decompile(buffer);
    return res.status(200).json(decompiled);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// 3. mTLS 1.3 Cipher Suite Enforcer Routes
router.post('/mtls/validate', (req: Request, res: Response) => {
  try {
    const { tlsVersion, cipherSuite, clientCertPresent, clientCertValid } = req.body;
    if (!tlsVersion || !cipherSuite || clientCertPresent === undefined || clientCertValid === undefined) {
      return res.status(400).json({ error: 'Missing connection configuration parameters.' });
    }
    const result = mtlsEnforcer.validateConnection({ tlsVersion, cipherSuite, clientCertPresent, clientCertValid });
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. FAPI Core Security Profile Routes
router.post('/fapi/validate', (req: Request, res: Response) => {
  try {
    const { headers, queryParams, method, body } = req.body;
    if (!headers || !queryParams || !method) {
      return res.status(400).json({ error: 'Missing request parameters for FAPI validation.' });
    }
    const result = fapiProfile.validateRequest({ headers, queryParams, method, body });
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Logic Termination Protocol Trigger Routes
router.get('/termination/status', (req: Request, res: Response) => {
  return res.status(200).json({ state: terminationTrigger.getSystemState() });
});

router.post('/termination/trigger', (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Reason is required for emergency shutdown.' });
    }
    terminationTrigger.triggerEmergencyShutdown(reason);
    return res.status(200).json({ message: 'Termination protocol initiated.', state: terminationTrigger.getSystemState() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. Memory Sanitizer & Zeroizer Routes
router.post('/memory/sanitize', (req: Request, res: Response) => {
  try {
    const { secret } = req.body;
    if (!secret) {
      return res.status(400).json({ error: 'Secret is required.' });
    }
    const result = MemorySanitizer.runWithSanitizedSecret(secret, (buf) => {
      // Perform a mock secure operation
      return `Processed secret of length ${buf.length} securely.`;
    });
    return res.status(200).json({ result, message: 'Secret has been zeroized in memory.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. Hardware Security Module Key Binder Routes
router.post('/hsm/bind', (req: Request, res: Response) => {
  try {
    const { keyId, algorithm, policy } = req.body;
    if (!keyId || !algorithm || !policy) {
      return res.status(400).json({ error: 'Missing keyId, algorithm, or policy.' });
    }
    const metadata = hsmBinder.bindKeyToHardware(keyId, algorithm, policy);
    return res.status(201).json(metadata);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/hsm/sign', (req: Request, res: Response) => {
  try {
    const { keyId, data } = req.body;
    if (!keyId || !data) {
      return res.status(400).json({ error: 'Missing keyId or data to sign.' });
    }
    const signature = hsmBinder.signWithBoundKey(keyId, Buffer.from(data, 'utf8'));
    return res.status(200).json({ signature: signature.toString('hex') });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// 8. TPM Attestation Verifier Routes
router.post('/tpm/register-baseline', (req: Request, res: Response) => {
  try {
    const { pcrIndex, expectedHash } = req.body;
    if (pcrIndex === undefined || !expectedHash) {
      return res.status(400).json({ error: 'Missing pcrIndex or expectedHash.' });
    }
    tpmVerifier.registerPcrBaseline(Number(pcrIndex), expectedHash);
    return res.status(201).json({ message: `PCR ${pcrIndex} baseline registered.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/tpm/verify', (req: Request, res: Response) => {
  try {
    const { quote, expectedNonce } = req.body;
    if (!quote || !expectedNonce) {
      return res.status(400).json({ error: 'Missing quote or expectedNonce.' });
    }
    const result = tpmVerifier.verifyQuote(quote, expectedNonce);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 9. Session Key Revocation Broadcast Routes
router.post('/session/revoke', (req: Request, res: Response) => {
  try {
    const { sessionId, reason } = req.body;
    if (!sessionId || !reason) {
      return res.status(400).json({ error: 'Missing sessionId or reason.' });
    }
    const message = sessionRevocation.broadcastRevocation(sessionId, reason);
    return res.status(200).json(message);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/session/process', (req: Request, res: Response) => {
  try {
    const { message, senderPublicKey } = req.body;
    if (!message || !senderPublicKey) {
      return res.status(400).json({ error: 'Missing message or senderPublicKey.' });
    }
    const success = sessionRevocation.processIncomingRevocation(message, senderPublicKey);
    return res.status(200).json({ success });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 10. Control Flow Integrity Monitor Routes
router.post('/cfi/register', (req: Request, res: Response) => {
  try {
    const { stepId, allowedNextSteps } = req.body;
    if (!stepId || !allowedNextSteps) {
      return res.status(400).json({ error: 'Missing stepId or allowedNextSteps.' });
    }
    cfiMonitor.registerFlowStep({ stepId, allowedNextSteps });
    return res.status(201).json({ message: `Flow step ${stepId} registered.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/cfi/init', (req: Request, res: Response) => {
  try {
    const { startingStep } = req.body;
    if (!startingStep) {
      return res.status(400).json({ error: 'Missing startingStep.' });
    }
    cfiMonitor.initializeFlow(startingStep);
    return res.status(200).json({ currentStep: cfiMonitor.getCurrentStep() });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/cfi/transition', (req: Request, res: Response) => {
  try {
    const { nextStep } = req.body;
    if (!nextStep) {
      return res.status(400).json({ error: 'Missing nextStep.' });
    }
    const result = cfiMonitor.transitionTo(nextStep);
    return res.status(200).json({ ...result, currentStep: cfiMonitor.getCurrentStep() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Diagnostics Route
router.get('/diagnostics', (req: Request, res: Response) => {
  const results = Section1Orchestrator.runDiagnostics();
  return res.status(200).json(results);
});

export { router as section1Router };