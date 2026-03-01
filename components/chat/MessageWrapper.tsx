import { MyUIMessage } from '@/types/my_ui_message'
import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'
import { DisplayItemsToolRenderer } from './toolsRenderer/DisplayItemsToolRenderer'
import { GenerateOutfitToolRenderer } from './toolsRenderer/GenerateOutfitToolRenderer'
import { GeocodeCityToolRenderer } from './toolsRenderer/GeocodeCityToolRenderer'
import { GetItemByIdToolRenderer } from './toolsRenderer/GetItemByIdToolRenderer'
import { GetLookByIdToolRenderer } from './toolsRenderer/GetLookByIdToolRenderer'
import { GetLooksToolRenderer } from './toolsRenderer/GetLooksToolRenderer'
import { GetPlannedOutfitsToolRenderer } from './toolsRenderer/GetPlannedOutfitsToolRenderer'
import { GetWeatherToolRenderer } from './toolsRenderer/GetWeatherToolRenderer'
import { PlanOutfitToolRenderer } from './toolsRenderer/PlanOutfitToolRenderer'
import { SaveLookToolRenderer } from './toolsRenderer/SaveLookToolRenderer'
import { SearchItemsToolRenderer } from './toolsRenderer/SearchItemsToolRenderer'
import { SemanticSearchToolRenderer } from './toolsRenderer/SemanticSearchToolRenderer'
import { WardrobeStatsToolRenderer } from './toolsRenderer/WardrobeStatsToolRenderer'

interface MessageWrapperProps {
  message: MyUIMessage
}

const MessageWrapper = ({ message }: MessageWrapperProps) => {
  const isUser = message.role === 'user'
  const attachedItems = isUser ? message.metadata?.attachedItems : undefined
  const API_URL = process.env.EXPO_PUBLIC_API_URL

  // Collect tool invocation parts (shown above the text)
  const toolParts = message.parts.filter(
    (part) =>
      part.type === 'tool-wardrobeStats' ||
      part.type === 'tool-searchItems' ||
      part.type === 'tool-semanticSearch' ||
      part.type === 'tool-generateOutfit' ||
      part.type === 'tool-saveLook' ||
      part.type === 'tool-planOutfit' ||
      part.type === 'tool-getPlannedOutfits' ||
      part.type === 'tool-getLooks' ||
      part.type === 'tool-getItemById' ||
      part.type === 'tool-getLookById' ||
      part.type === 'tool-geocodeCity' ||
      part.type === 'tool-getWeather'
  )

  // Collect text & display parts
  const contentParts = message.parts.filter(
    (part) => part.type === 'text' || part.type === 'tool-displayItems'
  )

  const hasTextContent = contentParts.some(
    (part) => part.type === 'text' && part.text.trim().length > 0
  )

  return (
    <View className={`mb-md ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Tool status indicators */}
      {toolParts.length > 0 && (
        <View className="w-full mb-xs">
          {toolParts.map((part, i) => {
            switch (part.type) {
              case 'tool-wardrobeStats':
                return (
                  <WardrobeStatsToolRenderer
                    key={`${message.id}-tool-${i}`}
                    part={part}
                    index={i}
                  />
                )
              case 'tool-searchItems':
                return (
                  <SearchItemsToolRenderer key={`${message.id}-tool-${i}`} part={part} index={i} />
                )
              case 'tool-semanticSearch':
                return (
                  <SemanticSearchToolRenderer
                    key={`${message.id}-tool-${i}`}
                    part={part}
                    index={i}
                  />
                )
              case 'tool-generateOutfit':
                return (
                  <GenerateOutfitToolRenderer
                    key={`${message.id}-tool-${i}`}
                    part={part}
                    index={i}
                  />
                )
              case 'tool-saveLook':
                return (
                  <SaveLookToolRenderer key={`${message.id}-tool-${i}`} part={part} index={i} />
                )
              case 'tool-planOutfit':
                return (
                  <PlanOutfitToolRenderer key={`${message.id}-tool-${i}`} part={part} index={i} />
                )
              case 'tool-getPlannedOutfits':
                return (
                  <GetPlannedOutfitsToolRenderer
                    key={`${message.id}-tool-${i}`}
                    part={part}
                    index={i}
                  />
                )
              case 'tool-getLooks':
                return (
                  <GetLooksToolRenderer key={`${message.id}-tool-${i}`} part={part} index={i} />
                )
              case 'tool-getItemById':
                return (
                  <GetItemByIdToolRenderer key={`${message.id}-tool-${i}`} part={part} index={i} />
                )
              case 'tool-getLookById':
                return (
                  <GetLookByIdToolRenderer key={`${message.id}-tool-${i}`} part={part} index={i} />
                )
              case 'tool-geocodeCity':
                return (
                  <GeocodeCityToolRenderer key={`${message.id}-tool-${i}`} part={part} index={i} />
                )
              case 'tool-getWeather':
                return (
                  <GetWeatherToolRenderer key={`${message.id}-tool-${i}`} part={part} index={i} />
                )
              default:
                return null
            }
          })}
        </View>
      )}

      {/* Attached items for user messages */}
      {isUser && attachedItems && attachedItems.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, marginBottom: 6 }}
          className="max-w-[85%]"
        >
          {attachedItems.map((item) => (
            <View
              key={item.idItem}
              className="overflow-hidden border rounded-lg border-white/20 dark:border-dark-ui-border"
            >
              <Image
                source={{ uri: `${API_URL}${item.imageUrl}` }}
                className="w-[48px] h-[48px]"
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
      )}

      {/* Message bubble */}
      {hasTextContent && (
        <View
          className={`max-w-[85%] rounded-xl px-base py-md ${
            isUser
              ? 'bg-light-accent-primary dark:bg-dark-accent-primary rounded-br-sm'
              : 'bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-ui-border dark:border-dark-ui-border rounded-bl-sm'
          }`}
        >
          {contentParts.map((part, i) => {
            switch (part.type) {
              case 'text':
                if (!part.text.trim()) return null
                return (
                  <Text
                    key={`${message.id}-${i}`}
                    className={`text-body-sm leading-relaxed ${
                      isUser
                        ? 'text-white dark:text-dark-bg-primary'
                        : 'text-light-text-primary dark:text-dark-text-primary'
                    }`}
                  >
                    {part.text}
                  </Text>
                )
              default:
                return null
            }
          })}
        </View>
      )}

      {/* Display items (full width, below bubble) */}
      {contentParts.map((part, i) => {
        if (part.type === 'tool-displayItems') {
          return (
            <DisplayItemsToolRenderer key={`${message.id}-display-${i}`} part={part} index={i} />
          )
        }
        return null
      })}

      {/* Role label */}
      {!isUser && hasTextContent && (
        <Text className="text-micro text-light-text-tertiary dark:text-dark-text-tertiary mt-[2px] ml-xs tracking-wide uppercase">
          Vestia
        </Text>
      )}
    </View>
  )
}

export default MessageWrapper
