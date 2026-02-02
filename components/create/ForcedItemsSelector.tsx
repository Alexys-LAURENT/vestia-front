import { useThemeColor } from '@/hooks/use-theme-color';
import { Item } from '@/types/entities';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

interface ForcedItemsSelectorProps {
  forcedItems: Item[];
  onAddItems: () => void;
  onRemoveItem: (itemId: number) => void;
  generateButton: React.ReactNode;
}

const FORCED_ITEM_SIZE = 60;

export const ForcedItemsSelector: React.FC<ForcedItemsSelectorProps> = ({
  forcedItems,
  onAddItems,
  onRemoveItem,
  generateButton,
}) => {
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  return (
    <>
      {/* Items forcés */}
      {forcedItems.length > 0 && (
        <View className="px-4 pb-2">
          <View className="flex-row flex-wrap gap-2">
            {forcedItems.map((item) => (
              <View key={item.idItem} className="relative">
                <Image
                  source={{ uri: `${API_URL}${item.imageUrl}` }}
                  className="rounded-lg"
                  style={{ width: FORCED_ITEM_SIZE, height: FORCED_ITEM_SIZE }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute items-center justify-center w-5 h-5 rounded-full -top-1 -right-1"
                  style={{ backgroundColor: '#FF3B30' }}
                  onPress={() => onRemoveItem(item.idItem)}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Barre du bas */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-t" style={{ borderTopColor: iconColor + '30' }}>
        <TouchableOpacity 
          className="items-center justify-center w-12 h-12 rounded-full"
          style={{ backgroundColor: tintColor + '20', borderColor: tintColor, borderWidth: 1 }}
          onPress={onAddItems}
        >
          <Ionicons name="add" size={28} color={tintColor} />
        </TouchableOpacity>
        {generateButton}
      </View>
    </>
  );
};
