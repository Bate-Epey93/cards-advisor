# Cards Advisor

A study tool for a bank cards advisor. It holds the common card issues as clients describe them, what the client needs, and how to handle each call step by step, with the rule behind every figure.

**Not affiliated with any bank.** The study content is public material (consumer reviews, news archives, the bank's own public pages, Canadian law and regulator guidance), all dated. It is a personal study tool, not an official bank source. Every bank figure renders with a *confirm in-system* badge. Nothing typed into the app leaves the device, and there is no field for a client's details anywhere; the debrief guard blocks card numbers, names, emails, phone numbers and addresses.

## What is in v1

| Surface | What it does |
|---|---|
| **Issues** | 44 card issues in 13 categories, filterable by category, frequency, how the caller feels, and full or short guide. Full-text search across the quotes. |
| **Full guides (11 steps)** | Six issues, in four groups. Listen: what they say, what they need, how they feel, what they fear losing. Check and acknowledge: risk checks, the first 15 seconds. Solve: questions to ask, options, say this, not this. Wrap up: after the call, flag the cause. Detail level: new advisor, specialist, team lead. |
| **Short guides (4 steps)** | The other issues: what callers report, what they need and feel, policy to check, how to handle it. |
| **Policy** | Ten key figures (set by law or card network rules) with their citations, rules by topic, and 62 bank pages grouped by section, each with source, date, staleness and the confirm in-system badge. |
| **Flashcards** | Key figures, say this, not this lines and bank page numbers. Missed cards come back sooner. |
| **Practice** | A real client opening, a three-minute clock, then the model answer and a four-line self-score. |
| **Shift debrief** | Three lines after a shift. Blocks card and account numbers, names, phone numbers, emails and addresses, and says why. |
| **Highlighter and notepad** | Select any passage to clip it into a notepad, filed by step. Ported from Praxis. |
| **Offline, installable** | Service worker precache, update toast, save and restore a backup of your own work. |

## Data

```
data/observed.json     44 issues from ~120 public complaints (Trustpilot, creditcardGenius, smartcustomer.com, news). Reddit was unreachable.
data/faq.json          62 RBC public-page readings plus captured wording. verify:true on every item.
data/rules.json        Bank Act, FCPF Regulations, FCAC, OBSI, Debit Code, networks, Seniors Code, PIPEDA, CAFC. flag:true where the source is secondary.
data/breakdowns.json   Six authored full guides (11 steps) for the highest-frequency issues, at three detail levels.
research/              The four briefs the data was built from, with exact wording.
```

The full guides are written by hand, not scraped. The public material supplies what callers report, the quotes and the facts; the advice is written and reviewed against the service craft in Praxis track 16.

## Run it

No build step. Vanilla ES modules.

```bash
node tools/dev-server.mjs 8766
```

Before every commit, stamp the service worker so installed devices see the update:

```bash
node tools/stamp-version.mjs
```

The stamp fails if a watched file is missing from `ASSETS` in `sw.js`, or if `ASSETS` names a file that does not exist. Every build is atomic: installed devices serve only that build's cache and get new code through the update toast, so a file left out of `ASSETS` is missing offline.

## Roadmap

See [PLAN.md](PLAN.md). Next: write full guides for the remaining very common issues; multi-turn practice calls with a hidden twist; more for team leads (queue view, coaching cards); a Reddit pass through a logged-in browser.
