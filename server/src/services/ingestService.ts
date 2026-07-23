import { Chunk } from '../models/Chunk';
import { SourceDocument, SourceType } from '../models/SourceDocument';
import { chunkText } from '../lib/chunkText';

export interface IngestTextInput {
  title: string;
  content: string;
  sourceType?: Extract<SourceType, 'markdown' | 'text'>;
  sourceUri?: string;
}

export interface IngestTextResult {
  documentId: string;
  title: string;
  sourceType: SourceType;
  status: string;
  chunkCount: number;
}

export async function ingestText(
  input: IngestTextInput,
): Promise<IngestTextResult> {
  const title = input.title.trim();
  const content = input.content.trim();
  const sourceType = input.sourceType ?? 'text';
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
    sourceUri,
    status: 'processing',
  });

  try {
    const pieces = chunkText(content);

    if (pieces.length === 0) {
      throw new Error('content produced no chunks');
    }

    await Chunk.insertMany(
      pieces.map((piece) => ({
        documentId: doc._id,
        content: piece.content,
        chunkIndex: piece.chunkIndex,
        embedding: [],
        metadata: {},
      })),
    );

    doc.status = 'ready';
    doc.chunkCount = pieces.length;
    doc.errorMessage = '';
    await doc.save();

    return {
      documentId: String(doc._id),
      title: doc.title,
      sourceType: doc.sourceType,
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
