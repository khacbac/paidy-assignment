import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  StyleSheet,
  Text,
  useColorScheme,
  type ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline";

type ButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDark = useColorScheme() === "dark";
  const isDisabled = disabled || loading;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    variant === "primary" && styles.primaryContainer,
    variant === "secondary" &&
      (isDark ? styles.secondaryContainerDark : styles.secondaryContainer),
    variant === "danger" && styles.dangerContainer,
    variant === "outline" &&
      (isDark ? styles.outlineContainerDark : styles.outlineContainer),
    isDisabled && styles.disabled,
  ];
  const pressableStyle: PressableProps["style"] = (
    state: PressableStateCallbackType,
  ) => {
    if (typeof style === "function") {
      return [
        containerStyle,
        !isDisabled && state.pressed && styles.pressed,
        style(state),
      ];
    }

    return [
      containerStyle,
      !isDisabled && state.pressed && styles.pressed,
      style,
    ];
  };

  const textStyle = [
    styles.text,
    variant === "primary" && styles.primaryText,
    variant === "secondary" &&
      (isDark ? styles.secondaryTextDark : styles.secondaryText),
    variant === "danger" && styles.dangerText,
    variant === "outline" &&
      (isDark ? styles.outlineTextDark : styles.outlineText),
  ];

  return (
    <Pressable style={pressableStyle} disabled={isDisabled} {...rest}>
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" ? (isDark ? "#f5f5f5" : "#171717") : "#ffffff"
          }
          size="small"
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </Pressable>
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
  pressed: {
    opacity: 0.85,
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
