import { appBaseUrl } from '@/lib/email/send-transactional'

function wrap(body: string) {
  const base = appBaseUrl() || 'https://nestquest.app'
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;line-height:1.6;color:#1c1917">
${body}
<p style="color:#78716c;font-size:12px;margin-top:28px">NestQuest — your homebuying advocate. <a href="${base}/privacy" style="color:#0d9488">Privacy</a></p>
</div>`
}

export function closingCostChecklistEmailHtml(): string {
  const base = appBaseUrl() || 'https://nestquest.app'
  return wrap(`
<h1 style="font-size:20px;margin:0 0 16px">Your closing cost checklist</h1>
<p>Thanks for requesting this from NestQuest. Use it before you sign — most savings come from asking the right questions early.</p>
<h2 style="font-size:16px;margin:24px 0 8px">Sections on your Loan Estimate</h2>
<ul>
<li><strong>Section A — Origination:</strong> Often negotiable (processing, underwriting, application).</li>
<li><strong>Section B — Required services:</strong> Appraisal, credit report — shop less, but compare totals.</li>
<li><strong>Section C — Services you can shop:</strong> Title insurance and settlement fees — compare at least three providers.</li>
</ul>
<h2 style="font-size:16px;margin:24px 0 8px">Five questions for your lender</h2>
<ol>
<li>Can you match this competing Loan Estimate line by line?</li>
<li>Are there lender credits if I take a slightly higher rate?</li>
<li>What is my total cash to close, not just the down payment?</li>
<li>Which fees are fixed vs. estimates that could rise?</li>
<li>When does my rate lock expire?</li>
</ol>
<p><strong>Wire fraud reminder:</strong> Always verify wiring instructions by calling your closing agent on a phone number you look up yourself — never use a number from an email alone.</p>
<p><a href="${base}/quiz" style="display:inline-block;margin-top:8px;padding:12px 20px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Get your personalized savings snapshot →</a></p>
<p style="font-size:14px;color:#57534e">Browse free guides anytime at <a href="${base}/resources" style="color:#0d9488">Playbooks</a>.</p>
`)
}

export function quizResultsTeaserEmailHtml(): string {
  const base = appBaseUrl() || 'https://nestquest.app'
  return wrap(`
<h1 style="font-size:20px;margin:0 0 16px">Your savings snapshot is saved</h1>
<p>Thanks for completing the NestQuest assessment. Your personalized numbers are ready whenever you are.</p>
<p><a href="${base}/results" style="display:inline-block;margin:16px 0;padding:12px 20px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Open your results →</a></p>
<p>Over the next week we will send short tips to help you move from numbers to action — one step at a time, no overwhelm.</p>
<p style="font-size:14px;color:#57534e">Start your roadmap at <a href="${base}/customized-journey" style="color:#0d9488">My Journey</a> or browse <a href="${base}/resources" style="color:#0d9488">Playbooks</a>.</p>
`)
}

export type LeadEmailTemplate = 'closing-cost-checklist' | 'quiz-results-teaser' | 'pre-purchase-workbook'

export function prePurchaseWorkbookEmailHtml(): string {
  const base = appBaseUrl() || 'https://nestquest.app'
  return wrap(`
<h1 style="font-size:20px;margin:0 0 16px">Your pre-purchase workbook</h1>
<p>Thanks for requesting the NestQuest workbook. Use it to track documents, compare lenders, and plan for closing.</p>
<p><strong>What's inside:</strong></p>
<ul>
<li>Document checklist (Phase 1)</li>
<li>Lender comparison worksheet (Phase 2)</li>
<li>Inspection, closing day, and maintenance planners (full version with Momentum)</li>
</ul>
<p><a href="${base}/workbook" style="display:inline-block;margin:16px 0;padding:12px 20px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Open printable workbook →</a></p>
<p style="font-size:14px;color:#57534e">Tip: use Print in your browser to save as PDF. Browse all guides at <a href="${base}/learn" style="color:#0d9488">/learn</a>.</p>
`)
}

export function subjectForTemplate(template: LeadEmailTemplate): string {
  if (template === 'closing-cost-checklist') return 'Your NestQuest closing cost checklist'
  if (template === 'pre-purchase-workbook') return 'Your NestQuest pre-purchase workbook'
  return 'Your NestQuest savings snapshot is ready'
}

export function htmlForTemplate(template: LeadEmailTemplate): string {
  if (template === 'closing-cost-checklist') return closingCostChecklistEmailHtml()
  if (template === 'pre-purchase-workbook') return prePurchaseWorkbookEmailHtml()
  return quizResultsTeaserEmailHtml()
}
