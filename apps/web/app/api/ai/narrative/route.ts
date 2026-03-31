import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/config/config";
import { ONE_MINUTE_IN_MS } from "@/constants";
import { createMemoryCache } from "@/utils/in-memory-cache";
import getUserCity from "@/utils/get-user-city";
import { format } from "date-fns";
import GeminiProvider from "@/lib/ai/providers/gemini";
import { ROCKY_INSTRUCTION } from "@/lib/ai/assistants/rocky/instruction";
import { ROCKY_CHAT_HISTORY } from "@/lib/ai/assistants/rocky/history";

const narrativeCache = createMemoryCache<string>(ONE_MINUTE_IN_MS * 60 * 1);

export async function POST(req: NextRequest) {
    try {
        const today = format(new Date(), "yyyy-MM-dd");
        const HABIT_PROMPT_HELPER = `- (wakedup=wake up at 7am; date different from ${today} = not done today)`;

        const [todo, calendar, habits] = await Promise.all([
            fetch(`${CONFIG.baseUrl}/api/todo`).then(r => r.json()),
            fetch(`${CONFIG.baseUrl}/api/calendar`).then(r => r.json()),
            fetch(`${CONFIG.baseUrl}/api/habits`).then(r => r.json()),
        ]);

        const todoSummary = todo.data.filter((t: any) => t.checked === 0).map((t: any) => {
            return t.title + (t.sponsor ? `, resp: ${t.sponsor}` : "") +
                (t.usualCompletionTime ? `, usual time: ${t.usualCompletionTime.replace(":", "h")}` : "")
        }).join(", ");

        const calendarSummary = calendar.data?.todayEvents.map((c: any) => c.title + " at " + c.start).join(", ");

        const entries = Object.entries(habits.data) as [string, any][];
        const habitsSummary = entries.length > 0
            ? `${entries[0][0]}: ${entries[0][1].join(", ")} ${HABIT_PROMPT_HELPER}`
            : "No missions recorded.";

        // const cached = narrativeCache.get("default");
        // if (cached && cached.split("|")[0] === todoSummary + calendarSummary + habitsSummary) {
        //     console.log("[cache] Using cached narrative");
        //     return NextResponse.json({ message: "Narrative data from cache successfully", data: cached.split("|")[1] });
        // }

        const todoCount = todo.data.filter((t: any) => t.checked === 0).length;

        const { weather, hour } = await req.json();

        const forecastSummary = weather.forecast.map((h: any) => `${h.time}:${h.condition},${h.temp}°C`).join("|");

        const willBeRain = weather.forecast.map((h: any) =>
            /chuva|tempestade|rain|drizzle|shower|storm|trovoada/i.test(h.condition)).some((r: boolean) => r);

        const userLocation = await getUserCity();

        const isMorning = hour >= 6 && hour <= 12;
        const prompt = [
            CONFIG.isDev && "[MOCK]",
            `[${today}|${userLocation.city},${userLocation.state}|weather:${weather.temp}°C,${weather.condition}]`,
            `forecast[↑specific|${willBeRain ? "rain" : "no rain"}]:${forecastSummary}`,
            `calendar:${calendarSummary || "∅"}`,
            `pending_tasks(${todoCount}⏰):${todoSummary || "∅"}`,
            isMorning && `habits[↑specific]:${habitsSummary}`,
        ].filter(Boolean).join(";");

        console.log("[prompt]", prompt);

        const { data, error } = await GeminiProvider({ prompt, systemInstruction: ROCKY_INSTRUCTION, history: ROCKY_CHAT_HISTORY });
        if (error) {
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        narrativeCache.set("default", todoSummary + calendarSummary + habitsSummary + "|" + data)

        return NextResponse.json({ message: "Narrative data retrieved successfully", data });
    } catch (error) {
        console.error("Weather Narrative API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
