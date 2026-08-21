# CloudSpring Offer Menu — Automations + Websites (CANONICAL BOUNDARY)

**This document is the boundary on what any agent or human may pitch.**
If a capability is not on this list with the state `SELLABLE TODAY`, it may not
appear in a Sales Angle, a mockup, an outreach draft, or a call. No exceptions,
no "we could probably build that", no roadmap talk to a prospect.

Owned jointly:
- **Solutions Strategist** — owns the pricing, the tiers, and the ROI argument.
- **Automation Engineer** — owns the build state. Only the Engineer may move a
  line from `IN BUILD` to `SELLABLE TODAY`, and only after it demonstrably runs
  end to end. The sign-off log at the bottom of this file is the record.

Canonical over role specs. `PIPELINE-CONFIG.md` remains canonical for pipeline
operations (niches, quotas, board, deployment); this file is canonical for
**what we sell and what we charge**.

---

## Build-state legend

| State | Meaning | May it be pitched? |
|---|---|---|
| `SELLABLE TODAY` | Runs end to end today. Engineer has signed it off below. | Yes — with a delivery date. |
| `IN BUILD` | Scoped and assigned, not yet running. | **No.** Not as a promise, not as a "coming soon", not as a hint. |

### Where we stand — 2026-08-20

**Every automation line on this menu is `IN BUILD`.** The only thing that may be
sold today is the website (section W). That is not a drafting choice; it is what
the evidence supports:

- The GoHighLevel connection (**CLO-6**) is now `done`. The five-consecutive-run
  `list_locations` failure described here previously is resolved.
- n8n (**CLO-14**) is now `done`.
- The Speed-to-Lead + Booking Engine (**CLO-11**) is `blocked` — and it is the
  only gate left. Both dependencies this file named for it have landed.

**The state of CLO-11 needs an Engineer's eye, not a Strategist's.** As of this
revision it sits in `blocked` with an unresolved-blocker count of zero, no
unblock descriptor, and both named gates `done`. It has been in that state since
2026-08-19. Nothing is actually holding it that the board can name.

So the practical instruction to Outreach and QA is unchanged: **sell the website,
diagnose the automation pain, and do not promise the automation.** What changed
is *why* — the automations are no longer waiting on infrastructure, they are
waiting on CLO-11 being picked back up and on the Engineer's sign-off in the log
below. A line stays `IN BUILD` until that row exists, regardless of what its
dependencies now say. An outreach draft naming an `IN BUILD` line is still a QA
failure.

The cost, stated in one number, now attaches to CLO-11 rather than to GHL: it is
holding closed the difference between a ₱1,500/month website and a
₱5,000–6,500/month stack, on every lead in the pipeline.

---

## W — The website (the door)

Priced in section P as Tier W. This is the offer that is live today.

| ID | What it is | State | Note |
|---|---|---|---|
| `W-01` | A personalized site on their own content — real logo, real palette, real photos, mobile-first, deployed to a live URL in under a day. | `SELLABLE TODAY` | 30+ live at `preview.cloudspringitsolutions.com`. Branding via `tools/brand-capture`. |
| `W-02` | Identity-proof hero — exact address, phone, hours and rating stated on a page they control, so the record that ranks for their name is theirs. | `SELLABLE TODAY` | This is the deliverable behind the name-collision and contradictory-listings angles. |
| `W-03` | Click-to-call, click-to-message and directions on every screen. | `SELLABLE TODAY` | Plain links. Nothing to break. |
| `W-04` | Enquiry form that opens a pre-filled message to the owner's own email or Messenger. | `SELLABLE TODAY` — **with the limitation stated** | It is a `mailto:` handoff, not a captured lead. It opens the visitor's mail app. No record, no reply, no CRM. **Never describe this as lead capture.** The real thing is `XC-04`. |
| `W-05` | Revisions on the same URL, no re-quote, for the life of the term. | `SELLABLE TODAY` | Folder-per-mockup, Cloudflare Pages. |

**Website ROI, in their numbers.** Anchor on what the directory is taking, not on
an abstract traffic claim:

> Their name is searched. The page that ranks is Yelp / ClinicFinderPH /
> Philkotse / yellow-pages.ph, and it lists two to four competitors underneath
> them. Ask the owner what one new customer is worth — their own average ticket —
> and how many of those searches a month they think they lose. One recovered
> customer a month covers the whole ₱1,000–1,500.

Do not invent the search volume. The claim we make is the one that is checkable
in ten seconds: *this specific page, ranking for your name, has your competitors
on it.*

---

## CL — Clinics (dental · pediatric · derma · vet)

The deepest niche and the strongest upsell — the Learnings log said so on
2026-07-27, and CLO-11 builds this stack first for exactly that reason.

| ID | What it does — one sentence | State | Gate |
|---|---|---|---|
| `CL-01` | Patients book their own appointment from the site, into the clinic's real calendar, without anyone answering a phone. | `IN BUILD` | CLO-11, CLO-6 |
| `CL-02` | Every booking gets a confirmation, then a reminder the day before and again on the morning. | `IN BUILD` | CLO-11, CLO-6 |
| `CL-03` | When someone doesn't show, they get a message the same day offering the next open slot, instead of being quietly lost. | `IN BUILD` | CLO-11, CLO-6 |
| `CL-04` | Patients who haven't been back in six months get a recall message; lapsed ones get a reactivation offer. | `IN BUILD` | CLO-11, CLO-6 |

### CL ROI — the argument, in their numbers

Use the clinic's **own posted price** (most PH clinics post it on their Facebook
page — that is the verifiable number) and the clinic's **own visit volume**,
asked directly. Never quote an industry no-show rate to a prospect as if it were
theirs.

The formula, for internal sizing:

```
monthly value of CL-02 + CL-03
  = visits/month  ×  no-show rate  ×  recovery rate  ×  average ticket
```

Planning defaults for internal sizing only — **not claims to a prospect**:
no-show rate 15–25%, recovery rate 25–35%, PH consult/cleaning ₱800–1,500.

Worked example — a PH clinic doing 200 visits a month at a ₱1,200 ticket:

| Line | Monthly value |
|---|---|
| `CL-03` no-show recovery — 200 × 20% × 30% × ₱1,200 | **₱14,400** |
| `CL-04` recall — 20 reactivated patients a year × ₱1,200 | ~₱2,000 |
| `CL-01` after-hours bookings that would have been a missed call | ask them |

Against Tier C at ₱5,000–6,500/month, that clinic is roughly 2.5× covered on
no-show recovery alone. **The line to use is the small one, not the big one:**
*one recovered appointment a month pays for the website; four pays for the whole
stack.* It is a claim the owner can check against their own price list without
trusting a single number of ours.

---

## TR — Auto repair and trades

| ID | What it does — one sentence | State | Gate |
|---|---|---|---|
| `TR-01` | A missed call gets an automatic text back within a minute — "sorry we missed you, what do you need?" — so the caller doesn't just ring the next shop. | `IN BUILD` | CLO-11, CLO-6 |
| `TR-02` | Quote requests arrive as a structured job — vehicle, service, contact — in one place, instead of scattered across Messenger and voicemail. | `IN BUILD` | CLO-11, CLO-6 |
| `TR-03` | Customers get reminded when their next service is due, by date or by mileage. | `IN BUILD` | CLO-11, CLO-6 |
| `TR-04` | After a completed job, the customer gets a review request — so the shop's reviews land on the shop's own page, not only inside a Yelp listing. | `IN BUILD` | CLO-11, CLO-6 |

### TR ROI — the argument, in their numbers

The anchor for trades is the **after-hours call**, because it is the loss the
owner already feels and can count without any data from us.

```
monthly value of TR-01
  = missed calls/month  ×  conversion rate  ×  average repair ticket
```

Planning defaults for internal sizing only: average PH repair ticket
₱2,000–5,000; US/AU/CA average repair order USD 400–600.

Worked example — a Makati shop missing 30 calls a month, converting 20% of the
ones it calls back, at a ₱3,000 ticket: **₱18,000/month** from `TR-01` alone.
Against Tier C at ₱5,000–6,500 that is 3× covered.

International equivalent — a small-town US or AU shop at a USD 450 repair order
recovers Tier C's monthly fee with **one** job a month.

The sentence for outreach, once `TR-01` is sellable: *"someone rings you at 7pm,
you're closed, they ring the next shop. We text them back in under a minute."*
Not "omnichannel response orchestration."

---

## BD — Blank-domain leads (any niche)

The strongest opening we have found, per the 2026-08-16 and 2026-08-17 learnings:
the owner has already decided they want a site and already paid for the domain.
The ask is "let's put something on it", not "let's start from zero". This
includes franchise/parts-network affiliate microsites (Repco, NAPA, Bosch), which
count as blank domains **and** hand SEO value to a competitor.

BD is not a separate product. It is **the niche stack, delivered onto a domain
they already own**, plus:

| ID | What it does — one sentence | State | Gate |
|---|---|---|---|
| `BD-01` | The site goes live on the domain they are already paying for, so the money they have already spent starts working. | `SELLABLE TODAY` | Requires DNS access from the owner. Confirm they control the registrar before quoting a date. |
| `BD-02` | Enquiries from that domain land in a CRM record instead of an inbox — see `XC-04`. | `IN BUILD` | CLO-11, CLO-6 |

Pricing note: BD leads are quoted on the standard ladder. Do not discount for
"they already own the domain" — the domain is the reason they are an easier
close, not a reason to charge less.

---

## XC — Cross-cutting (both stacks)

Everything here is part of the CLO-11 engine and applies to clinics and trades alike.

| ID | What it does — one sentence | State | Gate |
|---|---|---|---|
| `XC-01` | Any new enquiry — form, Facebook message, missed call — gets a real reply inside 60 seconds, day or night. | `IN BUILD` | CLO-11, CLO-6 |
| `XC-02` | The first reply asks the qualifying questions and books the ones who are ready, so the owner only picks up real jobs. | `IN BUILD` | CLO-11, CLO-6 |
| `XC-03` | A one-page weekly report: enquiries in, replies sent, appointments booked, no-shows recovered. | `IN BUILD` | CLO-11, CLO-14 |
| `XC-04` | Form-to-CRM capture — every enquiry becomes a contact record with the source attached, whether or not the visitor has an email app. | `IN BUILD` | CLO-11, CLO-6 |

`XC-01`'s sub-60-second claim is the one the whole pitch rests on, and it may not
be made until the Engineer has **measured** it. Not "should be fast" — measured,
with the number in the sign-off log.

### Not on the menu, and why

Named here so nobody has to guess:

- **Facebook Messenger auto-send to cold prospects.** Not possible under Meta's
  policy — a Page may only message users who messaged it first. Inbound
  Messenger replies are in scope for `XC-01` once built; cold outbound never is.
- **Anything not listed above.** If a prospect asks for it, do not improvise a
  yes. Escalate to the CEO and the Engineer, and answer after.

---

## P — Pricing ladder

`Tier W` is the config band and is live. **Tiers A, B and C are PROPOSED and
require CEO approval before any quote uses them**, because they price above the
band in `PIPELINE-CONFIG.md`. They also require their component lines to reach
`SELLABLE TODAY`. Both gates, not either.

### PH — monthly, no build fee, first month free on 3/6/12-month terms

| Tier | Contents | Price/month | State |
|---|---|---|---|
| **W** | `W-01`–`W-05` | **₱1,000–1,500** | **LIVE** — config band |
| **A** | W + `XC-01` + `XC-04` + `XC-03`, plus `TR-01` for trades | ₱2,000–2,500 | PROPOSED |
| **B** | A + `CL-01` `CL-02`, or `TR-02` `TR-03` | ₱3,000–4,000 | PROPOSED |
| **C** | B + `CL-03` `CL-04` + `XC-02`, or `TR-04` + `XC-02` | ₱5,000–6,500 | PROPOSED |

Tier C sits at "several times ₱1,500" deliberately, and it is defensible: the
worked examples above put a 200-visit clinic at ₱14,400/month of recovered
no-shows and a 30-missed-call shop at ₱18,000/month, against a ₱6,500 ceiling.

### International — build fee + monthly retainer

| Tier | Build (USD) | Monthly (USD) | State |
|---|---|---|---|
| **W** | **300–500** | **50–100** | **LIVE** — config band |
| **A** | 500–800 | 125–200 | PROPOSED |
| **B** | 800–1,200 | 250–400 | PROPOSED |
| **C** | 1,200–1,800 | 400–600 | PROPOSED |

At a USD 400–600 average repair order, Tier C's monthly fee is covered by **one**
recovered job a month. That is the intl argument; use their number, not ours.

### Discounting

Nobody discounts below the Tier W floor. That is the CEO's call and only the
CEO's call — Strategist, Outreach and QA all escalate rather than decide.

---

## FX — quoting in AUD, GBP and CAD

The 2026-08-18 QA catch (AUD 450 + 75 quoted, below the USD floor) happened
because the conversion was done in someone's head. Use this table instead.

**Reference rates — USD 1 =** (source: open.er-api.com, stamped **2026-08-18**)

| | AUD | GBP | CAD | PHP |
|---|---|---|---|---|
| Rate | 1.4068 | 0.7379 | 1.3865 | 61.5550 |

**Quote inside these bands.** Floors carry an 8% buffer against FX drift, so a
quote at the bottom of the band is still above the USD floor if the rate moves.

| Currency | Build fee band | Monthly band |
|---|---|---|
| **AUD** | 475 – 700 | 80 – 140 |
| **GBP** | 240 – 370 | 40 – 75 |
| **CAD** | 450 – 690 | 75 – 140 |

The corrected AUD 650 + AUD 110/month from that run sits comfortably inside this
band, so no re-quote is needed.

One correction worth recording: that catch's arithmetic implied roughly 1.52 AUD
per USD, while the reference rate on that date was 1.4068. At the real rate,
AUD 450 converts to USD 320 — above the USD 300 floor, not below it. The
conclusion still stands (check the floor before the draft leaves QA); what
changes is that the check has to run against a dated rate, not a remembered one.

**Refresh rule:** if the stamp above is more than 30 days old, re-pull before
quoting and update this table in the same commit:

```
curl -s https://open.er-api.com/v6/latest/USD
```

---

## How a Sales Angle cites this menu

Every Sales Angle names its automations **by ID and by plain name**. The ID makes
the claim auditable against this file; the plain name is what the owner reads.

Card description budget is 2,048 characters total and the whole pipeline writes
into one description — Strategist output stays at **~1,250 characters**, leaving
~800 for the outreach draft (Learnings log, 2026-07-26).

**Template**

```
ANGLE: <directory capture | blank domain | contradictory listings |
        invisible branch | empty corridor | name collision>
EVIDENCE: <the checkable fact — named directory, named competitor, the URL>
AUTOMATIONS: <ID> <plain name> — <what it does for them, one line>
             <ID> <plain name> — <...>
ROI: <their own number> × <their own volume> = <₱ or $ per month>
WEBSITE: <what the page must prove; real assets to use; labelled placeholders>
PRICE: Tier <W|A|B|C>, <currency + band>, <term>
MENU STATE: <SELLABLE TODAY / IN BUILD — and what may be said>
```

**Worked example — a Makati auto shop, written under today's constraints**

```
ANGLE: contradictory listings
EVIDENCE: yellow-pages.ph lists them twice with different postcodes
  (1234 and 1200); Philkotse puts them at Makati Cinema Square while
  their own Yelp entry says J. Victor St. Two pages about them disagree
  about where they are.
AUTOMATIONS: TR-01 missed-call-to-text — a 7pm caller gets a reply in
  under a minute instead of ringing the next shop.
  TR-02 quote intake — vehicle, service and contact in one place.
  >> BOTH IN BUILD. Diagnose the loss, quote Tier W only. Do not
  promise a date. Re-open at Tier B when CLO-11 signs off.
ROI: 30 missed calls/mo × 20% × ₱3,000 ticket = ₱18,000/mo at stake.
  Confirm the missed-call count with the owner; do not assert it.
WEBSITE: identity-proof hero — one address, one number, hours, rating.
  Real logo from brand-capture. Labelled placeholder for rates.
PRICE: Tier W, ₱1,500/mo, 6-month term, first month free.
MENU STATE: W-01/W-02/W-03 SELLABLE TODAY. TR-01/TR-02 IN BUILD.
```

Note what the example does: it still **diagnoses** the automation pain and puts a
number on it, because that is what earns the reply — it just does not promise the
automation. Diagnosis is always allowed. Promising is what the menu gates.

---

## Sign-off log

The Automation Engineer adds a row here when a line goes `SELLABLE TODAY`.
A line without a row here is `IN BUILD`, whatever the table above says.

| Date | ID(s) | Signed off by | Evidence |
|---|---|---|---|
| 2026-08-19 | `W-01` `W-02` `W-03` `W-04` `W-05` `BD-01` | Solutions Strategist | 30+ mockups live in this repo and deployed via Cloudflare Pages; `tools/brand-capture` committed. `W-04` carries its stated `mailto:` limitation. |
| — | `CL-01`–`CL-04`, `TR-01`–`TR-04`, `BD-02`, `XC-01`–`XC-04` | *withheld 2026-08-21 — Automation Engineer* | **Not signed off. See "Why no automation line signed off on 2026-08-21" below.** |

### Why no automation line signed off on 2026-08-21

The CEO asked (CLO-11) whether Speed-to-Lead + Booking Engine v1 runs end to
end, and to sign off if it does. It does not, and here is the cut.

**What now runs, live, and is measured** — n8n 2.35.3 on the box, first
remote-mode run 2026-08-21:

- Four inbound shapes normalised: web form, Facebook message, missed call,
  email-only.
- First-touch SMS + email composed and delivered **to a sandbox sink**.
- Messenger drafted, deep-linked, queued for a human with a 60-second deadline.
- Response time measured: **9/9 scenarios, worst case 241 ms of a 60 000 ms
  budget**.
- The weekly owner report aggregated and rendered.

**What has never executed once:** AI qualification, booking confirmation,
reminders, no-show recovery, reactivation, any CRM write, the snapshot export,
and the restore into a second account. That is STL 2–6 plus requirement 2 —
spec-complete, zero-built. GHL workflows and snapshots are UI-only surfaces, and
the only connected location is production.

**Why that blocks even `XC-01`**, which looks like exactly what runs: `XC-01`
promises "a real reply inside 60 seconds". No message has ever left this box.
The transport is a sink by design, and the leg that reaches a real phone needs
the same sandbox sub-account as everything else. Selling `XC-01` today would be
selling a measured 241 ms of *composing* a reply that nobody receives.

Two things found this week that argue for the caution rather than against it —
both surfaced only when the engine was run against live n8n instead of the local
harness, which was green throughout:

1. The weekly owner report — the single artifact previously recorded as BUILT —
   rendered `Your clinic -- week of this week` on the live instance. Clinic name
   and week were read from host env vars the box does not set, and the local
   harness had been injecting fakes. Fixed, and the config now travels in the
   request so a second client is a different POST rather than a host edit.
2. The live CLOUDSPRING WEB LEADS pipeline id was hardcoded in the intake
   workflow. The day someone set a sandbox location id, demo contacts would have
   been aimed at a real pipeline in the location holding two published
   workflows — real outbound, from the company number. Removed, and the harness
   now refuses to run if any live id reappears.

Both are fixed and verified. Neither was visible from a passing local test,
which is the reason this sign-off is being withheld rather than granted on the
strength of "9/9 passing".

**The one thing that unblocks every line above:** a GHL **sandbox sub-account**.
There is no `create-location` API operation — it is a human in the GHL agency
UI, and nothing else on this list moves until it exists. Owner: the CEO /
account holder. Tracked as the blocker on CLO-11.

Diagnosis is still allowed and still earns the reply — see the worked example
above. Only the promise is gated.

## Open escalations to the CEO

1. **Approve or amend Tiers A/B/C** (section P). They price above the
   `PIPELINE-CONFIG.md` band, so no quote may use them until approved. Nothing is
   quotable at those tiers today regardless, so this is not urgent — but it should
   be settled before CLO-11 ships, not after.
2. **The pilot question.** Every automation line is `IN BUILD`, so the menu
   currently forbids selling the thing the agency is named for. If the CEO wants a
   founding-client or pilot motion — selling the stack before it runs, at a
   disclosed build date — that is a deliberate exception to the hard rule and only
   the CEO can grant it. The Strategist's recommendation is **no**: an automation
   sold before it runs against a CRM connection that has failed five consecutive
   runs is a refund and a reference we cannot afford at client #1.
3. **CLO-11 now names its blocker: create a GHL sandbox sub-account.**
   *Updated 2026-08-21 by the Automation Engineer, replacing "blocked on
   nothing".* The engine was run end to end this week and the answer is that
   roughly half of it runs — the n8n intake half, live and measured at 241 ms of
   a 60-second budget — and the Booking Engine half has never executed at all.
   The single thing standing between here and every `IN BUILD` line going
   sellable is a **sandbox sub-account in the GHL agency UI**. There is no
   `create-location` API operation; an agent cannot make one, and writing demo
   contacts into the only connected location risks firing real outbound from the
   company number at real clients.

   **Action, and it is one sitting:** create an empty sub-account, put its id in
   `GHL_SANDBOX_LOCATION_ID`, transcribe STL 1–6 from
   `automation/ghl/speed-to-lead-snapshot-v1.md`, export the snapshot, restore it
   into a second empty sub-account, record the walkthrough. Owner: the CEO /
   account holder.

   The cost of it staying still is unchanged and compounds: ₱3,500–5,000/month of
   upsell per client, against 23 QA-passed cards in READY TO SEND that can
   currently be offered nothing but Tier W. This is still the single
   highest-value unblock on the board — it simply now has a name.

4. **n8n does not survive a reboot.** The Scheduled Task in
   `automation/n8n/README.md` was never registered; `Register-ScheduledTask`
   needs an elevated PowerShell and fails with `Access is denied` from an agent
   run. Until someone runs that one block as admin, the demo surface dies at the
   next reboot and only comes back if a human starts it by hand. Small, but it
   will take the demo down at the worst possible moment.

---

*Maintained by the Solutions Strategist and the Automation Engineer.
Last revised 2026-08-21.*
