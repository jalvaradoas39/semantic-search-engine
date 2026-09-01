import type { Metadata } from 'next';
import { Syne, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});

const plexSans = IBM_Plex_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Semantic Search Engine',
  description:
    'Ingest documents, embed chunks, and search by meaning — retrieval only, no RAG answers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="app-shell flex h-dvh flex-col overflow-hidden font-[family-name:var(--font-sans)] text-[var(--ink)]">
        <div
          className="pointer-events-none absolute inset-0 app-grid"
          aria-hidden
        />

        <header className="relative z-10 shrink-0 px-4 pb-1 pt-4 sm:px-6 sm:pt-5">
          <div className="mx-auto flex max-w-350 items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                Chunk · Embed · Rank
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-none tracking-tight text-[var(--ink)] sm:text-4xl">
                Semantic Search
                <span className="text-[var(--signal)]">.</span>
              </h1>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-350 flex-1 flex-col px-4 py-3 sm:px-6 sm:py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
