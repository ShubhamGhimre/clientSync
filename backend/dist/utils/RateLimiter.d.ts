export declare class RateLimiter {
    private requests;
    private maxRequests;
    private windowMs;
    constructor(maxRequests: number, windowMs?: number);
    waitForSlot(): Promise<void>;
    getStatus(): {
        remaining: number;
        resetTime: number;
    };
}
export declare const geminiChatLimiter: RateLimiter;
export declare const geminiEmbeddingLimiter: RateLimiter;
//# sourceMappingURL=RateLimiter.d.ts.map