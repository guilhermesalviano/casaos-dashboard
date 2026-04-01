import { EXTERNAL_SERVICES, LOCATION } from "@/config/config";
import { OpenMeteoProps, WeatherResponse } from "@/types/services";
import { addHours, format } from "date-fns";

export async function fetchOpenMeteoAPI({latitude, longitude, limit = 10}: OpenMeteoProps): Promise<WeatherResponse> {
  const now = new Date();

  const start = format(now, "yyyy-MM-dd'T'HH:00");
  const end = format(addHours(now, limit), "yyyy-MM-dd'T'HH:00");

  const response = await fetch(`${EXTERNAL_SERVICES.openMeteo}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&hourly=temperature_2m,weather_code,precipitation_probability,is_day&start_hour=${start}&end_hour=${end}&timezone=${LOCATION.timezone}`, {
    next: { revalidate: 1 * 60 * 60 },
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar dados da API externa 'Open Meteo'");
  }

  const responseJson = await response.json();

  return responseJson;
}