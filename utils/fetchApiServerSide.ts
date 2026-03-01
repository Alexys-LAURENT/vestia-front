import axios, { type AxiosInstance } from 'axios';

/**
 * Crée un client axios configuré pour les appels backend depuis les API routes Expo (côté serveur).
 * Utilise axios (node:http sous le capot) pour contourner le timeout de 5s de fetch-nodeshim.
 */
export function createBackendClient(authHeader: string): AxiosInstance {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not defined in environment variables')
  }

  return axios.create({
    baseURL: apiUrl,
    timeout: 120_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authHeader,
    },
  })
}

/**
 * Helper pour appeler le backend AdonisJS depuis une API route Expo.
 * @param client - Instance axios créée par createBackendClient
 * @param endpoint - Chemin de l'endpoint backend (ex: '/chatbot/wardrobe-stats')
 * @param options - Options optionnelles (method, body)
 * @returns Les données contenues dans response.data.data
 */
export async function backendFetch(
  client: AxiosInstance,
  endpoint: string,
  options: { method?: string; body?: any } = {}
) {
  const response = await client.request({
    url: endpoint,
    method: (options.method?.toLowerCase() || 'get') as 'get' | 'post' | 'put' | 'delete' | 'patch',
    data: options.body ?? undefined,
  })
  return response.data
}
