import { GOOGLE_API_CONFIG } from '@/constants';
import { google } from 'googleapis';

export interface GoogleCalendarEvent {
  kind: string;
  etag: string;
  id: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  description?: string;
  location?: string;
  creator: {
    email: string;
    self?: boolean;
  };
  organizer: {
    email: string;
    self?: boolean;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurringEventId?: string;
  originalStartTime?: {
    dateTime: string;
    timeZone: string;
  };
  iCalUID: string;
  sequence: number;
  reminders: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
  eventType: string;
}

export type CalendarEventsResponse = GoogleCalendarEvent[];

export async function fetchGoogleCalendarAPI(): Promise<CalendarEventsResponse> {
 const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_API_CONFIG.GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_API_CONFIG.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();

  const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

  const response = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    timeMin: startOfDay,
    timeMax: endOfDay,
    singleEvents: true,
    orderBy: 'startTime',
  });

  if (response.status !== 200){
    throw new Error("Falha ao buscar dados da API externa");
  }

  return response.data.items as CalendarEventsResponse;
}