import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleCalendarAPI } from "@/services/google-calendar-api";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const events = await fetchGoogleCalendarAPI();

    const calendar = events.map((event) => {
      return {
        id: event.id,
        start: format(event.start.dateTime, "HH:mm"),
        end: format(event.end.dateTime, "HH:mm"),
        title: event.summary,
        color: "#6EE7B7" // personal calendar color
      }
    });

    return NextResponse.json({ message: "Calendar data retrieved successfully", data: calendar }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve calendar data" }, { status: 500 });
  }
}