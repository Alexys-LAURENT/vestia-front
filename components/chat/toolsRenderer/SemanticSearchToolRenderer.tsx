import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface SemanticSearchToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-semanticSearch' }>
  index: number
}

export const SemanticSearchToolRenderer = ({ part, index }: SemanticSearchToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View
        key={`part-tool-semantic-search-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">🧠</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Recherche sémantique...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View
        key={`part-tool-semantic-search-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">Erreur lors de la recherche</Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View
        key={`part-tool-semantic-search-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">✓</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Recherche terminée
        </Text>
      </View>
    )
  }

  return null
}
