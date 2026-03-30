import Card from "../card";

const RAIN_CODES = new Set([51,53,55,56,57,61,63,65,66,67,80,81,82,85,86,95,96,99]);
const isRaining = (code: number) => RAIN_CODES.has(code);

export default function WeatherCard({ data }: { data: any }) {
  const raining = isRaining(data.code);

  return (
    <Card className={raining ? "weather-card--raining" : "weather-card"}>
      <div className="weather-main">
        <div>
          <div className="weather-city">{data.city}</div>
          <div className="weather-temp">{data.temp}°</div>
          <div className="weather-condition">{data.condition}</div>
          <div className="weather-feels">Sensação {data.feels}°C</div>
        </div>
        <div className="weather-icon-big">{data.icon}</div>
      </div>
      <div className="weather-hours">
        {data.forecast.map((h: any) => (
          <div key={h.time} className={`weather-hour ${isRaining(h.code) ? "weather-hour--raining" : ""}`}>
            <span className="weather-hour-time">{h.time}</span>
            <span>{h.icon}</span>
            <span className="weather-hour-temp">{h.temp}°</span>
          </div>
        ))}
      </div>
    </Card>
  );
}