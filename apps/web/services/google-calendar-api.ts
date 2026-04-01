import { GOOGLE } from '@/config/config';
import { CalendarEventsResponse } from '@/types/services';
import { addDays } from 'date-fns';
import { google } from 'googleapis';

export async function fetchGoogleCalendarAPI(): Promise<CalendarEventsResponse> {
 const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE.clientEmail,
      private_key: GOOGLE.privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();

  const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(addDays(now, 7)).toISOString();

  const calendarsIds = GOOGLE.calendarIds;

  if (!calendarsIds) throw new Error("Env 'GOOGLE_CALENDAR_IDS' not defined.");

  let allEvents: CalendarEventsResponse = [];

  for (const calendarId of calendarsIds) {
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startOfDay,
      timeMax: endOfDay,
      singleEvents: true,
      orderBy: 'startTime',
    });

    if (response.status !== 200){
      throw new Error(`Error searching Google Calendar API for ID: ${calendarId}`);
    }

    const fetchedItems = (response.data.items as CalendarEventsResponse) || [];

    allEvents.push(...fetchedItems);
  }

  return allEvents;
}