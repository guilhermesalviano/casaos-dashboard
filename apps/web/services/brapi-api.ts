import { CONFIG } from "@/config/config";
import { BrapiResponse } from "@/types/services";

export async function fetchBrapiAPI(stocks: string): Promise<BrapiResponse> {
  const API_KEY = process.env.BRAPI_TOKEN;

  const response = await fetch(`${CONFIG.BRAPI_BASE_URL}/${stocks}?token=${API_KEY}`, {
    next: { revalidate: CONFIG.UPDATE_INTERVAL_MS }
  });
  const responseJson = await response.json();

  return responseJson;
}