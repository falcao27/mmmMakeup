-- Ajustes minimos para checkout, promocoes e leitura publica da loja.
-- Execute no Supabase SQL Editor.

ALTER TABLE public.produtos
    ADD COLUMN IF NOT EXISTS estoque INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS qtd_vendidos INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS em_promocao BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(100) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_produtos_em_promocao
    ON public.produtos(em_promocao)
    WHERE em_promocao = TRUE;

CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras
    ON public.produtos(codigo_barras)
    WHERE codigo_barras IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.vendas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    forma_pagamento VARCHAR(50) DEFAULT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    observacoes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.venda_itens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id UUID NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
    produto_id BIGINT REFERENCES public.produtos(id) ON DELETE SET NULL,
    nome_produto VARCHAR(255) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    cor VARCHAR(100) DEFAULT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venda_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "publico_le_produtos" ON public.produtos;
CREATE POLICY "publico_le_produtos"
    ON public.produtos FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "publico_le_categorias" ON public.categorias;
CREATE POLICY "publico_le_categorias"
    ON public.categorias FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "publico_le_subcategorias" ON public.subcategorias;
CREATE POLICY "publico_le_subcategorias"
    ON public.subcategorias FOR SELECT
    USING (true);

-- Remove regra antiga e insegura que permitia update publico de produtos/estoque.
DROP POLICY IF EXISTS "usuario_atualiza_estoque_checkout" ON public.produtos;
