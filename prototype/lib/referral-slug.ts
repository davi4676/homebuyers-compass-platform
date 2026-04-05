import type { User } from '@/lib/types/auth'

function slugifySegment(s: string): string {
  const t = s.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32)
  return t || 'yourname'
}

/** Stable segment for `nestquest.com/ref/[slug]` from account or quiz identity. */
export function referralSlugFromUser(
  user: Pick<User, 'username' | 'email' | 'firstName'> | null | undefined
): string {
  if (!user) return 'yourname'
  const u = user.username?.trim()
  if (u) return slugifySegment(u)
  const emailLocal = user.email?.split('@')[0]?.trim()
  if (emailLocal) return slugifySegment(emailLocal)
  return slugifySegment(user.firstName || 'yourname')
}
