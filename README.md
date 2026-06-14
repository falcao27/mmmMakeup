# Menina Moca Makeup

Projeto de loja com frontend estatico, painel admin e backend Express para operacoes seguras.

## Pasta de deploy

Use `frontend/` como pasta publica. Para checkout e rotas admin auxiliares, rode o backend em `backend/server.js`, que ja serve essa pasta.

## Configuracao do backend

1. Copie `backend/.env.example` para `backend/.env`.
2. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. Rode:

```bash
cd backend
npm install
npm start
```

## Supabase

Execute os SQLs em `sql/` no Supabase SQL Editor. Para corrigir uma base existente, rode primeiro:

```text
sql/fix_promocoes.sql
```

Produtos em promocao usam:

- `em_promocao = true`
- `preco` como preco atual
- `preco_original` como preco antigo riscado

## Seguranca

Nunca publique `SUPABASE_SERVICE_ROLE_KEY` no frontend. Essa chave deve existir somente no `.env` do backend.
