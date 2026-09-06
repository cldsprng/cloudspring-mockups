#!/usr/bin/env node
// CLO-145 step 4 (2026-09-07) — builds the run's mockups.
//
// The palette and the logo filename are read out of <slug>/brand/brand.json at
// build time rather than copied into this file by hand. That is deliberate: it
// makes it structurally impossible to ship a page whose colours are not the
// captured ones, which is the failure verify-brand.mjs's ">=2 captured hexes"
// check exists to catch. If a hex is wrong, the fix is brand.json, not here.
//
// Every factual claim in LEADS below comes from the lead's Trello card
// (evidence gathered by steps 1-3 and dated 2026-09-07). Anything not
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
    slug: 'auffrance-catering-pasig',
    name: 'Auffrance Catering',
    // The descriptor is set in the ring of their own logo.
    sub: 'Private Dining &amp; Gourmet Delivery',
    locale: 'Pasig, Metro Manila',
    logoRound: true,
    title: 'Auffrance Catering &mdash; Private Dining &amp; Gourmet Delivery, Pasig',
    metaDesc:
      'Auffrance Catering, private dining and gourmet delivery in Pasig, Metro Manila. 7/F Padilla Building, Emerald Street, Pasig. Call +63 2 3 497 5190.',
    eyebrow: 'One name &middot; one address &middot; one working email',
    h1: 'Three directories list you. <em>None of them agree.</em>',
    lead: 'Yelp and Yellow Pages PH both send enquiries to a website and an email address that have never existed. This page is a single record that answers &mdash; the right name, the right address, and an inbox that receives.',
    idcard: [
      ['pin', 'Address', '7/F Padilla Building, Emerald Street, Pasig, Metro Manila'],
      ['phone', 'Telephone', '<a href="tel:+63234975190">+63 2 3 497 5190</a>', 'The number Auffrance publishes. Yellow Pages PH prints 497 5185.'],
      ['mail', 'Email', '<a href="mailto:Auffrancecatering@yahoo.com">Auffrancecatering@yahoo.com</a>', 'This one receives. info@auffrance.com does not exist.'],
      ['chat', 'Facebook', '<a href="https://www.facebook.com/auffrancegourmetmanila" target="_blank" rel="noopener">facebook.com/auffrancegourmetmanila</a>'],
    ],
    btns: [
      ['tel:+63234975190', 'Call +63 2 3 497 5190', 'primary'],
      ['mailto:Auffrancecatering@yahoo.com', 'Email the kitchen', 'outline'],
    ],
    problem: {
      h2: 'Every public record points somewhere different.',
      p: 'These are the four directories a Pasig client actually lands on when they search your name. Not one of them sends the enquiry to you.',
      bad: [
        ['Website', 'auffrance.com', 'Never registered'],
        ['Email', 'info@auffrance.com', 'Mail bounces'],
        ['Business name', '&quot;Donair Foods Asia Inc&quot;', 'Yellow Pages PH'],
        ['Address', 'F. Ortigas Jr. Ave', 'vs Emerald St on Yelp'],
        ['Telephone', '497 5185', 'vs your 497 5190'],
      ],
      good: [
        ['Website', 'This page', 'Answers'],
        ['Email', 'Auffrancecatering@yahoo.com', 'Receives'],
        ['Business name', 'Auffrance Catering', 'As on your own mark'],
        ['Address', '7/F Padilla Bldg, Emerald St', 'One address'],
        ['Telephone', '+63 2 3 497 5190', 'One number'],
      ],
      url: 'auffrance.com <b>&rarr; NXDOMAIN</b> &middot; Verisign RDAP <b>404 not registered</b> &middot; checked 2026-09-07',
      urlNote:
        'The domain both directories publish as your website has never been registered by anyone. It is still available &mdash; that is a decision for you and your registrar, not something we assume.',
    },
    offer: {
      h2: 'What Auffrance does.',
      p: 'Taken from your own mark and your Facebook page. Nothing here is invented.',
      cards: [
        ['users', 'Private dining', 'Plated service for private functions &mdash; the first half of the descriptor set into your own logo.'],
        ['cal', 'Gourmet delivery', 'The second half. Delivered service for clients who are not hosting at a venue.'],
        ['pin', 'Ortigas-centre based', 'Padilla Building on Emerald Street, inside the Ortigas business district.'],
      ],
    },
    fixes: {
      h2: 'Four things this page settles on day one.',
      items: [
        'A client who types the address printed on Yelp reaches a browser error. From here they reach you.',
        'Enquiries sent to info@auffrance.com have been reaching nobody. Every route on this page is one you already read.',
        'Yellow Pages PH files you as &quot;Donair Foods Asia Inc&quot;. This page says Auffrance Catering, once.',
        'Two addresses and two phone numbers become one of each, on a page you control.',
      ],
    },
    csBar:
      'Yelp and Yellow Pages PH both publish <b>info@auffrance.com</b> as your email. That domain has never been registered &mdash; every enquiry sent there reached nobody. Shall we fix the record?',
    placeholders: [
      ['Packages and rates &mdash; to be confirmed', 'Auffrance has not published prices anywhere public, so none are shown here. Tell us your package tiers and they go on the page as written.'],
      ['Kitchen hours &mdash; to be confirmed', 'No opening hours appear on your Facebook page or in any directory. We would rather leave this blank than invent a schedule a client might rely on.'],
    ],
  },

  {
    slug: 'villa-salud-catering-taguig',
    name: 'Villa Salud',
    sub: 'Events Place and Catering Services',
    locale: 'Lower Bicutan, Taguig',
    logoRound: true,
    title: 'Villa Salud &mdash; Events Place and Catering Services, Lower Bicutan, Taguig',
    metaDesc:
      'Villa Salud Events Place and Catering Services, 229 M. L. Quezon Street, Lower Bicutan, Taguig. Call 0906 223 6120 or Viber 0917 559 0131.',
    eyebrow: 'A venue, a caterer, and no address of your own',
    h1: 'Four numbers, no email, and <em>nowhere to send anyone</em>.',
    lead: 'Villa Salud is a function venue and a caterer in one. Every enquiry today has to become a phone call in office hours, because there is no page and no inbox behind the name. This is what one looks like.',
    idcard: [
      ['pin', 'Address', '229 M. L. Quezon Street, Lower Bicutan, Taguig'],
      ['phone', 'Mobile', '<a href="tel:+639062236120">0906 223 6120</a>'],
      ['chat', 'Viber', '<a href="tel:+639175590131">0917 559 0131</a>', 'The number your Facebook page gives for Viber.'],
      ['phone', 'Landline', '<a href="tel:+63288376801">8837 6801</a>'],
      ['chat', 'Facebook', '<a href="https://www.facebook.com/villasaludcatering" target="_blank" rel="noopener">facebook.com/villasaludcatering</a>'],
    ],
    btns: [
      ['tel:+639062236120', 'Call 0906 223 6120', 'primary'],
      ['tel:+639175590131', 'Viber 0917 559 0131', 'outline'],
    ],
    problem: {
      h2: 'There is no Villa Salud address on the internet.',
      p: 'We checked every form of the name, not just the obvious one. Nothing is registered, and the one lookup that appears to answer is a trap.',
      bad: [
        ['villasaludcatering.com', 'NXDOMAIN', 'Not registered'],
        ['villasaludcateringservices.com', 'NXDOMAIN', 'Not registered'],
        ['villasalud.com', 'Resolves', 'An unrelated Spanish host placeholder &mdash; not yours'],
        ['Any .ph variant', '45.79.222.138', 'Registry wildcard &mdash; answers for any invented name'],
        ['Email address', 'None published', 'Anywhere'],
      ],
      good: [
        ['A page that answers', 'This one', 'Live now'],
        ['Address', '229 M. L. Quezon St', 'On the page'],
        ['All four numbers', 'In one place', 'Tap to call'],
        ['Viber', 'One tap', 'From the phone they searched on'],
        ['Enquiries', 'Reach you', 'Not a directory'],
      ],
      url: 'villasaludcatering.com <b>&rarr; NXDOMAIN</b> &middot; .ph lookups hit the registry wildcard <b>45.79.222.138</b> &middot; checked 2026-09-07',
      urlNote:
        'The .ph wildcard is worth knowing about: it answers for any .ph name anyone invents, so a &quot;working&quot; .ph lookup proves nothing about what you own. You own none of these.',
    },
    offer: {
      h2: 'A venue and a kitchen, under one name.',
      p: 'From your Facebook page and your own mark. The specifics below are yours to fill in.',
      cards: [
        ['pin', 'Events place', 'A function venue on M. L. Quezon Street in Lower Bicutan &mdash; the first half of the name set into your logo.'],
        ['users', 'Catering services', 'The second half. Catering for functions held at the venue or elsewhere.'],
        ['chat', 'Booked by phone and Viber', 'Four numbers today. This page puts every one of them a single tap away.'],
      ],
    },
    fixes: {
      h2: 'What changes the day this is live.',
      items: [
        'A Saturday-evening enquiry has somewhere to land instead of waiting for office hours.',
        'The four numbers stop being scattered across Facebook and directories and sit in one place.',
        'Someone comparing venues can see your address and reach you without opening Messenger.',
        'You stop being the venue that has no listing, in a search where every competitor has one.',
      ],
    },
    csBar:
      'A venue and a caterer with four phone numbers, no email, and no page. Every enquiry has to become a call in office hours. Shall we give you somewhere to send them?',
    placeholders: [
      ['Capacity &mdash; to be confirmed', 'How many the function room seats is not published anywhere, and it is the first thing anyone booking a venue asks. Tell us the number and it goes at the top of this page.'],
      ['Packages and rates &mdash; to be confirmed', 'No rates appear on your Facebook page, so none are shown here rather than a guess a client might hold you to.'],
      ['Opening hours &mdash; to be confirmed', 'Not published anywhere we could find.'],
    ],
  },

  {
    slug: 'romualdos-catering-davao',
    name: "Romualdo's Specialties &amp; Catering Services",
    shortName: "Romualdo's",
    sub: 'Specialties &amp; Catering Services',
    locale: 'Matina, Davao City',
    logoRound: false,
    title: "Romualdo's Specialties &amp; Catering Services &mdash; Juna Subdivision, Matina, Davao City",
    metaDesc:
      "Romualdo's Specialties & Catering Services, 13 Juna Avenue, Juna Subdivision, Matina, Davao City. Buffet from PHP 499. Call +63 995 540 0308.",
    eyebrow: 'The domain is yours. The page is missing.',
    h1: 'You already own <em>romualdoscatering.com</em>. Nothing is on it.',
    lead: 'You pay for the domain, and you pay for Google Workspace mail on it &mdash; and you still publish a free Gmail address. Meanwhile your menu and your prices live on somebody else&rsquo;s blog. This page is built to sit on the domain you already have.',
    idcard: [
      ['pin', 'Address', '13 Juna Avenue, Juna Subdivision, Matina, Davao City'],
      ['phone', 'Mobile', '<a href="tel:+639955400308">+63 995 540 0308</a>'],
      ['mail', 'Email', '<a href="mailto:romualdoscatering@gmail.com">romualdoscatering@gmail.com</a>', 'You also hold mail on romualdoscatering.com &mdash; the MX records are live.'],
      ['chat', 'Facebook &amp; Instagram', '<a href="https://www.facebook.com/romualdoscatering" target="_blank" rel="noopener">romualdoscatering</a>'],
    ],
    btns: [
      ['tel:+639955400308', 'Call +63 995 540 0308', 'primary'],
      ['mailto:romualdoscatering@gmail.com', 'Email for a quote', 'outline'],
    ],
    problem: {
      h2: 'You are paying for an address that serves nothing.',
      p: 'This is not a lead who needs a domain. It is a lead who has one, renewed to 2027, with nothing behind it.',
      bad: [
        ['Domain', 'romualdoscatering.com', 'Registered 2024-04-04, paid to 2027, locked'],
        ['Nameservers', 'Google Domains', 'Yours, configured'],
        ['Mail', 'Google Workspace MX live', 'On the domain you own'],
        ['The apex', 'No A record', 'Nothing is served'],
        ['www', 'NXDOMAIN', 'Nothing is served'],
        ['Menu &amp; prices', 'davaofoodtrips.com', 'A third-party blog'],
      ],
      good: [
        ['Domain', 'romualdoscatering.com', 'Same one, now answering'],
        ['Mail', 'Unchanged', 'We touch nothing'],
        ['The apex', 'This page', 'Live'],
        ['www', 'This page', 'Live'],
        ['Menu &amp; prices', 'On your own domain', 'Not a blog&rsquo;s'],
        ['Enquiries', 'Yours', 'Not a referrer&rsquo;s'],
      ],
      url: 'romualdoscatering.com <b>&rarr; RDAP: registered 2024-04-04, expires 2027, clientTransferProhibited</b> &middot; apex <b>no A record</b> &middot; www <b>NXDOMAIN</b> &middot; checked 2026-09-07',
      urlNote:
        'Worth saying plainly: we would need you to confirm you control the registrar login before anyone promises a go-live date. The records say the domain is yours; only you can prove the account is.',
    },
    offer: {
      h2: 'Buffet, priced in the open.',
      p: 'These are your own posted buffet prices. They are public already &mdash; just not on your domain.',
      cards: [
        ['users', 'Breakfast buffet', 'Posted at PHP 499 per head.'],
        ['users', 'Lunch buffet', 'Posted at PHP 699 per head.'],
        ['users', 'Dinner buffet', 'Posted at PHP 799 per head.'],
      ],
      chips: [
        'Breakfast <b>PHP 499</b>',
        'Lunch <b>PHP 699</b>',
        'Dinner <b>PHP 799</b>',
      ],
      chipNote:
        'Per head, as published. A 30-head lunch function at PHP 699 is PHP 20,970 &mdash; which is the arithmetic that makes this page worth having.',
    },
    fixes: {
      h2: 'What lands the day this goes live.',
      items: [
        'The domain you have paid for since 2024 stops returning an error and starts returning your menu.',
        'Your prices sit on romualdoscatering.com instead of on davaofoodtrips.com, where the traffic is not yours.',
        'You can publish an address on your own domain instead of a free Gmail, on mail you already pay for.',
        'A Davao client comparing caterers finds your page rather than a food blog&rsquo;s summary of it.',
      ],
    },
    csBar:
      'You pay for <b>romualdoscatering.com</b> and for Google Workspace mail on it, and still publish a Gmail. The domain serves nothing. Shall we put this page on it?',
    placeholders: [
      ['Event packages &mdash; to be confirmed', 'The per-head buffet prices above are your own published figures. Packages for weddings, debuts and corporate functions are not published anywhere, so they are left blank rather than guessed.'],
      ['Service hours and lead time &mdash; to be confirmed', 'How far ahead you need an order is the second question every client asks. Tell us and it goes on the page.'],
    ],
  },

  {
    slug: 'oana-dental-qc',
    name: 'Oana Dental Specialist',
    sub: 'Sta. Mesa Heights, Quezon City',
    locale: 'Sta. Mesa Heights, Quezon City',
    logoRound: true,
    title: 'Oana Dental Specialist &mdash; 143 Cordillera Street, Sta. Mesa Heights, Quezon City',
    metaDesc:
      'Oana Dental Specialist, 143 Cordillera Street, Sta. Mesa Heights, Quezon City. Open Tuesday to Sunday, 10:00 to 17:00. Call +63 945 870 8519.',
    eyebrow: 'Your name, your address, somebody else&rsquo;s page',
    h1: 'An aggregator ranks on <em>your name and your address</em>.',
    lead: 'dentists10.com runs a full page for &ldquo;Oana Dental Specialist, 143 Cordillera Street&rdquo; &mdash; your details, their page, their traffic. Meanwhile nine five-star reviews sit locked inside Facebook where a searcher never sees them. This page puts both back where they belong.',
    idcard: [
      ['pin', 'Address', '143 Cordillera Street, Sta. Mesa Heights, Quezon City'],
      ['phone', 'Mobile', '<a href="tel:+639458708519">+63 945 870 8519</a>'],
      ['mail', 'Email', '<a href="mailto:oanadentalspecialist@gmail.com">oanadentalspecialist@gmail.com</a>'],
      ['clock', 'Hours', 'Tuesday to Sunday, 10:00 &ndash; 17:00', 'Closed Mondays. Nothing after 5pm.'],
      ['chat', 'Facebook &amp; Instagram', '<a href="https://www.facebook.com/oanadental.ph" target="_blank" rel="noopener">oanadental.ph</a>'],
    ],
    btns: [
      ['tel:+639458708519', 'Call +63 945 870 8519', 'primary'],
      ['https://www.facebook.com/oanadental.ph', 'Message on Facebook', 'outline'],
    ],
    problem: {
      h2: 'Somebody else is ranking on your address.',
      p: 'Three separate pages stand between a Quezon City patient and your clinic. None of them is yours.',
      bad: [
        ['dentists10.com', 'Full page for your clinic', 'Your name and 143 Cordillera Street'],
        ['ClinicFinderPH', '&quot;Best Dental Clinics in QC 2026&quot;', 'Metro Dental, Cosmo Dental, GAOC &mdash; not you'],
        ['Yelp', '&quot;TOP 10 Dentists near Sta. Mesa Heights&quot;', 'A list you are not on'],
        ['Nine 5-star reviews', 'Inside Facebook', 'A searcher never reaches them'],
        ['Booking', 'Messenger or phone', 'Tue&ndash;Sun 10&ndash;5 only'],
      ],
      good: [
        ['This page', 'Your clinic', 'Your name, your address'],
        ['Your specialisms', 'Stated by you', 'Not summarised by an aggregator'],
        ['Your hours', 'Tue&ndash;Sun 10&ndash;17', 'Said plainly, including the Monday'],
        ['Nine 5-star reviews', 'On the page', 'Where a searcher lands'],
        ['Your number', 'One tap', 'From the search result'],
      ],
      url: 'dentists10.com hosts <b>&quot;Oana Dental Specialist, 143 Cordillera Street&quot;</b> &middot; checked 2026-09-07',
      urlNote:
        'One correction we owe you, because it changes the story: oanadental.ph appears to answer with a parked page, but that is the .ph registry wildcard at 45.79.222.138 &mdash; it answers for any .ph name at all. You do not own that domain, and nobody should tell you that you do.',
    },
    offer: {
      h2: 'Nine five-star reviews nobody can find.',
      p: 'Your patients already wrote these. They are inside Facebook, where a search for a Sta. Mesa Heights dentist never takes anyone.',
      cards: [
        ['star', 'Nine 5-star reviews', 'Earned on your Facebook page. Not one of them appears on the aggregator pages that outrank you.'],
        ['clock', 'Tuesday to Sunday', 'Open six days including Sunday, 10:00 to 17:00 &mdash; which is more than most QC clinics offer, and nobody knows it.'],
        ['pin', '143 Cordillera Street', 'Sta. Mesa Heights. The address dentists10.com is currently ranking on.'],
      ],
    },
    fixes: {
      h2: 'What this page does that a directory listing cannot.',
      items: [
        'It puts your nine five-star reviews in front of the patient at the moment they are choosing.',
        'It states your Sunday opening, which is the reason a working patient picks one clinic over another.',
        'It says clearly that you are closed Mondays, so nobody arrives to a locked door.',
        'It ranks on your own name instead of leaving that to an aggregator you have no control over.',
      ],
    },
    csBar:
      'dentists10.com has a page for <b>143 Cordillera Street</b>. You do not. Your nine five-star reviews are locked in Facebook. Shall we change that?',
    placeholders: [
      ['Treatments and prices &mdash; to be confirmed', 'No consultation fee or price list is published anywhere, so none is shown. Tell us your consult fee and the treatments you want led with, and they go on the page as you give them.'],
      ['Specialist scope &mdash; to be confirmed', 'The name says specialist. Which specialism you want front and centre is your call, not ours to assume.'],
    ],
  },

  {
    slug: 'city-dental-qc',
    name: 'CITY DENTAL',
    sub: 'Project 7, Quezon City',
    locale: 'Project 7, Quezon City',
    logoRound: true,
    title: 'CITY DENTAL &mdash; Cityland North Residences, Project 7, Quezon City',
    metaDesc:
      'CITY DENTAL, G-16 Cityland North Residences, Project 7, Quezon City, near Waltermart North EDSA. Call +63 927 531 6200.',
    eyebrow: 'A Cebu website is ranking on your Quezon City clinic',
    h1: 'Your clinic is on a <em>Cebu</em> implant site, above six competitors.',
    lead: 'cebudentalimplants.com runs a page about a Quezon City clinic &mdash; yours. It carries your address, your number and your email, and it lists six rival practices underneath you. Every patient who lands there is one you paid nothing to reach and earn nothing from.',
    idcard: [
      ['pin', 'Address', 'G-16 Cityland North Residences, Project 7, Quezon City', 'Near Waltermart North EDSA.'],
      ['phone', 'Mobile', '<a href="tel:+639275316200">+63 927 531 6200</a>'],
      ['mail', 'Email', '<a href="mailto:citydentalqc@gmail.com">citydentalqc@gmail.com</a>'],
      ['chat', 'Facebook', '<a href="https://www.facebook.com/citydentalqc" target="_blank" rel="noopener">facebook.com/citydentalqc</a>'],
    ],
    btns: [
      ['tel:+639275316200', 'Call +63 927 531 6200', 'primary'],
      ['mailto:citydentalqc@gmail.com', 'Email the clinic', 'outline'],
    ],
    problem: {
      h2: 'Your name at the top. Six competitors underneath.',
      p: 'This is the actual page: cebudentalimplants.com/content/city-dental-quezon-city. An implant aggregator based in Cebu, carrying your Quezon City details, with a competitor list below them.',
      bad: [
        ['Smile &amp; Co. Dental', 'Pasig', 'Listed under you'],
        ['Apostol Dental Cosmetic Center', 'Makati', 'Listed under you'],
        ['Family Dental Care', 'Pasay', 'Listed under you'],
        ['Any Time Dental', 'Para&ntilde;aque', 'Listed under you'],
        ['Tooth Mekanik', 'Cebu', 'Listed under you'],
        ['Alado Dental', 'Roxas', 'Listed under you'],
        ['Dentacare Dental Center', '&mdash;', 'Listed under you'],
      ],
      good: [
        ['CITY DENTAL', 'Project 7, QC', 'The only clinic on this page'],
        ['Your address', 'Cityland North', 'Stated once, correctly'],
        ['Your number', 'One tap', 'Straight to the desk'],
        ['Your email', 'Live', 'Not a form on a referrer&rsquo;s site'],
        ['The landmark', 'Waltermart North EDSA', 'How patients actually find you'],
        ['Competitors', 'None', 'It is your page'],
        ['The enquiry', 'Yours', 'Start to finish'],
      ],
      url: 'cebudentalimplants.com/content/city-dental-quezon-city &middot; citydentalqc.com <b>&rarr; NXDOMAIN</b> &middot; checked 2026-09-07',
      urlNote:
        'citydentalqc.com has never been registered. Right now the strongest page on the internet carrying your clinic&rsquo;s details is one built to sell implants in Cebu.',
    },
    offer: {
      h2: 'Where you actually are.',
      p: 'Ground floor of Cityland North Residences in Project 7 &mdash; the details a patient needs to walk in, said once and said correctly.',
      cards: [
        ['pin', 'G-16, Cityland North Residences', 'Ground floor unit, Project 7, Quezon City.'],
        ['globe', 'Waltermart North EDSA', 'The landmark patients navigate by. No aggregator page bothers to mention it.'],
        ['phone', 'One number, one inbox', '+63 927 531 6200 and citydentalqc@gmail.com &mdash; both reaching you directly.'],
      ],
    },
    fixes: {
      h2: 'What changes when the page is yours.',
      items: [
        'A patient searching your name lands on you, not on a Cebu implant site that lists six alternatives.',
        'Your address appears with the Waltermart North EDSA landmark, which is how anyone actually finds Project 7.',
        'Your number and email sit on a page you control, so a change to either takes minutes, not a support ticket.',
        'The six competing practices stop appearing directly beneath your clinic&rsquo;s details.',
      ],
    },
    csBar:
      'A <b>Cebu</b> implant site ranks on your Quezon City clinic and lists six rivals underneath you. Shall we put you back on top of your own name?',
    placeholders: [
      ['Clinic hours &mdash; to be confirmed', 'No opening hours are published on your Facebook page or in any listing we checked. Rather than invent a schedule a patient might travel on, this is left for you to fill in.'],
      ['Treatments and prices &mdash; to be confirmed', 'No consult fee or price list is public. Tell us the figure and the treatments you want led with and they go on the page as given.'],
    ],
  },

  {
    slug: 'smile-health-dental-qc',
    name: 'Smile and Health Dental Clinic',
    sub: 'LTM Building, Luzon Avenue, Quezon City',
    locale: 'Luzon Avenue, Quezon City',
    logoRound: true,
    title: 'Smile and Health Dental Clinic &mdash; LTM Building, Luzon Avenue, Quezon City',
    metaDesc:
      'Smile and Health Dental Clinic, LTM Building, Luzon Avenue, Quezon City. 1,032 Facebook likes, 92 check-ins. Call +63 943 725 8041.',
    eyebrow: '1,032 likes &middot; 92 check-ins &middot; nowhere a searcher looks',
    h1: 'You earned the proof. <em>It is in the wrong place.</em>',
    lead: '1,032 people liked your page and 92 checked in at the clinic. None of that appears anywhere a patient searching for a Quezon City dentist actually lands &mdash; those pages belong to WhatClinic, dentalphilippines.org and a directory that has never met you.',
    idcard: [
      ['pin', 'Address', 'LTM Building, Luzon Avenue, Quezon City'],
      ['phone', 'Mobile', '<a href="tel:+639437258041">+63 943 725 8041</a>'],
      ['mail', 'Email', '<a href="mailto:smileandhealthdentalclinic@gmail.com">smileandhealthdentalclinic@gmail.com</a>'],
      ['chat', 'Facebook', '<a href="https://www.facebook.com/smileandhealthdentalclinic" target="_blank" rel="noopener">smileandhealthdentalclinic</a>', '1,032 likes &middot; 92 check-ins.'],
    ],
    btns: [
      ['tel:+639437258041', 'Call +63 943 725 8041', 'primary'],
      ['https://www.facebook.com/smileandhealthdentalclinic', 'Message on Facebook', 'outline'],
    ],
    problem: {
      h2: 'Search Luzon Avenue. You will not find yourself.',
      p: 'Here is who occupies the Quezon City dental search today, and what each of them has that you do not: a page a search engine can rank.',
      bad: [
        ['Metro Dental', 'Eastwood, Trinoma', 'Named &quot;Best Dental Clinics in QC 2026&quot;'],
        ['Cosmo Dental', 'Studio 7, EDSA', 'Named in the same list'],
        ['GAOC', 'Vertis North', 'Named in the same list'],
        ['Smiline Dental Care', 'Commonwealth', 'What a Luzon Avenue search surfaces'],
        ['WhatClinic', 'Directory', 'Ranks on the QC dental query'],
        ['dentalphilippines.org', 'Directory', 'Ranks on the QC dental query'],
        ['Your 1,032 likes', 'Inside Facebook', 'Invisible to all of the above'],
      ],
      good: [
        ['Smile and Health', 'LTM Bldg, Luzon Ave', 'On its own page'],
        ['1,032 likes', 'Stated', 'Where a searcher lands'],
        ['92 check-ins', 'Stated', 'Proof people actually come'],
        ['Your address', 'LTM Building', 'Not a competitor&rsquo;s branch'],
        ['Your number', 'One tap', 'From the search result'],
        ['Your email', 'Live', 'Direct to the clinic'],
        ['The enquiry', 'Yours', 'Not a directory&rsquo;s lead'],
      ],
      url: 'smileandhealthdentalclinic.com <b>&rarr; NXDOMAIN</b> &middot; smileandhealthdental.com <b>&rarr; NXDOMAIN</b> &middot; checked 2026-09-07',
      urlNote:
        'Neither form of your name has ever been registered. That is why a Luzon Avenue search returns Smiline&rsquo;s Commonwealth branch: they have a page and you do not.',
    },
    offer: {
      h2: 'Proof you already own.',
      p: 'These are not our numbers. They are yours, and they are the strongest thing you have.',
      cards: [
        ['users', '1,032 Facebook likes', 'A following built without a website. It is the part most clinics on the &ldquo;best of&rdquo; lists cannot claim.'],
        ['pin', '92 check-ins', 'People who physically walked into LTM Building and said so. That is harder to earn than a review.'],
        ['shield', 'LTM Building, Luzon Avenue', 'A fixed address on a main Quezon City road, stated once and correctly.'],
      ],
      chips: ['<b>1,032</b> Facebook likes', '<b>92</b> check-ins'],
      chipNote:
        'Both figures are from your own Facebook page. They go on this page because they are the reason a patient should choose you, and because right now nobody searching can see them.',
    },
    fixes: {
      h2: 'Four things this page fixes.',
      items: [
        'Your 1,032 likes and 92 check-ins become visible to someone who has never opened Facebook.',
        'A search for a dentist on Luzon Avenue stops returning a competitor&rsquo;s Commonwealth branch first.',
        'You appear on a page you own rather than inside WhatClinic or dentalphilippines.org.',
        'The clinic gets an address on the internet that is not a directory entry someone else can edit.',
      ],
    },
    csBar:
      'You earned <b>1,032 likes</b> and <b>92 check-ins</b>. A patient searching Luzon Avenue finds Smiline&rsquo;s Commonwealth branch instead. Shall we fix that?',
    placeholders: [
      ['Clinic hours &mdash; to be confirmed', 'Your opening hours are not published on Facebook or in any listing we checked, so they are left blank here rather than invented.'],
      ['Treatments and prices &mdash; to be confirmed', 'No cleaning or consult fee is public. Give us the figures and the treatments to lead with and they go on the page as written.'],
    ],
  },

  {
    slug: 'kingtown-dental-oshawa',
    name: 'KingTown Dental',
    // Their own site's <title> writes it "King Town Dental"; their logo writes
    // it "KingTown Dental". Both spellings appear on this page because the
    // split is itself part of the evidence below.
    sub: 'Townline Centre, Courtice, Ontario',
    locale: 'Courtice, Ontario',
    logoRound: false,
    logoPick: 'logo-2-json-ld-logo-url.png',
    intl: true,
    title: 'KingTown Dental &mdash; 5-1414 King Street East, Courtice, Ontario',
    metaDesc:
      'KingTown Dental (King Town Dental), Unit 5, 1414 King Street East, Courtice, Ontario, in Townline Centre. Call +1 905-434-5500.',
    eyebrow: 'Four listings &middot; four addresses &middot; no two agree',
    h1: 'A patient with an emergency has to <em>guess where you are</em>.',
    lead: 'Your website, your Facebook page, Yelp and YellowPages.ca each give a different answer for where KingTown Dental is &mdash; and no two published sources agree on your opening hours on any day of the week. This page settles all of it in one place.',
    idcard: [
      ['pin', 'Address', 'Unit 5, 1414 King Street East, Courtice, Ontario', 'Townline Centre. This is the address your own website gives.'],
      ['phone', 'Telephone', '<a href="tel:+19054345500">+1 905-434-5500</a>'],
      ['mail', 'Email', '<a href="mailto:info@kingtowndental.com">info@kingtowndental.com</a>', 'On kingtowndental.com &mdash; a different domain to your website.'],
      ['globe', 'Website', 'kingtowndental.ca', 'Registered 2024-09-23, on a different host to your mail domain.'],
      ['chat', 'Facebook', '<a href="https://www.facebook.com/KingTownDentalOffice" target="_blank" rel="noopener">KingTownDentalOffice</a>', 'Which gives the location as Oshawa.'],
    ],
    btns: [
      ['tel:+19054345500', 'Call +1 905-434-5500', 'primary'],
      ['mailto:info@kingtowndental.com', 'Email the practice', 'outline'],
    ],
    problem: {
      h2: 'Four public records. Four different addresses.',
      p: 'Same building, four descriptions of it. A patient checking two sources before driving over gets two different answers &mdash; and one of them names a different street entirely.',
      bad: [
        ['kingtowndental.ca', '5-1414 King St E, Courtice', 'Your own site'],
        ['Facebook', 'Oshawa', 'A different town'],
        ['Yelp', '1414 King Street E, Courtice', 'No unit number'],
        ['YellowPages.ca', '1414 <b>Highway 2</b>', 'A different street name'],
        ['Your name', 'KingTown / King Town', 'Written both ways, by you'],
        ['Email domain', 'kingtowndental.com', 'Reg. 2010 &mdash; not your site&rsquo;s domain'],
        ['Site domain', 'kingtowndental.ca', 'Reg. 2024 &mdash; different host'],
      ],
      good: [
        ['Address', 'Unit 5, 1414 King St E', 'Once'],
        ['Town', 'Courtice', 'Once'],
        ['Landmark', 'Townline Centre', 'So it can be found'],
        ['Street', 'King Street East', 'One name'],
        ['Practice name', 'Stated once', 'Your choice which'],
        ['Phone', '+1 905-434-5500', 'One number'],
        ['Hours', 'One published set', 'Once you confirm them'],
      ],
      url: 'kingtowndental.ca reg. <b>2024-09-23</b> &middot; kingtowndental.com reg. <b>2010-06-22</b>, different host &middot; checked 2026-09-07',
      urlNote:
        'The domain split matters more than it looks: the address you ask patients to email is on a domain that does not serve your website. Anyone checking whether info@kingtowndental.com is really you has no way to confirm it.',
    },
    // Rendered instead of the usual hours table — the contradiction IS the point.
    hoursConflict: {
      h2: 'No two sources agree on when you are open.',
      p: 'These are the two published sets, side by side. They disagree on every single day that either one covers.',
      rows: [
        ['Monday', '09:00 &ndash; 18:00', '10:00 &ndash; 18:00'],
        ['Tuesday', '09:00 &ndash; 18:00', '10:00 &ndash; 20:00'],
        ['Wednesday', '10:00 &ndash; 19:00', '09:00 &ndash; 17:00'],
        ['Thursday', '10:00 &ndash; 19:00', '11:00 &ndash; 19:00'],
      ],
      cols: ['Your website', 'The directory'],
      note:
        'Friday, Saturday and Sunday are not published anywhere &mdash; while your website promises &ldquo;Same Day Emergencies Accommodated&rdquo;. A patient in pain on a Friday has nothing to go on. We have not picked a winner between these two columns, because only you know which is right.',
    },
    offer: {
      h2: 'One practice, written two ways.',
      p: 'Even the name is split. Your logo reads KingTown Dental; the title of your own website reads King Town Dental. It is a small thing that makes both harder to search for.',
      cards: [
        ['pin', 'Townline Centre, Courtice', 'Unit 5 at 1414 King Street East &mdash; the address your own website gives, with the landmark that makes it findable.'],
        ['users', 'Family dentistry, Durham Region', 'Serving Courtice, Oshawa and the wider Durham Region, as your website says.'],
        ['shield', 'Same-day emergencies', 'Your site accommodates them. It just does not publish a Friday, Saturday or Sunday hour to do it in.'],
      ],
    },
    fixes: {
      h2: 'What one settled page fixes.',
      items: [
        'A patient stops choosing between Courtice, Oshawa and Highway 2 and just drives to one address.',
        'Your published hours stop contradicting themselves on every day of the week.',
        'The same-day emergency promise gets a Friday-to-Sunday answer next to it instead of silence.',
        'The name appears one way, so both spellings stop competing with each other in search.',
      ],
    },
    csBar:
      'Your site says <b>Courtice</b>, your Facebook says <b>Oshawa</b>, and YellowPages says <b>Highway 2</b>. No two sources agree on your hours on any day. Shall we settle it?',
    placeholders: [
      ['Friday to Sunday hours &mdash; not published anywhere', 'Neither your website nor the directory lists them, so this page does not either. Given the same-day emergency promise, it is the single most valuable line you could add.'],
      ['Which address is correct &mdash; to be confirmed', 'This page uses Unit 5, 1414 King Street East, Courtice, because that is what your own website says. If a different one is right, tell us and it changes everywhere at once.'],
      ['Fees &mdash; to be confirmed', 'No hygiene or exam fee is published. Nothing is shown rather than a figure a patient might arrive expecting.'],
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
    lead.logoPick || (brand.logoFiles && brand.logoFiles[0] && brand.logoFiles[0].file) || brand.logo.file

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
      <p class="eyebrow">Opening hours</p>
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
        <div class="conflict__row conflict__row--gap"><span>Friday</span><span class="c-x">Not published</span><span class="c-x">Not published</span></div>
        <div class="conflict__row conflict__row--gap"><span>Saturday</span><span class="c-x">Not published</span><span class="c-x">Not published</span></div>
        <div class="conflict__row conflict__row--gap"><span>Sunday</span><span class="c-x">Not published</span><span class="c-x">Not published</span></div>
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
