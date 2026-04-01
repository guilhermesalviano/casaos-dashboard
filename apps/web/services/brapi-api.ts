import { APIS, EXTERNAL_SERVICES, UPDATE_INTERVAL_MS } from "@/config/config";
import { BrapiResponse } from "@/types/services";

export async function fetchBrapiAPI(stocks: string): Promise<BrapiResponse> {
  const API_KEY = APIS.brapiToken;

  const response = await fetch(`${EXTERNAL_SERVICES.brapi}/${stocks}?token=${API_KEY}`, {
    next: { revalidate: UPDATE_INTERVAL_MS }
  });
  const responseJson = await response.json();

  return responseJson;
}