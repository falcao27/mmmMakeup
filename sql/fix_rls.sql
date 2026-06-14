-- ══════════════════════════════════════════════════════════════
--  FIX: Corrige recursão infinita nas políticas RLS de profiles
--  Execute no Supabase SQL Editor (Dashboard → SQL Editor)
-- ══════════════════════════════════════════════════════════════

-- 1. Função SECURITY DEFINER – consulta profiles sem acionar RLS
--    Quebra o ciclo infinito: política → profiles → política → ...
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result BOOLEAN;
BEGIN
    SELECT is_admin INTO result FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(result, FALSE);
END;
$$;

-- 2. Remover políticas antigas que causavam recursão
DROP POLICY IF EXISTS "admin_ve_todos_perfis"         ON public.profiles;
DROP POLICY IF EXISTS "admin_deleta_usuarios"         ON public.profiles;
DROP POLICY IF EXISTS "admin_gerencia_profiles"       ON public.profiles;
DROP POLICY IF EXISTS "admin_gerencia_categorias"     ON public.categorias;
DROP POLICY IF EXISTS "admin_gerencia_subcategorias"  ON public.subcategorias;
DROP POLICY IF EXISTS "admin_gerencia_produtos"       ON public.produtos;
DROP POLICY IF EXISTS "admin_gerencia_vendas"         ON public.vendas;
DROP POLICY IF EXISTS "admin_gerencia_itens"          ON public.venda_itens;

-- 3. Recriar políticas usando a função (sem recursão)
CREATE POLICY "admin_gerencia_profiles"
    ON public.profiles FOR ALL
    USING (public.check_is_admin());

CREATE POLICY "admin_gerencia_categorias"
    ON public.categorias FOR ALL
    USING (public.check_is_admin());

CREATE POLICY "admin_gerencia_subcategorias"
    ON public.subcategorias FOR ALL
    USING (public.check_is_admin());

CREATE POLICY "admin_gerencia_produtos"
    ON public.produtos FOR ALL
    USING (public.check_is_admin());

CREATE POLICY "admin_gerencia_vendas"
    ON public.vendas FOR ALL
    USING (public.check_is_admin());

CREATE POLICY "admin_gerencia_itens"
    ON public.venda_itens FOR ALL
    USING (public.check_is_admin());

-- 4. Garantir que o usuário admin existe na tabela profiles com is_admin = TRUE
--    (caso o trigger não tenha criado o perfil automaticamente)
INSERT INTO public.profiles (id, email, nome, is_admin)
SELECT id, email, 'Administrador', TRUE
FROM auth.users
WHERE email = 'admin@meninamoca.com.br'
ON CONFLICT (id) DO UPDATE SET is_admin = TRUE, nome = 'Administrador';

-- 5. Verificar resultado
SELECT id, email, nome, is_admin FROM public.profiles WHERE email = 'admin@meninamoca.com.br';
