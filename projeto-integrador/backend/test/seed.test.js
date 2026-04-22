const path = require('path');
const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const tempDbFile = path.join(__dirname, 'seed-test.sqlite');
process.env.DB_FILE = tempDbFile;

const { getDb } = require('../src/database');
const { seedDatabase } = require('../src/seed');

let db;

test.before(async () => {
  if (fs.existsSync(tempDbFile)) fs.unlinkSync(tempDbFile);
  await seedDatabase();
  db = await getDb();
});

test.after(async () => {
  await db.close();
  if (fs.existsSync(tempDbFile)) fs.unlinkSync(tempDbFile);
});

test('seed deve criar 5 fornecedores, 15 produtos e 15 associações', async () => {
  const fornecedores = await db.get('SELECT COUNT(*) AS total FROM fornecedores');
  const produtos = await db.get('SELECT COUNT(*) AS total FROM produtos');
  const associacoes = await db.get('SELECT COUNT(*) AS total FROM produto_fornecedor');

  assert.equal(fornecedores.total, 5);
  assert.equal(produtos.total, 15);
  assert.equal(associacoes.total, 15);
});

test('cada fornecedor deve ter exatamente 3 produtos associados', async () => {
  const rows = await db.all(
    `SELECT fornecedor_id, COUNT(*) AS total
     FROM produto_fornecedor
     GROUP BY fornecedor_id
     ORDER BY fornecedor_id`
  );

  assert.equal(rows.length, 5);

  for (const row of rows) {
    assert.equal(row.total, 3);
  }
});
