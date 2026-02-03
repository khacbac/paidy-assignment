import { type ReactNode, useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  AccessibilityInfo,
  StyleSheet,
  Text,
  useColorScheme,
  type StyleProp,
  type ViewStyle,
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

type AnimatedButtonProps = Omit<PressableProps, "children" | "onPress" | "style"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  onPress?: () => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
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
  style,
  ...rest
}: AnimatedButtonProps) {
  const isDark = useColorScheme() === "dark";
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

  const containerStyle = [
    styles.container,
    variant === "primary" && styles.primaryContainer,
    variant === "secondary" && (isDark ? styles.secondaryContainerDark : styles.secondaryContainer),
    variant === "danger" && styles.dangerContainer,
    variant === "outline" && (isDark ? styles.outlineContainerDark : styles.outlineContainer),
    isDisabled && styles.disabled,
    animatedStyle,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === "primary" && styles.primaryText,
    variant === "secondary" && (isDark ? styles.secondaryTextDark : styles.secondaryText),
    variant === "danger" && styles.dangerText,
    variant === "outline" && (isDark ? styles.outlineTextDark : styles.outlineText),
  ];

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={containerStyle}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "outline" ? (isDark ? "#f5f5f5" : "#171717") : "#ffffff"}
            size="small"
          />
        ) : (
          <Text style={textStyle}>{children}</Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryContainer: {
    backgroundColor: "#2563eb",
  },
  secondaryContainer: {
    backgroundColor: "#262626",
  },
  secondaryContainerDark: {
    backgroundColor: "#e5e5e5",
  },
  dangerContainer: {
    backgroundColor: "#dc2626",
  },
  outlineContainer: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
  },
  outlineContainerDark: {
    borderWidth: 1,
    borderColor: "#525252",
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryText: {
    color: "#ffffff",
  },
  secondaryText: {
    color: "#ffffff",
  },
  secondaryTextDark: {
    color: "#171717",
  },
  dangerText: {
    color: "#ffffff",
  },
  outlineText: {
    color: "#171717",
  },
  outlineTextDark: {
    color: "#f5f5f5",
  },
});
