import AddItemSheet from '@/components/sheets/add-item/addItemSheet'
import { CreateManualLookSheet } from '@/components/sheets/CreateManualLookSheet'
import { ThemedText } from '@/components/themed-text'
import { FloatingActionButton } from '@/components/wardrobe/FloatingActionButton'
import { ItemCard } from '@/components/wardrobe/ItemCard'
import { ItemFilters } from '@/components/wardrobe/ItemFilters'
import { LookCard } from '@/components/wardrobe/LookCard'
import { WardrobeTabs, type WardrobeTab } from '@/components/wardrobe/WardrobeTabs'
import { Typography } from '@/constants/theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch'
import type { Item, Look } from '@/types/entities'
import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Animated, FlatList, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const WardrobeScreen = () => {
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const primaryColor = useThemeColor({}, 'tint')

  const [activeTab, setActiveTab] = useState<WardrobeTab>('items')
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string | undefined>()

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Sheets
  const [isAddItemSheetOpen, setIsAddItemSheetOpen] = useState(false)
  const [isCreateLookSheetOpen, setIsCreateLookSheetOpen] = useState(false)

  // Animation
  const fadeAnim = React.useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fade animation when switching tabs
  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
  }, [activeTab, fadeAnim])

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
  } = usePaginatedFetch<Item>('/items', itemsParams, { enabled: activeTab === 'items' })

  // Fetch looks
  const {
    data: looks,
    isLoading: isLoadingLooks,
    isLoadingMore: isLoadingMoreLooks,
    error: looksError,
    refresh: refreshLooks,
    loadMore: loadMoreLooks,
  } = usePaginatedFetch<Look>('/looks', {}, { enabled: activeTab === 'looks' })

  const handleTabChange = useCallback((tab: WardrobeTab) => {
    setActiveTab(tab)
  }, [])

  const handleFabPress = useCallback(() => {
    if (activeTab === 'items') {
      setIsAddItemSheetOpen(true)
    } else {
      setIsCreateLookSheetOpen(true)
    }
  }, [activeTab])

  const renderItemCard = useCallback(({ item }: { item: Item }) => <ItemCard item={item} />, [])

  const renderLookCard = useCallback(({ item }: { item: Look }) => <LookCard look={item} />, [])

  const renderFooter = useCallback(
    (isLoadingMore: boolean) => {
      if (!isLoadingMore) return null
      return (
        <View className="py-lg items-center">
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
          <View className="flex-1 justify-center items-center pt-[50px] gap-sm">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        )
      }
      if (error) {
        return (
          <View className="flex-1 justify-center items-center pt-[50px] gap-sm">
            <ThemedText style={{ color: '#DC2626', textAlign: 'center' }}>{error}</ThemedText>
          </View>
        )
      }
      return (
        <View className="flex-1 justify-center items-center pt-[50px] gap-sm">
          <ThemedText
            style={{
              textAlign: 'center',
              fontWeight: Typography.weight.semibold,
              color: textColor,
              fontSize: Typography.size.body,
              opacity: 0.5,
            }}
          >
            {activeTab === 'items' ? 'No items yet' : 'No outfits yet'}
          </ThemedText>
          <ThemedText
            style={{
              textAlign: 'center',
              color: textColor,
              fontSize: Typography.size.bodySmall,
              opacity: 0.4,
            }}
          >
            {activeTab === 'items' ? 'Add your first item' : 'Create your first look'}
          </ThemedText>
        </View>
      )
    },
    [activeTab, primaryColor, textColor]
  )

  return (
    <>
      <SafeAreaView className="flex-1" style={{ backgroundColor }} edges={['top']}>
        {/* Header */}
        <View className="px-base pt-lg pb-base">
          <ThemedText
            style={{
              color: textColor,
              fontSize: Typography.size.title,
              fontWeight: Typography.weight.bold,
              fontFamily: Typography.family.display,
              letterSpacing: Typography.letterSpacing.tight,
              lineHeight: Typography.size.title * 1.2,
            }}
          >
            Garde-robe
          </ThemedText>
        </View>

        {/* Tabs */}
        <WardrobeTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Filters for items tab */}
        {activeTab === 'items' && (
          <ItemFilters
            search={search}
            onSearchChange={setSearch}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        )}

        {/* Content */}
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          {activeTab === 'items' ? (
            <FlatList
              data={items}
              renderItem={renderItemCard}
              keyExtractor={(item) => String(item.idItem)}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
              contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 100 }}
              onEndReached={loadMoreItems}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() => renderFooter(isLoadingMoreItems)}
              ListEmptyComponent={() => renderEmpty(isLoadingItems, itemsError)}
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={refreshItems}
                  tintColor={primaryColor}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={looks}
              renderItem={renderLookCard}
              keyExtractor={(item) => String(item.idLook)}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
              contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 100 }}
              onEndReached={loadMoreLooks}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() => renderFooter(isLoadingMoreLooks)}
              ListEmptyComponent={() => renderEmpty(isLoadingLooks, looksError)}
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={refreshLooks}
                  tintColor={primaryColor}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>

        <FloatingActionButton onPress={handleFabPress} />
      </SafeAreaView>

      <AddItemSheet
        isOpen={isAddItemSheetOpen}
        onClose={() => setIsAddItemSheetOpen(false)}
        onSuccess={refreshItems}
      />
      <CreateManualLookSheet
        isOpen={isCreateLookSheetOpen}
        onClose={() => setIsCreateLookSheetOpen(false)}
        onSuccess={refreshLooks}
      />
    </>
  )
}

export default WardrobeScreen
