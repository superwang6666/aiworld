# World-Building Engine v2.0

A web application that helps World Builders generate logical, consistent, and practical world rules using the **Seven Laws of World Building** framework and multidisciplinary expert analysis.

## New in v2.0: Core Anomaly Validation System

The app now includes a **multi-step validation workflow** that ensures your world's core premise is truly unique and structurally sound before generating rules:

1. **Core Premise Input** → 2. **Validation Analysis** → 3. **Art Style** → 4. **Rule Generation**

## Features

- **Core Premise Validation**: AI-powered analysis to verify your world concept's uniqueness
  - Uniqueness scoring (0-100)
  - Core Anomaly identification
  - Domino Effect analysis across all 7 Laws
  - The Eraser Test (structural vs decorative check)
  - Warnings and recommendations
- **Art Style Reference**: Specify visual aesthetic preferences
- **AI-Powered Generation**: Uses DeepSeek/OpenAI GPT to generate 20 concrete rules based on 7 universal laws
- **Rule Management**: Review, confirm, or delete generated rules
- **Export Functionality**: Export confirmed rules (with validation summary) as Markdown and JSON

## The Seven Laws

1. **Space** (Geography/Physics)
2. **Survival** (Biology/Needs)
3. **Cognition** (Language/Belief)
4. **Scarcity** (Economy/Conflict)
5. **Time** (History/Erosion)
6. **Power** (Politics/Order)
7. **Metaphysics** (The Anomaly)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: DeepSeek API 或 OpenAI API (兼容 OpenAI 格式)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- API key: 
  - **DeepSeek API** (推荐) - [获取密钥](https://platform.deepseek.com/api_keys)
  - **OpenAI API** (可选) - [获取密钥](https://platform.openai.com/api-keys)

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your API key:

**使用 DeepSeek (推荐):**
```
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here
```

**或使用 OpenAI:**
```
OPENAI_API_KEY=sk-your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:8000](http://localhost:8000) in your browser

## Usage (Updated v2.0 Workflow)

### Step 1: Enter Core Premise
Describe your world's fundamental concept that deviates from reality.
- Example: "A world where lies increase physical gravity"

### Step 2: Validate Core Premise
The AI analyzes your premise using the Core Anomaly Validation Protocol:

- **Uniqueness Score (0-100)**: How revolutionary is your concept?
  - 86-100: Revolutionary
  - 61-85: Highly Unique
  - 31-60: Interesting
  - 0-30: Generic

- **Core Anomaly Identified**: Which Law is being disrupted and how

- **Domino Effect Analysis**: How your premise cascades through all 7 Laws with concrete examples

- **The Eraser Test**: A scenario comparison showing if your premise is:
  - **STRUCTURAL**: The world collapses without this premise
  - **DECORATIVE**: Just cosmetic dressing on a normal world

- **Warnings**: Potential weaknesses in the premise
- **Recommendations**: Suggestions to strengthen the concept

**Decision Point**: Accept and continue, or revise your premise

### Step 3: Enter Art Style
Specify visual aesthetic after premise is validated.
- Example: "Cyberpunk" or "Cloisonné/Enamel style"

### Step 4: Generate & Manage Rules
- AI generates 20 concrete rules based on your validated premise
- Each rule is categorized by its primary Law
- Confirm or reject individual rules
- Export confirmed rules with validation summary

### Step 5: Export
Click "Export Confirmed" to download:
- **Markdown**: Human-readable document with validation summary and rules
- **JSON**: Structured data including premise, validation results, and confirmed rules

## Project Structure

```
web/
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts          # API endpoint for rule generation
│   │   └── validate-premise/
│   │       └── route.ts          # API endpoint for premise validation
│   ├── globals.css               # Global styles (dark terminal theme)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page (4-step workflow)
├── components/
│   ├── RuleCard.tsx              # Individual rule card component
│   └── ValidationReport.tsx      # Validation results display component
├── types/
│   └── index.ts                  # TypeScript type definitions
└── package.json
```

## How It Works

The application uses a two-stage AI analysis approach:

### Stage 1: Core Anomaly Validation
1. Your Core Premise is sent to the AI validation endpoint
2. The AI applies the "Core Anomaly Verification Protocol" based on 核心设定检验原则.txt
3. Analyzes uniqueness, law impacts, and structural integrity
4. Returns a comprehensive validation report
5. You decide whether to proceed or revise

### Stage 2: Rule Generation
1. Your validated premise + Art Style are sent to the generation endpoint
2. The AI "Expert Council" analyzes using the 7 Laws framework
3. Generates 20 practical, specific rules
4. Each rule is categorized by its primary Law
5. Rules include expert reasoning explaining why they exist

## Building for Production

```bash
npm run build
npm start
```

## License

Private project - All rights reserved

## Notes

- The application uses DeepSeek Chat model when `DEEPSEEK_API_KEY` is set, otherwise uses OpenAI GPT-4o-mini
- You can modify the model in `app/api/generate/route.ts` if needed
- DeepSeek API 与 OpenAI API 兼容，使用相同的接口格式
- The dark terminal theme creates a "World Builder" aesthetic
- All rules are generated client-side with server-side API calls for security