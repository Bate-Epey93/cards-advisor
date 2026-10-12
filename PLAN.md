# Cards Advisor — plan for a standalone app

**Working title:** Cards Advisor (final name TBD; sibling of Praxis in the Enso family)
**Owner:** Bate-Epey93 · **Status:** plan, 2026-10-12 · **Target platform:** offline-first PWA, same stack as Praxis (vanilla ES modules, no build step, localStorage, GitHub Pages)

---

## 1. The job this app is hired for

A new cards advisor takes calls about things that frighten or anger people: money gone, a card refused at a till, a charge they do not recognise. The product knowledge is in the bank's own systems; what is not taught anywhere is *how to read the person in the first fifteen seconds and run the right conversation to the right resolution.* That is the gap this app fills.

| Job story | What the app does |
|---|---|
| When a call type comes up that I have not handled before, I want to see how it usually goes, so I can run it like someone who has done it fifty times. | Searchable issue bank with a guided breakdown per issue. |
| When a client is furious or frightened, I want to know what they actually want underneath the words, so I resolve the real thing and not the symptom. | Every issue carries an emotional and psychological read, and the "what they really want" line. |
| When I am about to say something about policy, I want to know the rule, its source and its date, so I never quote a figure I cannot defend. | Policy facts are stored with source URL and verification date, and the app says "verify in-system before quoting". |
| Between calls, I want ten minutes of practice that feels like a real call, so the next hard one is not my first. | Role-play drills with a clock, scoring against the breakdown. |
| After a shift, I want to capture what went wrong without writing client data anywhere, so I get better without creating a privacy problem. | Shift debrief captures *pattern* notes only; the UI refuses names, card numbers and account numbers. |
| When I am ready to move up, I want the same material at specialist and lead depth, so the app grows with the role. | Each issue has agent / specialist / lead layers (handle it → own the edge cases → fix the system that creates it). |

**Who it is not for:** clients. It is a practice and reference tool for the advisor. It is not an official RBC source and says so on every policy card.

## 2. The guided breakdown — one structure for every issue

Every issue in the bank is written to the same eleven-part template. This is the heart of the app; the UI is a walkthrough of it.

1. **Surface request** — what the client says, in their words (from real posts and FAQ phrasing).
2. **Underlying job** — what they are actually trying to get back to (a working card at the till tonight; certainty the money is safe; a charge gone before the statement; their dignity after being declined in front of someone).
3. **Emotional read** — the dominant state and the tell for it on the phone: fear (speech fast, repeats the amount), anger (opens with the history of contacts), embarrassment (over-explains, apologises), confusion (asks the same question twice), resignation (flat voice, "I know there's nothing you can do").
4. **Psychological needs in play** — which of control, fairness, competence, safety and being believed is threatened. Fraud threatens safety and being believed; a decline threatens competence and dignity; a limit cut threatens fairness and control.
5. **Risk and compliance flags** — anything that changes the conversation: possible fraud in progress, vulnerable client signals, third-party on the line, a complaint that must be logged, a scam pattern the client has not recognised yet.
6. **Engage: the first fifteen seconds** — the acknowledgement that proves you heard the specific thing, and the one sentence that tells them what happens next.
7. **Diagnose: the questions, in order** — the shortest question path to the fork in the road, with what each answer tells you.
8. **Resolve: the paths** — a decision tree with the realistic outcomes, including the "no" paths and how to say them.
9. **Say this / not this** — paired lines, with why.
10. **After the call** — what must be documented, what the client must receive in writing, what follow-up you own.
11. **Prevent and feed back** — what upstream fix would stop this call existing, and how a lead would report it (volume × handle time × sentiment).

Plus, per issue: **policy facts** (figure · source URL · verified date · "confirm in-system" flag), **frequency** (from the corpus), **related issues**, and **three depths** (agent / specialist / lead).

## 3. The corpus

Built in three layers, kept separate so provenance is never lost:

- **Observed demand** — what clients actually report. The plan was to mine Reddit (r/PersonalFinanceCanada, r/CreditCardsCanada, r/RBC); Reddit was unreachable on every route available (search refused the domain, direct fetch blocked, old.reddit.com disallowed in the browser pane), so the sweep used Trustpilot, creditcardGenius, smartcustomer.com and news archives (CBC, Global News) instead. Same fields: issue, verbatim quotes with URLs, emotional state, what they wanted, what made it worse. *Poster claims about policy are stored as claims, never as facts.* A Reddit pass through Claude in Chrome (the user's own logged-in browser) is the open follow-up.
- **Official answers** — RBC's own FAQ and help pages: question, condensed answer, figures verbatim, source URL, fetch date.
- **Rules of the game** — the Canadian regulatory and network layer: Bank Act consumer-protection framework (complaint timelines, OBSI as external body), FCAC guidance on liability caps, Visa/Mastercard/Interac dispute windows and zero-liability wording, grace-period and interest rules, seniors code, PIPEDA verification limits.

> Corpus status, 2026-10-12: gathered and structured. `data/observed.json` holds 44 issues in 13 categories from about 120 complaints (Trustpilot, creditcardGenius, smartcustomer.com, news archives; no Reddit, see above). `data/faq.json` holds 62 RBC public-page items plus captured wording (complaint ladder, zero-liability text, dispute limits, delivery times, lock controls, contacts). `data/rules.json` holds the ten must-know figures and seven rule sections with statute or regulator citations, each dated, with `flag: true` on the two that rest on secondary sources (Mastercard's 120-day window, provisional-credit timing). `data/breakdowns.json` holds six authored eleven-part breakdowns for the highest-frequency issues (declined after a fraud flag, locked abroad, unauthorised charges, fraud-alert loop, replacement gone wrong, non-delivery dispute), each with three depths. Every policy record carries `source`, `fetched` or `asOf`, and `verify: true` where the figure must be checked in-system before being said to a client. Full briefs with exact wording are in `research/`.
>
> Known contradictions logged in `faq.json` captures: RBC's pages give the cards line as "24-hour" in one place and "regular business hours" in another; two different Avion Travel hour sets; a search-engine summary claiming a dispute is "considered closed after 10 business days" appears on no loadable page and is excluded. Corrected during research: OBSI was designated 17 Oct 2023 and became sole external complaints body 1 Nov 2024 (not 2023); the $50 liability cap is Bank Act s. 627.33, not the pre-2022 Cost of Borrowing Regulations.

**Editorial rule:** the breakdowns are written by the author, not scraped. The corpus supplies the demand signal, the quotes and the facts; the judgement layer (parts 2 to 11) is authored and reviewed against the service craft in Praxis track 16.

## 4. Features, in build order

### v1 — reference and study (first release)
- **Issue bank**: search and filter by category, frequency, emotional state, risk flag. Full-text search across quotes.
- **Guided breakdown walkthrough**: the eleven parts as a stepped reader, with the policy facts panel and the "confirm in-system" badge.
- **Depth switch**: agent / specialist / lead view of the same issue.
- **Policy lookup**: every fact with its source and date, grouped by topic; a staleness warning after 90 days.
- **Study tools**: flashcards over the figures and the say-this lines; a weak-spot deck.
- **Highlighter and notepad** (ported from Praxis).
- **Offline, installable, update toast** (ported from Praxis).

### v2 — practice
- **Role-play drills**: the client's opening lines (from real quotes), a 3-minute clock, you type or speak the engage line, the diagnostic questions, the resolution. Self-scored against the breakdown; optional second opinion via the Praxis review pack.
- **Call simulations**: 10-minute multi-turn scenarios with a hidden twist (the "fraud" is a forgotten subscription; the angry caller is a scam victim who has not realised).
- **Shift debrief**: pattern-only notes (issue type, what worked, what to look up), with a client-data guard that blocks digits that look like card or account numbers and common name patterns.

### v3 — the lead layer
- **Queue lens**: enter a week's call mix by issue type and the app ranks drivers by volume × handle time × sentiment and drafts the monthly root-cause report.
- **Coaching cards**: for each issue, the two behaviours to listen for in a call review and the coaching question to ask.
- **Macro and KB skeletons** for the written channels, in the Praxis style.

## 5. Architecture

Same as Praxis, deliberately: one dependency-free PWA so the two can share code and the muscle memory transfers.

```
cards-advisor/
  index.html            app shell
  css/app.css           Enso tokens, liquid glass, light/dark
  js/app.js             router, shell, search
  js/issue.js           breakdown walkthrough, depth switch
  js/policy.js          facts panel, staleness, verify badge
  js/practice.js        role-play drills, simulations, clock
  js/debrief.js         shift notes with the client-data guard
  js/store.js           localStorage, export/import, backup nudge
  js/highlight.js       ported from Praxis
  js/pwa.js  sw.js      offline + update toast, stamped hash
  data/issues.json      observed demand + authored breakdowns
  data/faq.json         official RBC items with source + fetched
  data/rules.json       regulatory layer with source + date
  data/glossary.json
  tools/stamp-version.mjs, dev-server.mjs, make-icons.mjs  (ported)
```

**Hard rules**
- No client data, ever. The debrief screen blocks 8+ digit runs, 16-digit card patterns and "Mr/Mrs/Ms + capitalised word" and explains why.
- No network calls except the optional second-opinion request, as in Praxis.
- Every policy figure renders with source, date, and the line "confirm in your systems before telling a client".
- Not affiliated with RBC; the corpus is public material; the app carries that notice.

## 6. Content pipeline

1. Research agents gather observed demand, official answers and rules (done 2026-10-12, see `research/`).
2. Author merges into `data/*.json` with a validation script (every policy fact has source + date; every issue has all eleven parts; no quote without a URL).
3. Monthly: re-fetch FAQ URLs, diff, flag changed figures; staleness clock drives the in-app warning.
4. Quarterly: re-run the observed-demand sweep for new issue types (new fraud patterns appear fast). First run should add Reddit via Claude in Chrome, since the automated routes cannot reach it.

## 7. Risks and how the plan handles them

| Risk | Handling |
|---|---|
| Quoting a wrong or stale figure to a client | Figures carry source + date + verify badge; 90-day staleness warning; the app never claims to be the source of truth |
| Client data ending up in a personal app | Debrief guard, no free-text fields that invite it, privacy notice on first run |
| The app looking like an RBC product | Clear non-affiliation notice; no RBC marks |
| Breakdowns that sound right but are generic | Each one must cite a real quote and a real policy fact; reviewed against Praxis track 16 rubric |
| Scope creep into a CRM | Not a ticketing tool; nothing per-client is stored |

## 8. Success measures (for the advisor, not the app)

- First-contact resolution on your own calls, tracked privately by issue type in the debrief.
- Time to confidence on new issue types: calls handled before you need to put someone on hold to check.
- QA scores on the empathy and accuracy lines, which are exactly the two the breakdown trains.
- Progression evidence: the lead-layer outputs (root-cause reports, coaching cards) become the portfolio for the team-lead conversation.

## 9. Roadmap

| Phase | Scope | Est. effort |
|---|---|---|
| 0 | Corpus gathered, breakdown template agreed, 25 issues authored | 2 to 3 days of writing |
| 1 | v1 reference and study app, deployed | 1 day of build on the Praxis base |
| 2 | v2 practice: drills, simulations, debrief guard | 1 to 2 days |
| 3 | v3 lead layer | 1 day, once there is real call-mix data to design against |
