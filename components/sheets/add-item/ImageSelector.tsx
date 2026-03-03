import { useThemeColor } from '@/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import type { ImageSelectorProps } from './types'

const MAX_IMAGES = 10

export const ImageSelector = ({
  selectedImages,
  errorMessage,
  onPickImage,
  onOpenCamera,
  onAnalyze,
  onRemoveImage,
  tintColor,
  textColor,
}: ImageSelectorProps) => {
  const selectedTextColor = useThemeColor({}, 'onTint')
  const hasImages = selectedImages.length > 0

  return (
    <View className="flex-1 justify-center items-center p-5">
      {hasImages ? (
        /* === Vue avec images sélectionnées === */
        <View className="w-full items-center">
          {/* Grille de miniatures */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
          >
            {selectedImages.map((img, index) => {
              const uri = img.croppedUri || img.localUri || img.uri
              return (
                <View key={index} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri }}
                    style={{ width: 90, height: 90, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => onRemoveImage(index)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      backgroundColor: '#dc2626',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              )
            })}

            {/* Bouton + si < 10 images */}
            {selectedImages.length < MAX_IMAGES && (
              <View style={{ gap: 8 }}>
                <TouchableOpacity
                  onPress={onPickImage}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    borderColor: tintColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="images-outline" size={24} color={tintColor} />
                  <Text style={{ color: tintColor, fontSize: 11, marginTop: 4 }}>Galerie</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Compteur */}
          <Text className="mt-md text-body-sm" style={{ color: textColor, opacity: 0.6 }}>
            {selectedImages.length} / {MAX_IMAGES} photo{selectedImages.length > 1 ? 's' : ''}{' '}
            sélectionnée{selectedImages.length > 1 ? 's' : ''}
          </Text>

          {/* Boutons ajouter via caméra + galerie */}
          <View className="flex-row gap-base mt-sm">
            <TouchableOpacity className="p-sm" onPress={onOpenCamera}>
              <Text className="text-body-sm underline" style={{ color: '#666' }}>
                <Ionicons name="camera-outline" size={13} color="#666" /> Caméra
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* === Vue vide : 2 boutons côte à côte === */
        <View className="flex-row gap-base w-full max-w-[340px]">
          <TouchableOpacity
            className="flex-1 border-2 border-dashed rounded-[20px] justify-center items-center p-[14px]"
            style={{ borderColor: tintColor, aspectRatio: 0.85 }}
            onPress={onPickImage}
          >
            <Ionicons
              name="images-outline"
              size={48}
              color={tintColor}
              style={{ marginBottom: 16 }}
            />
            <Text
              className="text-[18px] font-semibold text-center mb-sm"
              style={{ color: textColor }}
            >
              Galerie
            </Text>
            <Text className="text-body-sm text-center" style={{ color: textColor, opacity: 0.6 }}>
              Importer depuis la galerie
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 border-2 border-dashed rounded-[20px] justify-center items-center p-[14px]"
            style={{ borderColor: tintColor, aspectRatio: 0.85 }}
            onPress={onOpenCamera}
          >
            <Ionicons
              name="camera-outline"
              size={48}
              color={tintColor}
              style={{ marginBottom: 16 }}
            />
            <Text
              className="text-[18px] font-semibold text-center mb-sm"
              style={{ color: textColor }}
            >
              Caméra
            </Text>
            <Text className="text-body-sm text-center" style={{ color: textColor, opacity: 0.6 }}>
              Prendre une photo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Message d'erreur */}
      {errorMessage && (
        <View className="mt-base p-md bg-[#fee2e2] rounded-[8px] max-w-[300px] w-full">
          <Text className="text-[#dc2626] text-center text-body-sm">{errorMessage}</Text>
        </View>
      )}

      {/* Bouton analyser */}
      {hasImages && (
        <TouchableOpacity
          className="mt-lg py-base px-xl rounded-md w-full max-w-[300px]"
          style={{ backgroundColor: tintColor }}
          onPress={onAnalyze}
        >
          <Text
            className="text-body font-semibold text-center"
            style={{ color: selectedTextColor }}
          >
            Analyser{' '}
            {selectedImages.length > 1 ? `${selectedImages.length} vêtements` : 'le vêtement'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
