export const EXTERNAL_APIS_CONFIG = {
  OPEN_METEO_BASE_URL: "https://api.open-meteo.com/v1/forecast",
  NOMINATIM_BASE_URL: "https://nominatim.openstreetmap.org",
  MEDIASTACK_BASE_URL: "https://api.mediastack.com/v1/news",
  DEFAULT_TIMEZONE: "America/Sao_Paulo",
  UPDATE_INTERVAL_MS: 1 * 60 * 60, // 1 hour
};

export const GOOGLE_API_CONFIG = {
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL || '',
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY || ''
}