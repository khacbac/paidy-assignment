import { Text, TextInput, type TextInputProps, View } from "react-native";

type InputProps = TextInputProps & {
  label?: string;
  errorMessage?: string;
};

export function Input({ label, errorMessage, ...rest }: InputProps) {
  return (
    <View className="gap-1">
      {label ? <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</Text> : null}
      <TextInput
        className="min-h-11 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
        placeholderTextColor="#737373"
        {...rest}
      />
      {errorMessage ? (
        <Text className="text-xs text-red-600 dark:text-red-400">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
