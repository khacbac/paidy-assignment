import { Text, View, Pressable } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import type { Todo } from "@/features/todos/types";
import { HapticPatterns } from "@/utils/haptics";
import { useSwipeAnimation, COMPLETE_THRESHOLD } from "@/hooks/useSwipeAnimation";

interface TodoItemDisplayProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEnterEdit: () => void;
}

/**
 * Display-only todo item with swipe gestures and tap-to-edit
 * Shows checkbox and title in read mode
 */
export function TodoItemDisplay({
  todo,
  onToggle,
  onDelete,
  onEnterEdit,
}: TodoItemDisplayProps) {
  const { animatedStyle, translateX, snapToComplete } = useSwipeAnimation();

  const tapGesture = Gesture.Tap().onEnd(async () => {
    await HapticPatterns.LIGHT();
    onEnterEdit();
  });

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const translation = event.translationX;

      // Swipe right to complete
      if (translation > COMPLETE_THRESHOLD || velocity > 500) {
        snapToComplete();
        onToggle();
      } else {
        translateX.value = 0;
      }
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  return (
    <View className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedStyle}>
          <Pressable
            className="flex-row items-center gap-3 p-4"
            accessibilityLabel={`${todo.title} - ${todo.completed ? "Completed" : "Active"}`}
          >
            <View
              className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                todo.completed
                  ? "border-green-500 bg-green-500"
                  : "border-neutral-300 bg-transparent dark:border-neutral-600"
              }`}
            >
              {todo.completed && (
                <Text className="text-xs font-bold text-white">✓</Text>
              )}
            </View>

            <Text
              className={`flex-1 text-lg font-medium ${
                todo.completed
                  ? "text-neutral-400 line-through"
                  : "text-neutral-900 dark:text-neutral-100"
              }`}
              numberOfLines={2}
            >
              {todo.title}
            </Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
