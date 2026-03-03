import { ThemedText } from '@/components/themed-text'
import { Typography } from '@/constants/theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import React, { useEffect, useRef } from 'react'
import { Animated, LayoutChangeEvent, TouchableOpacity, View } from 'react-native'

export type WardrobeTab = 'items' | 'looks'

interface WardrobeTabsProps {
  activeTab: WardrobeTab
  onTabChange: (tab: WardrobeTab) => void
}

export const WardrobeTabs: React.FC<WardrobeTabsProps> = ({ activeTab, onTabChange }) => {
  const textColor = useThemeColor({}, 'text')
  const textTertiary = useThemeColor({}, 'textTertiary')
  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor({}, 'border')

  const indicatorPosition = useRef(new Animated.Value(0)).current
  const [tabWidth, setTabWidth] = React.useState(0)

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: activeTab === 'items' ? 0 : 1,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start()
  }, [activeTab])

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    setTabWidth(width / 2)
  }

  const indicatorTranslate = indicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  })

  return (
    <View className="px-base mb-sm" onLayout={handleLayout}>
      <View className="flex-row relative border-b" style={{ borderBottomColor: borderColor }}>
        {/* Animated Indicator */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: -1,
              height: 2,
              backgroundColor: tintColor,
              transform: [{ translateX: indicatorTranslate }],
              width: tabWidth,
            },
          ]}
        />

        {/* Tabs */}
        <TouchableOpacity
          className="flex-1 py-md items-center justify-center"
          onPress={() => onTabChange('items')}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              {
                letterSpacing: -0.2,
                color: activeTab === 'items' ? textColor : textTertiary,
                fontSize: Typography.size.body,
                fontWeight:
                  activeTab === 'items' ? Typography.weight.semibold : Typography.weight.regular,
              },
            ]}
          >
            Vêtements
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-md items-center justify-center"
          onPress={() => onTabChange('looks')}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              {
                letterSpacing: -0.2,
                color: activeTab === 'looks' ? textColor : textTertiary,
                fontSize: Typography.size.body,
                fontWeight:
                  activeTab === 'looks' ? Typography.weight.semibold : Typography.weight.regular,
              },
            ]}
          >
            Tenues
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}
