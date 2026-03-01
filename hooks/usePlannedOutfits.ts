import type { PlannedOutfit } from '@/types/entities'
import type { SuccessResponse } from '@/types/requests'
import { api, FetchApiError } from '@/utils/fetchApiClientSide'
import { useCallback, useState } from 'react'

export function usePlannedOutfits() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPlannedOutfit = useCallback(async (
    lookId: number,
    plannedDate: Date,
    notes?: string | null
  ): Promise<PlannedOutfit | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<SuccessResponse<PlannedOutfit>>(
        '/planned-outfits',
        {
          lookId,
          plannedDate: plannedDate.toISOString(),
          notes,
        }
      ) as SuccessResponse<PlannedOutfit>

      setIsLoading(false)
      return response.data
    } catch (err) {
      let errorMessage = 'Une erreur est survenue lors de la planification de la tenue'

      if (err instanceof FetchApiError) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }, [])

  const getPlannedOutfits = useCallback(async (
    startDate?: Date,
    endDate?: Date
  ): Promise<PlannedOutfit[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (startDate) {
        params.append('startDate', startDate.toISOString())
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString())
      }

      const queryString = params.toString()
      const endpoint = queryString ? `/planned-outfits?${queryString}` : '/planned-outfits'

      const response = await api.get<SuccessResponse<PlannedOutfit[]>>(
        endpoint
      ) as SuccessResponse<PlannedOutfit[]>

      setIsLoading(false)
      return response.data
    } catch (err) {
      let errorMessage = 'Une erreur est survenue lors de la récupération des tenues planifiées'

      if (err instanceof FetchApiError) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsLoading(false)
      return []
    }
  }, [])

  const deletePlannedOutfit = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await api.delete(`/planned-outfits/${id}`)
      setIsLoading(false)
      return true
    } catch (err) {
      let errorMessage = 'Une erreur est survenue lors de la suppression de la tenue planifiée'

      if (err instanceof FetchApiError) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsLoading(false)
      return false
    }
  }, [])

  return {
    createPlannedOutfit,
    getPlannedOutfits,
    deletePlannedOutfit,
    isLoading,
    error,
  }
}
