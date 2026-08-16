import { GoogleGenerativeAI } from '@google/generative-ai';

export interface BTEligibilityRequest {
  creditScore: number;
  monthlyIncome: number;
  existingDebt: number;
  requestedAmount: number;
  employmentStatus: 'employed' | 'self-employed' | 'unemployed';
}

export interface GeminiAnalysisResult {
  rawText: string;
  confidenceScore: number;
}

export class BTEligibilityGeminiBridge {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Maps unstructured user input/analysis into a structured BTEligibilityRequest
   */
  async mapToEligibilityRequest(userInput: string): Promise<BTEligibilityRequest> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Extract the following financial details from the user input and return ONLY a JSON object.
      If a value is missing, provide a reasonable estimate or null.
      Fields: creditScore (number), monthlyIncome (number), existingDebt (number), requestedAmount (number), employmentStatus ('employed' | 'self-employed' | 'unemployed').
      
      User Input: "${userInput}"
      
      Format: { "creditScore": number, "monthlyIncome": number, "existingDebt": number, "requestedAmount": number, "employmentStatus": string }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\{.*\}/s);
      if (!jsonMatch) throw new Error("Failed to parse Gemini response");
      
      const data = JSON.parse(jsonMatch[0]);
      
      return {
        creditScore: Number(data.creditScore) || 0,
        monthlyIncome: Number(data.monthlyIncome) || 0,
        existingDebt: Number(data.existingDebt) || 0,
        requestedAmount: Number(data.requestedAmount) || 0,
        employmentStatus: ['employed', 'self-employed', 'unemployed'].includes(data.employmentStatus) 
          ? data.employmentStatus 
          : 'employed'
      };
    } catch (error) {
      throw new Error(`Bridge Mapping Error: Unable to parse AI response. ${error}`);
    }
  }

  /**
   * Validates if the AI analysis is sufficient to proceed with an API call
   */
  isAnalysisSufficient(request: BTEligibilityRequest): boolean {
    return (
      request.creditScore > 300 &&
      request.monthlyIncome > 0 &&
      request.requestedAmount > 0
    );
  }
}