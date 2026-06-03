export interface LegalProcedure {
  id: string;
  title: string;
  description: string;
  steps: string[];
  relevantLaws: string[];
  keywords: string[];
}

export const legalProcedures: LegalProcedure[] = [
  {
    id: "fir-filing",
    title: "How to File an FIR (First Information Report)",
    description: "An FIR is the first step in the criminal justice system. It is a written document prepared by the police when they receive information about a cognizable offence. Police CANNOT refuse to register an FIR for a cognizable offence (Section 154 CrPC / Section 173 BNSS).",
    steps: [
      "Go to the nearest police station (jurisdiction where the crime occurred)",
      "Narrate the incident to the officer in charge (SHO)",
      "The officer MUST register the FIR — refusal is a punishable offence",
      "Get the FIR written in your own words; you can write it yourself too",
      "Read the FIR carefully before signing",
      "Get a free copy of the FIR (your right under Section 154 CrPC)",
      "If police refuse: file a written complaint to SP/DCP, or file a private complaint before the Magistrate under Section 156(3) CrPC",
      "You can also file an FIR online through your state's police website or email",
      "Zero FIR: You can file an FIR at ANY police station regardless of jurisdiction"
    ],
    relevantLaws: ["CrPC Section 154", "BNSS Section 173", "CrPC Section 156(3)"],
    keywords: ["FIR", "police complaint", "police report", "file complaint", "crime report", "police station", "zero FIR"]
  },
  {
    id: "arrest-rights",
    title: "Rights During Police Arrest (D.K. Basu Guidelines)",
    description: "Every arrested person has specific constitutional and legal rights. The Supreme Court in D.K. Basu v. State of West Bengal (1997) laid down mandatory guidelines for arrest to prevent custodial violence.",
    steps: [
      "Right to know the grounds of arrest (Article 22(1))",
      "Right to inform a relative or friend about the arrest",
      "Right to be produced before a Magistrate within 24 hours (Article 22(2))",
      "Right to consult a lawyer of your choice (Article 22(1))",
      "Right to free legal aid if you cannot afford a lawyer (Article 39A)",
      "Right against self-incrimination — you cannot be forced to confess (Article 20(3))",
      "Right against handcuffing (except in exceptional cases — Prem Shankar Shukla v. Delhi Administration)",
      "The arrest memo must be prepared at the time of arrest with date, time and witness",
      "Arrested person must be examined by a doctor within 48 hours",
      "Women cannot be arrested after sunset and before sunrise (except in exceptional cases by a woman police officer)",
      "Police MUST display name tags and identification during arrest",
      "Right to remain silent during interrogation",
      "No torture or third-degree methods in custody"
    ],
    relevantLaws: ["Article 22", "Article 20(3)", "Article 21", "CrPC Section 41", "BNSS Section 35"],
    keywords: ["arrest", "police arrest", "custody", "detention", "rights", "arrested", "jail", "lockup", "D.K. Basu"]
  },
  {
    id: "bail",
    title: "Bail Procedures in India",
    description: "Bail is the release of an accused person from custody upon certain conditions. It can be granted by the police (for bailable offences) or by the court. The principle is 'bail is the rule, jail is the exception' (State of Rajasthan v. Balchand).",
    steps: [
      "Bailable Offences: Bail is a RIGHT — police must grant bail at the police station itself",
      "Non-Bailable Offences: Apply for bail before the appropriate court (Sessions Court or High Court)",
      "Regular Bail: Apply under Section 439 CrPC / Section 483 BNSS before Sessions Court or High Court",
      "Anticipatory Bail: Apply BEFORE arrest under Section 438 CrPC / Section 482 BNSS before Sessions Court or High Court",
      "Default Bail: If chargesheet not filed within 60 days (lesser offence) or 90 days (serious offence), the accused has RIGHT to default bail under Section 167(2) CrPC",
      "Bail application must include: case details, grounds for bail, personal bond details, surety details",
      "Conditions usually imposed: surrender passport, attend court dates, not tamper with evidence/witnesses, maintain law and order",
      "Bail can be cancelled if conditions are violated"
    ],
    relevantLaws: ["CrPC Section 436-439", "BNSS Section 478-483", "CrPC Section 167(2)", "Article 21"],
    keywords: ["bail", "release", "custody", "jail release", "anticipatory bail", "default bail", "bond", "surety"]
  },
  {
    id: "consumer-complaint",
    title: "Filing a Consumer Complaint",
    description: "Under the Consumer Protection Act, 2019, any consumer who has been cheated, sold defective products, or received deficient services can file a complaint. Complaints can be filed online on the INGRAM portal (consumerhelpline.gov.in).",
    steps: [
      "Send a legal notice to the seller/service provider first (giving 15-30 days to resolve)",
      "If not resolved, file a complaint at the appropriate Consumer Forum/Commission",
      "District Commission: for claims up to ₹1 crore",
      "State Commission: for claims ₹1 crore to ₹10 crore",
      "National Commission: for claims above ₹10 crore",
      "Complaint must include: complainant details, opposite party details, facts of complaint, relief sought, supporting documents",
      "Filing fee: ₹100 to ₹5000 depending on claim amount",
      "You can file online at: edaakhil.nic.in (e-Daakhil portal)",
      "Time limit: within 2 years from the date of cause of action",
      "No lawyer required — you can argue your own case",
      "Consumer Helpline: 1800-11-4000 (toll free)"
    ],
    relevantLaws: ["Consumer Protection Act, 2019", "Section 34-37 CPA 2019"],
    keywords: ["consumer complaint", "defective product", "service complaint", "refund", "consumer court", "consumer rights", "product warranty", "consumer forum", "online shopping complaint"]
  },
  {
    id: "rti",
    title: "Filing an RTI (Right to Information) Application",
    description: "The Right to Information Act, 2005 empowers any citizen to seek information from public authorities. Information must be provided within 30 days (48 hours if it concerns the life or liberty of a person).",
    steps: [
      "Write an application addressed to the Public Information Officer (PIO) of the concerned government department",
      "Application must be in English, Hindi or official language of the area",
      "Pay ₹10 as application fee (BPL card holders are exempt)",
      "No need to give reason for seeking information",
      "Information must be provided within 30 days",
      "If refused or not satisfied: file First Appeal to the First Appellate Authority within 30 days",
      "If still not satisfied: file Second Appeal to the Central/State Information Commission within 90 days",
      "Online RTI portal: rtionline.gov.in (for central government)",
      "PIO can be penalized ₹250 per day for delay (max ₹25,000)"
    ],
    relevantLaws: ["RTI Act, 2005"],
    keywords: ["RTI", "right to information", "government information", "public information", "transparency", "PIO"]
  },
  {
    id: "domestic-violence",
    title: "Domestic Violence Complaint Procedure",
    description: "The Protection of Women from Domestic Violence Act, 2005 provides civil remedies to women facing domestic violence. The 'aggrieved person' can be wife, live-in partner, sister, mother, or any woman in a domestic relationship.",
    steps: [
      "Contact the Protection Officer appointed in your district (available at District Magistrate's office)",
      "File a Domestic Incident Report (DIR) with the Protection Officer",
      "You can also approach a Service Provider (registered NGO) for assistance",
      "File an application before the Magistrate under Section 12 of the DV Act",
      "Seek Protection Order (Section 18), Residence Order (Section 19), Monetary Relief (Section 20), Custody Order (Section 21), Compensation Order (Section 22)",
      "You can also file an FIR under Section 498A IPC for criminal proceedings simultaneously",
      "Right to reside in the shared household — cannot be thrown out",
      "Women Helpline: 181 (available 24x7)"
    ],
    relevantLaws: ["DV Act 2005", "IPC Section 498A", "BNS Section 85"],
    keywords: ["domestic violence", "wife beating", "abuse", "husband violence", "in-laws harassment", "marital violence", "DV Act", "protection order"]
  },
  {
    id: "sexual-harassment-workplace",
    title: "Sexual Harassment at Workplace (PoSH Act Complaint)",
    description: "The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (PoSH Act) mandates every employer with 10+ employees to constitute an Internal Complaints Committee (ICC).",
    steps: [
      "File a written complaint to the Internal Complaints Committee (ICC) within 3 months of the incident",
      "If no ICC exists: file complaint with the Local Complaints Committee (LCC) at the District Officer's level",
      "ICC must complete inquiry within 90 days",
      "During inquiry, you can request: transfer of the respondent, grant of leave, restraining the respondent from reporting on your work",
      "If complaint is proved: ICC recommends action (termination, deduction of salary, written apology, warning)",
      "If employer fails to constitute ICC: penalty up to ₹50,000; repeated violation: higher penalty and cancellation of license",
      "You can simultaneously file an FIR under Section 354A IPC / Section 75 BNS",
      "SHe-Box portal: shebox.nic.in for online complaints"
    ],
    relevantLaws: ["PoSH Act 2013", "IPC Section 354A", "BNS Section 75"],
    keywords: ["sexual harassment", "workplace harassment", "POSH", "ICC", "boss harassment", "office harassment", "women workplace", "inappropriate behavior"]
  },
  {
    id: "cyber-crime",
    title: "Reporting Cyber Crime",
    description: "Cyber crimes can be reported online through the National Cyber Crime Reporting Portal (cybercrime.gov.in) or at your local police station's cyber cell.",
    steps: [
      "Report online at: cybercrime.gov.in",
      "For financial fraud: immediately call 1930 (National Cyber Crime Helpline) to freeze the transaction",
      "For social media related crimes: report on the portal under 'Other Cyber Crimes'",
      "For crimes against women/children: report under 'Women/Child Related Crime' (anonymous reporting available)",
      "File an FIR at the nearest cyber police station or regular police station",
      "Preserve all evidence: screenshots, emails, transaction details, phone numbers, URLs",
      "Do NOT delete any communications with the accused",
      "For UPI/banking fraud: also report to your bank immediately to block the account",
      "Important sections: IT Act Sections 66, 66C (identity theft), 66D (cheating by personation), 67 (obscene content)"
    ],
    relevantLaws: ["IT Act 2000", "IT Act Section 66-67", "IPC 420", "BNS 319"],
    keywords: ["cyber crime", "online fraud", "hacking", "social media crime", "identity theft", "UPI fraud", "online scam", "phishing", "cyber bullying"]
  },
  {
    id: "legal-aid",
    title: "Free Legal Aid",
    description: "Under Section 12 of the Legal Services Authorities Act, 1987, free legal aid is available to: SC/ST members, women, children, disabled persons, industrial workmen, persons in custody, victims of mass disaster/ethnic violence/trafficking, and persons with annual income below ₹3 lakh (₹5 lakh in some states).",
    steps: [
      "Apply to the nearest Legal Services Authority (Taluk/District/State/NALSA)",
      "Application can be made orally or in writing — no formal format required",
      "Free services include: free lawyer, court fees waived, preparation of legal documents",
      "Lok Adalat: free dispute resolution without court fees — binding decision",
      "NALSA helpline: 15100",
      "Visit nalsa.gov.in for more information",
      "Legal Aid Clinics are available in all district courts"
    ],
    relevantLaws: ["Legal Services Authorities Act, 1987", "Article 39A"],
    keywords: ["free legal aid", "free lawyer", "legal aid", "poor", "cannot afford lawyer", "NALSA", "legal services", "Lok Adalat"]
  },
  {
    id: "divorce",
    title: "Divorce Procedures in India",
    description: "Divorce procedures vary based on religion. Hindu Marriage Act (for Hindus, Buddhists, Jains, Sikhs), Special Marriage Act (inter-religious/court marriages), Muslim Personal Law, Indian Divorce Act (Christians), Parsi Marriage and Divorce Act.",
    steps: [
      "Mutual Consent Divorce (Section 13B HMA): Both parties agree; file joint petition in Family Court; 6-month cooling period (can be waived by Supreme Court guidelines); second motion after cooling period; decree granted",
      "Contested Divorce (Section 13 HMA): File petition on grounds — cruelty, adultery, desertion (2+ years), conversion, unsoundness of mind, venereal disease, renunciation, presumption of death (7+ years unheard)",
      "Muslim Divorce: Talaq-e-Hasan (3 menstrual cycles gap), Khula (wife-initiated), judicial divorce through court",
      "Triple Talaq is BANNED (Muslim Women Protection of Rights on Marriage Act, 2019)",
      "Jurisdiction: Family Court where marriage was solemnized, or where the couple last resided together, or where the respondent resides",
      "Maintenance rights: wife can claim maintenance under Section 125 CrPC or under respective personal laws",
      "Child custody: welfare of the child is the paramount consideration"
    ],
    relevantLaws: ["Hindu Marriage Act, 1955", "Special Marriage Act, 1954", "Section 125 CrPC", "Muslim Women Protection of Rights on Marriage Act, 2019"],
    keywords: ["divorce", "separation", "mutual consent divorce", "contested divorce", "marriage", "talaq", "khula", "maintenance", "alimony"]
  },
  {
    id: "property-dispute",
    title: "Property Dispute Resolution",
    description: "Property disputes are among the most common civil matters in India. They can be resolved through negotiation, mediation, revenue courts, or civil courts.",
    steps: [
      "Verify property ownership: check sale deed, title deed, encumbrance certificate, property tax receipts, and land records",
      "For land disputes: approach the Revenue Court (Tehsildar/SDM) first",
      "For property fraud/illegal possession: file a civil suit for declaration and injunction in Civil Court",
      "For partition of joint property: file a partition suit",
      "For tenant disputes: approach Rent Controller/Rent Court",
      "Important: always get an encumbrance certificate (EC) to check for pending litigations",
      "For ancestral property: Hindu Succession Act applies — daughters have equal coparcenary rights (2005 Amendment)",
      "Limitation period: 12 years for possession suits, 3 years for other suits",
      "Stamp duty and registration are mandatory for property transfer (Registration Act, 1908)"
    ],
    relevantLaws: ["Transfer of Property Act, 1882", "Registration Act, 1908", "Hindu Succession Act, 1956", "Indian Stamp Act", "Article 300A"],
    keywords: ["property", "land dispute", "property fraud", "land grabbing", "encroachment", "tenant", "rent", "sale deed", "partition", "ancestral property", "inheritance"]
  },
  {
    id: "motor-accident",
    title: "Motor Vehicle Accident Claims",
    description: "Victims of motor vehicle accidents (or their families) can claim compensation from the Motor Accident Claims Tribunal (MACT) under the Motor Vehicles Act, 1988. No-fault liability compensation of ₹2 lakh (death) or ₹50,000 (injury) is available regardless of fault.",
    steps: [
      "File an FIR at the nearest police station immediately after the accident",
      "Get medical treatment — all hospitals must provide free emergency treatment (Section 134 MV Act)",
      "File a claim petition before MACT within 6 months (can be condoned)",
      "Claim can be filed by victim, victim's legal representatives, or agent",
      "No-fault liability claim: ₹2 lakh for death, ₹50,000 for grievous hurt — can be filed immediately without proving fault",
      "For higher compensation: prove negligence of the driver/owner",
      "Compensation formula for death: annual income × multiplier (based on age) × addition for future prospects",
      "Hit and run cases: claim from Motor Accident Claims Fund (₹2 lakh for death, ₹50,000 for grievous hurt)",
      "Road Accident Emergency Helpline: 112"
    ],
    relevantLaws: ["Motor Vehicles Act, 1988", "Section 166 MV Act", "Section 163A MV Act"],
    keywords: ["accident", "road accident", "vehicle accident", "hit and run", "accident claim", "MACT", "compensation", "car accident", "bike accident"]
  },
];
