import { ThemedText } from '@/components/themed-text'
import { ItemCard } from '@/components/wardrobe/ItemCard'
import { ItemFilters } from '@/components/wardrobe/ItemFilters'
import { useThemeColor } from '@/hooks/use-theme-color'
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch'
import type { Item } from '@/types/entities'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, RefreshControl, View } from 'react-native'
import { Sheet, useSheetRef } from './Sheet'

interface EditItemSheetProps {
  isOpen: boolean
  onClose: () => void
  callback?: (items: Item[]) => void
  initialSelectedItems?: Item[]
}

const PickItemsSheet = ({
  isOpen,
  onClose,
  callback,
  initialSelectedItems = [],
}: EditItemSheetProps) => {
  const sheetRef = useSheetRef()
  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present()
      // Réinitialiser avec les items actuellement sélectionnés
      setPickedItems(initialSelectedItems)
    } else {
      sheetRef.current?.dismiss()
    }
  }, [isOpen, sheetRef, initialSelectedItems])

  const backgroundColor = useThemeColor({}, 'background')
  const primaryColor = useThemeColor({}, 'tint')

  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string | undefined>()
  const [pickedItems, setPickedItems] = useState<Item[]>(initialSelectedItems)

  const handleToggleItem = useCallback((item: Item) => {
    setPickedItems((prevPickedItems) => {
      if (prevPickedItems.find((i) => i.idItem === item.idItem)) {
        return prevPickedItems.filter((i) => i.idItem !== item.idItem)
      } else {
        return [...prevPickedItems, item]
      }
    })
  }, [])

  useEffect(() => {
    if (callback) {
      callback(pickedItems)
    }
  }, [pickedItems, callback])

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('')

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch items
  const itemsParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      type: selectedType,
    }),
    [debouncedSearch, selectedType]
  )

  const {
    data: items,
    isLoading: isLoadingItems,
    isLoadingMore: isLoadingMoreItems,
    error: itemsError,
    refresh: refreshItems,
    loadMore: loadMoreItems,
  } = usePaginatedFetch<Item>('/items', itemsParams, { enabled: true })

  const renderItemCard = useCallback(
    ({ item }: { item: Item }) => (
      <View className="relative">
        <ItemCard item={item} customOnPress={handleToggleItem} />
        {pickedItems.find((i) => i.idItem === item.idItem) && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: primaryColor,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>✓</ThemedText>
          </View>
        )}
      </View>
    ),
    [handleToggleItem, pickedItems, primaryColor]
  )

  const renderFooter = useCallback(
    (isLoadingMore: boolean) => {
      if (!isLoadingMore) return null
      return (
        <View className="py-5 items-center">
          <ActivityIndicator size="small" color={primaryColor} />
        </View>
      )
    },
    [primaryColor]
  )

  const renderEmpty = useCallback(
    (isLoading: boolean, error: string | null) => {
      if (isLoading) {
        return (
          <View className="flex-1 justify-center items-center pt-[50px]">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        )
      }
      if (error) {
        return (
          <View className="flex-1 justify-center items-center pt-[50px]">
            <ThemedText className="text-semantic-error text-center">{error}</ThemedText>
          </View>
        )
      }
      return (
        <View className="flex-1 justify-center items-center pt-[50px]">
          <ThemedText className="opacity-60 text-center">Aucun vêtement trouvé</ThemedText>
        </View>
      )
    },
    [primaryColor]
  )

  return (
    <Sheet
      ref={sheetRef}
      onDismiss={onClose}
      snapPoints={['90%']}
      enableDynamicSizing={false}
      stackBehavior="push"
    >
      <View className="flex-1 flex-col gap-md" style={{ backgroundColor }}>
        <ThemedText
          className="text-[28px] font-bold mx-base pt-sm"
          style={{ fontFamily: 'Georgia' }}
        >
          Ma Garde-robe
        </ThemedText>

        <ItemFilters
          search={search}
          onSearchChange={setSearch}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />

        <BottomSheetFlatList
          data={items}
          renderItem={renderItemCard}
          keyExtractor={(item: Item) => String(item.idItem)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          onEndReached={loadMoreItems}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => renderFooter(isLoadingMoreItems)}
          ListEmptyComponent={() => renderEmpty(isLoadingItems, itemsError)}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refreshItems} tintColor={primaryColor} />
          }
        />
      </View>
    </Sheet>
  )
}

export default PickItemsSheet
