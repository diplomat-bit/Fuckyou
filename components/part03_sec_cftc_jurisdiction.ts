

// --- CONSOLIDATED FROM: ./clarity/part03_sec_cftc_jurisdiction.ts ---

/**
 * @file clarity/part03_sec_cftc_jurisdiction.ts
 * @package clarity
 * @summary SEC vs CFTC Jurisdiction Router.
 * Implements the regulatory boundary logic to classify digital assets, derivatives,
 * and hybrid instruments, routing compliance workflows based on statutory criteria,
 * judicial precedents (Howey, Reves), and administrative guidance.
 */

/**
 * Supported asset classes for regulatory classification.
 */
export enum AssetClass {
  NATIVE_CRYPTOCURRENCY = "NATIVE_CRYPTOCURRENCY",
  UTILITY_TOKEN = "UTILITY_TOKEN",
  SECURITY_TOKEN = "SECURITY_TOKEN",
  STABLECOIN_FIAT_BACKED = "STABLECOIN_FIAT_BACKED",
  STABLECOIN_ALGORITHMIC = "STABLECOIN_ALGORITHMIC",
  GOVERNANCE_TOKEN = "GOVERNANCE_TOKEN",
  DERIVATIVE_SWAP = "DERIVATIVE_SWAP",
  DERIVATIVE_FUTURE = "DERIVATIVE_FUTURE",
  REAL_ESTATE_FRACTIONALIZED = "REAL_ESTATE_FRACTIONALIZED",
  HYBRID_INSTRUMENT = "HYBRID_INSTRUMENT"
}

/**
 * Regulatory jurisdictions determined by the router.
 */
export enum RegulatoryJurisdiction {
  SEC = "SEC", // Securities and Exchange Commission
  CFTC = "CFTC", // Commodity Futures Trading Commission
  JOINT_SEC_CFTC = "JOINT_SEC_CFTC", // Dual jurisdiction (e.g., security-based swaps, mixed swaps)
  STATE_BANKING_NYDFS = "STATE_BANKING_NYDFS", // State-level banking/trust regulators (e.g., NYDFS BitLicense)
  EXEMPT_OR_UNREGULATED = "EXEMPT_OR_UNREGULATED" // Outside current SEC/CFTC statutory boundaries
}

/**
 * Specific statutory or judicial frameworks used for evaluation.
 */
export enum RegulatoryFramework {
  HOWEY_TEST = "HOWEY_TEST", // SEC v. W.J. Howey Co. (Investment Contracts)
  REVES_TEST = "REVES_TEST", // Reves v. Ernst & Young (Notes/Debt Instruments)
  COMMODITY_EXCHANGE_ACT = "COMMODITY_EXCHANGE_ACT", // CEA Section 1a(9) (Commodities)
  HINMAN_DECENTRALIZATION = "HINMAN_DECENTRALIZATION", // SEC Hinman Speech / Sufficient Decentralization
  LUMMIS_GILLIBRAND_PROPOSED = "LUMMIS_GILLIBRAND_PROPOSED" // Emerging legislative boundaries
}

/**
 * Howey Test evaluation parameters (SEC v. Howey, 328 U.S. 293).
 */
export interface HoweyTestFactors {
  investmentOfMoney: boolean;
  commonEnterprise: {
    horizontalCommonality: boolean; // Pooling of assets/fortunes of investors
    verticalCommonalityBroad: boolean; // Fortunes of investors tied to promoter's efforts
    verticalCommonalityStrict: boolean; // Fortunes of investors tied to promoter's success
  };
  expectationOfProfits: {
    capitalAppreciation: boolean;
    participationInEarnings: boolean;
    promotionalMarketingEmphasizesProfit: boolean;
  };
  effortsOfOthers: {
    essentialManagerialEffortsByPromoter: boolean;
    investorsHaveNoControlOverOperations: boolean;
    informationAsymmetryExists: boolean;
  };
}

/**
 * Reves Test evaluation parameters for notes/debt instruments (Reves v. Ernst & Young, 494 U.S. 56).
 */
export interface RevesTestFactors {
  isNoteOrDebtInstrument: boolean;
  motivationsOfBuyerSeller: {
    sellerRaisingCooperativeCapital: boolean;
    buyerPrimarilyInterestedInProfit: boolean;
  };
  planOfDistribution: {
    offeredToCommonTradingOrSpeculation: boolean;
  };
  reasonableExpectationsOfPublic: {
    publicConsidersInstrumentASecurity: boolean;
  };
  riskReducingFactors: {
    alternativeRegulatorySchemeExists: boolean; // e.g., ERISA, FDIC, State Banking
    collateralizedOrSecured: boolean;
  };
}

/**
 * Decentralization metrics based on SEC guidance (Hinman "Sufficiently Decentralized" standard).
 */
export interface DecentralizationFactors {
  activePromoterOrGroupControlsDevelopment: boolean;
  tokenDistributionConcentration: number; // Percentage of tokens held by insiders/founders (0.0 to 1.0)
  governanceDecentralized: {
    daoActiveVoting: boolean;
    noSingleEntityCanAlterProtocolRules: boolean;
    openSourceDevelopmentByIndependentContributors: boolean;
  };
  utilityFunctionalityActive: {
    networkFullyOperational: boolean;
    tokenRequiredForConsumingService: boolean;
    tokenNotMarketedAsInvestment: boolean;
  };
}

/**
 * Commodity Exchange Act (CEA) evaluation parameters.
 */
export interface CommodityFactors {
  isGoodsArticlesServicesRightsInWhichContractsAreDealt: boolean;
  isPhysicalStoreOfValueOrUtility: boolean;
  hasLeveragedRetailTransactions: boolean;
  isFutureOptionOrSwapContract: boolean;
}

/**
 * Complete metadata payload for an asset evaluation.
 */
export interface AssetEvaluationPayload {
  assetId: string;
  assetName: string;
  ticker: string;
  assetClass: AssetClass;
  howeyFactors: HoweyTestFactors;
  revesFactors: RevesTestFactors;
  decentralizationFactors: DecentralizationFactors;
  commodityFactors: CommodityFactors;
  yieldBearing: boolean;
  algorithmicPeg: boolean;
}

/**
 * Detailed breakdown of the jurisdictional decision.
 */
export interface JurisdictionAssessmentResult {
  assetId: string;
  ticker: string;
  primaryJurisdiction: RegulatoryJurisdiction;
  secondaryJurisdictions: RegulatoryJurisdiction[];
  howeyScore: number; // 0.0 (Not a security) to 1.0 (Definite security)
  decentralizationScore: number; // 0.0 (Centralized) to 1.0 (Fully Decentralized)
  revesSecurityLikelihood: boolean;
  commodityClassificationLikelihood: boolean;
  applicableFrameworks: RegulatoryFramework[];
  reasoningSummary: string[];
  recommendedComplianceWorkflow: string[];
  timestamp: string;
}

/**
 * SEC vs CFTC Jurisdiction Router Engine.
 */
export class SecCftcJurisdictionRouter {
  
  /**
   * Evaluates the Howey Test factors to compute a security probability score.
   * @param factors HoweyTestFactors
   * @returns number (0.0 to 1.0)
   */
  public static evaluateHoweyTest(factors: HoweyTestFactors): number {
    let score = 0;
    const weights = {
      investment: 0.25,
      commonality: 0.25,
      expectationOfProfit: 0.25,
      effortsOfOthers: 0.25
    };

    // 1. Investment of Money
    if (factors.investmentOfMoney) {
      score += weights.investment;
    }

    // 2. Common Enterprise
    let commonalityScore = 0;
    if (factors.commonEnterprise.horizontalCommonality) commonalityScore += 0.5;
    if (factors.commonEnterprise.verticalCommonalityBroad || factors.commonEnterprise.verticalCommonalityStrict) {
      commonalityScore += 0.5;
    }
    score += commonalityScore * weights.commonality;

    // 3. Expectation of Profits
    let profitScore = 0;
    if (factors.expectationOfProfits.capitalAppreciation) profitScore += 0.4;
    if (factors.expectationOfProfits.participationInEarnings) profitScore += 0.4;
    if (factors.expectationOfProfits.promotionalMarketingEmphasizesProfit) profitScore += 0.2;
    score += Math.min(profitScore, 1.0) * weights.expectationOfProfit;

    // 4. Efforts of Others
    let effortsScore = 0;
    if (factors.effortsOfOthers.essentialManagerialEffortsByPromoter) effortsScore += 0.5;
    if (factors.effortsOfOthers.investorsHaveNoControlOverOperations) effortsScore += 0.3;
    if (factors.effortsOfOthers.informationAsymmetryExists) effortsScore += 0.2;
    score += effortsScore * weights.effortsOfOthers;

    return parseFloat(score.toFixed(4));
  }

  /**
   * Evaluates the Reves Test factors to determine if a note/debt instrument is a security.
   * @param factors RevesTestFactors
   * @returns boolean
   */
  public static evaluateRevesTest(factors: RevesTestFactors): boolean {
    if (!factors.isNoteOrDebtInstrument) {
      return false;
    }

    // If there is an alternative regulatory scheme (e.g., FDIC, ERISA), it strongly rebuts security status
    if (factors.riskReducingFactors.alternativeRegulatorySchemeExists) {
      return false;
    }

    let securityIndicators = 0;

    if (factors.motivationsOfBuyerSeller.sellerRaisingCooperativeCapital && 
        factors.motivationsOfBuyerSeller.buyerPrimarilyInterestedInProfit) {
      securityIndicators++;
    }

    if (factors.planOfDistribution.offeredToCommonTradingOrSpeculation) {
      securityIndicators++;
    }

    if (factors.reasonableExpectationsOfPublic.publicConsidersInstrumentASecurity) {
      securityIndicators++;
    }

    // If not collateralized and has multiple indicators, it's likely a security
    if (!factors.riskReducingFactors.collateralizedOrSecured) {
      securityIndicators++;
    }

    return securityIndicators >= 2;
  }

  /**
   * Evaluates the decentralization level of the asset network.
   * Higher scores indicate a shift away from SEC (investment contract) towards CFTC (commodity).
   * @param factors DecentralizationFactors
   * @returns number (0.0 to 1.0)
   */
  public static evaluateDecentralization(factors: DecentralizationFactors): number {
    let score = 0;

    // 1. Promoter Control (Negative impact on decentralization)
    if (!factors.activePromoterOrGroupControlsDevelopment) {
      score += 0.3;
    }

    // 2. Token Distribution (Lower insider concentration = higher decentralization)
    if (factors.tokenDistributionConcentration < 0.2) {
      score += 0.2;
    } else if (factors.tokenDistributionConcentration < 0.5) {
      score += 0.1;
    }

    // 3. Governance
    let govScore = 0;
    if (factors.governanceDecentralized.daoActiveVoting) govScore += 0.1;
    if (factors.governanceDecentralized.noSingleEntityCanAlterProtocolRules) govScore += 0.1;
    if (factors.governanceDecentralized.openSourceDevelopmentByIndependentContributors) govScore += 0.1;
    score += govScore;

    // 4. Utility Functionality
    let utilityScore = 0;
    if (factors.utilityFunctionalityActive.networkFullyOperational) utilityScore += 0.1;
    if (factors.utilityFunctionalityActive.tokenRequiredForConsumingService) utilityScore += 0.05;
    if (factors.utilityFunctionalityActive.tokenNotMarketedAsInvestment) utilityScore += 0.05;
    score += utilityScore;

    return parseFloat(score.toFixed(4));
  }

  /**
   * Classifies the asset and routes it to the correct regulatory jurisdiction.
   * @param payload AssetEvaluationPayload
   * @returns JurisdictionAssessmentResult
   */
  public static routeJurisdiction(payload: AssetEvaluationPayload): JurisdictionAssessmentResult {
    const reasoningSummary: string[] = [];
    const recommendedComplianceWorkflow: string[] = [];
    const applicableFrameworks: RegulatoryFramework[] = [];
    const secondaryJurisdictions: RegulatoryJurisdiction[] = [];

    const howeyScore = this.evaluateHoweyTest(payload.howeyFactors);
    const decentralizationScore = this.evaluateDecentralization(payload.decentralizationFactors);
    const revesSecurityLikelihood = this.evaluateRevesTest(payload.revesFactors);

    // Determine Commodity status under CEA
    let commodityClassificationLikelihood = false;
    if (payload.commodityFactors.isGoodsArticlesServicesRightsInWhichContractsAreDealt || 
        payload.commodityFactors.isPhysicalStoreOfValueOrUtility) {
      commodityClassificationLikelihood = true;
    }

    let primaryJurisdiction = RegulatoryJurisdiction.EXEMPT_OR_UNREGULATED;

    // Apply Frameworks based on evaluation
    applicableFrameworks.push(RegulatoryFramework.HOWEY_TEST);
    if (payload.revesFactors.isNoteOrDebtInstrument) {
      applicableFrameworks.push(RegulatoryFramework.REVES_TEST);
    }
    if (commodityClassificationLikelihood) {
      applicableFrameworks.push(RegulatoryFramework.COMMODITY_EXCHANGE_ACT);
    }

    // --- ROUTING LOGIC ---

    // 1. Real Estate Fractionalization (Strictly SEC under Howey)
    if (payload.assetClass === AssetClass.REAL_ESTATE_FRACTIONALIZED) {
      primaryJurisdiction = RegulatoryJurisdiction.SEC;
      reasoningSummary.push("Fractionalized real estate interests represent pooled investments with expectations of profits derived from managerial efforts of sponsors.");
      recommendedComplianceWorkflow.push("SEC Regulation D (Rule 506(c)) or Regulation A+ filing.");
      recommendedComplianceWorkflow.push("KYC/AML onboarding via SEC-registered transfer agent.");
    }

    // 2. Derivatives, Futures, and Swaps (CFTC or SEC/CFTC Joint)
    else if (payload.assetClass === AssetClass.DERIVATIVE_FUTURE || payload.assetClass === AssetClass.DERIVATIVE_SWAP) {
      if (howeyScore > 0.75) {
        primaryJurisdiction = RegulatoryJurisdiction.JOINT_SEC_CFTC;
        reasoningSummary.push("Derivative contract is based on underlying security or security-index, triggering SEC Security-Based Swap rules and CFTC swap regulations.");
        recommendedComplianceWorkflow.push("SEC Security-Based Swap Data Repository (SDR) reporting.");
        recommendedComplianceWorkflow.push("CFTC Part 43/45 real-time reporting compliance.");
      } else {
        primaryJurisdiction = RegulatoryJurisdiction.CFTC;
        reasoningSummary.push("Derivative contract is based on a commodity or digital asset commodity (e.g., BTC, ETH), falling under CFTC exclusive jurisdiction.");
        recommendedComplianceWorkflow.push("CFTC Swap Execution Facility (SEF) registration or compliance.");
        recommendedComplianceWorkflow.push("Commodity Pool Operator (CPO) / Commodity Trading Advisor (CTA) registration check.");
      }
    }

    // 3. Stablecoins
    else if (payload.assetClass === AssetClass.STABLECOIN_FIAT_BACKED || payload.assetClass === AssetClass.STABLECOIN_ALGORITHMIC) {
      if (payload.yieldBearing) {
        primaryJurisdiction = RegulatoryJurisdiction.SEC;
        reasoningSummary.push("Stablecoin offers yield/interest-bearing features, constituting an investment contract or note under Howey/Reves.");
        recommendedComplianceWorkflow.push("SEC registration statement (Form S-1) or private placement exemption.");
      } else if (payload.algorithmicPeg) {
        primaryJurisdiction = RegulatoryJurisdiction.SEC;
        secondaryJurisdictions.push(RegulatoryJurisdiction.CFTC);
        reasoningSummary.push("Algorithmic stablecoin relies on arbitrage mechanisms and expectation of profit to maintain peg, presenting high SEC risk.");
        recommendedComplianceWorkflow.push("SEC No-Action Letter request or strict Regulation D compliance.");
      } else {
        primaryJurisdiction = RegulatoryJurisdiction.STATE_BANKING_NYDFS;
        secondaryJurisdictions.push(RegulatoryJurisdiction.CFTC);
        reasoningSummary.push("Fiat-backed stablecoin with no yield functions primarily as a payment instrument, subject to state money transmitter and trust laws.");
        recommendedComplianceWorkflow.push("NYDFS BitLicense compliance and state-level Money Transmitter Licenses (MTLs).");
        recommendedComplianceWorkflow.push("CFTC anti-fraud and anti-manipulation monitoring (spot commodity market jurisdiction).");
      }
    }

    // 4. Native Cryptocurrencies & Utility Tokens
    else {
      // Check for security status via Howey and Reves
      if (howeyScore > 0.7 || revesSecurityLikelihood) {
        primaryJurisdiction = RegulatoryJurisdiction.SEC;
        reasoningSummary.push(`Asset exhibits strong security characteristics (Howey Score: ${howeyScore}, Reves Security: ${revesSecurityLikelihood}).`);
        recommendedComplianceWorkflow.push("SEC Form D filing within 15 days of first sale.");
        recommendedComplianceWorkflow.push("Restrict secondary trading to SEC-registered Alternative Trading Systems (ATS).");
      } 
      // Check for "Sufficiently Decentralized" Commodity status
      else if (decentralizationScore >= 0.6 && commodityClassificationLikelihood) {
        primaryJurisdiction = RegulatoryJurisdiction.CFTC;
        applicableFrameworks.push(RegulatoryFramework.HINMAN_DECENTRALIZATION);
        reasoningSummary.push(`Asset is sufficiently decentralized (Decentralization Score: ${decentralizationScore}) and functions as a commodity.`);
        recommendedComplianceWorkflow.push("CFTC anti-manipulation compliance under CEA Section 6(c)(1) and Rule 180.1.");
        recommendedComplianceWorkflow.push("Ensure no promotional materials promise profits based on promoter efforts.");
      } 
      // Hybrid or Borderline cases
      else {
        primaryJurisdiction = RegulatoryJurisdiction.JOINT_SEC_CFTC;
        reasoningSummary.push(`Asset is in a regulatory gray zone. Howey Score: ${howeyScore}, Decentralization Score: ${decentralizationScore}.`);
        recommendedComplianceWorkflow.push("Engage SEC Strategic Hub for Innovation and Financial Technology (FinHub).");
        recommendedComplianceWorkflow.push("Engage CFTC LabCFTC for regulatory sandbox guidance.");
      }
    }

    return {
      assetId: payload.assetId,
      ticker: payload.ticker,
      primaryJurisdiction,
      secondaryJurisdictions,
      howeyScore,
      decentralizationScore,
      revesSecurityLikelihood,
      commodityClassificationLikelihood,
      applicableFrameworks,
      reasoningSummary,
      recommendedComplianceWorkflow,
      timestamp: new Date().toISOString()
    };
  }
}