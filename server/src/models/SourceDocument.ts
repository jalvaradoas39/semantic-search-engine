import mongoose, { Schema, Document } from 'mongoose';

export type SourceType = 'markdown' | 'pdf' | 'url' | 'text';
/** Which IngestForm path created this document */
export type IngestMethod = 'file' | 'url' | 'text';
export type SourceStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface ISourceDocument extends Document {
  title: string;
  sourceType: SourceType;
  ingestMethod: IngestMethod;
  sourceUri: string;
  status: SourceStatus;
  errorMessage: string;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SourceDocumentSchema = new Schema<ISourceDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ['markdown', 'pdf', 'url', 'text'],
      required: true,
    },
    ingestMethod: {
      type: String,
      enum: ['file', 'url', 'text'],
      required: true,
      default: 'text',
    },
    sourceUri: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const SourceDocument = mongoose.model<ISourceDocument>(
  'SourceDocument',
  SourceDocumentSchema,
);
