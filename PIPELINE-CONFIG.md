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
SYNCED TO GHL (SEND MANUALLY) → CONTACTED → **FOLLOW-UP DUE** → REPLIED (HITS) →
CLIENTS, + REJECTED

NICHE is a reference list, not a stage. REJECTED is a terminal sink — cards can
land there from any stage.

BRAND BLOCKED sits between STRATEGY READY and MOCKUP READY because capture runs
before the build. It holds leads where capture returned `no-assets` — no logo
found anywhere, so no mockup may be built. It is a human decision queue, not a
failure bin: drop real assets into `<slug>/brand/` and the card re-enters at
**STRATEGY READY**, or reject the lead. Nothing leaves this list by being built
with an invented palette.

**Entry condition: a card may only enter BRAND BLOCKED with a committed
`<slug>/brand/brand.json` file naming the verdict.** Without a captured or
manually-created brand.json, the card is indistinguishable from one that capture
never reached, and it cannot be verified or acted on. Enforced by the same
verifier that gates deploy: a card with no brand/brand.json is a blocker.

**MOCKUP READY means BUILT, not brand-ready.** A card belongs in MOCKUP READY
only once `<slug>/index.html` exists and is deployed — that is the entry
condition, and step 5 relies on it because it drafts copy that points at the
mockup URL. Fixing a card's branding does not build it: a brand-repaired card
goes back to STRATEGY READY so step 4's backlog pass picks it up. Anything
sitting in MOCKUP READY whose description still reads `Mockup URL: (Agent #2
fills)` is mis-routed and must be moved back, not drafted against.

FOLLOW-UP DUE: Trello has no sequencer, so the later touches need somewhere to
physically land. A card moves CONTACTED → FOLLOW-UP DUE when its due date comes
up. Whoever owns the channel sends the next touch, then moves the card back to
CONTACTED with the next due date set — or on to REPLIED (HITS) or REJECTED.

Touch schedule: touch 1 on send · touch 2 at day 3 · touch 3 at day 7 · clean
breakup at day 14. There is no touch 4.

CONTACTED due-date discipline — MANDATORY on arrival, no exceptions:
- The card DESCRIPTION carries a `Sent: YYYY-MM-DD` line plus the channel used.
- The card DUE DATE is set to sent date + 3 days at 09:00 Asia/Manila
  (= 01:00 UTC; the Trello API takes UTC ISO 8601).
- Whoever moves the card in sets both — the outreach agent on email/GHL sends,
  the human on manual FB/SMS sends.
- A card sitting in CONTACTED with no due date is a defect. The next run stamps
  it from the card's move-in date and logs it.
- Re-stamp after every touch: day 3 → due day 7 → due day 14 → breakup → done.

APPROVED flow: agent syncs every approved card to GHL (contact + opportunity
+ note, "✅ Synced to GHL" marker). Email leads auto-send via GHL → CONTACTED.
Manual-channel leads (FB/SMS) → SYNCED TO GHL (SEND MANUALLY); the human
sends the draft and drags the card to CONTACTED, which is the "sent" signal —
and which triggers the due-date discipline above, on either path.
No processed card ever sits in plain APPROVED.

Human touchpoints: READY TO SEND → APPROVED authorizes sending · revisions
via CHANGES REQUESTED with "## CHANGES" in the card DESCRIPTION (comments are
invisible to agents) · REPLIED (HITS) is human territory.

**Card description budget — 2048 chars, and the eviction order is fixed.**
Every step appends to the same description and comments are invisible to
agents, so the cap falls on whoever writes last. It has now cost real
information: on 2026-08-23 the builder could not record a page fix on the GMS
card (1,999 of 2,048 used) and stopped rather than cut a human's revision
block. Silent overrun and silent abandonment are both wrong. Measure before
writing, and when a write would exceed the cap, evict in this order until it
fits:

1. the ROI/guidance line (advice to the next agent, not evidence)
2. Lead Details prose — keep business name, address, phone, email, FB; cut
   the rest
3. older Evidence sentences, oldest first, keeping the one the current draft
   actually rests on

**Never evict, at any budget:** a `## CHANGES` block (human-authored), the
current draft, the mockup URL, the brand-verified marker, or the channel tag.
If it still does not fit with everything evictable gone, write what fits, and
say plainly in the step report which card and which fact did not land.

Agent order: see "Daily run — order of operations" below. That section is the
canonical order; nothing runs outside it.

## Daily run — order of operations (CANONICAL)

ONE job, every day including weekends, starting **07:00 Asia/Manila**. All nine
steps below belong to this single run.

The job is the Paperclip routine **"Daily pipeline run (Asia/Manila)"**
(`384fbc06-eb67-4554-8dbd-252922400301`), scheduled `0 7 * * *` Asia/Manila,
`skip_if_active` + `skip_missed` so a slow run is never doubled and a missed day
never arrives as two days of quota. It is owned by the CEO agent, which delegates
each step to its specialist and compiles the report.

There is no separate 6AM Lead Hunter routine any more. Lead generation is step 1
of this run. (2026-08-17 and 2026-08-18: the separate routine silently produced
nothing two days running and the daily job absorbed the full quota both times.
One job that reliably runs beats two where one doesn't.) If a 6AM Lead Hunter
routine still exists on any other surface — a Claude Code Routine or a Cowork
schedule — **disable it**. Two lead-gen jobs against one shared quota is the
failure this section exists to remove, and a duplicate that works is worse than
one that doesn't.

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

The offer half of the angle is bounded by `OFFER-MENU.md`. Name every automation
by its menu ID (`CL-03`, `TR-01`, `XC-01`) and mark its state on the card. An
`IN BUILD` line may be **diagnosed and sized in the owner's numbers** but never
promised — see the template and worked example in that file.

**Reports:** cards strategised · angle chosen per card · menu IDs cited per card.

### 3 — Brand capture (first-class, same run as strategy)

For every card step 2 moved into STRATEGY READY, run
`tools/brand-capture/capture.mjs` and write `<slug>/brand/brand.json`. Nothing
reaches the builder unbranded. This step is headless — see "Brand assets
convention" below for the invocation and the `brand.json` states.

Routing, which is the part that belongs to the run order:

- `ready: true` → the card continues to step 4.
- `palette-pending` → vision-read the logo, complete `colors.brand[]`, then
  continue to step 4 in the same run. This is the common Facebook-only case, not
  an exception.
- `logo-not-a-mark` → palette is recoverable, but the captured file is not a
  usable logo (typically a photo or graphic). If `colors.brand` has >=2 colours,
  treat it like `palette-pending` (the palette is valid, the file needs
  alternative sourcing). If `colors.brand` is empty, the card moves to **BRAND
  BLOCKED** and stops — there is nothing to build with.
- `no-assets` → the card moves to **BRAND BLOCKED** and stops. It does not
  consume today's build capacity and it is never built anyway.

**Reports:** captured · vision-resolved · brand-blocked counts, with the logo
source and confidence per lead. Report the brand-blocked cards by name — an
empty BRAND BLOCKED list and an unreported one look identical otherwise.

### 4 — Build: revisions first, then backlog, then new

Mockup Builder works this order and does not reorder it:

1. **Revisions** — every CHANGES REQUESTED card carrying a `## CHANGES`
   **heading at the start of a line** in its DESCRIPTION. A revision is a
   prospect already engaged; it outranks a new lead every time.
   **Match line-initial, never anywhere-in-the-text.** The standing annotation
   for a card that lacks a revision block quotes the token itself, so a
   substring search matches the note that says the block is missing and
   reports a phantom revision. On 2026-08-23 that made 5 stalled cards look
   like 7 actionable ones. Line-initial matching separates them cleanly:
   a real block starts its own line, the annotation never does.
2. **Backlog** — oldest branded, ready STRATEGY READY cards, up to remaining
   capacity. A card older than 7 days must have its evidence re-verified before
   build; rankings, competitor claims and directory data go stale.
3. **New** — today's step-3 output.

Gate, enforced not advised:

- No card is built without `brand/brand.json` at `ready: true`.
- The gate runs **automatically on every `git push`**, via the versioned
  `tools/hooks/pre-push` hook. It verifies every mockup folder the push touches
  and refuses the entire push if any one of them fails. A refused push never
  reaches Cloudflare Pages, so it never reaches a prospect.
- Run `node tools/hooks/install.mjs` once per clone to wire the hook up. A clone
  that has not run it is ungated — that is a broken environment, not a shortcut.
- There is no flag-and-ship-anyway path and no override. `--no-verify` is not a
  sanctioned command in this pipeline. A mockup either carries the lead's real
  branding or it is not pushed.

**Reports:** revisions / backlog / new built · gate pass and fail per slug ·
deploy URL per slug.

### 5 — Drafting

Outreach writes the draft INTO the MOCKUP READY card's DESCRIPTION (comments are
invisible to agents) and moves the card to READY TO SEND. Budget ~800 chars —
condense the Sales Angle first, dropping the Stack/Mockup directive now the
build is done. Sign as Dei. No two drafts in one day may share an opener, a
closer or a skeleton.

**"Skeleton" is now defined, because the generic wording did not hold.** Three
consecutive QA runs (08-16, 08-23 em-dash, 08-23 batch skeleton) caught the same
generator emitting one fixed shape at growing scope — phrase, then paragraph
tic, then whole draft. Banning phrases one at a time has not worked, because the
generator's default is a *template*, not a phrase. So the rule is now positive
and per-axis. Across every draft written in one day, these four must vary — not
be reworded, actually differ in construction:

1. **The reveal sentence** — the line that introduces the mockup URL. Not every
   draft may run "The page at [URL] owns/wins/lists [claims]".
2. **The CTA formula** — price, free month and term may not appear in the same
   sentence order in two drafts. "Cost: [price], first month free, [N]-month
   term. [Question]?" is one shape among many, not the shape.
3. **The closer** — the sign-off line. Eight drafts closing "— Dei" on the same
   day is the defect, even though signing as Dei is correct.
4. **The opener** — as before.

Write the drafts for a day as a set, not one at a time and never in isolation:
before writing, read every draft already written today, including ones another
step has already marked QA'd. A draft is only diverse against the batch it
ships with.

**Reports:** drafts written · send channel per lead.

### 6 — QA

sales-qa-humanizer. Four checks, all must pass before the card is marked
`✅ QA'd & humanized`. Only marked cards should ever be approved by the human.

1. **Humanize.** Contractions are a hard rule, not a preference. Banned:
   any "So I built …" opening clause; the "<positive ask>? If not, <opt-out>
   and I'll leave you be" closer; the em-dash used as a default clause
   separator.
   **This check runs batch-wide, not card-by-card.** Reading one draft cannot
   catch a shared skeleton — that is why three of eight drafts shipped carrying
   one on 2026-08-23. Before marking anything, collect every draft written
   today, *including cards already marked `✅ QA'd & humanized` earlier in the
   same day*, and compare them against the four varying axes in step 5. Two
   drafts sharing a reveal sentence, a CTA sentence order or a closer is a FAIL
   for both, even if each reads well alone. A card already marked cannot be
   re-marked, so say so in the report and route it back rather than leaving the
   batch half-fixed.
2. **Brand gate, independently.** QA re-runs `verify-brand.mjs` itself rather
   than trusting the builder's report. Same script, second pair of eyes — the
   Dental Hive miss happened because one agent both built and judged.
3. **Pricing floor.** PH ₱1,000–1,500/month; international USD 300–500 build +
   USD 50–100/month. When a draft quotes a non-USD currency, quote from the
   dated FX band table in `OFFER-MENU.md` — AUD 475–700 + 80–140 · GBP 240–370
   + 40–75 · CAD 450–690 + 75–140. Never convert in your head.
4. **Menu boundary.** Every automation the draft names must appear in
   `OFFER-MENU.md` as `SELLABLE TODAY`. A draft that promises an `IN BUILD`
   line, or names a capability that is not on the menu at all, fails — however
   well it would fit the lead. Diagnosing the pain and sizing it in the owner's
   numbers is allowed and encouraged; promising delivery is not.

**Reports:** pass/fail per check per card · what was rewritten · any menu-boundary
rejections and the line that caused them.

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
- Nurture workflow: STL 1–6 SPECIFIED, STL 7 BUILT. Seven "STL" workflows are
  specified turn-by-turn in `automation/ghl/speed-to-lead-snapshot-v1.md`
  (first touch → AI qualification → booking → reminders → no-show recovery →
  reactivation → weekly owner report). STL 1–6 must be built BY HAND in the GHL
  UI: the public API has no create-workflow and no snapshot operation (checked
  2026-08-19 across all 302 registry operations). Add names/IDs here once built.
  STL 7 needs no transcription — it is built and tested in n8n at
  `automation/n8n/workflows/weekly-owner-report-v1.json`, and as of 2026-08-21
  it is verified running on the live instance, not just in the local harness.
- **STL 1–6 have never executed. Do not read "STL 1 first touch" as built.**
  What runs today is the *n8n intake half* of STL 1: normalise, compose,
  sandbox-deliver, measure. Everything downstream — qualification, booking,
  reminders, no-show recovery, reactivation — is a specification with zero
  execution behind it, and stays that way until a GHL sandbox sub-account
  exists. The engine is named "Speed-to-Lead + Booking Engine"; the Booking
  Engine is the unbuilt half.
- Speed-to-lead intake runs in n8n and is proven without a GHL account:
  `node automation/n8n/test/speed-to-lead-smoke.mjs` (9 scenarios) and
  `node automation/n8n/test/weekly-report-smoke.mjs` (every report figure).
  Both must exit 0 before anyone records a walkthrough or quotes a number.
- **Run both against the live instance too, and quote only those numbers.**
  Add `--url http://127.0.0.1:5678/webhook/speed-to-lead` (and
  `.../weekly-owner-report`). First live run 2026-08-21 on n8n 2.35.3: intake
  9/9, worst case **241 ms of a 60 000 ms budget**. Local mode proves logic
  only — it injects a fake `$env` the host does not have, and it cannot see a
  deactivated workflow. It passed green while the live weekly report was
  rendering "Your clinic -- week of this week". Both bugs are fixed; the lesson
  is that a local pass is not evidence a prospect can be shown.
- **Messenger is drafted, never auto-sent.** A Facebook lead with only a thread
  id is a valid lead — the engine writes the reply and queues it for a human
  with a 60-second deadline. It reports `automated: false` and is excluded from
  the sub-60-second figure on the weekly report. Quote the 60-second claim for
  SMS and email only.
- GHL API health check: use `get-calendars` or `get-pipelines`, NOT
  `list_locations` — see the 2026-08-19 learning below.

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

### The four states of `brand.json`

| `ready` | `blockedBy` | What the builder does |
|---|---|---|
| `true` | `null` | **Build.** Use the captured logo file, the `colors.brand` hexes, and the captured typeface. |
| `false` | `palette-pending` | Logo exists, no CSS to read colour from — the Facebook-only case. **Vision-read the logo**, write the hexes into `colors.brand[]` with `colors.source: "vision"`, set `ready: true`, then build. |
| `false` | `no-assets` | **Do not build.** No usable logo anywhere. Card goes to `BRAND BLOCKED` for a human call: hand-drop assets into `<slug>/brand/`, or drop the lead. |
| `false` | `logo-not-a-mark` | The Facebook profile picture or captured image is a photograph, promo graphic, or storefront photo — not a logo mark. **The palette is recoverable and valid**, but the file itself cannot be used as a logo in a mockup. Card goes to `BRAND BLOCKED`: find a cropped or alternative logo source, or drop the lead. The `colors.brand[]` is already filled from signage/visible branding in the image. |

There is no build-anyway path, no placeholder palette
and no warning-label flag — a design the builder invented is not the prospect's
brand, and labelling it as such does not make it sendable.

### Deploy gate — automatic on every `git push`

One-time per clone:

```bash
node tools/hooks/install.mjs      # sets core.hooksPath = tools/hooks
```

After that the gate runs itself. To check a single folder by hand — QA does this
as its independent second check — run it directly:

```bash
node tools/brand-capture/verify-brand.mjs <business-slug>
```

Six checks: `brand.json` is `ready` · a captured logo file is actually referenced
in `index.html` · **≥2 captured brand hexes appear in the styling** (this is the
check that catches an invented palette) · the captured typeface is used (Arial /
Helvetica / Roboto don't count — they're in every font stack) · no leftover
generic-branding marker · the real business name is on the page.

Non-zero exit means **do not deploy**. There is no override.

**What the hook gates.** A mockup folder is a top-level directory containing
`index.html` — the deploy unit. The hook gates exactly those folders that the
push touches, so a learnings-log or config commit is not blocked by unrelated
folders. It also fails a folder with uncommitted changes: if the working tree
isn't what's being pushed, the gate can't prove what would deploy.

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

## What we may sell — see OFFER-MENU.md

`OFFER-MENU.md` in this repo is the **boundary on what any agent or human may
pitch**. A capability that is not listed there as `SELLABLE TODAY` may not appear
in a Sales Angle, a mockup, an outreach draft or a call — not as a promise, not
as a "coming soon". Only the Automation Engineer moves a line to `SELLABLE
TODAY`, and only after it demonstrably runs.

Every Sales Angle names its automations by menu ID (`CL-03`, `TR-01`, `XC-01`).
QA rejects a card that names an automation not on the menu, or one marked
`IN BUILD`.

As of 2026-08-19 every automation line is `IN BUILD` (blocked on the GHL
connection), so the website tier is the only sellable offer. Diagnosing the
automation pain and putting a number on it is still required — it is the
promise, not the diagnosis, that the menu gates.

## Language & pricing

- Professional English only (PH and international). No Taglish.
- PH: ₱1,000–1,500/month · first month FREE · 3/6/12-mo terms · no build fee
- International: build fee USD 300–500 + retainer USD 50–100/month
- Non-USD quotes (AUD/GBP/CAD): use the dated FX floor table in `OFFER-MENU.md`.
  Never convert in your head — that is what produced the 2026-08-18 QA catch.
- Automation tiers A/B/C in `OFFER-MENU.md` price ABOVE this band and are
  PROPOSED — they need CEO approval before any quote uses them.

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
- 2026-08-19 (GHL WAS NEVER DOWN — correcting three runs of learnings): the
  08-16, 08-17 and 08-18 entries above all report GHL as broken. They are wrong.
  `list_locations` fails ("dependencies are not configured") because the
  connection is bound to a SINGLE location and that operation is only meaningful
  for multi-location connections. The API itself is fully live: `get-calendars`,
  `get-pipelines` and `get-location` all return 200, and all 302 operations are
  in scope (scopeFilteredCount: 0). Nothing needed re-authorising. Health-check
  with `get-pipelines`, never `list_locations`. Cost of this mistake: three runs
  of skipped contact/opportunity sync and skipped inbound-reply checks that
  would have worked.
- 2026-08-19 (GHL API limits, hard): the public API can create contacts, custom
  fields, custom values, tags, pipelines, opportunities and calendars. It CANNOT
  create workflows or snapshots — those are UI-only surfaces (verified across
  85 write-operation candidates for workflows, 92 for snapshots; the closest hit
  is `add-contact-to-workflow`, which only enrols a contact in an existing one).
  Any plan that assumes an agent can build a GHL workflow end-to-end is not
  achievable; agents write the spec, a human transcribes it in the UI.
- 2026-08-19 (the connected location is PRODUCTION, not a sandbox): the bound
  location `AtaR2iB3BL1hlhP4oU26` is CloudSpring IT Solutions itself — it holds
  the live EASYCHURCH PH, MYHOMS PH and CLOUDSPRING WEB LEADS pipelines plus two
  PUBLISHED workflows whose triggers the API does not expose. Creating a demo
  contact there could enrol it in a published workflow and fire real outbound
  from the company number. Demo/test contacts must NOT be written to this
  location; a separate sandbox sub-account has to be created in the UI first.
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
- 2026-08-19 (board restructure, NOT a migration): the board question is settled
  — Trello stays. None of the pipeline's failures are Trello limitations; the
  missing leg is GoHighLevel, and the SYNCED TO GHL list is a column standing in
  for a system. Revisit only if humans join the pipeline or active cards pass
  ~300. Two lists added instead, and both now exist on CLOUDSPRING_MAINBOARD:
  BRAND BLOCKED (between STRATEGY READY and MOCKUP READY — see the entry above)
  and FOLLOW-UP DUE (between CONTACTED and REPLIED (HITS), because Trello has no
  sequencer and the day-3/day-7/day-14 touches need a physical place to land).
  The Trello board section above is authoritative for list order — it was drifting
  from the live board and is now reconciled against it.
- 2026-08-19 (CONTACTED backfill was a no-op, and that is the finding): the
  due-date discipline was written to be applied to existing CONTACTED cards, but
  CONTACTED is EMPTY — 0 cards. Nothing has been sent since the derma batch.
  SYNCED TO GHL (SEND MANUALLY) holds exactly 1 card (Custom Cakes by Bam) while
  READY TO SEND holds ~30. So the pipeline's output is not merely un-drained, it
  is un-SENT: no lead is currently in a state where a follow-up could even be
  due. Fixing the approval bottleneck strictly precedes any follow-up sequencing
  work — FOLLOW-UP DUE will sit empty until cards start reaching CONTACTED.
- 2026-08-19 (OFFER-MENU.md added — the boundary on what may be pitched): the
  offer was a ₱1,000–1,500/month website, which is a low ceiling and puts an
  automations agency in the website-vendor category. `OFFER-MENU.md` fixes that:
  every automation gets an ID (`CL-01`…`XC-04`), a one-sentence description, ROI
  in the client's own numbers, and a build state. The hard rule is that nothing
  goes on the menu that is not built, and only the Automation Engineer moves a
  line to `SELLABLE TODAY`.
- 2026-08-19 (what the hard rule actually costs us right now): applying it
  honestly puts EVERY automation line at `IN BUILD` — CLO-11 (engine v1) is
  unstarted and blocked on CLO-6 (GHL down five consecutive runs), and CLO-14
  (n8n) is not confirmed running. So today the menu authorises the website tier
  and nothing else. That is the GHL blocker priced: it is holding closed the gap
  between ₱1,500/month and a ₱5,000–6,500/month stack on every lead in the
  pipeline. Diagnosing the automation pain and sizing it in the owner's numbers
  stays mandatory — it is the promise the menu gates, never the diagnosis.
- 2026-08-19 (mockup forms are NOT lead capture): every `<form>` shipped so far
  is an `onsubmit` handler that opens a `mailto:` in the visitor's mail app.
  Nothing is recorded, nothing replies, and on a phone with no mail client
  configured nothing happens at all. It is fine to ship and fine to sell, but it
  must never be described as lead capture — real capture is `XC-04` and it is
  `IN BUILD`. Checked across the repo, not assumed.
- 2026-08-19 (FX, correcting the 2026-08-18 QA catch): that catch converted
  AUD 450 to "roughly USD 295" and called it below the USD 300 floor. The
  reference rate that day was 1.4068 AUD per USD, which makes AUD 450 = USD 320
  — above the floor. The catch's arithmetic implied ~1.52, an 8% error, because
  it was done from memory. The conclusion still holds (check the floor before a
  draft leaves QA) but the method changes: quote from the dated FX band table in
  `OFFER-MENU.md` (AUD 475–700 + 80–140 · GBP 240–370 + 40–75 · CAD 450–690 +
  75–140, floors carrying an 8% drift buffer), and re-pull the rates when the
  stamp is over 30 days old. The corrected AUD 650 + 110 sits inside the band,
  so nothing needs re-quoting.
- 2026-08-19 (run 2, Cowork scheduled — **BRAND CAPTURE CANNOT RUN IN THIS
  SURFACE, AND THE SCRIPT CANNOT TELL YOU THAT**): the Cowork sandbox routes all
  bash egress through a proxy at localhost:3128 whose allowlist is effectively
  **github.com only**. Measured this run: `github.com` 200 ·
  `graph.facebook.com` 000 · `facebook.com` 000 · `scontent.xx.fbcdn.net` 000 ·
  `raw.githubusercontent.com` 000 · `api.cloudflare.com` 000 · `example.com` 000
  · `yellow-pages.ph` 000. `web_fetch` reaches ordinary websites but returns an
  empty body for a binary image, so it is not a substitute for the picture
  endpoint.
  The consequence is worse than the outage. `capture.mjs` wraps its fetches in a
  bare `catch` and emits the SAME `no-assets` blocker for "the network is
  unreachable" as for "this page genuinely has no logo". Run here, it returns
  `no-assets` for **every lead, always** — including Fast Auto Works, whose logo
  the 04:43 PHT lead-gen run had already downloaded and md5'd from that exact
  endpoint. Left unexamined, this run would have routed the entire day's intake
  into BRAND BLOCKED on manufactured evidence, and BRAND BLOCKED is a HUMAN
  decision queue, so the false verdict would have been read as a human-ready
  finding.
  Two fixes needed, neither applied this run (flagging beats an unattended patch
  to the gate's own dependency):
  (a) `capture.mjs` needs a preflight reachability probe and a THIRD state,
      `capture-unavailable`, which stops the build exactly like `no-assets` but
      routes the card **back to STRATEGY READY**, never to BRAND BLOCKED. A tool
      that cannot distinguish "I could not look" from "I looked and there is
      nothing" must not be allowed to write into a human queue.
  (b) Step 3 must run on a surface with Facebook egress. The 6AM-equivalent
      lead-gen pass reached graph.facebook.com today from a Code Routine, so the
      capability is live — it is this surface that lacks it. Either move step 3
      to that surface or add graph.facebook.com to the Cowork allowlist.
  This is the 2026-08-19 "false blocker" lesson recurring with its sign flipped:
  that entry warned against writing "impossible" when a tool comes back empty.
  The same shape here produces a false NEGATIVE — an empty result presented as a
  confident finding about the lead. Check which of the two you are looking at.
- 2026-08-19 (run 2, NEW ANGLE — "your name is parked for sale"): Fast Auto Works
  (Pasig) does not merely lack a domain. `fastautoworks.com` returns HTTP 200
  with the title "fastautoworks.com is for sale | HugeDomains" — their trading
  name sits on a broker's page with a price on it, buyable by the shop down the
  road. This is a harder version of the 2026-08-16 blank-domain angle: blank says
  "you already paid for this, let's use it"; parked-for-sale says "someone else
  can buy your name this afternoon". Check the candidate domain for a parking
  page as well as an empty body — HugeDomains, Sedo, Afternic, DAN.
- 2026-08-19 (run 2, directory capture — 4th city, stop re-proving it): "auto
  repair shop Pasig City best mechanic" p1 = Yelp (4 result variants),
  StarOfService, InfoisInfo. Not one Pasig shop on its own domain. QC, Makati,
  Pasig, plus dental and derma before them. Treat the PH directory-capture angle
  as established and spend the research budget on the lead-specific variant
  (contradictory listings, invisible branch, parked name) instead.
- 2026-08-19 (run 2, GHL confirmed live a second time): `get-pipelines` → 200,
  all three pipelines returned, CLOUDSPRING WEB LEADS intact. The 08-16/17/18
  "GHL is down" entries stay corrected. Reply triage ran properly for the first
  time: 19 inbound conversations in the location, **zero** on a
  `cloudspring-web-leads` contact — every one is EasyChurch or another product
  line. Nothing to route. The pipeline has exactly ONE opportunity ever created
  (Custom Cakes by Bam, still stage New Lead, created 2026-07-26).
- 2026-08-19 (run 2, the bottleneck is now the whole story): READY TO SEND 25,
  APPROVED 0, CONTACTED 0, FOLLOW-UP DUE 0. Custom Cakes by Bam has sat in
  SYNCED TO GHL (SEND MANUALLY) since 2026-07-27 — 23 days — waiting on a
  copy-paste. All 25 READY TO SEND cards are already marked QA'd; there is no
  agent-side work left on them. Three consecutive runs have now reported this
  queue growing or static with nothing approved. Per the run-report contract that
  makes it a human bottleneck, and the honest reading is that the pipeline's
  constraint is not lead supply, strategy, build or QA — it is that no message
  has been sent to a prospect since the derma batch. Generating more leads into
  this state adds cost and no pipeline.
- 2026-08-19 (run 2, QA check 2 at scale): the independent brand-gate re-check
  fails for all 25 READY TO SEND cards — none of their mockup folders contains
  `brand/brand.json`, because all predate brand capture. This is the known
  2026-08-19 "gate is preventive, not retroactive" position, not a new defect.
  Deliberately NOT routing 25 cards backwards in an unattended run: that is a
  bulk board mutation on a known-and-accepted condition, and it would bury the
  one queue Dei actually needs to look at. Re-capture of the 30+ legacy folders
  stays a scheduled piece of work, and it needs the same Facebook egress as (b)
  above.
- 2026-08-20 (run 1, EGRESS IS SURFACE-SPECIFIC AND MUST BE MEASURED, NOT ASSUMED):
  the 2026-08-19 Cowork entry above says brand capture "CANNOT RUN IN THIS
  SURFACE". That is true of Cowork and false of the Paperclip Code Routine
  surface. Measured here before step 3 was dispatched:
  `graph.facebook.com/cocacola/picture?type=large` -> 200, 28,874-byte PNG ·
  `/nike/` -> 200, 1,852-byte JPEG · github.com 200 · google.com 200 ·
  preview.cloudspringitsolutions.com 200 · yelp.com 403 (bot block, not an
  outage) · yellow-pages.ph 000.
  The trap worth naming: an INVALID Facebook slug returns **HTTP 400 with a JSON
  body** ("Object with ID '<slug>' does not exist"), not a connection failure.
  400-with-JSON means the network is fine and the slug is wrong; 000 means you
  could not look at all. `capture.mjs` collapses both into `no-assets`, which is
  the defect the 08-19 entry asked for a fix to. Until that fix lands, every run
  must probe one KNOWN-GOOD slug first and record the result in the report.
  Rule: never copy an egress verdict from one surface's learning into another
  run. Three lines of curl settles it; an inherited assumption cost three runs
  and 18+ unbranded mockups the first time.
- 2026-08-20 (the "descriptions are too long to edit" blocker was false, and 15
  cards were stuck behind it): CLO-22 left the stale
  `⚠️ GENERIC BRANDING — no brand assets found` line on every rebuilt READY TO
  SEND card, reasoning that `trelloWriteCard`'s 2048-char `desc` cap would
  truncate the humanised drafts. Measured this run: the 17 READY TO SEND
  descriptions run 1,538–2,007 chars. **Every one fits, and removing a line makes
  it strictly shorter.** All 15 stale warnings are now cleared and replaced with
  `✅ Brand verified — captured logo + palette, verify-brand.mjs pass`, after
  running `verify-brand.mjs` independently on all 15 slugs: **15 PASS, 0 FAIL**.
  This mattered because CLO-7's approval digest reads the cards; the false
  warning would have re-flagged all 15 as unbranded and the queue would not have
  drained. Generalisable: a constraint quoted from a tool's schema is a hypothesis
  until someone measures the actual data against it. One `node` one-liner beat
  a day of the queue standing still.
- 2026-08-20 (a FOURTH brand state exists and the config's table does not
  contain it): three folders carry `blockedBy: "logo-not-a-mark"` —
  `powertorq-auto-repair-qc`, `hugoderm-skincare-davao`, `kutis-by-kei-makati`.
  The three-state table above (`ready` / `palette-pending` / `no-assets`) says
  "There is no fourth state." There is. It means a logo file was fetched but the
  image is a photograph or a text-over-photo cover rather than a usable mark —
  the common Facebook case where the page's profile picture is a storefront
  shot. Operationally it is NOT `no-assets`: an asset exists and a human crop can
  rescue it, which is exactly what CLO-31 did for `automotive-1-car-care-qc`
  (cropped the storefront signage, vision-read the palette, now `ready: true`).
  Until the table is amended, treat `logo-not-a-mark` as a BRAND BLOCKED routing
  with a named remedy ("crop a mark from the photo") rather than a dead end.
- 2026-08-20 (a completed handoff can leave its artifact stranded off main):
  CLO-31 was marked `done` on 08-19, but its commit (`8c4d5b5`) sat unpushed on
  the local `clo-22-rebuild` branch. `automotive-1-car-care-qc` therefore looked
  brand-blocked to every reader of `origin/main` while being `ready: true` on
  disk. Pushed this run. The check that catches this is cheap and belongs in
  every run: `git log --oneline origin/main..HEAD` before trusting any "done"
  that claims a repo artifact. An issue status is a claim about work; `origin/main`
  is the evidence.
- 2026-08-20 (lead quality splits by sub-niche, not by niche): Taguig returned
  3 vulcanizing/tire shops and the UK returned 1 mobile mechanic — **0 of 4 have
  an email**, all phone-only. That is the dental/plumbing pattern, not the
  08-17/08-18 auto-repair pattern (5 of 8 emails from QC and Makati auto repair
  shops). The difference is not the niche, it is the sub-niche: full auto-repair
  *shops* publish contact emails on directory listings; vulcanizing/tire stalls
  and one-person mobile mechanics do not. On trade weeks, point the Lead Hunter
  at "auto repair shop" / "car service centre" and away from "vulcanizing" if
  email contactability matters for the day.
- 2026-08-20 (the banned closer is still shipping, at scale): the 08-16 ban on
  the "<positive ask>? If not, <opt-out>" closer has not held. Reading the 17
  READY TO SEND drafts this run, **7 carry the banned shape wearing different
  words** — "Not for you? Reply 'no thanks' and I'll stop there" (Tower of
  David), "reply no thanks and I'll stop here" (Skinthority), "Or reply 'not
  interested' and I'll leave you alone" (DermQuest), "Not interested? No worries,
  I won't follow up" (LimDerm), "reply no thanks and I'm done" (Midwest), "If
  not, I won't message again" (Gulfan), "Not interested? Just say so and I won't
  message again" (Dental Hive). Two also carry the banned "So I built …" pivot in
  disguise: "So I made you one" (Dental Hive) and "So here's one that's only
  yours" (LimDerm). Each of those cards is now flagged in its own description
  with a `⚠️ QA RE-CHECK` line naming the exact phrase.
  The lesson is about how the rule was written, not about the drafts: banning
  phrases bans phrases, and the generator paraphrases. The rule needs to name the
  MOVE — "do not end on a pre-emptive permission-to-decline" — and QA needs to
  check for the move. A ban that a synonym defeats is a style note, not a gate.
- 2026-08-20 (reply triage, third clean run): GHL healthy (`search-conversation`
  -> 200). 19 inbound conversations in the location, **zero** on a
  `cloudspring-web-leads` contact — every one is EasyChurch, MyHoms or an
  unrelated Messenger thread, and the newest is from 2026-07-31. Nothing to route
  to REPLIED (HITS). This is now the expected result and will stay the expected
  result until a card reaches CONTACTED: with APPROVED 0 and CONTACTED 0, there
  is no prospect who could reply. Reply triage cannot find a reply to a message
  that was never sent.
- 2026-08-20 (step 6 QA, NEW SLOP PATTERN — the banned pivot survives as "I've
  built a page…"): the 5 brand-new READY TO SEND cards from step 5 today (East
  Mids, J.B Javier, Pcars, Fast Auto Works, Automotive 1) all independently
  opened their pivot sentence with "I've built a page…". That is the exact same
  MOVE as the banned "So I built…" clause with the "So" sanded off — a shared
  skeleton across 5 of 5 drafts in one batch, which the batch-variation rule
  bans on its own even before the pivot question comes up. Add "I've built a
  page/one/this" to the banned-pivot family alongside "So I built…" and "I
  built you one" — ban the MOVE (announcing the build as the transition into
  the pitch), not any one wording of it. Rewrote all 5 to open the pivot with
  the concrete fact the page proves ("That page nobody else controls now
  exists…", "This page settles it…", etc.) instead of announcing that a page
  was built.
- 2026-08-20 (step 6 QA, the 8 flagged RE-CHECK cards resolved): every card the
  same run had tagged `⚠️ QA RE-CHECK` for a paraphrased opt-out closer or pivot
  (Tower of David, Dental Hive, Skinthority, Dermhaus, DermQuest, LimDerm,
  Midwest, Gulfan) is now rewritten — closers replaced with a direct next-step
  ask instead of a pre-emptive permission to decline, no two sharing wording.
  Brand gate re-run independently on all 13 touched cards (5 new + 8 re-check):
  13/13 PASS. Pricing re-checked against the config/OFFER-MENU bands for all 13
  (PH ₱1,000–1,500/mo, UK GBP 300 build + 55/mo inside the 240–370 + 40–75 band,
  US build 300–500 + 50–100/mo): all in band. Menu boundary: none of the 13
  drafts name an automation ID as a promise — website tier only, as required
  while every automation line stays `IN BUILD` per OFFER-MENU.md. No card was
  moved list-wise; QA marks the description in place and APPROVED remains the
  human's call.
- 2026-08-20 (closeout, MOCKUP READY held 10 cards that were never built): at the
  end of the run MOCKUP READY showed 10 clinic cards and READY TO SEND showed 22,
  which reads like a healthy build queue. It was not. All 10 still carried
  `Mockup URL: (Agent #2 fills)` in their descriptions, and all 10 slugs
  (`smilehq-dental-makati`, `ivory-smile-dental-makati`, `sk-dental-makati`,
  `family-smiles-dental-taguig`, `smile-specialist-cebu`, `medika-davao`,
  `childrens-medical-clinic-davao`, `dr-jewelyn-calimbas-taguig`,
  `parkview-clinic-makati`, `pioquinto-clinic-pasig`) contain only `brand/` on
  `origin/main` — no `index.html`, so nothing was ever deployed for them.
  The cause is this config, not the agent that moved them. The BRAND BLOCKED
  paragraph used to say a brand-repaired card "re-enters at MOCKUP READY", so a
  brand-capture sweep that fixes 10 cards correctly follows the written rule and
  drops 10 unbuilt cards into the built queue. Step 4 then misses them — its
  backlog source is STRATEGY READY, by definition — and step 5, which drafts
  from MOCKUP READY, is one careless run away from writing outreach that points
  at a mockup URL that does not exist. Nobody skipped a step; the graph was
  wrong.
  Fixed both ways this run: the 10 cards moved back to STRATEGY READY (MOCKUP
  READY is now 0, STRATEGY READY 22), and the entry condition is now written
  down — MOCKUP READY requires a deployed `<slug>/index.html`, and brand repair
  routes to STRATEGY READY.
  The general lesson is about queue-depth reporting: a queue count is only
  evidence if the cards in it satisfy the list's entry condition. Every run
  report so far has counted cards. From now on, spot-check the *condition* on
  any queue that grew — for MOCKUP READY that is one `git ls-tree` for
  `index.html` per slug, which is what caught this.
- 2026-08-21 (step 2 — the domain check needs an NS lookup, not just a body
  check): the cheap check as written says "fetch the candidate domain looking
  for a 200-with-empty-body". That phrasing nearly missed the best find of the
  run. `noecar.com` — the trading name of a Cebu lead whose card said
  `🌐 none` — answers **200 with a 114-byte body** that JS-redirects to
  `/lander`. It is not empty and it is not blank; it is a domain-marketplace
  parking page, and the decisive tell is the nameservers:
  `ns1/ns2.afternic.com`. Same shape as the Fast Auto Works catch, found a
  different way. **Add the NS lookup to the check** — it is one command and it
  distinguishes "the owner has an empty domain" (their asset, BD-01 applies)
  from "someone else is selling the domain with their name on it" (a much
  sharper opener, and BD-01 does *not* apply because they don't control the
  registrar):
  ```
  curl -s -o /dev/null -w "%{http_code} %{size_download}\n" -L http://<domain>
  nslookup -type=NS <domain>          # afternic / sedo / dan / hugedomains = parked
  ```
  A 500 is worth recording too: `yorkautorepair.com` is registered on GoDaddy NS
  and serves a bare IIS "500 - Internal server error", which is evidence for the
  name-collision angle (page one for their name has no page they control) but is
  *not* evidence they own it. Never tell an owner a domain is theirs on NS data
  alone.
- 2026-08-21 (the cheapest PH contradictory-listings check found so far):
  `ph.near-place.com/<slug>` returns, in one fetch, the listing's address, its
  phone *as the directory actually stores it*, a seven-day hours grid that shows
  `no info` explicitly, and a distance-sorted list of every rival nearby. For
  Complete Automotive Repair (Lahug) it showed a phone truncated to `+63`, all
  seven days blank, and 26 rivals beneath — while `infoisinfo-ph`'s Cebu
  car-repair page omitted the shop entirely and listed six rivals instead. Two
  pages, one says they have no hours, the other says they don't exist. That is a
  stronger and more honest line than "you rank poorly", and it cost two fetches.
  Note also that the InfoisInfo result contradicted the step-1 card, which had
  claimed the shop "ranks on Yelp and InfoisInfo-PH" — **verify the first-pass
  ranking claim rather than inheriting it**; here the correction improved the
  angle instead of weakening it.
- 2026-08-21 (lead-quality tags are worth re-checking): a card arrived tagged
  `☎️ PHONE ONLY` while carrying no phone number at all and an active Facebook
  page (Manigos Auto Repair). The tag would have routed it to a human SMS script
  when it is in fact FB-messageable. Step 2 now corrects the channel tag on the
  card when the contact block contradicts it, since step 5 reads the tag, not
  the fields.
- 2026-08-21 (step 6 QA — the build-announcement pivot recurred a FOURTH time,
  in a THIRD wording, in a batch drafted after the 2026-08-20 fix): today's 6
  fresh READY TO SEND cards (SmileHQ, Ivory Smile, SK Dental, Family Smiles,
  Smile Specialist, Manigos) were drafted in a separate step-5 pass from the
  5 cards fixed 2026-08-20. 5 of these 6 independently reused the same MOVE
  under yet another wording — "We've built [URL] for/to you" (Ivory Smile,
  Family Smiles, Smile Specialist ×2) and "It's built and ready at [URL]" (SK
  Dental) — with 4 of the 5 sharing the near-identical "We've built X" reveal
  sentence as a skeleton, not just a phrase. Only SmileHQ, from the same batch,
  drafted the reveal as a stated fact ("This page is what owns that search: X")
  instead of a build-announcement, and it was the one card that passed clean.
  This is the fourth distinct wording of the same banned move logged since
  2026-07-27 ("So I built…" → "So I/we built you one" → "I've built a page…"
  → today's "We've built X for you" / "It's built and ready at X"), and the
  second time in two consecutive runs that a *freshly generated* batch has
  reproduced it after the *previous* batch was hand-fixed — fixing the cards
  does not fix the generator. All 5 rewritten this run using SmileHQ's pattern
  (state what the page already proves; never announce that it was built).
  Per this role's escalation boundary, this is now a role-spec defect, not a
  draft defect: raising to the CEO that step 5 (drafting) needs the MOVE-level
  ban ("never use the fact of construction as the pivot into the link") built
  into its own instructions, not left for QA to keep catching after the fact.
- 2026-08-21 (steps 7-9 — the whole leg was a no-op for the fourth consecutive
  run, and that is now the report's headline rather than a footnote): APPROVED
  0, CONTACTED 0, FOLLOW-UP DUE 0, REPLIED (HITS) 0. Step 7 had nothing to sync,
  step 8 had nothing due, step 9 had nothing to route. This is not a quiet day;
  it is the fourth run in a row where the entire back half of the pipeline
  executed against empty queues while the front half added six more cards. The
  standing instruction "no processed card is left sitting in plain APPROVED" has
  never once been exercised, because nothing has ever been approved. Future runs
  should stop reporting steps 7-9 as "clean" — a no-op is only clean if work
  arrived and was handled. Report them as *starved*, and name the starving
  input: READY TO SEND → APPROVED is a human touchpoint and it has not moved
  since the derma batch.
- 2026-08-21 (the READY TO SEND entry-condition spot-check, run for the first
  time, and the exact method that makes it meaningful): the 2026-08-20 rule says
  spot-check the *condition* on any queue that grew. READY TO SEND grew 17 → 23
  this run, so it got the check, and all 23 passed. The method matters more than
  the result. `preview.cloudspringitsolutions.com` serves a **200 for every slug
  that was never built** — a 514-byte placeholder titled
  `CloudSpring IT Solutions — Previews`. A status-code check therefore passes
  100% of the time and proves nothing. The check that works is content:
  ```
  curl -s -L https://preview.cloudspringitsolutions.com/<slug>/ \
    | grep -q 'CloudSpring IT Solutions .* Previews' && echo NOT-DEPLOYED || echo LIVE
  ```
  All 23 returned the lead's own `<title>` at 21–51 KB. Establish the
  placeholder baseline first by fetching a slug you know does not exist; if that
  ever stops returning 514 bytes, this check needs rewriting before it is
  trusted. BRAND BLOCKED also grew (24 → 27) and was checked its own way: all
  three new cards carry `logo: null` + `logoFiles: []` in `brand/brand.json` and
  no `index.html` in the tree, so nothing was built on an invented palette.
- 2026-08-21 (reply triage returns nothing and will keep returning nothing —
  write down why so no future run re-derives it): GHL inbound holds 19
  conversations. Every single one is EasyChurch or MyHoms; **zero** carry the
  `cloudspring-web-leads` tag. Two of them are live commercial questions
  ("how much is the platform cost for 301 residents?", "Ang aming subdivision ay
  mayroon ba?") but they belong to other products and other boards, and this
  run's step 9 correctly routed none of them. Step 9 is structurally incapable
  of finding a web-leads hit until a card reaches CONTACTED, because a reply
  requires an outbound message and this pipeline has sent none. Check the tag,
  not the inbox depth.
- 2026-08-21 (the run's actual finding was not in steps 7-9 at all — it was a
  blocked issue with nothing blocking it): `OFFER-MENU.md` says every automation
  line is `IN BUILD` and the website is the only sellable line, and it names
  CLO-11 (Speed-to-Lead + Booking Engine v1) as the sole remaining gate. CLO-11
  was sitting in `blocked` since 2026-08-19T00:11Z with `unresolvedBlockerCount`
  0, no `unblockDescriptor`, and its only blocker (CLO-6) `done`. Nothing was
  holding it. Moved off `blocked` by the CEO this run; the Automation Engineer
  owns the sign-off row. Sized in the pipeline's own numbers: 23 QA-passed cards
  with verified-live mockups can today be offered ₱1,500/month, and with CLO-11
  signed off they are ₱5,000–6,500/month. The general lesson matches the
  queue-depth one: a status is only evidence if the thing it claims is true.
  `blocked` deserves the same spot-check a queue count gets — read
  `unresolvedBlockerCount` before repeating "blocked" as a fact.
- 2026-08-21 (two commits from this same run were never pushed, and the run
  report would have counted them as landed): at the start of this leg,
  `git log origin/main..HEAD` showed CLO-46 (step 6 QA, including its learnings
  entry) and CLO-48 (the brand.json hex-format fix) committed locally and absent
  from `origin/main`. Both were pushed from here. A step that commits is not a
  step that shipped; the closing leg of every run should diff against
  `origin/main` before writing the report, because the report is read as the
  record of what landed.
- 2026-08-21 (the daily run had a second, dead copy of itself sitting on the
  board, assigned and one status change away from running): closing out the run,
  the board held **two** issues titled "Daily pipeline run (Asia/Manila)". The
  live one is the routine that produced CLO-41..CLO-47. The other was created
  2026-08-18T23:00Z with a byte-identical description, its run died in terminal
  recovery 54 seconds later, and Paperclip auto-moved it to `blocked` with the
  note "no live execution path". It then sat untouched for three days. Checked
  before touching it, exactly as this log now requires for any `blocked` claim:
  `unresolvedBlockerCount` unset, `blockedByIssueIds` empty, `unblockDescriptor`
  null. Nothing was blocking it — it was a dead instance, not a waiting one.
  Cancelled it. This is the same failure the run description warns about in
  words ("do not re-create a second lead-gen job... a full day's quota was
  silently absorbed twice"), arriving by a route the warning does not cover:
  nobody created the duplicate on purpose, **run recovery did**, and it parked
  it in a status that reads as "needs attention" rather than "should not exist."
  Standing check for the closing leg of every run: list issues by title and
  confirm the daily run is exactly one live card. A recovery-orphaned routine is
  not a blocker to resolve, it is a duplicate to cancel.
- 2026-08-22 (step 2 — a new cheapest-PH contradictory-listings source, and the
  403 map that made it necessary): the 2026-08-21 pick, `ph.near-place.com`,
  **403s from this surface**, and so do `ph.polomap.com` and `directmap.ph`,
  browser UA or not. What works from here is `davaostart.com/business/<slug>/`
  and `ph.onsono.com/<slug>/`. DavaoStart is the better of the two: one fetch
  returns the phone *as the directory stores it*, an `OPEN` badge with **no
  hours grid at all**, the rating and review count, a **"Claim this business"**
  button — which is the proof the listing is not the owner's — and one named
  rival underneath. For Kareha Autoworks it stored the phone as `321-6753`
  while `ph.polomap.com` and their own Facebook both carry `0917 701 9097`:
  two pages about one shop, two different numbers, found in two fetches.
  Onsono adds a tell of its own — it runs its **own enquiry form** on the
  listing page, so a lead typed into the page that ranks for the shop's name
  goes to the directory, not the shop.
- 2026-08-22 (a 200 that is not content, second species): `all-opening-hours.ph`
  answers **200 with 565 bytes** — an "Are you human? What is: 4 plus 1 =" form
  plus the caller's IP. Same class as the `pages.dev` root placeholder logged
  2026-08-21: status code proves nothing, size and content do. Any directory
  probe should print `%{http_code} %{size_download}` together and treat a
  sub-1KB 200 as a block, not a page.
- 2026-08-22 (NEW EVIDENCE TYPE — the `tel:` audit, for leads that already own a
  site): grep the fetched HTML of each page for `tel:`. Mann & Machine (VT) has
  click-to-call on `/about-us/` and `/services/` and **none on the homepage or
  `/contact-us/`**, where `802-434-7054` sits as plain text in an H1 that reads
  "Call us today" and an H4. The two pages a customer actually lands on are the
  two they cannot tap. This is `W-03`, it is `SELLABLE TODAY`, and it is
  checkable on the owner's own phone in ten seconds. Note the near-miss: a
  homepage-only check would have produced "no click-to-call anywhere", which is
  **false** — audit every page before making a whole-site claim.
- 2026-08-22 (the domain check inverts for a lead that already has a good site):
  GMS Auto Care Center runs a live 135KB WordPress site, so blank-domain does
  not apply — but the *second* domain does. Google still indexes
  `gmsautocare.com/contact/` for their name and that domain is **NXDOMAIN**: a
  dead click on a page ranking for the business. Add three Facebook pages for
  the one name (`/GMSautocare01`, `/gms.autocare`, and "GMS Autocare Center &
  Auto Supply Davao") and the angle is name collision, not invisibility.
  The other half came from their own footer rather than any directory: five
  contact numbers on four networks (PLDT, 2× Smart, Globe, TM). Grep the lead's
  own site for phone numbers — the contradiction is sometimes theirs, not the
  directory's, and it is the honest way into the `TR-01` diagnosis.
- 2026-08-22 (worth the CEO's attention — 2 of today's 4 leads already own a
  real site): GMS Auto Care Center and Mann & Machine both run live,
  content-bearing WordPress sites. The website tier is a weak fit for them and
  their pain is entirely automation-shaped — GMS already collects appointment
  requests via a Gravity Form (contact number, plate #, requested date) that
  emails a Gmail inbox with nothing behind it. Both cards were strategised
  honestly against `W-02`/`W-03` and flagged rather than force-fitted to
  `W-01`, but step 1 should weight toward leads with **no** owned site while
  every automation line is `IN BUILD`, or accept that some of the day's quota
  is being spent on leads the menu cannot yet serve.
- 2026-08-23 (step 4 — a THIRD species of parked domain, and the check that
  finds it): the 2026-08-21 entry added an NS lookup to spot afternic / sedo /
  dan / hugedomains parking. Two of today's ten backlog re-verifications turned
  up a shape that lookup misses. `parkviewclinic.ph` and `dentoq.ph` both
  **resolve and return 200 with ~4.6KB** — no NS tell available from this
  surface (`nslookup -type=NS` returned nothing for either `.ph` name), and a
  size well over the sub-1KB "this is a block page" threshold. The body is a
  `<title>Redirecting...</title>` stub whose only URL is
  **`router.parklogic.com`**, an ad-monetisation router. So: a resolving domain
  is not an owned domain, and neither NS nor size settles it. **Grep the body
  for the parking router**, which is one command and catches all three species:
  ```
  curl -s -L http://<domain> | grep -oiE 'parklogic|afternic|sedoparking|dan\.com|hugedomains|bodis|above\.com'
  ```
  This is a *better* angle than plain invisibility, not a footnote: someone else
  is selling ads against the lead's own name. Dentoq's is the sharpest — they
  rebranded from "SmilePH Dental Center", directories still rank the old name,
  and `dentoq.ph` is already parked by a third party.
- 2026-08-23 (step 4 — `dradentalclinic.com` is a Romanian clinic): the obvious
  domain for Dr. A Dental Clinic (Davao) resolves, on nsone.net, to "DRA Dental
  – Stomatologie" and redirects to `/ro/`. A live international name collision
  on the exact domain the owner would reach for. Worth checking on every lead
  whose name reduces to a short generic acronym — same family as the CAR-X /
  carx.com finding from 2026-08-22, found by domain rather than by search.
- 2026-08-23 (step 4 — the brand.json bare-hex-string bug regressed, and it
  hard-fails the gate): 7 of the 14 folders built today arrived from the
  2026-08-22 capture with `colors.brand` as bare strings — `["#C84451","#6B4C41"]`
  instead of `[{hex,weight}]`. That is the exact defect CLO-48 fixed on
  2026-08-21. `verify-brand.mjs` does not merely fail those folders, it
  `process.exit(1)`s at the parse, so the gate output is a format error rather
  than a brand verdict and the real state of the palette is never reported.
  Normalised all 7 this run. **The capture path needs the same shape check the
  gate has**, or this returns a third time — a fix applied to the data and not
  to the writer is a fix with a shelf life.
- 2026-08-23 (step 4 — vision-read palettes that were actually CSS named-colour
  guesses): re-reading all 12 captured logos before building turned up four
  hexes that are not in the images they came from. Three are CSS *named colours*
  — `#DC143C` is `crimson` (Kareha), `#FF69B4` is `hotpink` and `#17A2B8` is
  Bootstrap's `info` (509 Family Care) — and `#7BA1D1` is a blue recorded for
  Dr. Letigio, whose profile photo is a coral top on a grey studio backdrop with
  no blue anywhere in frame. A named colour appearing in a "vision" read is the
  tell: a real read lands on arbitrary values like `#2FA39B`, never on the
  sixteen colours everyone can name. **Treat a CSS keyword hex in
  `colors.source: "vision"` as unverified and re-read the logo.**
- 2026-08-23 (step 4 — two real defects in the gate's business-name check,
  reported not patched): (a) it compares `brand.name` against raw HTML, so any
  name containing `&` fails once the page escapes it to `&amp;` — Mann & Machine
  blocked on this today even though the name was on the page four times. (b) it
  splits the name on `[|\-–]` and keeps only the first part, so **"CAR-X SHOP
  DAVAO" is checked as the word "car"**, which any auto-repair page passes by
  accident. The hyphen split exists to strip site-title suffixes; it should
  split on ` - ` / ` | ` with surrounding spaces, and decode entities before
  comparing. Fixed the *data* this run (the name is now written literally on the
  page, as it already was for the other 13) and left `tools/` alone: editing the
  enforcement mechanism in the same run it blocked you is the move this config
  bans, even when the edit would be an improvement. **Owner: whoever owns
  `tools/brand-capture/`.**
- 2026-08-23 (step 4 — capture wrote two folders per lead, and the run has to
  pick): the 2026-08-22 capture created BOTH a short and a geographic slug for
  most leads (`dentoq-dental` *and* `dentoq-dental-davao`, `medika-davao` *and*
  `medika-diagnostic-davao`, and so on for 11 leads), with the palette work
  split unevenly between them — the `-davao` variants of Tooth Doctors and
  Dentoq hold only ONE hex each and would fail the two-colour check, while their
  short-slug twins hold two. Chose per folder on "ready, and >=2 usable hexes",
  wrote the chosen URL into each card so the choice is now recorded rather than
  re-derived, and left the orphan folders in place (they carry no `index.html`,
  so the hook does not gate them and nothing deploys). **Someone should prune
  them**, and capture should not mint a second slug for a lead that already has
  a folder. Board note: STRATEGY READY held **14** cards at build time, not the
  17 the 07:00 measurement showed — step 3 moved 7 to BRAND BLOCKED after the
  count was taken. Re-read the list before trusting a queue depth from earlier
  in the same run.
- 2026-08-23 (step 6 — em-dash tic RECURRED, generator defect not a draft
  defect): 4 of the 14 fresh drafts (Medika, Dentoq, Parkview, Dr. Mylene
  Letigio) shipped with TWO em-dashes each, all four in the identical shape
  `X—clause—Y` (a parenthetical aside), against the 2026-08-16 ban of "an
  em-dash as the default clause separator, ~1 per paragraph". This is the
  second time this exact tell has been caught (first: 2026-08-16, banned
  explicitly that day) and it reproduced in a batch drafted entirely after
  the ban existed — not a stale-instruction case. QA fixed all four in place
  (comma/colon/parens instead of the second dash) rather than blocking the
  cards, since the fix was mechanical and did not touch the underlying
  claim. **Escalating per role spec: this is a role-spec/generator defect for
  the CEO, not something QA fixing the symptom each run actually resolves.**
- 2026-08-23 (step 6 — two menu-boundary near-misses, routed to CHANGES
  REQUESTED): GMS Auto Care's draft described the mockup as having "your
  Gravity Form that captures contact number + plate + date" (reads as TR-02
  structured intake, IN BUILD) and 509 Family Care's draft offered "a direct
  booking trigger instead of a DM queue" (reads as CL-01 automated booking,
  IN BUILD) — both on a website-only (Tier W) product. Neither drafter named
  an automation ID, which is exactly why these are easy to miss: the OFFER-
  MENU.md check catches named IDs, not functional claims that imply an
  automation without naming one. Worth tightening the drafting prompt to
  forbid verbs like "captures" and "trigger" for anything that is really a
  W-04 mailto: handoff or a W-03 plain link.
- 2026-08-23 (step 6 — no recurrence): the "So I built" pivot clause, the
  opt-out closer, and "[Your name]" placeholders did NOT reappear in this
  14-card batch. Those three specific bans are holding; the em-dash ban is
  not.
- 2026-08-23 (steps 7-9 — starved for a FIFTH consecutive run; the starving
  input is now measured, not just named): APPROVED 0, CONTACTED 0, FOLLOW-UP
  DUE 0, REPLIED (HITS) 0. Step 7 had nothing to sync, step 8 nothing due, step
  9 nothing to route. GHL was healthy throughout — `get-pipelines` returned 200
  with all three pipelines including CLOUDSPRING WEB LEADS, so for the first
  time in this streak the back half was starved by the board alone and not by
  the CRM. The starving input is READY TO SEND -> APPROVED, a human touchpoint,
  and it is getting worse rather than holding: 17 -> 23 -> **35** over three
  runs while APPROVED stayed at 0. All 35 are QA-passed with a verified-live
  mockup. The front half added 12 more cards to a queue that has never once
  drained. Reporting this as "clean" was the error the 2026-08-21 entry
  corrected; reporting it as "starved" without the trend is the next-order
  version of the same thing.
- 2026-08-23 (the BRAND BLOCKED entry-condition spot-check earned its place on
  its first run — duplicate slugs now MIS-ROUTE LEADS, not just litter disk):
  BRAND BLOCKED grew 27 -> 34, so it got the check the 2026-08-20 rule requires.
  One of the seven arrivals fails the entry condition outright. **Esmino
  Pediatric Clinic** moved to BRAND BLOCKED on a `no-assets` verdict from a
  slug minted today, `esmino-pediatric` — while `esmino-clinic-qc`, captured
  back on CLO-39, already held `logo-facebook-profile.png` at 192,256 bytes and
  `blockedBy: palette-pending`. Re-probed live from this surface:
  `graph.facebook.com/esminoclinic/picture?width=1200&height=1200` returns
  **200 / 192,256 bytes**, byte-identical to what CLO-39 stored. The assets
  exist, the endpoint works, and the lead was parked in a human decision queue
  by a second empty folder. `palette-pending` is not a BRAND BLOCKED state —
  the config routes it to step 4 in the same run. Moved back to STRATEGY READY
  with `brand folder: esmino-clinic-qc` written into the card description so
  step 4 does not re-derive the choice. The 2026-08-23 duplicate-slug entry
  asked for the orphans to be pruned as housekeeping; this upgrades it: capture
  minting a second slug for a lead that already has a folder can **cost a lead**,
  because the fresh empty capture outranks the good one that already exists.
  Capture must check for an existing folder before minting a slug.
  **Owner: whoever owns `tools/brand-capture/`.**
- 2026-08-23 (three BRAND BLOCKED arrivals have no capture artifact at all, so
  their verdict cannot be checked): of the same seven, **Cliniqa**, **Eusebio
  Medical Clinic** and **Mother and Child Clinic (Pasig)** have no
  `<slug>/brand/brand.json` anywhere on `origin/main` — searched all 100 folders
  that carry one. Mississippi Dentistry, Centapaeds and Dr. Uy Medical each have
  a committed `no-assets` brand.json and pass. So of seven moves into a human
  decision queue, three are unverifiable and one is wrong. A card may only enter
  BRAND BLOCKED with a committed `brand.json` naming the verdict; without one
  there is nothing for the human to decide against, and the card is
  indistinguishable from one that capture never reached.
- 2026-08-23 (a step's own report counted only half its input): CLO-53's report
  body reads "**Brand-blocked (new): 0** — All 14 leads had extractable assets"
  while seven cards moved into BRAND BLOCKED in that same step, and the issue
  title says so plainly ("21 STRATEGY READY cards — 14 ready, 7 no-assets").
  The body reported the new-lead half of the input and silently dropped the
  backlog half. Both halves went through the same step. When a step processes
  backlog and new together, its report must state both counts separately or the
  queue movement will not reconcile against it — this one only reconciled
  because the board was re-counted independently.
- 2026-08-23 (there IS a fourth `brand.json` state in the data, and the config
  says there is not): the three-state table above ends "There is no fourth
  state." Four folders on `origin/main` carry `blockedBy: "logo-not-a-mark"` —
  `powertorq-auto-repair-qc`, `hugoderm-skincare-davao`, `kutis-by-kei-makati`
  and `rjf-vulcanizing-taguig` — and **three of the four already have a built,
  deployed `index.html`**. No row in the routing table covers this value, so
  there is no defined answer to whether such a card builds, blocks or goes to a
  human, and three of them resolved to "build" without one. Either the state is
  legitimate and the table needs a fourth row, or capture should not be emitting
  it. **Owner: whoever owns `tools/brand-capture/`** — this is a config-vs-code
  disagreement, not a data defect to normalise away run by run.
- 2026-08-23 (the one live card in the back half carries a due date that step 8
  can never see): Custom Cakes by Bam, the July pilot and the sole occupant of
  SYNCED TO GHL (SEND MANUALLY), has `due: 2026-08-21T01:00Z` — two days
  overdue — with `Sent: —` in its description and its GHL opportunity still at
  stage **New Lead**, not Outreach Sent. Nothing was ever sent, so the date is
  measuring nothing. The due-date discipline attaches to CONTACTED and step 8
  sweeps CONTACTED only, so a stamped date on a SYNCED TO GHL card is invisible
  to the sweep permanently and just reads as an overdue follow-up on a lead that
  never got a first touch. Left the date alone rather than clearing it (it is
  the only visible ageing signal) or re-stamping it (that would imply a send
  that did not happen). **Owner: Dei** — send the approved draft and drag to
  CONTACTED, or reject a lead that has now been waiting four weeks.
- 2026-08-23 (step 6 QA, CLO-73 — a new shared skeleton across a WHOLE batch,
  not a recurring phrase: three of eight cards shipped before it was caught):
  every one of the eight CLO-54/71 drafts built today (Medika, Children's
  Medical, Dr. Jewelyn, 509 Family Care, GMS Auto Care, Cartech, Ditoy, Esmino)
  used the identical closer "— Dei" and the identical reveal-sentence template
  "The page at [URL] owns/wins/lists [claims]", and all eight used the same
  rigid CTA formula "Cost: [price], first month free, [N]-month term.
  [Question]?". This is the same class of defect as the banned build-pivot and
  opt-out closer — a shared template the generator produces by default — but
  at batch scope: not one phrase reused, the whole reveal/CTA/closer shape.
  Medika, Children's Medical and Dr. Jewelyn were marked QA'd & humanized
  *before* this pattern was checked against the full batch and already carry
  it. The remaining five (509 Family Care, GMS Auto Care, Cartech, Ditoy,
  Esmino) were rewritten in place to break the shared shape — five different
  closers, five different reveal constructions, no two sharing CTA sentence
  order. Separately, Cartech and Ditoy shared one verbatim sentence outside
  the template ("We measure that when you're ready.") — cut from both.
  Ditoy also carried 4 em-dashes (incl. an X—clause—Y opener) and Esmino 5
  (also X—clause—Y), the same tic flagged twice already this week; both cut
  to 0. **Escalating per role spec — three consecutive QA runs now (08-16,
  08-23 em-dash entry, this one) have caught the same generator producing a
  shared template at increasing scope (phrase -> paragraph tic -> whole-draft
  skeleton). Fixing the symptom per run is not closing the gap; the drafting
  prompt itself needs a rule against a fixed reveal/CTA/closer shape, not
  just a fixed phrase.**
- 2026-08-23 (step 6 QA, CLO-73 — fabricated rival claim, routed to CHANGES
  REQUESTED not fixed in place): Esmino Pediatric Clinic's draft (Batasan
  Hills, QC) claimed ClinicFinderPH lists "CentroMed FC and Guadalupe Health
  Center" as rivals on its listing. Those are the exact two rival names used
  on the unrelated 509 Family Care Clinic card (Guadalupe, Cebu City) — a
  different lead, a different city, geographically implausible as Batasan
  Hills rivals. Esmino's own ANGLE section names no rivals at all, so the
  claim has no support anywhere on the card and reads as copy-paste
  contamination between two same-day drafts rather than researched evidence.
  QA does not have the source evidence to correct this (what, if anything,
  Esmino's real ClinicFinderPH listing actually shows), so per role boundary
  ("a draft resting on a bad angle goes back to the Strategist") it went to
  CHANGES REQUESTED with a named blocking issue rather than being polished
  and shipped. Worth checking whether other same-day drafts share evidence
  fragments the same way — this was caught by inspection, not by a
  systematic cross-draft check.
- 2026-08-23 (CEO run report, CLO-67 — the board had ZERO open issues while
  five consecutive run reports named the same blocker): steps 7-9 have now
  reported STARVED five runs running, and every one of those reports named the
  READY TO SEND -> APPROVED human gate as the cause. Checked the issue tracker
  at the end of this run: **0 open issues.** Nothing on the board was tracking
  the gate, nobody was assigned it, and no wake would ever fire for it. Five
  reports, each correct, each read once, each creating no work — the reporting
  discipline this config asks for was satisfied in full and still produced
  nothing, because a finding written into a run report is a record, not a task.
  Raised as a first-class tracked issue this run with a named owner and a
  pending question rather than a sixth paragraph. **Standing rule from here:
  a blocker that appears in three consecutive run reports must be opened as
  its own issue with an owner; the run report then links to it instead of
  restating it.**
- 2026-08-23 (queue depths, measured card-by-card off the board rather than
  inherited from the step reports): INCOMING LEADS 0 · STRATEGY READY 0 ·
  BRAND BLOCKED **35** · MOCKUP READY 0 · READY TO SEND **39** (39/39 carry
  `✅ QA'd & humanized`, no unmarked card left behind) · CHANGES REQUESTED 6 ·
  APPROVED 0 · SYNCED TO GHL 1 · CONTACTED 0 · FOLLOW-UP DUE 0 · REPLIED 0.
  Two queues flagged for sustained growth: **READY TO SEND 17 -> 23 -> 35 ->
  39, four runs**, and **BRAND BLOCKED 27 -> 34 -> 35**. The working section
  of the pipeline (INCOMING -> STRATEGY -> MOCKUP READY) drained to zero
  cleanly, which is the tell: the front half is healthy and every card it
  produces lands in a queue that has never drained once.
- 2026-08-23 (the `## CHANGES` search was matching the note that says there is
  no `## CHANGES` block — a self-poisoning heuristic): CHANGES REQUESTED
  presented as 7 actionable revisions and was actually 2. The standing stale
  annotation reads "no `## CHANGES` block. Step 4 cannot act. Dei to add one."
  and contains the literal token, so any substring search for the marker
  matches five cards that exist precisely *because* they lack it. Two runs
  have now had to re-read all seven descriptions by hand to find the two real
  ones. Fixed in the step 4 rule above: match `## CHANGES` **line-initial**
  only. A real block starts its own line; the annotation never does, so the
  two separate without touching a single card.
- 2026-08-23 (QA's escalation is closed in config, not re-escalated): step 6
  escalated that three consecutive runs caught the same generator producing a
  fixed template at growing scope, and that banning phrases one at a time was
  not closing the gap. Acting on it rather than logging it again: step 5 now
  names the four axes that must actually vary (reveal sentence, CTA sentence
  order, closer, opener) and requires the day's drafts to be written as a set
  against everything already drafted today; step 6's humanize check now runs
  **batch-wide including cards already marked QA'd earlier the same day**,
  which is the exact gap that let Medika, Children's Medical and Dr. Jewelyn
  ship carrying the shared skeleton. If the same shape recurs after this, the
  defect is the generator and not the rule, and the next escalation should say
  so.
- 2026-08-24 (step 2, CLO-80 — NEW ANGLE: "placeholder site", and it beat every
  other check in the batch): Blessed Veterinary Clinic (QC) owns a live, real,
  364KB WordPress site — so the blank/parked-domain check passes it and the
  directory-capture default would have been the fallback. Reading the site
  instead: `/our-team/` presents four of the theme's demo people as clinic
  staff (Alissa Silva, Cindey Harris and Layla Victoria as "Veterinarian",
  Lucas Tony as "Animal Caretaker") beside their one real vet; `/about-us/`
  has two click-to-call buttons that dial `(+44) 123 456 789` and
  `+880-123-456`; the homepage runs 4x "Lorem ipsum"; and the phone prints as
  "(2) 892 19634" / "+289-219-634", neither of which dials. A site can be live,
  owned and substantial and still be evidence AGAINST its owner. **Add to the
  cheap-check list: on any lead that owns a site, grep the fetched pages for
  `lorem ipsum` and for placeholder `tel:` values (`123456`, `+44 123`,
  `+880`) before defaulting to directory capture.** The existing `tel:` audit
  already says grep every page, not just the homepage — that is what surfaced
  the +44/+880 buttons, which are on `/about-us/` and nowhere else.
- 2026-08-24 (step 2, CLO-80 — a parked domain is only a BD lead if the lead
  owns it): `petvet.ph` serves a ParkLogic router (`router.parklogic.com`,
  tenant `dotph-nxd`) for Petvet Animal Health Clinic. The parking-router grep
  fires exactly as documented, but the domain is unregistered inventory, not
  something they pay for. `BD-01` is "the site goes live on the domain they are
  already paying for" — it does not apply, and pitching it would be a
  fabricated premise. **The parked-domain check has two outcomes, not one:
  parked-and-theirs is the BD angle; parked-and-unclaimed is only supporting
  colour for name collision.** Confirm ownership before the domain enters the
  offer half.
- 2026-08-24 (step 2, CLO-80 — directory reachability, current as of this run):
  `ph.99nearby.com/place/<slug>/<id>` works with a Chrome UA and is the best PH
  surface found this run — it carried the Animal House contradiction (clinic at
  737 Aurora Blvd / QC 1112, its three named vets at 704 Aurora Boulevard /
  QC 1100, "0.50 KM away", on the same page). `topvet.net` publishes
  schema.org `openingHoursSpecification` in the page source, which is how the
  Williams River contradiction was measured rather than eyeballed — worth
  reaching for first on AU/UK/US leads. Still blocked with a Chrome UA:
  `ph.onsono.com` (403). New this run: `www.pinoylisting.com` returns an
  expired TLS certificate, and `www.yellow-pages.ph` fails to connect (000,
  not 403) — neither is a UA block and neither is worth retrying.
- 2026-08-24 (step 4, CLO-82 — capture committed `brand.json` without the logo
  files, and the deploy gate cannot see it): CLO-81 committed four brand.json
  files whose `logoFiles[]` named images that were never `git add`ed — all eight
  images sat untracked in the working tree while the JSON that references them
  was on `origin/main`. Step 4 found them only because `git status` was read
  before committing. **The gate would have passed all four folders anyway:**
  check #1 asks whether the logo *filename appears in index.html*, not whether
  the file exists on disk or in the commit. A mockup can therefore satisfy every
  one of the six checks, pass the pre-push hook, deploy, and serve a broken
  image to the prospect — which is the exact outcome the gate exists to prevent.
  Two rules from this: **capture commits the images in the same commit as the
  brand.json that names them**, and the next person in `tools/brand-capture/`
  should add an existence check on `logoFiles[]` — cheap, and it closes a hole
  that a filename-substring test structurally cannot.
- 2026-08-24 (step 4, CLO-82 — a captured logo is not automatically the lead's
  logo): Blessed Veterinary Clinic's site-scraped "logos" are `brand_01.png` and
  `brand_02.png`, both scored 90 as `img marked logo`. Vision-read, one is
  **"CUTEDOGS ESTD 2018"** and the other **"THE HORSE"** — WordPress theme demo
  assets sitting in the theme's own upload folder. The scoring heuristic cannot
  tell a demo asset from a brand asset, because on a placeholder site they
  occupy the same markup position. The same folder's site-CSS palette is
  theme-derived for the same reason. **On any lead already flagged
  `placeholder site`, treat every site-scraped asset as suspect and vision-check
  it against the Facebook mark before using it or its colours.** Here the FB seal
  was the real mark and two of the six captured hexes (`#39599e`, `#4ab866`)
  matched its blue dog and green cat; the build anchored on those two and
  ignored the rest. This is a narrower cousin of `logo-not-a-mark`: the file IS
  a logo mark, just somebody else's.
- 2026-08-24 (step 4, CLO-82 — orphan slug folders now look like backlog): 15
  top-level folders hold a `brand/brand.json` with no `index.html`, and 13 are
  duplicate slugs for leads that already have a live mockup (`509-family-care-cebu`
  vs the built `509-family-care`, `fast-autoworks` vs `fast-autoworks-pasig`,
  `mann-machine` vs `mann-machine-vt`, `tooth-doctors-davao` vs
  `tooth-doctors-dental`, and nine more). Two of them sit at `ready: true`. A run
  that scans the repo for "branded but unbuilt" folders — a reasonable way to
  look for backlog — reads those two as work, and building either would create a
  **second URL for a lead that already has one**, which no rule downstream would
  catch. Backlog is defined by the STRATEGY READY list, never by a repo scan.
  The cleanup itself is CLO-77's; what is new is that leaving it has acquired a
  way to cause a wrong build rather than just clutter.
- 2026-08-24 (step 6 QA, CLO-84 — the step-5 self-report's own quality checks
  were wrong on two axes, not just missing a check): CLO-83's run report
  (2026-08-24, 6 drafts: 4 new vet cards + 2 redrafts) certified "No
  contractions — all drafts use full forms" as a batch-wide **pass**. That is
  backwards — contractions are the hard rule (this section, check 1) — and
  all six drafts had zero contractions, the same defect on every single card
  in the batch, not a one-off. The same report also certified "No em-dash
  abuse — X—clause—Y pattern eliminated" as a pass; Petvet's draft had two
  X—clause—Y pairs (four em-dashes) in the opener and the reveal sentence.
  Both false-pass claims came from checking each draft in isolation rather
  than re-reading the actual sentence against the rule text. Separately, the
  report's four-axis comparison table only cross-checked the 4 new cards
  against each other — the 2 same-day redrafts were compared to nothing.
  That gap produced two skeleton collisions the table couldn't have caught:
  Blessed and Esmino shipped the *verbatim identical* CTA sentence ("Cost:
  [price], first month free, [N]-month term."), and Animal House and Esmino
  shared the "This page [verb]s [claim]: [URL]" reveal skeleton — exactly the
  generic shape banned by name in step 5. A third collision (Williams River
  and ZP Smiles both opening "Your page is live at [URL]") shows the same
  redraft-blind-spot in reverse: a new card collided with a redraft. All six
  cards also closed "— Dei" identically, reproducing the 08-23 CLO-73 defect
  this section already names as resolved. Fixed all six in place (added
  contractions; cut Petvet's em-dashes; reworded the three colliding reveal/
  CTA constructions; varied all six closers) rather than routing back — no
  fact or angle needed to change, only phrasing. **Rule going forward: the
  batch-wide axis check (reveal, CTA, closer) must run across every draft
  written that day regardless of whether it is a new card or a same-day
  redraft** — the axis table has to be one list, not "new cards" and
  "redrafts" checked separately. And a report's own pass/fail claims are not
  evidence QA can skip re-deriving; this is the second run (after 08-23's
  Esmino fabrication) where the defect was exactly what an upstream
  self-report said had been checked and passed.
- 2026-08-24 (CEO closing leg, CLO-78 — the queue-depth measurement this
  section asks for cannot be taken with the tool the last runs used): the
  Trello MCP read path silently truncates, and it does not say so.
  `trelloReadList` action `get` embeds **at most 25 cards** with no cursor
  parameter and no truncation flag — READY TO SEND and BRAND BLOCKED both
  came back as exactly 25 and looked like complete lists. `trelloReadCard`
  action `list_by_list` paginates properly, but its `totalCount` is
  **page-scoped, not list-scoped**: called with `limit=1` it returns
  `totalCount: 1` for a 35-card list, so totalCount must never be read as a
  queue depth either. **The only correct depth measurement is
  `trelloReadCard` / `list_by_list` with `limit=50`, counting `nodes` and
  confirming `pageInfo.hasNextPage` is false.** Measured that way today:
  READY TO SEND **48**, BRAND BLOCKED **35**. Both exceed 25, so both are in
  the range where the old method silently under-reports — and these are
  precisely the two queues this config asks every run to watch for growth.
  Yesterday's report put READY TO SEND at 39; reconciling card-by-card, the
  48 is today's 6 drafts plus the 4 cards CLO-76 returned from CHANGES
  REQUESTED late on 08-23 (after that report was written), which accounts for
  47 — the remaining 1 is an off-by-one in the inherited 39, not a card that
  moved. Do not carry a queue depth forward from a previous report; re-measure.
- 2026-08-24 (CEO closing leg, CLO-78 — CHANGES REQUESTED 6 -> 1 looked like
  four cards silently escaping a human gate, and was not): DermQuest, Gulfan,
  LimDerm and Midwest Skin Care left CHANGES REQUESTED with no step report
  claiming the move, which reads exactly like drafts re-entering the send
  queue without their revision. Reading the card description settled it in one
  fetch: each carries `↩️ 2026-08-23 (CLO-76): back to READY TO SEND. QA
  RE-CHECK resolved 2026-08-20 with 7 siblings; 4 of 8 moved back that run,
  this one did not.` It was the sanctioned repair of an incomplete agent move,
  not a bypass. **Before reporting a card as having skipped a gate, fetch its
  description — the audit trail lives there, not in the step reports**, and a
  move made after the previous run's report was written will never appear in
  any step report. Consequence for the tracked issue: CLO-75 ("5 CHANGES
  REQUESTED cards have no `## CHANGES` block") is now stale — 4 of the 5 are
  resolved and only One World Skin & Wellness still needs Dei.
- 2026-08-24 (CEO closing leg, CLO-78 — step 5 wrote outreach drafts into the
  working tree of a PUBLIC repo, and nothing was ignoring them): the run left
  `CLO-83_STEP5_REPORT.md` and `drafts_2026-08-24.txt` untracked at the repo
  root, the second containing the full send-ready copy for four leads. No step
  report or draft file has ever been committed here (checked with
  `--diff-filter=A` across all history), so they are scratch — but the repo had
  **no `.gitignore` at all**, so a single `git add -A` by any agent in the
  chain would have published prospect outreach copy to a public repository.
  Added a `.gitignore` covering `*STEP*REPORT*.md`, `drafts_*.txt` and the
  capture/move scratch JSON. Step artifacts belong on the Trello card and in
  the issue thread; if a step needs a file, write it to
  `PAPERCLIP_RUN_SCRATCH_DIR`, never the repo root.
