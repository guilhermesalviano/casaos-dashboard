import * as dotenv from "dotenv";
dotenv.config();

const isDev = process.env.NODE_ENV === "development";
const MOCK_BASE_URL = "http://localhost:1080";

function api(prod: string, path: string): string {
  return `${isDev ? MOCK_BASE_URL : prod}${path}`;
}

function required(key: string): string {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return process.env[key] ?? "";
  }
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const CONFIG = {
  env: process.env.NODE_ENV as "development" | "production" | "test",

  urls: {
    openMeteo:   api("https://api.open-meteo.com",           "/v1/forecast"),
    nominatim:   api("https://nominatim.openstreetmap.org",  "/reverse"),
    serpApi:     api("https://serpapi.com",                  "/search"),
    brapi:       api("https://brapi.dev",                    "/api/quote"),
    mediastack:  "https://api.mediastack.com/v1/news",
  },

  location: {
    latitude:  optional("LATITUDE",  "-23.533773"),
    longitude: optional("LONGITUDE", "-46.625290"),
    timezone:  "America/Sao_Paulo",
  },

  updateIntervalMs: 1 * 60 * 60 * 1000, // 1 hour in ms

  db: {
    host:     required("DB_HOST"),
    port:     Number(optional("DB_PORT", "3306")),
    name:     required("DB_NAME"),
    username: required("DB_USER"),
    password: required("DB_PASSWORD"),
  },

  google: {
    clientEmail:  required("GOOGLE_CLIENT_EMAIL"),
    privateKey:   required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    calendarIds:  optional("GOOGLE_CALENDAR_IDS").split(";").filter(Boolean),
  },

  apis: {
    brapiToken:  required("BRAPI_TOKEN"),
    serpApiKey:  required("SERPAPI_KEY"),
    newsApiKey:  required("NEWS_API_KEY"),
  },
} as const;

export type AppConfig = typeof CONFIG;