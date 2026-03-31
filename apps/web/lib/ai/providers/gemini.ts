
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CONFIG } from "@/config/config";

interface GeminiProviderProps {
  prompt: string;
  systemInstruction: string;
  history?: any[];
}

export default async function GeminiProvider({ prompt, systemInstruction, history }: GeminiProviderProps) {
  const apiKey = CONFIG.apis.geminiApiKey;
  if (!apiKey) {
    console.error("[error]", "GEMINI_API_KEY is not defined in environment.");
    return { error: "Gemini API key not configured" };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      systemInstruction
    });

    // temporarily hardcoded chat history
    const chat = model.startChat({
      history,
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;

    return { data: response.text() };
  } catch (error) {
    console.error("[error]", error);
    return { error }
  }
}