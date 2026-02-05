import type { TextStyle, ViewStyle } from "react-native";

import type { TodoCategory, TodoPriority } from "./types";

export const TODO_CATEGORIES: TodoCategory[] = [
  "none",
  "work",
  "personal",
  "shopping",
  "health",
  "urgent",
];

export const TODO_PRIORITIES: TodoPriority[] = [
  "none",
  "low",
  "medium",
  "high",
];

export const TODO_CATEGORY_CONFIG: Record<
  TodoCategory,
  { emoji: string; label: string }
> = {
  none: { emoji: "", label: "None" },
  work: { emoji: "💼", label: "Work" },
  personal: { emoji: "🏠", label: "Personal" },
  shopping: { emoji: "🛒", label: "Shopping" },
  health: { emoji: "❤️", label: "Health" },
  urgent: { emoji: "🔥", label: "Urgent" },
};

export const TODO_PRIORITY_CONFIG: Record<
  TodoPriority,
  { color: string; label: string }
> = {
  none: { color: "transparent", label: "None" },
  low: { color: "#22c55e", label: "Low" },
  medium: { color: "#eab308", label: "Medium" },
  high: { color: "#ef4444", label: "High" },
};

export const TODO_CARD_SHADOW_STYLES: { light: ViewStyle; dark: ViewStyle } = {
  light: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  dark: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.34,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const TODO_CHIP_SELECTED_TEXT: TextStyle = {
  fontWeight: "700",
};

export function isTodoCategory(value: unknown): value is TodoCategory {
  return typeof value === "string" && TODO_CATEGORIES.includes(value as TodoCategory);
}

export function isTodoPriority(value: unknown): value is TodoPriority {
  return typeof value === "string" && TODO_PRIORITIES.includes(value as TodoPriority);
}

export function getTodoCategoryEmoji(category: TodoCategory | undefined): string {
  if (!category || category === "none") {
    return "";
  }

  return TODO_CATEGORY_CONFIG[category].emoji;
}
