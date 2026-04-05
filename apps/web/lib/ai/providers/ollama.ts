import { EXTERNAL_SERVICES } from "@/config/config";
import { ONE_MINUTE_IN_MS } from "@/constants";

interface OllamaProviderProps {
  prompt: string;
  systemInstruction?: string;
  history?: any[];
}

export default async function OllamaProvider({ prompt }: OllamaProviderProps) {
  const url = `${EXTERNAL_SERVICES.ollama}/api/generate`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ONE_MINUTE_IN_MS * 5 ); // 5 minutes timeout

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemma4", prompt, stream: true }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { data: "", error: `Ollama error: ${response.status}` };
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) fullText += json.response;
        } catch {}
      }
    }

    return { data: fullText };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return { data: "", error: "Ollama request timed out" };
    }
    return { data: "", error: `fetch failed: ${err.message}` };
  } finally {
    clearTimeout(timeout);
  }
}