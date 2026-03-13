"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

export type AlertType = {
  title: string;
  hour: number;
  minute: number;
  sound: string;
}

function playAlertSound(sound: string, times: number = 3) {
  const audio = new Audio(sound);
  let playCount = 0;

  audio.onended = () => {
    playCount++;
    if (playCount < times) {
      audio.play().catch(e => console.error("Loop failed:", e));
    }
  };

  audio.play().catch((err) => {
    console.log("Audio play blocked by browser:", err);
  });
}

export default function Alert(alert: AlertType) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const soundTimer = setTimeout(() => { playAlertSound(alert.sound) }, 5000);
    const hideTimer = setTimeout(() => { setIsVisible(false) }, 10000);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="absolute p-4! top-4 right-4 z-50 flex items-center gap-3 bg-orange-500 text-white rounded-lg shadow-2xl border border-orange-400 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="bg-orange-600 p-2 rounded-full">
        <Bell size={18} className="animate-bounce" />
      </div>
      
      <div className="flex flex-col pr-4">
        <span className="font-bold text-sm leading-tight">{alert.title}</span>
        <span className="text-xs opacity-90">{alert.hour}h{alert.minute}</span>
      </div>

      <button 
        onClick={() => setIsVisible(false)}
        className="hover:bg-orange-600 p-1 rounded transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}