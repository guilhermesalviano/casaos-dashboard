"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NewTaskForm, TodoState } from "@/types/task";
import handleFireConfetti from "@/components/confetti";
import Card from "@/components/card";
import Image from "next/image";
import TaskModal from "./taskModal";
import TodoItem from "./todoItem";

export default function TodoCard() {
  const [todos, setTodos] = useState<TodoState[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(true);
  // const [showJewel, setShowJewel] = useState(false);

  const isFirstRender = useRef(true);
  const jewelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/todo")
      .then((res) => {
        setIsBusy(false);
        return res.json();
      })
      .then((data) => setTodos(data.data));
  }, []);

  useEffect(() => () => { if (jewelTimer.current) clearTimeout(jewelTimer.current); }, []);

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

  const toggleCheck = async (id: number, currentStatus: number) => {
    if (isBusy) return;
    setIsBusy(true);

    const newStatus = currentStatus === 0 ? 1 : 0;

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: newStatus } : t))
    );

    // if (newStatus === 1) {
    //   setShowJewel(true);
    //   if (jewelTimer.current) clearTimeout(jewelTimer.current);
    //   jewelTimer.current = setTimeout(() => setShowJewel(false), 2000);
    // }

    await fetch("/api/todo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked: newStatus }),
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
    <>
      {modalOpen && (
        <TaskModal onClose={() => setModalOpen(false)} onAdd={add} />
      )}

      {/* {showJewel && (
        <div className="fixed left-4 top-4 z-70">
          <Image
            src="/lets-go.gif"
            width={300}
            height={300}
            alt="jewel"
            unoptimized
          />
        </div>
      )} */}

      <Card>
        <div className="flex items-center justify-between mb-5!">
          <h2 className="section-title">✅ Tarefas do Dia</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3! py-1.5! bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Nova tarefa
          </button>
        </div>

        <div className={`todo-list relative ${isBusy ? "pointer-events-none select-none" : ""}`}>
          {isBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-30 rounded-lg">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
              </div>
            </div>
          )}

          {todos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhuma tarefa ainda. Crie a primeira!
            </p>
          ) : (
            <>
              {pending.map((t) => (
                <TodoItem key={t.id} todo={t} onToggle={toggleCheck} />
              ))}
              {completed.map((t) => (
                <TodoItem key={t.id} todo={t} onToggle={toggleCheck} />
              ))}
            </>
          )}
        </div>

        <div className="flex justify-between items-center my-2!">
          <div className="w-full mt-4 px-4">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
              <div
                className="h-full bg-cyan-500 transition-transform duration-500"
                style={{
                  transform: `translateX(-${100 - progress}%)`,
                  width: "100%",
                }}
              />
            </div>
          </div>
          <div className="todo-summary">
            {checkedCount}/{todos.length} concluídas
          </div>
        </div>
      </Card>
    </>
  );
}