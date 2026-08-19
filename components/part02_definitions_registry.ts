

// --- CONSOLIDATED FROM: ./clarity/part02_definitions_registry.ts ---

/**
 * @file clarity/part02_definitions_registry.ts
 * @package clarity
 * @summary Part 2: Core Definitions Registry
 * @description Implements TypeScript interfaces, type guards, and validation schemas 
 * for digital assets, digital commodities, digital securities, and payment stablecoins 
 * as defined by federal regulatory frameworks (e.g., FIT21, Lummis-Gillibrand, and SEC/CFTC guidance).
 */

/**
 * Regulatory classification categories for digital assets.
 */
export type RegulatoryCategory =
  | 'DIGITAL_COMMODITY'
  | 'RESTRICTED_DIGITAL_COMMODITY'
  | 'DIGITAL_SECURITY'
  | 'PAYMENT_STABLECOIN'
  | 'HYBRID_ASSET'
  | 'UNCLASSIFIED';

/**
 * Consensus mechanisms utilized by the underlying blockchain network.
 */
export type ConsensusMechanism =
  | 'PROOF_OF_WORK'
  | 'PROOF_OF_STAKE'
  | 'DELEGATED_PROOF_OF_STAKE'
  | 'PROOF_OF_AUTHORITY'
  | 'PROOF_OF_HISTORY'
  | 'BYZANTINE_FAULT_TOLERANT'
  | 'OTHER';

/**
 * Types of reserve assets backing a payment stablecoin.
 */
export type ReserveAssetType =
  | 'USD_CASH'
  | 'US_TREASURY_BILLS'
  | 'REVERSE_REPURCHASE_AGREEMENTS'
  | 'FOREIGN_FIAT_CASH'
  | 'OTHER_HIGH_QUALITY_LIQUID_ASSETS'
  | 'COMMODITIES'
  | 'DIGITAL_ASSETS';

/**
 * Validation result structure for regulatory compliance checks.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

/**
 * Quantitative metrics used to evaluate the decentralization of a digital asset network.
 * Aligns with FIT21 (Financial Innovation and Technology for the 21st Century Act) criteria.
 */
export interface DecentralizationMetrics {
  /** Percentage of voting power or token supply controlled by the creator, sponsor, or affiliates. Must be < 20% for high decentralization. */
  promoterControlPercentage: number;
  
  /** Number of independent active validator nodes or mining pools operating on the network. */
  activeValidatorCount: number;
  
  /** Gini coefficient of token distribution (0 = perfect equality, 1 = perfect inequality). */
  tokenDistributionGini: number;
  
  /** Whether any single entity has unilateral power to alter the network's code or governance rules. */
  hasUnilateralControl: boolean;
  
  /** Number of independent development teams actively contributing to the core repository. */
  independentDevTeamCount: number;
  
  /** Percentage of governance proposals passed that were initiated by non-affiliated community members. */
  communityProposalRatio: number;
}

/**
 * Howey Test criteria evaluation for determining security status.
 */
export interface HoweyTestEvaluation {
  /** 1. Investment of money. */
  investmentOfMoney: {
    exists: boolean;
    description: string;
  };
  /** 2. In a common enterprise. */
  commonEnterprise: {
    exists: boolean;
    description: string;
  };
  /** 3. With a reasonable expectation of profits. */
  expectationOfProfits: {
    exists: boolean;
    description: string;
  };
  /** 4. To be derived from the entrepreneurial or managerial efforts of others. */
  effortsOfOthers: {
    exists: boolean;
    description: string;
  };
  /** Calculated score based on the 4 prongs (0 to 4). A score of 4 strongly indicates a security. */
  overallScore: number;
}

/**
 * Base interface for all digital assets in the registry.
 */
export interface BaseDigitalAsset {
  id: string;
  ticker: string;
  name: string;
  contractAddress?: string;
  blockchainNetwork: string;
  totalSupply: number;
  circulatingSupply: number;
  launchDate: Date;
  regulatoryCategory: RegulatoryCategory;
  lastUpdated: Date;
}

/**
 * Digital Commodity definition (CFTC jurisdiction).
 * Typically requires a high degree of decentralization and functional utility.
 */
export interface DigitalCommodity extends BaseDigitalAsset {
  regulatoryCategory: 'DIGITAL_COMMODITY';
  /** Metrics proving the decentralized nature of the network. */
  decentralizationMetrics: DecentralizationMetrics;
  /** Specific utility or consumption use case of the token within the network. */
  utilityDescription: string;
  /** Open-source repository URL for the protocol. */
  openSourceRepositoryUrl: string;
  /** Consensus mechanism securing the commodity. */
  consensusMechanism: ConsensusMechanism;
}

/**
 * Restricted Digital Commodity definition.
 * Assets that are not fully decentralized but do not represent traditional investment contracts.
 */
export interface RestrictedDigitalCommodity extends BaseDigitalAsset {
  regulatoryCategory: 'RESTRICTED_DIGITAL_COMMODITY';
  decentralizationMetrics: DecentralizationMetrics;
  disclosureFilingUrl: string;
  transferRestrictionsDescription: string;
}

/**
 * Digital Security definition (SEC jurisdiction).
 * Represents an investment contract, equity, debt, or profit-sharing instrument.
 */
export interface DigitalSecurity extends BaseDigitalAsset {
  regulatoryCategory: 'DIGITAL_SECURITY';
  /** Howey Test analysis details. */
  howeyTest: HoweyTestEvaluation;
  /** SEC registration status or exemption type (e.g., Reg D, Reg S, Reg A+). */
  secRegistrationStatus: string;
  /** Legal issuer entity details. */
  issuerDetails: {
    legalName: string;
    jurisdiction: string;
    cikNumber?: string; // Central Index Key for SEC filings
  };
  /** Rights granted to the holder (e.g., dividends, liquidation preference, voting rights). */
  holderRights: string[];
}

/**
 * Payment Stablecoin definition.
 * Pegged to a fiat currency and backed by high-quality liquid reserves.
 */
export interface PaymentStablecoin extends BaseDigitalAsset {
  regulatoryCategory: 'PAYMENT_STABLECOIN';
  /** The fiat currency or basket of currencies the stablecoin is pegged to (e.g., "USD"). */
  peggedCurrency: string;
  /** Target peg value (typically 1.00). */
  targetValue: number;
  /** Current deviation tolerance before triggering de-peg alerts. */
  pegTolerance: number;
  /** Details of the reserve backing. */
  reserves: {
    totalReserveValue: number;
    lastAttestationDate: Date;
    attestationFirm: string;
    attestationReportUrl: string;
    breakdown: Array<{
      type: ReserveAssetType;
      percentage: number;
      amount: number;
      custodian: string;
    }>;
  };
  /** Issuer licensing details (e.g., State Money Transmitter License, Federal Trust Charter). */
  licensing: {
    issuerName: string;
    licenses: Array<{
      jurisdiction: string;
      licenseNumber: string;
      licenseType: string;
    }>;
  };
}

/**
 * Hybrid Asset definition.
 * Assets that exhibit characteristics of multiple categories or are transitioning between states.
 */
export interface HybridAsset extends BaseDigitalAsset {
  regulatoryCategory: 'HYBRID_ASSET';
  primaryCategory: Exclude<RegulatoryCategory, 'HYBRID_ASSET' | 'UNCLASSIFIED'>;
  secondaryCategory: Exclude<RegulatoryCategory, 'HYBRID_ASSET' | 'UNCLASSIFIED'>;
  transitionPlanUrl?: string;
  justification: string;
}

/**
 * Type guards to safely cast and verify asset types at runtime.
 */
export const TypeGuards = {
  isDigitalCommodity(asset: BaseDigitalAsset): asset is DigitalCommodity {
    return asset.regulatoryCategory === 'DIGITAL_COMMODITY';
  },

  isRestrictedDigitalCommodity(asset: BaseDigitalAsset): asset is RestrictedDigitalCommodity {
    return asset.regulatoryCategory === 'RESTRICTED_DIGITAL_COMMODITY';
  },

  isDigitalSecurity(asset: BaseDigitalAsset): asset is DigitalSecurity {
    return asset.regulatoryCategory === 'DIGITAL_SECURITY';
  },

  isPaymentStablecoin(asset: BaseDigitalAsset): asset is PaymentStablecoin {
    return asset.regulatoryCategory === 'PAYMENT_STABLECOIN';
  },

  isHybridAsset(asset: BaseDigitalAsset): asset is HybridAsset {
    return asset.regulatoryCategory === 'HYBRID_ASSET';
  }
};

/**
 * Core Definitions Registry and Validation Engine.
 * Provides programmatic validation of assets against statutory definitions.
 */
export class DefinitionsRegistry {
  private registry: Map<string, BaseDigitalAsset> = new Map();

  /**
   * Registers a digital asset in the local memory registry.
   */
  public registerAsset(asset: BaseDigitalAsset): ValidationResult {
    const validation = this.validateAsset(asset);
    if (validation.valid) {
      this.registry.set(asset.id, asset);
    }
    return validation;
  }

  /**
   * Retrieves an asset from the registry by ID.
   */
  public getAsset(id: string): BaseDigitalAsset | undefined {
    return this.registry.get(id);
  }

  /**
   * Lists all registered assets.
   */
  public listAssets(): BaseDigitalAsset[] {
    return Array.from(this.registry.values());
  }

  /**
   * Validates any digital asset against its declared regulatory category rules.
   */
  public validateAsset(asset: BaseDigitalAsset): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Base validations
    if (!asset.id || asset.id.trim() === '') errors.push('Asset ID is required.');
    if (!asset.ticker || asset.ticker.trim() === '') errors.push('Asset ticker is required.');
    if (!asset.name || asset.name.trim() === '') errors.push('Asset name is required.');
    if (asset.totalSupply <= 0) errors.push('Total supply must be greater than zero.');
    if (asset.circulatingSupply < 0 || asset.circulatingSupply > asset.totalSupply) {
      errors.push('Circulating supply must be non-negative and less than or equal to total supply.');
    }

    // Category-specific validations
    switch (asset.regulatoryCategory) {
      case 'DIGITAL_COMMODITY':
        this.validateCommodityFields(asset as DigitalCommodity, errors, warnings);
        break;
      case 'RESTRICTED_DIGITAL_COMMODITY':
        this.validateRestrictedCommodityFields(asset as RestrictedDigitalCommodity, errors, warnings);
        break;
      case 'DIGITAL_SECURITY':
        this.validateSecurityFields(asset as DigitalSecurity, errors, warnings);
        break;
      case 'PAYMENT_STABLECOIN':
        this.validateStablecoinFields(asset as PaymentStablecoin, errors, warnings);
        break;
      case 'HYBRID_ASSET':
        this.validateHybridFields(asset as HybridAsset, errors, warnings);
        break;
      case 'UNCLASSIFIED':
        warnings.push('Asset is currently unclassified. Regulatory risk is high.');
        break;
      default:
        errors.push(`Unknown regulatory category: ${asset.regulatoryCategory}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates Digital Commodity specific rules.
   */
  private validateCommodityFields(asset: DigitalCommodity, errors: string[], warnings: string[]): void {
    if (!asset.decentralizationMetrics) {
      errors.push('Decentralization metrics are required for digital commodities.');
      return;
    }

    const metrics = asset.decentralizationMetrics;

    // FIT21 Threshold: Promoter control should be under 20% for a fully decentralized commodity
    if (metrics.promoterControlPercentage >= 20) {
      errors.push(
        `Promoter control is ${metrics.promoterControlPercentage}%. Under FIT21, promoter control must be under 20% to qualify as a decentralized digital commodity.`
      );
    }

    if (metrics.hasUnilateralControl) {
      errors.push('A digital commodity cannot have any single entity with unilateral control over the network.');
    }

    if (metrics.activeValidatorCount < 31) {
      warnings.push(
        `Low validator count (${metrics.activeValidatorCount}). Networks with fewer than 31 active validators face heightened centralization scrutiny.`
      );
    }

    if (!asset.utilityDescription || asset.utilityDescription.trim() === '') {
      errors.push('Utility description is required to establish non-investment consumption use.');
    }

    if (!asset.openSourceRepositoryUrl || !asset.openSourceRepositoryUrl.startsWith('http')) {
      errors.push('A valid open-source repository URL is required for digital commodities.');
    }
  }

  /**
   * Validates Restricted Digital Commodity specific rules.
   */
  private validateRestrictedCommodityFields(asset: RestrictedDigitalCommodity, errors: string[], warnings: string[]): void {
    if (!asset.disclosureFilingUrl || !asset.disclosureFilingUrl.startsWith('http')) {
      errors.push('Restricted digital commodities must have a valid disclosure filing URL.');
    }
    if (!asset.transferRestrictionsDescription || asset.transferRestrictionsDescription.trim() === '') {
      errors.push('Transfer restrictions description is required.');
    }
  }

  /**
   * Validates Digital Security specific rules.
   */
  private validateSecurityFields(asset: DigitalSecurity, errors: string[], warnings: string[]): void {
    if (!asset.howeyTest) {
      errors.push('Howey Test evaluation is required for digital securities.');
      return;
    }

    const howey = asset.howeyTest;
    let calculatedScore = 0;
    if (howey.investmentOfMoney.exists) calculatedScore++;
    if (howey.commonEnterprise.exists) calculatedScore++;
    if (howey.expectationOfProfits.exists) calculatedScore++;
    if (howey.effortsOfOthers.exists) calculatedScore++;

    if (howey.overallScore !== calculatedScore) {
      warnings.push(`Howey Test overall score mismatch. Calculated: ${calculatedScore}, Provided: ${howey.overallScore}`);
    }

    if (calculatedScore < 3) {
      warnings.push(`Asset classified as security but Howey score is low (${calculatedScore}/4). Verify classification.`);
    }

    if (!asset.secRegistrationStatus || asset.secRegistrationStatus.trim() === '') {
      errors.push('SEC registration status or exemption type is required.');
    }

    if (!asset.issuerDetails || !asset.issuerDetails.legalName) {
      errors.push('Issuer legal name is required for digital securities.');
    }
  }

  /**
   * Validates Payment Stablecoin specific rules.
   */
  private validateStablecoinFields(asset: PaymentStablecoin, errors: string[], warnings: string[]): void {
    if (!asset.peggedCurrency || asset.peggedCurrency.trim() === '') {
      errors.push('Pegged currency is required for payment stablecoins.');
    }

    if (asset.targetValue <= 0) {
      errors.push('Target peg value must be greater than zero.');
    }

    if (!asset.reserves) {
      errors.push('Reserve details are required for payment stablecoins.');
      return;
    }

    const reserves = asset.reserves;
    if (reserves.totalReserveValue <= 0) {
      errors.push('Total reserve value must be greater than zero.');
    }

    // Verify reserve breakdown sums to 100%
    const totalPercentage = reserves.breakdown.reduce((sum, item) => sum + item.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push(`Reserve breakdown percentages must sum to 100%. Current sum: ${totalPercentage}%`);
    }

    // Check for high-quality liquid assets (HQLA) compliance
    const riskyReserves = reserves.breakdown.filter(
      (item) => item.type === 'DIGITAL_ASSETS' || item.type === 'COMMODITIES'
    );
    if (riskyReserves.length > 0) {
      const riskyPercentage = riskyReserves.reduce((sum, item) => sum + item.percentage, 0);
      warnings.push(
        `Stablecoin contains ${riskyPercentage}% of non-HQLA reserves (digital assets/commodities). This may violate federal payment stablecoin standards.`
      );
    }

    // Attestation age check (should be within last 31 days for standard compliance)
    const daysSinceAttestation = (Date.now() - new Date(reserves.lastAttestationDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceAttestation > 31) {
      errors.push(`Reserve attestation is outdated (${Math.round(daysSinceAttestation)} days ago). Monthly attestations are required.`);
    }

    if (!asset.licensing || asset.licensing.licenses.length === 0) {
      errors.push('Payment stablecoin issuers must possess at least one valid regulatory license.');
    }
  }

  /**
   * Validates Hybrid Asset specific rules.
   */
  private validateHybridFields(asset: HybridAsset, errors: string[], warnings: string[]): void {
    if (!asset.primaryCategory || !asset.secondaryCategory) {
      errors.push('Hybrid assets must define both primary and secondary regulatory categories.');
    }
    if (asset.primaryCategory === asset.secondaryCategory) {
      errors.push('Primary and secondary categories for a hybrid asset must be distinct.');
    }
    if (!asset.justification || asset.justification.trim() === '') {
      errors.push('A detailed regulatory justification is required for hybrid asset classification.');
    }
  }

  /**
   * Classifies an asset dynamically based on quantitative metrics and test scores.
   * Useful for automated compliance pre-screenings.
   */
  public static analyzeAndClassify(
    base: Omit<BaseDigitalAsset, 'regulatoryCategory'>,
    metrics?: DecentralizationMetrics,
    howey?: HoweyTestEvaluation,
    stablecoinDetails?: { peggedCurrency: string; reserveHqlaRatio: number }
  ): RegulatoryCategory {
    // 1. Check for stablecoin characteristics
    if (stablecoinDetails && stablecoinDetails.peggedCurrency) {
      return 'PAYMENT_STABLECOIN';
    }

    // 2. Check Howey Test criteria
    if (howey) {
      let howeyScore = 0;
      if (howey.investmentOfMoney.exists) howeyScore++;
      if (howey.commonEnterprise.exists) howeyScore++;
      if (howey.expectationOfProfits.exists) howeyScore++;
      if (howey.effortsOfOthers.exists) howeyScore++;

      if (howeyScore === 4) {
        return 'DIGITAL_SECURITY';
      }
    }

    // 3. Check Decentralization Metrics (FIT21 rules)
    if (metrics) {
      if (metrics.promoterControlPercentage < 20 && !metrics.hasUnilateralControl && metrics.activeValidatorCount >= 31) {
        return 'DIGITAL_COMMODITY';
      } else if (metrics.promoterControlPercentage < 50) {
        return 'RESTRICTED_DIGITAL_COMMODITY';
      }
    }

    return 'UNCLASSIFIED';
  }
}