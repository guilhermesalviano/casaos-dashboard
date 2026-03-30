export type Priority = "high" | "medium" | "low";

export interface TodoState {
  id: number;
  title: string;
  checked: number;
  priority: Priority;
}

export interface NewTaskForm {
  title: string;
  priority: Priority;
  recurrence: {
    repeat: boolean;
    weeklyInterval: number;
    weeklyDays?: number[] | null;
    weeklyEnd?: number | null;
  };
}

export const priorityColor: Record<Priority, string> = {
  high: "#FCA5A5",
  medium: "#FDE68A",
  low: "#6EE7B7",
};

export const priorityLabel: Record<Priority, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};