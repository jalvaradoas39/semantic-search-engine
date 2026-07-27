import { openai } from './openai';

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

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
  // testing output
  console.log('[embedTexts] response', {
    model: response.model,
    usage: response.usage,
    dataCount: response.data.length,
    // one sample object without the full vector
    sample: response.data[0]
      ? {
          index: response.data[0].index,
          object: response.data[0].object,
          embeddingLength: response.data[0].embedding.length,
          embeddingFirst3: response.data[0].embedding.slice(0, 3),
        }
      : null,
  });

  const sorted = [...response.data].sort((a, b) => a.index - b.index);
  // testing output
  console.log(
    '[embedTexts] sorted',
    sorted.map((item) => ({
      index: item.index,
      embeddingLength: item.embedding.length,
    })),
  );

  return sorted.map((item) => item.embedding);
}
