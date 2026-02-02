import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, Platform, Switch, TouchableOpacity, View } from 'react-native';

interface WeatherHeaderProps {
  weatherEnabled: boolean;
  weatherDate: Date;
  showDatePicker: boolean;
  onWeatherToggle: (enabled: boolean) => void;
  onDatePress: () => void;
  onDateChange: (date: Date) => void;
  onDatePickerClose: () => void;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({
  weatherEnabled,
  weatherDate,
  showDatePicker,
  onWeatherToggle,
  onDatePress,
  onDateChange,
  onDatePickerClose,
}) => {
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <>
      {/* Header avec titre et switch météo */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <ThemedText className="text-2xl font-bold">Créer un look</ThemedText>
        <View className="flex-row items-center gap-2">
          <Ionicons name="partly-sunny-outline" size={20} color={iconColor} />
          <Switch
            value={weatherEnabled}
            onValueChange={onWeatherToggle}
            trackColor={{ false: iconColor + '40', true: tintColor }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Date picker pour la météo */}
      {weatherEnabled && (
        <TouchableOpacity 
          className="mx-4 mb-3 px-3 py-2 rounded-lg flex-row items-center justify-between"
          style={{ backgroundColor: tintColor + '20', borderColor: tintColor, borderWidth: 1 }}
          onPress={onDatePress}
        >
          <ThemedText className="text-sm font-medium">
            Météo pour le {weatherDate.toLocaleDateString('fr-FR')}
          </ThemedText>
          <Ionicons name="calendar-outline" size={18} color={tintColor} />
        </TouchableOpacity>
      )}

      {/* DateTimePicker Modal */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={onDatePickerClose}
          >
            <TouchableOpacity 
              className="flex-1 justify-end"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              activeOpacity={1}
              onPress={onDatePickerClose}
            >
              <View className="rounded-t-3xl p-4" style={{ backgroundColor }}>
                <View className="flex-row justify-between items-center mb-2">
                  <ThemedText className="text-lg font-semibold">Sélectionner une date</ThemedText>
                  <TouchableOpacity onPress={onDatePickerClose}>
                    <ThemedText className="text-base font-semibold" style={{ color: tintColor }}>
                      Valider
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={weatherDate}
                  mode="date"
                  display="spinner"
                  onChange={(_event: any, selectedDate?: Date) => {
                    if (selectedDate) {
                      onDateChange(selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                  textColor={iconColor}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={weatherDate}
            mode="date"
            display="default"
            onChange={(_event: any, selectedDate?: Date) => {
              onDatePickerClose();
              if (selectedDate) {
                onDateChange(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )
      )}
    </>
  );
};
