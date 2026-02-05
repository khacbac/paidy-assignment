import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  TODO_CATEGORIES,
  TODO_CATEGORY_CONFIG,
  TODO_CHIP_SELECTED_TEXT,
  TODO_PRIORITIES,
  TODO_PRIORITY_CONFIG,
} from "@/features/todos/constants";
import type { TodoCategory, TodoPriority } from "@/features/todos/types";

import { PriorityDot } from "./PriorityDot";

type CategoryPriorityPickerProps = {
  category: TodoCategory;
  priority: TodoPriority;
  onChangeCategory: (value: TodoCategory) => void;
  onChangePriority: (value: TodoPriority) => void;
};

export function CategoryPriorityPicker({
  category,
  priority,
  onChangeCategory,
  onChangePriority,
}: CategoryPriorityPickerProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionLabel, isDark ? styles.textDark : styles.textLight]}>
        Category
      </Text>
      <View style={styles.chipsRow}>
        {TODO_CATEGORIES.map((value) => {
          const config = TODO_CATEGORY_CONFIG[value];
          const isSelected = category === value;
          return (
            <Pressable
              key={value}
              onPress={() => onChangeCategory(value)}
              style={[
                styles.chip,
                isDark ? styles.chipDark : styles.chipLight,
                isSelected && (isDark ? styles.chipSelectedDark : styles.chipSelectedLight),
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Set category to ${config.label}`}
            >
              <Text
                style={[
                  styles.chipText,
                  isDark ? styles.textDark : styles.textLight,
                  isSelected && TODO_CHIP_SELECTED_TEXT,
                ]}
              >
                {config.emoji ? `${config.emoji} ${config.label}` : config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, isDark ? styles.textDark : styles.textLight]}>
        Priority
      </Text>
      <View style={styles.chipsRow}>
        {TODO_PRIORITIES.map((value) => {
          const config = TODO_PRIORITY_CONFIG[value];
          const isSelected = priority === value;
          return (
            <Pressable
              key={value}
              onPress={() => onChangePriority(value)}
              style={[
                styles.chip,
                styles.priorityChip,
                isDark ? styles.chipDark : styles.chipLight,
                isSelected && (isDark ? styles.chipSelectedDark : styles.chipSelectedLight),
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Set priority to ${config.label}`}
            >
              <PriorityDot priority={value} size="small" />
              <Text
                style={[
                  styles.chipText,
                  isDark ? styles.textDark : styles.textLight,
                  isSelected && TODO_CHIP_SELECTED_TEXT,
                ]}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipLight: {
    borderColor: "#d4d4d4",
    backgroundColor: "#ffffff",
  },
  chipDark: {
    borderColor: "#525252",
    backgroundColor: "#171717",
  },
  chipSelectedLight: {
    borderColor: "#2563eb",
    backgroundColor: "#dbeafe",
  },
  chipSelectedDark: {
    borderColor: "#60a5fa",
    backgroundColor: "#1e3a8a",
  },
  chipText: {
    fontSize: 13,
  },
  textLight: {
    color: "#171717",
  },
  textDark: {
    color: "#f5f5f5",
  },
});
