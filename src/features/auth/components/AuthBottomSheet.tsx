import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { HapticPatterns } from "@/utils/haptics";

interface AuthBottomSheetProps {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  isLoading?: boolean;
}

/**
 * Bottom sheet authentication prompt that slides up from the bottom
 * Provides a less intrusive authentication experience compared to full-screen overlay
 */
export const AuthBottomSheet = forwardRef<BottomSheetModal, AuthBottomSheetProps>(
  function AuthBottomSheet(
    { title, message, onConfirm, confirmLabel = "Authenticate", isLoading = false },
    ref
  ) {
    const snapPoints = useMemo(() => ["25%", "30%"], []);

    const handleConfirm = useCallback(async () => {
      await HapticPatterns.MEDIUM();
      await onConfirm();
    }, [onConfirm]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backdropComponent={({ style }) => (
          <View
            style={[
              style,
              {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },
            ]}
          />
        )}
      >
        <BottomSheetView className="flex-1 p-6">
          <View className="mb-6 flex-row items-center justify-center">
            <View className="h-1 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          </View>

          <Text className="mb-2 text-center text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {title}
          </Text>

          <Text className="mb-8 text-center text-base text-neutral-600 dark:text-neutral-300">
            {message}
          </Text>

          <Button
            onPress={handleConfirm}
            loading={isLoading}
            accessibilityLabel={confirmLabel}
            className="w-full"
          >
            {confirmLabel}
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
