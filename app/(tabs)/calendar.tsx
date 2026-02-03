import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { usePlannedOutfits } from '@/hooks/usePlannedOutfits'
import type { PlannedOutfit } from '@/types/entities'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SCREEN_WIDTH = Dimensions.get('window').width

export default function CalendarScreen() {
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor({}, 'border')
  const mutedColor = `${textColor}80`
  const API_URL = process.env.EXPO_PUBLIC_API_URL
  const router = useRouter()

  const [plannedOutfits, setPlannedOutfits] = useState<PlannedOutfit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const scrollViewRef = useRef<ScrollView>(null)

  const { getPlannedOutfits, deletePlannedOutfit } = usePlannedOutfits()

  // Generate array of 30 days (15 before, today, 14 after)
  const days = useMemo(() => {
    const result = []
    const today = new Date()
    for (let i = -15; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      result.push(date)
    }
    return result
  }, [])

  const loadPlannedOutfits = useCallback(async () => {
    setIsLoading(true)
    const outfits = await getPlannedOutfits()
    setPlannedOutfits(outfits)
    setIsLoading(false)
  }, [getPlannedOutfits])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await loadPlannedOutfits()
    setIsRefreshing(false)
  }, [loadPlannedOutfits])

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert(
        'Supprimer',
        'Voulez-vous vraiment supprimer cette tenue planifiée ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              const success = await deletePlannedOutfit(id)
              if (success) {
                setPlannedOutfits((prev) => prev.filter((outfit) => outfit.idPlannedOutfit !== id))
                Alert.alert('Succès', 'Tenue planifiée supprimée')
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer la tenue planifiée')
              }
            },
          },
        ]
      )
    },
    [deletePlannedOutfit]
  )

  useFocusEffect(
    useCallback(() => {
      loadPlannedOutfits()
    }, [loadPlannedOutfits])
  )

  // Filter outfits for selected date
  const selectedDateString = selectedDate.toISOString().split('T')[0]
  const filteredOutfits = useMemo(() => {
    return plannedOutfits.filter((outfit) => {
      const outfitDate = new Date(outfit.plannedDate).toISOString().split('T')[0]
      return outfitDate === selectedDateString
    })
  }, [plannedOutfits, selectedDateString])

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const scrollToToday = useCallback(() => {
    setSelectedDate(new Date())
    // Scroll to today (index 15 in our array of 30 days)
    const todayIndex = 15
    const itemWidth = 48 + 4 // width + marginHorizontal * 2
    const scrollPosition = todayIndex * itemWidth - SCREEN_WIDTH / 2 + itemWidth / 2
    scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true })
  }, [])

  const renderDayItem = (date: Date) => {
    const isSelected = isSameDay(date, selectedDate)
    const isTodayDate = isToday(date)
    const dayNumber = date.getDate()
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' })

    // Count outfits for this day
    const dateString = date.toISOString().split('T')[0]
    const outfitCount = plannedOutfits.filter((outfit) => {
      const outfitDate = new Date(outfit.plannedDate).toISOString().split('T')[0]
      return outfitDate === dateString
    }).length

    return (
      <TouchableOpacity
        key={date.toISOString()}
        onPress={() => setSelectedDate(date)}
        style={{
          width: 48,
          height: 58,
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 2,
          borderRadius: 10,
          backgroundColor: isSelected ? tintColor : 'transparent',
          borderWidth: isTodayDate && !isSelected ? 2 : 0,
          borderColor: tintColor,
        }}
      >
        <ThemedText
          style={{
            fontSize: 10,
            fontWeight: '600',
            color: isSelected ? '#fff' : mutedColor,
            textTransform: 'capitalize',
          }}
        >
          {dayName}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isSelected ? '#fff' : textColor,
            marginTop: 1,
          }}
        >
          {dayNumber}
        </ThemedText>
        {/* Toujours réserver l'espace pour le dot */}
        <View
          style={{
            marginTop: 2,
            height: 4,
            width: 4,
          }}
        >
          {outfitCount > 0 && (
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: isSelected ? '#fff' : tintColor,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderOutfitCard = ({ item }: { item: PlannedOutfit }) => {
    const previewItems = item.look.items.slice(0, 4)

    return (
      <TouchableOpacity
        style={{
          backgroundColor,
          borderColor,
          borderWidth: 1,
          borderRadius: 16,
          marginBottom: 16,
          overflow: 'hidden',
        }}
        onPress={() => router.push(`/look/${item.idLook}`)}
        activeOpacity={0.7}
      >
        {/* Image Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {previewItems.map((previewItem, index) => (
            <Image
              key={previewItem.idItem}
              source={{ uri: `${API_URL}${previewItem.imageUrl}` }}
              style={{
                width: SCREEN_WIDTH / 2 - 17,
                height: SCREEN_WIDTH / 2 - 17,
              }}
              resizeMode="cover"
            />
          ))}
          {previewItems.length < 4 &&
            Array.from({ length: 4 - previewItems.length }).map((_, i) => (
              <View
                key={`empty-${i}`}
                style={{
                  width: SCREEN_WIDTH / 2 - 17,
                  height: SCREEN_WIDTH / 2 - 17,
                  backgroundColor: borderColor + '20',
                }}
              />
            ))}
        </View>

        {/* Info Footer */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>
              {item.look.event || 'Tenue sans événement'}
            </ThemedText>
            {item.notes && (
              <ThemedText
                style={{ fontSize: 12, color: mutedColor, marginTop: 2 }}
                numberOfLines={1}
              >
                {item.notes}
              </ThemedText>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.idPlannedOutfit)}
            style={{
              padding: 8,
              borderRadius: 8,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmpty = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
      <Ionicons name="calendar-outline" size={64} color={mutedColor} style={{ opacity: 0.5 }} />
      <ThemedText
        style={{
          fontSize: 16,
          color: mutedColor,
          marginTop: 16,
          textAlign: 'center',
        }}
      >
        Aucune tenue planifiée ce jour
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 14,
          color: mutedColor,
          marginTop: 8,
          textAlign: 'center',
          paddingHorizontal: 32,
        }}
      >
        Créez et planifiez vos tenues depuis l&apos;onglet Créer
      </ThemedText>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top']}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
          }}
        >
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Calendrier</ThemedText>
          <TouchableOpacity
            onPress={scrollToToday}
            style={{
              backgroundColor: tintColor,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              opacity: isToday(selectedDate) ? 0 : 1,
            }}
            disabled={isToday(selectedDate)}
          >
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
              Aujourd&apos;hui
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Horizontal Day Selector */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            maxHeight: 70,
          }}
        >
          {days.map((day) => renderDayItem(day))}
        </ScrollView>

        {/* Content */}
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={tintColor} />
          </View>
        ) : (
          <FlatList
            data={filteredOutfits}
            renderItem={renderOutfitCard}
            keyExtractor={(item) => item.idPlannedOutfit.toString()}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={tintColor}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}
