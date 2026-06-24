/**
 * Optional muted photo slot per journey phase (Mission Control / Batch 6).
 * Decorative only — copy and phase logic still come from `JOURNEY_PHASES_DATA`.
 */
export const MISSION_CONTROL_PHASE_MEDIA: Readonly<Record<number, { src: string; alt: string }>> = {
  1: {
    src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80',
    alt: 'Editorial desk scene with planning notes and laptop',
  },
  2: {
    src: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80',
    alt: 'Architectural exterior used for pre-approval and search planning mood',
  },
  3: {
    src: 'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=1400&q=80',
    alt: 'Quiet residential architecture on a tree-lined street',
  },
  4: {
    src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    alt: 'Modern home exterior in evening light',
  },
  5: {
    src: 'https://images.unsplash.com/photo-1454165804606-c2d1cb7a8e6d?auto=format&fit=crop&w=1400&q=80',
    alt: 'Private-office work surface with paperwork and laptop',
  },
  6: {
    src: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80',
    alt: 'Key handoff moment representing closing day',
  },
  7: {
    src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80',
    alt: 'Organized home maintenance tools in natural light',
  },
  8: {
    src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80',
    alt: 'Suburban residence framed at golden hour',
  },
}
