import { NextRequest, NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db";
import { format } from "date-fns";
import { HabitTracker } from "@/entities/HabitTracker";

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabaseConnection();
    const repository = db.getRepository(HabitTracker);

    const records = await repository
      .createQueryBuilder("habit")
      .select("DISTINCT DATE(habit.createdAt)", "date")
      .where("habit.habit = :name", { name: "wakedup" })
      .orderBy("date", "DESC")
      .getRawMany();

    if (records.length === 0) {
      return NextResponse.json({ message: "Habit retrieve successfully", data: { streak: 0 } }, { status: 200 })
    };

    let streak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expectedDate = new Date(today);
    let lastDayOfWeek: Date | null = null;

    for (let i = 0; i < records.length; i++) {
      const recordDate = new Date(records[i].date + "T00:00:00"); 

      if (i === records.length-1) {
        lastDayOfWeek = new Date(records[i].date + "T00:00:00");
      }

      if (i === 0) {
        const diffDays = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 1) return 0;

        expectedDate = recordDate;
        streak++;
        continue;
      }

      expectedDate.setDate(expectedDate.getDate() - 1);

      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    const streakMap = {
      streak,
      lastDayOfWeek
    }

    return NextResponse.json({ message: "Habit retrieve successfully", data: streakMap }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve todos data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { habit } = body;

    const habitToSave = {
      habit,
      createdAt: format(new Date(), "yyyy-MM-dd")
    }

    const db = await getDatabaseConnection();

    const habitTrackerRepository = db.getRepository(HabitTracker);
    const habitTrackerSaved = await habitTrackerRepository.save(habitToSave);

    return NextResponse.json({ message: "Habit saved successfully", data: habitTrackerSaved }, { status: 200 });
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save todos data" }, { status: 500 });
  }
}
