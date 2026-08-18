import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { callGemini } from '../services/geminiService';
import { logger } from './utils/logger';

// Interfaces for Buyer and Template Management
interface Buyer {
  id: string;
  companyName: string;
  taxId: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  creditLimit: number;
  currency: string;
  settlementAccount: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  riskScore?: number;
  riskAnalysis?: string;
  createdAt: string;
  updatedAt: string;
}

interface CardTemplate {
  id: string;
  buyerId: string;
  templateName: string;
  usageType: 'SINGLE_USE' | 'MULTI_USE';
  maxAmountPerTransaction: number;
  dailyLimit: number;
  monthlyLimit: number;
  mccWhitelist: string[];
  mccBlacklist: string[];
  expiryDays: number;
  allowedMerchants?: string[];
  aiOptimized: boolean;
  optimizationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Stateful Store for Buyers and Templates
class VisaBuyerStore {
  private buyers = new Map<string, Buyer>();
  private templates = new Map<string, CardTemplate>();

  async createBuyer(buyer: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Buyer> {
    const id = `byr_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();
    const newBuyer: Buyer = { ...buyer, id, createdAt: now, updatedAt: now };
    this.buyers.set(id, newBuyer);
    return newBuyer;
  }

  async getBuyer(id: string): Promise<Buyer | undefined> {
    return this.buyers.get(id);
  }

  async updateBuyer(id: string, updates: Partial<Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Buyer | undefined> {
    const buyer = this.buyers.get(id);
    if (!buyer) return undefined;
    const updated: Buyer = {
      ...buyer,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.buyers.set(id, updated);
    return updated;
  }

  async listBuyers(): Promise<Buyer[]> {
    return Array.from(this.buyers.values());
  }

  async createTemplate(template: Omit<CardTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CardTemplate> {
    const id = `tpl_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();
    const newTemplate: CardTemplate = { ...template, id, createdAt: now, updatedAt: now };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async getTemplate(id: string): Promise<CardTemplate | undefined> {
    return this.templates.get(id);
  }

  async updateTemplate(id: string, updates: Partial<Omit<CardTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CardTemplate | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    const updated: CardTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.templates.set(id, updated);
    return updated;
  }

  async listTemplatesByBuyer(buyerId: string): Promise<CardTemplate[]> {
    return Array.from(this.templates.values()).filter(t => t.buyerId === buyerId);
  }
}

const store = new VisaBuyerStore();

// Seed initial data for testing and immediate utility
const seedData = async () => {
  const buyer1 = await store.createBuyer({
    companyName: 'Acme Global Logistics',
    taxId: '12-3456789',
    address: {
      street: '100 Logistics Way',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94107',
      country: 'USA'
    },
    contact: {
      name: 'Jane Doe',
      email: 'jane.doe@acme-logistics.com',
      phone: '+15550199'
    },
    creditLimit: 500000,
    currency: 'USD',
    settlementAccount: 'ACT-99887766',
    status: 'APPROVED',
    riskScore: 12,
    riskAnalysis: 'Established logistics firm with strong credit history and low risk profile.'
  });

  await store.createTemplate({
    buyerId: buyer1.id,
    templateName: 'Fuel & Fleet Expenses',
    usageType: 'MULTI_USE',
    maxAmountPerTransaction: 500,
    dailyLimit: 2000,
    monthlyLimit: 15000,
    mccWhitelist: ['5541', '5542'], // Service Stations, Fuel Dispensing
    mccBlacklist: [],
    expiryDays: 365,
    aiOptimized: false
  });
};
seedData();

// Zod Validation Schemas
const BuyerOnboardSchema = z.object({
  companyName: z.string().min(2),
  taxId: z.string().min(5),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(2)
  }),
  contact: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5)
  }),
  creditLimit: z.number().positive(),
  currency: z.string().default('USD'),
  settlementAccount: z.string().min(5)
});

const TemplateConfigSchema = z.object({
  templateName: z.string().min(2),
  usageType: z.enum(['SINGLE_USE', 'MULTI_USE']),
  maxAmountPerTransaction: z.number().positive(),
  dailyLimit: z.number().positive(),
  monthlyLimit: z.number().positive(),
  mccWhitelist: z.array(z.string()),
  mccBlacklist: z.array(z.string()),
  expiryDays: z.number().int().positive(),
  allowedMerchants: z.array(z.string()).optional()
});

const OptimizeTemplateSchema = z.object({
  useCaseDescription: z.string().min(10),
  estimatedMonthlySpend: z.number().positive(),
  targetDepartment: z.string().min(2)
});

// Helper to clean JSON response from Gemini
function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/```$/, '');
  }
  return cleaned.trim();
}

// Helper to generate Visa VPA API Payload
function generateVisaVpaPayload(buyer: Buyer, template: CardTemplate) {
  return {
    visaCommercialPay: {
      header: {
        requestMessageId: crypto.randomUUID(),
        messageDateTime: new Date().toISOString()
      },
      buyerDetails: {
        buyerId: buyer.id,
        taxIdentifier: buyer.taxId,
        organizationName: buyer.companyName,
        address: {
          line1: buyer.address.street,
          city: buyer.address.city,
          state: buyer.address.state,
          postalCode: buyer.address.postalCode,
          countryCode: buyer.address.country
        }
      },
      templateControls: {
        templateId: template.id,
        templateName: template.templateName,
        cardType: template.usageType === 'SINGLE_USE' ? 'SINGLE_USE' : 'RECURRING',
        limits: {
          perTransactionLimit: {
            amount: template.maxAmountPerTransaction,
            currency: buyer.currency
          },
          dailyLimit: {
            amount: template.dailyLimit,
            currency: buyer.currency
          },
          monthlyLimit: {
            amount: template.monthlyLimit,
            currency: buyer.currency
          }
        },
        velocityControls: {
          maxTransactionsPerDay: template.usageType === 'SINGLE_USE' ? 1 : 99,
          expiryOffsetDays: template.expiryDays
        },
        merchantControls: {
          action: template.mccWhitelist.length > 0 ? 'ALLOW' : 'BLOCK',
          merchantCategoryCodes: template.mccWhitelist.length > 0 ? template.mccWhitelist : template.mccBlacklist
        }
      }
    }
  };
}

const router = Router();

// Onboard a new buyer with Gemini Risk Assessment
router.post('/buyers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = BuyerOnboardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid buyer onboarding data', details: parsed.error.format() });
    }

    const buyerData = parsed.data;

    // Create buyer with PENDING status first
    const buyer = await store.createBuyer({
      ...buyerData,
      status: 'PENDING'
    });

    logger.info(`Initiating Visa Buyer onboarding for: ${buyer.companyName} (ID: ${buyer.id})`);

    // Call Gemini for Risk Assessment
    let riskScore = 50; // Default fallback
    let status: 'APPROVED' | 'PENDING' | 'REJECTED' = 'PENDING';
    let riskAnalysis = 'Risk assessment pending.';

    try {
      const prompt = `
You are a Visa Commercial Compliance and Risk Assessment AI.
Analyze the following buyer onboarding request for potential risk, compliance issues, and creditworthiness.
Company Name: ${buyer.companyName}
Tax ID: ${buyer.taxId}
Address: ${JSON.stringify(buyer.address)}
Credit Limit Requested: ${buyer.currency} ${buyer.creditLimit}
Contact: ${JSON.stringify(buyer.contact)}

Provide a JSON response with the following structure:
{
  "riskScore": <number between 0 and 100, where 0 is lowest risk and 100 is highest risk>,
  "status": "APPROVED" | "PENDING" | "REJECTED",
  "analysis": "<detailed analysis of the company, potential red flags, and creditworthiness justification>"
}
Ensure the response is strictly valid JSON. Do not include any markdown formatting or backticks.
`;

      const geminiResponse = await callGemini({ prompt });
      if (geminiResponse) {
        const cleaned = cleanJsonResponse(geminiResponse);
        const result = JSON.parse(cleaned);
        riskScore = result.riskScore ?? 50;
        status = result.status ?? 'PENDING';
        riskAnalysis = result.analysis ?? 'No analysis provided.';
      }
    } catch (geminiError) {
      logger.error('Gemini risk assessment failed, falling back to manual review status', geminiError);
      riskAnalysis = 'AI Risk Assessment failed. Falling back to manual compliance review.';
    }

    // Update buyer with risk assessment results
    const updatedBuyer = await store.updateBuyer(buyer.id, {
      status,
      riskScore,
      riskAnalysis
    });

    res.status(201).json(updatedBuyer);
  } catch (error) {
    next(error);
  }
});

// List all buyers
router.get('/buyers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyers = await store.listBuyers();
    res.json(buyers);
  } catch (error) {
    next(error);
  }
});

// Get buyer by ID
router.get('/buyers/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyer = await store.getBuyer(req.params.id);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.json(buyer);
  } catch (error) {
    next(error);
  }
});

// Update buyer
router.put('/buyers/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = BuyerOnboardSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid update data', details: parsed.error.format() });
    }

    const updated = await store.updateBuyer(req.params.id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Create a template for a buyer
router.post('/buyers/:id/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyer = await store.getBuyer(req.params.id);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const parsed = TemplateConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid template configuration data', details: parsed.error.format() });
    }

    const template = await store.createTemplate({
      ...parsed.data,
      buyerId: buyer.id,
      aiOptimized: false
    });

    logger.info(`Created card template: ${template.templateName} for Buyer: ${buyer.companyName}`);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// List templates for a buyer
router.get('/buyers/:id/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyer = await store.getBuyer(req.params.id);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const templates = await store.listTemplatesByBuyer(buyer.id);
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// Get template by ID
router.get('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await store.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Update template
router.put('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = TemplateConfigSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid update data', details: parsed.error.format() });
    }

    const updated = await store.updateTemplate(req.params.id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Optimize template using Gemini
router.post('/templates/optimize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = OptimizeTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid optimization request data', details: parsed.error.format() });
    }

    const { useCaseDescription, estimatedMonthlySpend, targetDepartment } = parsed.data;

    logger.info(`Requesting Gemini template optimization for use case: "${useCaseDescription}"`);

    const prompt = `
You are a Visa Commercial Pay (VPA) Virtual Card Template Optimization AI.
Based on the following business use case, recommend the optimal card controls and limits to minimize fraud while ensuring operational efficiency.

Use Case Description: "${useCaseDescription}"
Estimated Monthly Spend: ${estimatedMonthlySpend}
Target Department: "${targetDepartment}"

Provide a JSON response with the following structure:
{
  "templateName": "<suggested template name>",
  "usageType": "SINGLE_USE" | "MULTI_USE",
  "maxAmountPerTransaction": <number>,
  "dailyLimit": <number>,
  "monthlyLimit": <number>,
  "mccWhitelist": [<array of 4-digit Merchant Category Codes as strings, e.g. "5812", "5111">],
  "mccBlacklist": [<array of 4-digit Merchant Category Codes as strings>],
  "expiryDays": <number of days the card should remain active, e.g. 30>,
  "optimizationNotes": "<detailed explanation of why these controls were chosen and how they protect against fraud>"
}
Ensure the response is strictly valid JSON. Do not include any markdown formatting or backticks.
`;

    const geminiResponse = await callGemini({ prompt });
    if (!geminiResponse) {
      return res.status(500).json({ error: 'Failed to generate optimization recommendations from Gemini' });
    }

    const cleaned = cleanJsonResponse(geminiResponse);
    const recommendation = JSON.parse(cleaned);

    res.json({
      success: true,
      recommendation,
      rawAiResponse: geminiResponse
    });
  } catch (error) {
    logger.error('Error in template optimization endpoint', error);
    next(error);
  }
});

// Get Visa VPA API Payload for a given buyer and template
router.get('/buyers/:buyerId/templates/:templateId/visa-payload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyer = await store.getBuyer(req.params.buyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const templates = await store.listTemplatesByBuyer(buyer.id);
    const template = templates.find(t => t.id === req.params.templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found for this buyer' });
    }

    const payload = generateVisaVpaPayload(buyer, template);
    res.json({
      buyerId: buyer.id,
      templateId: template.id,
      visaEndpoint: 'https://sandbox.api.visa.com/vpa/v1/buyer/templates',
      payload
    });
  } catch (error) {
    next(error);
  }
});

export default router;