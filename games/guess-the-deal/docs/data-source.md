# Real data source — audit findings

Findings from reading the local repo checkouts only. Nothing here was
executed, and no live service or prod data was touched. This is groundwork
for Phase 1 of the "link to real data" plan — it tells us *where* the data
lives and *what's missing* before we ask anyone for access.

## Which service owns closed-auction results

**`acv-api`** (Django, `apps/auctions`) is the only one of the four repos
checked that exposes closed/sold auction data with both price and mileage
over REST.

- **`auction-house`** (Java/Spring) owns the live-auction domain (bids,
  `winning_bid`, `PhysicalAuctionSaleCommandHandler`) but has no
  `@RestController`/`@GetMapping` for closed/sold results — it's
  event/command-driven internally and consumed by `acv-api`, not a
  candidate integration point on its own.
- **`listing-service-2`** has mileage/odometer on its listing model but no
  sale-price/closed-auction concept — pre-auction listing data, not sold
  results.
- **`auction-legacy-worker`** has one controller
  (`SavedAuctionLaunchLockController`), unrelated to this.

## Candidate endpoints (`acv-api`, `apps/auctions/urls.py`)

- `GET /auctions/ended/buying`
- `GET /auctions/ended/selling`
- `GET /auctions/ended/buying/<auction_id>`
- `GET /auctions/ended/selling/<auction_id>`
- `GET /auction/<auction_id>` (works for closed auctions too)
- `GET /auction/<auction_id>/post_auction_info`

Response shape (`apps/auctions/result_objects/auction_lists.py`,
`AuctionListElement.serialize` and the ended-list serializer, roughly
lines 291–420):

```
id, vin, make, model, year, trim, odometer,
winning_bid (auction.ended_high_bid_id), bid_amount,
high_bid { id, amount, user_id, dealer { id, name } },
buyer_info { dealer_id, user_id },
seller / seller_info { dealer_id, user_id, name },
dealer_id, start_time, end_time (unix timestamps),
status, sold, signature, lane_id, city / address_id,
+ vehicle attrs (color, transmission, drivetrain, condition ratings)
```

**Fields we actually want:** `bid_amount` / `high_bid.amount` (sale
price), `odometer` (mileage), plus the harmless vehicle attrs (year, make,
model, trim, color, condition ratings).

**Fields that must be stripped before anything reaches the game DB:**
`vin`, `dealer_id` / `dealer.name` (both seller and buyer side),
`buyer_info.user_id` / `high_bid.user_id`, exact `start_time`/`end_time`,
`address_id`/`city`, `signature`. This lines up with — and confirms — the
masking rules already assumed in `PLAN.md`.

## Auth

Not OAuth2, not a simple API key. `acv-api` auction endpoints use:

- `@request_authenticated` — checks `request.user`, populated by
  `AcvApiMiddleware` from a `user_id` + `session_token` pair (query param,
  body, or Authorization header) resolved against a `UserSession` table.
  This is a *user* session, not something a batch ingest job should use.
- `@request_internal_app_auth` — validates an `ACVAuth` Authorization
  header, for service-to-service calls. This is closer to what an ingest
  job would use, but it's an all-or-nothing internal-service credential,
  not scoped to "read-only, safe fields only."
- (There's also `apps/oauth/middleware.py::OAuth2TokenMiddleware`, used
  elsewhere in the app, but not on these auction endpoints.)

**There is no existing read-only, field-limited scope to reuse.** The
closest hits are Django-admin `ReadOnlyAdminForm`/`ViewOnlyAdminForm`
(internal admin UI, not an API scope) and
`DealershipHandler.check_read_only_permission_for_dealer_ids` (gates
*write* access on a dealer's own saved auctions — not a general read
scope). Whoever owns `apps/auctions` / the API platform would need to
either provision a new internal-service credential for this use case, or
build a dedicated endpoint that returns only the safe subset of fields.

## Recommendation

Given the sensitive fields sitting right next to the ones we want in the
same response, **ask the owning team for a small dedicated endpoint** (or
a response-shape opt-in) that returns only `{ price, odometer, year, make,
model, trim, color, conditionNotes }` — rather than pulling the full ended-
auction payload and trusting our own ingest job to strip VIN/dealer
identity correctly every time. It's a bigger ask up front, but it moves
the "don't leak this" responsibility to the system that already owns the
data, instead of us.

## Open questions for the owning team (Phase 0)

Status per Vikram (product owner sponsoring the hackathon entry), checked
2026-09-17: not needed for the hackathon (mock data only), but flagged as
a "quick check" before any production use. Bring these into that
conversation:

1. Is it acceptable to use `apps/auctions` closed-auction data as the
   source for a dealer-facing game at all, even with the sensitive fields
   stripped? (Vikram's initial read: probably fine, similar figures
   already appear in the market report — but wants it verified, not
   assumed.)
2. Would they prefer to build/expose a narrow, safe-fields-only endpoint
   for this, vs. granting broader `ACVAuth` access to the full response?
3. Does the visible field (price or mileage) need to be bucketed/rounded,
   or is an exact value acceptable for this use case?
4. VIN is confirmed out of scope regardless of the above answers.
