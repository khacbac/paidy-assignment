import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { HapticPatterns } from "@/utils/haptics";
import type { Todo } from "@/features/todos/types";

interface TodoItemEditProps {
  todo: Todo;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  isSaving?: boolean;
}

/**
 * In-place editing interface for todo items
 * Shows input field with save/cancel/delete buttons
 */
export function TodoItemEdit({
  todo,
  onSave,
  onCancel,
  onDelete,
  isSaving = false,
}: TodoItemEditProps) {
  const [draftTitle, setDraftTitle] = useState(todo.title);

  const handleSave = async () => {
    const trimmedTitle = draftTitle.trim();
    if (trimmedTitle.length === 0) {
      await HapticPatterns.ERROR();
      return;
    }

    await HapticPatterns.MEDIUM();
    onSave(trimmedTitle);
  };

  const handleCancel = async () => {
    await HapticPatterns.LIGHT();
    onCancel();
  };

  const handleDelete = async () => {
    await HapticPatterns.HEAVY();
    onDelete();
  };

  return (
    <View style={styles.container}>
      <Input
        label="Edit todo"
        value={draftTitle}
        onChangeText={setDraftTitle}
        onSubmitEditing={handleSave}
        autoFocus
        accessibilityLabel={`Edit title for ${todo.title}`}
      />

      <View style={styles.actionsRow}>
        <View style={styles.flexOne}>
          <Button
            variant="primary"
            onPress={handleSave}
            disabled={draftTitle.trim().length === 0}
            loading={isSaving}
            accessibilityLabel="Save changes"
          >
            Save
          </Button>
        </View>

        <View style={styles.flexOne}>
          <Button
            variant="outline"
            onPress={handleCancel}
            accessibilityLabel="Cancel editing"
          >
            Cancel
          </Button>
        </View>
      </View>

      <View>
        <Button
          variant="danger"
          onPress={handleDelete}
          accessibilityLabel={`Delete ${todo.title}`}
        >
          Delete
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  flexOne: {
    flex: 1,
  },
});
