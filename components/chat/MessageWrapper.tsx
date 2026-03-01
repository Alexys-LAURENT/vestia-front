import { MyUIMessage } from '@/types/my_ui_message'
import React from 'react'
import { Text, View } from 'react-native'
import { DisplayItemsToolRenderer } from './toolsRenderer/DisplayItemsToolRenderer'
import { GenerateOutfitToolRenderer } from './toolsRenderer/GenerateOutfitToolRenderer'
import { SaveLookToolRenderer } from './toolsRenderer/SaveLookToolRenderer'
import { SearchItemsToolRenderer } from './toolsRenderer/SearchItemsToolRenderer'
import { SemanticSearchToolRenderer } from './toolsRenderer/SemanticSearchToolRenderer'
import { WardrobeStatsToolRenderer } from './toolsRenderer/WardrobeStatsToolRenderer'

interface MessageWrapperProps {
  message: MyUIMessage
}

const MessageWrapper = ({ message }: MessageWrapperProps) => {
  const isUser = message.role === 'user'

  // Collect tool invocation parts (shown above the text)
  const toolParts = message.parts.filter(
    (part) =>
      part.type === 'tool-wardrobeStats' ||
      part.type === 'tool-searchItems' ||
      part.type === 'tool-semanticSearch' ||
      part.type === 'tool-generateOutfit' ||
      part.type === 'tool-saveLook'
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
        <View className="mb-xs w-full">
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
              default:
                return null
            }
          })}
        </View>
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
