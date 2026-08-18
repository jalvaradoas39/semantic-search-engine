import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX;
const indexHostRaw = process.env.PINECONE_INDEX_HOST;

if (!apiKey) {
  throw new Error('PINECONE_API_KEY is not set in .env');
}
if (!indexName) {
  throw new Error('PINECONE_INDEX is not set in .env');
}
if (!indexHostRaw) {
  throw new Error('PINECONE_INDEX_HOST is not set in .env');
}

const indexHost = indexHostRaw.replace(/^https?:\/\//, '');

export const pinecone = new Pinecone({ apiKey });

// the index we will use to store our data
export const pineconeIndex = pinecone.index({
  name: indexName,
  host: indexHost,
});
