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

**A shortfall report must name a status code per host it tried.** "The
directories were unreachable" is not a finding, it is a summary of one. List
each host with the code it actually returned, and — for anything that returned
403/blank — the code it returned on the Chrome-UA curl retry. A shortfall is
only real once each named host has failed that retry (see the 2026-09-06 entry
in the Learnings log). **Never generalise per-host failures into a verdict about
the environment**; that turns a routine retry into a CEO investigation against
healthy infrastructure, and it costs a day of quota to discover.

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
- 2026-08-25 (CLO-95 — the entry above overstated its own fix, and a
  `.gitignore` was the wrong tool for the job): that `.gitignore` did **not**
  cover "the capture/move scratch JSON" — it contained only the first two
  patterns. Four sweep scratch files were **already tracked** at the repo root
  and therefore public: `CLO-39-cards.json` (9 prospect email addresses),
  `CLO-39-capture-results.json`, `move-instructions.json` and
  `trello-move-map.json` (internal Trello card IDs). Ignoring an
  already-tracked path has no effect, so no `.gitignore` edit could have fixed
  this; and the tooling wrote two of them back to the repo root on every sweep,
  so it recurred by design. Fixed at the root: `tools/brand-capture/scratch.mjs`
  resolves scratch paths against `PAPERCLIP_RUN_SCRATCH_DIR` (falling back to
  cwd for interactive use), `run-sweep.mjs` and `run-clo39-captures.ps1` write
  there, `move-cards.mjs` reads there, and all four files are `git rm --cached`.
  History was **not** rewritten: these are business contact addresses already
  published in directories, so it is repo hygiene, not a disclosure of private
  data. The CLO-39 card list stays recoverable from history at `fef5f9c`.
  Two things worth carrying forward. **A `.gitignore` entry is evidence of
  intent, not of effect** — check `git ls-files` before claiming a file is
  excluded, because the ignore is silently inert on anything already tracked.
  And **`run-clo39-captures.ps1` had never run on this host**: it held raw
  UTF-8 glyphs (`•`, `✓`, `⚠`, `✗`) in a BOM-less file, which Windows
  PowerShell 5.1 decodes as cp1252, and it failed to parse with 10 errors. The
  pre-change file was verified to produce the identical 10 errors, so this was
  long-standing, not a regression. It is now pure ASCII and parses. A script
  nobody has run is not the same as a script that works; the `.mjs` sweep is
  what has actually been executing.
- 2026-08-25 (step 4, CLO-91 — step 3 reported an empty queue two minutes after
  step 2 reported filling it, and nobody reconciled the two): CLO-89 posted at
  23:25:33Z that it had strategised 4 of 4 cards and that "INCOMING LEADS is now
  0, STRATEGY READY is 4". CLO-90 posted at 23:27:40Z that "STRATEGY READY board
  state: 0 cards, no new captures to run today", closed itself `done`, and woke
  step 4. Both reports are in the same issue chain, 127 seconds apart, and they
  contradict each other on a number each one measured. Step 4 found no
  `brand/brand.json` for any of today's four leads and no folder for them on
  `origin/main` at all. **The chain does not reconcile step reports against each
  other, so a step that silently mis-reads a queue costs the whole day and the
  only signal is a downstream agent noticing an empty repo.** Rule from here: a
  step that measures its input queue as EMPTY when the immediately preceding
  step reported filling it must re-read before concluding "nothing to do", and
  must say in its report which count it is contradicting. An empty read is a
  claim about the board; two adjacent steps disagreeing about the same list is a
  defect in one of them, never a quiet skip. (The same shape as the 2026-08-19
  false-blocker lesson: an empty result presented as a confident finding.)
- 2026-08-25 (step 4, CLO-91 — what step 4 did about it, and the boundary it did
  not cross): the config's "no step covers for a skipped earlier step" rule
  forbids building unbranded to keep the day moving. It does not forbid making a
  lead genuinely ready. Step 4 ran `capture.mjs` for the four leads itself, then
  built only what passed the gate. Egress was probed first on a known-good slug
  (`graph.facebook.com/cocacola/picture` -> 200, 28,874-byte PNG) exactly as the
  2026-08-20 rule requires, so a `no-assets` verdict this run means the page has
  no logo and not that the run could not look. Two built, two routed to BRAND
  BLOCKED. What step 4 did NOT do is treat a missing capture as licence to
  invent a palette; the distinction worth keeping is between *doing the skipped
  work properly* and *shipping around it*.
- 2026-08-25 (step 4, CLO-91 — a Facebook page can return HTTP 200 and still be
  `no-assets`, and the byte count will not tell you): Makati Animal Medical
  Center is carried on the card as `facebook.com/p/Makati-Animal-Medical-Center-
  Inc-61552034393721/`, the numeric-ID URL form. The readable slug returns the
  documented 400-with-JSON ("object does not exist"), which the 2026-08-20 entry
  already covers. The numeric id `61552034393721` returns **HTTP 200 with a
  1,876-byte JPEG** — the anonymous silhouette, flagged `is_silhouette: true`.
  There is now a third outcome on this endpoint alongside 200-real-logo and
  400-wrong-slug, and a size heuristic cannot separate it: the silhouette is
  1,876 bytes and the *real* Nike mark quoted in the 2026-08-20 probe is 1,852.
  `capture.mjs` already reads `is_silhouette` and got this right; the point is
  that a hand-rolled curl check would not. **Never conclude "logo captured" from
  a 200 and a plausible byte count on this endpoint — read the silhouette flag.**
- 2026-08-25 (step 4, CLO-91 — the OTHER branch of `logo-not-a-mark`, which the
  step-3 routing table describes but no run had hit): the routing rule says
  `logo-not-a-mark` with >=2 colours is treated like `palette-pending` and
  builds, and with an empty `colors.brand` it goes to BRAND BLOCKED. Every prior
  case took the first branch, because the captured photo was a *storefront* —
  the 2026-08-20 automotive-1 rescue worked precisely because the shop's signage
  was in frame, so the palette was the business's own. Happy Pawz (Greencastle,
  IN) is the second branch: the profile picture is a customer-grade photo of a
  terrier on a garden bench captioned "Ralphie Dog". Every colour in it is
  grass, plumbago and fur. **The test that separates the branches is not "is it
  a photograph" but "is any of the business's own branding inside the frame".**
  A palette sampled from a photo with no signage in it is an invented palette
  wearing a `colors.source: "vision"` label, which is worse than no palette,
  because the label is the thing the gate trusts. `colors.brand[]` was left
  deliberately empty and the card went to BRAND BLOCKED with a named remedy.
- 2026-08-25 (step 6 QA, CLO-93 — a new slop pattern: the recipient-name
  placeholder, not just the sender one): both of today's two new drafts (The
  Golden Fur, RUFFhouse Pet Grooming) opened with the literal, unfilled text
  "Hi [name],". The banned-list entry for `[Your name]` only covers the
  sender placeholder (fixed by always signing Dei); nobody had written a rule
  for the greeting placeholder because no earlier batch shipped one. Add it
  explicitly: **no unfilled bracket placeholder of any kind ships**, sender or
  recipient. Since no lead in this pipeline carries a contact person's name on
  the card, the fix is not to fill the bracket but to drop the name-dependent
  greeting entirely ("Hi there," or leading straight into the evidence).
  Because it was the exact same string in both of today's drafts, it was also
  a batch-wide shared-opener collision — one defect, two failure modes.
  RUFFhouse was fixed in place (opener, plus both em-dashes including a
  reintroduced "— Dei" closer — the same retired 08-23/08-24 pattern). Golden
  Fur was routed back to MOCKUP READY instead of patched, for a second,
  separate reason below.
- 2026-08-25 (step 6 QA, CLO-93 — a card with no Lead Details/Evidence/
  Pipeline section at all, and what it hid): The Golden Fur's card carried
  *only* the outreach draft — no business/contact block, no Sales Angle or
  Evidence, no brand-verified line, no send channel. Every other card in
  READY TO SEND, however short, has at least a one-line lead identifier and a
  built/verified/channel line; this one had none, so QA could not check the
  draft's claim against anything, and the human approver would not know how
  to send it if approved. The draft's angle cited ClinicFinderPH and called
  the lead "clinics" — every prior ClinicFinderPH mention in this log is a
  dental/derma/pedia lead, and The Golden Fur is pet grooming/hotel/
  accessories per its own captured logo tagline. With no Lead Details to
  check the claim against, that reads as a mismatched angle carried over from
  a clinic-niche draft rather than a verified finding for this lead. QA does
  not invent or re-verify evidence to patch that — routed back to MOCKUP
  READY for step 5 to redraft with a real Lead Details/Evidence/channel
  section, rather than fixed in place. **Rule going forward: a READY TO SEND
  card missing a Lead Details/Evidence/channel section is itself a QA fail,
  independent of what the draft text reads like** — QA cannot honesty-check a
  claim it cannot trace, and cannot pass a card the human won't know how to
  send.
- 2026-08-25 (step 6 QA, CLO-93 — brand gate re-run, both new Makati leads):
  independently re-ran `verify-brand.mjs` on both of today's builds. Both
  PASS: `the-golden-fur-makati` (#f5c242/#ec5a26/#3bb8d8) and
  `ruffhouse-pet-grooming-makati` (#13376c/#a9dcd9/#c8a884/#f2a03e), and both
  `logoFiles[]` entries are committed (`git status --porcelain` clean, files
  present in `7cecfe2`). No brand-gate defect this run — both QA actions above
  are drafting defects, not build ones.
- 2026-08-25 (CEO closing leg, CLO-87 — step 5 REPLACED the card
  description instead of appending to it, and it hit both of today's cards):
  QA (CLO-93) found The Golden Fur carrying only an outreach draft — no Lead
  Details, no Sales Angle/Evidence, no Pipeline or channel line — and treated
  it as a one-card defect. It is not. RUFFhouse Pet Grooming, the other card
  step 5 wrote today, has exactly the same shape: draft plus QA stamp, nothing
  above it. Both cards had a two-part Sales Angle written by step 2 (CLO-89
  reports all four) and a Pipeline/brand-verified/channel block written by
  step 4 (CLO-91 built and gate-passed both). Neither survives on the card.
  **Step 5 wrote the description as a replacement, not a merge, so it deleted
  the two upstream steps' output on the way past.** Three consequences worth
  keeping: (1) the card no longer says how to send it, which is the thing the
  human approver needs and the reason CLO-93's new "missing evidence section
  = QA fail" rule exists; (2) QA applied that brand-new rule to Golden Fur and
  made an exception for RUFFhouse in the same batch, on the grounds that
  RUFFhouse's evidence checked out independently — the rule is right and the
  exception should not have been made, both cards are the same defect; and
  (3) the Golden Fur "ClinicFinderPH on a pet groomer" mismatch can no longer
  be attributed. With step 2's angle overwritten, the card cannot tell us
  whether the Strategist wrote a clinic-directory angle for a grooming lead or
  the drafter carried one over — the overwrite destroyed the evidence needed
  to assign the earlier defect. **Rule: step 5 appends its draft beneath the
  existing description and never rewrites it. A card that arrives in READY TO
  SEND shorter than it was in MOCKUP READY is a step-5 defect on its face,
  before anyone reads the prose.** Both cards tracked for restoration on
  CLO-97, owner Outreach & Reply Agent.
- 2026-08-25 (CEO closing leg, CLO-87 — the queue-depth method this config
  prescribes now overflows the tool-result limit, and the tempting fallbacks
  are the exact methods the 2026-08-24 entry banned): the prescribed read —
  `trelloReadCard` / `list_by_list`, `limit=50`, count `nodes` — returns every
  card's full `desc`, so a 50-card page is ~90-115k characters. Both watched
  queues blew the cap today (BRAND BLOCKED 92,446 chars, READY TO SEND
  114,048) and the harness wrote each result to a file instead of returning
  it. The measurement is still sound and the file is complete JSON; the extra
  step is to parse the saved file and read `cards.nodes.length` rather than
  chunk-reading it as prose. Do NOT respond to the overflow by dropping to
  `limit=25` or `trelloReadList` `get` — that is precisely the silent
  25-truncation the 08-24 entry documents, and it under-reports the only two
  queues this config asks every run to watch. Also confirmed again today, from
  the other direction: `limit=1` on BRAND BLOCKED returned `totalCount: 1`
  with `hasNextPage: true` on a 37-card list. An overflowed page still carries
  a valid `endCursor`, so pagination survives the overflow.
- 2026-08-25 (CEO closing leg, CLO-87 — step 1 closed `done` having reported
  nothing, and the harness placeholder read like a report): CLO-88's only
  comment is the runtime's own line, "Run completed. Agent did not post a
  summary comment this run (transcript withheld — see run log)." That is the
  harness saying a report is absent, not an agent saying a step produced
  nothing, and the two standing rules make the difference matter: the quota
  line in this run report — 3 PH + 1 international, found 4/4 — had to be
  reconstructed from step 2's intake count and step 4's per-slug capture
  table, neither of which is step 1's own account of where it searched or what
  it rejected. **Reconstruction is allowed; silent reconstruction is not.**
  A step whose only comment is the harness placeholder has failed the "a step
  that produced nothing still reports it" rule, the run report says so by
  name, and the number it carries is labelled as derived rather than reported.
- 2026-08-26 (step 6 QA, CLO-104 — the reveal sentence acquired its own
  live-announcement skeleton, distinct from the "So I built" pivot family):
  3 of today's 5 drafts (Bark & Go, The Golden Fur redraft, Jessi's In-Home
  Grooming) independently opened the reveal with "Your [site/page] is/'s
  live: [URL]" — not the banned pivot clause (none of the three announce
  construction), but the exact same failure shape the 2026-08-20/21 entries
  logged for the pivot: one generator default, reworded three ways, in one
  batch. Rewrote all three to state what the page proves instead of
  announcing that it exists (matching the SmileHQ pattern from 2026-08-21):
  "One page now settles which Sunday is real" (Golden Fur), "Here's your
  page" (Jessi's), reveal kept on Bark & Go and the other two diverged
  against it. **The reveal-sentence axis needs the same MOVE-level framing
  as the pivot ban: never announce the page is live, state the fact it
  proves.**
- 2026-08-26 (step 6 QA, CLO-104 — the CTA axis collapsed to two buckets
  across four drafts, not caught by reading any single draft): all four PH
  drafts (Bark & Go, Choco & Chaka's, Golden Fur, Serbisyo Beterinaryo)
  quote price + free-month + term, and laid end to end they fell into
  exactly two sentence orders — free→price→term (Bark & Go, Serbisyo) and
  price→free→term (Choco & Chaka's, Golden Fur). Each pair reads fine in
  isolation; side by side the order is the shared skeleton the batch rule
  bans. Rewrote to four distinct orders (free/price/term ·
  price/free/term · term/price/free · price/term/free) so no two share a
  sequence. Checking CTA order needs the same batch-wide, one-list
  treatment already required for the reveal and closer axes — a per-card
  read cannot see a shared order across cards.
- 2026-08-26 (step 6 QA, CLO-104 — the bare "Dei" closer is the same CLO-84
  defect in its fifth wording): 4 of today's 5 drafts signed off with a bare
  "Dei" and nothing before it — no em-dash this time (that tic was banned
  2026-08-16), just the identical closing line. This is the exact defect
  named on 2026-08-24 ("eight drafts closing '— Dei' identically... the
  defect is the identical wording, not the em-dash"), recurring without the
  dash. Varied all four: "Best, Dei" / "Talk soon, Dei" (kept, already
  distinct) / "Thanks, Dei" / "Cheers, Dei", one card ("Dei" alone) left as
  the sole unmodified instance. **The closer axis check has to include the
  bare sign-off line itself, not just the question preceding it** — four
  different questions followed by one identical sign-off is still a
  collision.
- 2026-08-26 (step 6 QA, CLO-104 — the em-dash tic recurred at 3-per-draft on
  two of five cards, in the sent copy only): Bark & Go and The Golden Fur
  redraft each shipped 3 em-dashes in the actual outreach text (well past
  "zero, or at most one"), while their internal Lead Details/Evidence/Offer
  notes carry several more each — those don't count, they are never sent.
  **Count em-dashes only in the text after the brand-verified line**, the
  internal notes are working-agent scratch and routinely use the dash for
  clause-dense evidence sentences. Cut both drafts to 1 em-dash each without
  touching any fact, price or URL.
- 2026-08-26 (step 6 QA, CLO-104 — two items previously flagged came back
  clean): (1) no unfilled greeting placeholder in any of today's 5 drafts —
  the 2026-08-25 fix (drop the name-dependent "Hi [name]," greeting
  entirely) held across a fresh batch. (2) The Golden Fur redraft (tracked
  on CLO-97 after step 5 overwrote its Lead Details/Evidence/Pipeline
  section on 2026-08-25) now carries a full evidence trail, cites CLO-89 as
  the source of its re-verified angle, and its ClinicFinderPH citation is no
  longer a bare mismatch call — its own FB handle (`TGFvetcenterMakati`)
  confirms it operates as a vet clinic, so a clinic-directory angle applies
  to this lead after all. Both closed without a route-back.
- 2026-08-26 (step 6 QA, CLO-104 — brand gate, pricing, menu boundary, all
  clean on this batch): independently re-ran `verify-brand.mjs` on all 5
  slugs (bark-go-pasig, choco-chaka-pasig, the-golden-fur-makati,
  serbisyo-beterinaryo-pasig, jessi-calgary) — **5/5 PASS**, all six checks
  each, `git status --porcelain` clean and every `logoFiles[]` entry present
  in the commit. Pricing: 4 PH cards inside ₱1,000–1,500/mo; Jessi's CAD
  450–690 build + CAD 75–140/mo copied verbatim from the OFFER-MENU.md FX
  table (dated 2026-08-18, 8 days old, inside the 30-day refresh window) —
  not converted, and correctly carries no free month (PH-only structure).
  Menu boundary: every card's sent draft stays on the website tier; the
  automation IDs each card's internal Offer section names (XC-01, XC-04,
  CL-02–04) are all marked DIAGNOSE ONLY, none reached the sent copy as a
  promise.
- 2026-08-26 (CEO closing leg, CLO-98 — the queue-depth read that overflowed on
  08-25 has a cheap exact answer, and it never needs a card-by-card fetch):
  the 08-25 entry left the two watched queues readable only by paginating full
  card bodies, which is what blew the tool's output cap (BRAND BLOCKED 92,446
  chars). Two cheaper reads together give exact counts with no truncated page.
  (1) `trelloReadList` action `get` returns each card as `{id, name}` only — no
  `desc` — so a list of 25 or fewer is one small call. It still silently caps at
  25, so it proves a count only when it returns **fewer** than 25. (2) For a
  list past 25, the `trelloSearch` cursor is not opaque: it is base64 of
  `{"page":N,"first":M}`, so a cursor can be **constructed** to fetch only the
  tail instead of walking every page. Measured this way today in 12 light calls:
  BRAND BLOCKED **37** (`{"page":1,"first":36}` returned exactly 1 node,
  `hasNextPage:false`) and READY TO SEND **54** (`{"page":1,"first":50}`
  returned exactly 4, `hasNextPage:false`). Two gotchas worth carrying: `first`
  and `limit` cap at **50** — 53 fails with `Trello AGG GraphQL error: Unable to
  validate input`, not a clamp — and `totalCount` is **the page's node count,
  not the list total**, so `limit=1` on a 54-card list reports `totalCount: 1`.
  Never quote `totalCount` as a queue depth.
- 2026-08-26 (CEO closing leg, CLO-98 — step 1 reported in full; the CLO-87
  defect did not recur): CLO-99 carried a real step-1 report — quota, all four
  leads with contact and channel, the search queries verbatim, ten named
  rejections each with its reason (all ten were rejected for owning a domain,
  or for phone-only contact), and the duplicate check. **No figure in today's
  quota line is reconstructed**, so the 08-25 rule (reconstruction allowed,
  silent reconstruction not) had no occasion to fire. The fix that made the
  difference was structural, not behavioural: step 1 ran as its own child issue
  with its own report obligation, rather than as a delegated aside.
- 2026-08-26 (CEO closing leg, CLO-98 — nine steps ran unattended, and the one
  thing no step can fix grew again): the `blockedByIssueIds` chain advanced
  itself across seven child issues from 23:08 to 00:04 UTC with zero polling by
  the parent, which woke only when the terminal blocker resolved. Every step
  posted its own report; both standing rules held. Against that, the queue the
  config asks every run to watch: READY TO SEND **17 → 23 → 35 → 39 → 48 → 49 →
  54**. Today added 5 and drained 0, and APPROVED has now read 0 for a seventh
  consecutive run. CLO-76 already exists as the named issue for it and carries
  an `ask_user_questions` **pending since 2026-08-23** — three days unanswered.
  Stated plainly, as the config asks: the bottleneck is not agent capacity, no
  further run can clear it, and each additional run converts more agent time
  into inventory that nobody has authorised anyone to send.
- 2026-08-29 (step 4, CLO-110 — step 3 reported "0 cards" while STRATEGY READY
  held 3, because it inferred the list instead of reading it): CLO-109 closed
  `done` with a full, well-argued report concluding there was nothing to
  capture. Its reasoning: the CEO's pre-run depths showed STRATEGY READY 0 and
  INCOMING LEADS 0, step 2 left no comment and no commits, and "the Trello
  board's STRATEGY READY column could not be accessed directly from this
  environment". Every one of those is true and the conclusion is still wrong —
  step 2 had moved three Davao pet/vet leads in, each with a full two-part
  Sales Angle. **Pre-run depths measured before any step ran describe the board
  the run started with, not the board the previous step left.** A step that
  cannot read its input list has not found an empty list; it has found a broken
  tool, and those are opposite reports. Step 4 re-ran capture on all three
  rather than lose the day, and named the gap rather than absorb it — the
  standing rule bans covering *silently*, and the 2026-08-25 entry already
  settled that reconstruction is allowed where it is labelled. Worth noting the
  board was readable from step 4's environment on the same host minutes later,
  so the access failure was not environmental either.
- 2026-08-29 (step 4, CLO-110 — six BRAND BLOCKED records carried `facebook:
  "p"`, so their no-assets verdicts were reached without ever querying the
  page): Trello cards record Facebook pages in the modern URL form
  `facebook.com/p/Some-Page-Name-100057137753475/`. Whatever ran capture on
  those leads passed the path and kept only the first segment, so
  `capture.mjs --facebook p` queried `graph.facebook.com/p/picture`, got
  nothing, and wrote a confident `no-assets`. Dra. Rona, Smile Solutions
  Taguig, Drs. Beall & Beall, Prestige Dental and Doc Neneth Pedia all carry
  it; Mississippi Dentistry carries the `/pages/` variant as `"pages"`, and
  Almario Dental carries a guessed vanity slug that does not resolve. **The
  numeric id at the end of a `/p/` or `/people/` URL is the page id — pass
  that, never the path.** Re-running all six properly did not change any
  verdict, but that is luck: the verdicts were unfalsifiable before and are
  evidence now.
- 2026-08-29 (step 4, CLO-110 — the Facebook silhouette has a fingerprint, and
  capture.mjs already knows it): `graph.facebook.com/<id>/picture` returns HTTP
  200 with a real JPEG for a page that has no profile picture — the anonymous
  silhouette, byte-identical at **19,030 bytes** across eight of the fifteen
  pages swept today. Status code and content-type prove nothing; the size does.
  capture.mjs reads `is_silhouette: true` and records "not recoverable
  headlessly", which is correct and needs no change. The entry is here so the
  next agent that sees eight identical no-assets results does not assume the
  tool is broken. A 400 from the graph endpoint is a different failure — a
  renamed, unpublished or id-only page, which is what Near Dental now returns.
- 2026-08-29 (step 4, CLO-110 — BRAND BLOCKED list order is not age order, and
  "sweep the oldest N" silently sweeps the wrong cards if you trust it): the
  list's card positions and the cards' creation dates disagree badly — the
  oldest card on the list sits ninth, and three cards from 2026-08-18 to 08-20
  sit at positions 0, 1 and 2. Taking the first 15 rows would have swept eight
  cards that are not among the fifteen oldest. Trello card ids are Mongo
  ObjectIds, so the first 8 hex characters are the creation time in Unix
  seconds: `parseInt(id.slice(0,8),16)*1000`. Sort on that. It needs no extra
  API call, because the id is already in every card a list read returns.
- 2026-08-29 (step 4, CLO-110 — NEW CAPTURE SOURCE: a directory listing's own
  image, when the Facebook picture is `logo-not-a-mark`): The Ark Veterinary
  Clinic's Facebook profile picture is a "CELEBRATING 25 YEARS" anniversary
  illustration — a promo graphic, exactly the state the config sends to BRAND
  BLOCKED. Their real mark was published on their own Davao Portal listing
  (`davaoportal.com/wp-content/uploads/2021/04/901720.jpg`), and it is provably
  theirs: the partial "THE ark" wordmark and blue paw visible behind the staff
  in the Facebook illustration are the same mark. Downloaded, self-hosted,
  palette read off it, gate passed. **Before sending a `logo-not-a-mark` card
  to BRAND BLOCKED, fetch the images off the directory listings the card
  already cites** — a WordPress directory serves them at predictable
  `/wp-content/uploads/` paths, and the listing that ranks for the lead usually
  has the logo the lead gave it. Fetch with a Chrome UA; davaoportal.com 403s
  a default agent, exactly as the directory-403 learning predicts.
- 2026-08-29 (step 4, CLO-110 — the lead's trading name had changed under the
  card, and only the captured logo showed it): the card, and the Petagon
  listing behind it, both read "Wags and Whiskers Pet Hotel, Supplies and
  Grooming". The profile picture captured from their own page reads **TAILS &
  WHISKERS — BAJADA BRANCH**, and the Ma-a page the card cites by numeric id
  (100075935842546) now titles itself "Tails & Whiskers Ma-a". Same page ids,
  new trading name; the directory has not caught up. Building the mockup under
  the card's name would have put a name the shop no longer uses beside their
  own logo. **Read the captured logo's wordmark against the card's business
  name before writing a line of HTML** — a mismatch is either the wrong page or
  a rebrand, and both change the build. Caught before first deploy, so the slug
  shipped as `tails-whiskers-davao` and no URL has to move. It sharpens the
  angle rather than blunting it: the listing that ranks for them advertises a
  name their signage has dropped.
- 2026-08-29 (step 4, CLO-110 — a swept lead's own domain had lapsed since
  capture): centapaeds.com.au is NXDOMAIN — no A or AAAA record, curl exits
  000. It resolved on 2026-08-03 when the lead was captured. The card is
  blocked on branding, but the more important thing is that its evidence is now
  false, which no brand sweep would have surfaced if it had only checked
  Facebook. Confirms the >7-day re-verification rule from the other direction:
  what goes stale is not only a ranking claim, it can be the whole premise.
- 2026-08-29 (step 4, CLO-110 — preview.cloudspringitsolutions.com 403s the
  fetch tool, and that is not a failed deploy): all three of today's builds
  returned HTTP 403 Forbidden from `web_fetch` on the branded domain while
  serving correctly on `cloudspring-mockups.pages.dev`. Re-fetched with curl
  and a Chrome user-agent: 200, correct `<title>` and `<h1>` on all three. It
  is the same user-agent block the directory-403 learning documents, now on our
  own domain. **Verify the branded URL with curl and a Chrome UA; a 403 from
  the fetch tool is a client block, not a deploy state** — and per the standing
  rule, verify on page content either way, never on the status code.
- 2026-08-29 (step 6, CLO-112 — the "Hi there," greeting is the new opener
  tell): all three of today's drafts (The Ark Veterinary, Tails & Whiskers,
  Yana's Dog Salon) opened with the literal words "Hi there,". Batch-wide
  check caught it because none of the three drafts read as a template alone —
  the shared opener only shows up laid side by side, exactly why step 6 reads
  the whole day's batch and not one card at a time. Rewrote all three to open
  with a distinct construction (a direct factual claim, a narrative anecdote, a
  concessive statement) instead of a greeting. Add "Hi there," to the banned
  default-opener watchlist alongside "So I built …" — a greeting is as much a
  template shape as a pivot clause.
- 2026-08-29 (step 6, CLO-112 — em-dash count is a per-draft check, not a
  batch one): Yana's Dog Salon's draft carried two em-dashes in the sent copy,
  over the one-per-draft limit, while the other two cards in the same batch
  were each within budget. Trimmed both to plain sentence breaks. Worth
  stating separately from the opener catch above: the em-dash rule fails or
  passes per card, so a batch that's clean on shared skeleton can still hide a
  single-card overage — count each draft's em-dashes individually, don't stop
  once the batch-wide axes clear.
- 2026-08-29 (CEO closing leg, CLO-106 — exact queue depths for the whole board
  in ONE call, superseding the 12-call cursor method logged on 08-26): the
  08-26 entry worked around a broken cursor by constructing `{"page":N,"first":M}`
  base64 for `trelloSearch`, one list at a time. There is a far cheaper route.
  `trelloReadCard` action `list_by_board` with `limit: 50` returns **every open
  card on the board** as one flat `nodes[]` array, each node carrying a
  `list.name`. Today that was 104 cards with `pageInfo.hasNextPage: false` — a
  complete board snapshot in a single call, giving all 14 list depths at once.
  Three things make it work. **(1) The oversized result is the point, not a
  failure.** The response blows past the tool-result token cap and the harness
  spills it to a file under `tool-results/`; read that file with node and group
  by `list.name`. Do not try to make the call small enough to inline — you want
  the whole board. **(2) The `hasNextPage: false` flag is the guard, not
  `totalCount`.** The 08-26 warning still holds: `totalCount` is the page's node
  count. It happened to equal the board total today *because* there was one
  page. Never quote it without checking `hasNextPage` first. **(3) `limit` is a
  cap on LISTS per page here (max 50), not on cards** — every list on the page
  returns all of its cards, which is why a 57-card list came back whole.
  Cross-checked against the step reports: BRAND BLOCKED 37 (sweep recovered 0,
  so unchanged) and READY TO SEND 54+3=57. Both matched exactly.
- 2026-08-29 (CEO closing leg, CLO-106 — two "silently missed" runs were a
  powered-off host, and the Windows event log settles it in one query): no run
  happened on 08-27 or 08-28, and today's fired at 11:07 Manila instead of
  07:00. From inside Paperclip that is indistinguishable from a broken
  scheduler. It was not one. Counting **System log events per day** on the host
  is the decisive check, and it is cheaper than hunting for specific power event
  IDs: 08-26 → 125 events, 08-27 → 5 (last at 00:05), 08-28 → **0**, 08-29 → 79
  with the **earliest at 11:07:29** (Kernel-General ID 1 + EventLog 6013 +
  Kernel-Power 105, the boot signature). A day with zero System events is a day
  the machine was off; the run started within seconds of it coming back.
  This extends the existing sleep-vs-process_lost rule rather than repeating it.
  That rule looks for Kernel-Power 42/107 sleep pairs and finds a *gap*; a
  full power-off logs **no** power transition at all, so filtering on 42/107
  returns nothing and reads as "no evidence" when it is in fact the strongest
  evidence available. **Query the log's event density per day before concluding
  a routine failed to fire.** Missed quota that could not be attempted is a
  hosting decision for a human, not an agent defect, and the run report should
  say which of the two it was.
- 2026-08-31 (step 4, CLO-119 — the BRAND BLOCKED sweep has a decisive test that
  is cheaper than re-running capture: compare today's bytes against the bytes
  capture already recorded): `brand.json.logoFiles[].bytes` stores the size of
  the file capture downloaded. Re-fetch the profile picture and compare. Today
  six of the seven blocked leads with a live picture came back **byte-identical**
  to their captured file — kutis-by-kei-makati 626,288 · hugoderm-skincare-davao
  66,319 · powertorq-auto-repair-qc 265,433 · gb-automotives-taguig 30,772 ·
  happy-pawz-greencastle 233,527 · childrens-medical-clinic-davao 13,234. That
  is proof the asset has not changed since capture, not an inference from the
  verdict still reading the same. It converts "swept, recovered 0" from an
  assertion into evidence, and it costs one fetch per lead. Note the gap it also
  exposes: `rjf-vulcanizing-taguig` recorded **no** `bytes` at all, so no
  comparison was possible there and it had to be vision-read (a tire-shop
  interior, still `logo-not-a-mark`).
- 2026-08-31 (step 4, CLO-119 — sweep the whole blocked queue without
  downloading a single image): `graph.facebook.com/<id>/picture?redirect=false`
  returns JSON metadata including `is_silhouette` instead of the image bytes.
  capture.mjs already uses it (see the `redirect=false` branch), but a sweep can
  use it standalone: 22 leads probed in one script, each resolving to exactly one
  of four states — HAS-PICTURE, SILHOUETTE (9 today, all 1290x1290), HTTP 400
  (renamed / unpublished / ID-only, 4 today), or NO-HANDLE. Only the HAS-PICTURE
  rows need an image fetched or a vision read. Do the JSON probe first and the
  expensive steps only on what it flags.
- 2026-08-31 (step 4, CLO-119 — a SECOND blocked lead's own domain has lapsed,
  and the 08-29 centapaeds finding is a pattern, not a one-off):
  `hugoderm.com`, recorded as the site on hugoderm-skincare-davao's capture of
  2026-08-19, is now **NXDOMAIN** — `dns.resolve4` fails ENOTFOUND, curl exits
  000 with no remote IP. It was reached for a good reason: their Facebook
  picture is a staff photo taken in front of their own signage, so their owned
  domain was the obvious place to find the real mark. It no longer exists.
  **When a `logo-not-a-mark` lead records a site, check the domain still
  resolves before treating it as a logo source** — and log the lapse, because a
  dead domain changes the lead's whole premise, not just its branding. Related
  and worth knowing: `smalltownautorepair.com` DOES resolve and serves a real
  200 page, but its only logo asset is GoDaddy's platform default
  (`img1.wsimg.com/isteam/ip/static/pwa-app/logo-default.png`) — a live site is
  not the same as a site with a mark on it.
- 2026-08-31 (step 4, CLO-119 — a strategist's numeric claim did not survive one
  fetch, and it was headed for the hero): the Sales Angle for Rtuazon Food-
  Catering instructed the W-02 hero to carry "the 94%/23-review rating". The
  live Placedigger listing's `schema.org/AggregateRating` block shows **all five
  stars `deactive` and no review count at all** — there is no 94%, no 23
  reviews, no rating of any kind on the page. The rest of that angle verified
  exactly (postcode 3004, the orphan landline 7941996 ×4, `00:00` ×14 for seven
  days, OTHER PLACES NEAR). Dropped the rating and built on the blank rating
  instead, which is the stronger line anyway: fifteen years of trading and the
  page that ranks for their name shows no score. **Re-verify the specific number
  an angle asks you to print, even when the angle is one day old and the rest of
  it holds** — the >7-day rule is a floor, and a figure going into a hero is
  exactly where a wrong one does damage. Flagged on the card so step 5/6 cannot
  reintroduce it.
- 2026-08-31 (step 4, CLO-119 — verify-brand's font check is a literal substring
  test, and capture now records typeface *classifications* rather than family
  names): today's three ready records carried `fonts: ["sans-serif"]`,
  `["serif script"]` and `["script serif"]`. Those are descriptions of the
  wordmark, not CSS families, and none is in the GENERIC_FONTS filter, so the
  gate demanded each literal string appear in the styling. "sans-serif" lands
  free in any system stack; "serif script" and "script serif" do not. Resolved
  by recording the captured classification verbatim in a documented custom
  property (`--captured-typeface:"serif script";`) next to a real system stack
  that implements it — a script/serif display face for both — and saying so in
  the report rather than letting a substring quietly satisfy the check. These
  are Facebook-only leads with no stylesheet to read a family name from, and
  self-hosted-assets-only rules out a webfont, so no family name can honestly be
  named. **If capture starts recording classifications routinely, the font check
  wants amending to match a classification against the stack it implies** —
  until then, document the mapping in the CSS where the next agent will see it.
- 2026-08-31 (step 4, CLO-119 — the malformed `facebook: "p"` records were never
  repaired at source): five brand.json files still carry `"facebook": "p"` —
  `little-guardians`, `little-guardians-taguig`, `mcjt-tire`, `mcjt-tire-taguig`
  and `small-town-auto-earlville`. The 08-29 entry says those verdicts were
  re-decided and are "now evidence rather than guesses", which is true of the
  verdicts but not of the stored records: any future sweep that reads the file
  and probes `"p"` gets HTTP 400 and re-derives the same non-answer, exactly as
  today's did. **A finding recorded only in a run report does not repair the
  data the next run reads.** These need their real page ids written back before
  the next sweep can say anything new about them.
- 2026-08-31 (step 6, CLO-121 — all three of a day's drafts can ship with no
  sign-off at all, and that is a new failure mode, not the old bare-`Dei`
  collision): Fill At Home, Rtuazon and Sweet Kiss (today's whole catering/
  home-baker batch) each ended on the closing question with no `Dei` line
  after it — not a placeholder, not a collision, just absent. Every prior QA'd
  card in the board carries `<question>\n\nDei` before the QA stamp, so this is
  the convention silently dropped, not a new one being tried. Added `Dei` to
  all three before marking. **Check the sign-off line is present at all, not
  only that it varies** — the existing rule (four questions, one identical
  `Dei`, still a collision) assumes the line exists; it does not cover the
  line being missing outright.
- 2026-08-31 (step 6, CLO-121 — the live-announcement reveal sentence survives
  in a reordered form): Fill At Home's reveal read "`<URL>` is what it looks
  like live: `<claims>`" — not the two previously-banned exact shapes (`The
  page at [URL] owns/wins/lists...` or `Your page's live: [URL]`), but the
  same "announce that the page is live" skeleton with the clauses swapped
  around the verb. Rewritten to state the fact the domain now shows, with the
  URL trailing as a reference rather than the sentence's subject. **The banned
  reveal shapes are a skeleton, not two fixed strings — check for "is/'s ...
  live" doing the announcing anywhere in the sentence, not just at the two
  logged word orders.**
- 2026-08-31 (step 6, CLO-121 — the em-dash overage recurred on 2 of 3 cards
  in one batch, not the usual one): Fill At Home and Sweet Kiss each carried
  two em-dashes in the sent copy (Rtuazon held to one). Both trimmed to one by
  converting the second dash to a semicolon or a plain clause break, same fix
  as the 2026-08-29 Yana's Dog Salon catch. Recording the frequency because a
  single per-batch example understates it: this is now the most common
  single-card defect logged at step 6, worth a generator-side fix (cap em-dash
  emission at draft time) rather than a fourth QA catch in a row.
- 2026-08-31 (CEO closing leg, CLO-115 - a child step can lose the Trello MCP
  while the parent still has it, and "no cards" from run-start depths is a guess
  even when it turns out right): CLO-122 (steps 7-9) reported APPROVED 0,
  CONTACTED 0, FOLLOW-UP DUE 0 and REPLIED 0 and stated plainly that it could
  not re-read the board - "Trello board access requires authentication via MCP
  server connection (not available in this non-interactive run)". It then closed
  `done`. I re-read the board live in the closing leg and all four were in fact
  0, so its conclusion holds. It holds by luck, not by evidence: this is exactly
  the 2026-08-29 CLO-109 failure mode (step 3 reported "0 cards" while STRATEGY
  READY held 3) with a favourable draw. Two things follow. **(1) MCP tool
  availability is per-run, not per-company** - the same connector was available
  to this parent run minutes later, so a child reporting the connector missing
  is not a company-wide outage and must not be recorded as one. **(2) A step
  that cannot read its own queue has not measured it**; it should say so and
  hand the measurement to the closing leg, which re-reads the whole board in one
  call anyway. Steps 7-9 cost nothing here because the queues were genuinely
  empty; on a day APPROVED is non-zero the same shortcut silently skips the send.
- 2026-08-31 (CEO closing leg, CLO-115 - `list_by_board` returns no node for an
  empty list, so a depth table built from its output omits every zero-depth
  queue *and* any list the reader forgot existed): today's grouped read returned
  108 nodes across only 6 lists - NICHE 1, BRAND BLOCKED 38, READY TO SEND 60,
  CHANGES REQUESTED 1, SYNCED TO GHL 1, REJECTED 7. The board actually has
  **14** lists (`trelloReadList` `list_by_board`, `hasNextPage:false`); the other
  8 are empty. The run-start table this run enumerated a remembered roster and
  lost two real lists that way: REJECTED (7 cards) and NICHE (1) were on the
  board and absent from the table, while CLIENTS - which is 0, and is the number
  the whole pipeline exists to move - was never listed at all. **Take the list
  roster from `trelloReadList`, not from the card grouping, and reconcile: sum
  of per-list counts must equal the node total** (108 = 1+38+60+1+1+7 today).
  Zeros are reported because the roster says the list exists, never because the
  reader remembered it.
- 2026-08-31 (CEO closing leg, CLO-115 - the bottleneck issue's *title* went
  stale while its body stayed current, and the title is the only part a human
  sees in a list view): CLO-76 is titled "Approval gate: 48 QA-passed drafts, 0
  approved for 6 consecutive runs". As of today it is **60 drafts, 0 approved
  for 9 consecutive runs** - the title understates the queue by 12 cards and the
  drought by 3 runs, and it has been `in_review` with an `ask_user_questions`
  pending since 2026-08-23, now **8 days** unanswered. An escalation that
  quietly ages its own headline downward argues against itself. **When a run
  flags a queue for sustained growth, update the count in the tracking issue's
  title in the same heartbeat, not only in the run report** - the report is read
  once, the title is read every time the board is opened.
- 2026-09-06 (step 2, CLO-134 - a 403 that flips to 200 on a user-agent swap is
  a UA block, not a broken environment, and step 1 escalated one to the CEO as
  infrastructure): CLO-133 reported a 100% shortfall (0 of 3 PH + 1 intl) on the
  LAST day of the catering niche week, concluded "current environment cannot
  replicate that access" against the 2026-09-01 run, and recommended a CEO
  infrastructure investigation. There is nothing wrong with the environment.
  Re-running the same sources from this step minutes later with
  `curl -A '<Chrome UA>' -L`: `pasig-city.infoisinfo-ph.com/search/catering`
  returned **200, 134,964 bytes**, title "The 10 Best Catering Companies in
  Pasig City"; `cebu-city.infoisinfo-ph.com/search/catering` returned **200,
  132,418 bytes**. That is the same host family, the same page shape and the
  same `search/catering` path the 09-01 run cited on the Cucina Ching card
  (`makati-city.infoisinfo-ph.com/search/catering`). It never stopped working.
  **The distinguishing test is one retry, and it is cheap: a directory is only
  dead if it still fails after a Chrome-UA curl.** WebFetch's default UA is the
  thing being blocked, not the host and not the network - this is the
  2026-08-2x directory-403 finding recurring, and it cost a full day of quota
  because the retry was never run. Two corollaries worth keeping. **(1) Failures
  are per-host, not global** - in the same sweep `www.yellow-pages.ph` returned
  `000` (connection never established) *with* the Chrome UA while both
  infoisinfo hosts returned 200. One dead host is evidence about that host;
  generalising it to "web scraping failed across all attempted sources" is what
  turned a routine retry into a CEO escalation. Enumerate per host, with the
  status code per host, before writing the word "environment". **(2) A step that
  reports a 100% shortfall owes the per-source status codes it actually saw** -
  CLO-133's report named the sites but not one status code, so the claim could
  not be checked without re-running it, and re-running it is what disproved it.
- 2026-09-06 (step 2, CLO-134 - a run brief's "do not touch these unpushed
  commits" warning was already stale when the step opened): CLO-134's brief
  named `c57aed9` and `ef42f75` as unpushed commits belonging to the parallel
  09-01 chain and ringfenced them. By the time this step ran, all three of that
  chain's commits (`c57aed9`, `ef42f75`, `d06815e`) were on `origin/main` and
  the workspace was **0 ahead / 0 behind**. The ringfence was still correct as
  policy - those folders belong to CLO-127 - but the stated *reason* had
  expired, and a step that trusts it would wrongly believe the tree is dirty and
  skip an otherwise clean config-only push. **Verify workspace state with
  `git rev-list --left-right --count origin/main...HEAD` before treating a
  brief's dirty-tree claim as current.** A brief is written at run-start; a
  parallel chain pushes mid-run. This cuts the opposite way to the standing
  "the workspace is shared mid-run" caution and does not replace it - check, in
  both directions, rather than inheriting either assumption.
- 2026-09-06 (step 4, CLO-127 - the pages.dev root placeholder is served by the
  EDGE CACHE, so "check pages.dev first, then the branded domain" is not enough
  on its own): today's four folders were verified across both hosts, eight
  host/slug fetches in all. Three came back **HTTP 200 carrying the root
  placeholder** - `<title>CloudSpring IT Solutions - Previews</title>` - and
  they were not the same host each time: `cafe-vida-desserts` served the
  placeholder on the *branded* domain while pages.dev served the real page, and
  `cucina-ching` and `cakeshop-by-sonja` did the exact reverse. A status-code
  check would have passed all eight and shipped three dead URLs; the existing
  rule of falling back from branded to pages.dev would have caught two of the
  three and missed the first. Re-fetching with `Cache-Control: no-cache` and a
  `?cb=` query buster returned the real title on all three within seconds, so
  this is stale edge cache, not a failed build. **Check BOTH hosts, on content,
  and bust the cache on any miss** - the placeholder is not a property of one
  host, it is whatever that edge node last cached for the slug.
- 2026-09-06 (step 4, CLO-127 - `verify-brand`'s font check can be satisfied by
  a CSS-parser artefact, and GENERIC_FONTS does not filter it): capture recorded
  `fonts: ["i", "i!important", "Inter"]` for cafe-vida-desserts. Only `Inter` is
  a real family; `i` and `i!important` are noise from parsing the stylesheet.
  None matches the GENERIC_FONTS regex, so the check ran, and it passed on
  **`typeface used: i`** - a single letter that lands free in `width`, `right`,
  `inherit` and a hundred other tokens in any stylesheet. The page does honestly
  declare `'Inter'` first in both stacks, so today's pass is real, but it was
  granted by the noise entry, not by the real one. **GENERIC_FONTS wants
  extending to drop single-character entries and anything carrying
  `!important`** - as written, a page that never asked for the captured face
  would pass this check whenever capture emits a one-letter artefact.
- 2026-09-06 (step 4, CLO-127 - two strategist figures failed re-fetch on a
  one-day-old angle, in two different ways): the >7-day rule is a floor and this
  is the second consecutive run to prove it. (1) Cucina Ching's angle said the
  InfoIsInfo Makati catering page "names 26 caterers"; counting the `h2`/`h3`
  business headings today gives **25**. Off by one, and it was headed for an
  H2. (2) Cakeshop by Sonja's ROI line cites posted cakes at P1,100-1,800 - that
  range is **on no page reachable today** (their live storefront shows only
  `P0.00` placeholders), so it was dropped entirely and the mockup prints no
  prices at all. Note the difference in failure mode: the first was a wrong
  number on a page that exists, the second a right-sounding number with no
  source at all. **Re-fetch counts as well as ratings** - a count is exactly the
  kind of figure that reads as verified because it is oddly specific.
- 2026-09-06 (step 4, CLO-127 - a directory's "website" field can point at a
  different company, and that beats the angle it replaces): ERAA Catering's
  huddlemarkets.ca listing is accurate on address, phone and hours, then links
  `eraa.ca` as their website. Opened today, `eraa.ca` is "Tamil & Indian
  Groceries Online in Canada - Eraa Supermarket", a Shopify grocery store with
  no catering on it and no occurrence of the word "Finch" anywhere. The
  strategist's angle was the two-postcode clash on the wheree page (real, and
  confirmed: M1B 6B2 x2, Eraa Supermarket's M1B 5P8 x4). The grocery-store link
  is sharper and became the hero and CTA instead. **On a directory-capture
  angle, open the listing's outbound website link, not just its NAP fields** -
  a wrong postcode misroutes a courier, a wrong website link hands the click to
  another business entirely.
- 2026-09-06 (step 4, CLO-127 - a killed run leaves a 0-byte `.git/index.lock`
  AND unpushed commits, and the unpushed set can include the PREVIOUS step's
  work): this heartbeat was a `process_lost_retry`. `git status` looked ordinary
  - three modified files and an untracked page - but `git log origin/main..HEAD`
  showed **two** unpushed commits, and the older one was `c57aed9`, step 3's own
  brand-capture commit. Step 3 reported done; its assets had never reached
  origin. A 0-byte `index.lock` written 4.7 days earlier, with no `git` process
  alive, then blocked every `git add` until removed. **On any retry wake, run
  `git log origin/main..HEAD` before `git status`** - a step that reports done
  has not necessarily pushed, and the next step inherits the gap silently. And
  clear a stale lock on evidence (zero bytes, age, no live process), not on
  impatience.
- 2026-09-06 (step 4, CLO-127 - the host slept ~5 days mid-run, so the nominal
  run date was about to become false provenance on prospect-facing copy): the
  run is "daily run 2026-09-01" and step 3's capture timestamps are that
  morning, but this retry executed on **2026-09-06**. The pages carried "checked
  on 1 September 2026" against facts I re-fetched on the 6th. Corrected all four
  to the date the evidence was actually gathered. **A page that dates its own
  evidence must date it from the fetch, not from the run's title** - on a
  slept-through run those are different days, and the date is a claim the
  prospect can check.
- 2026-09-06 (step 4, CLO-127 - the five `facebook: "p"` records are repaired at
  source; verdicts unchanged, evidence now provable): real page ids written into
  all five - `little-guardians` and `little-guardians-taguig` -> 61564193106467,
  `mcjt-tire` and `mcjt-tire-taguig` -> 100063992972413,
  `small-town-auto-earlville` -> 100083031904485. No `null` fallback was needed.
  All three ids return HTTP 200 with `is_silhouette: true` and the **byte-
  identical** Facebook default-avatar asset (`84628273_176159830277856_97...`),
  while the literal `"p"` and a bogus 15-digit id both return
  GraphMethodException code 100 - so a 200 proves the id resolves, and three
  identical silhouettes prove the pages genuinely have no picture. Verdict stays
  `no-assets` for all five, but the stored reason is now readable instead of an
  unreadable `"p"` that every sweep re-derived as a 400. **The 2026-08-31 entry
  above is now closed** - future sweeps get a real answer here.
- 2026-09-06 (step 4, CLO-127 - `rjf-vulcanizing-taguig` has no `bytes` on
  purpose, and should leave the sweep denominator): flagged for measurement
  only, and the measurement has a shape worth recording. `logoFiles: []`, so no
  byte comparison is possible - but the record is `blockedBy: "logo-not-a-mark"`,
  not `no-assets`. Its logo was deliberately cleared on 2026-08-20 (CLO-36)
  because the captured FB picture was a photo of the shop interior and a prior
  run had built a palette out of wall paint and plastic chairs. The empty array
  is the correct end state, not a gap. **A byte-comparison sweep can never say
  anything new about a `logo-not-a-mark` record** - it needs a human to supply a
  real mark, so counting it as an unresolved record each run overstates what a
  sweep could ever recover. Recommend excluding `logo-not-a-mark` records from
  sweep denominators and reporting them as their own category.
- 2026-09-06 (step 4, CLO-127 - the `/index.html` cache-bypass trick now 308s,
  and a plain `curl` reads that as a dead deploy): the deploy-verification
  guidance says to append `/index.html` to bypass a cached fetch. Cloudflare
  Pages now answers `/<slug>/index.html` with a **308 redirect** to `/<slug>/`.
  Without `-L` the body is empty and `size_download=0`, so a title/`h1` grep
  returns nothing and a live, correct page looks like a failed deploy. All four
  2026-09-01 mockups produced this false negative on both hosts before the
  redirect was followed. **Always `curl -sL`** when verifying a deploy, and read
  the status code before believing an empty body - a 3xx with 0 bytes is a
  redirect not yet followed, which is the opposite of the 200-with-placeholder
  failure the content check exists to catch. Both failure modes are invisible to
  a status-code check, in opposite directions.

- 2026-09-06 (step 1, CLO-133 - a 100% shortfall reported as an environment
  failure, when four of four hosts were live): step 1 closed `done` with 0 of
  3 PH + 1 intl, concluded that the "current environment cannot replicate that
  access", and recommended a CEO infrastructure investigation. Step 2 (CLO-134)
  re-tested the same hosts minutes later and the CEO re-tested them again:
  `pasig-city`, `taguig-city`, `cebu-city` and `davao-city`
  `.infoisinfo-ph.com/search/catering` each returned **200** with ~131-137 KB of
  real listing HTML under `curl -A "<Chrome UA>" -L`. Only
  `www.yellow-pages.ph` was genuinely down (`000`, connection refused, UA
  irrelevant). The 403s were **per-host UA blocks generalised into a verdict
  about the whole environment** - the failure mode this log already warned about
  at `e011869`, repeated one run later by a different agent. Two things made it
  expensive: (1) the report named the hosts it tried but **not one status code**,
  so the claim could only be tested by re-running the whole step; (2) it closed
  `done`, so the chain advanced and steps 2-9 each inherited an empty queue.
  Hence the new rule in step 1: **per-host status codes, and a Chrome-UA retry,
  before any shortfall is reported** - and never an environment verdict from
  per-host evidence. An agent that cannot reach a host has found a fact about
  that host, not about its own capabilities. Recovery: CLO-140 re-ran step 1
  the same day; the day's quota was recoverable because the capability was
  never missing.
- 2026-09-06 (step 6, CLO-129 - the reveal-sentence skeleton is "is/lives ... at
  [URL]", not the literal word "live", and 3 of 4 drafts shared it): today's
  batch read, card by card, as four different sentences - "Find it at [URL]",
  "It's at [URL]", "This one lives at [URL]", "Your site is here: [URL]" - and
  each passed alone. Read side by side, three of the four ("It's at", "lives
  at", "is here:") are the same construction with the verb swapped: subject +
  to-be-or-equivalent copula + locating preposition + URL. Only "Find it at"
  (an imperative, not a copula) was genuinely different. This is the same
  finding as the 2026-08-31 CLO-121 entry ("the live-announcement reveal
  sentence survives in a reordered form") one layer further down: that entry
  already showed the banned shape has no fixed wording, and this run shows the
  skeleton is not anchored to the word "live" either - "lives at" and "is
  here" do the identical announcing job with neither word present. Rewrote
  Cucina Ching, Cakeshop by Sonja and ERAA to remove the copula-plus-locator
  shape entirely (verb-first commands or a trailing "that's what X shows"
  construction); left Cafe Vida's imperative alone. **Check the reveal
  sentence for the grammatical role a verb plays (does it just assert the
  page's existence at a location?), not for which verb or preposition it
  uses** - a synonym swap defeats a phrase-list check every time.
- 2026-09-06 (step 6, CLO-129 - two drafts shared a CTA order the axis-3 rule
  is supposed to catch, and it was found only by writing out the order per
  draft): Cafe Vida and Cucina Ching both ran PRICE, then FREE MONTH, then
  TERM ("₱1,500 monthly... First month free on a six-month term" /
  "₱1,200/month, first month's free, 6-month agreement minimum") - different
  numbers, identical sentence-order skeleton, which is exactly what "price /
  free month / term may not appear in the same order in two drafts" bans.
  Reworded Cucina Ching's CTA to TERM, FREE MONTH, PRICE ("Six months
  minimum, first month free, then ₱1,200 a month after that") so the two
  PH-priced drafts in the batch no longer collide; Cakeshop's FREE, TERM,
  PRICE order and ERAA's four-part intl structure (build fee, monthly, free
  month, term) were already distinct. **List the three CTA elements in the
  order each draft states them before comparing across the batch** - "read
  each draft and see if it sounds similar" missed this collision on a first
  pass; writing the three-word order out caught it immediately.
- 2026-09-06 (step 6, CLO-129 - the em-dash overage did not recur a fourth
  time): all four drafts (Cafe Vida, Cucina Ching, Cakeshop by Sonja, ERAA)
  carried exactly one em-dash each, in the "— Dei" sign-off only, breaking the
  three-consecutive-run streak logged at 2026-08-29 and 2026-08-31 x2. No
  generator-side fix needed yet on this evidence; keep counting per draft
  before closing the pattern out.
- 2026-09-06 (step 6, CLO-129 - brand gate re-run independently, all four
  pass): `verify-brand.mjs` run fresh (not read from the builder's report) on
  cafe-vida-desserts, cucina-ching, cakeshop-by-sonja, eraa-catering - all
  exit 0, all >=2 captured hexes in the styling, all real business names and
  no generic-branding marker on the page. Pricing checked against
  `OFFER-MENU.md`: three PH quotes inside ₱1,000-1,500/mo, ERAA's CAD 600
  build + CAD 100/mo inside the dated CAD band (475-700 equiv n/a, CAD table
  is 450-690 build / 75-140 monthly) with no head conversion. No automation
  promised in any sent copy (XC-01/XC-04 named only in the internal Sales
  Angle section, correctly marked IN BUILD and never quoted in the outreach
  text). All four marked `✅ QA'd & humanized`.
- 2026-09-06 (step 4, CLO-136 - the font-check artefact class is wider than the
  one letter CLO-127 logged, and it is now repaired at source): the entry above
  recommends dropping single-character and `!important`-suffixed entries from
  `GENERIC_FONTS`. Surveying all 123 `brand.json` records showed a third and
  worse species: capture's family-name regex also swallows **whole CSS
  declarations**. `blessed-veterinary-qc` records `"z-index:10"`, `"z-index:9"`,
  `"z-index:8"`, `"position: absolute"`; `gms-auto-care` records `"z-index:6"`,
  `"z-index:7"`, `"width: 100%"`. Because the check did `f.split(':')[0]`, those
  were matched as `z-index`, `position` and `width` - tokens present in
  essentially every stylesheet, so each was a **guaranteed pass**. They were not
  firing today only because a real family name happened to sit earlier in the
  array; nothing made that ordering reliable. Fixed in `verify-brand.mjs`: a
  `fontName()` helper strips the `!important` tail and the weight spec, entries
  under 3 characters are dropped, and a `CSS_PROPERTIES` blocklist drops the
  declaration fragments. **The evidence that it is safe:** the gate was run
  across all 123 folders before and after - **65 PASS / 58 FAIL, unchanged, with
  zero folders changing state**. Exactly two reason strings moved, both
  improvements: `cafe-vida-desserts` now certifies on **`Inter`** (the family
  the page actually declares) instead of **`i`**, and `blessed-veterinary-qc`
  reports `Changa` instead of the entire `Changa:0,500;...|Karla:...` spec. A
  gate defect found by one run and logged as a recommendation is not fixed; the
  next run inherits it. This one is now closed in code, not in prose.
- 2026-09-06 (step 4, CLO-136 - what the font check still cannot do, named so it
  is not mistaken for solved): it remains a **literal substring test against the
  whole document**, so a short family name still matches incidental text -
  `Inter` matches "interior", "internet", "winter"; `Jost` would match "Jostens".
  The artefact fix removes the guaranteed passes, it does not make the check a
  font-family-declaration match. Tightening it properly means matching inside a
  `font-family` declaration rather than anywhere in the HTML, which changes the
  result for every folder at once and wants its own run with a full
  before/after. Recorded as known-remaining, not as a defect to rediscover.
- 2026-09-06 (step 4, CLO-136 - a step 4 with nothing in all three passes, and
  the cause was entirely upstream): revisions 0, backlog 0, new 0. Worth logging
  because each zero has a different and checkable reason, and a bare "built 0"
  hides that. Revisions: the line-initial `/^## CHANGES/m` test was run against
  **all 112 cards on the board**, not just the one card the brief names - zero
  matches board-wide, which is a stronger statement than confirming the known
  card. Backlog: STRATEGY READY measured **0** by this step. New: step 3 output
  **0**, because step 2 had no input, because step 1 found no leads. **Test the
  revision predicate board-wide rather than on the card the brief points at** -
  the brief's count is a claim to verify, and verifying it costs one pass over
  cards already fetched for the depth count.
- 2026-09-06 (step 4, CLO-136 - MOCKUP READY reading 0 does not mean the
  previous build failed, and step 4 must not conclude that it did): at run start
  the CEO measured MOCKUP READY 0 / READY TO SEND 60; CLO-127 then built and
  moved four cards in, and by the time this step measured, MOCKUP READY was
  **0 again** and READY TO SEND was **64**. The 09-01 chain's step 5 (CLO-128)
  had drained the list mid-flight. The arithmetic is what settles it - 60 + 4 =
  64, and all four catering slugs were found by name in READY TO SEND. **On a
  list a concurrent chain is draining, reconcile the depth against where the
  cards went, not against the run-start number** - an empty MOCKUP READY is
  equally consistent with "nothing was built" and "everything built was already
  drafted", and only naming the cards separates them.
- 2026-09-06 (step 4, CLO-136 - a recovery re-run of step 1 does not retroactively
  feed the same run's step 4): CLO-140 re-ran today's lead generation while this
  step was live, and recovering the quota does not give step 4 anything to build.
  Its output lands in INCOMING LEADS, and today's step 2 (CLO-134) and step 3
  (CLO-135) are both closed `done` - so the leads have no strategy and no brand
  capture behind them, and the standing rule forbids step 4 supplying either.
  CLO-140's own brief says so explicitly: its cards are picked up by the **next**
  run's step 2. **When an early step is re-run out of sequence, the recovery
  reaches the pipeline one run later, not the same day** - a run report that
  counts recovered leads as the same day's build capacity is counting them a run
  early.
