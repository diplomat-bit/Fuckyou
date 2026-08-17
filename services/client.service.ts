import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Retrieve API key from environment variables safely
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

// Initialize the Gemini client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Helper to get the model with standard safety settings and system instructions.
 * Uses gemini-1.5-pro for complex reasoning and high-quality text generation.
 */
function getModel(systemInstruction?: string) {
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY or GOOGLE_API_KEY in your environment.');
  }
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    },
    systemInstruction,
  });
}

export interface ClientData {
  id: string;
  name: string;
  history: string[];
  financialProfile: {
    riskTolerance?: 'low' | 'medium' | 'high';
    netWorth?: number;
    annualIncome?: number;
    investmentGoals?: string[];
    assets?: Array<{ type: string; value: number }>;
    liabilities?: Array<{ type: string; value: number }>;
    [key: string]: any;
  };
}

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1.0 (extremely negative) to 1.0 (extremely positive)
  summary: string;
}

export interface ChurnRiskResult {
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

export const ClientService = {
  /**
   * Drafts a professional, personalized email to a client based on context and history.
   */
  async draftEmail(client: ClientData, context: string): Promise<string> {
    try {
      const systemInstruction = "You are an elite, highly professional financial relationship manager. Your tone is warm, precise, and sophisticated.";
      const model = getModel(systemInstruction);
      
      const prompt = `
        Draft a professional, personalized email to our client, ${client.name}.
        
        Context for the email:
        ${context}
        
        Client Interaction History:
        ${client.history && client.history.length > 0 ? client.history.join('\n- ') : 'No previous history recorded.'}
        
        Financial Profile Summary:
        ${JSON.stringify(client.financialProfile, null, 2)}
        
        Requirements:
        1. Maintain a highly professional, empathetic, and compliant tone.
        2. Reference relevant context and history naturally without sounding robotic.
        3. Do not include placeholders like [Your Name] or [Date] unless absolutely necessary; make it ready to send.
        4. Ensure compliance with financial communication standards (no guaranteed returns, clear disclosures if applicable).
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Error in ClientService.draftEmail:', error);
      return `Dear ${client.name},\n\nThank you for your continued trust in our services. We are currently reviewing your account details regarding: ${context}. One of our senior advisors will reach out to you shortly with a detailed update.\n\nBest regards,\nWealth Management Team`;
    }
  },

  /**
   * Resolves a support ticket with empathy, clarity, and absolute accuracy.
   */
  async resolveSupportTicket(ticketContent: string, client: ClientData): Promise<string> {
    try {
      const systemInstruction = "You are a world-class customer support specialist for a high-net-worth wealth management platform. You resolve complex issues with empathy, clarity, and absolute accuracy.";
      const model = getModel(systemInstruction);
      
      const prompt = `
        Resolve the following support ticket for client ${client.name}:
        
        Ticket Content:
        "${ticketContent}"
        
        Client Financial Profile:
        ${JSON.stringify(client.financialProfile, null, 2)}
        
        Client History:
        ${client.history && client.history.length > 0 ? client.history.join('\n- ') : 'No previous history.'}
        
        Requirements:
        1. Provide a step-by-step resolution or a highly reassuring, professional response.
        2. Take into account their financial profile (e.g., if they are high-net-worth, prioritize premium solutions).
        3. Keep the response actionable, clear, and polite.
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Error in ClientService.resolveSupportTicket:', error);
      return `Dear ${client.name},\n\nWe have received your support request regarding: "${ticketContent}". Our technical and advisory teams are actively investigating this issue. We will resolve this as a matter of priority and contact you within 2 hours.\n\nThank you for your patience.\n\nSincerely,\nClient Support Services`;
    }
  },

  /**
   * Generates personalized financial advice tailored to the client's risk profile and history.
   */
  async getPersonalizedFinancialAdvice(client: ClientData): Promise<string> {
    try {
      const systemInstruction = "You are a certified financial planner (CFP) and wealth strategist. Your advice is objective, highly analytical, compliant with SEC/FINRA guidelines, and tailored to the client's risk profile.";
      const model = getModel(systemInstruction);
      
      const prompt = `
        Provide personalized financial advice for ${client.name} based on their profile:
        ${JSON.stringify(client.financialProfile, null, 2)}
        
        Consider their history:
        ${client.history && client.history.length > 0 ? client.history.join('\n- ') : 'No previous history.'}
        
        Requirements:
        1. Keep it professional, actionable, and compliant with standard financial advisory guidelines.
        2. Include asset allocation suggestions, risk mitigation strategies, and next steps.
        3. Explicitly state standard financial disclaimers (e.g., "Past performance is not indicative of future results").
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Error in ClientService.getPersonalizedFinancialAdvice:', error);
      return `Dear ${client.name},\n\nBased on your financial profile, we recommend maintaining a diversified portfolio aligned with your stated risk tolerance. Please schedule a comprehensive portfolio review with your dedicated wealth advisor to discuss tailored asset allocation strategies.\n\n*Disclaimer: All investments involve risk, including the potential loss of principal.*`;
    }
  },

  /**
   * Analyzes client communication history to extract sentiment and relationship health.
   */
  async analyzeClientSentiment(history: string[]): Promise<SentimentAnalysisResult> {
    try {
      if (!history || history.length === 0) {
        return { sentiment: 'neutral', score: 0, summary: 'No history available for sentiment analysis.' };
      }
      
      const model = getModel("You are an advanced customer experience analyst. You analyze client communication history to extract sentiment and key themes.");
      
      const prompt = `
        Analyze the sentiment of the following client interaction history:
        ${history.join('\n- ')}
        
        Respond ONLY with a valid JSON object matching this schema:
        {
          "sentiment": "positive" | "neutral" | "negative",
          "score": number, // a float between -1.0 (extremely negative) and 1.0 (extremely positive)
          "summary": "string" // a brief 1-2 sentence summary of the client's overall sentiment and relationship health
        }
      `;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Clean up potential markdown code blocks in the response
      const jsonString = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      return JSON.parse(jsonString) as SentimentAnalysisResult;
    } catch (error) {
      console.error('Error in ClientService.analyzeClientSentiment:', error);
      return { sentiment: 'neutral', score: 0, summary: 'Failed to analyze client sentiment due to an internal error.' };
    }
  },

  /**
   * Evaluates churn risk factors and recommends proactive engagement strategies.
   */
  async predictChurnRisk(client: ClientData): Promise<ChurnRiskResult> {
    try {
      const model = getModel("You are a predictive client retention specialist. You identify churn risk factors and recommend proactive engagement strategies.");
      
      const prompt = `
        Evaluate the churn risk for the following client:
        
        Client Name: ${client.name}
        Client History:
        ${client.history && client.history.length > 0 ? client.history.join('\n- ') : 'No history.'}
        
        Financial Profile:
        ${JSON.stringify(client.financialProfile, null, 2)}
        
        Respond ONLY with a valid JSON object matching this schema:
        {
          "riskLevel": "low" | "medium" | "high",
          "factors": ["string"], // list of risk factors identified
          "recommendations": ["string"] // list of proactive steps to mitigate churn risk
        }
      `;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      const jsonString = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      return JSON.parse(jsonString) as ChurnRiskResult;
    } catch (error) {
      console.error('Error in ClientService.predictChurnRisk:', error);
      return {
        riskLevel: 'low',
        factors: ['Unable to perform predictive analysis.'],
        recommendations: ['Schedule a routine check-in call to maintain relationship health.']
      };
    }
  }
};

export default ClientService;