import { ThemedText } from '@/components/themed-text'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect } from 'react'
import { ActivityIndicator, Image, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import type { AnalyzingStepProps, SubmittingStepProps } from './types'

export const AnalyzingStep = ({ selectedImages }: AnalyzingStepProps) => {
  const pulse = useSharedValue(0)

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [pulse])

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pulse.value * 0.3,
  }))

  const isSingle = selectedImages.length === 1

  return (
    <View className="flex-1 justify-center items-center p-5">
      {isSingle ? (
        /* === Une seule image : affichage plein comme avant === */
        <View className="w-full max-w-[300px] items-center rounded-[20px] overflow-hidden relative">
          <Animated.Image
            source={{ uri: selectedImages[0].croppedUri || selectedImages[0].localUri || selectedImages[0].uri }}
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
      ) : (
        /* === Plusieurs images : grille 2 colonnes === */
        <View style={{ width: 220 }}>
          <View className="flex-row flex-wrap gap-[8px] justify-center">
            {selectedImages.slice(0, 6).map((img, index) => {
              const uri = img.croppedUri || img.localUri || img.uri
              return (
                <View
                  key={index}
                  style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', position: 'relative' }}
                >
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  <Animated.View style={[{ position: 'absolute', inset: 0 }, overlayAnimatedStyle]}>
                    <LinearGradient
                      colors={['#06b6d4', '#8b5cf6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ flex: 1 }}
                    />
                  </Animated.View>
                  {index === 5 && selectedImages.length > 6 && (
                    <View
                      className="absolute inset-0 justify-center items-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                    >
                      <ThemedText className="text-white font-bold text-[18px]">
                        +{selectedImages.length - 5}
                      </ThemedText>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </View>
      )}

      <ThemedText className="mt-5 text-[18px] font-semibold text-center">
        {isSingle ? 'Analyse du vêtement en cours...' : `Analyse de ${selectedImages.length} vêtements en cours...`}
      </ThemedText>
      <ThemedText className="mt-sm text-body-sm text-center opacity-60">
        L&apos;IA analyse {isSingle ? 'votre vêtement' : 'vos vêtements'} pour pré-remplir les informations
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

