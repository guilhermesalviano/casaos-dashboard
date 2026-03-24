"use client";

import { useCallback, useEffect, useState } from "react";
import { useStatus } from "@/contexts/statusContext";
import { differenceInDays, parse, startOfDay } from "date-fns";
import Card from "../card";
import { useDayChange } from "@/hooks/useDayChange";

const EVENT_MAPPING: Record<string, { emoji: string; bg:string; color: string;}> = {
  birthday: { emoji: "🎂", bg: "bg-cyan-50", color: "text-cyan-700" },
  travel: { emoji: "✈️", bg: "bg-orange-50", color: "text-orange-700" },
  default: { emoji: "🚩", bg: "bg-slate-50", color: "text-slate-600" }
};

export default function CalendarCard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const [calendar, setCalendar] = useState<any>(null);
  const { reportStatus } = useStatus();

  const fetchCalendar = useCallback(async () => {
    try {
      console.log("[log]: a new calendar fetch.")
      const res = await fetch("/api/calendar");
      const data = await res.json();
      setCalendar(data.data);
      reportStatus("calendar", "success");
    } catch {
      reportStatus("calendar", "error");
    } 
  }, []);

  useDayChange((newDay) => {
    console.log(`Day changed to ${newDay}, fetching calendar.`);
    fetchCalendar();
  });

  useEffect(() => {
    fetchCalendar();
  }, []);

  const generateNextEventMessage = (date: string, title: string) => {
    const eventDate = parse(date, "dd/MM/yyyy", new Date());

    if (isNaN(eventDate.getTime())) return `Próximo evento: ${title} em ${date}`;

    const today = startOfDay(new Date());
    const days = differenceInDays(startOfDay(eventDate), today);

    if (days === 0) return `Hoje é o ${title}!`;
    if (days < 0) return `${title} já passou`;
    
    return `Faltam ${days} ${days === 1 ? 'dia' : 'dias'} para o ${title}`;
  }

  if (calendar?.length === 0 || !calendar) return;

  return (
    <Card>
      <h2 className="section-title mb-0!">📅 Calendário</h2>
      {calendar?.importantEvents.map((ev: any) => (
        <div key={ev.id} className={`flex items-center gap-2 text-[0.7rem] my-2! px-2! py-1! rounded-md font-medium animate-appear ${EVENT_MAPPING[ev.type].bg} ${EVENT_MAPPING[ev.type].color}`}>
          <span className={`${ev.type === "birthday" ? "animate-bounce" : ""}`}>
            { EVENT_MAPPING[ev.type].emoji }
          </span>
          <span>
            { generateNextEventMessage(ev.start, ev.title) }
          </span>
        </div>
      ))}
      <div className="calendar-date">{dateStr}</div>
      <div className="calendar-events">
        {(calendar?.todayEvents.length === 0 || !calendar) && (
          <div className="calendar-event" style={{ borderLeft: `3px solid #9CA3AF` }}>
            <span className="event-title">Nenhum evento para hoje</span>
          </div>
        )}
        {calendar?.todayEvents.map((ev: any) => (
          <div key={ev.id} className="calendar-event max-sm:flex-col max-sm:gap-2!" style={{ borderLeft: `3px solid ${ev.color}` }}>
            <div className="flex items-center gap-2">
              <span className="event-title">Personal:</span>
              <span className="event-time">{ev.start}</span>
              <span className="">-</span>
              <span className="event-time">{ev.end}</span>
            </div>
            <span className="event-title">{ev.title}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}