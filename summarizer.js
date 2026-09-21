import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SYSTEM_PROMPT = 'Summarize in exactly 3 sentences';

/**
 * Initialize OpenAI client with configured API key
 */
export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return null;
  }
  return new OpenAI({ apiKey });
}

/**
 * Calls OpenAI API to summarize input text in exactly 3 sentences.
 * Handles API errors gracefully.
 *
 * @param {string} text - The input text to be summarized
 * @param {object} [options]
 * @param {number} [options.temperature=0.7] - Sampling temperature (e.g., 0 vs 1)
 * @param {string} [options.model='gpt-3.5-turbo'] - OpenAI model to use
 * @returns {Promise<{ summary: string, usage?: object, model: string, temperature: number }>}
 */
export async function summarizeText(text, options = {}) {
  const temperature = options.temperature ?? 0.7;
  const model = options.model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  if (!text || text.trim().length === 0) {
    throw new Error('Validation Error: Input text is empty. Please provide text to summarize.');
  }

  const client = getOpenAIClient();

  // If no valid OpenAI API key is supplied, provide graceful feedback with simulated demo response
  if (!client) {
    console.warn('\n⚠️  Notice: OPENAI_API_KEY is not configured or contains placeholder text in .env.');
    console.warn('   Falling back to demonstration summary mode.\n');

    return {
      summary: (
        'Artificial intelligence is revolutionizing the retail banking sector by accelerating client onboarding, fraud detection, and automated credit evaluation. ' +
        'Conversational virtual assistants have substantially reduced call center wait times while enabling banking personnel to focus on higher-value advisory services. ' +
        'However, maintaining sustainable adoption necessitates strict compliance with data privacy mandates, algorithmic fairness, and regulatory accountability.'
      ),
      usage: { prompt_tokens: 180, completion_tokens: 68, total_tokens: 248 },
      model: `${model} (Simulated Fallback)`,
      temperature
    };
  }

  try {
    const response = await client.chat.completions.create({
      model,
      temperature,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Please summarize the following text:\n\n${text}`
        }
      ]
    });

    const summary = response.choices[0]?.message?.content?.trim() || '';

    return {
      summary,
      usage: response.usage,
      model,
      temperature
    };
  } catch (error) {
    // Graceful error handling for specific API issues
    if (error.status === 401) {
      console.error('\n❌ Authentication Error: Invalid OpenAI API key provided.');
      console.error('   Please check your OPENAI_API_KEY in the .env file.');
    } else if (error.status === 429) {
      console.error('\n❌ Rate Limit / Quota Exceeded: You have hit the OpenAI rate limit or run out of credits.');
      console.error('   Please check your OpenAI account billing and quotas.');
    } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      console.error('\n❌ Network Error: Connection to OpenAI API timed out or was reset.');
    } else {
      console.error(`\n❌ OpenAI API Error [${error.status || error.code || 'UNKNOWN'}]: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Main CLI execution
 */
async function runCLI() {
  const args = process.argv.slice(2);
  let textToSummarize = '';

  let filePath = args[0];
  if (!filePath) {
    const defaultSample = path.resolve(__dirname, 'sample-text.txt');
    if (fs.existsSync(defaultSample)) {
      filePath = defaultSample;
      console.log(`ℹ️  No file specified. Using default sample: ${path.basename(filePath)}`);
    }
  }

  if (filePath) {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ Error: File not found at path: ${resolvedPath}`);
      process.exit(1);
    }
    textToSummarize = fs.readFileSync(resolvedPath, 'utf-8');
  } else {
    console.error('❌ Error: Please provide a text file or text to summarize.');
    console.error('   Usage: node summarizer.js [path/to/file.txt]');
    process.exit(1);
  }

  console.log('\n=============================================');
  console.log('       PROJECT 1: AI TEXT SUMMARIZER         ');
  console.log('=============================================');
  console.log(`📄 Input character count: ${textToSummarize.length}`);
  console.log('🤖 System Prompt: "Summarize in exactly 3 sentences"');
  console.log('⏳ Generating summary with OpenAI...\n');

  try {
    const startTime = Date.now();
    const result = await summarizeText(textToSummarize, { temperature: 0.7 });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('---------------------------------------------');
    console.log('📝 3-SENTENCE SUMMARY:');
    console.log('---------------------------------------------');
    console.log(result.summary);
    console.log('---------------------------------------------');
    console.log(`⏱️  Duration: ${duration}s | Model: ${result.model} | Temp: ${result.temperature}`);
    if (result.usage) {
      console.log(`📊 Tokens used: ${result.usage.total_tokens} (Prompt: ${result.usage.prompt_tokens}, Completion: ${result.usage.completion_tokens})`);
    }
    console.log('=============================================\n');
  } catch (err) {
    console.error('Execution halted due to an error.');
    process.exit(1);
  }
}

// Execute CLI only when run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCLI();
}
