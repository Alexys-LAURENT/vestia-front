import { ItemAnalysisResponse } from '@/types/item-analysis'
import { api } from '@/utils/fetchApiClientSide'
import { Ionicons } from '@expo/vector-icons'
import React, { useCallback } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import type { ImageSelectorProps } from './types'

export const ImageSelector = ({
  selectedImage,
  errorMessage,
  onPickImage,
  onOpenCamera,
  tintColor,
  textColor,
  setErrorMessage,
  setFormState,
  setSelectedImage,
  setStep,
}: ImageSelectorProps) => {
  const imageUri = selectedImage?.croppedUri || selectedImage?.localUri || selectedImage?.uri

  const analyzeImage = useCallback(async () => {
    if (!selectedImage) return

    setStep('analyzing')
    setErrorMessage(null)

    try {
      const formData = new FormData()
      const imageUri = selectedImage.croppedUri || selectedImage.localUri || selectedImage.uri

      formData.append('itemImage', {
        uri: imageUri,
        type: selectedImage.mimeType || 'image/jpeg',
        name: selectedImage.filename || 'image.jpg',
      } as unknown as Blob)

      const response = await api.postFormData<ItemAnalysisResponse>('/items/analyse', formData)

      // Si on a eu une réponse positive de l'api
      if ('success' in response && response.success === true) {
        // On vérifie quand même que l'IA a bien retourné des données
        if ('data' in response && response.data) {
          const data = response.data
          setFormState({
            name: data.name,
            description: data.description,
            type: data.type,
            tags: data.tags,
            season: data.season[0] || 'printemps',
            formality: data.formality,
            mainColor: data.main_color,
            additionalColors: data.additional_colors,
            brand: '',
            reference: '',
          })
          setStep('form')
          return
        } else {
          // Si l'IA n'a pas retourné de données
          setErrorMessage("Une erreur est survenue lors de l'analyse")
          setStep('select-image')
          setSelectedImage(null)
          return
        }
      } else {
        // Si l'api a retourné une erreur

        // Si l'erreur vient de l'IA
        if ('reason' in response && response.reason) {
          setErrorMessage(response.reason)
          setStep('select-image')
          setSelectedImage(null)
        } else {
          // Si l'erreur vient de l'api
          setErrorMessage("Une erreur est survenue lors de l'analyse")
          setStep('select-image')
          setSelectedImage(null)
        }
        return
      }
    } catch (error) {
      console.error('Erreur analyse:', error)
      setErrorMessage("Une erreur est survenue lors de l'analyse")
      setStep('select-image')
      setSelectedImage(null)
    }
  }, [selectedImage, setFormState, setStep, setErrorMessage, setSelectedImage])

  return (
    <View className="flex-1 justify-center items-center p-5">
      {selectedImage && imageUri ? (
        <View className="w-full max-w-[300px] items-center">
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', aspectRatio: 1, borderRadius: 20 }}
            resizeMode="cover"
          />
          <View className="flex-row gap-base mt-md">
            <TouchableOpacity className="p-sm" onPress={onPickImage}>
              <Text className="text-[#666] text-body-sm underline">
                <Ionicons name="images-outline" size={14} color="#666" /> Galerie
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-sm" onPress={onOpenCamera}>
              <Text className="text-[#666] text-body-sm underline">
                <Ionicons name="camera-outline" size={14} color="#666" /> Caméra
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
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

      {errorMessage && (
        <View className="mt-base p-md bg-[#fee2e2] rounded-[8px] max-w-[300px] w-full">
          <Text className="text-[#dc2626] text-center text-body-sm">{errorMessage}</Text>
        </View>
      )}

      {selectedImage && (
        <TouchableOpacity
          className="mt-lg py-base px-xl rounded-md w-full max-w-[300px]"
          style={{ backgroundColor: tintColor }}
          onPress={analyzeImage}
        >
          <Text className="text-white text-body font-semibold text-center">
            Analyser le vêtement
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
