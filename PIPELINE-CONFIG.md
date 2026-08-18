# CloudSpring Lead-Gen Pipeline — Operational Config (CANONICAL)

Single source of truth for ALL pipeline agents, on every surface (Cowork
scheduled runs AND Claude Code Routines). Read this before doing anything.
Credentials are NOT stored here — Cowork runs get them from the TRELLO WORK
project doc; Code Routines use their bound-repo/connector access.

## This week's niche — WEEKLY FOCUS RULE

One niche per WEEK. Pick the niche whose date range contains today
(Asia/Manila). All leads that week come from that single niche. The
pipeline runs EVERY DAY including weekends.

Niche calendar (the human owns this list — edit freely):
- 2026 Jul 27 – Aug 02: Dental clinics
- 2026 Aug 03 – Aug 09: Pediatric / medical clinics
- 2026 Aug 10 – Aug 16: Dermatology / skin clinics
- 2026 Aug 17 – Aug 23: Auto repair / vulcanizing shops
- 2026 Aug 24 – Aug 30: Pet grooming / veterinary clinics
- 2026 Aug 31 – Sep 06: Catering / home bakers
- After the last entry: cycle back to the top, unless updated (prefer
  niches that produced replies — see Learnings log).

## Quotas & targeting

- Daily quota: 3 PH + 1 international — TOTAL across all agents/surfaces.
  Lead generation is STEP 1 OF THE DAILY RUN (see below), not a separate
  routine. Count what INCOMING LEADS already holds for today and top up to
  quota — never past it, never duplicate.
- City rotation within the week: Mon Quezon City · Tue Makati · Wed Pasig ·
  Thu Taguig · Fri Cebu · Sat Davao · Sun agent's choice among cities with
  thin coverage so far this week
- International (1/day, same niche): US suburbs, Canada, Australia, UK — rotate.

## Trello board

Board: CLOUDSPRING_MAINBOARD — https://trello.com/b/TIAlGfU8/cloudspringmainboard
Lists, in board order: NICHE · INCOMING LEADS → STRATEGY READY → **BRAND
BLOCKED** → MOCKUP READY → READY TO SEND → CHANGES REQUESTED → APPROVED →
SYNCED TO GHL (SEND MANUALLY) → CONTACTED → FOLLOW-UP DUE → REPLIED (HITS) →
CLIENTS, + REJECTED

BRAND BLOCKED sits between STRATEGY READY and MOCKUP READY because capture runs
before the build. It holds leads where capture returned `no-assets` — no logo
found anywhere, so no mockup may be built. It is a human decision queue, not a
failure bin: drop real assets into `<slug>/brand/` and the card re-enters at
MOCKUP READY, or reject the lead. Nothing leaves this list by being built with
an invented palette.

APPROVED flow: agent syncs every approved card to GHL (contact + opportunity
+ note, "✅ Synced to GHL" marker). Email leads auto-send via GHL → CONTACTED.
Manual-channel leads (FB/SMS) → SYNCED TO GHL (SEND MANUALLY); the human
sends the draft and drags the card to CONTACTED, which is the "sent" signal.
No processed card ever sits in plain APPROVED.

Human touchpoints: READY TO SEND → APPROVED authorizes sending · revisions
via CHANGES REQUESTED with "## CHANGES" in the card DESCRIPTION (comments are
invisible to agents) · REPLIED (HITS) is human territory.

Agent order: see "Daily run — order of operations" below. That section is the
canonical order; nothing runs outside it.

## Daily run — order of operations (CANONICAL)

ONE job, every day including weekends, starting **07:00 Asia/Manila**. All nine
steps below belong to this single run.

There is no separate 6AM Lead Hunter routine any more. Lead generation is step 1
of this run. (2026-08-17 and 2026-08-18: the separate routine silently produced
nothing two days running and the daily job absorbed the full quota both times.
One job that reliably runs beats two where one doesn't.)

Two rules that hold across every step:

- **A step that produces nothing still reports.** Silence is the failure mode
  this pipeline keeps hitting; there is no such thing as a quiet skip.
- **No step covers for a skipped earlier step.** If step 3 could not run, step 4
  does not build unbranded "to keep the day moving" — it reports the gap and
  builds only what is genuinely ready.

### 1 — Lead generation (folded in)

Read this week's niche and today's city from the calendar above. Count today's
existing INCOMING LEADS cards, top up to 3 PH + 1 international, stop at quota.
Prefer leads with at least one messageable channel (email or FB); mark
phone-only leads `☎️ PHONE ONLY` — they cannot be emailed or auto-sent and
become a human SMS/call script. Download Google Place photos to
`<slug>/photos/` where the Places API is reachable.

**Reports:** quota target · found · already present · shortfall and why.

### 2 — Strategy

Solutions Strategist turns every INCOMING LEADS card into a two-part Sales Angle
(evidence, then offer), writes it into the card DESCRIPTION at ~1,250 chars max,
and moves the card to STRATEGY READY.

Before defaulting to the directory-capture angle, run the two cheap checks that
have repeatedly beaten it: fetch the lead's candidate domain looking for a
200-with-empty-body, and look for duplicate directory listings that contradict
each other on address, hours or price.

**Reports:** cards strategised · angle chosen per card.

### 3 — Brand capture (first-class, same run as strategy)

For every card step 2 moved into STRATEGY READY, run
`tools/brand-capture/capture.mjs` and write `<slug>/brand/brand.json`. Nothing
reaches the builder unbranded. This step is headless — see "Brand assets
convention" below for the invocation and the three `brand.json` states.

Routing, which is the part that belongs to the run order:

- `ready: true` → the card continues to step 4.
- `palette-pending` → vision-read the logo, complete `colors.brand[]`, then
  continue to step 4 in the same run. This is the common Facebook-only case, not
  an exception.
- `no-assets` → the card moves to **BRAND BLOCKED** and stops. It does not
  consume today's build capacity and it is never built anyway.

**Reports:** captured · vision-resolved · brand-blocked counts, with the logo
source and confidence per lead. Report the brand-blocked cards by name — an
empty BRAND BLOCKED list and an unreported one look identical otherwise.

### 4 — Build: revisions first, then backlog, then new

Mockup Builder works this order and does not reorder it:

1. **Revisions** — every CHANGES REQUESTED card carrying `## CHANGES` in its
   DESCRIPTION. A revision is a prospect already engaged; it outranks a new
   lead every time.
2. **Backlog** — oldest branded, ready STRATEGY READY cards, up to remaining
   capacity. A card older than 7 days must have its evidence re-verified before
   build; rankings, competitor claims and directory data go stale.
3. **New** — today's step-3 output.

Gate, enforced not advised:

- No card is built without `brand/brand.json` at `ready: true`.
- Before every `git push`, run `node tools/brand-capture/verify-brand.mjs
  <business-slug>`. Non-zero exit blocks the push for that slug.
- There is no flag-and-ship-anyway path and no override. A mockup either carries
  the lead's real branding or it is not pushed.

**Reports:** revisions / backlog / new built · gate pass and fail per slug ·
deploy URL per slug.

### 5 — Drafting

Outreach writes the draft INTO the MOCKUP READY card's DESCRIPTION (comments are
invisible to agents) and moves the card to READY TO SEND. Budget ~800 chars —
condense the Sales Angle first, dropping the Stack/Mockup directive now the
build is done. Sign as Dei. No two drafts in one day may share an opener, a
closer or a skeleton.

**Reports:** drafts written · send channel per lead.

### 6 — QA

sales-qa-humanizer. Three checks, all must pass before the card is marked
`✅ QA'd & humanized`. Only marked cards should ever be approved by the human.

1. **Humanize.** Contractions are a hard rule, not a preference. Banned:
   any "So I built …" opening clause; the "<positive ask>? If not, <opt-out>
   and I'll leave you be" closer; the em-dash used as a default clause
   separator.
2. **Brand gate, independently.** QA re-runs `verify-brand.mjs` itself rather
   than trusting the builder's report. Same script, second pair of eyes — the
   Dental Hive miss happened because one agent both built and judged.
3. **Pricing floor.** PH ₱1,000–1,500/month; international USD 300–500 build +
   USD 50–100/month. When a draft quotes a non-USD currency, convert it and
   check against the floor before it leaves QA.

**Reports:** pass/fail per check per card · what was rewritten.

### 7 — Approved handling

For every card the human moved to APPROVED:

- **GHL sync** — contact (tags `cloudspring-web-leads` + niche + `ph`/`intl`),
  opportunity (12-month value), note (angle, mockup URL, offer, Trello link).
- **Send by channel** — email leads auto-send via GHL and move to CONTACTED.
  FB/SMS leads move to SYNCED TO GHL (SEND MANUALLY); Dei sends the draft and
  drags the card to CONTACTED, which is the "sent" signal.
- **Stamp the follow-up date** — set the card's due date to CONTACTED + 3 days.
  The date is what makes step 8 possible; a card that reaches CONTACTED without
  one falls out of the pipeline silently.
- **If GHL is unreachable**, sending still proceeds. Advance the card by channel
  as normal, mark it `⏳ GHL SYNC PENDING`, and name it in the run report; the
  next run with a live connection back-fills the sync. A dead CRM must never
  block a send.

No processed card is left sitting in plain APPROVED.

### 8 — Follow-ups due

Sweep every CONTACTED card whose stamped due date falls today into FOLLOW-UP
DUE, then work that list. Email follow-ups send through the same channel as the
original; FB/SMS follow-ups are drafted for Dei to send, exactly like step 7.

- **Day 3** — reply in the same thread with one new piece of evidence, not a
  nudge. Re-stamp for day 7 and return the card to CONTACTED.
- **Day 7** — change the angle, not the volume. Re-stamp for day 14, return to
  CONTACTED.
- **Day 14** — breakup. One line, no ask, closes the loop. Card moves to
  REJECTED unless it drew a reply.

A card never sits in FOLLOW-UP DUE overnight: by the end of the run it has gone
back to CONTACTED with a new date, or on to REJECTED.

**Reports:** follow-ups due · sent · drafted for manual send · re-stamped ·
broken up.

### 9 — Reply triage

Same day, no carry-over. Check GHL inbound and the board for anything that came
back. Move it to REPLIED (HITS) and hand it to Dei — REPLIED is human territory
and agents do not answer prospects.

**Reports:** replies found · where each was routed.

## Run report (required output of every run)

Every run ends by writing a report to the run's Trello card / issue thread. It
is not optional and it is not prose-only. Minimum contents:

- **Quota** — target 3 PH + 1 intl, found, shortfall and cause.
- **Capture** — captured / vision-resolved / brand-blocked, per lead.
- **Gates** — brand gate and QA results per slug, including every failure and
  what blocked it.
- **Queue depths** — card counts in INCOMING LEADS, STRATEGY READY, BRAND
  BLOCKED, MOCKUP READY, READY TO SEND, CHANGES REQUESTED, APPROVED, SYNCED TO
  GHL (SEND MANUALLY), CONTACTED, FOLLOW-UP DUE. Flag any queue that grew for a
  third consecutive run — that is a human bottleneck, not an agent one, and the
  run should say so plainly rather than keep filling it.
- **Blockers** — anything that failed, named, with who unblocks it.
- **Learnings** — new angles, slop patterns and environment gotchas appended to
  the log at the bottom of this file.

## GHL (customer-facing CRM)

- Pipeline: CLOUDSPRING WEB LEADS (id 7yd9fhvPcfz1vqbF3kxN); stages New Lead →
  Outreach Sent → Follow-up → Replied → Negotiation/Proposal → Won → Closed
- Discovery Call booking URL (use in mockup CTAs + outreach):
  https://api.leadconnectorhq.com/widget/booking/QRPEnWRw2Kx9rBe0Mj6J
- On approval: contact (tags cloudspring-web-leads + niche + ph/intl) +
  opportunity (12-mo value) + note (angle, mockup URL, offer, Trello link)
- Nurture workflow: (not built yet — add name/ID here when created)

## Brand assets convention

Brand capture is **headless and automatic**. It runs in any scheduled run — no
browser, no desktop session, no human step. `tools/brand-capture/` is the
implementation; run it for every lead before the mockup is built.

```bash
node tools/brand-capture/capture.mjs --site <domain> --facebook <page-slug> \
     --slug <business-slug> --out <business-slug>/brand
```

Plain Node (v18+), zero dependencies. Writes `<slug>/brand/brand.json` plus every
logo file it could download. Exit code is `0` when `ready`, `1` otherwise.

**Facebook is capturable without a browser.** The page *HTML* is login-walled,
but `https://graph.facebook.com/<page-slug>/picture?type=large` needs **no access
token, no login and no browser** — a plain HTTP request returns the page's
profile picture. For a Facebook-only lead, which is most of this pipeline by
definition of the qualifier, that image *is* the brand. (Verified 2026-08-19:
returns the Fast Autoworks logo as a 5.5KB JPEG from an unauthenticated run.)

### The three states of `brand.json`

| `ready` | `blockedBy` | What the builder does |
|---|---|---|
| `true` | `null` | **Build.** Use the captured logo file, the `colors.brand` hexes, and the captured typeface. |
| `false` | `palette-pending` | Logo exists, no CSS to read colour from — the Facebook-only case. **Vision-read the logo**, write the hexes into `colors.brand[]` with `colors.source: "vision"`, set `ready: true`, then build. |
| `false` | `no-assets` | **Do not build.** No usable logo anywhere. Card goes to `BRAND BLOCKED` for a human call: hand-drop assets into `<slug>/brand/`, or drop the lead. |

There is no fourth state. There is no build-anyway path, no placeholder palette
and no warning-label flag — a design the builder invented is not the prospect's
brand, and labelling it as such does not make it sendable.

### Deploy gate — run before every `git push`

```bash
node tools/brand-capture/verify-brand.mjs <business-slug>
```

Six checks: `brand.json` is `ready` · a captured logo file is actually referenced
in `index.html` · **≥2 captured brand hexes appear in the styling** (this is the
check that catches an invented palette) · the captured typeface is used (Arial /
Helvetica / Roboto don't count — they're in every font stack) · no leftover
generic-branding marker · the real business name is on the page.

Non-zero exit means **do not deploy**. There is no override.

### Other assets

- Per-lead folders in this repo: `<business-slug>/brand/` (logo + `brand.json`) and `<business-slug>/photos/` (real photos — the Lead Hunter downloads Google Place photos here via the Places API).
- The builder uses the real photos as site imagery.
- Human/Claude Code edits to a mockup folder are authoritative — pipeline agents git pull first and never rebuild over non-pipeline commits.
- Re-capture pass: every run, the builder rechecks cards sitting in `BRAND BLOCKED`; if assets have since appeared, it re-runs capture, rebuilds on the same URL, and moves the card back into the flow.

## Deployment

- git push to THIS repo (main) → Cloudflare Pages auto-deploys
- One folder per mockup: /<business-slug>/index.html
- URLs: https://preview.cloudspringitsolutions.com/<slug>/ (use in outreach);
  fallback https://cloudspring-mockups.pages.dev/<slug>/
- Revisions: edit same folder, push — URL never changes
- Every mockup: self-hosted assets only (no hotlinks; SVG/CSS illustrations)
  + floating CloudSpring CTA (angle-driven text + Discovery Call link above)
- Cowork sandbox CANNOT reach api.cloudflare.com / api.resend.com /
  api.pexels.com / places.googleapis.com. GitHub works. Code Routine
  environments: places.googleapis.com allowed if configured in env settings.

## Language & pricing

- Professional English only (PH and international). No Taglish.
- PH: ₱1,000–1,500/month · first month FREE · 3/6/12-mo terms · no build fee
- International: build fee USD 300–500 + retainer USD 50–100/month

## Do-not-contact list

(one business name or domain per line)

## Learnings log

- 2026-07-25: bakery QC — "losing online orders to competitors" beat plain
  invisibility as an angle; verify embeds load (Jotform 404'd → sample form)
- 2026-07-25: hotlinked stock images broke → self-hosted assets only
- 2026-07-26: git-based deploy verified; first live mockup:
  https://preview.cloudspringitsolutions.com/custom-cakes-by-bam/
- 2026-07-26: GHL wired (pipeline + pilot contact/opportunity); floating
  discovery-call CTA live; switched to WEEKLY niche focus (W1 = dental)
- 2026-07-26 (plumbing run): invisibility is the strongest angle for PH trades
  — every city search ("plumber <city>") is dominated by SEO-built operators
  (Tubero Experts, the malabananservices.ph / mrmalabanan.com franchise-style
  network) with real sites; small local shops appear nowhere. Name the actual
  competitors; it is checkable and it lands.
- 2026-07-26: NEW ANGLE — "name collision". For generic/franchise-style PH
  trade names (Malabanan, Tubero, etc.), the pain is not just invisibility:
  searches send the lead's own customers to four other companies using the
  same name. The mockup becomes an identity-proof page (exact address +
  number + rating in the hero). Reusable for any generic-named niche.
- 2026-07-26: sharper trust-gap variant — reviews trapped in a DIRECTORY, not
  just on FB. A & D (56 reviews) ranks only inside a Yelp listing page, so
  Yelp owns the traffic and the ad space. "Your 56 reviews are working for
  someone else" outperforms plain "you have no website".
- 2026-07-26 (deploy gotcha): on the FIRST deploy of a new folder, the branded
  domain preview.cloudspringitsolutions.com can lag ~1-2 min behind and serve
  the root placeholder page instead of the new folder. Do NOT treat that as a
  failed deploy — verify via cloudspring-mockups.pages.dev/<slug>/ first, then
  re-check the branded URL (add /index.html to bypass a cached 15-min fetch).
- 2026-07-26 (Trello gotcha): card descriptions are capped at 2048 chars and
  the whole pipeline writes into one description. Budget it: Strategist output
  ~1,250 chars max, then condense the Sales Angle (drop Stack/Mockup directive
  once the build is done) to leave ~800 chars for the outreach draft.
- 2026-07-26 (lead quality): 4/4 plumbing leads had NO email; 2/4 had no FB
  either, leaving phone as the only channel. Phone-only leads cannot be
  emailed or auto-sent — outreach becomes an SMS/call script the human runs.
  Lead Hunter should prefer leads with at least one messageable channel
  (email or FB) and flag phone-only ones explicitly.
- 2026-07-26 (calendar drift): Lead Hunter delivered PLUMBING leads on Jul 26,
  but the niche calendar above puts plumbers at Aug 03-08 and dental at
  Jul 27 - Aug 01. Either the calendar or the Lead Hunter niche selection
  needs correcting — human decision.
- 2026-07-27: Added Agent #3.5 sales-qa-humanizer — first batch of drafts read as one template (identical opener/pivot/closer). Batch variation rule: no two drafts in a day may share opener, closer, or skeleton.
- 2026-07-27: Added SYNCED TO GHL (SEND MANUALLY) list so GHL sync state is visible on the board.
- 2026-07-27: Strategy note from Dei — medical niches (dental, pedia, derma, vets) have the strongest automation upsell: appointment booking, reminders, no-show reduction, patient follow-ups. Weight the calendar toward clinics; strategist should push the booking/automation stack for these.
- 2026-07-27: Pipeline now runs 7 days/week (weekend off-days removed).
- 2026-07-27 (dental W1, run 1): NICHE ANGLE — for PH clinics the winning
  pain is DIRECTORY CAPTURE, not plain invisibility. Every dental search we
  ran (QC Visayas Ave, Mabolo Cebu, Quirino Hwy) returns aggregator pages —
  dentalclinics.care, cebudentalimplants.com, smilejet.app,
  dentalphilippines.org, WhatClinic, Yelp — while only one or two clinics
  rank on their own domain (EMM Dental, Dentspec). Those aggregator pages
  show RIVAL clinics beside the lead. "Their page, not yours, with your
  competitors listed next to you" is concrete, checkable in one click, and
  much stronger than "you have no website". Reuse for pedia/derma/vet weeks.
- 2026-07-27: NEW ANGLE — "empty corridor / first mover". When a whole
  street or barangay is Facebook-only (Quirino Hwy: Nova Dental,
  Smilemakers, DGT One, Blissful Smile, Plaza Dental — all FB pages), do
  NOT shame the lead. Frame it as the opening: whoever puts up a site first
  owns the search. Good fit for low-review leads where competitor-beating
  proof isn't available.
- 2026-07-27 (lead quality, 2nd run in a row): 0/4 dental leads had an
  email address; all four are FB/IG-only, so the ENTIRE batch is
  manual-send. Combined with the 2026-07-26 plumbing run that is 0/8 emails
  across two days. GHL auto-send is effectively unused for PH SMB leads.
  Either Lead Hunter must weight harder toward email-bearing businesses, or
  accept manual FB send as the default PH channel and stop treating it as
  the exception.
- 2026-07-27 (mockup honesty pattern): when hours or pricing are unknown,
  ship a clearly LABELLED placeholder ("₱ ___", "Clinic hours — to be
  confirmed", "Sample layout — your actual rates go here") instead of
  omitting the section. It avoids fabrication, and it gives the owner an
  obvious "I'd just fill this in" hook that invites a reply.
- 2026-07-27 (env gotcha, cost 1 failed push): in Cowork runs HOME=/root, so
  `git clone` lands in /root/cloudspring-mockups, but subagents default to
  /home/claude. Always pass subagents the ABSOLUTE repo path, and never
  `cd` in a Bash call (cwd resets between calls) — use `git -C <abs path>`.
- 2026-07-27 (calendar drift RESOLVED): Lead Hunter delivered dental leads
  on Jul 27, matching the calendar. The Jul 26 plumbing mismatch was a
  one-off; no calendar edit needed.
- 2026-07-27: Dental Hive mockup shipped with an invented palette (no brand asset access) and QA missed it. Fixes at the time: brand-assets convention above, a warning flag on the card, QA branding check, Lead Hunter to download Place photos per lead. The warning flag was retired on 2026-08-19 — see that entry; it was the part of this fix that did not work.
- 2026-08-16 (derma W wrap): NEW ANGLE — "the blank domain you already pay for".
  4 of 14 derma leads OWN a domain that serves an empty body (hugoderm.com,
  kutisbykei.com/.ph, skincosmeticclinic.com.au, alodermatology.com), and in
  HugoDerm's case the directory that ranks for their name points its "Visit
  Website" button at WhatClinic instead. This beats plain invisibility: the
  owner has already decided they want a site and already spent money on it,
  so the ask is "let's put something on it", not "let's start from zero".
  Check every lead's candidate domain for a 200-with-blank-body before
  defaulting to the directory-capture angle.
- 2026-08-16: directory capture confirmed for derma exactly as for dental —
  ClinicFinderPH, doktor.ph, WhatClinic, Timesmed, Fresha. Sharpest variant is
  a directory publishing WRONG data (ALO: Timesmed gives the wrong building,
  wrong hours and a fee she never set, with nine rivals underneath). "They are
  sending your patients to the wrong address" outperforms "you rank poorly".
- 2026-08-16 (INTL targeting): US MEDICAL dermatology is a dead end for this
  offer — 7 of 8 US candidates had real sites, almost all multi-location group
  practices. The FB-only US skin businesses are esthetician-led acne/skin-care
  clinics in small towns. Point the Lead Hunter at "skin care clinic" /
  "acne clinic" rather than "dermatology" on US days.
- 2026-08-16 (BACKLOG — needs a human decision): STRATEGY READY held 25+ cards,
  of which 23 were dental (Jul 29 - Aug 01) and pediatric (Aug 09 - Aug 10)
  leads that were strategised but NEVER built. This run cleared all 14 derma
  cards; the ~9 dental + ~8 pediatric cards remain unbuilt and are now 2-3
  weeks stale (evidence dates and competitor claims will need re-verifying
  before they can be sent). Either schedule a catch-up build run or archive
  them — the daily run cannot absorb a backlog this size on top of quota.
- 2026-08-16 (brand capture cannot run unattended) — **WRONG, corrected
  2026-08-19, see that entry**: a scheduled Cowork run has no Claude in Chrome —
  list_connected_browsers returned []. Concluded step 3 was structurally a
  HUMAN-initiated desktop step. Consequence: all 14 derma mockups shipped with
  an invented palette. The browser was never the requirement; the conclusion
  drawn from an empty browser list was.
- 2026-08-16 (GHL blocked): the GoHighLevel connector returned "No locations
  available for this connection", so no contact/opportunity sync and no
  inbound-reply check was possible. Nothing was due (APPROVED was empty), but
  the connection needs re-authorising before the next approval batch.
- 2026-08-16 (slop patterns to ban): two independent drafting agents converged
  on the same three tells. (a) pivot verb "So I/we built you one"; (b) closer
  of the shape "<positive ask>? If not, <opt-out> and I'll leave you be";
  (c) an em-dash as the default clause separator, ~1 per paragraph. (a) is
  already banned and still got through; add (b) and (c) explicitly. Also:
  drafts shipped with "[Your name]" placeholders — the sender is DEI, and the
  outreach agent should sign as Dei by default.
- 2026-08-16 (env gotchas, Cowork run): `git clone` into the MOUNTED outputs
  folder fails ("could not lock config file", Operation not permitted) —
  clone into $HOME/work instead. And the sandbox has NO outbound network from
  bash (curl exits 000 for every host), so deploy verification must go through
  web_fetch, never curl/wget.
- 2026-08-16 (deploy): 14 mockups pushed in one commit; both pages.dev and the
  branded domain served all 14 correctly within ~2 min, no lag this time. The
  2026-07-26 first-deploy lag warning did not reproduce at this batch size.
- 2026-08-17 (auto repair W, run 1): LEAD HUNTER DID NOT RUN. INCOMING LEADS
  was empty at 09:00 PHT, so the daily job carried the full 3 PH + 1 INTL
  quota itself via web search (Method B). Worth checking why the 6AM routine
  produced nothing — this is the second capability gap in a row (the other
  being brand capture) where the daily job silently absorbs another job's
  work.
- 2026-08-17 (niche angle, auto repair): directory capture holds for QC auto
  repair exactly as for dental and derma. Search "auto repair shop Quezon City
  best mechanic" returns ONLY aggregators on page 1 — Yelp (three separate
  result variants, including a street-level "Auto Repair near 213 Banawe St"
  page), WhoDoYou, StarOfService, infoisinfo-ph, philkotse. Not one QC shop
  ranks on its own domain. The sharpest variant found yet: Yelp's roundup
  NAMES the lead (PowerTORQ) alongside three rivals, so "the page ranking for
  your name has your competitors on it" is literally checkable in one click.
- 2026-08-17 (blank-domain angle confirmed OUTSIDE derma): Eastside Auto Repair
  (Van Wert OH) owns eastsideautorepairandsales.com, which returns 200 with an
  empty body, while both of its two town competitors (England's Bay, Lloyd's)
  run real sites. The 2026-08-16 derma learning generalises: always fetch the
  candidate domain before defaulting to directory capture. It is now 5 leads
  across two niches.
- 2026-08-17 (INTL targeting that worked): US small-town auto repair is a much
  better intl pool than US medical was. "small auto repair shop facebook page
  only <state> family owned" surfaced several FB-only shops in one search;
  small-town trades have weak web presence AND published phone/email, unlike
  PH trades. Prefer US/Canada small towns for intl days on trade niches.
- 2026-08-17 (lead quality, first good batch): 3 of 4 leads have a real email
  address (PowerTORQ, Automotive 1, Eastside), breaking the 0/8 and 0/4 email
  droughts of the dental and plumbing runs. Auto repair shops publish contact
  emails on directory listings far more often than clinics do. Only Dr. Mechanic
  is manual-send (FB/IG only).
- 2026-08-17 (slop patterns, new): drafting converged again on non-contracted
  formal English ("you would rather", "it is not for you") which reads more
  robotic than any single banned phrase. Contractions are now a hard rule, not
  a preference. Also caught a near-miss on the banned pivot: "So I built out
  what that domain could be showing" is the same move as "So I built you one" —
  ban the whole "So I built …" opening clause, not just the exact phrase.
- 2026-08-17 (BACKLOG unchanged): STRATEGY READY still holds the ~31 stale
  dental + pediatric cards flagged on 2026-08-16. This run added and cleared
  only today's 4. READY TO SEND is now at 26 cards awaiting human approval,
  which is the real bottleneck — nothing has been approved since the derma
  batch. Suggest Dei triage READY TO SEND before the pipeline generates more.
- 2026-08-17 (env, both blockers reproduced): Claude in Chrome unavailable
  (list_connected_browsers = []) so brand capture was skipped again — all 4
  mockups shipped with an invented palette. (The browser half of this was a
  false blocker; corrected 2026-08-19.) GHL still returns "No locations
  available for this connection", so no sync or reply check was possible.
  APPROVED was empty so nothing was blocked, but the GHL connection has now
  been broken for two runs.
- 2026-08-18 (auto repair W, run 2): LEAD HUNTER DID NOT RUN AGAIN. INCOMING
  LEADS was empty at ~19:20 PHT, so the daily job carried the full 3 PH + 1
  INTL quota itself via web search (Method B) for the second consecutive day.
  This is no longer a one-off; treat the 6AM routine as broken until proven
  otherwise, or fold lead-gen into the daily job officially.
- 2026-08-18 (niche angle, Makati auto repair): directory capture holds for
  Makati exactly as for QC. "auto repair shop Makati City best mechanic" p1 =
  Yelp (4 result variants), StarOfService, infoisinfo-ph. Not one Makati shop
  on its own domain. Three niches, three cities, same finding — this is now
  the default PH angle and can be assumed rather than re-proved every run.
- 2026-08-18 (NEW ANGLE — "the listings contradict each other"): a sharper,
  more personal variant of directory capture. Makati Motorist is listed TWICE
  on yellow-pages.ph with different postcodes (1234 vs 1200). Tower of David
  is placed by Philkotse at Makati Cinema Square while its own Yelp and Yellow
  Pages entries say J. Victor St., Pio del Pilar. "Two of the pages about you
  disagree about where you are" beats "you rank poorly" because it is a
  concrete error the owner can verify in ten seconds, and it makes the mockup
  an identity-proof page. Check for conflicting duplicate listings on every
  PH lead; it appeared on 2 of 3 today.
- 2026-08-18 (NEW ANGLE — "the invisible second branch"): McQueen announced a
  Las Piñas branch in a single FB post. Searching "McQueen auto repair Las
  Piñas" returns nothing. An entire location invisible is a bigger, more
  emotive loss than abstract ranking, and it gives the outreach a natural
  question to ask ("where is it exactly?") that invites a reply instead of a
  decision. Look for recent expansion/new-branch posts on every FB-only lead.
- 2026-08-18 (blank borrowed domain, 3rd niche): Kingaroy Auto's only web
  address is a Repco-AFFILIATE microsite (…-affiliate.repcoservice.net) that
  returns 200 with an empty body — and Repco Authorised Service runs a rival
  branch in the same town. New sub-variant of the 2026-08-16 blank-domain
  learning: franchise/parts-network affiliate microsites count as blank
  domains AND hand SEO value to a competitor. Check for them on every
  AU/US/CA trade lead (Repco, NAPA, Bosch Car Service, etc.).
- 2026-08-18 (INTL targeting confirmed): AU small-town auto repair behaves
  like the US small-town pool found on 08-17 — FB-only, published email, weak
  web presence, dealership competitors on real domains. Kingaroy (pop ~10k)
  produced a lead with an email in one search. Small towns + trades remains
  the best intl formula; keep rotating US → AU → CA → UK on trade weeks.
- 2026-08-18 (lead quality): 2 of 4 have real email (Makati Motorist,
  Kingaroy). Auto repair continues to out-perform clinics on contactability
  (5 of 8 across two days vs 0 of 12 for dental/plumbing).
- 2026-08-18 (QA catch worth repeating): the INTL draft was first quoted at
  AUD 450 build + AUD 75/month, which converts to roughly USD 295 + USD 49 —
  BELOW the config's USD 300–500 + USD 50–100 floor. When quoting a non-USD
  currency, always convert and check against the config band before the draft
  leaves QA. Corrected to AUD 650 + AUD 110/month.
- 2026-08-18 (env, both blockers reproduced a 3rd time): Claude in Chrome
  unavailable (list_connected_browsers = []), so brand capture was skipped and
  all 4 mockups shipped with an invented palette. (Browser half: false blocker,
  corrected 2026-08-19.) GHL now fails harder than before —
  list_locations returns "list_locations dependencies are not configured"
  (previously "No locations available"), so no sync and no inbound-reply check.
  APPROVED was empty so nothing was blocked, but the GHL connection has been
  down for three consecutive runs and needs re-authorising.
- 2026-08-18 (env, git): cloning into the mounted outputs folder fails with
  "could not lock config file" (Operation not permitted) as on 08-16, AND the
  failed clone leaves an undeletable .git skeleton behind. Clone into /tmp
  instead of any mounted path.
- 2026-08-18 (BACKLOG worsening — needs a decision now): STRATEGY READY holds
  35 stale dental + pediatric cards (Aug 09 and older, i.e. 9+ days). READY TO
  SEND is now at 30 cards, up from 26, and nothing has been approved since the
  derma batch on Aug 16. The pipeline is producing roughly 4 approvable drafts
  a day into a queue no one is draining. Recommend Dei either triage READY TO
  SEND before the next run or pause lead-gen for a day.
- 2026-08-19 (BRAND CAPTURE FIXED — retires the warning-flag mechanism):
  **The "brand capture needs a connected browser" claim was false**, and it was
  the load-bearing assumption under three runs and 18+ unbranded mockups.
  `graph.facebook.com/<page-slug>/picture?type=large` needs no token, no login
  and no browser. Verified on an unauthenticated request: the Fast Autoworks
  page logo comes back as a 5.5KB JPEG. `list_connected_browsers = []` was real
  but irrelevant — it was read as "capture is impossible" when it only ever
  meant "the *browser* path is unavailable".
  Two things shipped as a result. (1) `tools/brand-capture/` — headless capture
  plus a deploy gate, plain Node, no dependencies, runs in any scheduled run.
  (2) The warning-flag escape hatch is **deleted**. It let the builder ship an
  invented palette with a label attached, on the theory that a human would catch
  it downstream. Three runs and 18+ mockups say no one did. A warning that
  everything carries is not a signal, and a flag that permits the thing it warns
  about is not a control. `BRAND BLOCKED` replaces it: capture returns
  `no-assets` → nothing is built, and the only way forward is a real asset or a
  dropped lead. The generalisable rule: when the fix for "we shipped something
  wrong" is a label rather than a stop, expect to ship it again.
- 2026-08-19 (the 18+ already-shipped mockups are NOT fixed by this): the gate
  is preventive, not retroactive. Every mockup folder in this repo predates
  brand capture, has no `brand/brand.json`, and would fail `verify-brand.mjs`
  today. They are still live on preview URLs. Re-capturing and rebuilding them
  is a separate piece of work and has not been done.
- 2026-08-19 (STRUCTURAL — run order is now canonical): added the "Daily run —
  order of operations" section above. It replaces the loose agent-order line and
  is the only sanctioned order. Two fixes it turns on:
  (a) **Lead-gen folded in.** The separate 6AM Lead Hunter routine is retired.
  It produced nothing on 08-17 and again on 08-18 while reporting nothing, and
  the daily job silently absorbed a full quota both times. A dark routine costs
  more than a slow one.
  (b) **Brand capture is step 3, not a human favour.** It runs in the same run
  as strategy, before anything reaches the builder, with a hard pre-push gate
  and no flag-and-ship path.
  Also added a required run-report contract: quota, capture counts, gate results
  and queue depths, every run, including when a step produced nothing.
- 2026-08-19 (pricing floor is now a named QA check): the AUD 450 + 75 near-miss
  on 08-18 was caught by luck, not by process. Currency conversion against the
  config band is now check 3 of step 6, and QA re-runs the brand gate itself
  rather than trusting the builder's report — the Dental Hive miss happened
  because one agent both built and judged.
- 2026-08-19 (general lesson from the false blocker): when a tool comes back
  empty, test whether the CAPABILITY is actually unreachable before writing
  "structurally impossible" into this file. A false impossibility is more
  expensive than a known bug, because nobody ever retries it. Applies now to
  the GHL connection: it has failed four runs, but "the connector is down" and
  "CRM sync is impossible" are not the same claim.
