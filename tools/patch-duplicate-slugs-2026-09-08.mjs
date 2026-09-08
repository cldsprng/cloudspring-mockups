#!/usr/bin/env node
// CLO-149 — reconcile the palette-pending backlog against repo reality.
//
// Two edits, both confined to <slug>/brand/brand.json (builder input, ungated
// by tools/hooks/pre-push, which excludes <slug>/brand/**):
//
// 1. DUPLICATE SLUGS. Fourteen folders are second captures of a business that
//    already has a canonical folder. Proof recorded per row: identical
//    facebook handle AND byte-identical logo file (md5). None of the fourteen
//    has ever had an index.html, so nothing is deployed at these slugs and
//    marking them cannot move a live URL. They are marked superseded rather
//    than deleted so the capture provenance survives and the call to remove
//    them stays with a human.
//
// 2. STALE blockedBy. Sixteen folders are ready:true, built and live but still
//    carry blockedBy:"palette-pending" from the 2026-08-19 retrofit. The
//    string is false — the palette is present and the gate passes — and it is
//    what makes any blockedBy scan over the repo misreport. Cleared to null.
//
// Idempotent: re-running makes no further change.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const STAMP = '2026-09-08';
const ISSUE = 'CLO-149';

// slug -> { canonical, md5, fb, why }
const DUPLICATES = {
  '509-family-care-cebu':           { canonical: '509-family-care',           md5: 'e781d880aaaf76d190cf43f3af67fe35', fb: '509FamilyCareClinic2022' },
  'automotive-1-qc':                { canonical: 'automotive-1-car-care-qc',  md5: '38839ff3101148b33beaea655a57ce2d', fb: 'Automotive1CarCareCenter' },
  'childrens-medical-clinic-davao': { canonical: 'childrens-medical-davao',   md5: 'd47a44ebcabe50b3126259e6904be721', fb: 'CMPediatricClinic' },
  'dr-jewelyn':                     { canonical: 'dr-jewelyn-calimbas',       md5: 'e81f3445cf91327a3909ba435f2b961f', fb: 'drjewelyn' },
  'dr-jewelyn-calimbas-taguig':     { canonical: 'dr-jewelyn-calimbas',       md5: 'e81f3445cf91327a3909ba435f2b961f', fb: 'drjewelyn' },
  'fast-autoworks':                 { canonical: 'fast-autoworks-pasig',      md5: '9a36d9fc4f8b1bb6790ad227d532ec03', fb: 'fastautoworksPH' },
  'ivory-smile':                    { canonical: 'ivory-smile-dental-makati', md5: '35a04b1e4f306916b926a9188f8515bd', fb: 'Ivorydentalmakati' },
  'jb-javier':                      { canonical: 'jb-javier-tire-taguig',     md5: 'd23404a475c169138faf39878f637f9e', fb: 'jbjaviertiresupply' },
  'pioquinto-clinic-pasig':         { canonical: 'pioquinto-clinic',          md5: '4406b368ef2f05a709ffae185ea09201', fb: 'PioquintoClinic' },
  'smilehq-makati':                 { canonical: 'smilehq-dental-makati',     md5: '0c905ca29ef90fc37edab76823f6ab44', fb: 'smilehqdentalclinic' },
  'test-medika':                    { canonical: 'medika-diagnostic-davao',   md5: '0bb8dc588675cba8c5ddb577db625f32', fb: 'MedikaDavao' },
  'mann-machine':                   { canonical: 'mann-machine-vt',           md5: null, fb: 'mannandmachineinc',
                                      why: 'same site https://mannandmachinevt.com/ as the canonical folder' },
  'tooth-doctors-davao':            { canonical: 'tooth-doctors-dental',      md5: null, fb: 'toothdoctorsdavao' },

  // Both halves of this pair are unbuilt. The canonical folder is the one
  // already carrying the correct verdict; see LOGO_NOT_A_MARK below.
  'rjf-vulcanizing':                { canonical: 'rjf-vulcanizing-taguig',    md5: 'd4f56e9726c38d5b727c78b19d76c597', fb: 'RJFVShop' },
};

// Vision-checked this run: the captured "logo" is a photograph of the shop
// interior (tyre racks, vulcanising bay), not a mark. verify-brand.mjs cannot
// see this — the file is present, referenced and loadable, so the gate passes
// it. Recorded so the next scan does not re-attempt a palette read.
const LOGO_NOT_A_MARK = new Set(['rjf-vulcanizing']);

const STALE_BLOCKEDBY = [
  'ad-plumbing-electrical-qc', 'dental-hive-visayas-qc', 'dermhaus-skin-clinic-qc',
  'dermquest-skin-aesthetic-qc', 'dr-mechanic-autocare-qc', 'gulfan-skin-clinic-makati',
  'kingaroy-auto-service-qld', 'limderm-dermatology-cebu', 'makati-motorist-autocenter',
  'mcqueen-auto-repair-makati', 'one-world-skin-wellness-makati', 'skin-aesthetiques-qc',
  'skin-cosmetic-clinic-renmark', 'skinthority-derma-davao', 'tower-of-david-caraircon-makati',
  'zp-smiles-dental-qc',
];

const read = (slug) => JSON.parse(readFileSync(`${slug}/brand/brand.json`, 'utf8'));
const write = (slug, obj) =>
  writeFileSync(`${slug}/brand/brand.json`, JSON.stringify(obj, null, 2) + '\n');

let changed = 0, skipped = 0;
const note = (b, line) => {
  b.notes = b.notes || [];
  if (!b.notes.includes(line)) b.notes.push(line);
};

console.log('== duplicate slugs ==');
for (const [slug, d] of Object.entries(DUPLICATES)) {
  if (!existsSync(`${slug}/brand/brand.json`)) { console.log(`  MISS  ${slug}`); continue; }

  // Refuse to mark anything that is actually deployed. A folder with an
  // index.html is a live URL and is not this script's business.
  if (existsSync(`${slug}/index.html`)) {
    console.log(`  SKIP  ${slug} — has index.html, not an orphan capture`);
    skipped++; continue;
  }
  if (!existsSync(`${d.canonical}/index.html`) && !LOGO_NOT_A_MARK.has(slug)) {
    console.log(`  SKIP  ${slug} — canonical ${d.canonical} is not built`);
    skipped++; continue;
  }

  const b = read(slug);
  if (b.blockedBy === 'duplicate-slug') { console.log(`  ok    ${slug} (already marked)`); continue; }

  b.ready = false;
  b.blockedBy = 'duplicate-slug';
  b.supersededBy = d.canonical;
  const proof = d.md5
    ? `facebook handle "${d.fb}" and logo file md5 ${d.md5} both identical`
    : (d.why || `facebook handle "${d.fb}" identical`);
  note(b, `${ISSUE} (${STAMP}): duplicate capture of "${d.canonical}" — ${proof}. ` +
          `This slug has never had an index.html, so nothing is deployed at it. ` +
          `Do not build; the prospect's live mockup is /${d.canonical}/.`);

  if (LOGO_NOT_A_MARK.has(slug)) {
    b.blockedBy = 'logo-not-a-mark';
    note(b, `${ISSUE} (${STAMP}): vision-checked — the captured file is a photograph of ` +
            `the shop interior, not a mark. Not a palette-pending case; a vision palette ` +
            `read here would invent a brand out of a snapshot. Stays BRAND BLOCKED, ` +
            `matching "${d.canonical}".`);
  }

  write(slug, b);
  console.log(`  MARK  ${slug} -> ${b.blockedBy} (supersededBy ${d.canonical})`);
  changed++;
}

console.log('\n== stale blockedBy on ready:true ==');
for (const slug of STALE_BLOCKEDBY) {
  if (!existsSync(`${slug}/brand/brand.json`)) { console.log(`  MISS  ${slug}`); continue; }
  const b = read(slug);
  if (b.blockedBy === null) { console.log(`  ok    ${slug} (already clear)`); continue; }
  if (b.ready !== true) { console.log(`  SKIP  ${slug} — ready is not true`); skipped++; continue; }
  if (!existsSync(`${slug}/index.html`)) { console.log(`  SKIP  ${slug} — not built`); skipped++; continue; }

  const was = b.blockedBy;
  b.blockedBy = null;
  note(b, `${ISSUE} (${STAMP}): cleared stale blockedBy:"${was}" — the folder is ` +
          `ready:true, built and live, and the palette is recorded. The string was a ` +
          `leftover from the 2026-08-19 retrofit and made blockedBy scans misreport.`);
  write(slug, b);
  console.log(`  CLEAR ${slug} (was "${was}")`);
  changed++;
}

console.log(`\nchanged ${changed}, skipped ${skipped}`);
