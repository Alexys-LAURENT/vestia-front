import { useColorScheme } from '@/hooks/use-color-scheme'
import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface GeocodeCityToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-geocodeCity' }>
  index: number
}

export const GeocodeCityToolRenderer = ({ part, index }: GeocodeCityToolRendererProps) => {
  const isDark = useColorScheme() === 'dark'

  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View key={`part-tool-geocode-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">📍</Text>
        <Text className="text-caption italic" style={{ color: isDark ? '#707070' : '#8A8A8A' }}>
          Recherche de la ville...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View key={`part-tool-geocode-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">
          Erreur lors de la recherche de la ville
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View key={`part-tool-geocode-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">✓</Text>
        <Text className="text-caption italic" style={{ color: isDark ? '#707070' : '#8A8A8A' }}>
          Ville localisée
        </Text>
      </View>
    )
  }

  return null
}
