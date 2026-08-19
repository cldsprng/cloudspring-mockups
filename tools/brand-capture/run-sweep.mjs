#!/usr/bin/env node
// CLO-39 brand-capture sweep — run capture.mjs on a list of cards and move them
// based on results.
//
// Usage:
//   node tools/brand-capture/run-sweep.mjs <cards-json-file>
//
// Cards JSON format: array of {name, slug, site?, facebook?, email?}
// Reads brand.json output and moves cards via Trello API

import { readFile, writeFile } from 'node:fs/promises'
import { execSync } from 'node:child_process'

const cardsFile = process.argv[2]
if (!cardsFile) {
  console.error('usage: run-sweep.mjs <cards-json>')
  process.exit(1)
}

const cardData = JSON.parse(await readFile(cardsFile, 'utf8'))
const results = { ready: [], palettePending: [], noAssets: [], errors: [] }

console.log(`Processing ${cardData.length} cards...`)

for (const card of cardData) {
  const { name, slug, site, facebook, email } = card
  console.log(`\n[${slug}] ${name}`)

  // Build capture command
  const args = ['--slug', slug, '--out', `./${slug}/brand`]
  if (site) args.push('--site', site)
  if (facebook) args.push('--facebook', facebook)

  try {
    // Run capture
    execSync(`node tools/brand-capture/capture.mjs ${args.join(' ')}`, {
      cwd: process.cwd(),
      stdio: 'pipe',
    })

    // Read the brand.json to check status
    const brandJson = JSON.parse(await readFile(`./${slug}/brand/brand.json`, 'utf8'))
    const state = { name, slug, email, ready: brandJson.ready, blockedBy: brandJson.blockedBy }

    if (brandJson.ready) {
      results.ready.push(state)
      console.log(`  ✓ ready (logo: ${brandJson.logo?.file}, colors: ${brandJson.colors.brand.length})`)
    } else if (brandJson.blockedBy === 'palette-pending') {
      results.palettePending.push(state)
      console.log(`  ⚠ palette-pending (logo: ${brandJson.logo?.file}, needs vision-read)`)
    } else if (brandJson.blockedBy === 'no-assets') {
      results.noAssets.push(state)
      console.log(`  ✗ no-assets (no logo found)`)
    }
  } catch (err) {
    results.errors.push({ slug, error: err.message })
    console.error(`  ERROR: ${err.message.split('\n')[0]}`)
  }
}

console.log(`\n=== Summary ===`)
console.log(`Ready to build: ${results.ready.length}`)
console.log(`  ${results.ready.map((r) => r.slug).join(', ')}`)
console.log(`Palette pending (vision-read): ${results.palettePending.length}`)
console.log(`  ${results.palettePending.map((r) => r.slug).join(', ')}`)
console.log(`No assets (BRAND BLOCKED): ${results.noAssets.length}`)
console.log(`  ${results.noAssets.map((r) => r.slug).join(', ')}`)
if (results.errors.length) console.log(`Errors: ${results.errors.length}`)

// Write results for Trello move automation
await writeFile(
  'CLO-39-capture-results.json',
  JSON.stringify({ timestamp: new Date().toISOString(), ...results }, null, 2)
)
console.log('\nResults saved to CLO-39-capture-results.json')
