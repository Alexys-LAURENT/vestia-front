import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';

export type InputVariant = 'default' | 'search';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: InputVariant;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  variant = 'default',
  containerStyle,
  ...textInputProps
}) => {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = '#DC2626';
  const placeholderColor = useThemeColor({}, 'textTertiary');

  const [isFocused, setIsFocused] = useState(false);
  const borderWidth = new Animated.Value(1);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderWidth, {
      toValue: 2,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: error ? errorColor : textColor,
              fontSize: Typography.size.caption,
              fontWeight: Typography.weight.medium,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor,
            borderColor: error ? errorColor : isFocused ? textColor : borderColor,
            borderWidth,
            borderRadius: variant === 'search' ? Radius.full : Radius.md,
          },
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            {
              color: textColor,
              fontSize: Typography.size.body,
            },
            icon && styles.inputWithIcon,
          ]}
          placeholderTextColor={placeholderColor}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>

      {error && (
        <Text
          style={[
            styles.error,
            {
              color: errorColor,
              fontSize: Typography.size.caption,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontWeight: Typography.weight.regular,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  error: {
    marginTop: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
});
