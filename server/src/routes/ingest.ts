import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ingestText } from '../services/ingestService';
import { extractPdfText } from '../lib/extractPdfText';
import { fetchUrlText } from '../lib/fetchUrlText';

const router = Router();

/**
 * @description Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files.
 * @property storage - The storage engine to use for storing the files.
 * @property limits - The limits of the file upload.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * @description Ingest text
 */
router.post('/', async (req: Request, res: Response) => {
  const { title, content, sourceUri } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    res
      .status(400)
      .json({ error: 'title is required and must be a non-empty string' });
    return;
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    res
      .status(400)
      .json({ error: 'content is required and must be a non-empty string' });
    return;
  }

  try {
    const result = await ingestText({
      title: title.trim(),
      content: content.trim(),
      sourceType: 'text',
      ingestMethod: 'text',
      sourceUri:
        typeof sourceUri === 'string' && sourceUri.trim()
          ? sourceUri.trim()
          : undefined,
    });

    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/ingest] error:', message);
    res.status(500).json({ error: message });
  }
});

/**
 * @description Ingest file
 */
router.post(
  '/file',
  upload.single('file'), // multer middleware to handle file upload
  async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'file is required' });
      return;
    }

    const originalName = file.originalname || 'upload.txt';
    const lower = originalName.toLowerCase();
    const isMarkdown = lower.endsWith('.md') || lower.endsWith('.markdown');
    const isText = lower.endsWith('.txt') || isMarkdown;
    const isPdf = lower.endsWith('.pdf');

    if (!isText && !isMarkdown && !isPdf) {
      res.status(400).json({
        error: 'Only .txt, .md, and .pdf files are supported',
      });
      return;
    }

    let content = '';
    let sourceType: 'text' | 'markdown' | 'pdf' = 'text';

    try {
      if (isPdf) {
        // parse PDF binary to text
        content = await extractPdfText(file.buffer);
        sourceType = 'pdf';
      } else {
        content = file.buffer.toString('utf8').trim();
        sourceType = isMarkdown ? 'markdown' : 'text';
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to read uploaded file';
      console.error('[POST /api/ingest/file] extract error:', message);
      res.status(400).json({ error: message });
      return;
    }

    if (!content) {
      res.status(400).json({
        error: isPdf
          ? 'No extractable text found in PDF (it may be image-only)'
          : 'file is empty',
      });
      return;
    }

    const title =
      typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      res
        .status(400)
        .json({ error: 'title is required and must be a non-empty string' });
      return;
    }

    try {
      const result = await ingestText({
        title,
        content,
        sourceType,
        ingestMethod: 'file',
        sourceUri: originalName,
      });
      res.status(201).json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[POST /api/ingest/file] error:', message);
      res.status(500).json({ error: message });
    }
  },
);

/**
 * @description Ingest URL
 */
router.post('/url', async (req: Request, res: Response) => {
  const { url, title } = req.body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    res
      .status(400)
      .json({ error: 'url is required and must be a non-empty string' });
    return;
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    res
      .status(400)
      .json({ error: 'title is required and must be a non-empty string' });
    return;
  }

  try {
    const page = await fetchUrlText(url);

    const result = await ingestText({
      title: title.trim(),
      content: page.text,
      sourceType: 'url',
      ingestMethod: 'url',
      sourceUri: page.url,
    });

    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/ingest/url] error:', message);
    res.status(400).json({ error: message });
  }
});

export default router;
