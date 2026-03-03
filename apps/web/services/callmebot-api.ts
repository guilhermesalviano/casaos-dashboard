import { EXTERNAL_APIS_CONFIG } from "@/constants";

interface CallmebotAPIProps {
  text: string;
}

interface MessageViaCallmebotResponse {
  success: boolean;
  message: string;
}

export async function sendMessageViaCallmebotAPI({ text }: CallmebotAPIProps): Promise<MessageViaCallmebotResponse> {
  const API_KEY = process.env.CALLMEBOT_API_KEY;
  const WHATSAPP_NUMBER = process.env.CALLMEBOT_WHATSAPP_NUMBER;

  const response = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}&apikey=${API_KEY}`, {
    method: "POST",
    next: { revalidate: EXTERNAL_APIS_CONFIG.UPDATE_INTERVAL_MS }
  });

  const responseJson = await response.json();

  return responseJson;
}

