import { ThemedText } from '@/components/themed-text';
import { ITEM_TYPES } from '@/constants/file_types';
import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const textTertiary = useThemeColor({}, 'textTertiary');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const shadows = Shadows[theme];

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor,
            borderColor: isFocused ? tintColor : borderColor,
            ...shadows.sm,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={textTertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: textColor,
              fontSize: Typography.size.body,
            },
          ]}
          placeholder="Rechercher..."
          placeholderTextColor={textTertiary}
          value={search}
          onChangeText={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        <CategoryChip
          label="Tous"
          isActive={!selectedType}
          onPress={() => onTypeChange(undefined)}
          tintColor={tintColor}
          borderColor={borderColor}
          textColor={textColor}
          textTertiary={textTertiary}
          backgroundColor={backgroundColor}
        />
        {ITEM_TYPES.map((type) => (
          <CategoryChip
            key={type}
            label={type}
            isActive={selectedType === type}
            onPress={() => onTypeChange(selectedType === type ? undefined : type)}
            tintColor={tintColor}
            borderColor={borderColor}
            textColor={textColor}
            textTertiary={textTertiary}
            backgroundColor={backgroundColor}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// Separate component for category chips
const CategoryChip: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
  tintColor: string;
  borderColor: string;
  textColor: string;
  textTertiary: string;
  backgroundColor: string;
}> = ({ label, isActive, onPress, tintColor, borderColor, textColor, textTertiary, backgroundColor }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.chip,
          {
            backgroundColor: isActive ? tintColor : backgroundColor,
            borderColor: isActive ? tintColor : borderColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ThemedText
          style={[
            styles.chipText,
            {
              color: isActive ? backgroundColor : textColor,
              fontSize: Typography.size.caption,
              fontWeight: isActive ? Typography.weight.semibold : Typography.weight.medium,
            },
          ]}
        >
          {label}
        </ThemedText>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
    marginHorizontal: Spacing.base,
    paddingHorizontal: Spacing.base,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontWeight: Typography.weight.regular,
  },
  chipsContainer: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    letterSpacing: 0.3,
  },
});
