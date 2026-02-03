import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import {
    Pressable,
    PressableProps,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

export type CardVariant = 'elevated' | 'outlined' | 'glass';

interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: CardVariant;
  interactive?: boolean;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  interactive = false,
  style,
  ...pressableProps
}) => {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = useThemeColor({}, 'border');
  const colorScheme = useColorScheme() ?? 'light';

  // Variant styles
  const getVariantStyle = (): ViewStyle => {
    const shadows = Shadows[colorScheme];

    switch (variant) {
      case 'elevated':
        return {
          backgroundColor,
          ...shadows.md,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor,
          borderWidth: 1,
          borderColor,
        };
      case 'glass':
        return {
          backgroundColor: `${backgroundColor}E6`, // 90% opacity
          borderWidth: 1,
          borderColor: `${borderColor}80`, // 50% opacity
          backdropFilter: 'blur(10px)', // Note: may not work on all platforms
        };
    }
  };

  const Component = interactive ? Pressable : View;

  return (
    <Component
      {...(interactive ? pressableProps : {})}
      style={({ pressed }: any) => [
        styles.card,
        getVariantStyle(),
        {
          opacity: interactive && pressed ? 0.9 : 1,
          transform:
            interactive && pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
        },
        style,
      ]}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.base,
  },
});
