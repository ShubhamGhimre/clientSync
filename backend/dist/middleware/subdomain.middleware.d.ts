import type { Request, Response, NextFunction } from 'express';
export declare function extractSubdomain(req: Request, res: Response, next: NextFunction): void;
declare global {
    namespace Express {
        interface Request {
            subdomain?: string | undefined;
        }
    }
}
//# sourceMappingURL=subdomain.middleware.d.ts.map