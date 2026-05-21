import { apiClient } from '@/lib/api/client'
import type { WebSearchRequest, WebSearchResponse } from '@/lib/types/api'

export const webSearchApi = {
  search: async (body: WebSearchRequest): Promise<WebSearchResponse> => {
    const response = await apiClient.post<WebSearchResponse>('/web-search', body)
    return response.data
  },
}
