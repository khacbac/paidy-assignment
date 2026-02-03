import { StyleSheet, Text, View, useColorScheme } from "react-native";

import { Button } from "@/components/Button";

type AuthPromptProps = {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  isLoading?: boolean;
};

export function AuthPrompt({
  title,
  message,
  onConfirm,
  confirmLabel = "Authenticate",
  isLoading = false,
}: AuthPromptProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>{title}</Text>
      <Text style={[styles.message, isDark ? styles.messageDark : styles.messageLight]}>{message}</Text>
      <Button onPress={onConfirm} loading={isLoading} accessibilityLabel={confirmLabel}>
        {confirmLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 384,
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  containerLight: {
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  containerDark: {
    borderColor: "#404040",
    backgroundColor: "#171717",
  },
  title: {
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
    fontSize: 14,
  },
  messageLight: {
    color: "#525252",
  },
  messageDark: {
    color: "#d4d4d4",
  },
});
