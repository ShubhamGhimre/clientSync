import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        organizationId: string;
        organization: {
            id: string;
            subdomain: string;
        };
    };
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const checkSubdomain: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.middleware.d.ts.map