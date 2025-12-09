import React from "react";
import { Text, View } from "react-native";

interface CropFramePlaceholderProps {
  height: number;
}

export function CropFramePlaceholder({ height }: CropFramePlaceholderProps) {
  const containerHeight = height;
  return (
    <View
      className="relative items-center justify-center bg-black"
      style={{ height: containerHeight }}
    >
      {/* Zone de crop vide */}
      <View className="items-center justify-center ">
        <Text className="px-8 text-sm text-center text-white opacity-70">
          Sélectionnez une image{"\n"}pour la recadrer
        </Text>
      </View>
    </View>
  );
}
