# Diario Médico

A personal symptom tracker that helps you log daily health events, visualize trends, detect patterns with AI, and generate PDF reports to share with your doctor.

**Live demo:** `[URL — pending Vercel deploy]`  
**Demo account:** `diariomedico.demo@gmail.com` / `Demo1234!`

---

## Features

- **Symptom logging** — name, intensity (1–10), date/time, body area, triggers, notes
- **History & filters** — searchable list with per-symptom delete
- **Charts** — timeline, frequency, and average intensity graphs (Recharts)
- **AI pattern analysis** — Claude API detects correlations and generates a medical summary
- **PDF report** — exportable document with embedded charts, ready to hand to your doctor
- **Secure backup** — export/import your data as JSON
- **Authentication** — Supabase Auth, every user's data is isolated
- **Encrypted API key** — stored in Supabase with AES-256-GCM, derived from your user ID

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| PDF | jsPDF + html2canvas |
| AI | Anthropic SDK (Claude) |
| Auth + DB | Supabase (PostgreSQL, RLS) |
| Encryption | Web Crypto API (AES-GCM, PBKDF2) |
| Validation | Zod |
| Deploy | Vercel |

## Security

- Row Level Security on every Supabase table — users can only read/write their own data
- API key encrypted client-side with AES-256-GCM before reaching the database; the plaintext never touches the server
- PBKDF2 key derivation (100 k iterations, SHA-256) bound to the user's UUID — a database dump is useless without the user's UUID and the app salt
- Content Security Policy, HSTS, X-Frame-Options, X-Content-Type-Options headers via `vercel.json`
- Zod schema validation before every database write

## Run locally

```bash
# 1. Clone
git clone https://github.com/NoelGonzalezJurado/App_Medica.git
cd App_Medica/symptom-diary

# 2. Install
npm install

# 3. Environment variables
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Dev server
npm run dev
```

You need your own Supabase project and the two SQL migrations in `supabase/migrations/`.

If you want AI features, get an [Anthropic API key](https://console.anthropic.com/) and add it in Settings inside the app.

## Deploy to Vercel

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `App_Medica`
3. Set root directory to `symptom-diary`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy — `vercel.json` already configures headers and SPA routing

## Project structure

```
symptom-diary/
  src/
    components/
      AuthModal.jsx       ← login / register
      Header.jsx
      Navigation.jsx
      SymptomForm.jsx     ← log a new symptom
      SymptomHistory.jsx  ← filterable history
      Charts.jsx          ← recharts visualizations
      AIAnalysis.jsx      ← Claude pattern detection
      MedicalReport.jsx   ← PDF generation
      SettingsModal.jsx   ← API key + backup
    hooks/
      useAuth.js          ← Supabase auth state
      useSymptoms.js      ← CRUD + Zod validation
      useApiKey.js        ← encrypted API key management
    lib/
      supabase.js         ← client singleton
      crypto.js           ← AES-GCM encryption
      validation.js       ← Zod schemas
      claudeApi.js        ← Anthropic SDK wrapper
    utils/
      exportReport.js     ← jsPDF logic
  supabase/
    migrations/
      001_init.sql        ← profiles + symptoms tables + RLS
      002_api_key_storage.sql
  vercel.json             ← security headers + SPA rewrite
```

## License

MIT — built by [Noel González](https://github.com/NoelGonzalezJurado)
