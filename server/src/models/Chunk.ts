import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChunk extends Document {
  documentId: Types.ObjectId; // reference to the SourceDocument of this chunk
  content: string; // text of the chunk
  chunkIndex: number; // index of the chunk in the SourceDocument
  embedding: number[]; // embedding is a vector of numbers that represent the semantic meaning of the chunk
  metadata: {
    // object that contains the heading and page of the chunk
    heading?: string;
    page?: number;
  };
  createdAt: Date; // date and time the chunk was created
  updatedAt: Date; // date and time the chunk was last updated
}

const ChunkSchema = new Schema<IChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'SourceDocument',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      heading: { type: String },
      page: { type: Number },
    },
  },
  {
    timestamps: true,
  },
);

// index the chunk by the documentId and chunkIndex to ensure uniqueness. Default values of 1 for both documentId and chunkIndex will be used if not provided.
ChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

export const Chunk = mongoose.model<IChunk>('Chunk', ChunkSchema);
