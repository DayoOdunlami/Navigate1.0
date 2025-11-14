# NAVIGATE Platform

Interactive intelligence platform for the UK's zero-emission aviation ecosystem.

## Overview

NAVIGATE is a comprehensive platform for exploring, analyzing, and understanding the UK's zero-emission aviation ecosystem. It provides:

- **Interactive Visualizations**: Network graphs, funding flows, technology analysis
- **AI-Powered Insights**: Automated gap identification and strategic recommendations
- **Data Management**: Excel import/export, admin panel, relationship builder
- **Scenario Modeling**: "What-if" analysis with comparison mode

## Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Visualizations**: Nivo (Sankey, Radar, Bump, Bar, Circle Packing, Treemap), react-force-graph-2d
- **State Management**: Zustand
- **AI**: OpenAI (default), Claude (alternative), Mock (fallback)
- **Data Processing**: SheetJS (Excel)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DayoOdunlami/Navigate1.0.git
cd Navigate1.0/navigate-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local and add your API keys
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
navigate-platform/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/      # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── visualizations/  # Chart components
│   │   ├── admin/       # Admin panel components
│   │   └── ai/          # AI interface components
│   ├── lib/             # Utilities and configurations
│   │   └── ai/          # AI provider implementations
│   ├── stores/          # Zustand state management
│   └── data/            # Data files and templates
├── public/              # Static assets
└── docs/               # Documentation
```

## Features

### Phase 1 (Current)
- ✅ Force Graph visualization
- ✅ Sankey funding flows
- ✅ Quick Stats dashboard
- ✅ Global Search
- ✅ Insight Cards
- ✅ Export functionality
- ✅ Filter Presets
- ✅ UI Integration

### Phase 2 (Planned)
- Radar Chart (technology comparison)
- Bar Chart (metrics)
- AI Chat interface
- Comparison Mode

### Phase 3 (Planned)
- Bump Chart (TRL progression)
- Circle Packing (hierarchical view)
- Voice interface (Pipecat)

## AI Providers

The platform supports multiple AI providers:

- **OpenAI** (default): GPT-4o for general queries
- **Claude**: Sonnet 4 for complex analysis
- **Mock**: Rule-based fallback for testing

Configure in `src/lib/ai/config.ts` or via the admin panel.

## Data Management

### Excel Import/Export

- Import stakeholders, technologies, funding events, projects
- Export filtered data as CSV
- Export scenarios as JSON
- Excel templates available in `src/data/templates/`

### Admin Panel

- CRUD operations for all entities
- Relationship builder
- Bulk import/export
- Default value management

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run populate-data` - Generate sample data
- `npm run generate-templates` - Generate Excel templates

### Adding New Visualizations

1. Create component in `src/components/visualizations/`
2. Add route in `src/app/`
3. Update navigation
4. Add to state management

## Documentation

See the `/docs` folder for detailed documentation:
- `NAVIGATE_COMPLETE_STRATEGY.md` - Full strategy and roadmap
- `NAVIGATE_UI_INTEGRATION_STRATEGY.md` - UI/UX integration patterns
- `NAVIGATE_PHASE_0_SETUP.md` - Setup instructions

## Contributing

This is a private project. For questions or suggestions, please contact the project maintainer.

## License

Private - All rights reserved
