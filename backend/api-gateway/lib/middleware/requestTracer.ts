import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '../config';

export interface RequestTrace {
  requestId: string;
  correlationId: string;
  timestamp: string;
  stage: 'incoming' | 'proxying' | 'response' | 'error';
  method: string;
  originalUrl: string;
  targetService?: string;
  targetUrl?: string;
  statusCode?: number;
  duration?: number;
  clientIp?: string;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  error?: {
    message: string;
    stack?: string;
    type?: string;
  };
}

export class RequestTracer {
  private static instance: RequestTracer;
  private requestId: string = '';
  private correlationId: string = '';
  private startTime: number = 0;

  static getInstance(): RequestTracer {
    if (!RequestTracer.instance) {
      RequestTracer.instance = new RequestTracer();
    }
    return RequestTracer.instance;
  }

  startTrace(req: NextApiRequest): { requestId: string; correlationId: string } {
    this.requestId = uuidv4();
    this.correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    this.startTime = Date.now();

    // Log incoming request
    this.logTrace({
      requestId: this.requestId,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString(),
      stage: 'incoming',
      method: req.method || 'UNKNOWN',
      originalUrl: req.url || '',
      clientIp: this.getClientIp(req),
      query: req.query,
      headers: this.sanitizeHeaders(req.headers)
    });

    return {
      requestId: this.requestId,
      correlationId: this.correlationId
    };
  }

  logProxying(targetService: string, targetUrl: string, method: string): void {
    this.logTrace({
      requestId: this.requestId,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString(),
      stage: 'proxying',
      method,
      originalUrl: '',
      targetService,
      targetUrl
    });
  }

  logResponse(statusCode: number, error?: Error): void {
    const duration = Date.now() - this.startTime;
    const stage = statusCode >= 400 ? 'error' : 'response';

    this.logTrace({
      requestId: this.requestId,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString(),
      stage,
      method: '',
      originalUrl: '',
      statusCode,
      duration,
      error: error ? {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      } : undefined
    });
  }

  private logTrace(trace: RequestTrace): void {
    const logLevel = trace.stage === 'error' ? 'error' : 'info';
    
    console.log(JSON.stringify({
      level: logLevel,
      service: 'api-gateway',
      ...trace
    }));
  }

  private getClientIp(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const remoteAddress = req.connection?.remoteAddress;
    
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    }
    
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }
    
    return remoteAddress || 'unknown';
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveHeaders.includes(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    }
    
    return sanitized;
  }

  getRequestId(): string {
    return this.requestId;
  }

  getCorrelationId(): string {
    return this.correlationId;
  }
}

/**
 * Middleware wrapper for API routes to add request tracing
 */
export function withRequestTracing(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const tracer = RequestTracer.getInstance();
    
    try {
      // Start tracing
      const { requestId, correlationId } = tracer.startTrace(req);
      
      // Add headers to response
      res.setHeader('X-Request-ID', requestId);
      res.setHeader('X-Correlation-ID', correlationId);
      
      // Call the original handler
      await handler(req, res);
      
      // Log successful response
      tracer.logResponse(res.statusCode);
      
    } catch (error) {
      // Log error response
      tracer.logResponse(500, error as Error);
      
      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Helper function to get current request ID and correlation ID
 */
export function getCurrentTraceIds(): { requestId: string; correlationId: string } {
  const tracer = RequestTracer.getInstance();
  return {
    requestId: tracer.getRequestId(),
    correlationId: tracer.getCorrelationId()
  };
}

