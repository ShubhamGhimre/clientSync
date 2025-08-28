// src/routes/rag.routes.ts
import express from 'express';
import { RAGService } from '../services/rag.service';
import { ConversationService } from '../services/conversation.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const ragService = new RAGService();
const conversationService = new ConversationService();
const prisma = new PrismaClient();

// Store initialization progress - Enhanced with better persistence
const initializationProgress = new Map<string, {
  status: 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  totalChunks: number;
  processedChunks: number;
  currentFile?: string;
  currentStep?: string;
  message: string;
  startTime: Date;
  lastUpdated: Date;
  progress: number; // Percentage
  estimatedTimeRemaining?: string;
  error?: string;
}>();

// Enhanced progress update function
function updateProgress(chatbotId: string, updates: Partial<typeof initializationProgress extends Map<string, infer T> ? T : never>) {
  const current = initializationProgress.get(chatbotId);
  if (!current) return;

  const updated = {
    ...current,
    ...updates,
    lastUpdated: new Date(),
  };

  // Calculate progress percentage with proper weighting
  let calculatedProgress = 0;
  
  if (updated.totalFiles > 0 && updated.totalChunks > 0) {
    // Files processing is 30% of total progress
    const fileProgress = (updated.processedFiles / updated.totalFiles) * 30;
    // Chunking and embedding is 70% of total progress
    const chunkProgress = (updated.processedChunks / updated.totalChunks) * 70;
    calculatedProgress = fileProgress + chunkProgress;
  } else if (updated.totalFiles > 0) {
    // Only file progress available (during early stages)
    calculatedProgress = (updated.processedFiles / updated.totalFiles) * 30;
  }
  
  // Ensure progress doesn't go backwards and caps at 100
  updated.progress = Math.min(100, Math.max(updated.progress, calculatedProgress));

  // Estimate time remaining
  if (updated.progress > 0 && updated.progress < 100) {
    const elapsed = Date.now() - updated.startTime.getTime();
    const estimatedTotal = (elapsed / updated.progress) * 100;
    const remaining = estimatedTotal - elapsed;
    updated.estimatedTimeRemaining = formatDuration(remaining);
  }

  initializationProgress.set(chatbotId, updated);
}

/**
 * @swagger
 * /api/rag/initialize/{chatbotId}:
 *   post:
 *     summary: Initialize knowledge base for a chatbot
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatbotId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the chatbot
 *     responses:
 *       202:
 *         description: Knowledge base initialization started
 *       404:
 *         description: Chatbot not found
 *       409:
 *         description: Initialization already in progress
 */
router.post('/initialize/:chatbotId', authenticateToken, async (req, res) => {
    try {
        const { chatbotId } = req.params;

        if (typeof chatbotId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid chatbotId parameter'
            });
        }

        // Validate that the chatbot exists and get file count
        const [chatBot, files] = await Promise.all([
            prisma.chatBot.findUnique({
                where: { id: chatbotId }
            }),
            prisma.file.findMany({
                where: { chatBotId: chatbotId },
                select: { id: true, fileName: true }
            })
        ]);

        if (!chatBot) {
            return res.status(404).json({
                success: false,
                message: `Chatbot with ID ${chatbotId} not found. Please check the chatbot ID.`
            });
        }

        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files found for this chatbot. Upload files first before initializing knowledge base.'
            });
        }

        // Check if initialization is already in progress
        if (initializationProgress.has(chatbotId)) {
            const progress = initializationProgress.get(chatbotId)!;
            if (progress.status === 'processing') {
                return res.status(409).json({
                    success: false,
                    message: 'Knowledge base initialization is already in progress',
                    progressUrl: `/api/rag/progress/${chatbotId}`,
                    progress: {
                        status: progress.status,
                        progress: progress.progress,
                        message: progress.message
                    }
                });
            }
        }

        // Initialize progress tracking with file information
        initializationProgress.set(chatbotId, {
            status: 'processing',
            totalFiles: files.length,
            processedFiles: 0,
            totalChunks: 0,
            processedChunks: 0,
            currentStep: 'Preparing files...',
            message: 'Starting knowledge base initialization...',
            startTime: new Date(),
            lastUpdated: new Date(),
            progress: 0
        });

        // Start initialization in background with enhanced progress tracking
        const initializeWithProgress = async () => {
            try {
                // Update progress at each major step
                updateProgress(chatbotId, {
                    currentStep: 'Analyzing files...',
                    message: 'Analyzing uploaded files and extracting content...',
                    progress: 5 // Start with some progress
                });

                // Create progress callback functions that actually update the progress
                const progressCallbacks = {
                    onFileStart: (fileName: string) => {
                        updateProgress(chatbotId, {
                            currentFile: fileName,
                            currentStep: 'Processing file',
                            message: `Processing file: ${fileName}`
                        });
                    },
                    onFileComplete: (fileName: string, processedFiles: number) => {
                        updateProgress(chatbotId, {
                            processedFiles,
                            currentStep: 'File processed',
                            message: `Completed processing: ${fileName}`
                        });
                    },
                    onChunkingStart: (totalChunks: number) => {
                        updateProgress(chatbotId, {
                            totalChunks,
                            currentStep: 'Creating chunks',
                            message: `Creating ${totalChunks} text chunks...`,
                            progress: 30 // File processing complete, chunking starts
                        });
                    },
                    onChunkComplete: (processedChunks: number) => {
                        updateProgress(chatbotId, {
                            processedChunks,
                            currentStep: 'Processing chunks',
                            message: `Processed ${processedChunks} chunks...`
                        });
                    },
                    onEmbeddingStart: () => {
                        updateProgress(chatbotId, {
                            currentStep: 'Generating embeddings',
                            message: 'Generating vector embeddings for semantic search...',
                            progress: 70 // Chunking complete, embedding starts
                        });
                    },
                    onEmbeddingProgress: (completed: number, total: number) => {
                        const embeddingProgress = (completed / total) * 25; // 25% for embedding
                        updateProgress(chatbotId, {
                            currentStep: 'Generating embeddings',
                            message: `Generated embeddings for ${completed}/${total} chunks...`,
                            progress: 70 + embeddingProgress
                        });
                    },
                    onComplete: () => {
                        updateProgress(chatbotId, {
                            status: 'completed',
                            progress: 100,
                            currentStep: 'Completed',
                            message: 'Knowledge base initialization completed successfully'
                        });
                    }
                };

                // If the RAG service doesn't support callbacks, add manual progress updates
                // Check if the ragService.initializeChatbotKnowledge method accepts callbacks
                const ragServiceSupportsCallbacks = typeof ragService.initializeChatbotKnowledge === 'function' && 
                    ragService.initializeChatbotKnowledge.length > 1;

                if (ragServiceSupportsCallbacks) {
                    // Initialize with callbacks
                    await ragService.initializeChatbotKnowledge(chatbotId, progressCallbacks);
                } else {
                    // Manual progress updates if callbacks aren't supported
                    console.log('RAG service does not support progress callbacks, using manual updates');
                    
                    // Simulate progress updates during initialization
                    const simulateProgress = async () => {
                        const steps = [
                            { progress: 10, message: 'Extracting text from files...', step: 'File extraction' },
                            { progress: 20, message: 'Processing document content...', step: 'Content processing' },
                            { progress: 35, message: 'Creating text chunks...', step: 'Chunking' },
                            { progress: 50, message: 'Analyzing chunk relationships...', step: 'Analysis' },
                            { progress: 65, message: 'Generating embeddings...', step: 'Embeddings' },
                            { progress: 80, message: 'Storing vector data...', step: 'Storage' },
                            { progress: 90, message: 'Finalizing knowledge base...', step: 'Finalization' },
                            { progress: 95, message: 'Optimizing search index...', step: 'Optimization' }
                        ];

                        const totalDuration = 30000; // 30 seconds estimated
                        const stepDuration = totalDuration / steps.length;

                        for (const stepInfo of steps) {
                            await new Promise(resolve => setTimeout(resolve, stepDuration));
                            updateProgress(chatbotId, {
                                progress: stepInfo.progress,
                                currentStep: stepInfo.step,
                                message: stepInfo.message
                            });
                        }
                    };

                    // Start both the actual initialization and progress simulation
                    await Promise.all([
                        ragService.initializeChatbotKnowledge(chatbotId, progressCallbacks),
                        simulateProgress()
                    ]);
                }

                // Final completion update
                initializationProgress.set(chatbotId, {
                    ...initializationProgress.get(chatbotId)!,
                    status: 'completed',
                    progress: 100,
                    currentStep: 'Completed',
                    message: 'Knowledge base initialization completed successfully',
                    lastUpdated: new Date()
                });

            } catch (error: any) {
                console.error(`RAG initialization failed for chatbot ${chatbotId}:`, error);
                
                initializationProgress.set(chatbotId, {
                    ...initializationProgress.get(chatbotId)!,
                    status: 'failed',
                    currentStep: 'Failed',
                    message: `Initialization failed: ${error.message}`,
                    error: error.message,
                    lastUpdated: new Date()
                });
            }
        };

        // Start the process
        initializeWithProgress();

        res.status(202).json({
            success: true,
            message: `Knowledge base initialization started for chatbot: ${chatBot.name}`,
            progressUrl: `/api/rag/progress/${chatbotId}`,
            chatbot: {
                id: chatBot.id,
                name: chatBot.name
            },
            estimatedFiles: files.length
        });
    } catch (error: any) {
        console.error('Initialize endpoint error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to start knowledge base initialization',
        });
    }
});

/**
 * @swagger
 * /api/rag/progress/{chatbotId}:
 *   get:
 *     summary: Get knowledge base initialization progress
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatbotId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the chatbot
 *     responses:
 *       200:
 *         description: Initialization progress retrieved successfully
 *       404:
 *         description: No initialization process found
 */
router.get('/progress/:chatbotId', authenticateToken, async (req, res) => {
    try {
        const { chatbotId } = req.params;
        
        if (typeof chatbotId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid chatbotId parameter'
            });
        }

        const progress = initializationProgress.get(chatbotId);
        
        if (!progress) {
            // Check if chatbot exists and is already initialized
            const chatBot = await prisma.chatBot.findUnique({
                where: { id: chatbotId },
                select: { 
                    isKnowledgeInitialized: true,
                    totalChunks: true,
                    lastKnowledgeUpdate: true
                }
            });

            if (!chatBot) {
                return res.status(404).json({
                    success: false,
                    message: 'Chatbot not found'
                });
            }

            if (chatBot.isKnowledgeInitialized) {
                // Return completed status for already initialized chatbots
                return res.json({
                    success: true,
                    data: {
                        status: 'completed',
                        progress: 100,
                        totalFiles: 0,
                        processedFiles: 0,
                        totalChunks: chatBot.totalChunks,
                        processedChunks: chatBot.totalChunks,
                        currentStep: 'Completed',
                        message: 'Knowledge base is already initialized',
                        timeElapsed: 'N/A',
                        lastUpdated: chatBot.lastKnowledgeUpdate
                    }
                });
            }

            return res.status(404).json({
                success: false,
                message: 'No initialization process found for this chatbot'
            });
        }

        // Calculate time elapsed
        const timeElapsed = Date.now() - progress.startTime.getTime();
        const timeElapsedFormatted = formatDuration(timeElapsed);

        res.json({
            success: true,
            data: {
                ...progress,
                timeElapsed: timeElapsedFormatted,
                startTime: progress.startTime.toISOString(),
                lastUpdated: progress.lastUpdated.toISOString()
            }
        });
    } catch (error: any) {
        console.error('Progress endpoint error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve progress'
        });
    }
});

/**
 * @swagger
 * /api/rag/chat:
 *   post:
 *     summary: Process a chat message
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatRoomId
 *               - message
 *               - sender
 *             properties:
 *               chatRoomId:
 *                 type: string
 *                 description: The chat room ID
 *               message:
 *                 type: string
 *                 description: The user's message
 *               sender:
 *                 type: string
 *                 description: The sender type (user/bot)
 *               userId:
 *                 type: string
 *                 description: The user ID (optional)
 *     responses:
 *       200:
 *         description: Message processed successfully
 *       404:
 *         description: Chat room not found
 */
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { chatRoomId, message, sender, userId } = req.body;

        // Validate required fields
        if (!chatRoomId || !message || !sender) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: chatRoomId, message, sender'
            });
        }

        const response = await conversationService.processMessage(
            chatRoomId,
            message,
            sender,
            userId
        );

        res.json({
            success: true,
            data: {
                response,
                message: 'Message processed successfully',
            },
        });
    } catch (error: any) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process message',
        });
    }
});

// Utility function to format duration
function formatDuration(ms: number): string {
    if (ms < 0) return '0s';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

export default router;