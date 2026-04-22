import React, { useEffect, useState } from 'react';
import { api } from '../api';
import ActionIconButton from '../components/ActionIconButton';
import { Unlink } from '../components/Icons';

export default function AssociacaoPage() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [fornecedoresDoProduto, setFornecedoresDoProduto] = useState([]);
  const [produtosDoFornecedor, setProdutosDoFornecedor] = useState([]);
  const [feedback, setFeedback] = useState('');

  async function carregarDadosBase() {
    const [produtosResp, fornecedoresResp] = await Promise.all([
      api.listProdutos(),
      api.listFornecedores(),
    ]);

    setProdutos(produtosResp.data);
    setFornecedores(fornecedoresResp.data);
  }

  async function carregarFornecedoresDoProduto(produtoId) {
    if (!produtoId) {
      setFornecedoresDoProduto([]);
      return;
    }

    const response = await api.listarFornecedoresDoProduto(produtoId);
    setFornecedoresDoProduto(response.data);
  }

  async function carregarProdutosDoFornecedor(fornecedorId) {
    if (!fornecedorId) {
      setProdutosDoFornecedor([]);
      return;
    }

    const response = await api.listarProdutosDoFornecedor(fornecedorId);
    setProdutosDoFornecedor(response.data);
  }

  useEffect(() => {
    carregarDadosBase().catch((error) => setFeedback(error.message));
  }, []);

  useEffect(() => {
    carregarFornecedoresDoProduto(produtoSelecionado).catch((error) => setFeedback(error.message));
  }, [produtoSelecionado]);

  useEffect(() => {
    carregarProdutosDoFornecedor(fornecedorSelecionado).catch((error) => setFeedback(error.message));
  }, [fornecedorSelecionado]);

  async function associar() {
    try {
      await api.associarFornecedor(produtoSelecionado, fornecedorSelecionado);
      setFeedback('Fornecedor associado com sucesso ao produto!');
      await Promise.all([
        carregarFornecedoresDoProduto(produtoSelecionado),
        carregarProdutosDoFornecedor(fornecedorSelecionado),
      ]);
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function desassociarPorProduto(fornecedorId) {
    try {
      await api.desassociarFornecedor(produtoSelecionado, fornecedorId);
      setFeedback('Fornecedor desassociado com sucesso!');
      await Promise.all([
        carregarFornecedoresDoProduto(produtoSelecionado),
        fornecedorSelecionado ? carregarProdutosDoFornecedor(fornecedorSelecionado) : Promise.resolve(),
      ]);
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function desassociarPorFornecedor(produtoId) {
    try {
      await api.desassociarFornecedor(produtoId, fornecedorSelecionado);
      setFeedback('Produto desassociado com sucesso do fornecedor!');
      await Promise.all([
        carregarProdutosDoFornecedor(fornecedorSelecionado),
        produtoSelecionado ? carregarFornecedoresDoProduto(produtoSelecionado) : Promise.resolve(),
      ]);
    } catch (error) {
      setFeedback(error.message);
    }
  }

  return (
    <section className="surface-card">
      <div className="section-header">
        <h3>Associação de Fornecedor a Produto</h3>
        <p>Crie vínculos muitos-para-muitos sem perder visibilidade operacional.</p>
      </div>
      {feedback && <p className="feedback">{feedback}</p>}

      <div className="grid-form">
        <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)}>
          <option value="">Selecione um produto</option>
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.nome} ({produto.codigo_barras})
            </option>
          ))}
        </select>

        <select value={fornecedorSelecionado} onChange={(e) => setFornecedorSelecionado(e.target.value)}>
          <option value="">Selecione um fornecedor</option>
          {fornecedores.map((fornecedor) => (
            <option key={fornecedor.id} value={fornecedor.id}>
              {fornecedor.nome_empresa} ({fornecedor.cnpj})
            </option>
          ))}
        </select>

        <div className="actions">
          <button type="button" disabled={!produtoSelecionado || !fornecedorSelecionado} onClick={associar}>
            Associar Fornecedor
          </button>
        </div>
      </div>

      {produtoSelecionado && (
        <>
          <h3>Fornecedores do Produto</h3>
          <table>
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>CNPJ</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fornecedoresDoProduto.map((fornecedor) => (
                <tr key={fornecedor.id}>
                  <td>{fornecedor.nome_empresa}</td>
                  <td>{fornecedor.cnpj}</td>
                  <td>
                    <div className="table-actions">
                      <ActionIconButton
                        label="Desassociar fornecedor"
                        icon={Unlink}
                        variant="danger"
                        onClick={() => desassociarPorProduto(fornecedor.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {fornecedorSelecionado && (
        <>
          <h3>Produtos do Fornecedor</h3>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Código de Barras</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosDoFornecedor.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.nome}</td>
                  <td>{produto.codigo_barras}</td>
                  <td>
                    <div className="table-actions">
                      <ActionIconButton
                        label="Desassociar produto"
                        icon={Unlink}
                        variant="danger"
                        onClick={() => desassociarPorFornecedor(produto.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
