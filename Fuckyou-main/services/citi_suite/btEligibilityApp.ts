import { GoogleGenerativeAI } from "@google/generative-ai";
import { BtEligibilityClient } from "./btEligibilityClient";
import { BtEligibilityGeminiBridge } from "./btEligibilityGeminiBridge";

/**
 * Main application entry point for the BT Eligibility Check system.
 * Orchestrates the flow between the Gemini AI model and the Eligibility API.
 */
export class BtEligibilityApp {
  private readonly geminiBridge: BtEligibilityGeminiBridge;
  private readonly apiClient: BtEligibilityClient;

  constructor(apiKey: string, apiBaseUrl: string) {
    if (!apiKey) {
      throw new Error("API key is required to initialize BtEligibilityApp");
    }
    if (!apiBaseUrl) {
      throw new Error("API base URL is required to initialize BtEligibilityApp");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    this.apiClient = new BtEligibilityClient(apiBaseUrl);
    this.geminiBridge = new BtEligibilityGeminiBridge(model, this.apiClient);
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
      if (!userInput || userInput.trim() === "") {
        return {
          success: false,
          message: "User input cannot be empty.",
        };
      }

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

/**
 * Factory function to create a new instance of BtEligibilityApp.
 * @param apiKey The Gemini API key.
 * @param apiBaseUrl The base URL for the eligibility API.
 */
export const createBtEligibilityApp = (apiKey: string, apiBaseUrl: string) => {
  return new BtEligibilityApp(apiKey, apiBaseUrl);
};