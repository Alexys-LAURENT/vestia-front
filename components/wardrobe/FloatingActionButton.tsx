import { Shadows } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'
import React, { useRef } from 'react'
import { Animated, TouchableOpacity } from 'react-native'

interface FloatingActionButtonProps {
  onPress: () => void
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  const tintColor = useThemeColor({}, 'tint')
  const backgroundColor = useThemeColor({}, 'backgroundSecondary')
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const shadows = Shadows[theme]

  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start()
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      className="absolute bottom-xl right-xl w-[64px] h-[64px]"
    >
      <Animated.View
        className="w-[64px] h-[64px] rounded-full items-center justify-center"
        style={{
          backgroundColor: tintColor,
          ...shadows.xl,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Ionicons name="add" size={32} color={backgroundColor} />
      </Animated.View>
    </TouchableOpacity>
  )
}
