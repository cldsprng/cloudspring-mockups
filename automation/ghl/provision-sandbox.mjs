#!/usr/bin/env node
// Sandbox provisioning plan -- the API-buildable half of the snapshot.
// No browser, no dependencies. Same constraints as tools/brand-capture and the
// n8n smoke tests, so this runs inside any scheduled run.
//
//   node provision-sandbox.mjs --location <sandboxLocationId>
//   node provision-sandbox.mjs --location <id> --json     # machine-readable
//
// WHAT THIS DOES
// Emits the exact, ordered list of GoHighLevel API calls that build everything
// in snapshot-manifest.json marked apiBuildable: custom fields, tags and custom
// values. Each entry is an operationId plus a request body, verified against the
// live operation registry on 2026-08-21 -- not guessed from the docs.
//
// WHAT THIS DOES NOT DO
// It does not call GoHighLevel. There is no GHL token in this repo or in the n8n
// host .env: the credential lives in the MCP connector, which only an agent
// session holds. So this script plans and an agent executes, one
// execute_operation per entry. That split is deliberate -- it means the plan is
// reviewable and diffable before anything is written to a live account.
//
// Exit code 0 = a plan was produced. Non-zero = refused, and the reason is named.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const MANIFEST = join(HERE, 'snapshot-manifest.json')

const args = {}
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1] ?? true
}

// Same list the speed-to-lead smoke test guards on, and for the same reason.
// Every one of these belongs to the production location -- the one holding real
// client pipelines and two published workflows. Provisioning into it would add
// fields and tags to a live account, and a demo contact written there could
// enrol in a published workflow and fire real outbound from the company number.
const PRODUCTION_IDS = {
  AtaR2iB3BL1hlhP4oU26: 'CloudSpring IT Solutions location',
  '7yd9fhvPcfz1vqbF3kxN': 'CLOUDSPRING WEB LEADS pipeline',
  iaVwRhCMOnZaxNN9b5Xb: 'EASYCHURCH PH pipeline',
  irkYOyW3p29hxRyCR4To: 'MYHOMS PH pipeline',
}

const locationId = (args.location || process.env.GHL_SANDBOX_LOCATION_ID || '').trim()

if (!locationId) {
  console.log('REFUSED -- no sandbox location id.')
  console.log('')
  console.log('  node provision-sandbox.mjs --location <sandboxLocationId>')
  console.log('')
  console.log('The sandbox sub-account does not exist yet; creating one is a human')
  console.log('action in the GHL agency UI (no create-location operation exists in')
  console.log('the API -- re-verified 2026-08-21). See CLO-49.')
  process.exit(2)
}

if (PRODUCTION_IDS[locationId]) {
  console.log(`REFUSED -- ${locationId} is the ${PRODUCTION_IDS[locationId]}.`)
  console.log('')
  console.log('That is a live production account. Provisioning into it would write')
  console.log('custom fields and tags to a location holding real client pipelines')
  console.log('and two published workflows. Create an empty sandbox sub-account.')
  process.exit(1)
}

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
const plan = []

// --- custom fields ---------------------------------------------------------
// dataType and model come straight from the manifest. model=contact for all
// seven: every one of them describes the lead, not the opportunity.
for (const f of manifest.customFields) {
  plan.push({
    step: `custom field: ${f.name}`,
    operationId: 'locations.create-custom-field',
    locationId,
    body: { name: f.name, dataType: f.dataType, model: 'contact' },
    why: f.why,
  })
}

// --- tags ------------------------------------------------------------------
for (const name of manifest.tags) {
  plan.push({
    step: `tag: ${name}`,
    operationId: 'create-tag',
    locationId,
    body: { name },
  })
}

// --- custom values ---------------------------------------------------------
// These are the configPoints -- the block a new client edits and nothing else.
// The manifest carries an `example` per key, never a real value, so the plan is
// seeded with examples and every one must be reviewed before it is executed.
// booking_calendar_id and pipeline_id are deliberately left blank: neither id
// exists until the sandbox calendar and pipeline are created.
const DEFERRED = new Set(['pipeline_id', 'booking_calendar_id'])
for (const v of manifest.configPoints.values) {
  plan.push({
    step: `custom value: ${v.key}`,
    operationId: 'create-custom-value',
    locationId,
    body: { name: v.key, value: DEFERRED.has(v.key) ? '' : v.example },
    deferred: DEFERRED.has(v.key) || undefined,
    why: `used by ${v.usedBy.join(', ')}`,
  })
}

if (args.json) {
  console.log(JSON.stringify({ locationId, generated: manifest.version, plan }, null, 2))
  process.exit(0)
}

const counts = plan.reduce((a, p) => ({ ...a, [p.operationId]: (a[p.operationId] || 0) + 1 }), {})

console.log(`Sandbox provisioning plan -- location ${locationId}`)
console.log(`manifest: ${manifest.snapshot} v${manifest.version}`)
console.log('')
for (const p of plan) {
  const mark = p.deferred ? '  [defer]' : '        '
  console.log(`${mark} ${p.step}`)
  console.log(`          ${p.operationId}  ${JSON.stringify(p.body)}`)
}
console.log('')
for (const [op, n] of Object.entries(counts)) console.log(`  ${n}x ${op}`)
console.log(`  ${plan.length} calls total`)
console.log('')
console.log('NOT executed -- this script holds no GHL credential. An agent runs')
console.log('each entry through execute_operation. Review the values first: they')
console.log('are seeded from manifest examples, not from the real clinic.')
console.log('')
console.log('Two [defer] entries stay empty until the pipeline and calendar exist.')
console.log('The pipeline is UI-only -- the API has no create-pipeline operation')
console.log('(opportunities exposes exactly 5 operations, all read or per-deal;')
console.log('re-verified 2026-08-21). Create it by hand, then fill the value.')
