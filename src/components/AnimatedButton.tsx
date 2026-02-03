import { type ReactNode, useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  AccessibilityInfo,
  Text,
  type PressableProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

import { HapticPatterns } from "@/utils/haptics";
import { SpringConfigs } from "@/utils/animations";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline";

type AnimatedButtonProps = Omit<PressableProps, "children" | "onPress"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  onPress?: () => void | Promise<void>;
  className?: string;
};

const CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-blue-600",
  secondary: "bg-neutral-800 dark:bg-neutral-200",
  danger: "bg-red-600",
  outline: "border border-neutral-300 dark:border-neutral-600",
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white dark:text-neutral-900",
  danger: "text-white",
  outline: "text-neutral-900 dark:text-neutral-100",
};

/**
 * Animated button with press feedback using Reanimated and gesture handler
 * Provides smooth press animations and haptic feedback
 */
export function AnimatedButton({
  children,
  variant = "primary",
  loading = false,
  disabled,
  onPress,
  className = "",
  ...rest
}: AnimatedButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = useCallback(async () => {
    if (isDisabled || !onPress) return;

    try {
      await onPress();
    } catch (error) {
      console.error("Button press error:", error);
    }
  }, [isDisabled, onPress]);

  const tapGesture = Gesture.Tap()
    .onBegin(async () => {
      if (!isDisabled && !reduceMotionEnabled) {
        scale.value = withSpring(0.95, SpringConfigs.SNAPPY);
        await HapticPatterns.MEDIUM();
      }
    })
    .onEnd(() => {
      if (!isDisabled && !reduceMotionEnabled) {
        scale.value = withSpring(1, SpringConfigs.DEFAULT);
      }
      runOnJS(handlePress)();
    })
    .onFinalize(() => {
      if (!reduceMotionEnabled) {
        scale.value = withSpring(1, SpringConfigs.DEFAULT);
      }
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        className={`min-h-11 flex-row items-center justify-center rounded-xl ${CONTAINER_CLASSES[variant]} px-4 py-3 ${className}`}
        style={[animatedStyle, isDisabled ? { opacity: 0.55 } : undefined]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "outline" ? "#171717" : "#ffffff"}
            size="small"
          />
        ) : (
          <Text className={`text-sm font-semibold ${TEXT_CLASSES[variant]}`}>
            {children}
          </Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
