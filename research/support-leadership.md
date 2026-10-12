# Support leadership: from cards advisor to head of support

Research brief for an intermediate-to-senior curriculum. Learner context: new cards advisor in a Canadian bank's contact centre, aiming at specialist, team lead, manager and head of support/CX. Compiled 12 October 2026. Every figure carries its source and date; where a number comes from a vendor blog or a second-hand citation, it is flagged so the curriculum can present it as "directional" rather than "benchmark".

Source-reliability key used throughout:
- **[P]** primary (regulator, standards body, the organisation's own handbook, the research house's own release)
- **[S]** secondary but reputable (trade press summarising a named primary)
- **[V]** vendor content or unverified aggregator; use as a range, not a fact

---

## 1. The career ladder

### 1.1 Published ladders worth quoting

**GitLab Support (public handbook)** [P]
- IC track: Customer Support Representative, Associate Support Engineer, Intermediate Support Engineer, Senior Support Engineer, Staff Support Engineer. Index: https://handbook.gitlab.com/handbook/engineering/careers/matrix/support/
- Associate: expectation of "customer support experience and a desire to grow Customer Support skills" (https://handbook.gitlab.com/handbook/engineering/careers/matrix/support/associate/).
- Intermediate: emphasis on self-driven growth, "initiating pairings, completing learning modules, and building product and troubleshooting knowledge" (https://handbook.gitlab.com/handbook/engineering/careers/matrix/support/intermediate).
- Senior: "mentoring teammates on debugging techniques", "involved with hiring new Support Engineers", and taking "large issues with vague requirements" (https://handbook.gitlab.com/handbook/engineering/careers/matrix/support/senior/).
- Assigned Support Engineer is a specialty, not a rung: a senior-level engineer who "leads the relationship with up to 5 assigned accounts" (https://handbook.gitlab.com/job-families/engineering/support-engineer).
- Management track (https://handbook.gitlab.com/job-description-library/engineering/support-management/):
  - Manager, Support Engineering: span "~10 Intermediate and Senior Support Engineers"; requirement "more than 2 years experience leading Support Engineering teams"; holds regular 1:1s, trains engineers to interview, still "engages directly with customers on tickets" and sits in an escalation on-call rotation.
  - Senior Manager: span "~3 Support Managers, 0-2 Staff Support Engineers, ~30 Support Engineers (indirectly)"; requirement "Past experience (3 to 5 years) in Support Management"; runs skip-level 1:1s; owns procedures, policies and budget with management.
  - Director of Support: "Manage multiple teams and projects", "Draft and Report quarterly OKRs", "Own the support experience across all products", "Represent the company publicly at conferences".
  - VP of Support: "Set the vision for GitLab's global Support Department", "Lead monthly Support Key Review meeting", partners with Finance on budget and capacity planning, defines KPIs such as SLAs and customer satisfaction.

**Buffer (career framework, published 27 January 2019, updated from 2017)** [P]
- Two paths, Maker (IC) and Manager, each with vertical Levels and horizontal Steps. "For a teammate to go from one Level to another is a large and distinct jump" in area knowledge, role complexity and scope; level moves go through a calibration process with People/Finance. Steps "are not a 'progress bar'"; "There is no Step Zero."
- Customer Advocacy example given verbatim: a newly promoted "Customer Advocate II might be a Maker at Level 2 and Step 1." Managers have four Levels.
- https://buffer.com/resources/career-framework/ and the Notion framework https://buffer.notion.site/Buffer-Career-Framework-Levels-Steps-2c37beef51ff407599c36a463cec3113

**Help Scout** [P for job posts; S for the ladder]
- Job posts state: "We actively promote from within the Customers team - both for managers and specialists." Technical Support Specialists "help a minimum of about 250 customers a month" (https://www.helpscout.com/company/careers/0e9111ca-9c97-4825-9d38-4f576460b8fd).
- Sr. Support Manager posting: leads daily frontline operations, coaches a six-person team across time zones "while staying in the queue", and wants someone "comfortable with metrics and performance management, but you know that numbers tell only part of the story" (https://www.helpscout.com/company/careers/5c5200c6-74a9-4ed7-9c47-fe71c1c36c9b).
- An undated Help Scout-hosted "support advancement" PDF describes tiers with time-in-role thresholds of 24+ and 36+ months and skills such as integrations, API and scripting; the file now returns 404, so treat as historical.

**Shopify and Automattic** [P for job posts]
- Shopify Support Advisor onboarding: "following 4 weeks of training and 2 weeks of mentoring, you will begin responding to our merchants on live channels as part of a small squad." Current title is Merchant Support Advisor at "Role Level: Mid-Level" (https://www.businessoffashion.com/careers/job/184598/support-advisor-remote-western-canada-/).
- Automattic Happiness Engineer posts: "We view support as a long-term career, not a stepping stone. Some of our most valued HEs have been here for a decade or more"; the company "promotes internally for leadership (including senior leadership)" (https://jointaro.com/jobs/automattic/happiness-engineer).

### 1.2 A realistic bank contact-centre ladder

The six rungs below synthesise the public ladders above with contact-centre practice (COPC, ICMI, Call Centre Helper) and the FCAC complaint regime. Tenures are typical ranges, not rules; banks differ.

| Rung | What changes in scope | Competencies that get you promoted to it | Typical tenure before next move | What the interview tests |
|---|---|---|---|---|
| **1. Agent / cards advisor** | Own one conversation at a time; metrics are personal (QA, AHT, adherence, FCR, CSAT). | Product knowledge, verification and fraud discipline, clear writing/speaking, resilience, schedule adherence. | 12 to 24 months | Role play, de-escalation, compliance recall, attention to detail. |
| **2. Senior advisor / specialist** | Handles complex queues (disputes, fraud, retention, complaints), takes transfers, floor-walks, pilots new tools (TD piloted its genAI assistant with experienced "resource agents" first; stories.td.com, 15 Aug 2025). | Top-quartile quality with stable AHT; peer teaching; written procedure contributions (KCS Contributor behaviours: articles that "don't need rework"); judgement on policy exceptions; FCR ownership. | 12 to 24 months | Case walk-throughs, "show me how you'd coach a peer on this call", knowledge-article writing test. |
| **3. SME / escalations / QA analyst / trainer** | Owns a domain (e.g., credit-card disputes under the network rules), is the "Designated Employee" tier in the FCAC sense for complaints, scores calls, runs nesting. | Calibration discipline (scoring within tolerance of the group), root-cause thinking (proximate vs root cause), ability to write a procedure others can follow, data literacy in the QA and WFM tools, teaching skills. | 18 to 36 months | Score a recorded call and defend it in a mock calibration; redesign a scorecard item; explain a 56-day complaint timeline. |
| **4. Team lead / supervisor** | 10 to 15 direct reports; accountable for team service level, QA, adherence, attrition; runs 1:1s, side-by-sides and coaching; first escalation point; intraday calls on breaks, overtime and offline time. GitLab's manager span is "~10"; Help Scout's Sr. Support Manager runs six. | Coaching (not telling): GROW-style conversations; feedback that is specific and timely; reading WFM dashboards (occupancy, shrinkage, adherence); fair performance management (documented, consistent, accommodating); composure "when control slips". | 2 to 4 years | Diagnose an underperformer (root cause before action); resolve an AHT-vs-CSAT conflict; prioritise competing tasks; present a team scorecard; how you work with senior management. |
| **5. Manager (site / line of business)** | Several team leads; owns budget lines (headcount, overtime, tooling), the hiring plan, a monthly ops review, vendor or BPO relationships, complaint-handling compliance for the unit. | Capacity planning (forecast to Erlang C to shrinkage to schedules); scorecard design and weighting; business cases with cost per contact and attrition cost; cross-functional influence (WFM, QA, product, compliance); running a monthly business review with actions and owners. | 3 to 5 years (GitLab asks "3 to 5 years in Support Management" before Senior Manager) | Build a staffing plan from a forecast; present a business case for 5 FTE or a QA tool; walk through a monthly ops review deck; describe how you'd implement a regulator finding. |
| **6. Senior manager / head of support or CX** | Multiple sites or channels; owns strategy, OKRs, the AI roadmap and its governance, the voice-of-customer loop to product, regulatory relationship (FCAC reporting, OBSI), and the quarterly business review upward. GitLab: Director "owns the support experience across all products"; VP "leads monthly Support Key Review", "drives quarterly OKRs", partners with Finance on capacity planning. | Strategy and narrative (cost-to-serve, deflection, experience); governance under OSFI E-23 and the FCAC frameworks; executive communication; leading managers (skip-levels); designing the operating model (in-house vs BPO vs AI). | 4+ years | Case study: cut cost per contact 15% without hurting FCR; defend an AI deployment to a risk committee; present a QBR; a 90-day plan for a failing site. |

Interview-evidence note: recruiter guides for team-lead interviews consistently probe "identifying root causes, training gaps, clarity issues, motivation, or workload" before acting, and warn that strong agents are "not automatically strong leaders" (https://www.hirequotient.com/blog/call-center-team-leader-interview-questions ; https://vervoe.com/recruitment-guides/how-to-hire-a-call-centre-team-leader/). [S]

---

## 2. Contact-centre operations a lead or manager must run

### 2.1 Workforce management (WFM)

**The staffing chain.** Forecast contacts and AHT per interval; convert to required agents with Erlang C (or simulation where skills-based routing makes Erlang unreliable); divide by (1 minus shrinkage) to get scheduled headcount; build schedules; then manage adherence and occupancy intraday.

- Erlang C: developed by A.K. Erlang in 1917; a queueing model giving the probability a contact waits, given traffic and staffing; assumes Poisson arrivals, exponential service times and no abandonment, so it overstates staffing when callers hang up (https://www.techtarget.com/enterprise-software/definition/Erlang-C ; https://www.assembled.com/wfm-glossary/erlang-formulas). [S]
- ICMI poll (2012): "Nearly 80% of respondents use some form of Erlang C"; ICMI's nine-step planning process places Erlang C at step 4 and notes skills-based routing "present challenges" that may need simulation (https://www.icmi.com/resources/2012/calculating-base-staff). [P]
- Shrinkage: paid time not available for contacts (breaks, meetings, training, absence). Call Centre Helper's rule of thumb: ~10% of time to breaks, 2 to 3% to meetings and training; typical total 30 to 35%. Divide, do not add: "70 agents needed at 30% shrinkage means 70 / 0.7 = 100 scheduled, not 91" (https://callcentrehelper.com/biggest-cause-of-shrinkage-eliminate-it-123970.htm ; summary at https://www.lorikeetcx.ai/articles/wfm-metrics-adherence-shrinkage-occupancy-2026). [S]
- Occupancy vs utilisation: occupancy = time handling contacts and after-call work divided by logged-in time; utilisation = productive time divided by total paid time including breaks and training, so utilisation is always the lower figure (https://www.getmacha.com/glossary/occupancy-rate). [V] Call Centre Helper's practitioner thread: "There Is No Definitive Answer to What Occupancy Should Be"; "Occupancy is an output of the staffing decisions you take vs. the demand"; size matters, roughly 85% for 200+ agents, 80% for 100 to 150, 70 to 75% under 100; "Above 80% Burnout Is Real"; higher service-level targets lower achievable occupancy (https://callcentrehelper.com/what-is-the-right-figure-for-contact-centre-occupancy-206495.htm). [S]
- Schedule adherence: time in the scheduled state divided by scheduled time; targets commonly 85 to 95%, "100% adherence is just unrealistic" (https://www.callcentrehelper.com/how-to-improve-adherence-strategies-266212.htm). [S]
- Service level "80/20": 80% of calls answered within 20 seconds. No documented origin; Verint says it "was arbitrarily chosen in the early days of call center technology"; Fonolo records the Rockwell ACD and AT&T-study folklore (https://www.verint.com/blog/managers-guide-to-call-center-service-levels/ ; https://fonolo.com/?p=29806). [S] Teach it as a convention to be set per queue, not a law.
- Pooling: because Erlang C rewards scale, splitting a queue into small skills lowers occupancy for the same service level (the Call Centre Helper size table above shows the effect).

### 2.2 Queue and intraday management

Real-time analyst job descriptions (Assurant Canada, Remitly, IBEX, 2025-2026) define the role: "Real-time monitoring of all queues, making adjustments to task allocations driven by real-time trends"; "recommend and adjust staffing levels through overtime, VTO and/or skilling"; schedule offline activity (coaching, training, meetings) "so they don't hit service levels"; "publishes hourly, mid-day, and end of day performance reports"; "real-time re-forecasting and apply countermeasures to optimize service levels and occupancy"; first point of contact "for any escalations, outages, system issues" (https://jobs.assurant.com/en/jobs/job/intraday-workforce-analyst-canada-virtual-r-113325/ ; https://phcareers-ibex.icims.com/jobs/20860/wfm-analyst-sr-real-time/job). [P for the postings]

A team lead's intraday levers, in order of cost: move breaks and offline time; flex skills; offer voluntary time off when over-staffed; offer overtime when under; call back/queue callback; message the IVR; escalate to the duty manager for cross-site overflow.

### 2.3 Business continuity (BCP)

Components that recur across practitioner sources (NICE, Telnet Networks, FusionCX, Tata Communications): telephony failover with number retention and queueing when agents are unavailable; work-from-home capability with VPN, headset and home-QA standards; voice as the critical constraint ("agents can't simply work from home on a laptop"); geographic redundancy across sites; continuous backup of interaction records; printed copies of the plan for network outages; regular testing; customer self-service notifications to prevent overload (https://www.nice.com/blog/foundational-readiness-business-continuity-for-the-work-from-home-contact-center ; https://telnetnetworks.ca/blog/4-key-factors-when-planning-business-continuity-for-your-contact-centre-1-1 ; https://www.fusioncx.com/blog/call-center/call-center-business-continuity-and-disaster-recovery/). [S/V]

For a bank, BCP sits inside OSFI's operational resilience expectations (Guideline E-21) and third-party risk (B-10); the July 2026 OSFI AI bulletin adds: "map AI dependencies, test outage scenarios, keep manual fallbacks" (see section 6).

---

## 3. Quality programmes

### 3.1 Scorecard design
- Start from measurable standards: "professionalism, accuracy, empathy, and compliance"; blend hard outcomes (FCR, CSAT) with behaviours (listening, etiquette); tailor by channel (https://vatis.tech/blog/contact-center-quality-assurance-best-practices ; https://www.omind.ai/blog/qms/call-center-quality-assurance-ai-qa-scorecard/). [V]
- COPC balanced-scorecard guidance: program-level scorecards track "service level, quality, efficiency, customer satisfaction, and cost"; use weighted (not averaged) composites; standardise categories and weights across sites, vary targets ("Common code, unique floor plans"); review weights annually; agent-level scorecards drive coaching and "focus each coaching session on one or two areas, not the full scorecard" (https://www.copc.com/using-a-balanced-scorecard-for-performance-management/). [P]
- COPC CX Standard Release 8.0 (current): "Apply the same performance standards regardless of whether a human or technology serves the customer"; "Technology and people that make frequent errors must be disabled from transactions until issues are addressed"; regular audits of knowledge management systems now required; AI ethics policy required (https://www.copc.com/copc-standards/r8-whats-new/). [P]

### 3.2 Calibration sessions
Standard format: evaluators (QA, supervisors, team leads, trainer, BPO partner) score the same interaction independently; the gaps are the agenda; agree the rationale and write it into the scoring guide; close with "Did the team grade the call accurately? If not, what should have happened instead? How should similar calls be graded going forward?"; monthly cadence; frame as alignment not blame (https://www.verequest.com/post/best-practice-managing-a-qa-calibration-session ; https://www.voicespin.com/glossary/call-calibration/). [S/V] Track inter-evaluator variance over time as the health metric of the programme.

### 3.3 Auto-QA with AI (2025-2026 state)
- Manual QA typically samples 2 to 3% of interactions; automated scoring can cover 100% (Scorebuddy, Q2 2026 pulse, 600 UK/US contact-centre professionals, fielded July 2026): "Nine in ten contact centers now use AI to evaluate interactions"; trust gap: 76% of managers trust AI QA scores vs 57% of agents (https://www.cxtoday.com/?p=993145). [S, vendor-sponsored]
- Scorebuddy and Call Centre Helper report (11 December 2025): 44% of contact centres show strong interest in automated or real-time scoring; spreadsheet reliance fell from 65% to 55% year on year; barriers are budget, integration and "uncertainty about AI safety and accuracy" (https://www.scorebuddycx.com/ai-powered-qa-report-2025). [P, vendor]
- McKinsey on why sampling fails: coaches base feedback on "four to six calls out of the five or six hundred the agent conducts every month" (https://www.mckinsey.com/capabilities/operations/our-insights/smarter-call-center-coaching-for-the-digital-world). [S]
- Design implication for a bank: auto-QA scores compliance items (verification completed, disclosures read, no prohibited phrases) at 100% coverage; humans calibrate the AI monthly like any evaluator; the COPC R8 "disable on frequent errors" rule applies to the model too.

### 3.4 Coaching cadences and the coaching-vs-feedback distinction
- Feedback = specific, timely observation flowing from leader to agent ("you skipped the verification question at 1:42"). Coaching = the agent does most of the diagnosis; "Coaching shouldn't involve just telling someone what they need to do and where they need to improve" (Kim Ellis in Call Centre Helper, https://callcentrehelper.com/contact-centre-coaching-models-144743.htm). [S] Use feedback for the observation, then coaching for the plan.
- GROW (John Whitmore, *Coaching for Performance*, 1992): Goal ("What do you want?"), Reality ("Where are you now?"), Options ("What could you do?"), Will ("What will you do?"); relies on open questions so "the advisor take[s] control of their self-improvement" (https://www.callcentrehelper.com/the-grow-model-coach-your-agents-216726.htm ; https://www.scorebuddycx.com/blog/the-grow-methodology-for-contact-centers). [S] Let the agent self-assess before the leader gives their view.
- Cadence evidence:
  - J.D. Power: "50% of certified customer service organizations allocate between 2-4 hours of monthly coaching per front-line agent," and the top scorers allocate more (https://www.dev.jdpower.com/?p=544). [S]
  - Balto survey of 515 US managers (22 October 2021): 6 sessions per agent per month averaging 34 minutes; 2 to 3 hours prep per session; at least 4 sessions before a skill sticks; "Managers are spending 75% of their time not coaching, but re-coaching" (https://www.balto.ai/resources/research/call-center-coaching-manager-survey/). [P, vendor, dated]
  - COPC: monthly agent-level 1:1 on one or two areas, with mid-month check-ins for agents still ramping (link above). [P]
- A workable weekly rhythm for a team lead of 12: one 20-minute 1:1 per agent per week (or fortnightly with a monthly scorecard review), one side-by-side or remote screen-share per agent per month (more during nesting), two to three call reviews per agent per month from auto-QA flags, and one team huddle a week.

### 3.5 Performance improvement plans done fairly (Canada)
Law-firm guidance (Ontario and Alberta) converges on: use a PIP only after informal coaching has failed; "state measurable issues and goals"; a defined 30 to 90-day window; list the training and support the employer will provide; keep targets "in line with the employee's job description and relevant collective bargaining agreements"; consider human-rights and accommodation duties (disability, family status); hold and document regular check-ins; courts "are now scrutinizing the intent and fairness behind these documents" and have rejected terminations built on a flawed PIP (https://stlawyers.ca/labour-employment-law-employees/performance-improvement-plan-ontario/ ; https://achkarlaw.com/insights/ontario/performance-improvement-plan/). [S] Contact-centre caution: make sure AHT or QA targets reflect the queue the agent actually works, and record any metric change.

---

## 4. The metrics ladder

### 4.1 Who owns which metric

| Level | Primary metrics | Secondary / context |
|---|---|---|
| Agent | QA score, FCR (survey-based), CSAT, AHT, schedule adherence, transfer rate, compliance errors | Occupancy (they do not control it), knowledge contributions |
| Team | Service level and ASA for the queue, team QA and calibration variance, team FCR/CSAT, adherence, absence, coaching hours delivered, attrition | Repeat-contact rate, escalations |
| Unit / site | Forecast accuracy, shrinkage actual vs plan, occupancy, abandon rate, cost per contact, contacts per customer, deflection, complaint volumes and 56-day compliance, attrition and time to proficiency, eNPS | Overtime %, BPO SLA attainment |
| Executive | Cost to serve, NPS/CX index, contact rate per customer, deflection and self-service success, complaint trends and regulatory findings, AI governance status, attrition cost | Profitability of the function, strategic OKRs |

Definitions the curriculum must fix: FCR (survey-based "was your issue resolved" vs repeat-contact-within-7-days; SQM uses the customer survey), ASA (average of answered calls, excluding abandons), abandon rate (after a short threshold such as 10 to 20 seconds), contact rate per customer (contacts divided by active customers, the executive-level cost driver), deflection (section 5), CES ("how easy was it", 1 to 7), eNPS (would you recommend working here, same arithmetic as NPS).

### 4.2 Benchmarks, 2025-2026

- **FCR.** SQM Group: average across industries ~70% (2025); "only 5% are at the world class VoC FCR performance level standard of 80% or higher" among ~500 North American centres; "a good First Call Resolution rate is 70% to 75%"; financial sector 71% in SQM's 2021 industry table; "for every 1% improvement in FCR, there is a 1% improvement in customer satisfaction" (https://www.sqmgroup.com/pdf/FCRWhitepaperPart2.pdf ; https://www.sqmgroup.com/resources/library/blog/fcr-benchmarking-industry-results-2021). [P] Financial-industry example: Jackson National Life won SQM's "Highest Customer Service - Financial Industry" award for 2025 for the highest FCR rating and holds the 80%+ world-class certification (BusinessWire, 4 March 2026). [S]
- **CSAT.** Banking and financial services 81% (QuestionPro Q1 2025 US consumer survey, n=1,000, up 2 pts) (https://www.questionpro.com/blog/csat-benchmarks/); ACSI US banks 80 in both the 2025 and 2026 Finance Studies, regional and community banks 83, super-regionals 77 (ACSI, 25 Feb 2025 and 24 Feb 2026, https://theacsi.org/news-and-resources/press-releases/2025/02/25/press-release-finance-study-2025). [P/S]
- **Canadian banks specifically.** J.D. Power 2025 Canada Retail Banking Satisfaction Study (16 Oct 2025; 14,399 customers, fielded Jan-Feb and Jul-Aug 2025): Big 5 satisfaction fell 7 points to 604/1,000 while midsize banks rose 5 to 649; RBC highest among the Big 5, Tangerine highest among midsize; seven factors include trust, people, digital and problem resolution (https://www.jdpower.com/business/press-releases/2025-canada-retail-banking-satisfaction-study). [P] Forrester's 2025 Canada multichannel banking report says CX "continues to decline across seven multichannel banks" (paywalled, https://www.forrester.com/report/forresters-canadian-multichannel-banking-total-experience-score-rankings-2025/RES191261). [P, abstract only]
- **Cost per contact.** Gartner (Feb 2024): median $1.84 self-service vs $13.50 assisted, and "assisted channels (such as phone, chat and email) tend to have similar costs per contact" (https://www.gartner.com/en/documents/5164231). [P, abstract] ContactBabel US 2025: inbound voice $7.16, email $6.05, web chat $5.06 (via https://lorikeetcx.ai/articles/contact-center-benchmarks). [S] Deloitte Digital 2026 Global Contact Center Survey (9 June 2026): AI-mature centres report "85% greater contact center profitability" and lower attrition and cost per contact than low-maturity peers; 35% of centres already use agentic AI (https://www.deloittedigital.com/us/en/news/press-releases/2026/deloitte-digital-2026-global-contact-center-survey.html). [P] A third-party summary attributes $7.80 per assisted contact in 2026 vs $6.70 in 2024 to the same survey (unverified, [V]).
- **AHT / ASA / abandon.** No authoritative bank-specific 2025 figure found. Vendor ranges: financial services AHT 5 to 6 minutes because of verification (https://callin.io/average-handle-time-call-center/); ASA 25 to 35 seconds "for several consecutive benchmark cycles" attributed to ICMI (https://stealthagents.com/research/customer-support-average-speed-of-answer-statistics-2026); voice abandon 3 to 8% (https://bluetweak.com/blog/call-center-kpi-benchmarks). [V] Teach these as ranges and have the learner pull the bank's own numbers.
- **Attrition and its cost.** NICE's 2025 "Managing the Modern Contact Center" report (2024 actuals): 39% average agent attrition, down from 49% in 2023; North America 36% (via https://stealthagents.com/research/bpo-agent-attrition-statistics-2026, [S/V]). ContactBabel's Steve Morrell (Nov 2025): US attrition "about 30% on average" and stable for seven or eight years (https://nojitter.com/contact-centers/agent-attrition-rates-are-high-verint-survey-finds). [S] Verint, *State of Agent Experience 2026* (April 2026; 1,000 agents at 300+ seat centres incl. banking): 31% likely to leave within six months; 46% of those aged 18-34 vs 8% of 45+; top frustrations "unrealistic performance expectations" 47% and "lack of schedule flexibility" 45% (same NoJitter link). [S] Replacement cost: $10,000 to $20,000 per departure is the most common range (Vonage, https://www.vonage.com/resources/articles/call-center-agent-attrition/); Frost & Sullivan's Alpa Shah "approximately $20,000 on average" (https://cxm.world/customer-experience/31-of-contact-centre-agents-plan-to-quit-within-six-months/). [S/V] Build the bank's own figure from recruiting cost + training weeks x loaded wage + ramp productivity loss + overtime cover.
- **eNPS.** No contact-centre eNPS benchmark surfaced from a reputable source; treat eNPS as an internal trend metric.

---

## 5. Knowledge management and self-service

**KCS (Knowledge-Centered Service), Consortium for Service Innovation, v6 released 21 April 2016, CC BY-NC 4.0.** [P] https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide

- Two loops. Solve Loop: Capture, Structure, Reuse, Improve. Evolve Loop: Content Health, Process Integration, Performance Assessment, Leadership and Communication. The "double loop" idea is borrowed from complex adaptive systems research.
- Article = "actionable information"; structured to hold the requestor's view of the issue and the responder's resolution and cause.
- Article states (Technique 5.2, https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030): **Work in Progress** ("the article does not include a resolution"); **Not Validated** ("complete in that the article has a resolution, but we are not confident in the structure or content"); **Validated** ("complete and reusable, and we are confident in it"); **Archived** ("normally done only when the article is defined as having no value"; can be restored). KCS Candidates can only create and modify Not Validated articles; Contributors, Publishers and Coaches validate.
- Roles and licensing (Appendix D, https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/080): KCS Candidate (KCS I), Contributor (KCS II, "if you find it/use it, you own it"), Publisher (KCS III, understands external audiences), Coach (practices expert who "monitors individual activity such as article creation, reuse, and modify rates"), Knowledge Domain Expert (owns health of a collection: redundancy, gaps, quality, reuse, cycle time).
- Article lifecycle in practice: capture in the workflow at the moment of solving; structure to the Content Standard (Technique 5.3); reuse by linking the case to the article; improve (flag it, fix it) every time it is reused; Content Health monitors the Article Quality Index via sampling (Appendix E); archive when demand and value are gone.
- Measuring self-service (Technique 5.12, https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/085): user view ("How often is self-service used before a case is opened?", "How often are users of self-service finding things that are helpful?") and internal view ("How much demand is being satisfied through self service success?", the "new versus known ratio"). "No single measure is precise", so triangulate click-stream, surveys and usability tests and watch trends. An increase in the ratio of new to known issues reaching assisted support "is a powerful indicator of a successful self-service model."

**Deflection measurement.** Basic ratio = deflected requests / total requests; variants (help-centre visitors / tickets; 100 minus ticket-creation rate) produce different answers, so document the definition, the channels counted and the "no contact within X days" window; "deflected is not resolved", so pair the ratio with a success signal ("did this help", CES) (https://helply.com/blog/what-is-the-deflection-rate ; https://en.helpfeel.com/glossary/deflection-rate). [V] Vendor benchmarks range from 10 to 25% for early knowledge bases to 50 to 70% claimed for mature programmes; the Consortium publishes no number.

For a bank: knowledge articles are also control documents (TD's assistant answers only from TD policy, with links to the source policy, precisely because the knowledge base is the governed source of truth). COPC R8 now requires regular audits of the knowledge management system.

---

## 6. AI in support, 2025-2026

### 6.1 What is deployed in Canadian banks (named, dated)
- **TD** (stories.td.com, 15 August 2025): generative AI virtual assistant for contact-centre colleagues built by Layer 6 using retrieval-augmented generation anchored on TD policies and procedures; answers include links to the source policy; piloted in early 2024 with experienced "resource agents" where hold times fell 15%; "more than 1,000 contact centre representatives use it every day" (https://stories.td.com/ca/en/article/td-customer-support-agent-ai-tool ; pilot announcement 16 May 2024 https://stories.td.com/ca/en/news/2024-05-16-td-launches-new-generative-ai-pilots-to-help-empower-colleag). [P]
- **CIBC**: CIBC AI (CAI) chat assistant reached 50,000+ employees, ~20,000 daily, "hundreds of use cases"; CAI 2.0 agentic workspace announced in pilot 31 July 2026 (drafting proposals, coordinating compliance work, comparing credit agreements); no contact-centre-specific detail disclosed (https://www.wealthprofessional.ca/news/industry-news/bank-pilots-agentic-ai-workspace-calls-it-a-canadian-banking-first/393179). [S]
- **RBC** (October 2025): "RBC's call centre uses genAI to support advisors with a number of tasks from faster access to knowledge, to executing activities on their behalf"; RBC Assist and Aiden used by tens of thousands of employees; ~9,000 custom agents built on RBC Assist with "humans in the loop, but the bank is looking to remove that step for some functions" (Globe and Mail, March 2026) (https://www.rbccm.com/en/insights/2025/10/rbc-ranks-1-in-canada-and-3-globally-for-ai-maturity ; https://www.euromoney.com/article/aislo39vmkw8w8s0ww0gwwoss/banking/north-americas-best-bank-2026-rbc/). [P/S]
- **Scotiabank** (April 2024 announcement): expanded Google Cloud partnership including moving contact centres to Contact Center AI and "LLM-powered chatbot summarization that empowers live agents with instant context"; delivery status not confirmed publicly (https://www.retailbankerinternational.com/news/scotiabank-expands-partnership-with-google-cloud/). [S]
- **BMO**: 2025 Digital CX Award for "groundbreaking use of Gen AI"; no contact-centre deployment detail found (https://thedigitalbanker.com/banking-in-the-ai-age-how-bmo-is-shaping-the-future-of-digital-customer-experience/). [S]
- Evident AI Index (2025): RBC 3rd globally, TD 9th, Scotiabank 20th, CIBC 22nd, BMO 24th (https://www.investmentexecutive.com/industry-news/tech-roundup-canadian-banks-adopt-ai-to-fill-productivity-gap/). [S]

### 6.2 What surveys say about adoption and human escalation
- Gartner (survey of 187 service leaders, Jul-Aug 2024, reported 2025): 85% plan to explore or pilot customer-facing conversational genAI in 2025; only 5% had deployed customer-facing voicebots, 11% piloting (https://www.cxnetwork.com/artificial-intelligence/news/customer-service-leaders-pilot-generative-ai-2025). [S]
- Gartner (27 Aug 2025 release): predicts 73% of customer service organisations will have implemented agent assist by end of 2025; self-service and live chat to surpass traditional channels by 2027 (https://www.gartner.com/en/newsroom/press-releases/2025-08-27-gartner-survey-finds-self-service-and-live-chat-will-surpass-traditional-channels-as-top-customer-service-technologies-by-2027). [P]
- Gartner (March 2025): agentic AI to resolve 80% of common service issues without a human by 2029 (https://cxtoday.com/contact-center/agentic-ai-gartner-predicts-80-of-customer-problems-solved-without-human-help-by-2029); Gartner (June 2025, 163 leaders): 95% plan to retain human agents; by 2027 half of firms planning major AI job cuts will reverse course; no Fortune 500 company will have fully eliminated human agents by 2028, with humans kept for "nuanced situations and long-term relationships" (https://www.cxnetwork.com/artificial-intelligence/news/ai-wont-replace-human-customer-service-agents-gartner-predicts). [S]
- Gartner (Oct 2025): 77% of support leaders feel executive pressure to deploy AI; 75% received AI budget increases (https://www.cxtoday.com/contact-center/77-of-customer-support-leaders-feel-pressure-from-execs-to-deploy-ai-finds-gartner/). [S]
- Intercom 2026 Customer Service Transformation Report (2,400+ teams): 82% of senior leaders invested in AI for service in 2025 but only 10% reached "mature" deployment; 40% of teams say agents now spend more time training and optimising AI (https://community.intercom.com/product-updates/customer-service-transformation-report-2026-13729). [P, vendor]
- Cresta 2026 CX Workforce Report: only 9% of customer conversations are fully handled by AI without human involvement (https://www.cxtoday.com/?p=993145). [S, vendor]
- Ada/NewtonX consumer study (March 2026, n=2,000): 24% said their last AI service interaction was fully resolved by AI alone (via https://www.getmacha.com/blog/ai-customer-service-resolution-rate-statistics). [S]
- Deloitte Digital 2026: 35% of centres use agentic AI; "More than half of surveyed consumers say service quality stayed the same or got worse in 2025" (link in section 4). [P]

### 6.3 What regulators say
- **OSFI Guideline E-23 (Model Risk Management)**, final 11 September 2025, effective 1 May 2027: covers any "Model" including "artificial intelligence or machine learning methods", so a contact-centre assistant or auto-QA model is in scope; principles-based, proportionate to size and risk (https://www.blakes.com/insights/osfi-releases-final-guideline-e-23-for-model-risk-management-and-ai-use-by-frfis ; https://www.dww.com/articles/new-guidance-for-ai-models-financial-sector-take-effect-may-2027). [S]
- **OSFI bulletin on generative and agentic AI**, July 2026: "treat AI-generated output as an input to a decision, not the decision itself"; keep a human accountable for material decisions; set limits on autonomy; keep manual fallbacks; map AI dependencies and test outage scenarios; "require third parties to disclose when they use AI to deliver a service"; complements B-13 (technology and cyber), E-21 (operational resilience), B-10 (third-party risk) (https://www.wealthprofessional.ca/news/industry-news/osfi-sets-sound-practices-to-curb-generative-and-agentic-ai-risks/392975 ; https://www.mccarthy.ca/en/insights/blogs/techlex/managing-the-ai-risks-in-the-financial-sector-osfi-s-bulletin-on-generative-and-agentic-artificial-intelligence). [S]
- **COPC R8**: AI must meet the same training, verification and performance standards as people, with an AI ethics policy (section 3). [P]
- **FCAC**: the complaint rules are channel-neutral; any expression of dissatisfaction to a bot is a complaint with the same 56-day clock (section 9).

### 6.4 How the lead/manager role changes
- Team leads coach from 100% auto-QA flags instead of 4 to 6 sampled calls; they also calibrate the AI evaluator and defend its scores to agents (the 76% vs 57% trust gap is a management problem).
- Managers own the escalation design: which intents go to a human, what the bot must say about being a bot, how transfers carry context, and how containment is measured against the customer's own "was it resolved" answer.
- Heads own governance: model inventory and E-23 compliance, vendor AI disclosure, outage fallbacks, and the explanation to the risk committee of why a given use is appropriate.
- Agent work shifts toward complex, regulated and emotional contacts (fraud, bereavement, hardship), which argues for higher skill and pay bands rather than fewer rungs; Verint's "higher order of work" finding supports this.

---

## 7. Voice of customer and the loop to product

### 7.1 Taxonomy and root-cause analysis
- Build a three-tier taxonomy: primary cause (8 to 12 categories), secondary, tertiary; distinguish the proximate cause ("a claim was rejected") from the root cause ("the policy wording was ambiguous"); make root-cause coding a mandatory field before a final response is issued; review the taxonomy quarterly (https://swiftcase.co.uk/guides/complaints-handling/root-cause-analysis-framework/). [S]
- Tag what the customer contacted about, what caused it, sentiment, whether it was resolved, and the owning team (https://www.oversai.com/news/voc-taxonomy-root-cause-analysis-cx). [V]
- Avoid labels like "doesn't work"; the capture step is "where we fail to capture the granularity of information needed" (https://www.isixsigma.com/blogs/rest-story/). [S]
- FCAC's revised guideline (June 2026) makes this a regulatory expectation: analyse complaint data to find "recurring and systemic issues" (para 18.6), address the underlying cause and take corrective action (22.1), track root causes across complaint types (22.2), check whether other products or consumers are affected (22.3-22.4), and remediate all affected consumers (23.1, 24.1) (https://www.canada.ca/en/financial-consumer-agency/services/industry/commissioner-guidance/complaint-handling-procedures-banks.html). [P]

### 7.2 The loop to product
Route each root-cause code to a named owning team; set a threshold (volume, repeat-contact rate, financial impact) at which a theme becomes a product or process ticket; report by volume, severity and trend direction; close the loop by checking whether the fix reduced contacts for that code; retire or merge codes accordingly. Contact rate per customer is the executive-level number that proves the loop works.

### 7.3 Monthly ops review (unit level, ~60 minutes)
COPC: monthly program-level review with "the executive leadership team, functional leaders across quality, operations, and workforce management" and the data owner. Agenda: (1) one-page scorecard: service, quality, efficiency, CSAT, cost, each vs last month, target and trend; (2) slow-moving structural trends, not daily noise; (3) workforce health: attrition by tenure band on a trailing 3-month average, shrinkage actual vs plan, overtime (consistently above ~5% signals structural understaffing); (4) cost and capacity: cost per contact vs budget, schedule efficiency; (5) quality: QA distribution, calibration variance, training completion; (6) complaints: volume, 56-day compliance, top root causes; (7) actions with owners and dates (https://www.copc.com/using-a-balanced-scorecard-for-performance-management/ ; https://www.hivedesk.com/blog/contact-center/how-track-improve-call-center-productivity). [P/V]

### 7.4 Quarterly business review (upward)
GitLab's VP "leads monthly Support Key Review" and "drives quarterly OKRs"; the Director "draft[s] and report[s] quarterly OKRs". A support QBR contains: previous-quarter commitments and status; outcome metrics (FCR, CSAT/NPS, contact rate per customer, cost to serve, complaint and regulatory status); drivers and root causes with the top three themes sent to product; workforce (attrition, time to proficiency, engagement); AI and tooling roadmap with governance status; risks; asks (headcount, budget, cross-functional dependencies); next-quarter OKRs opened "for discussion and approval" (https://www.getmagical.com/templates/customer-support-quarterly-business-review ; https://dock.us/templates/quarterly-business-review). [V]

---

## 8. Business and budget

### 8.1 Cost per contact and the business case
- Formula: fully loaded operating cost (wages, benefits, management, facilities, telephony and software, QA, training) divided by handled contacts, by channel. Benchmarks in section 4.2 (Gartner $13.50 assisted vs $1.84 self-service; ContactBabel US 2025 voice $7.16, email $6.05, chat $5.06).
- Headcount business case: start from forecast and Erlang C requirement; show the service-level and abandon impact of under-staffing in dollars (lost revenue, complaint cost, overtime); compare with the loaded cost of the FTE (1.3 to 1.4x base salary once benefits, software and overhead are included, https://www.eesel.ai/blog/call-center-outsourcing-pros-and-cons [V]).
- Tooling business case: contacts deflected x assisted cost per contact; AHT seconds saved x volume x cost per minute; QA coverage from 2% to 100% with calibration hours saved; attrition reduction x replacement cost; always net of licence, integration and change cost, with a 12 to 24-month payback and a stated risk (vendor claims vs the Deloitte and Intercom finding that only mature deployments show ROI).

### 8.2 In-house vs BPO
- Published 2025-2026 hourly ranges: onshore US/Canada $25 to $45 (up to $65 specialist), nearshore $8 to $23, offshore $6 to $14; hourly quotes "hide 10 to 20% in fees"; setup $2,000 to $20,000, QA $500 to $2,500/month, CRM integration $2,000 to $15,000 (https://callin.io/call-center-in-house-vs-outsourcing/ ; https://justcall.io/blog/call-center-outsourcing-cost.html). [V]
- Non-cost criteria: control and real-time oversight (you cannot "walk the floor"); data security and PIPEDA/outsourcing obligations (OPC: businesses contracting out call-centre services "must ensure that these third parties also follow the rules"); volume seasonality (variable vs fixed cost); language and cultural fit; OSFI B-10 third-party risk and the July 2026 AI-disclosure expectation; the FCAC rule that the bank "remains responsible" for third parties under s. 627.15 of the Bank Act. [P/S]
- Model total cost of ownership, not hourly rate; request itemised quotes per hour, per contact and per agent-month.

### 8.3 Hiring, onboarding, time to proficiency
- Shopify: 4 weeks training + 2 weeks mentoring before live channels (section 1). [P]
- Ramp ranges: 4 to 12 weeks for simple tier-1; 6 to 8 months average attributed to an ICMI 2025 benchmark; 9 to 12 months for technical, SaaS or financial services (https://stealthagents.com/research/customer-support-agent-onboarding-statistics-2026/ [V, attribution unverified]); other vendors 4 to 6 months (https://blog.procedureflow.com/employee-experience/time-to-proficiency [V]).
- Measure it yourself: define proficiency as reaching the average of agents with 6+ months tenure on quality, CSAT and FCR (or 90% of experienced-agent performance), and track weeks to reach it per hire class, plus nesting pass rate and QA in the first 60 days (https://www.cxtoday.com/?p=43582). [S]

### 8.4 Attrition drivers and what reduces them
- Drivers (Verint 2026): unrealistic performance expectations 47%, lack of schedule flexibility 45%; Five9/ICMI (2021): increased workload and lack of growth opportunities top two; lacking tools and "repetitive, monotonous tasks" hurt performance most (https://businesswire.com/news/home/20210727005305/en). [S]
- Reducers: BenchmarkPortal's low-attrition centres were associated with remote work (70.1% of them), strong manager support (57.9%) and career coaching with transparent advancement (37.4%) (https://www.ringcentral.com/us/en/blog/factors-that-drive-agent-attrition/). [S] Practical levers: realistic scorecards reviewed annually (COPC), schedule flexibility and shift bidding, a visible ladder with tenure-based pay steps (Buffer's Steps model), coaching hours actually delivered (J.D. Power 2 to 4 hours/month), and removing repetitive work with agent assist.
- Attrition cost model for the business case: recruiting + screening + training weeks x loaded wage + ramp productivity gap + overtime to cover vacancies + quality dip; the $10,000 to $20,000 range is the external sanity check.

---

## 9. Leading in a regulated environment (Canadian banking)

### 9.1 Complaint handling obligations
- Financial Consumer Protection Framework (Bank Act, in force 30 June 2022, "more than 60 new and enhanced consumer protection measures") requires banks to resolve or close complaints within 56 calendar days of first contact, through any channel (https://www.canada.ca/en/financial-consumer-agency/news/2025/07/fcac-calls-on-banks-to-improve-handling-of-consumer-complaints.html). [P]
- FCAC Guideline on Complaint-Handling Procedures for Banks, revised 23 June 2026, effective 23 June 2027 (https://www.canada.ca/en/financial-consumer-agency/services/industry/commissioner-guidance/complaint-handling-procedures-banks.html) [P]:
  - Any expression of dissatisfaction is a complaint; records of all complaints must be kept, including from unnamed consumers and third parties (para 54).
  - Acknowledge "without delay regardless of the channel" with a written Notice of Acknowledgement giving date received, process and timelines (paras 44-45).
  - Referral to a Designated Employee "should not exceed 14 calendar days" and consumers must be offered the option to escalate before then (paras 30-31).
  - The 56-day period "will not be paused for any reason"; a complaint is Resolved if the consumer is satisfied, Closed if dealt with but not satisfied (paras 25-27.1).
  - Notice of Final Decision must state it "marks the conclusion of a Bank's internal complaint-handling process" and give the facts, decision, redress and how to reach the external complaints body (paras 49-52).
  - "Initial and ongoing formal training on complaint-handling for all Employees who deal with complaints" with monitoring of completion and effectiveness (paras 19-21).
  - Root-cause and trend analysis with remediation of all affected consumers (paras 18.6, 22-24).
  - Report all complaints handled by a Designated Employee to FCAC per the regulatory reporting guide (paras 53, 57).
- FCAC thematic review (31 July 2025; six small and medium banks): banks "did not treat every expression of dissatisfaction as a complaint", missed the 56-day deadline, and submitted records that "often lacked required information"; Commissioner Shereen Benzvy Miller: "Effective and timely complaint handling is a cornerstone of trust in our financial system." [P]
- External escalation: OBSI became the sole external complaints body for all federally regulated banks on 1 November 2024 (RBC, TD, Scotiabank, National Bank, Tangerine and Digital Commerce Bank moved from ADRBO); consumers may go to OBSI once 56 days have elapsed or a final response is issued, and have 180 days after the final response (https://www.canada.ca/en/financial-consumer-agency/news/2024/10/canadians-now-have-a-single-external-complaints-body-for-banking.html). [P]
- For a cards advisor this means: log the complaint the moment the customer expresses dissatisfaction, know the 14-day referral path, never promise a timeline the 56-day clock cannot keep, and know the exact OBSI wording.

### 9.2 Conduct risk and compliance training
- FCAC Guideline on Appropriate Products and Services (published 24 Feb 2022, effective 30 June 2022; Bank Act Part XII.2): banks must know the consumer, know the product, and train employees on "features, charges, risks and benefits" so they "recommend products that fit client needs without pressuring clients"; "sales targets and incentives should not conflict with these objectives"; monitor sales practices with tools "beyond customer satisfaction surveys"; the bank "remains responsible" for third parties under s. 627.15 (https://www.canada.ca/en/financial-consumer-agency/services/industry/commissioner-guidance/guideline-appropriate-products-services-banks.html ; https://www.mccarthy.ca/en/insights/blogs/techlex/fcac-issues-final-version-product-and-service-appropriateness-guideline). [P/S] FCAC has publicly found that some large banks made "inappropriate" product recommendations (https://www.investmentexecutive.com/news/regulation/fcac-finds-big-banks-make-inappropriate-product-recommendations/). [S]
- A card advisor's conduct exposure: balance-protection and credit-limit offers, fee explanations, hardship handling, and any incentive tied to those. Team leads must separate sales coaching from appropriateness coaching and keep evidence of both.

### 9.3 Call recording and QA under privacy law
- OPC guidance on recording customer telephone calls, updated 8 October 2026 (https://www.priv.gc.ca/en/privacy-topics/surveillance/02_05_d_14/ ; release https://www.priv.gc.ca/en/opc-news/news-and-announcements/2026/nr-c_261008/) [P]:
  - Organisations under PIPEDA "must comply with the Act when recording calls, regardless of whether the customer or the organization initiated the call."
  - Purposes must be ones a reasonable person considers appropriate ("ensuring quality of customer service, dispute resolution, fraud prevention, or training/development of staff") and stated narrowly; do not label a recording "quality assurance" if it will be used for marketing, profiling or authentication.
  - Inform the customer at the outset and state the purpose; continuing the call is implied consent; "Customers must be given a choice about whether their voice is recorded" and, where recording is not integral, alternatives must be offered (unrecorded call, branch, email, online).
  - Voiceprints are "sensitive biometric information"; express consent may be required; see the OPC biometrics guidance.
  - Limit retention to the purpose; safeguard; customers can request access to their recordings; outsourced call centres must follow the same rules.
- Québec's private-sector law (Law 25 reforms) applies alongside PIPEDA for Québec customers; the OPC guidance is treated as the common standard.
- QA implication: auto-QA and speech analytics are a new "use" of the recording; the stated purpose at the start of the call must cover it, and the model inventory under E-23 should list the analytics model.

### 9.4 Operational risk, AI and resilience
OSFI E-21 (operational resilience), B-10 (third-party risk), B-13 (technology and cyber), E-23 (model risk, effective 1 May 2027) and the July 2026 generative/agentic AI bulletin together frame how a head of support must govern BCP, BPO partners and AI tools (sections 2.3 and 6.3).

---

## Appendix: source list by section (primary first)

1. GitLab Support career framework and support management pages; Buffer career framework (2019); Help Scout and Shopify and Automattic job postings.
2. ICMI "Calculating Base Staff" (2012); Call Centre Helper occupancy, shrinkage and adherence articles; Verint and Fonolo on 80/20; Assurant/IBEX real-time analyst postings; NICE, Telnet Networks, FusionCX on BCP.
3. COPC balanced scorecard and R8 "what's new"; Scorebuddy/Call Centre Helper report (11 Dec 2025) and Q2 2026 pulse; Balto coaching survey (2021); J.D. Power certified-centre coaching; Call Centre Helper GROW articles; McKinsey coaching; Canadian law-firm PIP guidance.
4. SQM Group FCR whitepaper and 2021 industry results; ACSI Finance Study 2025 and 2026; QuestionPro Q1 2025; J.D. Power Canada Retail Banking 2025 (16 Oct 2025); Gartner cost per contact (Feb 2024); ContactBabel US 2025; Deloitte Digital 2026 survey (9 Jun 2026); NICE attrition (2025 report via secondary); Verint State of Agent Experience 2026; Vonage and Frost & Sullivan on replacement cost.
5. Consortium for Service Innovation KCS v6 Practices Guide (2016) incl. Techniques 5.2, 5.12 and Appendix D; vendor deflection glossaries.
6. TD stories (15 Aug 2025, 16 May 2024); Wealth Professional on CIBC (4 Aug 2026) and OSFI bulletin (13 Jul 2026); RBC Capital Markets (Oct 2025); Euromoney (2026); Retail Banker International on Scotiabank (2024); Gartner releases and coverage (2025); Intercom 2026 report; Cresta 2026; Ada/NewtonX (Mar 2026); Blakes and DWW on E-23.
7. Swiftcase RCA framework; iSixSigma; FCAC guideline paras 18-24; COPC monthly review; GitLab VP/Director duties.
8. Vendor BPO pricing guides (2025-2026); OPC outsourcing rule; FCAC s. 627.15; Verint 2026 and Five9/ICMI 2021 attrition drivers; BenchmarkPortal via RingCentral; CX Today on ramp measurement.
9. FCAC complaint-handling guideline (revised 23 Jun 2026); FCAC thematic review (31 Jul 2025); FCAC/OBSI designation (1 Nov 2024); FCAC appropriate products guideline (2022); OPC call-recording guidance (updated 8 Oct 2026); OSFI E-23 and AI bulletin.
