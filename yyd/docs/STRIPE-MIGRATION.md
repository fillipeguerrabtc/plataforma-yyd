# 💳 Stripe Integration Guide - Test to Live Migration

**Complete guide for migrating Stripe from sandbox (test) to production (live)**

---

## Current Status

✅ **STRIPE IS CONFIGURED IN TEST MODE** (Sandbox)

**Environment**: Test/Development  
**Keys**: `sk_test_...` and `pk_test_...`  
**Status**: Ready for testing - NO real charges  

---

## How Stripe Test/Live Works

### Key Concept
Stripe test and live modes run **simultaneously**. The mode is determined by which API key you use:

| Mode | Secret Key Prefix | Publishable Key Prefix | Real Charges? |
|------|------------------|----------------------|--------------|
| **Test** | `sk_test_` | `pk_test_` | ❌ No (sandbox) |
| **Live** | `sk_live_` | `pk_live_` | ✅ YES (real money) |

**Important**: Test and live data are **completely separate**. Customers, payments, and bookings in test mode won't exist in live mode.

---

## Current Configuration

### Environment Variables (Test Mode)

```env
# Stripe Test Keys (CURRENT)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe CLI or Dashboard
```

### Where Keys Are Used

**Frontend (Client)**:
- `yyd/apps/client/lib/stripe.ts` - Loads publishable key
- Used in checkout forms

**Backend (Server-side)**:
- `yyd/apps/client/app/api/checkout/route.ts` - Creates checkout sessions
- `yyd/apps/client/app/api/webhooks/stripe/route.ts` - Processes payments

---

## Testing in Sandbox Mode

### Test Credit Cards

Use these **fake** card numbers for testing (they won't charge real money):

| Card Number | CVC | Exp | Result |
|-------------|-----|-----|--------|
| `4242 4242 4242 4242` | Any 3 digits | Any future date | ✅ Success |
| `4000 0000 0000 9995` | Any 3 digits | Any future date | ❌ Declined |
| `4000 0025 0000 3155` | Any 3 digits | Any future date | ⚠️ Requires authentication (3D Secure) |

**More test cards**: https://stripe.com/docs/testing#cards

### How to Test Booking Flow

1. Go to Client app: `http://localhost:5000`
2. Select a tour
3. Choose date, number of people
4. Enter customer info
5. Click "Pay with Stripe"
6. Use test card: `4242 4242 4242 4242`
7. Complete payment
8. Webhook triggers → Booking created in database

---

## Migration to Live Mode (Production)

### Prerequisites

Before switching to live mode, you must:

1. ✅ **Complete Stripe account activation**
   - Business details
   - Bank account information
   - Tax information
   - Identity verification

2. ✅ **Test thoroughly in sandbox**
   - Complete at least 10 test bookings
   - Test all payment scenarios (success, decline, cancellation)
   - Verify webhooks work correctly
   - Test refunds

3. ✅ **Configure production webhook**
   - Add webhook endpoint in Stripe Dashboard → Developers → Webhooks
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

4. ✅ **Prepare customer support**
   - Document refund process
   - Create support email templates
   - Train staff on payment issues

---

## Migration Steps

### Step 1: Get Live API Keys

1. Log into **Stripe Dashboard**
2. Switch to **Live mode** (toggle in top-right)
3. Go to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_live_`)
5. **Reveal** and copy your **Secret key** (starts with `sk_live_`)
   - ⚠️ **CRITICAL**: This shows only ONCE - save it securely immediately!

### Step 2: Configure Live Webhook

1. In Stripe Dashboard (live mode): **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

### Step 3: Update Environment Variables

**⚠️ CRITICAL**: Do this in **production environment ONLY**

```env
# Stripe Live Keys (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX  # From live webhook
```

### Step 4: Deploy to Production

1. Update secrets in **production environment**
2. Deploy code to production server
3. Restart all services

### Step 5: Test Live Mode

**⚠️ WARNING**: Live mode charges REAL money!

1. Make a **small test booking** with a real credit card
2. Charge yourself €1-5 to verify
3. Check Stripe Dashboard (live mode) - payment should appear
4. Check database - booking should be created
5. **Immediately refund** the test payment

### Step 6: Go Live

1. Remove test payment
2. Announce to customers
3. Monitor first real bookings closely
4. Watch webhook logs for errors

---

## Code Changes Needed

### NONE! 🎉

The code is **already written** to work with both test and live modes. The only difference is which API keys you use in environment variables.

**No code changes required** - just update `.env` secrets.

---

## Security Checklist

Before going live, verify:

- [ ] Live API keys stored in **secure** environment variables (not in code)
- [ ] Live secret key **never exposed** to frontend
- [ ] Webhook signature verification enabled
- [ ] HTTPS enabled on production domain
- [ ] Server-side price validation active (prevents client tampering)
- [ ] Stripe keys **not** committed to Git
- [ ] Error logging configured (but doesn't log sensitive data)

---

## Monitoring & Troubleshooting

### Stripe Dashboard (Live Mode)

Monitor:
- **Payments** - All successful charges
- **Failed payments** - Declined cards, errors
- **Customers** - Customer records
- **Webhooks** - Webhook delivery status

### Common Issues

**Webhook not firing**:
- Check endpoint URL is correct (https, no typos)
- Verify signing secret matches
- Check webhook delivery logs in Stripe Dashboard
- Ensure production server is reachable

**Payment succeeds but booking not created**:
- Check webhook logs in Stripe Dashboard
- Check server logs for errors
- Verify database connection
- Check metadata is included in checkout session

**"Invalid API key" error**:
- Verify you're using `sk_live_` key in production
- Check key is not expired/revoked
- Ensure no whitespace in environment variable

---

## Refunds & Cancellations

### Refund Process (Manual)

1. Go to Stripe Dashboard → **Payments**
2. Find payment
3. Click **Refund**
4. Enter amount (full or partial)
5. Confirm

**Automatic refunds** (TODO): Build refund API in future.

### Cancellation Policy

Current implementation:
- No automatic cancellations yet
- Manual process: refund in Stripe + update booking status in database

**Future**: Build cancellation API with automated refunds.

---

## Rollback to Test Mode

If you need to revert to test mode:

1. Update environment variables back to test keys
2. Redeploy
3. All new payments will use test mode
4. **Note**: Existing live payments remain in Stripe live mode

---

## Cost & Fees

### Stripe Pricing (Europe)

- **Per transaction**: 1.4% + €0.25
- **No monthly fees**
- **No setup fees**
- **No hidden costs**

**Example**:
- Tour price: €500
- Stripe fee: (€500 × 1.4%) + €0.25 = €7.25
- You receive: €492.75

---

## Compliance & Legal

### PCI Compliance

✅ **You are PCI compliant** automatically because:
- Stripe hosts checkout page
- No card data touches your servers
- Stripe handles all sensitive data

### GDPR

- Customer email/name stored in your database
- Document in privacy policy
- Allow customers to request data deletion

---

## Support Contacts

### Stripe Support
- **Dashboard**: https://dashboard.stripe.com/support
- **Email**: support@stripe.com
- **Phone**: Check dashboard for regional numbers

### YYD Technical Support
- **Developer**: Check team documentation
- **Business**: Daniel Ponce

---

## Quick Reference

### Test vs Live Comparison

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| Real charges | ❌ No | ✅ YES |
| Test cards | ✅ Yes | ❌ No (real cards only) |
| Separate data | ✅ Yes | ✅ Yes |
| Webhook testing | ✅ Stripe CLI | ✅ Production endpoint |
| Refunds | ✅ Instant | ⏱️ 5-10 days |

---

**Last Updated**: 2025-10-20  
**Status**: Test mode active, ready for migration  
**Related**: [API-REFERENCE.md](./API-REFERENCE.md), [DEPLOYMENT.md](./DEPLOYMENT.md)
