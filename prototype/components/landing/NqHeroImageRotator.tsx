'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { BuilderHeroImage } from '@/lib/landing-builder-images'

type Props = {
  images: BuilderHeroImage[]
  intervalMs?: number
  className?: string
}

export default function NqHeroImageRotator({ images, intervalMs = 5500, className = '' }: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [images.length, intervalMs])

  const current = images[index]

  return (
    <div className={`nq-hero-rotator ${className}`.trim()}>
      <AnimatePresence mode="wait">
        <motion.img
          key={current.src}
          src={current.src}
          alt={current.alt}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="nq-hero-rotator-img"
          style={{ objectPosition: current.position ?? 'center center' }}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      </AnimatePresence>
      <div className="nq-hero-rotator-dots" aria-hidden>
        {images.map((img, i) => (
          <span key={img.src} className={i === index ? 'is-active' : ''} />
        ))}
      </div>
    </div>
  )
}
