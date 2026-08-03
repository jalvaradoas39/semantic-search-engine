'use client';

import { useState } from 'react';
import { searchChunks, type SearchHit } from '@/lib/api';

function formatScore(score: number): string {
  return score.toFixed(4);
}

function scoreHint(score: number): string {
  if (score >= 0.75) return 'Strong match';
  if (score >= 0.55) return 'Moderate match';
  return 'Weaker match';
}

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(5);
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
        limit,
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
    <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div>
        <h2 className="text-lg font-medium text-zinc-100">Search</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Ranked chunks by meaning. Chunks are ranked by how similar they are to
          the query.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="query" className="block text-sm text-zinc-300">
            Query
          </label>
          <input
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            placeholder="e.g. How do embeddings find similar text?"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="limit" className="block text-sm text-zinc-300">
            Max results
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={isSearching}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSearching}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSearching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {hits && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            {hits.length === 0 ? (
              <>No chunks found for “{ranQuery}”.</>
            ) : (
              <>
                {hits.length} hit{hits.length === 1 ? '' : 's'} for “{ranQuery}”
              </>
            )}
          </p>

          <ul className="space-y-3">
            {hits.map((hit, index) => (
              <li
                key={hit.chunkId}
                className="rounded-lg border border-zinc-700 bg-zinc-950 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200">
                    #{index + 1} · {hit.documentTitle}
                  </p>
                  <p className="font-mono text-xs text-zinc-400">
                    score {formatScore(hit.score)}{' '}
                    <span className="text-zinc-500">
                      ({scoreHint(hit.score)})
                    </span>
                  </p>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  chunk #{hit.chunkIndex} · why it ranked: cosine similarity
                  between your query embedding and this chunk’s embedding
                </p>
                <pre className="mt-3 whitespace-pre-wrap wrap-break-word font-mono text-xs leading-relaxed text-zinc-300">
                  {hit.content}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
