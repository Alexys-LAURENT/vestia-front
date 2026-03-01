import { MyUIMessage } from '@/types/my_ui_message'
import { Text, View } from 'react-native'

interface GetWeatherToolRendererProps {
  part: Extract<MyUIMessage['parts'][number], { type: 'tool-getWeather' }>
  index: number
}

export const GetWeatherToolRenderer = ({ part, index }: GetWeatherToolRendererProps) => {
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <View key={`part-tool-weather-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">🌤️</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Récupération de la météo...
        </Text>
      </View>
    )
  }

  if (part.state === 'output-error') {
    return (
      <View key={`part-tool-weather-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">❌</Text>
        <Text className="text-caption text-semantic-error italic">
          Erreur lors de la récupération météo
        </Text>
      </View>
    )
  }

  if (part.state === 'output-available') {
    return (
      <View key={`part-tool-weather-${index}`} className="flex-row items-center gap-xs py-xs">
        <Text className="text-caption">✓</Text>
        <Text className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary italic">
          Météo récupérée
        </Text>
      </View>
    )
  }

  return null
}
