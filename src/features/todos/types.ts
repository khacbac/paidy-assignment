export type TodoId = string;
export type TodoFilter = "all" | "active" | "completed";
export type TodoCategory =
  | "none"
  | "work"
  | "personal"
  | "shopping"
  | "health"
  | "urgent";
export type TodoPriority = "none" | "low" | "medium" | "high";

export type Todo = {
  id: TodoId;
  title: string;
  description: string;
  category?: TodoCategory;
  priority?: TodoPriority;
  createdAtMs: number;
  updatedAtMs: number;
  completed: boolean;
};
