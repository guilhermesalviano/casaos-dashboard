"use client";

import { useCallback, useEffect, useState } from "react";
import { useStatus } from "@/contexts/statusContext";
import { useDayChange } from "@/hooks/useDayChange";
import CalendarCard from "../calendar";

export default function CalendarCardClient() {
  const [calendar, setCalendar] = useState<any>(null);
  const { reportStatus } = useStatus();

  const fetchCalendar = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      setCalendar(data.data);
      reportStatus("calendar", "success");
    } catch {
      reportStatus("calendar", "error");
    }
  }, []);

  useDayChange(() => fetchCalendar());

  useEffect(() => { fetchCalendar(); }, []);

  if (!calendar || calendar.length === 0) return null;

  return <CalendarCard data={calendar} />;
}