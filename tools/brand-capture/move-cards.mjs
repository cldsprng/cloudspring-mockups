#!/usr/bin/env node
// Move Trello cards based on brand capture results
//
// Usage:
//   TRELLO_API_KEY=... TRELLO_API_TOKEN=... node move-cards.mjs <results-json>
//
// Reads the results JSON written by run-sweep.mjs and moves cards to:
// - MOCKUP READY if ready:true
// - BRAND BLOCKED if ready:false (palette-pending or no-assets)
//
// A bare filename resolves against PAPERCLIP_RUN_SCRATCH_DIR first, then cwd.
// The results file is run scratch and is not kept in this (public) repo.

import { readFile } from 'node:fs/promises'
import { resolveScratchInput } from './scratch.mjs'

const resultsArg = process.argv[2]
if (!resultsArg) {
  console.error('usage: move-cards.mjs <results-json>')
  process.exit(1)
}

const resultsFile = resolveScratchInput(resultsArg)

const apiKey = process.env.TRELLO_API_KEY
const apiToken = process.env.TRELLO_API_TOKEN
if (!apiKey || !apiToken) {
  console.error('TRELLO_API_KEY and TRELLO_API_TOKEN required')
  process.exit(1)
}

let results
try {
  results = JSON.parse(await readFile(resultsFile, 'utf8'))
} catch (err) {
  console.error(`cannot read results JSON at ${resultsFile}: ${err.message}`)
  console.error('Run run-sweep.mjs first; it prints the path it wrote.')
  process.exit(1)
}
const boardId = '69f38821edbd4dfbc39bc091'
const listIds = {
  strategyReady: '6a65168d383ae05055e34909',
  mockupReady: '6a651690eac9aa43b2658bc2',
  brandBlocked: '6a84c27e81ebdb565ed1af2a',
}

const apiBase = 'https://api.trello.com/1'
const query = `?key=${apiKey}&token=${apiToken}`

async function findCard(name) {
  // Search for card by name in STRATEGY READY
  const res = await fetch(
    `${apiBase}/lists/${listIds.strategyReady}/cards${query}&fields=id,name`,
    { headers: { 'user-agent': 'Trello-CLI' } }
  )
  if (!res.ok) throw new Error(`Trello API error: ${res.status}`)
  const cards = await res.json()
  return cards.find((c) => c.name.includes(name))
}

async function moveCard(cardId, toListId) {
  const res = await fetch(`${apiBase}/cards/${cardId}${query}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idList: toListId }),
  })
  return res.ok
}

let moved = 0

console.log('Moving cards...\n')

// Move ready cards to MOCKUP READY
for (const card of results.ready || []) {
  const found = await findCard(card.slug)
  if (found) {
    const ok = await moveCard(found.id, listIds.mockupReady)
    console.log(`${ok ? '✓' : '✗'} ${card.slug} → MOCKUP READY`)
    if (ok) moved++
  }
}

// Move blocked cards to BRAND BLOCKED
for (const card of [...(results.palettePending || []), ...(results.noAssets || [])] || []) {
  const found = await findCard(card.slug)
  if (found) {
    const ok = await moveCard(found.id, listIds.brandBlocked)
    const reason = results.palettePending?.some((c) => c.slug === card.slug)
      ? 'palette-pending'
      : 'no-assets'
    console.log(`${ok ? '✓' : '✗'} ${card.slug} → BRAND BLOCKED (${reason})`)
    if (ok) moved++
  }
}

console.log(`\nMoved ${moved} cards`)
