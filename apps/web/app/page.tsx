import { DASHBOARD_CARDS } from "@/components/cards/cards";
import Clock from "@/components/clock";
import SystemsStatus from "@/components/systemsStatus";
import ThemeToggle from "@/components/themeToggle";

export default function Dashboard() {
  return (
    <>
      <div className="header">
        <div className="header-brand max-sm:text-2xl">⬡ <span className="max-sm:hidden">My Notion Version</span></div>
        <div className="header-clock"><Clock /></div>
        <div className="header-status gap-4">
          <SystemsStatus />
          <ThemeToggle />
        </div>
      </div>

      <div className="gap-4 m-4!" style={{ columns: "25rem" }}>
        {DASHBOARD_CARDS.map((C, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: "1rem" }}>
            <C />
          </div>
        ))}
      </div>
    </>
  );
}