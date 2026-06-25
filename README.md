# Menina Moca Makeup

Loja online de maquiagem e cosmeticos com vitrine responsiva, carrinho, checkout integrado ao Mercado Pago, envio de pedidos pelo WhatsApp e painel administrativo para gestao do catalogo.

## Recursos

- Vitrine publica com categorias, subcategorias, destaques e promocoes.
- Carrinho com controle de quantidade e variacoes de produto.
- Cadastro de produtos com codigo de barras, foto, estoque, tons, cores, tamanho, volume, acabamento, cobertura e indicacao por tipo de pele.
- Checkout com cartao de credito e debito via Mercado Pago.
- Fluxo de PIX e dinheiro direcionado para WhatsApp da loja.
- Painel administrativo responsivo para produtos, categorias, subcategorias, estoque, vendas, usuarios e relatorios.
- Controle de estoque com movimentacoes e alertas.
- Retorno de pagamento com confirmacao de venda e baixa de estoque.

## Integracoes

- Supabase Auth e Database.
- Mercado Pago Checkout Pro.
- WhatsApp Web para envio do pedido.
- Render/Vercel ou outro provedor com suporte a backend Node.js e frontend estatico.

## Seguranca

- Chaves sensiveis ficam somente no backend via variaveis de ambiente.
- `SUPABASE_SERVICE_ROLE_KEY` nao e exposta no frontend.
- `.env` esta ignorado pelo Git.
- Rotas administrativas do backend exigem token Supabase e perfil admin.
- Rotas de checkout exigem usuario autenticado.
- CORS do backend e controlado por `APP_URL`, `API_URL` e `ALLOWED_ORIGINS`.
- Respostas do backend usam cabecalhos basicos de seguranca.
- API Pix Mercado Pago foi desativada; PIX segue pelo WhatsApp.
- Dados textuais principais exibidos na loja sao escapados para reduzir risco de XSS.

## Variaveis de Ambiente

As variaveis reais devem ser configuradas no provedor do backend.

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_PHONE=
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_CLIENT_ID=
MERCADO_PAGO_CLIENT_SECRET=
APP_URL=
API_URL=
ALLOWED_ORIGINS=
```

## Estrutura

```text
backend/   API Express, checkout, rotas administrativas e integracoes server-side
frontend/  Loja, painel admin e paginas de retorno de pagamento
sql/       Scripts de schema, RLS e ajustes de banco
```

## Banco de Dados

Os scripts em `sql/` mantem o schema, politicas RLS e colunas usadas pelo catalogo, vendas, estoque e variacoes de produtos.

## Status

Projeto preparado para publicacao com backend Node.js, frontend estatico e credenciais de producao configuradas via ambiente seguro.
