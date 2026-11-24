export declare class ConversationService {
    private ragService;
    constructor();
    processMessage(chatRoomId: string, message: string, sender: string, userId?: string): Promise<string>;
    getAllConversations(chatRoomId: string): Promise<({} & {
        message: string;
        chatRoomId: string;
        sender: string;
        id: string;
        createdAt: Date;
    })[]>;
    clearConversations(chatRoomId: string): Promise<{
        success: boolean;
        deletedCount: number;
        message: string;
    }>;
}
//# sourceMappingURL=conversation.service.d.ts.map