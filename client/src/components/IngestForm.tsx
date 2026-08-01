'use client';

import { useState } from 'react';
import {
  ingestText,
  type IngestSourceType,
  type IngestTextResponse,
} from '@/lib/api';

export default function IngestForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState<IngestSourceType>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<IngestTextResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setError('');
    setResult(null);
    setIsSubmitting(true);

    try {
      const data = await ingestText({
        title: title.trim(),
        content: content.trim(),
        sourceType,
      });
      setResult(data);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div>
        <h2 className="text-lg font-medium text-zinc-100">Ingest document</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Paste text or markdown. The server will chunk and embed it for search.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm text-zinc-300">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            placeholder="e.g. Intro to embeddings"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sourceType" className="block text-sm text-zinc-300">
            Source type
          </label>
          <select
            id="sourceType"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as IngestSourceType)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          >
            <option value="text">text</option>
            <option value="markdown">markdown</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm text-zinc-300">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            rows={10}
            className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-500"
            placeholder="Paste document text here…"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Ingesting…' : 'Ingest'}
        </button>
      </form>

      {result && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-sm text-zinc-300">
          <p className="font-medium text-green-400">Ingested successfully</p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-zinc-400">
            <li>documentId: {result.documentId}</li>
            <li>title: {result.title}</li>
            <li>status: {result.status}</li>
            <li>chunkCount: {result.chunkCount}</li>
            <li>sourceType: {result.sourceType}</li>
          </ul>
        </div>
      )}
    </section>
  );
}
