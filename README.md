# Cards Advisor

A study tool for a bank cards advisor on an inbound phone line. It holds the shape of a good call in six steps, the common card issues as clients describe them, what the client needs, and how to handle each one, with the rule behind every figure.

The job is advisor, not only customer service: guide the client through a problem or a decision, give advice and perspective so they can make an informed choice, and resolve the issue.

**Not affiliated with any bank.** The study content is public material (consumer reviews, news archives, the bank's own public pages, Canadian law and regulator guidance), all dated. It is a personal study tool, not an official bank source. The call notes are my own study notes and general call craft, written in my own words; they are not any bank's official model or internal procedure. Every bank figure renders with a *confirm in your systems* badge. Nothing typed into the app leaves the device, and there is no field for a client's details anywhere; the debrief guard blocks card numbers, names, emails, phone numbers and addresses.

## What is in v1

| Surface | What it does |
|---|---|
| **Call** | Opens first. Three values (Care, Connect, Expertise) and six call steps: Be Ready, Welcome and Listen, Solve Immediate Need, Checkpoint, Deeper Discovery and Additional Advice, Making Their Day. Each step shows both sides: what it means for me as the advisor, and what the client experiences. Also a model call, listening for verbal and non-verbal cues, hold etiquette, warm and cold transfers, and the phone software (UCC, universal call centre) states. Button names vary by setup, so the notes name the action, not the click path. |
| **My numbers** | Inside Call. AHT (average handle time) = engage + hold + wrap. Other Not Ready is time taken away from the schedule doing after-call work outside wrap, or leaving the station at my own discretion. Compliance is the share of the scheduled day spent available, target 94 percent, counted against the schedule minus breaks and lunch. Example: a 7.5 hour day with 60 minutes of breaks and lunch leaves 390 productive minutes, so 6 percent is 23.4 minutes of slack. Confirm the targets in your systems. |
| **Issues** | 44 card issues in 13 categories, filterable by category, frequency, how the caller feels, and full or short guide. Full-text search across the quotes. |
| **Full guides (six steps, 11 parts)** | Six issues, laid out on the six call steps. Be Ready: what to have open and what to know. Welcome and Listen: what they say, what they need, how they feel, what they fear losing, the first 15 seconds. Solve Immediate Need: risk checks, questions to ask, options, say this, not this. Checkpoint, Deeper Discovery and Additional Advice, and Making Their Day each have their own panel, then after the call and flag the cause. Every step opens with both sides: for me, and for the client. Detail level: new advisor, specialist, team lead. |
| **Short guides (4 steps)** | The other issues: what callers report, what they need and feel, policy to check, how to handle it. |
| **Practice** | A real client opening, a five-minute clock and five short written parts that cover the whole call. Then a compare screen, a self-score of 0 to 3 on each of the six steps (18 in all), and which of the three values came through. Flashcards live here too. |
| **Policy** | Ten key figures (set by law or card network rules) with their citations, rules by topic, and 62 bank pages grouped by section, each with source, date, staleness and the confirm in your systems badge. |
| **Flashcards** | The six call steps, my numbers, key figures, say this, not this lines and bank page numbers. Missed cards come back sooner. |
| **Me** | My numbers, shift debrief, flashcards, badge and settings in one place. |
| **Shift debrief** | Three lines after a shift, and optionally which of the six steps slipped most. Blocks card and account numbers, names, phone numbers, emails and addresses, and says why. |
| **Highlighter and notepad** | Select any passage to clip it into a notepad, filed by step. Ported from Praxis. |
| **Offline, installable** | Service worker precache, update toast, save and restore a backup of your own work. |

## Navigation

Five tabs, in this order: Call (`#/call`), Issues (`#/`), Practice (`#/practice`), Policy (`#/policy`), Me (`#/me`). A first load with no hash opens on Call. Flashcards (`#/cards`) and Shift debrief (`#/debrief`) keep their routes and are reached from Practice and Me. Search (`/` or Cmd+K) covers issues, call steps, key figures and bank pages.

## Data

```
data/observed.json     44 issues from ~120 public complaints (Trustpilot, creditcardGenius, smartcustomer.com, news). Reddit was unreachable.
data/faq.json          62 public bank-page readings plus captured wording. verify:true on every item.
data/rules.json        Bank Act, FCPF Regulations, FCAC, OBSI, Debit Code, networks, Seniors Code, PIPEDA, CAFC. flag:true where the source is secondary.
data/callflow.json     The Call tab: values, the six steps, model lines, listening cues, hold and transfer craft, the numbers.
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
