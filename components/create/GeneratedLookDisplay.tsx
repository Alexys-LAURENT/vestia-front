import { LookCard } from '@/components/LookCard';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Item } from '@/types/entities';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, ScrollView, TouchableOpacity, View } from 'react-native';

interface GeneratedLookDisplayProps {
  items: (Item & { reason: string; isForced: boolean })[];
  fadeAnim: Animated.Value;
  onReasonsPress: () => void;
  onRegenerate: () => void;
  onChoose: () => void;
  mode?: 'choosing' | 'chosen';
  actionButtons?: React.ReactNode;
}

export const GeneratedLookDisplay: React.FC<GeneratedLookDisplayProps> = ({
  items,
  fadeAnim,
  onReasonsPress,
  onRegenerate,
  onChoose,
  mode = 'choosing',
  actionButtons,
}) => {
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
      <ScrollView className="flex-1" contentContainerClassName="py-4">
        <LookCard items={items} />

        {/* Bouton "Pourquoi ce choix ?" */}
        <TouchableOpacity
          className="flex-row items-center justify-center py-3 mt-3"
          onPress={onReasonsPress}
        >
          <Ionicons name="help-circle-outline" size={20} color={tintColor} />
          <ThemedText className="ml-2 font-medium" style={{ color: tintColor }}>
            Pourquoi ce choix ?
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Boutons d'action - Affichage conditionnel selon le mode */}
      {mode === 'choosing' ? (
        <View className="flex-row gap-3 pb-3 px-4">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-3 rounded-xl border-2"
            style={{ borderColor: iconColor }}
            onPress={onRegenerate}
          >
            <Ionicons name="thumbs-down-outline" size={22} color={iconColor} />
            <ThemedText className="ml-2 font-semibold">Autre tenue</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-[1.5] flex-row items-center justify-center py-3 rounded-xl"
            style={{ backgroundColor: tintColor }}
            onPress={onChoose}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <ThemedText className="ml-2 text-white font-semibold">Je choisis ça !</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        actionButtons
      )}
    </Animated.View>
  );
};
