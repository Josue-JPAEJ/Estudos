import React, { useEffect, useState } from 'react';
import { api } from '../api';

const initialForm = {
  nome: '',
  codigoBarras: '',
  descricao: '',
  quantidadeEstoque: 0,
  categoria: '',
  dataValidade: '',
};

export default function ProdutoPage() {
  const [form, setForm] = useState(initialForm);
  const [produtos, setProdutos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  async function carregarProdutos() {
    const response = await api.listProdutos();
    setProdutos(response.data);
  }

  useEffect(() => {
    carregarProdutos().catch((error) => setFeedback(error.message));
  }, []);

  function preencherEdicao(produto) {
    setEditingId(produto.id);
    setForm({
      nome: produto.nome,
      codigoBarras: produto.codigo_barras,
      descricao: produto.descricao,
      quantidadeEstoque: produto.quantidade_estoque,
      categoria: produto.categoria,
      dataValidade: produto.data_validade || '',
    });
  }

  async function salvar(event) {
    event.preventDefault();

    try {
      if (editingId) {
        await api.updateProduto(editingId, form);
        setFeedback('Produto atualizado com sucesso!');
      } else {
        await api.createProduto(form);
        setFeedback('Produto cadastrado com sucesso!');
      }

      setForm(initialForm);
      setEditingId(null);
      await carregarProdutos();
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function remover(id) {
    try {
      await api.deleteProduto(id);
      setFeedback('Produto removido com sucesso!');
      await carregarProdutos();
    } catch (error) {
      setFeedback(error.message);
    }
  }

  return (
    <section>
      <h2>Cadastro de Produto</h2>
      {feedback && <p className="feedback">{feedback}</p>}

      <form className="grid-form" onSubmit={salvar}>
        <input placeholder="Insira o nome do produto" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        <input placeholder="Insira o código de barras" value={form.codigoBarras} onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })} required />
        <textarea placeholder="Descreva brevemente o produto" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
        <input type="number" placeholder="Quantidade disponível" value={form.quantidadeEstoque} onChange={(e) => setForm({ ...form, quantidadeEstoque: Number(e.target.value) })} required />
        <input placeholder="Categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required />
        <input type="date" value={form.dataValidade} onChange={(e) => setForm({ ...form, dataValidade: e.target.value })} />

        <div className="actions">
          <button type="submit">{editingId ? 'Salvar Alterações' : 'Cadastrar'}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Código</th>
            <th>Categoria</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.nome}</td>
              <td>{produto.codigo_barras}</td>
              <td>{produto.categoria}</td>
              <td>{produto.quantidade_estoque}</td>
              <td>
                <button onClick={() => preencherEdicao(produto)}>Editar</button>
                <button onClick={() => remover(produto.id)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
