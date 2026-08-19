

// --- CONSOLIDATED FROM: ./controllers/account.controller.ts ---

import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const getAccountHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accountData = req.body.accountData;
    const prompt = `Analyze the following account data and provide a health status report: ${JSON.stringify(accountData)}`;
    const result = await model.generateContent(prompt);
    res.status(200).json({ analysis: result.response.text() });
  } catch (error) {
    next(error);
  }
};

export const getRiskProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, transactionHistory } = req.body;
    const prompt = `Assess the risk profile for user ${userId} based on this history: ${JSON.stringify(transactionHistory)}. Return a risk score and justification.`;
    const result = await model.generateContent(prompt);
    res.status(200).json({ riskAssessment: result.response.text() });
  } catch (error) {
    next(error);
  }
};

export const getCreditScore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { financialData } = req.body;
    const prompt = `Calculate a credit score estimate and provide financial advice based on: ${JSON.stringify(financialData)}`;
    const result = await model.generateContent(prompt);
    res.status(200).json({ creditAnalysis: result.response.text() });
  } catch (error) {
    next(error);
  }
};

export const updateAccountPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { preferences } = req.body;
    const prompt = `Review these user preferences for potential conflicts or optimization: ${JSON.stringify(preferences)}`;
    const result = await model.generateContent(prompt);
    res.status(200).json({ feedback: result.response.text(), status: 'updated' });
  } catch (error) {
    next(error);
  }
};