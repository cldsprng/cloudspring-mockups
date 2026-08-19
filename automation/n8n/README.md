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
    host/start-n8n.cmd                       logon launcher, copied to the Startup folder
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
node automation/n8n/test/speed-to-lead-smoke.mjs --url http://127.0.0.1:5678/webhook/speed-to-lead
```

Local mode proves the logic and the pipeline budget. Only remote mode proves
network transport — quote remote-mode numbers to prospects, never local ones.

**Remote mode now has numbers.** Against the live host on 2026-08-19, across
three separate runs spanning two restarts: **6/6 scenarios, worst case 244 ms
of a 60 000 ms budget (0.4 %)**, typical case 90–160 ms, in-workflow pipeline
time 44–62 ms. All six executions land in the n8n execution log as
`mode=webhook, status=success`.

That is the number to quote: **under a quarter of a second, against a budget of
sixty seconds.** It is a loopback figure — it proves the engine, not the public
internet. Re-measure through the tunnel before quoting a figure that includes
WAN latency.

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
| Engine log | `C:\Users\ACenteno\cloudspring-n8n\logs\n8n.log` — written and rotated by n8n itself (16 MB × 10) |
| Console log | `...\logs\console-<timestamp>.log` — startup capture only, pruned after 14 days |
| Status | **Running and verified 2026-08-19** — healthy, webhook live, survives restart |

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
prunes old console captures, and tees startup output to a timestamped file.
The real log is written by n8n itself — see "Logging" below.

### Four traps that will cost you an hour

All four were hit and resolved on 2026-08-19. They are not obvious from the
n8n docs.

1. **`/healthz` goes green before the workflow is live.** n8n answers `{"status":"ok"}`
   while it is still activating workflows and registering webhooks. A smoke test
   fired at that moment gets `503` and then `404` and looks like a broken
   workflow. **Poll the webhook itself, not `/healthz`**, before trusting a run:

   ```powershell
   $body = '{"source":"web_form","name":"Boot Probe","phone":"+639170000000","clinic":"Test"}'
   Invoke-WebRequest http://127.0.0.1:5678/webhook/speed-to-lead -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
   ```

   Cold boot on this box takes roughly **60–90 seconds** from launch to a live
   webhook, most of it node loading.

2. **`import:workflow` deactivates what it imports.** The import prints
   `Deactivating workflow "speed-to-lead-intake-v1"` even though the JSON has
   `"active": true`. You must publish it explicitly afterwards.

3. **Publishing does not take effect until n8n restarts.** The CLI says so and
   means it — the webhook stays 404 on the running process:

   ```powershell
   n8n publish:workflow --id=SpeedToLeadIntakeV1   # update:workflow is deprecated
   # then restart n8n, then poll the webhook per trap 1
   ```

4. **Never match PowerShell processes on `*start-n8n*` to kill n8n.** Your own
   shell's command line contains that string, so the filter kills the session
   running it. Match the node process on its bin path instead:

   ```powershell
   Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
     Where-Object { $_.CommandLine -like '*node_modules\n8n\bin*' -or $_.CommandLine -like '*task-runner*' } |
     ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
   ```

### Logging

n8n defaults to **console output only**. The original launcher piped the console
through `Tee-Object`, and the log file was never created — PowerShell
block-buffers a long-running native command's output, so nothing ever flushed.

The fix is to let n8n write the file itself (`N8N_LOG_OUTPUT=console,file`), which
writes through and self-rotates. The `Tee-Object` capture is kept as a secondary
for crashes that happen before the logger is up, and is named `console-*.log` so
the 14-day prune can never delete n8n's rotated engine logs.

```bash
tail -f C:/Users/ACenteno/cloudspring-n8n/logs/n8n.log   # JSON lines
```

Expect ~29 `Task rejected by Runner -- Offer expired` lines during boot. They are
**startup noise, confined to the boot window** — verified: none appear after the
instance settles, and every scenario passes afterwards. Do not chase them.

### Surviving a reboot

**What is actually installed:** a launcher in the per-user Startup folder.

```
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\CloudSpring n8n.cmd
```

It needs no elevation, runs at logon, and is the mechanism in place today.
Canonical copy: `host/start-n8n.cmd`.

Restart survival was **verified by test, not assumed** — on 2026-08-19 n8n was
killed and relaunched three times through `start-n8n.ps1`; each time it came
back healthy with the workflow still active and 6/6 scenarios passing. The
SQLite database and the workflow's active state persist across the restart.

> **Caveat, stated plainly:** the Startup folder fires **at logon, not at boot**.
> If the box reboots and nobody logs in, n8n does not come up. It also does not
> restart after a crash. For an unattended demo host, that is not good enough.

**The better mechanism, still blocked.** A Scheduled Task covers both gaps
(`-AtLogOn` plus `-RestartCount 3`). Registering it **fails with `Access is
denied`** from both `Register-ScheduledTask` and `schtasks` — retried again on
2026-08-19, still denied. It needs an elevated shell. Run this from an
Administrator PowerShell, then delete the Startup `.cmd` so n8n is not started
twice:

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
# set N8N_USER_FOLDER=C:\Users\ACenteno\cloudspring-n8n first, or the CLI
# talks to a different database than the running instance
n8n import:workflow --separate --input=automation/n8n/workflows
n8n publish:workflow --id=SpeedToLeadIntakeV1     # import deactivates; see trap 2
n8n export:workflow --all --pretty --separate --output=automation/n8n/workflows
```

Commit the export diff after any UI edit, or the next client deployment ships
whatever was last committed rather than what was last built.

> **Do not export blindly over the repo copy.** Verified 2026-08-19: the round
> trip preserves what matters — node set, connections and every Code node body
> come back byte-identical. But the export also adds instance-local bookkeeping
> that does not belong in a versioned artifact: `createdAt`, `updatedAt`,
> `versionCounter`, `activeVersionId`, `triggerCount`, `shared`, `versionMetadata`
> and friends. Strip those from the diff, or the repo accumulates churn and one
> box's identifiers.

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

The GHL *credential* is working. What is missing is a sandbox sub-account to
build in. The connector is bound to a single location — CloudSpring IT Solutions
itself — which holds live client pipelines.

> **Settled 2026-08-19.** An earlier note here recorded two conflicting readings
> of the credential's health. That is resolved: the credential **works**, and
> `get-pipelines` returned 200 with all three pipelines on location
> `AtaR2iB3BL1hlhP4oU26`.
>
> **`list_locations` is not a valid health check.** It is broken for
> single-location connections, and its `dependencies are not configured` reply
> carries no information about the credential. Every "consecutive failure" logged
> against it was a misread of a broken probe. Health-check with `get-pipelines`.
>
> The blocker is therefore **not** a credential. It is that no sandbox
> sub-account exists, and the API has no `create-location` — so it needs a human
> in the GHL agency UI. `GHL_SANDBOX_LOCATION_ID` stays empty, and the gate below
> correctly routes every lead to `Queue For GHL Replay`.

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
   (or the CLI round trip above)
2. Set the environment variables above on the n8n instance
3. Activate — **then restart n8n**, and confirm the webhook answers before
   trusting anything. Traps 1–3 above are all in this one step.
4. Copy the production webhook URL.
5. Verify: `node automation/n8n/test/speed-to-lead-smoke.mjs --url <that URL>`
   Exit 0, 6/6, worst case well inside the 60 000 ms budget.

**Point GHL at it**

6. In STL 1 step 8, set the webhook action to the URL from step 4
7. Set custom value `n8n_webhook_url` to the same URL

**Per-client redeploy** (target: under 5 working days)

8. Load the snapshot into the client sub-account
9. Edit only `configPoints` in `snapshot-manifest.json`, apply as custom values
10. Swap the sandbox sender for the client's own number — this is the *only*
    point where live sending is enabled, and it needs CEO sign-off
11. Run the acceptance test in the build spec

## Known gaps

- **No sandbox sub-account.** Blocks end-to-end and snapshot-restore proof.
  This is the single blocker on CLO-11 — see "When the sandbox sub-account
  exists" above. It needs a human in the GHL agency UI; there is no API for it.
- ~~n8n not currently running.~~ **Closed 2026-08-19.** n8n 2.35.3 is running,
  reachable on `:5678`, the intake workflow is active, and remote-mode numbers
  exist (see "Run the proof").
- **Logon-only restart, no crash recovery.** The Startup-folder launcher fires at
  logon, not at boot, and does not restart n8n if it dies. Needs one elevated
  command to fix — see "Surviving a reboot". This is the weakest link in the
  demo host.
- **Running n8n outside a container is deprecated upstream.** n8n warns that
  future versions will require the official Docker image. Docker is not on this
  box. Not urgent, but it puts a clock on the native install — revisit before
  the next major upgrade rather than during an outage.
- **`Upsert GHL Contact` is a placeholder**, inert by design so the workflow
  imports and runs cleanly either way.
- **The weekly report runs on supplied rows, not a live GHL fetch.** STL 7 is
  built and every metric is tested, but `Load Week` is handed rows rather than
  querying GHL for them. Wiring that query is a one-node change once the sandbox
  exists — the aggregation and the rendering are done and proven.
- **Messenger has no automated send, and never will.** Not a gap; a boundary.
  See "The safety boundary".
