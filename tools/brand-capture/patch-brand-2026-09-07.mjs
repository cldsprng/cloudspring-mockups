#!/usr/bin/env node
// CLO-145 step 4 (2026-09-07) — builder-side corrections to the 2026-09-07
// capture (CLO-144). Every change here is a vision read of the captured logo
// file that already sits in <slug>/brand/, done by the Mockup Builder before
// building. Nothing is invented and no colour is chosen for looks: each hex
// below is a colour actually present in the lead's own mark.
//
// Why this exists. verify-brand.mjs checks that >=2 captured hexes appear in
// the styling — the check that "catches an invented palette". It compares the
// page against brand.json, so it cannot tell that brand.json itself carries a
// colour the logo does not contain. Three of the eight 2026-09-07 captures did:
// a crimson for a navy-and-gold wordmark, a cyan for a gold-and-black mark, and
// a pink for an all-blue one. Building to those hexes would have passed the
// gate while shipping exactly the invented palette the gate exists to stop.
//
// It also demotes one lead the gate cannot judge at all: a captured file can be
// present, referenced and correctly coloured while not being a logo. See the
// logo-not-a-mark row in PIPELINE-CONFIG.md.

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const w = (hex, weight) => ({ hex, weight })

const PATCHES = {
  // Circular mark: terracotta/tan place setting inside a navy ring of type.
  // #D4A574 (tan) is a good read and stays. #8B4513 was darker than anything
  // in the mark; the actual body colour is a mid terracotta. Navy added — it
  // is the "AUFFRANCE" lettering and the two dots, and it was missed entirely.
  'auffrance-catering-pasig': {
    colors: [w('#C87941', 50), w('#D4A574', 45), w('#22304E', 30)],
    note: 'palette re-read from logo-facebook-profile.jpg by the builder: #8B4513 replaced with the terracotta actually in the mark (#C87941), navy lettering (#22304E) added. #D4A574 confirmed.',
  },

  // Ornate green oval, script wordmark in dark green with a gold shadow.
  // #2E7D32 is defensible for the script but missed the dominant field green
  // and the gold, so the page had no way to look like the mark.
  'villa-salud-catering-taguig': {
    colors: [w('#4EB873', 50), w('#1B5E20', 45), w('#F2D047', 25)],
    note: 'palette re-read from logo-facebook-profile.jpg by the builder: field green (#4EB873) and the gold letter-shadow (#F2D047) added, dark script green kept as #1B5E20. #FFFFFF dropped as a neutral, not a brand colour.',
  },

  // Navy field, amber-gold serif wordmark. No red anywhere in the mark.
  'romualdos-catering-davao': {
    colors: [w('#1F2E5C', 50), w('#E89A22', 50)],
    note: 'CORRECTION — #C41E3A (crimson) was not in the logo. logo-facebook-profile.jpg is a navy field (#1F2E5C) with an amber-gold serif wordmark (#E89A22); re-read by the builder before build.',
  },

  // Gold/bronze coin with a black tooth glyph. No blue anywhere in the mark.
  // The captured `name` is the <title> of the .ph registry wildcard redirect
  // page, not the business — the lead card records that oanadental.ph is the
  // wildcard and not theirs. Left as-is it would make the gate's real-business-
  // name check demand the word "Redirecting..." on the page.
  'oana-dental-qc': {
    colors: [w('#C7A249', 50), w('#8C6B2F', 40), w('#111111', 35)],
    name: 'Oana Dental Specialist',
    note: 'CORRECTION — #0099CC (cyan) was not in the logo. logo-facebook-profile.jpg is a gold/bronze coin (#C7A249 into #8C6B2F) carrying a black tooth glyph (#111111); re-read by the builder. Captured name "Redirecting..." was the title of the .ph registry-wildcard page at oanadental.ph, which the lead card confirms is NOT their domain; replaced with the real business name.',
  },

  // Blue tooth holding a city skyline; "CITY" blue, "DENTAL" black.
  // #1E88E5 is a good read of the mid blue and stays.
  'city-dental-qc': {
    colors: [w('#1E88E5', 50), w('#14599B', 40), w('#111111', 30)],
    note: 'palette re-read from logo-facebook-profile.jpg by the builder: #1E88E5 confirmed as the mid blue; the deeper blue of the tooth gradient (#14599B) and the black "DENTAL" (#111111) added. #F5F5F5 dropped as a neutral, not a brand colour.',
  },

  // Blue/teal tooth with two figures over a blue wordmark. Entirely blue and
  // teal — there is no pink in this mark.
  'smile-health-dental-qc': {
    colors: [w('#1B69B8', 50), w('#29B6E8', 45), w('#16A79B', 30)],
    note: 'CORRECTION — #FF6B9D (pink) was not in the logo. logo-facebook-profile.jpg is entirely blue and teal: deep blue wordmark and figure (#1B69B8), light blue (#29B6E8), teal foot of the tooth (#16A79B); re-read by the builder.',
  },

  // Not a palette problem — an asset problem the gate cannot see.
  'hometown-bakery-oh': {
    demote: 'logo-not-a-mark',
    note: 'BLOCKER logo-not-a-mark: logo-facebook-profile.jpg is a photograph of a tiered wedding cake on a banquet table, not a logo mark. It cannot be used as a logo in a mockup. The captured palette (#8B4513 saddle brown / #F5DEB3 wheat) matches nothing in that photograph either — the image is white icing, purple and white flowers, and a beige function room — so it was not read from this asset and is not usable. Do not build. Needs a real mark hand-dropped into hometown-bakery-oh/brand/, or the lead is dropped.',
  },
}

const ROOT = process.cwd()
let changed = 0

for (const [slug, patch] of Object.entries(PATCHES)) {
  const path = join(ROOT, slug, 'brand', 'brand.json')
  const brand = JSON.parse(await readFile(path, 'utf8'))

  if (patch.demote) {
    brand.ready = false
    brand.blockedBy = patch.demote
  } else {
    brand.colors.brand = patch.colors
    brand.colors.source = 'vision'
    if (patch.name) brand.name = patch.name
  }

  brand.notes = [...(brand.notes || []), `2026-09-07 builder (CLO-145): ${patch.note}`]
  brand.reviewedBy = 'mockup-builder 2026-09-07 (CLO-145) — logo vision-checked before build'

  await writeFile(path, JSON.stringify(brand, null, 2) + '\n')
  console.log(`patched ${slug}${patch.demote ? `  -> BLOCKED (${patch.demote})` : ''}`)
  changed++
}

console.log(`\n${changed} brand.json file(s) updated.`)
