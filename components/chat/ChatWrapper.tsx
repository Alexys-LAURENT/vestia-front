import { MyUIMessage } from '@/types/my_ui_message'
import { getStoredToken } from '@/utils/fetchApiClientSide'
import { generateAPIUrl } from '@/utils/generateApiUrl'
import { useChat } from '@ai-sdk/react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { DefaultChatTransport } from 'ai'
import { fetch as expoFetch } from 'expo/fetch'
import { useCallback, useRef, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MessageWrapper from './MessageWrapper'

const SUGGESTION_PROMPTS = [
  { icon: '👔', text: 'Propose-moi une tenue pour un rendez-vous' },
  { icon: '🌦️', text: "Qu'est-ce que je devrais porter aujourd'hui ?" },
  { icon: '📊', text: "Dis moi tout ce que j'ai dans ma garde-robe" },
  { icon: '🔍', text: 'Trouve-moi un haut bleu dans ma garde-robe' },
]

export default function ChatWrapper() {
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList>(null)

  const { messages, error, sendMessage, status } = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl('/api/chat'),
      headers: async () => {
        const token = await getStoredToken()
        return {
          Authorization: token ? `Bearer ${token}` : '',
        }
      },
    }),
    onError: (error) => console.error(error, 'ERROR'),
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    sendMessage({ text: trimmed })
    setInput('')
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [input, isStreaming, sendMessage])

  const handleSuggestion = useCallback(
    (text: string) => {
      if (isStreaming) return
      sendMessage({ text })
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    },
    [isStreaming, sendMessage]
  )

  if (error) {
    return (
      <View className="items-center justify-center flex-1 bg-light-bg-primary dark:bg-dark-bg-primary px-lg">
        <Text className="font-medium text-center text-semantic-error text-body">
          {error.message}
        </Text>
      </View>
    )
  }

  const renderEmptyState = () => (
    <View className="items-center justify-center flex-1 px-lg">
      {/* Brand mark */}
      <View className="items-center mb-xl">
        <Text className="text-[40px] mb-md">✦</Text>
        <Text className="font-bold tracking-tight text-heading text-light-text-primary dark:text-dark-text-primary">
          Vestia AI
        </Text>
        <Text className="text-center text-body-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-xs">
          Votre styliste personnel intelligent
        </Text>
      </View>

      {/* Suggestion chips */}
      <View className="w-full gap-sm mt-lg">
        {SUGGESTION_PROMPTS.map((prompt, i) => (
          <Pressable
            key={i}
            onPress={() => handleSuggestion(prompt.text)}
            className="flex-row items-center border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border-light-ui-border dark:border-dark-ui-border px-base py-md active:opacity-70"
          >
            <Text className="text-[18px] mr-md">{prompt.icon}</Text>
            <Text className="flex-1 text-body-sm text-light-text-secondary dark:text-dark-text-secondary">
              {prompt.text}
            </Text>
            <FontAwesome name="angle-right" size={16} color="#8A8A8A" />
          </Pressable>
        ))}
      </View>
    </View>
  )

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-light-bg-primary dark:bg-dark-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages area */}
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageWrapper message={item} />}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true })
            }}
          />
        )}

        {/* Input area */}
        <View className="border-t border-light-ui-border dark:border-dark-ui-border bg-light-bg-secondary dark:bg-dark-bg-secondary">
          {/* Streaming indicator */}
          {isStreaming && (
            <View className="px-base py-xs">
              <Text className="italic text-caption text-light-text-tertiary dark:text-dark-text-tertiary">
                Vestia réfléchit...
              </Text>
            </View>
          )}

          <View className="flex-row items-end px-md pt-sm pb-sm gap-sm">
            <View className="flex-1 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl px-base py-[10px] min-h-[44px] justify-center">
              <TextInput
                className="text-body text-light-text-primary dark:text-dark-text-primary"
                placeholder="Écrivez votre message..."
                placeholderTextColor="#8A8A8A"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                multiline
                maxLength={1000}
                style={{ maxHeight: 100, lineHeight: 20 }}
                returnKeyType="send"
                blurOnSubmit={false}
              />
            </View>

            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || isStreaming}
              className={`w-[44px] h-[44px] rounded-full items-center justify-center ${
                input.trim() && !isStreaming
                  ? 'bg-light-accent-primary dark:bg-dark-accent-primary'
                  : 'bg-light-accent-secondary dark:bg-dark-accent-secondary'
              } active:opacity-70`}
            >
              <FontAwesome
                name="arrow-up"
                size={16}
                color={input.trim() && !isStreaming ? '#FFFFFF' : '#8A8A8A'}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
