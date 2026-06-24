'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

type Cta = {
  href: string
  label: string
  onClick?: () => void
}

type Props = {
  brandLine: string
  title: string
  titleAccent?: string
  subtitle: string
  imageSrc: string
  imageAlt: string
  imagePosition?: string
  cta?: Cta
  glassCard?: ReactNode
  compact?: boolean
}

export default function NqHubModernHero({
  brandLine,
  title,
  titleAccent,
  subtitle,
  imageSrc,
  imageAlt,
  imagePosition = 'center center',
  cta,
  glassCard,
  compact = false,
}: Props) {
  return (
    <section
      className={`nq-modern-hero relative isolate overflow-hidden px-4 sm:px-6 ${
        compact ? 'pb-8 pt-6 sm:pb-10 sm:pt-8' : 'pb-12 pt-8 sm:pb-16 sm:pt-10 md:pb-20 md:pt-12'
      }`}
    >
      <div className="relative z-[1] mx-auto max-w-7xl">
        <div className="nq-modern-hero-grid">
          <div className="text-center lg:text-left">
            <p className="nq-sl-brand-line">{brandLine}</p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className={`mx-auto mt-3 max-w-3xl font-display font-bold leading-[1.12] tracking-tight lg:mx-0 ${
                compact
                  ? 'text-[1.65rem] sm:text-[2rem] md:text-[2.35rem]'
                  : 'text-[1.85rem] sm:text-[2.35rem] md:text-[2.75rem]'
              }`}
            >
              {title}
              {titleAccent ? (
                <>
                  {' '}
                  <span className="bg-gradient-to-r from-[var(--nq-ed-accent)] to-[var(--nq-ed-trust-blue)] bg-clip-text text-transparent">
                    {titleAccent}
                  </span>
                </>
              ) : null}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="mx-auto mt-3 max-w-md text-base leading-relaxed text-[var(--nq-ed-muted)] lg:mx-0 sm:text-lg"
            >
              {subtitle}
            </motion.p>
            {cta ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32 }}
                className="mt-5 flex justify-center lg:justify-start"
              >
                <Link href={cta.href} onClick={cta.onClick} className="nq-sl-hero-cta">
                  {cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ) : null}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className={`nq-modern-hero-visual ${compact ? '!min-h-[280px] sm:!min-h-[320px]' : ''}`}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className={`nq-hero-rotator-img ${glassCard ? 'absolute inset-0' : ''}`}
              style={{ objectPosition: imagePosition }}
              loading="eager"
            />
            {glassCard}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
