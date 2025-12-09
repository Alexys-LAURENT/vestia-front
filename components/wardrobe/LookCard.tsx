import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Look } from '@/types/entities';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

interface LookCardProps {
  look: Look;
}

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

export const LookCard: React.FC<LookCardProps> = ({ look }) => {
  const cardBackground = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');

  const previewItems = look.items.slice(0, 4);

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
      {look.avatarImageUrl ? (
        <Image
          source={{ uri: look.avatarImageUrl }}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.itemsGrid}>
          {previewItems.map((item, index) => (
            <Image
              key={item.idItem}
              source={{ uri: item.imageUrl }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ))}
          {previewItems.length < 4 &&
            Array.from({ length: 4 - previewItems.length }).map((_, i) => (
              <View key={`empty-${i}`} style={[styles.gridImage, styles.emptySlot]} />
            ))}
        </View>
      )}
      <View style={styles.content}>
        <ThemedText style={styles.event} numberOfLines={1}>
          {look.event || 'Tenue sans événement'}
        </ThemedText>
        <ThemedText style={styles.itemCount}>
          {look.items.length} vêtement{look.items.length > 1 ? 's' : ''}
        </ThemedText>
      </View>
      {look.isAiGenerated && (
        <View style={[styles.aiBadge, { backgroundColor: primaryColor }]}>
          <Ionicons name="sparkles" size={12} color="#fff" />
        </View>
      )}
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
  avatarImage: {
    width: '100%',
    height: CARD_WIDTH,
  },
  itemsGrid: {
    width: '100%',
    height: CARD_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridImage: {
    width: '50%',
    height: '50%',
  },
  emptySlot: {
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 10,
    gap: 2,
  },
  event: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  aiBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
