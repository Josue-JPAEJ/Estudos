import { useEffect, useState } from 'react';
import { api } from '../api';

export default function AssociacaoPage() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [associados, setAssociados] = useState([]);
  const [feedback, setFeedback] = useState('');

  async function carregarDadosBase() {
    const [produtosResp, fornecedoresResp] = await Promise.all([
      api.listProdutos(),
      api.listFornecedores(),
    ]);

    setProdutos(produtosResp.data);
    setFornecedores(fornecedoresResp.data);
  }

  async function carregarAssociados(produtoId) {
    if (!produtoId) {
      setAssociados([]);
      return;
    }

    const response = await api.listarFornecedoresDoProduto(produtoId);
    setAssociados(response.data);
  }

  useEffect(() => {
    carregarDadosBase().catch((error) => setFeedback(error.message));
  }, []);

  useEffect(() => {
    carregarAssociados(produtoSelecionado).catch((error) => setFeedback(error.message));
  }, [produtoSelecionado]);

  async function associar() {
    try {
      await api.associarFornecedor(produtoSelecionado, fornecedorSelecionado);
      setFeedback('Fornecedor associado com sucesso ao produto!');
      await carregarAssociados(produtoSelecionado);
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function desassociar(fornecedorId) {
    try {
      await api.desassociarFornecedor(produtoSelecionado, fornecedorId);
      setFeedback('Fornecedor desassociado com sucesso!');
      await carregarAssociados(produtoSelecionado);
    } catch (error) {
      setFeedback(error.message);
    }
  }

  return (
    <section>
      <h2>Associação de Fornecedor a Produto</h2>
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

      <table>
        <thead>
          <tr>
            <th>Fornecedor</th>
            <th>CNPJ</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {associados.map((fornecedor) => (
            <tr key={fornecedor.id}>
              <td>{fornecedor.nome_empresa}</td>
              <td>{fornecedor.cnpj}</td>
              <td>
                <button onClick={() => desassociar(fornecedor.id)}>Desassociar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
