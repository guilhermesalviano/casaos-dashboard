import { fetchOpenMeteoAPI } from "@/services/open-meteo-api";
import { NextRequest, NextResponse } from "next/server";
import { LOCATION } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    const latitude = LOCATION.LATITUDE;
    const longitude = LOCATION.LONGITUDE;

    const weather = await fetchOpenMeteoAPI({ latitude, longitude });

    const hours: any[] = weather.hourly.time.slice(1, 8).map((t: string, index: number) => {
      return {
        timestamp: t,
        time: new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit" }) + "h",
        temp: Math.round(weather.hourly.temperature_2m[index]),
        icon: getWeatherIcon(weather.hourly.weather_code[index], weather.hourly.is_day[index] === 1),
      };
    });

    // const location = await fetchNominatimAPI({ latitude, longitude });

    const weatherData =  {
      date: weather.current.time.split("T")[0],
      city: "Anápolis",
      state: "Goiás",
      temp: Math.round(weather.current.temperature_2m),
      feels: Math.round(weather.current.apparent_temperature),
      condition: getWeatherCondition(weather.current.weather_code),
      icon: getWeatherIcon(weather.current.weather_code, weather.hourly.is_day[0] === 1),
      code: weather.current.weather_code,
      forecast: hours
    };

    return NextResponse.json({ message: "Weather data retrieved successfully", data: weatherData }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve weather data" }, { status: 500 });
  }
}

function getWeatherIcon(code: number, isDay: boolean = true): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code === 1) return isDay ? "🌤️" : "🌙";
  if (code === 2) return isDay ? "⛅" : "☁️";
  if (code === 3) return "☁️";
  if (code === 45) return "🌫️";
  if (code === 48) return "🌫️";
  if (code === 51) return isDay ? "🌦️" : "🌧️";
  if (code === 53) return isDay ? "🌦️" : "🌧️";
  if (code === 55) return "🌧️";
  if (code === 56) return "🌨️";
  if (code === 57) return "🌨️";
  if (code === 61) return "🌧️";
  if (code === 63) return "🌧️";
  if (code === 65) return "🌧️";
  if (code === 66) return "🌨️";
  if (code === 67) return "🌨️";
  if (code === 71) return "❄️";
  if (code === 73) return "❄️";
  if (code === 75) return "❄️";
  if (code === 77) return "🌨️";
  if (code === 80) return isDay ? "🌦️" : "🌧️";
  if (code === 81) return "🌧️";
  if (code === 82) return "⛈️";
  if (code === 85) return "🌨️";
  if (code === 86) return "🌨️";
  if (code === 95) return "⛈️";
  if (code === 96) return "⛈️";
  if (code === 99) return "⛈️";
  return "🌡️";
}

function getWeatherCondition(code: number): string {
  if (code === 0) return "Céu Limpo";
  if (code === 1) return "Predominantemente Limpo";
  if (code === 2) return "Parcialmente Nublado";
  if (code === 3) return "Nublado";
  if (code === 45) return "Neblina";
  if (code === 48) return "Neblina com Gelo";
  if (code === 51) return "Garoa Leve";
  if (code === 53) return "Garoa Moderada";
  if (code === 55) return "Garoa Intensa";
  if (code === 56) return "Garoa Gelada Leve";
  if (code === 57) return "Garoa Gelada Intensa";
  if (code === 61) return "Chuva Fraca";
  if (code === 63) return "Chuva Moderada";
  if (code === 65) return "Chuva Forte";
  if (code === 66) return "Chuva Gelada Leve";
  if (code === 67) return "Chuva Gelada Forte";
  if (code === 71) return "Neve Fraca";
  if (code === 73) return "Neve Moderada";
  if (code === 75) return "Neve Forte";
  if (code === 77) return "Grãos de Neve";
  if (code === 80) return "Pancadas de Chuva Fracas";
  if (code === 81) return "Pancadas de Chuva Moderadas";
  if (code === 82) return "Pancadas de Chuva Fortes";
  if (code === 85) return "Pancadas de Neve Fracas";
  if (code === 86) return "Pancadas de Neve Fortes";
  if (code === 95) return "Tempestade";
  if (code === 96) return "Tempestade com Granizo";
  if (code === 99) return "Tempestade com Granizo Forte";
  return "Condição Desconhecida";
}