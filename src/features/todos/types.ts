export type TodoId = string;

export type Todo = {
  id: TodoId;
  title: string;
  createdAtMs: number;
  updatedAtMs: number;
  completed: boolean;
};
