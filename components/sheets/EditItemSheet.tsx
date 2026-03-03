import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import type { Item } from '@/types/entities'
import type { ItemFormState } from '@/types/item-analysis'
import { SuccessResponse } from '@/types/requests'
import { api, fetchApi } from '@/utils/fetchApiClientSide'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ItemForm } from './add-item/ItemForm'
import { Sheet, useSheetRef } from './Sheet'

interface EditItemSheetProps {
  isOpen: boolean
  itemId: number
  onClose: () => void
  onSuccess?: () => void
}

const EditItemSheet = ({ isOpen, itemId, onClose, onSuccess }: EditItemSheetProps) => {
  const sheetRef = useSheetRef()

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [item, setItem] = useState<Item | null>(null)
  const [formState, setFormState] = useState<ItemFormState | null>(null)

  const loadItem = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchApi<SuccessResponse<Item>>(`/items/${itemId}`, {
        method: 'GET',
      })

      if ('error' in data) {
        throw new Error('message' in data ? data.message : 'Erreur inconnue')
      }

      const itemData = data.data
      setItem(itemData)

      // Initialiser le formulaire avec les données de l'item
      setFormState({
        name: itemData.name,
        description: itemData.description,
        type: itemData.type,
        tags: itemData.tags || [],
        season: itemData.season,
        formality: itemData.formality,
        mainColor: itemData.mainColor,
        additionalColors: itemData.additionnalColors || [],
        brand: itemData.brand || '',
        reference: itemData.reference || '',
      })
    } catch (error) {
      console.error("Erreur lors du chargement de l'item:", error)
      Alert.alert('Erreur', "Impossible de charger les données de l'item")
      onClose()
    } finally {
      setIsLoading(false)
    }
  }, [itemId, onClose])

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present()
      loadItem()
    } else {
      sheetRef.current?.dismiss()
    }
  }, [isOpen, sheetRef, loadItem])

  const handleClose = useCallback(() => {
    setItem(null)
    setFormState(null)
    setIsLoading(true)
    onClose()
  }, [onClose])

  const updateItem = useCallback(async () => {
    if (!formState) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()

      formData.append('name', formState.name)
      formData.append('description', formState.description)
      formData.append('type', formState.type)
      formData.append('season', formState.season)
      formData.append('formality', formState.formality)
      formData.append('mainColor', formState.mainColor)

      formState.tags.forEach((tag) => {
        formData.append(`tags`, tag)
      })

      if (formState.additionalColors.length > 0) {
        formState.additionalColors.forEach((color) => {
          formData.append(`additionalColors`, color)
        })
      } else {
        formData.append('additionalColors', '')
      }

      formData.append('brand', formState.brand || '')
      formData.append('reference', formState.reference || '')

      await api.putFormData(`/items/${itemId}`, formData)

      Alert.alert('Succès', 'Le vêtement a été modifié !')
      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Erreur modification:', error)
      Alert.alert('Erreur', 'Une erreur est survenue lors de la modification')
    } finally {
      setIsSubmitting(false)
    }
  }, [formState, itemId, onSuccess, handleClose])

  const updateFormField = useCallback(
    <K extends keyof ItemFormState>(field: K, value: ItemFormState[K]) => {
      setFormState((prev) => (prev ? { ...prev, [field]: value } : null))
    },
    []
  )

  const isSubmitDisabled =
    !formState?.name || !formState?.type || !formState?.mainColor || isSubmitting

  const API_URL = process.env.EXPO_PUBLIC_API_URL
  const imageUrl = item?.imageUrl ? `${API_URL}${item.imageUrl}` : null

  return (
    <Sheet
      ref={sheetRef}
      onDismiss={handleClose}
      snapPoints={['100%']}
      enableDynamicSizing={false}
      handleComponent={null}
      enableContentPanningGesture={false}
      stackBehavior="push"
    >
      <BottomSheetScrollView className="flex-1" style={{ backgroundColor }} bounces={false}>
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between px-base py-md border-b border-[rgba(128,128,128,0.2)]">
            <TouchableOpacity onPress={handleClose}>
              <Text style={{ color: tintColor, fontSize: 16, fontWeight: '500' }}>Annuler</Text>
            </TouchableOpacity>
            <ThemedText className="text-[18px] font-semibold">Modifier le vêtement</ThemedText>
            <View className="w-[60px]" />
          </View>

          {isLoading ? (
            <View className="flex-1 justify-center items-center py-[60px]">
              <ActivityIndicator size="large" color={tintColor} />
              <ThemedText className="mt-base text-body opacity-70">Chargement...</ThemedText>
            </View>
          ) : formState ? (
            <ItemForm
              selectedImage={null}
              imageUrl={imageUrl}
              formState={formState}
              onUpdateField={updateFormField}
              onSubmit={updateItem}
              isSubmitDisabled={isSubmitDisabled}
              tintColor={tintColor}
              textColor={textColor}
              submitButtonText={isSubmitting ? 'Modification...' : 'Enregistrer les modifications'}
            />
          ) : null}
        </SafeAreaView>
      </BottomSheetScrollView>
    </Sheet>
  )
}

export default EditItemSheet
