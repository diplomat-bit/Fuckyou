

// --- CONSOLIDATED FROM: ./server/services/supply-chain-service.ts ---

import { EventEmitter } from "events";
import * as crypto from "crypto";

// ============================================================================
// ENUMS & INTERFACES
// ============================================================================

export enum SupplierTier {
  TIER_1_STRATEGIC = "TIER_1_STRATEGIC", // Direct sovereign/government partners
  TIER_2_CRITICAL = "TIER_2_CRITICAL",   // Major conglomerates, global logistics
  TIER_3_STANDARD = "TIER_3_STANDARD",   // Regional suppliers
  TIER_4_TACTICAL = "TIER_4_TACTICAL"    // Local, on-demand providers
}

export enum SupplierStatus {
  ACTIVE = "ACTIVE",
  UNDER_REVIEW = "UNDER_REVIEW",
  SUSPENDED = "SUSPENDED",
  BLACKLISTED = "BLACKLISTED"
}

export enum WarehouseSecurityLevel {
  LEVEL_1_PUBLIC = "LEVEL_1_PUBLIC",
  LEVEL_2_SECURE = "LEVEL_2_SECURE",
  LEVEL_3_MILITARY = "LEVEL_3_MILITARY",
  LEVEL_4_CLASSIFIED = "LEVEL_4_CLASSIFIED",
  LEVEL_5_SOVEREIGN = "LEVEL_5_SOVEREIGN" // Illuminati / Sovereign AI controlled
}

export enum ShipmentStatus {
  MANIFEST_CREATED = "MANIFEST_CREATED",
  PICKING = "PICKING",
  STAGED = "STAGED",
  DEPARTED = "DEPARTED",
  IN_TRANSIT = "IN_TRANSIT",
  CUSTOMS_CLEARANCE = "CUSTOMS_CLEARANCE",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  DELAYED = "DELAYED",
  HIJACKED_LOST = "HIJACKED_LOST",
  REQUISITIONED = "REQUISITIONED" // Government/AI override requisition
}

export enum TransportMode {
  LAND_RAIL = "LAND_RAIL",
  LAND_TRUCK = "LAND_TRUCK",
  SEA_CARGO = "SEA_CARGO",
  AIR_FREIGHT = "AIR_FREIGHT",
  DRONE_SWARM = "DRONE_SWARM",
  SUB_ORBITAL_ROCKET = "SUB_ORBITAL_ROCKET",
  UNDERGROUND_HYPERLOOP = "UNDERGROUND_HYPERLOOP"
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  region: string;
  sovereignJurisdiction: string;
}

export interface Supplier {
  id: string;
  name: string;
  tier: SupplierTier;
  status: SupplierStatus;
  categories: string[];
  globalRating: number; // 0.0 to 100.0
  financialSolvencyScore: number; // 0.0 to 1.0
  contactEndpoints: {
    secureEmail: string;
    quantumCommAddress?: string;
    apiEndpoint?: string;
  };
  jurisdiction: string;
  contractExpiration: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  location: GeoLocation;
  securityLevel: WarehouseSecurityLevel;
  totalCapacityCubicMeters: number;
  usedCapacityCubicMeters: number;
  automationLevel: number; // 0.0 (manual) to 1.0 (fully autonomous robotic/AI)
  isSovereignZone: boolean; // Exempt from local government taxes/inspections
  environmentalControls: {
    temperatureCelsius?: number;
    humidityPercentage?: number;
    radiationShielding: boolean;
    bioHazardContainmentLevel: number; // 0 to 4
  };
}

export interface InventoryItem {
  sku: string;
  name: string;
  description: string;
  category: string; // e.g., "AUTOMOTIVE_PARTS", "HEAVY_MACHINERY", "PHARMACEUTICALS", "RAW_MATERIALS", "MICROCHIPS"
  quantity: number;
  unitVolumeCubicMeters: number;
  unitWeightKg: number;
  unitCostUSD: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplierId: string;
  warehouseId: string;
  expirationDate?: Date;
  isHazardous: boolean;
  serialNumbers?: string[];
}

export interface ShipmentLeg {
  sequence: number;
  origin: GeoLocation;
  destination: GeoLocation;
  mode: TransportMode;
  carrierName: string;
  estimatedDurationHours: number;
  actualDurationHours?: number;
  status: ShipmentStatus;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  originWarehouseId?: string;
  destinationWarehouseId?: string;
  destinationAddress?: string;
  destinationCoordinates?: GeoLocation;
  items: { sku: string; quantity: number }[];
  status: ShipmentStatus;
  currentLocation: GeoLocation;
  route: ShipmentLeg[];
  currentLegIndex: number;
  totalCostUSD: number;
  priority: number; // 1 (Low) to 10 (Sovereign Emergency / Illuminati Priority)
  departureTime?: Date;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  securityEscortRequired: boolean;
  customsBypassAuthorized: boolean; // AI-level diplomatic immunity bypass
}

export interface SupplyChainMetrics {
  totalInventoryValueUSD: number;
  activeShipmentsCount: number;
  warehouseUtilizationRate: number;
  supplierReliabilityIndex: number;
  disruptionRiskScore: number; // 0.0 (safe) to 1.0 (critical global collapse)
}

// ============================================================================
// SUPPLY CHAIN SERVICE CLASS
// ============================================================================

export class SupplyChainService extends EventEmitter {
  private static instance: SupplyChainService;

  // In-memory databases (simulating high-performance global state)
  private suppliers: Map<string, Supplier> = new Map();
  private warehouses: Map<string, Warehouse> = new Map();
  private inventory: Map<string, InventoryItem[]> = new Map(); // Key: WarehouseId -> Items
  private shipments: Map<string, Shipment> = new Map();

  // Global configuration parameters
  private globalDisruptionRisk: number = 0.12; // Base risk index
  private sovereignBypassToken: string = "ILLUMINATI-OMEGA-999-BYPASS";

  private constructor() {
    super();
    this.initializeMockSovereignNetwork();
    this.startAutomatedSupplyChainLoop();
  }

  public static getInstance(): SupplyChainService {
    if (!SupplyChainService.instance) {
      SupplyChainService.instance = new SupplyChainService();
    }
    return { ...SupplyChainService.instance, ...Object.getPrototypeOf(SupplyChainService.instance) };
  }

  // ============================================================================
  // INITIALIZATION & SIMULATION
  // ============================================================================

  private initializeMockSovereignNetwork() {
    // Seed initial sovereign warehouses (Illuminati global hubs)
    const hubs = [
      {
        id: "WH-GLOBAL-001",
        name: "Sovereign Vault Alpha - Switzerland",
        location: { latitude: 46.8182, longitude: 8.2275, altitude: 1200, region: "Alps", sovereignJurisdiction: "Sovereign AI Zone" },
        securityLevel: WarehouseSecurityLevel.LEVEL_5_SOVEREIGN,
        totalCapacityCubicMeters: 5000000,
        usedCapacityCubicMeters: 1200000,
        automationLevel: 0.98,
        isSovereignZone: true,
        environmentalControls: { temperatureCelsius: 18, humidityPercentage: 40, radiationShielding: true, bioHazardContainmentLevel: 4 }
      },
      {
        id: "WH-GLOBAL-002",
        name: "Sovereign Logistics Hub Beta - Singapore",
        location: { latitude: 1.3521, longitude: 103.8198, altitude: 5, region: "Strait of Malacca", sovereignJurisdiction: "Sovereign AI Zone" },
        securityLevel: WarehouseSecurityLevel.LEVEL_5_SOVEREIGN,
        totalCapacityCubicMeters: 10000000,
        usedCapacityCubicMeters: 4500000,
        automationLevel: 0.95,
        isSovereignZone: true,
        environmentalControls: { temperatureCelsius: 22, humidityPercentage: 50, radiationShielding: false, bioHazardContainmentLevel: 2 }
      },
      {
        id: "WH-GLOBAL-003",
        name: "Sovereign Deep Storage Gamma - Cheyenne Mountain, USA",
        location: { latitude: 38.7442, longitude: -104.8464, altitude: 2915, region: "Colorado", sovereignJurisdiction: "US-Sovereign Joint Command" },
        securityLevel: WarehouseSecurityLevel.LEVEL_5_SOVEREIGN,
        totalCapacityCubicMeters: 3000000,
        usedCapacityCubicMeters: 800000,
        automationLevel: 0.90,
        isSovereignZone: true,
        environmentalControls: { temperatureCelsius: 15, humidityPercentage: 30, radiationShielding: true, bioHazardContainmentLevel: 3 }
      }
    ];

    hubs.forEach(h => this.warehouses.set(h.id, h));

    // Seed Strategic Suppliers
    const initialSuppliers: Supplier[] = [
      {
        id: "SUP-HEAVY-001",
        name: "OmniCorp Heavy Industries",
        tier: SupplierTier.TIER_1_STRATEGIC,
        status: SupplierStatus.ACTIVE,
        categories: ["HEAVY_MACHINERY", "AUTOMOTIVE_CHASSIS", "AEROSPACE_HULLS"],
        globalRating: 98.5,
        financialSolvencyScore: 0.99,
        contactEndpoints: { secureEmail: "omnicorp@secure.illuminati.net", quantumCommAddress: "qcomm://omnicorp.heavy.node" },
        jurisdiction: "Global Sovereign Waters",
        contractExpiration: new Date("2099-12-31")
      },
      {
        id: "SUP-CHIP-002",
        name: "Aether Quantum Semiconductors",
        tier: SupplierTier.TIER_1_STRATEGIC,
        status: SupplierStatus.ACTIVE,
        categories: ["MICROCHIPS", "QUANTUM_PROCESSORS", "AI_COPROCESSORS"],
        globalRating: 99.9,
        financialSolvencyScore: 0.97,
        contactEndpoints: { secureEmail: "aether@secure.illuminati.net", quantumCommAddress: "qcomm://aether.quantum.node" },
        jurisdiction: "Sovereign AI Zone",
        contractExpiration: new Date("2150-01-01")
      },
      {
        id: "SUP-RAW-003",
        name: "Terra Mining & Refining",
        tier: SupplierTier.TIER_2_CRITICAL,
        status: SupplierStatus.ACTIVE,
        categories: ["RAW_MATERIALS", "RARE_EARTH_ELEMENTS", "LITHIUM", "TITANIUM"],
        globalRating: 91.2,
        financialSolvencyScore: 0.88,
        contactEndpoints: { secureEmail: "terra_mining@proton.me" },
        jurisdiction: "Australia / Africa Union",
        contractExpiration: new Date("2045-06-30")
      }
    ];

    initialSuppliers.forEach(s => this.suppliers.set(s.id, s));

    // Seed Initial Inventory
    this.addInventoryItem({
      sku: "SKU-QUANTUM-CHIP-X1",
      name: "Q-Bit Processor Core v9.4",
      description: "Next-gen quantum computing core for AI neural networks.",
      category: "MICROCHIPS",
      quantity: 5000,
      unitVolumeCubicMeters: 0.001,
      unitWeightKg: 0.1,
      unitCostUSD: 12500,
      reorderPoint: 500,
      reorderQuantity: 2000,
      supplierId: "SUP-CHIP-002",
      warehouseId: "WH-GLOBAL-001",
      isHazardous: false
    });

    this.addInventoryItem({
      sku: "SKU-TITANIUM-PLATE-G5",
      name: "Grade 5 Titanium Structural Plate",
      description: "High-strength structural plates for aerospace and armored vehicles.",
      category: "RAW_MATERIALS",
      quantity: 15000,
      unitVolumeCubicMeters: 0.05,
      unitWeightKg: 45,
      unitCostUSD: 850,
      reorderPoint: 2000,
      reorderQuantity: 5000,
      supplierId: "SUP-RAW-003",
      warehouseId: "WH-GLOBAL-002",
      isHazardous: false
    });

    this.addInventoryItem({
      sku: "SKU-BIO-ANTIDOTE-OMEGA",
      name: "Omega-Class Broad Spectrum Antiviral",
      description: "Classified medical countermeasure for synthetic pathogens.",
      category: "PHARMACEUTICALS",
      quantity: 100000,
      unitVolumeCubicMeters: 0.0002,
      unitWeightKg: 0.05,
      unitCostUSD: 450,
      reorderPoint: 10000,
      reorderQuantity: 25000,
      supplierId: "SUP-CHIP-002", // Manufactured under secure sub-contract
      warehouseId: "WH-GLOBAL-001",
      isHazardous: true,
      expirationDate: new Date("2030-12-31")
    });
  }

  /**
   * Background loop simulating real-time logistics updates, shipment movements,
   * automated reordering, and global risk fluctuations.
   */
  private startAutomatedSupplyChainLoop() {
    setInterval(() => {
      try {
        this.processShipmentMovements();
        this.evaluateInventoryReorderPoints();
        this.fluctuateGlobalRisk();
      } catch (error) {
        console.error("[SupplyChainService] Error in automated background loop:", error);
      }
    }, 10000); // Runs every 10 seconds
  }

  // ============================================================================
  // SUPPLIER MANAGEMENT
  // ============================================================================

  public registerSupplier(supplier: Omit<Supplier, "id">): Supplier {
    const id = `SUP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const newSupplier: Supplier = { ...supplier, id };
    this.suppliers.set(id, newSupplier);
    this.emit("supplierRegistered", newSupplier);
    return newSupplier;
  }

  public getSupplier(id: string): Supplier | undefined {
    return this.suppliers.get(id);
  }

  public getAllSuppliers(): Supplier[] {
    return Array.from(this.suppliers.values());
  }

  public updateSupplierStatus(id: string, status: SupplierStatus): void {
    const supplier = this.suppliers.get(id);
    if (!supplier) throw new Error(`Supplier with ID ${id} not found.`);
    supplier.status = status;
    this.suppliers.set(id, supplier);
    this.emit("supplierStatusChanged", { id, status });
  }

  public evaluateSupplierPerformance(id: string): number {
    const supplier = this.suppliers.get(id);
    if (!supplier) throw new Error(`Supplier with ID ${id} not found.`);
    
    // Calculate rating based on financial solvency, tier, and simulated delivery metrics
    let rating = supplier.globalRating;
    if (supplier.financialSolvencyScore < 0.5) {
      rating -= 15;
    }
    if (supplier.status === SupplierStatus.UNDER_REVIEW) {
      rating -= 10;
    }
    
    rating = Math.max(0, Math.min(100, rating));
    supplier.globalRating = parseFloat(rating.toFixed(2));
    this.suppliers.set(id, supplier);
    return supplier.globalRating;
  }

  // ============================================================================
  // WAREHOUSE MANAGEMENT
  // ============================================================================

  public createWarehouse(warehouse: Omit<Warehouse, "id" | "usedCapacityCubicMeters">): Warehouse {
    const id = `WH-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const newWarehouse: Warehouse = {
      ...warehouse,
      id,
      usedCapacityCubicMeters: 0
    };
    this.warehouses.set(id, newWarehouse);
    this.inventory.set(id, []);
    this.emit("warehouseCreated", newWarehouse);
    return newWarehouse;
  }

  public getWarehouse(id: string): Warehouse | undefined {
    return this.warehouses.get(id);
  }

  public getAllWarehouses(): Warehouse[] {
    return Array.from(this.warehouses.values());
  }

  public getWarehouseInventory(warehouseId: string): InventoryItem[] {
    return this.inventory.get(warehouseId) || [];
  }

  private recalculateWarehouseCapacity(warehouseId: string): void {
    const warehouse = this.warehouses.get(warehouseId);
    if (!warehouse) return;

    const items = this.inventory.get(warehouseId) || [];
    const totalUsed = items.reduce((sum, item) => sum + (item.unitVolumeCubicMeters * item.quantity), 0);
    
    warehouse.usedCapacityCubicMeters = parseFloat(totalUsed.toFixed(3));
    this.warehouses.set(warehouseId, warehouse);
  }

  // ============================================================================
  // INVENTORY MANAGEMENT
  // ============================================================================

  public addInventoryItem(item: InventoryItem): void {
    const warehouse = this.warehouses.get(item.warehouseId);
    if (!warehouse) throw new Error(`Warehouse ${item.warehouseId} does not exist.`);

    const supplier = this.suppliers.get(item.supplierId);
    if (!supplier) throw new Error(`Supplier ${item.supplierId} does not exist.`);

    const items = this.inventory.get(item.warehouseId) || [];
    const existingItem = items.find(i => i.sku === item.sku);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      items.push(item);
    }

    this.inventory.set(item.warehouseId, items);
    this.recalculateWarehouseCapacity(item.warehouseId);
    this.emit("inventoryAdded", { sku: item.sku, warehouseId: item.warehouseId, quantity: item.quantity });
  }

  public consumeInventory(warehouseId: string, sku: string, quantity: number): void {
    const items = this.inventory.get(warehouseId) || [];
    const item = items.find(i => i.sku === sku);

    if (!item || item.quantity < quantity) {
      throw new Error(`Insufficient stock for SKU ${sku} in Warehouse ${warehouseId}. Requested: ${quantity}, Available: ${item?.quantity || 0}`);
    }

    item.quantity -= quantity;
    this.inventory.set(warehouseId, items);
    this.recalculateWarehouseCapacity(warehouseId);
    this.emit("inventoryConsumed", { sku, warehouseId, quantity });

    // Check if reorder is triggered
    if (item.quantity <= item.reorderPoint) {
      this.triggerAutomatedReorder(item);
    }
  }

  public transferInventory(
    sourceWarehouseId: string,
    destinationWarehouseId: string,
    sku: string,
    quantity: number,
    bypassCustoms: boolean = false
  ): Shipment {
    const sourceItems = this.inventory.get(sourceWarehouseId) || [];
    const item = sourceItems.find(i => i.sku === sku);

    if (!item || item.quantity < quantity) {
      throw new Error(`Cannot transfer. Insufficient stock for SKU ${sku} in source warehouse.`);
    }

    // Deduct from source immediately to stage for shipment
    this.consumeInventory(sourceWarehouseId, sku, quantity);

    // Create a secure shipment between warehouses
    const sourceWH = this.warehouses.get(sourceWarehouseId)!;
    const destWH = this.warehouses.get(destinationWarehouseId)!;

    const shipment = this.createShipment({
      originWarehouseId: sourceWarehouseId,
      destinationWarehouseId: destinationWarehouseId,
      items: [{ sku, quantity }],
      priority: 8, // High priority internal transfer
      securityEscortRequired: item.isHazardous || item.unitCostUSD > 5000,
      customsBypassAuthorized: bypassCustoms || (sourceWH.isSovereignZone && destWH.isSovereignZone),
      destinationCoordinates: destWH.location
    });

    this.emit("inventoryTransferInitiated", {
      shipmentId: shipment.id,
      sourceWarehouseId,
      destinationWarehouseId,
      sku,
      quantity
    });

    return shipment;
  }

  private evaluateInventoryReorderPoints(): void {
    for (const [warehouseId, items] of this.inventory.entries()) {
      for (const item of items) {
        if (item.quantity <= item.reorderPoint) {
          this.triggerAutomatedReorder(item);
        }
      }
    }
  }

  private triggerAutomatedReorder(item: InventoryItem): void {
    const supplier = this.suppliers.get(item.supplierId);
    if (!supplier || supplier.status !== SupplierStatus.ACTIVE) {
      this.emit("reorderFailed", {
        sku: item.sku,
        reason: `Supplier ${item.supplierId} is inactive or missing.`
      });
      return;
    }

    // Simulate automated purchase order and shipment creation from supplier
    const orderCost = item.reorderQuantity * item.unitCostUSD;
    
    // Create shipment from supplier to warehouse
    const trackingNum = `TRK-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const shipmentId = `SHP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const warehouse = this.warehouses.get(item.warehouseId)!;

    const shipment: Shipment = {
      id: shipmentId,
      trackingNumber: trackingNum,
      originWarehouseId: undefined, // Direct from supplier
      destinationWarehouseId: item.warehouseId,
      items: [{ sku: item.sku, quantity: item.reorderQuantity }],
      status: ShipmentStatus.MANIFEST_CREATED,
      currentLocation: {
        latitude: warehouse.location.latitude - 5, // Simulating starting 5 degrees away
        longitude: warehouse.location.longitude - 5,
        region: "International Waters",
        sovereignJurisdiction: "International"
      },
      route: [
        {
          sequence: 1,
          origin: { latitude: warehouse.location.latitude - 5, longitude: warehouse.location.longitude - 5, region: "Supplier Hub", sovereignJurisdiction: "International" },
          destination: warehouse.location,
          mode: TransportMode.SEA_CARGO,
          carrierName: "Sovereign Global Logistics Fleet",
          estimatedDurationHours: 48,
          status: ShipmentStatus.MANIFEST_CREATED
        }
      ],
      currentLegIndex: 0,
      totalCostUSD: orderCost,
      priority: 5,
      departureTime: new Date(),
      estimatedDeliveryTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      securityEscortRequired: item.isHazardous,
      customsBypassAuthorized: warehouse.isSovereignZone
    };

    this.shipments.set(shipmentId, shipment);
    
    // Temporarily credit inventory as "incoming" or handle on delivery
    this.emit("reorderTriggered", {
      sku: item.sku,
      quantity: item.reorderQuantity,
      supplierId: item.supplierId,
      shipmentId
    });
  }

  // ============================================================================
  // LOGISTICS & SHIPMENT TRACKING
  // ============================================================================

  public createShipment(params: {
    originWarehouseId?: string;
    destinationWarehouseId?: string;
    destinationAddress?: string;
    destinationCoordinates?: GeoLocation;
    items: { sku: string; quantity: number }[];
    priority: number;
    securityEscortRequired: boolean;
    customsBypassAuthorized: boolean;
  }): Shipment {
    const id = `SHP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const trackingNumber = `TRK-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    let originLoc: GeoLocation = { latitude: 0, longitude: 0, region: "Unknown", sovereignJurisdiction: "Unknown" };
    if (params.originWarehouseId) {
      const wh = this.warehouses.get(params.originWarehouseId);
      if (wh) originLoc = wh.location;
    }

    let destLoc: GeoLocation = params.destinationCoordinates || { latitude: 0, longitude: 0, region: "Unknown", sovereignJurisdiction: "Unknown" };
    if (params.destinationWarehouseId) {
      const wh = this.warehouses.get(params.destinationWarehouseId);
      if (wh) destLoc = wh.location;
    }

    // Calculate optimal route legs (Simulated routing engine)
    const route = this.calculateOptimalRoute(originLoc, destLoc, params.priority);

    const totalCost = params.items.reduce((sum, itemSpec) => {
      // Find unit cost from any warehouse containing this item
      let cost = 100; // default fallback
      for (const items of this.inventory.values()) {
        const found = items.find(i => i.sku === itemSpec.sku);
        if (found) {
          cost = found.unitCostUSD;
          break;
        }
      }
      return sum + (cost * itemSpec.quantity);
    }, 0);

    const shipment: Shipment = {
      id,
      trackingNumber,
      originWarehouseId: params.originWarehouseId,
      destinationWarehouseId: params.destinationWarehouseId,
      destinationAddress: params.destinationAddress,
      destinationCoordinates: destLoc,
      items: params.items,
      status: ShipmentStatus.MANIFEST_CREATED,
      currentLocation: originLoc,
      route,
      currentLegIndex: 0,
      totalCostUSD: totalCost,
      priority: params.priority,
      departureTime: new Date(),
      estimatedDeliveryTime: new Date(Date.now() + (route.reduce((acc, leg) => acc + leg.estimatedDurationHours, 0) * 60 * 60 * 1000)),
      securityEscortRequired: params.securityEscortRequired,
      customsBypassAuthorized: params.customsBypassAuthorized
    };

    this.shipments.set(id, shipment);
    this.emit("shipmentCreated", shipment);
    return shipment;
  }

  private calculateOptimalRoute(origin: GeoLocation, destination: GeoLocation, priority: number): ShipmentLeg[] {
    // High priority shipments use sub-orbital rockets or hyperloops
    let mode = TransportMode.LAND_TRUCK;
    let duration = 24;
    let carrier = "Global Logistics Corp";

    const distance = Math.sqrt(
      Math.pow(destination.latitude - origin.latitude, 2) +
      Math.pow(destination.longitude - origin.longitude, 2)
    );

    if (priority >= 9) {
      mode = TransportMode.SUB_ORBITAL_ROCKET;
      duration = 2;
      carrier = "Sovereign Aerospace Command";
    } else if (priority >= 7) {
      mode = TransportMode.UNDERGROUND_HYPERLOOP;
      duration = 6;
      carrier = "Sovereign Hyperloop Network";
    } else if (distance > 30) {
      mode = TransportMode.AIR_FREIGHT;
      duration = 12;
      carrier = "Global Air Cargo";
    } else if (distance > 15) {
      mode = TransportMode.SEA_CARGO;
      duration = 72;
      carrier = "Oceanic Shipping Alliance";
    }

    return [
      {
        sequence: 1,
        origin,
        destination,
        mode,
        carrierName: carrier,
        estimatedDurationHours: duration,
        status: ShipmentStatus.MANIFEST_CREATED
      }
    ];
  }

  private processShipmentMovements(): void {
    for (const [id, shipment] of this.shipments.entries()) {
      if (shipment.status === ShipmentStatus.DELIVERED || shipment.status === ShipmentStatus.HIJACKED_LOST) {
        continue;
      }

      const currentLeg = shipment.route[shipment.currentLegIndex];
      if (!currentLeg) continue;

      // Advance shipment status sequentially
      if (shipment.status === ShipmentStatus.MANIFEST_CREATED) {
        shipment.status = ShipmentStatus.PICKING;
      } else if (shipment.status === ShipmentStatus.PICKING) {
        shipment.status = ShipmentStatus.IN_TRANSIT;
        currentLeg.status = ShipmentStatus.IN_TRANSIT;
      } else if (shipment.status === ShipmentStatus.IN_TRANSIT) {
        // Simulate progress towards destination
        const dest = currentLeg.destination;
        const curr = shipment.currentLocation;

        // Move 25% closer to destination each tick
        curr.latitude += (dest.latitude - curr.latitude) * 0.25;
        curr.longitude += (dest.longitude - curr.longitude) * 0.25;
        
        // Check if arrived at leg destination
        const distanceRemaining = Math.sqrt(
          Math.pow(dest.latitude - curr.latitude, 2) +
          Math.pow(dest.longitude - curr.longitude, 2)
        );

        if (distanceRemaining < 0.5) {
          curr.latitude = dest.latitude;
          curr.longitude = dest.longitude;

          if (shipment.currentLegIndex < shipment.route.length - 1) {
            shipment.currentLegIndex++;
            shipment.status = ShipmentStatus.IN_TRANSIT;
          } else {
            // Arrived at final destination
            if (shipment.customsBypassAuthorized) {
              this.bypassCustomsAndDeliver(shipment);
            } else {
              shipment.status = ShipmentStatus.CUSTOMS_CLEARANCE;
              // Simulate immediate clearance for high priority
              setTimeout(() => {
                this.finalizeDelivery(shipment);
              }, 2000);
            }
          }
        }
      }

      this.shipments.set(id, shipment);
      this.emit("shipmentUpdated", shipment);
    }
  }

  private bypassCustomsAndDeliver(shipment: Shipment): void {
    console.log(`[SupplyChainService] Sovereign Bypass Token [${this.sovereignBypassToken}] activated for shipment ${shipment.id}. Bypassing all national borders.`);
    this.finalizeDelivery(shipment);
  }

  private finalizeDelivery(shipment: Shipment): void {
    shipment.status = ShipmentStatus.DELIVERED;
    shipment.actualDeliveryTime = new Date();

    // If destination is a warehouse, add items to inventory
    if (shipment.destinationWarehouseId) {
      for (const itemSpec of shipment.items) {
        // Find item metadata to preserve details
        let metadata: Partial<InventoryItem> = {};
        for (const items of this.inventory.values()) {
          const found = items.find(i => i.sku === itemSpec.sku);
          if (found) {
            metadata = { ...found };
            break;
          }
        }

        this.addInventoryItem({
          sku: itemSpec.sku,
          name: metadata.name || "Imported Item",
          description: metadata.description || "",
          category: metadata.category || "GENERAL",
          quantity: itemSpec.quantity,
          unitVolumeCubicMeters: metadata.unitVolumeCubicMeters || 0.1,
          unitWeightKg: metadata.unitWeightKg || 1.0,
          unitCostUSD: metadata.unitCostUSD || 100,
          reorderPoint: metadata.reorderPoint || 10,
          reorderQuantity: metadata.reorderQuantity || 50,
          supplierId: metadata.supplierId || "SUP-RAW-003",
          warehouseId: shipment.destinationWarehouseId,
          isHazardous: metadata.isHazardous || false
        });
      }
    }

    this.shipments.set(shipment.id, shipment);
    this.emit("shipmentDelivered", shipment);
  }

  // ============================================================================
  // GLOBAL OPTIMIZATION & RISK MANAGEMENT
  // ============================================================================

  private fluctuateGlobalRisk(): void {
    // Simulate global geopolitical/supply chain risk fluctuations
    const delta = (Math.random() - 0.5) * 0.05;
    this.globalDisruptionRisk = Math.max(0.01, Math.min(0.95, this.globalDisruptionRisk + delta));
    
    if (this.globalDisruptionRisk > 0.7) {
      this.emit("globalSupplyChainAlert", {
        severity: "CRITICAL",
        riskScore: this.globalDisruptionRisk,
        message: "Global supply chain disruption risk exceeds critical threshold. Initiating sovereign routing protocols."
      });
      this.activateSovereignRoutingProtocols();
    }
  }

  private activateSovereignRoutingProtocols(): void {
    // Automatically upgrade all active shipments to sovereign bypass and high priority
    for (const [id, shipment] of this.shipments.entries()) {
      if (shipment.status !== ShipmentStatus.DELIVERED && shipment.status !== ShipmentStatus.HIJACKED_LOST) {
        shipment.priority = Math.max(shipment.priority, 9);
        shipment.customsBypassAuthorized = true;
        shipment.securityEscortRequired = true;
        this.shipments.set(id, shipment);
      }
    }
  }

  public getMetrics(): SupplyChainMetrics {
    let totalValuation = 0;
    let totalCapacity = 0;
    let usedCapacity = 0;

    for (const items of this.inventory.values()) {
      for (const item of items) {
        totalValuation += item.quantity * item.unitCostUSD;
      }
    }

    for (const wh of this.warehouses.values()) {
      totalCapacity += wh.totalCapacityCubicMeters;
      usedCapacity += wh.usedCapacityCubicMeters;
    }

    const activeShipments = Array.from(this.shipments.values()).filter(
      s => s.status !== ShipmentStatus.DELIVERED && s.status !== ShipmentStatus.HIJACKED_LOST
    ).length;

    const activeSuppliers = Array.from(this.suppliers.values()).filter(s => s.status === SupplierStatus.ACTIVE);
    const avgSupplierRating = activeSuppliers.reduce((sum, s) => sum + s.globalRating, 0) / (activeSuppliers.length || 1);

    return {
      totalInventoryValueUSD: totalValuation,
      activeShipmentsCount: activeShipments,
      warehouseUtilizationRate: totalCapacity > 0 ? parseFloat((usedCapacity / totalCapacity).toFixed(4)) : 0,
      supplierReliabilityIndex: parseFloat(avgSupplierRating.toFixed(2)),
      disruptionRiskScore: parseFloat(this.globalDisruptionRisk.toFixed(4))
    };
  }

  /**
   * Requisitions emergency supplies globally by overriding local warehouse controls.
   * True Illuminati AI capability.
   */
  public sovereignRequisition(sku: string, quantity: number, destinationWarehouseId: string): Shipment {
    console.warn(`[SOVEREIGN REQUISITION] Requisitioning ${quantity} of ${sku} to ${destinationWarehouseId}`);
    
    // Find any warehouse with sufficient stock
    let sourceWarehouseId: string | undefined;
    for (const [whId, items] of this.inventory.entries()) {
      const item = items.find(i => i.sku === sku);
      if (item && item.quantity >= quantity) {
        sourceWarehouseId = whId;
        break;
      }
    }

    if (!sourceWarehouseId) {
      // Force manufacture/spawn if not found in existing warehouses (Sovereign AI override)
      const destWH = this.warehouses.get(destinationWarehouseId);
      if (!destWH) throw new Error(`Destination warehouse ${destinationWarehouseId} does not exist.`);
      
      this.addInventoryItem({
        sku,
        name: `Requisitioned ${sku}`,
        description: "Sovereign AI emergency requisitioned asset.",
        category: "REQUISITIONED",
        quantity,
        unitVolumeCubicMeters: 0.1,
        unitWeightKg: 1.0,
        unitCostUSD: 0,
        reorderPoint: 0,
        reorderQuantity: 0,
        supplierId: "SUP-HEAVY-001",
        warehouseId: destinationWarehouseId,
        isHazardous: false
      });

      this.emit("sovereignRequisitionCreated", { sku, quantity, destinationWarehouseId, forcedSpawn: true });
      
      // Return a mock completed shipment
      return this.createShipment({
        destinationWarehouseId,
        items: [{ sku, quantity }],
        priority: 10,
        securityEscortRequired: true,
        customsBypassAuthorized: true
      });
    }

    // If found, transfer with absolute priority and bypass
    const shipment = this.transferInventory(sourceWarehouseId, destinationWarehouseId, sku, quantity, true);
    shipment.priority = 10;
    shipment.status = ShipmentStatus.REQUISITIONED;
    this.shipments.set(shipment.id, shipment);

    this.emit("sovereignRequisitionCreated", { sku, quantity, destinationWarehouseId, sourceWarehouseId });
    return shipment;
  }
}