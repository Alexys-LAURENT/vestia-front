import { ItemMenuSheetButton } from '@/components/itemPage/ItemMenuSheetButton'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Header } from '@/components/ui/header'
import { Spacing, Typography } from '@/constants/theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import type { Item } from '@/types/entities'
import { fetchApi } from '@/utils/fetchApiClientSide'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Dimensions, Image, ScrollView, View } from 'react-native'
import { SuccessResponse } from '../../types/requests'

const SCREEN_WIDTH = Dimensions.get('window').width
const IMAGE_HEIGHT = SCREEN_WIDTH * 1.25 // Ratio 4:5 pour aesthetic fashion

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams()
  const [item, setItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')
  const textTertiary = useThemeColor({}, 'textTertiary')
  const borderColor = useThemeColor({}, 'border')
  const tintColor = useThemeColor({}, 'tint')

  // Animations
  const slideAnim = useRef(new Animated.Value(50)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  const loadItem = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fetchApi<SuccessResponse<Item>>(`/items/${id}`, {
        method: 'GET',
      })

      if ('error' in data) {
        throw new Error('message' in data ? data.message : 'Erreur inconnue')
      }
      setItem(data.data)

      // Animate in after data loads
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } catch (err) {
      setError('Unable to load item details')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [fadeAnim, id, slideAnim])

  useEffect(() => {
    if (id) {
      loadItem()
    }
  }, [id, loadItem])

  const API_URL = process.env.EXPO_PUBLIC_API_URL

  const imageUrl = React.useMemo(() => {
    if (!item?.imageUrl || !API_URL) return null
    try {
      return encodeURI(`${API_URL}${item.imageUrl}`)
    } catch {
      return null
    }
  }, [item?.imageUrl, API_URL])

  if (isLoading) {
    return (
      <ThemedView className="items-center justify-center flex-1">
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    )
  }

  if (error || !item) {
    return (
      <ThemedView className="items-center justify-center flex-1">
        <ThemedText style={{ color: textColor }}>{error || 'Item not found'}</ThemedText>
      </ThemedView>
    )
  }

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <Header
        title={item.name}
        actionComponent={<ItemMenuSheetButton itemId={item.idItem} onEditSuccess={loadItem} />}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {imageUrl && (
          <View className="w-full bg-[#F5F5F5]" style={{ height: IMAGE_HEIGHT }}>
            <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
          </View>
        )}

        <Animated.View
          className="px-xl pt-xl"
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Title Section */}
          <View className="mb-lg">
            <ThemedText
              style={[
                {
                  letterSpacing: Typography.letterSpacing.tight,
                  marginBottom: Spacing.xs,
                  lineHeight: Typography.size.title * 1.2,
                  color: textColor,
                  fontSize: Typography.size.title,
                  fontWeight: Typography.weight.bold,
                  fontFamily: Typography.family.display,
                },
              ]}
            >
              {item.name}
            </ThemedText>

            {item.brand && (
              <ThemedText
                style={[
                  {
                    letterSpacing: -0.3,
                    color: textSecondary,
                    fontSize: Typography.size.subheading,
                    fontWeight: Typography.weight.regular,
                    fontStyle: 'italic',
                  },
                ]}
              >
                {item.brand}
              </ThemedText>
            )}
          </View>

          {/* Divider */}
          <View className="h-[1px] my-lg" style={{ backgroundColor: borderColor }} />

          {/* Details Section */}
          <View className="mb-lg">
            <ThemedText
              style={[
                {
                  letterSpacing: Typography.letterSpacing.wide,
                  marginBottom: Spacing.base,
                  textTransform: 'uppercase',
                  color: textColor,
                  fontSize: Typography.size.micro,
                  fontWeight: Typography.weight.semibold,
                },
              ]}
            >
              DÉTAILS
            </ThemedText>

            <View className="gap-md">
              <DetailRow
                label="TYPE"
                value={item.type}
                textColor={textSecondary}
                textTertiary={textTertiary}
              />
              <DetailRow
                label="SAISON"
                value={item.season}
                textColor={textSecondary}
                textTertiary={textTertiary}
              />
              <DetailRow
                label="FORMALITÉ"
                value={item.formality}
                textColor={textSecondary}
                textTertiary={textTertiary}
              />
              <DetailRow
                label="COULEUR"
                value={item.mainColor}
                textColor={textSecondary}
                textTertiary={textTertiary}
              />
            </View>
          </View>

          {/* Description Section */}
          {item.description && (
            <>
              <View className="h-[1px] my-lg" style={{ backgroundColor: borderColor }} />

              <View className="mb-base">
                <ThemedText
                  style={[
                    {
                      letterSpacing: Typography.letterSpacing.wide,
                      marginBottom: Spacing.base,
                      textTransform: 'uppercase',
                      color: textColor,
                      fontSize: Typography.size.micro,
                      fontWeight: Typography.weight.semibold,
                    },
                  ]}
                >
                  DESCRIPTION
                </ThemedText>

                <ThemedText
                  style={[
                    {
                      letterSpacing: -0.2,
                      color: textSecondary,
                      fontSize: Typography.size.body,
                      fontWeight: Typography.weight.regular,
                      lineHeight: Typography.size.body * Typography.lineHeight.relaxed,
                    },
                  ]}
                >
                  {item.description}
                </ThemedText>
              </View>
            </>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: Spacing['3xl'] }} />
        </Animated.View>
      </ScrollView>
    </View>
  )
}

// Helper component for detail rows
const DetailRow: React.FC<{
  label: string
  value: string
  textColor: string
  textTertiary: string
}> = ({ label, value, textColor, textTertiary }) => (
  <View className="flex-row items-center justify-between">
    <ThemedText
      style={[
        {
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: textTertiary,
          fontSize: Typography.size.caption,
          fontWeight: Typography.weight.medium,
        },
      ]}
    >
      {label}
    </ThemedText>
    <ThemedText
      style={[
        {
          letterSpacing: -0.2,
          color: textColor,
          fontSize: Typography.size.body,
          fontWeight: Typography.weight.regular,
        },
      ]}
    >
      {value}
    </ThemedText>
  </View>
)
