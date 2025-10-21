# Stripe Webhook Setup Guide

## Overview
Stripe webhooks are required to automatically confirm bookings when payments succeed. This guide explains the setup for both **development** and **production** environments.

---

## How It Works

1. **Customer pays** → Stripe processes payment
2. **Stripe sends webhook** → Your API receives `payment_intent.succeeded` event
3. **Webhook confirms booking** → Updates status from `pending` to `confirmed`
4. **Email sent** → Customer receives confirmation + voucher
5. **Calendar updated** → Tour slot marked as booked
6. **Stats updated** → Customer totalBookings and totalSpent incremented

---

## Development Setup

### Problem
Stripe webhooks require a **public HTTPS URL**, but in Replit development you're running on `localhost` or a development URL that Stripe can't reach reliably.

### Solution 1: Use Stripe CLI (Recommended)
Install and use the Stripe CLI to forward webhook events to your local development server:

```bash
# Install Stripe CLI
# On macOS: brew install stripe/stripe-brew/stripe
# On Linux: https://stripe.com/docs/stripe-cli#install

# Login to your Stripe account
stripe login

# Forward webhooks to your development server
stripe listen --forward-to https://your-replit-url.replit.dev/api/webhooks/stripe

# This will give you a webhook signing secret like: whsec_xxxxx
# Add it to your .env file as: STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Solution 2: Manual Testing Script
For quick testing without Stripe CLI, use the included test webhook script:

```bash
cd yyd/apps/client
npx tsx scripts/test-webhook.ts <bookingId> <paymentIntentId>
```

**Example:**
```bash
npx tsx scripts/test-webhook.ts cmh10e8ag000181odsf32hyqu pi_3SKlhWBkC2gtgckm1elmBEy5
```

This manually confirms a pending booking as if the Stripe webhook had fired.

**⚠️ IMPORTANT - Idempotency Protection:**
- The script is **safe to rerun** - it will detect already-confirmed bookings and skip processing
- This prevents **double-booking** and duplicate customer stats
- If you need to reprocess, first reset the booking status to `pending` in the database

**Finding Booking ID:**
1. Check the URL in the browser after payment: `/booking-confirmation?bookingId=xxx`
2. Or check the database: `SELECT id, bookingNumber, status FROM bookings ORDER BY createdAt DESC LIMIT 5;`

---

## Production Setup

### Step 1: Add Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   ```
   https://your-production-domain.com/api/webhooks/stripe
   ```
4. Select these events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `checkout.session.completed` (if using Checkout Sessions)

### Step 2: Get Webhook Signing Secret

1. After creating the webhook, Stripe shows a **Signing secret** (starts with `whsec_`)
2. Copy this secret
3. Add it to your **Production Environment Variables** in Replit:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_production_secret_here
   ```

### Step 3: Test the Webhook

1. Make a test payment in production
2. Check Stripe Dashboard → Webhooks → Recent deliveries
3. Verify the webhook was delivered successfully (200 response)
4. Check your database to confirm booking status changed to `confirmed`

---

## Webhook Security

The webhook endpoint (`/api/webhooks/stripe/route.ts`) verifies requests using Stripe's signature:

```typescript
const signature = headersList.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

**Never disable signature verification in production!**

---

## Troubleshooting

### Booking stays in "pending" status
- **Dev**: Webhook not forwarded. Use Stripe CLI or manual script.
- **Prod**: Check Stripe Dashboard → Webhooks → Recent deliveries for errors.

### Email not sent
- Check logs for "Repl util authentication required" error
- Verify SMTP credentials are configured (or use Replit Mail in production)

### Payment shows €0.00 in backoffice
- Booking is still `pending` (not `confirmed`)
- Run the manual webhook script or wait for real webhook

### Webhook fails with signature error
- Verify `STRIPE_WEBHOOK_SECRET` matches the one in Stripe Dashboard
- Make sure you're using the correct secret for dev/prod environments

---

## Monitoring Webhooks

### Stripe Dashboard
View all webhook deliveries: [Stripe Webhooks Dashboard](https://dashboard.stripe.com/webhooks)

### Application Logs
Check workflow logs for webhook events:
- `✅ Booking confirmed for <customer>`
- `❌ Payment failed for booking <id>`
- `⚠️ No bookingId in payment metadata` (missing metadata)

---

## Important Notes

- **Idempotency**: Webhooks may be delivered multiple times. The code handles this with checks for existing payments.
- **Metadata Required**: PaymentIntents MUST include `bookingId` in metadata for webhooks to work.
- **Auto-refresh**: The confirmation page now auto-refreshes every 3 seconds while waiting for webhook.
- **15-minute grace period**: Unauthenticated users can access their booking for 15 minutes after creation.

---

## Need Help?

- **Stripe CLI Docs**: https://stripe.com/docs/stripe-cli
- **Webhook Testing**: https://stripe.com/docs/webhooks/test
- **Webhook Best Practices**: https://stripe.com/docs/webhooks/best-practices
