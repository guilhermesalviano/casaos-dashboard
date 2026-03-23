"use client";

import { useEffect, useState } from "react";
import { useStatus } from "@/contexts/statusContext";
import Card from "../card";

const RAIN_CODES = new Set([51,53,55,56,57,61,63,65,66,67,80,81,82,85,86,95,96,99]);

function isRaining(code: number) {
  return RAIN_CODES.has(code);
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<any>();
  const { reportStatus } = useStatus();

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => {
        if (!res.ok) throw new Error(`Erro do servidor: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setWeather(data.data);
        reportStatus("weather", "success");
      })
      .catch(() => {
        setWeather({error: "failed"})
        reportStatus("weather", "error");
      });
  }, []);

  if (!weather) {
    return <Card className="weather-card">Carregando clima...</Card>;
  }

  if (weather.error) {
    return <Card className="weather-card">Erro na busca de dados, tente novamente.</Card>;
  }

  const raining = isRaining(weather.code);

  return (
    <Card className={`${raining ? "weather-card--raining" : "weather-card"}`}>
      <div className="weather-main">
        <div>
          <div className="weather-city">{weather.city}</div>
          <div className="weather-temp">{weather.temp}°</div>
          <div className="weather-condition">{weather.condition}</div>
          <div className="weather-feels">Sensação {weather.feels}°C</div>
        </div>
        <div className="weather-icon-big">{weather.icon}</div>
      </div>
      <div className="weather-hours">
        {weather.forecast?.map((h: any) => (
          <div key={h.time} className={`weather-hour ${isRaining(h.code) ? "weather-hour--raining" : ""}`}>
            <span className="weather-hour-time">{h.time}</span>
            <span>{h.icon}</span>
            <span className="weather-hour-temp">{h.temp}°</span>
          </div>
        ))}
      </div>
    </Card>
  )
}