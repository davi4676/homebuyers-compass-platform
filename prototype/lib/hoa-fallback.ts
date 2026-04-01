/**
 * When ACS table B25143 is not available via the Census Data API, we still prefill HOA
 * using a published national median for owner-occupiers paying HOA/condo fees (~2024 ACS releases).
 * Replace with API-backed ZCTA values when `groups/B25143` is published.
 */
export const NATIONAL_TYPICAL_HOA_MONTHLY = 135
