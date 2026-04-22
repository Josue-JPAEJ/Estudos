# Frontend - Projeto Integrador

Frontend da Fase 3 em React + Vite, consumindo o backend da Fase 2.

## Requisitos
- Node.js LTS (>= 20)

## Instalação

```bash
npm install
```

## Execução (modo desenvolvimento)

```bash
npm run dev
```

Acesse em: `http://localhost:5173`

> Não acessar `http://localhost:3000/index.html`.
> Essa porta pertence ao backend Express.

## Build para servir no backend

```bash
npm run build
```

Depois do build, com backend rodando, acesse:
- `http://localhost:3000/app`

## Configuração da API

Por padrão, a aplicação usa `http://localhost:3000`.

Se necessário, configure:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Páginas implementadas
- Cadastro de Fornecedor (criar, editar, remover e listar)
- Cadastro de Produto (criar, editar, remover e listar)
- Associação Produto/Fornecedor (associar, desassociar e listar associados)


## Validação

```bash
npm run lint
```
