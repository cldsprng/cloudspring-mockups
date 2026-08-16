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
  If INCOMING LEADS already has today's quota (e.g. the 6AM Lead Hunter
  routine filled it), later runs only top up, never duplicate.
- City rotation within the week: Mon Quezon City · Tue Makati · Wed Pasig ·
  Thu Taguig · Fri Cebu · Sat Davao · Sun agent's choice among cities with
  thin coverage so far this week
- International (1/day, same niche): US suburbs, Canada, Australia, UK — rotate.

## Trello board

Board: CLOUDSPRING_MAINBOARD — https://trello.com/b/TIAlGfU8/cloudspringmainboard
Lists: INCOMING LEADS → STRATEGY READY → MOCKUP READY → READY TO SEND →
CHANGES REQUESTED → APPROVED → SYNCED TO GHL (SEND MANUALLY) → CONTACTED →
REPLIED (HITS) → CLIENTS, + REJECTED

APPROVED flow: agent syncs every approved card to GHL (contact + opportunity
+ note, "✅ Synced to GHL" marker). Email leads auto-send via GHL → CONTACTED.
Manual-channel leads (FB/SMS) → SYNCED TO GHL (SEND MANUALLY); the human
sends the draft and drags the card to CONTACTED, which is the "sent" signal.
No processed card ever sits in plain APPROVED.

Human touchpoints: READY TO SEND → APPROVED authorizes sending · revisions
via CHANGES REQUESTED with "## CHANGES" in the card DESCRIPTION (comments are
invisible to agents) · REPLIED (HITS) is human territory.

Agent order: lead-gen (or 6AM Lead Hunter routine) → solution-strategist →
mockup-builder → outreach → sales-qa-humanizer (rewrites every draft to
sound human + runs the sales QA checklist; only cards marked
"✅ QA'd & humanized" should be approved by the human).

## GHL (customer-facing CRM)

- Pipeline: CLOUDSPRING WEB LEADS (id 7yd9fhvPcfz1vqbF3kxN); stages New Lead →
  Outreach Sent → Follow-up → Replied → Negotiation/Proposal → Won → Closed
- Discovery Call booking URL (use in mockup CTAs + outreach):
  https://api.leadconnectorhq.com/widget/booking/QRPEnWRw2Kx9rBe0Mj6J
- On approval: contact (tags cloudspring-web-leads + niche + ph/intl) +
  opportunity (12-mo value) + note (angle, mockup URL, offer, Trello link)
- Nurture workflow: (not built yet — add name/ID here when created)

## Brand assets convention

- Per-lead asset folders in this repo: `<business-slug>/brand/` (logo, brand screenshots) and `<business-slug>/photos/` (real photos of the business — the Lead Hunter downloads Google Place photos here via the Places API).
- The mockup builder reads these with vision to derive the REAL brand palette and uses the real photos as site imagery.
- No assets available → builder ships a neutral-premium design FLAGGED "⚠️ GENERIC BRANDING" on the card; QA enforces the flag; the human decides (send anyway / drop assets in and request changes / polish in a Claude Code session).
- Human/Claude Code edits to a mockup folder are authoritative — pipeline agents git pull first and never rebuild over non-pipeline commits.
- Facebook cannot be scraped from any headless run (robots-blocked). FB photos/logos are captured by the HUMAN via Claude in Chrome (browses as the logged-in user) and committed to `<slug>/brand/` and `<slug>/photos/`.
- Auto-rebrand: every run, the builder rechecks GENERIC BRANDING-flagged cards; if asset folders now have files, it rebuilds with the real branding on the same URL and clears the flag.

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
- 2026-07-27: Dental Hive mockup shipped with generic palette (no brand asset access) and QA missed it. Fixes: brand-assets convention above, GENERIC BRANDING flag, QA branding check, Lead Hunter to download Place photos per lead.
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
- 2026-08-16 (brand capture cannot run unattended): a scheduled Cowork run has
  no Claude in Chrome — list_connected_browsers returned []. So step 3 is
  structurally a HUMAN-initiated desktop step, not something the daily job can
  ever do. Consequence: all 14 derma mockups shipped flagged GENERIC BRANDING.
  The auto-rebrand pass is the only path back, and it needs Dei to run
  brand-capture in a desktop session first.
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
