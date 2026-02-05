import { StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

type AddTodoFormProps = {
  titleValue: string;
  descriptionValue: string;
  onChangeTitleText: (value: string) => void;
  onChangeDescriptionText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function AddTodoForm({
  titleValue,
  descriptionValue,
  onChangeTitleText,
  onChangeDescriptionText,
  onSubmit,
  onClear,
  isSubmitting = false,
  errorMessage,
}: AddTodoFormProps) {
  return (
    <View style={styles.container}>
      <Input
        label="New todo"
        value={titleValue}
        onChangeText={onChangeTitleText}
        placeholder="Write something you need to do"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        errorMessage={errorMessage ?? undefined}
        accessibilityLabel="Todo title input"
      />
      <Input
        label="Description (optional)"
        value={descriptionValue}
        onChangeText={onChangeDescriptionText}
        placeholder="Add extra details"
        multiline
        numberOfLines={3}
        style={styles.descriptionInput}
        accessibilityLabel="Todo description input"
      />
      <View style={styles.actionsRow}>
        <View style={styles.flexOne}>
          <Button
            onPress={onSubmit}
            loading={isSubmitting}
            accessibilityLabel="Add todo"
            accessibilityHint="Creates a new todo"
          >
            Add Todo
          </Button>
        </View>
        <View style={styles.flexOne}>
          <Button
            variant="outline"
            onPress={onClear}
            disabled={
              isSubmitting ||
              (titleValue.trim().length === 0 &&
                descriptionValue.trim().length === 0)
            }
            accessibilityLabel="Clear todo input"
          >
            Clear
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  flexOne: {
    flex: 1,
  },
  descriptionInput: {
    minHeight: 88,
    textAlignVertical: "top",
  },
});
