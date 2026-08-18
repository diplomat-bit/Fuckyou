import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './utils/logger';
import * as crypto from 'crypto';

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

const BankAccountSchema = z.object({
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be exactly 9 digits'),
  accountNumber: z.string().min(4, 'Account number must be at least 4 digits'),
  bankName: z.string().min(1, 'Bank name is required'),
});

const ContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid contact email'),
  phone: z.string().min(10, 'Invalid contact phone number'),
});

export const OnboardSupplierSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  taxId: z.string().regex(/^\d{2}-\d{7}$/, 'Tax ID must be in XX-XXXXXXX format'),
  dunsNumber: z.string().regex(/^\d{9}$/, 'DUNS number must be exactly 9 digits').optional(),
  address: AddressSchema,
  bankAccount: BankAccountSchema,
  contact: ContactSchema,
  industryCode: z.string().min(4, 'Industry code (MCC) is required'),
});

export const UpdateSupplierSchema = OnboardSupplierSchema.partial();

export const SupplierMatchSchema = z.object({
  invoiceDetails: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3),
    description: z.string(),
    buyerName: z.string(),
  }),
});

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Supplier {
  id: string;
  businessName: string;
  taxId: string;
  dunsNumber?: string;
  address: z.infer<typeof AddressSchema>;
  bankAccount: z.infer<typeof BankAccountSchema>;
  contact: z.infer<typeof ContactSchema>;
  industryCode: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  riskScore: number;
  riskAssessment: string;
  visaSupplierNetworkId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// IN-MEMORY DATABASE (PRODUCTION SIMULATION)
// ==========================================

class SupplierDatabase {
  private suppliers: Map<string, Supplier> = new Map();

  constructor() {
    // Seed with a high-fidelity mock supplier for immediate commercial use
    const seedId = 'sup_visa_9928172';
    this.suppliers.set(seedId, {
      id: seedId,
      businessName: 'Global Logistics Corp',
      taxId: '12-3456789',
      dunsNumber: '123456789',
      address: {
        street: '100 Transit Way',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94103',
        country: 'US',
      },
      bankAccount: {
        routingNumber: '121000248',
        accountNumber: '9876543210',
        bankName: 'Wells Fargo Bank',
      },
      contact: {
        name: 'Sarah Jenkins',
        email: 'sjenkins@globallogistics.com',
        phone: '4155550192',
      },
      industryCode: '4710', // Freight Transportation MCC
      status: 'VERIFIED',
      riskScore: 12,
      riskAssessment: 'Low risk profile. Established entity with verified DUNS and clean transaction history.',
      visaSupplierNetworkId: 'VSN-GLO-8821',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    });
  }

  public async create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const id = `sup_visa_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date();
    const newSupplier: Supplier = {
      ...supplier,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.suppliers.set(id, newSupplier);
    return { ...newSupplier };
  }

  public async findById(id: string): Promise<Supplier | null> {
    const supplier = this.suppliers.get(id);
    return supplier ? { ...supplier } : null;
  }

  public async update(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return null;

    const updatedSupplier: Supplier = {
      ...supplier,
      ...updates,
      updatedAt: new Date(),
    };
    this.suppliers.set(id, updatedSupplier);
    return { ...updatedSupplier };
  }

  public async list(limit: number = 50, offset: number = 0): Promise<Supplier[]> {
    return Array.from(this.suppliers.values())
      .slice(offset, offset + limit)
      .map(s => ({ ...s }));
  }

  public async search(query: string): Promise<Supplier[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.suppliers.values()).filter(
      s =>
        s.businessName.toLowerCase().includes(lowerQuery) ||
        s.id.toLowerCase().includes(lowerQuery) ||
        s.contact.email.toLowerCase().includes(lowerQuery)
    );
  }
}

const db = new SupplierDatabase();

// ==========================================
// VISA SUPPLIER SERVICE WITH GEMINI INTEGRATION
// ==========================================

class VisaSupplierService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      logger.warn('GEMINI_API_KEY is missing. VisaSupplierService will run with fallback heuristics.');
    }
  }

  /**
   * Uses Gemini to perform an AI-driven KYB risk assessment on the supplier.
   */
  public async assessSupplierRisk(supplierData: z.infer<typeof OnboardSupplierSchema>): Promise<{
    riskScore: number;
    riskAssessment: string;
    status: 'VERIFIED' | 'REJECTED' | 'PENDING';
  }> {
    if (!this.genAI) {
      return this.getFallbackRiskAssessment(supplierData);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Analyze the following business details for KYB (Know Your Business) compliance and risk assessment.
        
        Business Name: ${supplierData.businessName}
        Tax ID: ${supplierData.taxId}
        DUNS Number: ${supplierData.dunsNumber || 'N/A'}
        Industry Code (MCC): ${supplierData.industryCode}
        Address: ${JSON.stringify(supplierData.address)}
        Contact: ${JSON.stringify(supplierData.contact)}
        
        Provide a risk score between 0 (low risk) and 100 (high risk), a status recommendation (VERIFIED, REJECTED, or PENDING), and a detailed assessment explanation.
        
        Return ONLY a valid JSON object with the following keys:
        - "riskScore": number
        - "status": "VERIFIED" | "REJECTED" | "PENDING"
        - "explanation": string
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Clean up potential markdown code block formatting from Gemini response
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanJson);

      return {
        riskScore: parsed.riskScore ?? 50,
        riskAssessment: parsed.explanation ?? 'AI assessment completed successfully.',
        status: parsed.status ?? 'PENDING',
      };
    } catch (error) {
      logger.error('Gemini risk assessment failed, falling back to heuristics:', error);
      return this.getFallbackRiskAssessment(supplierData);
    }
  }

  /**
   * Uses Gemini to match a buyer's invoice to the best onboarded supplier and recommend a Visa payment rail.
   */
  public async matchSupplierAndPaymentRail(
    invoice: z.infer<typeof SupplierMatchSchema>['invoiceDetails'],
    suppliers: Supplier[]
  ): Promise<{
    matchedSupplier: Supplier | null;
    confidenceScore: number;
    recommendedPaymentRail: 'Visa Direct' | 'Visa Commercial Pay' | 'Virtual Card' | 'Traditional ACH';
    reasoning: string;
  }> {
    if (suppliers.length === 0) {
      return {
        matchedSupplier: null,
        confidenceScore: 0,
        recommendedPaymentRail: 'Traditional ACH',
        reasoning: 'No suppliers available in the database to match.',
      };
    }

    if (!this.genAI) {
      return this.getFallbackSupplierMatch(invoice, suppliers);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const supplierListSummary = suppliers.map(s => ({
        id: s.id,
        businessName: s.businessName,
        industryCode: s.industryCode,
        status: s.status,
      }));

      const prompt = `
        Given the following buyer invoice details:
        - Buyer Name: ${invoice.buyerName}
        - Amount: ${invoice.amount} ${invoice.currency}
        - Description: ${invoice.description}
        
        And the following list of onboarded suppliers:
        ${JSON.stringify(supplierListSummary, null, 2)}
        
        Find the best supplier match. Recommend the optimal Visa payment rail:
        - "Visa Direct" (for real-time push payments to bank accounts)
        - "Visa Commercial Pay" (for high-value B2B transactions with rich metadata)
        - "Virtual Card" (for secure, single-use card payments)
        - "Traditional ACH" (fallback for low-priority or unverified suppliers)
        
        Return ONLY a valid JSON object with the following keys:
        - "matchedSupplierId": string (must match one of the supplier IDs provided)
        - "confidenceScore": number (0 to 100)
        - "recommendedPaymentRail": "Visa Direct" | "Visa Commercial Pay" | "Virtual Card" | "Traditional ACH"
        - "reasoning": string
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanJson);

      const matchedSupplier = suppliers.find(s => s.id === parsed.matchedSupplierId) || null;

      return {
        matchedSupplier,
        confidenceScore: parsed.confidenceScore ?? 50,
        recommendedPaymentRail: parsed.recommendedPaymentRail ?? 'Traditional ACH',
        reasoning: parsed.reasoning ?? 'AI matching completed.',
      };
    } catch (error) {
      logger.error('Gemini supplier matching failed, falling back to heuristics:', error);
      return this.getFallbackSupplierMatch(invoice, suppliers);
    }
  }

  /**
   * Natural language query interface for supplier portfolio insights.
   */
  public async querySupplierInsights(userQuery: string, suppliers: Supplier[]): Promise<string> {
    if (!this.genAI) {
      return 'Gemini API is not configured. Unable to generate natural language insights.';
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const supplierSummary = suppliers.map(s => ({
        id: s.id,
        businessName: s.businessName,
        status: s.status,
        riskScore: s.riskScore,
        industryCode: s.industryCode,
        country: s.address.country,
      }));

      const prompt = `
        You are an expert Visa Supplier Management AI assistant.
        The user is asking: "${userQuery}"
        
        Here is the current supplier portfolio data:
        ${JSON.stringify(supplierSummary, null, 2)}
        
        Provide a professional, concise, and highly accurate response addressing the user's query based on the provided data.
      `;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      logger.error('Gemini query insights failed:', error);
      return 'An error occurred while processing your query with Gemini AI.';
    }
  }

  // ==========================================
  // FALLBACK HEURISTICS (COMMERCIAL RESILIENCY)
  // ==========================================

  private getFallbackRiskAssessment(supplierData: z.infer<typeof OnboardSupplierSchema>) {
    let riskScore = 15; // Base low risk
    let status: 'VERIFIED' | 'REJECTED' | 'PENDING' = 'VERIFIED';
    const reasons: string[] = [];

    if (!supplierData.dunsNumber) {
      riskScore += 20;
      reasons.push('Missing DUNS number');
    }
    if (supplierData.address.country !== 'US') {
      riskScore += 15;
      reasons.push('International jurisdiction');
    }
    if (supplierData.industryCode === '5967' || supplierData.industryCode === '7995') {
      // High risk MCCs (Direct Marketing, Betting)
      riskScore += 40;
      status = 'PENDING';
      reasons.push('High-risk Merchant Category Code (MCC)');
    }

    const riskAssessment = reasons.length > 0 
      ? `Heuristic assessment: Moderate risk. Flags: ${reasons.join(', ')}.`
      : 'Heuristic assessment: Low risk. All primary business verifications passed.';

    return { riskScore, riskAssessment, status };
  }

  private getFallbackSupplierMatch(
    invoice: z.infer<typeof SupplierMatchSchema>['invoiceDetails'],
    suppliers: Supplier[]
  ) {
    // Simple heuristic: match by name similarity or default to the first verified supplier
    let matchedSupplier = suppliers.find(
      s => s.businessName.toLowerCase().includes(invoice.buyerName.toLowerCase()) || 
           invoice.buyerName.toLowerCase().includes(s.businessName.toLowerCase())
    );

    if (!matchedSupplier) {
      matchedSupplier = suppliers.find(s => s.status === 'VERIFIED') || suppliers[0];
    }

    const recommendedPaymentRail = invoice.amount > 50000 ? 'Visa Commercial Pay' : 'Virtual Card';

    return {
      matchedSupplier,
      confidenceScore: matchedSupplier ? 75 : 0,
      recommendedPaymentRail,
      reasoning: 'Heuristic match based on transaction volume and supplier verification status.',
    };
  }
}

const visaSupplierService = new VisaSupplierService();

// ==========================================
// EXPRESS ROUTER DEFINITION
// ==========================================

const router = Router();

/**
 * @route   POST /api/visa-supplier/onboard
 * @desc    Onboard a new supplier with automated Gemini KYB risk assessment.
 * @access  Private (Requires authentication in gateway)
 */
router.post('/onboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = OnboardSupplierSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errors: validationResult.error.errors,
      });
    }

    const supplierData = validationResult.data;
    logger.info(`Initiating onboarding for supplier: ${supplierData.businessName}`);

    // Run Gemini KYB risk assessment
    const assessment = await visaSupplierService.assessSupplierRisk(supplierData);

    // Generate Visa Supplier Network ID if verified
    const visaSupplierNetworkId = assessment.status === 'VERIFIED' 
      ? `VSN-${supplierData.businessName.substring(0, 3).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
      : undefined;

    const newSupplier = await db.create({
      ...supplierData,
      status: assessment.status,
      riskScore: assessment.riskScore,
      riskAssessment: assessment.riskAssessment,
      visaSupplierNetworkId,
    });

    logger.info(`Supplier onboarded successfully with ID: ${newSupplier.id}`);

    return res.status(201).json({
      success: true,
      data: newSupplier,
    });
  } catch (error) {
    logger.error('Error onboarding supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during supplier onboarding.',
    });
  }
});

/**
 * @route   GET /api/visa-supplier
 * @desc    List all suppliers with optional search query and pagination.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, limit, offset } = req.query;
    const parsedLimit = parseInt(limit as string) || 50;
    const parsedOffset = parseInt(offset as string) || 0;

    let suppliers: Supplier[];
    if (search) {
      suppliers = await db.search(search as string);
    } else {
      suppliers = await db.list(parsedLimit, parsedOffset);
    }

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    logger.error('Error listing suppliers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve suppliers.',
    });
  }
});

/**
 * @route   POST /api/visa-supplier/query-ai
 * @desc    Natural language query interface to analyze the supplier portfolio using Gemini.
 */
router.post('/query-ai', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid string query is required.',
      });
    }

    const allSuppliers = await db.list(1000, 0);
    const aiResponse = await visaSupplierService.querySupplierInsights(query, allSuppliers);

    return res.status(200).json({
      success: true,
      query,
      response: aiResponse,
    });
  } catch (error) {
    logger.error('Error processing AI query:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI query.',
    });
  }
});

/**
 * @route   POST /api/visa-supplier/match
 * @desc    Match an incoming invoice to the best supplier and recommend a Visa payment rail.
 */
router.post('/match', async (req: Request, res: Response) => {
  try {
    const validationResult = SupplierMatchSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errors: validationResult.error.errors,
      });
    }

    const { invoiceDetails } = validationResult.data;
    const allSuppliers = await db.list(100, 0);

    const matchResult = await visaSupplierService.matchSupplierAndPaymentRail(
      invoiceDetails,
      allSuppliers
    );

    return res.status(200).json({
      success: true,
      data: matchResult,
    });
  } catch (error) {
    logger.error('Error matching supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform supplier matching.',
    });
  }
});

/**
 * @route   GET /api/visa-supplier/:id
 * @desc    Get supplier details by ID.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await db.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    logger.error('Error fetching supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve supplier details.',
    });
  }
});

/**
 * @route   PUT /api/visa-supplier/:id
 * @desc    Update supplier details.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validationResult = UpdateSupplierSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errors: validationResult.error.errors,
      });
    }

    const updated = await db.update(req.params.id, validationResult.data);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found.',
      });
    }

    logger.info(`Supplier ${req.params.id} updated successfully.`);
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Error updating supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update supplier.',
    });
  }
});

/**
 * @route   POST /api/visa-supplier/:id/verify
 * @desc    Manually trigger or override verification status.
 */
router.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['VERIFIED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be VERIFIED, REJECTED, or SUSPENDED.',
      });
    }

    const supplier = await db.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found.',
      });
    }

    const visaSupplierNetworkId = status === 'VERIFIED' && !supplier.visaSupplierNetworkId
      ? `VSN-${supplier.businessName.substring(0, 3).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
      : supplier.visaSupplierNetworkId;

    const updated = await db.update(req.params.id, {
      status,
      visaSupplierNetworkId,
      riskAssessment: `Manual status override to ${status} by administrator.`,
    });

    logger.info(`Supplier ${req.params.id} verification status updated to ${status}.`);
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Error verifying supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update supplier verification status.',
    });
  }
});

export default router;