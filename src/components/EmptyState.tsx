import { StyleSheet, Text, View, useColorScheme } from "react-native";

import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>{title}</Text>
      <Text style={[styles.description, isDark ? styles.descriptionDark : styles.descriptionLight]}>
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <View style={styles.actionContainer}>
          <Button variant="outline" onPress={onActionPress}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 20,
  },
  containerLight: {
    borderColor: "#d4d4d4",
    backgroundColor: "#fafafa",
  },
  containerDark: {
    borderColor: "#525252",
    backgroundColor: "rgba(23, 23, 23, 0.5)",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  titleLight: {
    color: "#171717",
  },
  titleDark: {
    color: "#f5f5f5",
  },
  description: {
    marginTop: 4,
    fontSize: 14,
  },
  descriptionLight: {
    color: "#525252",
  },
  descriptionDark: {
    color: "#d4d4d4",
  },
  actionContainer: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
});
