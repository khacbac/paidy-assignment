import { StyleSheet, Text, TextInput, useColorScheme, type TextInputProps, View } from "react-native";

type InputProps = TextInputProps & {
  label?: string;
  errorMessage?: string;
};

export function Input({ label, errorMessage, style, ...rest }: InputProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          isDark ? styles.inputDark : styles.inputLight,
          style,
        ]}
        placeholderTextColor="#737373"
        {...rest}
      />
      {errorMessage ? (
        <Text style={[styles.error, isDark ? styles.errorDark : styles.errorLight]}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  labelLight: {
    color: "#404040",
  },
  labelDark: {
    color: "#e5e5e5",
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  inputLight: {
    borderColor: "#d4d4d4",
    backgroundColor: "#ffffff",
    color: "#171717",
  },
  inputDark: {
    borderColor: "#525252",
    backgroundColor: "#171717",
    color: "#f5f5f5",
  },
  error: {
    fontSize: 12,
  },
  errorLight: {
    color: "#dc2626",
  },
  errorDark: {
    color: "#f87171",
  },
});
