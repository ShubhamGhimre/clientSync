export declare class RAGService {
    private vectorStoreService;
    private documentProcessor;
    constructor();
    initializeChatbotKnowledge(chatBotId: string, p0: {
        onFileStart: (fileName: string) => void;
        onFileComplete: (fileName: string, processedFiles: number) => void;
        onChunkingStart: (totalChunks: number) => void;
        onChunkComplete: (processedChunks: number) => void;
        onEmbeddingStart: () => void;
        onComplete: () => void;
    }): Promise<void>;
    processNewFile(fileId: string): Promise<void>;
    generateResponse(chatBotId: string, query: string, conversationHistory?: Array<{
        role: string;
        message: string;
    }>): Promise<string>;
}
//# sourceMappingURL=rag.service.d.ts.map