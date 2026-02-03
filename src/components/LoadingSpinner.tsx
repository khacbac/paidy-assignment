import { ActivityIndicator, StyleSheet, Text, View, useColorScheme } from "react-native";

type LoadingSpinnerProps = {
  message?: string;
};

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      <ActivityIndicator color={isDark ? "#d4d4d4" : "#525252"} />
      <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 24,
  },
  text: {
    fontSize: 14,
  },
  textLight: {
    color: "#525252",
  },
  textDark: {
    color: "#d4d4d4",
  },
});
