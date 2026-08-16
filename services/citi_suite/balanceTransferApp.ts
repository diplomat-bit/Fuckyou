import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";

interface Account {
  id: string;
  balance: number;
  apr: number;
}

const mockAccounts: Account[] = [
  { id: "card_123", balance: 5000, apr: 19.9 },
  { id: "card_456", balance: 2000, apr: 24.9 },
];

const tools: Tool[] = [
  {
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
    ],
  },
];

const toolHandlers: Record<string, Function> = {
  getAccountDetails: ({ accountId }: { accountId: string }) => 
    mockAccounts.find((a) => a.id === accountId) || { error: "Account not found" },
  calculateTransferSavings: ({ sourceId, targetId, amount }: any) => {
    const source = mockAccounts.find((a) => a.id === sourceId);
    const target = mockAccounts.find((a) => a.id === targetId);
    if (!source || !target) return { error: "Invalid accounts" };
    const savings = amount * ((source.apr - target.apr) / 100);
    return { savings, originalApr: source.apr, newApr: target.apr };
  },
};

export class BalanceTransferOrchestrator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash", tools });
  }

  async processRequest(prompt: string) {
    const result = await this.model.generateContent(prompt);
    const call = result.response.functionCalls()?.[0];

    if (call) {
      const handler = toolHandlers[call.name];
      const output = await handler(call.args);
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