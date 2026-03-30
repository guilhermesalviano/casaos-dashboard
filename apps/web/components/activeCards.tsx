import WeatherCardClient from "./cards/clients/weatherCardClient";
import CalendarCardClient from "./cards/clients/calendarCardClient";
import StocksCardClient from "@/components/cards/clients/stocksCardClient";
import TodoCard from "@/components/cards/todo";
import StatusReporter from "./statusReporter";
import MultiHabitTracker from "./cards/habitsTracker";

const isWeekend = [0, 6].includes(new Date().getDay());

const ALL_CARDS = [
  WeatherCardClient,
  MultiHabitTracker,
  !isWeekend && StocksCardClient,
  TodoCard,
  CalendarCardClient,
].filter(Boolean) as React.ComponentType[];

const autoSuccessStatuses = [
  ...(isWeekend ? ["stocks"] : []),
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