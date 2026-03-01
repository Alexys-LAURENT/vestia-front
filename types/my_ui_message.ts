import { displayItemsSchema } from '@/tools/displayItemsTool'
import { generateOutfitSchema } from '@/tools/generateOutfitTool'
import { getItemByIdSchema } from '@/tools/getItemByIdTool'
import { getLookByIdSchema } from '@/tools/getLookByIdTool'
import { getLooksSchema } from '@/tools/getLooksTool'
import { getPlannedOutfitsSchema } from '@/tools/getPlannedOutfitsTool'
import { planOutfitSchema } from '@/tools/planOutfitTool'
import { saveLookSchema } from '@/tools/saveLookTool'
import { searchItemsSchema } from '@/tools/searchItemsTool'
import { semanticSearchSchema } from '@/tools/semanticSearchTool'
import { wardrobeStatsSchema } from '@/tools/wardrobeStatsTool'
import { type InferUITools, type ToolSet, type UIMessage, tool } from 'ai'
import { z } from 'zod'
import {
  DisplayItemsResponse,
  GenerateOutfitResponse,
  GetItemByIdResponse,
  GetLookByIdResponse,
  GetLooksResponse,
  GetPlannedOutfitsResponse,
  PlanOutfitResponse,
  SaveLookResponse,
  SearchItemsResponse,
  SemanticSearchResponse,
  WardrobeStatsResponse,
} from './tools'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tools = {
  wardrobeStats: tool({
    inputSchema: wardrobeStatsSchema,
    outputSchema: z.custom<WardrobeStatsResponse>(),
  }),
  searchItems: tool({
    inputSchema: searchItemsSchema,
    outputSchema: z.custom<SearchItemsResponse>(),
  }),
  semanticSearch: tool({
    inputSchema: semanticSearchSchema,
    outputSchema: z.custom<SemanticSearchResponse>(),
  }),
  generateOutfit: tool({
    inputSchema: generateOutfitSchema,
    outputSchema: z.custom<GenerateOutfitResponse>(),
  }),
  saveLook: tool({
    inputSchema: saveLookSchema,
    outputSchema: z.custom<SaveLookResponse>(),
  }),
  displayItems: tool({
    inputSchema: displayItemsSchema,
    outputSchema: z.custom<DisplayItemsResponse>(),
  }),
  planOutfit: tool({
    inputSchema: planOutfitSchema,
    outputSchema: z.custom<PlanOutfitResponse>(),
  }),
  getPlannedOutfits: tool({
    inputSchema: getPlannedOutfitsSchema,
    outputSchema: z.custom<GetPlannedOutfitsResponse>(),
  }),
  getLooks: tool({
    inputSchema: getLooksSchema,
    outputSchema: z.custom<GetLooksResponse>(),
  }),
  getItemById: tool({
    inputSchema: getItemByIdSchema,
    outputSchema: z.custom<GetItemByIdResponse>(),
  }),
  getLookById: tool({
    inputSchema: getLookByIdSchema,
    outputSchema: z.custom<GetLookByIdResponse>(),
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
