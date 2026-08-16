import { GoogleGenerativeAI } from "@google/generative-ai";
import { EligibilityClient } from "./api/eligibilityClient";
import { GeminiBridge } from "./bridge/geminiBridge";

/**
 * Main application entry point for the BT Eligibility Check system.
 * Orchestrates the flow between the Gemini AI model and the Eligibility API.
 */
export class BtEligibilityApp {
  private readonly geminiBridge: GeminiBridge;
  private readonly apiClient: EligibilityClient;

  constructor(apiKey: string, apiBaseUrl: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    this.apiClient = new EligibilityClient(apiBaseUrl);
    this.geminiBridge = new GeminiBridge(model, this.apiClient);
  }

  /**
   * Executes the eligibility check flow based on user input.
   * @param userInput Natural language input from the user regarding their eligibility.
   * @returns A presentable response object containing the result and status.
   */
  public async runEligibilityCheck(userInput: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      // The bridge handles the translation of natural language to API parameters
      // and executes the necessary API calls via the client.
      const result = await this.geminiBridge.processRequest(userInput);

      return {
        success: true,
        message: "Eligibility check completed successfully.",
        data: result,
      };
    } catch (error: any) {
      console.error("BT Eligibility App Error:", error);
      return {
        success: false,
        message: error.message || "An unexpected error occurred during the eligibility check.",
      };
    }
  }
}

// Export a singleton instance or factory if needed for the wider project architecture
export const createBtEligibilityApp = (apiKey: string, apiBaseUrl: string) => {
  return new BtEligibilityApp(apiKey, apiBaseUrl);
};