import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Animated, View } from 'react-native';

interface GeneratingLookAnimationProps {
  pulseAnim: Animated.Value;
}

export const GeneratingLookAnimation: React.FC<GeneratingLookAnimationProps> = ({ pulseAnim }) => {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View className="flex-1 items-center justify-center">
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Ionicons name="sparkles" size={80} color={tintColor} />
      </Animated.View>
      <ActivityIndicator size="large" color={tintColor} className="mt-6" />
      <ThemedText className="mt-4 text-base opacity-70">
        Création de votre tenue...
      </ThemedText>
    </View>
  );
};
