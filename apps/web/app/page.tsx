import Loading from "@/components/loading";
import Clock from "@/components/clock";
import SystemsStatus from "@/components/systemsStatus";
import ThemeToggle from "@/components/themeToggle";
import ActiveCards from "@/components/activeCards";
import PushButton from "@/components/pushButton";

export default function Page() {
  return (
    <>
      <Loading />
      <div>
        <div className="header">
          <div className="header-brand max-sm:text-2xl">⬡ <span className="max-sm:hidden">My Notion Version</span></div>
          <div className="header-clock"><Clock /></div>
          <div className="header-status gap-4">
            <SystemsStatus />
            <ThemeToggle />
            <PushButton />
          </div>
        </div>
        <ActiveCards />
      </div>
    </>
  );
}