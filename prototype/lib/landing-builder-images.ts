export type BuilderHeroImage = {
  src: string
  alt: string
  /** CSS object-position for framing people/subjects */
  position?: string
}

export const LANDING_BUILDER_HERO_IMAGES: BuilderHeroImage[] = [
  {
    src: '/images/builders/nv-couple-steps.jpg',
    alt: 'Happy couple on the front steps of their new home',
    position: 'center 58%',
  },
  {
    src: '/images/builders/nv-family-porch.jpg',
    alt: 'Family celebrating on the front porch of their new home',
    position: 'center 48%',
  },
  {
    src: '/images/builders/nv-family-key.jpg',
    alt: 'Family celebrating a new home purchase',
    position: 'center 42%',
  },
  {
    src: '/images/builders/nv-couple-sold.jpg',
    alt: 'Couple celebrating in front of their new two-story home',
    position: 'center 38%',
  },
  {
    src: '/images/builders/pulte-family-kitchen.jpg',
    alt: 'Family together in the kitchen of a new home',
    position: 'center 32%',
  },
  {
    src: '/images/builders/pulte-couple.jpg',
    alt: 'Couple reviewing homebuying plans with a consultant',
    position: 'center 28%',
  },
  {
    src: '/images/builders/kb-new-beginnings.jpg',
    alt: 'Buyers starting their homebuying journey',
    position: 'center 45%',
  },
  {
    src: '/images/builders/kb-we-see.jpg',
    alt: 'Family moment outside a new home',
    position: 'center 50%',
  },
  {
    src: '/images/builders/kb-dreams.jpeg',
    alt: 'Homebuyers envisioning their dream home',
    position: 'center 46%',
  },
  {
    src: '/images/builders/nv-home-exterior.jpg',
    alt: 'Modern two-story new construction home',
    position: 'center 62%',
  },
]

export type OfferImage = {
  src: string
  position: string
}

export const LANDING_OFFER_IMAGES = {
  grants: { src: '/images/builders/nv-family-key.jpg', position: 'center 40%' },
  fees: { src: '/images/builders/nv-home-exterior.jpg', position: 'center 55%' },
  scripts: { src: '/images/builders/pulte-couple.jpg', position: 'center 25%' },
  budget: { src: '/images/builders/pulte-family-kitchen.jpg', position: 'center 35%' },
} as const satisfies Record<string, OfferImage>
