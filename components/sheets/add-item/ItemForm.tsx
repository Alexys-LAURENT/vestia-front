import { ITEM_FORMALITIES, ITEM_SEASONS, ITEM_TYPES } from '@/constants/file_types';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import type { ItemFormProps } from './types';

export const ItemForm = ({
  selectedImage,
  imageUrl,
  formState,
  onUpdateField,
  onSubmit,
  isSubmitDisabled,
  tintColor,
  textColor,
  submitButtonText = 'Ajouter à ma garde-robe',
}: ItemFormProps) => {
  const imageUri = imageUrl || selectedImage?.croppedUri || selectedImage?.localUri || selectedImage?.uri;

  return (
    <BottomSheetScrollView style={styles.container}>
      {/* Image preview */}
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.formImage} resizeMode="cover" />
      )}

      {/* Nom */}
      <FormField label="Nom *" textColor={textColor}>
        <BottomSheetTextInput
          style={[styles.input, { color: textColor, borderColor: tintColor }]}
          value={formState.name}
          onChangeText={(value) => onUpdateField('name', value)}
          placeholder="Nom du vêtement"
          placeholderTextColor={`${textColor}80`}
        />
      </FormField>

      {/* Description */}
      <FormField label="Description" textColor={textColor}>
        <BottomSheetTextInput
          style={[styles.input, styles.textArea, { color: textColor, borderColor: tintColor }]}
          value={formState.description}
          onChangeText={(value) => onUpdateField('description', value)}
          placeholder="Description du vêtement"
          placeholderTextColor={`${textColor}80`}
          multiline
          numberOfLines={5}
        />
      </FormField>

      {/* Type */}
      <FormField label="Type *" textColor={textColor}>
        <ChipSelector
          items={ITEM_TYPES}
          selectedItem={formState.type}
          onSelect={(type) => onUpdateField('type', type)}
          tintColor={tintColor}
          textColor={textColor}
          horizontal
        />
      </FormField>

      {/* Saison */}
      <FormField label="Saison *" textColor={textColor}>
        <ChipSelector
          items={ITEM_SEASONS}
          selectedItem={formState.season}
          onSelect={(season) => onUpdateField('season', season)}
          tintColor={tintColor}
          textColor={textColor}
        />
      </FormField>

      {/* Formalité */}
      <FormField label="Style *" textColor={textColor}>
        <ChipSelector
          items={ITEM_FORMALITIES}
          selectedItem={formState.formality}
          onSelect={(formality) => onUpdateField('formality', formality)}
          tintColor={tintColor}
          textColor={textColor}
          horizontal
        />
      </FormField>

      {/* Couleur principale */}
      <FormField label="Couleur principale *" textColor={textColor}>
        <BottomSheetTextInput
          style={[styles.input, { color: textColor, borderColor: tintColor }]}
          value={formState.mainColor}
          onChangeText={(value) => onUpdateField('mainColor', value)}
          placeholder="Ex: Bleu marine"
          placeholderTextColor={`${textColor}80`}
        />
      </FormField>

      {/* Marque */}
      <FormField label="Marque" textColor={textColor}>
        <BottomSheetTextInput
          style={[styles.input, { color: textColor, borderColor: tintColor }]}
          value={formState.brand}
          onChangeText={(value) => onUpdateField('brand', value)}
          placeholder="Ex: Nike, Zara..."
          placeholderTextColor={`${textColor}80`}
        />
      </FormField>

      {/* Référence */}
      <FormField label="Référence" textColor={textColor}>
        <BottomSheetTextInput
          style={[styles.input, { color: textColor, borderColor: tintColor }]}
          value={formState.reference}
          onChangeText={(value) => onUpdateField('reference', value)}
          placeholder="Référence du produit"
          placeholderTextColor={`${textColor}80`}
        />
      </FormField>

      {/* Submit button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: tintColor },
          isSubmitDisabled && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
      >
        <Text style={styles.submitButtonText}>{submitButtonText}</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </BottomSheetScrollView>
  );
};

// Sous-composants

interface FormFieldProps {
  label: string;
  textColor: string;
  children: React.ReactNode;
}

const FormField = ({ label, textColor, children }: FormFieldProps) => (
  <View style={styles.formField}>
    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    {children}
  </View>
);

interface ChipSelectorProps<T extends string> {
  items: readonly T[];
  selectedItem: T;
  onSelect: (item: T) => void;
  tintColor: string;
  textColor: string;
  horizontal?: boolean;
}

function ChipSelector<T extends string>({
  items,
  selectedItem,
  onSelect,
  tintColor,
  textColor,
  horizontal = false,
}: ChipSelectorProps<T>) {
  const content = (
    <View style={styles.chipContainer}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.chip, selectedItem === item && { backgroundColor: tintColor }]}
          onPress={() => onSelect(item)}
        >
          <Text
            style={[styles.chipText, { color: selectedItem === item ? '#fff' : textColor }]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (horizontal) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 180,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
  },
  chipText: {
    fontSize: 14,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
