

// --- CONSOLIDATED FROM: ./services/TaxLienService.ts ---

import { EventEmitter } from "events";

/**
 * Represents the state-specific rules for tax lien auctions and redemptions.
 */
export interface StateLienRules {
  state: string;
  maxInterestRate: number; // Annual rate (e.g., 0.18 for 18%)
  biddingMethod: "Bid-Down Interest" | "Premium Bid" | "Random Selection" | "Rotational" | "Bid-Down Share";
  redemptionPeriodMonths: number;
  penaltyRate?: number; // Flat penalty rate applied upon redemption (e.g., Texas 25%)
  subsequentTaxPayingAllowed: boolean;
  subsequentTaxInterestRate?: number;
  foreclosureProcessDays: number;
}

/**
 * Details of a property associated with a tax lien.
 */
export interface PropertyDetails {
  apn: string; // Assessor's Parcel Number
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  assessedValue: number;
  marketValueEstimated: number;
  landValue: number;
  improvementValue: number;
  zoning: string;
  yearBuilt?: number;
  sqFt?: number;
  hasPriorLiens: boolean;
  priorLienAmount: number;
  isOwnerOccupied: boolean;
  gisCoordinates?: { latitude: number; longitude: number };
}

/**
 * Represents a Tax Lien Auction item (certificate).
 */
export interface TaxLienAuction {
  id: string;
  county: string;
  state: string;
  auctionDate: Date;
  faceValue: number; // Amount of delinquent taxes + initial fees
  advertisedNumber: string;
  parcelNumber: string;
  currentBid?: number; // Current interest rate or premium bid depending on method
  minimumBid: number;
  biddingStatus: "OPEN" | "CLOSED" | "SUSPENDED" | "WON" | "LOST";
  auctionPlatform: "RealAuction" | "GrantStreet" | "CountyDirect" | "Other";
  auctionUrl: string;
  propertyDetails?: PropertyDetails;
}

/**
 * Parameters for submitting a bid.
 */
export interface BidRequest {
  auctionId: string;
  maxBidAmount?: number; // For premium bidding
  minInterestRate?: number; // For bid-down interest bidding (e.g., 0.05 for 5%)
  investorId: string;
  autoBid: boolean;
}

/**
 * Result of a submitted bid.
 */
export interface BidResult {
  bidId: string;
  auctionId: string;
  status: "SUBMITTED" | "ACCEPTED" | "REJECTED" | "OUTBID" | "WON";
  submittedAt: Date;
  bidValue: number; // The rate or premium submitted
  message?: string;
}

/**
 * Detailed yield calculation results for investment analysis.
 */
export interface YieldCalculationResult {
  faceValue: number;
  purchasePrice: number; // Face value + premium (if applicable)
  projectedRedemptionMonths: number;
  interestEarned: number;
  penaltiesEarned: number;
  totalReturn: number;
  netProfit: number;
  roi: number; // Return on Investment
  irr: number; // Internal Rate of Return (Annualized)
  breakEvenDate: Date;
  subsequentTaxesProjected: number;
}

/**
 * Risk analysis report for a specific tax lien.
 */
export interface RiskAnalysis {
  score: number; // 0 (High Risk) to 100 (Low Risk)
  warnings: string[];
  positives: string[];
  loanToValueRatio: number;
  lienToValueRatio: number;
  recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "AVOID";
}

/**
 * Interface for County Auction Platform Adapters.
 */
export interface CountyAuctionAdapter {
  platformName: string;
  fetchAuctions(county: string, state: string): Promise<TaxLienAuction[]>;
  submitBid(auction: TaxLienAuction, bid: BidRequest): Promise<BidResult>;
  getAuctionDetails(auctionId: string): Promise<Partial<TaxLienAuction>>;
}

/**
 * Adapter for RealAuction platform.
 */
export class RealAuctionAdapter implements CountyAuctionAdapter {
  public platformName = "RealAuction";

  async fetchAuctions(county: string, state: string): Promise<TaxLienAuction[]> {
    // In production, this would perform HTTP requests, handle session cookies, and parse HTML/JSON from RealAuction endpoints.
    // Mocking the integration for demonstration.
    return [
      {
        id: `ra-${state}-${county}-2024-001`,
        county,
        state,
        auctionDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
        faceValue: 4500.0,
        advertisedNumber: "2024-TX-99812",
        parcelNumber: "123-45-678-009",
        minimumBid: 18.0, // 18% max interest rate
        biddingStatus: "OPEN",
        auctionPlatform: "RealAuction",
        auctionUrl: `https://${county}.${state}.realforeclose.com/index.cfm`,
      },
    ];
  }

  async submitBid(auction: TaxLienAuction, bid: BidRequest): Promise<BidResult> {
    // API call to RealAuction bid submission endpoint
    const bidValue = bid.minInterestRate !== undefined ? bid.minInterestRate : (bid.maxBidAmount || auction.faceValue);
    return {
      bidId: `bid-ra-${Math.random().toString(36).substr(2, 9)}`,
      auctionId: auction.id,
      status: "SUBMITTED",
      submittedAt: new Date(),
      bidValue,
      message: "Bid successfully placed via RealAuction API adapter.",
    };
  }

  async getAuctionDetails(auctionId: string): Promise<Partial<TaxLienAuction>> {
    return {
      id: auctionId,
      currentBid: 12.5, // Current bid down to 12.5%
    };
  }
}

/**
 * Adapter for Grant Street Group platform.
 */
export class GrantStreetAdapter implements CountyAuctionAdapter {
  public platformName = "GrantStreet";

  async fetchAuctions(county: string, state: string): Promise<TaxLienAuction[]> {
    // Mocking Grant Street Group API/Scraper integration
    return [
      {
        id: `gs-${state}-${county}-2024-102`,
        county,
        state,
        auctionDate: new Date(Date.now() + 86400000 * 10),
        faceValue: 12500.0,
        advertisedNumber: "GS-2024-8812",
        parcelNumber: "987-65-432-110",
        minimumBid: 15.0, // 15% max interest rate
        biddingStatus: "OPEN",
        auctionPlatform: "GrantStreet",
        auctionUrl: `https://${county}.realtaxdeed.com/`,
      },
    ];
  }

  async submitBid(auction: TaxLienAuction, bid: BidRequest): Promise<BidResult> {
    const bidValue = bid.minInterestRate !== undefined ? bid.minInterestRate : (bid.maxBidAmount || auction.faceValue);
    return {
      bidId: `bid-gs-${Math.random().toString(36).substr(2, 9)}`,
      auctionId: auction.id,
      status: "SUBMITTED",
      submittedAt: new Date(),
      bidValue,
      message: "Bid successfully placed via Grant Street Group API adapter.",
    };
  }

  async getAuctionDetails(auctionId: string): Promise<Partial<TaxLienAuction>> {
    return {
      id: auctionId,
      currentBid: 8.0,
    };
  }
}

/**
 * Main Service Class for Tax Lien Bidding, Scraping, and Yield Calculations.
 */
export class TaxLienService extends EventEmitter {
  private adapters: Map<string, CountyAuctionAdapter> = new Map();
  private stateRules: Map<string, StateLienRules> = new Map();

  constructor() {
    super();
    this.initializeAdapters();
    this.initializeStateRules();
  }

  /**
   * Registers the county auction platform adapters.
   */
  private initializeAdapters() {
    this.adapters.set("RealAuction", new RealAuctionAdapter());
    this.adapters.set("GrantStreet", new GrantStreetAdapter());
  }

  /**
   * Registers state-specific tax lien rules.
   */
  private initializeStateRules() {
    // Florida: Bid-down interest rate starting at 18%. 0.25% minimum.
    this.stateRules.set("FL", {
      state: "FL",
      maxInterestRate: 0.18,
      biddingMethod: "Bid-Down Interest",
      redemptionPeriodMonths: 24,
      subsequentTaxPayingAllowed: true,
      subsequentTaxInterestRate: 0.18,
      foreclosureProcessDays: 730,
    });

    // Arizona: Bid-down interest rate starting at 16%.
    this.stateRules.set("AZ", {
      state: "AZ",
      maxInterestRate: 0.16,
      biddingMethod: "Bid-Down Interest",
      redemptionPeriodMonths: 36,
      subsequentTaxPayingAllowed: true,
      subsequentTaxInterestRate: 0.16,
      foreclosureProcessDays: 1095,
    });

    // Texas: Penalty state. 25% flat penalty in year 1, 50% in year 2.
    this.stateRules.set("TX", {
      state: "TX",
      maxInterestRate: 0.25,
      biddingMethod: "Premium Bid",
      redemptionPeriodMonths: 24,
      penaltyRate: 0.25,
      subsequentTaxPayingAllowed: false,
      foreclosureProcessDays: 180,
    });

    // Colorado: Premium bidding. Interest rate set by state (e.g., 9% over discount rate).
    this.stateRules.set("CO", {
      state: "CO",
      maxInterestRate: 0.12,
      biddingMethod: "Premium Bid",
      redemptionPeriodMonths: 36,
      subsequentTaxPayingAllowed: true,
      subsequentTaxInterestRate: 0.12,
      foreclosureProcessDays: 1095,
    });
  }

  /**
   * Fetches tax lien auctions from various county platforms.
   */
  public async fetchAuctions(
    county: string,
    state: string,
    platform: "RealAuction" | "GrantStreet" | "CountyDirect" | "Other" = "RealAuction"
  ): Promise<TaxLienAuction[]> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      throw new Error(`No adapter registered for platform: ${platform}`);
    }

    try {
      const auctions = await adapter.fetchAuctions(county, state);
      
      // Enrich auctions with property details from government GIS/Assessor APIs (mocked here)
      for (const auction of auctions) {
        auction.propertyDetails = await this.fetchPropertyDetails(auction.parcelNumber, county, state);
      }

      return auctions;
    } catch (error) {
      this.emit("error", `Failed to fetch auctions for ${county}, ${state}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Fetches property details from local GIS/Assessor APIs or third-party property databases.
   */
  public async fetchPropertyDetails(parcelNumber: string, county: string, state: string): Promise<PropertyDetails> {
    // In production, this would integrate with local county GIS APIs, HUD, or commercial real estate APIs (e.g., Estated, Attom Data).
    // Mocking a robust response.
    const assessedValue = 250000;
    const marketValueEstimated = 285000;

    return {
      apn: parcelNumber,
      address: "100 Government Way",
      city: "County Seat",
      state,
      zip: "12345",
      county,
      assessedValue,
      marketValueEstimated,
      landValue: 75000,
      improvementValue: 175000,
      zoning: "SFR (Single Family Residential)",
      yearBuilt: 1998,
      sqFt: 1850,
      hasPriorLiens: false,
      priorLienAmount: 0,
      isOwnerOccupied: true,
      gisCoordinates: {
        latitude: 27.7676,
        longitude: -82.6333,
      },
    };
  }

  /**
   * Calculates the projected yield of a tax lien certificate.
   */
  public calculateYield(
    auction: TaxLienAuction,
    bidRateOrPremium: number,
    holdingPeriodMonths: number,
    subsequentTaxesPaid: number = 0
  ): YieldCalculationResult {
    const rules = this.stateRules.get(auction.state);
    if (!rules) {
      throw new Error(`No state rules configured for state: ${auction.state}`);
    }

    const faceValue = auction.faceValue;
    let purchasePrice = faceValue;
    let interestEarned = 0;
    let penaltiesEarned = 0;

    // Determine bidding method and calculate returns accordingly
    if (rules.biddingMethod === "Bid-Down Interest") {
      // The bid rate is the actual interest rate won
      const annualRate = bidRateOrPremium / 100; // e.g., 12% -> 0.12
      const monthlyRate = annualRate / 12;
      interestEarned = faceValue * monthlyRate * holdingPeriodMonths;

      // Add subsequent taxes interest if applicable
      if (subsequentTaxesPaid > 0 && rules.subsequentTaxPayingAllowed) {
        const subRate = (rules.subsequentTaxInterestRate || annualRate) / 12;
        // Assume subsequent taxes are paid halfway through the holding period
        const subMonths = Math.max(0, holdingPeriodMonths - 6);
        interestEarned += subsequentTaxesPaid * subRate * subMonths;
      }
    } else if (rules.biddingMethod === "Premium Bid") {
      // Premium bidding: investor pays more than face value.
      // In some states, premium earns interest; in others, it does not.
      const premium = Math.max(0, bidRateOrPremium - faceValue);
      purchasePrice = faceValue + premium;

      if (rules.penaltyRate) {
        // Texas style: flat penalty on the face value (or total bid depending on county)
        penaltiesEarned = faceValue * rules.penaltyRate;
        if (holdingPeriodMonths > 12) {
          // Texas penalty increases to 50% in year 2
          penaltiesEarned = faceValue * (rules.penaltyRate * 2);
        }
      } else {
        // Standard interest on face value
        const annualRate = rules.maxInterestRate;
        const monthlyRate = annualRate / 12;
        interestEarned = faceValue * monthlyRate * holdingPeriodMonths;
      }
    }

    const totalReturn = faceValue + interestEarned + penaltiesEarned + subsequentTaxesPaid;
    const totalInvested = purchasePrice + subsequentTaxesPaid;
    const netProfit = totalReturn - totalInvested;
    const roi = totalInvested > 0 ? netProfit / totalInvested : 0;

    // Annualized IRR calculation (simplified for standard holding periods)
    const years = holdingPeriodMonths / 12;
    const irr = years > 0 ? Math.pow(totalReturn / totalInvested, 1 / years) - 1 : 0;

    const breakEvenDate = new Date();
    breakEvenDate.setMonth(breakEvenDate.getMonth() + holdingPeriodMonths);

    return {
      faceValue,
      purchasePrice,
      projectedRedemptionMonths: holdingPeriodMonths,
      interestEarned,
      penaltiesEarned,
      totalReturn,
      netProfit,
      roi,
      irr,
      breakEvenDate,
      subsequentTaxesProjected: subsequentTaxesPaid,
    };
  }

  /**
   * Analyzes the risk of a tax lien based on property details and lien size.
   */
  public analyzeLienRisk(auction: TaxLienAuction, property: PropertyDetails): RiskAnalysis {
    const warnings: string[] = [];
    const positives: string[] = [];
    let score = 100;

    const lienToValueRatio = auction.faceValue / property.marketValueEstimated;
    const loanToValueRatio = property.hasPriorLiens ? (property.priorLienAmount / property.marketValueEstimated) : 0;

    // 1. Lien-to-Value Ratio Check (Crucial for safety)
    if (lienToValueRatio > 0.10) {
      score -= 20;
      warnings.push(`High Lien-to-Value ratio (${(lienToValueRatio * 100).toFixed(2)}%). Ideal is < 5%.`);
    } else {
      positives.push(`Excellent Lien-to-Value ratio (${(lienToValueRatio * 100).toFixed(2)}%).`);
    }

    // 2. Prior Liens Check
    if (property.hasPriorLiens) {
      score -= 30;
      warnings.push(`Property has prior liens totaling $${property.priorLienAmount}.`);
    } else {
      positives.push("No prior liens detected on property.");
    }

    // 3. Property Value Check
    if (property.marketValueEstimated < 15000) {
      score -= 25;
      warnings.push("Extremely low property value. Risk of abandonment.");
    } else if (property.marketValueEstimated > 100000) {
      positives.push("Strong property market value.");
    }

    // 4. Zoning Check
    if (property.zoning.toLowerCase().includes("industrial") || property.zoning.toLowerCase().includes("waste")) {
      score -= 15;
      warnings.push("Industrial zoning. Potential environmental liabilities.");
    } else if (property.zoning.toLowerCase().includes("sfr") || property.zoning.toLowerCase().includes("residential")) {
      positives.push("Desirable residential zoning.");
    }

    // Determine recommendation
    let recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "AVOID" = "HOLD";
    if (score >= 85) recommendation = "STRONG_BUY";
    else if (score >= 70) recommendation = "BUY";
    else if (score >= 50) recommendation = "HOLD";
    else recommendation = "AVOID";

    return {
      score: Math.max(0, score),
      warnings,
      positives,
      loanToValueRatio,
      lienToValueRatio,
      recommendation,
    };
  }

  /**
   * Submits a bid to the appropriate county auction platform.
   */
  public async submitBid(bidRequest: BidRequest, platform: "RealAuction" | "GrantStreet" | "CountyDirect" | "Other"): Promise<BidResult> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      throw new Error(`No adapter registered for platform: ${platform}`);
    }

    // Fetch current auction details to ensure we have the latest data
    const currentDetails = await adapter.getAuctionDetails(bidRequest.auctionId);
    
    // Construct full auction object for adapter
    const auction: TaxLienAuction = {
      id: bidRequest.auctionId,
      county: "Unknown",
      state: "Unknown",
      auctionDate: new Date(),
      faceValue: 0,
      advertisedNumber: "",
      parcelNumber: "",
      minimumBid: 0,
      biddingStatus: "OPEN",
      auctionPlatform: platform,
      auctionUrl: "",
      ...currentDetails,
    };

    this.emit("bidSubmitting", { bidRequest, platform });

    try {
      const result = await adapter.submitBid(auction, bidRequest);
      this.emit("bidSubmitted", result);
      return result;
    } catch (error) {
      this.emit("bidFailed", { bidRequest, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Automatically monitors and bids on auctions based on investor criteria.
   */
  public async runAutoBidder(
    county: string,
    state: string,
    platform: "RealAuction" | "GrantStreet" | "CountyDirect" | "Other",
    criteria: {
      maxLienToValue: number;
      minYieldIrr: number;
      maxInvestmentPerLien: number;
      minPropertyValue: number;
      investorId: string;
    }
  ): Promise<BidResult[]> {
    const results: BidResult[] = [];
    const auctions = await this.fetchAuctions(county, state, platform);

    for (const auction of auctions) {
      if (!auction.propertyDetails) continue;

      const risk = this.analyzeLienRisk(auction, auction.propertyDetails);
      const yieldCalc = this.calculateYield(
        auction,
        auction.minimumBid, // Assume bidding at maximum allowed rate initially
        12 // Assume 12-month redemption for analysis
      );

      // Check criteria
      const matchesCriteria =
        risk.lienToValueRatio <= criteria.maxLienToValue &&
        yieldCalc.irr >= criteria.minYieldIrr &&
        auction.faceValue <= criteria.maxInvestmentPerLien &&
        auction.propertyDetails.marketValueEstimated >= criteria.minPropertyValue &&
        risk.recommendation !== "AVOID";

      if (matchesCriteria) {
        const bidRequest: BidRequest = {
          auctionId: auction.id,
          investorId: criteria.investorId,
          autoBid: true,
          minInterestRate: auction.state === "FL" || auction.state === "AZ" ? 5.0 : undefined, // Bid down to 5% minimum
          maxBidAmount: auction.state === "TX" || auction.state === "CO" ? auction.faceValue * 1.10 : undefined, // Up to 10% premium
        };

        try {
          const result = await this.submitBid(bidRequest, platform);
          results.push(result);
        } catch (error) {
          // Log error and continue with other auctions
          this.emit("error", `Auto-bid failed for auction ${auction.id}: ${(error as Error).message}`);
        }
      }
    }

    return results;
  }
}

export default TaxLienService;
