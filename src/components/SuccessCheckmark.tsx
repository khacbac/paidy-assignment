import { useCallback, useEffect, useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AnimationDurations, SpringConfigs } from "@/utils/animations";

interface SuccessCheckmarkProps {
  visible: boolean;
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
}

/**
 * Animated success checkmark that appears and scales in
 * Used for providing visual feedback on successful actions
 */
export function SuccessCheckmark({
  visible,
  style,
  size = 24,
  color = "#10b981",
}: SuccessCheckmarkProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      scale.value = withSpring(1, { ...SpringConfigs.DEFAULT, damping: 10 });
      opacity.value = withTiming(1, { duration: AnimationDurations.FAST });

      const hideTimer = setTimeout(() => {
        scale.value = withSequence(
          withDelay(1000, withTiming(0, { duration: AnimationDurations.FAST })),
          withTiming(0, { duration: 0 })
        );
        opacity.value = withDelay(1000, withTiming(0, { duration: AnimationDurations.FAST }));

        setTimeout(() => setIsVisible(false), 1500);
      }, 1200);

      return () => clearTimeout(hideTimer);
    }
  }, [visible, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      accessibilityLabel="Success"
    >
      <Text style={{ color: "white", fontSize: size * 0.6, fontWeight: "bold" }}>✓</Text>
    </Animated.View>
  );
}
