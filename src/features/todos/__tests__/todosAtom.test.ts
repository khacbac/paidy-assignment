import { createStore } from "jotai";

import {
  addTodoAtom,
  deleteTodoAtom,
  toggleTodoAtom,
  todosAtom,
} from "@/features/todos/_atoms/todos";
import { TODOS_KEY, setItem } from "@/lib/storage";

jest.mock("@/lib/storage", () => {
  const actual = jest.requireActual("@/lib/storage");
  return {
    ...actual,
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  };
});

const mockedSetItem = jest.mocked(setItem);

describe("todos atoms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adds a todo and persists updated state", async () => {
    const store = createStore();

    store.set(addTodoAtom, "Plan trip");

    const todos = store.get(todosAtom);
    expect(todos).toHaveLength(1);
    expect(todos[0]?.title).toBe("Plan trip");

    await Promise.resolve();
    expect(mockedSetItem).toHaveBeenCalledWith(
      TODOS_KEY,
      expect.stringContaining("Plan trip")
    );
  });

  it("toggles a todo completion flag", () => {
    const store = createStore();
    store.set(todosAtom, [
      {
        id: "todo-1",
        title: "Toggle me",
        createdAtMs: 1,
        updatedAtMs: 1,
        completed: false,
      },
    ]);

    store.set(toggleTodoAtom, "todo-1");

    const [todo] = store.get(todosAtom);
    expect(todo?.completed).toBe(true);
    expect(todo?.updatedAtMs).toBeGreaterThanOrEqual(1);
  });

  it("deletes a todo", () => {
    const store = createStore();
    store.set(todosAtom, [
      {
        id: "todo-1",
        title: "Keep",
        createdAtMs: 1,
        updatedAtMs: 1,
        completed: false,
      },
      {
        id: "todo-2",
        title: "Delete",
        createdAtMs: 1,
        updatedAtMs: 1,
        completed: false,
      },
    ]);

    store.set(deleteTodoAtom, "todo-2");

    expect(store.get(todosAtom)).toEqual([
      {
        id: "todo-1",
        title: "Keep",
        createdAtMs: 1,
        updatedAtMs: 1,
        completed: false,
      },
    ]);
  });
});
