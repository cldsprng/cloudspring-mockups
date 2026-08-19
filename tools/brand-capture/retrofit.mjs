#!/usr/bin/env node
// CLO-22 retrofit. Rebuilds an existing mockup on its captured brand.
//
//   node tools/brand-capture/retrofit.mjs <slug> [--dry-run]
//
// Two edits, both against <slug>/brand/brand.json:
//
//   1. Palette. Every hex declared in the page's :root is remapped to the
//      captured palette via the table below, then replaced across the whole
//      file in a single pass — so inline SVG fills and gradient stops follow
//      the same mapping the CSS variables do.
//   2. Logo. The invented <svg> mark inside the header/footer brand anchor is
//      replaced with the captured logo file.
//
// Copy and content are deliberately untouched. The pages carry QA'd claim
// constraints (no rating on LimDerm, no hours on Gulfan, labelled placeholders
// on Skinthority/ZP/DermQuest) and a rebuild that rewrites prose is a
// regression risk with no upside — the gate is about brand, not copy.

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

// ---------------------------------------------------------------- colour ---

const hex2rgb = (h) => {
  const s = h.replace('#', '')
  const f = s.length === 3 ? s.split('').map((c) => c + c).join('') : s
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16))
}
const rgb2hex = (r) => '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
// mix(c, t) => c blended t of the way toward white. t=.88 is a pale tint.
const mix = (c, t) => rgb2hex(hex2rgb(c).map((v) => v + (255 - v) * t))
// shade(c, t) => c darkened by t.
const shade = (c, t) => rgb2hex(hex2rgb(c).map((v) => v * (1 - t)))

// Resolve a table entry: a literal hex, or "mix:#hex@0.88" / "shade:#hex@0.2".
const resolve = (spec) => {
  if (spec.startsWith('#')) return spec.toLowerCase()
  const m = spec.match(/^(mix|shade):(#[0-9a-f]{6})@([\d.]+)$/i)
  if (!m) throw new Error('bad colour spec: ' + spec)
  return (m[1] === 'mix' ? mix : shade)(m[2], parseFloat(m[3])).toLowerCase()
}

// ----------------------------------------------------------------- table ---
// Per slug: page CSS variable -> the captured colour it becomes.
// Captured hexes are used literally wherever contrast allows. Where a captured
// colour is too light to carry text (mint, blush, cyan, gold), it is placed on
// a tint/decorative variable where it genuinely belongs rather than darkened
// into something the prospect never used. Every slug keeps >=2 captured hexes
// verbatim, which is what verify-brand.mjs counts.

const MAP = {
  // amber + black — "boxed A&D, amber ampersand on black"
  'ad-plumbing-electrical-qc': {
    '--lead': '#111111', '--lead-dark': '#000000', '--ink': '#111111',
    '--accent': '#f5a623', '--accent-dark': '#e0951a',
    '--tint': 'mix:#f5a623@0.90',
  },
  // blue bee + yellow tooth
  'dental-hive-visayas-qc': {
    '--teal-500': '#2a8fd4', '--teal-600': 'shade:#2a8fd4@0.18',
    '--teal-700': 'shade:#2a8fd4@0.30', '--teal-800': 'shade:#2a8fd4@0.48',
    '--ink': 'shade:#2a8fd4@0.72', '--ink-900': 'shade:#2a8fd4@0.80',
    '--amber': '#f5b21d', '--amber-600': 'shade:#f5b21d@0.22',
  },
  // navy / sage / blush / mint roundel
  'dermhaus-skin-clinic-qc': {
    '--brand': '#1f5f8b', '--brand-700': '#123a5c',
    '--brand-100': 'mix:#1f5f8b@0.88', '--brand-050': 'mix:#1f5f8b@0.95',
    '--sand': 'mix:#f2c4b0@0.72', '--line': 'mix:#1f5f8b@0.86',
    '--accent': 'shade:#7fae9b@0.30', '--accent-100': '#a8e0cb',
  },
  // silver face over cyan glow on deep blue
  'dermquest-skin-aesthetic-qc': {
    '--brand': '#0a6fbf', '--brand-700': '#073a72',
    '--brand-100': 'mix:#2ad4ec@0.80', '--brand-050': 'mix:#2ad4ec@0.92',
    '--cream': 'mix:#2ad4ec@0.95', '--line': 'mix:#0a6fbf@0.86',
    '--accent': 'shade:#2ad4ec@0.42', '--accent-100': 'mix:#2ad4ec@0.84',
    '--alert': 'shade:#0a6fbf@0.35',
  },
  // MONOCHROME — greyscale gear tile on warm near-black
  'dr-mechanic-autocare-qc': {
    '--graphite': '#141414', '--graphite2': '#2a211c',
    '--green': '#2a211c', '--jade': 'shade:#6e6e6e@0.38', '--jade2': '#6e6e6e',
    '--silver': '#c9c9c9', '--ink': '#141414', '--body': '#5a5a5a',
    '--line': '#e2e2e2', '--bg': '#f7f7f7',
  },
  // MONOCHROME — black "gsc" monogram on white
  'gulfan-skin-clinic-makati': {
    '--ink': '#111111', '--ink-2': '#1c1c1c', '--slate': '#4a4a4a',
    '--line': '#e4e4e4', '--mist': '#f6f6f6',
    '--teal': '#111111', '--teal-dk': '#000000', '--teal-lt': '#8a8a8a',
    '--sand': '#f7f7f7', '--clay': '#4a4a4a',
  },
  // red gear + grey spanners on black
  'kingaroy-auto-service-qld': {
    '--navy': '#111111', '--navy2': '#1c1c1c', '--steel': '#333333',
    '--orange': '#f5321e', '--orange2': '#d42a16',
    '--ink': '#111111', '--body': '#5a5a5a', '--line': '#e4e4e4', '--bg': '#f8f8f8',
  },
  // green "DERM" + gold script "Lim" on cream
  'limderm-dermatology-cebu': {
    '--ink': '#1a1a1a', '--ink-2': 'shade:#5e9c60@0.55',
    '--teal': '#2f5d38', '--teal-600': 'shade:#2f5d38@0.20',
    '--teal-100': 'mix:#5e9c60@0.85', '--mint': '#eef2dc',
    '--sand': 'mix:#c9b46b@0.88', '--line': 'mix:#5e9c60@0.80',
    '--accent': '#c9b46b',
  },
  // green ring around a chrome M
  'makati-motorist-autocenter': {
    '--navy': '#0e5522', '--navy2': 'shade:#157a32@0.28', '--steel': '#157a32',
    '--orange': '#157a32', '--orange2': 'mix:#157a32@0.22',
    '--ink': '#111111', '--body': '#5a5a5a', '--line': '#e4e4e4', '--bg': '#f7f9f7',
  },
  // red collegiate wordmark, gold crown
  'mcqueen-auto-repair-makati': {
    '--navy': '#111111', '--navy2': '#1c1c1c', '--steel': '#3a3a3a',
    '--orange': '#b01b1b', '--orange2': '#f2cb3c',
    '--ink': '#111111', '--body': '#5a5a5a', '--line': '#e4e4e4', '--bg': '#f8f8f8',
  },
  // only site-css capture in the batch — palette read off the real stylesheet
  'midwest-skin-care-acne-clinic': {
    '--ink': '#2b333f', '--ink-soft': 'shade:#73859f@0.30', '--muted': '#73859f',
    '--teal': '#7db158', '--teal-deep': '#2b333f',
    '--mint': 'mix:#7db158@0.84', '--mint-soft': 'mix:#7db158@0.93',
    '--sand': 'mix:#73859f@0.92', '--line': 'mix:#73859f@0.86',
  },
  // MONOCHROME — black didone "OWSW" wordmark on white
  'one-world-skin-wellness-makati': {
    '--ink': '#111111', '--ink-2': '#1c1c1c', '--slate': '#555555',
    '--line': '#e4e4e4', '--cream': '#fafafa', '--mist': '#f4f4f4',
    '--sage': '#111111', '--sage-dk': '#000000', '--sage-lt': '#8a8a8a',
    '--copper': '#555555', '--copper-dk': '#3a3a3a',
  },
  // brown field, marble roundel, brown "SKIN"
  'skin-aesthetiques-qc': {
    '--ink': '#111111', '--deep': '#5c3618', '--teal': '#7a4a21',
    '--teal-600': 'shade:#7a4a21@0.16',
    '--mint': 'mix:#7a4a21@0.88', '--mint-2': 'mix:#7a4a21@0.95',
    '--sand': '#f2f2f0', '--line': 'mix:#7a4a21@0.84',
    '--muted': 'shade:#7a4a21@0.10', '--gold': 'mix:#7a4a21@0.22',
  },
  // MONOCHROME — charcoal handwritten "Skin" on white
  'skin-cosmetic-clinic-renmark': {
    '--ink': '#26282a', '--espresso': '#26282a', '--clay': '#4a4d50',
    '--clay-600': 'shade:#4a4d50@0.20', '--rose': 'mix:#4a4d50@0.42',
    '--sand': 'mix:#4a4d50@0.92', '--ivory': 'mix:#4a4d50@0.97',
    '--ivory-2': 'mix:#4a4d50@0.95', '--line': 'mix:#4a4d50@0.86',
    '--muted': 'mix:#4a4d50@0.18', '--gold': '#4a4d50',
  },
  // gold serif wordmark on cream marble
  'skinthority-derma-davao': {
    '--ink': 'shade:#a8862a@0.72', '--ink-2': 'shade:#a8862a@0.55',
    '--muted': 'shade:#a8862a@0.28', '--teal-900': 'shade:#a8862a@0.34',
    '--teal-700': '#a8862a', '--teal-500': '#c9a22b', '--teal-300': '#d9c3a5',
    '--teal-050': '#f5efe6', '--sand': '#f5efe6', '--gold': '#c9a22b',
    '--line': 'mix:#a8862a@0.82',
  },
  // chess rook badge, blue ribbons, amber sunburst, cream ground
  'tower-of-david-caraircon-makati': {
    '--navy': '#1c2e42', '--navy2': 'mix:#1c2e42@0.12', '--steel': 'shade:#5b93c9@0.28',
    '--orange': '#5b93c9', '--orange2': '#f0a81e',
    '--ink': '#1c2e42', '--line': 'mix:#1c2e42@0.88', '--bg': '#efede0',
  },
  // gold ZP monogram in a gold tooth outline
  'zp-smiles-dental-qc': {
    '--sky-300': '#dcc06a', '--sky-400': 'mix:#c9a227@0.22', '--sky-500': '#c9a227',
    '--sky-600': '#b8860b', '--navy-700': 'shade:#b8860b@0.22',
    '--navy-800': 'shade:#b8860b@0.42', '--navy-900': 'shade:#b8860b@0.62',
    '--warm-400': '#dcc06a', '--warm-500': '#c9a227', '--warm-600': '#b8860b',
    '--ink': 'shade:#b8860b@0.72', '--ink-soft': 'shade:#b8860b@0.55',
    '--n-900': 'shade:#b8860b@0.72',
  },
}

// ------------------------------------------------------------------ main ---

const slug = process.argv[2]
const dry = process.argv.includes('--dry-run')
if (!slug || !MAP[slug]) {
  console.error(`usage: retrofit.mjs <slug> [--dry-run]\nknown slugs:\n  ${Object.keys(MAP).join('\n  ')}`)
  process.exit(2)
}

const brand = JSON.parse(await readFile(join(slug, 'brand', 'brand.json'), 'utf8'))
let html = await readFile(join(slug, 'index.html'), 'utf8')
const before = html

// --- 1. palette -------------------------------------------------------------
// Read the declared value of each mapped variable out of :root, then build one
// oldHex -> newHex table. Replacement is a single pass with a callback so a new
// value that happens to equal another old value can never cascade.

const root = html.match(/:root\s*\{([\s\S]*?)\}/)
if (!root) { console.error(`FAIL: no :root block in ${slug}/index.html`); process.exit(1) }

const swaps = new Map()
const unmatched = []
for (const [varName, spec] of Object.entries(MAP[slug])) {
  const decl = root[1].match(new RegExp(varName.replace(/-/g, '\\-') + '\\s*:\\s*(#[0-9a-fA-F]{3,8})'))
  if (!decl) { unmatched.push(varName); continue }
  const oldHex = decl[1].toLowerCase()
  const newHex = resolve(spec)
  if (oldHex !== newHex) swaps.set(oldHex, newHex)
}
if (unmatched.length) console.log(`  note: no :root declaration for ${unmatched.join(', ')}`)

let hexEdits = 0
if (swaps.size) {
  const pattern = new RegExp('(' + [...swaps.keys()].join('|') + ')\\b', 'gi')
  html = html.replace(pattern, (m) => {
    const to = swaps.get(m.toLowerCase())
    if (!to) return m
    hexEdits++
    return to
  })
}

// --- 2. logo ----------------------------------------------------------------
// Swap the invented <svg> mark for the captured file, inside every brand/logo
// anchor (header and, where present, footer).

const logoFile = brand.logo?.file
if (!logoFile) { console.error(`FAIL: ${slug} brand.json has no logo.file`); process.exit(1) }

const title = (html.match(/<title>([^<|—]+)/) || [, slug])[1].trim()
let logoSwaps = 0
html = html.replace(/<a\s[^>]*class="(?:brand|logo)[^"]*"[\s\S]*?<\/a>/g, (anchor) => {
  if (!/<svg/.test(anchor) || /brand-logo-img/.test(anchor)) return anchor
  return anchor.replace(/<svg[\s\S]*?<\/svg>/, (svg) => {
    const cls = (svg.match(/class="([^"]+)"/) || [, ''])[1]
    logoSwaps++
    return `<img class="${(cls + ' brand-logo-img').trim()}" src="brand/${logoFile}" alt="${title} logo" width="38" height="38" decoding="async">`
  })
})

// Not every page wraps its mark in an anchor — some use <div class="brand">.
// The mark classes are logo-specific, so a direct pass is safe where the
// anchor-scoped one found nothing.
if (!logoSwaps) {
  html = html.replace(/<svg[^>]*class="(brand-mark|brand__mark|mark)"[\s\S]*?<\/svg>/g, (svg, cls) => {
    logoSwaps++
    return `<img class="${cls} brand-logo-img" src="brand/${logoFile}" alt="${title} logo" width="38" height="38" decoding="async">`
  })
}

if (logoSwaps && !/\.brand-logo-img\{/.test(html)) {
  html = html.replace(/<\/style>/, `.brand-logo-img{width:38px;height:38px;flex:0 0 38px;object-fit:contain;border-radius:9px;background:#fff}\n</style>`)
}

// --- report -----------------------------------------------------------------

if (html === before) { console.log(`  ${slug}: no change`); process.exit(0) }
if (!dry) await writeFile(join(slug, 'index.html'), html)

const captured = (brand.colors?.brand || []).map((c) => c.hex.toLowerCase())
const kept = captured.filter((h) => html.toLowerCase().includes(h))
console.log(`  ${slug}${dry ? ' (dry run)' : ''}: ${swaps.size} colour(s) remapped across ${hexEdits} occurrence(s), ${logoSwaps} logo swap(s)`)
console.log(`  captured hexes present: ${kept.length}/${captured.length} — ${kept.join(' ') || 'NONE'}`)
if (kept.length < 2) { console.error('  FAIL: fewer than 2 captured brand colours survive — the gate will reject this'); process.exit(1) }
