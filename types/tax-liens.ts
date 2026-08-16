export type USState =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY';

export type LienStatus =
  | 'AVAILABLE'      // Available for purchase/bidding
  | 'HELD_BY_USER'   // Won and currently held in portfolio
  | 'REDEEMED'       // Redeemed by the property owner (principal + interest paid)
  | 'FORECLOSING'    // In the process of foreclosure to acquire deed
  | 'DEED_ACQUIRED'  // Foreclosure complete, property deed acquired
  | 'EXPIRED'        // Lien expired (statute of limitations reached)
  | 'LITIGATION'     // Under legal dispute
  | 'WRITTEN_OFF';   // Deemed uncollectible or invalid

export type AuctionPlatform =
  | 'REALAUCTION'
  | 'BID4ASSETS'
  | 'GOVEASE'
  | 'ZEUS_AUCTION'
  | 'COUNTY_DIRECT'  // In-person or county-run custom portal
  | 'OTHER';

export type BiddingRuleType =
  | 'BID_DOWN_INTEREST' // Bidders bid down the interest rate (e.g., Arizona, Florida)
  | 'PREMIUM_BIDDING'   // Bidders bid up the cash price; premium may/may not earn interest (e.g., Colorado)
  | 'RANDOM_ROTATION'   // County selects winner randomly at face value
  | 'ROTATIONAL_BID'    // Sequential bidding
  | 'DEED_ONLY'         // Direct tax deed sale, not a lien
  | 'OTHER';

export type ForeclosureStepStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'BYPASSED';

export interface PropertyAddress {
  street1: string;
  street2?: string;
  city: string;
  county: string;
  state: USState;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyValuation {
  assessedValue: number;
  marketValueEstimate?: number;
  landValue?: number;
  improvementValue?: number;
  lastAssessmentYear: number;
  source: 'COUNTY_ASSESSOR' | 'AVM' | 'MANUAL_APPRAISAL';
  updatedAt: string;
}

export interface PropertyDetails {
  apn: string; // Assessor's Parcel Number
  alternateId?: string; // GIS ID or alternative county identifier
  address: PropertyAddress;
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'AGRICULTURAL' | 'VACANT_LAND' | 'MULTI_FAMILY' | 'OTHER';
  legalDescription: string;
  zoningCode?: string;
  ownerName: string;
  ownerAddress?: PropertyAddress;
  valuation: PropertyValuation;
  gisMapUrl?: string;
  hasPriorLiens: boolean;
  priorLiensCount?: number;
  priorLiensTotalAmount?: number;
}

export interface TaxLienCertificate {
  id: string;
  certificateNumber: string;
  parcelId: string; // Links to PropertyDetails.apn
  county: string;
  state: USState;
  taxYear: number;
  faceValue: number; // Original delinquent tax amount + initial fees
  currentValue: number; // Face value + accrued interest + subsequent taxes paid
  advertisedInterestRate: number; // Maximum statutory rate (e.g., 18% in FL)
  winningInterestRate?: number; // Actual rate won at auction (if bid-down)
  premiumPaid?: number; // Amount paid over face value
  penaltyRate?: number; // Flat penalty rate if applicable
  status: LienStatus;
  purchaseDate?: string;
  expirationDate?: string; // Date when the lien becomes void if not foreclosed
  redemptionDeadline?: string; // Earliest date foreclosure can begin
  redemptionDate?: string; // Date actually redeemed
  redemptionAmountReceived?: number;
  subsequentTaxesPaid: SubsequentTaxPayment[];
  documents: TaxLienDocument[];
  governmentSyncMetadata?: GovernmentSyncMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface SubsequentTaxPayment {
  id: string;
  taxYear: number;
  amountPaid: number;
  paymentDate: string;
  interestRateEarned: number;
  status: 'PENDING' | 'CLEARED' | 'REJECTED';
}

export interface TaxLienDocument {
  id: string;
  documentType: 'CERTIFICATE_PDF' | 'RECORDED_DEED' | 'FORECLOSURE_NOTICE' | 'TITLE_REPORT' | 'TAX_BILL' | 'OTHER';
  title: string;
  fileUrl: string;
  recordedDocumentNumber?: string;
  bookNumber?: string;
  pageNumber?: string;
  uploadedAt: string;
}

export interface CountyAuction {
  id: string;
  county: string;
  state: USState;
  auctionPlatform: AuctionPlatform;
  auctionUrl?: string;
  biddingRule: BiddingRuleType;
  registrationDeadline: string;
  depositRequired: boolean;
  depositAmount?: number;
  depositDeadline?: string;
  depositRefundPolicy?: string;
  auctionStartDate: string;
  auctionEndDate: string;
  totalItemsCount: number;
  totalFaceValue: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  lienIds: string[]; // References to TaxLienCertificate IDs in this auction
  apiIntegrationSupported: boolean;
  lastSyncedAt?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  certificateId: string;
  parcelId: string;
  bidderId: string;
  maxBidAmount?: number; // For premium bidding
  minInterestRate?: number; // For bid-down interest (e.g., bidding down to 1.5%)
  submittedBidAmount?: number;
  submittedInterestRate?: number;
  status: 'DRAFT' | 'QUEUED' | 'SUBMITTED' | 'WON' | 'LOST' | 'CANCELLED';
  placedAt?: string;
  resultAmount?: number; // Final price paid if won
  resultInterestRate?: number; // Final interest rate secured if won
  rejectionReason?: string;
  transactionId?: string; // Reference to payment transaction
}

export interface ForeclosureStep {
  id: string;
  stepName: string;
  description: string;
  sequenceOrder: number;
  status: ForeclosureStepStatus;
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
  requiredDocuments: string[]; // Document type names or IDs
}

export interface ForeclosureTracking {
  id: string;
  certificateId: string;
  parcelId: string;
  attorneyName?: string;
  attorneyFirm?: string;
  attorneyContactEmail?: string;
  caseNumber?: string; // Court case number once filed
  estimatedTotalCost: number;
  actualCostToDate: number;
  status: 'ELIGIBLE' | 'NOTICE_PHASE' | 'FILED' | 'IN_COURT' | 'DEED_PENDING' | 'COMPLETED' | 'ABANDONED';
  steps: ForeclosureStep[];
  redemptionOccurredDuringForeclosure: boolean;
  redemptionAmountCollected?: number;
  deedRecordingDate?: string;
  deedDocumentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovernmentSyncMetadata {
  lastSuccessfulSync: string;
  syncStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  errorMessage?: string;
  dataSourceApi: string; // Name of the government API endpoint or scraper used
  externalRecordId: string; // The ID of the record in the county's database
  hash: string; // To detect changes in remote data
}

export interface TaxLienPortfolioSummary {
  totalInvested: number;
  totalActiveLiens: number;
  totalRedemedLiens: number;
  totalForeclosedLiens: number;
  averageYieldRate: number;
  projectedInterestEarnings: number;
  accruedInterestToDate: number;
  liensByState: Record<USState, number>;
  upcomingDeadlines: {
    certificateId: string;
    parcelId: string;
    deadlineType: 'REDEMPTION_EXPIRATION' | 'LIEN_EXPIRATION' | 'SUB_TAX_DUE';
    date: string;
  }[];
}