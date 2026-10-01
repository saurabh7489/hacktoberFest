# MailCraft AI - Professional AI Email Writer

MailCraft AI is an enterprise-grade web application that transforms brief descriptions, rough thoughts, or incoming correspondence into polished, high-impact professional emails. Powered by Google Gemini 3.8 Flash, it tailors language to specific workplace recipients, communication intents, and strategic tones.

---

## Key Features

### 1. Dual Composition Modes
- **Compose New Email**: Generate a complete, ready-to-send draft from brief bullet points or quick notes.
- **Reply Assistant**: Paste an incoming email and provide your core stance (Agree, Gracefully Decline, Seek Clarification, Counter-offer) to generate a context-aware response.

### 2. Strategic Tone & Audience Customization
- **8 Tailored Business Tones**:
  - *Executive / Formal* — Authoritative corporate decorum
  - *Direct & Concise* — Straight to the point with zero filler
  - *Friendly & Warm* — Approachable, collaborative, relationship-building
  - *Diplomatic & Tactful* — Constructive framing and softened friction points
  - *Persuasive & Sales* — Value proposition focus and motivation
  - *Urgent & Action-Oriented* — Time sensitivity and immediate action items
  - *Apologetic & Empathetic* — Sincere ownership and remediation
  - *Casual & Conversational* — Relaxed, modern team communication
- **Recipient Personas**: Boss / Senior Executive, Client, Colleague, Prospective Lead, External Vendor, Job Recruiter, Investor, or General Professional.
- **10 Core Intents**: Action Request, Gentle Follow-up, Status Report, Meeting Recap, Declining / Saying No, Issue Resolution, Cold Outreach, Negotiation, Thank You, and General.
- **Length Targets**: Concise (50–100 words), Balanced (120–180 words), Comprehensive (200–300 words).

### 3. Subject Line Engineering
- Primary recommended subject line optimized for open rates.
- 3 alternative subject angles (Direct, Action/Deadline, Collaborative/Warm) swappable in one click.
- Inbox preheader/preview snippet extraction.

### 4. One-Click Smart Refinements
- **Make Shorter** — Trim filler words and tighten structure.
- **More Assertive** — Remove passive qualifiers and declare decisions with confidence.
- **More Diplomatic** — Soften objections and foster constructive alignment.
- **Executive Polish** — Elevate vocabulary and executive presence.
- **More Friendly** — Inject warmth and rapport.
- **Add Bullets** — Convert key deliverables and questions into scannable lists.
- **Sharpen CTA** — Clarify the call-to-action, deadline, and required response.
- **Proofread** — Syntax, grammar, and sentence flow optimization.
- **Multi-Language Translation** — Translate into 9+ languages with culturally authentic business etiquette.
- **Custom Instruction** — Apply arbitrary custom AI instructions on the active draft.

### 5. Strategic Variations (3 Takes)
- Generates 3 parallel strategic drafts for the same prompt:
  1. *Direct & Action-Driven*
  2. *Diplomatic & Relationship-First*
  3. *Executive Briefing*
- Side-by-side comparison with instant one-click adoption.

### 6. Executive Communication Audit
- Formality Index (0–100%).
- Readability assessment for the selected audience.
- Estimated reading time in seconds.
- 2 actionable coaching tips tailored to the generated draft.

### 7. Export & Integration Tools
- One-click copy for plain text and email clients.
- "Open in Mail App" (`mailto:` URI encoding).
- Download `.eml` (compatible with Outlook, Apple Mail, Thunderbird).
- Download `.txt` plain text files.
- Local draft storage with search, filtering, and starred favorites.
- Pre-built workplace scenario templates (Deadline extension, unanswered follow-up, polite decline, compensation review, service apology, and more).

---

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, `tsx`.
- **AI Engine**: `@google/genai` TypeScript SDK using `gemini-3.8-flash` (with automated fallback and retry handling).
- **Architecture**: Full-stack Vite + Express server where backend routes proxy all AI interactions and keep credentials secure.

---

## Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```bash
# Required: Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Port configuration (default: 3000)
PORT=3000
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
npm run start
```

### 4. Type Checking & Verification
```bash
npm run lint
```

---

## API Endpoints

- `POST /api/email/generate`: Accepts user description, desired tone, recipient persona, intent, length, and optional key points; returns subject lines, body, preview text, and tone audit.
- `POST /api/email/refine`: Refines an existing email draft by action type (`shorter`, `more_formal`, `more_assertive`, `add_bullet_points`, `strengthen_cta`, `translate`, `custom`).
- `POST /api/email/variations`: Generates 3 distinct strategic drafts for side-by-side comparison.

---

## License

Apache-2.0
