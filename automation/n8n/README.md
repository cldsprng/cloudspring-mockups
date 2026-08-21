# Speed-to-Lead — n8n side

n8n handles what GHL can't: normalising four inbound shapes into one lead,
measuring the response budget, and aggregating the weekly owner report.

```
automation/
  n8n/
    workflows/speed-to-lead-intake-v1.json   importable n8n workflow
    workflows/weekly-owner-report-v1.json    STL 7, the weekly owner report
    test/speed-to-lead-smoke.mjs             the sub-60s proof
    test/weekly-report-smoke.mjs             every report metric, hand-checked
    host/start-n8n.ps1                       deployed to the box, see "The host"
    host/.env.example                        config template (secrets stay off the repo)
    README.md                                this file
  ghl/
    speed-to-lead-snapshot-v1.md             UI build spec (workflows are UI-only)
    snapshot-manifest.json                   every config point for client #2
```

## Run the proof

```bash
node automation/n8n/test/speed-to-lead-smoke.mjs
```

No dependencies, no browser, no running n8n — same constraints as
`tools/brand-capture`, so it runs in any scheduled run. Exit 0 means every
scenario passed inside the 60-second budget.

Last run 2026-08-19: **9/9 scenarios, 11/12 nodes exercised, worst case 3 ms of
a 60 000 ms budget.** The one unexercised node is the GHL upsert branch, which
stays dark until a sandbox location exists.

The weekly owner report has its own harness — every figure on the page is
hand-computed in the fixture and asserted exactly:

```bash
node automation/n8n/test/weekly-report-smoke.mjs
```

It also runs the workflow twice, once from the Monday schedule and once from the
on-demand webhook, and fails if the two produce different numbers. The owner must
never read a different report than the one we demoed.

Against a live instance, measuring the real round trip:

```bash
node automation/n8n/test/speed-to-lead-smoke.mjs --url https://<host>/webhook/speed-to-lead
```

Local mode proves the logic and the pipeline budget. Only remote mode proves
network transport — quote remote-mode numbers to prospects, never local ones.

**Remote-mode numbers now exist.** First run against live n8n 2.35.3 on
2026-08-21: intake **9/9 scenarios, worst case 241 ms of a 60 000 ms budget
(0.4%)**; weekly report every metric matched. Those are the figures to quote.
They cover normalise → compose → sandbox delivery → measure. They do **not**
cover a real SMS or email leaving the box, because nothing does that yet.

Running remote mode is not optional diligence — it is the only mode that finds
certain bugs. Two examples, both caught on the first remote run and both green
in local mode at the time:

- The weekly report rendered `Your clinic -- week of this week`. The clinic name
  and week came from `$env` alone, and the local harness *supplies* a fake `$env`
  the real host does not have. See "Config resolution" below.
- `import:workflow` had silently deactivated both workflows. Local mode reads the
  JSON off disk and never notices.

## The host

Where n8n actually runs, and how it comes back after a reboot (CLO-14).

| | |
|---|---|
| Host | The user's own Windows 11 box — free, no hosting bill |
| Install | `npm install -g n8n` — **native Node, no Docker** (Docker is not installed here) |
| Node | v24.19.0 |
| Data | SQLite + encryption key under `C:\Users\ACenteno\cloudspring-n8n\.n8n\` |
| Config | `C:\Users\ACenteno\cloudspring-n8n\.env` — **never in this repo** |
| Listener | `http://127.0.0.1:5678` — loopback only, deliberately not internet-facing |
| Logs | `C:\Users\ACenteno\cloudspring-n8n\logs\n8n-<timestamp>.log`, pruned after 14 days |

Everything outside `.n8n\` and `.env` is versioned here under `automation/n8n/`.

### Start, stop, check

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\ACenteno\cloudspring-n8n\start-n8n.ps1

(Invoke-WebRequest http://127.0.0.1:5678/healthz -UseBasicParsing).Content   # {"status":"ok"}

Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -like '*n8n*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

`start-n8n.ps1` loads `.env`, points `N8N_USER_FOLDER` at the CloudSpring folder,
prunes old logs, and tees output to a timestamped log.

### Surviving a reboot

A Windows Scheduled Task starts n8n at logon. `-RestartCount 3` also covers a
crash, not just a reboot.

```powershell
$a = New-ScheduledTaskAction -Execute 'powershell.exe' `
      -Argument '-ExecutionPolicy Bypass -WindowStyle Hidden -File C:\Users\ACenteno\cloudspring-n8n\start-n8n.ps1'
$t = New-ScheduledTaskTrigger -AtLogOn
$s = New-ScheduledTaskSettingsSet -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
      -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName 'CloudSpring n8n' -Action $a -Trigger $t -Settings $s

Get-ScheduledTaskInfo -TaskName 'CloudSpring n8n'
Start-ScheduledTask   -TaskName 'CloudSpring n8n'
```

### Getting workflows in and out

The repo is the source of truth, not the n8n database.

```bash
n8n import:workflow --separate --input=automation/n8n/workflows
n8n export:workflow --all --pretty --separate --output=automation/n8n/workflows
```

Commit the export diff after any UI edit, or the next client deployment ships
whatever was last committed rather than what was last built.

> **`import:workflow` takes the demo down. Importing is three commands, not one.**
>
> On n8n 2.x an import *deactivates* every workflow it touches — it prints
> `Deactivating workflow "speed-to-lead-intake-v1"` and then reports success, so
> it reads like it worked. The webhooks are dead from that moment and every call
> returns **404**, with `Active version not found for workflow with id ...` in
> the log. Setting `active = 1` in the database does not fix it: 2.x needs a
> *published version*, and `import` does not create one.
>
> `n8n update:workflow --all --active=true` — which the older runbooks reach for
> — is deprecated and does nothing but print a warning.
>
> The sequence that actually works, verified 2026-08-21:
>
> ```powershell
> n8n import:workflow --separate --input=automation/n8n/workflows
> n8n publish:workflow --id=SpeedToLeadIntakeV1
> n8n publish:workflow --id=WeeklyOwnerReportV1
> # then restart n8n -- publish says so itself, and it means it
> ```
>
> Confirm with a real call before you believe it. Webhook registration lags
> `/healthz` by roughly 30 seconds after a restart: healthz answers `ok` while
> the webhook still returns 404, then 000, then 200. Poll the webhook, not
> healthz, or you will conclude the import failed when it merely had not
> finished. Never demo straight off a restart.

> This repo is public — Cloudflare Pages serves it at
> `preview.cloudspringitsolutions.com`. n8n exports carry credential
> *references*, never credential *values*, so nothing here is sensitive. Keep it
> that way: secrets belong in the host `.env`.

### Showing it to a prospect

Loopback by default. `cloudflared` is already on the box:

```powershell
cloudflared tunnel --url http://127.0.0.1:5678
```

Take the tunnel down when the demo ends. n8n on a public URL with nothing in
front of it is not something to leave running.

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `STL_DELIVERY_MODE` | `sandbox` | Only `sandbox` is wired. Any other value makes the transport node throw rather than silently drop messages. |
| `STL_BOOKING_URL` | CloudSpring discovery call | Booking link in first-touch copy |
| `GHL_SANDBOX_LOCATION_ID` | *(empty)* | Empty ⇒ leads queue for replay. Set ⇒ upsert path runs. |
| `GHL_SANDBOX_PIPELINE_ID` | *(empty)* | Pipeline the upsert targets. **No default, deliberately** — see below. |
| `STL_CLINIC_NAME` | `Your clinic` | Report header. Fallback only; the payload should name the clinic. |
| `STL_REPORT_WEEK_OF` | *(derived)* | Last-resort fallback. Normally derived from the data. |

### Config resolution

The weekly report resolves its identity **payload → env → default**, and
`week_of` additionally **derives** from the rows when no caller names it (the
Monday on or before the earliest lead).

That ordering is not cosmetic. Reading these from `$env` alone had two costs:

1. The live report rendered `Your clinic -- week of this week` — no name, no
   date — because the host `.env` has neither variable set. The local harness
   hid this by injecting a fake `$env`.
2. One n8n instance could only ever report for **one** clinic, and a second
   client would mean editing the host `.env` and restarting. That is
   construction, not configuration, which is exactly what requirement 2 of
   CLO-11 forbids. A second client is now a different POST body.

A static `STL_REPORT_WEEK_OF` also goes stale the week after it is set, which is
why derivation sits above it: the Monday schedule carries no payload, and a
report that names the wrong week is worse than one that names none.

### Production ids are banned from the workflow

`GHL_SANDBOX_PIPELINE_ID` has no default. It used to: `7yd9fhvPcfz1vqbF3kxN`,
the **live CLOUDSPRING WEB LEADS pipeline**, was hardcoded in `GHL Gate`. The
day someone sets `GHL_SANDBOX_LOCATION_ID`, that would have aimed demo contacts
at a real pipeline in the location that holds two published workflows — real
outbound, from the company number, to real people.

`speed-to-lead-smoke.mjs` now refuses to run at all if any live CloudSpring id
appears as a literal value in the workflow, and names the node. Verified
2026-08-21 against the pre-fix file: it fails and exits non-zero.

## The safety boundary

The transport node writes to a sandbox sink. It must never send a real SMS or
email to a real number from a non-client account.

This is enforced, not just documented: the smoke test asserts every delivery
attempt uses `sandbox-sink`. Verified 2026-08-19 by tampering the workflow to
use `twilio-live` — the harness failed all four delivering scenarios and exited
non-zero. If you swap in a real transport without CEO sign-off, the test breaks.

### Messenger is a second, permanent boundary

Facebook does not permit automated sending on these threads. So the engine goes
right up to the send and stops: it drafts the reply, attaches a deep link to the
thread, stamps a `due_by` 60 seconds out, and hands it to a human. Messenger
actions live in `delivery.manual_actions`, never in `delivery.attempts`, and
carry `status: awaiting_human_send`.

Two consequences worth stating plainly:

- A Messenger-only lead reports `timing.automated: false`. It does **not** count
  toward the sub-60-second claim, in the API response or on the weekly report.
  Outreach quotes the 60-second line for SMS and email.
- Verified 2026-08-19 by tampering the workflow to report `delivered` on a
  Messenger action — the harness failed both Messenger scenarios and exited
  non-zero.

Unlike the sandbox sink, this one does not lift when a client signs. It is what
Facebook allows, not what we have not built yet.

## When the sandbox sub-account exists

The GHL *credential* is working (confirmed 2026-08-19). What is missing is a
sandbox sub-account to build in. The connector is bound to a single location —
CloudSpring IT Solutions itself — which holds live client pipelines.

> **Do not health-check with `list_locations`.** It returns
> `dependencies are not configured` on this connection and always will — the
> helper is meaningless when the connector is bound to a single location. It is
> not an outage signal, and reading it as one is what recorded GHL as broken for
> four consecutive runs. Use a real read instead:
> `execute_operation` → `get-pipelines`. Re-confirmed **2026-08-21**: HTTP 200,
> three live pipelines, location `AtaR2iB3BL1hlhP4oU26`.
>
> It changes nothing about the build: with no sandbox sub-account,
> `GHL_SANDBOX_LOCATION_ID` stays empty and the gate below routes leads to
> `Queue For GHL Replay`. The next action is unchanged — get a sandbox
> sub-account.

Once a sandbox exists:

1. Set `GHL_SANDBOX_LOCATION_ID` to the new sub-account id.
2. Re-run the smoke test — the `Upsert GHL Contact` branch now runs and
   `Queue For GHL Replay` goes dark. Both configs must exit 0.
3. Replace the placeholder in `Upsert GHL Contact` with an HTTP Request node
   against `POST /contacts/upsert` (the API *can* do contacts, fields, values,
   tags, pipelines and calendars — just not workflows or snapshots).
4. Drain anything parked by `Queue For GHL Replay`.
5. Build the seven STL workflows by hand from
   `../ghl/speed-to-lead-snapshot-v1.md`, then export the snapshot.

## Deploy runbook

**Install the intake workflow**

1. n8n → Workflows → Import from File → `workflows/speed-to-lead-intake-v1.json`
   (importing from the CLI instead? read the `import:workflow` warning above
   first — it deactivates, and you must `publish:workflow` and restart)
2. Set the environment variables above on the n8n instance
3. Activate. Copy the production webhook URL.
4. Verify against that URL — **not** in local mode, which cannot see a
   deactivated workflow, a missing env var or a network problem:
   `node automation/n8n/test/speed-to-lead-smoke.mjs --url <that URL>`
   Poll until it answers 200; registration lags a restart by ~30s.
5. Verify the report too:
   `node automation/n8n/test/weekly-report-smoke.mjs --url <report URL>`

**Point GHL at it**

6. In STL 1 step 8, set the webhook action to the URL from step 3
7. Set custom value `n8n_webhook_url` to the same URL

**Per-client redeploy** (target: under 5 working days)

8. Load the snapshot into the client sub-account
9. Edit only `configPoints` in `snapshot-manifest.json`, apply as custom values.
   `clinic_name` and `week_of` go in the report **payload**, not the host `.env`
   — one n8n instance serves every client.
10. Swap the sandbox sender for the client's own number — this is the *only*
    point where live sending is enabled, and it needs CEO sign-off
11. Run the acceptance test in the build spec

## Known gaps

- **No sandbox sub-account.** Blocks end-to-end and snapshot-restore proof.
  This is the single blocker on CLO-11 — see "When the sandbox sub-account
  exists" above. It needs a human in the GHL agency UI; there is no API for it.
- ~~**n8n not currently running.**~~ **Closed 2026-08-21.** n8n 2.35.3 is up on
  `:5678`, both workflows imported, published and active, and remote-mode
  numbers exist (see "Run the proof").
- **n8n does not survive a reboot yet.** The Scheduled Task documented above
  under "Surviving a reboot" **is not registered** — `Get-ScheduledTask` finds
  nothing, and `Register-ScheduledTask` fails with `Access is denied` from a
  non-elevated session. Until someone runs that block in an **admin** PowerShell,
  the demo surface dies at the next reboot and comes back only if a human runs
  `start-n8n.ps1` by hand. One command, needs elevation, cannot be automated
  from an agent run.
- **`Upsert GHL Contact` is a placeholder**, inert by design so the workflow
  imports and runs cleanly either way.
- **The weekly report runs on supplied rows, not a live GHL fetch.** STL 7 is
  built and every metric is tested, but `Load Week` is handed rows rather than
  querying GHL for them. Wiring that query is a one-node change once the sandbox
  exists — the aggregation and the rendering are done and proven.
- **Messenger has no automated send, and never will.** Not a gap; a boundary.
  See "The safety boundary".
