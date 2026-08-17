import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";
import {
  calculateTransferFee,
  calculateEffectiveApr,
  simulateRepayment,
  evaluateEligibility,
  evaluateOffer,
  evaluateAndRankOffers,
  generateMarkdownSummary,
  getGeminiBalanceTransferTools,
  executeGeminiToolCall
} from "./balanceTransferEvaluator";

export interface Account {
  id: string;
  balance: number;
  apr: number;
}

const mockAccounts: Account[] = [
  { id: "card_123", balance: 5000, apr: 19.9 },
  { id: "card_456", balance: 2000, apr: 24.9 },
];

const localTools: Tool = {
  functionDeclarations: [
    {
      name: "getAccountDetails",
      description: "Retrieve balance and APR for a specific credit card account",
      parameters: {
        type: SchemaType.OBJECT,
        properties: { accountId: { type: SchemaType.STRING } },
        required: ["accountId"],
      },
    },
    {
      name: "calculateTransferSavings",
      description: "Calculate interest savings by transferring balance from high APR to low APR",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          sourceId: { type: SchemaType.STRING },
          targetId: { type: SchemaType.STRING },
          amount: { type: SchemaType.NUMBER },
        },
        required: ["sourceId", "targetId", "amount"],
      },
    },
    {
      name: "simulateRepaymentPlan",
      description: "Simulate repayment of a credit card balance over time with a specific monthly payment and APR",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          balance: { type: SchemaType.NUMBER },
          apr: { type: SchemaType.NUMBER },
          monthlyPayment: { type: SchemaType.NUMBER },
          promoApr: { type: SchemaType.NUMBER },
          promoPeriodMonths: { type: SchemaType.NUMBER },
        },
        required: ["balance", "apr", "monthlyPayment"],
      },
    },
    {
      name: "evaluateEligibilityForTransfer",
      description: "Evaluate if a user is eligible for a balance transfer offer based on credit score and debt-to-income ratio",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          creditScore: { type: SchemaType.NUMBER },
          debtToIncomeRatio: { type: SchemaType.NUMBER },
        },
        required: ["creditScore", "debtToIncomeRatio"],
      },
    }
  ]
};

const toolHandlers: Record<string, Function> = {
  getAccountDetails: ({ accountId }: { accountId: string }) => 
    mockAccounts.find((a) => a.id === accountId) || { error: "Account not found" },
  
  calculateTransferSavings: ({ sourceId, targetId, amount }: any) => {
    const source = mockAccounts.find((a) => a.id === sourceId);
    const target = mockAccounts.find((a) => a.id === targetId);
    if (!source || !target) return { error: "Invalid accounts" };
    
    const fee = typeof calculateTransferFee === "function" ? calculateTransferFee(amount, 0.03) : amount * 0.03;
    const savings = amount * ((source.apr - target.apr) / 100) - fee;
    
    return { 
      savings, 
      originalApr: source.apr, 
      newApr: target.apr,
      transferFee: fee,
      effectiveApr: typeof calculateEffectiveApr === "function" ? calculateEffectiveApr(target.apr, 0.03, 12) : target.apr 
    };
  },

  simulateRepaymentPlan: ({ balance, apr, monthlyPayment, promoApr, promoPeriodMonths }: any) => {
    if (typeof simulateRepayment === "function") {
      return simulateRepayment(balance, apr, monthlyPayment, promoApr, promoPeriodMonths);
    }
    let currentBalance = balance;
    let months = 0;
    let totalInterest = 0;
    const monthlyRate = (apr / 100) / 12;
    
    while (currentBalance > 0 && months < 360) {
      months++;
      const interest = currentBalance * monthlyRate;
      totalInterest += interest;
      currentBalance = currentBalance + interest - monthlyPayment;
      if (currentBalance < 0) currentBalance = 0;
    }
    return { monthsNeeded: months, totalInterestPaid: totalInterest, payoffStatus: currentBalance === 0 ? "Paid Off" : "Unpaid" };
  },

  evaluateEligibilityForTransfer: ({ creditScore, debtToIncomeRatio }: any) => {
    if (typeof evaluateEligibility === "function") {
      return evaluateEligibility(creditScore, debtToIncomeRatio);
    }
    const eligible = creditScore >= 670 && debtToIncomeRatio < 0.45;
    return { eligible, status: eligible ? "Approved" : "Declined", reason: eligible ? "Meets credit criteria" : "Credit score too low or DTI too high" };
  }
};

const getCombinedTools = (): Tool[] => {
  const toolsList: Tool[] = [localTools];
  if (typeof getGeminiBalanceTransferTools === "function") {
    try {
      const evaluatorTools = getGeminiBalanceTransferTools();
      if (Array.isArray(evaluatorTools)) {
        toolsList.push(...evaluatorTools);
      } else if (evaluatorTools) {
        toolsList.push(evaluatorTools);
      }
    } catch (e) {
      console.warn("Failed to load tools from balanceTransferEvaluator:", e);
    }
  }
  return toolsList;
};

export class BalanceTransferOrchestrator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      tools: getCombinedTools() 
    });
  }

  async processRequest(prompt: string) {
    const result = await this.model.generateContent(prompt);
    const call = result.response.functionCalls()?.[0];

    if (call) {
      let output;
      if (toolHandlers[call.name]) {
        output = await toolHandlers[call.name](call.args);
      } else if (typeof executeGeminiToolCall === "function") {
        try {
          output = await executeGeminiToolCall(call.name, call.args);
        } catch (err) {
          output = { error: `Failed to execute evaluator tool: ${(err as Error).message}` };
        }
      } else {
        output = { error: `Unknown tool: ${call.name}` };
      }
      return { toolCall: call.name, result: output };
    }
    return { text: result.response.text() };
  }

  async runEvaluation(scenario: string) {
    console.log(`Evaluating: ${scenario}`);
    const response = await this.processRequest(scenario);
    const success = response.result !== undefined;
    return { scenario, success, response };
  }
}

export const runBalanceTransferApp = async (apiKey: string) => {
  const app = new BalanceTransferOrchestrator(apiKey);
  const testScenario = "Calculate savings for transferring 1000 from card_456 to card_123";
  const evaluation = await app.runEvaluation(testScenario);
  console.log("Workflow Complete:", JSON.stringify(evaluation, null, 2));
  return evaluation;
};