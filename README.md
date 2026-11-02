# MeuBolso

Aplicação full-stack para organizar finanças pessoais: receitas, despesas, categorias, metas e um painel mensal.

## Estrutura

```text
MeuBolso/
├── backend/     # API REST, autenticação JWT e PostgreSQL
├── database/    # schema do banco
└── frontend/    # dashboard React responsivo
```

## Funcionalidades da primeira versão

- Cadastro e login com senha protegida por hash
- Lançamentos de receita e despesa com categoria e data
- Resumo mensal: receitas, despesas, saldo e gastos por categoria
- Metas financeiras mensais e acompanhamento de progresso
- Interface responsiva com filtros por mês

## Como executar

1. Crie um banco PostgreSQL chamado `meubolso` e execute `database/schema.sql`.
2. Copie `backend/.env.example` para `backend/.env` e preencha as variáveis.
3. Em dois terminais:

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

O front-end espera a API em `http://localhost:3333/api/v1`.

## Tecnologias

- React, TypeScript e Vite
- Node.js, Express, TypeScript e JWT
- PostgreSQL
