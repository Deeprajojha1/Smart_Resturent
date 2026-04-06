// @ts-ignore - module is available at runtime
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not defined in your .env file");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

const configuredModel = process.env.GEMINI_MODEL?.trim();
const fallbackModels = ["gemini-2.0-flash", "gemini-1.5-flash-latest"];

const modelCandidates = configuredModel
  ? [configuredModel, ...fallbackModels.filter((m) => m !== configuredModel)]
  : fallbackModels;

const isModelNotFoundError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("is not found for API version") ||
    message.includes("not supported for generateContent") ||
    message.includes("404")
  );
};

export const generateWithGemini = async (prompt: string) => {
  let lastError: unknown;

  for (const model of modelCandidates) {
    try {
      const geminiModel = genAI.getGenerativeModel({ model });
      const result = await geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      if (!isModelNotFoundError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};
