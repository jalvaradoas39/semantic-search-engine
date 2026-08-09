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
    <section className="flex min-h-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="shrink-0">
        <h2 className="text-sm font-medium text-zinc-100">Ingest</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Paste text, upload a file, or fetch a public URL.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex min-h-0 flex-1 flex-col gap-2.5"
      >
        <div className="shrink-0 space-y-1">
          <label htmlFor="title" className="block text-xs text-zinc-400">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            placeholder="Optional for file/URL"
          />
        </div>

        {/* Separates document title from source choices */}
        <hr className="shrink-0 border-zinc-800" />

        <div className="grid shrink-0 gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="file" className="block text-xs text-zinc-400">
              Upload (.txt, .md, .pdf)
            </label>
            <input
              id="file"
              type="file"
              accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
              disabled={isSubmitting || !!url.trim()}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-zinc-400 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-800 file:px-2 file:py-1.5 file:text-xs file:text-zinc-100"
            />
            {file && (
              <p className="truncate text-xs text-zinc-500">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="url" className="block text-xs text-zinc-400">
              URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSubmitting || !!file}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500 disabled:opacity-50"
              placeholder="https://example.com/article"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col space-y-1">
          <label htmlFor="content" className="block text-xs text-zinc-400">
            Content (ignored if file or URL is set)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting || usingFileOrUrl}
            className="min-h-0 w-full flex-1 resize-none rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 font-mono text-xs leading-relaxed text-zinc-100 outline-none focus:border-zinc-500 disabled:opacity-50"
            placeholder="Paste document text here…"
          />
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Ingesting…' : 'Ingest'}
          </button>
          {error && (
            <p className="text-xs text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>

        {result && (
          <div className="shrink-0 rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-300">
            <p className="font-medium text-green-400">Ingested</p>
            <p className="mt-1 font-mono text-zinc-500">
              {result.title} · {result.sourceType} · {result.chunkCount} chunk
              {result.chunkCount === 1 ? '' : 's'} · {result.status}
            </p>
          </div>
        )}
      </form>
    </section>
  );
}
