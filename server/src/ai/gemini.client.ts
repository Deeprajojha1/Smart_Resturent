// @ts-ignore - module is available at runtime
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not defined in your .env file");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
