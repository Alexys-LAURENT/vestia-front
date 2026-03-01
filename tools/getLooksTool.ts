import { GetLooksResponse, ToolContext } from '@/types/tools'
import { tool } from 'ai'
import { z } from 'zod'

export const getLooksSchema = z.object({
  page: z.number().optional().default(1).describe('Numéro de la page à récupérer (pagination)'),
  limit: z.number().optional().default(10).describe('Nombre de tenues par page'),
})

export const createGetLooksTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      "Récupère la liste des tenues (looks) sauvegardées dans la garde-robe de l'utilisateur, avec pagination. Utilise cet outil quand l'utilisateur veut voir ses tenues, parcourir sa garde-robe de looks ou chercher une tenue existante.",
    inputSchema: getLooksSchema,
    execute: async (params): Promise<GetLooksResponse> => {
      const qs = new URLSearchParams()
      qs.append('page', String(params.page))
      qs.append('limit', String(params.limit))

      return backendFetch(client, `/looks?${qs.toString()}`)
    },
  })
