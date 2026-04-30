# Grow2Stellar

Grow2Stellar is a Web3-powered growth and ambassador reward platform using Next.js, Express, Stellar, and Soroban.

## Current Step

We are on Step 2.3: referral links and click tracking.

Implemented now:

- Backend SEP-10 style wallet challenge flow
- JWT session after wallet proof
- File-backed MVP user store
- Frontend Freighter connect and sign flow
- Campaign creation
- Ambassador applications
- Organizer application review
- Unique referral links for approved ambassadors
- Off-chain referral click tracking
- Soroban included in the MVP architecture for the later reward phase

## Run Locally

Install dependencies:

```bash
npm install
```

Create backend environment:

```bash
cp backend/.env.example backend/.env
```

Fill `STELLAR_WEB_AUTH_SECRET` with a Stellar testnet secret key. For local testing, generate one with the Stellar SDK or Laboratory.

Start the backend:

```bash
npm run dev:backend
```

Start the frontend:

```bash
npm run dev:frontend
```

Then open:

```txt
http://localhost:3000
```

## Verification

Run the backend smoke suite:

```bash
npm run smoke:backend
```

The smoke suite covers wallet authentication, campaign/application/approval, referral code generation, and click tracking.
