import { readJsonFile, writeJsonFile } from '@/lib/db/store'

export type TestimonialRecord = {
  id: string
  name: string
  location: string
  quote: string
  rating: number
  status: 'pending' | 'approved' | 'rejected'
  email?: string
  consent: boolean
  createdAt: string
}

const FILE = 'testimonials.json'

const SEED: TestimonialRecord[] = [
  {
    id: 'seed-1',
    name: 'James & Priya T.',
    location: 'Austin, TX',
    quote: 'We knew which fees to question before we signed. Same-day clarity on closing costs.',
    rating: 5,
    status: 'approved',
    consent: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-2',
    name: 'Maria C.',
    location: 'Phoenix, AZ',
    quote: 'Found county grant options I never knew existed. The quiz took under two minutes.',
    rating: 5,
    status: 'approved',
    consent: true,
    createdAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'seed-3',
    name: 'Danielle R.',
    location: 'Atlanta, GA',
    quote: 'Scripts made lender calls less scary. I compared three offers with confidence.',
    rating: 5,
    status: 'approved',
    consent: true,
    createdAt: '2025-01-03T00:00:00.000Z',
  },
]

function readAll(): TestimonialRecord[] {
  const stored = readJsonFile<TestimonialRecord[]>(FILE, [])
  if (stored.length === 0) return SEED
  return stored
}

function writeAll(items: TestimonialRecord[]) {
  writeJsonFile(FILE, items)
}

export function listApprovedTestimonials(limit = 12): TestimonialRecord[] {
  return readAll()
    .filter((t) => t.status === 'approved')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}

export function submitTestimonial(input: {
  name: string
  location: string
  quote: string
  email?: string
  consent: boolean
}): TestimonialRecord {
  const all = readAll()
  const record: TestimonialRecord = {
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim(),
    location: input.location.trim(),
    quote: input.quote.trim(),
    rating: 5,
    status: 'pending',
    email: input.email?.trim(),
    consent: input.consent,
    createdAt: new Date().toISOString(),
  }
  all.push(record)
  writeAll(all)
  return record
}
