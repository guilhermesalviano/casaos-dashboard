import WeatherCard from "@/components/cards/weather";
import CalendarCard from "@/components/cards/calendar";
import StocksCard from "@/components/cards/stocks";
import NewsCard from "@/components/cards/news";
import FlightsCard from "@/components/cards/flights";
import TodoCard from "@/components/cards/todo";
import HabitTracker from "@/components/cards/habitTracker";
import StatusReporter from "./statusReporter";

const today = new Date().getDay();
const isWeekend = today === 0 || today === 6;
const isFlightsUpdated = today === 2 || today === 6;

const ALL_CARDS = [
  WeatherCard,
  NewsCard,
  !isFlightsUpdated ? null : FlightsCard,
  !isWeekend ? StocksCard : null,
  HabitTracker,
  TodoCard,
  CalendarCard,
].filter(Boolean) as React.ComponentType[];

const autoSuccessStatuses = [
  ...(isWeekend ? ["stocks"] : []),
  ...(!isFlightsUpdated ? ["flights"] : []),
];

export default function ActiveCards() {
  return (
    <>
      {autoSuccessStatuses.length > 0 && (
        <StatusReporter statuses={autoSuccessStatuses} />
      )}

      <div className="gap-4 m-4!" style={{ columns: "25rem" }}>
        {ALL_CARDS.map((Card, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: "1rem" }}>
            <Card />
          </div>
        ))}
      </div>
    </>
  );
}