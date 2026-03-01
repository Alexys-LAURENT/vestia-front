import { GetLookByIdResponse, ToolContext } from '@/types/tools'
import { tool } from 'ai'
import { z } from 'zod'

export const getLookByIdSchema = z.object({
  id: z.number().describe("L'identifiant unique de la tenue (look) à récupérer"),
})

export const createGetLookByIdTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      "Récupère les détails complets d'une tenue (look) par son ID, y compris tous les vêtements qui la composent. Utilise cet outil quand l'utilisateur veut voir les détails d'une tenue spécifique.",
    inputSchema: getLookByIdSchema,
    execute: async (params): Promise<GetLookByIdResponse> => {
      return backendFetch(client, `/looks/${params.id}`)
    },
  })
