# Dealer Price/Mileage Guess Game — Hackathon Plan

A dealer-facing game on the ACV site: show a recently-closed auction vehicle,
hide one field (sale price or mileage), let the dealer guess, score by %
delta from the real value, show a leaderboard.

**Hackathon scope: mock/sample data only** (see `data/seed-rounds.json`).
No live integration, no real dealer data, for the hackathon build.

## Permission status (checked 2026-09-17)

Confirmed with Vikram (product owner sponsoring this hackathon entry):

- **Hackathon demo**: no special permission needed — we're running on
  mock data, so this is moot for now.
- **If it goes to production**: still needs a quick check before pulling
  real closed-auction data, since sale price/mileage from closed auctions
  are **Class 3 (Confidential — "auction bids")** under ACV's data
  classification policy. Vikram's read is it's likely not a big lift —
  similar figures already surface in the market report — but wants it
  verified rather than assumed, and confirmed VINs specifically stay out
  of scope regardless.
- The pitch for that follow-up conversation: if given sign-off, this
  becomes a dealer engagement surface, not just a hackathon demo.
- See `docs/data-source.md` for the concrete technical findings (which
  endpoint, which fields, what auth) to bring into that "quick check"
  conversation once it happens.

## Data flow

```
 ┌─────────────────────────┐
 │ acv-api / auction-house  │  existing service(s) of record for
 │ (closed auctions)        │  closed-auction results
 └────────────┬─────────────┘
              │ read-only, scoped credential (auctions:read)
              ▼
 ┌─────────────────────────┐
 │ ingest / snapshot job    │  server/src/ingest/snapshotJob.ts
 │ - pulls last N hrs of    │  runs on a schedule or on-demand via
 │   closed auctions        │  admin endpoint
 │ - strips VIN, dealer id, │
 │   buyer id, exact time   │
 │ - buckets the masked     │
 │   field per round type   │
 └────────────┬─────────────┘
              │ writes anonymized rounds only
              ▼
 ┌─────────────────────────┐
 │ game DB (Postgres)       │  separate from prod DB
 │ - rounds (masked field   │
 │   hidden until reveal)   │
 │ - guesses                │
 │ - leaderboard (derived)  │
 └────────────┬─────────────┘
              │ REST
              ▼
 ┌─────────────────────────┐
 │ game-service (server/)   │  Node/Express, matches acv-web-vuejs's
 │ auth: dealer SSO session │  existing frontend stack
 └────────────┬─────────────┘
              │ REST (auth'd)
              ▼
 ┌─────────────────────────┐
 │ web frontend (web/)      │  Vue, embedded in / linked from
 │ Play round → submit      │  the dealer-facing ACV site
 │ guess → see score/reveal │
 │ → leaderboard            │
 └───────────────────────────┘
```

Key rule: unmasked/raw data never leaves the ingest job. Everything written
to the game DB has already had the guessed field bucketed and identifying
fields stripped, so there's nothing sensitive to leak downstream of that
step.

## Repo structure

```
dealer-price-guess-game/
├── PLAN.md
├── README.md
├── server/
│   ├── package.json
│   └── src/
│       ├── routes/
│       │   ├── rounds.ts        # GET current round, admin refresh
│       │   ├── guesses.ts       # POST a guess
│       │   ├── leaderboard.ts   # GET aggregate scores
│       │   └── admin.ts         # admin-only: ingest trigger, QA view
│       ├── ingest/
│       │   ├── snapshotJob.ts   # pulls closed auctions, anonymizes
│       │   └── maskingRules.ts  # bucketing / field-stripping logic
│       ├── db/
│       │   ├── migrations/
│       │   └── models/          # Round, Guess
│       └── auth/
│           └── sso.ts           # verifies existing ACV dealer session
├── web/
│   ├── package.json
│   └── src/
│       ├── views/
│       │   ├── PlayRound.vue
│       │   └── Leaderboard.vue
│       ├── components/
│       └── store/
├── data/
│   └── seed-rounds.json         # static fallback dataset for offline demo
└── docs/
    ├── data-flow.md
    └── permissions.md
```

## Endpoints

Game-service API (all require an authenticated dealer session unless noted):

| Method | Path                     | Auth            | Purpose |
|--------|--------------------------|-----------------|---------|
| GET    | `/api/rounds/current`    | dealer session  | Returns the active round with the target field masked |
| POST   | `/api/rounds/:id/guess`  | dealer session  | Submit one guess; rate-limited to 1 per dealer per round |
| GET    | `/api/leaderboard`       | dealer session  | Top-N aggregate scores |
| POST   | `/api/admin/rounds/refresh` | admin/ops role | Manually triggers the ingest job |
| GET    | `/api/admin/rounds`      | admin/ops role  | Unmasked round data, for QA only |

Upstream (read-only, called only by the ingest job, never by the frontend).
**Update after auditing the real repos** — see `docs/data-source.md` for
the full findings; summary:

| Method | Path                                   | Credential |
|--------|-----------------------------------------|------------|
| GET    | `acv-api` `/auctions/ended/selling` and `/auctions/ended/buying` (`apps/auctions`) | none exists yet — see below |

`acv-api` is the only one of the four candidate repos with a REST surface
for closed/sold auctions with price + mileage. `auction-house` owns the
domain logic (bids, winning_bid) but has no closed-auction REST endpoint —
it's event/command-driven and consumed internally by `acv-api`.
`listing-service-2` only has pre-auction listing data, no sale price.

## Permissions model

- **Dealers**: reuse existing dealer-portal SSO session. Scope = play +
  view leaderboard. No access to unmasked rounds or other dealers' guess
  history beyond the leaderboard's public score.
- **Admin/ops (hackathon team)**: elevated role to trigger ingest and view
  unmasked snapshots for QA before a round goes live.
- **Service-to-service (ingest job → acv-api)**: there is **no existing
  read-only, field-limited scope to reuse** — `acv-api`'s auction endpoints
  use a proprietary session scheme (`@request_authenticated`, backed by a
  `UserSession` table) or an internal service header (`@request_internal_app_auth`,
  `ACVAuth` header) for service-to-service calls; neither is scoped down to
  "read-only, safe-fields-only." A new credential/role needs to be
  requested from whoever owns `apps/auctions` / the API platform — this is
  a real ask, not just a config change. See `docs/data-source.md`.
- **Game DB**: no prod credentials stored here; it only ever holds
  already-anonymized rounds and guesses.

## Suggested build order for the hackathon

1. `data/seed-rounds.json` — hand-write 10–15 anonymized rounds so the
   frontend/game loop can be built and demoed without needing the real
   ingest job wired up yet.
2. `server/src/routes/rounds.ts` + `guesses.ts` + `leaderboard.ts` against
   the seed file.
3. `web/` — PlayRound + Leaderboard views hitting the above.
4. `server/src/ingest/snapshotJob.ts` — wire to the real closed-auctions
   source last, once the game loop works, and only after confirming which
   endpoint/credential to use with the owning team.
