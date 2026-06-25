-- FIX: coluna usada no checkout Mercado Pago.
-- Execute no Supabase Dashboard > SQL Editor.

ALTER TABLE public.vendas
    ADD COLUMN IF NOT EXISTS observacoes TEXT DEFAULT NULL;

ALTER TABLE public.vendas
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- FIX: colunas usadas pelos itens do pedido no checkout.
-- O nome correto da tabela no projeto é venda_itens (sem "s" em venda).
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

ALTER TABLE public.venda_itens
    ADD COLUMN IF NOT EXISTS produto_id BIGINT REFERENCES public.produtos(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS nome_produto VARCHAR(255),
    ADD COLUMN IF NOT EXISTS preco_unitario DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS cor VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_vitens_venda_id
    ON public.venda_itens(venda_id);

ALTER TABLE public.venda_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_ve_itens_venda" ON public.venda_itens;
DROP POLICY IF EXISTS "usuario_insere_itens" ON public.venda_itens;
DROP POLICY IF EXISTS "admin_gerencia_itens" ON public.venda_itens;

CREATE POLICY "usuario_ve_itens_venda"
    ON public.venda_itens
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.vendas
            WHERE vendas.id = venda_itens.venda_id
              AND vendas.user_id = auth.uid()
        )
    );

CREATE POLICY "usuario_insere_itens"
    ON public.venda_itens
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.vendas
            WHERE vendas.id = venda_itens.venda_id
              AND vendas.user_id = auth.uid()
        )
    );

CREATE POLICY "admin_gerencia_itens"
    ON public.venda_itens
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = TRUE
        )
    );
