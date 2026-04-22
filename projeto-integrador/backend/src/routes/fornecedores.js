const express = require('express');
const { getDb } = require('../database');
const { validateFornecedor, formatCnpj, formatTelefone, onlyDigits } = require('../validation');

const router = express.Router();

async function buscarDuplicidadeCnpj(db, cnpj, ignoreId = null) {
  const fornecedores = await db.all('SELECT id, cnpj FROM fornecedores');
  const cnpjDigits = onlyDigits(cnpj);

  return fornecedores.find((fornecedor) => {
    if (ignoreId && fornecedor.id === ignoreId) return false;
    return onlyDigits(fornecedor.cnpj) === cnpjDigits;
  });
}

function normalizarFornecedor(payload) {
  return {
    nomeEmpresa: payload.nomeEmpresa.trim(),
    cnpj: formatCnpj(payload.cnpj),
    endereco: payload.endereco.trim(),
    telefone: formatTelefone(payload.telefone),
    email: payload.email.trim(),
    contatoPrincipal: payload.contatoPrincipal.trim(),
  };
}

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
  const normalized = normalizarFornecedor(payload);

  const existing = await buscarDuplicidadeCnpj(db, normalized.cnpj);

  if (existing) {
    return res.status(409).json({
      message: 'Fornecedor com esse CNPJ já está cadastrado!',
    });
  }

  const result = await db.run(
    `INSERT INTO fornecedores (nome_empresa, cnpj, endereco, telefone, email, contato_principal)
     VALUES (?, ?, ?, ?, ?, ?)`,
    normalized.nomeEmpresa,
    normalized.cnpj,
    normalized.endereco,
    normalized.telefone,
    normalized.email,
    normalized.contatoPrincipal
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
  const current = await db.get('SELECT id FROM fornecedores WHERE id = ?', id);

  if (!current) {
    return res.status(404).json({ message: 'Fornecedor não encontrado.' });
  }

  const normalized = normalizarFornecedor(payload);
  const duplicate = await buscarDuplicidadeCnpj(db, normalized.cnpj, id);

  if (duplicate) {
    return res.status(409).json({ message: 'Fornecedor com esse CNPJ já está cadastrado!' });
  }

  await db.run(
    `UPDATE fornecedores
       SET nome_empresa = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, contato_principal = ?
     WHERE id = ?`,
    normalized.nomeEmpresa,
    normalized.cnpj,
    normalized.endereco,
    normalized.telefone,
    normalized.email,
    normalized.contatoPrincipal,
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
