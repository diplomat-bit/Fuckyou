import { GoogleGenerativeAI, Schema, SchemaType as Type } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GeminiRequestOptions {
  prompt: string;
  responseSchema?: Schema;
  modelName?: string;
}

export class GeminiService {
  private static readonly DEFAULT_MODEL = "gemini-1.5-flash";

  /**
   * Core method to interact with Gemini API.
   * Handles prompt generation, structured JSON enforcement, and error handling.
   */
  public static async generate<T>(options: GeminiRequestOptions): Promise<T> {
    const { prompt, responseSchema, modelName = this.DEFAULT_MODEL } = options;

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: responseSchema
          ? {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
            }
          : undefined,
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (!responseText) {
        throw new Error("Gemini API returned an empty response.");
      }

      return JSON.parse(responseText) as T;
    } catch (error) {
      console.error("GeminiService Error:", error);
      throw new Error(`Failed to process request via Gemini: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Helper to define standard JSON schemas for common broker endpoints
   */
  public static getSchemas() {
    return {
      successResponse: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING },
          data: { type: Type.OBJECT },
        },
        required: ["status", "data"],
      },
    };
  }
}