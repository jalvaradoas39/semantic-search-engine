'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ingestText,
  ingestFile,
  ingestUrl,
  type IngestTextResponse,
} from '@/lib/api';

const RESULT_VISIBLE_MS = 8000;

export default function IngestForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<IngestTextResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!result) return;

    const timeoutId = window.setTimeout(() => {
      setResult(null);
    }, RESULT_VISIBLE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [result]);

  function resetFields() {
    setTitle('');
    setContent('');
    setFile(null);
    setUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setResult(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!file && !url.trim() && !content.trim()) {
      setError('Provide a file, a URL, or pasted text.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (file) {
        const data = await ingestFile(file, title.trim());
        setResult(data);
        resetFields();
        return;
      }

      if (url.trim()) {
        const data = await ingestUrl({
          url: url.trim(),
          title: title.trim(),
        });
        setResult(data);
        resetFields();
        return;
      }

      const data = await ingestText({
        title: title.trim(),
        content: content.trim(),
      });
      setResult(data);
      resetFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const usingFileOrUrl = !!file || !!url.trim();

  return (
    <section className="panel panel-ingest flex min-h-0 flex-col p-4 sm:p-5">
      <div className="shrink-0">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--signal)]">
          01 · Intake
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--ink)]">
          Ingest
        </h2>
        <p className="mt-1 text-xs text-[var(--ink-faint)]">
          Paste text, upload a file, or fetch a public URL.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex min-h-0 flex-1 flex-col gap-3"
      >
        <div className="shrink-0 space-y-1.5">
          <label
            htmlFor="title"
            className="block text-[11px] font-medium uppercase tracking-wide text-[var(--ink-muted)]"
          >
            Title <span className="normal-case tracking-normal text-[var(--ink-faint)]">(required)</span>
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
            className="field"
            placeholder="Name this document"
          />
        </div>

        <div
          className="shrink-0 border-t border-dashed border-[var(--line-strong)]"
          aria-hidden
        />

        <div className="grid shrink-0 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="file"
              className="block text-[11px] font-medium uppercase tracking-wide text-[var(--ink-muted)]"
            >
              Upload (.txt, .md, .pdf)
            </label>
            <input
              id="file"
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
              disabled={isSubmitting || !!url.trim()}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-[var(--ink-muted)] file:mr-2 file:rounded-[var(--radius)] file:border-0 file:bg-[var(--ink)] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-[var(--panel-solid)]"
            />
            {file && (
              <p className="truncate font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink-faint)]">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="url"
              className="block text-[11px] font-medium uppercase tracking-wide text-[var(--ink-muted)]"
            >
              URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSubmitting || !!file}
              className="field"
              placeholder="https://example.com/article"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col space-y-1.5">
          <label
            htmlFor="content"
            className="block text-[11px] font-medium uppercase tracking-wide text-[var(--ink-muted)]"
          >
            Text
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting || usingFileOrUrl}
            className="field min-h-0 flex-1 resize-none font-[family-name:var(--font-mono)] text-xs leading-relaxed"
            placeholder="Paste document text here…"
          />
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Ingesting…' : 'Ingest'}
          </button>
          {error && (
            <p className="text-xs text-[var(--danger)]" role="alert">
              {error}
            </p>
          )}
        </div>

        {result && (
          <div className="shrink-0 border border-[var(--line-strong)] bg-[var(--panel-solid)] px-3 py-2.5 text-xs">
            <p className="font-semibold text-[var(--ok)]">Ingested</p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-[var(--ink-faint)]">
              {result.title} · {result.sourceType} · {result.chunkCount} chunk
              {result.chunkCount === 1 ? '' : 's'} · {result.status}
            </p>
          </div>
        )}
      </form>
    </section>
  );
}
