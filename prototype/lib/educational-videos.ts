/**
 * Educational video config per playbook / journey phase.
 * Replace `youtubeId: null` with the YouTube ID once each video is uploaded.
 *
 * To get the video ID: from https://www.youtube.com/watch?v=XXXXX use XXXXX
 */

export type PhaseVideoId =
  | 'preparation'
  | 'pre-approval'
  | 'loan-programs'
  | 'house-hunting'
  | 'negotiation'
  | 'underwriting'
  | 'closing'
  | 'post-closing'
  | 'methodology'

export interface EducationalVideoConfig {
  /** YouTube video ID — null until a real video is uploaded (see docs/EASIER-VIDEO-CREATION.md) */
  youtubeId: string | null
  title: string
  durationLabel: string
}

export const EDUCATIONAL_VIDEOS: Record<PhaseVideoId, EducationalVideoConfig> = {
  preparation: {
    youtubeId: null,
    title: 'Preparation & credit overview',
    durationLabel: '2 min',
  },
  'pre-approval': {
    youtubeId: null,
    title: 'Getting pre-approved',
    durationLabel: '2 min',
  },
  'loan-programs': {
    youtubeId: null,
    title: 'FHA, VA, USDA & conventional basics',
    durationLabel: '3 min',
  },
  'house-hunting': {
    youtubeId: null,
    title: 'House hunting without burnout',
    durationLabel: '2 min',
  },
  negotiation: {
    youtubeId: null,
    title: 'Inspection & negotiation',
    durationLabel: '2 min',
  },
  underwriting: {
    youtubeId: null,
    title: 'Underwriting & appraisal',
    durationLabel: '2 min',
  },
  closing: {
    youtubeId: null,
    title: 'Closing costs & closing day',
    durationLabel: '2 min',
  },
  'post-closing': {
    youtubeId: null,
    title: 'Post-closing maintenance',
    durationLabel: '2 min',
  },
  methodology: {
    youtubeId: null,
    title: 'How NestQuest stays unbiased',
    durationLabel: '90 sec',
  },
}

/** @deprecated Use getEducationalVideoConfig — kept for backward compatibility */
export const EDUCATIONAL_VIDEO_IDS: Record<string, string> = Object.fromEntries(
  Object.entries(EDUCATIONAL_VIDEOS).map(([k, v]) => [k, v.youtubeId ?? ''])
)

export function getEducationalVideoConfig(phaseId: string): EducationalVideoConfig | null {
  return EDUCATIONAL_VIDEOS[phaseId as PhaseVideoId] ?? null
}

export function getEducationalVideoEmbedUrl(phaseId: string): string | null {
  const id = getEducationalVideoConfig(phaseId)?.youtubeId
  if (!id?.trim()) return null
  return `https://www.youtube.com/embed/${id.trim()}`
}

export function hasPlayableEducationalVideo(phaseId: string): boolean {
  return Boolean(getEducationalVideoConfig(phaseId)?.youtubeId?.trim())
}
