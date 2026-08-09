export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Section 1: Ingest text (paste path — always stored as sourceType "text")
 */
export interface IngestTextRequest {
  title: string;
  content: string;
  sourceUri?: string;
}

export interface IngestTextResponse {
  documentId: string;
  title: string;
  sourceType: string;
  status: string;
  chunkCount: number;
}

export async function ingestText(
  payload: IngestTextRequest,
): Promise<IngestTextResponse> {
  const res = await fetch(`${API_BASE_URL}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as IngestTextResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? `Ingest failed (${res.status})`);
  }

  return data;
}

/**
 * Section 2: Search chunks
 */
export interface SearchRequest {
  query: string;
  limit?: number;
  documentId?: string;
}

export type IngestMethodLabel = 'File' | 'Url' | 'Text';

export interface SearchHit {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  ingestMethod: IngestMethodLabel;
  chunkIndex: number;
  content: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  limit: number;
  hitCount: number;
  hits: SearchHit[];
  error?: string;
}

export async function searchChunks(
  payload: SearchRequest,
): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE_URL}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as SearchResponse;

  if (!res.ok) {
    throw new Error(data.error ?? `Search failed (${res.status})`); // throw an error with the error message or the status code
  }

  return data;
}

/**
 * Section 3: Ingest file
 */
export async function ingestFile(
  file: File,
  title?: string,
): Promise<IngestTextResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (title?.trim()) {
    formData.append('title', title.trim());
  }

  const res = await fetch(`${API_BASE_URL}/api/ingest/file`, {
    method: 'POST',
    body: formData,
  });

  const data = (await res.json()) as IngestTextResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? `File ingest failed (${res.status})`);
  }

  return data;
}

/**
 * Section 4: Ingest URL
 */
export interface IngestUrlRequest {
  url: string;
  title?: string;
}
export async function ingestUrl(
  payload: IngestUrlRequest,
): Promise<IngestTextResponse> {
  const res = await fetch(`${API_BASE_URL}/api/ingest/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as IngestTextResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `URL ingest failed (${res.status})`);
  }
  return data;
}
