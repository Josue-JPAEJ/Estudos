# Backend - Projeto Integrador

## Requisitos
- Node.js LTS (>= 20)

## Instalação

```bash
npm install
```

## Como rodar localmente

```bash
npm start
```

Servidor disponível em: `http://localhost:3000`

## Frontend (acesso correto)

> **Importante**: `localhost:3000` executa o backend. Para abrir as telas React:

### Modo desenvolvimento (recomendado)
1. No backend: `npm start`
2. No frontend: `npm install && npm run dev`
3. Acesse: `http://localhost:5173`

### Modo build estático servido pelo backend
1. No frontend: `npm install && npm run build`
2. No backend: `npm start`
3. Acesse: `http://localhost:3000/app`

## Endpoints implementados

### Utilitários
- `GET /`
- `GET /health`
- `GET /app` (orientação quando frontend dist não existe)

### Fornecedores (CRUD)
- `POST /api/fornecedores`
- `GET /api/fornecedores`
- `GET /api/fornecedores/:id`
- `PUT /api/fornecedores/:id`
- `DELETE /api/fornecedores/:id`

### Produtos (CRUD)
- `POST /api/produtos`
- `GET /api/produtos`
- `GET /api/produtos/:id`
- `PUT /api/produtos/:id`
- `DELETE /api/produtos/:id`

### Associação produto/fornecedor (N:N)
- `POST /api/associacoes/produtos/:produtoId/fornecedores/:fornecedorId`
- `DELETE /api/associacoes/produtos/:produtoId/fornecedores/:fornecedorId`
- `GET /api/associacoes/produtos/:produtoId/fornecedores`
- `GET /api/associacoes/fornecedores/:fornecedorId/produtos`

## Testes e validações

```bash
npm run lint
npm test
```


## CORS (frontend em desenvolvimento)

O backend permite por padrão a origem `http://localhost:5173`.

Para alterar, configure a variável:

```bash
FRONTEND_ORIGIN=http://seu-host:porta
```


## Seed de dados

Para popular o banco com 5 fornecedores e 3 produtos por fornecedor (15 produtos e 15 associações):

```bash
npm run seed
```
