const express = require('express');
const { getDb } = require('../database');
const { validateProduto } = require('../validation');

const router = express.Router();

function normalizePayload(payload) {
  return {
    ...payload,
    quantidadeEstoque: Number(payload.quantidadeEstoque),
  };
}

router.post('/', async (req, res) => {
  const payload = req.body;
  const normalizedPayload = normalizePayload(payload);

  const errors = validateProduto(normalizedPayload);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: 'Dados inválidos.',
      errors,
    });
  }

  const db = await getDb();
  const existing = await db.get('SELECT id FROM produtos WHERE codigo_barras = ?', payload.codigoBarras.trim());

  if (existing) {
    return res.status(409).json({
      message: 'Produto com este código de barras já está cadastrado!',
    });
  }

  const result = await db.run(
    `INSERT INTO produtos (nome, codigo_barras, descricao, quantidade_estoque, categoria, data_validade, imagem_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    payload.nome.trim(),
    payload.codigoBarras.trim(),
    payload.descricao.trim(),
    normalizedPayload.quantidadeEstoque,
    payload.categoria.trim(),
    payload.dataValidade || null,
    payload.imagemUrl || null
  );

  const created = await db.get('SELECT * FROM produtos WHERE id = ?', result.lastID);

  return res.status(201).json({
    message: 'Produto cadastrado com sucesso!',
    data: created,
  });
});

router.get('/', async (_req, res) => {
  const db = await getDb();
  const produtos = await db.all('SELECT * FROM produtos ORDER BY id DESC');

  return res.json({ data: produtos });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'ID do produto inválido.' });
  }

  const db = await getDb();
  const produto = await db.get('SELECT * FROM produtos WHERE id = ?', id);

  if (!produto) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  return res.json({ data: produto });
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const payload = req.body;
  const normalizedPayload = normalizePayload(payload);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'ID do produto inválido.' });
  }

  const errors = validateProduto(normalizedPayload);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const db = await getDb();
  const current = await db.get('SELECT id FROM produtos WHERE id = ?', id);

  if (!current) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  const duplicate = await db.get(
    'SELECT id FROM produtos WHERE codigo_barras = ? AND id <> ?',
    payload.codigoBarras.trim(),
    id
  );

  if (duplicate) {
    return res.status(409).json({ message: 'Produto com este código de barras já está cadastrado!' });
  }

  await db.run(
    `UPDATE produtos
       SET nome = ?,
           codigo_barras = ?,
           descricao = ?,
           quantidade_estoque = ?,
           categoria = ?,
           data_validade = ?,
           imagem_url = ?
     WHERE id = ?`,
    payload.nome.trim(),
    payload.codigoBarras.trim(),
    payload.descricao.trim(),
    normalizedPayload.quantidadeEstoque,
    payload.categoria.trim(),
    payload.dataValidade || null,
    payload.imagemUrl || null,
    id
  );

  const updated = await db.get('SELECT * FROM produtos WHERE id = ?', id);

  return res.json({ message: 'Produto atualizado com sucesso!', data: updated });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'ID do produto inválido.' });
  }

  const db = await getDb();
  const result = await db.run('DELETE FROM produtos WHERE id = ?', id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  return res.json({ message: 'Produto removido com sucesso!' });
});

module.exports = router;
