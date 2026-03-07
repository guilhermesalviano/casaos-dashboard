import Clock from "@/components/clock";
import SystemsStatus from "@/components/systemsStatus";
import WeatherCard from "@/components/cards/weather";
import CalendarCard from "@/components/cards/calendar";
import StocksCard from "@/components/cards/stocks";
import NewsCard from "@/components/cards/news";
import FlightsCard from "@/components/cards/flights";
import TodoCard from "@/components/cards/todo";
import WishlistCard from "@/components/cards/AmazonWishlist";

export default function Dashboard() {
  return (
    <>
      <div className="header">
        <div className="header-brand max-sm:text-2xl">⬡ <span className="max-sm:hidden">My Notion Version</span></div>
        <div className="header-clock"><Clock /></div>
        <div className="header-status">
          <SystemsStatus />
        </div>
      </div>

      <div style={{ columns: "25rem", columnGap: "1rem", margin: "1rem" }}>
        {[WeatherCard, TodoCard, CalendarCard, FlightsCard, NewsCard, StocksCard, WishlistCard].map((C, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: "1rem", marginLeft: "0.5rem", marginRight: "0.5rem" }}>
            <C />
          </div>
        ))}
      </div>
    </>
  );
}