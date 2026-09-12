#!/usr/bin/env node
// CLO-162 step 4 (2026-09-12) — builds the run's mockups.
//
// Same contract as tools/build-mockups-2026-09-07.mjs: the palette, the
// typeface and the logo filename are read out of <slug>/brand/brand.json at
// build time rather than transcribed into this file. That is what makes a
// palette mismatch structurally impossible instead of merely checked for. If a
// hex is wrong the fix goes in brand.json and you re-run this — never here.
//
// Two generalisations over the 09-07 template, both in the renderer only:
//   * `hoursConflict` (Day | source A | source B) becomes `sideBySide`, which
//     takes N labelled columns. The config says the contradiction block works
//     for addresses and phone numbers, not just hours; Cebu Smiles has THREE
//     phone numbers in circulation and two-column markup could not show them.
//   * an optional `hours` block, for the one lead that actually publishes them.
//
// Every factual claim in LEADS below comes from the lead's Trello card
// (evidence gathered by steps 1-3, dated 2026-09-12) or from a fetch this
// script's author re-ran the same day and recorded in the notes. Anything not
// established there is a labelled placeholder, never a guess.
// Self-hosted assets only: the sole external references are tel:/mailto:
// links, the prospect's own site/Facebook page, and the CloudSpring booking
// link.

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
    slug: 'cebu-smiles-dentistry',
    name: 'Cebu Smiles Dentistry',
    shortName: 'Cebu Smiles',
    sub: 'Dentistry &middot; SM Seaside City',
    locale: 'SM Seaside City, Cebu',
    logoRound: false,
    title: 'Cebu Smiles Dentistry &mdash; 3F Mountain Wing, SM Seaside City, Cebu',
    metaDesc:
      'Cebu Smiles Dentistry, 3F Mountain Wing, SM Seaside City, Cebu City. Call +63 917 165 2352 or email dentistrycebusmiles@gmail.com.',
    eyebrow: 'One name &middot; one number &middot; a page you own',
    h1: 'Search your name and <em>a directory&rsquo;s homepage</em> is listed as your website.',
    lead:
      'The page that ranks for &ldquo;Cebu Smiles Dentistry&rdquo; is not yours. It prints <b>cebudentalimplants.com</b> in your Website field &mdash; the directory&rsquo;s own front page &mdash; and stacks six rival clinics underneath you. This page is the record that answers instead.',
    idcard: [
      ['pin', 'Address', '3F Mountain Wing, SM Seaside City, Cebu City'],
      [
        'phone',
        'Telephone',
        '<a href="tel:+639171652352">+63 917 165 2352</a>',
        'Three numbers are in circulation for this clinic. This is the one on your own record.',
      ],
      ['mail', 'Email', '<a href="mailto:dentistrycebusmiles@gmail.com">dentistrycebusmiles@gmail.com</a>'],
      [
        'chat',
        'Facebook',
        '<a href="https://www.facebook.com/cebusmilesdentistry" target="_blank" rel="noopener">facebook.com/cebusmilesdentistry</a>',
        'Your front door today. This page gives that link somewhere to land.',
      ],
    ],
    btns: [
      ['tel:+639171652352', 'Call +63 917 165 2352', 'primary'],
      ['mailto:dentistrycebusmiles@gmail.com', 'Email the clinic', 'outline'],
    ],
    problem: {
      h2: 'The page ranking for your name belongs to somebody else.',
      p: 'This is what a Cebu patient actually lands on when they search you, and what it tells them.',
      bad: [
        ['Top result for your name', 'cebudentalimplants.com', 'A directory, not you'],
        ['Website field on that page', 'cebudentalimplants.com', 'Their own homepage'],
        ['Listed underneath you', '6 rival clinics', 'Same page, same search'],
        ['Telephone', 'Three different numbers', 'A patient picks one'],
        ['Your own domain', 'Never registered', 'Nothing to point at'],
      ],
      good: [
        ['Top result for your name', 'This page', 'Yours'],
        ['Website field on that page', 'This page', 'Answers'],
        ['Listed underneath you', 'Nobody', 'Your page, your patients'],
        ['Telephone', '+63 917 165 2352', 'One number'],
        ['Your own domain', 'Still available', 'Your call, your registrar'],
      ],
      url:
        'cebusmilesdentistry.com <b>&rarr; NXDOMAIN</b> on A and MX &middot; Verisign RDAP <b>404, never registered</b> &middot; cebusmiles.com identical &middot; the .ph that appears to resolve is the registry wildcard <b>45.79.222.138</b> &mdash; control zzqqxxnotarealclinic9182.ph returns the same IP &middot; checked 2026-09-12',
      urlNote:
        'You own no domain, so there is nothing for a directory to link to &mdash; which is exactly why one of them filled the gap with its own address. Registering a name is a decision for you and your registrar; this page does not need one to start working.',
    },
    offer: {
      h2: 'What we can say about Cebu Smiles Dentistry.',
      p: 'Taken from your Facebook page, your own mark and the SM Seaside directory. Nothing here is invented &mdash; where a fact has not been published, this page says so further down.',
      cards: [
        [
          'pin',
          'Inside SM Seaside City',
          'Third floor of the Mountain Wing. A patient who already knows the mall can find you from this page in one line.',
        ],
        [
          'phone',
          'One number that reaches you',
          '+63 917 165 2352. The mall directory prints (032) 412-7023 and an aggregator prints 0933 325 7820. This page publishes one.',
        ],
        [
          'chat',
          'Facebook, given somewhere to land',
          'facebook.com/cebusmilesdentistry is where patients find you now. A page you own turns that from the whole shopfront into one door of several.',
        ],
      ],
    },
    sideBySide: {
      eyebrow: 'Three sources, three numbers',
      h2: 'Which of these should a patient ring?',
      p: 'All three are live right now. None of them is presented here as the wrong one &mdash; the point is that a patient cannot tell, and two of them do not reach your desk.',
      cols: ['Your own record', 'SM mall directory', 'Aggregator listing'],
      rows: [
        ['Telephone', '+63 917 165 2352', '(032) 412-7023', '0933 325 7820'],
        ['Website shown', 'None owned', 'Not listed', 'cebudentalimplants.com'],
        ['Listed beside you', '&mdash;', 'Mall tenants', '6 rival clinics'],
      ],
      note:
        'A first-time patient searching at 9pm reads whichever of these Google put in front of them. Two of the three send them somewhere you do not answer.',
    },
    fixes: {
      h2: 'Four things this page settles on day one.',
      items: [
        'The result that ranks for your name currently prints a directory&rsquo;s homepage as your website. From here, your name resolves to you.',
        'Three phone numbers become one, on a page you control &mdash; and it is tappable, so a patient on a phone does not have to copy it out.',
        'Six competing clinics sit directly beneath you on the page that ranks today. On this one there are none.',
        'You own no domain, so nothing currently anchors your name online. This page is a working anchor while you decide about a domain, not after.',
      ],
    },
    csBar:
      'The page ranking for <b>Cebu Smiles Dentistry</b> lists <b>cebudentalimplants.com</b> as your website &mdash; the directory&rsquo;s own homepage &mdash; above six rival clinics. Shall we put your name on a page you own?',
    placeholders: [
      [
        'Clinic hours &mdash; to be confirmed',
        'No opening hours are published on your Facebook page, in the SM Seaside directory or on the aggregator listing. Mall hours are not clinic hours, so we have not assumed them. Send them and they go on the page as written.',
      ],
      [
        'Treatments and prices &mdash; to be confirmed',
        'Nothing public states what you charge for a cleaning or a consultation, so this page quotes nothing. A published starting price is usually the single fastest thing to add.',
      ],
    ],
  },

  {
    slug: 'bright-smiles-oral-care-center',
    name: 'Bright Smiles Oral Care Center',
    shortName: 'Bright Smiles',
    sub: 'Oral Care Center &middot; Cebu City, Philippines',
    locale: 'Cebu City, Philippines',
    logoRound: false,
    title: 'Bright Smiles Oral Care Center &mdash; V. Ranudo St., Cebu City',
    metaDesc:
      'Bright Smiles Oral Care Center, Rm. 415, 4F Velez Medical Arts Bldg., V. Ranudo St., Cebu City 6000. Call +63 32 234 5633. Mon-Fri 9am-6pm, Sat 9am-5pm.',
    eyebrow: 'One address &middot; one dialable number &middot; one set of hours',
    h1: 'Two directories send your patients <em>to a different street.</em>',
    lead:
      'Your own contact page says V. Ranudo Street. <b>infoisinfo-ph.com</b> and <b>phl.databasesets.com</b> both say Gen. Maxilom Avenue, and print a phone number six digits long that no handset will dial. This page carries one address and one number that works.',
    idcard: [
      ['pin', 'Address', 'Rm. 415, 4F Velez Medical Arts Bldg., V. Ranudo St., Cebu City 6000'],
      [
        'phone',
        'Telephone',
        '<a href="tel:+63322345633">+63 32 234 5633</a>',
        'From your own /contact-us.html. infoisinfo prints +63(32)412355 &mdash; six digits, undialable.',
      ],
      ['phone', 'Mobile', '<a href="tel:+639234188996">+63 923 418 8996</a>'],
      ['mail', 'Email', '<a href="mailto:2008brightsmiles@gmail.com">2008brightsmiles@gmail.com</a>'],
      [
        'globe',
        'Website',
        '<a href="https://www.dentalclinic-cebu.com/" target="_blank" rel="noopener">dentalclinic-cebu.com</a>',
      ],
    ],
    btns: [
      ['tel:+63322345633', 'Call +63 32 234 5633', 'primary'],
      ['mailto:2008brightsmiles@gmail.com', 'Email the clinic', 'outline'],
    ],
    problem: {
      h2: 'Your &ldquo;Book an Appointment&rdquo; button does not book anything.',
      p: 'It goes to /contact-us.html. We filled the form out on 2026-09-12 to see what it asks for. Here is every field on it.',
      bad: [
        ['Subject', 'Pre-filled &ldquo;Miscellaneous&rdquo;', 'What the patient sends'],
        ['Email', 'Asked for twice', 'Enter, then re-enter'],
        ['Country', 'Required dropdown', 'For a Cebu City walk-in'],
        ['Preferred date', 'No field', 'Not asked'],
        ['Preferred time', 'No field', 'Not asked'],
      ],
      good: [
        ['Subject', 'Not asked', 'You already know why they called'],
        ['Email', 'Once, or not at all', 'Tap to call instead'],
        ['Country', 'Not asked', 'Cebu City'],
        ['Preferred date', 'Asked, in one tap', 'An enquiry, not a calendar'],
        ['Preferred time', 'Asked, in one tap', 'An enquiry, not a calendar'],
      ],
      url:
        '/contact-us.html &rarr; RSForm id 1: Subject, Title, First Name, Last Name, Email, Re-Enter Email, Country, How did you hear, Remarks &middot; <b>type="date" &times; 0</b> &middot; <b>type="time" &times; 0</b> &middot; fetched 2026-09-12',
      urlNote:
        'A patient who taps &ldquo;Book an Appointment&rdquo; types their email twice, picks a country, and still has not said when they want to come in. The enquiry lands in an inbox as free text and somebody has to write back to ask.',
    },
    offer: {
      h2: 'What Bright Smiles already publishes.',
      p: 'All of this is on your own site today. The problem is not that the facts are missing &mdash; it is that two directories publish different ones.',
      cards: [
        [
          'pin',
          'Velez Medical Arts Building',
          'Room 415, fourth floor, V. Ranudo Street, Cebu City 6000. The address on your own contact page.',
        ],
        [
          'clock',
          'Hours that are actually posted',
          'Monday to Friday 9am&ndash;6pm, Saturday 9am&ndash;5pm. Rarer than it should be &mdash; most clinics in this niche publish none at all.',
        ],
        [
          'phone',
          'A landline and a mobile',
          '+63 32 234 5633 and +63 923 418 8996, both from your own site, both tappable here.',
        ],
      ],
    },
    hours: {
      eyebrow: 'Opening hours',
      h2: 'Your hours, tappable, above the fold.',
      p: 'Taken verbatim from your own contact page on 2026-09-12. No directory we checked carries them at all.',
      rows: [
        ['Monday to Friday', '09:00 &ndash; 18:00', true],
        ['Saturday', '09:00 &ndash; 17:00', true],
        ['Sunday', 'Not published', false],
        ['Public holidays', 'Not published', false],
      ],
      note:
        'Sunday and public holidays are left blank because your site does not state them. We would rather show a gap than invent a schedule a patient turns up for.',
    },
    sideBySide: {
      eyebrow: 'Two published addresses',
      h2: 'A patient on Gen. Maxilom Avenue cannot find you.',
      p: 'Both of these are live right now. Neither is declared correct here &mdash; what this page does is name the source of each, and put the one your own site publishes at the top.',
      cols: ['Your own contact page', 'infoisinfo-ph.com &amp; phl.databasesets.com'],
      rows: [
        ['Street', 'V. Ranudo Street', 'Gen. Maxilom Avenue'],
        ['Building', 'Velez Medical Arts Bldg., Rm. 415, 4F', 'One Mango Square, Unit 6, 2F'],
        ['Telephone', '+63 32 234 5633', '+63 32 412 3553'],
        ['As actually printed', '+63 32 234 5633', '+63(32)412355 &mdash; 6 digits'],
        ['Listed beside you', '&mdash;', 'Asoy Felix Dental, same avenue'],
      ],
      note:
        'The two are about a kilometre apart. The directory version is also truncated to six digits, so a patient who does reach the listing cannot ring it either &mdash; and the clinic stacked next to you on that page is on the avenue it sends them to.',
    },
    fixes: {
      h2: 'Four things this page settles on day one.',
      items: [
        'One address, from your own contact page, with the directory version shown and sourced rather than quietly dropped.',
        'One number that dials. The six-digit version on infoisinfo cannot be rung from any handset.',
        'Your hours, which you already publish and no directory carries, put where a patient looks first.',
        '&ldquo;Book an Appointment&rdquo; currently opens a form with no date field and no time field. Here, the first tap is a call that connects.',
      ],
    },
    csBar:
      'Two directories send your patients to <b>Gen. Maxilom Ave</b> and print a phone number <b>six digits long</b>. Your own contact page says V. Ranudo St. Which one is on your door?',
    placeholders: [
      [
        'Treatments and prices &mdash; to be confirmed',
        'Your site describes the clinic but posts no fees, so this page quotes none. Tell us your cleaning and consultation rates and they go on as written.',
      ],
      [
        'Sunday and holiday hours &mdash; to be confirmed',
        'Your contact page lists Monday to Saturday only. We have shown that as published and left the rest blank rather than assume you are closed.',
      ],
    ],
  },

  {
    slug: 'rural-view-dental',
    name: 'Rural View Dental',
    shortName: 'Rural View Dental',
    sub: 'Northern Beaches Central &middot; Mackay QLD',
    locale: 'Mackay, QLD',
    intl: true,
    logoRound: false,
    title: 'Rural View Dental &mdash; 10 Eimeo Rd, Northern Beaches Central, Mackay QLD',
    metaDesc:
      'Rural View Dental, Shop 3A, Northern Beaches Central, 10 Eimeo Rd, Mackay QLD 4740. Call (07) 4840 2850. 4.9 stars from 145 reviews.',
    eyebrow: 'Three exits off your homepage &middot; two spellings of veneers',
    h1: 'Your <em>4.9 &#9733; 145 Reviews</em> button sends visitors to Google.',
    lead:
      'So does your &ldquo;Accredited Dental Practice&rdquo; panel, and so does your address heading. Three of the strongest elements on your homepage are exits &mdash; and the search they land on is where Northern Beaches Dental, one street over on Old Eimeo Rd, takes seven of the first ten results.',
    idcard: [
      ['pin', 'Address', 'Shop 3A, Northern Beaches Central, 10 Eimeo Rd, Mackay QLD 4740'],
      ['phone', 'Telephone', '<a href="tel:+61748402850">(07) 4840 2850</a>', 'Dialled here as +61 7 4840 2850, so it works from a mobile abroad too.'],
      ['mail', 'Email', '<a href="mailto:admin@ruralviewdental.com.au">admin@ruralviewdental.com.au</a>'],
      [
        'star',
        'Rating',
        '4.9 from 145 reviews',
        'Shown here on a page you own, instead of as a link away from it.',
      ],
      [
        'cal',
        'Online booking',
        '<a href="https://ruralviewdental.com.au/appointment/" target="_blank" rel="noopener">ruralviewdental.com.au/appointment/</a>',
        'You already run real self-serve booking through the Centaur D4W portal. Nothing on this page replaces it.',
      ],
    ],
    btns: [
      ['tel:+61748402850', 'Call (07) 4840 2850', 'primary'],
      ['https://ruralviewdental.com.au/appointment/', 'Book online', 'outline'],
    ],
    problem: {
      h2: 'Every one of these is a link off your own site.',
      p: 'Fetched from your homepage on 2026-09-12. The left column is the HTML that is live right now.',
      bad: [
        ['Accredited Dental Practice panel', 'google.com/search?q=&hellip;', 'Leaves your site'],
        ['4.9 | 145 Reviews button', 'The same pasted URL', 'Leaves your site'],
        ['10 Eimeo Road heading', 'share.google/XQV9drsi7PChk8pYe', 'Leaves your site'],
        ['Spelling in the navigation', '&ldquo;Veeners&rdquo; &times;4', '&ldquo;Veneers&rdquo; &times;8 elsewhere'],
        ['Opening hours', 'Not published', 'Nowhere on the site'],
      ],
      good: [
        ['Accredited Dental Practice panel', 'Stated on this page', 'Stays'],
        ['4.9 | 145 Reviews', 'Stated on this page', 'Stays'],
        ['10 Eimeo Road heading', 'Your address, in text', 'Stays'],
        ['Spelling in the navigation', '&ldquo;Veneers&rdquo;', 'Once, consistently'],
        ['Opening hours', 'Labelled, awaiting yours', 'Honest gap'],
      ],
      url:
        'https://www.google.com/search?q=<b>rurAl</b>+view+dental+australia&amp;rlz=1C5GCEA_en<b>ID</b>1170ID1170&amp;oq=rura&amp;gs_lcrp=&hellip; &middot; a pasted Chrome address bar: capital A mid-word, and an <b>Indonesia</b> locale tag &middot; 2 occurrences, plus 1 share.google link &middot; fetched 2026-09-12',
      urlNote:
        'That is not a link somebody wrote &mdash; it is a URL copied out of a browser bar and dropped into the page, tracking tag and typo intact. Every visitor who clicks your best piece of social proof is handed to a search for your own name.',
    },
    offer: {
      h2: 'What Rural View Dental already has.',
      p: 'This practice is not short of assets. They are just pointed outward. Everything below is verified on your own site.',
      cards: [
        [
          'star',
          '4.9 from 145 reviews',
          'A rating most practices would build a homepage around. Yours is currently a button that leaves the homepage.',
        ],
        [
          'cal',
          'Real online booking, already live',
          'Your /appointment/ page runs the Centaur D4W portal &mdash; genuine self-serve booking with dates and times. That is solved; this page links to it.',
        ],
        [
          'pin',
          'Northern Beaches Central',
          'Shop 3A, 10 Eimeo Rd. Northern Beaches Dental is on Old Eimeo Rd, the next street over &mdash; which is why the name has to work harder here than most.',
        ],
      ],
    },
    sideBySide: {
      eyebrow: 'Where the clicks go',
      h2: 'Three elements, three exits.',
      p: 'These are the live destinations of three of the most-clicked things on your homepage, read straight out of the HTML on 2026-09-12.',
      cols: ['Where the click goes today', 'Stays on ruralviewdental.com.au?'],
      rows: [
        ['Accredited Dental Practice panel', 'Google results for your own name', 'No'],
        ['4.9 | 145 Reviews button', 'The same pasted Chrome address bar', 'No'],
        ['10 Eimeo Road heading', 'share.google/XQV9drsi7PChk8pYe', 'No'],
        ['Book online', 'Your Centaur D4W portal', 'Yes &mdash; this one is right'],
      ],
      note:
        'The fourth row is the one that already works, and it is the pattern for the other three: the destination is yours, so the visitor stays. Nothing here needs new software &mdash; three href values are three exits.',
    },
    fixes: {
      h2: 'Four things this page settles on day one.',
      items: [
        'Your 4.9 rating and your accreditation are stated on a page you own, instead of being links to a search you do not control.',
        'The search those links land on is the one Northern Beaches Dental dominates. Removing the link removes the introduction.',
        '&ldquo;Veeners&rdquo; appears four times in your navigation while &ldquo;Veneers&rdquo; appears eight times elsewhere on the same page. Here it is spelled one way.',
        'Your phone is published as (07) 4840 2850 with a space inside the tel: link. Here it is +61 7 4840 2850, which dials from any handset.',
      ],
    },
    csBar:
      'Your <b>4.9 &#9733; 145 Reviews</b> button and your <b>Accredited Dental Practice</b> panel both link to a Google search for your own name &mdash; where Northern Beaches Dental takes 7 of the first 10 results. Shall we keep that click on your site?',
    placeholders: [
      [
        'Opening hours &mdash; to be confirmed',
        'Your homepage publishes your address and your phone but no hours, and we found none anywhere else on the site. Send them and they go straight on.',
      ],
      [
        'Exam and treatment fees &mdash; to be confirmed',
        'No fees are published on the site, so none are quoted here. A posted new-patient exam price is usually the first thing a visitor from a competitor search is looking for.',
      ],
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
    lead.logoPick ||
    brand.logoPick ||
    (brand.logoFiles && brand.logoFiles[0] && brand.logoFiles[0].file) ||
    brand.logo.file

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

  const fixes = lead.fixes.items
    .map(
      (t, i) => `      <div class="why__item"><div class="why__num">${i + 1}</div><p>${t}</p></div>`
    )
    .join('\n')

  const notes = lead.placeholders
    .map(([b, p]) => `        <p class="note"><b>${b}</b>${p}</p>`)
    .join('\n')

  // N-column contradiction block. The 09-07 template hard-coded two columns
  // plus a day label because it only ever had to show two sources of opening
  // hours; Cebu Smiles has three phone numbers, so the column count is data.
  const sbs = lead.sideBySide
  const sbsCols = sbs ? sbs.cols.length + 1 : 0
  const cellClass = ['c-a', 'c-b', 'c-c']
  const sideBySideBlock = sbs
    ? `  <section class="section section--tintB">
    <div class="wrap">
      <p class="eyebrow">${sbs.eyebrow}</p>
      <div class="rule"></div>
      <h2>${sbs.h2}</h2>
      <p class="lede">${sbs.p}</p>
      <div class="conflict" style="--cols:${sbsCols}">
        <div class="conflict__head">
          <span>&nbsp;</span>${sbs.cols.map((c) => `<span>${c}</span>`).join('')}
        </div>
${sbs.rows
  .map(
    (r) =>
      `        <div class="conflict__row"><span>${r[0]}</span>${r
        .slice(1)
        .map((v, i) => `<span class="${cellClass[i] || 'c-c'}">${v}</span>`)
        .join('')}</div>`
  )
  .join('\n')}
      </div>
      <p class="note"><b>Neither column is presented here as the correct one</b>${sbs.note}</p>
    </div>
  </section>

`
    : ''

  const h = lead.hours
  const hoursBlock = h
    ? `  <section class="section">
    <div class="wrap">
      <p class="eyebrow">${h.eyebrow}</p>
      <div class="rule"></div>
      <h2>${h.h2}</h2>
      <p class="lede">${h.p}</p>
      <div class="hours">
${h.rows
  .map(
    ([d, v, open]) =>
      `        <div class="hours__row${open ? ' hours__row--open' : ''}"><span>${d}</span><span>${v}</span></div>`
  )
  .join('\n')}
      </div>
      <p class="note" style="margin-top:16px"><b>Where your site says nothing, this page says nothing</b>${h.note}</p>
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

.why{display:grid;gap:20px;grid-template-columns:1fr;margin-top:24px}
.why__item{display:flex;gap:15px;align-items:flex-start}
.why__num{flex:0 0 42px;width:42px;height:42px;border-radius:50%;background:var(--p);color:var(--on-p);font-family:var(--display);font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center}
.why__item p{font-size:15px;color:var(--ink-2);margin:0}

/* --cols is set per page from the data, so two published addresses and three
   circulating phone numbers use the same markup. */
.conflict{background:#fff;border:1px solid var(--line);border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-sm);margin-top:24px}
.conflict__head,.conflict__row{display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));gap:8px;padding:12px 16px;font-size:14.5px;align-items:start}
.conflict__head{background:var(--ink);color:#fff;font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;font-weight:700;align-items:end}
.conflict__row{border-top:1px solid var(--line)}
.conflict__row span:first-child{font-weight:700}
.c-a{color:var(--p-deep);font-weight:700}
.c-b{color:var(--s-deep);font-weight:700}
.c-c{color:var(--ink-2);font-weight:700}
.conflict__row--gap{background:var(--bone)}

.contact{display:grid;gap:24px;grid-template-columns:1fr;margin-top:24px}
.hours{background:#fff;border:1px solid var(--line);border-radius:var(--r-md);overflow:hidden;box-shadow:var(--shadow-sm);margin-top:24px}
.hours__row{display:flex;justify-content:space-between;gap:14px;padding:13px 18px;border-top:1px solid var(--line);font-size:15px}
.hours__row:first-child{border-top:0}
.hours__row span:first-child{font-weight:700}
.hours__row span:last-child{color:var(--ink-2);font-weight:600;text-align:right;font-style:italic}
.hours__row--open{background:var(--p-soft)}
.hours__row--open span:last-child{color:var(--p-deep);font-weight:700;font-style:normal}
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

@media (max-width:599px){
  .conflict__head,.conflict__row{grid-template-columns:1fr;gap:2px}
  .conflict__head span:first-child{display:none}
  .conflict__head{font-size:10px}
  .conflict__row{padding:14px 16px}
}
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
    <a class="btn btn--p btn--sm header__cta" href="${lead.btns[0][0]}">${lead.btns[0][1]}</a>
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
      <p class="eyebrow">What is live right now</p>
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

${sideBySideBlock}  <section class="section">
    <div class="wrap">
      <p class="eyebrow">${shortName}</p>
      <div class="rule"></div>
      <h2>${lead.offer.h2}</h2>
      <p class="lede">${lead.offer.p}</p>
      <div class="grid">
${cards}
      </div>
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
      <h2>Everything a patient needs, in one place.</h2>
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
  console.log(`built ${lead.slug.padEnd(32)} ${(html.length / 1024).toFixed(1)}KB`)
}
