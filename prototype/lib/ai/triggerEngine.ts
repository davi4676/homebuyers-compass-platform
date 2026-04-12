import type { JourneyContext, TriggerResult } from '@/lib/ai/types'

function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/**
 * Ordered proactive triggers for Compass. Returns the first match.
 * Savings milestones persist `nq_last_savings_pct` in localStorage when fired (client only).
 */
export function evaluateTriggers(context: JourneyContext): TriggerResult {
  if (typeof window === 'undefined') {
    return { shouldShow: false, triggerType: 'none', suggestedPrompt: '' }
  }

  const phase = context.profile.currentPhase
  const firstName = context.profile.firstName
  const targetHomePrice = context.profile.targetHomePrice
  const lastVisitRaw = context.behavior.lastVisit
  const hasLastVisit = lastVisitRaw != null && String(lastVisitRaw).trim() !== ''

  // 1. STUCK_ON_PHASE
  if (context.behavior.stuckOnCurrentPhase === true) {
    return {
      shouldShow: true,
      triggerType: 'stuck',
      suggestedPrompt: `It looks like you've been on the ${phase} step for a while.\nWhat's making it feel tricky? I can break it down into smaller steps.`,
    }
  }

  // 2. RATE_CHANGE (only meaningful if we've seen a prior visit)
  const rateDelta = context.market.rateChangeSinceLastVisit
  if (hasLastVisit && Math.abs(rateDelta) >= 0.1) {
    const dir = rateDelta > 0 ? 'moved up' : 'moved down'
    const x = Math.abs(rateDelta).toFixed(2)
    return {
      shouldShow: true,
      triggerType: 'market_update',
      suggestedPrompt: `Rates ${dir} ${x}% since your last visit.\nHere's what that means for your monthly payment on a $${formatMoney(targetHomePrice)} home.`,
    }
  }

  // 3. RETURNING_USER
  if (hasLastVisit && context.behavior.daysSinceLastVisit >= 3) {
    return {
      shouldShow: true,
      triggerType: 'welcome_back',
      suggestedPrompt: `Welcome back, ${firstName}! You were working on ${phase}.\nReady to pick up where you left off?`,
    }
  }

  // 4. SAVINGS_MILESTONE
  const goal = context.profile.savingsGoal
  const sav = context.profile.savings
  if (goal > 0) {
    const currPct = Math.min(100, Math.round((sav / goal) * 100))
    let prevPct = 0
    try {
      const raw = localStorage.getItem('nq_last_savings_pct')
      if (raw != null && raw.trim() !== '') prevPct = Math.max(0, parseInt(raw, 10) || 0)
    } catch {
      /* ignore */
    }
    const milestones = [25, 50, 75, 100]
    const crossed = milestones.find((m) => prevPct < m && currPct >= m)
    if (crossed != null) {
      try {
        localStorage.setItem('nq_last_savings_pct', String(currPct))
      } catch {
        /* ignore */
      }
      return {
        shouldShow: true,
        triggerType: 'savings_milestone',
        suggestedPrompt: `You just hit ${crossed}% of your savings goal — that's a real milestone.\nAt this pace, here's when you could be ready to apply.`,
      }
    }
  }

  // 5. FIRST_VISIT_TO_PAGE
  if (context.behavior.sessionCount <= 1) {
    return {
      shouldShow: true,
      triggerType: 'onboarding',
      suggestedPrompt: `Hi ${firstName}! I'm Compass, your AI homebuying guide.\nI'll check in at the right moments — not spam you.\nWant a quick overview of what's on this page?`,
    }
  }

  return { shouldShow: false, triggerType: 'none', suggestedPrompt: '' }
}
