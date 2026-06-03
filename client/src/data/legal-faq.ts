export interface LegalFAQ {
  question: string;
  answer: string;
  relatedSections: string[];
  category: string;
  keywords: string[];
}

export const legalFaqs: LegalFAQ[] = [
  {
    question: "What should I do if I am arrested by the police?",
    answer: "You have the right to: (1) Know the reason for arrest, (2) Inform a relative/friend, (3) Consult a lawyer, (4) Free legal aid if you can't afford a lawyer, (5) Be produced before a Magistrate within 24 hours, (6) Not be tortured or forced to confess, (7) Women cannot be arrested between sunset and sunrise except by a woman officer. Remember the D.K. Basu guidelines and stay calm.",
    relatedSections: ["Article 22", "Article 21", "Article 20(3)", "CrPC Section 41"],
    category: "criminal",
    keywords: ["arrested", "police arrest", "custody", "jail", "lockup", "what to do arrested"]
  },
  {
    question: "Can the police refuse to register my FIR?",
    answer: "NO. For cognizable offences, police MUST register an FIR (Section 154 CrPC / Section 173 BNSS). Refusing to register an FIR is a punishable offence. If they refuse: (1) Send complaint by registered post to SP/DCP, (2) File a private complaint before the Magistrate under Section 156(3) CrPC, (3) File a Zero FIR at any police station, (4) Complain to the State/National Human Rights Commission.",
    relatedSections: ["CrPC Section 154", "BNSS Section 173", "CrPC Section 156(3)"],
    category: "criminal",
    keywords: ["FIR refused", "police not registering", "police refusing complaint", "zero FIR"]
  },
  {
    question: "What are a tenant's rights in India?",
    answer: "Key tenant rights: (1) Right to live peacefully without interference, (2) Landlord cannot forcefully evict — must go through legal process (Rent Controller), (3) Landlord must provide basic amenities as per agreement, (4) Security deposit refund at end of tenancy (minus damages), (5) 30-day advance notice typically required for eviction, (6) Rent can only be increased as per agreement or state Rent Control Act, (7) Tenant cannot be evicted during lock-down periods, (8) Essential services (water, electricity) cannot be cut off to force eviction.",
    relatedSections: ["State Rent Control Acts", "Transfer of Property Act Section 108"],
    category: "civil",
    keywords: ["tenant", "rent", "landlord", "eviction", "rental agreement", "security deposit", "lease", "paying guest", "PG"]
  },
  {
    question: "What should I do if I receive a legal notice?",
    answer: "Don't panic. (1) Read the notice carefully, understand the claims and deadlines, (2) Note the reply deadline (usually 15-30 days), (3) Consult a lawyer before replying, (4) Send a proper reply through registered post/speed post with acknowledgment, (5) Do NOT ignore it — non-reply can be used against you in court, (6) Keep copies of the notice and your reply, (7) A legal notice is NOT a court order — it's just a formal demand.",
    relatedSections: ["Section 80 CPC (for government notices)", "CrPC Section 251"],
    category: "civil",
    keywords: ["legal notice", "notice received", "lawyer notice", "demand notice", "reply to notice"]
  },
  {
    question: "How can I get a divorce in India?",
    answer: "Two types: (1) Mutual Consent (Section 13B HMA): both agree, file joint petition, 6-month cooling period, decree granted. (2) Contested (Section 13 HMA): on grounds of cruelty, adultery, desertion (2+ years), conversion, unsoundness of mind, etc. File in Family Court. For maintenance: wife can claim under Section 125 CrPC. Child custody: court decides based on child's welfare. Triple Talaq is BANNED.",
    relatedSections: ["Hindu Marriage Act Section 13/13B", "Section 125 CrPC", "Special Marriage Act"],
    category: "family",
    keywords: ["divorce", "separation", "mutual consent", "contested divorce", "maintenance", "alimony", "child custody"]
  },
  {
    question: "What are women's rights against domestic violence?",
    answer: "Under the DV Act 2005: (1) Right to reside in the shared household, (2) Protection Order against abuser, (3) Monetary relief (maintenance, compensation, damages), (4) Custody of children, (5) Right to file FIR under Section 498A IPC. Helpline: 181 (Women Helpline). You can also approach the Protection Officer in your district or any registered Service Provider (NGO).",
    relatedSections: ["DV Act 2005", "IPC Section 498A", "BNS Section 85"],
    category: "women",
    keywords: ["domestic violence", "wife abuse", "husband beating", "women rights", "protection order", "DV Act"]
  },
  {
    question: "How do I file a consumer complaint for defective product or poor service?",
    answer: "Steps: (1) Send a legal notice to the seller first, (2) If unresolved, file a complaint at Consumer Forum — District (up to ₹1 crore), State (₹1-10 crore), National (above ₹10 crore), (3) File online at edaakhil.nic.in, (4) Filing fee: ₹100-₹5000, (5) No lawyer needed, (6) Time limit: 2 years, (7) Consumer Helpline: 1800-11-4000.",
    relatedSections: ["Consumer Protection Act, 2019"],
    category: "consumer",
    keywords: ["consumer complaint", "defective product", "bad service", "refund", "warranty", "consumer court", "online shopping"]
  },
  {
    question: "What should I do in case of a road accident?",
    answer: "Immediately: (1) Call 112 for emergency, (2) Take the injured to the nearest hospital — Good Samaritan Law protects you from legal harassment, (3) File an FIR, (4) Note vehicle number, driver details, witnesses, (5) Take photos of the scene. For compensation: file claim at MACT. No-fault compensation: ₹2 lakh (death) / ₹50,000 (injury). Hit and run: claim from Motor Accident Claims Fund.",
    relatedSections: ["Motor Vehicles Act, 1988", "Section 134 MV Act", "Good Samaritan Guidelines"],
    category: "accident",
    keywords: ["road accident", "car accident", "hit and run", "accident compensation", "MACT", "accident claim"]
  },
  {
    question: "Can I be fired from my job without notice?",
    answer: "It depends on your employment type. (1) If covered under Industrial Disputes Act (workmen earning up to ₹21,000/month): employer needs 1-3 months notice and government permission for retrenchment in firms with 100+ workers, (2) Shops & Establishments Act: usually 30-day notice required, (3) Private employment: as per your employment contract, (4) Termination during maternity leave is ILLEGAL, (5) Wrongful termination: approach Labour Court / Industrial Tribunal.",
    relatedSections: ["Industrial Disputes Act, 1947", "Shops and Establishments Act", "Maternity Benefit Act, 1961"],
    category: "employment",
    keywords: ["fired", "terminated", "job loss", "retrenchment", "wrongful termination", "notice period", "employment rights"]
  },
  {
    question: "What are the rights of the accused in a criminal case?",
    answer: "Key rights: (1) Presumption of innocence until proven guilty, (2) Right to know charges, (3) Right to fair trial and speedy trial, (4) Right to legal counsel (Article 22), (5) Right to free legal aid (Article 39A), (6) Right against self-incrimination (Article 20(3)), (7) Right against double jeopardy (Article 20(2)), (8) Right to cross-examine witnesses, (9) Right to bail (bail is the rule, jail is the exception), (10) Right to appeal.",
    relatedSections: ["Article 20", "Article 21", "Article 22", "Article 39A"],
    category: "criminal",
    keywords: ["accused rights", "criminal case", "charged", "court case", "trial rights", "fair trial"]
  },
  {
    question: "How does inheritance work in India?",
    answer: "Depends on religion: (1) Hindus: Hindu Succession Act — Class I heirs (wife, sons, daughters, mother) inherit equally. Daughters have EQUAL coparcenary rights in ancestral property (2005 Amendment). (2) Muslims: Quran-based shares — sons get double of daughters. Will (Wasiyat) limited to 1/3rd of property. (3) Christians: Indian Succession Act applies equally. (4) If there's a valid Will: property goes as per the Will. (5) If no Will (intestate): legal heirs inherit as per personal law.",
    relatedSections: ["Hindu Succession Act, 1956", "Indian Succession Act, 1925", "Muslim Personal Law"],
    category: "property",
    keywords: ["inheritance", "property after death", "will", "succession", "ancestral property", "legal heir", "daughter rights property"]
  },
  {
    question: "What can I do if someone is harassing me online?",
    answer: "Steps: (1) Report on cybercrime.gov.in, (2) Call 1930 for financial fraud, (3) File FIR at cyber police station, (4) Preserve all evidence (screenshots, URLs, messages), (5) For women: report under 'Women/Child Related Crime' on cybercrime portal, (6) Applicable laws: IT Act Section 66 (hacking), 66C (identity theft), 66D (cheating by impersonation), 67 (obscene content), IPC 354D/BNS 78 (cyberstalking), IPC 506/BNS 351 (criminal intimidation).",
    relatedSections: ["IT Act Sections 66-67", "IPC Section 354D", "BNS Section 78"],
    category: "cyber",
    keywords: ["online harassment", "cyber bullying", "social media harassment", "trolling", "cyber crime", "online threat", "revenge porn"]
  },
  {
    question: "How do I get maintenance/alimony after separation?",
    answer: "Multiple options: (1) Section 125 CrPC: wife, children, and parents can claim maintenance — available to ALL religions — up to ₹500/month or as court decides, (2) Under respective personal laws: Hindu Adoption and Maintenance Act (Hindus), Muslim Women (Protection of Rights on Divorce) Act, (3) Under DV Act 2005: monetary relief including maintenance, (4) Interim maintenance can be claimed during pendency of divorce, (5) Maintenance is based on: husband's income, wife's income, standard of living, children's needs.",
    relatedSections: ["Section 125 CrPC", "Hindu Adoption and Maintenance Act", "DV Act 2005 Section 20"],
    category: "family",
    keywords: ["maintenance", "alimony", "spousal support", "child support", "wife maintenance", "husband not paying"]
  },
  {
    question: "What is anticipatory bail and how to get it?",
    answer: "Anticipatory bail (Section 438 CrPC / Section 482 BNSS) is pre-arrest bail — you apply BEFORE being arrested when you have reason to believe you may be arrested. Apply before Sessions Court or High Court. Courts consider: (1) nature/gravity of accusation, (2) antecedents of the applicant, (3) possibility of applicant fleeing, (4) whether accusation is made to humiliate. If granted, police cannot arrest you; you surrender before the court as directed.",
    relatedSections: ["CrPC Section 438", "BNSS Section 482"],
    category: "criminal",
    keywords: ["anticipatory bail", "pre-arrest bail", "fear of arrest", "advance bail", "protection from arrest"]
  },
  {
    question: "How to file a writ petition in High Court?",
    answer: "Types of writs: (1) Habeas Corpus: against illegal detention, (2) Mandamus: to compel a public authority to perform its duty, (3) Prohibition: to stop lower court from exceeding jurisdiction, (4) Certiorari: to quash an order of lower court, (5) Quo Warranto: to challenge a person's right to hold public office. File in the High Court of the state under Article 226 or in the Supreme Court under Article 32 (for fundamental rights only). Need a lawyer to file.",
    relatedSections: ["Article 226", "Article 32"],
    category: "constitutional",
    keywords: ["writ petition", "habeas corpus", "mandamus", "high court", "PIL", "public interest litigation", "fundamental rights"]
  },
];
