import type { Metadata } from 'next'

const title = 'NestQuest for Professionals — HUD agencies, credit unions & CDFIs'
const description =
  'B2B tiers from $299/mo: white-label homebuyer readiness and team workflows for HUD-approved housing counseling agencies, credit unions, and CDFIs serving first-gen and low-income buyers. Request a demo.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
  robots: { index: true, follow: true },
}

export default function ForProfessionalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
