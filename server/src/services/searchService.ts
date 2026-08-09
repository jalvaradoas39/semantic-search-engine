import { Chunk } from '../models/Chunk';
import { SourceDocument } from '../models/SourceDocument';
import { embedTexts } from '../lib/embedTexts';
import { cosineSimilarity } from '../lib/cosineSimilarity';

export interface SearchInput {
  query: string; // The search query
  limit?: number; // Optional: limit the number of results
  documentId?: string; // Optional: only search chunks from one document
}

export type IngestMethodLabel = 'File' | 'Url' | 'Text';

export interface SearchHit {
  chunkId: string; // ID of the chunk
  documentId: string; // ID of the document
  documentTitle: string; // Title of the document
  /** IngestForm path label for the UI badge */
  ingestMethod: IngestMethodLabel;
  chunkIndex: number; // Index of the chunk
  content: string; // Content of the chunk
  score: number; // Score of the chunk
}

function toIngestMethodLabel(
  ingestMethod: string | undefined,
  sourceType: string | undefined,
): IngestMethodLabel {
  if (ingestMethod === 'file') return 'File';
  if (ingestMethod === 'url') return 'Url';
  if (ingestMethod === 'text') return 'Text';

  // Older documents without ingestMethod
  if (sourceType === 'url') return 'Url';
  if (sourceType === 'pdf' || sourceType === 'markdown') return 'File';
  return 'Text';
}

export interface SearchResult {
  query: string; // search query
  limit: number; // limit the number of results
  hitCount: number; // number of hits
  hits: SearchHit[]; // list of hits
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
    'title sourceType ingestMethod',
  );
  const docById = new Map(
    docs.map((doc) => [
      String(doc._id),
      {
        title: doc.title,
        sourceType: doc.sourceType,
        ingestMethod: doc.ingestMethod,
      },
    ]),
  );

  const scored = chunks
    .map((chunk) => {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      const doc = docById.get(String(chunk.documentId));
      return {
        chunkId: String(chunk._id),
        documentId: String(chunk.documentId),
        documentTitle: doc?.title ?? 'Unknown',
        ingestMethod: toIngestMethodLabel(doc?.ingestMethod, doc?.sourceType),
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
