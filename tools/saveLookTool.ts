import { SaveLookResponse, ToolContext } from '@/types/tools'
import { tool } from 'ai'
import { z } from 'zod'

export const saveLookSchema = z.object({
  itemIds: z
    .array(z.number())
    .min(2)
    .max(6)
    .describe('IDs des vêtements qui composent la tenue (2 à 6 pièces)'),
  event: z
    .string()
    .optional()
    .describe("Nom de l'occasion ou de l'événement associé à la tenue"),
})

export const createSaveLookTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      "Sauvegarde définitivement une tenue dans la garde-robe de l'utilisateur. N'appelle cet outil QUE si l'utilisateur confirme explicitement vouloir sauvegarder.",
    inputSchema: saveLookSchema,
    execute: async (params): Promise<SaveLookResponse> => {
      return backendFetch(client, '/chatbot/save-look', {
        method: 'POST',
        body: params,
      })
    },
  })
