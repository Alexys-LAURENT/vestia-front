import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export type WardrobeTab = 'items' | 'looks';

interface WardrobeTabsProps {
  activeTab: WardrobeTab;
  onTabChange: (tab: WardrobeTab) => void;
}

export const WardrobeTabs: React.FC<WardrobeTabsProps> = ({ activeTab, onTabChange }) => {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  return (
    <View style={[styles.container, { borderColor }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'items' && { backgroundColor: primaryColor },
        ]}
        onPress={() => onTabChange('items')}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === 'items' && styles.activeTabText,
          ]}
        >
          Vêtements
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'looks' && { backgroundColor: primaryColor },
        ]}
        onPress={() => onTabChange('looks')}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === 'looks' && styles.activeTabText,
          ]}
        >
          Tenues
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
});
