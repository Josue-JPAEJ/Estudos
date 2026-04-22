const path = require('path');
const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const tempDbFile = path.join(__dirname, 'test.sqlite');
process.env.DB_FILE = tempDbFile;

const { createApp } = require('../app');
const { initDatabase, getDb } = require('../src/database');

let app;

test.before(async () => {
  if (fs.existsSync(tempDbFile)) fs.unlinkSync(tempDbFile);
  await initDatabase();
  app = createApp();
});

test.after(async () => {
  const db = await getDb();
  await db.close();
  if (fs.existsSync(tempDbFile)) fs.unlinkSync(tempDbFile);
});

test('deve cadastrar fornecedor com sucesso', async () => {
  const res = await request(app).post('/api/fornecedores').send({
    nomeEmpresa: 'Fornecedor XPTO',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua A, 100',
    telefone: '(11) 99999-0000',
    email: 'contato@xpto.com',
    contatoPrincipal: 'Maria Silva',
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.message, 'Fornecedor cadastrado com sucesso!');
});

test('não deve cadastrar fornecedor com CNPJ duplicado', async () => {
  const res = await request(app).post('/api/fornecedores').send({
    nomeEmpresa: 'Fornecedor XPTO Duplicado',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua B, 100',
    telefone: '(11) 98888-0000',
    email: 'duplicado@xpto.com',
    contatoPrincipal: 'João Silva',
  });

  assert.equal(res.status, 409);
  assert.equal(res.body.message, 'Fornecedor com esse CNPJ já está cadastrado!');
});

test('deve cadastrar produto com sucesso', async () => {
  const res = await request(app).post('/api/produtos').send({
    nome: 'Arroz 1kg',
    codigoBarras: '7890001112223',
    descricao: 'Arroz tipo 1',
    quantidadeEstoque: 25,
    categoria: 'Alimentos',
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.message, 'Produto cadastrado com sucesso!');
});

test('deve associar e desassociar fornecedor de produto', async () => {
  const associar = await request(app).post('/api/associacoes/produtos/1/fornecedores/1').send();
  assert.equal(associar.status, 201);
  assert.equal(associar.body.message, 'Fornecedor associado com sucesso ao produto!');

  const listar = await request(app).get('/api/associacoes/produtos/1/fornecedores');
  assert.equal(listar.status, 200);
  assert.equal(listar.body.data.length, 1);

  const desassociar = await request(app).delete('/api/associacoes/produtos/1/fornecedores/1');
  assert.equal(desassociar.status, 200);
  assert.equal(desassociar.body.message, 'Fornecedor desassociado com sucesso!');
});
