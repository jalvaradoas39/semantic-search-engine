import IngestForm from '@/components/IngestForm';
import SearchForm from '@/components/SearchForm';

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">
          Find meaning, not just keywords
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Ingest text, embed chunks, and rank matches by similarity score. This
          app returns retrieved chunks — it does not generate answers.
        </p>
      </section>

      <IngestForm />

      <SearchForm />

      <section className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
        Ingest and search UI (coming soon)
      </section>
    </div>
  );
}
