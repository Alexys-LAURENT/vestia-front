import AddItemSheet from '@/components/sheets/addItemSheet';
import { ThemedText } from '@/components/themed-text';
import { FloatingActionButton } from '@/components/wardrobe/FloatingActionButton';
import { ItemCard } from '@/components/wardrobe/ItemCard';
import { ItemFilters } from '@/components/wardrobe/ItemFilters';
import { LookCard } from '@/components/wardrobe/LookCard';
import { WardrobeTabs, type WardrobeTab } from '@/components/wardrobe/WardrobeTabs';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch';
import type { Item, Look } from '@/types/entities';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WardrobeScreen = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'tint');

  const [activeTab, setActiveTab] = useState<WardrobeTab>('items');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Sheets
  const [isAddItemSheetOpen, setIsAddItemSheetOpen] = useState(false)
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch items
  const itemsParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    type: selectedType,
  }), [debouncedSearch, selectedType]);

  const {
    data: items,
    isLoading: isLoadingItems,
    isLoadingMore: isLoadingMoreItems,
    error: itemsError,
    hasMore: hasMoreItems,
    refresh: refreshItems,
    loadMore: loadMoreItems,
  } = usePaginatedFetch<Item>('/items', itemsParams, { enabled: activeTab === 'items' });
  
  // Fetch looks
  const {
    data: looks,
    isLoading: isLoadingLooks,
    isLoadingMore: isLoadingMoreLooks,
    error: looksError,
    hasMore: hasMoreLooks,
    refresh: refreshLooks,
    loadMore: loadMoreLooks,
  } = usePaginatedFetch<Look>('/looks', {}, { enabled: activeTab === 'looks' });

  const handleTabChange = useCallback((tab: WardrobeTab) => {
    setActiveTab(tab);
  }, []);

  const handleFabPress = useCallback(() => {
    // TODO: Implémenter la création

    if(activeTab === 'items') {
      setIsAddItemSheetOpen(true);
    }else {
      console.log('Créer une tenue');
    }

  }, [activeTab]);

  const renderItemCard = useCallback(({ item }: { item: Item }) => (
    <ItemCard item={item} />
  ), []);

  const renderLookCard = useCallback(({ item }: { item: Look }) => (
    <LookCard look={item} />
  ), []);

  const renderFooter = useCallback((isLoadingMore: boolean) => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={primaryColor} />
      </View>
    );
  }, [primaryColor]);

  const renderEmpty = useCallback((isLoading: boolean, error: string | null) => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.emptyText}>
          {activeTab === 'items' ? 'Aucun vêtement trouvé' : 'Aucune tenue trouvée'}
        </ThemedText>
      </View>
    );
  }, [activeTab, primaryColor]);

  return (
    <>
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedText style={styles.title}>Ma Garde-robe</ThemedText>
      
      <WardrobeTabs activeTab={activeTab} onTabChange={handleTabChange} />
      
      {activeTab === 'items' && (
        <ItemFilters
          search={search}
          onSearchChange={setSearch}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      )}

      {activeTab === 'items' ? (
        <FlatList
          data={items}
          renderItem={renderItemCard}
          keyExtractor={(item) => String(item.idItem)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreItems}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => renderFooter(isLoadingMoreItems)}
          ListEmptyComponent={() => renderEmpty(isLoadingItems, itemsError)}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refreshItems} tintColor={primaryColor} />
          }
        />
      ) : (
        <FlatList
          data={looks}
          renderItem={renderLookCard}
          keyExtractor={(item) => String(item.idLook)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreLooks}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => renderFooter(isLoadingMoreLooks)}
          ListEmptyComponent={() => renderEmpty(isLoadingLooks, looksError)}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refreshLooks} tintColor={primaryColor} />
          }
        />
      )}

      <FloatingActionButton onPress={handleFabPress} />
    </SafeAreaView>
    <AddItemSheet 
    isOpen={isAddItemSheetOpen} 
    onClose={() => setIsAddItemSheetOpen(false)}
    onSuccess={refreshItems}
    />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
});

export default WardrobeScreen;