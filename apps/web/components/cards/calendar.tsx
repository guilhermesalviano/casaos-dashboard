"use client";

import { useEffect, useState } from "react";
import SectionTitle from "../sectionTitle";
import Card from "../card";
import { useStatus } from "@/contexts/statusContext";

export default function CalendarCard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const [calendar, setCalendar] = useState<any>(null);
  const { reportStatus } = useStatus();

  useEffect(() => {
    fetch("/api/calendar")
      .then((res) => res.json())
      .then((data) => {
        setCalendar(data.data);
        reportStatus("calendar", "success");
      }).catch(() => {
        reportStatus("calendar", "error");
      });
  }, []);

  return (
    <Card>
      <SectionTitle>📅 Calendário</SectionTitle>
      <div className="calendar-date">{dateStr}</div>
      <div className="calendar-events">
        {(calendar?.length === 0 || !calendar) && (
          <div className="calendar-event" style={{ borderLeft: `3px solid #9CA3AF` }}>
            <span className="event-title">Nenhum evento para hoje</span>
          </div>
        )}
        {calendar?.map((ev: any) => (
          <div key={ev.id} className="calendar-event" style={{ borderLeft: `3px solid ${ev.color}` }}>
            <span className="event-title">Personal:</span>
            <span className="event-time">{ev.start} -</span>
            <span className="event-time">{ev.end}</span>
            <span className="event-title">{ev.title}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}