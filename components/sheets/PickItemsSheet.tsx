import { ThemedText } from '@/components/themed-text';
import { ItemCard } from '@/components/wardrobe/ItemCard';
import { ItemFilters } from '@/components/wardrobe/ItemFilters';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch';
import type { Item } from '@/types/entities';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Sheet, useSheetRef } from './Sheet';

interface EditItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  callback?: (items:Item[]) => void;
  initialSelectedItems?: Item[];
}

const PickItemsSheet = ({ isOpen, onClose, callback, initialSelectedItems = [] }: EditItemSheetProps) => {
  const sheetRef = useSheetRef();
  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
      // Réinitialiser avec les items actuellement sélectionnés
      setPickedItems(initialSelectedItems);
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen, sheetRef, initialSelectedItems]);


  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'tint');

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [pickedItems, setPickedItems] = useState<Item[]>(initialSelectedItems);

  const handleToggleItem = useCallback((item: Item) => {
    setPickedItems((prevPickedItems) => {
      if (prevPickedItems.find((i) => i.idItem === item.idItem)) {
        return prevPickedItems.filter((i) => i.idItem !== item.idItem);
      } else {
        return [...prevPickedItems, item];
      }
    });
  }, []);

  useEffect(() => {
    if(callback){
      callback(pickedItems);
    }
  }, [pickedItems, callback]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
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
    refresh: refreshItems,
    loadMore: loadMoreItems,
  } = usePaginatedFetch<Item>('/items', itemsParams, { enabled: true });
  

  const renderItemCard = useCallback(({ item }: { item: Item }) => (
    <View className='relative'>
    <ItemCard item={item} customOnPress={handleToggleItem} />
    {pickedItems.find((i) => i.idItem === item.idItem) && (
      <View style={{
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>✓</ThemedText>
      </View>
    )}
    </View>
  ), [handleToggleItem, pickedItems, primaryColor]);

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
          Aucun vêtement trouvé
        </ThemedText>
      </View>
    );
  }, [primaryColor]);

  return (
    <Sheet
      ref={sheetRef}
      onDismiss={onClose}
      snapPoints={['90%']}
      enableDynamicSizing={false}
      stackBehavior="push"
    >
    <View style={[styles.container, { backgroundColor }]} >
      <ThemedText style={styles.title}>Ma Garde-robe</ThemedText>
      
        <ItemFilters
          search={search}
          onSearchChange={setSearch}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />

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
      
    </View>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
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

export default PickItemsSheet;