import { SemanticSearchResponse, ToolContext } from '@/types/tools'
import { tool } from 'ai'
import { z } from 'zod'

export const semanticSearchSchema = z.object({
  query: z
    .string()
    .describe("Description naturelle de ce que l'utilisateur cherche"),
  limit: z.number().optional().default(10).describe('Nombre de résultats'),
})


export const createSemanticSearchTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      'Recherche des vêtements par similarité sémantique avec une description en langage naturel. Idéal pour les requêtes floues : "quelque chose de chaud", "un look streetwear", "tenue pour la plage".',
    inputSchema: semanticSearchSchema,
    execute: async (params): Promise<SemanticSearchResponse> => {
      return backendFetch(client, '/chatbot/semantic-search', {
        method: 'POST',
        body: params,
      })
    },
  })
