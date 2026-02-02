import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View className="items-center justify-center flex-1 px-6">
      <Ionicons name="alert-circle-outline" size={80} color="#FF3B30" style={{ opacity: 0.8 }} />
      <ThemedText className="mt-4 text-base font-semibold text-center">
        Une erreur est survenue
      </ThemedText>
      <ThemedText className="mt-2 text-center opacity-70">
        {message}
      </ThemedText>
      {onRetry && (
        <View className="px-6 py-3 mt-6 rounded-xl" style={{ backgroundColor: iconColor + '20' }}>
          <ThemedText className="text-sm" style={{ color: iconColor }}>
            Veuillez réessayer
          </ThemedText>
        </View>
      )}
    </View>
  );
};
