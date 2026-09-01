import IngestForm from '@/components/IngestForm';
import SearchForm from '@/components/SearchForm';

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="max-w-2xl shrink-0 text-sm leading-relaxed text-[var(--ink-muted)]">
        Drop in a document, split it into searchable pieces, and rank matches by
        meaning — retrieval only, no generated answers.
      </p>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <IngestForm />
        <SearchForm />
      </div>
    </div>
  );
}
