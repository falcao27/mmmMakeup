-- FIX: libera cadastro/edicao de produtos, categorias e subcategorias para admins.
-- Execute no Supabase Dashboard > SQL Editor.
--
-- Importante:
-- 1. Troque o email abaixo pelo email usado para entrar no painel admin, se for diferente.
-- 2. Rode este SQL inteiro.
-- 3. Saia e entre novamente no painel admin para renovar a sessao/JWT.

-- Garante colunas usadas pelo painel admin.
ALTER TABLE public.produtos
    ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS imagem TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS preco_original DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS cor VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS destaque BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS em_promocao BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS estoque INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS qtd_vendidos INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras
    ON public.produtos(codigo_barras)
    WHERE codigo_barras IS NOT NULL;

-- Funcao segura para policies RLS checarem admin sem recursao.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result BOOLEAN;
BEGIN
    SELECT is_admin INTO result
    FROM public.profiles
    WHERE id = auth.uid();

    RETURN COALESCE(result, FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_is_admin() TO anon, authenticated;

-- Garanta que o usuario do painel existe como admin.
-- Troque este email se seu login admin for outro.
INSERT INTO public.profiles (id, email, nome, is_admin)
SELECT id, email, COALESCE(raw_user_meta_data->>'nome', 'Administrador'), TRUE
FROM auth.users
WHERE email = 'admin@meninamoca.com.br'
ON CONFLICT (id) DO UPDATE
SET is_admin = TRUE,
    nome = COALESCE(NULLIF(public.profiles.nome, ''), 'Administrador');

-- Habilita RLS.
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategorias ENABLE ROW LEVEL SECURITY;

-- Recria policies de produtos.
DROP POLICY IF EXISTS "publico_le_produtos" ON public.produtos;
DROP POLICY IF EXISTS "admin_gerencia_produtos" ON public.produtos;

CREATE POLICY "publico_le_produtos"
    ON public.produtos
    FOR SELECT
    USING (true);

CREATE POLICY "admin_gerencia_produtos"
    ON public.produtos
    FOR ALL
    USING (public.check_is_admin())
    WITH CHECK (public.check_is_admin());

-- Recria policies de categorias.
DROP POLICY IF EXISTS "publico_le_categorias" ON public.categorias;
DROP POLICY IF EXISTS "admin_gerencia_categorias" ON public.categorias;

CREATE POLICY "publico_le_categorias"
    ON public.categorias
    FOR SELECT
    USING (true);

CREATE POLICY "admin_gerencia_categorias"
    ON public.categorias
    FOR ALL
    USING (public.check_is_admin())
    WITH CHECK (public.check_is_admin());

-- Recria policies de subcategorias.
DROP POLICY IF EXISTS "publico_le_subcategorias" ON public.subcategorias;
DROP POLICY IF EXISTS "admin_gerencia_subcategorias" ON public.subcategorias;

CREATE POLICY "publico_le_subcategorias"
    ON public.subcategorias
    FOR SELECT
    USING (true);

CREATE POLICY "admin_gerencia_subcategorias"
    ON public.subcategorias
    FOR ALL
    USING (public.check_is_admin())
    WITH CHECK (public.check_is_admin());

-- Verificacao: deve retornar is_admin = true para o email do admin.
SELECT id, email, nome, is_admin
FROM public.profiles
WHERE email = 'admin@meninamoca.com.br';
