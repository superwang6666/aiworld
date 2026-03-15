# aiWolrld - Agent-Driven Rulecraft Engine

aiWolrld is a worldbuilding platform built around the Seven Laws framework and powered by the DEAC (Dynamic Expert Agent Cluster) scoring system. Every complex task - uniqueness scoring, rule debates, trade-off analysis, filtering - is handed to purpose-built agents. Each agent lives in an editable JSON file, so teams can tune tone, expertise, weighting, and reasoning style without touching the UI layer. The long-term vision is to let studios plug aiWolrld into their pipelines so that rule-based universes can be generated, tested, and even updated inside live games.

## Key Highlights
- **Agent-Orchestrated Evaluation** - DEAC automatically activates the most relevant experts (up to five) based on the submitted heterogeneity point, runs them through `app/api/deac/*`, and returns transparent reasoning trails.
- **Four-Stage Workflow** - Core premise -> Validation -> Art direction -> Rule generation -> Export. Every stage reuses the same agent council to keep scoring criteria consistent.
- **Editable Expert Library** - Default experts live in `web/lib/experts/core/*.json`, while situational experts sit in `web/lib/experts/special/`. Drop in a new JSON file to inject fresh knowledge domains.
- **Game-Ready Rule Engine** - The app outputs 20 concrete rules tagged with their governing law (Space, Survival, ...). Game teams can toggle them in tooling or runtime to build rule-driven worlds.
- **Modern Web Stack** - Next.js 16, TypeScript, Tailwind CSS, Lucide icons, plus DeepSeek/OpenAI integrations via `app/api/generate/route.ts` and `app/api/validate-premise/route.ts`.
- **Custom LLM Thought Extensions** - Every agent is orchestrated on top of bespoke large-model reasoning chains, so whenever your internal LLM stack evolves, aiWolrld inherits the new depth and reliability of conclusions—model progress directly amplifies the engine.

## Workflow at a Glance
1. **Input the Core Premise** - Describe the anomaly that differentiates your universe.  
2. **Core Anomaly Validation** - DEAC calculates uniqueness (0-100), maps domino effects across the Seven Laws, runs the Eraser Test, and surfaces warnings or recommendations.  
3. **Lock the Art Style** - Provide visual or tonal guidance (for example, "Neon cyberpunk" or "Cloisonne enamel").  
4. **Generate and Curate Rules** - Produce 20 executable rules, confirm or discard them, and track which law they reinforce.  
5. **Export and Integrate** - One click to export Markdown or JSON for docs, pipelines, or downstream AI tools.

## Architecture
- **Framework**: Next.js 16 (App Router) with React Server Components  
- **Language**: TypeScript  
- **Styling**: Tailwind CSS + Lucide React, dark terminal theme  
- **AI Providers**: DeepSeek Chat (preferred) or OpenAI GPT-4o-mini, both using the OpenAI-compatible schema  
- **Key Modules**:
  - `app/page.tsx` - main four-step UI  
  - `app/api/validate-premise/route.ts` - uniqueness and consistency checks  
  - `app/api/generate/route.ts` - rule generation endpoint  
  - `app/api/deac/activate|query|synthesize` - agent lifecycle  
  - `components/ValidationReport.tsx`, `components/ExpertInsightsPanel.tsx` - visual reports

## Getting Started
### Prerequisites
- Node.js 18+  
- npm or pnpm  
- DeepSeek or OpenAI API key (recommended)

### Setup
```bash
git clone <repo-url>
cd ai-wolrld/web
npm install
cp .env.example .env
# Fill in at least one provider key:
# DEEPSEEK_API_KEY=sk-xxx or OPENAI_API_KEY=sk-xxx
npm run dev
```
Visit `http://localhost:8000` to access the full workflow.

## Repository Map
```
web/
|- app/
|  |- api/
|  |  |- generate/route.ts
|  |  |- validate-premise/
|  |  |- deac/
|  |- layout.tsx
|  |- page.tsx
|- components/
|- lib/experts/
|- types/
docs/            # DEAC, code standards, I18N guides, etc.
```

## Customizing Agents
1. Create a JSON file under `web/lib/experts/core/` (baseline experts) or `web/lib/experts/special/` (conditional experts). Include fields such as `name`, `domain`, `knowledge_scope`, `law_mapping`, `prompt_template`, and `reasoning_style`.  
2. Restart the dev server; DEAC hot-loads the new expert and can now pick it during activation.  
3. Adjust routing or scoring policies inside `app/api/deac/activate/route.ts` or `app/api/deac/synthesize/route.ts` if you need custom ordering, max experts, or temperature values.  
4. Consult `docs/DEAC-README.md` and `docs/DEAC-EXPERTS.md` for deeper instructions, scoring tables, and best practices.

## Use Cases and Roadmap
- **Narrative prototyping** - Test whether a "what-if" idea is structurally sound before committing to art or gameplay.  
- **Game toolchains** - Embed aiWolrld in editors so designers can toggle predefined law templates, letting the engine update the world in real time.  
- **Live simulations** - As NPC AIs and economy simulators mature, aiWolrld can become the authoritative source of world rules, streaming updates back into the running game session.  
- **Agent marketplace** - Because experts are just config files, studios can maintain internal libraries per genre (hard sci-fi, wuxia, dystopia) and share them across projects.  
- **Textual agent councils** - The engine’s text-first agent framework lets you abstract multi-agent debates, produce consensus reports, and then loop human judgment on top, making it a general solution for research reviews, balancing exercises, or any scenario where experts reach conclusions before people act.

## Contributing
1. Fork this repository.  
2. Create a branch `feat/<your-feature>`.  
3. Implement changes plus docs/tests where relevant.  
4. Run lint or test suites if available.  
5. Open a Pull Request describing the motivation and any new agents or rules you added.

## License
Released under [GNU GPLv3](./LICENSE). Derivative works must remain GPLv3-compatible; review obligations carefully before commercial deployment.
