import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Haptic feedback patterns for different user interactions
 */
export const HapticPatterns = {
  /** Light impact for minor interactions like swipe actions, toggle complete */
  LIGHT: async () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /** Medium impact for button presses */
  MEDIUM: async () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /** Heavy impact for critical actions like delete */
  HEAVY: async () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /** Notification feedback for success */
  SUCCESS: async () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /** Notification feedback for warnings */
  WARNING: async () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /** Notification feedback for errors */
  ERROR: async () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
} as const;

export type HapticPattern = keyof typeof HapticPatterns;
