'use client';

import { useState } from 'react';
import { searchChunks, type SearchHit } from '@/lib/api';

function formatScore(score: number): string {
  return score.toFixed(4);
}

function scoreHint(score: number): string {
  if (score >= 0.75) return 'Strong';
  if (score >= 0.55) return 'Moderate';
  return 'Weaker';
}

const DEFAULT_RESULT_LIMIT = 5;

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [ranQuery, setRanQuery] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!query.trim()) {
      setError('Enter a search query.');
      return;
    }

    setError('');
    setHits(null);
    setIsSearching(true);

    try {
      const data = await searchChunks({
        query: query.trim(),
        limit: DEFAULT_RESULT_LIMIT,
      });
      setHits(data.hits);
      setRanQuery(data.query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="shrink-0">
        <h2 className="text-sm font-medium text-zinc-100">Search</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Ranked chunks by similarity to the query.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex min-h-0 flex-1 flex-col gap-2.5"
      >
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1">
            <label htmlFor="query" className="block text-xs text-zinc-400">
              Query
            </label>
            <input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              placeholder="e.g. How many planets orbit the sun?"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:shrink-0"
          >
            {isSearching ? '…' : 'Search'}
          </button>
        </div>

        {error && (
          <p className="shrink-0 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950/60">
          {!hits && (
            <p className="p-3 text-xs text-zinc-600">
              Results appear here after you search.
            </p>
          )}

          {hits && (
            <div className="space-y-2 p-2.5">
              <p className="text-xs text-zinc-500">
                {hits.length === 0 ? (
                  <>No chunks found for “{ranQuery}”.</>
                ) : (
                  <>
                    {hits.length} hit{hits.length === 1 ? '' : 's'} for “
                    {ranQuery}”
                  </>
                )}
              </p>

              <ul className="space-y-2">
                {hits.map((hit, index) => (
                  <li
                    key={hit.chunkId}
                    className="rounded-md border border-zinc-800 bg-zinc-950 p-2.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-xs font-medium text-zinc-200">
                        #{index + 1} · {hit.documentTitle}
                      </p>
                      <p className="font-mono text-[11px] text-zinc-400">
                        {formatScore(hit.score)}{' '}
                        <span className="text-zinc-600">
                          ({scoreHint(hit.score)})
                        </span>
                      </p>
                    </div>
                    <p className="mt-0.5 text-[11px] text-zinc-600">
                      chunk #{hit.chunkIndex} · cosine similarity
                    </p>
                    <pre className="mt-1.5 max-h-28 overflow-y-auto whitespace-pre-wrap wrap-break-word font-mono text-[11px] leading-relaxed text-zinc-300">
                      {hit.content}
                    </pre>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
