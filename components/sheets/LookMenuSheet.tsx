import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SuccessMessageResponse } from '@/types/requests';
import { api } from '@/utils/fetchApiClientSide';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { forwardRef, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Sheet } from './Sheet';

interface LookMenuSheetProps {
  lookId: number;
  onClose: () => void;
  onPlanPress: () => void;
}

export const LookMenuSheet = forwardRef<BottomSheetModal, LookMenuSheetProps>(
  ({ lookId, onClose, onPlanPress }, ref) => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const handlePlan = useCallback(() => {
      onClose();
      onPlanPress();
    }, [onClose, onPlanPress]);

    const handleDelete = useCallback(async () => {
      setIsDeleteLoading(true);
      const res = await api.delete<SuccessMessageResponse>(`/looks/${lookId}`);
      if ("error" in res) {
        console.error('Erreur lors de la suppression de la tenue:');
        setIsDeleteLoading(false);
        return;
      }
      setIsDeleteLoading(false);
      router.replace('/wardrobe');
      onClose();
    }, [lookId, onClose]);

    return (
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
            onPress={handlePlan}
          >
            <Ionicons name="calendar-outline" size={24} color={tintColor} />
            <ThemedText style={styles.optionText}>Planifier</ThemedText>
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
    );
  }
);

LookMenuSheet.displayName = 'LookMenuSheet';

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
