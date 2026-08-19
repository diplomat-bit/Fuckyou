

// --- CONSOLIDATED FROM: ./clarity/part23_tokenization_compliance_engine.ts ---

import { EventEmitter } from 'events';

/**
 * Part 23: Asset Tokenization Compliance Engine
 * Focuses on Real-World Asset (RWA) tokenization compliance under U.S. H.R. 3633
 * (Financial Innovation and Technology for the 21st Century Act / FIT21),
 * SEC Regulation D / S / A+, and Regulation CFTC Digital Commodity frameworks.
 */

export type RWAAssetType =
  | 'REAL_ESTATE'
  | 'DEBT_INSTRUMENT'
  | 'TAX_LIEN'
  | 'EQUITY_CERTIFICATE'
  | 'SOVEREIGN_TREASURY'
  | 'INFRASTRUCTURE_REVENUE';

export type HR3633Classification =
  | 'DIGITAL_COMMODITY'          // Restricted/Functional Blockchain network under FIT21 Section 101
  | 'RESTRICTED_DIGITAL_ASSET'   // SEC Jurisdiction (Investment Contract)
  | 'HYBRID_PAYMENT_STABLECOIN'  // Payment token subject to bank/treasury regulatory oversight
  | 'EXEMPT_RWA_DEBT';          // Qualified Institutional Debt instrument under HR 3633 Sec 304

export type InvestorAccreditationStatus =
  | 'ACCREDITED_INDIVIDUAL'
  | 'QUALIFIED_PURCHASER'
  | 'INSTITUTIONAL_BUYER'
  | 'RETAIL_RESTRICTED'
  | 'FOREIGN_NON_US';

export interface InvestorKYCProfile {
  investorId: string;
  walletAddress: string;
  jurisdictionISO: string;
  accreditationStatus: InvestorAccreditationStatus;
  kycVerificationTimestamp: number;
  kycExpirationTimestamp: number;
  amlRiskScore: number; // 0 (lowest risk) to 100 (highest risk)
  isSanctioned: boolean;
  taxIdHash: string;
}

export interface TokenizedRWA {
  assetId: string;
  symbol: string;
  assetType: RWAAssetType;
  underlyingValueUSD: number;
  totalFractionalTokens: bigint;
  issuanceJurisdiction: string;
  deedOrContractHash: string;
  hr3633Classification: HR3633Classification;
  blockchainNetwork: string;
  smartContractAddress: string;
  isDecentralizedSystem: boolean; // Under HR 3633 20% control cap criteria
  creatorOwnershipPercentage: number; // Max 20% to qualify as Digital Commodity under HR 3633
  lockupPeriodSeconds: number;
  createdTimestamp: number;
}

export interface ComplianceValidationResult {
  isCompliant: boolean;
  classification: HR3633Classification;
  errors: string[];
  warnings: string[];
  requiredDisclosures: string[];
  timestamp: number;
  proofHash: string;
}

export interface TransferValidationResult {
  allowed: boolean;
  reason?: string;
  transferRestrictionCode?: number;
  requiresRegulatorNotification: boolean;
  taxWithholdingEstimateUSD: number;
}

export interface HR3633AuditReport {
  assetId: string;
  complianceScore: number; // 0 - 100
  fit21Section101Qualified: boolean;
  secRegistrationExemption: string;
  cftcJurisdictionStatus: string;
  verifiedTitleHash: string;
  timestamp: number;
  regulatorySignOffHash: string;
}

export class AssetTokenizationComplianceEngine extends EventEmitter {
  private registeredAssets: Map<string, TokenizedRWA> = new Map();
  private investorRegistry: Map<string, InvestorKYCProfile> = new Map();
  private complianceLogs: Array<{ timestamp: number; assetId: string; action: string; details: string }> = [];

  constructor() {
    super();
  }

  /**
   * Registers a investor KYC profile into the compliance system.
   */
  public registerInvestorProfile(profile: InvestorKYCProfile): void {
    if (profile.isSanctioned) {
      throw new Error(`Cannot register investor ${profile.investorId}: Present on OFAC/Sanctions list.`);
    }
    this.investorRegistry.set(profile.walletAddress.toLowerCase(), profile);
    this.emit('investorRegistered', { wallet: profile.walletAddress, status: profile.accreditationStatus });
  }

  /**
   * Analyzes an asset against H.R. 3633 (FIT21) criteria to determine
   * regulatory classification (Digital Commodity vs Restricted Digital Security).
   */
  public classifyAssetUnderHR3633(asset: TokenizedRWA): HR3633Classification {
    // HR 3633 Criteria for Decentralized System / Digital Commodity:
    // 1. No single entity or related persons control > 20% of voting power/tokens.
    // 2. The underlying blockchain network is functional and operational.
    // 3. Debt/Real Estate RWA typically remain Securities or Exempt Debt unless specifically structured.
    
    if (asset.assetType === 'SOVEREIGN_TREASURY' || asset.assetType === 'DEBT_INSTRUMENT') {
      if (asset.underlyingValueUSD >= 5_000_000) {
        return 'EXEMPT_RWA_DEBT';
      }
      return 'RESTRICTED_DIGITAL_ASSET';
    }

    if (asset.isDecentralizedSystem && asset.creatorOwnershipPercentage <= 20.0) {
      return 'DIGITAL_COMMODITY';
    }

    return 'RESTRICTED_DIGITAL_ASSET';
  }

  /**
   * Evaluates tokenization eligibility for Real Estate, Debt, or Tax Liens.
   */
  public validateAssetTokenization(asset: TokenizedRWA): ComplianceValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredDisclosures: string[] = [];

    // Check title deed hash integrity
    if (!asset.deedOrContractHash || asset.deedOrContractHash.length !== 64) {
      errors.push('Invalid or missing cryptographic hash of underlying deed/legal contract.');
    }

    // Check valuation limits
    if (asset.underlyingValueUSD <= 0) {
      errors.push('Asset valuation must be greater than zero.');
    }

    // HR 3633 Exemption & Disclosure Rules
    const classification = this.classifyAssetUnderHR3633(asset);

    if (classification === 'RESTRICTED_DIGITAL_ASSET') {
      requiredDisclosures.push('SEC Form D filing or Form 1-A Offering Circular required.');
      requiredDisclosures.push('Qualified Custodian mandatory for underlying physical deed/collateral.');
      if (asset.underlyingValueUSD > 75_000_000) {
        errors.push('Exceeds Regulation A+ Tier 2 maximum limit of $75M. Full SEC registration required.');
      }
    } else if (classification === 'DIGITAL_COMMODITY') {
      requiredDisclosures.push('FIT21 Notice of Intent to Certify Functional Network with CFTC.');
    }

    // Real Estate specific checks
    if (asset.assetType === 'REAL_ESTATE') {
      if (asset.lockupPeriodSeconds < 365 * 86400 && classification === 'RESTRICTED_DIGITAL_ASSET') {
        warnings.push('Reg D 506(c) requires a minimum 1-year lockup period for non-accredited resales.');
      }
      requiredDisclosures.push('Property Appraisal Report & Title Insurance Policy Hash verification.');
    }

    // Debt Instrument specific checks
    if (asset.assetType === 'DEBT_INSTRUMENT') {
      requiredDisclosures.push('FINRA Regulation Rule 2242 Debt Research disclosure required.');
    }

    const isCompliant = errors.length === 0;
    const proofHash = this.computeProofHash(asset, isCompliant, classification);

    const result: ComplianceValidationResult = {
      isCompliant,
      classification,
      errors,
      warnings,
      requiredDisclosures,
      timestamp: Date.now(),
      proofHash,
    };

    if (isCompliant) {
      asset.hr3633Classification = classification;
      this.registeredAssets.set(asset.assetId, asset);
      this.logAction(asset.assetId, 'TOKENIZATION_APPROVED', `Asset verified under HR3633 as ${classification}`);
    } else {
      this.logAction(asset.assetId, 'TOKENIZATION_REJECTED', `Errors: ${errors.join('; ')}`);
    }

    return result;
  }

  /**
   * Validates peer-to-peer or exchange token transfer between two wallets.
   * Enforces Reg D lockups, accredited checks, and sanctions rules.
   */
  public validateTokenTransfer(
    assetId: string,
    senderWallet: string,
    recipientWallet: string,
    tokenAmount: bigint
  ): TransferValidationResult {
    const asset = this.registeredAssets.get(assetId);
    if (!asset) {
      return { allowed: false, reason: 'Asset not registered or non-compliant.', requiresRegulatorNotification: false, taxWithholdingEstimateUSD: 0 };
    }

    const sender = this.investorRegistry.get(senderWallet.toLowerCase());
    const recipient = this.investorRegistry.get(recipientWallet.toLowerCase());

    if (!sender) {
      return { allowed: false, reason: 'Sender wallet failed KYC/AML lookup.', requiresRegulatorNotification: false, taxWithholdingEstimateUSD: 0 };
    }

    if (!recipient) {
      return { allowed: false, reason: 'Recipient wallet failed KYC/AML lookup.', requiresRegulatorNotification: false, taxWithholdingEstimateUSD: 0 };
    }

    if (sender.isSanctioned || recipient.isSanctioned) {
      return { allowed: false, reason: 'Transaction blocked due to Sanctions/OFAC flag.', requiresRegulatorNotification: true, taxWithholdingEstimateUSD: 0 };
    }

    // Check KYC expiration
    const now = Date.now();
    if (sender.kycExpirationTimestamp < now || recipient.kycExpirationTimestamp < now) {
      return { allowed: false, reason: 'KYC accreditation expired for one or both parties.', requiresRegulatorNotification: false, taxWithholdingEstimateUSD: 0 };
    }

    // Accreditation rules under SEC Rule 506(c) / HR 3633
    if (asset.hr3633Classification === 'RESTRICTED_DIGITAL_ASSET') {
      if (recipient.accreditationStatus === 'RETAIL_RESTRICTED') {
        const lockupExpiry = asset.createdTimestamp + asset.lockupPeriodSeconds * 1000;
        if (now < lockupExpiry) {
          return {
            allowed: false,
            reason: 'Asset is under mandatory 1-year Rule 144 lockup period for retail investors.',
            transferRestrictionCode: 144,
            requiresRegulatorNotification: false,
            taxWithholdingEstimateUSD: 0
          };
        }
      }
    }

    // Tax withholding calculation for Foreign non-US holders under FATCA
    let taxWithholdingEstimateUSD = 0;
    if (recipient.jurisdictionISO !== 'USA' && asset.assetType === 'DEBT_INSTRUMENT') {
      const tokenRatio = Number(tokenAmount) / Number(asset.totalFractionalTokens);
      const transactionValueUSD = tokenRatio * asset.underlyingValueUSD;
      taxWithholdingEstimateUSD = transactionValueUSD * 0.30; // 30% withholding tax benchmark
    }

    this.logAction(assetId, 'TRANSFER_APPROVED', `From ${senderWallet} to ${recipientWallet}, Amount: ${tokenAmount}`);

    return {
      allowed: true,
      requiresRegulatorNotification: asset.underlyingValueUSD > 10_000_000,
      taxWithholdingEstimateUSD
    };
  }

  /**
   * Generates a formal regulatory audit report under H.R. 3633.
   */
  public generateHR3633AuditReport(assetId: string): HR3633AuditReport {
    const asset = this.registeredAssets.get(assetId);
    if (!asset) {
      throw new Error(`Asset ${assetId} not found.`);
    }

    const fit21Qualified = asset.isDecentralizedSystem && asset.creatorOwnershipPercentage <= 20;
    const score = fit21Qualified ? 95 : 78;

    return {
      assetId: asset.assetId,
      complianceScore: score,
      fit21Section101Qualified: fit21Qualified,
      secRegistrationExemption: asset.hr3633Classification === 'RESTRICTED_DIGITAL_ASSET' ? 'SEC Reg D Rule 506(c)' : 'N/A (CFTC Digital Commodity)',
      cftcJurisdictionStatus: fit21Qualified ? 'CFTC Exclusive Jurisdiction' : 'SEC Dual Oversight',
      verifiedTitleHash: asset.deedOrContractHash,
      timestamp: Date.now(),
      regulatorySignOffHash: this.computeAuditHash(asset.assetId, score)
    };
  }

  public getComplianceLogs(): Array<{ timestamp: number; assetId: string; action: string; details: string }> {
    return [...this.complianceLogs];
  }

  private computeProofHash(asset: TokenizedRWA, compliant: boolean, classification: HR3633Classification): string {
    const raw = `${asset.assetId}:${asset.deedOrContractHash}:${compliant}:${classification}:${Date.now()}`;
    return this.simpleHash(raw);
  }

  private computeAuditHash(assetId: string, score: number): string {
    return this.simpleHash(`AUDIT:${assetId}:${score}:${Date.now()}`);
  }

  private logAction(assetId: string, action: string, details: string): void {
    this.complianceLogs.push({
      timestamp: Date.now(),
      assetId,
      action,
      details
    });
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}${hex}${hex}${hex}`.substring(0, 64);
  }
}

export default AssetTokenizationComplianceEngine;