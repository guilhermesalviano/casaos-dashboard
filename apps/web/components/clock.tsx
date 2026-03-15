"use client";

import { useEffect, useState } from "react";
import Alert, { AlertType } from "@/components/alert";
import { ALERTS } from "@/constants";

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [isPlayingAlert, setIsPlayingAlert] = useState(false);
  const [alertToPlay, setAlertToPlay] = useState<AlertType>();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const timeStr = time.toLocaleTimeString("pt-BR", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit" 
  });

  useEffect(() => {
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();

    if (s !== 0) return;

    ALERTS.forEach((alert) => {
      if (alert.hour === h && alert.minute === m && !isPlayingAlert) {
        setIsPlayingAlert(!isPlayingAlert);
        setAlertToPlay(alert)
      }
    });
  }, [time]);

  return (
    <>
      {isPlayingAlert && alertToPlay && (
        <Alert {...alertToPlay} />
      )}
      {(!mounted) ? "loading" : timeStr}
    </>
  )
}