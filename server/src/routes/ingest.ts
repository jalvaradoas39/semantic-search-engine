import { Router, Request, Response } from 'express';
import { ingestText } from '../services/ingestService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { title, content, sourceType, sourceUri } = req.body;

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

  if (
    sourceType !== undefined &&
    sourceType !== 'text' &&
    sourceType !== 'markdown'
  ) {
    res
      .status(400)
      .json({ error: 'sourceType must be "text" or "markdown" for this step' });
    return;
  }

  try {
    const result = await ingestText({
      title: title.trim(),
      content: content.trim(),
      sourceType,
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

export default router;
