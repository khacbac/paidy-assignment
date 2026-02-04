import { StyleSheet, Text, useColorScheme, View } from "react-native";

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
  const isDark = useColorScheme() === "dark";
  const countByFilter: Record<TodoFilter, number> = {
    all: totalCount,
    active: activeCount,
    completed: completedCount,
  };

  return (
    <View style={styles.container}>
      <Text
        style={[styles.stats, isDark ? styles.statsDark : styles.statsLight]}
      >
        Total {totalCount} • Active {activeCount} • Completed {completedCount}
      </Text>
      <View style={styles.filtersRow}>
        {FILTERS.map((filter) => (
          <View key={filter.value} style={styles.flexOne}>
            <Button
              variant={
                selectedFilter === filter.value ? "secondary" : "outline"
              }
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

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  stats: {
    fontSize: 14,
  },
  statsLight: {
    color: "#525252",
  },
  statsDark: {
    color: "#d4d4d4",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
  },
  flexOne: {
    flex: 1,
  },
});
