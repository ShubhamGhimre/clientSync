import { Document } from '@langchain/core/documents';
export declare class VectorStoreService {
    addDocuments(chatBotId: string, documents: Document[], fileId: string): Promise<void>;
    similaritySearch(chatBotId: string, query: string, k?: number): Promise<Document[]>;
    private cosineSimilarity;
    deleteFileChunks(fileId: string): Promise<void>;
    deleteChatbotChunks(chatBotId: string): Promise<void>;
}
//# sourceMappingURL=vectorStore.service.d.ts.map