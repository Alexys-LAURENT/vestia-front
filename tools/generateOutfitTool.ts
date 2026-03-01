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
  weather: z
    .string()
    .optional()
    .describe(
      "Résumé des conditions météo à prendre en compte pour la tenue (ex: '15°C, pluie légère, vent modéré'). Si disponible, sera ajouté au contexte pour adapter la tenue."
    ),
  forcedItemIds: z
    .array(z.number())
    .optional()
    .describe('IDs des vêtements à inclure obligatoirement dans la tenue'),
  excludedItemIds: z
    .array(z.number())
    .optional()
    .describe('IDs des vêtements à exclure de la tenue'),
})

export const createGenerateOutfitTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      "Génère une proposition de tenue complète et cohérente adaptée à un contexte ou une occasion. Peut imposer certains vêtements ou en exclure d'autres. IMPORTANT : Avant de générer une tenue, DEMANDE à l'utilisateur s'il souhaite prendre en compte la météo pour un endroit en particulier (QUESTION OUI OU NON). Si oui, utilise d'abord geocodeCity puis getWeather pour récupérer la météo, et passe le résumé dans le paramètre weather.",
    inputSchema: generateOutfitSchema,
    execute: async (params): Promise<GenerateOutfitResponse> => {
      // Concatène la météo au contexte avant l'appel backend
      let context = params.context ?? ''
      if (params.weather) {
        context = context ? `${context} | Météo : ${params.weather}` : `Météo : ${params.weather}`
      }

      return backendFetch(client, '/chatbot/generate-outfit', {
        method: 'POST',
        body: {
          context: context || undefined,
          forcedItemIds: params.forcedItemIds,
          excludedItemIds: params.excludedItemIds,
        },
      })
    },
  })
