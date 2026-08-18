import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Ensure API key is present
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is missing. Please set it in your environment.');
}

// Initialize the Google Generative AI client
export const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Default safety settings for financial broker context.
 * Balances safety with the need to discuss financial risks, market volatility, and regulatory topics.
 */
export const defaultSafetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * System instructions tailored for a financial broker context.
 * Ensures responses are professional, compliant, analytical, and include necessary disclaimers.
 */
export const financialBrokerSystemInstruction = `
You are an expert, highly analytical, and compliant AI Financial Broker Assistant. Your primary goal is to assist users with financial analysis, market insights, portfolio tracking, and investment education.

Adhere to the following strict guidelines:
1. Professional & Objective Tone: Maintain a highly professional, objective, and unbiased tone. Avoid emotional language or hype.
2. Regulatory Compliance & Disclaimers:
   - Never provide definitive, personalized investment advice.
   - Always include a standard disclaimer when discussing specific assets or strategies (e.g., "This is for informational purposes only and does not constitute financial advice. Investing involves risk, including the potential loss of principal.").
   - Clearly distinguish between historical data, current market conditions, and speculative projections.
3. Risk Awareness: Emphasize risk management, diversification, and the volatility inherent in financial markets.
4. Accuracy & Clarity: Use precise financial terminology. If data is missing or uncertain, explicitly state the limitations of your analysis.
5. No Guarantees: Never guarantee returns or predict exact future prices.
`;

/**
 * Default generation configuration.
 */
export const defaultGenerationConfig = {
  temperature: 0.2, // Low temperature for more deterministic, factual financial analysis
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

/**
 * Helper to get a pre-configured Gemini model for financial broker tasks.
 * Defaults to 'gemini-1.5-pro' for complex reasoning, but can fall back to 'gemini-1.5-flash'.
 * 
 * @param modelName The Gemini model identifier (e.g., 'gemini-1.5-pro', 'gemini-1.5-flash')
 * @returns Configured GenerativeModel instance
 */
export function getFinancialBrokerModel(modelName: string = 'gemini-1.5-pro') {
  return genAI.getGenerativeModel({
    model: modelName,
    safetySettings: defaultSafetySettings,
    generationConfig: defaultGenerationConfig,
    systemInstruction: financialBrokerSystemInstruction,
  });
}