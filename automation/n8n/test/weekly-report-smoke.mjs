#!/usr/bin/env node
// STL 7 -- weekly owner report smoke test.
//
//   node weekly-report-smoke.mjs
//   node weekly-report-smoke.mjs --url http://localhost:5678/webhook/weekly-owner-report
//
// The report is the renewal argument: it is the only place the owner sees the
// sub-60-second number. So every figure below is hand-computed from the fixture
// and asserted exactly. If a metric changes, this test must change with it
// deliberately -- never by loosening an assertion.
//
// Exit code 0 = every metric matched and the sandbox boundary held.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const WORKFLOW = join(HERE, '..', 'workflows', 'weekly-owner-report-v1.json')

const args = {}
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1] ?? true
}

const ENV = {
  STL_DELIVERY_MODE: process.env.STL_DELIVERY_MODE || 'sandbox',
  STL_CLINIC_NAME: 'DermHaus Skin Clinic',
  STL_OWNER_REPORT_EMAIL: 'owner@sandbox.invalid',
  STL_REPORT_WEEK_OF: '2026-08-17',
}

// --- fixture week ----------------------------------------------------------
// Ten readable leads plus one corrupt row. Deliberately includes a Messenger
// lead (no automated response) and one genuine breach of the 60s budget -- a
// fixture where everything is perfect would not prove the report is honest.

const L = (id, source, response_seconds, extra = {}) => ({
  id,
  source,
  received_at: '2026-08-17T09:0' + (id % 10) + ':00Z',
  response_seconds,
  ...extra,
})

const ROWS = [
  L(1, 'web_form', 4, { booked: true, showed: true }),
  L(2, 'web_form', 8, { booked: true, showed: true }),
  L(3, 'facebook', 12, { booked: true, showed: true }),
  L(4, 'missed_call', 6),
  L(5, 'web_form', 41, { booked: true, no_show_count: 1, recovered: true }),
  L(6, 'facebook', null, { booked: true, showed: true }), // Messenger-only: human sent it
  L(7, 'missed_call', 9),
  L(8, 'web_form', 75), // the breach the owner is entitled to see
  L(9, 'facebook', 5, { reactivated: true }),
  L(10, 'web_form', 7),
  { id: null, source: 'web_form' }, // corrupt: must be reported, never silently dropped
]

// Hand-computed from ROWS above.
//   answered      = 9 rows carry a response_seconds (all but #6)
//   inside 60s    = 8 of those 9 (#8 is 75s)      -> 89%
//   median        = [4,5,6,7,8,9,12,41,75] -> 8
//   booked        = #1,2,3,5,6 = 5 of 10          -> 50%
const EXPECT = {
  new_leads: 10,
  answered_count: 9,
  inside_budget: 8,
  inside_budget_pct: 89,
  median_response_seconds: 8,
  booked: 5,
  booked_pct: 50,
  showed: 4,
  recovered: 1,
  reactivated: 1,
  manual_only: 1,
  rejected_rows: 1,
}

// --- minimal n8n executor (same contract as speed-to-lead-smoke.mjs) --------

function runCodeNode(node, items) {
  const fn = Function('$input', '$env', `"use strict";\n${node.parameters.jsCode}`)
  const out = fn({ all: () => items }, ENV)
  if (!Array.isArray(out)) throw new Error(`${node.name}: Code node did not return an array`)
  return out
}

function executeWorkflow(wf, body, startType) {
  const byName = new Map(wf.nodes.map((n) => [n.name, n]))
  const start = wf.nodes.find((n) => n.type === startType)
  if (!start) throw new Error(`workflow has no ${startType} node`)

  const responses = []
  const visited = new Set()

  const walk = (node, items) => {
    if (items.length === 0) return
    let out
    switch (node.type) {
      case 'n8n-nodes-base.webhook':
      case 'n8n-nodes-base.scheduleTrigger':
        out = items
        break
      case 'n8n-nodes-base.code':
        out = runCodeNode(node, items)
        break
      case 'n8n-nodes-base.respondToWebhook':
        responses.push(...items)
        return
      default:
        throw new Error(`${node.name}: unsupported node type ${node.type}`)
    }
    visited.add(node.name)
    const conns = wf.connections[node.name]
    if (!conns) return
    for (const c of conns.main[0] ?? []) walk(byName.get(c.node), out)
  }

  walk(start, [{ json: { body } }])
  return { responses, visited }
}

// --- run -------------------------------------------------------------------

const wf = JSON.parse(await readFile(WORKFLOW, 'utf8'))
const remote = typeof args.url === 'string' ? args.url : null

console.log(`Weekly owner report smoke test -- ${remote ? `REMOTE ${remote}` : 'LOCAL (no n8n needed)'}`)
console.log(`workflow: ${wf.name}`)
console.log('')

const problems = []
let out

if (remote) {
  const res = await fetch(remote, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rows: ROWS }),
  })
  if (res.status !== 200) problems.push(`HTTP ${res.status}`)
  out = await res.json()
} else {
  const run = executeWorkflow(wf, { rows: ROWS }, 'n8n-nodes-base.webhook')
  if (run.responses.length !== 1) {
    problems.push(`expected 1 response, got ${run.responses.length}`)
  }
  out = run.responses[0]?.json ?? {}

  // The Monday schedule and the on-demand webhook must not diverge. If they
  // ever produce different numbers, the owner is reading a different report
  // than the one we demoed.
  const sched = executeWorkflow(wf, { rows: ROWS }, 'n8n-nodes-base.scheduleTrigger')
  const a = JSON.stringify(sched.responses[0]?.json?.metrics ?? null)
  const b = JSON.stringify(out.metrics ?? null)
  if (a !== b) problems.push('schedule trigger and webhook produced different metrics')
}

const m = out.metrics ?? {}
for (const [k, want] of Object.entries(EXPECT)) {
  if (m[k] !== want) problems.push(`${k}: expected ${want}, got ${m[k]}`)
}

// The slowest response must be named. A report that hides its worst number is
// not a report the owner can trust.
if (m.slowest?.seconds !== 75) {
  problems.push(`slowest: expected 75s, got ${m.slowest?.seconds}`)
}
if (m.slowest?.source !== 'web_form') {
  problems.push(`slowest source: expected web_form, got ${m.slowest?.source}`)
}

// Sandbox boundary -- identical rule to the intake workflow.
if (out.delivery?.transport !== 'sandbox-sink') {
  problems.push(`delivery transport "${out.delivery?.transport}" -- must be sandbox-sink`)
}

// The rendered page must actually carry the numbers, not just compute them.
const text = out.report_text ?? ''
const MUST_CONTAIN = [
  'DermHaus Skin Clinic',
  'week of 2026-08-17',
  'Median response time',
  'Slowest response this week: 75 seconds',
  'Messenger lead(s) were drafted for a human to send',
  '1 row(s) were unreadable',
]
for (const s of MUST_CONTAIN) {
  if (!text.includes(s)) problems.push(`report text missing: "${s}"`)
}

// Every node must run, or the demo has an untested path.
if (!remote) {
  const { visited } = executeWorkflow(wf, { rows: ROWS }, 'n8n-nodes-base.webhook')
  const covered = new Set([...visited, 'Respond', 'Monday 08:00'])
  const uncovered = wf.nodes.map((n) => n.name).filter((n) => !covered.has(n))
  if (uncovered.length) problems.push(`nodes not exercised: ${uncovered.join(', ')}`)
}

console.log(text || '(no report rendered)')
console.log('')
for (const p of problems) console.log(`  - ${p}`)
console.log(problems.length === 0 ? 'OK -- every metric matched' : `FAILED -- ${problems.length} problem(s)`)

process.exit(problems.length === 0 ? 0 : 1)
