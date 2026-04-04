import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleCalendarAPI } from "@/services/google-calendar-api";
import { format, parseISO } from "date-fns";
import { createMemoryCache } from "@/utils/in-memory-cache";
import { ONE_MINUTE_IN_MS } from "@/constants";
import { CalendarInternalAPIResponse } from "@/types/calendar";
import logger from "@/lib/logger";

const calendarCache = createMemoryCache<CalendarInternalAPIResponse>(ONE_MINUTE_IN_MS * 60 * 3);

export async function GET(req: NextRequest) {
  const cached = calendarCache.get("default");
  if (cached) {
    logger.info("Calendar data retrieved from cache successfully");
    return NextResponse.json({ message: "Calendar data from cache successfully", data: cached });
  }

  try {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const events = await fetchGoogleCalendarAPI();

    const importantEvents = events
      .filter((event) => {
        const eventDate = event.start.dateTime 
          ? format(parseISO(event.start.dateTime), "yyyy-MM-dd")
          : event.start.date 
            ? format(parseISO(event.start.date), "yyyy-MM-dd")
            : null;

        return eventDate !== todayStr;
      })
      .map((event) => {
        return {
          id: event.id,
          start: event.start.dateTime ? format(parseISO(event.start.dateTime), "dd/MM - HH:mm") : event.start.date 
            ? format(parseISO(event.start.date), "dd/MM/yyyy") : "Horário não definido",
          end: (event.end.dateTime ? format(event.end.dateTime, "HH:mm") : ""),
          title: event.summary,
          type: (/birthday|anivers[áa]rio/i.test(event.summary)? "birthday": "default")
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
          color: "#6EE7B7",
          type: /birthday|anivers[áa]rio/i.test(event.summary) ? "birthday" : "default"
        }
      });

    const responseBody: CalendarInternalAPIResponse = { 
      todayEvents, 
      importantEvents 
    };

    calendarCache.set("default", responseBody)

    return NextResponse.json({ message: "Calendar data retrieved successfully", data: responseBody } );
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve calendar data" }, { status: 500 });
  }
}