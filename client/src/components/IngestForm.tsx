'use client';

import { useState } from 'react';
import {
  ingestText,
  ingestFile,
  ingestUrl,
  type IngestTextResponse,
} from '@/lib/api';

export default function IngestForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<IngestTextResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setResult(null);
    setIsSubmitting(true);

    try {
      if (file) {
        const data = await ingestFile(file, title);
        setResult(data);
        setFile(null);
        setContent('');
        return;
      }

      if (url.trim()) {
        const data = await ingestUrl({ url: url.trim(), title });
        setResult(data);
        setUrl('');
        return;
      }

      if (!title.trim() || !content.trim()) {
        setError('Provide a file, a URL, or both title and pasted content.');
        return;
      }

      // Paste path always stores sourceType "text" (server default)
      const data = await ingestText({
        title: title.trim(),
        content: content.trim(),
      });
      setResult(data);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const usingFileOrUrl = !!file || !!url.trim();

  return (
    <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div>
        <h2 className="text-lg font-medium text-zinc-100">Ingest document</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Paste text, upload a .txt / .md / .pdf file, or ingest a public URL.
          The server chunks and embeds it for search.
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
            placeholder="Optional for file/URL (uses filename or page title)"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="file" className="block text-sm text-zinc-300">
            Upload file (.txt, .md, or .pdf)
          </label>
          <input
            id="file"
            type="file"
            accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
            disabled={isSubmitting || !!url.trim()}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-zinc-100"
          />
          {file && (
            <p className="text-xs text-zinc-500">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="url" className="block text-sm text-zinc-300">
            URL (public http/https page)
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isSubmitting || !!file}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 disabled:opacity-50"
            placeholder="https://example.com/article"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm text-zinc-300">
            Content (paste text — ignored if file or URL is set)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting || usingFileOrUrl}
            rows={10}
            className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-500 disabled:opacity-50"
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
