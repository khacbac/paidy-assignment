import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";

import { Input } from "@/components/Input";
import type { Todo } from "@/features/todos/types";
import { HapticPatterns } from "@/utils/haptics";

import { Button } from "@/components/Button";

type TodoActionModalProps = {
  todo: Todo;
  visible: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void | Promise<void>;
  onDelete: () => void;
  onDuplicate: () => void;
};

export function TodoActionModal({
  todo,
  visible,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}: TodoActionModalProps) {
  const isDark = useColorScheme() === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetEditState = useCallback(() => {
    setIsEditing(false);
    setDraftTitle(todo.title);
    setErrorMessage(null);
    setIsSaving(false);
  }, [todo.title]);

  useEffect(() => {
    if (!visible) {
      resetEditState();
      return;
    }

    setDraftTitle(todo.title);
    setErrorMessage(null);
  }, [resetEditState, todo.title, visible]);

  const handleClose = async () => {
    await HapticPatterns.LIGHT();
    resetEditState();
    onClose();
  };

  const handleEdit = async () => {
    await HapticPatterns.MEDIUM();
    setDraftTitle(todo.title);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleDuplicate = async () => {
    await HapticPatterns.MEDIUM();
    onDuplicate();
  };

  const handleSave = async () => {
    const trimmedTitle = draftTitle.trim();
    if (trimmedTitle.length === 0) {
      setErrorMessage("Please enter a todo title.");
      await HapticPatterns.ERROR();
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      await onSave(trimmedTitle);
      await HapticPatterns.SUCCESS();
      resetEditState();
      onClose();
    } catch (error) {
      await HapticPatterns.ERROR();
      console.error("Failed to save todo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    await HapticPatterns.LIGHT();
    resetEditState();
    onClose();
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
              resetEditState();
              onDelete();
              onClose();
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
            {isEditing ? "Edit Todo" : "Todo Actions"}
          </Text>
          <Text
            style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}
            numberOfLines={2}
          >
            {isEditing ? "Update the title below." : todo.title}
          </Text>

          <View style={styles.actions}>
            {isEditing ? (
              <>
                <Input
                  label="Edit todo"
                  value={draftTitle}
                  onChangeText={(value) => {
                    setDraftTitle(value);
                    if (errorMessage) {
                      setErrorMessage(null);
                    }
                  }}
                  onSubmitEditing={() => {
                    void handleSave();
                  }}
                  autoFocus
                  errorMessage={errorMessage ?? undefined}
                  accessibilityLabel={`Edit title for ${todo.title}`}
                />

                <Button
                  variant="primary"
                  onPress={() => {
                    void handleSave();
                  }}
                  loading={isSaving}
                  accessibilityLabel="Save changes"
                >
                  Save
                </Button>

                <Button
                  variant="outline"
                  onPress={() => {
                    void handleCancel();
                  }}
                  accessibilityLabel="Cancel editing"
                >
                  Cancel
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
              </>
            ) : (
              <>
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
              </>
            )}
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
