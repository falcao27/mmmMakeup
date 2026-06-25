-- Adiciona atributos extras para produtos de maquiagem.
-- Rode este arquivo no SQL Editor do Supabase antes de salvar produtos com esses campos.

ALTER TABLE public.produtos
    ADD COLUMN IF NOT EXISTS tom VARCHAR(160) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS tamanho VARCHAR(80) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS volume VARCHAR(80) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS acabamento VARCHAR(120) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS cobertura VARCHAR(120) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS tipo_pele VARCHAR(160) DEFAULT NULL;

COMMENT ON COLUMN public.produtos.tom IS 'Tons ou tonalidades disponiveis do produto, separados por virgula. Ex: Natural, Bege 02, Nude 3.';
COMMENT ON COLUMN public.produtos.cor IS 'Cores disponiveis do produto, separadas por virgula. Ex: rosa, coral, marrom.';
COMMENT ON COLUMN public.produtos.tamanho IS 'Tamanho comercial do produto. Ex: P, M, G, unico.';
COMMENT ON COLUMN public.produtos.volume IS 'Volume ou peso do produto. Ex: 30ml, 8g, 120ml.';
COMMENT ON COLUMN public.produtos.acabamento IS 'Acabamento do produto. Ex: matte, glow, cintilante.';
COMMENT ON COLUMN public.produtos.cobertura IS 'Cobertura do produto. Ex: leve, media, alta.';
COMMENT ON COLUMN public.produtos.tipo_pele IS 'Tipo de pele indicado. Ex: oleosa, seca, mista, todos os tipos.';
