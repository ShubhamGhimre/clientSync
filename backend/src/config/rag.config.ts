// src/config/rag.config.ts
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';


export const ragConfig = {
  gemini: {
    apiKey: process.env.GOOGLE_API_KEY!,
    model: 'gemini-1.5-flash', // Changed from 'gemini-pro' which is deprecated
    temperature: 0.1,
    maxOutputTokens: 1000,
  },
  embeddings: {
    model: 'text-embedding-004', // Updated embedding model
  },
  vectorStore: {
    chunkSize: 800,
    chunkOverlap: 150,
  },
};

export const llm = new ChatGoogleGenerativeAI({
  apiKey: ragConfig.gemini.apiKey,
  modelName: ragConfig.gemini.model,
  temperature: ragConfig.gemini.temperature,
  maxOutputTokens: ragConfig.gemini.maxOutputTokens,
});

export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: ragConfig.gemini.apiKey,
  modelName: ragConfig.embeddings.model,
});