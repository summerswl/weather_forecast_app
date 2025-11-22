devServer: {
  host: devServerHost,
  port: env.devServer.port || 3000,
  static: path.resolve(__dirname, '../static'),
  hot: true,
  historyApiFallback: true,
  compress: true,
  client: {
    overlay: true,
    progress: true,
  },

  proxy: [
    {
      context: ['/api', '/registrations', '/sessions', '/users', '/weather'],
      target: proxyTarget,
      changeOrigin: true,
      secure: false,
      ws: true,
      cookieDomainRewrite: { "*": "" },   // ← THIS IS THE MAGIC LINE
      onError: (err, req, res) => {
        if (err.code === 'ECONNREFUSED') {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end('Backend (Rails) is starting up – please wait a moment...');
        }
      },
    },
  ],
},