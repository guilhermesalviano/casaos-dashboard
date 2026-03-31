import Loading from "@/components/loading";
import Clock from "@/components/clock";
import SystemsStatus from "@/components/systemsStatus";
import ThemeToggle from "@/components/themeToggle";
import ActiveCards from "@/components/activeCards";
import TalkToAI from "@/components/talkToAI";
import Logo from "@/components/logo";

export default function Page() {

  return (
    <>
      <Loading />
      <div className="header grid grid-cols-3 items-center w-full py-4! sm:px-14! sticky z-60">
        <div className="header-brand flex gap-2 items-center">
          <Logo />
        </div>

        <div className="header-clock flex justify-center">
          <Clock />
        </div>

        <div className="header-status flex items-center justify-end gap-4">
          <SystemsStatus />
          <TalkToAI />
        </div>
      </div>
      <ActiveCards />
      <ThemeToggle />
    </>
  );
}