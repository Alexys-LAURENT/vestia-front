import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Look } from '@/types/entities';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface LookCardProps {
  look: Look;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.base * 3) / 2;

export const LookCard: React.FC<LookCardProps> = ({ look }) => {
  const router = useRouter();
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textTertiary = useThemeColor({}, 'textTertiary');
  const tintColor = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme() ?? 'light';
  const shadows = Shadows[colorScheme];
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handlePress = () => {
    router.push(`/look/${look.idLook}`);
  };

  // Take first 4 items for preview
  const previewItems = look.items.slice(0, 4);
  const hasMore = look.items.length > 4;

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
      {/* Grid of items */}
      {look.avatarImageUrl ? (
        <Image
          source={{ uri: look.avatarImageUrl }}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.grid}>
          {previewItems.map((item, index) => (
            <View
              key={item.idItem}
              style={[
                styles.gridItem,
                index === 0 && styles.gridItemTopLeft,
                index === 1 && styles.gridItemTopRight,
                index === 2 && styles.gridItemBottomLeft,
                index === 3 && styles.gridItemBottomRight,
              ]}
            >
              <Image
                source={{ uri: `${API_URL}${item.imageUrl}` }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            </View>
          ))}
          
          {/* Fill empty slots */}
          {previewItems.length < 4 &&
            Array.from({ length: 4 - previewItems.length }).map((_, i) => (
              <View
                key={`empty-${i}`}
                style={[styles.gridItem, styles.emptySlot]}
              />
            ))}
          
          {/* Overlay for more items */}
          {hasMore && (
            <View style={styles.moreOverlay}>
              <ThemedText
                style={[
                  styles.moreText,
                  {
                    color: '#FFFFFF',
                    fontSize: Typography.size.bodySmall,
                    fontWeight: Typography.weight.bold,
                  },
                ]}
              >
                +{look.items.length - 4}
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* AI Badge */}
      {look.isAiGenerated && (
        <View style={[styles.aiBadge, { backgroundColor: tintColor }]}>
          <Ionicons name="sparkles" size={14} color={cardBackground} />
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <ThemedText
          style={[
            styles.event,
            {
              color: textColor,
              fontSize: Typography.size.bodySmall,
              fontWeight: Typography.weight.semibold,
            },
          ]}
          numberOfLines={1}
        >
          {look.event || 'Casual'}
        </ThemedText>
        
        <ThemedText
          style={[
            styles.itemCount,
            {
              color: textTertiary,
              fontSize: Typography.size.micro,
              fontWeight: Typography.weight.medium,
            },
          ]}
        >
          {look.items.length} ITEM{look.items.length > 1 ? 'S' : ''}
        </ThemedText>
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
  avatarImage: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
  },
  grid: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
  },
  gridItem: {
    width: '50%',
    height: '50%',
  },
  gridItemTopLeft: {
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  gridItemTopRight: {
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  gridItemBottomLeft: {
    borderRightWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  gridItemBottomRight: {},
  itemImage: {
    width: '100%',
    height: '100%',
  },
  emptySlot: {
    backgroundColor: '#E0E0E0',
  },
  moreOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '50%',
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  aiBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  event: {
    letterSpacing: -0.2,
  },
  itemCount: {
    letterSpacing: 1,
  },
});
