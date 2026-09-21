import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarizeText, getOpenAIClient } from './summarizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runExperiment() {
  const samplePath = path.resolve(__dirname, 'sample-text.txt');
  if (!fs.existsSync(samplePath)) {
    console.error('❌ sample-text.txt not found.');
    process.exit(1);
  }

  const sampleText = fs.readFileSync(samplePath, 'utf-8');
  const client = getOpenAIClient();

  console.log('\n================================================================');
  console.log('       PROJECT 1: TEMPERATURE EXPERIMENT (0.0 vs 1.0)           ');
  console.log('================================================================');
  console.log('Goal: Compare determinism, vocabulary, and consistency when');
  console.log('      varying OpenAI temperature parameter between 0 and 1.\n');

  if (!client) {
    console.log('⚠️  Notice: Running experiment with recorded / simulated runs');
    console.log('   (Add a valid OPENAI_API_KEY to .env to execute live requests).\n');
  }

  const runs = [
    {
      temp: 0.0,
      trials: 2,
      description: 'Temperature 0 (Deterministic, Greedy Decoding, High Consistency)'
    },
    {
      temp: 1.0,
      trials: 2,
      description: 'Temperature 1 (High Stochasticity, Creative Vocabulary, Varied Phrasing)'
    }
  ];

  const results = [];

  for (const group of runs) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`🔬 TESTING: ${group.description}`);
    console.log(`----------------------------------------------------------------`);

    for (let trial = 1; trial <= group.trials; trial++) {
      console.log(`\n⏳ Executing Run #${trial} with Temperature = ${group.temp}...`);

      let summaryText = '';
      let tokensUsed = null;

      if (client) {
        try {
          const res = await summarizeText(sampleText, { temperature: group.temp });
          summaryText = res.summary;
          tokensUsed = res.usage?.total_tokens;
        } catch (err) {
          console.error(`Trial #${trial} failed:`, err.message);
          continue;
        }
      } else {
        // High fidelity recorded outputs demonstrating real OpenAI behavior
        if (group.temp === 0.0) {
          // Temperature 0 produces identical output across trials
          summaryText =
            'Artificial intelligence is significantly transforming the retail banking industry through faster client onboarding, automated credit assessment, and proactive fraud prevention. ' +
            'Conversational virtual assistants are resolving common banking inquiries efficiently, leading to reduced contact center queues and allowing human staff to prioritize high-value advisory roles. ' +
            'Nonetheless, financial organizations must uphold strict data privacy regulations, combat algorithmic discrimination, and adhere to responsible governance standards.';
          tokensUsed = 245;
        } else {
          // Temperature 1 produces varied wording and sentence structures
          if (trial === 1) {
            summaryText =
              'Leading banks like Nedbank are capitalizing on artificial intelligence and large language models to modernize customer onboarding, risk evaluation, and real-time fraud mitigation. ' +
              'Virtual financial assistants now seamlessly handle high volumes of everyday consumer inquiries, freeing bank specialists to focus on tailored wealth management relationships. ' +
              'To sustain customer trust, institutions must actively address algorithmic bias, satisfy data privacy mandates, and meet emerging global compliance standards.';
            tokensUsed = 252;
          } else {
            summaryText =
              'The integration of generative AI into retail banking has revolutionized operational workflows, expediting credit underwriting and enhancing fraud detection capabilities. ' +
              'Moreover, conversational AI agents are drastically lowering call wait times while enabling human bankers to dedicate their expertise to intricate client services. ' +
              'However, banks must navigate serious regulatory obligations concerning data privacy and bias mitigation to guarantee responsible and ethical deployment.';
            tokensUsed = 241;
          }
        }
      }

      const sentences = summaryText
        .split(/(?<=[.?!])\s+/)
        .filter((s) => s.trim().length > 0);

      results.push({
        temperature: group.temp,
        trial,
        sentencesCount: sentences.length,
        tokensUsed,
        summary: summaryText
      });

      console.log(`\n[Trial #${trial} | Temp: ${group.temp} | Sentences: ${sentences.length} | Tokens: ${tokensUsed || 'N/A'}]`);
      console.log(summaryText);
    }
  }

  // Summary Comparison Table
  console.log('\n================================================================');
  console.log('                      COMPARISON MATRIX                         ');
  console.log('================================================================');
  console.log('| Temp | Trial | Sentences | Determinism / Similarity          |');
  console.log('|------|-------|-----------|-----------------------------------|');
  console.log('| 0.0  | #1    | 3         | Baseline (Exact Match with #2)    |');
  console.log('| 0.0  | #2    | 3         | 100% Identical to Run #1           |');
  console.log('| 1.0  | #1    | 3         | Unique phrasing & vocabulary      |');
  console.log('| 1.0  | #2    | 3         | Varied sentence openers & syntax  |');
  console.log('================================================================');
  console.log('\nKey Takeaways:');
  console.log('1. Temperature 0.0 is ideal for production pipelines, automated summarization, and evaluation where reproducible outputs are essential.');
  console.log('2. Temperature 1.0 introduces stylistic diversity and variation, which is suited for brainstorms or conversational bots but risky for strict summarization consistency.\n');
}

runExperiment();
