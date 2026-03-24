"use client";

import { useStatus } from "@/contexts/statusContext";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday 
} from "date-fns";
import { useCallback, useEffect, useState } from "react";
import Card from "../card";
import { useDayChange } from "@/hooks/useDayChange";

const HABITS = [
  { id: "wakedup", label: "Wake up early", icon: "🐓" },
  { id: "gym", label: "Exercise", icon: "💪" },
];

const MultiHabitTracker = () => {
  const [view, setView] = useState<"day" | "month">("day");
  const [completedDates, setCompletedDates] = useState<Record<string, string[]>>({});
  const today = new Date();
  const { reportStatus } = useStatus();

  const todayStr = format(today, "yyyy-MM-dd");

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      const data = await res.json();
      setCompletedDates(data.completions || {});
      reportStatus("habit", "success");
    } catch (error) {
      reportStatus("habit", "error");
    }
  }, []);

  useDayChange((newDay) => {
    console.log(`Day changed to ${newDay}, fetching habits.`);
    fetchHabits();
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const toggleHabit = async (habitId: string) => {
    const currentDayCompletions = completedDates[todayStr] || [];
    const isCompleted = currentDayCompletions.includes(habitId);

    const newCompletions = isCompleted
      ? currentDayCompletions.filter(id => id !== habitId)
      : [...currentDayCompletions, habitId];

    setCompletedDates({ ...completedDates, [todayStr]: newCompletions });

    await fetch("/api/habits", {
      method: "POST",
      body: JSON.stringify({ habit: habitId, createdAt: todayStr }),
    });
  };

  const monthDays = monthGrid(today);

  function monthGrid(date: Date) {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  }

  return (
    <Card className="w-full max-w-md p-6!">
      <div className="flex justify-between items-center mb-6!">
        <h2 className="text-xl font-bold">Habit Tracker - {format(today, 'MMMM')}</h2>
        <div className="flex bg-gray-100 rounded-lg p-1!">
          <button 
            onClick={() => setView("day")}
            className={`px-3! py-1! text-sm rounded-md transition ${view === "day" ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            Day
          </button>
          <button 
            onClick={() => setView("month")}
            className={`px-3! py-1! text-sm rounded-md transition ${view === "month" ? "bg-white shadow-sm" : "text-gray-500"}`}
          >
            Month
          </button>
        </div>
      </div>

      {view === "day" ? (
        <div className="space-y-4!">
          {HABITS.map((habit) => {
            const isDone = completedDates[todayStr]?.includes(habit.id);
            return (
              <div 
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`flex items-center justify-between p-4! rounded-xl border-2 cursor-pointer transition-all ${
                  isDone ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <span className={`font-medium ${isDone ? "text-orange-900" : "text-gray-700"}`}>
                    {habit.label}
                  </span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isDone ? "bg-orange-500 border-orange-500" : "border-gray-300"
                }`}>
                  {isDone && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5L6 11.5L13 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6!">
          {HABITS.map(habit => (
            <div key={habit.id}>
              <p className="text-sm font-semibold mb-2! text-gray-600">{habit.label}</p>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map(day => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const isDone = completedDates[dateKey]?.includes(habit.id);
                  return (
                    <div 
                      key={dateKey}
                      title={dateKey}
                      // aspect-square 
                      className={`rounded-sm text-[10px] flex items-center justify-center ${
                        isDone ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                      } ${isToday(day) ? "ring-2 ring-orange-300" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MultiHabitTracker;