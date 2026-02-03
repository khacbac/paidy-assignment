import { Modal, Pressable, Text, View, Alert } from "react-native";

import type { Todo } from "@/features/todos/types";
import { HapticPatterns } from "@/utils/haptics";

import { Button } from "@/components/Button";

type TodoActionModalProps = {
  todo: Todo;
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
};

export function TodoActionModal({
  todo,
  visible,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
}: TodoActionModalProps) {
  const handleClose = async () => {
    await HapticPatterns.LIGHT();
    onClose();
  };

  const handleEdit = async () => {
    await HapticPatterns.MEDIUM();
    onEdit();
  };

  const handleDuplicate = async () => {
    await HapticPatterns.MEDIUM();
    onDuplicate();
  };

  const handleDelete = async () => {
    await HapticPatterns.WARNING();
    Alert.alert(
      "Delete todo?",
      `This will permanently delete "${todo.title}".`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              await HapticPatterns.HEAVY();
              onDelete();
            })();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        void handleClose();
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/45 px-5">
        <Pressable
          className="absolute inset-0"
          onPress={() => {
            void handleClose();
          }}
          accessibilityLabel="Close todo actions"
        />

        <View className="w-full max-w-md gap-4 rounded-2xl bg-white p-5 dark:bg-neutral-900">
          <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Todo Actions
          </Text>
          <Text
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
            numberOfLines={2}
          >
            {todo.title}
          </Text>

          <View className="gap-2">
            <Button
              variant="primary"
              onPress={() => {
                void handleEdit();
              }}
              accessibilityLabel={`Edit ${todo.title}`}
            >
              Edit
            </Button>

            <Button
              variant="secondary"
              onPress={() => {
                void handleDuplicate();
              }}
              accessibilityLabel={`Duplicate ${todo.title}`}
            >
              Duplicate
            </Button>

            <Button
              variant="danger"
              onPress={() => {
                void handleDelete();
              }}
              accessibilityLabel={`Delete ${todo.title}`}
            >
              Delete
            </Button>

            <Button
              variant="outline"
              onPress={() => {
                void handleClose();
              }}
              accessibilityLabel="Cancel todo actions"
            >
              Cancel
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
