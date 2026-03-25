import * as dotenv from "dotenv";
dotenv.config({});

const isDev = process.env.NODE_ENV === "development";

const MOCK_BASE_URL = "http://localhost:1080";

export const CONFIG = {
  OPEN_METEO_BASE_URL: `${isDev ? MOCK_BASE_URL : "https://api.open-meteo.com"}/v1/forecast`,
  NOMINATIM_BASE_URL: "https://nominatim.openstreetmap.org/reverse",
  SERPAPI_BASE_URL: "https://serpapi.com/search",
  BRAPI_BASE_URL: "https://brapi.dev/api/quote",
  MEDIASTACK_BASE_URL: "https://api.mediastack.com/v1/news",
  DEFAULT_TIMEZONE: "America/Sao_Paulo",
  UPDATE_INTERVAL_MS: 1 * 60 * 60, // 1 hour
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL || '',
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY || ''
};