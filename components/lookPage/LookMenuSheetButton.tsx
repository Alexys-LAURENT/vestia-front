import { useThemeColor } from '@/hooks/use-theme-color'
import { Ionicons } from '@expo/vector-icons'
import React, { useCallback } from 'react'
import { Pressable } from 'react-native'
import { LookMenuSheet } from '../sheets/LookMenuSheet'
import { useSheetRef } from '../sheets/Sheet'

interface LookMenuSheetButtonProps {
  lookId: number
  onPlanPress: () => void
}

export const LookMenuSheetButton: React.FC<LookMenuSheetButtonProps> = ({
  lookId,
  onPlanPress,
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

      <LookMenuSheet
        ref={sheetRef}
        lookId={lookId}
        onClose={handleClose}
        onPlanPress={onPlanPress}
      />
    </>
  )
}
