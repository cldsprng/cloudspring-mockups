#!/usr/bin/env node
// Headless brand capture. No browser, no Claude in Chrome, no logged-in session.
// Runs fine inside a scheduled Cowork run or a Code Routine.
//
//   node capture.mjs --site https://example.com --slug example-auto --out ./example-auto/brand
//
// Writes <out>/brand.json plus any logo/icon files it could download.
// brand.json.ready === false means the mockup builder MUST NOT build. That is
// the whole point: no more silently shipping a generic design.

import { writeFile, mkdir } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const args = {}
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1]
}

const TIMEOUT_MS = 20000

async function get(url, asBuffer = false) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': UA, accept: '*/*' },
    })
    if (!res.ok) return null
    return {
      url: res.url,
      type: res.headers.get('content-type') || '',
      body: asBuffer ? Buffer.from(await res.arrayBuffer()) : await res.text(),
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

const abs = (href, base) => {
  try {
    return new URL(href, base).href
  } catch {
    return null
  }
}

// ---------- colour helpers ----------

const hexToRgb = (h) => {
  h = h.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

const toHex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')

// Chromatic = has actual hue and isn't washed out. Greys, near-white and
// near-black are structural, not brand identity, so they're tracked separately.
function classify(rgb) {
  const [r, g, b] = rgb
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const sat = max === 0 ? 0 : (max - min) / max
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  if (sat < 0.15) return 'neutral'
  if (lum > 0.95 || lum < 0.05) return 'neutral'
  return 'brand'
}

function collectColors(css) {
  const counts = new Map()
  const bump = (rgb, weight) => {
    const key = toHex(rgb)
    counts.set(key, (counts.get(key) || 0) + weight)
  }

  // CSS custom properties named like brand tokens get heavy weight — a site
  // that declares --primary is telling us its brand colour outright.
  const varRe = /--([a-z0-9-]*(?:primary|brand|accent|secondary|main|theme)[a-z0-9-]*)\s*:\s*(#[0-9a-f]{3,8}|rgba?\([^)]+\))/gi
  for (const m of css.matchAll(varRe)) {
    const rgb = parseColor(m[2])
    if (rgb) bump(rgb, 40)
  }

  for (const m of css.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi)) {
    const rgb = parseColor(m[0])
    if (rgb) bump(rgb, 1)
  }
  for (const m of css.matchAll(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/gi)) {
    const rgb = parseColor(m[0] + ')')
    if (rgb) bump(rgb, 1)
  }
  return counts
}

function parseColor(s) {
  s = s.trim()
  if (s.startsWith('#')) {
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return null
    return hexToRgb(s.slice(0, 7))
  }
  const m = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i)
  return m ? [+m[1], +m[2], +m[3]] : null
}

// ---------- extraction ----------

function metaOf(html, name) {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)\\s*=\\s*["']${name}["'][^>]*>`,
    'i'
  )
  const tag = html.match(re)?.[0]
  return tag?.match(/content\s*=\s*["']([^"']+)["']/i)?.[1] || null
}

function logoCandidates(html, base) {
  const out = []
  const push = (href, score, why) => {
    const u = href && abs(href, base)
    if (u) out.push({ url: u, score, why })
  }

  // schema.org — the most explicit signal a site can give.
  for (const m of html.matchAll(
    /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      const nodes = [].concat(JSON.parse(m[1].trim()))
      const walk = (n) => {
        if (!n || typeof n !== 'object') return
        if (typeof n.logo === 'string') push(n.logo, 100, 'json-ld logo')
        if (n.logo?.url) push(n.logo.url, 100, 'json-ld logo.url')
        Object.values(n).forEach((v) => Array.isArray(v) ? v.forEach(walk) : walk(v))
      }
      nodes.forEach(walk)
    } catch { /* malformed JSON-LD is common; ignore */ }
  }

  // <img> tags that call themselves a logo.
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0]
    const src =
      tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bdata-src\s*=\s*["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bsrcset\s*=\s*["']([^"'\s,]+)/i)?.[1]
    if (!src) continue
    const hay = tag.toLowerCase()
    if (/logo|brand|wordmark/.test(hay)) push(src, 90, 'img marked logo')
    else if (/header|navbar|site-title/.test(hay)) push(src, 45, 'header img')
  }

  // SVG sprite / inline svg referenced by class is not downloadable, skipped.

  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0]
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() || ''
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]
    if (!href) continue
    if (rel.includes('apple-touch-icon')) push(href, 70, 'apple-touch-icon')
    else if (rel.includes('icon')) push(href, 50, 'favicon')
    else if (rel.includes('mask-icon')) push(href, 40, 'mask-icon')
  }

  const og = metaOf(html, 'og:image')
  if (og) push(og, 60, 'og:image')

  push('/favicon.ico', 10, 'default favicon')

  // Dedupe, keeping the best reason per URL.
  const seen = new Map()
  for (const c of out.sort((a, b) => b.score - a.score)) {
    if (!seen.has(c.url)) seen.set(c.url, c)
  }
  return [...seen.values()]
}

function fontFamilies(html, css) {
  const fams = new Set()
  for (const m of html.matchAll(
    /fonts\.googleapis\.com\/css2?\?([^"']+)/gi
  )) {
    for (const f of m[1].matchAll(/family=([^&:]+)/gi)) {
      fams.add(decodeURIComponent(f[1].replace(/\+/g, ' ')))
    }
  }
  for (const m of css.matchAll(/font-family\s*:\s*([^;}"']+)/gi)) {
    const first = m[1].split(',')[0].replace(/["']/g, '').trim()
    if (
      first &&
      first.length < 40 &&
      !/^(inherit|initial|unset|var\(|sans-serif|serif|monospace|system-ui|-apple-system)/i.test(first) &&
      // Icon fonts are plumbing, not brand type.
      !/icon|glyph|fontawesome|swiper|dashicons|material symbols/i.test(first)
    ) {
      fams.add(first)
    }
  }
  return [...fams].slice(0, 8)
}

// ---------- main ----------

const site = args.site
// Facebook page slug or URL. Most pipeline leads are Facebook-only by
// definition of the qualifier, so this is the common case, not the edge case.
const fbArg = args.facebook || args.fb
const fbSlug = fbArg
  ? fbArg.replace(/^https?:\/\/(www\.|m\.|mbasic\.)?facebook\.com\//i, '').replace(/[/?#].*$/, '')
  : null

const slug =
  args.slug ||
  (site ? new URL(site.startsWith('http') ? site : 'https://' + site).hostname.replace(/^www\./, '') : fbSlug) ||
  'unknown'
const outDir = args.out || join(process.cwd(), slug, 'brand')

if (!site && !fbSlug) {
  console.error('usage: capture.mjs [--site <url>] [--facebook <page-slug>] [--slug <slug>] [--out <dir>]')
  process.exit(2)
}

const notes = []
const brand = {
  slug,
  site: site || null,
  facebook: fbSlug || null,
  capturedAt: new Date().toISOString(),
  source: 'headless-http',
  name: null,
  logo: null,
  logoFiles: [],
  colors: { brand: [], neutral: [], themeColor: null, source: null },
  fonts: [],
  ready: false,
  blockedBy: null,
  confidence: 0,
  notes,
}

await mkdir(outDir, { recursive: true })

// --- Facebook profile picture ---
// The page HTML is login-walled, but graph.facebook.com/<slug>/picture is not
// and needs no access token. For a Facebook-only lead this is the logo.
if (fbSlug) {
  let got = false
  let silhouette = false
  // `redirect=false` returns JSON metadata instead of the image, including
  // is_silhouette. That flag is the only reliable way to tell a real profile
  // picture from Facebook's anonymous grey avatar — pages reachable only by
  // numeric ID (the /p/Name-<id>/ form) serve the placeholder to logged-out
  // callers, and shipping that as a logo is exactly the failure this tool
  // exists to prevent. Size alone won't catch it: today's placeholder is 1876
  // bytes, and nothing stops Facebook shipping a bigger one.
  // width/height ask for the full-resolution picture (~960px) rather than the
  // 200px `type=large` crop — the builder has to vision-read this image.
  for (const q of ['width=1200&height=1200', 'type=large', 'type=normal']) {
    const meta = await get(`https://graph.facebook.com/${fbSlug}/picture?${q}&redirect=false`)
    let src = `https://graph.facebook.com/${fbSlug}/picture?${q}`
    if (meta) {
      try {
        const data = JSON.parse(meta.body).data
        if (data?.is_silhouette) { silhouette = true; break }
        if (data?.url) src = data.url
      } catch { /* fall back to the redirecting URL below */ }
    }
    const r = await get(src, true)
    if (!r || !/image/i.test(r.type) || r.body.length < 2048) continue
    const ext = /png/.test(r.type) ? '.png' : '.jpg'
    const file = `logo-facebook-profile${ext}`
    await writeFile(join(outDir, file), r.body)
    brand.logoFiles.push({
      file,
      bytes: r.body.length,
      from: `graph.facebook.com/${fbSlug}/picture?${q}`,
      why: 'facebook profile picture',
      score: 95,
    })
    if (!brand.logo) brand.logo = { file, score: 95, why: 'facebook profile picture' }
    got = true
    break
  }
  notes.push(
    got
      ? `facebook profile picture captured headlessly for "${fbSlug}"`
      : silhouette
        ? `facebook page "${fbSlug}" has no profile picture — the graph endpoint returns the anonymous silhouette (is_silhouette: true). Common for pages reachable only by numeric ID. Not recoverable headlessly.`
        : `facebook profile picture unavailable for "${fbSlug}" (page may be renamed, unpublished, or ID-only)`
  )
}

let page = null
if (site) {
  for (const candidate of site.startsWith('http') ? [site] : [`https://${site}`, `http://${site}`]) {
    page = await get(candidate)
    if (page) break
  }
}

if (!site) {
  notes.push('no website for this lead — facebook-only capture path')
} else if (!page || !/html/i.test(page.type)) {
  notes.push(
    page ? `fetched but not HTML (${page.type})` : 'site unreachable over plain HTTP(S)'
  )
} else {
  const html = page.body
  const base = page.url
  brand.site = base
  brand.name =
    metaOf(html, 'og:site_name') ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
    null

  // Pull external stylesheets — most brand colour lives there, not inline.
  let css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join('\n')
  css += '\n' + [...html.matchAll(/\bstyle\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]).join('\n')

  const sheets = [...html.matchAll(/<link\b[^>]*>/gi)]
    .filter((m) => /stylesheet/i.test(m[0]))
    .map((m) => abs(m[0].match(/href\s*=\s*["']([^"']+)["']/i)?.[1] || '', base))
    .filter(Boolean)
    .slice(0, 6)

  for (const sheet of sheets) {
    const r = await get(sheet)
    if (r) css += '\n' + r.body
  }
  notes.push(`${sheets.length} stylesheet(s) fetched, ${css.length} bytes of CSS`)

  brand.colors.themeColor = metaOf(html, 'theme-color')
  const counts = collectColors(css)
  if (brand.colors.themeColor) {
    const rgb = parseColor(brand.colors.themeColor)
    if (rgb) counts.set(toHex(rgb), (counts.get(toHex(rgb)) || 0) + 60)
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
  brand.colors.brand = ranked
    .filter(([hex]) => classify(hexToRgb(hex)) === 'brand')
    .slice(0, 6)
    .map(([hex, weight]) => ({ hex, weight }))
  brand.colors.neutral = ranked
    .filter(([hex]) => classify(hexToRgb(hex)) === 'neutral')
    .slice(0, 4)
    .map(([hex, weight]) => ({ hex, weight }))

  brand.fonts = fontFamilies(html, css)

  // Download logo candidates best-first; keep the first real image.
  await mkdir(outDir, { recursive: true })
  for (const cand of logoCandidates(html, base).slice(0, 6)) {
    const r = await get(cand.url, true)
    if (!r || !/image|svg/i.test(r.type)) continue
    if (r.body.length < 512) continue // 1x1 pixels and empty favicons
    let ext = extname(new URL(cand.url).pathname) || ''
    if (!ext) ext = /svg/.test(r.type) ? '.svg' : /png/.test(r.type) ? '.png' : '.img'
    // Index the filename — two <img> tags can both match "logo" and the
    // second would otherwise silently overwrite the first.
    const n = brand.logoFiles.length + 1
    const file = join(outDir, `logo-${n}-${cand.why.replace(/[^a-z0-9]+/gi, '-')}${ext}`)
    await writeFile(file, r.body)
    brand.logoFiles.push({
      file: basename(file),
      bytes: r.body.length,
      from: cand.url,
      why: cand.why,
      score: cand.score,
    })
    if (!brand.logo || cand.score > brand.logo.score) {
      brand.logo = { file: basename(file), score: cand.score, why: cand.why }
    }
    if (brand.logoFiles.length >= 3) break
  }
}

// ---------- the gate ----------
// A real logo file, and at least two chromatic colours. Anything less and the
// builder is guessing, which is exactly the failure we're fixing.
const hasLogo = brand.logoFiles.some((f) => f.score >= 50 && f.bytes >= 1024)
const hasPalette = brand.colors.brand.length >= 2
if (brand.colors.brand.length) brand.colors.source = 'site-css'
brand.confidence =
  (hasLogo ? 50 : brand.logoFiles.length ? 20 : 0) +
  Math.min(30, brand.colors.brand.length * 10) +
  (brand.fonts.length ? 20 : 0)
brand.ready = hasLogo && hasPalette

if (!hasLogo) {
  brand.blockedBy = 'no-assets'
  notes.push('BLOCKER no-assets: no usable logo file (need >=1KB from a logo/icon/FB signal)')
} else if (!hasPalette) {
  // We have the logo but no CSS to read colours from — the Facebook-only case.
  // The builder can unblock this itself by vision-reading the logo, but it has
  // to write what it read back into colours.brand so the gate can check it.
  brand.blockedBy = 'palette-pending'
  notes.push(
    `BLOCKER palette-pending: logo captured (${brand.logo.file}) but fewer than 2 chromatic colours found. ` +
      'Vision-read the logo, then write the hex values into colors.brand[] with colors.source="vision" and re-run the gate.'
  )
}

await writeFile(join(outDir, 'brand.json'), JSON.stringify(brand, null, 2))
console.log(JSON.stringify(brand, null, 2))

// Set exitCode rather than calling process.exit() — with keep-alive fetch
// sockets still open, a hard exit trips a libuv assertion on Windows and the
// shell sees 127 instead of our status, which would silently defeat the gate.
process.exitCode = brand.ready ? 0 : 1

