'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import { cn } from '@/lib/design-system'

type Props = {
  children: ReactNode
  className?: string
}

export default function ScrollRevealSection({ children, className }: Props) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={revealed ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
