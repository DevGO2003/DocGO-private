import { NextApiRequest, NextApiResponse } from 'next';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Server } from 'http';
import WebSocket from 'ws';

// This is a server-side WebSocket proxy
// Note: Next.js API routes don't support WS upgrade directly; this is a workaround using http-proxy-middleware for WS
// For full WS, consider adding a custom server or use Vercel edge functions (not for local)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Upgrade to WS
    const targetUrl = 'ws://automation-service:8003/ws/progress';  // Internal Docker URL
    const proxy = createProxyMiddleware({
      target: 'http://automation-service:8003',  // HTTP for upgrade
      ws: true,
      changeOrigin: true,
      pathRewrite: {
        '^/api/ws/progress': '/ws/progress',  // Strip /api
      },
    });

    // Attach proxy to req
    return proxy(req, res, (err) => {
      if (err) {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy failed' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Install http-proxy-middleware and ws: npm install http-proxy-middleware ws
