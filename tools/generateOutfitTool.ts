import { GenerateOutfitResponse, ToolContext } from '@/types/tools'
import { tool } from 'ai'
import { z } from 'zod'

export const generateOutfitSchema = z.object({
  context: z
    .string()
    .optional()
    .describe(
      'Contexte ou occasion (ex: "entretien d\'embauche", "soirée entre amis", "journée détente")'
    ),
  forcedItemIds: z
    .array(z.number())
    .optional()
    .describe("IDs des vêtements à inclure obligatoirement dans la tenue"),
  excludedItemIds: z
    .array(z.number())
    .optional()
    .describe("IDs des vêtements à exclure de la tenue"),
})


export const createGenerateOutfitTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      "Génère une proposition de tenue complète et cohérente adaptée à un contexte ou une occasion. Peut imposer certains vêtements ou en exclure d'autres.",
    inputSchema: generateOutfitSchema,
    execute: async (params): Promise<GenerateOutfitResponse> => {
      return backendFetch(client, '/chatbot/generate-outfit', {
        method: 'POST',
        body: params,
      })
    },
  })
