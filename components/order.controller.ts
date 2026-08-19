

// --- CONSOLIDATED FROM: ./controllers/order.controller.ts ---

import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function analyzeWithGemini(prompt: string, data: any): Promise<any> {
  const result = await model.generateContent(`${prompt}: ${JSON.stringify(data)}`);
  const response = await result.response;
  return JSON.parse(response.text());
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const complianceCheck = await analyzeWithGemini(
      'Perform pre-trade compliance check. Return JSON { "approved": boolean, "reason": string }',
      req.body
    );

    if (!complianceCheck.approved) {
      return res.status(403).json({ error: 'Compliance violation', details: complianceCheck.reason });
    }

    // Logic for order execution would go here
    res.status(201).json({ status: 'Order placed', compliance: complianceCheck });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const report = await analyzeWithGemini(
      'Generate a human-readable execution report for this order data',
      { orderId }
    );
    res.json({ report });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const smartRouting = await analyzeWithGemini(
      'Determine if this order update requires re-routing to a different liquidity provider. Return JSON { "reroute": boolean, "provider": string }',
      req.body
    );
    res.json({ status: 'Order updated', routing: smartRouting });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const riskAssessment = await analyzeWithGemini(
      'Assess the market impact risk of cancelling this order. Return JSON { "riskLevel": "low" | "medium" | "high" }',
      req.params.id
    );
    res.json({ status: 'Order cancelled', riskAssessment });
  } catch (error) {
    next(error);
  }
};