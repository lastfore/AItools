import { useMutation } from '@tanstack/react-query'
import { webSearchApi } from '@/lib/api/web-search'
import type { WebSearchRequest, WebSearchResponse } from '@/lib/types/api'

export function useWebSearch() {
  return useMutation<WebSearchResponse, unknown, WebSearchRequest>({
    mutationFn: (body) => webSearchApi.search(body),
  })
}
