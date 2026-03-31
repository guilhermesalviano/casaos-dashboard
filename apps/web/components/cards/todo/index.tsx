import Card from "@/components/card";
import TaskModal from "./taskModal";
import TodoItem from "./todoItem";
import { NewTaskForm, TodoState } from "@/types/task";

interface TodoProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  add: (form: NewTaskForm) => void;
  toggleCheck: (id: number, currentStatus: number) => void;
  pending: TodoState[];
  completed: TodoState[];
  checkedCount: number;
  todos?: TodoState[];
  isBusy: boolean;
  progress: number;
}

export default function TodoCard({ modalOpen, setModalOpen, add, toggleCheck, pending, completed, checkedCount, todos, isBusy, progress }: TodoProps) {
  

  return (
    <>
      <TaskModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onAdd={add} 
      />

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

        <div className={`todo-list relative transition-opacity ${isBusy ? "opacity-50 pointer-events-none" : "opacity-100"}`} 
        >
          {isBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-30 rounded-lg">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
              </div>
            </div>
          )}

          {todos?.length === 0 || !todos ? (
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
            {checkedCount}/{todos?.length || 0} concluídas
          </div>
        </div>
      </Card>
    </>
  );
}