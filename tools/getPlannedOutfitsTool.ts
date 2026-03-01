import { GetPlannedOutfitsResponse, ToolContext } from '@/types/tools'
import { tool } from 'ai'
import { z } from 'zod'

export const getPlannedOutfitsSchema = z.object({
  startDate: z
    .string()
    .optional()
    .describe(
      "Date de début au format ISO 8601 pour filtrer les tenues planifiées (ex: '2026-03-01T00:00:00.000Z')"
    ),
  endDate: z
    .string()
    .optional()
    .describe(
      "Date de fin au format ISO 8601 pour filtrer les tenues planifiées (ex: '2026-03-31T23:59:59.999Z')"
    ),
})

export const createGetPlannedOutfitsTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      "Récupère les tenues planifiées de l'utilisateur, avec possibilité de filtrer par plage de dates. Utilise cet outil quand l'utilisateur veut voir ses tenues prévues, son planning vestimentaire ou ce qu'il a prévu de porter.",
    inputSchema: getPlannedOutfitsSchema,
    execute: async (params): Promise<GetPlannedOutfitsResponse> => {
      const qs = new URLSearchParams()
      if (params.startDate) qs.append('startDate', params.startDate)
      if (params.endDate) qs.append('endDate', params.endDate)

      const queryString = qs.toString()
      const endpoint = queryString ? `/planned-outfits?${queryString}` : '/planned-outfits'

      return backendFetch(client, endpoint)
    },
  })
