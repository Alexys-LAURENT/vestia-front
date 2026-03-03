import { ThemedText } from '@/components/themed-text'
import { Radius, Spacing, Typography } from '@/constants/theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import { MyUIMessage } from '@/types/my_ui_message'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'

const CARD_WIDTH = 120
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 1.2

interface DisplayItemsToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-displayItems' }>
  index: number
}

export const DisplayItemsToolRenderer = ({ part, index }: DisplayItemsToolRendererProps) => {
  const router = useRouter()
  const cardBackground = useThemeColor({}, 'backgroundSecondary')
  const textColor = useThemeColor({}, 'text')
  const textTertiary = useThemeColor({}, 'textTertiary')
  const borderColor = useThemeColor({}, 'border')
  const API_URL = process.env.EXPO_PUBLIC_API_URL

  if (part.state !== 'output-available' || !part.output?.items?.length) {
    return null
  }

  const items = part.output.items

  return (
    <ScrollView
      key={`part-tool-display-items-${index}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: Spacing.xs, gap: Spacing.sm }}
      className="my-sm"
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.idItem}
          className="overflow-hidden"
          style={{
            width: CARD_WIDTH,
            borderRadius: Radius.md,
            borderWidth: 0.5,
            backgroundColor: cardBackground,
            borderColor,
          }}
          activeOpacity={0.8}
          onPress={() => router.push(`/item/${item.idItem}`)}
        >
          <View className="w-full" style={{ height: CARD_IMAGE_HEIGHT }}>
            <Image
              source={{ uri: `${API_URL}${item.imageUrl}` }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="p-sm" style={{ gap: 2 }}>
            <ThemedText
              style={{
                fontSize: Typography.size.caption,
                fontWeight: Typography.weight.semibold,
                letterSpacing: -0.2,
                color: textColor,
              }}
              numberOfLines={1}
            >
              {item.name}
            </ThemedText>
            {item.type && (
              <ThemedText
                style={{ fontSize: Typography.size.micro, letterSpacing: 0.2, color: textTertiary }}
                numberOfLines={1}
              >
                {item.type}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}
