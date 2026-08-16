import { Router, Request, Response } from 'express';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'raw_material' | 'component' | 'finished_good' | 'vehicle' | 'real_estate_material' | 'infrastructure';
  quantity: number;
  unit: string;
  warehouseId: string;
  minThreshold: number;
  maxThreshold: number;
  supplierId: string;
  costPerUnit: number;
  lastUpdated: Date;
}

export interface ShipmentLeg {
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'pending' | 'in_transit' | 'cleared' | 'delayed' | 'completed';
  timestamp?: Date;
  notes?: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'manifest' | 'pickup' | 'in_transit' | 'customs' | 'out_for_delivery' | 'delivered' | 'exception';
  carrier: 'Global_Logistics_AI' | 'Quantum_Express' | 'Orbital_Freight' | 'Standard_Ground';
  items: { itemId: string; quantity: number }[];
  route: ShipmentLeg[];
  currentLegIndex: number;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  temperatureControlled: boolean;
  securityLevel: 'standard' | 'high' | 'classified' | 'omega';
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  rating: number; // 1-100
  reliabilityScore: number; // 0.0 - 1.0
  categories: string[];
  globalRegion: 'North_America' | 'Europe' | 'Asia_Pacific' | 'Africa' | 'South_America' | 'Orbital_Station';
  isActive: boolean;
}

export interface ProcurementOrder {
  id: string;
  supplierId: string;
  items: { itemId: string; quantity: number; unitCost: number }[];
  totalCost: number;
  status: 'draft' | 'approved' | 'sent' | 'fulfilled' | 'cancelled';
  createdAt: Date;
  approvedAt?: Date;
}

// ============================================================================
// IN-MEMORY DATA STORE (Offline-First Global State)
// ============================================================================

const inventory: Map<string, InventoryItem> = new Map([
  [
    'inv-001',
    {
      id: 'inv-001',
      name: 'Carbon Fiber Chassis Frame (Type-H)',
      sku: 'CF-CHASSIS-H900',
      category: 'component',
      quantity: 142,
      unit: 'units',
      warehouseId: 'wh-us-east-01',
      minThreshold: 20,
      maxThreshold: 500,
      supplierId: 'sup-001',
      costPerUnit: 12500,
      lastUpdated: new Date()
    }
  ],
  [
    'inv-002',
    {
      id: 'inv-002',
      name: 'Graphene Solar Roof Tiles',
      sku: 'GR-SOLAR-TILE-V2',
      category: 'real_estate_material',
      quantity: 12500,
      unit: 'sq_meters',
      warehouseId: 'wh-eu-west-02',
      minThreshold: 2000,
      maxThreshold: 50000,
      supplierId: 'sup-002',
      costPerUnit: 85,
      lastUpdated: new Date()
    }
  ],
  [
    'inv-003',
    {
      id: 'inv-003',
      name: 'Solid-State Battery Pack 150kWh',
      sku: 'SSB-150KWH-EV',
      category: 'component',
      quantity: 8,
      unit: 'units',
      warehouseId: 'wh-us-east-01',
      minThreshold: 15,
      maxThreshold: 100,
      supplierId: 'sup-003',
      costPerUnit: 4200,
      lastUpdated: new Date()
    }
  ]
]);

const shipments: Map<string, Shipment> = new Map([
  [
    'shp-001',
    {
      id: 'shp-001',
      trackingNumber: 'TRK-GLOBAL-99821-X',
      origin: 'Giga-Factory Shanghai',
      destination: 'Distribution Hub Berlin',
      status: 'in_transit',
      carrier: 'Quantum_Express',
      items: [{ itemId: 'inv-003', quantity: 50 }],
      route: [
        { location: 'Shanghai Port', coordinates: { lat: 31.2304, lng: 121.4737 }, status: 'completed', timestamp: new Date(Date.now() - 86400000) },
        { location: 'Malacca Strait Checkpoint', coordinates: { lat: 1.3521, lng: 103.8198 }, status: 'completed', timestamp: new Date(Date.now() - 43200000) },
        { location: 'Suez Canal Transit', coordinates: { lat: 29.9753, lng: 32.5276 }, status: 'in_transit', notes: 'Approaching northern exit' },
        { location: 'Rotterdam Port', coordinates: { lat: 51.9244, lng: 4.4777 }, status: 'pending' },
        { location: 'Berlin Hub', coordinates: { lat: 52.5200, lng: 13.4050 }, status: 'pending' }
      ],
      currentLegIndex: 2,
      estimatedDelivery: new Date(Date.now() + 172800000),
      temperatureControlled: true,
      securityLevel: 'high'
    }
  ]
]);

const suppliers: Map<string, Supplier> = new Map([
  [
    'sup-001',
    {
      id: 'sup-001',
      name: 'Apex Composite Materials Corp',
      contactEmail: 'procurement@apexcomposites.global',
      rating: 98,
      reliabilityScore: 0.99,
      categories: ['raw_material', 'component'],
      globalRegion: 'Asia_Pacific',
      isActive: true
    }
  ],
  [
    'sup-002',
    {
      id: 'sup-002',
      name: 'Helios Energy Infrastructure',
      contactEmail: 'b2b@heliosenergy.io',
      rating: 95,
      reliabilityScore: 0.97,
      categories: ['real_estate_material', 'infrastructure'],
      globalRegion: 'Europe',
      isActive: true
    }
  ],
  [
    'sup-003',
    {
      id: 'sup-003',
      name: 'Aether Battery Technologies',
      contactEmail: 'supply@aetherbattery.tech',
      rating: 91,
      reliabilityScore: 0.94,
      categories: ['component'],
      globalRegion: 'North_America',
      isActive: true
    }
  ]
]);

const procurementOrders: Map<string, ProcurementOrder> = new Map();

// ============================================================================
// EXPRESS ROUTER SETUP
// ============================================================================

const router = Router();

/**
 * @route   GET /api/supply-chain/dashboard
 * @desc    Get high-level supply chain metrics and health status
 * @access  Private (Illuminati AI / Admin)
 */
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const totalItems = Array.from(inventory.values()).reduce((acc, item) => acc + item.quantity, 0);
    const lowStockItems = Array.from(inventory.values()).filter(item => item.quantity <= item.minThreshold);
    const activeShipments = Array.from(shipments.values()).filter(s => s.status !== 'delivered' && s.status !== 'exception');
    const totalValue = Array.from(inventory.values()).reduce((acc, item) => acc + (item.quantity * item.costPerUnit), 0);

    return res.status(200).json({
      success: true,
      timestamp: new Date(),
      metrics: {
        totalInventoryItems: inventory.size,
        totalPhysicalUnits: totalItems,
        totalAssetValueUSD: totalValue,
        lowStockAlertCount: lowStockItems.length,
        activeShipmentsCount: activeShipments.length,
        activeSuppliersCount: Array.from(suppliers.values()).filter(s => s.isActive).length
      },
      criticalAlerts: lowStockItems.map(item => ({
        itemId: item.id,
        name: item.name,
        sku: item.sku,
        currentStock: item.quantity,
        minThreshold: item.minThreshold,
        warehouseId: item.warehouseId
      }))
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// INVENTORY ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/supply-chain/inventory
 * @desc    Retrieve all inventory items with optional filtering
 */
router.get('/inventory', (req: Request, res: Response) => {
  try {
    const category = (Array.isArray(req.query.category) ? req.query.category[0] : req.query.category) || '';
    const warehouseId = (Array.isArray(req.query.warehouseId) ? req.query.warehouseId[0] : req.query.warehouseId) || '';
    const lowStock = (Array.isArray(req.query.lowStock) ? req.query.lowStock[0] : req.query.lowStock) || '';
    let items = Array.from(inventory.values());

    if (category) {
      items = items.filter(item => item.category === category);
    }
    if (warehouseId) {
      items = items.filter(item => item.warehouseId === warehouseId);
    }
    if (lowStock === 'true') {
      items = items.filter(item => item.quantity <= item.minThreshold);
    }

    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/supply-chain/inventory/:id
 * @desc    Get details of a specific inventory item
 */
router.get('/inventory/:id', (req: Request, res: Response) => {
  try {
    const item = inventory.get(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/supply-chain/inventory
 * @desc    Add a new item to the global inventory system
 */
router.post('/inventory', (req: Request, res: Response) => {
  try {
    const { name, sku, category, quantity, unit, warehouseId, minThreshold, maxThreshold, supplierId, costPerUnit } = req.body;

    if (!name || !sku || !category || quantity === undefined || !unit || !warehouseId || !supplierId || costPerUnit === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required inventory fields' });
    }

    const existingItem = Array.from(inventory.values()).find(item => item.sku === sku);
    if (existingItem) {
      return res.status(409).json({ success: false, message: `SKU ${sku} already exists in system` });
    }

    const newItem: InventoryItem = {
      id: `inv-${Math.random().toString(36).substr(2, 9)}`,
      name,
      sku,
      category,
      quantity,
      unit,
      warehouseId,
      minThreshold: minThreshold || 10,
      maxThreshold: maxThreshold || 1000,
      supplierId,
      costPerUnit,
      lastUpdated: new Date()
    };

    inventory.set(newItem.id, newItem);
    return res.status(201).json({ success: true, data: newItem });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/supply-chain/inventory/:id/stock
 * @desc    Manually adjust stock levels (e.g., audits, shrinkage, manual overrides)
 */
router.patch('/inventory/:id/stock', (req: Request, res: Response) => {
  try {
    const { adjustment, type } = req.body; // type: 'add' | 'subtract' | 'set'
    const item = inventory.get(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    if (adjustment === undefined || !type) {
      return res.status(400).json({ success: false, message: 'Adjustment value and type are required' });
    }

    let newQty = item.quantity;
    if (type === 'add') newQty += adjustment;
    else if (type === 'subtract') newQty -= adjustment;
    else if (type === 'set') newQty = adjustment;

    if (newQty < 0) {
      return res.status(400).json({ success: false, message: 'Stock level cannot fall below zero' });
    }

    item.quantity = newQty;
    item.lastUpdated = new Date();
    inventory.set(item.id, item);

    return res.status(200).json({
      success: true,
      message: `Stock updated successfully for ${item.sku}`,
      data: item,
      triggerReorder: item.quantity <= item.minThreshold
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SHIPMENT & LOGISTICS ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/supply-chain/shipments
 * @desc    Track all global shipments
 */
router.get('/shipments', (req: Request, res: Response) => {
  try {
    const status = (Array.isArray(req.query.status) ? req.query.status[0] : req.query.status) || '';
    const carrier = (Array.isArray(req.query.carrier) ? req.query.carrier[0] : req.query.carrier) || '';
    let list = Array.from(shipments.values());

    if (status) {
      list = list.filter(s => s.status === status);
    }
    if (carrier) {
      list = list.filter(s => s.carrier === carrier);
    }

    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/supply-chain/shipments
 * @desc    Dispatch a new global shipment
 */
router.post('/shipments', (req: Request, res: Response) => {
  try {
    const { origin, destination, carrier, items, route, temperatureControlled, securityLevel } = req.body;

    if (!origin || !destination || !carrier || !items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Missing critical shipment parameters' });
    }

    // Validate items exist in inventory
    for (const shipmentItem of items) {
      if (!inventory.has(shipmentItem.itemId)) {
        return res.status(400).json({ success: false, message: `Item ID ${shipmentItem.itemId} does not exist in inventory` });
      }
    }

    const newShipment: Shipment = {
      id: `shp-${Math.random().toString(36).substr(2, 9)}`,
      trackingNumber: `TRK-GLOBAL-${Math.floor(100000 + Math.random() * 900000)}-X`,
      origin,
      destination,
      status: 'manifest',
      carrier,
      items,
      route: route || [],
      currentLegIndex: 0,
      estimatedDelivery: new Date(Date.now() + 432000000), // Default 5 days
      temperatureControlled: !!temperatureControlled,
      securityLevel: securityLevel || 'standard'
    };

    shipments.set(newShipment.id, newShipment);
    return res.status(201).json({ success: true, data: newShipment });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/supply-chain/shipments/:id/step
 * @desc    Advance shipment to the next route leg or update status
 */
router.patch('/shipments/:id/step', (req: Request, res: Response) => {
  try {
    const { status, notes, currentCoordinates } = req.body;
    const shipment = shipments.get(req.params.id);

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (status) {
      shipment.status = status;
    }

    // Advance route leg if applicable
    if (shipment.route && shipment.route.length > 0) {
      const currentLeg = shipment.route[shipment.currentLegIndex];
      if (currentLeg) {
        currentLeg.status = 'completed';
        currentLeg.timestamp = new Date();
        if (notes) currentLeg.notes = notes;
      }

      if (shipment.currentLegIndex < shipment.route.length - 1) {
        shipment.currentLegIndex += 1;
        shipment.route[shipment.currentLegIndex].status = 'in_transit';
      } else {
        shipment.status = 'delivered';
        shipment.actualDelivery = new Date();

        // Automatically credit inventory upon delivery
        for (const shipItem of shipment.items) {
          const invItem = inventory.get(shipItem.itemId);
          if (invItem) {
            invItem.quantity += shipItem.quantity;
            invItem.lastUpdated = new Date();
            inventory.set(invItem.id, invItem);
          }
        }
      }
    }

    shipments.set(shipment.id, shipment);
    return res.status(200).json({
      success: true,
      message: `Shipment updated. Status: ${shipment.status}`,
      data: shipment
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PROCUREMENT & SUPPLIER ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/supply-chain/suppliers
 * @desc    Get list of global suppliers
 */
router.get('/suppliers', (req: Request, res: Response) => {
  try {
    return res.status(200).json({ success: true, data: Array.from(suppliers.values()) });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/supply-chain/suppliers
 * @desc    Register a new global supplier
 */
router.post('/suppliers', (req: Request, res: Response) => {
  try {
    const { name, contactEmail, categories, globalRegion } = req.body;

    if (!name || !contactEmail || !categories || !globalRegion) {
      return res.status(400).json({ success: false, message: 'Missing supplier registration details' });
    }

    const newSupplier: Supplier = {
      id: `sup-${Math.random().toString(36).substr(2, 9)}`,
      name,
      contactEmail,
      rating: 100, // Starts perfect
      reliabilityScore: 1.0,
      categories,
      globalRegion,
      isActive: true
    };

    suppliers.set(newSupplier.id, newSupplier);
    return res.status(201).json({ success: true, data: newSupplier });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/supply-chain/procure/auto
 * @desc    Trigger AI-driven automated procurement for low stock items
 */
router.post('/procure/auto', (req: Request, res: Response) => {
  try {
    const lowStockItems = Array.from(inventory.values()).filter(item => item.quantity <= item.minThreshold);
    const ordersCreated: ProcurementOrder[] = [];

    // Group low stock items by supplier
    const supplierGroups: { [supplierId: string]: { itemId: string; quantity: number; unitCost: number }[] } = {};

    for (const item of lowStockItems) {
      const orderQty = item.maxThreshold - item.quantity;
      if (orderQty <= 0) continue;

      if (!supplierGroups[item.supplierId]) {
        supplierGroups[item.supplierId] = [];
      }
      supplierGroups[item.supplierId].push({
        itemId: item.id,
        quantity: orderQty,
        unitCost: item.costPerUnit
      });
    }

    // Create procurement orders
    for (const [supplierId, items] of Object.entries(supplierGroups)) {
      const totalCost = items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
      const order: ProcurementOrder = {
        id: `po-${Math.random().toString(36).substr(2, 9)}`,
        supplierId,
        items,
        totalCost,
        status: 'approved', // Illuminati AI auto-approves
        createdAt: new Date(),
        approvedAt: new Date()
      };

      procurementOrders.set(order.id, order);
      ordersCreated.push(order);

      // Automatically spin up a shipment for this approved order
      const supplier = suppliers.get(supplierId);
      const shipmentItems = items.map(i => ({ itemId: i.itemId, quantity: i.quantity }));
      const newShipment: Shipment = {
        id: `shp-${Math.random().toString(36).substr(2, 9)}`,
        trackingNumber: `TRK-AUTO-${Math.floor(100000 + Math.random() * 900000)}-AI`,
        origin: supplier ? `${supplier.name} Hub (${supplier.globalRegion})` : 'Supplier Hub',
        destination: 'Central AI Warehouse Alpha',
        status: 'manifest',
        carrier: 'Quantum_Express',
        items: shipmentItems,
        route: [
          { location: 'Supplier Dispatch', coordinates: { lat: 0, lng: 0 }, status: 'in_transit', timestamp: new Date() },
          { location: 'Central AI Warehouse Alpha', coordinates: { lat: 37.7749, lng: -122.4194 }, status: 'pending' }
        ],
        currentLegIndex: 0,
        estimatedDelivery: new Date(Date.now() + 172800000), // 48 hours express
        temperatureControlled: false,
        securityLevel: 'high'
      };
      shipments.set(newShipment.id, newShipment);
    }

    return res.status(201).json({
      success: true,
      message: `Automated procurement cycle completed. Generated ${ordersCreated.length} orders.`,
      orders: ordersCreated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;