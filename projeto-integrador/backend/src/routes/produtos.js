const express = require('express');
const { getDb } = require('../database');
const { validateProduto } = require('../validation');

const router = express.Router();

router.post('/', async (req, res) => {
  const payload = req.body;
  const normalizedPayload = {
    ...payload,
    quantidadeEstoque: Number(payload.quantidadeEstoque),
  };

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

module.exports = router;
