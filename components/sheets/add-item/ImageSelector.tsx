import { ItemAnalysisResponse } from '@/types/item-analysis';
import { api } from '@/utils/fetchApi';
import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ImageSelectorProps } from './types';

export const ImageSelector = ({
  selectedImage,
  errorMessage,
  onPickImage,
  tintColor,
  textColor,
  setErrorMessage,
  setFormState,
  setSelectedImage,
  setStep,
}: ImageSelectorProps) => {
  const imageUri = selectedImage?.croppedUri || selectedImage?.localUri || selectedImage?.uri;

    const analyzeImage = useCallback(async () => {
      if (!selectedImage) return;
  
      setStep('analyzing');
      setErrorMessage(null);
  
      try {
        const formData = new FormData();
        const imageUri = selectedImage.croppedUri || selectedImage.localUri || selectedImage.uri;
        
        formData.append('itemImage', {
          uri: imageUri,
          type: selectedImage.mimeType || 'image/jpeg',
          name: selectedImage.filename || 'image.jpg',
        } as unknown as Blob);
  
        const response = await api.postFormData<ItemAnalysisResponse>('/items/analyse', formData);
        console.log(response);
  
        // Si on a eu une réponse positive de l'api
        if("success" in response && response.success === true) {
          // On vérifie quand même que l'IA a bien retourné des données
          if('data' in response && response.data) {
            const data = response.data;
            setFormState({
              name: data.name,
              description: data.description,
              type: data.type,
              tags: data.tags,
              season: data.season[0] || 'printemps',
              formality: data.formality,
              mainColor: data.main_color,
              additionalColors: data.additional_colors,
              brand: '',
              reference: '',
            });
            setStep('form');
            return;
          }else{
            // Si l'IA n'a pas retourné de données
            setErrorMessage('Une erreur est survenue lors de l\'analyse');
            setStep('select-image');
            setSelectedImage(null);
            return;
          }
        }else{
          // Si l'api a retourné une erreur
  
          // Si l'erreur vient de l'IA
          if("reason" in response && response.reason) {
            setErrorMessage(response.reason);
            setStep('select-image');
            setSelectedImage(null);
          }else {
            // Si l'erreur vient de l'api
            setErrorMessage('Une erreur est survenue lors de l\'analyse');
            setStep('select-image');
            setSelectedImage(null);
          }
          return;
        }
      } catch (error) {
        console.error('Erreur analyse:', error);
        setErrorMessage('Une erreur est survenue lors de l\'analyse');
        setStep('select-image');
        setSelectedImage(null);
      }
    }, [selectedImage, setFormState, setStep, setErrorMessage, setSelectedImage]);

  return (
    <View style={styles.container}>
      {selectedImage && imageUri ? (
        <View style={styles.selectedImageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.selectedImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.changeImageButton} onPress={onPickImage}>
            <Text style={styles.changeImageText}>Changer d&apos;image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.imagePickerButton, { borderColor: tintColor }]}
          onPress={onPickImage}
        >
          <Text style={[styles.imagePickerIcon, { color: tintColor }]}>📷</Text>
          <Text style={[styles.imagePickerText, { color: textColor }]}>
            Importer une image de vêtement
          </Text>
          <Text style={[styles.imagePickerSubtext, { color: textColor, opacity: 0.6 }]}>
            Appuyez pour sélectionner une photo
          </Text>
        </TouchableOpacity>
      )}

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {selectedImage && (
        <TouchableOpacity
          style={[styles.validateButton, { backgroundColor: tintColor }]}
          onPress={analyzeImage}
        >
          <Text style={styles.validateButtonText}>Analyser le vêtement</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePickerButton: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 300,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePickerIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  imagePickerText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  imagePickerSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  selectedImageContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
  },
  changeImageButton: {
    marginTop: 12,
    padding: 8,
  },
  changeImageText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  validateButton: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    maxWidth: 300,
    width: '100%',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14,
  },
});
