import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface GetPlannedOutfitsToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-getPlannedOutfits' }>
  index: number
}

export const GetPlannedOutfitsToolRenderer = ({
  part,
  index,
}: GetPlannedOutfitsToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View
        key={`part-tool-get-planned-outfits-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">📋</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Récupération des tenues planifiées...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View
        key={`part-tool-get-planned-outfits-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">
          Erreur lors de la récupération des tenues planifiées
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View
        key={`part-tool-get-planned-outfits-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">✓</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Tenues planifiées récupérées
        </Text>
      </View>
    )
  }

  return null
}
