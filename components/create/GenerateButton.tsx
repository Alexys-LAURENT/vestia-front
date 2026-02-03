import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

interface GenerateButtonProps {
  onPress: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ 
  onPress, 
  isLoading,
  disabled = false 
}) => {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity 
      className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
      style={{ backgroundColor: tintColor, opacity: disabled ? 0.6 : 1 }}
      onPress={onPress}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Ionicons name="sparkles" size={20} color="#fff" />
          <ThemedText style={{ color: '#fff', marginLeft: 8, fontWeight: '600', fontSize: 16 }}>
            Générer
          </ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
};
