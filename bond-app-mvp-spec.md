# BondProof (working name) — MVP Build Specification

**One-liner:** Evidence vault + dispute workflow that helps NSW renters win bond deduction disputes.
**Wedge:** Guided entry condition documentation at move-in (free) → paid dispute toolkit at move-out.
**Jurisdiction:** NSW only for MVP. Architecture must keep state rules in a config layer for later expansion (VIC/QLD).

---

## 1. Core user journeys

### Journey A — Move-in (free tier, acquisition)
1. Sign up (email or Apple/Google), create a Tenancy: address, lease start/end, agent/landlord name, bond amount, RBO bond number (optional).
2. Guided entry capture: room-by-room checklist (see §4). Each item prompts photo(s) + optional note + condition rating (Good / Fair / Damaged).
3. Photos stored with EXIF timestamp + GPS, plus server-side received-at timestamp and SHA-256 hash recorded at upload (tamper-evidence).
4. Output: polished PDF entry condition report the user can attach to the agent's official condition report response (NSW gives tenants 7 days to return it).
5. Mid-tenancy: log incidents (leak, repair, damage that isn't theirs) with photos — builds the evidence file.

### Journey B — Move-out (paid, revenue)
1. User triggers "Moving out" → guided exit capture mirroring entry checklist.
2. Side-by-side entry vs exit comparison per room/item; app flags likely claim targets (carpet, walls, oven, garden).
3. Pre-handover cleaning checklist derived from common NCAT deduction categories.
4. Exit report PDF generated.

### Journey C — Dispute (paid, the money moment)
1. User enters what the agent/landlord claimed (amount + category per line item).
2. App generates:
   - Response letter to agent disputing specific line items, citing evidence (photo refs) and fair wear and tear principles.
   - Evidence pack PDF: entry photo vs exit photo per disputed item, timestamps, notes, chronology.
   - Pre-filled NCAT application (Form: Tenancy — rental bond dispute) with user details, ready to lodge.
3. Deadline tracker (see §5) with push/email notifications.

---

## 2. Feature scope

### In MVP
- Tenancy setup + one active tenancy per free account
- Guided entry/exit photo capture with checklist
- Photo vault: original file, EXIF preserved, SHA-256 hash, server timestamp
- Entry/exit side-by-side comparison view
- PDF generation: entry report, exit report, evidence pack
- Dispute response letter generator (LLM, template-constrained)
- NCAT application pre-fill (PDF form fill)
- Deadline engine + notifications (email first, push later)
- Stripe checkout for the Dispute Kit

### Explicitly NOT in MVP
- Landlord/agent side accounts
- Repair request escalation module
- Scam/listing checker (later front-door feature)
- Lease-break calculator (later feature)
- Multi-state rules
- Native apps (mobile-first web / PWA only; camera via browser is fine)

---

## 3. Pricing

- **Free:** entry capture, vault, entry report PDF. (This is marketing + data lock-in.)
- **Dispute Kit — $49 one-off:** exit comparison, evidence pack, response letter, NCAT pre-fill, deadline tracking. Anchor against average NSW bond (~$2,000–3,000 at stake).
- **Optional later:** $69 "full move" bundle bought at move-in (entry + exit + dispute cover).

No subscription in MVP — renters won't subscribe; the event-based purchase matches the life event.

---

## 4. Entry/exit checklist (NSW)

Room-by-room, seeded from NSW standard condition report categories + common NCAT deduction patterns. Structure as data (JSON), not code.

- **Every room:** walls, ceiling, floor/carpet, windows/screens/tracks, blinds/curtains, doors, light fittings, power points, smoke alarm presence.
- **Kitchen:** oven interior, stovetop, rangehood filter, inside cupboards, sink/taps, dishwasher, benchtops.
- **Bathroom:** grout/sealant condition, shower screen, drains, exhaust fan, toilet, vanity.
- **Bedrooms:** wardrobe interiors/tracks, carpet under window (sun fade baseline).
- **Laundry:** taps, tub, dryer if included.
- **Exterior (if applicable):** garden/lawn state, balcony, garage, letterbox, bins present.
- **High-claim flags (prompt extra photos):** carpet edges/stains, wall marks/hooks, oven, blinds, grout, garden.

Each checklist item: `id, room, label, guidance_text, high_claim_flag, min_photos`.

## 5. NSW rules engine (config, not hardcoded)

Encode as versioned JSON with citations to Residential Tenancies Act 2010 (NSW) / Fair Trading guidance. Verify all values against current NSW Fair Trading material at build time — do not trust these from memory:

- Tenant window to return signed condition report after receiving it (7 days — verify)
- Bond claim flow via Rental Bonds Online: notice period when other party claims, window to dispute before payout (14 days — verify)
- NCAT application window after bond payout to other party (verify current rule)
- Fair wear and tear vs damage definitions (for letter generation guidance)
- NCAT application fee (verify current amount)

Every generated document footer: "This is document preparation assistance, not legal advice."

---

## 6. Data model (Postgres)

```
users(id, email, name, created_at)
tenancies(id, user_id, address, state='NSW', lease_start, lease_end,
          agent_name, agent_email, bond_amount_cents, rbo_number,
          status: active|exiting|dispute|closed)
capture_sessions(id, tenancy_id, type: entry|exit|incident, started_at, completed_at)
evidence_items(id, session_id, checklist_item_id, condition_rating,
               note, created_at)
photos(id, evidence_item_id, storage_key, sha256, exif_taken_at,
       exif_gps_lat, exif_gps_lng, uploaded_at, bytes)
disputes(id, tenancy_id, opened_at, status)
claim_line_items(id, dispute_id, category, description, amount_cents,
                 disputed: bool, our_position_text)
deadlines(id, tenancy_id, kind, due_at, source_rule_id, notified_at)
documents(id, tenancy_id, type: entry_report|exit_report|evidence_pack|
          response_letter|ncat_form, storage_key, generated_at)
payments(id, user_id, tenancy_id, stripe_payment_intent, product, amount_cents)
checklist_items(id, state, room, label, guidance, high_claim_flag, min_photos)  -- seed data
rules(id, state, key, value_json, citation, version, effective_from)            -- rules engine
```

Storage: S3-compatible bucket for photos/PDFs. Never strip EXIF. Store original + web-optimised derivative.

---

## 7. Tech stack

- **Frontend:** Next.js (App Router), mobile-first, PWA manifest. Camera via `<input capture>` — no native app.
- **Backend:** Next.js API routes or a thin Node service; Postgres (Neon/Supabase); S3-compatible storage (Cloudflare R2 for cost).
- **Auth:** Supabase Auth or NextAuth (email magic link + OAuth).
- **PDF generation:** server-side (e.g. Puppeteer/Playwright HTML→PDF for reports; pdf-lib for NCAT form fill).
- **LLM:** Anthropic API for response-letter drafting — constrained to templates + user evidence; temperature low; never invent facts; cite only evidence items that exist.
- **Payments:** Stripe Checkout (one-off).
- **Notifications:** Resend/Postmark email; web push later.
- **Hosting:** Vercel + managed Postgres. Target infra cost < $50/month pre-revenue.

---

## 8. Build plan (6 weeks @ 5–10 hrs/week with Claude Code)

- **Week 1:** Repo scaffold, auth, tenancy CRUD, checklist seed data, photo upload pipeline with hash + EXIF extraction.
- **Week 2:** Guided entry capture UX (the make-or-break screen — must be fast one-handed phone use), vault views.
- **Week 3:** Entry report PDF. ← *Milestone: use it yourself for the Birriga move-in on 13 July. Everything before this date prioritises Journey A.*
- **Week 4:** Exit capture + side-by-side comparison, exit report.
- **Week 5:** Dispute flow — claim line items, response letter generation, evidence pack PDF, NCAT form pre-fill.
- **Week 6:** Deadline engine + emails, Stripe, polish, landing page.

## 9. Validation plan (run in parallel, weeks 1–3)

1. Use it on your own Birriga entry — every friction point is a spec change.
2. Manually help 3 people in Sydney rental FB groups / r/sydney prep a bond dispute. Learn the real claim patterns. Ask at the end: "would you have paid $49 for this?"
3. Landing page with email capture live by week 3; post genuinely useful bond-dispute guides (SEO: "bond claim dispute NSW", "fair wear and tear NSW", "NCAT bond application"). Content is the free acquisition channel.

**Kill criteria:** if after 10 manual dispute assists nobody says they'd pay, stop and reassess before week 5.

## 10. Risks / notes

- **Legal positioning:** document preparation + information, never legal advice. Keep generated letters factual and template-based. Add T&Cs + disclaimer before launch.
- **Privacy:** photos of homes are sensitive — encrypt at rest, clear retention policy, easy export/delete (also an Australian Privacy Act consideration).
- **Seasonality:** moves cluster (Dec–Feb peak in Sydney). Launch content early to catch it.
- **Chicken-and-egg is mild here:** product is single-player (no network needed) — a genuine advantage vs marketplace ideas.
- **Verify every legal number** (deadlines, fees, notice periods) against NSW Fair Trading / NCAT current guidance during build. Rules change; the config layer exists for this reason.
