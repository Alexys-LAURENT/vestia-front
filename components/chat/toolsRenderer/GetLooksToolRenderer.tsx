import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface GetLooksToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-getLooks' }>
  index: number
}

export const GetLooksToolRenderer = ({ part, index }: GetLooksToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View key={`part-tool-get-looks-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">👗</Text>
        <Text className="text-caption italic text-light-textTertiary dark:text-dark-textTertiary">
          Récupération des tenues...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View key={`part-tool-get-looks-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">
          Erreur lors de la récupération des tenues
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View key={`part-tool-get-looks-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">✓</Text>
        <Text className="text-caption italic text-light-textTertiary dark:text-dark-textTertiary">
          Tenues récupérées
        </Text>
      </View>
    )
  }

  return null
}
