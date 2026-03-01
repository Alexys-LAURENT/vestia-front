import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface SaveLookToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-saveLook' }>
  index: number
}

export const SaveLookToolRenderer = ({ part, index }: SaveLookToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View key={`part-tool-save-look-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">💾</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Sauvegarde en cours...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View key={`part-tool-save-look-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">
          Erreur lors de la sauvegarde
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View key={`part-tool-save-look-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">✓</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Tenue sauvegardée
        </Text>
      </View>
    )
  }

  return null
}
