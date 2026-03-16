import { fetchOpenMeteoAPI } from "@/services/open-meteo-api";
import { NextRequest, NextResponse } from "next/server";
import { LOCATION } from "@/constants";
import { getWeatherCondition, getWeatherIcon } from "@/utils/weather";
import { withRetry } from "@/utils/retry";

export async function GET(req: NextRequest) {
  try {
    const weather = await withRetry(() =>
      fetchOpenMeteoAPI({
        latitude: LOCATION.LATITUDE,
        longitude: LOCATION.LONGITUDE,
      })
    );

    const actualHour = Number(weather.hourly.time[0].match(/T(\d{2})/)?.[1]);
    const sliceEnd = actualHour >= 16 ? 7 : 8;

    const hours = weather.hourly.time
      .slice(1, sliceEnd)
      .map((t: string, index: number) => ({
        timestamp: t,
        time: new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit" }) + "h",
        temp: Math.round(weather.hourly.temperature_2m[index]),
        icon: getWeatherIcon(
          weather.hourly.weather_code[index],
          weather.hourly.is_day[index] === 1
        ),
      }));

    const isDay = weather.hourly.is_day[0] === 1;

    const weatherData = {
      date: weather.current.time.split("T")[0],
      city: "Anápolis",
      state: "Goiás",
      temp: Math.round(weather.current.temperature_2m),
      feels: Math.round(weather.current.apparent_temperature),
      condition: getWeatherCondition(weather.current.weather_code),
      icon: getWeatherIcon(weather.current.weather_code, isDay),
      code: weather.current.weather_code,
      forecast: hours,
    };

    return NextResponse.json({ message: "Weather data retrieved successfully", data: weatherData }, { status: 200 })
  } catch (error: unknown) {
    console.error("All retry attempts failed:", error);

    const isNetworkError =
      error instanceof TypeError && error.message.includes("fetch");

    return NextResponse.json(
      {
        error: "Failed to retrieve weather data",
        reason: isNetworkError ? "Network error" : "External API error",
      },
      { status: 503 }
    );
  }
}