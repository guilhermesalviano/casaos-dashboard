"use client";

import { createContext, useContext, useState } from 'react';

type ServiceStatus = "loading" | "success" | "error";

const StatusContext = createContext({
  reportStatus: (name: string, status: ServiceStatus) => {},
  isAllLive: false,
  anyLoading: true
});

export const StatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [systems, setSystems] = useState<Record<string, ServiceStatus>>({
    news: "loading",
    weather: "loading",
    stocks: "loading",
    calendar: "loading"
  });

  const reportStatus = (name: string, status: ServiceStatus) => {
    setSystems(prev => ({ ...prev, [name]: status }));
  };

  const isAllLive = Object.values(systems).every(v => v === "success");

  const anyLoading = Object.values(systems).some(v => v === "loading");

  return (
    <StatusContext.Provider value={{ reportStatus, isAllLive, anyLoading }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => useContext(StatusContext);