import type { StudioApi } from '@shared/api'
import type {
  ProjectSummary,
  ProjectBundle,
  ProjectSnapshot,
  NewProjectInput,
  MusicPrompt,
  Job,
  CreditEstimate,
  AspectRatio,
  WordTiming,
  Asset,
  AppSettings,
  KeyStatus,
  KeyTestResult,
  ApiProvider,
  TtsProvider,
  VoiceOption,
  ModelSource,
  ModelList,
  ExportOptions,
  WhisperStatus,
  ClipPatchEvent,
  CharacterPatchEvent
} from '@shared/types'


function normalizeUrls<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(normalizeUrls) as unknown as T
  const res: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === 'string' && v.startsWith('studio://asset/')) {
      res[k] = v.replace('studio://asset/', '/studio/asset/')
    } else {
      res[k] = normalizeUrls(v)
    }
  }
  return res as T
}

async function rpc<T>(channel: string, ...args: unknown[]): Promise<T> {
  const res = await fetch('/api/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, args })
  })
  if (!res.ok) {
    throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`)
  }
  const json = await res.json()
  if (!json.ok) {
    throw new Error(json.error || 'Terjadi kesalahan pada server')
  }
  return normalizeUrls(json.data) as T
}

function promptFileUpload(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.style.display = 'none'
    document.body.appendChild(input)

    input.onchange = () => {
      const file = input.files?.[0] ?? null
      document.body.removeChild(input)
      resolve(file)
    }

    input.oncancel = () => {
      document.body.removeChild(input)
      resolve(null)
    }

    // Fallback if window regains focus without change event
    window.addEventListener(
      'focus',
      () => {
        setTimeout(() => {
          if (document.body.contains(input)) {
            document.body.removeChild(input)
            resolve(null)
          }
        }, 500)
      },
      { once: true }
    )

    input.click()
  })
}

async function uploadFile(projectId: string, kind: 'music' | 'overlay', file: File): Promise<Asset> {
  const query = new URLSearchParams({
    projectId,
    kind,
    name: file.name
  })
  const res = await fetch(`/api/upload?${query.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream'
    },
    body: file
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Gagal mengunggah file')
  return normalizeUrls(json.data) as Asset
}

export function initWebApi(): StudioApi {
  // Listeners map for SSE events
  const listeners: Record<string, Set<(data: any) => void>> = {
    'event:job': new Set(),
    'event:clip': new Set(),
    'event:character': new Set(),
    'event:asset': new Set(),
    'event:whisper': new Set()
  }

  // Connect SSE
  let es: EventSource | null = null
  function connectSse() {
    if (typeof window === 'undefined') return
    es = new EventSource('/api/events')
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        const { channel, payload } = parsed
        const normalized = normalizeUrls(payload)
        const set = listeners[channel]
        if (set) {
          set.forEach((cb) => {
            try {
              cb(normalized)
            } catch (err) {
              console.error(`Error in event callback for ${channel}:`, err)
            }
          })
        }
      } catch {
        // Heartbeat or malformed data
      }
    }
    es.onerror = () => {
      es?.close()
      setTimeout(connectSse, 2000)
    }
  }
  connectSse()

  function addListener(channel: string, cb: (data: any) => void): () => void {
    listeners[channel]?.add(cb)
    return () => listeners[channel]?.delete(cb)
  }

  return {
    projects: {
      list: () => rpc<ProjectSummary[]>('projects:list'),
      create: (input: NewProjectInput) => rpc<ProjectBundle>('projects:create', input),
      get: (id: string) => rpc<ProjectBundle>('projects:get', id),
      save: (snapshot: ProjectSnapshot) => rpc<{ updatedAt: number }>('projects:save', snapshot),
      remove: (id: string) => rpc<void>('projects:remove', id),
      duplicate: (id: string) => rpc<ProjectSummary>('projects:duplicate', id)
    },
    story: {
      script: (projectId: string) => rpc<ProjectBundle>('story:script', projectId),
      visuals: (projectId: string, mode: 'missing' | 'all') => rpc<ProjectBundle>('story:visuals', projectId, mode),
      musicPrompt: (projectId: string) => rpc<MusicPrompt>('story:musicPrompt', projectId)
    },
    generate: {
      clipImage: (clipId: string) => rpc<Job>('generate:clipImage', clipId),
      clipVideo: (clipId: string) => rpc<Job>('generate:clipVideo', clipId),
      clipTts: (clipId: string) => rpc<Job>('generate:clipTts', clipId),
      characterSheet: (characterId: string) => rpc<Job>('generate:characterSheet', characterId),
      missingImages: (projectId: string) => rpc<Job[]>('generate:missingImages', projectId),
      missingVideos: (projectId: string) => rpc<Job[]>('generate:missingVideos', projectId),
      missingTts: (projectId: string) => rpc<Job[]>('generate:missingTts', projectId),
      narration: (projectId: string, mode: 'missing' | 'all') => rpc<Job>('generate:narration', projectId, mode),
      syncCaptions: (projectId: string, mode?: 'stale' | 'all') => rpc<Job>('generate:syncCaptions', projectId, mode),
      cancel: (jobId: string) => rpc<void>('generate:cancel', jobId),
      estimate: (kind: 'image' | 'video', modelId: string, aspect: AspectRatio, seconds?: number, resolution?: string | null) =>
        rpc<CreditEstimate | null>('generate:estimate', kind, modelId, aspect, seconds, resolution)
    },
    clips: {
      split: (clipId: string, atMs: number) => rpc<ProjectBundle>('clips:split', clipId, atMs),
      detachVoice: (clipId: string) => rpc<void>('clips:detachVoice', clipId)
    },
    assets: {
      setActive: (clipId: string, assetId: string) => rpc<void>('assets:setActive', clipId, assetId),
      setWords: (assetId: string, words: WordTiming[]) => rpc<Asset>('assets:setWords', assetId, words),
      pickMusic: async (projectId: string) => {
        const file = await promptFileUpload('audio/*,.mp3,.wav,.m4a,.ogg')
        if (!file) return null
        return uploadFile(projectId, 'music', file)
      },
      pickImage: async (projectId: string) => {
        const file = await promptFileUpload('image/*,.png,.jpg,.jpeg,.webp')
        if (!file) return null
        return uploadFile(projectId, 'overlay', file)
      }
    },
    settings: {
      get: () => rpc<AppSettings>('settings:get'),
      set: (patch: Partial<AppSettings>) => rpc<AppSettings>('settings:set', patch),
      keys: () => rpc<KeyStatus[]>('settings:keys'),
      setKey: (provider: ApiProvider, key: string) => rpc<KeyTestResult>('settings:setKey', provider, key),
      setCustom: (baseUrl: string, key: string) => rpc<KeyTestResult>('settings:setCustom', baseUrl, key),
      clearKey: (provider: ApiProvider) => rpc<void>('settings:clearKey', provider),
      revealKey: (provider: ApiProvider) => rpc<string | null>('settings:revealKey', provider),
      testKey: (provider: ApiProvider) => rpc<KeyTestResult>('settings:testKey', provider),
      voices: (provider: TtsProvider) => rpc<VoiceOption[]>('settings:voices', provider)
    },
    models: {
      list: (source: ModelSource, refresh?: boolean) => rpc<ModelList>('models:list', source, refresh)
    },
    exporter: {
      start: (projectId: string, options: ExportOptions) => rpc<Job>('export:start', projectId, options),
      defaultFolder: () => rpc<string>('export:defaultFolder'),
      pickFolder: () => rpc<string | null>('export:pickFolder'),
      reveal: (path: string) => rpc<void>('export:reveal', path)
    },
    whisper: {
      status: () => rpc<WhisperStatus>('whisper:status'),
      download: () => rpc<void>('whisper:download'),
      cancel: () => rpc<void>('whisper:cancel'),
      remove: () => rpc<void>('whisper:remove'),
      openFolder: () => rpc<void>('whisper:openFolder')
    },
    app: {
      version: () => rpc<string>('app:version'),
      copyText: async (text: string) => {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(String(text))
        } else {
          await rpc<void>('app:copyText', text)
        }
      },
      openExternal: async (url: string) => {
        if (/^https:\/\//i.test(url)) {
          window.open(url, '_blank')
        }
      }
    },
    on: {
      job: (cb: (job: Job) => void) => addListener('event:job', cb),
      clip: (cb: (e: ClipPatchEvent) => void) => addListener('event:clip', cb),
      character: (cb: (e: CharacterPatchEvent) => void) => addListener('event:character', cb),
      asset: (cb: (asset: Asset) => void) => addListener('event:asset', cb),
      whisper: (cb: (status: WhisperStatus) => void) => addListener('event:whisper', cb)
    }
  }
}
