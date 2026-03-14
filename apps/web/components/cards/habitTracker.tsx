"use client";

import { useStatus } from "@/contexts/statusContext";
import { format } from "date-fns";
import Image from "next/image";
import { useEffect, useState } from "react";

const HabitTracker = () => {
  const [streak, setStreak] = useState(0);
  const [weekDaysMap, setWeekDaysMap] = useState<Object>();
  const [haveYouWakeUpEarlyToday, setHaveYouWakeUpEarlyToday] = useState(false);
  const { reportStatus } = useStatus();

  const today = new Date();

  const track = async (answer: string) => {
    const habit = { habit: answer };

    await fetch("/api/habit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(habit),
    });

    fetchHabit();
    setHaveYouWakeUpEarlyToday(!!answer);
  }

  const fetchHabit = () => {
    fetch("/api/habit")
      .then((res) => {
        if (!res.ok) throw new Error(`Erro do servidor: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const { streak, lastDayOfWeek } = data.data;

        if (format(today, "yyyy-MM-dd") !== format(lastDayOfWeek, "yyyy-MM-dd")) return;

        setStreak(streak);
        setHaveYouWakeUpEarlyToday(true);

        const DAYS_OF_WEEK = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

        if (lastDayOfWeek) {
          const lastDayOfWeekNumber = new Date(lastDayOfWeek).getDay();

          let weekDaysMapLocal = {};
          let streakCounter = streak;
          for (let i = 6; i >= 0; i--) {
            if (i <= lastDayOfWeekNumber && streakCounter > 0) {
              weekDaysMapLocal = { ...weekDaysMapLocal, [DAYS_OF_WEEK[i]]: true };

              streakCounter--;
              continue;
            }
            weekDaysMapLocal = { ...weekDaysMapLocal, [DAYS_OF_WEEK[i]]: false };
          }
          setWeekDaysMap(weekDaysMapLocal);
        }

        reportStatus("streak", "success");
      })
      .catch(() => {
        reportStatus("streak", "error");
      });
  };

  useEffect(() => {
    fetchHabit();
  }, []);
  
  return (
    <div className="card flex justify-center flex-col items-center">
      {!haveYouWakeUpEarlyToday ? (
        <div className="flex flex-col justify-center items-center gap-4">
          <Image src="/joey-friends.gif" width={200} height={200} alt="joey" />
          <h2 className="text-2xl">Did you wake up early today???</h2>
          <div className="flex gap-8">
            <button onClick={() => {track("wakedup")}} className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white rounded-xs px-4! py-2!">Siiiim!</button>
            <button className="border border-orange-500 hover:bg-orange-500 cursor-pointer hover:text-white rounded-xs px-4! py-2!">Não :(</button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl py-2!">Days waking up early</h2>
          <Image src="/flame.png" width="60" height="60" alt="flame" unoptimized />
          <h2 className="text-4xl">{streak}</h2>
          <p className="text-xl">Day streak</p>
          <div className="week flex gap-4 pt-4!">
            {weekDaysMap && Object.entries(weekDaysMap).reverse().map(([day, value]) => {
              return (
                <span key={day} className="flex flex-col justify-center items-center gap-2">
                  <div className="flex justify-center">
                    {value ? (
                      <div className="flex items-center justify-center bg-orange-500 border border-orange-500 rounded-full w-6 h-6">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path 
                            d="M3 8.5L6 11.5L13 4.5" 
                            stroke="white" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex w-6 h-6 border border-orange-500 rounded-full" />
                    )}
                  </div>
                  {day.slice(0, 3)}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default HabitTracker;