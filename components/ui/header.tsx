import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface HeaderProps {
  title: string
  onBack?: () => void
  actionComponent?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, actionComponent }) => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const textColor = useThemeColor({}, 'text')

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <View
      className="border-b border-[rgba(0,0,0,0.1)]"
      style={{
        backgroundColor,
        paddingTop: insets.top + 8,
        height: 44 + insets.top + 8,
      }}
    >
      <View className="flex-row items-center justify-between h-[44px] px-base">
        <Pressable
          onPress={handleBack}
          className="w-[40px] h-[40px] justify-center items-start"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={tintColor} />
        </Pressable>

        <ThemedText
          className="text-[17px] font-semibold flex-1 text-center leading-[22px]"
          style={{ color: textColor }}
          numberOfLines={1}
        >
          {title}
        </ThemedText>

        <View className="w-[40px] items-end">
          {actionComponent || <View className="w-[40px]" />}
        </View>
      </View>
    </View>
  )
}
