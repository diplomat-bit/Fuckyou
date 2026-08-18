export enum PropertyType {
  RESIDENTIAL = "RESIDENTIAL",
  COMMERCIAL = "COMMERCIAL",
  INDUSTRIAL = "INDUSTRIAL",
  AGRICULTURAL = "AGRICULTURAL",
  LAND = "LAND",
  SPECIAL_PURPOSE = "SPECIAL_PURPOSE",
  MULTI_FAMILY = "MULTI_FAMILY",
  CONDOMINIUM = "CONDOMINIUM"
}

export enum PropertyStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  UNDER_CONTRACT = "UNDER_CONTRACT",
  SOLD = "SOLD",
  FORECLOSURE = "FORECLOSURE",
  TAX_LIEN_PENDING = "TAX_LIEN_PENDING",
  TAX_DEED_PENDING = "TAX_DEED_PENDING",
  OFF_MARKET = "OFF_MARKET",
  AUCTION = "AUCTION"
}

export enum DeedType {
  GENERAL_WARRANTY = "GENERAL_WARRANTY",
  SPECIAL_WARRANTY = "SPECIAL_WARRANTY",
  QUITCLAIM = "QUITCLAIM",
  GRANT = "GRANT",
  BARGAIN_AND_SALE = "BARGAIN_AND_SALE",
  TAX_DEED = "TAX_DEED",
  SHERIFFS_DEED = "SHERIFFS_DEED",
  TRUST_DEED = "TRUST_DEED",
  EXECUTORS_DEED = "EXECUTORS_DEED"
}

export enum EscrowStatus {
  OPENED = "OPENED",
  EARNEST_MONEY_DEPOSITED = "EARNEST_MONEY_DEPOSITED",
  UNDER_REVIEW = "UNDER_REVIEW",
  CONTINGENCIES_MET = "CONTINGENCIES_MET",
  FUNDED = "FUNDED",
  APPROVED_FOR_DISBURSEMENT = "APPROVED_FOR_DISBURSEMENT",
  DISBURSED = "DISBURSED",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED",
  DISPUTED = "DISPUTED"
}

export enum LienStatus {
  ACTIVE = "ACTIVE",
  REDEEMED = "REDEEMED",
  FORECLOSED = "FORECLOSED",
  EXPIRED = "EXPIRED",
  CONTESTED = "CONTESTED",
  SATISFIED = "SATISFIED"
}

export enum LienType {
  FEDERAL_TAX = "FEDERAL_TAX",
  STATE_TAX = "STATE_TAX",
  COUNTY_PROPERTY_TAX = "COUNTY_PROPERTY_TAX",
  MUNICIPAL_UTILITY = "MUNICIPAL_UTILITY",
  MECHANICS = "MECHANICS",
  HOA = "HOA",
  JUDGMENT = "JUDGMENT",
  MORTGAGE = "MORTGAGE"
}

export enum TitlePolicyStatus {
  COMMITMENT_ISSUED = "COMMITMENT_ISSUED",
  ACTIVE = "ACTIVE",
  CLAIM_FILED = "CLAIM_FILED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED"
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
  gisId?: string;
}

export interface Address {
  streetAddress: string;
  unitOrSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  country: string;
  formattedAddress: string;
  coordinates?: GeoLocation;
}

export interface ParcelData {
  apn: string; // Assessor's Parcel Number
  alternativeApn?: string;
  fipsCode: string; // Federal Information Processing Standards code for county
  legalDescription: string;
  subdivisionName?: string;
  lotNumber?: string;
  blockNumber?: string;
  tractNumber?: string;
  zoningCode?: string;
  zoningDescription?: string;
  municipality?: string;
  townshipRangeSection?: string;
}

export interface PropertyValuation {
  assessedLandValue: number;
  assessedImprovementValue: number;
  totalAssessedValue: number;
  estimatedMarketValue?: number;
  taxYear: number;
  annualTaxAmount: number;
  taxDelinquentAmount?: number;
  isTaxDelinquent: boolean;
  lastAssessmentDate?: string;
}

export interface PhysicalCharacteristics {
  squareFeet: number;
  lotSizeSquareFeet: number;
  lotSizeAcres: number;
  yearBuilt?: number;
  yearRenovated?: number;
  bedrooms?: number;
  bathrooms?: number;
  stories?: number;
  constructionType?: string;
  roofType?: string;
  foundationType?: string;
  heatingType?: string;
  coolingType?: string;
  parkingSpaces?: number;
  hasPool?: boolean;
  sewerSystem?: "PUBLIC" | "SEPTIC" | "NONE";
  waterSource?: "PUBLIC" | "WELL" | "NONE";
}

export interface PropertyOwner {
  ownerId: string;
  fullNameOrEntity: string;
  entityType: "INDIVIDUAL" | "LLC" | "CORPORATION" | "TRUST" | "PARTNERSHIP" | "GOVERNMENT";
  ownershipPercentage: number;
  mailingAddress?: Address;
  acquisitionDate?: string;
  acquisitionPrice?: number;
}

export interface Property {
  id: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  address: Address;
  parcel: ParcelData;
  valuation: PropertyValuation;
  characteristics: PhysicalCharacteristics;
  owners: PropertyOwner[];
  isEncumbered: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Deed {
  id: string;
  propertyId: string;
  deedType: DeedType;
  grantorName: string;
  granteeName: string;
  considerationAmount: number;
  transferTaxPaid?: number;
  recordingDate: string;
  executionDate: string;
  documentNumber: string;
  bookNumber?: string;
  pageNumber?: string;
  countyRecorderOffice: string;
  stateOfRecording: string;
  legalDescriptionSnapshot: string;
  digitalSignatureHash?: string;
  ipfsHash?: string; // For decentralized storage of deed documents
  documentUrl: string;
}

export interface EscrowMilestone {
  name: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  isCompleted: boolean;
  requiredApprovals: string[]; // User IDs or roles
  receivedApprovals: { userId: string; timestamp: string; signature: string }[];
}

export interface Disbursement {
  id: string;
  recipientName: string;
  recipientRoutingNumber?: string;
  recipientAccountNumber?: string;
  recipientWalletAddress?: string; // For crypto/stablecoin settlements
  amount: number;
  purpose: string; // e.g., "Seller Proceeds", "Broker Commission", "Title Fee"
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  paymentMethod: "WIRE" | "ACH" | "CHECK" | "CRYPTO";
  transactionReference?: string;
  disbursedAt?: string;
}

export interface EscrowAccount {
  id: string;
  escrowNumber: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  escrowAgentId: string;
  status: EscrowStatus;
  purchasePrice: number;
  earnestMoneyRequired: number;
  earnestMoneyDeposited: number;
  totalFundsHeld: number;
  milestones: EscrowMilestone[];
  disbursements: Disbursement[];
  disputeDetails?: {
    disputeDate: string;
    reason: string;
    arbitratorId?: string;
    resolutionDetails?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TitleException {
  code: string;
  description: string;
  isWaived: boolean;
  waiverConditions?: string;
  clearedAt?: string;
}

export interface TitleRequirement {
  code: string;
  description: string;
  isSatisfied: boolean;
  satisfiedAt?: string;
  satisfactionProofUrl?: string;
}

export interface TitleInsurancePolicy {
  id: string;
  policyNumber: string;
  escrowId?: string;
  propertyId: string;
  underwriterName: string;
  underwriterId: string;
  coverageAmount: number;
  premiumAmount: number;
  effectiveDate: string;
  status: TitlePolicyStatus;
  exceptions: TitleException[];
  requirements: TitleRequirement[];
  endorsements?: string[];
  policyDocumentUrl: string;
  commitmentDocumentUrl?: string;
}

export interface TaxLien {
  id: string;
  lienNumber: string;
  parcelId: string;
  apn: string;
  fipsCode: string;
  taxYear: number;
  originalLienAmount: number;
  currentLienAmount: number;
  interestRatePercent: number;
  penaltyRatePercent?: number;
  accruedInterest: number;
  accruedPenalties: number;
  redemptionPeriodMonths: number;
  redemptionExpirationDate: string;
  auctionDate?: string;
  auctionWinnerId?: string;
  certificateNumber?: string;
  status: LienStatus;
  recordingData?: CountyRecorderData;
  governmentEntityName: string; // e.g., "Cook County Treasurer"
  paymentHistory: {
    paymentId: string;
    amount: number;
    paymentDate: string;
    payerName: string;
  }[];
}

export interface CountyRecorderData {
  id: string;
  fipsCode: string;
  countyName: string;
  state: string;
  documentNumber: string;
  bookNumber?: string;
  pageNumber?: string;
  recordingDate: string;
  documentType: string; // e.g., "DEED", "LIEN", "MORTGAGE", "RELEASE", "EASEMENT"
  grantor: string;
  grantee: string;
  parcelId: string;
  legalDescriptionSnapshot?: string;
  assessedValueSnapshot?: number;
  instrumentDate?: string;
  recordingFeePaid: number;
  scannedDocumentUrl?: string;
  rawApiPayload?: Record<string, any>; // To store raw response from government/county APIs
}

export interface GovernmentApiIntegration {
  providerName: string; // e.g., "Estated", "Attom Data", "Regrid", "County Recorder API"
  endpointUsed: string;
  queriedAt: string;
  responseStatus: number;
  transactionId: string;
}

export interface RealEstateTransaction {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  purchasePrice: number;
  escrowId?: string;
  titlePolicyId?: string;
  deedId?: string;
  taxLienId?: string; // If transaction is a tax lien purchase
  status: "DRAFT" | "OFFER_SUBMITTED" | "UNDER_CONTRACT" | "IN_ESCROW" | "COMPLETED" | "FAILED";
  apiIntegrations: GovernmentApiIntegration[];
  createdAt: string;
  completedAt?: string;
}