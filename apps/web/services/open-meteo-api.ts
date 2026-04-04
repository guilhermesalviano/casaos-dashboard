import { EXTERNAL_SERVICES, LOCATION } from "@/config/config";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import logger from "@/lib/logger";
import { ErrorResponse, OpenMeteoProps, WeatherResponse } from "@/types/services";
import { toLogError } from "@/utils/to-logger-error";
import { addHours, format } from "date-fns";

export async function fetchOpenMeteoAPI({latitude, longitude, limit = 10}: OpenMeteoProps): Promise<WeatherResponse | ErrorResponse> {
  const now = new Date();
  
  const start = format(now, "yyyy-MM-dd'T'HH:00");
  const end = format(addHours(now, limit), "yyyy-MM-dd'T'HH:00");

  const url = `${EXTERNAL_SERVICES.openMeteo}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&hourly=temperature_2m,weather_code,precipitation_probability,is_day&start_hour=${start}&end_hour=${end}&timezone=${LOCATION.timezone}`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    logger.error("Error fetching Open Meteo API: ", response.status, toLogError(response.text().catch(() => "")));
    const errorMessage = `Open Meteo request failed with status ${response.status}`;
    return { error: errorMessage };
  }

  const responseJson = (await response.json()) as WeatherResponse;
  return responseJson;
}