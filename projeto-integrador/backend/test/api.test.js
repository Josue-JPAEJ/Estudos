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

async function requestJson({ method, endpoint, body }) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const parsedBody = text ? JSON.parse(text) : null;

  return {
    status: response.status,
    body: parsedBody,
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

test('deve cadastrar fornecedor com sucesso', async () => {
  const res = await requestJson({
    method: 'POST',
    endpoint: '/api/fornecedores',
    body: {
      nomeEmpresa: 'Fornecedor XPTO',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua A, 100',
      telefone: '(11) 99999-0000',
      email: 'contato@xpto.com',
      contatoPrincipal: 'Maria Silva',
    },
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.message, 'Fornecedor cadastrado com sucesso!');
});

test('não deve cadastrar fornecedor com CNPJ duplicado', async () => {
  const res = await requestJson({
    method: 'POST',
    endpoint: '/api/fornecedores',
    body: {
      nomeEmpresa: 'Fornecedor XPTO Duplicado',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua B, 100',
      telefone: '(11) 98888-0000',
      email: 'duplicado@xpto.com',
      contatoPrincipal: 'João Silva',
    },
  });

  assert.equal(res.status, 409);
  assert.equal(res.body.message, 'Fornecedor com esse CNPJ já está cadastrado!');
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

test('deve associar e desassociar fornecedor de produto', async () => {
  const associar = await requestJson({
    method: 'POST',
    endpoint: '/api/associacoes/produtos/1/fornecedores/1',
  });

  assert.equal(associar.status, 201);
  assert.equal(associar.body.message, 'Fornecedor associado com sucesso ao produto!');

  const listar = await requestJson({
    method: 'GET',
    endpoint: '/api/associacoes/produtos/1/fornecedores',
  });

  assert.equal(listar.status, 200);
  assert.equal(listar.body.data.length, 1);

  const desassociar = await requestJson({
    method: 'DELETE',
    endpoint: '/api/associacoes/produtos/1/fornecedores/1',
  });

  assert.equal(desassociar.status, 200);
  assert.equal(desassociar.body.message, 'Fornecedor desassociado com sucesso!');
});
