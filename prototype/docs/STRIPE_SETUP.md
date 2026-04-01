# Stripe Setup Checklist

Follow these steps to enable Stripe checkout and webhooks.

## 1. Get API keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **API keys**.
2. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`).
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`).

In the project root, open **`.env.local`** and set:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

## 2. Create product and prices

1. In Stripe Dashboard go to **Product catalog** → **Add product**.
2. Name it (e.g. **Homebuyer Compass Subscription**).
3. Add a **Price**:
   - **Monthly**: Billing period = Monthly, set amount → Save.
   - Copy the **Price ID** (e.g. `price_xxxxx`) into `.env.local` as `STRIPE_PRICE_ID_MONTHLY`.
4. Add another **Price** for the same product:
   - **Yearly**: Billing period = Yearly, set amount → Save.
   - Copy the **Price ID** into `.env.local` as `STRIPE_PRICE_ID_YEARLY`.

Your `.env.local` should have:

```env
STRIPE_PRICE_ID_MONTHLY=price_xxxxxxxxxxxx
STRIPE_PRICE_ID_YEARLY=price_xxxxxxxxxxxx
```

## 3. Webhook secret (local testing)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli#install).
2. Log in: `stripe login`.
3. Run:
   ```bash
   stripe listen --forward-to localhost:3002/api/stripe/webhook
   ```
4. Copy the **webhook signing secret** (starts with `whsec_`) from the CLI output.
5. In `.env.local` set:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
   ```
6. Keep the CLI running while testing webhooks locally.

## 4. Restart the dev server

So that `.env.local` is loaded:

```bash
# Stop the current server (Ctrl+C), then:
npm run dev
```

## 5. Test the flow

1. Open **Payment** (e.g. `/payment?tier=premium&cycle=monthly`).
2. Choose **Monthly** billing.
3. Click **Stripe — Monthly** or **Stripe — Yearly**.
4. You should be redirected to Stripe Checkout; after payment you return to `/payment?success=stripe`.

---

**Production:** Create a webhook endpoint in Stripe Dashboard pointing to `https://yourdomain.com/api/stripe/webhook` and use that endpoint’s signing secret for `STRIPE_WEBHOOK_SECRET` in production env.
