import { PDFParse } from 'pdf-parse';

/**
 * Pull plain text out of a PDF buffer.
 * Buffer is made available to us by multer.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer }); // converts the PDF buffer to a JSON object

  try {
    const result = await parser.getText(); // converts the JSON object to a string
    return (result.text ?? '').replace(/\r\n/g, '\n').trim();
  } finally {
    await parser.destroy();
  }
}
