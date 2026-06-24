# NestQuest — Modern Advocate Design System

Generated from ui-ux-pro-max recommendations and implemented in `app/nq-editorial-theme.css`.

## Pattern
Hero-Centric + Feature-Rich + Funnel (quiz)

## Style
Glassmorphism + Motion-Driven + Soft UI Evolution

## Colors
| Role | Token | Value |
|------|-------|-------|
| Primary | `--nq-ed-accent` | `#0F766E` |
| Trust blue | `--nq-ed-trust-blue` | `#0369A1` |
| Gold CTA | `--nq-ed-gold` | `#D4AF37` |
| Background | `--nq-ed-bg` | `#FFFFFF` |
| Text | `--nq-ed-text` | `#134E4A` |

## Typography
- Display & body: Manrope (`--font-nq-body`)
- Numbers: Roboto Mono stack (`--nq-ed-mono`)

## Key components
- `.nq-glass` — frosted cards and panels
- `.nq-glass-nav` — landing top navigation
- `.nq-bento-grid` / `.nq-bento-card` — scannable feature blocks
- `.nq-modern-hero-visual` — property imagery with Ken Burns (respects reduced motion)
- `.nq-savings-glass` — live savings estimator overlay
- `.nq-journey-bento` — Today tab mission control layout
- `.nq-quiz-steps` — 3-step funnel progress

## Anti-patterns avoided
- No AI purple/pink gradients
- No hover-only critical actions
- `prefers-reduced-motion` disables hero Ken Burns
- Illustrative savings labeled as estimates only
