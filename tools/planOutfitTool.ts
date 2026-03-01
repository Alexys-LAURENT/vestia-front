import { PlanOutfitResponse, ToolContext } from '@/types/tools'
import { tool } from 'ai'
import { z } from 'zod'

export const planOutfitSchema = z.object({
  lookId: z.number().describe('ID de la tenue (look) à planifier'),
  plannedDate: z
    .string()
    .describe("Date de planification au format ISO 8601 (ex: '2026-03-15T00:00:00.000Z')"),
  notes: z
    .string()
    .nullable()
    .optional()
    .describe("Notes optionnelles associées à la planification (ex: 'Pour le dîner chez Marie')"),
})

export const createPlanOutfitTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      "Planifie une tenue existante pour une date donnée. Permet d'associer une tenue (look) à une date future avec des notes optionnelles. Utilise cet outil quand l'utilisateur veut porter une tenue à une date spécifique.",
    inputSchema: planOutfitSchema,
    execute: async (params): Promise<PlanOutfitResponse> => {
      return backendFetch(client, '/planned-outfits', {
        method: 'POST',
        body: {
          lookId: params.lookId,
          plannedDate: params.plannedDate,
          notes: params.notes,
        },
      })
    },
  })
