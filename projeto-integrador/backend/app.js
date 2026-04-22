const fs = require('fs');
const path = require('path');
const express = require('express');
const { initDatabase } = require('./src/database');
const fornecedoresRouter = require('./src/routes/fornecedores');
const produtosRouter = require('./src/routes/produtos');
const associacoesRouter = require('./src/routes/associacoes');


function setupCors(app) {
  const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_ORIGIN,
  ].filter(Boolean);

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return next();
  });
}

function setupFrontendRoutes(app) {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');

  if (fs.existsSync(frontendDistPath)) {
    app.use('/app', express.static(frontendDistPath));

    app.get('/app/*', (_req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });

    return;
  }

  app.get('/app', (_req, res) => {
    res.status(503).json({
      message: 'Frontend não compilado. Execute "npm run build" na pasta frontend e acesse /app.',
      frontendDevUrl: 'http://localhost:5173',
    });
  });
}

function createApp() {
  const app = express();

  app.use(express.json());

  setupCors(app);

  app.get('/', (_req, res) => {
    res.json({
      message: 'API Projeto Integrador em execução.',
      endpointsBase: ['/api/fornecedores', '/api/produtos', '/api/associacoes'],
      frontend: {
        dev: 'http://localhost:5173',
        build: '/app',
      },
    });
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/fornecedores', fornecedoresRouter);
  app.use('/api/produtos', produtosRouter);
  app.use('/api/associacoes', associacoesRouter);

  setupFrontendRoutes(app);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  });

  return app;
}

async function startServer() {
  await initDatabase();

  const app = createApp();
  const PORT = Number(process.env.PORT || 3000);

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { createApp, startServer };
