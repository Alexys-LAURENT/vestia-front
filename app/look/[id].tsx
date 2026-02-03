import { LookCard } from '@/components/LookCard'
import { PlanLookSheet } from '@/components/sheets/PlanLookSheet'
import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { usePlannedOutfits } from '@/hooks/usePlannedOutfits'
import type { Look, PlannedOutfit } from '@/types/entities'
import type { SuccessResponse } from '@/types/requests'
import { api, FetchApiError } from '@/utils/fetchApi'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SCREEN_WIDTH = Dimensions.get('window').width

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
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPlanSheet, setShowPlanSheet] = useState(false)

  const { createPlannedOutfit, getPlannedOutfits, deletePlannedOutfit } = usePlannedOutfits()

  useEffect(() => {
    loadLook()
    loadPlannedOutfits()
  }, [id])

  const loadLook = async () => {
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
  }

  const loadPlannedOutfits = async () => {
    if (!id) return

    try {
      const allOutfits = await getPlannedOutfits()
      // Filter to show only outfits for this look
      const filtered = allOutfits.filter((outfit) => outfit.idLook === parseInt(id))
      setPlannedOutfits(filtered)
    } catch (error) {
      console.error('Error loading planned outfits:', error)
    }
  }

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Supprimer la tenue',
      'Êtes-vous sûr de vouloir supprimer cette tenue ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true)
            try {
              await api.delete(`/looks/${id}`)
              Alert.alert('Succès', 'Tenue supprimée')
              router.back()
            } catch (error) {
              if (error instanceof FetchApiError) {
                Alert.alert('Erreur', error.message)
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer la tenue')
              }
            } finally {
              setIsDeleting(false)
            }
          },
        },
      ]
    )
  }, [id, router])

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
    [look, createPlannedOutfit]
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
    [deletePlannedOutfit]
  )

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </SafeAreaView>
    )
  }

  if (!look) {
    return null
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText style={styles.headerTitle} numberOfLines={1}>
              {look.event || 'Tenue sans événement'}
            </ThemedText>
            {look.isAiGenerated && (
              <View style={[styles.aiBadgeSmall, { backgroundColor: tintColor }]}>
                <Ionicons name="sparkles" size={12} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: tintColor }]}
              onPress={handlePlan}
            >
              <Ionicons name="calendar-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: '#ff4444' }]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

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
      </SafeAreaView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  aiBadgeSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
