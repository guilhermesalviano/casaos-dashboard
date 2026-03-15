"use client";

import { useEffect } from "react";
import { useStatus } from "@/contexts/statusContext";
import { DASHBOARD_CARDS } from "@/components/cards/cards";
import Loading from "@/components/loading";
import StocksCard from "@/components/cards/stocks";
import Clock from "@/components/clock";
import SystemsStatus from "@/components/systemsStatus";
import ThemeToggle from "@/components/themeToggle";

export default function Dashboard() {
  const { anyLoading, reportStatus } = useStatus();

  const today = new Date().getDay();
  const isWeekend = today === 0 || today === 6;

  useEffect(() => {
    if (isWeekend) {
      reportStatus("stocks", "success");
    }
  }, [isWeekend]);

  const activeCards = DASHBOARD_CARDS.filter(Card => {
    if (isWeekend && Card === StocksCard) return false;
    return true;
  });

  return (
    <>
      <Loading />
      <div className={anyLoading ? "hidden" : ""}>
        <div className="header">
          <div className="header-brand max-sm:text-2xl">⬡ <span className="max-sm:hidden">My Notion Version</span></div>
          <div className="header-clock"><Clock /></div>
          <div className="header-status gap-4">
            <SystemsStatus />
            <ThemeToggle />
          </div>
        </div>
        <div className="gap-4 m-4!" style={{ columns: "25rem" }}>
          {activeCards.map((C, i) => (
            <div key={i} style={{ breakInside: "avoid", marginBottom: "1rem" }}>
              <C />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}