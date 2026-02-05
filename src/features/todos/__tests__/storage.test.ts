import type { Todo } from "@/features/todos/types";
import { loadTodos, saveTodos, TODOS_KEY } from "@/lib/storage/todoStorage";
import { getItem, removeItem, setItem } from "@/lib/storage/async-storage";

jest.mock("@/lib/storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockedGetItem = jest.mocked(getItem);
const mockedSetItem = jest.mocked(setItem);
const mockedRemoveItem = jest.mocked(removeItem);

describe("todoStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads empty array when no data exists", async () => {
    mockedGetItem.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    await expect(loadTodos()).resolves.toEqual([]);
    expect(mockedGetItem).toHaveBeenNthCalledWith(1, TODOS_KEY);
  });

  it("loads and validates existing todos", async () => {
    const todos: Todo[] = [
      {
        id: "todo-1",
        title: "Read",
        description: "",
        createdAtMs: 1,
        updatedAtMs: 1,
        completed: false,
      },
    ];

    mockedGetItem.mockResolvedValueOnce(JSON.stringify(todos));

    await expect(loadTodos()).resolves.toEqual(todos);
  });

  it("saves todos as JSON", async () => {
    const todos: Todo[] = [
      {
        id: "todo-1",
        title: "Write tests",
        description: "",
        createdAtMs: 1,
        updatedAtMs: 1,
        completed: true,
      },
    ];

    await saveTodos(todos);

    expect(mockedSetItem).toHaveBeenCalledWith(TODOS_KEY, JSON.stringify(todos));
  });

  it("migrates legacy key when needed", async () => {
    const legacyTodos = [
      {
        id: "legacy",
        title: "Legacy todo",
        createdAtMs: 1,
        updatedAtMs: 1,
        completed: false,
      },
    ];

    mockedGetItem
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(JSON.stringify(legacyTodos));

    await expect(loadTodos()).resolves.toEqual([
      {
        ...legacyTodos[0],
        description: "",
      },
    ]);
    expect(mockedSetItem).toHaveBeenCalledWith(
      TODOS_KEY,
      JSON.stringify([
        {
          ...legacyTodos[0],
          description: "",
        },
      ])
    );
    expect(mockedRemoveItem).toHaveBeenCalledWith("todos");
  });
});
