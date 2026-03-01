import { ITEM_FORMALITIES, ITEM_SEASONS, ITEM_TYPES } from '@/constants/file_types'
import { SearchItemsResponse, ToolContext } from '@/types/tools'
import { tool } from 'ai'
import { z } from 'zod'

export const searchItemsSchema = z.object({
  type: z
    .enum(ITEM_TYPES)
    .optional()
    .describe('Type de vêtement à filtrer'),
  season: z
    .enum(ITEM_SEASONS)
    .optional()
    .describe('Saison du vêtement'),
  formality: z
    .enum(ITEM_FORMALITIES)
    .optional()
    .describe('Niveau de formalité'),
  color: z
    .string()
    .optional()
    .describe(
      'Couleur à rechercher (recherche partielle, ex: "rouge" trouvera "rouge bordeaux")'
    ),
  limit: z.number().optional().default(20).describe('Nombre maximum de résultats'),
})

export const createSearchItemsTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      'Recherche des vêtements dans la garde-robe avec des filtres précis et combinables. Retourne la liste des vêtements correspondants.',
    inputSchema: searchItemsSchema,
    execute: async (params): Promise<SearchItemsResponse> => {
      const qs = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) qs.append(key, String(value))
      }
      return backendFetch(client, `/chatbot/search-items?${qs.toString()}`)
    },
  })
