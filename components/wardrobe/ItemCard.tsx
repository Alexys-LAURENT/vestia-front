import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Item } from '@/types/entities';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ItemCardProps {
  item: Item;
  customOnPress?: (item:Item) => void;
}

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

export const ItemCard: React.FC<ItemCardProps> = ({ item , customOnPress}) => {
  const router = useRouter();
  const cardBackground = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const API_URL = process.env.EXPO_PUBLIC_API_URL

  const handlePress = () => {
    if(customOnPress){
      customOnPress(item);
      return;
    }
    router.push(`/item/${item.idItem}`);
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: cardBackground, borderColor }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: `${API_URL}${item.imageUrl}` }}
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
    </TouchableOpacity>
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
  }
});
