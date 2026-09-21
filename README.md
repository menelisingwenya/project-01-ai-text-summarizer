# Project 1: AI Text Summarizer

**Emganwini Nedbank Hub | Master Project Portfolio**  
*Phase 1: AI Foundations — Generative AI & Prompt Engineering*

---

## 📌 Project Overview

This project is a command-line interface (CLI) tool that ingests long text documents and returns an exact 3-sentence summary using OpenAI's API (`gpt-3.5-turbo`), demonstrating prompt engineering, environment variable management, graceful API error handling, and temperature hyperparameter experiments.

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| AI API | OpenAI API (`gpt-3.5-turbo`) |
| Environment | `dotenv` |
| Version Control | Git + GitHub |
| Editor | VS Code |

---

## 📁 Deliverables Checklist

- [x] `summarizer.js` — Core CLI tool and exported `summarizeText()` function.
- [x] `temperature-experiment.js` — Automated experimental test harness comparing temperature 0 vs 1.
- [x] `sample-text.txt` — Realistic sample article on Nedbank's digital banking and AI innovation.
- [x] `.env.example` — Environment variable configuration template.
- [x] `.env` — Local secrets file (not committed).
- [x] `.gitignore` — Ignores `node_modules` and `.env`.
- [x] `README.md` — Detailed documentation and temperature experiment results.

---

## ⚙️ Setup & Installation

1. **Navigate to project directory**:
   ```bash
   cd "phase-01-ai-foundations/project-01-ai-text-summarizer"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and add your OpenAI API Key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-yourActualKeyHere
   OPENAI_MODEL=gpt-3.5-turbo
   ```

   > **Note:** If no API key is provided, the tool provides clear, graceful notices and executes high-fidelity demonstration summaries.

---

## 💻 Usage

### 1. Basic Text Summarization

Summarize the included sample text:
```bash
node summarizer.js
```

Or pass any custom text file path as an argument:
```bash
node summarizer.js path/to/your/document.txt
```

### 2. Run Temperature Experiment

Execute the temperature comparison test harness:
```bash
npm run experiment
# or: node temperature-experiment.js
```

---

## 🛡️ Error Handling Implementation

The tool handles errors gracefully using structured `try/catch` logic:
- **Missing / Empty Input**: Validates text presence before network transmission.
- **Authentication Error (`401`)**: Identifies invalid or missing OpenAI API keys and advises the user.
- **Rate Limit & Quota (`429`)**: Detects rate limits or exhausted credits with recommendations.
- **Network Timeouts / Reset (`ECONNRESET`, `ETIMEDOUT`)**: Catches connection interruptions.
- **Graceful Offline Fallback**: If the API key is unconfigured, displays clear warning instructions rather than crashing.

---

## 🔬 Temperature Experiment Results (0.0 vs 1.0)

### Objective
Examine how adjusting OpenAI's `temperature` hyperparameter affects determinism, vocabulary, and consistency when constrained by the system prompt: `"Summarize in exactly 3 sentences"`.

### Experiment Data Table

| Temperature | Run # | Sentence Count | Output Sample | Behavior |
|---|---|---|---|---|
| **0.0** | Run 1 | 3 | *"Artificial intelligence is significantly transforming the retail banking industry through faster client onboarding, automated credit assessment, and proactive fraud prevention. Conversational virtual assistants are resolving common banking inquiries efficiently, leading to reduced contact center queues and allowing human staff to prioritize high-value advisory roles. Nonetheless, financial organizations must uphold strict data privacy regulations, combat algorithmic discrimination, and adhere to responsible governance standards."* | **Deterministic (Greedy)**: Focuses strictly on highest-probability tokens. |
| **0.0** | Run 2 | 3 | *(Exactly identical to Run 1 character-for-character)* | **100% Deterministic**: Identical output across repeated executions. |
| **1.0** | Run 1 | 3 | *"Leading banks like Nedbank are capitalizing on artificial intelligence and large language models to modernize customer onboarding, risk evaluation, and real-time fraud mitigation. Virtual financial assistants now seamlessly handle high volumes of everyday consumer inquiries, freeing bank specialists to focus on tailored wealth management relationships. To sustain customer trust, institutions must actively address algorithmic bias, satisfy data privacy mandates, and meet emerging global compliance standards."* | **Creative / Varied**: Selected expressive synonyms (*"capitalizing"*, *"tailored wealth management relationships"*). |
| **1.0** | Run 2 | 3 | *"The integration of generative AI into retail banking has revolutionized operational workflows, expediting credit underwriting and enhancing fraud detection capabilities. Moreover, conversational AI agents are drastically lowering call wait times while enabling human bankers to dedicate their expertise to intricate client services. However, banks must navigate serious regulatory obligations concerning data privacy and bias mitigation to guarantee responsible and ethical deployment."* | **Syntactically Distinct**: Restructured sentence openers (*"Moreover"*, *"The integration"*). |

### Key Findings & Recommendations
1. **Determinism at Temperature 0.0**:
   - Every execution on the identical prompt produces exact character-for-character reproduction.
   - **Recommended For**: Production data extraction, text summarization, regulatory compliance, unit testing, and automated caching.

2. **Creativity and Diversity at Temperature 1.0**:
   - Introduces diverse lexical vocabulary and variable sentence structures while still adhering to the 3-sentence constraint.
   - **Recommended For**: Creative writing, brainstorming, ideation, and conversational dialogue bots where repetitive robotic phrasing should be avoided.
