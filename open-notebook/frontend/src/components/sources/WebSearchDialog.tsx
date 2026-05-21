'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Globe, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WizardContainer, WizardStep } from '@/components/ui/wizard-container'
import { NotebooksStep } from '@/components/sources/steps/NotebooksStep'
import { ProcessingStep } from '@/components/sources/steps/ProcessingStep'
import { useNotebooks } from '@/lib/hooks/use-notebooks'
import { useTransformations } from '@/lib/hooks/use-transformations'
import { useCreateSource } from '@/lib/hooks/use-sources'
import { useSettings } from '@/lib/hooks/use-settings'
import { useWebSearch } from '@/lib/hooks/use-web-search'
import { CreateSourceRequest } from '@/lib/types/api'
import type { WebSearchResponse, WebSearchResultItem } from '@/lib/types/api'
import { useTranslation } from '@/lib/hooks/use-translation'
import { getApiErrorMessage } from '@/lib/utils/error-handler'

const MAX_BATCH = 50

const processingSchema = z.object({
  type: z.literal('link'),
  embed: z.boolean(),
  async_processing: z.boolean(),
})

type ProcessingForm = z.infer<typeof processingSchema>

interface WebSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultNotebookId?: string
  onSuccess?: () => void
}

export function WebSearchDialog({
  open,
  onOpenChange,
  defaultNotebookId,
  onSuccess,
}: WebSearchDialogProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('')
  const [categories, setCategories] = useState('general')
  const [timeRange, setTimeRange] = useState<string>('')
  const [safesearch, setSafesearch] = useState('1')
  const [useLlmRanking, setUseLlmRanking] = useState(false)
  const [searchResponse, setSearchResponse] = useState<WebSearchResponse | null>(null)
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [selectedNotebooks, setSelectedNotebooks] = useState<string[]>(
    defaultNotebookId ? [defaultNotebookId] : []
  )
  const [selectedTransformations, setSelectedTransformations] = useState<string[]>([])
  const [submittingBatch, setSubmittingBatch] = useState(false)

  const webSearch = useWebSearch()
  const createSource = useCreateSource()
  const { data: notebooks = [], isLoading: notebooksLoading } = useNotebooks()
  const { data: transformations = [], isLoading: transformationsLoading } = useTransformations()
  const { data: settings } = useSettings()

  const wizardSteps: readonly WizardStep[] = useMemo(
    () => [
      { number: 1, title: t('sources.webSearchStepSearch'), description: t('sources.webSearchStepSearchDesc') },
      { number: 2, title: t('sources.webSearchStepResults'), description: t('sources.webSearchStepResultsDesc') },
      { number: 3, title: t('navigation.notebooks'), description: t('notebooks.searchPlaceholder') },
      { number: 4, title: t('navigation.process'), description: t('sources.processDescription') },
    ],
    [t]
  )

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<ProcessingForm>({
    resolver: zodResolver(processingSchema),
    defaultValues: {
      type: 'link',
      embed:
        settings?.default_embedding_option === 'always' ||
        settings?.default_embedding_option === 'ask',
      async_processing: true,
    },
  })

  useEffect(() => {
    if (!settings) return
    const embedValue =
      settings.default_embedding_option === 'always' ||
      settings.default_embedding_option === 'ask'
    reset({
      type: 'link',
      embed: embedValue,
      async_processing: true,
    })
  }, [settings, reset])

  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false
      return
    }
    if (prevOpenRef.current) return
    prevOpenRef.current = true

    setStep(1)
    setQuery('')
    setLanguage('')
    setCategories('general')
    setTimeRange('')
    setSafesearch('1')
    setUseLlmRanking(false)
    setSearchResponse(null)
    setSelectedUrls(new Set())
    setSelectedNotebooks(defaultNotebookId ? [defaultNotebookId] : [])
    const defaults =
      transformations.length > 0
        ? transformations.filter((x) => x.apply_default).map((x) => x.id)
        : []
    setSelectedTransformations(defaults)
  }, [open, defaultNotebookId, transformations])

  const results: WebSearchResultItem[] = searchResponse?.results ?? []

  const toggleUrl = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else {
        if (next.size >= MAX_BATCH && !next.has(url)) {
          toast.error(t('sources.webSearchMaxSelected').replace('{max}', String(MAX_BATCH)))
          return prev
        }
        next.add(url)
      }
      return next
    })
  }

  const selectAll = () => {
    const urls = results.map((r) => r.url).filter(Boolean).slice(0, MAX_BATCH)
    setSelectedUrls(new Set(urls))
  }

  const deselectAll = () => setSelectedUrls(new Set())

  const handleSearch = async () => {
    const q = query.trim()
    if (!q) {
      toast.error(t('sources.webSearchQueryRequired'))
      return
    }
    try {
      const res = await webSearch.mutateAsync({
        query: q,
        language: language.trim() || undefined,
        categories: categories.trim() || 'general',
        time_range:
          timeRange === 'day' || timeRange === 'month' || timeRange === 'year'
            ? timeRange
            : undefined,
        max_results: 30,
        safesearch: Number.parseInt(safesearch, 10) || 1,
        use_llm_ranking: useLlmRanking,
      })
      setSearchResponse(res)
      setSelectedUrls(new Set())
      setStep(2)
      if (res.total_returned === 0) {
        toast.message(t('sources.webSearchNoResults'))
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, (key) => t(key), t('sources.webSearchFailed')))
    }
  }

  const handleNotebookToggle = (id: string) => {
    setSelectedNotebooks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleTransformationToggle = (id: string) => {
    setSelectedTransformations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const onSubmitBatch = async (data: ProcessingForm) => {
    if (selectedUrls.size === 0) {
      toast.error(t('sources.webSearchPickOne'))
      return
    }
    setSubmittingBatch(true)
    let ok = 0
    let fail = 0
    const urls = [...selectedUrls]
    for (const url of urls) {
      const req: CreateSourceRequest = {
        type: 'link',
        url,
        notebooks: selectedNotebooks,
        transformations: selectedTransformations,
        embed: data.embed,
        async_processing: data.async_processing,
      }
      try {
        await createSource.mutateAsync(req)
        ok++
      } catch {
        fail++
      }
    }
    setSubmittingBatch(false)
    if (fail === 0) {
      toast.success(t('sources.batchSuccess').replace('{count}', String(ok)))
    } else if (ok === 0) {
      toast.error(t('sources.batchFailed').replace('{count}', String(fail)))
    } else {
      toast.warning(
        t('sources.batchPartial').replace('{success}', String(ok)).replace('{failed}', String(fail))
      )
    }
    onSuccess?.()
    onOpenChange(false)
  }

  const goNext = useCallback(() => {
    if (step === 2) {
      if (selectedUrls.size === 0) {
        toast.error(t('sources.webSearchPickOne'))
        return
      }
    }
    if (step < 4) setStep((s) => s + 1)
  }, [step, selectedUrls.size, t])

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const stepValid = (): boolean => {
    if (step === 1) return query.trim().length > 0
    if (step === 2) return selectedUrls.size > 0 && selectedUrls.size <= MAX_BATCH
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('sources.webSearch')}
          </DialogTitle>
          <DialogDescription>{t('sources.webSearchDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitBatch)} className="flex flex-col min-h-0 flex-1">
          <WizardContainer currentStep={step} steps={wizardSteps} className="border-0 flex-1 min-h-0">
            {step === 1 && (
              <div className="space-y-4 px-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="web-search-q">{t('sources.webSearchKeywords')}</Label>
                  <Input
                    id="web-search-q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('sources.webSearchKeywordsPlaceholder')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void handleSearch()
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('sources.webSearchLanguage')}</Label>
                    <Input
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="zh-CN, en, …"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('sources.webSearchCategories')}</Label>
                    <Input
                      value={categories}
                      onChange={(e) => setCategories(e.target.value)}
                      placeholder="general"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('sources.webSearchTimeRange')}</Label>
                    <Select value={timeRange || 'any'} onValueChange={(v) => setTimeRange(v === 'any' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('sources.webSearchTimeRangeAny')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t('sources.webSearchTimeRangeAny')}</SelectItem>
                        <SelectItem value="day">{t('sources.webSearchTimeRangeDay')}</SelectItem>
                        <SelectItem value="month">{t('sources.webSearchTimeRangeMonth')}</SelectItem>
                        <SelectItem value="year">{t('sources.webSearchTimeRangeYear')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('sources.webSearchSafeSearch')}</Label>
                    <Select value={safesearch} onValueChange={setSafesearch}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer rounded-md border p-3">
                  <Checkbox
                    checked={useLlmRanking}
                    onCheckedChange={(v) => setUseLlmRanking(!!v)}
                    className="mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">{t('sources.webSearchLlmRanking')}</span>
                    <p className="text-xs text-muted-foreground mt-1">{t('sources.webSearchLlmRankingHint')}</p>
                  </div>
                </label>
              </div>
            )}

            {step === 2 && searchResponse && (
              <div className="flex flex-col min-h-0 px-6 py-4 gap-3">
                <p className="text-sm text-muted-foreground">
                  {t('sources.webSearchStats')
                    .replace('{raw}', String(searchResponse.total_raw))
                    .replace('{filtered}', String(searchResponse.total_after_rules))
                    .replace('{returned}', String(searchResponse.total_returned))}
                  {searchResponse.llm_ranking_applied ? ` · ${t('sources.webSearchLlmApplied')}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                    {t('sources.webSearchSelectAll')}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                    {t('sources.webSearchDeselectAll')}
                  </Button>
                  <span className="text-sm text-muted-foreground self-center">
                    {t('sources.webSearchSelectedCount').replace('{count}', String(selectedUrls.size))}
                  </span>
                </div>
                <div className="border rounded-md overflow-y-auto max-h-[45vh] divide-y">
                  {results.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">{t('sources.webSearchNoResults')}</p>
                  ) : (
                    results.map((r) => (
                      <label
                        key={r.url}
                        className="flex gap-3 p-3 cursor-pointer hover:bg-muted/50 items-start"
                      >
                        <Checkbox
                          className="mt-1"
                          checked={selectedUrls.has(r.url)}
                          onCheckedChange={() => toggleUrl(r.url)}
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline break-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {r.title || r.url}
                          </a>
                          {r.snippet && (
                            <p className="text-xs text-muted-foreground line-clamp-3">{r.snippet}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {r.engine && (
                              <span>
                                {t('sources.webSearchEngine')}: {r.engine}
                              </span>
                            )}
                            {typeof r.score === 'number' && (
                              <span>
                                {t('sources.webSearchScore')}: {r.score.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="px-6 py-4">
                <NotebooksStep
                  notebooks={notebooks}
                  selectedNotebooks={selectedNotebooks}
                  onToggleNotebook={handleNotebookToggle}
                  loading={notebooksLoading}
                />
              </div>
            )}

            {step === 4 && (
              <div className="px-6 py-4">
                {/* @ts-expect-error ProcessingStep expects full CreateSourceFormData control; only embed/async fields are used */}
                <ProcessingStep
                  control={control}
                  transformations={transformations}
                  selectedTransformations={selectedTransformations}
                  onToggleTransformation={handleTransformationToggle}
                  loading={transformationsLoading}
                  settings={settings}
                />
              </div>
            )}
          </WizardContainer>

          <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-muted shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <div className="flex gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={goBack}>
                  {t('common.back')}
                </Button>
              )}
              {step === 1 && (
                <Button
                  type="button"
                  onClick={() => void handleSearch()}
                  disabled={webSearch.isPending || !query.trim()}
                >
                  {webSearch.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('sources.webSearchSearching')}
                    </>
                  ) : (
                    t('sources.webSearchRun')
                  )}
                </Button>
              )}
              {step > 1 && step < 4 && (
                <Button type="button" variant="outline" onClick={goNext} disabled={!stepValid()}>
                  {t('common.next')}
                </Button>
              )}
              {step === 4 && (
                <Button type="submit" disabled={submittingBatch || createSource.isPending}>
                  {submittingBatch || createSource.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('common.adding')}
                    </>
                  ) : (
                    t('sources.webSearchAddSelected')
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
