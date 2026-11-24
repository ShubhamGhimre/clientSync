import { Document } from '@langchain/core/documents';
export declare class DocumentProcessorService {
    private textSplitter;
    constructor();
    processFile(filePath: string, fileName: string): Promise<Document[]>;
    processCSVDataset(csvPath: string): Promise<Document[]>;
}
//# sourceMappingURL=documentProcessor.service.d.ts.map