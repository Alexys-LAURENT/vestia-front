import { type InferUITools, type ToolSet, type UIMessage, tool } from 'ai'
import { z } from 'zod'
import {
  DisplayItemsResponse,
  GenerateOutfitResponse,
  GeocodeCityResponse,
  GetItemByIdResponse,
  GetLookByIdResponse,
  GetLooksResponse,
  GetPlannedOutfitsResponse,
  GetWeatherResponse,
  PlanOutfitResponse,
  SaveLookResponse,
  SearchItemsResponse,
  SemanticSearchResponse,
  WardrobeStatsResponse,
} from './tools'

// WARNING : Reals tools are defined in API, this is only for type inference on the UI side, please keep the schema in sync with the API ones
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tools = {
  wardrobeStats: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<WardrobeStatsResponse>(),
  }),
  searchItems: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<SearchItemsResponse>(),
  }),
  semanticSearch: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<SemanticSearchResponse>(),
  }),
  generateOutfit: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<GenerateOutfitResponse>(),
  }),
  saveLook: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<SaveLookResponse>(),
  }),
  displayItems: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<DisplayItemsResponse>(),
  }),
  planOutfit: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<PlanOutfitResponse>(),
  }),
  getPlannedOutfits: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<GetPlannedOutfitsResponse>(),
  }),
  getLooks: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<GetLooksResponse>(),
  }),
  getItemById: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<GetItemByIdResponse>(),
  }),
  getLookById: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<GetLookByIdResponse>(),
  }),
  geocodeCity: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<GeocodeCityResponse>(),
  }),
  getWeather: tool({
    inputSchema: z.object({}),
    outputSchema: z.custom<GetWeatherResponse>(),
  }),
} satisfies ToolSet

type MyTools = InferUITools<typeof tools>

export type AttachedItem = {
  idItem: number
  name: string
  imageUrl: string
  type?: string
  brand?: string | null
}

export type MessageData = {
  attachedItems?: AttachedItem[]
}

export type MyUIMessage = UIMessage<MessageData, Record<string, unknown>, MyTools>
