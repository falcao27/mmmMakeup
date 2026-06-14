-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
--  mmmMakeup â€“ Migrations CRM Admin
--  Execute no Supabase SQL Editor:
--  Dashboard â†’ SQL Editor â†’ New Query â†’ Cole todo o conteÃºdo â†’ Run
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â”€â”€ 1. Adicionar colunas Ã  tabela produtos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ALTER TABLE public.produtos
    ADD COLUMN IF NOT EXISTS qtd_vendidos  INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS em_promocao   BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_produtos_em_promocao
    ON public.produtos(em_promocao)
    WHERE em_promocao = TRUE;

-- Ãndice para busca rÃ¡pida por cÃ³digo de barras
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras
    ON public.produtos(codigo_barras)
    WHERE codigo_barras IS NOT NULL;

-- â”€â”€ 2. Recalcular qtd_vendidos baseado nas vendas existentes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
UPDATE public.produtos p
SET qtd_vendidos = COALESCE((
    SELECT SUM(vi.quantidade)
    FROM public.venda_itens vi
    JOIN public.vendas v ON vi.venda_id = v.id
    WHERE vi.produto_id = p.id
      AND v.status != 'cancelado'
), 0);

-- â”€â”€ 3. Tabela: estoque_movimentos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS public.estoque_movimentos (
    id              BIGSERIAL    PRIMARY KEY,
    produto_id      BIGINT       REFERENCES public.produtos(id) ON DELETE CASCADE,
    tipo            VARCHAR(20)  NOT NULL,
                    -- entrada | saida | ajuste | venda | devolucao
    quantidade      INTEGER      NOT NULL,
    estoque_antes   INTEGER,
    estoque_depois  INTEGER,
    motivo          TEXT         DEFAULT NULL,
    admin_id        UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
    venda_id        UUID         REFERENCES public.vendas(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_tipo_movimento CHECK (
        tipo IN ('entrada','saida','ajuste','venda','devolucao')
    )
);

CREATE INDEX IF NOT EXISTS idx_estmov_produto   ON public.estoque_movimentos(produto_id);
CREATE INDEX IF NOT EXISTS idx_estmov_tipo      ON public.estoque_movimentos(tipo);
CREATE INDEX IF NOT EXISTS idx_estmov_criado    ON public.estoque_movimentos(created_at);

ALTER TABLE public.estoque_movimentos ENABLE ROW LEVEL SECURITY;

-- Somente admins
DROP POLICY IF EXISTS "admin_gerencia_estoque_movimentos" ON public.estoque_movimentos;
CREATE POLICY "admin_gerencia_estoque_movimentos"
    ON public.estoque_movimentos FOR ALL
    USING ( EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE
    ));

-- â”€â”€ 4. Atualizar policy de produtos para permitir update pelo usuÃ¡rio â”€
--  (jÃ¡ existe; sÃ³ garante que estoque pode ser atualizado no checkout)
DROP POLICY IF EXISTS "usuario_atualiza_estoque_checkout" ON public.produtos;
-- O checkout de producao atualiza estoque pelo backend usando service role.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
--  FIM DA MIGRAÃ‡ÃƒO
--  ApÃ³s executar, o painel admin terÃ¡:
--  - Campo "CÃ³digo de Barras" nos produtos
--  - Coluna qtd_vendidos funcional
--  - HistÃ³rico de movimentaÃ§Ãµes de estoque
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
