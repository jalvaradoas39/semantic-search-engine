export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type IngestSourceType = 'text' | 'markdown';

export interface IngestTextRequest {
  title: string;
  content: string;
  sourceType?: IngestSourceType;
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
