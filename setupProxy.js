// setupProxy.js  (project root)
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // When running locally → proxy to localhost:3001
  // When running in Docker   → proxy to the "rails" service name
  const railsHost = process.env.RAILS_HOST || 'localhost';
  const railsPort = process.env.RAILS_PORT || '3001';
  const target = `http://${railsHost}:${railsPort}`;

  console.log(`Proxying /weather → ${target}`);

  app.use(
    '/weather',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: 'warn',
    })
  );
};