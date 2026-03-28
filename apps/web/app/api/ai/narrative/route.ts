import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/config/config";
import { ONE_MINUTE_IN_MS } from "@/constants";
import { createMemoryCache } from "@/utils/in-memory-cache";

const narrativeCache = createMemoryCache<string>(ONE_MINUTE_IN_MS * 60 * 1);

export async function POST(req: NextRequest) {
    const cached = narrativeCache.get();
    if (cached) {
        return NextResponse.json({ message: "Narrative data from cache successfully", data: cached });
    }

    try {
        const { weather, hour } = await req.json();

        const timeOfDay =
            hour < 5 ? "late night" :
                hour < 10 ? "morning" :
                    hour < 12 ? "late morning" :
                        hour < 17 ? "afternoon" :
                            hour < 20 ? "evening" : "night";

        // Temporary integration, i will refactor this later
        // const news = await fetch(`${CONFIG.baseUrl}/api/news`);
        // const newsData = await news.json();

        const todo = await fetch(`${CONFIG.baseUrl}/api/todo`);
        const todoData = await todo.json();

        const calendar = await fetch(`${CONFIG.baseUrl}/api/calendar`);
        const calendarData = await calendar.json();

        const prompt = `Atue como um mentor estoico e conciso. 
        Sintetize o clima, as notícias e as tarefas em 2 frases profundas que tragam clareza ao dia. 
        Evite clichês e seja direto.
        Dados:
        Clima: ${weather.temp}°C, ${weather.condition} (${timeOfDay});
        Agenda: ${calendarData.data.todayEvents.map((c: any) => c.title).join(", ")};
        Tarefas: ${todoData.data.map((t: any) => t.title).join(", ")}`;

        const apiKey = CONFIG.apis.geminiApiKey;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not defined in environment.");
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const remoteResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: 250,
                        temperature: 0.7,
                    },
                }),
            }
        );

        if (!remoteResponse.ok) {
            const errorText = await remoteResponse.text();
            console.error("Gemini API error:", errorText);
            return NextResponse.json({ error: "Failed to fetch from Gemini" }, { status: remoteResponse.status });
        }

        const data = await remoteResponse.json();
        const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        narrativeCache.set(fullText)

        return NextResponse.json({ message: "Narrative data retrieved successfully", data: fullText });
    } catch (error) {
        console.error("Weather Narrative API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
