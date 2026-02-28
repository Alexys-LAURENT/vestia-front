import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Item } from '@/types/entities';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ItemCardProps {
  item: Item;
  customOnPress?: (item: Item) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.base * 3) / 2; // 2 columns with padding

export const ItemCard: React.FC<ItemCardProps> = ({ item, customOnPress }) => {
  const router = useRouter();
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textTertiary = useThemeColor({}, 'textTertiary');
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const shadows = Shadows[theme];
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handlePress = () => {
    if (customOnPress) {
      customOnPress(item);
      return;
    }
    router.push(`/item/${item.idItem}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: cardBackground,
          ...shadows.md,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${API_URL}${item.imageUrl}` }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Overlay gradient for better text readability */}
        <View style={styles.imageOverlay} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText
          style={[
            styles.name,
            {
              color: textColor,
              fontSize: Typography.size.bodySmall,
              fontWeight: Typography.weight.semibold,
            },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </ThemedText>
        
        <ThemedText
          style={[
            styles.type,
            {
              color: textTertiary,
              fontSize: Typography.size.caption,
              fontWeight: Typography.weight.regular,
            },
          ]}
          numberOfLines={1}
        >
          {item.type}
        </ThemedText>
        
        {item.brand && (
          <ThemedText
            style={[
              styles.brand,
              {
                color: textSecondary,
                fontSize: Typography.size.micro,
                fontWeight: Typography.weight.medium,
              },
            ]}
            numberOfLines={1}
          >
            {item.brand.toUpperCase()}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.2, // Ratio 5:6 for fashion aesthetic
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'transparent',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  name: {
    letterSpacing: -0.2,
  },
  type: {
    letterSpacing: 0.2,
  },
  brand: {
    letterSpacing: 0.5,
    marginTop: Spacing.xs / 2,
  },
});
