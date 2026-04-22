const express = require('express');
const { getDb } = require('../database');
const { validateFornecedor } = require('../validation');

const router = express.Router();

router.post('/', async (req, res) => {
  const payload = req.body;
  const errors = validateFornecedor(payload);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: 'Dados inválidos.',
      errors,
    });
  }

  const db = await getDb();
  const existing = await db.get('SELECT id FROM fornecedores WHERE cnpj = ?', payload.cnpj.trim());

  if (existing) {
    return res.status(409).json({
      message: 'Fornecedor com esse CNPJ já está cadastrado!',
    });
  }

  const result = await db.run(
    `INSERT INTO fornecedores (nome_empresa, cnpj, endereco, telefone, email, contato_principal)
     VALUES (?, ?, ?, ?, ?, ?)`,
    payload.nomeEmpresa.trim(),
    payload.cnpj.trim(),
    payload.endereco.trim(),
    payload.telefone.trim(),
    payload.email.trim(),
    payload.contatoPrincipal.trim()
  );

  const created = await db.get('SELECT * FROM fornecedores WHERE id = ?', result.lastID);

  return res.status(201).json({
    message: 'Fornecedor cadastrado com sucesso!',
    data: created,
  });
});

router.get('/', async (_req, res) => {
  const db = await getDb();
  const fornecedores = await db.all('SELECT * FROM fornecedores ORDER BY id DESC');

  return res.json({ data: fornecedores });
});

module.exports = router;
