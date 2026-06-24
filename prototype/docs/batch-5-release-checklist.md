# Batch 5 Release Checklist

## Scope
- 5A: Regression and compatibility sweep
- 5B: UX consistency and terminology polish
- 5C: Integration readiness validation (adapter-safe framing only)
- 5D: Release prep and risk review

## Critical Flow Smoke Tests
- Landing to quiz:
  - `/?...` to `/quiz` still works for first-time, first-gen, move-up, refinance entry points.
- Quiz to results:
  - Results headline and transaction framing render for first-time, repeat-buyer, refinance.
- Mission Control:
  - `/customized-journey?tab=today|plan|money|learn` opens correct tabs.
  - Legacy aliases still resolve: `phase`, `budget`, `assistance`, `library`, `inbox`.
- Money and DPA:
  - `DpaMatchReportSection` checkout starts and returns with success query handling.
  - Milestone gate links to money/programs still function.
- Lifecycle paths:
  - `/repeat-buyer-suite`, `/refinance-optimizer`, `/lifecycle-dashboard` load and cross-link.
  - Ecosystem nav keeps first-time Mission Control as primary.

## Compatibility Guardrails
- Do not remove or rename persisted tab aliases.
- Do not change localStorage keys used by in-flight users.
- Do not alter payment/report endpoint paths.
- Do not alter analytics event names in this batch.

## Integration Readiness Validation
- `integration-readiness.ts` remains metadata-only (no live provider assumptions).
- UI must label non-production domains as adapter-ready or mock/scaffolded.
- No new fake-live claims in copy.

## Residual Risks
- Existing project-wide TypeScript issues outside changed files may still exist.
- Legacy links using old tab aliases are intentionally tolerated for backward compatibility.
- Reminder/notification APIs are scaffolded; channel behavior may vary by auth/session state.

## Sign-off Notes
- Lint changed files.
- Verify no route changes or handler rewires.
- Confirm payment/report flows untouched by Batch 5 edits.
