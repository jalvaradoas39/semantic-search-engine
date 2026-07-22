import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDb } from './lib/db';
// import models in server entry file to ensure models are defined before use
import './models/SourceDocument';
import './models/Chunk';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }),
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'semantic-search-engine' });
});

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
