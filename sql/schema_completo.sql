-- ══════════════════════════════════════════════════════════════════════════════
--  Menina Moça Makeup – Schema Completo do Banco de Dados
--  Execute integralmente no Supabase SQL Editor:
--  Dashboard → SQL Editor → New Query → Colar tudo → Run
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABELA: profiles  (usuários cadastrados no site)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID         REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL DEFAULT '',
    email       VARCHAR(255) NOT NULL DEFAULT '',
    telefone    VARCHAR(20)  DEFAULT NULL,
    is_admin    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.profiles            IS 'Perfis de usuários cadastrados na loja';
COMMENT ON COLUMN public.profiles.is_admin   IS 'TRUE = acesso ao painel admin';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de profiles
DROP POLICY IF EXISTS "usuario_ve_proprio_perfil"     ON public.profiles;
DROP POLICY IF EXISTS "usuario_atualiza_proprio_perfil" ON public.profiles;
DROP POLICY IF EXISTS "admin_ve_todos_perfis"         ON public.profiles;
DROP POLICY IF EXISTS "admin_deleta_usuarios"         ON public.profiles;

CREATE POLICY "usuario_ve_proprio_perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "usuario_atualiza_proprio_perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "admin_gerencia_profiles"
    ON public.profiles FOR ALL
    USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE) );

-- Trigger: auto updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_profiles_email    ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABELA: categorias
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categorias (
    id         BIGSERIAL    PRIMARY KEY,
    nome       VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "publico_le_categorias"   ON public.categorias;
DROP POLICY IF EXISTS "admin_gerencia_categorias" ON public.categorias;

-- Leitura pública (necessário para a loja)
CREATE POLICY "publico_le_categorias"
    ON public.categorias FOR SELECT
    USING (true);

-- CRUD apenas admin
CREATE POLICY "admin_gerencia_categorias"
    ON public.categorias FOR ALL
    USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE) );


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABELA: subcategorias
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subcategorias (
    id           BIGSERIAL    PRIMARY KEY,
    nome         VARCHAR(255) NOT NULL,
    categoria_id BIGINT       REFERENCES public.categorias(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcategorias_cat ON public.subcategorias(categoria_id);

ALTER TABLE public.subcategorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "publico_le_subcategorias"    ON public.subcategorias;
DROP POLICY IF EXISTS "admin_gerencia_subcategorias" ON public.subcategorias;

CREATE POLICY "publico_le_subcategorias"
    ON public.subcategorias FOR SELECT USING (true);

CREATE POLICY "admin_gerencia_subcategorias"
    ON public.subcategorias FOR ALL
    USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE) );


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABELA: produtos
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.produtos (
    id               BIGSERIAL      PRIMARY KEY,
    nome             VARCHAR(255)   NOT NULL,
    descricao        TEXT           DEFAULT NULL,
    preco            DECIMAL(10,2)  NOT NULL DEFAULT 0,
    preco_original   DECIMAL(10,2)  DEFAULT NULL,
    imagem           TEXT           DEFAULT NULL,
    categoria_id     BIGINT         REFERENCES public.categorias(id) ON DELETE SET NULL,
    subcategoria_id  BIGINT         REFERENCES public.subcategorias(id) ON DELETE SET NULL,
    cor              VARCHAR(100)   DEFAULT NULL,
    destaque         BOOLEAN        NOT NULL DEFAULT FALSE,
    em_promocao      BOOLEAN        NOT NULL DEFAULT FALSE,
    estoque          INTEGER        NOT NULL DEFAULT 0,
    qtd_vendidos     INTEGER        NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_destaque  ON public.produtos(destaque);
CREATE INDEX IF NOT EXISTS idx_produtos_em_promocao
    ON public.produtos(em_promocao)
    WHERE em_promocao = TRUE;

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "publico_le_produtos"   ON public.produtos;
DROP POLICY IF EXISTS "admin_gerencia_produtos" ON public.produtos;

CREATE POLICY "publico_le_produtos"
    ON public.produtos FOR SELECT USING (true);

CREATE POLICY "admin_gerencia_produtos"
    ON public.produtos FOR ALL
    USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE) );

DROP TRIGGER IF EXISTS trg_produtos_updated_at ON public.produtos;
CREATE TRIGGER trg_produtos_updated_at
    BEFORE UPDATE ON public.produtos
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TABELA: vendas
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendas (
    id               UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID           REFERENCES auth.users(id) ON DELETE SET NULL,
    status           VARCHAR(50)    NOT NULL DEFAULT 'pendente',
                                    -- pendente | confirmado | enviado | entregue | cancelado
    forma_pagamento  VARCHAR(50)    DEFAULT NULL,
    total            DECIMAL(10,2)  NOT NULL DEFAULT 0,
    observacoes      TEXT           DEFAULT NULL,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_status CHECK (status IN ('pendente','confirmado','enviado','entregue','cancelado'))
);

CREATE INDEX IF NOT EXISTS idx_vendas_user_id    ON public.vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status     ON public.vendas(status);
CREATE INDEX IF NOT EXISTS idx_vendas_created_at ON public.vendas(created_at);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_ve_proprias_vendas"  ON public.vendas;
DROP POLICY IF EXISTS "usuario_cria_venda"          ON public.vendas;
DROP POLICY IF EXISTS "admin_gerencia_vendas"       ON public.vendas;

-- Usuário vê suas próprias vendas
CREATE POLICY "usuario_ve_proprias_vendas"
    ON public.vendas FOR SELECT
    USING (auth.uid() = user_id);

-- Usuário cria venda (checkout)
CREATE POLICY "usuario_cria_venda"
    ON public.vendas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin gerencia todas as vendas
CREATE POLICY "admin_gerencia_vendas"
    ON public.vendas FOR ALL
    USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE) );

DROP TRIGGER IF EXISTS trg_vendas_updated_at ON public.vendas;
CREATE TRIGGER trg_vendas_updated_at
    BEFORE UPDATE ON public.vendas
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TABELA: venda_itens  (itens de cada pedido)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.venda_itens (
    id              UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
    venda_id        UUID           NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
    produto_id      BIGINT         REFERENCES public.produtos(id) ON DELETE SET NULL,
    nome_produto    VARCHAR(255)   NOT NULL,
    preco_unitario  DECIMAL(10,2)  NOT NULL,
    quantidade      INTEGER        NOT NULL DEFAULT 1,
    cor             VARCHAR(100)   DEFAULT NULL,
    subtotal        DECIMAL(10,2)  NOT NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitens_venda_id ON public.venda_itens(venda_id);

ALTER TABLE public.venda_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuario_ve_itens_venda"  ON public.venda_itens;
DROP POLICY IF EXISTS "usuario_insere_itens"     ON public.venda_itens;
DROP POLICY IF EXISTS "admin_gerencia_itens"     ON public.venda_itens;

CREATE POLICY "usuario_ve_itens_venda"
    ON public.venda_itens FOR SELECT
    USING ( EXISTS (SELECT 1 FROM public.vendas WHERE id = venda_id AND user_id = auth.uid()) );

CREATE POLICY "usuario_insere_itens"
    ON public.venda_itens FOR INSERT
    WITH CHECK ( EXISTS (SELECT 1 FROM public.vendas WHERE id = venda_id AND user_id = auth.uid()) );

CREATE POLICY "admin_gerencia_itens"
    ON public.venda_itens FOR ALL
    USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE) );


-- ══════════════════════════════════════════════════════════════════════════════
--  APÓS EXECUTAR:
--
--  1. Execute no backend: npm install && node setup-admin.js
--     (com SUPABASE_SERVICE_ROLE_KEY preenchido no .env)
--
--  OU manualmente:
--  UPDATE public.profiles SET is_admin = TRUE
--  WHERE email = 'admin@meninamoca.com.br';
-- ══════════════════════════════════════════════════════════════════════════════
