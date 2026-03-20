# Contributing to TokenLens

Thank you for your interest! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/zzzzico12/tokenlens.git
cd tokenlens
npm install
npm run dev
```

Open `http://localhost:5173`. Demo data loads automatically.

## Project Structure

```
src/
├── components/
│   ├── Charts/          # Treemap, Heatmap, Trends, Donut, Bars
│   ├── Dashboard/       # Metric cards
│   ├── Budget/          # Budget burn rate indicator
│   └── Header.tsx       # Top bar with date range
├── engine/
│   ├── types.ts         # Core data types & model pricing
│   ├── aggregator.ts    # Aggregation by day/model/provider/project
│   └── demo-data.ts     # Realistic mock data generator
├── providers/
│   ├── openai.ts        # OpenAI Usage API client
│   ├── anthropic.ts     # Anthropic Usage API client
│   └── csv.ts           # Generic CSV importer
├── store/               # Zustand state management
└── App.tsx              # Root layout
```

## How to Contribute

1. Fork → branch → make changes → lint & build → PR
2. Keep components small and focused
3. Use Tailwind for styling, Zustand for state
4. Add types for all data structures

## Areas Where Help is Wanted

- **Provider APIs**: Implement real OpenAI/Anthropic/Google/AWS usage API clients
- **Sankey diagram**: Token flow visualization (Provider → Model → Project)
- **Export**: PNG/SVG/PDF export of dashboard
- **IndexedDB**: Persistent storage with Dexie
- **Testing**: Vitest unit tests, Playwright E2E
- **i18n**: Japanese, Chinese, Korean, Spanish
- **Mobile**: Responsive layout improvements

## License

MIT — contributions are licensed under the same terms.
