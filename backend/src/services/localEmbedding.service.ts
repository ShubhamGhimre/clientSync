import { pipeline } from '@xenova/transformers';

export class LocalEmbeddingService {
  private static instance: LocalEmbeddingService;
  private embedder: any = null;
  private isLoading = false;

  private constructor() {}

  static getInstance(): LocalEmbeddingService {
    if (!LocalEmbeddingService.instance) {
      LocalEmbeddingService.instance = new LocalEmbeddingService();
    }
    return LocalEmbeddingService.instance;
  }

  async initialize(): Promise<void> {
    if (this.embedder || this.isLoading) return;
    
    this.isLoading = true;
    console.log('Loading local embedding model...');
    
    try {
      // Use a lightweight embedding model
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Local embedding model loaded successfully');
    } catch (error) {
      console.error('Error loading local embedding model:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async embedText(text: string): Promise<number[]> {
    if (!this.embedder) {
      await this.initialize();
    }

    try {
      const output = await this.embedder(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.embedText(text);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }
}