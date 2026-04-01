'use client'

import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'
import { applyPlainEnglishCopy } from '@/lib/plain-english'

/** Applies profile “Plain English mode” to static copy (string in → string out). */
export default function PlainEnglishText({
  text,
  className,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  as?: 'span' | 'p' | 'h2' | 'h3' | 'div' | 'label'
}) {
  const plain = usePlainEnglish()
  const out = applyPlainEnglishCopy(text, plain)
  return <Tag className={className}>{out}</Tag>
}
