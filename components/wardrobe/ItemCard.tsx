import { ThemedText } from '@/components/themed-text'
import { Shadows, Spacing, Typography } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useThemeColor } from '@/hooks/use-theme-color'
import type { Item } from '@/types/entities'
import { useRouter } from 'expo-router'
import React from 'react'
import { Dimensions, Image, TouchableOpacity, View } from 'react-native'

interface ItemCardProps {
  item: Item
  customOnPress?: (item: Item) => void
}

const SCREEN_WIDTH = Dimensions.get('window').width
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.base * 3) / 2 // 2 columns with padding

export const ItemCard: React.FC<ItemCardProps> = ({ item, customOnPress }) => {
  const router = useRouter()
  const cardBackground = useThemeColor({}, 'backgroundSecondary')
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')
  const textTertiary = useThemeColor({}, 'textTertiary')
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const shadows = Shadows[theme]
  const API_URL = process.env.EXPO_PUBLIC_API_URL

  const handlePress = () => {
    if (customOnPress) {
      customOnPress(item)
      return
    }
    router.push(`/item/${item.idItem}`)
  }

  return (
    <TouchableOpacity
      className="rounded-lg overflow-hidden mb-base"
      style={{
        width: CARD_WIDTH,
        backgroundColor: cardBackground,
        ...shadows.md,
      }}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View className="w-full relative" style={{ height: CARD_WIDTH * 1.2 }}>
        <Image
          source={{ uri: `${API_URL}${item.imageUrl}` }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute bottom-0 left-0 right-0 h-[30%] bg-transparent" />
      </View>

      {/* Content */}
      <View className="p-md gap-xs">
        <ThemedText
          style={{
            letterSpacing: -0.2,
            color: textColor,
            fontSize: Typography.size.bodySmall,
            fontWeight: Typography.weight.semibold,
          }}
          numberOfLines={1}
        >
          {item.name}
        </ThemedText>

        <ThemedText
          style={{
            letterSpacing: 0.2,
            color: textTertiary,
            fontSize: Typography.size.caption,
            fontWeight: Typography.weight.regular,
          }}
          numberOfLines={1}
        >
          {item.type}
        </ThemedText>

        {item.brand && (
          <ThemedText
            style={{
              letterSpacing: 0.5,
              marginTop: 2,
              color: textSecondary,
              fontSize: Typography.size.micro,
              fontWeight: Typography.weight.medium,
            }}
            numberOfLines={1}
          >
            {item.brand.toUpperCase()}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  )
}
