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
import { api, FetchApiError } from '@/utils/fetchApi'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'


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
      Alert.alert(
        'Supprimer',
        'Voulez-vous supprimer cette planification ?',
        [
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
        ]
      )
    },
    [deletePlannedOutfit, loadPlannedOutfits]
  )

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    )
  }

  if (!look) {
    return null
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor }]}>
        <Header
          title={look.event || 'Tenue sans événement'}
          actionComponent={
            <LookMenuSheetButton
              lookId={look.idLook}
              onPlanPress={handlePlan}
            />
          }
        />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Look Preview */}
          <View style={styles.lookPreview}>
            <LookCard items={look.items} />
          </View>

          {/* Look Info */}
          <View style={styles.infoSection}>
            <ThemedText style={styles.sectionTitle}>Informations</ThemedText>
            <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
              <View style={styles.infoRow}>
                <Ionicons name="shirt-outline" size={20} color={textColor} />
                <ThemedText style={styles.infoLabel}>Vêtements</ThemedText>
                <ThemedText style={styles.infoValue}>{look.items.length}</ThemedText>
              </View>
              {look.event && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={20} color={textColor} />
                  <ThemedText style={styles.infoLabel}>Événement</ThemedText>
                  <ThemedText style={styles.infoValue}>{look.event}</ThemedText>
                </View>
              )}
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={textColor} />
                <ThemedText style={styles.infoLabel}>Créée le</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {new Date(look.createdAt).toLocaleDateString('fr-FR')}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Planned Outfits */}
          {plannedOutfits.length > 0 && (
            <View style={styles.plannedSection}>
              <ThemedText style={styles.sectionTitle}>
                Planifications ({plannedOutfits.length})
              </ThemedText>
              {plannedOutfits.map((planned) => (
                <View
                  key={planned.idPlannedOutfit}
                  style={[styles.plannedCard, { backgroundColor, borderColor }]}
                >
                  <View style={styles.plannedInfo}>
                    <View style={styles.plannedDateRow}>
                      <Ionicons name="calendar" size={18} color={tintColor} />
                      <ThemedText style={styles.plannedDate}>
                        {new Date(planned.plannedDate).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </ThemedText>
                    </View>
                    {planned.notes && (
                      <ThemedText style={styles.plannedNotes} numberOfLines={2}>
                        {planned.notes}
                      </ThemedText>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.plannedDeleteButton}
                    onPress={() => handleDeletePlannedOutfit(planned.idPlannedOutfit)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Items List */}
          <View style={styles.itemsSection}>
            <ThemedText style={styles.sectionTitle}>Vêtements ({look.items.length})</ThemedText>
            {look.items.map((item) => (
              <TouchableOpacity
                key={item.idItem}
                style={[styles.itemCard, { backgroundColor, borderColor }]}
                onPress={() => router.push(`/item/${item.idItem}`)}
              >
                <Image
                  source={{ uri: `${API_URL}${item.imageUrl}` }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.itemType} numberOfLines={1}>
                    {item.type}
                  </ThemedText>
                  {item.brand && (
                    <ThemedText style={styles.itemBrand} numberOfLines={1}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  lookPreview: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  plannedSection: {
    marginBottom: 24,
  },
  plannedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  plannedInfo: {
    flex: 1,
  },
  plannedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  plannedDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  plannedNotes: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  plannedDeleteButton: {
    padding: 8,
  },
  itemsSection: {
    marginBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemType: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
  itemBrand: {
    fontSize: 12,
    opacity: 0.5,
  },
})
