import { Chunk } from '../models/Chunk';
import { SourceDocument } from '../models/SourceDocument';
import { embedTexts } from '../lib/embedTexts';
import { cosineSimilarity } from '../lib/cosineSimilarity';

export interface SearchInput {
  query: string;
  limit?: number;
  /** Optional: only search chunks from one document */
  documentId?: string;
}

export interface SearchHit {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
  score: number;
}

export interface SearchResult {
  query: string;
  limit: number;
  hitCount: number;
  hits: SearchHit[];
}

export async function searchChunks(input: SearchInput): Promise<SearchResult> {
  const query = input.query.trim();
  const limit = Math.min(Math.max(input.limit ?? 5, 1), 20);

  if (!query) {
    throw new Error('query is required');
  }

  const [queryEmbedding] = await embedTexts([query]);
  if (!queryEmbedding) {
    throw new Error('failed to embed query');
  }

  const filter: Record<string, unknown> = {
    // skip any leftover empty embeddings from before Step 7
    'embedding.0': { $exists: true },
  };

  if (input.documentId) {
    filter.documentId = input.documentId;
  }

  const chunks = await Chunk.find(filter).select(
    'documentId content chunkIndex embedding',
  );

  const docIds = [...new Set(chunks.map((chunk) => String(chunk.documentId)))];
  const docs = await SourceDocument.find({ _id: { $in: docIds } }).select(
    'title',
  );
  const titleById = new Map(docs.map((doc) => [String(doc._id), doc.title]));

  const scored = chunks
    .map((chunk) => {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        chunkId: String(chunk._id),
        documentId: String(chunk.documentId),
        documentTitle: titleById.get(String(chunk.documentId)) ?? 'Unknown',
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    query,
    limit,
    hitCount: scored.length,
    hits: scored,
  };
}
