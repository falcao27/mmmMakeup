-- FIX: garante suporte a produtos em promocao no Supabase
-- Execute no Supabase SQL Editor.

ALTER TABLE public.produtos
    ADD COLUMN IF NOT EXISTS em_promocao BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_produtos_em_promocao
    ON public.produtos(em_promocao)
    WHERE em_promocao = TRUE;

DROP POLICY IF EXISTS "usuario_atualiza_estoque_checkout" ON public.produtos;

-- Produtos em promocao devem ter:
--   em_promocao = TRUE
--   preco = preco promocional atual
--   preco_original = preco antigo para aparecer riscado
