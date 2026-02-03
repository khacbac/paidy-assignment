import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import type { TodoFilter } from "@/features/todos/types";

type TodoFiltersProps = {
  selectedFilter: TodoFilter;
  totalCount: number;
  activeCount: number;
  completedCount: number;
  onChangeFilter: (filter: TodoFilter) => void;
};

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export function TodoFilters({
  selectedFilter,
  totalCount,
  activeCount,
  completedCount,
  onChangeFilter,
}: TodoFiltersProps) {
  const countByFilter: Record<TodoFilter, number> = {
    all: totalCount,
    active: activeCount,
    completed: completedCount,
  };

  return (
    <View className="gap-2">
      <Text className="text-sm text-neutral-600 dark:text-neutral-300">
        Total {totalCount} • Active {activeCount} • Completed {completedCount}
      </Text>
      <View className="flex-row gap-2">
        {FILTERS.map((filter) => (
          <View key={filter.value} className="flex-1">
            <Button
              variant={selectedFilter === filter.value ? "secondary" : "outline"}
              onPress={() => onChangeFilter(filter.value)}
              accessibilityLabel={`${filter.label} todos filter`}
            >
              {`${filter.label} (${countByFilter[filter.value]})`}
            </Button>
          </View>
        ))}
      </View>
    </View>
  );
}
