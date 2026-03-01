import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface WardrobeStatsToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-wardrobeStats' }>
  index: number
}

export const WardrobeStatsToolRenderer = ({ part, index }: WardrobeStatsToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View
        key={`part-tool-wardrobe-stats-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">📊</Text>
        <Text className="italic text-caption text-light-text-tertiary dark:text-dark-text-tertiary">
          Analyse de la garde-robe...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View
        key={`part-tool-wardrobe-stats-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">❌</Text>
        <Text className="italic text-caption text-semantic-error">
          Erreur lors de l&apos;analyse
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View
        key={`part-tool-wardrobe-stats-${index}`}
        className="flex-row items-center gap-xs py-xs"
      >
        <Text className="text-caption">✓</Text>
        <Text className="italic text-caption text-light-text-tertiary dark:text-dark-text-tertiary">
          Analyse terminée
        </Text>
      </View>
    )
  }

  return null
}
