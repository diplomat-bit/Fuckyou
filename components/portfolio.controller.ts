

// --- CONSOLIDATED FROM: ./controllers/portfolio.controller.ts ---

import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const getPortfolioAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { portfolioData } = req.body;
    const prompt = `Analyze the following portfolio performance: ${JSON.stringify(portfolioData)}. Provide insights on risk, diversification, and growth potential.`;
    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text() });
  } catch (error) {
    next(error);
  }
};

export const getRebalancingStrategy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { portfolioData, targetAllocation } = req.body;
    const prompt = `Given this portfolio: ${JSON.stringify(portfolioData)} and target allocation: ${JSON.stringify(targetAllocation)}, generate a step-by-step rebalancing strategy.`;
    const result = await model.generateContent(prompt);
    res.json({ strategy: result.response.text() });
  } catch (error) {
    next(error);
  }
};

export const getTaxLossHarvestingOpportunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { holdings, taxLotData } = req.body;
    const prompt = `Identify tax-loss harvesting opportunities for these holdings: ${JSON.stringify(holdings)} with tax lot data: ${JSON.stringify(taxLotData)}.`;
    const result = await model.generateContent(prompt);
    res.json({ opportunities: result.response.text() });
  } catch (error) {
    next(error);
  }
};

export const getPortfolios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ portfolios: [] });
  } catch (error) { next(error); }
};

export const getPortfolioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ id: req.params.id, name: 'Sample Portfolio' });
  } catch (error) { next(error); }
};

export const createPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ id: 'port_1', ...req.body });
  } catch (error) { next(error); }
};

export const updatePortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ id: req.params.id, ...req.body });
  } catch (error) { next(error); }
};

export const deletePortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, id: req.params.id });
  } catch (error) { next(error); }
};

export const getPortfolioAiAnalysis = getPortfolioAnalysis;

export const getRebalanceRecommendations = getRebalancingStrategy;

export const generatePortfolioReport = getPortfolioSummary;

export const addAssetToPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, added: req.body });
  } catch (error) { next(error); }
};

export const removeAssetFromPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, removedAssetId: req.params.assetId });
  } catch (error) { next(error); }
};