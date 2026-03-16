
export interface ForecastItem {
  timestamp: string;
  time: string;
  temp: number;
  icon: string;
}

export interface WeatherInternalAPIResponse {
  date: string;
  city: string;
  state: string;
  temp: number;
  feels: number;
  condition: string;
  icon: string;
  code: number;
  forecast: ForecastItem[];
}