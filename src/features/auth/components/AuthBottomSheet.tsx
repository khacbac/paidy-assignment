import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

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
    const isDark = useColorScheme() === "dark";
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
        <BottomSheetView style={styles.sheetContainer}>
          <View style={styles.handleContainer}>
            <View style={[styles.handle, isDark ? styles.handleDark : styles.handleLight]} />
          </View>

          <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>{title}</Text>

          <Text style={[styles.message, isDark ? styles.messageDark : styles.messageLight]}>{message}</Text>

          <Button
            onPress={handleConfirm}
            loading={isLoading}
            accessibilityLabel={confirmLabel}
            style={styles.fullWidthButton}
          >
            {confirmLabel}
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    padding: 24,
  },
  handleContainer: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    height: 4,
    width: 48,
    borderRadius: 999,
  },
  handleLight: {
    backgroundColor: "#d4d4d4",
  },
  handleDark: {
    backgroundColor: "#404040",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  titleLight: {
    color: "#171717",
  },
  titleDark: {
    color: "#f5f5f5",
  },
  message: {
    marginBottom: 32,
    textAlign: "center",
    fontSize: 16,
  },
  messageLight: {
    color: "#525252",
  },
  messageDark: {
    color: "#d4d4d4",
  },
  fullWidthButton: {
    width: "100%",
  },
});
