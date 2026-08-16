import { Schema, model, Document, Types } from 'mongoose';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum ClearanceLevel {
  CITIZEN = 'CITIZEN',
  GOVERNMENT_OFFICIAL = 'GOVERNMENT_OFFICIAL',
  MINISTER = 'MINISTER',
  SUPREME_LEADER = 'SUPREME_LEADER',
  ILLUMINATI_BOARD = 'ILLUMINATI_BOARD'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXILED = 'EXILED',
  DECEASED = 'DECEASED',
  RESTRICTED = 'RESTRICTED'
}

export enum OrganizationType {
  LLC = 'LLC',
  S_CORP = 'S_CORP',
  STATE_OWNED = 'STATE_OWNED',
  SOVEREIGN_WEALTH_FUND = 'SOVEREIGN_WEALTH_FUND',
  CONGLOMERATE = 'CONGLOMERATE',
  ILLUMINATI_SHELL = 'ILLUMINATI_SHELL',
  CENTRAL_BANK = 'CENTRAL_BANK',
  GLOBAL_NGO = 'GLOBAL_NGO'
}

export enum ComplianceStatus {
  APPROVED = 'APPROVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SANCTIONED = 'SANCTIONED',
  BLACKLISTED = 'BLACKLISTED'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationalID: string;
    biometricHash?: string;
    citizenships: string[];
    residentialAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
  };
  clearanceLevel: ClearanceLevel;
  status: UserStatus;
  financials: {
    fiatBalances: Map<string, number>; // Currency Code -> Balance
    cbdcBalance: number; // Central Bank Digital Currency
    creditScore: number;
    totalAssetValueUSD: number;
    frozenAssets: boolean;
  };
  assets: {
    realEstate: Types.ObjectId[]; // References to RealEstate model
    vehicles: Types.ObjectId[];    // References to Vehicle model
    companies: Types.ObjectId[];   // References to Organization model
    intellectualProperty: string[];
  };
  governance: {
    votingPower: number;
    assignedJurisdiction?: string;
    heldOffices: string[];
    taxRateOverride?: number;
  };
  metadata: {
    lastLogin: Date;
    ipHistory: string[];
    systemNotes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganization extends Document {
  name: string;
  registrationNumber: string;
  taxIdentifier: string;
  type: OrganizationType;
  jurisdiction: string;
  ownerId: Types.ObjectId | IUser;
  boardMembers: Types.ObjectId[];
  financials: {
    treasuryBalanceUSD: number;
    fiatBalances: Map<string, number>;
    annualRevenueUSD: number;
    liabilitiesUSD: number;
    shareCapitalUSD: number;
  };
  supplyChain: {
    nodes: Array<{
      nodeId: string;
      name: string;
      location: string;
      capacity: number;
      nodeType: 'FACTORY' | 'WAREHOUSE' | 'DISTRIBUTION_CENTER' | 'RETAIL';
    }>;
    partners: Types.ObjectId[]; // References to other Organizations
    producedGoodsCategories: string[];
  };
  assets: {
    realEstate: Types.ObjectId[];
    vehicles: Types.ObjectId[];
    patents: string[];
  };
  compliance: {
    status: ComplianceStatus;
    regulatoryClearanceLevel: ClearanceLevel;
    lastAuditDate: Date;
    auditorNotes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SCHEMAS
// ============================================================================

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    personalInfo: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      dateOfBirth: { type: Date, required: true },
      nationalID: { type: String, required: true, unique: true, index: true },
      biometricHash: { type: String },
      citizenships: [{ type: String, required: true }],
      residentialAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        coordinates: {
          latitude: { type: Number, min: -90, max: 90 },
          longitude: { type: Number, min: -180, max: 180 }
        }
      }
    },
    clearanceLevel: {
      type: String,
      enum: Object.values(ClearanceLevel),
      default: ClearanceLevel.CITIZEN,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true
    },
    financials: {
      fiatBalances: {
        type: Map,
        of: Number,
        default: { USD: 0 }
      },
      cbdcBalance: { type: Number, default: 0, min: 0 },
      creditScore: { type: Number, default: 700, min: 300, max: 850 },
      totalAssetValueUSD: { type: Number, default: 0, min: 0 },
      frozenAssets: { type: Boolean, default: false }
    },
    assets: {
      realEstate: [{ type: Schema.Types.ObjectId, ref: 'RealEstate' }],
      vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
      companies: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],
      intellectualProperty: [{ type: String }]
    },
    governance: {
      votingPower: { type: Number, default: 1, min: 0 },
      assignedJurisdiction: { type: String },
      heldOffices: [{ type: String }],
      taxRateOverride: { type: Number, min: 0, max: 100 }
    },
    metadata: {
      lastLogin: { type: Date, default: Date.now },
      ipHistory: [{ type: String }],
      systemNotes: { type: String }
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    taxIdentifier: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(OrganizationType),
      required: true,
      index: true
    },
    jurisdiction: {
      type: String,
      required: true,
      index: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    boardMembers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    financials: {
      treasuryBalanceUSD: { type: Number, default: 0 },
      fiatBalances: {
        type: Map,
        of: Number,
        default: { USD: 0 }
      },
      annualRevenueUSD: { type: Number, default: 0, min: 0 },
      liabilitiesUSD: { type: Number, default: 0, min: 0 },
      shareCapitalUSD: { type: Number, default: 0, min: 0 }
    },
    supplyChain: {
      nodes: [{
        nodeId: { type: String, required: true },
        name: { type: String, required: true },
        location: { type: String, required: true },
        capacity: { type: Number, required: true, min: 0 },
        nodeType: {
          type: String,
          enum: ['FACTORY', 'WAREHOUSE', 'DISTRIBUTION_CENTER', 'RETAIL'],
          required: true
        }
      }],
      partners: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],
      producedGoodsCategories: [{ type: String }]
    },
    assets: {
      realEstate: [{ type: Schema.Types.ObjectId, ref: 'RealEstate' }],
      vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
      patents: [{ type: String }]
    },
    compliance: {
      status: {
        type: String,
        enum: Object.values(ComplianceStatus),
        default: ComplianceStatus.APPROVED,
        index: true
      },
      regulatoryClearanceLevel: {
        type: String,
        enum: Object.values(ClearanceLevel),
        default: ClearanceLevel.CITIZEN
      },
      lastAuditDate: { type: Date, default: Date.now },
      auditorNotes: { type: String }
    }
  },
  {
    timestamps: true,
    collection: 'organizations'
  }
);

// ============================================================================
// INDEXES (Performance & Global Search Optimization)
// ============================================================================

// User Indexes
UserSchema.index({ 'personalInfo.lastName': 1, 'personalInfo.firstName': 1 });
UserSchema.index({ clearanceLevel: 1, status: 1 });
UserSchema.index({ 'financials.cbdcBalance': -1 });
UserSchema.index({ 'personalInfo.residentialAddress.country': 1 });

// Organization Indexes
OrganizationSchema.index({ type: 1, jurisdiction: 1 });
OrganizationSchema.index({ 'compliance.status': 1 });
OrganizationSchema.index({ 'financials.treasuryBalanceUSD': -1 });
OrganizationSchema.index({ 'supplyChain.nodes.location': 1 });

// ============================================================================
// MODELS EXPORT
// ============================================================================

export const User = model<IUser>('User', UserSchema);
export const Organization = model<IOrganization>('Organization', OrganizationSchema);