import { openai } from './openai';

export const EMBEDDING_MODEL = 'text-embedding-3-small';

/**
 * Embed texts into a vector space. Analogy: converting words into numbers.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in .env');
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });

  const sorted = [...response.data].sort((a, b) => a.index - b.index);

  return sorted.map((item) => item.embedding);
}
