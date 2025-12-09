import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { MediaType } from "./types/media-gallery.types";

interface EmptyStateProps {
  currentFilter: MediaType;
}

const EMPTY_STATE_MESSAGES: Record<
  MediaType,
  { title: string; subtitle: string }
> = {
  all: {
    title: "Aucun média trouvé",
    subtitle: "Vous n'avez pas encore de photos ou de vidéos",
  },
  photo: {
    title: "Aucune photo trouvée",
    subtitle: "Vous n'avez pas encore de photos",
  },
  video: {
    title: "Aucune vidéo trouvée",
    subtitle: "Vous n'avez pas encore de vidéos",
  },
};

export function EmptyState({ currentFilter }: EmptyStateProps) {
  const message = EMPTY_STATE_MESSAGES[currentFilter];

  return (
    <View className="items-center justify-center flex-1 p-8">
      <View className="items-center justify-center w-20 h-20 mb-4 bg-gray-200 rounded-full">
        <Ionicons name="images-outline" size={40} color="#9CA3AF" />
      </View>
      <Text className="mb-2 text-lg font-semibold text-center text-gray-800">
        {message.title}
      </Text>
      <Text className="text-sm text-center text-gray-600">
        {message.subtitle}
      </Text>
    </View>
  );
}
