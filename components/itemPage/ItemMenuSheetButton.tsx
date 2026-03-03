import { useThemeColor } from '@/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'
import React, { useCallback } from 'react'
import { Pressable } from 'react-native'
import { ItemMenuSheet } from '../sheets/ItemMenuSheet'
import { useSheetRef } from '../sheets/Sheet'

interface ItemMenuSheetButtonProps {
  itemId: number
  onEditSuccess?: () => void
}

export const ItemMenuSheetButton: React.FC<ItemMenuSheetButtonProps> = ({
  itemId,
  onEditSuccess,
}) => {
  const tintColor = useThemeColor({}, 'tint')
  const sheetRef = useSheetRef()

  const handlePress = useCallback(() => {
    sheetRef.current?.present()
  }, [sheetRef])

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss()
  }, [sheetRef])

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="w-[40px] h-[40px] justify-center items-center"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={tintColor} />
      </Pressable>

      <ItemMenuSheet
        ref={sheetRef}
        itemId={itemId}
        onClose={handleClose}
        onEditSuccess={onEditSuccess}
      />
    </>
  )
}
