

// --- CONSOLIDATED FROM: ./types/government.ts ---

export type HUDPropertyStatus = 'Active' | 'In-Contract' | 'Sold' | 'Withdrawn' | 'Pending';
export type HUDPropertyBuyerType = 'Owner-Occupant' | 'Investor' | 'Non-Profit' | 'Government-Agency';
export type TaxLienStatus = 'Active' | 'Redeemed' | 'Foreclosed' | 'Expired' | 'Contested';
export type SECFilingType = '10-K' | '10-Q' | '8-K' | '4' | 'S-11' | 'FORM-3' | 'FORM-4' | 'FORM-5';

/**
 * HUD (U.S. Department of Housing and Urban Development) API Payloads
 */
export interface HUDProperty {
  caseNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family' | 'Manufactured';
  status: HUDPropertyStatus;
  listingDate: string;
  bidDeadlineDate?: string;
  eligibleBuyerTypes: HUDPropertyBuyerType[];
  fhaCaseStatus: string;
  revitalizationArea: boolean;
  lenderName?: string;
  contactAgent: {
    name: string;
    phone: string;
    email: string;
    brokerage: string;
  };
  amenities: string[];
  latitude: number;
  longitude: number;
}

export interface HUDListingResponse {
  totalRecords: number;
  page: number;
  pageSize: number;
  properties: HUDProperty[];
}

export interface FHALoanLimit {
  countyCode: string;
  countyName: string;
  stateCode: string;
  oneFamilyLimit: number;
  twoFamilyLimit: number;
  threeFamilyLimit: number;
  fourFamilyLimit: number;
  medianHousePrice: number;
  year: number;
}

/**
 * IRS (Internal Revenue Service) API Payloads & Tax Lien Data
 */
export interface TaxpayerEntity {
  taxpayerId: string; // Masked or encrypted TIN/EIN/SSN
  name: string;
  businessName?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface TaxLien {
  lienId: string;
  serialNumber: string;
  taxpayer: TaxpayerEntity;
  unpaidBalance: number;
  assessmentDate: string;
  filingDate: string;
  refilingPeriodEnd: string;
  releaseDate?: string;
  status: TaxLienStatus;
  jurisdiction: {
    state: string;
    county: string;
    recordingOffice: string;
    bookNumber?: string;
    pageNumber?: string;
  };
  taxPeriods: {
    taxPeriodEnding: string;
    taxType: string; // e.g., "1040", "941"
    assessmentAmount: number;
  }[];
}

export interface IRSForm1099S {
  reportingYear: number;
  fileDate: string;
  transferorName: string;
  transferorTIN: string;
  propertyDescription: string; // Address or legal description
  grossProceeds: number;
  buyerPartRealEstateTax: number;
  isForeignPerson: boolean;
}

export interface TaxExemptOrganization {
  ein: string;
  legalName: string;
  doingBusinessAs?: string;
  city: string;
  state: string;
  country: string;
  deductibilityStatus: string;
  subsectionCode: string;
  classificationCodes: string[];
}

/**
 * SEC (Securities and Exchange Commission) EDGAR API Payloads
 */
export interface SECEdgarFiling {
  cik: string;
  accessionNumber: string;
  form: SECFilingType;
  filingDate: string;
  reportDate?: string;
  acceptanceDateTime: string;
  act: string;
  fileNumber: string;
  filmNumber: string;
  items: string;
  size: number;
  isXBRL: boolean;
  isInlineXBRL: boolean;
  primaryDocument: string;
  primaryDocDescription: string;
}

export interface SECCompanyFacts {
  cik: string;
  entityName: string;
  facts: {
    [taxonomy: string]: {
      [concept: string]: {
        label: string;
        description: string;
        units: {
          [unit: string]: {
            val: number;
            fy: number;
            fp: string;
            form: SECFilingType;
            filed: string;
            frame?: string;
          }[];
        };
      };
    };
  };
}

export interface REITDetails {
  cik: string;
  companyName: string;
  tickerSymbol?: string;
  realEstateAssetsValue: number;
  totalDebt: number;
  netAssetValue: number;
  portfolioPropertiesCount: number;
  geographicConcentration: {
    region: string;
    percentage: number;
  }[];
  propertyTypeConcentration: {
    type: 'Residential' | 'Commercial' | 'Industrial' | 'Healthcare' | 'Retail' | 'Data Centers';
    percentage: number;
  }[];
}

/**
 * GIS (Geographic Information Systems) & Local Government Payloads
 */
export interface GISGeometry {
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
  coordinates: any[]; // GeoJSON coordinate structure
}

export interface GISParcelData {
  parcelId: string; // APN (Assessor's Parcel Number)
  ownerName: string;
  coOwnerName?: string;
  siteAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  mailingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  legalDescription: string;
  acreage: number;
  landUseCode: string;
  zoningCode: string;
  assessedValue: {
    landValue: number;
    improvementValue: number;
    totalAssessedValue: number;
    taxYear: number;
  };
  marketValue?: {
    landValue: number;
    improvementValue: number;
    totalMarketValue: number;
    taxYear: number;
  };
  lastSalePrice?: number;
  lastSaleDate?: string;
  geometry: GISGeometry;
}

export interface GISFeature {
  type: 'Feature';
  properties: GISParcelData;
  geometry: GISGeometry;
}

export interface GISFeatureCollection {
  type: 'FeatureCollection';
  features: GISFeature[];
}

export interface ZoningDetails {
  zoningDistrict: string;
  description: string;
  permittedUses: string[];
  conditionalUses: string[];
  maxHeightFeet: number;
  maxLotCoveragePercent: number;
  frontSetbackFeet: number;
  rearSetbackFeet: number;
  sideSetbackFeet: number;
}

/**
 * Unified Government Asset Transaction & Acquisition
 */
export type GovAssetSource = 'HUD' | 'IRS_LIEN' | 'SEC_REIT' | 'LOCAL_GIS_FORECLOSURE';

export interface GovAssetPurchaseEligibility {
  assetId: string;
  source: GovAssetSource;
  isEligibleForPurchase: boolean;
  restrictions: string[];
  requiredDocuments: string[];
  minimumBidAmount?: number;
  earnestMoneyDepositRequired?: number;
  escrowAgentDetails?: {
    name: string;
    address: string;
    phone: string;
  };
}