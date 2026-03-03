import { ThemedText } from '@/components/themed-text'
import { Shadows, Spacing, Typography } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useThemeColor } from '@/hooks/use-theme-color'
import type { Look } from '@/types/entities'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Dimensions, Image, TouchableOpacity, View } from 'react-native'

interface LookCardProps {
  look: Look
  notes?: string | null
  onDelete?: () => void
  fullWidth?: boolean
}

const SCREEN_WIDTH = Dimensions.get('window').width
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.base * 3) / 2

export const LookCard: React.FC<LookCardProps> = ({ look, notes, onDelete, fullWidth }) => {
  const router = useRouter()
  const cardBackground = useThemeColor({}, 'backgroundSecondary')
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')
  const textTertiary = useThemeColor({}, 'textTertiary')
  const tintColor = useThemeColor({}, 'tint')
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const shadows = Shadows[theme]
  const API_URL = process.env.EXPO_PUBLIC_API_URL
  const cardWidth = fullWidth ? SCREEN_WIDTH - Spacing.base * 2 : CARD_WIDTH
  const imageHeight = cardWidth * (fullWidth ? 0.6 : 1.2)

  const handlePress = () => {
    router.push(`/look/${look.idLook}`)
  }

  // Take first 4 items for preview
  const previewItems = look.items.slice(0, 4)
  const hasMore = look.items.length > 4

  return (
    <TouchableOpacity
      className="rounded-lg overflow-hidden mb-base"
      style={{
        width: cardWidth,
        backgroundColor: cardBackground,
        ...shadows.md,
      }}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Grid of items */}
      {look.avatarImageUrl ? (
        <Image
          source={{ uri: look.avatarImageUrl }}
          className="w-full"
          style={{ height: imageHeight }}
          resizeMode="cover"
        />
      ) : (
        <View className="w-full flex-row flex-wrap relative" style={{ height: imageHeight }}>
          {previewItems.map((item, index) => (
            <View
              key={item.idItem}
              className="w-1/2 h-1/2"
              style={
                index === 0
                  ? {
                      borderRightWidth: 0.5,
                      borderBottomWidth: 0.5,
                      borderColor: 'rgba(0,0,0,0.1)',
                    }
                  : index === 1
                    ? { borderBottomWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)' }
                    : index === 2
                      ? { borderRightWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)' }
                      : undefined
              }
            >
              <Image
                source={{ uri: `${API_URL}${item.imageUrl}` }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          ))}

          {/* Fill empty slots */}
          {previewItems.length < 4 &&
            Array.from({ length: 4 - previewItems.length }).map((_, i) => (
              <View key={`empty-${i}`} className="w-1/2 h-1/2 bg-[#E0E0E0]" />
            ))}

          {/* Overlay for more items */}
          {hasMore && (
            <View className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[rgba(0,0,0,0.7)] justify-center items-center">
              <ThemedText
                style={{
                  textShadowColor: 'rgba(0,0,0,0.5)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                  color: '#FFFFFF',
                  fontSize: Typography.size.bodySmall,
                  fontWeight: Typography.weight.bold,
                }}
              >
                +{look.items.length - 4}
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* AI Badge */}
      {look.isAiGenerated && (
        <View
          className="absolute top-sm right-sm w-[28px] h-[28px] rounded-full items-center justify-center"
          style={{ backgroundColor: tintColor }}
        >
          <Ionicons name="sparkles" size={14} color={cardBackground} />
        </View>
      )}

      {/* Info */}
      <View className="p-md gap-xs">
        <View className="flex-row items-center justify-between">
          <ThemedText
            style={{
              letterSpacing: -0.2,
              color: textColor,
              fontSize: Typography.size.bodySmall,
              fontWeight: Typography.weight.semibold,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {look.event || 'Casual'}
          </ThemedText>
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={16} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>

        {notes ? (
          <>
            <ThemedText
              style={{
                letterSpacing: 1,
                color: textTertiary,
                fontSize: Typography.size.micro,
                fontWeight: Typography.weight.medium,
              }}
            >
              {look.items.length} ITEM{look.items.length > 1 ? 'S' : ''}
            </ThemedText>
            <ThemedText
              style={{
                letterSpacing: 0,
                color: textSecondary,
                fontSize: Typography.size.micro,
              }}
              numberOfLines={1}
            >
              {notes}
            </ThemedText>
          </>
        ) : (
          <ThemedText
            style={{
              letterSpacing: 1,
              color: textTertiary,
              fontSize: Typography.size.micro,
              fontWeight: Typography.weight.medium,
            }}
          >
            {look.items.length} ITEM{look.items.length > 1 ? 'S' : ''}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  )
}
