import { ThemedText } from '@/components/themed-text'
import { Radius, Spacing, Typography } from '@/constants/theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import { MyUIMessage } from '@/types/my_ui_message'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

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
      contentContainerStyle={styles.scrollContainer}
      style={styles.scrollView}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.idItem}
          style={[styles.card, { backgroundColor: cardBackground, borderColor }]}
          activeOpacity={0.8}
          onPress={() => router.push(`/item/${item.idItem}`)}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `${API_URL}${item.imageUrl}` }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <View style={styles.content}>
            <ThemedText style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            {item.type && (
              <ThemedText style={[styles.type, { color: textTertiary }]} numberOfLines={1}>
                {item.type}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    marginVertical: Spacing.sm,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  imageContainer: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: Spacing.sm,
    gap: 2,
  },
  name: {
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.semibold,
    letterSpacing: -0.2,
  },
  type: {
    fontSize: Typography.size.micro,
    letterSpacing: 0.2,
  },
})
