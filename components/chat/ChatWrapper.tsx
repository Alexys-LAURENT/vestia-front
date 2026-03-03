import PickItemsSheet from '@/components/sheets/PickItemsSheet'
import { useColorScheme } from '@/hooks/use-color-scheme'
import type { Item } from '@/types/entities'
import { AttachedItem, MyUIMessage } from '@/types/my_ui_message'
import { getStoredToken } from '@/utils/fetchApiClientSide'
import { generateAPIUrl } from '@/utils/generateApiUrl'
import { useChat } from '@ai-sdk/react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { DefaultChatTransport } from 'ai'
import { fetch as expoFetch } from 'expo/fetch'
import { useCallback, useRef, useState } from 'react'
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MessageWrapper from './MessageWrapper'

const SUGGESTION_PROMPTS = [
  { icon: '👔', text: 'Propose-moi une tenue pour un rendez-vous' },
  { icon: '🌦️', text: "Qu'est-ce que je devrais porter aujourd'hui ?" },
  { icon: '📊', text: "Dis moi tout ce que j'ai dans ma garde-robe" },
  { icon: '🔍', text: 'Trouve-moi un haut bleu dans ma garde-robe' },
  { icon: 'ℹ️', text: "Qu'est ce que tu es capable de faire ?" },
]

export default function ChatWrapper() {
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList>(null)
  const [selectedItems, setSelectedItems] = useState<Item[]>([])
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const API_URL = process.env.EXPO_PUBLIC_API_URL
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const { messages, setMessages, error, sendMessage, status } = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl('/chatbot/chat'),
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

    const attachedItems: AttachedItem[] | undefined =
      selectedItems.length > 0
        ? selectedItems.map((item) => ({
            idItem: item.idItem,
            name: item.name,
            imageUrl: item.imageUrl,
            type: item.type,
            brand: item.brand,
          }))
        : undefined

    sendMessage({ text: trimmed, metadata: { attachedItems } })
    setInput('')
    setSelectedItems([])
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [input, isStreaming, sendMessage, selectedItems])

  const handlePickerCallback = useCallback((items: Item[]) => {
    setSelectedItems(items)
  }, [])

  const handleRemoveItem = useCallback((idItem: number) => {
    setSelectedItems((prev) => prev.filter((i) => i.idItem !== idItem))
  }, [])

  const handleNewConversation = useCallback(() => {
    if (isStreaming) return
    setMessages([])
    setInput('')
    setSelectedItems([])
  }, [isStreaming, setMessages])

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
        <Text className="text-[40px] mb-md" style={{ color: isDark ? '#FAFAFA' : '#0A0A0A' }}>
          ✦
        </Text>
        <Text
          className="font-bold tracking-tight text-heading"
          style={{ color: isDark ? '#FAFAFA' : '#0A0A0A' }}
        >
          Vestia AI
        </Text>
        <Text
          className="text-center text-body-sm mt-xs"
          style={{ color: isDark ? '#707070' : '#8A8A8A' }}
        >
          Votre styliste personnel intelligent
        </Text>
      </View>

      {/* Suggestion chips */}
      <View className="w-full gap-sm mt-lg">
        {SUGGESTION_PROMPTS.map((prompt, i) => (
          <Pressable
            key={i}
            onPress={() => handleSuggestion(prompt.text)}
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              borderColor: isDark ? '#2F2F2F' : '#E0E0E0',
            }}
            className="flex-row items-center border rounded-lg px-base py-md active:opacity-70"
          >
            <Text className="text-[18px] mr-md">{prompt.icon}</Text>
            <Text className="flex-1 text-body-sm" style={{ color: isDark ? '#B8B8B8' : '#404040' }}>
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
      {/* Header with new conversation button */}
      {messages.length > 0 && (
        <View className="flex-row items-center justify-between border-b border-light-ui-border dark:border-dark-ui-border px-base py-sm">
          <Text
            className="font-semibold text-body"
            style={{ color: isDark ? '#FAFAFA' : '#0A0A0A' }}
          >
            Vestia AI
          </Text>
          <Pressable
            onPress={handleNewConversation}
            disabled={isStreaming}
            style={{ backgroundColor: isDark ? '#252525' : '#F5F5F5' }}
            className={`flex-row items-center gap-xs px-md py-xs rounded-full active:opacity-70 ${isStreaming ? 'opacity-40' : ''}`}
          >
            <FontAwesome name="plus" size={12} color="#8A8A8A" />
            <Text
              className="font-medium text-body-sm"
              style={{ color: isDark ? '#B8B8B8' : '#404040' }}
            >
              Nouveau
            </Text>
          </Pressable>
        </View>
      )}

      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages area */}
        {messages.length === 0 ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {renderEmptyState()}
          </TouchableWithoutFeedback>
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
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true })
            }}
            onTouchStart={() => {
              if (Platform.OS === 'android') {
                Keyboard.dismiss()
              }
            }}
          />
        )}

        {/* Input area */}
        <View className="border-t border-light-ui-border dark:border-dark-ui-border bg-light-bg-secondary dark:bg-dark-bg-secondary">
          {/* Streaming indicator */}
          {isStreaming && (
            <View className="px-base py-xs">
              <Text
                className="italic text-caption"
                style={{ color: isDark ? '#707070' : '#8A8A8A' }}
              >
                Vestia réfléchit...
              </Text>
            </View>
          )}

          {/* Selected items preview */}
          {selectedItems.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, gap: 8 }}
            >
              {selectedItems.map((item) => (
                <View key={item.idItem} className="relative">
                  <Image
                    source={{ uri: `${API_URL}${item.imageUrl}` }}
                    className="w-[52px] h-[52px] rounded-lg"
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => handleRemoveItem(item.idItem)}
                    className="absolute -top-[4px] -right-[4px] w-[18px] h-[18px] rounded-full bg-light-text-tertiary dark:bg-dark-text-tertiary items-center justify-center"
                  >
                    <Text className="text-[10px] font-bold text-white leading-[12px]">✕</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          <View className="flex-row items-end px-md pt-sm pb-sm gap-sm">
            {/* Pick items button */}
            <Pressable
              onPress={() => setIsPickerOpen(true)}
              className="w-[44px] h-[44px] rounded-full items-center justify-center bg-light-bg-tertiary dark:bg-dark-bg-tertiary active:opacity-70"
            >
              <FontAwesome name="plus" size={18} color="#8A8A8A" />
            </Pressable>

            <View className="flex-1 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl px-base py-[10px] min-h-[44px] justify-center">
              <TextInput
                className="text-body"
                placeholder="Écrivez votre message..."
                placeholderTextColor="#8A8A8A"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                multiline
                maxLength={1000}
                style={{ maxHeight: 100, lineHeight: 20, color: isDark ? '#FAFAFA' : '#0A0A0A' }}
                returnKeyType="send"
                blurOnSubmit={false}
              />
            </View>

            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || isStreaming}
              className="w-[44px] h-[44px] rounded-full items-center justify-center bg-light-bg-tertiary dark:bg-dark-bg-tertiary active:opacity-70"
            >
              <FontAwesome
                name="arrow-up"
                size={16}
                color={input.trim() && !isStreaming ? (isDark ? '#FAFAFA' : '#1A1A1A') : '#8A8A8A'}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <PickItemsSheet
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        callback={handlePickerCallback}
        initialSelectedItems={selectedItems}
      />
    </SafeAreaView>
  )
}
