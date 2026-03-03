"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());
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

  return (
    <>
      {(!mounted) ? "loading" : timeStr}
    </>
  )
}