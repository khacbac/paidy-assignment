import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline";

type ButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
};

const CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-blue-600",
  secondary: "bg-neutral-800 dark:bg-neutral-200",
  danger: "bg-red-600",
  outline: "border border-neutral-300 dark:border-neutral-600",
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white dark:text-neutral-900",
  danger: "text-white",
  outline: "text-neutral-900 dark:text-neutral-100",
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`min-h-11 flex-row items-center justify-center rounded-xl px-4 py-3 active:opacity-85 ${CONTAINER_CLASSES[variant]}`}
      disabled={isDisabled}
      style={isDisabled ? { opacity: 0.55 } : undefined}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#171717" : "#ffffff"}
          size="small"
        />
      ) : (
        <Text className={`text-sm font-semibold ${TEXT_CLASSES[variant]}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
