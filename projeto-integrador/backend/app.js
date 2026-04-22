const express = require('express');
const { initDatabase } = require('./src/database');
const fornecedoresRouter = require('./src/routes/fornecedores');
const produtosRouter = require('./src/routes/produtos');
const associacoesRouter = require('./src/routes/associacoes');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/fornecedores', fornecedoresRouter);
  app.use('/api/produtos', produtosRouter);
  app.use('/api/associacoes', associacoesRouter);

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
