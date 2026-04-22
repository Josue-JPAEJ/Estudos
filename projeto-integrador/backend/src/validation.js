function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatCnpj(value) {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

function formatTelefone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;

  const ddd = digits.slice(0, 2);

  if (digits.length <= 6) {
    return `(${ddd}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${ddd}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${ddd}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateFornecedor(payload) {
  const errors = {};

  if (!isNonEmptyString(payload.nomeEmpresa)) errors.nomeEmpresa = 'Nome da empresa é obrigatório.';

  const cnpjDigits = onlyDigits(payload.cnpj);
  if (cnpjDigits.length !== 14) {
    errors.cnpj = 'CNPJ deve conter 14 dígitos.';
  }

  if (!isNonEmptyString(payload.endereco)) errors.endereco = 'Endereço é obrigatório.';

  const telefoneDigits = onlyDigits(payload.telefone);
  if (!(telefoneDigits.length === 10 || telefoneDigits.length === 11)) {
    errors.telefone = 'Telefone deve conter 10 ou 11 dígitos (com DDD).';
  }

  if (!isNonEmptyString(payload.email)) errors.email = 'E-mail é obrigatório.';
  if (!isNonEmptyString(payload.contatoPrincipal)) errors.contatoPrincipal = 'Contato principal é obrigatório.';

  return errors;
}

function validateProduto(payload) {
  const errors = {};

  if (!isNonEmptyString(payload.nome)) errors.nome = 'Nome do produto é obrigatório.';
  if (!isNonEmptyString(payload.codigoBarras)) errors.codigoBarras = 'Código de barras é obrigatório.';
  if (!isNonEmptyString(payload.descricao)) errors.descricao = 'Descrição é obrigatória.';
  if (!Number.isInteger(payload.quantidadeEstoque) || payload.quantidadeEstoque < 0) {
    errors.quantidadeEstoque = 'Quantidade em estoque deve ser um inteiro maior ou igual a zero.';
  }
  if (!isNonEmptyString(payload.categoria)) errors.categoria = 'Categoria é obrigatória.';

  return errors;
}

module.exports = {
  validateFornecedor,
  validateProduto,
  formatCnpj,
  formatTelefone,
  onlyDigits,
};
