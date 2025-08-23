// // v/ClientSync/backend/list-chatbots.ts
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function listChatbots() {
//     try {
//         const chatbots = await prisma.chatBot.findMany({
//             include: {
//                 organization: {
//                     select: {
//                         name: true
//                     }
//                 },
//                 _count: {
//                     select: {
//                         files: true
//                     }
//                 }
//             }
//         });

//         console.log('\n=== Available Chatbots ===');
//         if (chatbots.length === 0) {
//             console.log('No chatbots found in the database.');
//             console.log('You need to create a chatbot first before initializing knowledge base.');
//         } else {
//             chatbots.forEach((chatbot, index) => {
//                 console.log(`\n${index + 1}. Chatbot Details:`);
//                 console.log(`   ID: ${chatbot.id}`);
//                 console.log(`   Name: ${chatbot.name}`);
//                 console.log(`   Description: ${chatbot.description || 'No description'}`);
//                 console.log(`   Organization: ${chatbot.organization.name}`);
//                 console.log(`   Files Count: ${chatbot._count.files}`);
//                 console.log(`   Knowledge Initialized: ${chatbot.isKnowledgeInitialized ? 'Yes' : 'No'}`);
//                 console.log(`   Total Chunks: ${chatbot.totalChunks || 0}`);
//                 console.log(`   Created: ${chatbot.createdAt}`);
//             });
//         }
        
//         console.log('\n=== How to initialize knowledge base ===');
//         console.log('Use one of the chatbot IDs above in this API call:');
//         console.log('POST /api/rag/initialize/{chatbotId}');
//         console.log('\nExample:');
//         if (chatbots.length > 0) {
//             console.log(`curl -X POST http://localhost:5000/api/rag/initialize/${chatbots[0].id} \\`);
//             console.log('  -H "Authorization: Bearer your-jwt-token" \\');
//             console.log('  -H "Content-Type: application/json"');
//         }
//         console.log('\n');
//     } catch (error) {
//         console.error('Error listing chatbots:', error);
//     } finally {
//         await prisma.$disconnect();
//     }
// }

// listChatbots();