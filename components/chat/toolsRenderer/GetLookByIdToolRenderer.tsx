import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface GetLookByIdToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-getLookById' }>
  index: number
}

export const GetLookByIdToolRenderer = ({ part, index }: GetLookByIdToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View key={`part-tool-get-look-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">👗</Text>
        <Text className="text-caption italic text-light-textTertiary dark:text-dark-textTertiary">
          Récupération de la tenue...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View key={`part-tool-get-look-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">
          Erreur lors de la récupération de la tenue
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View key={`part-tool-get-look-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">✓</Text>
        <Text className="text-caption italic text-light-textTertiary dark:text-dark-textTertiary">
          Tenue récupérée
        </Text>
      </View>
    )
  }

  return null
}
