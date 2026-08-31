# CLO-117 — step 2 strategy evidence trail (daily run 2026-08-31)

Niche week: **Catering / home bakers**, day 1. City (Mon): Quezon City. 3 PH + 1 intl.

This file exists because `trelloWriteCard action:"add_comment"` is rejected by the
Trello runtime policy map ("Unrecognised Trello action"), so the per-card evidence
could not go in a card comment. The operative evidence is on each card description;
the full method, the URLs, and the caveats are here.

Every fetch below was made on **2026-08-31** with a Chrome User-Agent
(`Mozilla/5.0 ... Chrome/126.0.0.0`). Directory 403s are user-agent blocks — the
Placedigger page returns 403 to a default agent and 200 to Chrome.

---

## 1. Sweet Kiss Custom Cakes — Quezon City, PH
Card: https://trello.com/c/ObZTVgO3 · **ANGLE: directory capture, marketplace variant**

**Primary — the marketplace kept their URL and replaced their products.**
`GET https://www.cakerush.ph/collections/sweet-kiss-custom-cakes` → **HTTP 200**, and:

- **0** occurrences of the string "Sweet Kiss" anywhere in the 428 KB response.
- `<h1>` = `Birthday Cake Delivery`
- `rel="canonical"` = `https://www.flowerchimp.com.ph/collections/cake`
- `<meta name="description">` = "Send a cake with Flower Chimp for any occasion…"
- Prices rendered on that page: PHP 1,299 / 1,399 / 1,599 / 2,499 / 2,999 / 3,999 / 5,499

CakeRush PH launched 2020-07-07 as a home-baker marketplace and is now Flower Chimp.
The collection URL carrying Sweet Kiss's brand name now sells a competitor's catalogue
and does not name them at all. **Owner-checkable in ten seconds: click the link.**

**Secondary — dead directory.**
`GET https://looloo.com/p/sweet-kiss-custom-cakes-laging-handa-quezon-city` → a 114-byte
shell that JS-redirects to `/lander`, which is a GoDaddy parking lander
(`window._trfd.push({ap:"parking"})`, `img1.wsimg.com/parking-lander/…`).
Looloo Philippines is parked. That listing is gone.

**Domain.** `sweetkissph.com` → DNS NXDOMAIN; Verisign RDAP **HTTP 404**. Unregistered.
Not a blank-domain lead; the exact-match name is available.

**UNVERIFIED — do not put in sent copy without re-checking.** Restaurant Guru's indexed
listing gives `60-A Sct. Limbaga St., Laging Handa, Quezon City` against the card's
`46 Scout Chuatoco`. Both streets are in Laging Handa, so this is a street-level
contradiction, not a barangay one. Read from the **search index only** —
`restaurantguru.com` returns HTTP 503 "unusual traffic" to direct fetch, twice.

---

## 2. Rtuazon Food-Catering — Quezon City, PH
Card: https://trello.com/c/umwew60x · **ANGLE: contradictory listings**

Single source, read verbatim off the page:
`https://ph.placedigger.com/rtuazon-food-catering1766031476.html` (403 → 200 with Chrome UA)

| What the directory publishes | Why it is wrong / checkable |
|---|---|
| `28 Acacia Street, Northview, Batasan Hills, Quezon City, **3004**` | Quezon City ZIP codes run **1100–1138**. 3004 is not a QC code. |
| `Telephone: **(02) 7941996**` | Appears on **none** of their own channels (card records 0976 040 0394, 0976 300 0045, +63 917 781 8222). |
| `Opening hours: Mon–Sun **00:00-00:00**` | All seven days blank/24h. A caterer with no stated hours. |
| `OTHER PLACES NEAR…` opens with **a second Rtuazon entry** ("2011", "0.00 Miles Away") | The directory duplicates them against themselves. |
| Then Nickel Street Filinvest 2, Holy Family Sub-Parish, Filinvest II Homes QC, **Tokyo Tokyo Centris**, Northview II | Five other businesses stacked under their own page. |

The page offers no link to a website of their own.

**Domain.** `rtuazonfoodcatering.com` → NXDOMAIN, Verisign RDAP 404. `rtuazon.ph` → RDAP 404.
Both unregistered. Not a blank-domain lead.

**Rating** (94% recommended, 23 reviews) comes from the indexed Placedigger summary, not
from the page text I extracted — the mockup builder should confirm it renders on the live
page before putting it in a hero.

---

## 3. Fill At Home Catering Services — Quezon City, PH
Card: https://trello.com/c/CBy9LMnN · **ANGLE: blank domain — the PH default did NOT hold**

**Primary.** The card recorded `Domain: No owned domain found`. That was wrong. Following the
standing rule (a lead card's "no owned domain found" is not evidence — guess `<fb-slug>.com`
yourself), the Facebook slug is `fillathome`:

`GET https://fillathome.com/` → **HTTP 200**, 3,135 bytes, and it is a **Squarespace parking page**:

- `assets.squarespace.com/universal/scripts-compressed/parking-page-*.js`
- `<title>Coming Soon</title>`, `<meta name="robots" content="noindex">`
- `<h1>fillathome.com</h1>`
- body: *"We're under construction. Please check back for an update soon."*

RDAP (`rdap.verisign.com/com/v1/domain/fillathome.com`):

```
FILLATHOME.COM | Squarespace Domains II LLC
registration: 2025-09-29   expiration: 2026-09-29   last changed: 2025-09-29
```

A domain matching their Facebook slug exactly, paid for eleven months ago, still empty,
**renewing on 2026-09-29 — 29 days from today.**

**CAVEAT, carried onto the card.** The registrant is privacy-shielded. Ownership is inferred
from the exact slug match, not proven. `BD-01` requires DNS access from the owner anyway, so
confirm they control the Squarespace account **before** quoting a go-live date.

**Secondary — their supplier listing is dead while the fair is alive.**
`GET https://beforeidobridalfair.com/fill-at-home-catering-services/` → **HTTP 404**.
`GET https://beforeidobridalfair.com/` → HTTP 200, title
*"Before I Do Bridal Fair — 52nd Edition | September 12–13, 2026"*.
Their supplier page is gone twelve days before the fair runs.

**Not theirs:** `fillathome.ph` returns a third-party ad-parking redirect page (ad-block
detector JS). Do not cite it.

---

## 4. CakeEaters Bakery and Events — Arcade, NY, USA (the international lead)
Card: https://trello.com/c/MknqPfnN · **ANGLE: dead web presence / free domain**

**Primary.** `GET https://cakeeatersbakery.wixsite.com/cakeeaters-bakery` → **HTTP 404**,
`<title>404 Error: Page Not Found | Wix.com</title>`. This is the **only** web address on the
card, and it is dead. Anyone following it from a directory or from their Facebook bio lands
on a Wix error page.

**Domain is free.** `cakeeatersbakery.com` → NXDOMAIN; Verisign RDAP **HTTP 404**. Unregistered.
This is *not* a `BD-01` blank-domain lead (they own nothing to build on), but the exact-match
name being available is a stronger opening than "you should get a website".

**Third parties hold the record.** chamberofcommerce.com (4.9★, 18 reviews), businessyab.com
and wnypennysaver.com all publish `249 Main St, Arcade NY 14009`, `585-653-5086`, and hours
Tue 9–5, Wed 9–5, Thu 9–3, Fri 9–5, Sat 9–2, closed Sun–Mon. TripAdvisor has a listing
(`d26989208`) but returns HTTP 403 to direct fetch — **its content is unverified, do not quote it.**

**CONFLICT FOR THE MOCKUP BUILDER.** The card's evidence says *"home-based custom cake baker
(no physical storefront)"*. Three directories give a Main Street retail address. One of these
is wrong. Do not put an address in the hero until the owner settles it — use a labelled
placeholder.

**No email on file.** Outreach is Facebook/Instagram DM or phone, and Messenger sending is manual.

**Pricing.** US market → USD Tier W straight off the ladder, build USD 300–500 + USD 50–100/month.
No FX table lookup required.

---

## Finding — the standing PH directory-capture angle did NOT hold across this niche

Three niches in a row confirmed directory capture, and the run brief asked whether it held on
day 1 of catering / home bakers. **It held on 2 of 4 leads, and it was the wrong angle on the
other 2.** The split:

| Lead | Angle chosen | Directory capture available? |
|---|---|---|
| Sweet Kiss | directory capture (marketplace variant) | **Yes — strongest form seen so far** |
| Rtuazon | contradictory listings | Yes, but the listing errors are sharper |
| Fill At Home | **blank domain** | Weak; the paid-for empty domain beats it outright |
| CakeEaters (US) | **dead web presence** | Weak; a 404 on their only URL beats it outright |

Two things this niche taught that the clinic/trade/vet weeks did not:

1. **Catering leads own domains that lead-gen misses.** One of three PH leads had a live,
   paid, empty domain the card recorded as "no owned domain found". The cheap
   `<fb-slug>.com` guess is worth running on *every* card in this niche, not just the ones
   that mention a domain.
2. **Aggregator capture in catering can be total, not partial.** The clinic version is
   "your competitors are listed beside you". The CakeRush/Flower Chimp version is
   "the page with your name on it no longer mentions you and sells someone else's product".
   That is a different and much sharper claim, and it only appears where the aggregator has
   been acquired or pivoted.

## Menu gap logged for the CEO and the Automation Engineer

`OFFER-MENU.md` has niche stacks for clinics (`CL-*`) and trades (`TR-*`) only. **Catering and
home bakers have no niche stack.** All four cards therefore cite the cross-cutting `XC-01`
(60-second reply) and `XC-04` (form-to-CRM) instead, both `IN BUILD`. No new IDs were invented
for this niche — adding `IN BUILD` lines for an engine that does not exist would add surface
without value, and only the Engineer may set build state. Flagging it rather than acting on it.

## Menu compliance

Read from `origin/main:OFFER-MENU.md` this run. Every automation line is `IN BUILD`; only
`W-01`–`W-05` and `BD-01` are `SELLABLE TODAY`. All four cards cite automations as diagnosis
only and mark them `IN BUILD` in the description, so no card carries a promise for step 6 to
fail. Pricing used: PH Tier W at PHP 1,500/month, 6-month term, first month free, no build
fee; US Tier W at USD 300–500 build + USD 50–100/month. No non-USD international quote, so
the dated FX table was not needed.

## Card description headroom left for step 5 (outreach draft)

The 2,048-character cap is shared. Lead Details on these cards run 539–698 characters, so the
~1,250 / ~800 split in `OFFER-MENU.md` does not fit — it would need 2,050 characters before
Lead Details. Strategist sections were cut to 904–980 characters instead:

| Card | Lead Details | Strategy | Total | **Headroom for outreach** |
|---|---|---|---|---|
| Sweet Kiss | 539 | 904 | 1,444 | **604** |
| Rtuazon | 597 | 925 | 1,523 | **525** |
| Fill At Home | 618 | 980 | 1,599 | **449** |
| CakeEaters | 698 | 975 | 1,674 | **374** |

CakeEaters is the tight one. Step 5 should keep that draft under ~370 characters, which is a
normal length for a cold DM — but it is worth knowing before writing rather than after.
