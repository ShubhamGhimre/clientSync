import 'dotenv/config';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
export declare const ragConfig: {
    gemini: {
        apiKey: string;
        model: string;
        temperature: number;
        maxOutputTokens: number;
    };
    embeddings: {
        model: string;
    };
    vectorStore: {
        chunkSize: number;
        chunkOverlap: number;
    };
};
export declare const llm: ChatGoogleGenerativeAI;
export declare const embeddings: GoogleGenerativeAIEmbeddings;
//# sourceMappingURL=rag.config.d.ts.map