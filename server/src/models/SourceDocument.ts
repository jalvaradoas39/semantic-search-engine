import mongoose, { Schema, Document } from 'mongoose';

export type SourceType = 'markdown' | 'pdf' | 'url' | 'text';
export type SourceStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface ISourceDocument extends Document {
  title: string; // Title of the source document
  sourceType: SourceType; // Type of the source document (markdown, pdf, url, text)
  sourceUri: string; // URL of the source document (e.g. https://www.website.com/page.html)
  status: SourceStatus; // Status of the source document (pending, processing, ready, failed)
  errorMessage: string; // Error message if the source document failed to process
  chunkCount: number; // Number of chunks in the source document
  createdAt: Date; // Date and time the source document was created
  updatedAt: Date; // Date and time the source document was last updated
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
