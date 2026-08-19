

// --- CONSOLIDATED FROM: ./services/market.service.ts ---

import { GoogleGenerativeAI } from '@google/generative-ai';

interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  news: string[];
}

interface MarketAnalysis {
  sentiment: string;
  summary: string;
  prediction: string;
}

export class MarketService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzeMarket(data: MarketData): Promise<MarketAnalysis> {
    const prompt = `
      Analyze the following market data for ${data.symbol}:
      Price: ${data.price}
      Volume: ${data.volume}
      Recent News: ${data.news.join(' | ')}

      Provide:
      1. Sentiment analysis (Bullish/Bearish/Neutral)
      2. A concise summary of the market situation
      3. A predictive trend analysis based on the data provided.

      Format the output as a JSON object with keys: sentiment, summary, prediction.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up potential markdown formatting from Gemini
      const jsonString = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonString) as MarketAnalysis;
    } catch (error) {
      console.error('Error analyzing market data with Gemini:', error);
      throw new Error('Failed to perform market analysis');
    }
  }

  async getMarketInsights(symbol: string, rawData: any): Promise<string> {
    const prompt = `Act as a financial analyst. Given this raw market data for ${symbol}: ${JSON.stringify(rawData)}, provide a professional insight report.`;
    
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}