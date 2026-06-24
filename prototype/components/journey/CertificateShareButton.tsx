'use client'

import { useCallback, useState } from 'react'
import { Share2, Check } from 'lucide-react'

type CertificateShareButtonProps = {
  slug: string
  title: string
}

export default function CertificateShareButton({ slug, title }: CertificateShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const share = useCallback(async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/certificate/${slug}`
        : `/certificate/${slug}`
    const text = `I completed "${title}" on my NestQuest homebuying journey!`

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'NestQuest milestone', text, url })
        return
      }
    } catch {
      /* user cancelled or share failed — fall through to copy */
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* ignore */
    }
  }, [slug, title])

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
      {copied ? 'Link copied' : 'Share milestone'}
    </button>
  )
}
