import { GOOGLE, LOCATION } from '@/config/config';
import { GmailMessage } from '@/types/gmail';
import { google } from 'googleapis';

function getHeader(headers: { name: string; value: string }[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function normalizeDate(raw: string): string {
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: LOCATION.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date).replace(' ', 'T');
}

export async function fetchGoogleGmailAPI(): Promise<GmailMessage[]> {
  const auth = new google.auth.OAuth2(
    GOOGLE.gmailClientId,
    GOOGLE.gmailClientSecret,
  );

  auth.setCredentials({ refresh_token: GOOGLE.gmailRefreshToken });

  const gmail = google.gmail({ version: 'v1', auth });

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 10,
    labelIds: ['INBOX'],
  });

  const messages = listRes.data.messages ?? [];

  const emails: GmailMessage[] = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });

      const headers = (detail.data.payload?.headers ?? []) as { name: string; value: string }[];
      const labelIds = detail.data.labelIds ?? [];

      return {
        id: detail.data.id!,
        threadId: detail.data.threadId!,
        snippet: detail.data.snippet ?? '',
        from: getHeader(headers, 'From').replace("\u003C", '- ').replace("\u003E", '').trim(),
        subject: getHeader(headers, 'Subject'),
        date: normalizeDate(getHeader(headers, 'Date')),
        isUnread: labelIds.includes('UNREAD'),
      };
    }),
  );

  return emails;
}
