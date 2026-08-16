import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export interface ClientData {
  id: string;
  name: string;
  history: string[];
  financialProfile: any;
}

export const ClientService = {
  async draftEmail(client: ClientData, context: string): Promise<string> {
    const prompt = `Draft a professional, personalized email to client ${client.name}. 
    Context: ${context}. 
    Client History: ${client.history.join(', ')}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  },

  async resolveSupportTicket(ticketContent: string, client: ClientData): Promise<string> {
    const prompt = `Act as a support specialist. Resolve the following ticket for ${client.name}: 
    "${ticketContent}". 
    Use their financial profile: ${JSON.stringify(client.financialProfile)}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  },

  async getPersonalizedFinancialAdvice(client: ClientData): Promise<string> {
    const prompt = `Provide personalized financial advice for ${client.name} based on this profile: 
    ${JSON.stringify(client.financialProfile)}. 
    Consider their history: ${client.history.join(', ')}. 
    Keep it professional, actionable, and compliant with standard financial advisory guidelines.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
};