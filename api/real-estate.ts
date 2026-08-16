import { Router, Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';

// Services
import RealEstateService from '../services/RealEstateService';
import TaxLienService from '../services/TaxLienService';
import ModernTreasuryService from '../services/ModernTreasuryService';
import AlpacaTokenizationService from '../services/AlpacaTokenizationService';
import AssetAcquisitionService from '../services/assetAcquisitionService';

// Utilities
import GeoSpatialProcessor from './utils/geo-spatial';

// Middleware
import { authMiddleware } from './middleware/auths';
import { rateLimiter } from './middleware/rateLimiter';

const router = Router();
const realEstateService = new RealEstateService();
const taxLienService = new TaxLienService();
const modernTreasuryService = new ModernTreasuryService();
const assetAcquisitionService = new AssetAcquisitionService();
const alpacaTokenizationService = new AlpacaTokenizationService();
const geoSpatialProcessor = new GeoSpatialProcessor();

// Configuration
const ATTOM_API_KEY = process.env.ATTOM_API_KEY || '';
const ATTOM_API_URL = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';
const ESCROW_API_KEY = process.env.ESCROW_API_KEY || '';
const ESCROW_API_URL = process.env.ESCROW_API_URL || 'https://api.escrow.com/v1';
const SIMPLIFILE_API_KEY = process.env.SIMPLIFILE_API_KEY || '';
const SIMPLIFILE_API_URL = process.env.SIMPLIFILE_API_URL || 'https://api.simplifile.com/v1';

// Validation Schemas
const PropertySearchSchema = z.object({
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().optional(),
});

const TaxLienSearchSchema = z.object({
  state: z.string().length(2),
  county: z.string().min(1),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
});

const TaxLienBidSchema = z.object({
  lienId: z.string().min(1),
  bidAmount: z.number().positive(),
  bidderId: z.string().min(1),
  paymentMethodId: z.string().min(1),
});

const EscrowCreateSchema = z.object({
  propertyId: z.string().min(1),
  buyerEmail: z.string().email(),
  sellerEmail: z.string().email(),
  purchasePrice: z.number().positive(),
  earnestMoney: z.number().positive(),
  legalDescription: z.string().min(1),
});

const EscrowReleaseSchema = z.object({
  escrowId: z.string().min(1),
  verificationDocUrl: z.string().url().optional(),
});

const CountyRecordSchema = z.object({
  transactionId: z.string().min(1),
  county: z.string().min(1),
  state: z.string().length(2),
  documentType: z.enum(['DEED', 'LIEN', 'LIEN_RELEASE', 'MORTGAGE']),
  grantor: z.string().min(1),
  grantee: z.string().min(1),
  legalDescription: z.string().min(1),
  documentUrl: z.string().url(),
});

const TokenizeSchema = z.object({
  propertyId: z.string().min(1),
  tokenName: z.string().min(1),
  tokenSymbol: z.string().min(1),
  totalSupply: z.number().positive(),
  pricePerToken: z.number().positive(),
  assetValue: z.number().positive(),
});

const GisAnalyzeSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  radius: z.coerce.number().optional().default(1000),
});

const UnderwriteSchema = z.object({
  propertyId: z.string().min(1),
  purchasePrice: z.number().positive(),
  estimatedRenovation: z.number().nonnegative().optional().default(0),
  projectedRent: z.number().positive(),
  targetIrr: z.number().positive().optional().default(0.12),
});

// API Clients
axios.create({ baseURL: ATTOM_API_URL, headers: { 'apikey': ATTOM_API_KEY, 'Accept': 'application/json' } });
axios.create({ baseURL: ESCROW_API_URL, headers: { 'Authorization': `Bearer ${ESCROW_API_KEY}`, 'Content-Type': 'application/json' } });
axios.create({ baseURL: SIMPLIFILE_API_URL, headers: { 'Authorization': `Bearer ${SIMPLIFILE_API_KEY}`, 'Content-Type': 'application/json' } });

// Routes
router.use(rateLimiter);

router.get('/search', async (req: Request, res: Response) => {
  try {
    const validation = PropertySearchSchema.safeParse(req.query);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });
    const result = await realEstateService.searchProperties(validation.data);
    res.json({ success: true, properties: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/details/:propertyId', async (req: Request, res: Response) => {
  try {
    const details = await realEstateService.getPropertyDetails(req.params.propertyId);
    res.json({ success: true, details });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tax-liens', async (req: Request, res: Response) => {
  try {
    const validation = TaxLienSearchSchema.safeParse(req.query);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });
    const liens = await taxLienService.searchLiens(validation.data);
    res.json({ success: true, liens });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tax-liens/bid', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = TaxLienBidSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });
    const bid = await taxLienService.placeBid(validation.data);
    res.status(201).json({ success: true, bid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/escrow/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = EscrowCreateSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });
    const escrow = await modernTreasuryService.createEscrowAccount(validation.data);
    res.status(201).json({ success: true, escrow });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/escrow/release', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = EscrowReleaseSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });
    const result = await modernTreasuryService.releaseEscrowFunds(validation.data.escrowId, validation.data.verificationDocUrl);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/county/record', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = CountyRecordSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });
    const result = await realEstateService.recordDocument(validation.data);
    res.status(201).json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/purchase', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await assetAcquisitionService.orchestratePurchase(req.body);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tokenize', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = TokenizeSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });
    const token = await alpacaTokenizationService.tokenizeAsset(validation.data);
    res.status(201).json({ success: true, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gis/analyze', async (req: Request, res: Response) => {
  try {
    const validation = GisAnalyzeSchema.safeParse(req.query);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });
    const analysis = await geoSpatialProcessor.analyzeCoordinates(validation.data.latitude, validation.data.longitude, validation.data.radius);
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/underwrite', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = UnderwriteSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });
    const result = await assetAcquisitionService.underwriteProperty(validation.data);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;