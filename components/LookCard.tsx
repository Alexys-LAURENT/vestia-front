import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Item } from '@/types/entities';
import React from 'react';
import { Dimensions, Image, View } from 'react-native';

interface LookCardProps {
  items: Item[];
}

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_WIDTH = width - CARD_PADDING * 2;

// Catégories pour organiser les vêtements
const CATEGORY_ORDER = {
  HEAD: ['Accessoires'], // Chapeaux, lunettes, etc.
  TOP: ['T-shirts & Tops', 'Sweatshirts & Hoodies', 'Pulls & Mailles', 'Chemises', 'Robes'],
  JACKET: ['Vestes & Manteaux'],
  BOTTOM: ['Pantalons', 'Jupes', 'Shorts'],
  SHOES: ['Chaussures'],
  ACCESSORIES: ['Vêtements de sport', 'Autres'],
};

export const LookCard: React.FC<LookCardProps> = ({ items }) => {
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Organiser les items par catégorie
  const categorizeItem = (item: Item) => {
    if (CATEGORY_ORDER.HEAD.includes(item.type)) return 'HEAD';
    if (CATEGORY_ORDER.TOP.includes(item.type)) return 'TOP';
    if (CATEGORY_ORDER.JACKET.includes(item.type)) return 'JACKET';
    if (CATEGORY_ORDER.BOTTOM.includes(item.type)) return 'BOTTOM';
    if (CATEGORY_ORDER.SHOES.includes(item.type)) return 'SHOES';
    return 'ACCESSORIES';
  };

  const categorizedItems = items.reduce((acc, item) => {
    const category = categorizeItem(item);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  const ITEM_SIZE = (CARD_WIDTH - 40) / 2; // 2 colonnes avec gap de 8px

  // Organiser les items dans l'ordre logique : vestes/hauts → bas → chaussures → accessoires
  const orderedItems = [
    ...(categorizedItems.JACKET || []),
    ...(categorizedItems.TOP || []),
    ...(categorizedItems.BOTTOM || []),
    ...(categorizedItems.SHOES || []),
    ...(categorizedItems.HEAD || []),
    ...(categorizedItems.ACCESSORIES || []),
  ];

  // Créer des lignes de 2 items
  const rows: Item[][] = [];
  for (let i = 0; i < orderedItems.length; i += 2) {
    rows.push(orderedItems.slice(i, i + 2));
  }

  return (
    <View
      className="p-4 rounded-2xl"
      style={{ backgroundColor, borderColor: iconColor + '20', borderWidth: 1 }}
    >
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row mb-4" style={{ gap: 8 }}>
          {row.map((item) => (
            <View key={item.idItem} className="items-center" style={{ width: ITEM_SIZE }}>
              <Image
                source={{ uri: `${API_URL}${item.imageUrl}` }}
                className="rounded-xl"
                style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
                resizeMode="cover"
              />
              <ThemedText
                className="mt-2 text-xs font-medium text-center"
                numberOfLines={1}
                style={{ width: ITEM_SIZE }}
              >
                {item.name}
              </ThemedText>
            </View>
          ))}
          {/* Ajouter un espace vide si item impair */}
          {row.length === 1 && <View style={{ width: ITEM_SIZE }} />}
        </View>
      ))}
    </View>
  );
};
