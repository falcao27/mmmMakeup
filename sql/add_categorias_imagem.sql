-- Imagem editorial exibida nos cards de categoria da loja.
-- Migração idempotente: pode ser executada mais de uma vez.
ALTER TABLE public.categorias
    ADD COLUMN IF NOT EXISTS imagem TEXT DEFAULT NULL;

COMMENT ON COLUMN public.categorias.imagem IS
    'URL ou data URL otimizada da imagem exibida no card da categoria.';
