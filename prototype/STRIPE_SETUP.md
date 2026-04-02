# Stripe setup

Follow these steps so checkout and webhooks work.

## 1. Add keys to `.env.local`

1. Open [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys).
2. Copy **Secret key** (starts with `sk_test_`) into `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
   ```
3. Copy **Publishable key** (starts with `pk_test_`) into `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
   ```

## 2. Create product and prices

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/test/products).
2. Click **Add product**.
   - Name: e.g. **NestQuest Subscription**
   - Add a **Price**: recurring, **Monthly**, set amount (e.g. $29).
   - Add another **Price**: recurring, **Yearly**, set amount (e.g. $290).
3. Open each price and copy its **Price ID** (e.g. `price_1ABC...`).
4. In `.env.local`:
   ```env
   STRIPE_PRICE_ID_MONTHLY=price_xxxxxxxxxxxx
   STRIPE_PRICE_ID_YEARLY=price_xxxxxxxxxxxx
   ```

## 3. Webhook secret (local testing)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli#install).
2. Run:
   ```bash
   stripe listen --forward-to localhost:3002/api/stripe/webhook
   ```
3. Copy the printed **webhook signing secret** (`whsec_...`) into `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
   ```
4. Leave `stripe listen` running while testing webhooks.

## 4. Restart dev server

Restart so env vars are loaded:

```bash
npm run dev
```

## 5. Test checkout

1. Go to **/payment**.
2. Choose a paid tier and **Monthly** billing.
3. Click **Stripe — Monthly** or **Stripe — Yearly**.
4. You should be redirected to Stripe Checkout; after payment you return to `/payment?success=stripe`.
