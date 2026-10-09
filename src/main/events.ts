import type { ServerResponse } from 'node:http'
import { BrowserWindow } from 'electron'
import { EVENTS } from '@shared/api'
import type { Asset, CharacterPatchEvent, ClipPatchEvent, Job, WhisperStatus } from '@shared/types'

const sseClients = new Set<ServerResponse>()

export function addSseClient(res: ServerResponse): void {
  sseClients.add(res)
}

export function removeSseClient(res: ServerResponse): void {
  sseClients.delete(res)
}

function send(channel: string, payload: unknown): void {
  for (const w of BrowserWindow.getAllWindows()) {
    if (!w.isDestroyed()) w.webContents.send(channel, payload)
  }
  if (sseClients.size > 0) {
    const data = `data: ${JSON.stringify({ channel, payload })}\n\n`
    for (const client of sseClients) {
      try {
        client.write(data)
      } catch {
        sseClients.delete(client)
      }
    }
  }
}

export const emit = {
  job: (job: Job): void => send(EVENTS.job, job),
  clip: (e: ClipPatchEvent): void => send(EVENTS.clip, e),
  character: (e: CharacterPatchEvent): void => send(EVENTS.character, e),
  asset: (asset: Asset): void => send(EVENTS.asset, asset),
  whisper: (status: WhisperStatus): void => send(EVENTS.whisper, status)
}

