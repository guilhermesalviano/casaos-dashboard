import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleCalendarAPI } from "@/services/google-calendar-api";
import { format, parseISO } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const events = await fetchGoogleCalendarAPI();

    const importantEvents = events
      .filter((event) => /birthday|anivers[áa]rio/i.test(event.summary))
      .filter((event) => event.start.date !== todayStr)
      .map((event) => {
        return {
          id: event.id,
          start: event.start.dateTime ? format(parseISO(event.start.dateTime), "HH:mm") : event.start.date 
            ? format(parseISO(event.start.date), "dd/MM/yyyy") : "Horário não definido",
          end: (event.end.dateTime ? format(event.end.dateTime, "HH:mm") : ""),
          title: event.summary,
          type: "birthday"
        }
      });

    const todayEvents = events
      .filter((event) => {
        const eventStart = event.start.dateTime || event.start.date;
        if (!eventStart) return false;

        if (event.start.dateTime) {
          return format(parseISO(event.start.dateTime), "yyyy-MM-dd") === todayStr;
        }
        return event.start.date === todayStr;
      }).map((event) => {
        return {
          id: event.id,
          start: (event.start.dateTime ? format(event.start.dateTime, "HH:mm") : "All day"),
          end: (event.end.dateTime ? format(event.end.dateTime, "HH:mm") : ""),
          title: event.summary,
          color: "#6EE7B7"
        }
      });

    return NextResponse.json({ message: "Calendar data retrieved successfully", data: { todayEvents, importantEvents } });
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve calendar data" }, { status: 500 });
  }
}