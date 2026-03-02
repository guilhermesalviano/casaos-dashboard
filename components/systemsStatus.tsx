"use client";

import { useStatus } from "@/contexts/statusContext";

export default function SystemsStatus() {
  const { isAllLive, anyLoading } = useStatus();

  if (anyLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <span className="status-dot" style={{ background: "#9CA3AF" }} />
        <span className="text-gray-400 text-sm">checking systems...</span>
      </div>
    );
  }

  const statusColor = isAllLive ? "#6EE7B7" : "#F87171";
  const statusText = isAllLive ? "all systems live" : "systems partially down";

  return (
    <div className="flex items-center gap-2">
      <span className="status-dot" style={{ background: statusColor }} />
      <span className="text-sm font-medium">{statusText}</span>
    </div>
  );
}