// setupProxy.js  ← IN PROJECT ROOT
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('🔥 PROXY LOADED: /weather → http://localhost:3001');

  app.use(
    '/weather',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};