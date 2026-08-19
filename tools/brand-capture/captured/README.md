# `captured/` — brand data staged for the CLO-21 retrofit

30 slugs of completed brand capture, held here **on purpose**.

## Why it is not in `<slug>/brand/`

`tools/hooks/pre-push` gates every top-level folder a push touches that contains
an `index.html`. A commit that adds only `<slug>/brand/**` still touches
`<slug>`, so the gate runs `verify-brand.mjs` against a mockup whose HTML has not
been rebuilt yet — and fails it on the two HTML checks:

```
FAIL  none of the captured logo files appear in index.html
FAIL  only 0 of 3 captured brand colours used (need 2)
```

That is a deadlock, not a defect: brand data cannot land until the mockup is
rebuilt, and the mockup cannot be rebuilt without the brand data. Verified
2026-08-19 — pushing the retrofit direct to `<slug>/brand/` was rejected with
`PUSH BLOCKED — 30 mockup folder(s) failed the brand gate`.

`tools/` has no `index.html`, so it is never gated. Staging here moves the data
to where the builder can reach it without weakening the gate by one line. **The
gate is not bypassed** — every mockup folder must still pass it at rebuild time.

## How the Mockup Builder uses this

Per slug, in a **single commit** that contains both the brand data and the
rebuilt HTML:

```sh
slug=skinthority-derma-davao
mkdir -p "$slug/brand"
git mv tools/brand-capture/captured/$slug/* "$slug/brand/"
# rebuild $slug/index.html against $slug/brand/brand.json:
#   - reference brand.logo.file
#   - use >=2 hexes from colors.brand[]
node tools/brand-capture/verify-brand.mjs "$slug"   # must exit 0
```

Capture and rebuild have to land together. That coupling is what the gate
enforces, and splitting them across two commits is what created this deadlock.

## What is in here

| state | count | meaning |
|---|---|---|
| `ready` | 17 | logo + palette captured. Safe to rebuild against. |
| `logo-not-a-mark` | 4 | palette is real, but the file is a photo/promo, not a logo. **Do not build.** |
| `no-assets` | 9 | nothing capturable. **Do not build.** |

`logo-not-a-mark` is a state the original `ready` / `palette-pending` /
`no-assets` model did not have. The Facebook profile picture is a storefront
photo (`automotive-1-car-care-qc`), a promo graphic (`powertorq-auto-repair-qc`),
a staff photo (`hugoderm-skincare-davao`) or a studio portrait
(`kutis-by-kei-makati`). The first three still yield the prospect's genuine
palette from signage, so the colours are recorded and usable — but the image
cannot serve as a logo, so they are held rather than shipped. All four cards are
in `BRAND BLOCKED` for the user's call.

Four `ready` slugs are **monochrome** brands — `gulfan-skin-clinic-makati`,
`one-world-skin-wellness-makati`, `skin-cosmetic-clinic-renmark` and
`dr-mechanic-autocare-qc` are black-on-white by design. `capture.mjs` requires
">=2 chromatic colours" and can never pass them; the gate itself only counts
recorded hexes, so their true monochrome palette is recorded rather than a
colourful substitute invented. Rebuild them in monochrome.

Palettes with `colors.source: "vision"` were read off the captured logo image —
the remedy both `capture.mjs` and the pre-push hook prescribe for
`palette-pending`. None are invented. Regenerate with:

```sh
node tools/brand-capture/apply-vision-palette.mjs --dry-run
```
