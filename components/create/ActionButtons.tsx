import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View, ActivityIndicator } from 'react-native'

interface ActionButtonsProps {
  onSave: () => void
  onPlan: () => void
  onDismiss: () => void
  isLoading?: boolean
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onPlan,
  onDismiss,
  isLoading = false,
}) => {
  const tintColor = useThemeColor({}, 'tint')
  const iconColor = useThemeColor({}, 'icon')

  return (
    <View className="flex-row gap-2 pb-3 px-4">
      {/* Enregistrer */}
      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
        style={{ backgroundColor: tintColor }}
        onPress={onSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <ThemedText className="ml-2 text-white font-semibold text-sm">
              Enregistrer
            </ThemedText>
          </>
        )}
      </TouchableOpacity>

      {/* Planifier */}
      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center py-3 rounded-xl border-2"
        style={{ borderColor: iconColor }}
        onPress={onPlan}
        disabled={isLoading}
      >
        <Ionicons name="calendar-outline" size={20} color={iconColor} />
        <ThemedText className="ml-2 font-semibold text-sm">Planifier</ThemedText>
      </TouchableOpacity>

      {/* Fermer */}
      <TouchableOpacity
        className="flex-row items-center justify-center py-3 px-4 rounded-xl border-2"
        style={{ borderColor: iconColor }}
        onPress={onDismiss}
        disabled={isLoading}
      >
        <Ionicons name="close-outline" size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
  )
}
