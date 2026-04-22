const path = require('path');
const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const tempDbFile = path.join(__dirname, 'test.sqlite');
process.env.DB_FILE = tempDbFile;

const { createApp } = require('../app');
const { initDatabase, getDb } = require('../src/database');

let server;
let baseUrl;

async function requestJson({ method, endpoint, body, headers }) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const parsedBody = text ? JSON.parse(text) : null;

  return {
    status: response.status,
    body: parsedBody,
    headers: response.headers,
  };
}

test.before(async () => {
  if (fs.existsSync(tempDbFile)) fs.unlinkSync(tempDbFile);
  await initDatabase();

  const app = createApp();

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      return resolve();
    });
  });

  const db = await getDb();
  await db.close();

  if (fs.existsSync(tempDbFile)) fs.unlinkSync(tempDbFile);
});



test('deve responder CORS para origem do frontend', async () => {
  const response = await fetch(`${baseUrl}/api/fornecedores`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5173',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});
test('deve retornar metadados da API na rota raiz', async () => {
  const res = await requestJson({
    method: 'GET',
    endpoint: '/',
    headers: { Origin: 'http://localhost:5173' },
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.message, 'API Projeto Integrador em execução.');
  assert.equal(res.body.frontend.dev, 'http://localhost:5173');
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});



test('deve orientar acesso ao frontend quando dist não existir', async () => {
  const res = await requestJson({ method: 'GET', endpoint: '/app' });

  assert.equal(res.status, 503);
  assert.match(res.body.message, /Frontend não compilado/);
});
test('deve cadastrar fornecedor com sucesso', async () => {
  const res = await requestJson({
    method: 'POST',
    endpoint: '/api/fornecedores',
    body: {
      nomeEmpresa: 'Fornecedor XPTO',
      cnpj: '12345678000190',
      endereco: 'Rua A, 100',
      telefone: '11999990000',
      email: 'contato@xpto.com',
      contatoPrincipal: 'Maria Silva',
    },
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.message, 'Fornecedor cadastrado com sucesso!');
  assert.equal(res.body.data.cnpj, '12.345.678/0001-90');
  assert.equal(res.body.data.telefone, '(11) 99999-0000');
});

test('não deve cadastrar fornecedor com CNPJ duplicado', async () => {
  const res = await requestJson({
    method: 'POST',
    endpoint: '/api/fornecedores',
    body: {
      nomeEmpresa: 'Fornecedor XPTO Duplicado',
      cnpj: '12345678000190',
      endereco: 'Rua B, 100',
      telefone: '(11) 98888-0000',
      email: 'duplicado@xpto.com',
      contatoPrincipal: 'João Silva',
    },
  });

  assert.equal(res.status, 409);
  assert.equal(res.body.message, 'Fornecedor com esse CNPJ já está cadastrado!');
});

test('deve atualizar fornecedor com sucesso', async () => {
  const res = await requestJson({
    method: 'PUT',
    endpoint: '/api/fornecedores/1',
    body: {
      nomeEmpresa: 'Fornecedor XPTO Atualizado',
      cnpj: '12345678000190',
      endereco: 'Rua A, 1000',
      telefone: '(11) 95555-0000',
      email: 'novo@xpto.com',
      contatoPrincipal: 'Maria Souza',
    },
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.message, 'Fornecedor atualizado com sucesso!');
  assert.equal(res.body.data.nome_empresa, 'Fornecedor XPTO Atualizado');
});

test('deve cadastrar produto com sucesso', async () => {
  const res = await requestJson({
    method: 'POST',
    endpoint: '/api/produtos',
    body: {
      nome: 'Arroz 1kg',
      codigoBarras: '7890001112223',
      descricao: 'Arroz tipo 1',
      quantidadeEstoque: 25,
      categoria: 'Alimentos',
    },
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.message, 'Produto cadastrado com sucesso!');
});

test('deve atualizar produto com sucesso', async () => {
  const res = await requestJson({
    method: 'PUT',
    endpoint: '/api/produtos/1',
    body: {
      nome: 'Arroz 5kg',
      codigoBarras: '7890001112223',
      descricao: 'Arroz tipo 1 premium',
      quantidadeEstoque: 40,
      categoria: 'Alimentos',
      dataValidade: '2027-12-31',
    },
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.message, 'Produto atualizado com sucesso!');
  assert.equal(res.body.data.nome, 'Arroz 5kg');
});

test('deve associar e consultar associação nos dois sentidos', async () => {
  const associar = await requestJson({
    method: 'POST',
    endpoint: '/api/associacoes/produtos/1/fornecedores/1',
  });

  assert.equal(associar.status, 201);

  const fornecedoresDoProduto = await requestJson({
    method: 'GET',
    endpoint: '/api/associacoes/produtos/1/fornecedores',
  });

  assert.equal(fornecedoresDoProduto.status, 200);
  assert.equal(fornecedoresDoProduto.body.data.length, 1);

  const produtosDoFornecedor = await requestJson({
    method: 'GET',
    endpoint: '/api/associacoes/fornecedores/1/produtos',
  });

  assert.equal(produtosDoFornecedor.status, 200);
  assert.equal(produtosDoFornecedor.body.data.length, 1);
  assert.equal(produtosDoFornecedor.body.data[0].nome, 'Arroz 5kg');

  const desassociar = await requestJson({
    method: 'DELETE',
    endpoint: '/api/associacoes/produtos/1/fornecedores/1',
  });

  assert.equal(desassociar.status, 200);
  assert.equal(desassociar.body.message, 'Fornecedor desassociado com sucesso!');
});

test('deve remover produto e fornecedor com sucesso', async () => {
  const deleteProduto = await requestJson({
    method: 'DELETE',
    endpoint: '/api/produtos/1',
  });

  assert.equal(deleteProduto.status, 200);
  assert.equal(deleteProduto.body.message, 'Produto removido com sucesso!');

  const deleteFornecedor = await requestJson({
    method: 'DELETE',
    endpoint: '/api/fornecedores/1',
  });

  assert.equal(deleteFornecedor.status, 200);
  assert.equal(deleteFornecedor.body.message, 'Fornecedor removido com sucesso!');
});
