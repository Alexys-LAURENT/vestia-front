import { useColorScheme } from '@/hooks/use-color-scheme'
import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface SearchItemsToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-searchItems' }>
  index: number
}

export const SearchItemsToolRenderer = ({ part, index }: SearchItemsToolRendererProps) => {
  const isDark = useColorScheme() === 'dark'

  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View key={`part-tool-search-items-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">🔍</Text>
        <Text className="text-caption italic" style={{ color: isDark ? '#707070' : '#8A8A8A' }}>
          Recherche de vêtements...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View key={`part-tool-search-items-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">Erreur lors de la recherche</Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View key={`part-tool-search-items-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">✓</Text>
        <Text className="text-caption italic" style={{ color: isDark ? '#707070' : '#8A8A8A' }}>
          Recherche terminée
        </Text>
      </View>
    )
  }

  return null
}
