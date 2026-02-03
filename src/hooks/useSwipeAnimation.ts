import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { SpringConfigs } from "@/utils/animations";

interface UseSwipeAnimationResult {
  translateX: ReturnType<typeof useSharedValue>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  resetPosition: () => void;
  snapToDelete: () => void;
  snapToComplete: () => void;
}

const DELETE_THRESHOLD = -80;
const COMPLETE_THRESHOLD = 80;
const DELETE_SNAP_POINT = -120;
const COMPLETE_SNAP_POINT = 120;

/**
 * Hook for managing swipe gesture animations
 * Provides smooth spring animations for swipe actions
 */
export function useSwipeAnimation(): UseSwipeAnimationResult {
  const translateX = useSharedValue(0);

  const resetPosition = () => {
    "worklet";
    translateX.value = withSpring(0, SpringConfigs.DEFAULT);
  };

  const snapToDelete = () => {
    "worklet";
    translateX.value = withSpring(DELETE_SNAP_POINT, SpringConfigs.DEFAULT);
  };

  const snapToComplete = () => {
    "worklet";
    translateX.value = withSpring(COMPLETE_SNAP_POINT, SpringConfigs.DEFAULT);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return {
    translateX,
    animatedStyle,
    resetPosition,
    snapToDelete,
    snapToComplete,
  };
}

export { DELETE_THRESHOLD, COMPLETE_THRESHOLD, DELETE_SNAP_POINT, COMPLETE_SNAP_POINT };
