import { displayItemsSchema } from '@/tools/displayItemsTool'
import { generateOutfitSchema } from '@/tools/generateOutfitTool'
import { saveLookSchema } from '@/tools/saveLookTool'
import { searchItemsSchema } from '@/tools/searchItemsTool'
import { semanticSearchSchema } from '@/tools/semanticSearchTool'
import { wardrobeStatsSchema } from '@/tools/wardrobeStatsTool'
import { type InferUITools, type ToolSet, type UIMessage, tool } from 'ai'
import { z } from 'zod'
import {
  DisplayItemsResponse,
  GenerateOutfitResponse,
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
} satisfies ToolSet

type MyTools = InferUITools<typeof tools>

export type MyUIMessage = UIMessage<unknown, Record<string, unknown>, MyTools>
