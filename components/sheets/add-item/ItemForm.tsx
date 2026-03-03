import { ITEM_FORMALITIES, ITEM_SEASONS, ITEM_TYPES } from '@/constants/file_types'
import { useThemeColor } from '@/hooks/use-theme-color'
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import React from 'react'
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import type { ItemFormProps } from './types'

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
  useBottomSheet = true,
}: ItemFormProps) => {
  const selectedTextColor = useThemeColor({}, 'onTint')
  const borderColor = useThemeColor({}, 'border')
  const inputBackground = useThemeColor({}, 'backgroundSecondary')
  const placeholderColor = useThemeColor({}, 'textTertiary')
  const imageUri =
    imageUrl || selectedImage?.croppedUri || selectedImage?.localUri || selectedImage?.uri

  const InputComponent = useBottomSheet ? BottomSheetTextInput : TextInput
  const ScrollViewComponent = useBottomSheet ? BottomSheetScrollView : ScrollView

  const inputStyle = {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: textColor,
    backgroundColor: inputBackground,
    borderColor,
  }

  return (
    <ScrollViewComponent className="flex-1 p-base">
      {/* Image preview */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          className="w-full rounded-md mb-[20px]"
          style={{ height: 200 }}
          resizeMode="cover"
        />
      )}

      {/* Nom */}
      <FormField label="Nom *" textColor={textColor}>
        <InputComponent
          style={inputStyle}
          value={formState.name}
          onChangeText={(value) => onUpdateField('name', value)}
          placeholder="Nom du vêtement"
          placeholderTextColor={placeholderColor}
        />
      </FormField>

      {/* Description */}
      <FormField label="Description" textColor={textColor}>
        <InputComponent
          style={{ ...inputStyle, height: 180, textAlignVertical: 'top' }}
          value={formState.description}
          onChangeText={(value) => onUpdateField('description', value)}
          placeholder="Description du vêtement"
          placeholderTextColor={placeholderColor}
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
          selectedTextColor={selectedTextColor}
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
          selectedTextColor={selectedTextColor}
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
          selectedTextColor={selectedTextColor}
          horizontal
        />
      </FormField>

      {/* Couleur principale */}
      <FormField label="Couleur principale *" textColor={textColor}>
        <InputComponent
          style={inputStyle}
          value={formState.mainColor}
          onChangeText={(value) => onUpdateField('mainColor', value)}
          placeholder="Ex: Bleu marine"
          placeholderTextColor={placeholderColor}
        />
      </FormField>

      {/* Marque */}
      <FormField label="Marque" textColor={textColor}>
        <InputComponent
          style={inputStyle}
          value={formState.brand}
          onChangeText={(value) => onUpdateField('brand', value)}
          placeholder="Ex: Nike, Zara..."
          placeholderTextColor={placeholderColor}
        />
      </FormField>

      {/* Référence */}
      <FormField label="Référence" textColor={textColor}>
        <InputComponent
          style={inputStyle}
          value={formState.reference}
          onChangeText={(value) => onUpdateField('reference', value)}
          placeholder="Référence du produit"
          placeholderTextColor={placeholderColor}
        />
      </FormField>

      {/* Submit button */}
      <TouchableOpacity
        style={[
          { paddingVertical: 16, borderRadius: 12, marginTop: 8, backgroundColor: tintColor },
          isSubmitDisabled && { opacity: 0.5 },
        ]}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
      >
        <Text className="font-semibold text-center text-body" style={{ color: selectedTextColor }}>
          {submitButtonText}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollViewComponent>
  )
}

// Sous-composants

interface FormFieldProps {
  label: string
  textColor: string
  children: React.ReactNode
}

const FormField = ({ label, textColor, children }: FormFieldProps) => (
  <View className="mb-[20px]">
    <Text
      className="font-medium uppercase text-caption mb-sm"
      style={{ color: textColor, letterSpacing: 0.5 }}
    >
      {label}
    </Text>
    {children}
  </View>
)

interface ChipSelectorProps<T extends string> {
  items: readonly T[]
  selectedItem: T
  onSelect: (item: T) => void
  tintColor: string
  textColor: string
  selectedTextColor: string
  horizontal?: boolean
}

function ChipSelector<T extends string>({
  items,
  selectedItem,
  onSelect,
  tintColor,
  textColor,
  selectedTextColor,
  horizontal = false,
}: ChipSelectorProps<T>) {
  const content = (
    <View className="flex-row flex-wrap gap-sm">
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          className="px-md py-sm rounded-[20px] bg-[rgba(128,128,128,0.15)]"
          style={selectedItem === item ? { backgroundColor: tintColor } : undefined}
          onPress={() => onSelect(item)}
        >
          <Text
            className="text-body-sm"
            style={{ color: selectedItem === item ? selectedTextColor : textColor }}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  if (horizontal) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {content}
      </ScrollView>
    )
  }

  return content
}
