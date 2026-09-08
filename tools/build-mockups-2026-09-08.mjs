#!/usr/bin/env node
// CLO-154 step 4 (2026-09-08) — builds the run's mockups.
//
// The palette and the logo filename are read out of <slug>/brand/brand.json at
// build time rather than copied into this file by hand. That is deliberate: it
// makes it structurally impossible to ship a page whose colours are not the
// captured ones, which is the failure verify-brand.mjs's ">=2 captured hexes"
// check exists to catch. If a hex is wrong, the fix is brand.json, not here.
//
// Every factual claim in LEADS below comes from the lead's Trello card
// (evidence gathered by steps 1-3 and dated 2026-09-08). Anything not
// established there is rendered as a labelled placeholder, never guessed.
// Self-hosted assets only: the sole external references are tel:/mailto:
// links, the prospect's own Facebook page, and the CloudSpring booking link.

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const BOOKING = 'https://api.leadconnectorhq.com/widget/booking/QRPEnWRw2Kx9rBe0Mj6J'

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Mix a hex toward white (t=1 is white) so each page derives its own tints
// from its own captured colours instead of a shared neutral ramp.
const mix = (hex, t) => {
  const n = parseInt(hex.replace('#', ''), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t))
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
}
const shade = (hex, t) => {
  const n = parseInt(hex.replace('#', ''), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - t)))
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
}
const rgba = (hex, a) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
// Readable text colour on a filled swatch.
const on = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#111111' : '#ffffff'
}

const ICON = {
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  phone: '<path d="M6.6 3.5 9 3.9l1.2 3.4-1.9 1.5a12 12 0 0 0 5.9 5.9l1.5-1.9 3.4 1.2.4 2.4a2 2 0 0 1-2.1 2.3A16.5 16.5 0 0 1 4.3 5.6 2 2 0 0 1 6.6 3.5z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.6 6.8 8.4 6 8.4-6"/>',
  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7v5.3l3.4 2"/>',
  chat: '<path d="M20.5 12c0 4-3.8 7.2-8.5 7.2a10 10 0 0 1-2.6-.33L4.4 20.4l1.2-3.2A6.8 6.8 0 0 1 3.5 12c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2z"/>',
  star: '<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"/>',
  check: '<path d="m5 12.5 4.6 4.6L19 7.7"/>',
  globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4a15 15 0 0 1 0 17.2 15 15 0 0 1 0-17.2"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3.2v3.6M16 3.2v3.6"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.4 19.4c.5-3 2.8-4.7 5.6-4.7s5.1 1.7 5.6 4.7"/><path d="M16.2 6.1a3.2 3.2 0 0 1 0 6.1M17.4 14.9c2.2.4 3.8 2 4.2 4.5"/>',
  shield: '<path d="M12 3.4 19 6v5.4c0 4.2-2.8 7.4-7 9.2-4.2-1.8-7-5-7-9.2V6z"/>',
}
const svg = (k, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`

// ---------------------------------------------------------------------------
// Lead content. Facts only; `placeholders` are the honest labelled gaps.
// ---------------------------------------------------------------------------

const LEADS = [
  {
    slug: 'affinity-dental-clinics',
    name: 'Affinity Dental Clinics',
    shortName: 'Affinity Dental',
    sub: 'Legaspi Village, Makati',
    locale: 'Legaspi Village, Makati',
    logoRound: false,
    // logo-1 is the horizontal wordmark from their own JSON-LD. Vision-checked
    // 2026-09-08: a real mark, and the captured #0654c4 sits 25.5 away from a
    // blue actually in it, so the capture read this business and not a stock image.
    logoPick: 'logo-1-json-ld-logo.png',
    title: 'Affinity Dental Clinics &mdash; 2F Plaza One Hundred, 100 V.A. Rufino Street, Legaspi Village, Makati',
    metaDesc:
      'Affinity Dental Clinics, 2F Plaza One Hundred, 100 V.A. Rufino Street, Legaspi Village, Makati. Open Monday to Sunday, 9:00 to 18:00. Call (02) 8823-5571 or 0917 584-6852.',
    eyebrow: 'Your own listing &middot; five rivals underneath it',
    h1: 'Your directory page sells <em>five other Makati clinics</em>.',
    lead: 'ClinicFinderPH runs a listing for Affinity Dental Clinics Makati &mdash; and prints Ramirez, Teeth Hub, Sevilla, Smiles for Miles and SMILES by CERRA directly underneath it. The same site also ranks you inside its &ldquo;10 Best Dental Clinics in Makati 2026&rdquo;. A patient who finds you there leaves with six options. This page gives them one.',
    idcard: [
      ['pin', 'Address', '2F Plaza One Hundred, 100 V.A. Rufino Street, Legaspi Village, Makati'],
      ['phone', 'Landline', '<a href="tel:+63288235571">(02) 8823-5571</a>'],
      ['phone', 'Mobile', '<a href="tel:+639175846852">0917 584-6852</a>'],
      ['mail', 'Email', '<a href="mailto:makati@affinitydentalclinics.com">makati@affinitydentalclinics.com</a>'],
      ['clock', 'Hours', 'Monday to Sunday, 9:00 &ndash; 18:00', 'Seven days a week.'],
      ['globe', 'Website', 'affinitydentalclinics.com', 'Registered 2010-09-25, active to 2027-09-25 &mdash; sixteen years on the same name.'],
    ],
    btns: [
      ['tel:+63288235571', 'Call (02) 8823-5571', 'primary'],
      ['mailto:makati@affinitydentalclinics.com', 'Email the Makati clinic', 'outline'],
    ],
    problem: {
      h2: 'Six clinics on the page a patient found you on.',
      p: 'Your ClinicFinderPH listing is yours. What sits under it is not. Five named competitors, on your own page, at the moment somebody has decided to book.',
      bad: [
        ['ClinicFinderPH', 'Your own listing', 'Five rivals printed underneath it'],
        ['Ramirez &middot; Teeth Hub', 'Named on your page', 'Both Makati'],
        ['Sevilla &middot; Smiles for Miles', 'Named on your page', 'Both Makati'],
        ['SMILES by CERRA', 'Named on your page', 'Makati'],
        ['&ldquo;10 Best in Makati 2026&rdquo;', 'The same site', 'A ranked list, not your clinic page'],
        ['Booking', 'Nine buttons', 'All nine land on /contact-us/'],
      ],
      good: [
        ['This page', 'Affinity only', 'No competitor named on it'],
        ['Your address', 'Stated once', '2F Plaza One Hundred'],
        ['Your numbers', 'Both of them', 'Landline and mobile, one tap'],
        ['Your hours', 'Mon&ndash;Sun, 9&ndash;18', 'Said plainly'],
        ['Booking', 'One route', 'Stated, not buried in a form'],
        ['Ranking', 'Your own name', 'Not an aggregator&rsquo;s list'],
      ],
      url: 'clinicfinderph.com/clinic/<b>affinity-dental-clinics-makati</b> prints five competing Makati clinics beneath your own listing &middot; checked 2026-09-08',
      urlNote:
        'The nine &ldquo;Book an Appointment&rdquo; buttons on your site all land in the same place: /contact-us/, a WPForms request where the patient picks a date and a time with no view of what is actually free. Every one of those requests then needs a human to confirm it or move it &mdash; across seven branches, on seven mobiles.',
    },
    offer: {
      h2: 'Nine booking buttons, one form, no calendar.',
      p: 'A patient who picks Tuesday at 3pm has not booked anything. They have sent a request, and somebody at Affinity has to answer it. Multiply that by seven branches.',
      cards: [
        ['cal', 'Nine buttons, one destination', 'Every &ldquo;Book an Appointment&rdquo; on your site goes to /contact-us/. The patient never sees which slots are open before they choose one.'],
        ['users', 'Seven branches', 'Each confirming or moving requests by hand, on its own phone. Nothing on the public site shows a patient which branch has room.'],
        ['pin', 'Legaspi Village, Makati', '2F Plaza One Hundred, 100 V.A. Rufino Street &mdash; the address this page is built around.'],
      ],
    },
    fixes: {
      h2: 'What one settled page fixes.',
      items: [
        'A patient reading about Affinity stops being offered five Makati alternatives on the same screen.',
        'Both your numbers sit one tap away instead of behind a form.',
        'Your seven-day opening is stated where a working patient sees it before they choose.',
        'You rank on your own name rather than on a directory&rsquo;s &ldquo;10 Best&rdquo; list you do not control.',
      ],
    },
    csBar:
      'ClinicFinderPH prints <b>five rival Makati clinics</b> under your own listing, and all nine of your booking buttons go to one form. Shall we start with the first one?',
    placeholders: [
      ['Consultation fee and prices &mdash; to be confirmed', 'Nothing about your fees is published, so nothing is shown. Tell us the consult fee and the treatments you want led with, and they go on the page as you give them.'],
      ['The other six branches &mdash; to be confirmed', 'This page is built for Legaspi Village because that is the address on record. The other six are yours to name; we have not guessed at them.'],
      ['Which slots are actually free &mdash; not published', 'Your booking form asks the patient to pick a date and a time with no view of availability. This page does not show open slots either, because none are published anywhere.'],
    ],
  },

  {
    slug: 'ora-dental-makati',
    name: 'Ora Dental',
    sub: 'Centuria Medical, Makati',
    locale: 'Centuria Medical, Makati',
    logoRound: false,
    // logo-1 is the ORA DENTAL wordmark. logo-2-og-image.png is deliberately NOT
    // used: vision-checked 2026-09-08 it is a stock photograph of a smiling
    // patient, not a mark, and its "matching" hexes are skin tones.
    logoPick: 'logo-1-apple-touch-icon.png',
    title: 'Ora Dental &mdash; Unit 1408, Centuria Medical Makati, Kalayaan Avenue, Makati',
    metaDesc:
      'Ora Dental, Unit 1408, Centuria Medical Makati, Kalayaan Avenue corner Salamanca Street, Makati. Call 0966 013 5000, 10:00 to 19:00.',
    eyebrow: 'A booking page &middot; with nothing on it to book with',
    h1: 'Your &ldquo;Book Now&rdquo; page has <em>no form on it</em>.',
    lead: 'theoradental.com/book-now is headed &ldquo;Book Your Appointment&rdquo; and contains zero form fields &mdash; no form, no inputs, nothing to fill in. On a 504KB website the only way to book is to ring 0966 013 5000 between 10AM and 7PM. That same page gives two different addresses for you, and your building publishes a phone number your own site never shows.',
    idcard: [
      ['pin', 'Address', 'Unit 1408, Centuria Medical Makati, Kalayaan Avenue corner Salamanca Street, Makati', 'Your own /book-now page prints this two different ways. Both are shown further down.'],
      ['phone', 'Telephone', '<a href="tel:+639660135000">0966 013 5000</a>', 'The number your website publishes.'],
      ['phone', 'Also published', '<a href="tel:+63288097493">8809 7493</a>', 'Published by centuriamedical.com.ph, your building. Your own site never shows it.'],
      ['mail', 'Email', '<a href="mailto:info@theoradental.com">info@theoradental.com</a>'],
      ['clock', 'Hours', '10:00 &ndash; 19:00', 'Sunday is &ldquo;by appointment&rdquo; &mdash; with no form and no published Sunday contact to make one.'],
      ['globe', 'Website', 'theoradental.com', 'Registered 2024-07-17, active to 2027-07-17.'],
    ],
    btns: [
      ['tel:+639660135000', 'Call 0966 013 5000', 'primary'],
      ['mailto:info@theoradental.com', 'Email Ora Dental', 'outline'],
    ],
    problem: {
      h2: 'The only way in is a phone call, inside nine hours.',
      p: 'A 504KB site, a booking page that asks for nothing, and fifteen hours of every day with no route to you at all.',
      bad: [
        ['/book-now', '&ldquo;Book Your Appointment&rdquo;', '0 &lt;form&gt;, 0 &lt;input&gt;'],
        ['Only booking route', 'Ring 0966 013 5000', '10:00&ndash;19:00 only'],
        ['After 19:00', 'Nothing', 'No form, no callback request'],
        ['Sunday', '&ldquo;By appointment&rdquo;', 'Nobody to ask &mdash; there is no form'],
        ['Your address', 'Two versions', 'Header and footer disagree'],
        ['Your number', 'Two versions', 'Yours, and your building&rsquo;s'],
      ],
      good: [
        ['This page', 'One address', 'Stated once, with the unit number'],
        ['Both numbers', 'Shown together', 'Yours and the one Centuria publishes'],
        ['Hours', '10:00&ndash;19:00', 'Said plainly, with the Sunday gap named'],
        ['Contact', 'One tap', 'Call or email, straight from the search result'],
        ['What is unpublished', 'Labelled as unpublished', 'Not invented'],
      ],
      url: 'theoradental.com/<b>book-now</b> is headed &ldquo;Book Your Appointment&rdquo; and contains <b>0 &lt;form&gt; and 0 &lt;input&gt;</b> elements &middot; checked 2026-09-08',
      urlNote:
        'That is the whole of it: the page that invites the booking has nothing on it to book with. Every appointment therefore arrives by telephone, inside a nine-hour window, and anything that lands outside that window is not recorded anywhere at all.',
    },
    hoursConflict: {
      eyebrow: 'Two published versions',
      h2: 'Your own page gives two addresses. Neither is marked correct here.',
      p: 'These are the two published sets, side by side. We have not picked a winner between them, because only you know which is right.',
      cols: ['One published source', 'A second published source'],
      rows: [
        ['Address', '1408 Kalayaan Ave, Poblacion', 'Kalayaan Ave., cor. Salamanca'],
        ['Telephone', '0966 013 5000', '8809 7493'],
      ],
      gapRows: [
        ['Sunday hours', '&ldquo;By appointment&rdquo;', 'No form, no published contact'],
      ],
      note:
        'The left column is the header of your own /book-now page, and the number your site publishes. The right column is the footer of that same page, and the number your building centuriamedical.com.ph publishes. Both columns are yours; they simply do not match. A patient checking two sources before travelling to Centuria Medical gets two answers.',
    },
    offer: {
      h2: 'Fifteen hours a day with no way to reach you.',
      p: 'Your website is open all night. Your only booking route is not.',
      cards: [
        ['clock', '10:00 to 19:00, by telephone', 'The single booking path on the site. Outside that window an enquiry has nowhere to land, so it either waits or it goes elsewhere.'],
        ['pin', 'Unit 1408, Centuria Medical Makati', 'Kalayaan Avenue corner Salamanca Street. One address, with the unit number, so a patient finds the right floor.'],
        ['shield', 'Sunday, by appointment', 'Your site says it. It does not say who to ask, and there is no form to ask with.'],
      ],
    },
    fixes: {
      h2: 'What one settled page fixes.',
      items: [
        'A patient reading &ldquo;Book Your Appointment&rdquo; is given something they can actually act on.',
        'Your address appears once, with the unit number, instead of two ways on one page.',
        'The number Centuria publishes and the number you publish sit next to each other, so nobody has to wonder which is real.',
        'The Sunday &ldquo;by appointment&rdquo; line stops being a dead end.',
      ],
    },
    csBar:
      'Your <b>/book-now</b> page has no form on it, and your own page gives <b>two different addresses</b>. Shall we settle both?',
    placeholders: [
      ['Which address is correct &mdash; to be confirmed', 'Your /book-now page says &ldquo;1408 Kalayaan Ave, Poblacion&rdquo; in the header and &ldquo;Kalayaan Ave., cor. Salamanca&rdquo; in the footer. This page shows both and declares neither, because only you know.'],
      ['Sunday hours &mdash; not published', 'Your site says Sunday is by appointment, but publishes no Sunday hour and no way to request one. Given that, it is the single most valuable line you could add.'],
      ['Treatments and prices &mdash; to be confirmed', 'No veneer, implant or consultation fee is published anywhere, so none is shown. Nothing is shown rather than a figure a patient might arrive expecting.'],
    ],
  },

  {
    slug: 'metro-dental-makati',
    name: 'MetroDental',
    sub: 'Greenbelt 5, Makati',
    locale: 'Greenbelt 5, Makati',
    logoRound: false,
    // logo-2 is metrodental-logo.png, their real tooth-outline mark. Vision-checked
    // 2026-09-08: captured #00b8ff and #00d0e7 both sit inside it (53.6 / 47.9).
    logoPick: 'logo-2-favicon.png',
    title: 'MetroDental Greenbelt 5 &mdash; Level 4, Greenbelt 5, Paseo de Roxas, Makati',
    metaDesc:
      'MetroDental Greenbelt 5, Level 4, Greenbelt 5, Paseo de Roxas corner Legaspi Street, Makati. Call (02) 8712-1348 or 0917 105-8775.',
    eyebrow: 'Every share of your site &middot; previews as vercel.app',
    h1: 'Your website tells Facebook it lives at <em>somebody else&rsquo;s address</em>.',
    lead: 'The HTML of metrodental.com.ph declares its canonical share URL as https://metrodental.vercel.app/. That host is live and serves the identical 2,702-byte page, so every time a patient shares your site the preview carries a developer host instead of your own domain. The page underneath is still a bare React shell carrying the comment &ldquo;Google Tag Manager &mdash; DISABLED during development&rdquo;.',
    idcard: [
      ['pin', 'Address', 'Level 4, Greenbelt 5, Paseo de Roxas corner Legaspi Street, Makati'],
      ['phone', 'Landline', '<a href="tel:+63287121348">(02) 8712-1348</a>'],
      ['phone', 'Mobile', '<a href="tel:+639171058775">0917 105-8775</a>'],
      ['mail', 'Email', '<a href="mailto:info@metrodental.com.ph">info@metrodental.com.ph</a>', 'Published on your own site.'],
      ['globe', 'Website', 'metrodental.com.ph', 'Your domain. The one your own pages tell Facebook to share is metrodental.vercel.app.'],
    ],
    btns: [
      ['tel:+63287121348', 'Call (02) 8712-1348', 'primary'],
      ['mailto:info@metrodental.com.ph', 'Email MetroDental', 'outline'],
    ],
    problem: {
      h2: 'Two live URLs. One of them is not yours.',
      p: 'metrodental.com.ph and metrodental.vercel.app serve the same 2,702-byte page. Your own HTML nominates the second one as the address to share.',
      bad: [
        ['og:url', 'metrodental.vercel.app', 'Declared by your own pages'],
        ['Both URLs', 'Live right now', 'The same 2,702-byte page'],
        ['Every share', 'Previews as vercel.app', 'Not the domain you pay for'],
        ['Served HTML', 'A bare React shell', 'Content arrives after, if it arrives'],
        ['In the source', '&ldquo;GTM &mdash; DISABLED during development&rdquo;', 'Still in the live page'],
        ['16 booking buttons', 'form.jotform.com', 'A third-party form, in a new tab'],
        ['Weekend picks', '&ldquo;Front desk will call&rdquo;', 'A callback obligation, not a booking'],
      ],
      good: [
        ['One URL', 'metrodental.com.ph', 'The one you pay for'],
        ['Shares', 'Preview as your domain', 'Your name in the link'],
        ['This page', 'Real HTML', 'Readable before any script runs'],
        ['Your address', 'Level 4, Greenbelt 5', 'Once, with the floor'],
        ['Your numbers', 'Both of them', 'Landline and mobile, one tap'],
        ['What is unpublished', 'Labelled as unpublished', 'Not invented'],
      ],
      url: 'metrodental.com.ph declares <b>og:url = https://metrodental.vercel.app/</b>, and that host is live with the identical page &middot; checked 2026-09-08',
      urlNote:
        'This matters more than it looks. A patient who shares your clinic in a group chat sends a link branded vercel.app. Anyone checking whether that is really MetroDental has nothing to go on, and the domain you paid for gets none of the credit for the visit.',
    },
    offer: {
      h2: 'Sixteen booking buttons that open somebody else&rsquo;s form.',
      p: 'All sixteen &ldquo;Book an Appointment&rdquo; buttons open form.jotform.com in a new tab. The form itself warns that the front desk will ring to move weekend picks &mdash; so a weekend booking is a callback obligation, not a booking.',
      cards: [
        ['cal', 'Sixteen buttons, one Jotform', 'Every booking button leaves your site for form.jotform.com in a new tab. The patient finishes on a page that is not yours.'],
        ['phone', 'Weekend picks get a call back', 'The form says so itself. Somebody at the front desk has to ring and move them, one at a time.'],
        ['pin', 'Level 4, Greenbelt 5', 'Paseo de Roxas corner Legaspi Street &mdash; the branch this page is built around.'],
      ],
    },
    fixes: {
      h2: 'What one settled page fixes.',
      items: [
        'Shares of your clinic carry metrodental.com.ph instead of a developer host.',
        'The page a patient lands on is real HTML, so it reads before any script has run.',
        'The &ldquo;disabled during development&rdquo; comment stops being part of what you ship to patients.',
        'Your address, landline and mobile sit on the page itself rather than behind a third-party form.',
      ],
    },
    csBar:
      'Your own pages tell Facebook to share <b>metrodental.vercel.app</b>, and all 16 booking buttons leave for Jotform. Shall we bring both home?',
    placeholders: [
      ['Your other three branches &mdash; to be confirmed', 'This page is built for Greenbelt 5 because that is the branch on record. The other three are yours to name; we have not guessed at them.'],
      ['Opening hours &mdash; not published', 'No opening hours appear on the page your domain serves, so none are shown here. It is the first thing a patient checks.'],
      ['Treatments and prices &mdash; to be confirmed', 'No consultation or HMO fee is published, so none is shown rather than a figure a patient might arrive expecting.'],
    ],
  },
]

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

function render(lead, brand) {
  const hexes = brand.colors.brand.map((c) => c.hex)
  const P = hexes[0]
  const S = hexes[1] || hexes[0]
  const A = hexes[2] || hexes[1] || hexes[0]

  const logoFile =
    lead.logoPick || brand.logoPick || (brand.logoFiles && brand.logoFiles[0] && brand.logoFiles[0].file) || brand.logo.file

  // Captured families first so the page genuinely asks for the prospect's own
  // typeface; the rest is the system stack. Self-hosted-only means no webfont
  // is fetched from a third party, so nothing here is a hotlink.
  const GENERIC = /^(arial|helvetica|verdana|tahoma|georgia|times|times new roman|courier|courier new|segoe ui|roboto)$/i
  const CSSPROP = /^(z-index|position|width|height|top|left|right|bottom|margin|padding|display|color|background|border|opacity|overflow|float|clear|content|transform|transition|flex|grid|gap|order|cursor|visibility|white-space|line-height|letter-spacing|text-align|vertical-align)$/i
  const fams = [...new Set((brand.fonts || [])
    .map((f) => String(f).split(':')[0].replace(/!important/gi, '').trim())
    .filter((f) => f.length >= 3 && !GENERIC.test(f) && !CSSPROP.test(f)))]
  const stack = [...fams.map((f) => `'${f}'`), 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'].join(',')

  const shortName = lead.shortName || lead.name
  const money = lead.intl ? '' : ''

  const idRows = lead.idcard
    .map(
      ([ico, k, v, note]) => `        <div class="idcard__row">
          ${svg(ico, 'idcard__ico')}
          <div>
            <p class="idcard__k">${k}</p>
            <p class="idcard__v">${v}${note ? `<span class="idcard__note">${note}</span>` : ''}</p>
          </div>
        </div>`
    )
    .join('\n')

  const btns = lead.btns
    .map(
      ([href, label, kind]) =>
        `        <a class="btn btn--${kind === 'primary' ? 'p' : 'outline'}" href="${href}"${
          href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''
        }>${label}</a>`
    )
    .join('\n')

  const vsRow = (rows) =>
    rows.map(([k, v, n]) => `          <dt>${k}</dt>\n          <dd>${v}${n ? `<span class="vs__n">${n}</span>` : ''}</dd>`).join('\n')

  const cards = lead.offer.cards
    .map(
      ([ico, h, p]) => `      <div class="card">
        <div class="card__ico">${svg(ico)}</div>
        <h3>${h}</h3>
        <p>${p}</p>
      </div>`
    )
    .join('\n')

  const chips = lead.offer.chips
    ? `      <div class="pricerow">\n${lead.offer.chips
        .map((c) => `        <span class="chip">${c}</span>`)
        .join('\n')}\n      </div>\n      <p class="chipnote">${lead.offer.chipNote}</p>`
    : ''

  const fixes = lead.fixes.items
    .map(
      (t, i) => `      <div class="why__item"><div class="why__num">${i + 1}</div><p>${t}</p></div>`
    )
    .join('\n')

  const notes = lead.placeholders
    .map(([b, p]) => `        <p class="note"><b>${b}</b>${p}</p>`)
    .join('\n')

  const hoursBlock = lead.hoursConflict
    ? `  <section class="section section--tintB">
    <div class="wrap">
      <p class="eyebrow">${lead.hoursConflict.eyebrow || 'Opening hours'}</p>
      <div class="rule"></div>
      <h2>${lead.hoursConflict.h2}</h2>
      <p class="lede">${lead.hoursConflict.p}</p>
      <div class="conflict">
        <div class="conflict__head">
          <span>Day</span><span>${lead.hoursConflict.cols[0]}</span><span>${lead.hoursConflict.cols[1]}</span>
        </div>
${lead.hoursConflict.rows
  .map(
    ([d, a, b]) =>
      `        <div class="conflict__row"><span>${d}</span><span class="c-a">${a}</span><span class="c-b">${b}</span></div>`
  )
  .join('\n')}
${(lead.hoursConflict.gapRows || [['Friday', 'Not published', 'Not published'], ['Saturday', 'Not published', 'Not published'], ['Sunday', 'Not published', 'Not published']])
  .map(([d, a, b]) => `        <div class="conflict__row conflict__row--gap"><span>${d}</span><span class="c-x">${a}</span><span class="c-x">${b}</span></div>`)
  .join('\n')}
      </div>
      <p class="note"><b>Neither set is presented as correct</b>${lead.hoursConflict.note}</p>
    </div>
  </section>

`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${lead.title}</title>
<meta name="description" content="${esc(lead.metaDesc)}">
<meta name="robots" content="noindex, nofollow">
<style>
/* Palette below is read straight out of ${lead.slug}/brand/brand.json at build
   time (colors.source: "${brand.colors.source}") - every hex is one that appears in the
   business's own captured mark, ${logoFile}. Nothing here was chosen for looks. */
:root{
  --p:${P};
  --s:${S};
  --a:${A};
  --p-deep:${shade(P, 0.24)};
  --s-deep:${shade(S, 0.24)};
  --p-soft:${mix(P, 0.9)};
  --s-soft:${mix(S, 0.9)};
  --a-soft:${mix(A, 0.88)};
  --on-p:${on(P)};
  --on-s:${on(S)};
  --ink:#16181d;
  --ink-2:#585d68;
  --bone:${mix(P, 0.965)};
  --line:${mix(P, 0.84)};
  --shadow-sm:0 1px 2px rgba(16,18,22,.07),0 3px 10px rgba(16,18,22,.06);
  --shadow-md:0 12px 30px rgba(16,18,22,.15);
  --r-sm:8px;--r-md:14px;--r-lg:22px;--r-pill:999px;
  --display:${stack};
  --body:${stack};
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;font-family:var(--body);color:var(--ink);background:#fff;font-size:16px;line-height:1.62;padding-bottom:200px;overflow-x:hidden}
img,svg{max-width:100%;display:block}
h1,h2,h3{font-family:var(--display);font-weight:800;line-height:1.16;margin:0 0 12px;letter-spacing:-.01em}
h1{font-size:34px}h2{font-size:28px}h3{font-size:19px}
p{margin:0 0 16px}
a{color:var(--p-deep)}
.wrap{width:100%;max-width:1040px;margin:0 auto;padding:0 20px}
.eyebrow{font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:var(--p-deep);margin:0 0 10px}
.rule{width:64px;height:3px;background:var(--s);margin:0 0 18px}
.lede{font-size:17px;color:var(--ink-2);max-width:62ch}
.section{padding:56px 0}
.section--bone{background:var(--bone)}
.section--tintA{background:var(--p-soft)}
.section--tintB{background:var(--s-soft)}
.section--dark{background:var(--ink);color:#dfe2ea}
.section--dark h2,.section--dark h3{color:#fff}
:focus-visible{outline:3px solid var(--p);outline-offset:3px;border-radius:4px}

.header{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.96);backdrop-filter:saturate(150%) blur(8px);border-bottom:1px solid var(--line);box-shadow:0 1px 0 ${rgba(P, 0.35)}}
.header__in{display:flex;align-items:center;gap:12px;min-height:66px;padding:8px 20px;max-width:1040px;margin:0 auto}
.brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--ink);min-height:44px}
.brand-logo-img{width:50px;height:50px;flex:0 0 50px;object-fit:contain;background:#fff;${
    lead.logoRound ? 'border-radius:50%;border:2px solid var(--p);' : 'border-radius:6px;padding:2px;'
  }}
.brand__txt{display:flex;flex-direction:column;line-height:1.16}
.brand__name{font-family:var(--display);font-weight:800;font-size:16.5px}
.brand__sub{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--ink-2);font-weight:700}
.header__cta{margin-left:auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:12px 19px;border-radius:var(--r-sm);font-family:var(--body);font-weight:700;font-size:15px;text-decoration:none;border:2px solid transparent;cursor:pointer;transition:background-color .18s,color .18s,border-color .18s,transform .18s,box-shadow .18s}
.btn--p{background:var(--p);color:var(--on-p);box-shadow:var(--shadow-sm)}
.btn--p:hover{background:var(--p-deep);color:#fff;transform:translateY(-2px);box-shadow:var(--shadow-md)}
.btn--outline{background:#fff;color:var(--ink);border-color:var(--ink)}
.btn--outline:hover{background:var(--bone);transform:translateY(-2px);box-shadow:var(--shadow-md)}
.btn--sm{font-size:14px;padding:9px 15px;min-height:44px}

.hero{position:relative;background:linear-gradient(180deg,var(--s-soft) 0%,#fff 74%);overflow:hidden;border-bottom:1px solid var(--line)}
.hero__in{padding:34px 20px 46px;max-width:1040px;margin:0 auto;position:relative;z-index:1}
.hero h1{font-size:clamp(29px,6.6vw,45px);margin-bottom:14px}
.hero h1 em{font-style:normal;color:var(--p-deep)}
.hero__lead{font-size:17px;color:var(--ink-2);max-width:56ch;margin-bottom:22px}
.pill{display:inline-flex;align-items:center;gap:8px;background:var(--p);color:var(--on-p);font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding:7px 15px;border-radius:var(--r-pill);margin-bottom:15px}
.idcard{background:#fff;border:1px solid var(--line);border-top:4px solid var(--p);border-radius:var(--r-md);padding:20px;box-shadow:var(--shadow-md);margin-bottom:22px}
.idcard__row{display:flex;gap:13px;padding:12px 0;align-items:flex-start;border-top:1px solid var(--line)}
.idcard__row:first-child{border-top:0;padding-top:0}
.idcard__ico{flex:0 0 22px;width:22px;height:22px;color:var(--p-deep);margin-top:3px}
.idcard__k{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--ink-2);margin:0 0 3px}
.idcard__v{font-size:15.5px;font-weight:500;margin:0}
.idcard__v a{color:var(--ink);text-decoration:none;border-bottom:2px solid var(--p)}
.idcard__v a:hover{color:var(--p-deep)}
.idcard__note{display:block;font-size:12.5px;color:var(--ink-2);font-weight:600;margin-top:5px}
.hero__btns{display:flex;flex-direction:column;gap:10px}
.hero__art{margin-top:34px}
.mark{width:100%;max-width:340px;margin:0 auto;background:#fff;${
    lead.logoRound
      ? 'border-radius:50%;border:5px solid var(--s);box-shadow:0 18px 40px rgba(16,18,22,.22)'
      : 'border-radius:var(--r-md);border:1px solid var(--line);padding:18px;box-shadow:0 18px 40px rgba(16,18,22,.16)'
  }}

.vs{display:grid;gap:16px;grid-template-columns:1fr;margin-top:24px}
.vs__col{border-radius:var(--r-md);padding:22px;border:1px solid var(--line);background:#fff}
.vs__col--good{border-color:var(--p);border-width:2px;box-shadow:var(--shadow-md)}
.vs__tag{display:inline-flex;align-items:center;gap:7px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;padding:5px 11px;border-radius:var(--r-pill);margin-bottom:13px}
.vs__tag--bad{background:var(--bone);color:var(--ink-2);border:1px solid var(--line)}
.vs__tag--good{background:var(--p);color:var(--on-p)}
.vs dl{margin:0;font-size:14.6px}
.vs dt{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2);font-weight:700;margin-top:13px}
.vs dt:first-child{margin-top:0}
.vs dd{margin:2px 0 0;font-weight:700}
.vs__n{display:block;font-weight:600;font-size:12.5px;color:var(--ink-2);margin-top:2px}
.vs__col--bad dd{color:var(--ink)}
.vs__col--bad dd::after{content:" \\2717";color:#b3243c;font-weight:800}
.vs__col--good dd::after{content:" \\2713";color:#1c6b3a;font-weight:800}
.urlbox{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;background:var(--ink);color:${mix(S, 0.62)};padding:12px 14px;border-radius:var(--r-sm);word-break:break-word;margin:22px 0 0;line-height:1.7}
.urlbox b{color:${mix(A, 0.5)}}
.urlnote{font-size:14.5px;color:var(--ink-2);margin:14px 0 0;max-width:70ch}

.grid{display:grid;gap:16px;grid-template-columns:1fr;margin-top:24px}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--r-md);padding:22px;box-shadow:var(--shadow-sm);transition:transform .2s,box-shadow .2s,border-color .2s}
.card:hover{transform:translateY(-4px);box-shadow:var(--shadow-md);border-color:var(--p)}
.card__ico{width:46px;height:46px;border-radius:50%;background:var(--p-soft);color:var(--p-deep);display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.card__ico svg{width:24px;height:24px}
.card p{font-size:15px;color:var(--ink-2);margin:0}

.pricerow{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 0}
.chip{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--line);border-left:4px solid var(--a);border-radius:var(--r-sm);padding:10px 14px;font-size:14.5px;font-weight:600;box-shadow:var(--shadow-sm)}
.chip b{color:var(--p-deep)}
.chipnote{font-size:14.5px;color:var(--ink-2);margin:14px 0 0;max-width:70ch}

.why{display:grid;gap:20px;grid-template-columns:1fr;margin-top:24px}
.why__item{display:flex;gap:15px;align-items:flex-start}
.why__num{flex:0 0 42px;width:42px;height:42px;border-radius:50%;background:var(--p);color:var(--on-p);font-family:var(--display);font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center}
.why__item p{font-size:15px;color:var(--ink-2);margin:0}

.conflict{background:#fff;border:1px solid var(--line);border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-sm);margin-top:24px}
.conflict__head,.conflict__row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:12px 16px;font-size:14.5px;align-items:center}
.conflict__head{background:var(--ink);color:#fff;font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;font-weight:700}
.conflict__row{border-top:1px solid var(--line)}
.conflict__row span:first-child{font-weight:700}
.c-a{color:var(--p-deep);font-weight:700}
.c-b{color:var(--s-deep);font-weight:700}
.c-x{color:var(--ink-2);font-weight:600;font-style:italic}
.conflict__row--gap{background:var(--bone)}

.contact{display:grid;gap:24px;grid-template-columns:1fr;margin-top:24px}
.hours{background:#fff;border:1px solid var(--line);border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-sm)}
.hours__row{display:flex;justify-content:space-between;gap:14px;padding:13px 18px;border-top:1px solid var(--line);font-size:15px}
.hours__row:first-child{border-top:0}
.hours__row span:last-child{color:var(--ink-2);font-weight:600;text-align:right}
.hours__row--open{background:var(--p-soft)}
.hours__row--open span:last-child{color:var(--p-deep);font-weight:700}
.note{background:var(--bone);border-left:4px solid var(--a);border-radius:0 var(--r-sm) var(--r-sm) 0;padding:17px;font-size:14.5px;color:var(--ink-2);margin:0}
.note b{display:block;color:var(--ink);margin-bottom:5px;font-size:15px}
.note + .note{margin-top:14px}
.reach{background:var(--ink);color:#fff;border-radius:var(--r-md);padding:22px;box-shadow:var(--shadow-md);display:flex;flex-direction:column;gap:8px;margin-top:14px}
.reach h3{color:#fff}
.reach p{margin:0;font-size:15px;color:#c9ccd4}
.reach a{color:${mix(S, 0.5)};font-weight:700}

.footer{background:#fff;border-top:4px solid var(--p);color:var(--ink-2);padding:44px 0 34px}
.footer h3{color:var(--ink);font-size:16px;margin-bottom:9px}
.footer__grid{display:grid;gap:26px;grid-template-columns:1fr}
.footer__p{font-size:14.5px;margin:0;line-height:1.75}
.footer a{color:var(--p-deep);text-decoration:none}
.footer a:hover{text-decoration:underline}
.footer__credit{border-top:1px solid var(--line);margin-top:28px;padding-top:18px;display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:space-between;font-size:13px}

.cs-bar{position:fixed;left:0;right:0;bottom:0;z-index:200;background:rgba(16,18,22,.97);backdrop-filter:saturate(150%) blur(10px);border-top:3px solid var(--p);box-shadow:0 -8px 32px rgba(16,18,22,.38);color:#fff;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px))}
.cs-bar__in{max-width:1040px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 18px;text-align:center}
.cs-bar__eyebrow{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:${mix(S, 0.45)};margin:0 0 3px}
.cs-bar__line{font-size:15px;font-weight:600;line-height:1.35;margin:0;color:#fff}
.cs-bar__line b{color:${mix(A, 0.42)}}
.cs-bar__btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 23px;border-radius:var(--r-sm);background:var(--p);color:var(--on-p);font-weight:700;font-size:15px;text-decoration:none;white-space:nowrap;box-shadow:0 4px 18px ${rgba(P, 0.45)};animation:csPulse 2.4s ease-in-out infinite;transition:transform .18s,box-shadow .18s}
.cs-bar__btn:hover{transform:translateY(-2px);box-shadow:0 8px 26px ${rgba(P, 0.66)};animation-play-state:paused}
.cs-bar__btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
@keyframes csPulse{0%,100%{box-shadow:0 4px 18px ${rgba(P, 0.36)}}50%{box-shadow:0 4px 27px ${rgba(P, 0.68)}}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.01ms!important}}

@media (min-width:600px){
  .hero__btns{flex-direction:row;flex-wrap:wrap}
  .hero__btns .btn{flex:1 1 auto;min-width:200px}
  .grid{grid-template-columns:repeat(2,1fr)}
  .why{grid-template-columns:repeat(2,1fr)}
  .vs{grid-template-columns:repeat(2,1fr)}
}
@media (min-width:900px){
  .hero__in{display:grid;grid-template-columns:1.15fr .85fr;gap:40px;align-items:center;padding:52px 20px 62px}
  .hero__art{margin-top:0}
  .grid{grid-template-columns:repeat(3,1fr)}
  .contact{grid-template-columns:1.05fr .95fr}
  .footer__grid{grid-template-columns:1.3fr 1fr 1fr}
  .cs-bar__in{flex-wrap:nowrap;justify-content:space-between;text-align:left}
  .cs-bar__line{font-size:16.5px}
}
</style>
</head>
<body>

<header class="header">
  <div class="header__in">
    <a class="brand" href="#top">
      <img class="brand-logo-img" src="brand/${logoFile}" alt="${lead.name} logo" width="50" height="50">
      <span class="brand__txt">
        <span class="brand__name">${lead.name}</span>
        <span class="brand__sub">${lead.locale}</span>
      </span>
    </a>
    <a class="btn btn--p btn--sm header__cta" href="${lead.btns[0][0]}">${lead.btns[0][1].replace(/^Call /, 'Call ')}</a>
  </div>
</header>

<main id="top">

  <section class="hero">
    <div class="hero__in">
      <div>
        <p class="pill">${lead.eyebrow}</p>
        <h1>${lead.h1}</h1>
        <p class="hero__lead">${lead.lead}</p>
        <div class="idcard">
${idRows}
        </div>
        <div class="hero__btns">
${btns}
        </div>
      </div>
      <div class="hero__art">
        <img class="mark" src="brand/${logoFile}" alt="${lead.name} logo">
      </div>
    </div>
  </section>

  <section class="section section--bone">
    <div class="wrap">
      <p class="eyebrow">What is online right now</p>
      <div class="rule"></div>
      <h2>${lead.problem.h2}</h2>
      <p class="lede">${lead.problem.p}</p>
      <div class="vs">
        <div class="vs__col vs__col--bad">
          <span class="vs__tag vs__tag--bad">Today</span>
          <dl>
${vsRow(lead.problem.bad)}
          </dl>
        </div>
        <div class="vs__col vs__col--good">
          <span class="vs__tag vs__tag--good">This page</span>
          <dl>
${vsRow(lead.problem.good)}
          </dl>
        </div>
      </div>
      <p class="urlbox">${lead.problem.url}</p>
      <p class="urlnote">${lead.problem.urlNote}</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <p class="eyebrow">${shortName}</p>
      <div class="rule"></div>
      <h2>${lead.offer.h2}</h2>
      <p class="lede">${lead.offer.p}</p>
      <div class="grid">
${cards}
      </div>
${chips}
    </div>
  </section>

${hoursBlock}  <section class="section section--tintA">
    <div class="wrap">
      <p class="eyebrow">Day one</p>
      <div class="rule"></div>
      <h2>${lead.fixes.h2}</h2>
      <div class="why">
${fixes}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <p class="eyebrow">Reach ${shortName}</p>
      <div class="rule"></div>
      <h2>Everything a client needs, in one place.</h2>
      <p class="lede">Where a fact has not been published anywhere public, this page says so rather than guessing. Those gaps are the fastest thing to fix.</p>
      <div class="contact">
        <div>
${notes}
        </div>
        <div>
          <div class="reach">
            <h3>${lead.name}</h3>
            <p>${lead.idcard[0][2]}</p>
            <p>${lead.btns[0][1].replace('Call ', '')} &middot; <a href="${lead.btns[0][0]}">tap to call</a></p>
          </div>
        </div>
      </div>
    </div>
  </section>

</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <h3>${lead.name}</h3>
        <p class="footer__p">${lead.sub}<br>${lead.idcard[0][2]}</p>
      </div>
      <div>
        <h3>Reach us</h3>
        <p class="footer__p"><a href="${lead.btns[0][0]}">${lead.btns[0][1].replace('Call ', '')}</a></p>
      </div>
      <div>
        <h3>About this page</h3>
        <p class="footer__p">A live preview built by CloudSpring IT Solutions from ${shortName}&rsquo;s own public listings. Every detail on it comes from a published source; anything unpublished is labelled, not invented.</p>
      </div>
    </div>
    <div class="footer__credit">
      <span>&copy; 2026 ${lead.name} &middot; ${lead.locale}</span>
      <span>Preview by CloudSpring IT Solutions</span>
    </div>
  </div>
</footer>

<aside class="cs-bar" role="complementary" aria-label="CloudSpring IT Solutions preview notice">
  <div class="cs-bar__in">
    <div class="cs-bar__txt">
      <p class="cs-bar__eyebrow">Preview &middot; CloudSpring IT Solutions</p>
      <p class="cs-bar__line">${lead.csBar}</p>
    </div>
    <a class="cs-bar__btn" href="${BOOKING}" target="_blank" rel="noopener">Book a FREE Discovery Call &rarr;</a>
  </div>
</aside>

</body>
</html>
`
}

// ---------------------------------------------------------------------------

const ROOT = process.cwd()
for (const lead of LEADS) {
  const brand = JSON.parse(await readFile(join(ROOT, lead.slug, 'brand', 'brand.json'), 'utf8'))
  if (!brand.ready) {
    console.log(`SKIP  ${lead.slug} — brand.json ready=false (${brand.blockedBy})`)
    continue
  }
  const html = render(lead, brand)
  await writeFile(join(ROOT, lead.slug, 'index.html'), html)
  console.log(`built ${lead.slug.padEnd(30)} ${(html.length / 1024).toFixed(1)}KB`)
}
