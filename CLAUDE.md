# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture

This is a Next.js App Router application for boosting M-Pesa Fuliza credit limits in Kenya, integrated with the PayHero Africa API.

### Payment Flow

1. User selects a Fuliza limit option (5K–70K KSH) on the homepage
2. Modal opens prompting for ID number (8 digits) and phone number (Kenyan format)
3. `initiateFulizaPayment` server action (`app/actions/fuliza-payment.js`) formats the phone to `254XXXXXXXXX` and calls the PayHero V2 API
4. PayHero triggers an STK push to the user's phone
5. PayHero posts the payment result to `app/api/payment-callback/route.js` (always returns 200 to prevent retries)

### Key Files

- `app/page.tsx` — Main client component; all UI, modal, validation, and fake live-notifications via `setInterval`
- `app/actions/fuliza-payment.js` — Active server action using PayHero V2 API
- `app/api/payment-callback/route.js` — Webhook receiver; currently logs only (TODOs for DB persistence and SMS)
- `app/actions/mpesa.js` — Legacy V1 code, unused

### Environment Variables

Required in `.env.local`:

```
PAYHERO_BASE_URL
PAYHERO_BASIC_AUTH_TOKEN   # Base64-encoded "username:password"
PAYHERO_ACCOUNT_ID
PAYHERO_CHANNEL_ID
PAYHERO_USERNAME
PAYHERO_PASSWORD
PAYHERO_PROVIDER
PAYHERO_NETWORK_CODE
```

### Styling

Tailwind CSS v4. Brand greens: `#19AC56` (primary), `#168A2E` (dark), `#EBFAF1` (light background). Mobile-first with a 2-column limit grid (3 columns on desktop).
