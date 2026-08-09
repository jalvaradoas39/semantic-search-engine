import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden bg-zinc-950 text-zinc-100">
        <header className="shrink-0 border-b border-zinc-800 px-4 py-2.5">
          <div className="mx-auto flex max-w-350 items-baseline justify-between gap-4">
            <p className="text-base font-semibold tracking-tight">
              Semantic Search Engine
            </p>
          </div>
        </header>

        <main className="mx-auto flex min-h-0 w-full max-w-350 flex-1 flex-col px-4 py-3">
          {children}
        </main>
      </body>
    </html>
  );
}
