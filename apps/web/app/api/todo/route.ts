import { NextRequest, NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db";
import { format } from "date-fns";
import { Like } from "typeorm";
import { Todo } from "@/entities/Todo";
import { TodoRecurrence } from "@/entities/TodoRecurrence";
import { TodoCheck } from "@/entities/TodoCheck";

export async function GET(req: NextRequest) {
  try {
    const today = new Date();

    const db = await getDatabaseConnection();

    const todoRepository = db.getRepository(Todo);

    const todos = await todoRepository.find({
      where: [
        { createdAt: Like(`${format(today, "yyyy-MM-dd")}%`) as any }, 

        { 
          recurrence: { 
            repeat: 1,
            weeklyDays: Like(`%${today.getDay()}%`) as any 
          } 
        }
      ],
      relations: ["recurrence", "check"]
    });

    const todosMapped = todos.map((todo) => {
      return {
        id: todo.id,
        title: todo.title,
        checked: todo.check.checked,
        priority: todo.priority
      }
    })

    return NextResponse.json({ message: "Todos data retrieved successfully", data: todosMapped }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve todos data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, checked, priority, repeat, weeklyInterval, weeklyDays, weeklyEnd } = body;

    const db = await getDatabaseConnection();

    const todoCheck = {
      timestamp: format(new Date(), "yyyy-MM-dd"),
      checked
    }
    const todoCheckRepository = db.getRepository(TodoCheck);
    const todoCheckSaved = await todoCheckRepository.save(todoCheck);

    const todoRecurrence = {
      repeat,
      weeklyInterval,
      weeklyDays,
      weeklyEnd
    }
    const todoRecurrenceRepository = db.getRepository(TodoRecurrence);
    const todoRecurrenceSaved = await todoRecurrenceRepository.save(todoRecurrence);

    const todo = {
      title,
      priority,
      createdAt: format(new Date(), "yyyy-MM-dd"),
      check: todoCheckSaved,
      recurrence: todoRecurrenceSaved
    }

    const todoRepository = db.getRepository(Todo);
    const todoSaved = await todoRepository.save(todo);

    return NextResponse.json({ message: "Todos saved successfully", data: todoSaved }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save todos data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, checked } = body;

    if (!id) {
      return NextResponse.json({ error: "Todo ID is required" }, { status: 400 });
    }

    const db = await getDatabaseConnection();
    const todoRepository = db.getRepository(Todo);
    const todoCheckRepository = db.getRepository(TodoCheck);

    const todo = await todoRepository.findOne({
      where: { id },
      relations: ["check"],
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (todo.check) {
      todo.check.checked = checked;
      todo.check.timestamp = format(new Date(), "yyyy-MM-dd");
      await todoCheckRepository.save(todo.check);
    } else {
      const newCheck = todoCheckRepository.create({
        checked,
        timestamp: format(new Date(), "yyyy-MM-dd"),
      });
      const savedCheck = await todoCheckRepository.save(newCheck);
      todo.check = savedCheck;
      await todoRepository.save(todo);
    }

    return NextResponse.json(
      { message: "Todo updated successfully", data: todo },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}