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

## Endpoints implementados

### Utilitários
- `GET /`
- `GET /health`

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

## Como testar manualmente (curl)

### 1) Cadastrar fornecedor
```bash
curl -X POST http://localhost:3000/api/fornecedores \
  -H "Content-Type: application/json" \
  -d '{
    "nomeEmpresa": "Fornecedor XPTO",
    "cnpj": "12.345.678/0001-90",
    "endereco": "Rua A, 100",
    "telefone": "(11) 99999-0000",
    "email": "contato@xpto.com",
    "contatoPrincipal": "Maria Silva"
  }'
```

### 2) Cadastrar produto
```bash
curl -X POST http://localhost:3000/api/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Arroz 1kg",
    "codigoBarras": "7890001112223",
    "descricao": "Arroz tipo 1",
    "quantidadeEstoque": 25,
    "categoria": "Alimentos"
  }'
```

### 3) Associar fornecedor ao produto
```bash
curl -X POST http://localhost:3000/api/associacoes/produtos/1/fornecedores/1
```

### 4) Consultar associação nos dois sentidos
```bash
curl http://localhost:3000/api/associacoes/produtos/1/fornecedores
curl http://localhost:3000/api/associacoes/fornecedores/1/produtos
```
