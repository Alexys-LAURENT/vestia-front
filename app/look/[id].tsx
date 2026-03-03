import { LookCard } from '@/components/LookCard'
import { LookMenuSheetButton } from '@/components/lookPage/LookMenuSheetButton'
import { PlanLookSheet } from '@/components/sheets/PlanLookSheet'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Header } from '@/components/ui/header'
import { useThemeColor } from '@/hooks/use-theme-color'
import { usePlannedOutfits } from '@/hooks/usePlannedOutfits'
import type { Look, PlannedOutfit } from '@/types/entities'
import type { SuccessResponse } from '@/types/requests'
import { api, FetchApiError } from '@/utils/fetchApiClientSide'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native'

export default function LookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')
  const borderColor = useThemeColor({}, 'border')
  const API_URL = process.env.EXPO_PUBLIC_API_URL

  const [look, setLook] = useState<Look | null>(null)
  const [plannedOutfits, setPlannedOutfits] = useState<PlannedOutfit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPlanSheet, setShowPlanSheet] = useState(false)

  const { createPlannedOutfit, getPlannedOutfits, deletePlannedOutfit } = usePlannedOutfits()

  const loadLook = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    try {
      const response = (await api.get(`/looks/${id}`)) as SuccessResponse<Look>
      setLook(response.data)
    } catch (error) {
      if (error instanceof FetchApiError) {
        Alert.alert('Erreur', error.message)
      } else {
        Alert.alert('Erreur', 'Impossible de charger la tenue')
      }
      router.back()
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  const loadPlannedOutfits = useCallback(async () => {
    if (!id) return

    try {
      const allOutfits = await getPlannedOutfits()
      // Filter to show only outfits for this look
      const filtered = allOutfits.filter((outfit) => outfit.idLook === parseInt(id))
      setPlannedOutfits(filtered)
    } catch (error) {
      console.error('Error loading planned outfits:', error)
    }
  }, [id, getPlannedOutfits])

  useEffect(() => {
    loadLook()
    loadPlannedOutfits()
  }, [loadLook, loadPlannedOutfits])

  const handlePlan = useCallback(() => {
    setShowPlanSheet(true)
  }, [])

  const handleConfirmPlan = useCallback(
    async (date: Date, notes?: string) => {
      if (!look) return

      const plannedOutfit = await createPlannedOutfit(look.idLook, date, notes)

      if (plannedOutfit) {
        Alert.alert('Succès', 'Tenue planifiée avec succès !')
        loadPlannedOutfits()
      } else {
        Alert.alert('Erreur', 'Impossible de planifier la tenue')
      }
    },
    [look, createPlannedOutfit, loadPlannedOutfits]
  )

  const handleDeletePlannedOutfit = useCallback(
    (plannedOutfitId: number) => {
      Alert.alert('Supprimer', 'Voulez-vous supprimer cette planification ?', [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await deletePlannedOutfit(plannedOutfitId)
            if (success) {
              Alert.alert('Succès', 'Planification supprimée')
              loadPlannedOutfits()
            } else {
              Alert.alert('Erreur', 'Impossible de supprimer')
            }
          },
        },
      ])
    },
    [deletePlannedOutfit, loadPlannedOutfits]
  )

  if (isLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    )
  }

  if (!look) {
    return null
  }

  return (
    <>
      <View className="flex-1" style={{ backgroundColor }}>
        <Header
          title={look.event || 'Tenue sans événement'}
          actionComponent={<LookMenuSheetButton lookId={look.idLook} onPlanPress={handlePlan} />}
        />

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {/* Look Preview */}
          <View className="mb-lg">
            <LookCard items={look.items} />
          </View>

          {/* Look Info */}
          <View className="mb-lg">
            <ThemedText className="text-[18px] font-bold mb-md">Informations</ThemedText>
            <View className="border rounded-md p-base" style={{ backgroundColor, borderColor }}>
              <View className="flex-row items-center mb-md">
                <Ionicons name="shirt-outline" size={20} color={textColor} />
                <ThemedText className="flex-1 ml-md text-body-sm">Vêtements</ThemedText>
                <ThemedText className="text-body-sm font-semibold">{look.items.length}</ThemedText>
              </View>
              {look.event && (
                <View className="flex-row items-center mb-md">
                  <Ionicons name="calendar-outline" size={20} color={textColor} />
                  <ThemedText className="flex-1 ml-md text-body-sm">Événement</ThemedText>
                  <ThemedText className="text-body-sm font-semibold">{look.event}</ThemedText>
                </View>
              )}
              <View className="flex-row items-center mb-md">
                <Ionicons name="time-outline" size={20} color={textColor} />
                <ThemedText className="flex-1 ml-md text-body-sm">Créée le</ThemedText>
                <ThemedText className="text-body-sm font-semibold">
                  {new Date(look.createdAt).toLocaleDateString('fr-FR')}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Planned Outfits */}
          {plannedOutfits.length > 0 && (
            <View className="mb-lg">
              <ThemedText className="text-[18px] font-bold mb-md">
                Planifications ({plannedOutfits.length})
              </ThemedText>
              {plannedOutfits.map((planned) => (
                <View
                  key={planned.idPlannedOutfit}
                  className="flex-row items-center p-md border rounded-md mb-md"
                  style={{ backgroundColor, borderColor }}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-sm mb-xs">
                      <Ionicons name="calendar" size={18} color={tintColor} />
                      <ThemedText className="text-body-sm font-semibold">
                        {new Date(planned.plannedDate).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </ThemedText>
                    </View>
                    {planned.notes && (
                      <ThemedText className="text-body-sm opacity-70 mt-xs" numberOfLines={2}>
                        {planned.notes}
                      </ThemedText>
                    )}
                  </View>
                  <TouchableOpacity
                    className="p-sm"
                    onPress={() => handleDeletePlannedOutfit(planned.idPlannedOutfit)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Items List */}
          <View className="mb-lg">
            <ThemedText className="text-[18px] font-bold mb-md">
              Vêtements ({look.items.length})
            </ThemedText>
            {look.items.map((item) => (
              <TouchableOpacity
                key={item.idItem}
                className="flex-row items-center p-md border rounded-md mb-md"
                style={{ backgroundColor, borderColor }}
                onPress={() => router.push(`/item/${item.idItem}`)}
              >
                <Image
                  source={{ uri: `${API_URL}${item.imageUrl}` }}
                  className="w-[60px] h-[60px] rounded-[8px]"
                />
                <View className="flex-1 ml-md">
                  <ThemedText className="text-body font-semibold mb-[2px]">{item.name}</ThemedText>
                  <ThemedText className="text-body-sm opacity-70 mb-[2px]" numberOfLines={1}>
                    {item.type}
                  </ThemedText>
                  {item.brand && (
                    <ThemedText className="text-caption opacity-50" numberOfLines={1}>
                      {item.brand}
                    </ThemedText>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={borderColor} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Plan Sheet */}
      <PlanLookSheet
        isOpen={showPlanSheet}
        onClose={() => setShowPlanSheet(false)}
        onConfirm={handleConfirmPlan}
      />
    </>
  )
}
