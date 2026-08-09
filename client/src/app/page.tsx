import IngestForm from '@/components/IngestForm';
import SearchForm from '@/components/SearchForm';

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <section className="shrink-0">
        <h1 className="text-lg font-semibold tracking-tight">
          Find meaning, not just keywords
        </h1>
        <p className="mt-0.5 text-sm text-zinc-400">
          Ingest text, embed chunks, and rank matches by similarity — retrieval
          only, no generated answers.
        </p>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
        <IngestForm />
        <SearchForm />
      </div>
    </div>
  );
}
