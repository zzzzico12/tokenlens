<p align="center">
  <img src="assets/logo.svg" width="120" alt="TokenLens" />
</p>

<h1 align="center">TokenLens</h1>

<p align="center">
  <strong>Finally see where your AI budget is going.</strong>
</p>

<p align="center">
  Beautiful, open-source dashboard for AI API spending.<br />
  OpenAI · Anthropic · Google · AWS Bedrock · Azure — all in one view.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#demo">Demo</a> •
  <a href="#why-tokenlens">Why?</a> •
  <a href="#features">Features</a> •
  <a href="#data-sources">Data Sources</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <a href="https://github.com/zzzzico12/tokenlens/releases"><img src="https://img.shields.io/github/v/release/zzzzico12/tokenlens?style=flat-square&color=7F77DD" alt="Release" /></a>
  <a href="https://github.com/zzzzico12/tokenlens/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" /></a>
  <a href="https://github.com/zzzzico12/tokenlens/stargazers"><img src="https://img.shields.io/github/stars/zzzzico12/tokenlens?style=flat-square&color=f5c542" alt="Stars" /></a>
</p>

---

## The problem

You're shipping AI features. The API bills are climbing. But when someone asks "where is the money going?", you open five different provider dashboards, squint at tables of numbers, and try to piece together the story.

> **CFO:** "Our AI API costs tripled this month. What happened?"
>
> **You:** _opens OpenAI dashboard, then Anthropic console, then AWS Billing..._ "Give me an hour."

**TokenLens gives you one beautiful dashboard for all your AI spending. No code changes. No proxy. Just connect and see.**

## Demo

<!-- Replace with actual screenshot/gif when ready -->

```
🎬 [Coming soon: animated dashboard showing real-time cost breakdown]
```

**Try it now:** [tokenlens.dev](https://tokenlens.dev) (demo mode with sample data)

## Why TokenLens

There are plenty of LLM monitoring tools. But they all require you to change your code first.

| | TokenLens | Langfuse | LiteLLM | Helicone | Braintrust |
|---|:---:|:---:|:---:|:---:|:---:|
| **No code changes** | ✅ | ❌ (SDK) | ❌ (proxy) | ❌ (proxy) | ❌ (SDK) |
| **No proxy needed** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Beautiful cost dashboard** | ✅ | partial | basic | ✅ | ✅ |
| **Treemap / Sankey / Heatmap** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Multi-provider unified** | ✅ | ✅ | ✅ | partial | partial |
| **Self-hosted / offline** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Open source** | ✅ | ✅ | ✅ | partial | ❌ |
| **Setup time** | 2 min | 30 min+ | 30 min+ | 10 min | 30 min+ |

**TokenLens reads your existing billing data.** No gateway to route traffic through. No SDK to wrap every call. Connect your provider API keys (read-only) and see your spending instantly.

## Quick Start

```bash
git clone https://github.com/zzzzico12/tokenlens.git
cd tokenlens
npm install
npm run dev
```

Open `http://localhost:5173`, paste your API key (read-only), and see your dashboard.

### Docker

```bash
docker run -p 3000:3000 ghcr.io/zzzzico12/tokenlens:latest
```

### Connect a provider

```bash
# In the UI, click "Add Provider" and paste your key:
# OpenAI:     sk-proj-...  (read-only: Usage API)
# Anthropic:  sk-ant-...   (read-only: Usage API)
# Or import a CSV export from any provider
```

**Your API keys are stored locally in your browser. Nothing is sent to any server.**

## Features

### 📊 Cost Treemap

See exactly where every dollar goes. Models are nested inside providers, sized by spend. GPT-4o taking 60% of your budget? You'll see it immediately.

### 🌊 Token Flow (Sankey Diagram)

Trace how tokens flow: Provider → Model → Project → Feature. Follow the money from source to sink and find where optimization has the biggest impact.

### 🔥 Daily Heatmap

GitHub-contribution-style heatmap showing daily spend over the past year. Spot spending spikes instantly. Hover to see the exact amount and which model caused it.

### 📈 Trend Charts

Daily, weekly, and monthly cost trends with provider/model breakdown. Compare periods to see if costs are growing, shrinking, or staying flat.

### ⚠️ Budget Alerts

Set a monthly budget. TokenLens shows a burn-rate indicator and estimates when you'll hit the limit. Get a visual warning when you're on pace to exceed budget.

### 🏷️ Project Tagging

Tag API calls by project, team, or feature (when using the optional lightweight SDK). See cost breakdowns per project without changing your API routing.

### 🔄 Real-Time Updates

TokenLens polls provider Usage APIs at configurable intervals. The dashboard updates automatically — no manual refresh needed.

### 🌙 Dark Mode

Because you'll be staring at this dashboard at midnight when the alerts fire.

## Data Sources

TokenLens supports three ways to get your data:

### 1. Provider Usage APIs (recommended)

Connect directly to your provider's billing/usage API with a read-only API key.

| Provider | API | What you get |
|---|---|---|
| **OpenAI** | Usage API (`/v1/organization/usage`) | Tokens, cost, model, daily breakdown |
| **Anthropic** | Usage API (`/v1/organizations/usage`) | Tokens, cost, model, daily breakdown |
| **Google AI** | Cloud Billing API | Cost per service/SKU |
| **AWS Bedrock** | Cost Explorer API | On-demand & provisioned costs |
| **Azure OpenAI** | Cost Management API | Resource-level cost data |

### 2. CSV Import

Export usage data from any provider's dashboard and drag-and-drop the CSV into TokenLens. Supports OpenAI, Anthropic, and custom CSV formats.

### 3. Lightweight SDK (optional)

For per-project tagging, add a tiny wrapper around your LLM calls:

```typescript
import { track } from '@tokenlens/sdk';

// Wrap your existing call — no behavior change
const response = await track(
  () => openai.chat.completions.create({ model: 'gpt-4o', messages }),
  { project: 'chatbot', feature: 'summarize' }
);
```

This is optional. The dashboard works without it — you just won't have project-level breakdowns.

## Supported Providers

| Provider | Usage API | CSV Import | SDK Tracking |
|---|:---:|:---:|:---:|
| OpenAI | ✅ | ✅ | ✅ |
| Anthropic | ✅ | ✅ | ✅ |
| Google Gemini | ✅ | ✅ | ✅ |
| AWS Bedrock | ✅ | ✅ | ✅ |
| Azure OpenAI | ✅ | ✅ | ✅ |
| Ollama (local) | — | — | ✅ (tokens only) |
| Any OpenAI-compatible | — | ✅ | ✅ |

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React + TypeScript | Component-based, strong ecosystem |
| Charts | Recharts + D3 | Treemap, Sankey, Heatmap, Line charts |
| State | Zustand | Lightweight, no boilerplate |
| Build | Vite | Fast HMR, optimized builds |
| Styling | Tailwind CSS | Utility-first, dark mode built-in |
| Storage | IndexedDB (Dexie) | Client-side, no backend needed |
| API | Provider REST APIs | Direct browser fetch, no proxy |

## Architecture

```
┌──────────────────────────────────────────────────┐
│                  Your Browser                     │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ OpenAI   │  │Anthropic │  │  Google   │  ...  │
│  │Usage API │  │Usage API │  │Billing   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │             │
│       ▼              ▼              ▼             │
│  ┌──────────────────────────────────────────┐    │
│  │         TokenLens Data Layer              │    │
│  │  Normalize → Aggregate → Store (IndexedDB)│    │
│  └────────────────────┬─────────────────────┘    │
│                       │                          │
│                       ▼                          │
│  ┌──────────────────────────────────────────┐    │
│  │         TokenLens Dashboard               │    │
│  │  Treemap · Sankey · Heatmap · Trends      │    │
│  │  Budget alerts · Project breakdown         │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  💾 All data stays in your browser (IndexedDB)   │
│  🔒 API keys stored locally (never transmitted)  │
└──────────────────────────────────────────────────┘
```

**Zero backend. Zero data transmission. Everything runs in your browser.**

## Project Structure

```
tokenlens/
├── src/
│   ├── components/
│   │   ├── Dashboard/       # Main dashboard layout
│   │   ├── Charts/          # Treemap, Sankey, Heatmap, Trends
│   │   ├── Providers/       # Provider connection UI
│   │   ├── Budget/          # Budget alerts & burn rate
│   │   └── Settings/        # Configuration panel
│   ├── providers/
│   │   ├── openai.ts        # OpenAI Usage API client
│   │   ├── anthropic.ts     # Anthropic Usage API client
│   │   ├── google.ts        # Google Cloud Billing client
│   │   ├── bedrock.ts       # AWS Bedrock cost client
│   │   └── csv.ts           # CSV import parser
│   ├── engine/
│   │   ├── normalizer.ts    # Normalize provider data formats
│   │   ├── aggregator.ts    # Aggregate by model/project/time
│   │   └── budget.ts        # Budget tracking & alerts
│   ├── store/
│   │   ├── db.ts            # IndexedDB via Dexie
│   │   └── state.ts         # Zustand global state
│   └── App.tsx
├── public/
├── package.json
└── vite.config.ts
```

## Roadmap

- [x] Multi-provider dashboard (OpenAI, Anthropic, Google)
- [x] Treemap cost visualization
- [x] Daily heatmap
- [x] Trend charts with period comparison
- [x] CSV import
- [ ] Sankey diagram (token flow)
- [ ] AWS Bedrock & Azure OpenAI integration
- [ ] Budget alerts with email/Slack notification
- [ ] Lightweight tracking SDK (`@tokenlens/sdk`)
- [ ] Team sharing (export dashboard as shareable link)
- [ ] CLI tool (`tokenlens report --month 2026-03`)
- [ ] Cost optimization suggestions (AI-powered)
- [ ] GitHub Actions integration (cost-per-PR)

## Privacy & Security

- **100% client-side.** TokenLens has no backend. Your data never leaves your browser.
- **API keys stored locally.** Keys are saved in your browser's localStorage. They are used to call provider APIs directly from your browser via CORS.
- **Read-only access.** TokenLens only needs read access to usage/billing data. It never creates, modifies, or deletes any API resources.
- **No telemetry.** Zero analytics, zero tracking, zero data collection.
- **Self-hostable.** Deploy on your own infrastructure or run locally.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
git clone https://github.com/zzzzico12/tokenlens.git
cd tokenlens
npm install
npm run dev    # Dev server on localhost:5173
npm run test   # Run tests
npm run build  # Production build
```

### Areas where help is wanted

- 🎨 **Visualizations**: New chart types (bubble, radar, stacked area)
- 🔌 **Providers**: AWS Bedrock, Azure OpenAI, Cohere, Mistral
- 🧪 **Testing**: Unit tests, E2E with Playwright
- 📱 **Mobile**: Responsive layout for phone/tablet
- 🌐 **i18n**: Japanese, Chinese, Korean, Spanish translations
- 📊 **SDK**: Lightweight tracking SDK for per-project breakdown
- 💡 **AI suggestions**: Cost optimization recommendations

## License

MIT — use it however you want.

---

<p align="center">
  <strong>Stop guessing where your AI budget goes. Start seeing it.</strong>
</p>

<p align="center">
  <a href="#quick-start">Get Started →</a>
</p>
