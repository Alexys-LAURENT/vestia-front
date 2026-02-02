import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

export const EmptyLookState: React.FC = () => {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View className="flex-1 items-center justify-center">
      <Ionicons name="shirt-outline" size={80} color={iconColor} style={{ opacity: 0.3 }} />
      <ThemedText className="mt-4 text-center opacity-50">
        Générez une tenue avec l&apos;IA
      </ThemedText>
    </View>
  );
};
