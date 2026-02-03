import { fireEvent, render } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";

import { Button } from "@/components/Button";

describe("Button", () => {
  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Submit</Button>);

    fireEvent.press(getByText("Submit"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Submit
      </Button>
    );

    fireEvent.press(getByText("Submit"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows spinner in loading state", () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button loading>Submit</Button>
    );

    expect(queryByText("Submit")).toBeNull();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("renders all supported variants", () => {
    const { rerender, getByText } = render(
      <Button variant="primary">Primary</Button>
    );
    expect(getByText("Primary")).toBeTruthy();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(getByText("Secondary")).toBeTruthy();

    rerender(<Button variant="danger">Danger</Button>);
    expect(getByText("Danger")).toBeTruthy();

    rerender(<Button variant="outline">Outline</Button>);
    expect(getByText("Outline")).toBeTruthy();
  });
});
