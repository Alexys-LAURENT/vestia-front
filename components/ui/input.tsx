import { Radius, Spacing, Typography } from '@/constants/theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import React, { useState } from 'react'
import { Animated, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native'

export type InputVariant = 'default' | 'search'

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  icon?: React.ReactNode
  variant?: InputVariant
  containerStyle?: ViewStyle
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  variant = 'default',
  containerStyle,
  ...textInputProps
}) => {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary')
  const textColor = useThemeColor({}, 'text')
  const borderColor = useThemeColor({}, 'border')
  const errorColor = '#DC2626'
  const placeholderColor = useThemeColor({}, 'textTertiary')

  const [isFocused, setIsFocused] = useState(false)
  const borderWidth = new Animated.Value(1)

  const handleFocus = () => {
    setIsFocused(true)
    Animated.timing(borderWidth, {
      toValue: 2,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handleBlur = () => {
    setIsFocused(false)
    Animated.timing(borderWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  return (
    <View className="w-full" style={containerStyle}>
      {label && (
        <Text
          className="mb-sm uppercase"
          style={{
            letterSpacing: 0.5,
            color: error ? errorColor : textColor,
            fontSize: Typography.size.caption,
            fontWeight: Typography.weight.medium,
          }}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.base,
          backgroundColor,
          borderColor: error ? errorColor : isFocused ? textColor : borderColor,
          borderWidth,
          borderRadius: variant === 'search' ? Radius.full : Radius.md,
        }}
      >
        {icon && <View className="mr-sm">{icon}</View>}

        <TextInput
          {...textInputProps}
          style={{
            flex: 1,
            paddingVertical: Spacing.md,
            fontWeight: Typography.weight.regular,
            color: textColor,
            fontSize: Typography.size.body,
            paddingLeft: icon ? 0 : undefined,
          }}
          placeholderTextColor={placeholderColor}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>

      {error && (
        <Text
          className="mt-xs"
          style={{
            fontWeight: Typography.weight.medium,
            color: errorColor,
            fontSize: Typography.size.caption,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  )
}
