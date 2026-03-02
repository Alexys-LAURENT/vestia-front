import { ItemAnalysisResponse } from '@/types/item-analysis'
import { api } from '@/utils/fetchApiClientSide'
import { Ionicons } from '@expo/vector-icons'
import React, { useCallback } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
    <View style={styles.container}>
      {selectedImage && imageUri ? (
        <View style={styles.selectedImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.selectedImage} resizeMode="cover" />
          <View style={styles.changeImageRow}>
            <TouchableOpacity style={styles.changeImageButton} onPress={onPickImage}>
              <Text style={styles.changeImageText}>
                <Ionicons name="images-outline" size={14} color="#666" /> Galerie
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.changeImageButton} onPress={onOpenCamera}>
              <Text style={styles.changeImageText}>
                <Ionicons name="camera-outline" size={14} color="#666" /> Caméra
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.imagePickerButton, { borderColor: tintColor }]}
            onPress={onPickImage}
          >
            <Ionicons
              name="images-outline"
              size={48}
              color={tintColor}
              style={styles.imagePickerIcon}
            />
            <Text style={[styles.imagePickerText, { color: textColor }]}>Galerie</Text>
            <Text style={[styles.imagePickerSubtext, { color: textColor, opacity: 0.6 }]}>
              Importer depuis la galerie
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.imagePickerButton, { borderColor: tintColor }]}
            onPress={onOpenCamera}
          >
            <Ionicons
              name="camera-outline"
              size={48}
              color={tintColor}
              style={styles.imagePickerIcon}
            />
            <Text style={[styles.imagePickerText, { color: textColor }]}>Caméra</Text>
            <Text style={[styles.imagePickerSubtext, { color: textColor, opacity: 0.6 }]}>
              Prendre une photo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {selectedImage && (
        <TouchableOpacity
          style={[styles.validateButton, { backgroundColor: tintColor }]}
          onPress={analyzeImage}
        >
          <Text style={styles.validateButtonText}>Analyser le vêtement</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    maxWidth: 340,
  },
  imagePickerButton: {
    flex: 1,
    aspectRatio: 0.85,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  imagePickerIcon: {
    marginBottom: 16,
  },
  imagePickerText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  imagePickerSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  selectedImageContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
  },
  changeImageRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  changeImageButton: {
    padding: 8,
  },
  changeImageText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  validateButton: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    maxWidth: 300,
    width: '100%',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14,
  },
})
