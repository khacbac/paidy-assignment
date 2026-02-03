import { View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

type AddTodoFormProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function AddTodoForm({
  value,
  onChangeText,
  onSubmit,
  onClear,
  isSubmitting = false,
  errorMessage,
}: AddTodoFormProps) {
  return (
    <View className="gap-2">
      <Input
        label="New todo"
        value={value}
        onChangeText={onChangeText}
        placeholder="Write something you need to do"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        errorMessage={errorMessage ?? undefined}
        accessibilityLabel="Todo title input"
      />
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button
            onPress={onSubmit}
            loading={isSubmitting}
            accessibilityLabel="Add todo"
            accessibilityHint="Creates a new todo"
          >
            Add Todo
          </Button>
        </View>
        <View className="flex-1">
          <Button
            variant="outline"
            onPress={onClear}
            disabled={isSubmitting || value.trim().length === 0}
            accessibilityLabel="Clear todo input"
          >
            Clear
          </Button>
        </View>
      </View>
    </View>
  );
}
