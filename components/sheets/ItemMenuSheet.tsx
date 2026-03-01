import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SuccessMessageResponse } from '@/types/requests';
import { api } from '@/utils/fetchApiClientSide';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { forwardRef, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import EditItemSheet from './EditItemSheet';
import { Sheet } from './Sheet';

interface ItemMenuSheetProps {
  itemId: number;
  onClose: () => void;
  onEditSuccess?: () => void;
}

export const ItemMenuSheet = forwardRef<BottomSheetModal, ItemMenuSheetProps>(
  ({ itemId, onClose, onEditSuccess }, ref) => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    const handleEdit = useCallback(() => {
      setIsEditSheetOpen(true);
      onClose();
    }, [onClose]);

    const handleEditSuccess = useCallback(() => {
      onClose();
      if (onEditSuccess) {
        onEditSuccess();
      }
    }, [onClose, onEditSuccess]);

    const handleDelete = useCallback(async () => {
      setIsDeleteLoading(true);
      const res = await api.delete<SuccessMessageResponse>(`/items/${itemId}`);
      if("error" in res){
        console.error('Erreur lors de la suppression de l\'item:');
        setIsDeleteLoading(false);
        return;
      }
      setIsDeleteLoading(false);
      router.replace('/wardrobe');
      onClose();      
    }, [itemId, onClose]);

    return (
      <>
      <Sheet
        ref={ref}
        enableDynamicSizing={true}
        enableContentPanningGesture={false}
        backgroundStyle={{ backgroundColor }}
        handleIndicatorStyle={{ backgroundColor: iconColor }}
      >
        <BottomSheetView style={styles.container}>
          <Pressable 
            style={[styles.option, styles.firstOption]}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={24} color={tintColor} />
            <ThemedText style={styles.optionText}>Modifier</ThemedText>
          </Pressable>

          <View style={[styles.separator, { backgroundColor: iconColor }]} />

          <Pressable 
            style={styles.option}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            <ThemedText style={[styles.optionText, { color: '#FF3B30' }]}>
              Supprimer
            </ThemedText>
            {isDeleteLoading && (
              <ActivityIndicator style={{ marginLeft: 10 }} size="small" color="#FF3B30" />
            )}
          </Pressable>
        </BottomSheetView>
      </Sheet>
      
      <EditItemSheet
        isOpen={isEditSheetOpen}
        itemId={itemId}
        onClose={() => setIsEditSheetOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
  }
);

ItemMenuSheet.displayName = 'ItemMenuSheet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  firstOption: {
    paddingTop: 8,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.3,
  },
});
