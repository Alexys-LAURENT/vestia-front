import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ItemMenuSheet } from '../sheets/ItemMenuSheet';
import { useSheetRef } from '../sheets/Sheet';

interface ItemMenuSheetButtonProps {
  itemId: number;
  onEditSuccess?: () => void;
}

export const ItemMenuSheetButton: React.FC<ItemMenuSheetButtonProps> = ({ 
  itemId,
  onEditSuccess,
}) => {
  const tintColor = useThemeColor({}, 'tint');
  const sheetRef = useSheetRef();

  const handlePress = useCallback(() => {
    sheetRef.current?.present();
  }, [sheetRef]);

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, [sheetRef]);

  return (
    <>
      <Pressable 
        onPress={handlePress}
        style={styles.button}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={tintColor} />
      </Pressable>

      <ItemMenuSheet
        ref={sheetRef}
        itemId={itemId}
        onClose={handleClose}
        onEditSuccess={onEditSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
