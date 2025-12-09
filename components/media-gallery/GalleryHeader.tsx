import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GalleryHeaderProps, MediaType } from "./types/media-gallery.types";

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  all: "Tous",
  photo: "Photos",
  video: "Vidéos",
};

const FILTERS: MediaType[] = ["all", "photo", "video"];

function GalleryHeaderComponent({
  currentFilter,
  onFilterChange,
  onValidate,
  selectedCount,
  isValidateDisabled,
  canShowFilters,
  onOpenAlbumSelector,
  selectedAlbumTitle,
  isAlbumSelectorOpen,
}: GalleryHeaderProps) {
  return (
    <View className="border-b border-gray-200 dark:border-gray-800">
      <View className="flex-row items-center justify-between px-4 pt-3 pb-3">
        {/* Album selector button */}
        {onOpenAlbumSelector && (
          <TouchableOpacity onPress={onOpenAlbumSelector} className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {isAlbumSelectorOpen
                  ? "Sélectionnez un album"
                  : selectedAlbumTitle || "Récents"}
              </Text>
              {/* <Text className="text-gray-500 dark:text-gray-400">▼</Text> */}
              {isAlbumSelectorOpen ? (
                <Ionicons name="chevron-up" size={16} color="#6B7280" />
              ) : (
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              )}
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onValidate}
          disabled={isValidateDisabled}
          className={`px-4 py-2 rounded-lg ${isValidateDisabled ? "bg-gray-300 dark:bg-gray-800" : "bg-blue-500"}`}
        >
          <Text
            className={`font-semibold ${
              isValidateDisabled ? "text-gray-500" : "text-white"
            }`}
          >
            {selectedCount > 0 ? `Valider (${selectedCount})` : "Valider"}
          </Text>
        </TouchableOpacity>
      </View>

      {canShowFilters && (
        <View className="flex-row gap-2 px-4 pb-3">
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => onFilterChange(filter)}
              className={`flex-1 py-2 px-4 rounded-full ${
                currentFilter === filter
                  ? "bg-blue-500"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  currentFilter === filter
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {MEDIA_TYPE_LABELS[filter]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// Memoize to prevent unnecessary re-renders
export const GalleryHeader = React.memo(GalleryHeaderComponent);
