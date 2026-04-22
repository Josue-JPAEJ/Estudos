# Frontend - Projeto Integrador

Frontend da Fase 3 em React + Vite, consumindo o backend da Fase 2.

## Requisitos
- Node.js LTS (>= 20)

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

Aplicação em `http://localhost:5173`.

## Configuração do backend

Por padrão, a aplicação usa `http://localhost:3000`.

Se necessário, configure:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Páginas implementadas
- Cadastro de Fornecedor (criar, editar, remover e listar)
- Cadastro de Produto (criar, editar, remover e listar)
- Associação Produto/Fornecedor (associar, desassociar e listar associados)
