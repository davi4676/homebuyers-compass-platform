# Stripe setup (checkout + webhooks)

Checkout is implemented at `POST /api/stripe/checkout`; return handling uses `POST /api/stripe/verify-session`. **Until `STRIPE_SECRET_KEY` and the Price IDs below are set, the API returns HTTP 503** and no one can complete payment.

**Paid tiers in code:** Momentum, Navigator, Navigator+ (`lib/stripe.ts`). **Foundations** is free and has no Stripe prices.

**Price count:** Map each **paid tier** to Stripe **recurring** prices (monthly + yearly). Optionally add **one-time** prices per tier for the `/payment` one-time path. That is **6 recurring prices minimum** (3 tiers × 2 cycles), or **9 prices** if you enable one-time for all three tiers.

> Some planning docs refer to “8 SKUs (4 tiers × 2 cycles).” In this codebase, **Foundations does not use Stripe**; use **three products** (or one product with multiple prices) and **six recurring Price IDs** as the minimum shippable set.

## 1. API keys

1. Open [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys) (use **Live** keys in production).
2. In **`.env.local`** (or your host’s env):

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

Restart the app after changing env vars.

## 2. Create products and prices in Stripe

Use [Products](https://dashboard.stripe.com/test/products). For **each paid tier**, create prices whose **amounts** match `TIER_AMOUNTS` in `lib/stripe.ts` (cents, USD):

| Tier         | Monthly | Yearly | One-time |
|-------------|---------|--------|----------|
| Momentum    | $29.00  | $278.00 | $119.00 |
| Navigator   | $59.00  | $566.00 | $229.00 |
| Navigator+  | $149.00 | $1,430.00 | $549.00 |

- **Subscriptions:** Recurring prices — **Monthly** and **Yearly** (yearly should reflect your “~20% off 12× monthly” positioning; amounts above match the app’s `TIER_AMOUNTS`).
- **One-time:** One-time prices — used when the user opens `/payment` with `cycle=one-time`.

Copy each price’s **Price ID** (`price_...`).

## 3. Environment variables for Price IDs (canonical names)

Set these in `.env.local` (production: set in the hosting dashboard).

**Momentum**

```env
STRIPE_PRICE_MOMENTUM_MONTHLY=price_...
STRIPE_PRICE_MOMENTUM_YEARLY=price_...
STRIPE_PRICE_MOMENTUM_ONETIME=price_...
```

**Navigator**

```env
STRIPE_PRICE_NAVIGATOR_MONTHLY=price_...
STRIPE_PRICE_NAVIGATOR_YEARLY=price_...
STRIPE_PRICE_NAVIGATOR_ONETIME=price_...
```

**Navigator+** (env name uses an underscore; tier id is `navigator_plus`)

```env
STRIPE_PRICE_NAVIGATOR_PLUS_MONTHLY=price_...
STRIPE_PRICE_NAVIGATOR_PLUS_YEARLY=price_...
STRIPE_PRICE_NAVIGATOR_PLUS_ONETIME=price_...
```

### Legacy aliases (optional)

`lib/stripe.ts` also reads older names so a minimal Momentum-only setup can work:

- `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_YEARLY` → Momentum
- `STRIPE_PRICE_PREMIUM_*` → Momentum
- `STRIPE_PRICE_PRO_*` → Navigator
- `STRIPE_PRICE_PROPLUS_*` → Navigator+

Prefer the **canonical** names above for clarity.

## 4. Webhook signing secret

**Local:** Install [Stripe CLI](https://stripe.com/docs/stripe-cli#install), then:

```bash
stripe listen --forward-to localhost:3002/api/stripe/webhook
```

Paste the printed `whsec_...` value:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

**Production:** In Stripe Dashboard → **Developers** → **Webhooks**, add `https://your-domain.com/api/stripe/webhook`, select the events your handler needs, and set `STRIPE_WEBHOOK_SECRET` to that endpoint’s **signing secret**.

## 5. End-to-end test (before paid acquisition)

1. Restart the dev server with a complete `.env.local`.
2. Open `/payment?tier=momentum&cycle=monthly` (or `navigator`, `navigator_plus`).
3. Click **Stripe — Monthly** / **Annual** / **One-time** as appropriate.
4. Complete Checkout with [test card](https://docs.stripe.com/testing) `4242 4242 4242 4242`.
5. Confirm redirect to `/payment?success=stripe&...` and successful verification.

If anything still fails, check the browser Network tab for `/api/stripe/checkout` — a **503** usually means `STRIPE_SECRET_KEY` is missing; **400** with a message about Price IDs means that tier/cycle’s env var is unset.
