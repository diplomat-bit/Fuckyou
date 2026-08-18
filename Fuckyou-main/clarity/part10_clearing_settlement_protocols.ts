import { EventEmitter } from 'events';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SettlementStatus = 
  | 'PENDING'
  | 'QUEUED'
  | 'MARGIN_CHECK_PENDING'
  | 'NETTED'
  | 'CLEARING'
  | 'SETTLED'
  | 'FAILED'
  | 'REJECTED'
  | 'DISPUTED'
  | 'ROLLBACK_REQUIRED';

export type SettlementMethod = 
  | 'RTGS'                   // Real-Time Gross Settlement
  | 'MULTILATERAL_NETTING'   // Multi-party net offset settlement
  | 'BILATERAL_NETTING'      // Two-party net offset settlement
  | 'ATOMIC_SWAP'            // DvP / PvP crypto or tokenized asset swap
  | 'BATCH_CLEARING';        // End-of-day scheduled clearing batch

export type ClearingHouseVenue = 
  | 'DTCC' 
  | 'FEDWIRE' 
  | 'CHIPS' 
  | 'EUROCLEAR' 
  | 'SWIFT_GPI' 
  | 'INTERNAL_LEDGER' 
  | 'CITI_CONNECT' 
  | 'MODERN_TREASURY'
  | 'ALPACA_JOURNAL';

export type AssetClass = 'FIAT' | 'EQUITY' | 'FIXED_INCOME' | 'CRYPTO' | 'REAL_ESTATE_TOKEN' | 'COMMODITY';

export interface Participant {
  id: string;
  name: string;
  bicOrRoutingCode: string;
  ledgerAccountId: string;
  clearingStatus: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED';
  creditLimitUSD: number;
  currentExposureUSD: number;
  collateralBalanceUSD: number;
  marginRequirementPct: number;
}

export interface SettlementInstruction {
  instructionId: string;
  tradeId: string;
  senderParticipantId: string;
  receiverParticipantId: string;
  assetClass: AssetClass;
  symbolOrCurrency: string;
  amount: number;
  nettedAmount?: number;
  exchangeRateToUSD: number;
  method: SettlementMethod;
  venue: ClearingHouseVenue;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  status: SettlementStatus;
  createdTimestamp: number;
  scheduledSettlementTime: number;
  actualSettlementTime?: number;
  failureReason?: string;
  retryCount: number;
  digitalSignature?: string;
  metadata?: Record<string, any>;
}

export interface NettingResult {
  batchId: string;
  timestamp: number;
  totalGrossVolumeUSD: number;
  totalNetVolumeUSD: number;
  efficiencyRatio: number; // (1 - Net/Gross) * 100%
  originalInstructionCount: number;
  nettedInstructions: SettlementInstruction[];
  participantNetPositions: Map<string, { participantId: string; netAmountUSD: number; isPayor: boolean }>;
}

export interface LedgerSyncRecord {
  syncId: string;
  instructionId: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  currency: string;
  status: 'COMMITTED' | 'PREPARED' | 'ABORTED';
  lockHash: string;
  timestamp: number;
}

export interface CollateralMarginCall {
  callId: string;
  participantId: string;
  requiredCollateralUSD: number;
  currentCollateralUSD: number;
  marginDeficitUSD: number;
  dueDate: number;
  status: 'ISSUED' | 'MET' | 'DEFAULTED';
}

// ============================================================================
// MULTILATERAL NETTING ENGINE
// ============================================================================

export class MultilateralNettingEngine {
  /**
   * Compresses a set of bilateral settlement instructions into a minimal net settlement payload.
   */
  public calculateNetPositions(
    batchId: string,
    instructions: SettlementInstruction[]
  ): NettingResult {
    const participantBalances = new Map<string, number>();
    let totalGrossVolumeUSD = 0;

    for (const inst of instructions) {
      if (inst.status !== 'PENDING' && inst.status !== 'QUEUED') continue;

      const usdValue = inst.amount * inst.exchangeRateToUSD;
      totalGrossVolumeUSD += usdValue;

      // Sender pays, Receiver gets
      const currentSenderBal = participantBalances.get(inst.senderParticipantId) || 0;
      participantBalances.set(inst.senderParticipantId, currentSenderBal - usdValue);

      const currentReceiverBal = participantBalances.get(inst.receiverParticipantId) || 0;
      participantBalances.set(inst.receiverParticipantId, currentReceiverBal + usdValue);
    }

    const netPositionsMap = new Map<string, { participantId: string; netAmountUSD: number; isPayor: boolean }>();
    let totalNetVolumeUSD = 0;

    participantBalances.forEach((netAmount, participantId) => {
      if (Math.abs(netAmount) > 0.0001) {
        const isPayor = netAmount < 0;
        const absNet = Math.abs(netAmount);
        if (isPayor) {
          totalNetVolumeUSD += absNet;
        }
        netPositionsMap.set(participantId, {
          participantId,
          netAmountUSD: absNet,
          isPayor
        });
      }
    });

    const efficiencyRatio = totalGrossVolumeUSD > 0 
      ? ((totalGrossVolumeUSD - totalNetVolumeUSD) / totalGrossVolumeUSD) * 100 
      : 0;

    // Construct streamlined instructions for net settlements
    const nettedInstructions: SettlementInstruction[] = [];
    const payors = Array.from(netPositionsMap.values()).filter(p => p.isPayor);
    const receivers = Array.from(netPositionsMap.values()).filter(p => !p.isPayor);

    let payorIdx = 0;
    let receiverIdx = 0;

    let currentPayorRem = payors[payorIdx]?.netAmountUSD || 0;
    let currentReceiverRem = receivers[receiverIdx]?.netAmountUSD || 0;

    while (payorIdx < payors.length && receiverIdx < receivers.length) {
      const settlementAmt = Math.min(currentPayorRem, currentReceiverRem);
      
      if (settlementAmt > 0) {
        nettedInstructions.push({
          instructionId: `NET_${batchId}_${payorIdx}_${receiverIdx}`,
          tradeId: `NET_BATCH_${batchId}`,
          senderParticipantId: payors[payorIdx].participantId,
          receiverParticipantId: receivers[receiverIdx].participantId,
          assetClass: 'FIAT',
          symbolOrCurrency: 'USD',
          amount: settlementAmt,
          nettedAmount: settlementAmt,
          exchangeRateToUSD: 1.0,
          method: 'MULTILATERAL_NETTING',
          venue: 'INTERNAL_LEDGER',
          priority: 'HIGH',
          status: 'NETTED',
          createdTimestamp: Date.now(),
          scheduledSettlementTime: Date.now(),
          retryCount: 0
        });
      }

      currentPayorRem -= settlementAmt;
      currentReceiverRem -= settlementAmt;

      if (currentPayorRem <= 0.0001) {
        payorIdx++;
        currentPayorRem = payors[payorIdx]?.netAmountUSD || 0;
      }
      if (currentReceiverRem <= 0.0001) {
        receiverIdx++;
        currentReceiverRem = receivers[receiverIdx]?.netAmountUSD || 0;
      }
    }

    return {
      batchId,
      timestamp: Date.now(),
      totalGrossVolumeUSD,
      totalNetVolumeUSD,
      efficiencyRatio,
      originalInstructionCount: instructions.length,
      nettedInstructions,
      participantNetPositions: netPositionsMap
    };
  }
}

// ============================================================================
// CLEARING HOUSE ADAPTER INTERFACE & IMPLEMENTATIONS
// ============================================================================

export interface IClearingHouseAdapter {
  venue: ClearingHouseVenue;
  submitForClearing(instruction: SettlementInstruction): Promise<{ success: boolean; externalRef?: string; error?: string }>;
  checkSettlementStatus(externalRef: string): Promise<SettlementStatus>;
  cancelInstruction(externalRef: string): Promise<boolean>;
}

export class DTCCClearingAdapter implements IClearingHouseAdapter {
  public venue: ClearingHouseVenue = 'DTCC';

  public async submitForClearing(instruction: SettlementInstruction): Promise<{ success: boolean; externalRef?: string; error?: string }> {
    // Simulated DTCC Continuous Net Settlement (CNS) payload submission
    if (instruction.amount <= 0) {
      return { success: false, error: 'Invalid settlement amount' };
    }
    const externalRef = `DTCC_CNS_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    return { success: true, externalRef };
  }

  public async checkSettlementStatus(externalRef: string): Promise<SettlementStatus> {
    return 'SETTLED';
  }

  public async cancelInstruction(externalRef: string): Promise<boolean> {
    return true;
  }
}

export class FedwireClearingAdapter implements IClearingHouseAdapter {
  public venue: ClearingHouseVenue = 'FEDWIRE';

  public async submitForClearing(instruction: SettlementInstruction): Promise<{ success: boolean; externalRef?: string; error?: string }> {
    const externalRef = `FED_IMAD_${new Date().toISOString().replace(/\D/g, '')}_${Math.floor(Math.random() * 8999 + 1000)}`;
    return { success: true, externalRef };
  }

  public async checkSettlementStatus(externalRef: string): Promise<SettlementStatus> {
    return 'SETTLED';
  }

  public async cancelInstruction(externalRef: string): Promise<boolean> {
    // Fedwire real-time transfers are non-cancelable once processed
    return false;
  }
}

export class SwiftGpiClearingAdapter implements IClearingHouseAdapter {
  public venue: ClearingHouseVenue = 'SWIFT_GPI';

  public async submitForClearing(instruction: SettlementInstruction): Promise<{ success: boolean; externalRef?: string; error?: string }> {
    const uetr = `uetr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return { success: true, externalRef: uetr };
  }

  public async checkSettlementStatus(externalRef: string): Promise<SettlementStatus> {
    return 'CLEARING';
  }

  public async cancelInstruction(externalRef: string): Promise<boolean> {
    return true;
  }
}

export class InternalLedgerClearingAdapter implements IClearingHouseAdapter {
  public venue: ClearingHouseVenue = 'INTERNAL_LEDGER';

  public async submitForClearing(instruction: SettlementInstruction): Promise<{ success: boolean; externalRef?: string; error?: string }> {
    const externalRef = `INT_LEDGER_${instruction.instructionId}`;
    return { success: true, externalRef };
  }

  public async checkSettlementStatus(externalRef: string): Promise<SettlementStatus> {
    return 'SETTLED';
  }

  public async cancelInstruction(externalRef: string): Promise<boolean> {
    return true;
  }
}

// ============================================================================
// LEDGER SYNCHRONIZATION & TWO-PHASE COMMIT ENGINE
// ============================================================================

export class LedgerSyncManager {
  private syncRecords: Map<string, LedgerSyncRecord> = new Map();

  /**
   * Phase 1: Prepare lock on source and target accounts
   */
  public async prepareAtomicLock(
    instructionId: string,
    sourceAccount: string,
    destinationAccount: string,
    amount: number,
    currency: string
  ): Promise<LedgerSyncRecord> {
    const syncId = `SYNC_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const lockHash = this.generateHash(`${instructionId}:${sourceAccount}:${destinationAccount}:${amount}:${currency}`);

    const record: LedgerSyncRecord = {
      syncId,
      instructionId,
      sourceAccount,
      destinationAccount,
      amount,
      currency,
      status: 'PREPARED',
      lockHash,
      timestamp: Date.now()
    };

    this.syncRecords.set(syncId, record);
    return record;
  }

  /**
   * Phase 2: Commit lock and execute double-entry ledger update
   */
  public async commitTransaction(syncId: string): Promise<boolean> {
    const record = this.syncRecords.get(syncId);
    if (!record || record.status !== 'PREPARED') {
      throw new Error(`Cannot commit ledger transaction. Record missing or invalid status: ${syncId}`);
    }

    record.status = 'COMMITTED';
    this.syncRecords.set(syncId, record);
    return true;
  }

  /**
   * Abort / Rollback locked funds
   */
  public async abortTransaction(syncId: string): Promise<boolean> {
    const record = this.syncRecords.get(syncId);
    if (!record) return false;

    record.status = 'ABORTED';
    this.syncRecords.set(syncId, record);
    return true;
  }

  private generateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }
}

// ============================================================================
// MARGIN & RISK COLLATERAL MONITOR
// ============================================================================

export class MarginAndCollateralManager {
  private participants: Map<string, Participant> = new Map();
  private activeMarginCalls: Map<string, CollateralMarginCall> = new Map();

  public registerParticipant(participant: Participant): void {
    this.participants.set(participant.id, participant);
  }

  public getParticipant(participantId: string): Participant | undefined {
    return this.participants.get(participantId);
  }

  /**
   * Evaluates if participant has sufficient credit line or margin collateral to cover exposure.
   */
  public checkMarginAdequacy(
    participantId: string,
    additionalExposureUSD: number
  ): { passes: boolean; marginDeficitUSD: number; requiredCollateralUSD: number } {
    const participant = this.participants.get(participantId);
    if (!participant) {
      return { passes: false, marginDeficitUSD: additionalExposureUSD, requiredCollateralUSD: additionalExposureUSD };
    }

    const newExposure = participant.currentExposureUSD + additionalExposureUSD;
    const requiredCollateralUSD = newExposure * (participant.marginRequirementPct / 100);
    const marginDeficitUSD = Math.max(0, requiredCollateralUSD - participant.collateralBalanceUSD);

    const isWithinCreditLimit = newExposure <= participant.creditLimitUSD;
    const passes = isWithinCreditLimit && marginDeficitUSD <= 0;

    return { passes, marginDeficitUSD, requiredCollateralUSD };
  }

  public issueMarginCall(participantId: string, marginDeficitUSD: number, requiredCollateralUSD: number): CollateralMarginCall {
    const participant = this.participants.get(participantId);
    const callId = `MC_${Date.now()}_${participantId}`;
    
    const marginCall: CollateralMarginCall = {
      callId,
      participantId,
      requiredCollateralUSD,
      currentCollateralUSD: participant ? participant.collateralBalanceUSD : 0,
      marginDeficitUSD,
      dueDate: Date.now() + 86400000, // 24 hours to meet margin call
      status: 'ISSUED'
    };

    this.activeMarginCalls.set(callId, marginCall);
    return marginCall;
  }
}

// ============================================================================
// REAL-TIME SETTLEMENT ORCHESTRATOR
// ============================================================================

export class RealTimeSettlementOrchestrator extends EventEmitter {
  private queue: Map<string, SettlementInstruction> = new Map();
  private adapters: Map<ClearingHouseVenue, IClearingHouseAdapter> = new Map();
  private nettingEngine: MultilateralNettingEngine;
  private ledgerSyncManager: LedgerSyncManager;
  private marginManager: MarginAndCollateralManager;

  constructor() {
    super();
    this.nettingEngine = new MultilateralNettingEngine();
    this.ledgerSyncManager = new LedgerSyncManager();
    this.marginManager = new MarginAndCollateralManager();

    // Register Default Clearing House Adapters
    this.registerAdapter(new DTCCClearingAdapter());
    this.registerAdapter(new FedwireClearingAdapter());
    this.registerAdapter(new SwiftGpiClearingAdapter());
    this.registerAdapter(new InternalLedgerClearingAdapter());
  }

  public registerAdapter(adapter: IClearingHouseAdapter): void {
    this.adapters.set(adapter.venue, adapter);
  }

  public registerParticipant(participant: Participant): void {
    this.marginManager.registerParticipant(participant);
  }

  /**
   * Submit new settlement instruction into real-time clearing pipeline
   */
  public async submitInstruction(instruction: SettlementInstruction): Promise<SettlementInstruction> {
    this.queue.set(instruction.instructionId, instruction);
    this.emit('instruction:submitted', instruction);

    // Immediate processing for RTGS
    if (instruction.method === 'RTGS') {
      return await this.processGrossSettlement(instruction.instructionId);
    }

    instruction.status = 'QUEUED';
    this.queue.set(instruction.instructionId, instruction);
    return instruction;
  }

  /**
   * Real-Time Gross Settlement (RTGS) execution path
   */
  public async processGrossSettlement(instructionId: string): Promise<SettlementInstruction> {
    const inst = this.queue.get(instructionId);
    if (!inst) throw new Error(`Instruction ${instructionId} not found`);

    const usdVal = inst.amount * inst.exchangeRateToUSD;

    // 1. Check Margin Adequacy
    const marginCheck = this.marginManager.checkMarginAdequacy(inst.senderParticipantId, usdVal);
    if (!marginCheck.passes) {
      inst.status = 'MARGIN_CHECK_PENDING';
      this.marginManager.issueMarginCall(inst.senderParticipantId, marginCheck.marginDeficitUSD, marginCheck.requiredCollateralUSD);
      this.emit('settlement:margin_call', { instructionId, marginCheck });
      return inst;
    }

    // 2. Prepare Ledger Lock
    const sender = this.marginManager.getParticipant(inst.senderParticipantId);
    const receiver = this.marginManager.getParticipant(inst.receiverParticipantId);

    const syncRecord = await this.ledgerSyncManager.prepareAtomicLock(
      inst.instructionId,
      sender ? sender.ledgerAccountId : inst.senderParticipantId,
      receiver ? receiver.ledgerAccountId : inst.receiverParticipantId,
      inst.amount,
      inst.symbolOrCurrency
    );

    // 3. Dispatch to Clearing Venue
    const adapter = this.adapters.get(inst.venue) || this.adapters.get('INTERNAL_LEDGER');
    if (!adapter) {
      inst.status = 'FAILED';
      inst.failureReason = `No clearing adapter available for venue: ${inst.venue}`;
      await this.ledgerSyncManager.abortTransaction(syncRecord.syncId);
      return inst;
    }

    inst.status = 'CLEARING';
    const clearingResult = await adapter.submitForClearing(inst);

    if (clearingResult.success) {
      // 4. Commit double entry balance changes
      await this.ledgerSyncManager.commitTransaction(syncRecord.syncId);
      inst.status = 'SETTLED';
      inst.actualSettlementTime = Date.now();
      this.emit('settlement:success', inst);
    } else {
      await this.ledgerSyncManager.abortTransaction(syncRecord.syncId);
      inst.status = 'FAILED';
      inst.failureReason = clearingResult.error || 'Clearing venue rejected settlement';
      this.emit('settlement:failed', inst);
    }

    this.queue.set(inst.instructionId, inst);
    return inst;
  }

  /**
   * Triggers batch multilateral netting across all queued instructions
   */
  public async executeBatchNetting(batchId: string): Promise<NettingResult> {
    const pendingInstructions = Array.from(this.queue.values()).filter(
      i => i.status === 'QUEUED' || i.status === 'PENDING'
    );

    const nettingResult = this.nettingEngine.calculateNetPositions(batchId, pendingInstructions);

    // Settle each netted position
    for (const netInst of nettingResult.nettedInstructions) {
      await this.submitInstruction(netInst);
    }

    // Update status of original queued instructions
    for (const origInst of pendingInstructions) {
      origInst.status = 'NETTED';
      this.queue.set(origInst.instructionId, origInst);
    }

    this.emit('batch:netting_completed', nettingResult);
    return nettingResult;
  }

  public getInstructionStatus(instructionId: string): SettlementInstruction | undefined {
    return this.queue.get(instructionId);
  }
}

// Global Singleton Instance export
export const globalSettlementOrchestrator = new RealTimeSettlementOrchestrator();