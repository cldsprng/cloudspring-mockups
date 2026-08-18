#!/usr/bin/env node
// Speed-to-Lead smoke test -- proves the sub-60-second claim.
// No browser, no dependencies, no running n8n required. Same constraints as
// tools/brand-capture, so this runs inside any scheduled run.
//
//   node speed-to-lead-smoke.mjs                      # local mode (default)
//   node speed-to-lead-smoke.mjs --url http://localhost:5678/webhook/speed-to-lead
//
// LOCAL mode executes the Code/IF nodes of speed-to-lead-intake-v1.json in
// graph order, in-process. It proves the LOGIC and the pipeline budget without
// n8n. It does not prove network transport.
//
// REMOTE mode POSTs each scenario at a live n8n webhook and measures the real
// round trip from the caller's side -- the number Outreach is allowed to quote.
//
// Exit code 0 = every scenario met its expectation and stayed inside budget.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const WORKFLOW = join(HERE, '..', 'workflows', 'speed-to-lead-intake-v1.json')

// The claim the whole pitch rests on. Do not raise this to make a test pass.
const BUDGET_MS = 60000

const args = {}
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1] ?? true
}

const ENV = {
  STL_BOOKING_URL:
    process.env.STL_BOOKING_URL ||
    'https://api.leadconnectorhq.com/widget/booking/QRPEnWRw2Kx9rBe0Mj6J',
  // Empty on purpose until a sandbox sub-account exists. The workflow's GHL
  // gate reads this to decide upsert-now vs queue-for-replay.
  GHL_SANDBOX_LOCATION_ID: process.env.GHL_SANDBOX_LOCATION_ID || '',
  STL_DELIVERY_MODE: process.env.STL_DELIVERY_MODE || 'sandbox',
}

// --- scenarios -------------------------------------------------------------
// One per inbound channel named in CLO-11, plus the two rejection paths.

const SCENARIOS = [
  {
    name: 'mockup form -- phone + email',
    body: {
      source: 'web_form',
      name: 'Maria Santos',
      phone: '+639171234567',
      email: 'maria.santos@example.com',
      message: 'Do you do acne consultations on Saturdays?',
      clinic: 'DermHaus Skin Clinic',
      mockup_url: 'https://preview.cloudspringitsolutions.com/dermhaus-skin-clinic-qc/',
    },
    expect: { ok: true, channels: ['sms', 'email'] },
  },
  {
    name: 'facebook message -- no email',
    body: {
      source: 'facebook',
      name: 'Jomar Reyes',
      phone: '09281234567',
      message: 'magkano po ang consultation?',
      clinic: 'DermHaus Skin Clinic',
    },
    expect: { ok: true, channels: ['sms'] },
  },
  {
    name: 'missed call -- phone only, no name',
    body: { source: 'missed_call', from: '+639998887766', clinic: 'DermHaus Skin Clinic' },
    expect: { ok: true, channels: ['sms'] },
  },
  {
    name: 'email-only web lead',
    body: {
      source: 'web_form',
      name: 'Ana Cruz',
      email: 'ana@example.com',
      clinic: 'DermHaus Skin Clinic',
    },
    expect: { ok: true, channels: ['email'] },
  },
  {
    name: 'REJECT -- no reachable channel',
    body: { source: 'web_form', name: 'Ghost Lead', clinic: 'DermHaus Skin Clinic' },
    expect: { ok: false, problems: ['no_reachable_channel'] },
  },
  {
    name: 'REJECT -- unknown source',
    body: { source: 'tiktok_dm', name: 'Someone', phone: '+639171112222' },
    expect: { ok: false, problems: ['unknown_source:tiktok_dm'] },
  },
]

// --- a very small n8n executor --------------------------------------------
// Supports only the node types this workflow uses. It deliberately throws on
// anything else rather than silently skipping a node and reporting a pass.

function evalExpression(expr, json) {
  const inner = String(expr).replace(/^=/, '').replace(/^\{\{/, '').replace(/\}\}$/, '').trim()
  return Function('$json', `"use strict"; return (${inner});`)(json)
}

function runCodeNode(node, items) {
  const code = node.parameters.jsCode
  if (node.parameters.mode !== 'runOnceForAllItems') {
    throw new Error(`${node.name}: unsupported Code mode ${node.parameters.mode}`)
  }
  const $input = { all: () => items }
  const fn = Function('$input', '$env', `"use strict";\n${code}`)
  const out = fn($input, ENV)
  if (!Array.isArray(out)) throw new Error(`${node.name}: Code node did not return an array`)
  return out
}

function runIfNode(node, items) {
  const cond = node.parameters.conditions.conditions[0]
  const pass = []
  const fail = []
  for (const item of items) {
    const left = evalExpression(cond.leftValue, item.json)
    const op = cond.operator
    let result
    if (op.type === 'boolean' && op.operation === 'true') result = left === true
    else throw new Error(`${node.name}: unsupported operator ${op.type}/${op.operation}`)
    ;(result ? pass : fail).push(item)
  }
  return [pass, fail]
}

function loadGraph(wf) {
  const byName = new Map(wf.nodes.map((n) => [n.name, n]))
  for (const [from, spec] of Object.entries(wf.connections)) {
    if (!byName.has(from)) throw new Error(`connection from unknown node "${from}"`)
    for (const branch of spec.main) {
      for (const c of branch) {
        if (!byName.has(c.node)) throw new Error(`"${from}" connects to unknown node "${c.node}"`)
      }
    }
  }
  return byName
}

// Runs the graph from the webhook node. Returns whatever reaches Respond.
function executeWorkflow(wf, byName, body) {
  const start = wf.nodes.find((n) => n.type === 'n8n-nodes-base.webhook')
  if (!start) throw new Error('workflow has no webhook trigger')

  const responses = []
  const visited = new Set()

  const walk = (node, items) => {
    if (items.length === 0) return
    let outputs
    switch (node.type) {
      case 'n8n-nodes-base.webhook':
        outputs = [items]
        break
      case 'n8n-nodes-base.code':
        outputs = [runCodeNode(node, items)]
        break
      case 'n8n-nodes-base.if':
        outputs = runIfNode(node, items)
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
    conns.main.forEach((branch, i) => {
      for (const c of branch) walk(byName.get(c.node), outputs[i] ?? [])
    })
  }

  walk(start, [{ json: { body } }])
  return { responses, visited }
}

// --- checking --------------------------------------------------------------

function checkLocal(scenario, res) {
  const problems = []
  if (res.responses.length !== 1) {
    problems.push(`expected 1 response, got ${res.responses.length}`)
    return problems
  }
  const out = res.responses[0].json

  if (out.ok !== scenario.expect.ok) {
    problems.push(`expected ok=${scenario.expect.ok}, got ok=${out.ok}`)
  }

  if (scenario.expect.ok) {
    const sent = (out.delivery?.attempts ?? []).map((a) => a.channel).sort()
    const want = [...scenario.expect.channels].sort()
    if (sent.join(',') !== want.join(',')) {
      problems.push(`expected channels [${want}], sent [${sent}]`)
    }
    for (const a of out.delivery?.attempts ?? []) {
      if (a.transport !== 'sandbox-sink') {
        problems.push(`channel ${a.channel} used transport "${a.transport}" -- must be sandbox-sink`)
      }
    }
    if (!out.timing) problems.push('no timing block -- the sub-60s claim is unmeasured')
    else if (!out.timing.within_budget) {
      problems.push(`pipeline_ms=${out.timing.pipeline_ms} exceeded budget ${out.timing.budget_ms}`)
    }
    // With no sandbox location the lead must be queued, never silently dropped.
    const crmStatus = out.crm?.status
    const expected = ENV.GHL_SANDBOX_LOCATION_ID ? 'upsert_pending_wiring' : 'queued_for_replay'
    if (crmStatus !== expected) {
      problems.push(`expected crm.status="${expected}", got "${crmStatus}"`)
    }
  } else {
    for (const p of scenario.expect.problems ?? []) {
      if (!(out.problems ?? []).includes(p)) {
        problems.push(`expected problem "${p}", got [${out.problems}]`)
      }
    }
  }
  return problems
}

async function postRemote(url, body) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), BUDGET_MS)
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    let json
    try {
      json = JSON.parse(text)
    } catch {
      json = { parseError: text.slice(0, 200) }
    }
    return { status: res.status, json }
  } finally {
    clearTimeout(timer)
  }
}

// --- main ------------------------------------------------------------------

const wf = JSON.parse(await readFile(WORKFLOW, 'utf8'))
const byName = loadGraph(wf)
const remote = typeof args.url === 'string' ? args.url : null

console.log(`Speed-to-Lead smoke test -- ${remote ? `REMOTE ${remote}` : 'LOCAL (no n8n needed)'}`)
console.log(`workflow: ${wf.name}   budget: ${BUDGET_MS} ms`)
if (!remote && !ENV.GHL_SANDBOX_LOCATION_ID) {
  console.log('note: GHL_SANDBOX_LOCATION_ID unset -> leads must queue for replay')
}
console.log('')

let failed = 0
const timings = []

for (const s of SCENARIOS) {
  const t0 = Date.now()
  let problems = []
  let detail = ''

  try {
    if (remote) {
      const { status, json } = await postRemote(remote, s.body)
      if (status !== 200) problems.push(`HTTP ${status}`)
      else if (json.ok !== s.expect.ok) problems.push(`expected ok=${s.expect.ok}, got ok=${json.ok}`)
      if (json?.timing?.pipeline_ms != null) detail = `pipeline ${json.timing.pipeline_ms} ms`
    } else {
      const res = executeWorkflow(wf, byName, s.body)
      problems = checkLocal(s, res)
      const t = res.responses[0]?.json?.timing
      if (t) detail = `pipeline ${t.pipeline_ms} ms`
    }
  } catch (err) {
    problems.push(`threw: ${err.message}`)
  }

  const elapsed = Date.now() - t0
  timings.push(elapsed)
  if (elapsed >= BUDGET_MS) problems.push(`round trip ${elapsed} ms exceeded budget`)

  const ok = problems.length === 0
  if (!ok) failed++
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${String(elapsed).padStart(5)} ms  ${s.name}${detail ? `  (${detail})` : ''}`
  )
  for (const p of problems) console.log(`        - ${p}`)
}

// Every node must have been exercised, or the demo has a path nobody tested.
if (!remote) {
  const { visited } = executeWorkflow(wf, byName, SCENARIOS[0].body)
  const rejected = executeWorkflow(wf, byName, SCENARIOS[4].body)
  const covered = new Set([...visited, ...rejected.visited, 'Respond'])
  const uncovered = wf.nodes.map((n) => n.name).filter((n) => !covered.has(n))
  // Exactly one GHL branch runs per config: with a sandbox location the lead is
  // upserted, without one it queues for replay. The other branch is legitimately
  // unexercised -- only flag it if BOTH are dark, which would mean the gate broke.
  const expectedUncovered = ENV.GHL_SANDBOX_LOCATION_ID
    ? ['Queue For GHL Replay']
    : ['Upsert GHL Contact']
  const unexpected = uncovered.filter((n) => !expectedUncovered.includes(n))
  console.log('')
  console.log(`node coverage: ${wf.nodes.length - uncovered.length}/${wf.nodes.length} exercised`)
  if (uncovered.length) console.log(`  not exercised: ${uncovered.join(', ')}`)
  if (unexpected.length) {
    console.log(`  UNEXPECTED uncovered node(s): ${unexpected.join(', ')}`)
    failed++
  }
}

const worst = Math.max(...timings)
console.log('')
console.log(`worst case: ${worst} ms of a ${BUDGET_MS} ms budget (${((worst / BUDGET_MS) * 100).toFixed(1)}%)`)
console.log(failed === 0 ? `OK -- ${SCENARIOS.length} scenarios passed` : `FAILED -- ${failed} problem(s)`)

process.exit(failed === 0 ? 0 : 1)
