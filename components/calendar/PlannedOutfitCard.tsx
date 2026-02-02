import { LookCard } from '@/components/LookCard'
import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import type { PlannedOutfit } from '@/types/entities'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

interface PlannedOutfitCardProps {
  plannedOutfit: PlannedOutfit
  onDelete: (id: number) => void
}

export const PlannedOutfitCard: React.FC<PlannedOutfitCardProps> = ({
  plannedOutfit,
  onDelete,
}) => {
  const backgroundColor = useThemeColor({}, 'background')
  const borderColor = useThemeColor({}, 'border')
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const mutedColor = `${textColor}80`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <View
      className="mb-4 rounded-2xl overflow-hidden"
      style={{ backgroundColor, borderColor, borderWidth: 1 }}
    >
      {/* Header with date and delete button */}
      <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor }}>
        <View className="flex-1">
          <ThemedText className="text-lg font-bold">{formatDate(plannedOutfit.plannedDate)}</ThemedText>
        </View>
        <TouchableOpacity onPress={() => onDelete(plannedOutfit.idPlannedOutfit)} className="p-2">
          <Ionicons name="trash-outline" size={22} color={tintColor} />
        </TouchableOpacity>
      </View>

      {/* Look Card */}
      <View className="p-4">
        <LookCard items={plannedOutfit.look.items} />
      </View>

      {/* Notes if present */}
      {plannedOutfit.notes && (
        <View className="px-4 pb-4">
          <View className="p-3 rounded-xl" style={{ backgroundColor: `${mutedColor}20` }}>
            <ThemedText className="text-sm" style={{ color: mutedColor }}>
              {plannedOutfit.notes}
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  )
}
