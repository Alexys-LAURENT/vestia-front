import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Animated, Modal, Platform, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

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
  const textColor = useThemeColor({}, 'text');
  const textTertiary = useThemeColor({}, 'textTertiary');
  const backgroundColor = useThemeColor({}, 'background');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');
  const borderColor = useThemeColor({}, 'border');
  const colorScheme = useColorScheme() ?? 'light';
  const shadows = Shadows[colorScheme];

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      {/* Header avec titre et switch météo */}
      <View style={styles.headerContainer}>
        <ThemedText
          style={[
            styles.title,
            {
              color: textColor,
              fontSize: Typography.size.title,
              fontWeight: Typography.weight.bold,
              fontFamily: Typography.family.display,
            },
          ]}
        >
          Générer
        </ThemedText>
        <View style={styles.weatherToggle}>
          <Ionicons name="partly-sunny-outline" size={20} color={textTertiary} />
          <Switch
            value={weatherEnabled}
            onValueChange={onWeatherToggle}
            trackColor={{ false: borderColor, true: tintColor }}
            thumbColor={backgroundSecondary}
            ios_backgroundColor={borderColor}
          />
        </View>
      </View>

      {/* Date picker pour la météo */}
      {weatherEnabled && (
        <TouchableOpacity
          onPress={onDatePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Animated.View
            style={[
              styles.dateContainer,
              {
                backgroundColor: backgroundSecondary,
                borderColor,
                ...shadows.sm,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.dateContent}>
              <Ionicons name="calendar-outline" size={20} color={tintColor} />
              <ThemedText
                style={[
                  styles.dateText,
                  {
                    color: textColor,
                    fontSize: Typography.size.body,
                    fontWeight: Typography.weight.medium,
                  },
                ]}
              >
                {weatherDate.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </ThemedText>
            </View>
            <Ionicons name="chevron-down" size={18} color={textTertiary} />
          </Animated.View>
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
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={onDatePickerClose}
            >
              <View style={[styles.modalContent, { backgroundColor }]}>
                <View style={styles.modalHeader}>
                  <ThemedText
                    style={[
                      styles.modalTitle,
                      {
                        color: textColor,
                        fontSize: Typography.size.h3,
                        fontWeight: Typography.weight.semibold,
                      },
                    ]}
                  >
                    Sélectionner une date
                  </ThemedText>
                  <TouchableOpacity onPress={onDatePickerClose}>
                    <ThemedText
                      style={[
                        styles.doneButton,
                        {
                          color: tintColor,
                          fontSize: Typography.size.body,
                          fontWeight: Typography.weight.semibold,
                        },
                      ]}
                    >
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
                  textColor={textColor}
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

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    letterSpacing: Typography.letterSpacing.tight,
    lineHeight: Typography.size.title * 1.2,
  },
  weatherToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateText: {
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {},
  doneButton: {},
});
