import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, useColorScheme, View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { todosAtom } from "@/features/todos/_atoms/todos";
import { useProtectedTodoActions } from "@/features/todos/useProtectedTodoActions";
import { HapticPatterns } from "@/utils/haptics";

export default function TodoActionsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const todos = useAtomValue(todosAtom);
  const isDark = useColorScheme() === "dark";

  const todo = useMemo(() => {
    if (!id) {
      return null;
    }

    return todos.find((entry) => entry.id === id) ?? null;
  }, [id, todos]);

  const {
    actionError,
    handleSaveTitle,
    handleDeleteTodo,
    handleDuplicateTodo,
  } = useProtectedTodoActions();

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo?.title ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftTitle(todo?.title ?? "");
    setErrorMessage(null);
  }, [todo?.id, todo?.title]);

  const handleClose = useCallback(async () => {
    await HapticPatterns.LIGHT();
    router.back();
  }, [router]);

  const handleEdit = useCallback(async () => {
    if (!todo) {
      return;
    }

    await HapticPatterns.MEDIUM();
    setDraftTitle(todo.title);
    setErrorMessage(null);
    setIsEditing(true);
  }, [todo]);

  const handleCancelEditing = useCallback(async () => {
    if (!todo) {
      return;
    }

    await HapticPatterns.LIGHT();
    setDraftTitle(todo.title);
    setErrorMessage(null);
    setIsEditing(false);
  }, [todo]);

  const handleDuplicate = useCallback(async () => {
    if (!todo) {
      return;
    }

    await HapticPatterns.MEDIUM();
    await handleDuplicateTodo(todo.id);
    router.back();
  }, [handleDuplicateTodo, router, todo]);

  const handleSave = useCallback(async () => {
    if (!todo) {
      return;
    }

    const trimmedTitle = draftTitle.trim();
    if (trimmedTitle.length === 0) {
      setErrorMessage("Please enter a todo title.");
      await HapticPatterns.ERROR();
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      await handleSaveTitle({ ...todo, title: trimmedTitle });
      await HapticPatterns.SUCCESS();
      router.back();
    } catch (error) {
      await HapticPatterns.ERROR();
      console.error("Failed to save todo:", error);
    } finally {
      setIsSaving(false);
    }
  }, [draftTitle, handleSaveTitle, router, todo]);

  const handleDelete = useCallback(async () => {
    if (!todo) {
      return;
    }

    await HapticPatterns.WARNING();
    Alert.alert("Delete todo?", `This will permanently delete "${todo.title}".`, [
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
            await handleDeleteTodo(todo.id);
            router.back();
          })();
        },
      },
    ]);
  }, [handleDeleteTodo, router, todo]);

  if (!todo) {
    return (
      <View style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, isDark ? styles.titleDark : styles.titleLight]}>
            Todo Actions
          </Text>
          <Button
            variant="outline"
            onPress={() => {
              void handleClose();
            }}
            accessibilityLabel="Close todo actions"
          >
            Close
          </Button>
        </View>
        <Text style={[styles.message, isDark ? styles.messageDark : styles.messageLight]}>
          Todo not found.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.kicker, isDark ? styles.kickerDark : styles.kickerLight]}>
            {isEditing ? "Edit Todo" : "Todo Actions"}
          </Text>
          <Text style={[styles.headerTitle, isDark ? styles.titleDark : styles.titleLight]}>
            {isEditing ? "Update the title below." : todo.title}
          </Text>
        </View>

        <Button
          variant="outline"
          onPress={() => {
            void handleClose();
          }}
          accessibilityLabel="Close todo actions"
        >
          Close
        </Button>
      </View>

      {actionError ? (
        <Text style={[styles.error, isDark ? styles.errorDark : styles.errorLight]}>
          {actionError}
        </Text>
      ) : null}

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
                void handleCancelEditing();
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  screenLight: {
    backgroundColor: "#f5f5f5",
  },
  screenDark: {
    backgroundColor: "#0a0a0a",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
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
  headerTitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "700",
    flexShrink: 1,
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
  error: {
    fontSize: 14,
  },
  errorLight: {
    color: "#dc2626",
  },
  errorDark: {
    color: "#f87171",
  },
  message: {
    fontSize: 16,
  },
  messageLight: {
    color: "#404040",
  },
  messageDark: {
    color: "#d4d4d4",
  },
});
