#!/usr/bin/env node
// Deploy gate. Run against a mockup folder BEFORE git push.
//
//   node verify-brand.mjs ./jn-tirezone
//
// Exit 0 = the mockup demonstrably uses the captured brand.
// Exit 1 = it does not. Do not push. Do not flag "GENERIC BRANDING" and send
//          anyway — that flag is what let 18+ unbranded mockups ship.

import { readFile, readdir, access } from 'node:fs/promises'
import { join } from 'node:path'

const exists = async (p) => access(p).then(() => true, () => false)

const decodeHtmlEntities = (str) => {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

const folder = process.argv[2]
if (!folder) {
  console.error('usage: verify-brand.mjs <mockup-folder>')
  process.exit(2)
}

const fails = []
const passes = []

let brand
try {
  brand = JSON.parse(await readFile(join(folder, 'brand', 'brand.json'), 'utf8'))
} catch {
  console.error('FAIL: no brand/brand.json — brand capture never ran for this lead')
  process.exit(1)
}

if (!brand.ready) {
  fails.push(`brand.json ready=false (confidence ${brand.confidence}) — capture is incomplete`)
  brand.notes?.filter((n) => n.startsWith('BLOCKER')).forEach((n) => fails.push(n))
} else {
  passes.push(`brand captured with confidence ${brand.confidence}`)
}

let html
try {
  html = await readFile(join(folder, 'index.html'), 'utf8')
} catch {
  console.error('FAIL: no index.html in ' + folder)
  process.exit(1)
}

// Inline <style> plus any sibling css files count as the mockup's styling.
let styling = html
for (const f of await readdir(folder).catch(() => [])) {
  if (f.endsWith('.css')) styling += '\n' + (await readFile(join(folder, f), 'utf8'))
}

// 1. The real logo file has to actually appear in the markup...
const logoNames = (brand.logoFiles || []).map((f) => f.file)
const logoUsed = logoNames.find((n) => html.includes(n))
if (logoUsed) passes.push(`logo referenced: ${logoUsed}`)
else fails.push(`none of the captured logo files appear in index.html (${logoNames.join(', ') || 'no files captured'})`)

// 1b. ...and it has to be a file that is actually there.
// A filename-substring test cannot tell a present image from a missing one, so
// a mockup whose logo was never committed passed every check, deployed, and
// served a broken image to the prospect (2026-08-24, CLO-82 — four folders).
if (logoUsed) {
  const candidates = [join(folder, 'brand', logoUsed), join(folder, logoUsed)]
  const found = []
  for (const c of candidates) if (await exists(c)) found.push(c)
  if (found.length) passes.push(`logo file present: ${found[0]}`)
  else fails.push(`index.html references "${logoUsed}" but no such file exists (looked in ${candidates.join(', ')}) — the page would deploy with a broken image`)
}

// 2. At least two captured brand colours have to appear in the styling.
const lower = styling.toLowerCase()
const brandArray = brand.colors?.brand || []
let hexes
try {
  hexes = brandArray.map((c) => {
    if (typeof c === 'string') {
      console.error(
        `FAIL: colors.brand[] contains bare hex strings instead of objects.` +
        `\n  Expected format: {hex, weight}. Example: {hex: "#0055cc", weight: 45}` +
        `\n  Found: ${c}`
      )
      process.exit(1)
    }
    if (!c.hex) throw new Error(`missing hex property in colors.brand entry`)
    return c.hex.toLowerCase()
  })
} catch (e) {
  console.error(`FAIL: malformed colors.brand[]: ${e.message}`)
  process.exit(1)
}
const hexUsed = hexes.filter((h) => lower.includes(h))
if (hexUsed.length >= 2) passes.push(`brand colours used: ${hexUsed.join(' ')}`)
else fails.push(`only ${hexUsed.length} of ${hexes.length} captured brand colours used (need 2) — palette is invented, not the prospect's`)

// 3. The captured typeface, if we found one.
// Web-safe fallbacks appear in almost any font stack, so matching one proves
// nothing about whether the mockup used the prospect's actual typeface.
const GENERIC_FONTS = /^(arial|helvetica|verdana|tahoma|georgia|times|times new roman|courier|courier new|segoe ui|roboto)$/i
const fonts = (brand.fonts || []).filter((f) => !GENERIC_FONTS.test(f.split(':')[0].trim()))
if (fonts.length) {
  const fontUsed = fonts.find((f) => lower.includes(f.toLowerCase().split(':')[0]))
  if (fontUsed) passes.push(`typeface used: ${fontUsed}`)
  else fails.push(`captured typeface not used (${fonts.slice(0, 3).join(', ')})`)
} else {
  passes.push('no distinctive typeface captured — font check skipped')
}

// 4. No leftover generic-branding escape hatch.
if (/GENERIC BRANDING/i.test(html)) {
  fails.push('index.html still carries a GENERIC BRANDING marker')
}

// 5. Real business name, not a placeholder.
if (brand.name) {
  const decodedName = decodeHtmlEntities(brand.name)
  const namePart = decodedName.split(/\s+[-|]\s+/)[0].trim().toLowerCase()
  const decodedHtml = decodeHtmlEntities(html).toLowerCase()
  if (!decodedHtml.includes(namePart)) {
    fails.push(`business name "${brand.name}" not present in the page`)
  }
}

console.log(passes.map((p) => '  PASS  ' + p).join('\n'))
if (fails.length) {
  console.log(fails.map((f) => '  FAIL  ' + f).join('\n'))
  console.log(`\nBLOCKED: ${fails.length} brand check(s) failed. Do not deploy ${folder}.`)
  process.exit(1)
}
console.log(`\nOK: ${folder} uses the captured brand.`)
