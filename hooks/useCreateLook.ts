import type { Look } from '@/types/entities'
import type { SuccessResponse } from '@/types/requests'
import { api, FetchApiError } from '@/utils/fetchApiClientSide'
import { useCallback, useState } from 'react'

export function useCreateLook() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createLook = useCallback(async (
    itemIds: number[],
    event?: string | null,
    isAiGenerated: boolean = true
  ): Promise<Look | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<SuccessResponse<Look>>(
        '/looks',
        { itemIds, event, isAiGenerated }
      ) as SuccessResponse<Look>

      setIsLoading(false)
      return response.data
    } catch (err) {
      let errorMessage = 'Une erreur est survenue lors de la sauvegarde de la tenue'

      if (err instanceof FetchApiError) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }, [])

  return { createLook, isLoading, error }
}
