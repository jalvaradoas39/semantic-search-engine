export interface TextChunk {
  content: string;
  chunkIndex: number;
}

/**
 * Split text into overlapping windows.
 * Overlap keeps a sentence that straddles a boundary from being cut off cold.
 */
export function chunkText(
  text: string,
  chunkSize = 800,
  overlap = 100,
): TextChunk[] {
  const normalized = text.replace(/\r\n/g, '\n').trim(); // needed because some documents have \r\n instead of \n
  if (!normalized) return [];

  if (overlap >= chunkSize) {
    throw new Error('overlap must be smaller than chunkSize');
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const content = normalized.slice(start, end).trim();

    if (content) {
      chunks.push({ content, chunkIndex });
      chunkIndex += 1;
    }

    if (end >= normalized.length) break;
    start = end - overlap;
  }

  return chunks;
}
