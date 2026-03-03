import { ThemedText } from '@/components/themed-text'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import type { AnalyzingStepProps, SubmittingStepProps } from './types'

export const AnalyzingStep = ({ selectedImage }: AnalyzingStepProps) => {
  const imageUri = selectedImage?.croppedUri || selectedImage?.localUri || selectedImage?.uri
  const pulse = useSharedValue(0)

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    )
  }, [pulse])

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pulse.value * 0.3,
  }))

  return (
    <View className="flex-1 justify-center items-center p-5">
      <View className="w-full max-w-[300px] items-center rounded-[20px] overflow-hidden relative">
        <Animated.Image
          source={{ uri: imageUri }}
          className="w-full aspect-square"
          resizeMode="cover"
        />
        <Animated.View className="absolute inset-0" style={overlayAnimatedStyle}>
          <LinearGradient
            colors={['#06b6d4', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
      <ThemedText className="mt-5 text-[18px] font-semibold text-center">
        Analyse du vêtement en cours...
      </ThemedText>
      <ThemedText className="mt-sm text-body-sm text-center opacity-60">
        L&apos;IA analyse votre vêtement pour pré-remplir les informations
      </ThemedText>
    </View>
  )
}

export const SubmittingStep = ({ tintColor }: SubmittingStepProps) => {
  return (
    <View className="flex-1 justify-center items-center p-5">
      <ActivityIndicator size="large" color={tintColor} />
      <ThemedText className="mt-5 text-[18px] font-semibold text-center">
        Création en cours...
      </ThemedText>
    </View>
  )
}
