import { GoogleGenerativeAI, FunctionDeclaration, Tool, SchemaType } from "@google/generative-ai";

export interface BalanceTransferEligibility {
  isEligible: boolean;
  maxTransferAmount: number;
  apr: number;
  feePercentage: number;
  reason?: string;
}

export interface UserFinancialProfile {
  creditScore: number;
  currentDebt: number;
  annualIncome: number;
  existingCards: { issuer: string; balance: number; apr: number }[];
}

export class BalanceTransferGeminiBridge {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      tools: [{ functionDeclarations: this.getFunctionDeclarations() }]
    });
  }

  private getFunctionDeclarations(): FunctionDeclaration[] {
    return [
      {
        name: "checkEligibility",
        description: "Checks if a user is eligible for a balance transfer based on their financial profile.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            creditScore: { type: SchemaType.NUMBER },
            currentDebt: { type: SchemaType.NUMBER },
            annualIncome: { type: SchemaType.NUMBER }
          },
          required: ["creditScore", "currentDebt", "annualIncome"]
        }
      },
      {
        name: "calculateSavings",
        description: "Calculates potential interest savings from a balance transfer.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            transferAmount: { type: SchemaType.NUMBER },
            currentApr: { type: SchemaType.NUMBER },
            newApr: { type: SchemaType.NUMBER },
            feePercentage: { type: SchemaType.NUMBER }
          },
          required: ["transferAmount", "currentApr", "newApr", "feePercentage"]
        }
      }
    ];
  }

  public async processFinancialQuery(userProfile: UserFinancialProfile, userPrompt: string) {
    const prompt = `
      User Profile: ${JSON.stringify(userProfile)}
      Task: Analyze the user's financial situation and provide a recommendation regarding balance transfers.
      User Query: ${userPrompt}
    `;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  public static buildSystemPrompt(): string {
    return `
      You are an expert financial assistant specializing in balance transfer optimization.
      Your goal is to minimize user interest payments.
      Always verify eligibility before recommending a transfer.
      If a transfer is recommended, calculate the exact savings and explain the fee structure.
      Maintain a professional, objective, and helpful tone.
    `;
  }

  public async executeToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case "checkEligibility":
        return this.mockEligibilityCheck(args);
      case "calculateSavings":
        return this.mockSavingsCalculation(args);
      default:
        throw new Error(`Tool ${name} not implemented.`);
    }
  }

  private mockEligibilityCheck(args: any): BalanceTransferEligibility {
    const isEligible = args.creditScore > 650 && (args.currentDebt / args.annualIncome) < 0.5;
    return {
      isEligible,
      maxTransferAmount: isEligible ? args.annualIncome * 0.2 : 0,
      apr: 0,
      feePercentage: 3,
      reason: isEligible ? "Good credit standing" : "Debt-to-income ratio too high"
    };
  }

  private mockSavingsCalculation(args: any): number {
    const currentInterest = args.transferAmount * (args.currentApr / 100);
    const newInterest = args.transferAmount * (args.newApr / 100);
    const fee = args.transferAmount * (args.feePercentage / 100);
    return currentInterest - (newInterest + fee);
  }
}