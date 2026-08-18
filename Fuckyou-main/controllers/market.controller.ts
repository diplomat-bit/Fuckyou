import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const getMarketSentiment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { marketData } = req.body;
    const prompt = `Analyze the sentiment of the following market data: ${JSON.stringify(marketData)}. Provide a JSON response with 'sentiment' (bullish/bearish/neutral) and 'reasoning'.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json(JSON.parse(response.text()));
  } catch (error) {
    next(error);
  }
};

export const getNewsSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newsArticles } = req.body;
    const prompt = `Summarize these market news articles into 3 key bullet points: ${JSON.stringify(newsArticles)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ summary: response.text() });
  } catch (error) {
    next(error);
  }
};

export const getTrendPrediction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { historicalData } = req.body;
    const prompt = `Based on this historical market data: ${JSON.stringify(historicalData)}, predict the short-term trend. Return a JSON object with 'prediction', 'confidence_score', and 'analysis'.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json(JSON.parse(response.text()));
  } catch (error) {
    next(error);
  }
};

export const getMarketInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;
    const prompt = `Act as a financial analyst. Answer the following market query: ${query}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ insight: response.text() });
  } catch (error) {
    next(error);
  }
};