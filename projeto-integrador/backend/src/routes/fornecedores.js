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

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'ID do fornecedor inválido.' });
  }

  const db = await getDb();
  const fornecedor = await db.get('SELECT * FROM fornecedores WHERE id = ?', id);

  if (!fornecedor) {
    return res.status(404).json({ message: 'Fornecedor não encontrado.' });
  }

  return res.json({ data: fornecedor });
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const payload = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'ID do fornecedor inválido.' });
  }

  const errors = validateFornecedor(payload);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const db = await getDb();
  const current = await db.get('SELECT id, cnpj FROM fornecedores WHERE id = ?', id);

  if (!current) {
    return res.status(404).json({ message: 'Fornecedor não encontrado.' });
  }

  const duplicate = await db.get(
    'SELECT id FROM fornecedores WHERE cnpj = ? AND id <> ?',
    payload.cnpj.trim(),
    id
  );

  if (duplicate) {
    return res.status(409).json({ message: 'Fornecedor com esse CNPJ já está cadastrado!' });
  }

  await db.run(
    `UPDATE fornecedores
       SET nome_empresa = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, contato_principal = ?
     WHERE id = ?`,
    payload.nomeEmpresa.trim(),
    payload.cnpj.trim(),
    payload.endereco.trim(),
    payload.telefone.trim(),
    payload.email.trim(),
    payload.contatoPrincipal.trim(),
    id
  );

  const updated = await db.get('SELECT * FROM fornecedores WHERE id = ?', id);

  return res.json({ message: 'Fornecedor atualizado com sucesso!', data: updated });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'ID do fornecedor inválido.' });
  }

  const db = await getDb();
  const result = await db.run('DELETE FROM fornecedores WHERE id = ?', id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Fornecedor não encontrado.' });
  }

  return res.json({ message: 'Fornecedor removido com sucesso!' });
});

module.exports = router;
