import { ThemedText } from '@/components/themed-text';
import { ITEM_TYPES } from '@/constants/file_types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ItemFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedType: string | undefined;
  onTypeChange: (type: string | undefined) => void;
}

export const ItemFilters: React.FC<ItemFiltersProps> = ({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { borderColor }]}>
        <Ionicons name="search" size={20} color={borderColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Rechercher..."
          placeholderTextColor={borderColor}
          value={search}
          onChangeText={onSearchChange}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color={borderColor} />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typesContainer}
      >
        <TouchableOpacity
          style={[
            styles.typeChip,
            { borderColor },
            !selectedType && { backgroundColor: primaryColor, borderColor: primaryColor },
          ]}
          onPress={() => onTypeChange(undefined)}
        >
          <ThemedText style={[styles.typeText, !selectedType && styles.activeTypeText]}>
            Tous
          </ThemedText>
        </TouchableOpacity>
        {ITEM_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeChip,
              { borderColor },
              selectedType === type && { backgroundColor: primaryColor, borderColor: primaryColor },
            ]}
            onPress={() => onTypeChange(selectedType === type ? undefined : type)}
          >
            <ThemedText style={[styles.typeText, selectedType === type && styles.activeTypeText]}>
              {type}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  typesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
  },
  activeTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
});
