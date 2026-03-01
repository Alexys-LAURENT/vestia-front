import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface PlanOutfitToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-planOutfit' }>
  index: number
}

export const PlanOutfitToolRenderer = ({ part, index }: PlanOutfitToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View key={`part-tool-plan-outfit-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">📅</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Planification en cours...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View key={`part-tool-plan-outfit-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">
          Erreur lors de la planification
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View key={`part-tool-plan-outfit-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">✓</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Tenue planifiée
        </Text>
      </View>
    )
  }

  return null
}
