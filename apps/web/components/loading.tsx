"use client";

import { useStatus } from "@/contexts/statusContext";

export default function Loading() {
  const { anyLoading } = useStatus();

  if (!anyLoading) return;

  return (
    <div className="fixed flex items-center justify-center w-full h-full min-h-50">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-gray-200" />
        <div className="absolute w-14 h-14 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
      </div>
    </div>
  );
}