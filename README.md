# Cards Advisor

A study tool for a bank cards advisor. It holds the common card issues as clients describe them, what they want underneath, and a guided breakdown of how to engage, diagnose and resolve each one, with the rule behind every figure.

**Not affiliated with any bank.** The corpus is public material (consumer reviews, news archives, the bank's own public pages, Canadian law and regulator guidance), all dated. Every bank figure renders with a *confirm in-system* badge. Nothing typed into the app leaves the device, and there is no field for a client's details anywhere; the debrief guard refuses them.

## What is in v1

| Surface | What it does |
|---|---|
| **Issue bank** | 44 issues in 13 categories, filterable by category, frequency, emotion and whether a guided breakdown exists. Full-text search across the quotes. |
| **Guided breakdown** | The eleven-part walkthrough: surface request, underlying job, emotional read, psychological needs, risk flags, the first fifteen seconds, the questions in order, the resolution paths, say this / not this, after the call, prevent and feed back. Depth switch: agent, specialist, lead. |
| **Policy lookup** | Ten must-know figures with statute citations, seven rule sections, 62 bank-page readings grouped by section, each with source, date, staleness and the verify badge. |
| **Flashcards** | The figures, the say-this lines and the bank's numbers, in Leitner boxes with a weak-spot deck. |
| **Role-play drills** | A real client opening, a three-minute clock, then the breakdown revealed and a four-line self-score. |
| **Shift debrief** | Three pattern lines after a shift. Blocks card and account numbers, names, phones, emails and addresses, and says why. |
| **Highlighter and notepad** | Select any passage to clip it into a notepad, filed by part. Ported from Praxis. |
| **Offline, installable** | Service worker precache, update toast, export and import of your own notes. |

## Data

```
data/observed.json     44 issues from ~120 public complaints (Trustpilot, creditcardGenius, smartcustomer.com, news). Reddit was unreachable.
data/faq.json          62 RBC public-page readings plus captured wording. verify:true on every item.
data/rules.json        Bank Act, FCPF Regulations, FCAC, OBSI, Debit Code, networks, Seniors Code, PIPEDA, CAFC. flag:true where the source is secondary.
data/breakdowns.json   Six authored eleven-part breakdowns for the highest-frequency issues, at three depths.
research/              The four briefs the data was built from, with exact wording.
```

The breakdowns are authored, not scraped. The corpus supplies the demand signal, the quotes and the facts; the judgement layer is written and reviewed against the service craft in Praxis track 16.

## Run it

No build step. Vanilla ES modules.

```bash
node tools/dev-server.mjs 8766
```

Before every commit, stamp the service worker so installed devices see the update:

```bash
node tools/stamp-version.mjs
```

## Roadmap

See [PLAN.md](PLAN.md). Next: author breakdowns for the remaining very-common issues; multi-turn call simulations with a hidden twist; the lead layer (queue lens, coaching cards); a Reddit pass through a logged-in browser.
