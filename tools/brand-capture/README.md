# Headless brand capture + deploy gate

Fixes the two failures on CLO-1: brand capture never ran in scheduled runs, and
the mockup builder shipped anyway with an invented palette.

Both scripts are plain Node (v18+), no dependencies, no browser, no logged-in
session. They run inside a scheduled Cowork run or a Claude Code Routine.

## 1. Capture

```bash
# Lead with a website
node capture.mjs --site jntirezone.com --slug jn-tirezone --out jn-tirezone/brand

# Facebook-only lead (the common case for this pipeline's qualifier)
node capture.mjs --facebook fastautoworksPH --slug fast-autoworks --out fast-autoworks/brand

# Both, when a lead has a thin site and an active page
node capture.mjs --site fastautoworks.ph --facebook fastautoworksPH --slug fast-autoworks
```

Writes `<out>/brand.json` plus every logo file it could download.

**Where the logo comes from**, best signal first: schema.org `logo` (100) ·
Facebook page profile picture (95) · `<img>` marked logo/brand/wordmark (90) ·
`apple-touch-icon` (70) · `og:image` (60) · favicon (50).

`graph.facebook.com/<slug>/picture?type=large` needs **no access token and no
login**. The Facebook page HTML is login-walled — the picture endpoint is not.
This is why brand capture no longer requires a desktop session for FB-only leads.

**Where colour comes from:** `theme-color`, CSS custom properties named
`--primary/--brand/--accent/...` (weighted 40× — a site declaring `--primary` is
telling you its brand colour outright), then hex/rgb frequency across inline
styles and up to 6 linked stylesheets. Greys, near-white and near-black are
separated out as `neutral` — they're structure, not identity.

## 2. brand.json states

| `ready` | `blockedBy` | What the builder does |
|---|---|---|
| `true` | `null` | Build. Use the logo file, the `colors.brand` hexes, and `fonts[0]`. |
| `false` | `palette-pending` | Logo exists, no CSS to read (FB-only lead). Vision-read the logo, write the hexes into `colors.brand[]`, set `colors.source: "vision"`, `ready: true`. Then build. |
| `false` | `no-assets` | **Do not build.** No logo anywhere. Card goes to BRAND BLOCKED for a human call: hand-capture assets, or drop the lead. |

Exit code is `0` when `ready`, `1` otherwise, so a run can branch on it.

## 3. Gate — run before `git push`

```bash
node verify-brand.mjs ./jn-tirezone
```

Checks the built page against the captured brand:

1. `brand/brand.json` exists and `ready: true`
2. a captured logo file is actually referenced in `index.html`
3. **≥2** captured brand hexes appear in the styling — this is the check that
   catches an invented palette
4. the captured typeface is used (generic fallbacks like Arial/Helvetica/Roboto
   don't count as a pass; they appear in every font stack)
5. no leftover `GENERIC BRANDING` marker
6. the real business name is on the page

Non-zero exit means **do not deploy**. There is no flag-and-send-anyway path.

## Verified against real leads

Auto repair / vulcanizing, Pasig — this week's niche.

| Lead | Path | Result |
|---|---|---|
| Toyota Pasig · `toyotapasig.com.ph` | website | ready, conf 100, logo + Toyota red `#eb0a1e` |
| JN Tirezone · `jntirezone.com` (Ortigas Ave, Pasig) | website | ready, conf 100, logo + navy `#252e65` / blue `#116dff`, typeface Madefor |
| My Auto Care · `maccph.org` | website | ready, conf 100, JSON-LD logo + Montserrat |
| Fast Autoworks · FB `fastautoworksPH` | facebook | logo captured headlessly, `palette-pending` → vision → ready |
| dead domain | website | `no-assets`, blocked, exit 1 |

Gate tested both ways on JN Tirezone: a generic mockup fails 5 checks and is
blocked; a brand-consuming mockup passes.
