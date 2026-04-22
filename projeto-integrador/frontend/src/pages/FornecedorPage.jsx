import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { formatCnpj, formatTelefone } from '../utils/masks';

const initialForm = {
  nomeEmpresa: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
  contatoPrincipal: '',
};

export default function FornecedorPage() {
  const [form, setForm] = useState(initialForm);
  const [fornecedores, setFornecedores] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  async function carregarFornecedores() {
    const response = await api.listFornecedores();
    setFornecedores(response.data);
  }

  useEffect(() => {
    carregarFornecedores().catch((error) => setFeedback(error.message));
  }, []);

  function preencherEdicao(fornecedor) {
    setEditingId(fornecedor.id);
    setForm({
      nomeEmpresa: fornecedor.nome_empresa,
      cnpj: formatCnpj(fornecedor.cnpj),
      endereco: fornecedor.endereco,
      telefone: formatTelefone(fornecedor.telefone),
      email: fornecedor.email,
      contatoPrincipal: fornecedor.contato_principal,
    });
  }

  async function salvar(event) {
    event.preventDefault();

    try {
      if (editingId) {
        await api.updateFornecedor(editingId, form);
        setFeedback('Fornecedor atualizado com sucesso!');
      } else {
        await api.createFornecedor(form);
        setFeedback('Fornecedor cadastrado com sucesso!');
      }

      setForm(initialForm);
      setEditingId(null);
      await carregarFornecedores();
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function remover(id) {
    try {
      await api.deleteFornecedor(id);
      setFeedback('Fornecedor removido com sucesso!');
      await carregarFornecedores();
    } catch (error) {
      setFeedback(error.message);
    }
  }

  return (
    <section>
      <h2>Cadastro de Fornecedor</h2>
      {feedback && <p className="feedback">{feedback}</p>}

      <form className="grid-form" onSubmit={salvar}>
        <input placeholder="Insira o nome da empresa" value={form.nomeEmpresa} onChange={(e) => setForm({ ...form, nomeEmpresa: e.target.value })} required />
        <input placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: formatCnpj(e.target.value) })} required />
        <input placeholder="Insira o endereço completo da empresa" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} required />
        <input placeholder="(00) 0000-0000" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: formatTelefone(e.target.value) })} required />
        <input placeholder="exemplo@fornecedor.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Nome do contato principal" value={form.contatoPrincipal} onChange={(e) => setForm({ ...form, contatoPrincipal: e.target.value })} required />

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
            <th>Empresa</th>
            <th>CNPJ</th>
            <th>Contato</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map((fornecedor) => (
            <tr key={fornecedor.id}>
              <td>{fornecedor.nome_empresa}</td>
              <td>{formatCnpj(fornecedor.cnpj)}</td>
              <td>{fornecedor.contato_principal}</td>
              <td>
                <button onClick={() => preencherEdicao(fornecedor)}>Editar</button>
                <button onClick={() => remover(fornecedor.id)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
