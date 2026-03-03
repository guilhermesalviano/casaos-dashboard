import { Weather } from "@/entities/Weather";
import { WeatherHour } from "@/entities/WeatherHour";
import { getDatabaseConnection } from "@/lib/db";
import { fetchNominatimAPI } from "@/services/nominatim-api";
import { fetchOpenMeteoAPI } from "@/services/open-meteo-api";
import { NextRequest, NextResponse } from "next/server";
import { LOCATION } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    const latitude = LOCATION.LATITUDE;
    const longitude = LOCATION.LONGITUDE;

    const weather = await fetchOpenMeteoAPI({ latitude, longitude });

    const hours: any[] = weather.hourly.time.slice(0, 6).map((t: string, index: number) => {
      return {
        timestamp: t,
        time: new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit" }) + "h",
        temp: Math.round(weather.hourly.temperature_2m[index]),
        icon: getWeatherIcon(weather.hourly.weather_code[index])
      };
    });

    // const db = await getDatabaseConnection();
    // const weatherHourRepository = db.getRepository(WeatherHour);
    // await weatherHourRepository.save(hours);

    const location = await fetchNominatimAPI({ latitude, longitude });

    const weatherData =  {
      date: weather.current.time.split("T")[0],
      city: location.address.city,
      state: location.address.state,
      temp: Math.round(weather.current.temperature_2m),
      feels: Math.round(weather.current.apparent_temperature),
      condition: getWeatherCondition(weather.current.weather_code),
      icon: getWeatherIcon(weather.current.weather_code),
      forecast: hours
    };

    // const weatherRepository = db.getRepository(Weather);
    // const result = await weatherRepository.save(weatherData);

    return NextResponse.json({ message: "Weather data retrieved successfully", data: weatherData }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve weather data" }, { status: 500 });
  }
}

function getWeatherIcon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 3) return "☁️";
  if (code >= 45) return "🌧️";
  return "🌤️";
}

function getWeatherCondition(code: number) {
  if (code === 0) return "Céu Limpo";
  if (code <= 3) return "Parcialmente Nublado";
  return "Chuva/Neblina";
}