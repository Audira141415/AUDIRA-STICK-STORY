import http from 'node:http'
import { createReadStream, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { extname, join, normalize, sep, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { projectsRoot, fontsDir, assetAbsPath } from './paths'
import { probeDurationMs, probeSize } from './services/audio'
import { insertAsset, getProject } from './repo'
import { invokeHandler } from './ipc'
import { addSseClient, removeSseClient } from './events'

const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.ttf': 'font/ttf'
}

export function startHttpServer(port = 5201): http.Server {
  const server = http.createServer(async (req, res) => {
    // CORS headers for local web development
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url ?? '/', `http://${req.headers.host || 'localhost'}`)
    const pathname = url.pathname

    // 1. SSE Real-time Events
    if (req.method === 'GET' && pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      })
      res.write(': connected\n\n')
      addSseClient(res)
      req.on('close', () => removeSseClient(res))
      return
    }

    // 2. RPC Handler
    if (req.method === 'POST' && pathname === '/api/rpc') {
      let bodyStr = ''
      req.on('data', (chunk) => {
        bodyStr += chunk
      })
      req.on('end', async () => {
        try {
          const body = JSON.parse(bodyStr || '{}')
          const { channel, args = [] } = body
          if (!channel) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: false, error: 'Parameter channel wajib diisi' }))
            return
          }
          const result = await invokeHandler(channel, args)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true, data: result }))
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: errorMsg }))
        }
      })
      return
    }

    // 3. File Upload for Browser
    if (req.method === 'POST' && pathname === '/api/upload') {
      const projectId = url.searchParams.get('projectId')
      const kind = url.searchParams.get('kind') // 'music' | 'overlay'
      const fileName = url.searchParams.get('name') || 'uploaded-file'

      if (!projectId || (kind !== 'music' && kind !== 'overlay')) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: 'Parameter upload tidak lengkap' }))
        return
      }

      const chunks: Buffer[] = []
      req.on('data', (c: Buffer) => chunks.push(c))
      req.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks)
          getProject(projectId)
          const ext = extname(fileName).toLowerCase() || (kind === 'music' ? '.mp3' : '.png')
          const folder = kind === 'music' ? 'music' : 'overlays'
          const rel = `${folder}/${randomUUID()}${ext}`
          const abs = assetAbsPath(projectId, rel)
          mkdirSync(dirname(abs), { recursive: true })
          writeFileSync(abs, buffer)

          if (kind === 'music') {
            const durationMs = await probeDurationMs(abs).catch(() => null)
            const asset = insertAsset({
              projectId,
              kind: 'music',
              provider: 'local',
              prompt: fileName,
              localPath: rel,
              durationMs
            })
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true, data: asset }))
          } else {
            const size = await probeSize(abs).catch(() => null)
            if (!size) throw new Error('Gambar tidak bisa dibaca.')
            const asset = insertAsset({
              projectId,
              kind: 'overlay',
              provider: 'local',
              prompt: fileName,
              localPath: rel,
              width: size.width,
              height: size.height
            })
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true, data: asset }))
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: errorMsg }))
        }
      })
      return
    }

    // 4. Stream Fonts (/studio/fonts/...)
    if (req.method === 'GET' && pathname.startsWith('/studio/fonts/')) {
      const fontName = decodeURIComponent(pathname.replace('/studio/fonts/', ''))
      const abs = join(fontsDir(), fontName)
      if (!existsSync(abs)) {
        res.writeHead(404)
        res.end('Font tidak ditemukan')
        return
      }
      res.writeHead(200, {
        'Content-Type': 'font/ttf',
        'Cache-Control': 'public, max-age=31536000'
      })
      createReadStream(abs).pipe(res)
      return
    }

    // 5. Stream Assets (/studio/asset/:projectId/:path...)
    if (req.method === 'GET' && pathname.startsWith('/studio/asset/')) {
      const relPath = decodeURIComponent(pathname.replace('/studio/asset/', ''))
      const abs = normalize(join(projectsRoot(), relPath))
      if (!abs.startsWith(normalize(projectsRoot()) + sep) || !existsSync(abs)) {
        res.writeHead(404)
        res.end('Asset tidak ditemukan')
        return
      }

      let size = 0
      try {
        size = statSync(abs).size
      } catch {
        res.writeHead(404)
        res.end('Tidak ditemukan')
        return
      }

      const type = TYPES[extname(abs).toLowerCase()] ?? 'application/octet-stream'
      const range = req.headers.range

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10) || 0
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1
        if (start >= size || start > end) {
          res.writeHead(416, { 'Content-Range': `bytes */${size}` })
          res.end()
          return
        }
        res.writeHead(206, {
          'Content-Type': type,
          'Content-Length': String(end - start + 1),
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes'
        })
        createReadStream(abs, { start, end }).pipe(res)
      } else {
        res.writeHead(200, {
          'Content-Type': type,
          'Content-Length': String(size),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache'
        })
        createReadStream(abs).pipe(res)
      }
      return
    }

    res.writeHead(404)
    res.end('Endpoint tidak ditemukan')
  })

  server.listen(port, '0.0.0.0', () => {
    console.log(`[Audira Story Web Server] API & Media server aktif di http://127.0.0.1:${port}`)
  })


  return server
}
