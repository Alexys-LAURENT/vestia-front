import { useThemeColor } from '@/hooks/use-theme-color'
import type { ItemAnalysisResponse, ItemFormState } from '@/types/item-analysis'
import { api } from '@/utils/fetchApiClientSide'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import React, { useCallback, useState } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  AnalyzingStep,
  CameraCapture,
  ImageSelector,
  type AddItemStep,
} from '.'
import { useImagePicker } from '../../media-gallery'
import type { MediaAssetWithUri } from '../../media-gallery/types/media-gallery.types'
import { ThemedText } from '../../themed-text'
import { Sheet, useSheetRef } from '../Sheet'
import { MultiItemForms } from './MultiItemForms'
import type { FormItem } from './types'

const MAX_IMAGES = 10

interface AddItemSheetProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const AddItemSheet = ({ isOpen, onClose, onSuccess }: AddItemSheetProps) => {
  const sheetRef = useSheetRef()
  const { pick } = useImagePicker()

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')

  // State
  const [step, setStep] = useState<AddItemStep>('select-image')
  const [selectedImages, setSelectedImages] = useState<MediaAssetWithUri[]>([])
  const [formItems, setFormItems] = useState<FormItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present()
    } else {
      sheetRef.current?.dismiss()
    }
  }, [isOpen, sheetRef])

  const resetState = useCallback(() => {
    setStep('select-image')
    setSelectedImages([])
    setFormItems([])
    setErrorMessage(null)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [onClose, resetState])

  // Sélection depuis la galerie (max 10, en complétant la liste existante)
  const pickImage = useCallback(async () => {
    const remaining = MAX_IMAGES - selectedImages.length
    if (remaining <= 0) return

    const images = await pick({
      allowedMediaTypes: 'photo',
      allowMultipleSelection: true,
      maxSelection: remaining,
      enableCrop: false,
      excludedExtensions: ['gif', 'heic'],
      stackBehavior: 'push',
    })

    if (images && images.length > 0) {
      setSelectedImages((prev) => [...prev, ...images].slice(0, MAX_IMAGES))
      setErrorMessage(null)
    }
  }, [pick, selectedImages.length])

  const openCamera = useCallback(() => {
    setStep('camera')
  }, [])

  const handleCameraCapture = useCallback((image: MediaAssetWithUri) => {
    setSelectedImages((prev) => [...prev, image].slice(0, MAX_IMAGES))
    setErrorMessage(null)
    setStep('select-image')
  }, [])

  const removeImage = useCallback((index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Analyse de toutes les images sélectionnées
  const analyzeImages = useCallback(async () => {
    if (selectedImages.length === 0) return

    setStep('analyzing')
    setErrorMessage(null)

    try {
      const formData = new FormData()

      selectedImages.forEach((img) => {
        const uri = img.croppedUri || img.localUri || img.uri
        formData.append('images', {
          uri,
          type: img.mimeType || 'image/jpeg',
          name: img.filename || 'image.jpg',
        } as unknown as Blob)
      })

      const response = await api.postFormData<ItemAnalysisResponse>('/items/analyse', formData)

      if ('success' in response && response.success === true && 'data' in response && response.data) {
        const results = response.data

        const items: FormItem[] = results.map((data, i) => ({
          image: selectedImages[i] ?? selectedImages[0],
          formState: {
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
          },
          isSubmitting: false,
        }))

        setFormItems(items)
        setStep('forms')
      } else {
        const reason =
          'reason' in response && response.reason
            ? response.reason
            : "Une erreur est survenue lors de l'analyse"
        setErrorMessage(reason)
        setStep('select-image')
      }
    } catch (error) {
      console.error('Erreur analyse:', error)
      setErrorMessage("Une erreur est survenue lors de l'analyse")
      setStep('select-image')
    }
  }, [selectedImages])

  // Mise à jour d'un champ dans un FormItem spécifique
  const updateFormField = useCallback(
    <K extends keyof ItemFormState>(index: number, field: K, value: ItemFormState[K]) => {
      setFormItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, formState: { ...item.formState, [field]: value } } : item
        )
      )
    },
    []
  )

  // Soumission d'un item individuel
  // Soumission d'un item individuel
  const submitItem = useCallback(
    async (index: number) => {
      const item = formItems[index]
      if (!item) return

      setFormItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, isSubmitting: true } : it))
      )

      try {
        const formData = new FormData()
        const imageUri = item.image.croppedUri || item.image.localUri || item.image.uri

        formData.append('image', {
          uri: imageUri,
          type: item.image.mimeType || 'image/jpeg',
          name: item.image.filename || 'image.jpg',
        } as unknown as Blob)

        formData.append('name', item.formState.name)
        formData.append('description', item.formState.description)
        formData.append('type', item.formState.type)
        formData.append('season', item.formState.season)
        formData.append('formality', item.formState.formality)
        formData.append('mainColor', item.formState.mainColor)

        item.formState.tags.forEach((tag) => formData.append('tags', tag))

        if (item.formState.additionalColors.length > 0) {
          item.formState.additionalColors.forEach((color) =>
            formData.append('additionalColors', color)
          )
        } else {
          formData.append('additionalColors', '')
        }

        formData.append('brand', item.formState.brand || '')
        formData.append('reference', item.formState.reference || '')

        await api.postFormData('/items', formData)

        onSuccess?.()

        setFormItems((prev) => {
          const next = prev.filter((_, i) => i !== index)
          if (next.length === 0) {
            setTimeout(() => handleClose(), 300)
          }
          return next
        })
      } catch (error) {
        console.error('Erreur création:', error)
        Alert.alert('Erreur', 'Une erreur est survenue lors de la création')
        setFormItems((prev) =>
          prev.map((it, i) => (i === index ? { ...it, isSubmitting: false } : it))
        )
      }
    },
    [formItems, onSuccess, handleClose]
  )

  const renderContent = () => {
    switch (step) {
      case 'select-image':
        return (
          <ImageSelector
            selectedImages={selectedImages}
            errorMessage={errorMessage}
            onPickImage={pickImage}
            onOpenCamera={openCamera}
            onAnalyze={analyzeImages}
            onRemoveImage={removeImage}
            tintColor={tintColor}
            textColor={textColor}
            setErrorMessage={setErrorMessage}
          />
        )
      case 'analyzing':
        return (
          <AnalyzingStep
            selectedImages={selectedImages}
            tintColor={tintColor}
            textColor={textColor}
          />
        )
      default:
        return null
    }
  }

  const headerTitle =
    step === 'forms'
      ? `Nouveau${formItems.length > 1 ? 's' : ''} vêtement${formItems.length > 1 ? 's' : ''}`
      : 'Nouveau vêtement'

  if (step === 'camera') {
    return (
      <Sheet
        ref={sheetRef}
        onDismiss={handleClose}
        snapPoints={['100%']}
        enableDynamicSizing={false}
        handleComponent={null}
        enableContentPanningGesture={false}
      >
        <View className="flex-1" style={{ backgroundColor: '#000' }}>
          <CameraCapture onCapture={handleCameraCapture} onClose={() => setStep('select-image')} />
        </View>
      </Sheet>
    )
  }

  if (step === 'forms') {
    return (
      <Sheet
        ref={sheetRef}
        onDismiss={handleClose}
        snapPoints={['100%']}
        enableDynamicSizing={false}
        handleComponent={null}
        enableContentPanningGesture={false}
      >
        <View className="flex-1" style={{ backgroundColor }}>
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center justify-between px-base py-md border-b border-[rgba(128,128,128,0.2)]">
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-body" style={{ color: tintColor }}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>{headerTitle}</ThemedText>
              {formItems.length > 1 ? (
                <Text className="text-body-sm" style={{ color: textColor, opacity: 0.5 }}>
                  {formItems.length} restant{formItems.length > 1 ? 's' : ''}
                </Text>
              ) : (
                <View className="w-[60px]" />
              )}
            </View>

            <MultiItemForms
              formItems={formItems}
              tintColor={tintColor}
              textColor={textColor}
              onUpdateField={updateFormField}
              onSubmit={submitItem}
            />
          </SafeAreaView>
        </View>
      </Sheet>
    )
  }

  return (
    <Sheet
      ref={sheetRef}
      onDismiss={handleClose}
      snapPoints={['100%']}
      enableDynamicSizing={false}
      handleComponent={null}
      enableContentPanningGesture={false}
    >
      <BottomSheetScrollView className="flex-1" style={{ backgroundColor }} bounces={false}>
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between px-base py-md border-b border-[rgba(128,128,128,0.2)]">
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-body" style={{ color: tintColor }}>
                Annuler
              </Text>
            </TouchableOpacity>
            <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>{headerTitle}</ThemedText>
            <View className="w-[60px]" />
          </View>

          {renderContent()}
        </SafeAreaView>
      </BottomSheetScrollView>
    </Sheet>
  )
}

export default AddItemSheet

