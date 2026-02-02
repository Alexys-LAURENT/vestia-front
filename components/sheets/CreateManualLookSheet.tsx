import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useCreateLook } from '@/hooks/useCreateLook'
import type { Item } from '@/types/entities'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Sheet, useSheetRef } from './Sheet'
import PickItemsSheet from './PickItemsSheet'

interface CreateManualLookSheetProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const ITEM_SIZE = (Dimensions.get('window').width - 80) / 3

export const CreateManualLookSheet: React.FC<CreateManualLookSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const sheetRef = useSheetRef()
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor({}, 'border')
  const API_URL = process.env.EXPO_PUBLIC_API_URL

  const [selectedItems, setSelectedItems] = useState<Item[]>([])
  const [event, setEvent] = useState('')
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const { createLook, isLoading } = useCreateLook()

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present()
      // Reset state
      setSelectedItems([])
      setEvent('')
    } else {
      sheetRef.current?.dismiss()
    }
  }, [isOpen, sheetRef])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleCreate = useCallback(async () => {
    if (selectedItems.length < 2) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins 2 vêtements')
      return
    }

    const itemIds = selectedItems.map((item) => item.idItem)
    const look = await createLook(itemIds, event.trim() || null, false)

    if (look) {
      Alert.alert('Succès', 'Tenue créée avec succès !')
      handleClose()
      onSuccess?.()
    } else {
      Alert.alert('Erreur', 'Impossible de créer la tenue')
    }
  }, [selectedItems, event, createLook, handleClose, onSuccess])

  const handleSelectItems = useCallback(() => {
    setIsPickerOpen(true)
  }, [])

  const handleRemoveItem = useCallback((itemId: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.idItem !== itemId))
  }, [])

  return (
    <>
      <Sheet ref={sheetRef} onDismiss={handleClose} snapPoints={['85%']}>
        <BottomSheetScrollView
          style={[styles.container, { backgroundColor }]}
          contentContainerStyle={styles.contentContainer}
        >
          <ThemedText className="text-2xl font-bold mb-6">Créer une tenue</ThemedText>

          {/* Selected Items Grid */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <ThemedText className="text-base font-semibold">
                Vêtements ({selectedItems.length}/6)
              </ThemedText>
              <TouchableOpacity
                className="flex-row items-center px-3 py-2 rounded-lg"
                style={{ backgroundColor: tintColor }}
                onPress={handleSelectItems}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <ThemedText className="text-white font-semibold ml-1">
                  {selectedItems.length > 0 ? 'Modifier' : 'Ajouter'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {selectedItems.length > 0 ? (
              <View style={styles.itemsGrid}>
                {selectedItems.map((item) => (
                  <View key={item.idItem} style={styles.itemContainer}>
                    <Image
                      source={{ uri: `${API_URL}${item.imageUrl}` }}
                      style={[styles.itemImage, { borderColor }]}
                    />
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: '#ff4444' }]}
                      onPress={() => handleRemoveItem(item.idItem)}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                    <ThemedText
                      className="text-xs text-center mt-1"
                      numberOfLines={1}
                      style={{ width: ITEM_SIZE }}
                    >
                      {item.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.emptyState, { borderColor }]}
                onPress={handleSelectItems}
              >
                <Ionicons name="shirt-outline" size={48} color={borderColor} />
                <ThemedText className="mt-2" style={{ color: `${textColor}80` }}>
                  Aucun vêtement sélectionné
                </ThemedText>
                <ThemedText className="text-xs mt-1" style={{ color: `${textColor}60` }}>
                  Appuyez pour ajouter des vêtements
                </ThemedText>
              </TouchableOpacity>
            )}

            {selectedItems.length > 0 && selectedItems.length < 2 && (
              <View className="flex-row items-center mt-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${tintColor}20` }}>
                <Ionicons name="information-circle" size={16} color={tintColor} />
                <ThemedText className="text-xs ml-2" style={{ color: tintColor }}>
                  Sélectionnez au moins 2 vêtements pour créer une tenue
                </ThemedText>
              </View>
            )}
          </View>

          {/* Event Name */}
          <View className="mb-6">
            <ThemedText className="text-base font-semibold mb-2">
              Événement (optionnel)
            </ThemedText>
            <BottomSheetTextInput
              style={[
                styles.eventInput,
                {
                  backgroundColor,
                  color: textColor,
                  borderColor,
                },
              ]}
              placeholder="Ex: Travail, Soirée, Sport..."
              placeholderTextColor={`${textColor}80`}
              value={event}
              onChangeText={setEvent}
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl border-2"
              style={{ borderColor: tintColor }}
              onPress={handleClose}
              disabled={isLoading}
            >
              <ThemedText className="text-center font-semibold" style={{ color: tintColor }}>
                Annuler
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3 rounded-xl"
              style={{ backgroundColor: tintColor, opacity: selectedItems.length < 2 || isLoading ? 0.5 : 1 }}
              onPress={handleCreate}
              disabled={selectedItems.length < 2 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText className="text-center text-white font-semibold">
                  Créer
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </Sheet>

      {/* Item Picker */}
      <PickItemsSheet
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        callback={setSelectedItems}
        initialSelectedItems={selectedItems}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemContainer: {
    alignItems: 'center',
  },
  itemImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
    borderWidth: 2,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyState: {
    height: 200,
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  eventInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
})
