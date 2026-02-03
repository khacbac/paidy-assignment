import { fireEvent, render } from "@testing-library/react-native";

import { TodoItem } from "@/features/todos/components/TodoItem";

describe("TodoItem", () => {
  const todo = {
    id: "todo-1",
    title: "Buy milk",
    createdAtMs: 1_700_000_000_000,
    updatedAtMs: 1_700_000_000_000,
    completed: false,
  };

  it("renders todo information", () => {
    const { getByText } = render(
      <TodoItem
        todo={todo}
        draftTitle={todo.title}
        onChangeDraft={jest.fn()}
        onToggle={jest.fn()}
        onSaveTitle={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(getByText("Buy milk")).toBeTruthy();
    expect(getByText(/Created/)).toBeTruthy();
    expect(getByText(/Updated/)).toBeTruthy();
  });

  it("calls action handlers", () => {
    const onToggle = jest.fn();
    const onSaveTitle = jest.fn();
    const onDelete = jest.fn();

    const { getByText } = render(
      <TodoItem
        todo={todo}
        draftTitle={todo.title}
        onChangeDraft={jest.fn()}
        onToggle={onToggle}
        onSaveTitle={onSaveTitle}
        onDelete={onDelete}
      />
    );

    fireEvent.press(getByText("Done"));
    fireEvent.press(getByText("Save"));
    fireEvent.press(getByText("Delete"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onSaveTitle).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("forwards input changes", () => {
    const onChangeDraft = jest.fn();
    const { getByLabelText } = render(
      <TodoItem
        todo={todo}
        draftTitle={todo.title}
        onChangeDraft={onChangeDraft}
        onToggle={jest.fn()}
        onSaveTitle={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    fireEvent.changeText(getByLabelText("Edit title for Buy milk"), "Buy oat milk");

    expect(onChangeDraft).toHaveBeenCalledWith("Buy oat milk");
  });
});
