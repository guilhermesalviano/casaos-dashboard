"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NewTaskForm, TodoState } from "@/types/task";
import handleFireConfetti from "@/components/confetti";
import { useStatus } from "@/contexts/statusContext";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { useDayChange } from "@/hooks/useDayChange";
import TodoCard from "../todo";

export default function TodoCardClient() {
  const [todos, setTodos] = useState<TodoState[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(true);
  const { reportStatus } = useStatus();

  const isFirstRender = useRef(true);

  const fetchTodos = useCallback(async () => {
    try {
      console.log("[log]: a new todos fetch.")
      const res = await fetch("/api/todo");
      const data = await res.json();
      setTodos(data.data);
      reportStatus("todo", "success");
    } catch {
      reportStatus("todo", "error");
    } finally {
      setIsBusy(false);
    }
  }, []);

  useDayChange((newDay) => {
    console.log(`Day changed to ${newDay}, fetching todos.`);
    fetchTodos();
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const add = async (form: NewTaskForm) => {
    const newTask = {
      title: form.title.trim(),
      checked: 0,
      priority: form.priority,
    };

    const response = await fetch("/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repeat: form.recurrence.repeat,
        weeklyInterval: form.recurrence.weeklyInterval,
        weeklyDays: form.recurrence.weeklyDays,
        weeklyEnd: form.recurrence.weeklyEnd,
        ...newTask,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setTodos((prev) => [...prev, { id: data.data.id, ...newTask }]);
    } else {
      console.error(`Error ${response.status} creating todo.`);
    }
  };

  const toggleCheck = (id: number, currentStatus: number) => {
    if (isBusy) return;
    setIsBusy(true);

    const newStatus = currentStatus === 0 ? 1 : 0;

    Promise.all([
      new Promise<void>((resolve) => {
        startTransition(() => {
          setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, checked: newStatus } : t))
          );
          resolve();
        });
      }),

      fetchWithTimeout("/api/todo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, checked: newStatus }),
      }),
    ]).catch(() => {
      startTransition(() => {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, checked: currentStatus } : t))
        );
      });
    }).finally(() => setIsBusy(false));
  };

  const { pending, completed, checkedCount } = useMemo(() => {
    const pending: TodoState[] = [];
    const completed: TodoState[] = [];
    for (const t of todos) {
      (t.checked === 0 ? pending : completed).push(t);
    }
    return { pending, completed, checkedCount: completed.length };
  }, [todos]);

  const progress = todos.length > 0
    ? Math.round((checkedCount / todos.length) * 100)
    : 0;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (todos.length > 0 && checkedCount === todos.length) handleFireConfetti();
  }, [checkedCount, todos.length]);

  return (
    <TodoCard modalOpen={modalOpen} setModalOpen={setModalOpen} add={add} toggleCheck={toggleCheck} pending={pending} completed={completed} checkedCount={checkedCount} todos={todos} isBusy={isBusy} progress={progress} />
  );
}