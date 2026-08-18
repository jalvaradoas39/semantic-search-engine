import { Chunk } from '../models/Chunk';
import {
  SourceDocument,
  SourceType,
  IngestMethod,
} from '../models/SourceDocument';
import { chunkText } from '../lib/chunkText';
import { embedTexts } from '../lib/embedTexts';
import { pineconeIndex } from '../lib/pinecone';

export interface IngestTextInput {
  title: string;
  content: string;
  sourceType?: Extract<SourceType, 'markdown' | 'text' | 'pdf' | 'url'>;
  ingestMethod?: IngestMethod; // which IngestForm path was used: file upload, URL, or pasted text
  sourceUri?: string;
}

export interface IngestTextResult {
  documentId: string;
  title: string;
  sourceType: SourceType;
  ingestMethod: IngestMethod;
  status: string;
  chunkCount: number;
}

export async function ingestText(
  input: IngestTextInput,
): Promise<IngestTextResult> {
  const title = input.title.trim();
  const content = input.content.trim();
  const sourceType = input.sourceType ?? 'text';
  const ingestMethod = input.ingestMethod ?? 'text';
  const sourceUri = (input.sourceUri ?? title).trim();

  if (!title) {
    throw new Error('title is required');
  }
  if (!content) {
    throw new Error('content is required');
  }

  const doc = await SourceDocument.create({
    title,
    sourceType,
    ingestMethod,
    sourceUri,
    status: 'processing',
  });

  try {
    const pieces = chunkText(content);

    if (pieces.length === 0) {
      throw new Error('content produced no chunks');
    }

    // one API call embeds every chunk (batch)
    const embeddings = await embedTexts(pieces.map((piece) => piece.content));

    if (embeddings.length !== pieces.length) {
      throw new Error('embedding count did not match chunk count');
    }

    // capture inserted docs so we can use Mongo _id as Pinecone record id
    const insertedChunks = await Chunk.insertMany(
      pieces.map((piece, i) => ({
        documentId: doc._id,
        content: piece.content,
        chunkIndex: piece.chunkIndex,
        embedding: embeddings[i],
        metadata: {},
      })),
    );

    // upsert OpenAI embeddings to Pinecone (same id as Mongo chunk)
    await pineconeIndex.upsert({
      records: insertedChunks.map((chunk, i) => ({
        id: String(chunk._id),
        values: embeddings[i],
        metadata: {
          documentId: String(doc._id),
          chunkIndex: chunk.chunkIndex,
        },
      })),
    });

    doc.status = 'ready';
    doc.chunkCount = pieces.length;
    doc.errorMessage = '';
    await doc.save();

    return {
      documentId: String(doc._id),
      title: doc.title,
      sourceType: doc.sourceType,
      ingestMethod: doc.ingestMethod,
      status: doc.status,
      chunkCount: doc.chunkCount,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown ingest error';
    doc.status = 'failed';
    doc.errorMessage = message;
    doc.chunkCount = 0;
    await doc.save();
    throw err;
  }
}
