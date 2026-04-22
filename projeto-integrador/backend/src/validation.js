function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateFornecedor(payload) {
  const errors = {};

  if (!isNonEmptyString(payload.nomeEmpresa)) errors.nomeEmpresa = 'Nome da empresa é obrigatório.';
  if (!isNonEmptyString(payload.cnpj)) errors.cnpj = 'CNPJ é obrigatório.';
  if (!isNonEmptyString(payload.endereco)) errors.endereco = 'Endereço é obrigatório.';
  if (!isNonEmptyString(payload.telefone)) errors.telefone = 'Telefone é obrigatório.';
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
};
