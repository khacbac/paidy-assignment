import { Modal, Pressable, Text, View, Alert, StyleSheet, useColorScheme } from "react-native";

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
  const isDark = useColorScheme() === "dark";

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
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => {
            void handleClose();
          }}
          accessibilityLabel="Close todo actions"
        />

        <View style={[styles.sheet, isDark ? styles.sheetDark : styles.sheetLight]}>
          <Text style={[styles.kicker, isDark ? styles.kickerDark : styles.kickerLight]}>
            Todo Actions
          </Text>
          <Text
            style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}
            numberOfLines={2}
          >
            {todo.title}
          </Text>

          <View style={styles.actions}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 448,
    gap: 16,
    borderRadius: 16,
    padding: 20,
  },
  sheetLight: {
    backgroundColor: "#ffffff",
  },
  sheetDark: {
    backgroundColor: "#171717",
  },
  kicker: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  kickerLight: {
    color: "#737373",
  },
  kickerDark: {
    color: "#a3a3a3",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  titleLight: {
    color: "#171717",
  },
  titleDark: {
    color: "#f5f5f5",
  },
  actions: {
    gap: 8,
  },
});
