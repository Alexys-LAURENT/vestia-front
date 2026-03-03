import { useColorScheme } from '@/hooks/use-color-scheme'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera'
import React, { useCallback, useRef, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { MediaAssetWithUri } from '../../media-gallery/types/media-gallery.types'

interface CameraCaptureProps {
  onCapture: (image: MediaAssetWithUri) => void
  onClose: () => void
}

export const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const cameraRef = useRef<CameraView>(null)
  const [facing, setFacing] = useState<CameraType>('back')
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off')
  const [isTaking, setIsTaking] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  const tintColor = useThemeColor({}, 'tint')
  const isDark = useColorScheme() === 'dark'
  const selectedTextColor = isDark ? '#0A0A0A' : '#FFFFFF'

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'))
  }, [])

  const toggleFlash = useCallback(() => {
    setFlash((prev) => {
      if (prev === 'off') return 'on'
      if (prev === 'on') return 'auto'
      return 'off'
    })
  }, [])

  const flashIconName =
    flash === 'off'
      ? ('flash-off' as const)
      : flash === 'on'
        ? ('flash' as const)
        : ('flash-outline' as const)

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isTaking) return

    setIsTaking(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      })

      if (photo) {
        const mediaAsset: MediaAssetWithUri = {
          id: `camera-${Date.now()}`,
          uri: photo.uri,
          localUri: photo.uri,
          width: photo.width,
          height: photo.height,
          filename: `photo_${Date.now()}.jpg`,
          mediaType: 'photo',
          duration: 0,
          creationTime: Date.now(),
          modificationTime: Date.now(),
          albumId: '',
          mimeType: 'image/jpeg',
        }
        onCapture(mediaAsset)
      }
    } catch (error) {
      console.error('Erreur prise de photo:', error)
    } finally {
      setIsTaking(false)
    }
  }, [isTaking, onCapture])

  // Permissions en cours de chargement
  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center p-[30px]">
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center p-[30px]">
        <Text className="text-white text-body text-center mb-5">
          L&apos;accès à la caméra est nécessaire pour prendre des photos.
        </Text>
        {permission.canAskAgain ? (
          <TouchableOpacity
            className="py-[14px] px-[28px] rounded-md"
            style={{ backgroundColor: tintColor }}
            onPress={requestPermission}
          >
            <Text className="text-body font-semibold" style={{ color: selectedTextColor }}>
              Autoriser la caméra
            </Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-[#aaa] text-body-sm text-center mt-[10px]">
            Veuillez autoriser l&apos;accès dans les réglages de votre appareil.
          </Text>
        )}
        <TouchableOpacity className="mt-5 p-[10px]" onPress={onClose}>
          <Text className="text-body font-medium" style={{ color: tintColor }}>
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} className="flex-1" facing={facing} flash={flash} mode="picture">
        <SafeAreaView className="flex-1 justify-between">
          {/* Header */}
          <View className="flex-row justify-between px-5 pt-sm">
            <TouchableOpacity
              onPress={onClose}
              className="w-[44px] h-[44px] rounded-full bg-[rgba(0,0,0,0.4)] justify-center items-center"
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleFlash}
              className="w-[44px] h-[44px] rounded-full bg-[rgba(0,0,0,0.4)] justify-center items-center"
            >
              <Ionicons name={flashIconName} size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View className="flex-row justify-between items-center px-10 pb-[30px]">
            {/* Spacer */}
            <View className="w-[44px] h-[44px] justify-center items-center" />

            {/* Shutter */}
            <TouchableOpacity
              className="w-[76px] h-[76px] rounded-full border-4 border-white justify-center items-center"
              onPress={takePicture}
              disabled={isTaking}
              activeOpacity={0.7}
            >
              <View
                className={`w-[62px] h-[62px] rounded-full ${isTaking ? 'bg-[#ccc]' : 'bg-white'}`}
              />
            </TouchableOpacity>

            {/* Flip camera */}
            <TouchableOpacity
              className="w-[44px] h-[44px] justify-center items-center"
              onPress={toggleFacing}
            >
              <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}
