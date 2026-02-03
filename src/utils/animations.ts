import { withTiming, withSpring, withSequence } from "react-native-reanimated";

/**
 * Animation durations in milliseconds
 */
export const AnimationDurations = {
  /** Fast animations - 200ms */
  FAST: 200,
  /** Normal animations - 300ms */
  NORMAL: 300,
  /** Slow animations - 500ms */
  SLOW: 500,
} as const;

/**
 * Easing functions for animations
 */
export const AnimationEasing = {
  easeOut: (value: number) => {
    "worklet";
    return withTiming(value, { duration: AnimationDurations.NORMAL, easing: (t) => t * (2 - t) });
  },
  easeInOut: (value: number) => {
    "worklet";
    return withTiming(value, { duration: AnimationDurations.NORMAL, easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t });
  },
} as const;

/**
 * Spring animation configurations
 */
export const SpringConfigs = {
  /** Default spring for most interactions */
  DEFAULT: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  /** Snappy spring for button presses */
  SNAPPY: {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
  },
  /** Gentle spring for larger movements */
  GENTLE: {
    damping: 10,
    stiffness: 100,
    mass: 1,
  },
} as const;

/**
 * Button press animation
 */
export const BUTTON_PRESS = {
  PRESS: (value: number) => {
    "worklet";
    return withSpring(value, SpringConfigs.SNAPPY);
  },
  RELEASE: (value: number) => {
    "worklet";
    return withSpring(value, SpringConfigs.DEFAULT);
  },
} as const;

/**
 * Success checkmark animation
 */
export const SUCCESS_ANIMATION = {
  SCALE_IN: (value: number) => {
    "worklet";
    return withSpring(value, { ...SpringConfigs.DEFAULT, damping: 8 });
  },
} as const;
