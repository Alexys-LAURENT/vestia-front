import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Item } from '@/types/entities';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

interface ItemCardProps {
  item: Item;
}

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const cardBackground = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.type} numberOfLines={1}>
          {item.type}
        </ThemedText>
        {item.brand && (
          <ThemedText style={styles.brand} numberOfLines={1}>
            {item.brand}
          </ThemedText>
        )}
      </View>
      <View style={[styles.colorDot, { backgroundColor: item.mainColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
  },
  content: {
    padding: 10,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  type: {
    fontSize: 12,
    opacity: 0.7,
  },
  brand: {
    fontSize: 11,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  colorDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
