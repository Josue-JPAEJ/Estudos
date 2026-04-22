const express = require('express');
const { getDb } = require('../database');

const router = express.Router();

router.post('/produtos/:produtoId/fornecedores/:fornecedorId', async (req, res) => {
  const produtoId = Number(req.params.produtoId);
  const fornecedorId = Number(req.params.fornecedorId);

  if (!Number.isInteger(produtoId) || !Number.isInteger(fornecedorId)) {
    return res.status(400).json({ message: 'IDs inválidos.' });
  }

  const db = await getDb();

  const produto = await db.get('SELECT id FROM produtos WHERE id = ?', produtoId);
  const fornecedor = await db.get('SELECT id FROM fornecedores WHERE id = ?', fornecedorId);

  if (!produto || !fornecedor) {
    return res.status(404).json({ message: 'Produto ou fornecedor não encontrado.' });
  }

  const existing = await db.get(
    'SELECT produto_id FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?',
    produtoId,
    fornecedorId
  );

  if (existing) {
    return res.status(409).json({
      message: 'Fornecedor já está associado a este produto!',
    });
  }

  await db.run(
    'INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)',
    produtoId,
    fornecedorId
  );

  return res.status(201).json({
    message: 'Fornecedor associado com sucesso ao produto!',
  });
});

router.delete('/produtos/:produtoId/fornecedores/:fornecedorId', async (req, res) => {
  const produtoId = Number(req.params.produtoId);
  const fornecedorId = Number(req.params.fornecedorId);

  if (!Number.isInteger(produtoId) || !Number.isInteger(fornecedorId)) {
    return res.status(400).json({ message: 'IDs inválidos.' });
  }

  const db = await getDb();

  const result = await db.run(
    'DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?',
    produtoId,
    fornecedorId
  );

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Associação não encontrada.' });
  }

  return res.json({ message: 'Fornecedor desassociado com sucesso!' });
});

router.get('/produtos/:produtoId/fornecedores', async (req, res) => {
  const produtoId = Number(req.params.produtoId);

  if (!Number.isInteger(produtoId)) {
    return res.status(400).json({ message: 'ID do produto inválido.' });
  }

  const db = await getDb();

  const fornecedores = await db.all(
    `SELECT f.id, f.nome_empresa, f.cnpj, f.email, f.telefone
     FROM fornecedores f
     INNER JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
     WHERE pf.produto_id = ?
     ORDER BY f.nome_empresa`,
    produtoId
  );

  return res.json({ data: fornecedores });
});

module.exports = router;
