"use client";

import { useEffect, useMemo, useState } from "react";
import { NewTaskForm, priorityColor, TodoState } from "@/types/task";
import handleFireConfetti from "@/components/confetti";
import SectionTitle from "../sectionTitle";
import Card from "../card";
import Image from "next/image";
import TaskModal from "../TaskModal";

export default function TodoCard() {
  const [todos, setTodos] = useState<TodoState[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showJewel, setShowJewel] = useState(false);
  const [inactiveTodo, setInactiveTodo] = useState(false);

  useEffect(() => {
    fetch("/api/todo")
      .then((res) => res.json())
      .then((data) => setTodos(data.data));
  }, []);

  const add = async (form: NewTaskForm) => {
    const newTask = { title: form.title.trim(), checked: 0, priority: form.priority };

    const task = { 
      repeat: form.recurrence.repeat,
      weeklyInterval: form.recurrence.weeklyInterval,
      weeklyDays: form.recurrence.weeklyDays,
      weeklyEnd: form.recurrence.weeklyEnd,
      ...newTask
    }

    const response = await fetch("/api/todo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      const data = await response.json(); 
      setTodos((t) => [...t, { id: data.data.id, ...newTask }]);
    } else {
      console.error(`Error ${response.status} in to'do creation.`, );
    }
  };

  const toggleCheck = async (id: number, currentStatus: number) => {
    if (inactiveTodo) return;
    setInactiveTodo(true);

    const newStatus = (currentStatus === 0 ? 1 : 0);

    if (newStatus !== 0) jewelHandle();

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: newStatus } : t))
    );

    await fetch("/api/todo", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, checked: newStatus }),
    }).finally(() => {
      setInactiveTodo(false);
    })
  };

  const jewelHandle = () => {
    setShowJewel(true);

    setTimeout(() => {
      setShowJewel(false);
    }, 2000);
  }

  const checked = todos?.filter((t) => t.checked).length;

  useEffect(() => {
    if (checked >= 1 && checked === todos.length) handleFireConfetti();
  }, [checked]);

  const { pending, completed } = useMemo(() => {
    return {
      pending: todos.filter(t => t.checked === 0),
      completed: todos.filter(t => t.checked === 1)
    };
  }, [todos]);

  const progress = Math.round((checked / (todos?.length || 1)) * 100); 

  return (
    <>
      {modalOpen && (
        <TaskModal onClose={() => setModalOpen(false)} onAdd={add} />
      )}
      {showJewel && (
        <div className="fixed left-4 top-4 z-70">
          <Image src="/lets-go.gif" width="300" height="300" alt="jewel" unoptimized />
        </div>
      )}
      <Card>
        <div className="flex items-center justify-between mb-5!">
          <SectionTitle>✅ Tarefas do Dia</SectionTitle>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3! py-1.5! bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Nova tarefa
          </button>
        </div>

        <div 
          className={`todo-list ${inactiveTodo ? 'opacity-50 pointer-events-none select-none' : ''}`}
          aria-disabled={inactiveTodo}
        >
          {inactiveTodo && (
            <div className="relative h-full w-full bg-white z-30">
              <div className="absolute flex items-center justify-center top-20 right-32">
                <div className="w-14 h-14 rounded-full border-4 border-gray-200" />
                <div className="absolute w-14 h-14 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
              </div>
            </div>
          )}
          {pending?.map((t) => (
            <div
              key={t.id}
              className={`todo-item ${t.checked === 1 ? "done" : ""}`}
              onClick={() => !inactiveTodo && toggleCheck(t.id, t.checked)}
            >
              <div
                className="rotate-90 tracking-widest text-gray-500 select-none"
                style={{ cursor: "grab" }}
              >
                ...
              </div>
              <div className="todo-checkbox">{t.checked === 1 ? "✓" : ""}</div>
              <span className="todo-text">{t.title}</span>
              <div
                className="todo-dot"
                style={{ background: priorityColor[t.priority] }}
              />
            </div>
          ))}

          {completed?.map((t) => (
            <div
              key={t.id}
              className={`todo-item ${t.checked === 1 ? "done" : ""}`}
              onClick={() => !inactiveTodo && toggleCheck(t.id, t.checked)}
            >
              <div
                className="rotate-90 tracking-widest text-gray-500 select-none"
                style={{ cursor: "grab" }}
              >
                ...
              </div>
              <div className="todo-checkbox">{t.checked === 1 ? "✓" : ""}</div>
              <span className="todo-text">{t.title}</span>
              <div
                className="todo-dot"
                style={{ background: priorityColor[t.priority] }}
              />
            </div>
          ))}

          {todos?.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhuma tarefa ainda. Crie a primeira!
            </p>
          )}
        </div>
        
        <div className="flex justify-between items-center my-2!">
          <div className="w-full mt-4 px-4">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
              <div 
                className="h-full bg-cyan-500 transition-transform duration-500"
                style={{ 
                  transform: `translateX(-${100 - progress}%)`,
                  width: '100%' 
                }}
              />
            </div>
          </div>
          <div className="todo-summary">
            {checked}/{todos?.length} concluídas
          </div>
        </div>
      </Card>
    </>
  );
}