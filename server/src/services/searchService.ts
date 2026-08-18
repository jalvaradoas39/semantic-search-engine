import { Chunk } from '../models/Chunk';
import { SourceDocument } from '../models/SourceDocument';
import { embedTexts } from '../lib/embedTexts';
// NEW (Step 3): rank in Pinecone instead of in-app cosine
import { pineconeIndex } from '../lib/pinecone';

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

  // NEW (Step 3): ask Pinecone for top matches by vector (default namespace)
  const pineconeFilter = input.documentId
    ? { documentId: { $eq: input.documentId } }
    : undefined;

  const queryResponse = await pineconeIndex.query({
    vector: queryEmbedding,
    topK: limit,
    includeMetadata: true,
    ...(pineconeFilter ? { filter: pineconeFilter } : {}),
  });

  const matches = queryResponse.matches ?? [];
  if (matches.length === 0) {
    return { query, limit, hitCount: 0, hits: [] };
  }

  // NEW (Step 3): hydrate scoop text from Mongo using Pinecone ids (= chunk _ids)
  const chunkIds = matches.map((match) => match.id);
  const chunks = await Chunk.find({ _id: { $in: chunkIds } }).select(
    'documentId content chunkIndex',
  );
  const chunkById = new Map(chunks.map((chunk) => [String(chunk._id), chunk]));

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

  // NEW (Step 3): keep Pinecone rank order; use its score
  const hits: SearchHit[] = [];
  for (const match of matches) {
    const chunk = chunkById.get(match.id);
    if (!chunk) continue; // orphan vector (rare) — skip

    const doc = docById.get(String(chunk.documentId));
    hits.push({
      chunkId: String(chunk._id),
      documentId: String(chunk.documentId),
      documentTitle: doc?.title ?? 'Unknown',
      ingestMethod: toIngestMethodLabel(doc?.ingestMethod, doc?.sourceType),
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      score: match.score ?? 0,
    });
  }

  return {
    query,
    limit,
    hitCount: hits.length,
    hits,
  };
}
