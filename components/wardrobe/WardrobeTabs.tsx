import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useRef } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';

export type WardrobeTab = 'items' | 'looks';

interface WardrobeTabsProps {
  activeTab: WardrobeTab;
  onTabChange: (tab: WardrobeTab) => void;
}

export const WardrobeTabs: React.FC<WardrobeTabsProps> = ({ activeTab, onTabChange }) => {
  const textColor = useThemeColor({}, 'text');
  const textTertiary = useThemeColor({}, 'textTertiary');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = React.useState(0);

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: activeTab === 'items' ? 0 : 1,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTabWidth(width / 2);
  };

  const indicatorTranslate = indicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={[styles.tabsWrapper, { borderBottomColor: borderColor }]}>
        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: tintColor,
              transform: [{ translateX: indicatorTranslate }],
              width: tabWidth,
            },
          ]}
        />

        {/* Tabs */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabChange('items')}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              styles.tabText,
              {
                color: activeTab === 'items' ? textColor : textTertiary,
                fontSize: Typography.size.body,
                fontWeight: activeTab === 'items' ? Typography.weight.semibold : Typography.weight.regular,
              },
            ]}
          >
            Vêtements
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabChange('looks')}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              styles.tabText,
              {
                color: activeTab === 'looks' ? textColor : textTertiary,
                fontSize: Typography.size.body,
                fontWeight: activeTab === 'looks' ? Typography.weight.semibold : Typography.weight.regular,
              },
            ]}
          >
            Tenues
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  tabsWrapper: {
    flexDirection: 'row',
    position: 'relative',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    letterSpacing: -0.2,
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
  },
});
