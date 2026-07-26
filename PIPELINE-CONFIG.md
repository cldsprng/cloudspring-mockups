# CloudSpring Lead-Gen Pipeline — Operational Config (CANONICAL)

Single source of truth for ALL pipeline agents, on every surface (Cowork
scheduled runs AND Claude Code Routines). Read this before doing anything.
Credentials are NOT stored here — Cowork runs get them from the TRELLO WORK
project doc; Code Routines use their bound-repo/connector access.

## This week's niche — WEEKLY FOCUS RULE

One niche per WEEK. Pick the niche whose date range contains today
(Asia/Manila). All leads Mon–Sat that week come from that single niche.

Niche calendar (the human owns this list — edit freely):
- 2026 Jul 27 – Aug 01: Dental clinics
- 2026 Aug 03 – Aug 08: Plumbers / handyman services
- 2026 Aug 10 – Aug 15: Salons / barbershops / spas
- 2026 Aug 17 – Aug 22: Auto repair / vulcanizing shops
- 2026 Aug 24 – Aug 29: Pet grooming / veterinary clinics
- 2026 Aug 31 – Sep 05: Catering / home bakers
- After the last entry: cycle back to the top, unless updated (prefer
  niches that produced replies — see Learnings log).

## Quotas & targeting

- Daily quota: 3 PH + 1 international — TOTAL across all agents/surfaces.
  If INCOMING LEADS already has today's quota (e.g. the 6AM Lead Hunter
  routine filled it), later runs only top up, never duplicate.
- City rotation within the week: Mon Quezon City · Tue Makati · Wed Pasig ·
  Thu Taguig · Fri Cebu · Sat Davao
- International (1/day, same niche): US suburbs, Canada, Australia, UK — rotate.

## Trello board

Board: CLOUDSPRING_MAINBOARD — https://trello.com/b/TIAlGfU8/cloudspringmainboard
Lists: INCOMING LEADS → STRATEGY READY → MOCKUP READY → READY TO SEND →
CHANGES REQUESTED → APPROVED → CONTACTED → REPLIED (HITS) → CLIENTS, + REJECTED

Human touchpoints: READY TO SEND → APPROVED authorizes sending · revisions
via CHANGES REQUESTED with "## CHANGES" in the card DESCRIPTION (comments are
invisible to agents) · REPLIED (HITS) is human territory.

## GHL (customer-facing CRM)

- Pipeline: CLOUDSPRING WEB LEADS (id 7yd9fhvPcfz1vqbF3kxN); stages New Lead →
  Outreach Sent → Follow-up → Replied → Negotiation/Proposal → Won → Closed
- Discovery Call booking URL (use in mockup CTAs + outreach):
  https://api.leadconnectorhq.com/widget/booking/QRPEnWRw2Kx9rBe0Mj6J
- On approval: contact (tags cloudspring-web-leads + niche + ph/intl) +
  opportunity (12-mo value) + note (angle, mockup URL, offer, Trello link)
- Nurture workflow: (not built yet — add name/ID here when created)

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
