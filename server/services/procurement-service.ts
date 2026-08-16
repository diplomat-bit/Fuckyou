import { EventEmitter } from "events";
import * as crypto from "crypto";

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export enum AssetCategory {
  REAL_ESTATE = "REAL_ESTATE",
  VEHICLES = "VEHICLES",
  SOVEREIGN_INFRASTRUCTURE = "SOVEREIGN_INFRASTRUCTURE",
  RAW_MATERIALS = "RAW_MATERIALS",
  TECHNOLOGY_HARDWARE = "TECHNOLOGY_HARDWARE",
  MILITARY_DEFENSE = "MILITARY_DEFENSE",
  LOGISTICS_TRANSPORT = "LOGISTICS_TRANSPORT",
  SATELLITE_AEROSPACE = "SATELLITE_AEROSPACE",
  HUMAN_CAPITAL = "HUMAN_CAPITAL"
}

export enum RequisitionStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RFP_ISSUED = "RFP_ISSUED",
  AWARDED = "AWARDED",
  COMPLETED = "COMPLETED"
}

export enum BidStatus {
  SUBMITTED = "SUBMITTED",
  UNDER_EVALUATION = "UNDER_EVALUATION",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  COUNTER_OFFERED = "COUNTER_OFFERED"
}

export enum POStatus {
  CREATED = "CREATED",
  SENT_TO_VENDOR = "SENT_TO_VENDOR",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  INSPECTED_AND_ACCEPTED = "INSPECTED_AND_ACCEPTED",
  PAID = "PAID",
  CANCELLED = "CANCELLED"
}

export enum ContractStatus {
  DRAFTING = "DRAFTING",
  UNDER_REVIEW = "UNDER_REVIEW",
  PENDING_SIGNATURES = "PENDING_SIGNATURES",
  ACTIVE = "ACTIVE",
  UNDER_DISPUTE = "UNDER_DISPUTE",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED"
}

export interface RequisitionItem {
  id: string;
  name: string;
  description: string;
  category: AssetCategory;
  quantity: number;
  estimatedUnitPrice: number;
  specifications: Record<string, any>;
}

export interface Requisition {
  id: string;
  title: string;
  requesterId: string;
  department: string;
  items: RequisitionItem[];
  totalEstimatedCost: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "SOVEREIGN_EMERGENCY";
  status: RequisitionStatus;
  approvalsRequired: string[];
  approvalsReceived: { userId: string; timestamp: Date; decision: "APPROVED" | "REJECTED" }[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface Vendor {
  id: string;
  name: string;
  globalTaxId: string;
  categories: AssetCategory[];
  rating: number;
  complianceScore: number;
  geopoliticalRiskIndex: number;
  financialSolvencyScore: number;
  contactEmail: string;
  isSovereignEntity: boolean;
  preferredCurrency: string;
}

export interface Bid {
  id: string;
  requisitionId: string;
  vendorId: string;
  proposedItems: {
    itemId: string;
    unitPrice: number;
    deliveryLeadTimeDays: number;
    specificationsMet: boolean;
    notes?: string;
  }[];
  totalBidAmount: number;
  earliestDeliveryDate: Date;
  termsAndConditions: string;
  status: BidStatus;
  aiEvaluationScore?: number;
  submittedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  requisitionId: string;
  bidId: string;
  vendorId: string;
  items: {
    itemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  currency: string;
  status: POStatus;
  deliveryAddress: string;
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  paymentTerms: string;
  milestones: {
    id: string;
    description: string;
    targetDate: Date;
    completedDate?: Date;
    status: "PENDING" | "COMPLETED" | "DELAYED";
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  purchaseOrderId?: string;
  vendorId: string;
  title: string;
  terms: string;
  slaMetrics: {
    metricName: string;
    targetValue: number;
    penaltyRate: number;
  }[];
  value: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  signatures: {
    party: string;
    signatureHash: string;
    signedAt: Date;
  }[];
  autoRenew: boolean;
  renewalNoticePeriodDays: number;
}

// ============================================================================
// IN-MEMORY DATABASE
// ============================================================================

class GlobalProcurementDatabase {
  public requisitions = new Map<string, Requisition>();
  public vendors = new Map<string, Vendor>();
  public bids = new Map<string, Bid>();
  public purchaseOrders = new Map<string, PurchaseOrder>();
  public contracts = new Map<string, Contract>();

  constructor() {
    this.seedInitialVendors();
  }

  private seedInitialVendors() {
    const seedVendors: Vendor[] = [
      {
        id: "vnd-global-infra-001",
        name: "Apex Sovereign Infrastructure Corp",
        globalTaxId: "TX-99281-A",
        categories: [AssetCategory.SOVEREIGN_INFRASTRUCTURE, AssetCategory.REAL_ESTATE],
        rating: 9.8,
        complianceScore: 0.99,
        geopoliticalRiskIndex: 0.05,
        financialSolvencyScore: 0.98,
        contactEmail: "procurement@apex-sovereign.net",
        isSovereignEntity: true,
        preferredCurrency: "USD"
      },
      {
        id: "vnd-titan-logistics-002",
        name: "Titan Global Logistics & Supply Chain",
        globalTaxId: "TX-11029-B",
        categories: [AssetCategory.LOGISTICS_TRANSPORT, AssetCategory.VEHICLES],
        rating: 9.2,
        complianceScore: 0.95,
        geopoliticalRiskIndex: 0.12,
        financialSolvencyScore: 0.91,
        contactEmail: "bids@titan-logistics.com",
        isSovereignEntity: false,
        preferredCurrency: "EUR"
      },
      {
        id: "vnd-omni-tech-003",
        name: "OmniSec Aerospace & Defense Systems",
        globalTaxId: "TX-88301-M",
        categories: [AssetCategory.MILITARY_DEFENSE, AssetCategory.SATELLITE_AEROSPACE, AssetCategory.TECHNOLOGY_HARDWARE],
        rating: 9.9,
        complianceScore: 1.0,
        geopoliticalRiskIndex: 0.01,
        financialSolvencyScore: 0.99,
        contactEmail: "secure-bids@omnisec.gov",
        isSovereignEntity: true,
        preferredCurrency: "USD"
      },
      {
        id: "vnd-terra-resources-004",
        name: "Terra Firma Raw Materials & Mining",
        globalTaxId: "TX-44512-R",
        categories: [AssetCategory.RAW_MATERIALS],
        rating: 8.5,
        complianceScore: 0.88,
        geopoliticalRiskIndex: 0.35,
        financialSolvencyScore: 0.85,
        contactEmail: "sales@terrafirma-mining.com",
        isSovereignEntity: false,
        preferredCurrency: "CHF"
      }
    ];

    for (const vendor of seedVendors) {
      this.vendors.set(vendor.id, vendor);
    }
  }
}

const DB = new GlobalProcurementDatabase();

// ============================================================================
// PROCUREMENT SERVICE LAYER
// ============================================================================

export class ProcurementService extends EventEmitter {
  private static instance: ProcurementService;

  private constructor() {
    super();
    this.initializeAutomatedWorkflows();
  }

  public static getInstance(): ProcurementService {
    if (!ProcurementService.instance) {
      ProcurementService.instance = new ProcurementService();
    }
    return ProcurementService.instance;
  }

  private initializeAutomatedWorkflows() {
    this.on("requisitionApproved", async (requisitionId: string) => {
      await this.triggerAutomatedRFP(requisitionId);
    });

    this.on("bidSubmitted", async (bidId: string) => {
      await this.evaluateBidWithAI(bidId);
    });

    this.on("contractCreated", async (contractId: string) => {
      await this.simulateSovereignSignatureWorkflow(contractId);
    });
  }

  public async createRequisition(params: {
    title: string;
    requesterId: string;
    department: string;
    items: Omit<RequisitionItem, "id">[];
    priority: Requisition["priority"];
    metadata?: Record<string, any>;
  }): Promise<Requisition> {
    const itemsWithIds: RequisitionItem[] = params.items.map(item => ({
      ...item,
      id: `item-${crypto.randomUUID()}`
    }));

    const totalEstimatedCost = itemsWithIds.reduce(
      (sum, item) => sum + item.quantity * item.estimatedUnitPrice,
      0
    );

    const approvalsRequired: string[] = ["FINANCIAL_CONTROLLER"];
    if (totalEstimatedCost > 10000000) approvalsRequired.push("CHIEF_OPERATING_OFFICER");
    if (totalEstimatedCost > 100000000 || params.priority === "SOVEREIGN_EMERGENCY") approvalsRequired.push("ILLUMINATI_COUNCIL_DIRECTOR");

    const requisition: Requisition = {
      id: `req-${crypto.randomUUID()}`,
      title: params.title,
      requesterId: params.requesterId,
      department: params.department,
      items: itemsWithIds,
      totalEstimatedCost,
      priority: params.priority,
      status: RequisitionStatus.PENDING_APPROVAL,
      approvalsRequired,
      approvalsReceived: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: params.metadata || {}
    };

    DB.requisitions.set(requisition.id, requisition);
    this.emit("requisitionCreated", requisition.id);

    if (totalEstimatedCost < 50000 && params.priority !== "SOVEREIGN_EMERGENCY") {
      await this.bypassApprovalForMinorRequisition(requisition.id);
    }

    return requisition;
  }

  public async approveRequisition(
    requisitionId: string,
    userId: string,
    role: string,
    decision: "APPROVED" | "REJECTED"
  ): Promise<Requisition> {
    const req = DB.requisitions.get(requisitionId);
    if (!req) throw new Error(`Requisition ${requisitionId} not found.`);

    if (!req.approvalsRequired.includes(role)) throw new Error(`Role ${role} not authorized.`);
    if (req.approvalsReceived.some(app => app.userId === userId)) throw new Error(`User ${userId} already decided.`);

    req.approvalsReceived.push({ userId, timestamp: new Date(), decision });
    req.updatedAt = new Date();

    if (decision === "REJECTED") {
      req.status = RequisitionStatus.REJECTED;
      this.emit("requisitionRejected", req.id);
    } else {
      const approvedRoles = req.approvalsReceived.filter(a => a.decision === "APPROVED").map(() => role);
      if (req.approvalsRequired.every(r => approvedRoles.includes(r))) {
        req.status = RequisitionStatus.APPROVED;
        this.emit("requisitionApproved", req.id);
      }
    }

    DB.requisitions.set(req.id, req);
    return req;
  }

  private async bypassApprovalForMinorRequisition(requisitionId: string) {
    const req = DB.requisitions.get(requisitionId);
    if (req) {
      req.status = RequisitionStatus.APPROVED;
      req.approvalsReceived.push({ userId: "SYSTEM_AUTO_APPROVER", timestamp: new Date(), decision: "APPROVED" });
      req.updatedAt = new Date();
      DB.requisitions.set(req.id, req);
      this.emit("requisitionApproved", req.id);
    }
  }

  public async triggerAutomatedRFP(requisitionId: string): Promise<void> {
    const req = DB.requisitions.get(requisitionId);
    if (!req) return;

    req.status = RequisitionStatus.RFP_ISSUED;
    req.updatedAt = new Date();
    DB.requisitions.set(req.id, req);

    const categoriesNeeded = new Set(req.items.map(item => item.category));
    const matchedVendors = Array.from(DB.vendors.values()).filter(v => v.categories.some(c => categoriesNeeded.has(c)));

    for (const vendor of matchedVendors) {
      await this.simulateVendorAutoBid(req, vendor);
    }
  }

  private async simulateVendorAutoBid(requisition: Requisition, vendor: Vendor): Promise<void> {
    const priceMultiplier = 0.9 + (vendor.rating / 20) - (vendor.complianceScore * 0.05);
    const deliveryLeadTimeDays = Math.max(1, Math.round(15 - (vendor.rating * 1.2)));

    const proposedItems = requisition.items.map(item => ({
      itemId: item.id,
      unitPrice: parseFloat((item.estimatedUnitPrice * priceMultiplier).toFixed(2)),
      deliveryLeadTimeDays,
      specificationsMet: true,
      notes: `Automated bid from ${vendor.name}.`
    }));

    const totalBidAmount = proposedItems.reduce((sum, item) => sum + (item.unitPrice * (requisition.items.find(ri => ri.id === item.itemId)?.quantity || 1)), 0);

    const bid: Bid = {
      id: `bid-${crypto.randomUUID()}`,
      requisitionId: requisition.id,
      vendorId: vendor.id,
      proposedItems,
      totalBidAmount,
      earliestDeliveryDate: new Date(Date.now() + deliveryLeadTimeDays * 86400000),
      termsAndConditions: `Standard Sovereign Procurement Agreement v4.2.`,
      status: BidStatus.SUBMITTED,
      submittedAt: new Date()
    };

    DB.bids.set(bid.id, bid);
    this.emit("bidSubmitted", bid.id);
  }

  public async evaluateBidWithAI(bidId: string): Promise<number> {
    const bid = DB.bids.get(bidId);
    if (!bid) throw new Error(`Bid ${bidId} not found.`);

    const vendor = DB.vendors.get(bid.vendorId);
    const req = DB.requisitions.get(bid.requisitionId);
    if (!vendor || !req) return 0;

    bid.status = BidStatus.UNDER_EVALUATION;

    const priceScore = Math.min(1.0, req.totalEstimatedCost / bid.totalBidAmount);
    const deliveryScore = Math.max(0.1, 1 - (Math.max(...bid.proposedItems.map(i => i.deliveryLeadTimeDays)) / 60));
    const compositeScore = (priceScore * 0.35) + (deliveryScore * 0.2) + ((vendor.rating / 10) * 0.2) + (vendor.complianceScore * 0.15) + ((1 - vendor.geopoliticalRiskIndex) * 0.1);

    bid.aiEvaluationScore = parseFloat((compositeScore * 100).toFixed(2));
    DB.bids.set(bid.id, bid);

    this.emit("bidEvaluated", bid.id, bid.aiEvaluationScore);
    await this.evaluateAndAutoAwardRequisition(req.id);

    return bid.aiEvaluationScore;
  }

  private async evaluateAndAutoAwardRequisition(requisitionId: string): Promise<void> {
    const req = DB.requisitions.get(requisitionId);
    if (!req || req.status !== RequisitionStatus.RFP_ISSUED) return;

    const bids = Array.from(DB.bids.values()).filter(b => b.requisitionId === requisitionId);
    if (bids.length < 3) return;
    if (!bids.every(b => b.aiEvaluationScore !== undefined)) return;

    bids.sort((a, b) => (b.aiEvaluationScore || 0) - (a.aiEvaluationScore || 0));
    const winningBid = bids[0];

    for (let i = 1; i < bids.length; i++) {
      bids[i].status = BidStatus.REJECTED;
      DB.bids.set(bids[i].id, bids[i]);
    }

    winningBid.status = BidStatus.ACCEPTED;
    DB.bids.set(winningBid.id, winningBid);
    req.status = RequisitionStatus.AWARDED;
    DB.requisitions.set(req.id, req);

    this.emit("requisitionAwarded", req.id, winningBid.id);
    await this.createPurchaseOrderFromBid(winningBid.id);
  }

  private async createPurchaseOrderFromBid(bidId: string): Promise<PurchaseOrder> {
    const bid = DB.bids.get(bidId);
    if (!bid || bid.status !== BidStatus.ACCEPTED) throw new Error("Invalid bid.");

    const req = DB.requisitions.get(bid.requisitionId);
    const vendor = DB.vendors.get(bid.vendorId);
    if (!req || !vendor) throw new Error("Missing data.");

    const poItems = bid.proposedItems.map(pItem => ({
      itemId: pItem.itemId,
      quantity: req.items.find(ri => ri.id === pItem.itemId)?.quantity || 1,
      unitPrice: pItem.unitPrice,
      totalPrice: parseFloat((pItem.unitPrice * (req.items.find(ri => ri.id === pItem.itemId)?.quantity || 1)).toFixed(2))
    }));

    const po: PurchaseOrder = {
      id: `po-${crypto.randomUUID()}`,
      requisitionId: req.id,
      bidId: bid.id,
      vendorId: vendor.id,
      items: poItems,
      totalAmount: poItems.reduce((sum, i) => sum + i.totalPrice, 0),
      currency: vendor.preferredCurrency,
      status: POStatus.CREATED,
      deliveryAddress: req.metadata.deliveryAddress || "Global Logistics Hub Alpha",
      estimatedDeliveryDate: bid.earliestDeliveryDate,
      paymentTerms: bid.termsAndConditions,
      milestones: [{ id: `ms-${crypto.randomUUID()}`, description: "Delivery", targetDate: bid.earliestDeliveryDate, status: "PENDING" }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    DB.purchaseOrders.set(po.id, po);
    this.emit("poCreated", po.id);
    await this.generateContractForPO(po.id);
    return po;
  }

  private async generateContractForPO(poId: string): Promise<Contract> {
    const po = DB.purchaseOrders.get(poId);
    if (!po) throw new Error("PO not found.");

    const contract: Contract = {
      id: `ctr-${crypto.randomUUID()}`,
      purchaseOrderId: po.id,
      vendorId: po.vendorId,
      title: `Sovereign Procurement Agreement - ${po.id}`,
      terms: "Standard terms apply.",
      slaMetrics: [{ metricName: "On-Time Delivery", targetValue: 95, penaltyRate: 0.02 }],
      value: po.totalAmount,
      currency: po.currency,
      startDate: new Date(),
      endDate: po.estimatedDeliveryDate,
      status: ContractStatus.DRAFTING,
      signatures: [],
      autoRenew: false,
      renewalNoticePeriodDays: 30
    };

    DB.contracts.set(contract.id, contract);
    this.emit("contractCreated", contract.id);
    return contract;
  }

  private async simulateSovereignSignatureWorkflow(contractId: string): Promise<void> {
    const contract = DB.contracts.get(contractId);
    if (!contract) return;

    contract.status = ContractStatus.PENDING_SIGNATURES;
    contract.signatures.push({ party: "SOVEREIGN_AI", signatureHash: crypto.randomBytes(32).toString("hex"), signedAt: new Date() });
    
    setTimeout(() => {
      contract.signatures.push({ party: "VENDOR", signatureHash: crypto.randomBytes(32).toString("hex"), signedAt: new Date() });
      contract.status = ContractStatus.ACTIVE;
      DB.contracts.set(contract.id, contract);
      if (contract.purchaseOrderId) this.updatePOStatus(contract.purchaseOrderId, POStatus.ACKNOWLEDGED);
      this.emit("contractActivated", contract.id);
    }, 1000);
  }

  public async updatePOStatus(poId: string, status: POStatus): Promise<PurchaseOrder> {
    const po = DB.purchaseOrders.get(poId);
    if (!po) throw new Error("PO not found.");
    po.status = status;
    po.updatedAt = new Date();
    DB.purchaseOrders.set(po.id, po);
    return po;
  }

  public getGlobalProcurementDashboard() {
    return {
      totalRequisitions: DB.requisitions.size,
      totalCommittedSpend: Array.from(DB.purchaseOrders.values()).reduce((sum, po) => sum + po.totalAmount, 0),
      activeContracts: Array.from(DB.contracts.values()).filter(c => c.status === ContractStatus.ACTIVE).length
    };
  }
}