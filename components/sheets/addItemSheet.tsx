import { useThemeColor } from '@/hooks/use-theme-color';
import type { ItemFormState } from '@/types/item-analysis';
import { api } from '@/utils/fetchApi';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImagePicker } from '../media-gallery';
import type { MediaAssetWithUri } from '../media-gallery/types/media-gallery.types';
import { ThemedText } from '../themed-text';
import { Sheet, useSheetRef } from './Sheet';
import {
  AnalyzingStep,
  ImageSelector,
  initialFormState,
  ItemForm,
  SubmittingStep,
  type AddItemStep,
} from './add-item';

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddItemSheet = ({ isOpen, onClose, onSuccess }: AddItemSheetProps) => {
  const sheetRef = useSheetRef();
  const { pick } = useImagePicker();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // State
  const [step, setStep] = useState<AddItemStep>('select-image');
  const [selectedImage, setSelectedImage] = useState<MediaAssetWithUri | null>(null);
  const [formState, setFormState] = useState<ItemFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen, sheetRef]);

  const resetState = useCallback(() => {
    setStep('select-image');
    setSelectedImage(null);
    setFormState(initialFormState);
    setErrorMessage(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const pickImage = useCallback(async () => {
    const images = await pick({
      allowedMediaTypes: 'photo',
      allowMultipleSelection: false,
      enableCrop: false,
      excludedExtensions: ['gif', 'heic'],
      stackBehavior: 'push',
    });

    if (images && images.length > 0) {
      setSelectedImage(images[0]);
      setErrorMessage(null);
    }
  }, [pick]);



  const submitItem = useCallback(async () => {
    if (!selectedImage) return;

    setStep('submitting');

    try {
      const formData = new FormData();
      const imageUri = selectedImage.croppedUri || selectedImage.localUri || selectedImage.uri;

      formData.append('image', {
        uri: imageUri,
        type: selectedImage.mimeType || 'image/jpeg',
        name: selectedImage.filename || 'image.jpg',
      } as unknown as Blob);

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
      }else{
        formData.append('additionalColors', '');
      }
      formData.append('brand', formState.brand || '');
      formData.append('reference', formState.reference || '');

      await api.postFormData('/items', formData);

      Alert.alert('Succès', 'Le vêtement a été ajouté à votre garde-robe !');
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Erreur création:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création');
      setStep('form');
    }
  }, [selectedImage, formState, onSuccess, handleClose]);

  const updateFormField = useCallback(<K extends keyof ItemFormState>(field: K, value: ItemFormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const isSubmitDisabled = !formState.name || !formState.type || !formState.mainColor;

  const renderContent = () => {
    switch (step) {
      case 'select-image':
        return (
          <ImageSelector
            selectedImage={selectedImage}
            errorMessage={errorMessage}
            onPickImage={pickImage}
            tintColor={tintColor}
            textColor={textColor}
            setErrorMessage={setErrorMessage}
            setFormState={setFormState}
            setSelectedImage={setSelectedImage}
            setStep={setStep}
          />
        );
      case 'analyzing':
        return <AnalyzingStep tintColor={tintColor} textColor={textColor} />;
      case 'form':
        return (
          <ItemForm
            selectedImage={selectedImage}
            formState={formState}
            onUpdateField={updateFormField}
            onSubmit={submitItem}
            isSubmitDisabled={isSubmitDisabled}
            tintColor={tintColor}
            textColor={textColor}
          />
        );
      case 'submitting':
        return <SubmittingStep tintColor={tintColor} textColor={textColor} />;
    }
  };

  return (
    <Sheet
      ref={sheetRef}
      onDismiss={handleClose}
      snapPoints={['100%']}
      enableDynamicSizing={false}
      handleComponent={null}
    >
      <BottomSheetScrollView style={[styles.contentContainer, { backgroundColor }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeButton, { color: tintColor }]}>Annuler</Text>
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Nouveau vêtement</ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          {renderContent()}
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
});

export default AddItemSheet;
