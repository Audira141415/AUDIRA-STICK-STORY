import { Shield, Sparkles, Code2, Heart } from 'lucide-react'
import { LogoMark } from './Logo'
import { useApp } from '../store/app'

export function Footer() {
  const { go } = useApp()

  return (
    <footer className="w-full mt-10 border-t border-line-2 pt-8 pb-12 text-ink-2">
      <div className="flex flex-col gap-8">
        {/* Top bar: Brand & Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <LogoMark size={38} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-[22px] font-bold tracking-tight text-ink">
                Audira Story
              </span>
              <span className="text-[12px] font-semibold text-accent-dark">
                by AUDIRA (Agus Dwi R)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-3 py-1 text-ink-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              API Server: Port 5201
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-3 py-1 text-ink-2">
              Web Studio: Port 5200
            </span>
            <button
              type="button"
              onClick={() => go({ name: 'settings' })}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-3 py-1 font-sans text-xs font-medium text-ink hover:bg-surface transition-colors"
            >
              Pengaturan & API Keys
            </button>
          </div>
        </div>

        {/* Feature Badges / Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-line bg-surface/70 p-4 text-xs">
          <div className="flex items-start gap-2.5">
            <Shield className="size-4 shrink-0 text-accent-dark mt-0.5" />
            <div>
              <span className="font-semibold text-ink block">Privasi & BYOK Aman</span>
              <span className="text-muted">Kunci API tersimpan lokal dan terenkripsi aman di perangkat komputer kamu.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Sparkles className="size-4 shrink-0 text-accent-dark mt-0.5" />
            <div>
              <span className="font-semibold text-ink block">Multi-Provider AI Video</span>
              <span className="text-muted">Terintegrasi dengan Gemini, ElevenLabs, Higgsfield, Groq, dan OpenRouter.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Code2 className="size-4 shrink-0 text-accent-dark mt-0.5" />
            <div>
              <span className="font-semibold text-ink block">Arsitektur Hybrid Canggih</span>
              <span className="text-muted">Engine terpadu React 19, Vite, Electron, FFmpeg, Whisper C++, dan SQLite.</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright and licensing details */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-line-2/60 text-xs text-muted">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-ink">
              Lisensi resmi oleh AUDIRA (Agus Dwi R)
            </span>
            <span className="hidden sm:inline">·</span>
            <span>Hak Cipta © 2026 AUDIRA (Agus Dwi R). Seluruh hak cipta dilindungi.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              Dibuat dengan <Heart className="size-3 text-red-500 fill-red-500" /> untuk kreator video & cerita
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
