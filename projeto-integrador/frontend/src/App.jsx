import React, { useState } from 'react';
import { Boxes, Building2, Link2 } from './components/Icons';
import FornecedorPage from './pages/FornecedorPage';
import ProdutoPage from './pages/ProdutoPage';
import AssociacaoPage from './pages/AssociacaoPage';

const tabs = [
  { id: 'fornecedores', label: 'Fornecedores', description: 'Gestão de parceiros', icon: Building2 },
  { id: 'produtos', label: 'Produtos', description: 'Catálogo e estoque', icon: Boxes },
  { id: 'associacoes', label: 'Associações', description: 'Vínculos N:N', icon: Link2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('fornecedores');
  const activeConfig = tabs.find((tab) => tab.id === activeTab);
  const ActiveIcon = activeConfig?.icon || Building2;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">PI</div>
          <div>
            <p className="brand-overline">Projeto Integrador</p>
            <h1>Controle de Estoque</h1>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'nav-item active' : 'nav-item'}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon />
                <span>
                  <strong>{tab.label}</strong>
                  <small>{tab.description}</small>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div className="topbar-title">
            <ActiveIcon />
            <div>
              <h2>{activeConfig?.label}</h2>
              <p>Interface otimizada para operações rápidas, com foco em legibilidade e performance.</p>
            </div>
          </div>
          <span className="status-chip">API Online</span>
        </header>

        <main className="page-content">
          {activeTab === 'fornecedores' && <FornecedorPage />}
          {activeTab === 'produtos' && <ProdutoPage />}
          {activeTab === 'associacoes' && <AssociacaoPage />}
        </main>
      </div>
    </div>
  );
}
