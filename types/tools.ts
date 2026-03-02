import { ITEM_FORMALITIES, ITEM_SEASONS, ITEM_TYPES } from '@/constants/file_types'

import type { AxiosInstance } from 'axios'
import { Item, Look, PlannedOutfit } from './entities'

/**
 * Type de la fonction backendFetch passée aux tools.
 */
export type BackendFetchFn = (
  client: AxiosInstance,
  endpoint: string,
  options?: { method?: string; body?: any }
) => Promise<any>

/*******************/
/* Types liés aux outils */
/*******************/

export type WardrobeStatsResponse = {
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
}

export type SearchItemsResponse = {
  items: Item[]
  total: number
}

export type SemanticSearchResponse = {
  items: Item & { score: number }[]
}

export type GenerateOutfitResponse = {
  items: Item &
    {
      reason: string // pourquoi ce vêtement a été choisi
      isForced: boolean // true si imposé via forcedItemIds
    }[]
  generalReasoning: string
  generationMethod: 'ai' | 'fallback'
}

export type SaveLookResponse = { look: Look }

export type DisplayItemsResponse = {
  items: {
    idItem: number
    name: string
    imageUrl: string
    type?: string
    brand?: string | null
  }[]
}

export type PlanOutfitResponse = { plannedOutfit: PlannedOutfit }

export type GetPlannedOutfitsResponse = { plannedOutfits: PlannedOutfit[] }

export type GetLooksResponse = { looks: Look[]; total: number }

export type GetItemByIdResponse = { item: Item }

export type GetLookByIdResponse = { look: Look }

export type GeocodeCityResponse = {
  results: {
    name: string
    latitude: number
    longitude: number
    country: string
    region: string | null
  }[]
  error?: string
}

export type GetWeatherResponse = {
  current: {
    temperature: number
    apparentTemperature: number
    description: string
    windSpeed: number
    humidity: number
  } | null
  daily: {
    date: string
    temperatureMax: number
    temperatureMin: number
    apparentTemperatureMax: number
    apparentTemperatureMin: number
    precipitationSum: number
    precipitationProbability: number
    windSpeedMax: number
    description: string
  }[]
  error?: string
}
