import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Item } from '@/types/entities';
import type { ItemFormState } from '@/types/item-analysis';
import { SuccessResponse } from '@/types/requests';
import { api, fetchApi } from '@/utils/fetchApi';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemForm } from './add-item/ItemForm';
import { Sheet, useSheetRef } from './Sheet';

interface EditItemSheetProps {
  isOpen: boolean;
  itemId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditItemSheet = ({ isOpen, itemId, onClose, onSuccess }: EditItemSheetProps) => {
  const sheetRef = useSheetRef();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [formState, setFormState] = useState<ItemFormState | null>(null);

  const loadItem = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi<SuccessResponse<Item>>(`/items/${itemId}`, {
        method: 'GET',
      });

      if ('error' in data) {
        throw new Error('message' in data ? data.message : 'Erreur inconnue');
      }

      const itemData = data.data;
      setItem(itemData);

      // Initialiser le formulaire avec les données de l'item
      setFormState({
        name: itemData.name,
        description: itemData.description,
        type: itemData.type,
        tags: itemData.tags || [],
        season: itemData.season,
        formality: itemData.formality,
        mainColor: itemData.mainColor,
        additionalColors: itemData.additionnalColors || [],
        brand: itemData.brand || '',
        reference: itemData.reference || '',
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'item:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de l\'item');
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [itemId, onClose]);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
      loadItem();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen, sheetRef, loadItem]);

  const handleClose = useCallback(() => {
    setItem(null);
    setFormState(null);
    setIsLoading(true);
    onClose();
  }, [onClose]);

  const updateItem = useCallback(async () => {
    if (!formState) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('name', formState.name);
      formData.append('description', formState.description);
      formData.append('type', formState.type);
      formData.append('season', formState.season);
      formData.append('formality', formState.formality);
      formData.append('mainColor', formState.mainColor);

      formState.tags.forEach((tag) => {
        formData.append(`tags`, tag);
      });

      if (formState.additionalColors.length > 0) {
        formState.additionalColors.forEach((color) => {
          formData.append(`additionalColors`, color);
        });
      } else {
        formData.append('additionalColors', '');
      }

      formData.append('brand', formState.brand || '');
      formData.append('reference', formState.reference || '');

      await api.putFormData(`/items/${itemId}`, formData);

      Alert.alert('Succès', 'Le vêtement a été modifié !');
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Erreur modification:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, itemId, onSuccess, handleClose]);

  const updateFormField = useCallback(
    <K extends keyof ItemFormState>(field: K, value: ItemFormState[K]) => {
      setFormState((prev) => (prev ? { ...prev, [field]: value } : null));
    },
    []
  );

  const isSubmitDisabled = !formState?.name || !formState?.type || !formState?.mainColor || isSubmitting;

  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const imageUrl = item?.imageUrl ? `${API_URL}${item.imageUrl}` : null;

  return (
    <Sheet
      ref={sheetRef}
      onDismiss={handleClose}
      snapPoints={['100%']}
      enableDynamicSizing={false}
      handleComponent={null}
      enableContentPanningGesture={false}
      stackBehavior="push"
    >
      <BottomSheetScrollView style={[styles.contentContainer, { backgroundColor }]} bounces={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeButton, { color: tintColor }]}>Annuler</Text>
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Modifier le vêtement</ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tintColor} />
              <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
            </View>
          ) : formState ? (
            <ItemForm
              selectedImage={null}
              imageUrl={imageUrl}
              formState={formState}
              onUpdateField={updateFormField}
              onSubmit={updateItem}
              isSubmitDisabled={isSubmitDisabled}
              tintColor={tintColor}
              textColor={textColor}
              submitButtonText={isSubmitting ? 'Modification...' : 'Enregistrer les modifications'}
            />
          ) : null}
        </SafeAreaView>
      </BottomSheetScrollView>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
});

export default EditItemSheet;
