import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/config/config";

export async function POST(req: NextRequest) {
    try {
        const { weather, hour } = await req.json();

        const timeOfDay =
            hour < 5 ? "late night" :
                hour < 10 ? "morning" :
                    hour < 12 ? "late morning" :
                        hour < 17 ? "afternoon" :
                            hour < 20 ? "evening" : "night";

        const prompt = `You are a poetic but concise weather narrator for a minimalist ambient dashboard. Write a 2-sentence atmospheric summary of the current weather. Be evocative, grounded, and subtly useful — mention what someone stepping outside might feel or notice. Do not use clichés. Do not start with "Currently" or "The weather".
        Current conditions: Location: ${weather.city}, ${weather.state}; Temperature: ${weather.temp}°C; Condition: ${weather.condition}; Time of day: ${timeOfDay}`;

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

        return NextResponse.json({ text: fullText });
    } catch (error) {
        console.error("Weather Narrative API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
