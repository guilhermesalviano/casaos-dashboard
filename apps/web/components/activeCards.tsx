"use client";

import { useEffect } from "react";
import { useStatus } from "@/contexts/statusContext";
import WeatherCard from "@/components/cards/weather";
import CalendarCard from "@/components/cards/calendar";
import StocksCard from "@/components/cards/stocks";
import NewsCard from "@/components/cards/news";
import FlightsCard from "@/components/cards/flights";
import TodoCard from "@/components/cards/todo";
import WishlistCard from "@/components/cards/amazonWishlist";
import HabitTracker from "@/components/cards/habitTracker";

const DASHBOARD_CARDS = [
  WeatherCard,
  NewsCard,
  FlightsCard,
  StocksCard,
  HabitTracker,
  TodoCard,
  CalendarCard,
  WishlistCard,
] as const;

export default function ActiveCards() {
  const { reportStatus } = useStatus();
  
  const today = new Date().getDay();
  const isWeekend = today === 0 || today === 6;
  const isFlightsUpdated = today === 2 || today === 6;

  useEffect(() => {
    if (isWeekend) reportStatus("stocks", "success");
    if (!isFlightsUpdated) { reportStatus("flights", "success"); };
  }, [isWeekend, isFlightsUpdated]);

  const activeCards = DASHBOARD_CARDS.filter(Card => {
    if (isWeekend && Card === StocksCard) return false;
    if (!isFlightsUpdated && Card === FlightsCard) return false;
    return true;
  });

  return (
    <div className="gap-4 m-4!" style={{ columns: "25rem" }}>
      {activeCards.map((Card, i) => (
        <div key={i} style={{ breakInside: "avoid", marginBottom: "1rem" }}>
          <Card />
        </div>
      ))}
    </div>
  );
}
