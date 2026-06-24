import type { ReactNode } from 'react'

type Props = {
  eyebrow?: string
  title: string
  subtitle: string
  imageSrc?: string
  imageAlt?: string
  imagePosition?: string
}

export default function NqHubHero({
  eyebrow,
  title,
  subtitle,
  imageSrc = '/images/builders/nv-couple-steps.jpg',
  imageAlt = 'Happy couple on the front steps of their new home',
  imagePosition = 'center 55%',
}: Props) {
  return (
    <div className="nq-hub-hero relative mb-6 overflow-hidden rounded-2xl sm:rounded-3xl">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: imagePosition }}
        loading="lazy"
      />
      <div className="nq-hub-hero-scrim absolute inset-0" aria-hidden />
      <div className="relative z-[1] px-6 py-8 sm:px-10 sm:py-10">
        {eyebrow ? (
          <span className="nq-ed-eyebrow !border-white/25 !bg-white/10 !text-white/90">{eyebrow}</span>
        ) : null}
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{subtitle}</p>
      </div>
    </div>
  )
}
