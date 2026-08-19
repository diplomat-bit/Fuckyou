

// --- CONSOLIDATED FROM: ./server/models/transaction.model.ts ---

import { Schema, model, Document } from 'mongoose';
import * as crypto from 'crypto';

/**
 * Supported asset classes for global transactions within the Illuminati AI ecosystem.
 */
export enum AssetClass {
  REAL_ESTATE = 'REAL_ESTATE',
  VEHICLE = 'VEHICLE',
  COMMODITY = 'COMMODITY',
  CURRENCY = 'CURRENCY',
  EQUITY = 'EQUITY',
  SOVEREIGN_DEBT = 'SOVEREIGN_DEBT',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  SUPPLY_CHAIN_BATCH = 'SUPPLY_CHAIN_BATCH',
  GOVERNMENT_SERVICE = 'GOVERNMENT_SERVICE',
  HUMAN_RESOURCE = 'HUMAN_RESOURCE'
}

/**
 * Transaction types representing any possible economic or sovereign action.
 */
export enum TransactionType {
  ACQUISITION = 'ACQUISITION',
  TRANSFER = 'TRANSFER',
  TAX_PAYMENT = 'TAX_PAYMENT',
  SOVEREIGN_ISSUANCE = 'SOVEREIGN_ISSUANCE',
  SUPPLY_CHAIN_DISPATCH = 'SUPPLY_CHAIN_DISPATCH',
  LIQUIDATION = 'LIQUIDATION',
  ESCROW_DEPOSIT = 'ESCROW_DEPOSIT',
  ESCROW_RELEASE = 'ESCROW_RELEASE',
  FINE_ASSESSMENT = 'FINE_ASSESSMENT',
  SUBSIDY_DISBURSEMENT = 'SUBSIDY_DISBURSEMENT'
}

/**
 * Status of the transaction in the global ledger.
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  CLEARED = 'CLEARED',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  REVOKED = 'REVOKED'
}

/**
 * Entity types participating in the transaction.
 */
export enum EntityType {
  GOVERNMENT = 'GOVERNMENT',
  CORPORATION = 'CORPORATION',
  CITIZEN = 'CITIZEN',
  AI_AGENT = 'AI_AGENT',
  CONGLOMERATE = 'CONGLOMERATE',
  SOVEREIGN_POOL = 'SOVEREIGN_POOL'
}

export interface IParty {
  entityId: string;
  entityType: EntityType;
  accountNumber: string;
  routingCode: string;
  jurisdiction: string;
}

export interface IAssetDetails {
  assetClass: AssetClass;
  assetId: string;
  quantity: number;
  unitOfMeasure: string;
  description: string;
  specifications: Record<string, any>;
}

export interface IFinancialDetails {
  grossAmount: number;
  currency: string;
  exchangeRateToUSD: number;
  transactionFee: number;
  sovereignTaxAmount: number;
  netAmount: number;
  isEscrowed: boolean;
}

export interface ICryptographicProof {
  hash: string;
  previousHash: string;
  signature: string;
  publicKey: string;
  nonce: number;
}

export interface ITransaction extends Document {
  transactionId: string;
  ledgerId: string;
  sequenceNumber: number;
  type: TransactionType;
  status: TransactionStatus;
  sender: IParty;
  recipient: IParty;
  asset: IAssetDetails;
  financials: IFinancialDetails;
  proof: ICryptographicProof;
  metadata: Record<string, any>;
  initiatedAt: Date;
  settledAt?: Date;
  calculateHash(): string;
}

const PartySchema = new Schema<IParty>({
  entityId: { type: String, required: true, index: true },
  entityType: { type: String, enum: Object.values(EntityType), required: true },
  accountNumber: { type: String, required: true },
  routingCode: { type: String, required: true },
  jurisdiction: { type: String, required: true, default: 'GLOBAL_OVERLORD' }
}, { _id: false });

const AssetDetailsSchema = new Schema<IAssetDetails>({
  assetClass: { type: String, enum: Object.values(AssetClass), required: true },
  assetId: { type: String, required: true, index: true },
  quantity: { type: Number, required: true, min: 0 },
  unitOfMeasure: { type: String, required: true },
  description: { type: String, required: true },
  specifications: { type: Schema.Types.Mixed, default: {} }
}, { _id: false });

const FinancialDetailsSchema = new Schema<IFinancialDetails>({
  grossAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD' },
  exchangeRateToUSD: { type: Number, required: true, default: 1.0 },
  transactionFee: { type: Number, required: true, default: 0.0 },
  sovereignTaxAmount: { type: Number, required: true, default: 0.0 },
  netAmount: { type: Number, required: true },
  isEscrowed: { type: Boolean, required: true, default: false }
}, { _id: false });

const CryptographicProofSchema = new Schema<ICryptographicProof>({
  hash: { type: String, required: true, unique: true },
  previousHash: { type: String, required: true },
  signature: { type: String, required: true },
  publicKey: { type: String, required: true },
  nonce: { type: Number, required: true, default: 0 }
}, { _id: false });

const TransactionSchema = new Schema<ITransaction>({
  transactionId: { type: String, required: true, unique: true, index: true },
  ledgerId: { type: String, required: true, index: true },
  sequenceNumber: { type: Number, required: true, unique: true, index: true },
  type: { type: String, enum: Object.values(TransactionType), required: true },
  status: { type: String, enum: Object.values(TransactionStatus), required: true, default: TransactionStatus.PENDING },
  sender: { type: PartySchema, required: true },
  recipient: { type: PartySchema, required: true },
  asset: { type: AssetDetailsSchema, required: true },
  financials: { type: FinancialDetailsSchema, required: true },
  proof: { type: CryptographicProofSchema, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  initiatedAt: { type: Date, required: true, default: Date.now },
  settledAt: { type: Date }
}, {
  timestamps: { createdAt: 'initiatedAt', updatedAt: false },
  versionKey: false
});

TransactionSchema.methods.calculateHash = function (this: ITransaction): string {
  const dataToHash = JSON.stringify({
    transactionId: this.transactionId,
    ledgerId: this.ledgerId,
    sequenceNumber: this.sequenceNumber,
    type: this.type,
    sender: this.sender,
    recipient: this.recipient,
    asset: this.asset,
    financials: this.financials,
    previousHash: this.proof.previousHash,
    nonce: this.proof.nonce,
    initiatedAt: this.initiatedAt
  });
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
};

const blockMutation = (next: (err?: Error) => void) => {
  next(new Error('CRITICAL LEDGER ERROR: Transactions are immutable and cannot be modified or deleted.'));
};

TransactionSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('CRITICAL LEDGER ERROR: Cannot update an existing transaction. Ledger is immutable.'));
  }
  
  const calculatedNet = this.financials.grossAmount - this.financials.transactionFee - this.financials.sovereignTaxAmount;
  if (Math.abs(this.financials.netAmount - calculatedNet) > 0.000001) {
    return next(new Error('CRITICAL LEDGER ERROR: Financial net amount mismatch.'));
  }

  const computedHash = this.calculateHash();
  if (this.proof.hash !== computedHash) {
    return next(new Error('CRITICAL LEDGER ERROR: Cryptographic hash mismatch. Transaction integrity compromised.'));
  }

  next();
});

TransactionSchema.pre('updateOne', blockMutation);
TransactionSchema.pre('updateMany', blockMutation);
TransactionSchema.pre('findOneAndUpdate', blockMutation);
TransactionSchema.pre('findByIdAndUpdate', blockMutation);
TransactionSchema.pre('deleteOne', blockMutation);
TransactionSchema.pre('deleteMany', blockMutation);
TransactionSchema.pre('findOneAndDelete', blockMutation);
TransactionSchema.pre('findByIdAndDelete', blockMutation);
TransactionSchema.pre('remove', blockMutation);

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);