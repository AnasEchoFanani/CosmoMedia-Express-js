import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/serviceRegistry.js';

export const setupProxies = (app) => {
  // Setup proxy middleware for each service
  Object.keys(services).forEach(serviceName => {
    const service = services[serviceName];
    const pathRewrite = {};
    
    // Create proxy for each route in the service
    service.routes.forEach(route => {
      const proxyPath = route.path;
      
      app.use(proxyPath, createProxyMiddleware({
        target: service.url,
        changeOrigin: true,
        pathRewrite: pathRewrite,
        onProxyReq: (proxyReq, req) => {
          // Forward the user information if available
          if (req.user) {
            proxyReq.setHeader('X-User', JSON.stringify(req.user));
          }
        },
        onError: (err, req, res) => {
          console.error(`Proxy error: ${err.message}`);
          res.status(500).json({
            message: 'Service temporarily unavailable',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }
      }));
    });
  });
};
