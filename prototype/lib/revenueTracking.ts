export function trackRevenueEvent(
  channel: string,
  action: string,
  value?: number
) {
  // Placeholder for analytics integration (Segment, Mixpanel, etc.)
  console.log('[Revenue]', {
    channel,
    action,
    value,
    timestamp: new Date().toISOString(),
  })
  // TODO: Replace with actual analytics call
}

export function buildPartnerUrl(
  baseUrl: string,
  params: Record<string, string>
) {
  const url = new URL(baseUrl)
  url.searchParams.set('utm_source', 'nestquest')
  url.searchParams.set('utm_medium', 'platform')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}
