import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface GenerateOutfitToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-generateOutfit' }>
  index: number
}

export const GenerateOutfitToolRenderer = ({ part, index }: GenerateOutfitToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View
        key={`part-tool-generate-outfit-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">✨</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Création d&apos;une tenue...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View
        key={`part-tool-generate-outfit-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">
          Erreur lors de la génération
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View
        key={`part-tool-generate-outfit-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">✓</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Tenue créée
        </Text>
      </View>
    )
  }

  return null
}
