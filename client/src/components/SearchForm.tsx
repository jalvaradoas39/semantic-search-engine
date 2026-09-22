'use client';

import { useState } from 'react';
import { searchChunks, type SearchHit } from '@/lib/api';

function formatScore(score: number): string {
  return score.toFixed(4);
}

const DEFAULT_RESULT_LIMIT = 5;

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [ranQuery, setRanQuery] = useState('');

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
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
    <section className="panel panel-search flex min-h-0 flex-col p-4 sm:p-5">
      <div className="shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--ember)">
          02 · Retrieve
        </p>
        <h2 className="mt-1 font-(family-name:--font-display) text-xl font-bold tracking-tight text-(--ink)">
          Search
        </h2>
        <p className="mt-1 text-xs text-(--ink-faint)">
          Ranked chunks by similarity to the query.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex min-h-0 flex-1 flex-col gap-3"
      >
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label
              htmlFor="query"
              className="block text-[11px] font-medium uppercase tracking-wide text-(--ink-muted)"
            >
              Query
            </label>
            <input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
              className="field"
              placeholder="e.g. Why does clear communication matter at work?"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="btn-search sm:shrink-0"
          >
            {isSearching ? '…' : 'Search'}
          </button>
        </div>

        {error && (
          <p className="shrink-0 text-xs text-(--danger)" role="alert">
            {error}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto border border-(--line) bg-[rgba(255,255,255,0.45)]">
          {!hits && (
            <p className="p-4 text-xs text-(--ink-faint)">
              Results appear here after you search.
            </p>
          )}

          {hits && (
            <div className="space-y-2.5 p-3">
              <p className="font-mono text-[11px] text-(--ink-faint)">
                {hits.length === 0 ? (
                  <>No chunks found for “{ranQuery}”.</>
                ) : (
                  <>
                    {hits.length} hit{hits.length === 1 ? '' : 's'} for “
                    {ranQuery}”
                  </>
                )}
              </p>

              <ul className="space-y-2.5">
                {hits.map((hit, index) => (
                  <li
                    key={hit.chunkId}
                    className="hit-row"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-semibold text-(--ink)">
                          {hit.documentTitle}
                        </p>
                        <span className="shrink-0 border border-(--line-strong) bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-(--ink-muted)">
                          {hit.ingestMethod}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-(--ink-muted)">
                        {formatScore(hit.score)}
                      </p>
                    </div>

                    <div className="score-track mt-2">
                      <div
                        className="score-fill"
                        style={{
                          width: `${Math.min(Math.max(hit.score, 0), 1) * 100}%`,
                          animationDelay: `${0.08 + index * 0.05}s`,
                        }}
                      />
                    </div>

                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-(--ink-faint)">
                      chunk #{hit.chunkIndex + 1}
                    </p>
                    <pre className="mt-2 max-h-28 overflow-y-auto whitespace-pre-wrap wrap-break-word bg-(--mono-bg) px-2.5 py-2 font-mono text-[11px] leading-relaxed text-(--mono-fg)">
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
