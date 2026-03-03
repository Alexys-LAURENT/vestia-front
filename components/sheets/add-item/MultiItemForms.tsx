import type { ItemFormState } from '@/types/item-analysis'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, View } from 'react-native'
import { ItemForm } from './ItemForm'
import type { FormItem } from './types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface MultiItemFormsProps {
  formItems: FormItem[]
  tintColor: string
  textColor: string
  onUpdateField: (
    index: number,
    field: keyof ItemFormState,
    value: ItemFormState[keyof ItemFormState]
  ) => void
  onSubmit: (index: number) => void
}

export const MultiItemForms = ({
  formItems,
  tintColor,
  textColor,
  onUpdateField,
  onSubmit,
}: MultiItemFormsProps) => {
  const flatListRef = useRef<FlatList<FormItem>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const prevLengthRef = useRef(formItems.length)

  // Quand un item est retiré, ajuster l'index si nécessaire
  useEffect(() => {
    const prevLen = prevLengthRef.current
    const newLen = formItems.length

    if (newLen < prevLen && newLen > 0) {
      const safeIndex = Math.min(currentIndex, newLen - 1)
      setCurrentIndex(safeIndex)
      flatListRef.current?.scrollToIndex({ index: safeIndex, animated: true })
    }

    prevLengthRef.current = newLen
  }, [formItems.length, currentIndex])

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index)
      }
    }
  ).current

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current

  const renderItem = useCallback(
    ({ item, index }: { item: FormItem; index: number }) => (
      <View style={{ width: SCREEN_WIDTH }}>
        <ItemForm
          selectedImage={item.image}
          formState={item.formState}
          onUpdateField={(field, value) => onUpdateField(index, field, value)}
          onSubmit={() => onSubmit(index)}
          isSubmitDisabled={
            !item.formState.name ||
            !item.formState.type ||
            !item.formState.mainColor ||
            item.isSubmitting
          }
          submitButtonText={item.isSubmitting ? 'Enregistrement...' : 'Ajouter à ma garde-robe'}
          tintColor={tintColor}
          textColor={textColor}
          useBottomSheet={false}
        />
      </View>
    ),
    [onUpdateField, onSubmit, tintColor, textColor]
  )

  const keyExtractor = useCallback((_: FormItem, index: number) => String(index), [])

  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={formItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Dots indicator */}
      {formItems.length > 1 && (
        <View className="flex-row justify-center items-center py-sm" style={{ gap: 6 }}>
          {formItems.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? 16 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentIndex ? tintColor : `${tintColor}40`,
              }}
            />
          ))}
        </View>
      )}
    </View>
  )
}
