import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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
  private defaultModelName = 'gemini-1.5-flash';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("BTEligibilityGeminiBridge: API key is required.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Maps unstructured user input/analysis into a structured BTEligibilityRequest
   */
  async mapToEligibilityRequest(userInput: string): Promise<BTEligibilityRequest> {
    if (!userInput || userInput.trim() === '') {
      throw new Error("BTEligibilityGeminiBridge: User input cannot be empty.");
    }

    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        creditScore: {
          type: SchemaType.NUMBER,
          description: "The user's credit score (typically 300-850). If not mentioned, estimate or default to 0.",
        },
        monthlyIncome: {
          type: SchemaType.NUMBER,
          description: "The user's monthly income in USD. If not mentioned, estimate or default to 0.",
        },
        existingDebt: {
          type: SchemaType.NUMBER,
          description: "The user's total existing debt in USD. If not mentioned, estimate or default to 0.",
        },
        requestedAmount: {
          type: SchemaType.NUMBER,
          description: "The requested balance transfer amount in USD. If not mentioned, estimate or default to 0.",
        },
        employmentStatus: {
          type: SchemaType.STRING,
          enum: ["employed", "self-employed", "unemployed"],
          description: "The user's current employment status. Default to 'employed' if unclear.",
        },
      },
      required: ["creditScore", "monthlyIncome", "existingDebt", "requestedAmount", "employmentStatus"],
    };

    try {
      // Attempt structured JSON generation with gemini-1.5-flash
      const model = this.genAI.getGenerativeModel({
        model: this.defaultModelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.1, // Low temperature for deterministic extraction
        },
      });

      const prompt = `
        Analyze the following user financial statement or request and extract the structured eligibility details.
        
        User Input: "${userInput}"
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      const data = JSON.parse(text);
      return this.sanitizeAndValidateRequest(data);

    } catch (primaryError) {
      // Fallback to unstructured generation with manual parsing if structured output fails
      try {
        const fallbackModel = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        const fallbackPrompt = `
          Extract the following financial details from the user input and return ONLY a valid JSON object.
          If a value is missing, provide a reasonable estimate or 0.
          
          Fields:
          - creditScore (number)
          - monthlyIncome (number)
          - existingDebt (number)
          - requestedAmount (number)
          - employmentStatus ('employed' | 'self-employed' | 'unemployed')
          
          User Input: "${userInput}"
          
          Format: { "creditScore": number, "monthlyIncome": number, "existingDebt": number, "requestedAmount": number, "employmentStatus": "employed" | "self-employed" | "unemployed" }
        `;

        const result = await fallbackModel.generateContent(fallbackPrompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{.*\}/s);
        if (!jsonMatch) {
          throw new Error("Failed to locate JSON block in fallback response");
        }

        const data = JSON.parse(jsonMatch[0]);
        return this.sanitizeAndValidateRequest(data);

      } catch (fallbackError) {
        throw new Error(
          `BTEligibilityGeminiBridge Error: Extraction failed. Primary: ${primaryError}. Fallback: ${fallbackError}`
        );
      }
    }
  }

  /**
   * Sanitizes and validates the extracted data to match BTEligibilityRequest
   */
  private sanitizeAndValidateRequest(data: any): BTEligibilityRequest {
    const creditScore = Number(data.creditScore);
    const monthlyIncome = Number(data.monthlyIncome);
    const existingDebt = Number(data.existingDebt);
    const requestedAmount = Number(data.requestedAmount);
    
    let employmentStatus: 'employed' | 'self-employed' | 'unemployed' = 'employed';
    if (data.employmentStatus === 'self-employed' || data.employmentStatus === 'unemployed') {
      employmentStatus = data.employmentStatus;
    }

    return {
      creditScore: isNaN(creditScore) ? 0 : creditScore,
      monthlyIncome: isNaN(monthlyIncome) ? 0 : monthlyIncome,
      existingDebt: isNaN(existingDebt) ? 0 : existingDebt,
      requestedAmount: isNaN(requestedAmount) ? 0 : requestedAmount,
      employmentStatus,
    };
  }

  /**
   * Validates if the AI analysis is sufficient to proceed with an API call
   */
  isAnalysisSufficient(request: BTEligibilityRequest): boolean {
    return (
      request.creditScore >= 300 &&
      request.creditScore <= 850 &&
      request.monthlyIncome > 0 &&
      request.requestedAmount > 0
    );
  }
}

// Export alias for compatibility with files importing GeminiBridge
export { BTEligibilityGeminiBridge as GeminiBridge };