import React from "react";
import { Animated, Text } from "react-native";
import { SelectionCounterProps } from "./types/media-gallery.types";

function SelectionCounterComponent({
  selectedCount,
  maxSelection,
}: SelectionCounterProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: selectedCount > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedCount, opacity]);

  if (selectedCount === 0) return null;

  return (
    <Animated.View
      style={{ opacity }}
      className="absolute top-0 left-0 right-0 z-10 px-4 py-2 border-b border-blue-100/50 bg-blue-50/80"
    >
      <Text className="text-sm font-medium text-center text-blue-700">
        {maxSelection
          ? `${selectedCount} / ${maxSelection} sélectionné${selectedCount > 1 ? "s" : ""}`
          : `${selectedCount} sélectionné${selectedCount > 1 ? "s" : ""}`}
      </Text>
    </Animated.View>
  );
}

// Memoize to prevent unnecessary re-renders
export const SelectionCounter = React.memo(SelectionCounterComponent);
