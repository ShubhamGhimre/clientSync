// src/services/documentProcessor.service.ts
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

export class DocumentProcessorService {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
  }

  async processFile(filePath: string, fileName: string): Promise<Document[]> {
    const extension = path.extname(filePath).toLowerCase();
    let loader;

    try {
      switch (extension) {
        case '.pdf':
          loader = new PDFLoader(filePath);
          break;
        case '.csv':
          loader = new CSVLoader(filePath);
          break;
        case '.txt':
          loader = new TextLoader(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }

      const docs = await loader.load();
      const splitDocs = await this.textSplitter.splitDocuments(docs);

      return splitDocs.map((doc, index) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          fileName,
          filePath,
          chunkIndex: index,
          fileType: extension,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  async processCSVDataset(csvPath: string): Promise<Document[]> {
    return new Promise((resolve, reject) => {
      const documents: Document[] = [];
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.text && row.source && row.site) {
            documents.push(new Document({
              pageContent: row.text,
              metadata: {
                source: row.source,
                site: row.site,
                type: 'knowledge_base',
                fileName: 'dataset_rag.csv',
              },
            }));
          }
        })
        .on('end', () => {
          resolve(documents);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}