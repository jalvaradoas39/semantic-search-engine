import { convert } from 'html-to-text';

const MAX_BYTES = 1_500_000; // ~1.5 MB response cap
const FETCH_TIMEOUT_MS = 15_000;

function assertHttpUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('url must be a valid absolute URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('url must start with http:// or https://');
  }

  return url;
}

function htmlToPlainText(html: string): string {
  return convert(html, {
    wordwrap: false,
    selectors: [
      { selector: 'script', format: 'skip' },
      { selector: 'style', format: 'skip' },
      { selector: 'noscript', format: 'skip' },
      { selector: 'svg', format: 'skip' },
    ],
  })
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Download a page and return plain text.
 * Uses html-to-text for HTML; plain text responses are used as-is.
 */
export async function fetchUrlText(rawUrl: string): Promise<{
  url: string;
  titleHint: string;
  text: string;
}> {
  const url = assertHttpUrl(rawUrl.trim());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'semantic-search-engine/0.1 (learning project)',
        Accept: 'text/html,text/plain,*/*',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`failed to fetch url (${res.status})`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    const buffer = Buffer.from(await res.arrayBuffer());

    if (buffer.length > MAX_BYTES) {
      throw new Error('remote page is too large to ingest');
    }

    const body = buffer.toString('utf8');

    if (contentType.includes('text/plain')) {
      const text = body.replace(/\r\n/g, '\n').trim();
      if (!text) throw new Error('url returned empty text');
      return { url: url.toString(), titleHint: url.hostname, text };
    }

    const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const titleHint =
      titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || url.hostname;
    const text = htmlToPlainText(body);

    if (!text) {
      throw new Error('no extractable text found at url');
    }

    return { url: url.toString(), titleHint, text };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('url fetch timed out');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
