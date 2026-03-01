import { ToolContext, WardrobeStatsResponse } from '@/types/tools'
import { tool } from 'ai'
import { z } from 'zod'

export const wardrobeStatsSchema = z.object({})

export const createWardrobeStatsTool = ({ client, backendFetch }: ToolContext) =>
  tool({
    description:
      "Récupère les statistiques complètes de la garde-robe de l'utilisateur : nombre total de vêtements, répartition par type, saison et formalité, et la liste des couleurs disponibles avec le nombre de pièces par couleur. À appeler en premier pour comprendre le contexte.",
    inputSchema: wardrobeStatsSchema,
    execute: async (): Promise<WardrobeStatsResponse> => {
      return backendFetch(client, '/chatbot/wardrobe-stats')
    },
  })
