#!/usr/bin/env node
// CLO-21 retrofit. Resolves the `palette-pending` state that capture.mjs leaves
// behind when a Facebook-only lead yields a logo but no CSS to mine colours from.
//
//   node apply-vision-palette.mjs            # apply
//   node apply-vision-palette.mjs --dry-run  # print what would change
//
// capture.mjs writes this at the end of every palette-pending brand.json:
//
//   "Vision-read the logo, then write the hex values into colors.brand[]
//    with colors.source=\"vision\" and re-run the gate."
//
// That is exactly what this does. Every hex below was read off the captured
// logo-facebook-profile.jpg by a vision pass — none are invented, and none are
// sampled from anything other than the prospect's own artwork.
//
// Two states the original three-state model did not anticipate turned up:
//
//   monochrome   The mark is genuinely black-on-white. capture.mjs demands ">=2
//                chromatic colours" and can never be satisfied. The gate itself
//                only counts hexes, so recording the real monochrome palette is
//                both honest and sufficient. These are marked ready.
//
//   logo-not-a-mark  The Facebook profile picture is a photograph or a promo
//                graphic, not a logo. The palette is still recoverable from the
//                signage, but the FILE cannot be used as a logo in a mockup.
//                These stay ready=false under a new blockedBy so they are
//                visible rather than silently shipped.

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DRY = process.argv.includes('--dry-run')

// hex + weight matches the shape capture.mjs writes from site-css.
// Weights are ordinal (dominance in the mark), not pixel counts.
const PALETTES = {
  // ---- clean logo, chromatic palette -------------------------------------
  'skinthority-derma-davao': {
    read: 'gold serif wordmark "SKINTHORITY / DERMATOLOGY CLINIC" on cream marble',
    brand: [['#c9a22b', 60], ['#a8862a', 20]],
    neutral: [['#f5efe6', 90], ['#d9c3a5', 30], ['#ffffff', 20]],
  },
  'limderm-dermatology-cebu': {
    read: 'green "DERM" + gold script "Lim" on a cream circle',
    brand: [['#5e9c60', 50], ['#2f5d38', 25], ['#c9b46b', 20]],
    neutral: [['#eef2dc', 80], ['#1a1a1a', 15]],
  },
  'skin-aesthetiques-qc': {
    read: 'brown field, white marble roundel, brown "SKIN" + black "Aesthetiques" script',
    brand: [['#7a4a21', 60], ['#5c3618', 20]],
    neutral: [['#f2f2f0', 70], ['#111111', 25]],
  },
  'dermhaus-skin-clinic-qc': {
    read: 'abstract face roundel in navy / sage / blush / mint',
    brand: [['#1f5f8b', 40], ['#7fae9b', 30], ['#f2c4b0', 25], ['#a8e0cb', 20], ['#123a5c', 15]],
    neutral: [['#ffffff', 30]],
  },
  'dermquest-skin-aesthetic-qc': {
    read: 'silver face profile over a cyan glow on deep blue',
    brand: [['#2ad4ec', 50], ['#0a6fbf', 30], ['#073a72', 25]],
    neutral: [['#b9c2c9', 20]],
  },
  'ad-plumbing-electrical-qc': {
    read: 'boxed "A&D Plumbing and Electrical Services", amber ampersand on black',
    brand: [['#f5a623', 45], ['#e0951a', 20]],
    neutral: [['#111111', 60], ['#ffffff', 50]],
  },
  'tower-of-david-caraircon-makati': {
    read: 'chess rook badge, blue EST/1990 ribbons, amber sunburst, cream ground',
    brand: [['#5b93c9', 45], ['#1c2e42', 35], ['#f0a81e', 30]],
    neutral: [['#efede0', 50], ['#ffffff', 20]],
  },
  'mcqueen-auto-repair-makati': {
    read: 'red collegiate "MCQUEEN", gold crown, chequered flags',
    brand: [['#b01b1b', 55], ['#f2cb3c', 25]],
    neutral: [['#111111', 45], ['#ffffff', 40]],
  },
  'makati-motorist-autocenter': {
    read: 'green ring "MAKATI MOTORISTS AUTO CENTER" around a chrome M',
    brand: [['#157a32', 55], ['#0e5522', 20]],
    neutral: [['#9a9a9a', 40], ['#ffffff', 30], ['#000000', 15]],
  },
  'kingaroy-auto-service-qld': {
    read: 'red gear + grey spanners, black "Auto Service Centre"',
    brand: [['#f5321e', 50], ['#d42a16', 20]],
    neutral: [['#9e9e9e', 35], ['#111111', 40], ['#ffffff', 30]],
  },
  'dental-hive-visayas-qc': {
    read: 'yellow bee with blue tooth body, "dental hive" in blue + yellow',
    brand: [['#2a8fd4', 50], ['#f5b21d', 45]],
    neutral: [['#e9ecef', 40], ['#ffffff', 30]],
  },
  'zp-smiles-dental-qc': {
    read: 'gold ZP monogram inside a gold tooth outline, gold serif wordmark',
    brand: [['#c9a227', 55], ['#b8860b', 25], ['#dcc06a', 20]],
    neutral: [['#ffffff', 60]],
  },

  // ---- monochrome brands --------------------------------------------------
  // Real identities that are black-on-white by design. capture.mjs's
  // ">=2 chromatic colours" rule can never pass these; the gate's actual check
  // (>=2 recorded hexes present in the styling) can.
  'gulfan-skin-clinic-makati': {
    read: 'black "gsc" script monogram over "GULFAN Skin clinic" on white',
    monochrome: true,
    brand: [['#111111', 70], ['#4a4a4a', 20]],
    neutral: [['#ffffff', 80]],
  },
  'one-world-skin-wellness-makati': {
    read: 'black high-contrast "OWSW" didone wordmark on white',
    monochrome: true,
    brand: [['#111111', 70], ['#555555', 20]],
    neutral: [['#ffffff', 80]],
  },
  'skin-cosmetic-clinic-renmark': {
    read: 'charcoal handwritten "Skin" script on white',
    monochrome: true,
    brand: [['#26282a', 70], ['#4a4d50', 20]],
    neutral: [['#ffffff', 80]],
  },
  'dr-mechanic-autocare-qc': {
    read: 'greyscale gear-and-spanner tile on a warm near-black workshop photo',
    monochrome: true,
    brand: [['#2a211c', 50], ['#6e6e6e', 25]],
    neutral: [['#c9c9c9', 40], ['#ffffff', 30], ['#141414', 45]],
  },

  // ---- palette recoverable, but the file is not a logo --------------------
  'automotive-1-car-care-qc': {
    read: 'storefront photo; fascia signage is purple + yellow with red "1" and chrome type',
    notAMark: 'street photograph of the shopfront — the logo is signage inside the frame',
    brand: [['#5b2d8e', 45], ['#f2b705', 35], ['#d82a20', 20]],
    neutral: [['#c9c9c9', 25], ['#ffffff', 20]],
  },
  'powertorq-auto-repair-qc': {
    read: 'red "PMS PROMO" price-list graphic; the PowerTorq badge sits top-left',
    notAMark: 'marketing promo graphic — the logo badge would need cropping out',
    brand: [['#d81e1e', 55], ['#f5d915', 30], ['#a51414', 20]],
    neutral: [['#111111', 25], ['#ffffff', 20]],
  },
  'hugoderm-skincare-davao': {
    read: 'clinic interior photo; frosted-glass signage reads "HugoDerm SKIN CARE CLINIC" in teal + green',
    notAMark: 'photograph of staff in the corridor — the logo is etched signage in the background',
    brand: [['#6e9ba3', 40], ['#4e9a51', 30], ['#8fbf6a', 20]],
    neutral: [['#dfe6e6', 35], ['#ffffff', 25]],
  },
  'kutis-by-kei-makati': {
    read: 'studio portrait of the dermatologist in a white coat — no mark, no wordmark, no brand colour',
    notAMark: 'studio portrait of the practitioner — carries no brand artwork at all',
    brand: [],
    neutral: [],
  },
}

const asColors = (pairs) => pairs.map(([hex, weight]) => ({ hex: hex.toLowerCase(), weight }))

let ready = 0
let stillBlocked = 0
const report = []

for (const [slug, p] of Object.entries(PALETTES)) {
  const file = join(slug, 'brand', 'brand.json')
  const brand = JSON.parse(await readFile(file, 'utf8'))

  brand.colors.brand = asColors(p.brand)
  brand.colors.neutral = asColors(p.neutral)
  brand.colors.themeColor = p.brand[0]?.[0] ?? null
  brand.colors.source = 'vision'

  // Drop the palette-pending BLOCKER — it has been answered either way.
  brand.notes = (brand.notes || []).filter((n) => !n.startsWith('BLOCKER palette-pending'))
  brand.notes.push(`vision-read of ${brand.logo.file}: ${p.read}`)

  if (p.notAMark) {
    brand.ready = false
    brand.blockedBy = 'logo-not-a-mark'
    brand.confidence = p.brand.length ? 40 : 15
    brand.notes.push(
      `BLOCKER logo-not-a-mark: ${p.notAMark}. ` +
        (p.brand.length
          ? 'The palette above is the prospect\'s real brand colour and is safe to use. ' +
            'The image file is not usable as a logo — needs a crop or a better source before build.'
          : 'No palette either — nothing brand-bearing in the image.'),
    )
    stillBlocked++
    report.push(`  BLOCKED  ${slug.padEnd(34)} logo-not-a-mark`)
  } else {
    brand.ready = true
    brand.confidence = p.monochrome ? 85 : 90
    if (p.monochrome) {
      brand.notes.push(
        'monochrome brand: the mark is black-on-white by design, so capture.mjs\'s ' +
          '">=2 chromatic colours" heuristic can never be satisfied. The recorded palette ' +
          'is the prospect\'s actual one, not a substitute.',
      )
    }
    ready++
    report.push(`  READY    ${slug.padEnd(34)} ${p.brand.map((c) => c[0]).join(' ')}`)
  }

  if (!DRY) await writeFile(file, JSON.stringify(brand, null, 2) + '\n')
}

console.log(report.join('\n'))
console.log(`\n${DRY ? '[dry-run] ' : ''}${ready} ready, ${stillBlocked} still blocked (logo-not-a-mark)`)
