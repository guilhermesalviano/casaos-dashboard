import { EXTERNAL_APIS_CONFIG } from "@/constants";
import { STOCKS } from "@/constants/stocks";

export interface StockResult {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketDayRange: string;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: string;
  marketCap: number | null;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  fiftyTwoWeekRange: string;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  priceEarnings: number | null;
  earningsPerShare: number | null;
  logourl: string;
}

export interface BrapiResponse {
  results: StockResult[];
  requestedAt: string;
  took: number;
}

export async function fetchBrapiAPI(): Promise<BrapiResponse> {
  const symbols = Object.values(STOCKS).flat().join(',');
  const API_KEY = process.env.BRAPI_TOKEN;

  const response = await fetch(`https://brapi.dev/api/quote/${symbols}?token=${API_KEY}`, {
    next: { revalidate: EXTERNAL_APIS_CONFIG.UPDATE_INTERVAL_MS }
  });
  const responseJson = await response.json();

  return responseJson;
}