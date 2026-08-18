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
2. Create the custom fields, custom values and tags from `snapshot-manifest.json`.
3. Set **every** outbound channel to the sandbox number/sender. No real
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

The one page the owner actually reads. Built in n8n (GHL can't aggregate like
this) and emailed to `{{custom_values.owner_report_email}}`:

```
{{clinic_name}} — week of {{date}}

  New leads                 24
  Answered inside 60s       24  (100%)
  Median response time      8 seconds
  Consultations booked      11  (46% of leads)
  Showed up                  9
  No-shows recovered         2
  Reactivated                1

  Slowest response this week: 41 seconds (Saturday 21:14, Facebook)
```

Median response time comes from `response_seconds`. That single number is the
renewal argument — it is why this report exists.

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

Checks 1 and 3 need a sandbox sub-account. Checks 2 and 4 pass today.
