import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { incrementGeminiUsage } from '../db/geminiUsageRepository.js';
import { generateMockFormStructure } from './mockServices.js';
import { generatedFormSchema, type GeneratedForm } from '../types/formSchema.js';
import { logger } from '../utils/logger.js';

const SYSTEM_PROMPT = `Return ONLY valid JSON matching this schema: {"title":"string","description":"string","questions":[{"title":"string","type":"TEXT | PARAGRAPH_TEXT | MULTIPLE_CHOICE | CHECKBOX | DROPDOWN | SCALE | DATE","required":true,"options":["string"]}]}. Do not include markdown. Never create file upload questions.`;
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite', systemInstruction: SYSTEM_PROMPT });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function parseJson(text: string): unknown { return JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim()); }

async function callGemini(prompt: string): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const count = incrementGeminiUsage();
      logger.info({ count }, 'Calling Gemini');
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: unknown) {
      const status = typeof error === 'object' && error && 'status' in error ? (error as { status?: number }).status : undefined;
      if (status !== 429 || attempt === 2) throw error;
      await sleep(1000 * 2 ** attempt);
    }
  }
  throw new Error('Gemini retry loop exhausted');
}

export async function generateFormStructure(description: string): Promise<GeneratedForm> {
  if (env.MOCK_EXTERNAL_APIS) {
    logger.info('Using mock Gemini response');
    return generateMockFormStructure(description);
  }

  let response = await callGemini(`Description utilisateur: ${description}`);
  for (let validationAttempt = 0; validationAttempt < 2; validationAttempt += 1) {
    try { return generatedFormSchema.parse(parseJson(response)); }
    catch (error) {
      if (validationAttempt === 1) throw new Error(`Réponse Gemini invalide: ${(error as Error).message}`);
      response = await callGemini(`Your previous response was invalid JSON or schema. Error: ${(error as Error).message}. Return corrected JSON only for: ${description}`);
    }
  }
  throw new Error('Validation Gemini impossible');
}
