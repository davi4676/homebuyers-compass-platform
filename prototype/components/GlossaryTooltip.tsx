'use client'

import { useState, type ReactNode } from 'react'
import { GLOSSARY, GLOSSARY_PLAIN_LABEL, type GlossaryTermId } from '@/lib/glossary'
import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'

export default function GlossaryTooltip({ term, children }: { term: GlossaryTermId; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const plainMode = usePlainEnglish()
  const def = GLOSSARY[term]
  const label = plainMode ? GLOSSARY_PLAIN_LABEL[term] : children

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="cursor-help border-b border-dotted border-brand-sage text-brand-forest underline-offset-2 dark:border-slate-500 dark:text-white"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {label}
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 max-w-xs -translate-x-1/2 rounded-lg bg-brand-forest p-3 text-left text-sm text-white shadow-lg"
        >
          {def}
        </span>
      ) : null}
    </span>
  )
}
