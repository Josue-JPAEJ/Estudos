const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(body?.message || 'Erro na requisição.');
  }

  return body;
}

export const api = {
  listFornecedores: () => request('/api/fornecedores'),
  createFornecedor: (payload) => request('/api/fornecedores', { method: 'POST', body: JSON.stringify(payload) }),
  updateFornecedor: (id, payload) => request(`/api/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteFornecedor: (id) => request(`/api/fornecedores/${id}`, { method: 'DELETE' }),

  listProdutos: () => request('/api/produtos'),
  createProduto: (payload) => request('/api/produtos', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduto: (id, payload) => request(`/api/produtos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduto: (id) => request(`/api/produtos/${id}`, { method: 'DELETE' }),

  associarFornecedor: (produtoId, fornecedorId) =>
    request(`/api/associacoes/produtos/${produtoId}/fornecedores/${fornecedorId}`, { method: 'POST' }),
  desassociarFornecedor: (produtoId, fornecedorId) =>
    request(`/api/associacoes/produtos/${produtoId}/fornecedores/${fornecedorId}`, { method: 'DELETE' }),
  listarFornecedoresDoProduto: (produtoId) => request(`/api/associacoes/produtos/${produtoId}/fornecedores`),
  listarProdutosDoFornecedor: (fornecedorId) => request(`/api/associacoes/fornecedores/${fornecedorId}/produtos`),
};
