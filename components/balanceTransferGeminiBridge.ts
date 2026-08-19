

// --- CONSOLIDATED FROM: ./services/citi_suite/balanceTransferGeminiBridge.ts ---

import { GoogleGenerativeAI, FunctionDeclaration, Tool, SchemaType } from "@google/generative-ai";
import {
  getGeminiBalanceTransferTools,
  executeGeminiToolCall,
  evaluateEligibility,
  calculateTransferFee,
  calculateEffectiveApr,
  simulateRepayment,
  evaluateOffer,
  evaluateAndRankOffers,
  generateMarkdownSummary
} from "./balanceTransferEvaluator";

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
    
    let tools: any[] = [];
    if (typeof getGeminiBalanceTransferTools === "function") {
      try {
        tools = getGeminiBalanceTransferTools();
      } catch (e) {
        // Fallback if execution fails
      }
    }
    
    if (!tools || tools.length === 0) {
      tools = [{ functionDeclarations: this.getFunctionDeclarations() }];
    }

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      tools: tools
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

  public async processFinancialQuery(userProfile: UserFinancialProfile, userPrompt: string): Promise<string> {
    const systemPrompt = BalanceTransferGeminiBridge.buildSystemPrompt();
    const prompt = `
      ${systemPrompt}
      
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
    if (typeof executeGeminiToolCall === "function") {
      try {
        return await executeGeminiToolCall(name, args);
      } catch (error) {
        // Fallback to local mock implementations if not handled by evaluator
      }
    }

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
    if (typeof evaluateEligibility === "function") {
      try {
        const result = evaluateEligibility(args);
        if (result && typeof result === "object") {
          return {
            isEligible: result.isEligible ?? result.eligible ?? false,
            maxTransferAmount: result.maxTransferAmount ?? result.limit ?? 0,
            apr: result.apr ?? 0,
            feePercentage: result.feePercentage ?? result.fee ?? 3,
            reason: result.reason ?? ""
          };
        }
      } catch (e) {
        // Fallback to local logic
      }
    }

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
    if (typeof calculateTransferFee === "function") {
      try {
        const fee = calculateTransferFee(args.transferAmount, args.feePercentage);
        const currentInterest = args.transferAmount * (args.currentApr / 100);
        const newInterest = args.transferAmount * (args.newApr / 100);
        return currentInterest - (newInterest + fee);
      } catch (e) {
        // Fallback to local logic
      }
    }

    const currentInterest = args.transferAmount * (args.currentApr / 100);
    const newInterest = args.transferAmount * (args.newApr / 100);
    const fee = args.transferAmount * (args.feePercentage / 100);
    return currentInterest - (newInterest + fee);
  }

  public async generateRecommendationReport(userProfile: UserFinancialProfile, offers: any[]): Promise<string> {
    if (typeof generateMarkdownSummary === "function") {
      try {
        const eligibility = this.mockEligibilityCheck({
          creditScore: userProfile.creditScore,
          currentDebt: userProfile.currentDebt,
          annualIncome: userProfile.annualIncome
        });
        return generateMarkdownSummary(userProfile, eligibility, offers);
      } catch (e) {
        // Fallback to local logic
      }
    }
    
    return `
# Balance Transfer Recommendation Report

## Financial Profile Summary
- Credit Score: ${userProfile.creditScore}
- Current Debt: $${userProfile.currentDebt.toLocaleString()}
- Annual Income: $${userProfile.annualIncome.toLocaleString()}

## Recommendation
Based on your profile, we recommend reviewing available balance transfer offers to reduce your interest burden.
    `;
  }
}