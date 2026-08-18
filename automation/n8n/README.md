# Speed-to-Lead — n8n side

n8n handles what GHL can't: normalising four inbound shapes into one lead,
measuring the response budget, and aggregating the weekly owner report.

```
automation/
  n8n/
    workflows/speed-to-lead-intake-v1.json   importable n8n workflow
    test/speed-to-lead-smoke.mjs             the sub-60s proof
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

Last run 2026-08-19: **6/6 scenarios, 11/12 nodes exercised, worst case 6 ms of
a 60 000 ms budget.** The one unexercised node is the GHL upsert branch, which
stays dark until a sandbox location exists.

Against a live instance, measuring the real round trip:

```bash
node automation/n8n/test/speed-to-lead-smoke.mjs --url https://<host>/webhook/speed-to-lead
```

Local mode proves the logic and the pipeline budget. Only remote mode proves
network transport — quote remote-mode numbers to prospects, never local ones.

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

## The safety boundary

The transport node writes to a sandbox sink. It must never send a real SMS or
email to a real number from a non-client account.

This is enforced, not just documented: the smoke test asserts every delivery
attempt uses `sandbox-sink`. Verified 2026-08-19 by tampering the workflow to
use `twilio-live` — the harness failed all four delivering scenarios and exited
non-zero. If you swap in a real transport without CEO sign-off, the test breaks.

## When the sandbox sub-account exists

The GHL *credential* is working (confirmed 2026-08-19). What is missing is a
sandbox sub-account to build in. The connector is bound to a single location —
CloudSpring IT Solutions itself — which holds live client pipelines.

> **Reachability differs by session.** From the Automation Engineer's run on
> 2026-08-19, `list_locations` still returned
> `list_locations dependencies are not configured` — the fifth consecutive
> failure from that session. Whoever picks up the GHL work should re-check from
> their own session before assuming either state.
>
> It changes nothing about the build: with no sandbox sub-account,
> `GHL_SANDBOX_LOCATION_ID` stays empty and the gate below routes leads to
> `Queue For GHL Replay` either way. Both readings agree on the next action —
> get a sandbox sub-account.

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
2. Set the environment variables above on the n8n instance
3. Activate. Copy the production webhook URL.
4. Verify: `node automation/n8n/test/speed-to-lead-smoke.mjs --url <that URL>`

**Point GHL at it**

5. In STL 1 step 8, set the webhook action to the URL from step 3
6. Set custom value `n8n_webhook_url` to the same URL

**Per-client redeploy** (target: under 5 working days)

7. Load the snapshot into the client sub-account
8. Edit only `configPoints` in `snapshot-manifest.json`, apply as custom values
9. Swap the sandbox sender for the client's own number — this is the *only*
   point where live sending is enabled, and it needs CEO sign-off
10. Run the acceptance test in the build spec

## Known gaps

- **No sandbox sub-account.** Blocks end-to-end and snapshot-restore proof.
  This is the single blocker on CLO-11 — see "When the sandbox sub-account
  exists" above. It needs a human in the GHL agency UI; there is no API for it.
- **n8n not currently running.** It is installed and `start-n8n.ps1` is in
  place, but nothing answered on `:5678` as of 2026-08-19, so no remote-mode
  numbers exist yet. Start it before quoting a round-trip figure to a prospect.
  Local mode is unaffected and passes today.
- **`Upsert GHL Contact` is a placeholder**, inert by design so the workflow
  imports and runs cleanly either way.
- **STL 7 (weekly report) is specified, not built** — it needs real
  `response_seconds` data, which needs the sandbox.
