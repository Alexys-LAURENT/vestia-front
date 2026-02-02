import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Item } from '@/types/entities';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';

interface ItemReasonModalProps {
  visible: boolean;
  item: (Item & { reason: string }) | null;
  onClose: () => void;
}

export const ItemReasonModal: React.FC<ItemReasonModalProps> = ({ visible, item, onClose }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  if (!item) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View 
          className="mx-6 p-6 rounded-2xl max-w-sm"
          style={{ backgroundColor }}
          onStartShouldSetResponder={() => true}
        >
          <ThemedText className="text-xl font-bold mb-3">
            {item.name}
          </ThemedText>
          <ThemedText className="text-base leading-6 opacity-80">
            {item.reason}
          </ThemedText>
          <TouchableOpacity 
            className="mt-4 py-3 rounded-xl items-center"
            style={{ backgroundColor: tintColor }}
            onPress={onClose}
          >
            <ThemedText className="text-white font-semibold">Compris</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
