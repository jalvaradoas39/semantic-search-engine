import { Router, Request, Response } from 'express';
import { searchChunks } from '../services/searchService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { query, limit, documentId } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    res
      .status(400)
      .json({ error: 'query is required and must be a non-empty string' });
    return;
  }

  if (
    limit !== undefined &&
    (typeof limit !== 'number' || !Number.isFinite(limit))
  ) {
    res.status(400).json({ error: 'limit must be a number' });
    return;
  }

  if (documentId !== undefined && typeof documentId !== 'string') {
    res.status(400).json({ error: 'documentId must be a string' });
    return;
  }

  try {
    const result = await searchChunks({
      query: query.trim(),
      limit,
      documentId: documentId?.trim() || undefined,
    });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/search] error:', message);
    res.status(500).json({ error: message });
  }
});

export default router;
