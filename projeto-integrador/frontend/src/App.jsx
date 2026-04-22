import { useState } from 'react';
import FornecedorPage from './pages/FornecedorPage';
import ProdutoPage from './pages/ProdutoPage';
import AssociacaoPage from './pages/AssociacaoPage';

const tabs = [
  { id: 'fornecedores', label: 'Fornecedores' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'associacoes', label: 'Associações' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('fornecedores');

  return (
    <div className="container">
      <header>
        <h1>Projeto Integrador - Controle de Estoque</h1>
        <p>Fase 3: Frontend consumindo API do backend.</p>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'fornecedores' && <FornecedorPage />}
        {activeTab === 'produtos' && <ProdutoPage />}
        {activeTab === 'associacoes' && <AssociacaoPage />}
      </main>
    </div>
  );
}
