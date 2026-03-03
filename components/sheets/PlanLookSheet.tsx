import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import DateTimePicker from '@react-native-community/datetimepicker'
import React, { useCallback, useEffect, useState } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { Sheet, useSheetRef } from './Sheet'

interface PlanLookSheetProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: Date, notes?: string) => void
}

export const PlanLookSheet: React.FC<PlanLookSheetProps> = ({ isOpen, onClose, onConfirm }) => {
  const sheetRef = useSheetRef()
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const onTintColor = useThemeColor({}, 'onTint')
  const borderColor = useThemeColor({}, 'border')

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios')

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present()
      // Reset state
      setSelectedDate(new Date())
      setNotes('')
    } else {
      sheetRef.current?.dismiss()
    }
  }, [isOpen, sheetRef])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleConfirm = useCallback(() => {
    onConfirm(selectedDate, notes.trim() || undefined)
    handleClose()
  }, [selectedDate, notes, onConfirm, handleClose])

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (date) {
      setSelectedDate(date)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Sheet ref={sheetRef} onDismiss={handleClose} snapPoints={['70%']}>
      <BottomSheetScrollView
        className="flex-1"
        style={{ backgroundColor }}
        contentContainerStyle={{ padding: 24 }}
      >
        <ThemedText className="text-2xl font-bold mb-6">Planifier la tenue</ThemedText>

        {/* Date Selection */}
        <View className="mb-6">
          <ThemedText className="text-base font-semibold mb-2">Date</ThemedText>

          {Platform.OS === 'android' && (
            <TouchableOpacity
              className="p-4 rounded-xl border"
              style={{ borderColor }}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>{formatDate(selectedDate)}</ThemedText>
            </TouchableOpacity>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              textColor={textColor}
              themeVariant="light"
              locale="fr-FR"
            />
          )}
        </View>

        {/* Notes */}
        <View className="mb-6">
          <ThemedText className="text-base font-semibold mb-2">Notes (optionnel)</ThemedText>
          <BottomSheetTextInput
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              minHeight: 100,
              fontSize: 16,
              backgroundColor,
              color: textColor,
              borderColor,
            }}
            placeholder="Ex: Entretien important, soirée, etc."
            placeholderTextColor={`${textColor}80`}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl border-2"
            style={{ borderColor: tintColor }}
            onPress={handleClose}
          >
            <ThemedText className="text-center font-semibold" style={{ color: tintColor }}>
              Annuler
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-3 rounded-xl"
            style={{ backgroundColor: tintColor }}
            onPress={handleConfirm}
          >
            <ThemedText className="text-center font-semibold" style={{ color: onTintColor }}>
              Planifier
            </ThemedText>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </Sheet>
  )
}
