# RBC card problems as clients describe them: research corpus for the cards-advisor trainer

Compiled 2026-10-12. Purpose: feed a training app for a new RBC cards advisor with the real issues, real wording, and the underlying jobs behind them.

## Read this first: sourcing and limits

**Reddit was not reachable.** Every route was blocked: the WebSearch API refuses `reddit.com` as a domain ("not accessible to our user agent"), WebFetch cannot open `old.reddit.com` or `reddit.com`, and the Browser pane lists `old.reddit.com` as disallowed. No Reddit thread was opened, so **no quote below comes from Reddit**, and the subreddits named in the brief (r/PersonalFinanceCanada, r/CreditCardsCanada, r/RBC, r/CanadianInvestor, r/banking, r/churningcanada, r/legaladvicecanada) contributed nothing. The file name is kept as requested.

**What did work (quotes are verbatim from these):**

| Source | Status | What it gave |
|---|---|---|
| Trustpilot, `ca.trustpilot.com/review/www.rbcroyalbank.com` pages 1 to 10 (about 1,800 reviews total; pages 1 to 10 cover roughly Feb 2026 to Oct 2026) | Opened | The bulk of the corpus, about 90 card-relevant reviews |
| Trustpilot, `ca.trustpilot.com/review/www.rbc.com` pages 1 and 2 (287 reviews) | Opened | About 20 card-relevant reviews, Aug 2025 to Sep 2026 |
| creditcardGenius user reviews (Avion Visa Infinite, Cash Back Mastercard, ION Visa) | Opened | A handful of card-specific reviews, relative dates only |
| smartcustomer.com (formerly Sitejabber) `reviews/rbcroyalbank.com` | Opened | 7 card-relevant reviews, 2019 to 2024 |
| HuffPost Canada (Avion points story, 2017), Rewards Canada blog (AAdvantage devaluation, 2017), Prince of Travel (Cathay points posting, 2020), Globe and Mail (interest refund, 2002), Apple Community thread (Avion card and Apple Pay, 2019) | Opened | Named cases with quotes |
| FCAC Commissioner decision, proceeding #5 (2026); OBSI 2025 annual report press release; RBC Ombudsman 2024 report (search snippet only) | Opened / snippet | Frequency evidence |
| CTV News (two debit/credit fraud refusal stories), CBC (Yellowknife supplementary card), ConsumerAffairs RBC page, Global News (partial refund) | Snippet only, pages 403/404 or body not served | Used only for what the search snippet showed, flagged as such |
| RedFlagDeals forums | Blocked (redirects to a paid bot gateway, HTTP 402) | Nothing |
| BBB, PissedConsumer, ComplaintsBoard, Insureye, Ratehub reviews, lemmy | 404 / 403 | Nothing |

**Trustpilot URL caveat.** Trustpilot has no per-review permalink in the fetched text, so each quote is cited to the listing page it was on when fetched on 2026-10-12, plus the review date. Pages shift as new reviews arrive; search the review date on the listing to relocate it.

**Frequency labels** are relative to this corpus (about 120 card-relevant complaints, mostly 2025 to 2026), cross-checked against OBSI and the RBC Ombudsman numbers. They are rough.

**Macro frequency evidence (verified sources):**
- OBSI 2025 annual report (released 2026-03-13): "In 2025, fraud continued to be the leading issue for consumer banking complaints, representing one-third of banking cases. Fraud investigations nearly doubled year over year to 1,815 cases, up from 966 cases in 2024." Also: "complaints related to chargebacks and product disclosure increased substantially during the year," and complaint volumes for "credit cards, debit cards, e-Transfers, personal chequing and savings accounts, and mortgages all increased significantly." (https://www.globenewswire.com/news-release/2026/03/13/3255585/0/en/OBSI-2025-Annual-Report-released.html, via search snippet; the page itself returned 403.)
- RBC Ombudsman / Client Complaints Appeal Office 2024 report (search snippet, PDF is encrypted and could not be text-extracted locally): "the most frequent complaints are related to personal deposit accounts, credit cards and mortgages"; the CCAO "received a total of 2,552 complaints" in 2024, "341 were resolved to the client's satisfaction"; the 2023 report linked the rise in volume to "variable rate mortgages, fraud and scams." (https://www.rbc.com/ombudsman/_assets-custom/pdf/2024report.pdf)
- FCAC proceeding #5 (2026): RBC paid a $4.25M penalty because, when fraud was reported and the card account was migrated to a new one, "RBC failed to transfer certain credits from the deactivated accounts to the new ones." 227,947 accounts affected from 2001 to 2024; $22,427,774.30 transferred and refunded. (https://www.canada.ca/en/financial-consumer-agency/services/industry/commissioner-decisions/summary-proceeding-5.html)

**Emotional-state key used below:** angry, scared, embarrassed, confused, resigned (often more than one).

---

## Category: declined transactions

### 1. Card declined or blocked on a routine purchase (false fraud flag)
- **Frequency:** Very common. Nine separate Trustpilot reviews in 2026 alone; appears in every month sampled.
- **Quotes:**
  - "Declined my card for a $60 pizza purchase. 5 hour wait to figure out why." (Aug 16, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=2
  - "they flagged it as fraud suspicion and blocked my card" (Jun 26, 2026; paying a locksmith to get back into their own home) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=5
  - "My CC has been blocked 3 days in a row" (Mar 26, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
  - "to have a transaction unblocked/unflagged, so it could go through." (Jul 5, 2026; Visa refused for online use, no supervisor offered) https://ca.trustpilot.com/review/www.rbc.com
- **Underlying job:** Complete an ordinary purchase right now, often time-critical (food, locksmith, contractor). **Emotion:** angry, embarrassed at the counter, then exhausted by the wait.
- **Resolution seen:** Mostly unresolved in the post; several say they are closing the account. Made worse: long hold times (five hours cited), being told to wait until the next day and visit a branch in another town, a rep ending the call when asked why.
- **Poster claims (unverified):** that RBC blocks repeat purchases at the same merchant on consecutive days; that a $40k daily limit was in place yet a $1,200 transaction was still blocked ("RBC will not allow other transactions for said amount through their visa even with over 40k daily limit", Feb 1, 2026, https://ca.trustpilot.com/review/www.rbc.com?page=2).

### 2. Own credit-card payment or transfer flagged as fraud, account restricted
- **Frequency:** Common (four 2026 reviews).
- **Quotes:**
  - "The bank locked my business account because they deemed my OWN credit card payment as ‘fraudulent’." (Oct 10, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com
  - "multiple "account restrictions" placed on the account and can neither pay a contractor" (Jul 24, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=4
  - "RBC just blocked two e-transfer in three days." (Jul 21, 2026; account locked pending a password reset the client refused) https://ca.trustpilot.com/review/www.rbc.com
- **Underlying job:** Pay their own card bill before the limit or due date; pay a tradesperson. **Emotion:** angry, scared of missing a due date.
- **Resolution seen:** Pending manager callbacks and branch appointments; no closure in the posts. Made worse: no advance notice of the restriction; the client cannot pay a near-limit card and fears interest or over-limit fees.

### 3. Debit daily purchase limit blocks an emergency purchase; changing one limit locks others
- **Frequency:** Common (three 2026 reviews).
- **Quotes:**
  - "there's a limit of debit purchase transaction per day of 2k." (Sep 8, 2026; a roughly $4,500 emergency flight while travelling, bank could not raise it) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=2
  - "So you'll change your debit card limit for two months" (Mar 24, 2026; changing the debit limit locked e-transfer limits) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
  - "I can't change my daily limit AND when I call them they ghost me" (Aug 12, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=3
- **Underlying job:** Make one large purchase today. **Emotion:** scared (stranded), angry.
- **Resolution seen:** None; "could not raise the limit or offer a temporary fix."
- **Poster claims:** $2,000 per day debit purchase cap; limit changes are locked for two months.

---

## Category: travel and foreign use

### 4. Card locked or declined abroad; cannot reach anyone to unlock
- **Frequency:** Very common. The single most emotionally intense cluster; recurs across Trustpilot, creditcardGenius and ConsumerAffairs.
- **Quotes:**
  - "We have been locked out of our cards while abroad and the are refusing to unlock them." (Jan 2, 2026) https://ca.trustpilot.com/review/www.rbc.com?page=2
  - "Do never bank with RBC if you travel out of Canada." (Oct 8, 2026; 12-plus hour waits, transferred in loops, closing all accounts) https://ca.trustpilot.com/review/www.rbcroyalbank.com
  - "it was declined multiple times while in Europe with no specific reason given." (about a year ago, Avion Visa Infinite) https://creditcardgenius.ca/credit-cards/rbc-avion-visa-infinite#user-reviews
  - "they marked my account as FRAUD and reversed the payment that I had a confirmation number for!!" (Mar 20, 2026; rental payment abroad, hung up on twice) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
- **Underlying job:** Pay for accommodation, food or transport in a foreign country with no fallback. **Emotion:** scared, then furious.
- **Resolution seen:** Family wired money instead; several clients closed accounts after returning. Made worse: being told to visit a branch (impossible abroad), mobile banking also locked so the self-serve unlock is unavailable.
- **Snippet-only evidence:** a ConsumerAffairs reviewer was told by a branch manager that "each of the 3 times they had traveled this year, their card had been compromised between the time they advised RBC of their travel plans and the time they left the country" (https://www.consumeraffairs.com/finance/royal_bank.html?page=6, page returned 403, quote from search snippet).
- **Poster claims:** that advising RBC of travel plans does not prevent blocks; that the fraud line will not unlock a card from abroad without a branch visit.

### 5. Mobile banking locked while abroad; told to attend a branch with two pieces of ID
- **Frequency:** Common (overlaps with 4; three distinct 2026 reviews).
- **Quotes:**
  - "being unable to make purchases on Amazon using my Virtual Visa Debit" (Oct 9, 2026; same review says mobile banking locked while travelling and told to visit a branch with two IDs) https://ca.trustpilot.com/review/www.rbcroyalbank.com
  - "they had lett someone else in my online banking account." (Dec 13, 2025; about seven weeks without access, says helpline called him a scammer) https://ca.trustpilot.com/review/www.rbc.com?page=2
  - "it was denied and was told it was fraud" (Apr 15, 2026; card and online banking restricted for over two weeks, branch refused to return the card) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
- **Underlying job:** Regain control of the account and card without flying home. **Emotion:** scared, humiliated ("called me a scammer").
- **Resolution seen:** Unresolved for weeks in every post.

### 6. Foreign transaction fee higher than expected, or confusion with merchant currency conversion
- **Frequency:** Occasional in this corpus (one direct complaint), but a well-known confusion point.
- **Quotes:**
  - "On one transaction I wa charged the eqivalent of 5% exchange whereas they claim to only charge 2.5%." (Dec 4, 2022; WestJet Elite card, about $10,000 transaction; call disconnected, told to contact Mastercard) https://www.smartcustomer.com/reviews/rbcroyalbank.com
- **Underlying job:** Understand and contest the exchange rate on a big foreign purchase. **Emotion:** confused, then angry at being bounced to the network.
- **Resolution seen:** None. Made worse: told to contact Mastercard directly.
- **Context (verified):** Quebec class action Marcotte v. BMO et al. over undisclosed 1.8 to 2.5% conversion fees; "The actions against the Royal Bank of Canada (RBC)" were dismissed and RBC paid no indemnity (https://tjl.quebec/en/?p=568). Merchant-side dynamic currency conversion stacking on top of the issuer fee is the usual explanation for "5%".

### 7. Foreign ATM declined but account debited
- **Frequency:** Occasional (one case).
- **Quotes:**
  - "my transaction was refused. No cash was dispensed." (May 9, 2019; Malaysia, $800, 90-day investigation found cash was dispensed, no refund, Ombudsman produced nothing) https://www.smartcustomer.com/reviews/rbcroyalbank.com
- **Underlying job:** Get $800 back for cash never received. **Emotion:** resigned after escalation failed.
- **Poster claims:** the investigation took 90 days and relied solely on the foreign bank's word.

---

## Category: fraud and unauthorized transactions

### 8. Unauthorized charges on credit or debit; refund slow, partial or refused
- **Frequency:** Very common. OBSI: fraud is one-third of all banking cases (2025).
- **Quotes:**
  - "their Fraud department told me that there was no fraud" (Jun 26, 2026; payment via a processor to a scam organisation; felt blamed) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=5
  - "I got a fraudulent transaction on my debit card EVEN AFTER LOCKING my card" (Oct 2, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com
  - "they couldn't place a stop payment or even issue a new card right away." (Apr 10, 2026; account locked, three-week investigation, no refund promised) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
  - "Lost $1,600 to a fraudster and the bank was not willing to find out the reason" (Aug 30, 2024) https://www.smartcustomer.com/reviews/rbcroyalbank.com
- **Underlying job:** Get the money back and stop further loss. **Emotion:** scared, then angry at being treated as the suspect.
- **Resolution seen:** Mixed: one reviewer got funds back after "7 business days" ("allowing money to be removed from my account without consent and then I have to wait 7 business days", Aug 4, 2026, https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=3); others report nothing after weeks. Made worse: no provisional credit, no stop-payment, no immediate replacement card, being told the fraud was "the customer's".
- **Poster claims:** that a card lock does not stop fraudulent debits (RBC's own page says locks block purchases, cash advances and withdrawals but allow pre-authorized payments and refunds, https://www.rbcroyalbank.com/credit-cards/cardholders/lost-or-stolen-credit-card.html); that RBC holds the client liable if not reported within 30 days of the statement (RBC Caribbean FAQ wording surfaced in search).

### 9. Fraud alert received but cannot reach the fraud line; transferred in loops
- **Frequency:** Very common (six 2026 reviews).
- **Quotes:**
  - "I got an alert about an unauthorized purchase and they just pass me from one person to the next." (Apr 9, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
  - "ive been trying to reach the fraud line and i have not been able to get through." (Jun 2, 2026; locked out of online banking over two weeks) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=7
  - "I was transferred to the fraud department in an unacceptable manner." (Apr 10, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
  - "He was extremely rude to a client." (Jan 31, 2026; fraud department agent) https://ca.trustpilot.com/review/www.rbc.com?page=2
- **Underlying job:** Respond to the bank's own alert and confirm or deny a transaction. **Emotion:** anxious, then angry.
- **Resolution seen:** Usually none in the post. Made better (rare): one reviewer said "RBC flagged them i called RBC and HAD them CANCELL THE CHARGE AND BLOCK MY CARD." (Apr 28, 2026, $18 charge reversed same call) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8

### 10. Debit fraud claim denied: deadline missed, "insecure PIN", or lost card
- **Frequency:** Common; the two biggest news stories about RBC cards are this type.
- **Quotes:**
  - "I had to file a claim with my rbc visa debit cause someone stole 6000cad dollars" (Apr 26, 2026; claim closed, told of a 10-day deadline they did not know about, refused a new claim) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
  - Snippet only (page body not served): CTV reports RBC "will only refund her $470 in charges that were processed using tap" and "$8,772 in transactions completed by the thieves using a PIN won't be refunded because her numbers were not secure enough"; she said BMO and Tangerine refunded similar losses within days. https://www.ctvnews.ca/toronto/article/ontario-woman-warns-about-choosing-credit-card-pin-after-rbc-refuses-to-refund-8-772 (published May 9, 2022)
  - Snippet only: "Ontario student warns about losing debit card after RBC refuses to refund $14,000" https://www.ctvnews.ca/toronto/article/ontario-student-warns-about-losing-debit-card-after-rbc-refuses-to-refund-14-000 (page returned 404 on fetch)
- **Underlying job:** Recover thousands in stolen funds. **Emotion:** scared, then resigned; the $6,000 reviewer was "referred to the Better Business Bureau".
- **Poster claims:** a 10-day claim deadline on Visa Debit; that PIN-based transactions are refused if the PIN is judged guessable; that tap transactions are refunded but PIN ones are not.

### 11. Supplementary card the client says they never activated used fraudulently
- **Frequency:** Occasional (one news case).
- **Quotes:** Snippet only (CBC page returned 403): the couple "felt the bank was not showing them 'compassion'"; RBC's position was that they had "checked off a box asking for the extra card when they first applied"; about $6,200 billed. https://amp.cbc.ca/news/canada/north/rbc-credit-card-fraud-yellowknife-1.4400721
- **Underlying job:** Not be billed for a card they did not use. **Emotion:** confused, angry.
- **Resolution seen:** RBC "resolved the issue and isn't investigating further" per its statement to CBC.

---

## Category: disputes and chargebacks

### 12. Dispute for goods not delivered or merchant failure: slow, denied, or no investigation
- **Frequency:** Common. OBSI: chargeback complaints "increased substantially" in 2025.
- **Quotes:**
  - "I reported to RCBC credit card and they never paid for my loss" (Sep 24, 2026; online purchase never delivered, cancelling card) https://ca.trustpilot.com/review/www.rbc.com
  - "They didn't do a proper investigation and would not provide me with the information I needed to stop it." (Mar 3, 2026; about $1,000, still owed) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=10
  - "Tried to contact with RBC dispute department regarding disputed transaction but the person don't listen me" (Feb 15, 2026; call cut off) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=10
  - Positive counter-example: "handling my Credit Card Dispute case so professionally and swiftly." (Jul 30, 2026; $4,000 non-delivery, credit restored in about five business days on the date the agent promised) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=4
- **Underlying job:** Get money back from a merchant who did not deliver. **Emotion:** angry, feeling unheard.
- **Resolution seen:** Ranges from five-day credit to "never paid". What made it better: the agent gave a specific date and met it. What made it worse: no written reasons, calls ending mid-explanation.
- **RBC's published process (verified):** contact the merchant first and "give the merchant or service provider 15-20 business days to issue a credit prior to contacting RBC"; dispute requests can be started in Online Banking; temporary credit "usually within about two business days"; a request with no reply after 10 business days is treated as closed. https://www.RBCroyalbank.com/credit-cards/cardholders/credit-card-transaction-help.html

### 13. Unrecognised small charge or vague descriptor; bounced between bank, PayPal and merchant
- **Frequency:** Common (three 2026 reviews).
- **Quotes:**
  - "I had a charge taken out of my Royal chequing bank account for $16.66 through PayPal and Visa." (May 21, 2026; sent between PayPal, branch and Visa, unresolved) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=7
  - "I had an unauthorized hold placed on my card for a Walmart" (Mar 15, 2026; descriptions vague, told to contact the merchant) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
- **Underlying job:** Identify a charge and make it stop. **Emotion:** confused, then irritated.
- **Resolution seen:** None; "representative said the reviewer had to contact the merchant."

### 14. Pre-authorization hold mistaken for a charge
- **Frequency:** Occasional (folded into 13; the Walmart "hold" case above). Worth a dedicated training scenario because the fix is explanation, not a dispute.

---

## Category: lost, stolen, replacement and renewal

### 15. Replacement or renewal card slow, never arrives, or sent to the wrong address
- **Frequency:** Very common. Eight distinct 2025 to 2026 reviews, plus one creditcardGenius.
- **Quotes:**
  - "Sent my replacement credit card to the wrong address" (Mar 5, 2026; conflicting information on card status, still waiting a week later) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
  - "why I didn't receive my new RBC visa card since the old one will be expired soon" (Jul 31, 2026; agent refused to help or transfer to a manager) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=3
  - "Took over 3 weeks for replacement card once reported fraudulent purchases on Privilege card" (about a year ago) https://creditcardgenius.ca/credit-cards/rbc-avion-visa-infinite#user-reviews
  - "Business replacement cards take a really long time to arrive and they do not get mailed to You but to the branch." (Jul 12, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=4
- **Underlying job:** Have a working card before the old one dies or a trip starts. **Emotion:** anxious, then angry.
- **Resolution seen:** Mostly unresolved at posting; one moved their business elsewhere. Also: "I've been waiting for my Visa Debit card for a month and a half." (Mar 6, 2026; spoke to five people) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
- **RBC's published timeline (verified):** 7 to 10 business days after the report. https://www.rbcroyalbank.com/credit-cards/cardholders/lost-or-stolen-credit-card.html
- **Poster claims:** business cards are mailed to the branch, not the client; renewal cards were "not sent to the branch as promised".

### 16. Reporting a lost card is painful: hours on hold, repeated security questions
- **Frequency:** Common.
- **Quotes:**
  - "It has been utterly impossible to replace a lost credit card" (Jun 26, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=5
  - "That was awful experience when I called to report my visa gone" (Mar 9, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
  - "the verification process took super long with too many questions" (about a year ago, Cash Back Mastercard) https://creditcardgenius.ca/credit-cards/rbc-cash-back-mastercard
- **Underlying job:** Kill the lost card fast and get a new one. **Emotion:** scared (exposure), then frustrated.

### 17. Card cancelled or not renewed without notice, often right before travel
- **Frequency:** Common (four reviews).
- **Quotes:**
  - "Cancelled my credit card without notifying me right before a trip." (Sep 5, 2026; had asked not to receive a replacement) https://ca.trustpilot.com/review/www.rbcroyalbank.com
  - "did not renew my credit card" (May 1, 2026; left without a card while travelling) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=6
  - "Now I'm receiving emails that my card has expired." (Oct 26, 2025; current card cancelled despite requests not to) https://ca.trustpilot.com/review/www.rbc.com?page=2
  - "her card was blocked shortly after, leaving her without any usable card for days." (Apr 17, 2026; requesting a replacement for an expiring Mastercard deactivated the existing one; staff said this contradicted online instructions) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
- **Underlying job:** Keep an uninterrupted card, especially for pre-authorized payments and travel. **Emotion:** angry, blindsided.
- **Made worse:** declining a replacement by phone was interpreted as cancel-the-card; ordering a replacement killed the live card early.

### 18. Expired card plus identity verification friction (branch will not accept app or phone ID)
- **Frequency:** Common.
- **Quotes:**
  - "I was told my card was expired." (Apr 22, 2026; branch would not accept online banking or phone-stored ID) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
  - "refused to accept my identity verification via debit card" (May 6, 2026; Visa phone support locked the accounts) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=6
  - "Try to get info on your credit card, cancel one, anything the AI is horrible." (Jun 2, 2026; verification failed, branch visit needed) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=7
- **Underlying job:** Prove who they are once and get served. **Emotion:** humiliated, angry.

---

## Category: account access, PIN and lock

### 19. PIN: no guidance with a new card; reset only in person
- **Frequency:** Occasional (two reviews).
- **Quotes:**
  - "when I received the credit card, I was not provided with clear information about the PIN or how to use it." (Sep 25, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com
  - "You can only reset your pin in person on a Mastercard" (Aug 15, 2026) https://ca.trustpilot.com/review/www.rbc.com
- **Underlying job:** Use the card at a terminal. **Emotion:** confused, embarrassed.
- **Poster claim:** Mastercard PIN reset is branch-only.

### 20. Card lock feature confusion (what a lock does and does not stop)
- **Frequency:** Occasional as a named complaint, but underlies issue 8 ("EVEN AFTER LOCKING my card").
- **Verified RBC statement:** "When your card is locked, all cash advances, purchases and withdrawals either online or in person will be declined" while pre-authorized payments, balance payments and refunds continue. https://www.rbcroyalbank.com/credit-cards/cardholders/lost-or-stolen-credit-card.html
- **Training point:** clients expect a lock to be a full freeze; recurring merchant pulls still post.

---

## Category: fees and interest

### 21. Interest charged after paying in full, or payments posting late so interest accrues
- **Frequency:** Common (three 2026 reviews, plus a historic $17M refund).
- **Quotes:**
  - "they still charge interest because they take so long to post the payment." (Apr 24, 2026; says it happens monthly) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
  - "Credit card is finicky, takes multiple days to update payments and balances." (Oct 1, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com
- **Underlying job:** Pay in full and owe nothing. **Emotion:** confused, then feels cheated.
- **Verified context:** Globe and Mail, Apr 9, 2002: RBC refunded about $17 million to about 1.6 million Visa cardholders for interest charged on new purchases by customers who had carried a balance then paid in full, citing "a lack of clarity in the clause." https://www.theglobeandmail.com/report-on-business/rbc-repaying-interest-charges/article4133585
- **RBC's disclosure (verified):** residual interest "could appear on the first statement you receive after we process that payment"; grace period is at least 21 days; none for cash advances. https://www.rbcroyalbank.com/credit-cards/cardholders/additional-documents/CreditCardDisclosureDigital-0819-E.pdf

### 22. Over-limit fees with no notification
- **Frequency:** Occasional.
- **Quotes:**
  - "RBC charged two $29 over-limit fees without sending any notification" (Mar 9, 2026; refused waiver) https://ca.trustpilot.com/review/www.rbc.com
- **Underlying job:** Avoid penalty fees for a small overage. **Emotion:** angry.
- **Poster claim:** $29 over-limit fee, charged twice for one slight overage.

### 23. Promotional rate not honoured as advertised; rate or minimum payment raised citing missed payments
- **Frequency:** Occasional (two reviews).
- **Quotes:**
  - "Warning! don't get hooked with RBC promo visa rate 0.99% it is not true." (Mar 26, 2026; card documents showed 1.90%, staff could not explain) https://ca.trustpilot.com/review/www.rbc.com
  - "they told me that I missed more than 2 minimum payments on my visa." (Aug 14, 2026; disputes this; rate and minimum payment rose with no notice, inconsistent answers) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=2
- **Underlying job:** Get the rate they signed up for. **Emotion:** confused, distrustful.
- **Verified context:** RBC disclosures describe a penalty rate when the minimum payment is missed "two or more times in any 12-month period," and a scheduled purchase-rate increase from 20.99% to 21.99% on Cash Back Mastercards from Oct 1, 2026. https://www.rbcroyalbank.com/credit-cards/cash-back/rbc-cash-back-mastercard/rbc-cash-back-mastercard-co-application.pdf

### 24. Annual fee charged after the card was closed; credit score damage
- **Frequency:** Occasional.
- **Quotes:**
  - "they charged annual fees, resulting in credit score lowering by a lot!" (May 29, 2026; reversal promised by phone, charges continued months later) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=7
- **Underlying job:** Close cleanly with nothing owing. **Emotion:** angry, worried about credit.
- **Verified context:** RateAdvantage Visa terms say an earned annual-fee credit is lost if the account is closed before the next statement date. https://www.rbcroyalbank.com/credit-cards/_assets-custom/includes/pop-up/terms-and-condition/rate_adv.html

### 25. Balance protection insurance added without consent; cannot cancel
- **Frequency:** Occasional (one review; no Reddit sample available).
- **Quotes:**
  - "RBC added BPI w/o consent, denied cancel, took $ w/o notice" (Apr 16, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
- **Underlying job:** Stop paying for a product they never chose. **Emotion:** angry.

### 26. Statement or due-date notice never received; late payment hits credit score
- **Frequency:** Occasional.
- **Quotes:**
  - "I never received a statement or payment due notification, online or via snail mail" (experience Jul 9, 2026; WestJet RBC card; says score fell about 140 points) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=3
- **Underlying job:** Pay on time. **Emotion:** scared about credit, angry.

### 27. Prepaid / benefit-card fees (RBC Right Pay) double-charged at ATM
- **Frequency:** Occasional (two reviews).
- **Quotes:**
  - "I never have been hit with 4.50 twice on one withdrawal before" (Apr 16, 2026; over $100 in fees in one month) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
  - "slamming you with fees despite their claims of the opposite" (Apr 15, 2026; card linked to a government benefit program) https://ca.trustpilot.com/review/www.rbc.com
- **Underlying job:** Access benefit money without erosion. **Emotion:** angry, financially stressed.

---

## Category: rewards and points

### 28. Welcome bonus denied on eligibility grounds not understood at signup
- **Frequency:** Occasional to common (one Trustpilot case; a recurring theme in points-blog comment sections that could not be fetched).
- **Quotes:**
  - "we were told that we were not eligible for the bonus because we were already RBC customers when we switched cards." (Jun 8, 2026; RBC British Airways Visa, denied eight months after meeting spend) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=7
- **Underlying job:** Collect the bonus they met the spend for. **Emotion:** angry, feels misled.
- **Verified context:** Avion offer terms say approval points post "within sixty (60) days after your application has been approved" and spend bonuses within 60 days of hitting the threshold, only if the account is open and in good standing. https://blog.rewardscanada.ca/credit-cards/70000-bonus-avion-points-rbc-avion-visa-infinite-privilege/

### 29. Points not posting to a partner program (name mismatch, missing membership number)
- **Frequency:** Occasional.
- **Quotes:**
  - "failing to post to your Asia Miles account in a timely manner" and RBC rep: "there is still no membership number linked to the account" (Apr 7, 2020; resolved after about five months, cause was a middle-name mismatch) https://princeoftravel.com/blog/rbc-cathay-pacific-visa-significant-issues-with-points-posting
- **Underlying job:** See earned miles in the airline account. **Emotion:** resigned.
- **Made better:** RBC identified the mismatch; the fix had to be done on the partner side.

### 30. Redemption gone wrong: charged cash as well as points; taxes not refunded; cannot redeem online
- **Frequency:** Common.
- **Quotes:**
  - "I felt like I was robbed," and "I want my money back, and I want them to apologize for calling me a liar." (HuffPost Canada, Oct 25, 2017; 122,000 Avion points used and the full $1,620 fare also charged; RBC called it a technical error) https://www.huffpost.com/archive/ca/entry/rbc-customer-out-1-600-after-being-charged-for-flight-he-bought-using-points_a_23255719
  - "Outcome so far: No clear response, no refund, no timeline." (Dec 27, 2025; CAD 744.60 refundable taxes on an Avion Rewards booking) https://ca.trustpilot.com/review/www.rbc.com?page=2
  - "Cant redeem online my points" (Apr 29, 2026; two-hour call dropped) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
- **Underlying job:** Use points for a trip and pay nothing extra. **Emotion:** angry, feels disbelieved.
- **Made worse:** responsibility passed between RBC, the rewards desk and the airline; promised reversal not done after a week.

### 31. Points devaluation or partner-rate change without notice
- **Frequency:** Occasional (one documented case, 2017; plus general "worst card" sentiment).
- **Quotes:**
  - "I was/am pretty unhappy about this, because it's a major devaluation." and "I told them I will stop using the card." (May 2017; RBC to AAdvantage transfer cut from 1:1 to 7 per 10) https://blog.rewardscanada.ca/?p=4028
  - "Worst card to get if you looking to travel." (about a year ago, Avion Visa Infinite) https://creditcardgenius.ca/credit-cards/rbc-avion-visa-infinite#user-reviews
- **Underlying job:** Keep the value they were accumulating toward. **Emotion:** resigned, betrayed.
- **Poster claim:** no advance email despite being on the RBC Rewards list; terms still showed the old rate.

### 32. Card-linked travel insurance claim stalls with the insurer
- **Frequency:** Occasional.
- **Quotes:**
  - "Allianz always find something in the claim that they don't understand, and never read their full emails" (11 months ago; trip-cancellation claim, about two months and counting) https://creditcardgenius.ca/credit-cards/rbc-avion-visa-infinite#user-reviews
- **Underlying job:** Get the trip cancellation benefit the card promised. **Emotion:** worn down.

---

## Category: digital wallet and online

### 33. Apple Pay says the RBC card is "not eligible"; provisioning delays
- **Frequency:** Occasional (one confirmed thread; older 2016 reports in search snippets).
- **Quotes:**
  - "I am unable to add visa card to apple pay, it says this card is not eligible" and "Yes it is a rbc avion infinite visa card" (Oct 23, 2019; region and Apple status confirmed fine; no resolution in thread) https://discussions.apple.com/thread/250778344
- **Underlying job:** Tap with the phone, often because the physical card has not arrived. **Emotion:** confused.
- **Verified RBC guidance:** you must be enrolled in RBC Online Banking, and "please allow up to 48 hours for your new credit card to appear in the RBC Mobile app before you can add it to Apple Pay." https://www.rbcroyalbank.com/credit-cards/cardholders/instant-use-with-apple-pay.html

### 34. Virtual Visa Debit fails online, for autopay, or is the only card issued
- **Frequency:** Common (Trustpilot 2026 plus multiple third-party community threads).
- **Quotes:**
  - "being unable to make purchases on Amazon using my Virtual Visa Debit" (Oct 9, 2026; pre-authorized bills also declined with funds available) https://ca.trustpilot.com/review/www.rbcroyalbank.com
  - Jun 19, 2026 reviewer asked for a physical debit card, received only a virtual one with "extremely low limits," and it "disappeared" while abroad https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=5
  - Snippet only (page 403): a Public Mobile community poster was told "we are unable to verify your credit card information, so this transaction could not be completed." https://productioncommunity.publicmobile.ca/t5/Get-Support/Rbc-Visa-Debit-Card/m-p/664675
  - Search snippet, Steam forum: "I don't know why, the problem just has been fixed automatically after 2 days since I posted this discussion." https://steamcommunity.com/discussions/forum/1/620712364019769377
- **Underlying job:** Pay online from chequing without a credit card. **Emotion:** confused, stuck.
- **Verified context:** the virtual card "cannot be used at physical store locations, at an ATM, or at financial institutions." https://brainstation.io/magazine/rbc-introduces-virtual-visa-debit-a-way-to-pay-for-things-with-your-debit-card-online

### 35. Transactions not visible or slow to post in the app
- **Frequency:** Common (recurring "technical issue").
- **Quotes:**
  - "Asked why I am unable to see my transactions for Credit Card" (Sep 1, 2026; told "technical issue", no timeline, recurs every few months) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=2
  - "it takes over 24 hrs for them to post a transaction" (May 10, 2026; debit shows only "Interac purchase") https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=6
- **Underlying job:** Reconcile spending and spot fraud early. **Emotion:** anxious, annoyed.

---

## Category: pre-authorized payments and subscriptions

### 36. Pre-authorized payment declined by a dollar, retried, cascading NSF fees
- **Frequency:** Very common on the debit side (five 2026 reviews).
- **Quotes:**
  - "they charged me 315.00 worth of NSF fees" (Jun 23, 2026; PAP declined for being a dollar short while other items cleared) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=5
  - "They kept trying to take the charge over & over & over, a total of 48 times resulting in 48 separate charges of $50" (May 19, 2026; says $2,400, never resolved) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=6
  - "After months of having a courtesy overdraft, RBC started denying my charges." (Apr 5, 2026; $800 to $900 in fees) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=9
  - "these fees have caused my balance to drop below zero shortly before scheduled pre-authorized payments" (Feb 16, 2026; over $180 NSF in a year, moved payroll to a credit union) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=10
- **Underlying job:** Keep bills paid without being fined for being short by cents. **Emotion:** angry, financially frightened.
- **Made worse:** retry loops generating repeated fees; courtesy overdraft withdrawn silently.

### 37. New card number breaks subscriptions and recurring bills
- **Frequency:** Common as a secondary effect (appears inside issues 15 and 17).
- **Quotes:**
  - Sep 5, 2026 reviewer (issue 17) explains the new card "would have a different number, breaking pre-authorized payments" (paraphrase in the fetched summary; lead quote "Cancelled my credit card without notifying me right before a trip.") https://ca.trustpilot.com/review/www.rbcroyalbank.com
  - Oct 26, 2025 reviewer "is updating payment methods across accounts" after the card was cancelled against their wishes https://ca.trustpilot.com/review/www.rbc.com?page=2
- **Underlying job:** Avoid a week of failed subscriptions after a replacement. **Emotion:** resigned, annoyed.
- **Training point:** no first-hand post confirms whether RBC uses the Visa/Mastercard account-updater for recurring merchants; advisor should not promise it.

### 38. Payment sent to the old or closed card number; credits lost on fraud migration
- **Frequency:** Common at regulator scale; occasional as a review.
- **Quotes:**
  - "a payment made by me mistakenly to older visa card" (Feb 11, 2026; rep described as rude, no resolution) https://ca.trustpilot.com/review/www.rbc.com
  - FCAC (verified): "RBC failed to transfer certain credits from the deactivated accounts to the new ones," 227,947 accounts, 2001 to 2024. https://www.canada.ca/en/financial-consumer-agency/services/industry/commissioner-decisions/summary-proceeding-5.html
- **Underlying job:** Have a payment land on the live account after a card is replaced. **Emotion:** confused, then angry.

---

## Category: limits and credit decisions

### 39. Credit limit or overdraft reduced by text, repeatedly; limit increase refused on a bureau error
- **Frequency:** Occasional in this corpus (no Canadian RBC credit-limit-decrease post could be reached; overdraft reductions stand in).
- **Quotes:**
  - "they are reducing my overdraft, then a few months later they reduce it again" (Jul 9, 2026; 27-year client) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=4
  - "Finally, they refused the credit claiming I had very bad credit record due to very high debts!" (Jul 13, 2023; Mastercard increase refused over a roughly $4 bureau error; told the ombudsman has no authority over credit adjudication) https://www.smartcustomer.com/reviews/rbcroyalbank.com
  - "you did a hard check on my credit card. I was not applying for a credit card." (Feb 7, 2023; applied only for overdraft protection) https://www.smartcustomer.com/reviews/rbcroyalbank.com
- **Underlying job:** Keep the credit they have, or understand why a request was refused. **Emotion:** insulted, confused.
- **Verified context:** RBC's CCAO "does not intervene in certain types of complaints such as credit and insurance adjudication, service fees, interest rates" (2024 Ombudsman report, search snippet).

### 40. Application confusion: told a card is coming, then "incomplete"; agent pushes a new card to an existing holder
- **Frequency:** Occasional.
- **Quotes:**
  - "telling me to apply for a new credit card when I already have one." (Feb 20, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=10
  - "I applied for a credit card and it didn't even appear that I did." (Jun 19, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=5
  - Snippet only (page 403): a ConsumerAffairs reviewer was told a new card would arrive within 10 days; a month later the application was marked incomplete and they had to return to a branch. https://www.consumeraffairs.com/finance/royal_bank.html?page=6
- **Underlying job:** Know whether they have been approved. **Emotion:** confused.

---

## Category: collections and hardship

### 41. Debt consolidation refused; cancel request routed to collections
- **Frequency:** Occasional.
- **Quotes:**
  - "RBC will universally refuse to provide any service that helps the customer consolidate debt" (Feb 16, 2026) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=10
  - Snippet only (ConsumerAffairs, page 403): a reviewer who was not in arrears said RBC pressed them to consolidate and "Their request to cancel the card led to a transfer to the collections department." https://www.consumeraffairs.com/finance/royal_bank.html?page=2
- **Underlying job:** Lower interest burden or exit cleanly. **Emotion:** resigned, suspicious of motives.
- **Poster claim:** RBC refuses consolidation to protect interest income.

### 42. Paying the card balance is itself hard (branch cash, long waits)
- **Frequency:** Occasional (two 2026 reviews).
- **Quotes:**
  - "Have you ever tried to get cash back to pay the very card that issues it" (Oct 8, 2026; branch staff unaware of process) https://ca.trustpilot.com/review/www.rbcroyalbank.com
  - "Went in to pay the balance. Took 45 minutes." (May 16, 2026; conflicting answers about accepting cash) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=6
- **Underlying job:** Pay what they owe, in person, today. **Emotion:** exasperated.

---

## Category: product changes and closures

### 43. Scheduled product changes (fee, rate, voucher co-pay) landing on clients
- **Frequency:** Common as a topic in coverage; no first-hand complaint quotes reachable.
- **Verified facts:** Cash Back Preferred World Elite annual fee $99 to $120 and purchase rate 20.99% to 21.99% from Oct 1, 2026; additional-card fee $0 to $50; no-fee Cash Back Mastercard halves the non-grocery rate (https://www.rbcroyalbank.com/credit-cards/cardholders/cash-back-updates.html; https://www.moneysense.ca/spend/credit-cards/rbc-mastercard-cash-back-fee-changes-perks/). WestJet companion voucher co-pay rose by $100 for vouchers issued on or after June 30, 2024 (https://blog.rewardscanada.ca/news/changes-westjet-companion-vouchers/).
- **Training point:** clients will arrive with "my fee went up" and "my voucher costs more"; the no-cost exit before Dec 30, 2026 cited by MoneySense is a retention lever, verify before quoting.

### 44. Privacy of card details in marketing mail
- **Frequency:** Occasional.
- **Quotes:**
  - "the last 4 digits of my credit card, and my credit limit!" (Apr 16, 2026; personalised mailing; told to visit a branch) https://ca.trustpilot.com/review/www.rbcroyalbank.com?page=8
- **Underlying job:** Not have card data printed on junk mail. **Emotion:** alarmed.

---

## Cross-cutting pattern the advisor trainer should encode

Almost every negative post, whatever the card issue, contains one of these service failures, and these are what turn an issue into a complaint:
1. **Transfer loops and dropped calls** ("pass me from one person to the next", "the person don't listen me", "the representative hung up").
2. **Branch-only fixes for clients who cannot reach a branch** (abroad, locked out, rural).
3. **No date, no written reason** for a decision. The one glowing dispute review praised exactly the opposite: a date given and met.
4. **Being treated as the suspect** in fraud cases ("called me a scammer", "calling me a liar", "implied any fraud was the customer's").
5. **Silent changes**: card cancelled, limit cut, fee added, overdraft withdrawn, with no notice the client recognised.

## Top 10 by frequency in this corpus
1. Card declined or blocked on a routine purchase (false fraud flag)
2. Card locked or declined abroad, cannot reach anyone
3. Unauthorized charges, refund slow/partial/refused
4. Fraud alert received but cannot reach the fraud line
5. Replacement or renewal card slow, missing or misdirected
6. Pre-authorized payment declined, cascading NSF fees
7. Dispute for non-delivery or merchant failure
8. Card cancelled or not renewed without notice (breaking PAPs, often pre-trip)
9. Interest after paying in full / slow payment posting
10. Debit daily limit or virtual-debit restrictions blocking purchases

## Sources that worked vs did not
- Worked: Trustpilot (two RBC listings), creditcardGenius user reviews, smartcustomer.com, HuffPost archive, Rewards Canada blog, Prince of Travel, Globe and Mail archive, Apple Community, FCAC decision page, OBSI press release (snippet), RBC's own cardholder pages and disclosures.
- Snippet only: CTV News (two stories), CBC (amp), ConsumerAffairs, Global News, Public Mobile community, Steam community, RBC Ombudsman PDFs (encrypted; no PDF text tool on this machine).
- Blocked entirely: Reddit (all subreddits, all URL forms), RedFlagDeals forums (paid bot gateway), BBB, PissedConsumer, ComplaintsBoard, Insureye, Ratehub reviews, lemmy mirror.
