import WeatherCardClient from "./cards/clients/weatherCardClient";
import CalendarCardClient from "./cards/clients/calendarCardClient";
import StocksCardClient from "@/components/cards/clients/stocksCardClient";
import StatusReporter from "./statusReporter";
import HabitsCardClient from "./cards/clients/habitsCardClient";
import TodoCardClient from "./cards/clients/todoCardClient";

const isWeekend = [0, 6].includes(new Date().getDay());

const ALL_CARDS = [
  WeatherCardClient,
  HabitsCardClient,
  !isWeekend && StocksCardClient,
  TodoCardClient,
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