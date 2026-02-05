import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, useColorScheme, View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { AuthLevel } from "@/features/auth/types";
import { addTodoAtom, todosAtom } from "@/features/todos/_atoms/todos";
import { useProtectedTodoActions } from "@/features/todos/useProtectedTodoActions";
import { HapticPatterns } from "@/utils/haptics";

export default function TodoActionsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const todos = useAtomValue(todosAtom);
  const addTodo = useSetAtom(addTodoAtom);
  const isDark = useColorScheme() === "dark";

  const isCreateMode = !id;
  const todo = useMemo(() => {
    if (!id) {
      return null;
    }

    return todos.find((entry) => entry.id === id) ?? null;
  }, [id, todos]);

  const {
    actionError,
    runProtectedAction,
    handleSaveTitle,
    handleDeleteTodo,
    handleDuplicateTodo,
  } = useProtectedTodoActions();

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const closeScreen = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }, [router]);

  useEffect(() => {
    if (todo) {
      setDraftTitle(todo.title);
      setDraftDescription(todo.description);
      setErrorMessage(null);
      return;
    }

    if (isCreateMode) {
      setDraftTitle("");
      setDraftDescription("");
      setErrorMessage(null);
    }
  }, [isCreateMode, todo]);

  const handleClose = useCallback(async () => {
    await HapticPatterns.LIGHT();
    closeScreen();
  }, [closeScreen]);

  const handleCreate = useCallback(async () => {
    const trimmedTitle = draftTitle.trim();
    const trimmedDescription = draftDescription.trim();
    if (trimmedTitle.length === 0) {
      setErrorMessage("Please enter a todo title.");
      await HapticPatterns.ERROR();
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      const result = await runProtectedAction(
        "Authenticate to add a todo",
        AuthLevel.SENSITIVE,
        () => {
          addTodo({
            title: trimmedTitle,
            description: trimmedDescription,
          });
        },
      );

      if (result !== null) {
        await HapticPatterns.SUCCESS();
        closeScreen();
      }
    } catch (error) {
      await HapticPatterns.ERROR();
      console.error("Failed to create todo:", error);
    } finally {
      setIsSaving(false);
    }
  }, [addTodo, closeScreen, draftDescription, draftTitle, runProtectedAction]);

  const handleEdit = useCallback(async () => {
    if (!todo) {
      return;
    }

    await HapticPatterns.MEDIUM();
    setDraftTitle(todo.title);
    setDraftDescription(todo.description);
    setErrorMessage(null);
    setIsEditing(true);
  }, [todo]);

  const handleCancelEditing = useCallback(async () => {
    if (!todo) {
      return;
    }

    await HapticPatterns.LIGHT();
    setDraftTitle(todo.title);
    setDraftDescription(todo.description);
    setErrorMessage(null);
    setIsEditing(false);
  }, [todo]);

  const handleDuplicate = useCallback(async () => {
    if (!todo) {
      return;
    }

    await HapticPatterns.MEDIUM();
    await handleDuplicateTodo(todo.id);
    closeScreen();
  }, [closeScreen, handleDuplicateTodo, todo]);

  const handleSave = useCallback(async () => {
    if (!todo) {
      return;
    }

    const trimmedTitle = draftTitle.trim();
    const trimmedDescription = draftDescription.trim();
    if (trimmedTitle.length === 0) {
      setErrorMessage("Please enter a todo title.");
      await HapticPatterns.ERROR();
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      await handleSaveTitle({
        ...todo,
        title: trimmedTitle,
        description: trimmedDescription,
      });
      await HapticPatterns.SUCCESS();
      closeScreen();
    } catch (error) {
      await HapticPatterns.ERROR();
      console.error("Failed to save todo:", error);
    } finally {
      setIsSaving(false);
    }
  }, [closeScreen, draftDescription, draftTitle, handleSaveTitle, todo]);

  const handleDelete = useCallback(async () => {
    if (!todo) {
      return;
    }

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
              await handleDeleteTodo(todo.id);
              closeScreen();
            })();
          },
        },
      ],
    );
  }, [closeScreen, handleDeleteTodo, todo]);

  if (isCreateMode) {
    return (
      <View
        style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text
              style={[
                styles.kicker,
                isDark ? styles.kickerDark : styles.kickerLight,
              ]}
            >
              New Todo
            </Text>
            <Text
              style={[
                styles.headerTitle,
                isDark ? styles.titleDark : styles.titleLight,
              ]}
            >
              Add what needs doing
            </Text>
          </View>
          <Button
            variant="outline"
            onPress={() => {
              void handleClose();
            }}
            accessibilityLabel="Close todo editor"
          >
            Close
          </Button>
        </View>

        {actionError ? (
          <Text
            style={[
              styles.error,
              isDark ? styles.errorDark : styles.errorLight,
            ]}
          >
            {actionError}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Input
            label="Todo title"
            value={draftTitle}
            onChangeText={(value) => {
              setDraftTitle(value);
              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
            onSubmitEditing={() => {
              void handleCreate();
            }}
            autoFocus
            errorMessage={errorMessage ?? undefined}
            accessibilityLabel="Todo title"
          />
          <Input
            label="Description (optional)"
            value={draftDescription}
            onChangeText={setDraftDescription}
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
            accessibilityLabel="Todo description"
          />

          <View style={styles.buttonRow}>
            <View style={styles.flexOne}>
              <Button
                variant="primary"
                onPress={() => {
                  void handleCreate();
                }}
                loading={isSaving}
                accessibilityLabel="Create todo"
              >
                Add Todo
              </Button>
            </View>
            <View style={styles.flexOne}>
              <Button
                variant="outline"
                onPress={() => {
                  void handleClose();
                }}
                accessibilityLabel="Cancel adding todo"
              >
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!todo) {
    return (
      <View
        style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}
      >
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.headerTitle,
              isDark ? styles.titleDark : styles.titleLight,
            ]}
          >
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
        <Text
          style={[
            styles.message,
            isDark ? styles.messageDark : styles.messageLight,
          ]}
        >
          Todo not found.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text
            style={[
              styles.kicker,
              isDark ? styles.kickerDark : styles.kickerLight,
            ]}
          >
            {isEditing ? "Edit Todo" : "Todo Actions"}
          </Text>
          <Text
            style={[
              styles.headerTitle,
              isDark ? styles.titleDark : styles.titleLight,
            ]}
          >
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

      <View
        style={[
          styles.todoSummary,
          isDark ? styles.todoSummaryDark : styles.todoSummaryLight,
        ]}
      >
        <Text
          style={[
            styles.todoSummaryTitle,
            isDark ? styles.titleDark : styles.titleLight,
          ]}
          numberOfLines={2}
        >
          {todo.title}
        </Text>
        <Text
          style={[
            styles.todoSummaryDescription,
            isDark ? styles.messageDark : styles.messageLight,
          ]}
          numberOfLines={3}
        >
          {todo.description || "No description yet."}
        </Text>
      </View>

      {actionError ? (
        <Text
          style={[styles.error, isDark ? styles.errorDark : styles.errorLight]}
        >
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
            <Input
              label="Edit description"
              value={draftDescription}
              onChangeText={setDraftDescription}
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
              accessibilityLabel={`Edit description for ${todo.title}`}
            />

            <View style={styles.buttonRow}>
              <View style={styles.flexOne}>
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
              </View>
              <View style={styles.flexOne}>
                <Button
                  variant="outline"
                  onPress={() => {
                    void handleCancelEditing();
                  }}
                  accessibilityLabel="Cancel editing"
                >
                  Cancel
                </Button>
              </View>
            </View>

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
            <View style={styles.buttonRow}>
              <View style={styles.flexOne}>
                <Button
                  variant="primary"
                  onPress={() => {
                    void handleEdit();
                  }}
                  accessibilityLabel={`Edit ${todo.title}`}
                >
                  Edit
                </Button>
              </View>
              <View style={styles.flexOne}>
                <Button
                  variant="secondary"
                  onPress={() => {
                    void handleDuplicate();
                  }}
                  accessibilityLabel={`Duplicate ${todo.title}`}
                >
                  Duplicate
                </Button>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <View style={styles.flexOne}>
                <Button
                  variant="danger"
                  onPress={() => {
                    void handleDelete();
                  }}
                  accessibilityLabel={`Delete ${todo.title}`}
                >
                  Delete
                </Button>
              </View>
              <View style={styles.flexOne}>
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
    gap: 10,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  flexOne: {
    flex: 1,
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
  todoSummary: {
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  todoSummaryLight: {
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  todoSummaryDark: {
    borderColor: "#404040",
    backgroundColor: "#171717",
  },
  todoSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  todoSummaryDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
