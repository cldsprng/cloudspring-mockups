# Speed-to-Lead + Booking Engine v1 — GHL build spec (clinic)

Build this by hand in the GHL UI, then export it as the snapshot
`cloudspring-speed-to-lead-clinic v1.0.0`.

**Why by hand:** the GHL public API has no `create-workflow` and no snapshot
operation. Verified 2026-08-19 against the full 302-operation registry — the
closest match is `add-contact-to-workflow`, which enrols a contact in a workflow
that already exists. Workflows and snapshots are UI-only surfaces. Everything
else in `snapshot-manifest.json` (custom fields, custom values, tags, pipeline,
calendar) *is* API-buildable and can be scripted once a sandbox exists.

This document is written so that building is transcription, not design. Copy
strings are final. Never hardcode a clinic name — every `{{custom_values.*}}`
reference is a config point from the manifest.

---

## Before you start

1. A **sandbox sub-account** must exist. Do not build this in the CloudSpring IT
   Solutions location (`AtaR2iB3BL1hlhP4oU26`) — that account holds the live
   EASYCHURCH PH, MYHOMS PH and CLOUDSPRING WEB LEADS pipelines and two
   published workflows.
2. Create the **pipeline** by hand, with stage 1 named **New Lead**. This is a UI
   step, not an API one: the `opportunities` domain has no `create-pipeline`
   operation (re-verified 2026-08-21 — it can read pipelines and act on a deal
   inside one, nothing more). STL 1 action 4 cannot be built until it exists.
   Put its id in `GHL_SANDBOX_PIPELINE_ID` and in the `pipeline_id` custom value.
3. Create the **booking calendar**, and put its id in `booking_calendar_id`.
   STL 3 and STL 4 both trigger off it.
4. Create the custom fields, custom values and tags from `snapshot-manifest.json`.
   Do not hand-type 29 records — generate the plan and have an agent execute it:

   ```bash
   node automation/ghl/provision-sandbox.mjs --location <sandboxLocationId>
   ```

   It refuses to run against any production id. The two ids from steps 2 and 3
   come back as `[defer]` entries — fill them once those exist.
5. Set **every** outbound channel to the sandbox number/sender. No real
   recipient numbers, ever.

---

## STL 1 — First Touch (60s)  ← the workflow the pitch rests on

**Trigger (add all four, one workflow):**
- Form Submitted → mockup enquiry form
- Facebook — Message Received
- Call Status → `no-answer` / `busy` (missed call)
- Inbound Webhook (from n8n, for anything else)

**Settings:** Allow Re-entry **off**. Stop on Response **on**.

| # | Action | Detail |
|---|---|---|
| 1 | Set custom field | `first_touch_at` = `{{right_now}}` |
| 2 | Set custom field | `lead_source_detail` = trigger source |
| 3 | Add tag | `speed-to-lead`, `source-{{source}}` |
| 4 | Create opportunity | pipeline `{{custom_values.pipeline_id}}`, stage **New Lead** |
| 5 | **Send SMS** | *(no wait step before this — the 60s budget is spent here)* |
| 6 | Send Email | only if the contact has an email |
| 7 | Set custom field | `response_seconds` = seconds since `first_touch_at` |
| 8 | Webhook → n8n | `{{custom_values.n8n_webhook_url}}`, for latency logging |

**SMS copy** (keep under 160 chars after substitution):

> Hi {{contact.first_name}}, this is {{custom_values.clinic_name}}. Thanks for
> reaching out! Are you looking to book a consultation? Reply with a day that
> suits you, or book here: {{custom_values.booking_url}}

**Email subject:** `Re: your enquiry to {{custom_values.clinic_name}}`

**Email body:**

> Hi {{contact.first_name}},
>
> Thanks for getting in touch with {{custom_values.clinic_name}}.
>
> We have consultation slots open this week — pick a time that works for you:
> {{custom_values.booking_url}}
>
> {{custom_values.consult_price_note}}
>
> If you'd rather talk first, just reply to this email or call
> {{custom_values.clinic_phone}}.
>
> — {{custom_values.clinic_name}}

**Messenger branch (Facebook — Message Received):** if the contact has no phone
and no email, steps 5 and 6 have nothing to send on. Do **not** add a "send
Facebook message" action.

| # | Action | Detail |
|---|---|---|
| 5m | Set custom field | `messenger_psid` = trigger thread id |
| 6m | Create task | assigned to the clinic user, due **+60 seconds**, title *"Reply on Messenger — {{contact.first_name}}"*, body = the draft below |
| 7m | Internal notification | so the task is seen, not just filed |

**Messenger draft** (the human pastes this; nothing sends it automatically):

> Hi {{contact.first_name}}! Thanks for messaging {{custom_values.clinic_name}}.
> Would you like to book a consultation? Grab a slot here:
> {{custom_values.booking_url}} — or tell me a day that works and I will sort it out.

> **This boundary is permanent.** Facebook does not permit automated sending on
> these threads. A ban takes the page, the ads and the inbox with it — every
> channel at once. We automate up to the send; the send is a human. The n8n
> smoke test fails the build if a Messenger action ever reports `delivered`.
>
> Say it out loud on the walkthrough. "Messenger is drafted in under a second,
> your receptionist taps send" is a *stronger* demo than a claim the prospect
> knows Facebook does not allow.

**After-hours:** do not add a wait. Outside
`{{custom_values.business_hours}}` the same message goes out immediately with
"Someone from the clinic will confirm in the morning." appended. A lead that
waits until 9am is the exact failure this product sells against.

---

## STL 2 — AI Qualification

**Trigger:** Customer Replied (SMS or email), contact has tag `speed-to-lead`.

1. **Conversation AI bot** — goal *Appointment Booking*. Prompt:

   > You are the front desk for {{custom_values.clinic_name}}. Find out (a) what
   > treatment they want, (b) how soon, (c) whether they have been in before.
   > Then send the booking link {{custom_values.booking_url}}. Be warm and brief.
   > Never quote a price beyond {{custom_values.consult_price_note}}. If they ask
   > anything clinical, say a practitioner will confirm at the consult. If they
   > ask twice for something you cannot answer, stop and tag needs-human.

2. Set `treatment_interest` from the bot's captured field.
3. If qualified → set `qualification_status` = `qualified`, add tag `qualified`,
   move opportunity to **Contacted**.
4. If the bot stalls → add tag `needs-human`, notify the clinic user, **exit**.

> Boundary: the bot books, it never diagnoses. Anything clinical routes to a human.

---

## STL 3 — Booking Confirmation

**Trigger:** Appointment Status = Confirmed on `{{custom_values.booking_calendar_id}}`.

1. Add tag `booked`, remove `reactivation`
2. Move opportunity → **Demo Call/Presentation** (clinic equivalent: *Consult Booked*)
3. SMS + email confirmation with date, time and clinic address
4. Remove from STL 6 (Reactivation)

---

## STL 4 — Reminders

**Trigger:** Appointment booked. Two branches off one workflow.

- **24h before** — SMS: *"Hi {{contact.first_name}}, reminder: your consultation
  at {{custom_values.clinic_name}} is tomorrow at {{appointment.time}}. Reply C to
  confirm or R to reschedule."*
- **2h before** — SMS: *"See you in 2 hours at {{custom_values.clinic_name}}.
  Need directions? {{custom_values.clinic_phone}}"*

Reply `R` → send booking link, cancel the remaining reminder.

---

## STL 5 — No-Show Recovery

**Trigger:** Appointment Status = No Show.

1. Increment `no_show_count`; add tag `no-show`
2. **If `no_show_count` >= 2 → exit.** Two attempts, then stop. This cap is the
   difference between recovery and harassment.
3. Wait 1 hour → SMS: *"Sorry we missed you today, {{contact.first_name}}. Want
   to grab another slot? {{custom_values.booking_url}}"*
4. Wait 3 days, if still not booked → final email, then exit.

---

## STL 6 — Reactivation

**Trigger:** tag `qualified` **and** no appointment booked after 30 days.

1. Wait 30 days from `first_touch_at`
2. If tag `booked` → exit
3. SMS referencing `{{contact.treatment_interest}}`:
   *"Hi {{contact.first_name}}, still thinking about
   {{contact.treatment_interest}}? We have slots this week:
   {{custom_values.booking_url}}"*
4. Wait 14 days → one final email → add tag `reactivation`, exit

Honour `opted-out` at every step. Any "STOP" reply exits every STL workflow.

---

## STL 7 — Weekly Owner Report

**Trigger:** Schedule — Mondays 08:00 local.

**BUILT.** `automation/n8n/workflows/weekly-owner-report-v1.json` — nothing to
transcribe into the GHL UI for this one. Verify with
`node automation/n8n/test/weekly-report-smoke.mjs`.

The one page the owner actually reads. Built in n8n (GHL can't aggregate across
contacts, appointments and a custom field in one view) and emailed to
`{{custom_values.owner_report_email}}`. Two ways in, identical numbers: the
Monday 08:00 schedule, and a `POST /webhook/weekly-owner-report` with
`{ rows: [...] }` for showing it on demand during a walkthrough.

Real output from the fixture week:

```
DermHaus Skin Clinic -- week of 2026-08-17

  New leads                 10
  Answered inside 60s        8  (89% of automated)
  Median response time       8 seconds
  Consultations booked       5  (50% of leads)
  Showed up                  4
  No-shows recovered         1
  Reactivated                1

  1 Messenger lead(s) were drafted for a human to send.
  Those are not counted in the 60-second figure.

  Slowest response this week: 75 seconds (2026-08-17T09:08:00Z, web_form)

  NOTE: 1 row(s) were unreadable and are excluded. Check the pipeline.
```

Median response time comes from `response_seconds`. That single number is the
renewal argument — it is why this report exists.

Three things on that page are there on purpose, and none of them flatter us:

- **The percentage is "of automated", not "of leads".** A Messenger-only lead
  was answered by a human, so it cannot count toward a machine's 60-second
  claim. Inflating this number is the easiest lie in the product.
- **The slowest response is named, every week.** 75 seconds is a breach and the
  owner sees it. A report that only shows the median is a brochure.
- **Unreadable rows are counted and flagged.** Silently dropping a lead makes
  the numbers *better*, which is exactly why it must never happen.

---

## Packaging as a snapshot

1. Agency view → **Snapshots** → Create Snapshot from the sandbox sub-account
2. Name `cloudspring-speed-to-lead-clinic`, version `1.0.0`
3. Include: workflows, pipelines, custom fields, custom values, tags, calendars,
   forms, email/SMS templates
4. **Exclude**: contacts, conversations, any sandbox test data
5. Restore into a second empty sub-account and re-run the acceptance test below.
   A snapshot that has never been restored is not a snapshot, it is a backup.

## Acceptance test — the definition of done

| # | Check | How |
|---|---|---|
| 1 | Flow runs end to end | Submit a test lead in the sandbox, watch it reach *booked* |
| 2 | Sub-60s, provable | `node automation/n8n/test/speed-to-lead-smoke.mjs` exits 0 |
| 3 | Snapshot restores clean | Load into a second empty sub-account, re-run check 1 |
| 4 | No live sends | Every attempt shows `sandbox-sink`; smoke test fails if not |
| 5 | Config-only redeploy | Client #2 touches only the manifest `configPoints` |
| 6 | Messenger never auto-sends | Every Messenger action is `manual-queue` / `awaiting_human_send`; smoke test fails if not |
| 7 | Report numbers are right | `node automation/n8n/test/weekly-report-smoke.mjs` exits 0 |

Checks 1 and 3 need a sandbox sub-account. Checks 2, 4, 6 and 7 pass today —
run all four before any walkthrough recording:

```bash
node automation/n8n/test/speed-to-lead-smoke.mjs && \
node automation/n8n/test/weekly-report-smoke.mjs
```
