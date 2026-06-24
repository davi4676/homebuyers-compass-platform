'use client'

import { PlayCircle } from 'lucide-react'
import {
  getEducationalVideoConfig,
  getEducationalVideoEmbedUrl,
  hasPlayableEducationalVideo,
} from '@/lib/educational-videos'

type PhaseVideoEmbedProps = {
  phaseId: string
  className?: string
}

export default function PhaseVideoEmbed({ phaseId, className = '' }: PhaseVideoEmbedProps) {
  const config = getEducationalVideoConfig(phaseId)
  if (!config) return null

  const embedUrl = getEducationalVideoEmbedUrl(phaseId)
  const playable = hasPlayableEducationalVideo(phaseId)

  return (
    <div className={`mb-4 max-w-2xl ${className}`}>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--nq-ed-text)]">
        <PlayCircle className="h-4 w-4 text-[var(--nq-ed-accent)]" aria-hidden />
        Watch: {config.durationLabel} overview — {config.title}
      </p>
      {playable && embedUrl ? (
        <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
          <iframe
            src={embedUrl}
            title={`${config.title} — educational video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <div
          className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center"
          role="status"
        >
          <PlayCircle className="mb-2 h-10 w-10 text-slate-300" aria-hidden />
          <p className="text-sm font-medium text-slate-600">Video coming soon</p>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            The overview for this phase will appear here once your video ID is added to{' '}
            <code className="rounded bg-slate-200/80 px-1 py-0.5 text-[10px]">lib/educational-videos.ts</code>.
          </p>
        </div>
      )}
    </div>
  )
}
