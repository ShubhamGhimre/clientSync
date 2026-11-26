import type { Request, Response, NextFunction } from 'express';

export function extractSubdomain(req: Request, res: Response, next: NextFunction) {
  const host = req.headers.host || '';
  // e.g., org1.localhost:3000 or org1.localhost:5000
  const match = host.match(/^([a-z0-9-]+)\.localhost(?::\d+)?$/i);
  if (match && typeof match[1] === 'string') {
    req.subdomain = match[1];
  } else if (req.headers['x-subdomain']) {
    // Fallback: allow subdomain via header (for API clients)
    req.subdomain = String(req.headers['x-subdomain']);
  } else {
    req.subdomain = undefined;
  }
  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      subdomain?: string | undefined;
    }
  }
}