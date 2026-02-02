import { Sheet, useSheetRef } from '@/components/sheets/Sheet';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Item } from '@/types/entities';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { View } from 'react-native';

interface LookReasonsSheetProps {
  isOpen: boolean;
  items: (Item & { reason: string; isForced: boolean })[];
  onClose: () => void;
}

export const LookReasonsSheet: React.FC<LookReasonsSheetProps> = ({ isOpen, items, onClose }) => {
  const sheetRef = useSheetRef();
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  React.useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen, sheetRef]);

  return (
    <Sheet ref={sheetRef} snapPoints={['80%']} onDismiss={onClose}>
      <BottomSheetScrollView className="px-6 pb-6">
        <ThemedText className="text-2xl font-bold mb-6">Pourquoi ces choix ?</ThemedText>
        
        {items.map((item, index) => (
          <View
            key={item.idItem}
            className="mb-4 pb-4"
            style={index !== items.length - 1 ? { borderBottomWidth: 1, borderBottomColor: iconColor + '10' } : {}}
          >
            <View className="flex-row items-center mb-2">
              <ThemedText className="text-base font-bold flex-1">{item.name}</ThemedText>
              {item.isForced && (
                <View className="px-2 py-1 rounded-full" style={{ backgroundColor: tintColor }}>
                  <ThemedText className="text-white text-xs font-semibold">Imposé</ThemedText>
                </View>
              )}
            </View>
            <ThemedText className="text-sm leading-6 opacity-80">{item.reason}</ThemedText>
          </View>
        ))}
      </BottomSheetScrollView>
    </Sheet>
  );
};
