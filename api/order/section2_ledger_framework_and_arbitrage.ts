import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { Router, Request, Response } from 'express';

// ============================================================================
// APP 1: DETERMINISTIC FEE BURN CALCULATOR
// ============================================================================

export interface FeeCalculationResult {
  totalFee: bigint;
  burnedAmount: bigint;
  validatorReward: bigint;
  congestionMultiplier: bigint;
}

export class DeterministicFeeBurnCalculator {
  private readonly baseFee: bigint;
  private readonly burnRateBasisPoints: bigint; // e.g., 5000 for 50%

  constructor(baseFee: bigint, burnRateBasisPoints: bigint) {
    if (burnRateBasisPoints > 10000n) {
      throw new Error("Burn rate cannot exceed 10000 basis points (100%)");
    }
    this.baseFee = baseFee;
    this.burnRateBasisPoints = burnRateBasisPoints;
  }

  public calculateFee(
    gasUsed: bigint,
    pendingTxCount: number,
    congestionThreshold: number
  ): FeeCalculationResult {
    const congestionMultiplier =
      pendingTxCount > congestionThreshold
        ? 1n + BigInt(Math.floor((pendingTxCount - congestionThreshold) / 10))
        : 1n;

    const totalFee = gasUsed * this.baseFee * congestionMultiplier;
    const burnedAmount = (totalFee * this.burnRateBasisPoints) / 10000n;
    const validatorReward = totalFee - burnedAmount;

    return {
      totalFee,
      burnedAmount,
      validatorReward,
      congestionMultiplier,
    };
  }
}

// ============================================================================
// APP 2: GENESIS BLOCK ALLOCATOR
// ============================================================================

export interface Allocation {
  recipient: string;
  totalAllocation: bigint;
  cliffDurationSec: bigint;
  vestingDurationSec: bigint;
  startTimeSec: bigint;
  claimedAmount: bigint;
}

export class GenesisBlockAllocator {
  private allocations: Map<string, Allocation> = new Map();
  private totalSupply: bigint = 0n;

  constructor(public readonly genesisTimestampSec: bigint) {}

  public registerAllocation(
    recipient: string,
    totalAllocation: bigint,
    cliffDurationSec: bigint,
    vestingDurationSec: bigint
  ): void {
    if (this.allocations.has(recipient)) {
      throw new Error("Allocation already exists for recipient");
    }
    this.allocations.set(recipient, {
      recipient,
      totalAllocation,
      cliffDurationSec,
      vestingDurationSec,
      startTimeSec: this.genesisTimestampSec,
      claimedAmount: 0n,
    });
    this.totalSupply += totalAllocation;
  }

  public getClaimableAmount(recipient: string, currentTimestampSec: bigint): bigint {
    const alloc = this.allocations.get(recipient);
    if (!alloc) return 0n;

    if (currentTimestampSec < alloc.startTimeSec + alloc.cliffDurationSec) {
      return 0n;
    }

    const timeElapsed = currentTimestampSec - alloc.startTimeSec;
    if (timeElapsed >= alloc.vestingDurationSec) {
      return alloc.totalAllocation - alloc.claimedAmount;
    }

    const vestedAmount = (alloc.totalAllocation * timeElapsed) / alloc.vestingDurationSec;
    const claimable = vestedAmount - alloc.claimedAmount;
    return claimable > 0n ? claimable : 0n;
  }

  public claimTokens(recipient: string, currentTimestampSec: bigint): bigint {
    const alloc = this.allocations.get(recipient);
    if (!alloc) throw new Error("No allocation found");

    const claimable = this.getClaimableAmount(recipient, currentTimestampSec);
    if (claimable === 0n) throw new Error("No tokens available for claiming");

    alloc.claimedAmount += claimable;
    return claimable;
  }

  public getTotalSupply(): bigint {
    return this.totalSupply;
  }

  public getAllocation(recipient: string): Allocation | undefined {
    return this.allocations.get(recipient);
  }
}

// ============================================================================
// APP 3: CORPORATE BANK PORTAL ESCROW
// ============================================================================

export interface EscrowAgreement {
  id: string;
  sender: string;
  receiver: string;
  amount: bigint;
  approvers: Set<string>;
  approvals: Set<string>;
  isReleased: boolean;
  isRefunded: boolean;
  expiryTimestampSec: bigint;
}

export class CorporateBankPortalEscrow {
  private escrows: Map<string, EscrowAgreement> = new Map();

  public createEscrow(
    id: string,
    sender: string,
    receiver: string,
    amount: bigint,
    approvers: string[],
    expiryDurationSec: bigint,
    currentTimestampSec: bigint
  ): void {
    if (this.escrows.has(id)) {
      throw new Error("Escrow agreement already exists");
    }
    this.escrows.set(id, {
      id,
      sender,
      receiver,
      amount,
      approvers: new Set(approvers),
      approvals: new Set<string>(),
      isReleased: false,
      isRefunded: false,
      expiryTimestampSec: currentTimestampSec + expiryDurationSec,
    });
  }

  public approveEscrow(id: string, approver: string): boolean {
    const escrow = this.escrows.get(id);
    if (!escrow) throw new Error("Escrow not found");
    if (escrow.isReleased || escrow.isRefunded) throw new Error("Escrow is already finalized");
    if (!escrow.approvers.has(approver)) throw new Error("Unauthorized approver");

    escrow.approvals.add(approver);

    if (escrow.approvals.size >= escrow.approvers.size) {
      escrow.isReleased = true;
      return true; // Fully approved and released
    }
    return false;
  }

  public refundEscrow(id: string, currentTimestampSec: bigint): void {
    const escrow = this.escrows.get(id);
    if (!escrow) throw new Error("Escrow not found");
    if (escrow.isReleased || escrow.isRefunded) throw new Error("Escrow is already finalized");
    if (currentTimestampSec < escrow.expiryTimestampSec) {
      throw new Error("Escrow has not expired yet");
    }

    escrow.isRefunded = true;
  }

  public getEscrow(id: string): EscrowAgreement | undefined {
    return this.escrows.get(id);
  }
}

// ============================================================================
// APP 4: ANTI-ARBITRAGE LOCK
// ============================================================================

export interface TradeLockState {
  lastTradeTimestampMs: number;
  lastPrice: number;
  isLocked: boolean;
}

export class AntiArbitrageLock {
  private userLocks: Map<string, TradeLockState> = new Map();

  constructor(
    private readonly minTimeBetweenTradesMs: number,
    private readonly maxPriceDeviationPercent: number
  ) {}

  public validateTrade(
    userId: string,
    currentPrice: number,
    currentTimestampMs: number
  ): { allowed: boolean; reason?: string } {
    const lock = this.userLocks.get(userId);

    if (!lock) {
      this.userLocks.set(userId, {
        lastTradeTimestampMs: currentTimestampMs,
        lastPrice: currentPrice,
        isLocked: false,
      });
      return { allowed: true };
    }

    if (lock.isLocked) {
      return { allowed: false, reason: "Account is temporarily locked due to suspicious arbitrage activity" };
    }

    const timePassed = currentTimestampMs - lock.lastTradeTimestampMs;
    if (timePassed < this.minTimeBetweenTradesMs) {
      lock.isLocked = true;
      return { allowed: false, reason: "Trade frequency limit exceeded. Account locked." };
    }

    const priceDeviation = Math.abs((currentPrice - lock.lastPrice) / lock.lastPrice) * 100;
    if (priceDeviation > this.maxPriceDeviationPercent) {
      lock.isLocked = true;
      return { allowed: false, reason: "Extreme price deviation detected. Account locked." };
    }

    lock.lastTradeTimestampMs = currentTimestampMs;
    lock.lastPrice = currentPrice;
    return { allowed: true };
  }

  public unlockAccount(userId: string): void {
    const lock = this.userLocks.get(userId);
    if (lock) {
      lock.isLocked = false;
    }
  }
}

// ============================================================================
// APP 5: ASYMMETRIC CRYPTOGRAPHIC HANDSHAKE
// ============================================================================

export class AsymmetricCryptographicHandshake {
  public static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  public static initiateChallenge(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public static signChallenge(challenge: string, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(challenge);
    sign.end();
    return sign.sign(privateKey, 'hex');
  }

  public static verifyHandshake(challenge: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(challenge);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
  }
}

// ============================================================================
// APP 6: MULTI-PARTY COMPUTATION KEY MANAGER
// ============================================================================

export interface KeyShare {
  nodeId: string;
  shareValue: string;
}

export class MultiPartyComputationKeyManager {
  private shares: Map<string, KeyShare[]> = new Map();

  constructor(private readonly threshold: number) {}

  public registerShares(keyId: string, shares: KeyShare[]): void {
    if (shares.length < this.threshold) {
      throw new Error("Number of shares is below the required threshold");
    }
    this.shares.set(keyId, shares);
  }

  public signTransaction(keyId: string, transactionHash: string, participatingNodes: string[]): string {
    if (participatingNodes.length < this.threshold) {
      throw new Error("Insufficient participating nodes to meet threshold");
    }

    const registeredShares = this.shares.get(keyId);
    if (!registeredShares) {
      throw new Error("Key ID not found");
    }

    const activeShares = registeredShares.filter(share => participatingNodes.includes(share.nodeId));
    if (activeShares.length < this.threshold) {
      throw new Error("Not enough valid registered shares among participating nodes");
    }

    // Simulate MPC threshold signature generation
    const combinedHash = crypto.createHash('sha256');
    combinedHash.update(transactionHash);
    activeShares.forEach(share => combinedHash.update(share.shareValue));

    return combinedHash.digest('hex');
  }
}

// ============================================================================
// APP 7: LATENCY-MONITORING NODE
// ============================================================================

export interface NodeMetrics {
  nodeId: string;
  latenciesMs: number[];
  averageLatencyMs: number;
  isHealthy: boolean;
}

export class LatencyMonitoringNode {
  private nodes: Map<string, NodeMetrics> = new Map();

  constructor(
    private readonly maxAllowedLatencyMs: number,
    private readonly historyLimit: number = 10
  ) {}

  public registerNode(nodeId: string): void {
    this.nodes.set(nodeId, {
      nodeId,
      latenciesMs: [],
      averageLatencyMs: 0,
      isHealthy: true,
    });
  }

  public recordLatency(nodeId: string, latencyMs: number): void {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error("Node not registered");

    node.latenciesMs.push(latencyMs);
    if (node.latenciesMs.length > this.historyLimit) {
      node.latenciesMs.shift();
    }

    const sum = node.latenciesMs.reduce((acc, val) => acc + val, 0);
    node.averageLatencyMs = sum / node.latenciesMs.length;
    node.isHealthy = node.averageLatencyMs <= this.maxAllowedLatencyMs;
  }

  public getHealthyNodes(): string[] {
    return Array.from(this.nodes.values())
      .filter(node => node.isHealthy)
      .map(node => node.nodeId);
  }

  public getNodeMetrics(nodeId: string): NodeMetrics | undefined {
    return this.nodes.get(nodeId);
  }
}

// ============================================================================
// APP 8: DYNAMIC FEE FORMULA ADJUSTER
// ============================================================================

export class DynamicFeeFormulaAdjuster {
  private currentBaseFee: bigint;

  constructor(
    initialBaseFee: bigint,
    private readonly targetBlockSize: bigint,
    private readonly maxFeeChangeBasisPoints: bigint // e.g., 1250 for 12.5%
  ) {
    this.currentBaseFee = initialBaseFee;
  }

  public adjustFeeForNextBlock(actualBlockSize: bigint): bigint {
    const sizeDifference = actualBlockSize - this.targetBlockSize;
    
    // Calculate adjustment based on block size deviation
    const changeFactor = (sizeDifference * this.maxFeeChangeBasisPoints) / this.targetBlockSize;
    const feeAdjustment = (this.currentBaseFee * changeFactor) / 10000n;

    this.currentBaseFee = this.currentBaseFee + feeAdjustment;

    // Ensure base fee never drops below 1 unit
    if (this.currentBaseFee < 1n) {
      this.currentBaseFee = 1n;
    }

    return this.currentBaseFee;
  }

  public getCurrentBaseFee(): bigint {
    return this.currentBaseFee;
  }
}

// ============================================================================
// APP 9: EMERGENCY CIRCUIT BREAKER
// ============================================================================

export class EmergencyCircuitBreaker extends EventEmitter {
  private isHalted: boolean = false;
  private priceHistory: { timestamp: number; price: number }[] = [];

  constructor(
    private readonly priceDropThresholdPercent: number,
    private readonly timeWindowMs: number
  ) {
    super();
  }

  public recordPrice(price: number, timestamp: number): void {
    if (this.isHalted) return;

    this.priceHistory.push({ timestamp, price });
    this.cleanOldHistory(timestamp);

    if (this.detectAnomaly()) {
      this.triggerHalt();
    }
  }

  private cleanOldHistory(currentTimestamp: number): void {
    const cutoff = currentTimestamp - this.timeWindowMs;
    this.priceHistory = this.priceHistory.filter(p => p.timestamp >= cutoff);
  }

  private detectAnomaly(): boolean {
    if (this.priceHistory.length < 2) return false;

    const highestPrice = Math.max(...this.priceHistory.map(p => p.price));
    const currentPrice = this.priceHistory[this.priceHistory.length - 1].price;

    const dropPercent = ((highestPrice - currentPrice) / highestPrice) * 100;
    return dropPercent >= this.priceDropThresholdPercent;
  }

  private triggerHalt(): void {
    this.isHalted = true;
    this.emit('halt', { reason: "Extreme price drop detected within time window" });
  }

  public reset(): void {
    this.isHalted = false;
    this.priceHistory = [];
    this.emit('reset');
  }

  public getStatus(): boolean {
    return this.isHalted;
  }
}

// ============================================================================
// APP 10: LEGAL ENTITY IDENTIFIER MAPPER
// ============================================================================

export interface LegalEntity {
  lei: string;
  legalName: string;
  jurisdiction: string;
  registrationDate: Date;
  isValid: boolean;
}

export class LegalEntityIdentifierMapper {
  private addressToLei: Map<string, string> = new Map();
  private leiToEntity: Map<string, LegalEntity>;

  constructor() {
    this.leiToEntity = new Map();
  }

  public registerEntity(lei: string, legalName: string, jurisdiction: string): void {
    if (this.leiToEntity.has(lei)) {
      throw new Error("LEI already registered");
    }
    this.leiToEntity.set(lei, {
      lei,
      legalName,
      jurisdiction,
      registrationDate: new Date(),
      isValid: true,
    });
  }

  public mapAddressToLei(address: string, lei: string): void {
    if (!this.leiToEntity.has(lei)) {
      throw new Error("Cannot map to unregistered LEI");
    }
    this.addressToLei.set(address.toLowerCase(), lei);
  }

  public getEntityByAddress(address: string): LegalEntity | undefined {
    const lei = this.addressToLei.get(address.toLowerCase());
    if (!lei) return undefined;
    return this.leiToEntity.get(lei);
  }

  public revokeLei(lei: string): void {
    const entity = this.leiToEntity.get(lei);
    if (entity) {
      entity.isValid = false;
    }
  }
}

// ============================================================================
// API ROUTER IMPLEMENTATION
// ============================================================================

export const ledgerFrameworkRouter = Router();

// Helper to serialize BigInt values to strings in JSON responses
function serialize(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// Instantiate singletons with robust default parameters
const feeCalculator = new DeterministicFeeBurnCalculator(100n, 5000n); // 100 base fee, 50% burn
const genesisAllocator = new GenesisBlockAllocator(BigInt(Math.floor(Date.now() / 1000)));
const corporateEscrow = new CorporateBankPortalEscrow();
const antiArbitrage = new AntiArbitrageLock(5000, 10); // 5s cooldown, 10% max deviation
const mpcKeyManager = new MultiPartyComputationKeyManager(2); // threshold 2
const latencyMonitor = new LatencyMonitoringNode(150); // 150ms max latency
const feeAdjuster = new DynamicFeeFormulaAdjuster(100n, 1000000n, 1250n);
const circuitBreaker = new EmergencyCircuitBreaker(15, 60000); // 15% drop in 1 minute
const leiMapper = new LegalEntityIdentifierMapper();

// APP 1: Deterministic Fee Burn Calculator Routes
ledgerFrameworkRouter.post('/fee/calculate', (req: Request, res: Response) => {
  try {
    const { gasUsed, pendingTxCount, congestionThreshold } = req.body;
    if (gasUsed === undefined || pendingTxCount === undefined || congestionThreshold === undefined) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const result = feeCalculator.calculateFee(
      BigInt(gasUsed),
      Number(pendingTxCount),
      Number(congestionThreshold)
    );
    res.json(serialize(result));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APP 2: Genesis Block Allocator Routes
ledgerFrameworkRouter.post('/genesis/register', (req: Request, res: Response) => {
  try {
    const { recipient, totalAllocation, cliffDurationSec, vestingDurationSec } = req.body;
    if (!recipient || totalAllocation === undefined || cliffDurationSec === undefined || vestingDurationSec === undefined) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    genesisAllocator.registerAllocation(
      recipient,
      BigInt(totalAllocation),
      BigInt(cliffDurationSec),
      BigInt(vestingDurationSec)
    );
    res.json({ success: true, message: `Allocation registered for ${recipient}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.get('/genesis/claimable', (req: Request, res: Response) => {
  try {
    const { recipient, currentTimestampSec } = req.query;
    if (!recipient) {
      return res.status(400).json({ error: "Missing recipient" });
    }
    const ts = currentTimestampSec ? BigInt(currentTimestampSec as string) : BigInt(Math.floor(Date.now() / 1000));
    const claimable = genesisAllocator.getClaimableAmount(recipient as string, ts);
    res.json(serialize({ recipient, claimable }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/genesis/claim', (req: Request, res: Response) => {
  try {
    const { recipient, currentTimestampSec } = req.body;
    if (!recipient) {
      return res.status(400).json({ error: "Missing recipient" });
    }
    const ts = currentTimestampSec ? BigInt(currentTimestampSec) : BigInt(Math.floor(Date.now() / 1000));
    const claimed = genesisAllocator.claimTokens(recipient, ts);
    res.json(serialize({ success: true, claimed }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APP 3: Corporate Bank Portal Escrow Routes
ledgerFrameworkRouter.post('/escrow/create', (req: Request, res: Response) => {
  try {
    const { id, sender, receiver, amount, approvers, expiryDurationSec, currentTimestampSec } = req.body;
    if (!id || !sender || !receiver || amount === undefined || !approvers || expiryDurationSec === undefined) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const ts = currentTimestampSec ? BigInt(currentTimestampSec) : BigInt(Math.floor(Date.now() / 1000));
    corporateEscrow.createEscrow(
      id,
      sender,
      receiver,
      BigInt(amount),
      approvers,
      BigInt(expiryDurationSec),
      ts
    );
    res.json({ success: true, message: `Escrow ${id} created` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/escrow/approve', (req: Request, res: Response) => {
  try {
    const { id, approver } = req.body;
    if (!id || !approver) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const released = corporateEscrow.approveEscrow(id, approver);
    res.json({ success: true, released });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/escrow/refund', (req: Request, res: Response) => {
  try {
    const { id, currentTimestampSec } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const ts = currentTimestampSec ? BigInt(currentTimestampSec) : BigInt(Math.floor(Date.now() / 1000));
    corporateEscrow.refundEscrow(id, ts);
    res.json({ success: true, message: `Escrow ${id} refunded` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.get('/escrow/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const escrow = corporateEscrow.getEscrow(id);
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" });
    }
    const serializedEscrow = {
      ...escrow,
      approvers: Array.from(escrow.approvers),
      approvals: Array.from(escrow.approvals),
    };
    res.json(serialize(serializedEscrow));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APP 4: Anti-Arbitrage Lock Routes
ledgerFrameworkRouter.post('/arbitrage/validate', (req: Request, res: Response) => {
  try {
    const { userId, currentPrice, currentTimestampMs } = req.body;
    if (!userId || currentPrice === undefined) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const ts = currentTimestampMs ? Number(currentTimestampMs) : Date.now();
    const result = antiArbitrage.validateTrade(userId, Number(currentPrice), ts);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/arbitrage/unlock', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    antiArbitrage.unlockAccount(userId);
    res.json({ success: true, message: `Account ${userId} unlocked` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APP 5: Asymmetric Cryptographic Handshake Routes
ledgerFrameworkRouter.post('/handshake/keypair', (req: Request, res: Response) => {
  try {
    const keys = AsymmetricCryptographicHandshake.generateKeyPair();
    res.json(keys);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/handshake/challenge', (req: Request, res: Response) => {
  try {
    const challenge = AsymmetricCryptographicHandshake.initiateChallenge();
    res.json({ challenge });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/handshake/sign', (req: Request, res: Response) => {
  try {
    const { challenge, privateKey } = req.body;
    if (!challenge || !privateKey) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const signature = AsymmetricCryptographicHandshake.signChallenge(challenge, privateKey);
    res.json({ signature });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/handshake/verify', (req: Request, res: Response) => {
  try {
    const { challenge, signature, publicKey } = req.body;
    if (!challenge || !signature || !publicKey) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const isValid = AsymmetricCryptographicHandshake.verifyHandshake(challenge, signature, publicKey);
    res.json({ isValid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APP 6: Multi-Party Computation Key Manager Routes
ledgerFrameworkRouter.post('/mpc/register', (req: Request, res: Response) => {
  try {
    const { keyId, shares } = req.body;
    if (!keyId || !shares) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    mpcKeyManager.registerShares(keyId, shares);
    res.json({ success: true, message: `Shares registered for key ${keyId}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/mpc/sign', (req: Request, res: Response) => {
  try {
    const { keyId, transactionHash, participatingNodes } = req.body;
    if (!keyId || !transactionHash || !participatingNodes) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const signature = mpcKeyManager.signTransaction(keyId, transactionHash, participatingNodes);
    res.json({ signature });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APP 7: Latency-Monitoring Node Routes
ledgerFrameworkRouter.post('/latency/register', (req: Request, res: Response) => {
  try {
    const { nodeId } = req.body;
    if (!nodeId) {
      return res.status(400).json({ error: "Missing nodeId" });
    }
    latencyMonitor.registerNode(nodeId);
    res.json({ success: true, message: `Node ${nodeId} registered` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/latency/record', (req: Request, res: Response) => {
  try {
    const { nodeId, latencyMs } = req.body;
    if (!nodeId || latencyMs === undefined) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    latencyMonitor.recordLatency(nodeId, Number(latencyMs));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.get('/latency/healthy', (req: Request, res: Response) => {
  try {
    const healthyNodes = latencyMonitor.getHealthyNodes();
    res.json({ healthyNodes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.get('/latency/metrics/:nodeId', (req: Request, res: Response) => {
  try {
    const nodeId = Array.isArray(req.params.nodeId) ? req.params.nodeId[0] : req.params.nodeId;
    const metrics = latencyMonitor.getNodeMetrics(nodeId);
    if (!metrics) {
      return res.status(404).json({ error: "Node not found" });
    }
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APP 8: Dynamic Fee Formula Adjuster Routes
ledgerFrameworkRouter.post('/fee-adjuster/adjust', (req: Request, res: Response) => {
  try {
    const { actualBlockSize } = req.body;
    if (actualBlockSize === undefined) {
      return res.status(400).json({ error: "Missing actualBlockSize" });
    }
    const nextFee = feeAdjuster.adjustFeeForNextBlock(BigInt(actualBlockSize));
    res.json(serialize({ nextFee }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.get('/fee-adjuster/current', (req: Request, res: Response) => {
  try {
    const currentFee = feeAdjuster.getCurrentBaseFee();
    res.json(serialize({ currentFee }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APP 9: Emergency Circuit Breaker Routes
ledgerFrameworkRouter.post('/circuit-breaker/price', (req: Request, res: Response) => {
  try {
    const { price, timestamp } = req.body;
    if (price === undefined) {
      return res.status(400).json({ error: "Missing price" });
    }
    const ts = timestamp ? Number(timestamp) : Date.now();
    circuitBreaker.recordPrice(Number(price), ts);
    res.json({ success: true, isHalted: circuitBreaker.getStatus() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/circuit-breaker/reset', (req: Request, res: Response) => {
  try {
    circuitBreaker.reset();
    res.json({ success: true, isHalted: circuitBreaker.getStatus() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.get('/circuit-breaker/status', (req: Request, res: Response) => {
  try {
    res.json({ isHalted: circuitBreaker.getStatus() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APP 10: Legal Entity Identifier Mapper Routes
ledgerFrameworkRouter.post('/lei/register', (req: Request, res: Response) => {
  try {
    const { lei, legalName, jurisdiction } = req.body;
    if (!lei || !legalName || !jurisdiction) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    leiMapper.registerEntity(lei, legalName, jurisdiction);
    res.json({ success: true, message: `LEI ${lei} registered` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/lei/map', (req: Request, res: Response) => {
  try {
    const { address, lei } = req.body;
    if (!address || !lei) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    leiMapper.mapAddressToLei(address, lei);
    res.json({ success: true, message: `Address ${address} mapped to LEI ${lei}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.get('/lei/address/:address', (req: Request, res: Response) => {
  try {
    const address = Array.isArray(req.params.address) ? req.params.address[0] : req.params.address;
    const entity = leiMapper.getEntityByAddress(address);
    if (!entity) {
      return res.status(404).json({ error: "Entity not found for address" });
    }
    res.json(entity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ledgerFrameworkRouter.post('/lei/revoke', (req: Request, res: Response) => {
  try {
    const { lei } = req.body;
    if (!lei) {
      return res.status(400).json({ error: "Missing lei" });
    }
    leiMapper.revokeLei(lei);
    res.json({ success: true, message: `LEI ${lei} revoked` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default ledgerFrameworkRouter;