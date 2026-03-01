import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface GetItemByIdToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-getItemById' }>
  index: number
}

export const GetItemByIdToolRenderer = ({ part, index }: GetItemByIdToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View key={`part-tool-get-item-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">👕</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Récupération du vêtement...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View key={`part-tool-get-item-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">
          Erreur lors de la récupération du vêtement
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View key={`part-tool-get-item-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">✓</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Vêtement récupéré
        </Text>
      </View>
    )
  }

  return null
}
