import { ITEM_FORMALITIES, ITEM_SEASONS, ITEM_TYPES } from '@/constants/file_types'
import { SuccessResponse } from './requests'

import type { AxiosInstance } from 'axios'
import { Item, Look } from './entities'

/**
 * Type de la fonction backendFetch passée aux tools.
 */
export type BackendFetchFn = (
  client: AxiosInstance,
  endpoint: string,
  options?: { method?: string; body?: any }
) => Promise<any>

/**
 * Contexte partagé entre tous les tools du chatbot.
 */
export interface ToolContext {
  client: AxiosInstance
  backendFetch: BackendFetchFn
}

export type WardrobeStatsResponse = SuccessResponse<{
  totalItems: number
  byType: Record<(typeof ITEM_TYPES)[number], number>
  bySeason: Record<(typeof ITEM_SEASONS)[number], number>
  byFormality: Record<(typeof ITEM_FORMALITIES)[number], number>
  colors: {
    color: string
    count: number
    items: { idItem: number; name: string }[]
  }[]
  availableTypes: (typeof ITEM_TYPES)[number][]
  availableSeasons: (typeof ITEM_SEASONS)[number][]
  availableFormalities: (typeof ITEM_FORMALITIES)[number][]
}>

export type SearchItemsResponse = SuccessResponse<{
  items: Item[]
  total: number
}>

export type SemanticSearchResponse = SuccessResponse<{
  items: Item & { score: number }[]
}>

export type GenerateOutfitResponse = SuccessResponse<{
  items: Item &
    {
      reason: string // pourquoi ce vêtement a été choisi
      isForced: boolean // true si imposé via forcedItemIds
    }[]
  generalReasoning: string
  generationMethod: 'ai' | 'fallback'
}>

export type SaveLookResponse = SuccessResponse<Look>

export type DisplayItemsResponse = {
  items: {
    idItem: number
    name: string
    imageUrl: string
    type?: string
    brand?: string | null
  }[]
}
