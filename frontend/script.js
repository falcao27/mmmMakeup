import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabaseUrl = 'https://ixouszvipgklgdvmsyyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4b3VzenZpcGdrbGdkdm1zeXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NTc5ODgsImV4cCI6MjA0NzQzMzk4OH0.FxsdlpIFDHk9NDHp8mKn06_M54WasfIuTWLgA1L_ip8';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Constantes globais
const DEFAULT_IMAGE = 'https://placehold.co/400x300/pink/white?text=Menina+Moca';
const STORE_WHATSAPP_PHONE = '5585988740788';
const SCOOP_PRODUCT_CODE = 'SCOOP-PREMIADO-2026';
let mercadoPagoConfigCache = null;

// =====================================================
// DADOS DE EXEMPLO (MOCK) — para visualização local/produção sem dependência do banco
// Remove ou desativa em produção quando o Supabase estiver populado.
// =====================================================
const MOCK_CATEGORIAS = [
    { id: 1, nome: 'Rosto', slug: 'rosto', ordem: 1 },
    { id: 2, nome: 'Olhos', slug: 'olhos', ordem: 2 },
    { id: 3, nome: 'Lábios', slug: 'labios', ordem: 3 },
    { id: 4, nome: 'Pincéis', slug: 'pinceis', ordem: 4 },
    { id: 5, nome: 'Acessórios', slug: 'acessorios', ordem: 5 }
];

const MOCK_SUBCATEGORIAS = [
    { id: 22, nome: 'Base Líquida', categoria_id: 1 },
    { id: 2, nome: 'Corretivo', categoria_id: 1 },
    { id: 23, nome: 'Pó Facial', categoria_id: 1 },
    { id: 4, nome: 'Blush', categoria_id: 1 },
    { id: 24, nome: 'Bruma Fixadora', categoria_id: 1 },
    { id: 5, nome: 'Máscara de Cílios', categoria_id: 2 },
    { id: 25, nome: 'Paletas de Sombras', categoria_id: 2 },
    { id: 7, nome: 'Delineador', categoria_id: 2 },
    { id: 26, nome: 'Sombra e Iluminador', categoria_id: 2 },
    { id: 27, nome: 'Sombra Marshmallow', categoria_id: 2 },
    { id: 28, nome: 'Sombra Líquida e Primer', categoria_id: 2 },
    { id: 8, nome: 'Batom', categoria_id: 3 },
    { id: 9, nome: 'Gloss', categoria_id: 3 },
    { id: 29, nome: 'Óleo Labial', categoria_id: 3 },
    { id: 30, nome: 'Gloss Plump', categoria_id: 3 },
    { id: 31, nome: 'Lápis de Boca', categoria_id: 3 },
    { id: 11, nome: 'Pincéis Faciais', categoria_id: 4 },
    { id: 12, nome: 'Pincéis de Olhos', categoria_id: 4 },
    { id: 13, nome: 'Espelhos', categoria_id: 5 },
    { id: 14, nome: 'Necessaires', categoria_id: 5 }
];

const MOCK_PRODUTOS = (() => {
    const produtos = [];
    let id = 100;
    const items = [
        { nome: 'Base Líquida HD', categoria_id: 1, subcategoria_id: 22, preco: 89.90, preco_original: 109.90, em_promocao: true, estoque: 12, descricao: 'Cobertura média a alta, acabamento natural e longa duração para todos os tons de pele.', imagem: 'assets/Batton-hero.jpg', vendas: 134 },
        { nome: 'Corretivo Camuflagem', categoria_id: 1, subcategoria_id: 2, preco: 49.90, preco_original: 59.90, em_promocao: true, estoque: 8, descricao: 'Disfarça olheiras e imperfeições com alta cobertura sem craquelar.', imagem: 'assets/Batton-mobile.jpg', vendas: 98 },
        { nome: 'Pó Compacto Velvet', categoria_id: 1, subcategoria_id: 23, preco: 59.90, preco_original: 0, em_promocao: false, estoque: 20, descricao: 'Acabamento aveludado, controla a oleosidade e fixa a maquiagem o dia todo.', imagem: 'assets/Paleta-hero.jpg', vendas: 76 },
        { nome: 'Blush Cremoso Peach', categoria_id: 1, subcategoria_id: 4, preco: 45.00, preco_original: 0, em_promocao: false, estoque: 0, descricao: 'Textura cremosa que derrete na pele, cor natural e saudável.', imagem: 'assets/Paleta-mobile.jpg', vendas: 54 },
        { nome: 'Blush Líquido Rosa Antigo', categoria_id: 1, subcategoria_id: 4, preco: 47.00, preco_original: 55.00, em_promocao: true, estoque: 15, descricao: 'Pigmento buildable que garante um glow romântico nas bochechas.', imagem: 'assets/Batton-hero.jpg', vendas: 112 },
        { nome: 'Máscara de Cílios Volume', categoria_id: 2, subcategoria_id: 5, preco: 69.90, preco_original: 79.90, em_promocao: true, estoque: 22, descricao: 'Cílios alongados e volumosos com fórmula resistente à água.', imagem: 'assets/Pincel-hero.jpg', vendas: 210 },
        { nome: 'Máscara de Cílios Alongamento', categoria_id: 2, subcategoria_id: 5, preco: 64.90, preco_original: 0, em_promocao: false, estoque: 18, descricao: 'Efeito de cílios postiços, define e alonga sem pesar.', imagem: 'assets/Pincel-mobile.jpg', vendas: 88 },
        { nome: 'Paleta de Sombras Nude', categoria_id: 2, subcategoria_id: 25, preco: 129.00, preco_original: 159.00, em_promocao: true, estoque: 10, descricao: '12 tons matte e cintilantes, alta pigmentação e fácil esfumado.', imagem: 'assets/Paleta-hero.jpg', vendas: 167 },
        { nome: 'Paleta de Sombras Rose', categoria_id: 2, subcategoria_id: 25, preco: 139.00, preco_original: 0, em_promocao: false, estoque: 9, descricao: 'Tons rosados e marrons para looks delicados e sofisticados.', imagem: 'assets/Paleta.jpg', vendas: 72 },
        { nome: 'Delineador Líquido Preto', categoria_id: 2, subcategoria_id: 7, preco: 39.90, preco_original: 0, em_promocao: false, estoque: 25, descricao: 'Traço preciso, secagem rápida e durabilidade de até 12h.', imagem: 'assets/Batton-hero.jpg', vendas: 145 },
        { nome: 'Delineador Colorido Pink', categoria_id: 2, subcategoria_id: 7, preco: 42.00, preco_original: 0, em_promocao: false, estoque: 11, descricao: 'Cor vibrante e marcante para ousar nos olhos.', imagem: 'assets/Batton.jpg', vendas: 43 },
        { nome: 'Batom Matte Ruby', categoria_id: 3, subcategoria_id: 8, preco: 55.00, preco_original: 65.00, em_promocao: true, estoque: 30, descricao: 'Vermelho intenso, acabamento matte confortável e alta fixação.', imagem: 'assets/Batton-hero.jpg', vendas: 256 },
        { nome: 'Batom Nude Rose', categoria_id: 3, subcategoria_id: 8, preco: 52.00, preco_original: 0, em_promocao: false, estoque: 28, descricao: 'Nude rosado perfeito para o dia a dia, hidrata e colore.', imagem: 'assets/Batton-mobile.jpg', vendas: 189 },
        { nome: 'Gloss Hidratante', categoria_id: 3, subcategoria_id: 9, preco: 38.00, preco_original: 0, em_promocao: false, estoque: 35, descricao: 'Brilho 3D, fórmula não pegajosa e hidratação prolongada.', imagem: 'assets/Paleta-hero.jpg', vendas: 124 },
        { nome: 'Lápis de Boca Rosé', categoria_id: 3, subcategoria_id: 31, preco: 29.90, preco_original: 0, em_promocao: false, estoque: 17, descricao: 'Define, preenche e aumenta a durabilção do batom.', imagem: 'assets/Pincel-hero.jpg', vendas: 67 },
        { nome: 'Kit Pincéis Rosto', categoria_id: 4, subcategoria_id: 11, preco: 149.00, preco_original: 189.00, em_promocao: true, estoque: 6, descricao: '5 pincéis premium para base, pó, blush e contorno.', imagem: 'assets/Pincel.jpg', vendas: 92 },
        { nome: 'Pincel de Esfumar', categoria_id: 4, subcategoria_id: 12, preco: 39.90, preco_original: 0, em_promocao: false, estoque: 14, descricao: 'Cerdas macias que facilitam o esfumado perfeito.', imagem: 'assets/Pincel-hero.jpg', vendas: 58 },
        { nome: 'Pincel Aplicador de Sombra', categoria_id: 4, subcategoria_id: 12, preco: 34.90, preco_original: 0, em_promocao: false, estoque: 19, descricao: 'Aplicação precisa de sombras com pigmento uniforme.', imagem: 'assets/Pincel-mobile.jpg', vendas: 41 },
        { nome: 'Espelho de Bolsa Iluminado', categoria_id: 5, subcategoria_id: 13, preco: 79.00, preco_original: 0, em_promocao: false, estoque: 13, descricao: 'Compacto com luz LED para retocar a make em qualquer lugar.', imagem: 'assets/Paleta-hero.jpg', vendas: 33 },
        { nome: 'Necessaire Pink', categoria_id: 5, subcategoria_id: 14, preco: 89.00, preco_original: 99.00, em_promocao: true, estoque: 7, descricao: 'Espaçosa, impermeável e no tom rosa da marca.', imagem: 'assets/Batton-hero.jpg', vendas: 61 },
        { nome: 'Lápis de Olho Marrom', categoria_id: 2, subcategoria_id: 7, preco: 32.00, preco_original: 0, em_promocao: false, estoque: 21, descricao: 'Marrom suave para delineados delicados no dia a dia.', imagem: 'assets/Pincel-hero.jpg', vendas: 49 },
        { nome: 'Base Cushion', categoria_id: 1, subcategoria_id: 22, preco: 99.00, preco_original: 0, em_promocao: false, estoque: 16, descricao: 'Acabamento luminoso, prática para retoques e viagem.', imagem: 'assets/Paleta-mobile.jpg', vendas: 107 },
        { nome: 'Corretivo Líquido', categoria_id: 1, subcategoria_id: 2, preco: 44.90, preco_original: 0, em_promocao: false, estoque: 24, descricao: 'Alta cobertura com acabamento natural e leve.', imagem: 'assets/Batton-mobile.jpg', vendas: 81 },
        { nome: 'Pó Solto Translúcido', categoria_id: 1, subcategoria_id: 23, preco: 62.00, preco_original: 72.00, em_promocao: true, estoque: 11, descricao: 'Fixa a maquiagem sem adicionar cor ou textura.', imagem: 'assets/Paleta.jpg', vendas: 115 },
        { nome: 'Batom Líquido Vinho', categoria_id: 3, subcategoria_id: 8, preco: 58.00, preco_original: 0, em_promocao: false, estoque: 20, descricao: 'Acabamento mate, não transfere e dura a noite toda.', imagem: 'assets/Batton.jpg', vendas: 138 },
        { nome: 'Iluminador Compacto', categoria_id: 1, subcategoria_id: 4, preco: 67.00, preco_original: 77.00, em_promocao: true, estoque: 5, descricao: 'Glow natural para realçar pontos altos do rosto.', imagem: 'assets/Paleta-hero.jpg', vendas: 64 },
        { nome: 'Fixador de Maquiagem', categoria_id: 1, subcategoria_id: 24, preco: 54.90, preco_original: 0, em_promocao: false, estoque: 23, descricao: 'Spray fixador que aumenta a durabilidade da make.', imagem: 'assets/Batton-hero.jpg', vendas: 73 },
        { nome: 'Sombra Cremosa Rose', categoria_id: 2, subcategoria_id: 25, preco: 36.00, preco_original: 0, em_promocao: false, estoque: 27, descricao: 'Sombra 2 em 1: base e cor em um só produto.', imagem: 'assets/Paleta-mobile.jpg', vendas: 52 },
        { nome: 'Gloss com Glitter', categoria_id: 3, subcategoria_id: 9, preco: 41.00, preco_original: 0, em_promocao: false, estoque: 18, descricao: 'Brilho extra para looks especiais e noite.', imagem: 'assets/Batton-mobile.jpg', vendas: 39 },
        { nome: 'Kit Pincéis Olhos', categoria_id: 4, subcategoria_id: 12, preco: 119.00, preco_original: 149.00, em_promocao: true, estoque: 4, descricao: '4 pincéis essenciais para esfumar, aplicar e delineador.', imagem: 'assets/Pincel.jpg', vendas: 29 },
        { nome: 'Removedor de Maquiagem Bifásico', categoria_id: 5, subcategoria_id: 14, preco: 48.00, preco_original: 0, em_promocao: false, estoque: 31, descricao: 'Remove maquiagem à prova d’água sem agredir a pele.', imagem: 'assets/Paleta-hero.jpg', vendas: 86 },
        { nome: 'Duo Sombra e Iluminador', categoria_id: 2, subcategoria_id: 26, preco: 74.00, preco_original: 0, em_promocao: false, estoque: 12, descricao: 'Dupla função: sombra pigmentada e iluminador glow em um só produto.', imagem: 'assets/Paleta-hero.jpg', vendas: 44 },
        { nome: 'Sombra Marshmallow', categoria_id: 2, subcategoria_id: 27, preco: 46.00, preco_original: 0, em_promocao: false, estoque: 15, descricao: 'Textura macia tipo marshmallow, cor intensa e esfumado fácil.', imagem: 'assets/Paleta-mobile.jpg', vendas: 37 },
        { nome: 'Sombra Líquida com Primer', categoria_id: 2, subcategoria_id: 28, preco: 52.00, preco_original: 0, em_promocao: false, estoque: 9, descricao: 'Sombra líquida com primer embutido para fixação prolongada.', imagem: 'assets/Batton-hero.jpg', vendas: 28 },
        { nome: 'Óleo Labial Hidratante', categoria_id: 3, subcategoria_id: 29, preco: 42.00, preco_original: 0, em_promocao: false, estoque: 26, descricao: 'Nutrição intensa com brilho natural e toque aveludado.', imagem: 'assets/Batton-mobile.jpg', vendas: 95 },
        { nome: 'Gloss Plump Volume', categoria_id: 3, subcategoria_id: 30, preco: 49.00, preco_original: 0, em_promocao: false, estoque: 20, descricao: 'Efeito volume imediato com sensação refrescante e brilho intenso.', imagem: 'assets/Paleta-hero.jpg', vendas: 71 }
    ];

    items.forEach(item => {
        produtos.push({
            id: String(id++),
            nome: item.nome,
            categoria_id: item.categoria_id,
            subcategoria_id: item.subcategoria_id,
            preco: item.preco,
            preco_original: item.preco_original,
            em_promocao: item.em_promocao,
            estoque: item.estoque,
            descricao: item.descricao,
            imagem: item.imagem,
            url_imagem: item.imagem,
            imagem_url: item.imagem,
            vendas: item.vendas,
            destaque: item.vendas > 150,
            categoria: { nome: MOCK_CATEGORIAS.find(c => c.id === item.categoria_id).nome },
            created_at: new Date().toISOString()
        });
    });
    return produtos;
})();

// Função global para alternar o carrinho
function getProdutoImagem(produto) {
    return produto?.imagem || produto?.url_imagem || DEFAULT_IMAGE;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getProdutoCores(produto) {
    return String(produto?.cor || '')
        .split(',')
        .map(cor => cor.trim())
        .filter(Boolean);
}

function getProdutoTons(produto) {
    return String(produto?.tom || produto?.tons || '')
        .split(',')
        .map(tom => tom.trim())
        .filter(Boolean);
}

function splitOpcoesProduto(valor) {
    return String(valor || '')
        .split(',')
        .map(opcao => opcao.trim())
        .filter(Boolean);
}

function getProdutoVariacoes(produto) {
    const grupos = [
        { campo: 'tom', label: 'Tom', opcoes: getProdutoTons(produto) },
        { campo: 'cor', label: 'Cor', opcoes: getProdutoCores(produto) },
        { campo: 'tamanho', label: 'Tamanho', opcoes: splitOpcoesProduto(produto?.tamanho) },
        { campo: 'volume', label: 'Volume / peso', opcoes: splitOpcoesProduto(produto?.volume) },
    ].filter(grupo => grupo.opcoes.length > 0);

    return grupos;
}

function getVariacoesKey(variacoes = {}) {
    return Object.entries(variacoes)
        .filter(([, valor]) => valor)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([campo, valor]) => `${campo}:${valor}`)
        .join('|');
}

function getItemCarrinhoKey(item) {
    const variacoesKey = item.variacoesKey || getVariacoesKey(item.variacoes || (item.cor ? { cor: item.cor } : {}));
    return `${item.id}-${variacoesKey || 'sem-variacao'}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function formatarVariacoesItem(item) {
    const variacoes = item.variacoes || {};
    if (!Object.keys(variacoes).length && item.cor) variacoes.cor = item.cor;

    return [
        variacoes.tom ? `Tom: ${variacoes.tom}` : '',
        variacoes.cor ? `Cor: ${variacoes.cor}` : '',
        variacoes.tamanho ? `Tamanho: ${variacoes.tamanho}` : '',
        variacoes.volume ? `Volume: ${variacoes.volume}` : '',
    ].filter(Boolean);
}

function formatarVariacoesPedido(item) {
    return formatarVariacoesItem(item)
        .join(' | ') || null;
}

function getProdutoAtributos(produto) {
    return [
        produto?.tom ? ['Tom', produto.tom] : null,
        produto?.cor ? ['Cor', produto.cor] : null,
        produto?.tamanho ? ['Tamanho', produto.tamanho] : null,
        produto?.volume ? ['Volume / peso', produto.volume] : null,
        produto?.acabamento ? ['Acabamento', produto.acabamento] : null,
        produto?.cobertura ? ['Cobertura', produto.cobertura] : null,
        produto?.tipo_pele ? ['Indicado para', produto.tipo_pele] : null,
    ].filter(Boolean);
}

function renderProdutoAtributos(produto) {
    const atributos = getProdutoAtributos(produto);
    if (!atributos.length) return '';

    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${atributos.map(([label, valor]) => `
                <div class="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <p class="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">${label}</p>
                    <p class="text-sm text-gray-700 font-medium">${escapeHtml(valor)}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function getApiBaseUrl() {
    const isStaticDevServer = ['127.0.0.1:5500', 'localhost:5500'].includes(window.location.host);
    return isStaticDevServer ? 'http://localhost:3000' : '';
}

async function fetchApi(path, options = {}) {
    try {
        return await fetch(`${getApiBaseUrl()}${path}`, options);
    } catch (error) {
        const isStaticDevServer = ['127.0.0.1:5500', 'localhost:5500'].includes(window.location.host);
        if (isStaticDevServer) {
            throw new Error('Backend offline. Abra outro terminal em mmmMakeup-main/backend e rode npm start.');
        }
        throw error;
    }
}

function formatarMoeda(valor) {
    return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
}

function criarMensagemPedido(itens, formaPagamento, totalPedido) {
    let mensagem = 'Ola! Gostaria de fazer um pedido:\n\n';
    mensagem += 'Itens do pedido:\n';

    itens.forEach(item => {
        const subtotal = Number(item.precoAtual || 0) * Number(item.quantidade || 0);
        mensagem += `- ${item.nome || 'Produto'} (${item.quantidade}x) - ${formatarMoeda(subtotal)}\n`;
        formatarVariacoesItem(item).forEach(linha => {
            mensagem += `  ${linha}\n`;
        });
    });

    mensagem += `\nTotal: ${formatarMoeda(totalPedido)}`;
    mensagem += `\nForma de pagamento: ${formaPagamento}`;
    return mensagem;
}

function criarWhatsappWebLink(mensagem) {
    return `https://web.whatsapp.com/send?phone=${STORE_WHATSAPP_PHONE}&text=${encodeURIComponent(mensagem)}`;
}

function direcionarWhatsapp(link, janelaAberta = null) {
    if (janelaAberta && !janelaAberta.closed) {
        janelaAberta.location.href = link;
        return true;
    }
    window.location.href = link;
    return false;
}

async function getMercadoPagoConfig() {
    if (mercadoPagoConfigCache) return mercadoPagoConfigCache;
    try {
        const response = await fetchApi('/api/mercadopago/config', { cache: 'no-store' });
        if (!response.ok) throw new Error('Servidor de pagamento indisponivel.');
        mercadoPagoConfigCache = await response.json();
        if (!mercadoPagoConfigCache.canUseOnlinePayments) {
            mercadoPagoConfigCache.message = mercadoPagoConfigCache.message || 'Servidor de pagamento sem credencial do Mercado Pago.';
        }
        return mercadoPagoConfigCache;
    } catch (_) {
        return {
            configured: false,
            canUseOnlinePayments: false,
            message: 'Servidor de pagamento offline. Inicie o backend para liberar cartao.',
        };
    }
}
window.toggleCarrinho = function() {
    const carrinho = document.getElementById('carrinho');
    if (carrinho) {
        carrinho.classList.toggle('translate-x-full');
    }
}

class CarrinhoManager {
    constructor() {
        this.items = [];
        this.loadFromStorage();
        this.atualizarCarrinhoUI();
    }

    async adicionarItem(produtoId, cor, quantidade = 1, variacoesSelecionadas = null) {
        try {
            const feedbackElement = this.criarFeedbackElement('Adicionando ao carrinho...');

            const { data: produtoDb, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('id', produtoId)
                .single();

            let produto = produtoDb;
            if (error || !produto) {
                if (error) console.warn('Erro ao buscar produto no carrinho, usando mock:', error.message);
                produto = MOCK_PRODUTOS.find(p => String(p.id) === String(produtoId)) || null;
            }

            if (!produto) {
                alert('Produto não encontrado.');
                feedbackElement.remove();
                return false;
            }

            quantidade = Math.max(1, Math.floor(Number(quantidade) || 1));
            const estoqueDisponivel = Math.max(0, Number(produto.estoque) || 0);

            const variacoesProduto = getProdutoVariacoes(produto);
            const variacoes = variacoesSelecionadas || (cor ? { cor } : {});

            const faltando = variacoesProduto.find(grupo => !variacoes[grupo.campo]);
            if (faltando) {
                feedbackElement.textContent = `Escolha ${faltando.label.toLowerCase()} antes de adicionar ao carrinho.`;
                feedbackElement.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
                setTimeout(() => feedbackElement.remove(), 3000);
                return;
            }

            const variacoesKey = getVariacoesKey(variacoes);
            let itemExistente = this.items.find(item => 
                String(item.id) === String(produtoId) && 
                (item.variacoesKey || getVariacoesKey(item.variacoes || (item.cor ? { cor: item.cor } : {}))) === variacoesKey
            );

            const quantidadeNoCarrinho = itemExistente?.quantidade || 0;
            if (estoqueDisponivel <= 0 || quantidadeNoCarrinho + quantidade > estoqueDisponivel) {
                feedbackElement.textContent = estoqueDisponivel <= 0
                    ? 'Produto sem estoque no momento.'
                    : `Somente ${estoqueDisponivel} unidade(s) disponível(is).`;
                feedbackElement.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
                setTimeout(() => feedbackElement.remove(), 3000);
                return false;
            }

            if (itemExistente) {
                itemExistente.quantidade += quantidade;
            } else {
                // Usa o preço promocional se existir, senão usa o preço normal
                const precoAtual = Number(produto.preco);
                this.items.push({
                    ...produto,
                    cor: variacoes.cor || null,
                    variacoes,
                    variacoesKey,
                    precoAtual,
                    quantidade
                });
            }

            this.saveToStorage();
            this.atualizarCarrinhoUI();

            feedbackElement.textContent = 'Produto adicionado!';
            feedbackElement.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
            setTimeout(() => feedbackElement.remove(), 2000);

            this.abrirCarrinho();
            return true;

        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            alert('Erro ao adicionar produto ao carrinho');
            return false;
        }
    }

    criarFeedbackElement(mensagem) {
        const feedbackElement = document.createElement('div');
        feedbackElement.textContent = mensagem;
        feedbackElement.className = 'fixed top-4 right-4 bg-pink-500 text-white px-4 py-2 rounded-lg z-50';
        document.body.appendChild(feedbackElement);
        return feedbackElement;
    }

    abrirCarrinho() {
        const carrinho = document.getElementById('carrinho');
        if (carrinho) {
            carrinho.classList.remove('translate-x-full');
        }
    }

    atualizarCarrinhoUI() {
        requestAnimationFrame(() => {
            const carrinhoItems = document.getElementById('carrinho-items');
            const carrinhoTotal = document.getElementById('carrinho-total');
            const carrinhoBadge = document.getElementById('carrinho-badge');

            if (!carrinhoItems || !carrinhoTotal || !carrinhoBadge) {
                console.error('Elementos do carrinho não encontrados');
                return;
            }

            if (this.items.length === 0) {
                carrinhoItems.innerHTML = this.renderizarCarrinhoVazio();
            } else {
                carrinhoItems.innerHTML = this.items.map(item => 
                    this.renderizarItemCarrinho(item)
                ).join('');
            }

            this.atualizarTotal(carrinhoTotal);
            this.atualizarBadge(carrinhoBadge);
        });
    }

    renderizarCarrinhoVazio() {
        return `
            <div class="flex flex-col items-center justify-center h-full p-6 text-gray-500">
                <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
    }

    renderizarItemCarrinho(item) {
        const itemId = getItemCarrinhoKey(item);
        const variacoes = item.variacoes || (item.cor ? { cor: item.cor } : {});
        const variacoesParam = encodeURIComponent(JSON.stringify(variacoes));
        return `
            <div class="flex items-center gap-4 p-4 border-b border-gray-100" id="item-${itemId}">
                <img src="${getProdutoImagem(item)}"
                     alt="${escapeHtml(item.nome)}"
                     class="w-20 h-20 object-cover rounded-lg">
                
                <div class="flex-1">
                    <h3 class="font-medium text-gray-800">${escapeHtml(item.nome)}</h3>
                    ${formatarVariacoesItem(item).map(linha => `<p class="text-sm text-gray-500">${escapeHtml(linha)}</p>`).join('')}
                    <div class="text-pink-500 font-semibold">
                        R$ ${(item.precoAtual * item.quantidade).toFixed(2)}
                    </div>

                    <div class="flex items-center justify-center gap-4 mt-2">
                        <button onclick="window.carrinhoManager.atualizarQuantidade('${item.id}', -1, '${variacoesParam}')"
                                class="text-gray-600 text-lg font-medium">
                            -
                        </button>
                        <span id="quantidade-${itemId}" 
                              class="text-gray-600 text-lg font-medium">
                            ${item.quantidade}
                        </span>
                        <button onclick="window.carrinhoManager.atualizarQuantidade('${item.id}', 1, '${variacoesParam}')"
                                class="text-gray-600 text-lg font-medium">
                            +
                        </button>
                    </div>
                </div>
                
                <button onclick="window.carrinhoManager.removerItem('${item.id}', '${variacoesParam}')"
                        class="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        `;
    }

    atualizarTotal(carrinhoTotal) {
        const total = this.items.reduce((sum, item) => {
            return sum + (item.precoAtual * item.quantidade);
        }, 0);
        carrinhoTotal.textContent = `R$ ${total.toFixed(2)}`;
    }

    atualizarBadge(carrinhoBadge) {
        const quantidadeTotal = this.items.reduce((sum, item) => sum + item.quantidade, 0);
        carrinhoBadge.textContent = quantidadeTotal;
        carrinhoBadge.classList.toggle('hidden', quantidadeTotal === 0);
    }

    loadFromStorage() {
        const saved = localStorage.getItem('carrinho');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                console.error('Erro ao carregar carrinho do localStorage:', e);
                this.items = [];
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('carrinho', JSON.stringify(this.items));
    }

    parseVariacoesParam(variacoesParam) {
        if (!variacoesParam || variacoesParam === 'null') return {};
        try {
            return JSON.parse(decodeURIComponent(variacoesParam));
        } catch (_) {
            return {};
        }
    }

    removerItem(produtoId, variacoesParam) {
        const variacoesKey = getVariacoesKey(this.parseVariacoesParam(variacoesParam));
        this.items = this.items.filter(item => {
            const idMatch = String(item.id) === String(produtoId);
            const itemKey = item.variacoesKey || getVariacoesKey(item.variacoes || (item.cor ? { cor: item.cor } : {}));
            return !(idMatch && itemKey === variacoesKey);
        });
        this.saveToStorage();
        this.atualizarCarrinhoUI();
    }

    async atualizarQuantidade(produtoId, delta, variacoesParam) {
        try {
            const variacoesKey = getVariacoesKey(this.parseVariacoesParam(variacoesParam));
            const item = this.items.find(item => {
                const idMatch = String(item.id) === String(produtoId);
                const itemKey = item.variacoesKey || getVariacoesKey(item.variacoes || (item.cor ? { cor: item.cor } : {}));
                return idMatch && itemKey === variacoesKey;
            });
            
            
            if (item) {
                const novaQuantidade = Math.max(1, item.quantidade + delta);
                if (novaQuantidade <= 0) {
                    await this.removerItem(produtoId, variacoesParam);
                } else {
                    item.quantidade = novaQuantidade;
                    this.saveToStorage();
                    this.atualizarCarrinhoUI();
                }
            } else {
                console.error('Item não encontrado:', { produtoId, variacoesKey });
            }
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
        }
    }

    limparCarrinho() {
        this.items = [];
        this.saveToStorage();
        this.atualizarCarrinhoUI();
    }

    calcularTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.precoAtual * item.quantidade);
        }, 0);
    }
}

function garantirModalVariacoesProduto() {
    let modal = document.getElementById('modal-variacoes-produto');
    if (modal) return modal;

    const html = `
        <div id="modal-variacoes-produto" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-[90] px-4">
            <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Escolha a opcao</h3>
                        <p class="text-xs text-gray-500">Selecione as variacoes antes de adicionar ao carrinho.</p>
                    </div>
                    <button type="button" onclick="fecharEscolhaProduto()" class="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500">
                        <span class="text-xl leading-none">&times;</span>
                    </button>
                </div>
                <div id="modal-variacoes-conteudo" class="p-5 space-y-4"></div>
                <div class="px-5 py-4 border-t border-gray-100 flex gap-3">
                    <button type="button" onclick="fecharEscolhaProduto()" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Cancelar
                    </button>
                    <button type="button" onclick="confirmarEscolhaProduto()" class="flex-1 bg-pink-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-pink-600 transition-colors">
                        Adicionar
                    </button>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    return document.getElementById('modal-variacoes-produto');
}

window.abrirEscolhaProduto = async function(produtoId, quantidade = 1) {
    try {
        const { data: produtoDb, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', produtoId)
            .single();

        let produto = produtoDb;
        if (error || !produto) {
            if (error) console.warn('Erro ao buscar produto para variação, usando mock:', error.message);
            produto = MOCK_PRODUTOS.find(p => String(p.id) === String(produtoId)) || null;
        }

        if (!produto) {
            alert('Produto não encontrado.');
            return;
        }

        const grupos = getProdutoVariacoes(produto);
        if (!grupos.length) {
            await window.carrinhoManager.adicionarItem(produtoId, null, quantidade, {});
            return;
        }

        window.produtoVariacaoAtual = {
            produtoId,
            quantidade,
            selecionadas: {},
            grupos,
        };

        const conteudo = document.getElementById('modal-variacoes-conteudo') || garantirModalVariacoesProduto().querySelector('#modal-variacoes-conteudo');
        conteudo.innerHTML = `
            <div class="flex gap-3 items-center pb-2">
                <img src="${getProdutoImagem(produto)}" alt="${escapeHtml(produto.nome)}" class="w-16 h-16 rounded-xl object-cover bg-pink-50">
                <div class="min-w-0">
                    <p class="font-bold text-gray-900 leading-tight">${escapeHtml(produto.nome)}</p>
                    <p class="text-sm font-semibold text-pink-500">${formatarMoeda(produto.preco)}</p>
                </div>
            </div>
            ${grupos.map(grupo => `
                <div class="space-y-2" data-grupo="${grupo.campo}">
                    <p class="text-sm font-semibold text-gray-700">${grupo.label}</p>
                    <div class="flex flex-wrap gap-2">
                        ${grupo.opcoes.map(opcao => `
                            <button type="button"
                                    onclick="selecionarVariacaoProduto('${grupo.campo}', '${encodeURIComponent(opcao)}')"
                                    class="variation-choice px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:border-pink-300 hover:bg-pink-50 transition-colors"
                                    data-campo="${grupo.campo}"
                                    data-valor="${encodeURIComponent(opcao)}">
                                ${escapeHtml(opcao)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            <p id="variacoes-produto-alerta" class="hidden text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2"></p>
        `;

        const modal = garantirModalVariacoesProduto();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } catch (error) {
        console.error('Erro ao abrir escolha de produto:', error);
        alert('Erro ao carregar opcoes do produto.');
    }
};

window.selecionarVariacaoProduto = function(campo, valorCodificado) {
    const valor = decodeURIComponent(valorCodificado);
    if (!window.produtoVariacaoAtual) return;
    window.produtoVariacaoAtual.selecionadas[campo] = valor;

    document.querySelectorAll(`.variation-choice[data-campo="${campo}"]`).forEach(btn => {
        btn.classList.remove('bg-pink-500', 'text-white', 'border-pink-500');
        btn.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
    });

    const selecionado = document.querySelector(`.variation-choice[data-campo="${campo}"][data-valor="${valorCodificado}"]`);
    if (selecionado) {
        selecionado.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
        selecionado.classList.add('bg-pink-500', 'text-white', 'border-pink-500');
    }

    document.getElementById('variacoes-produto-alerta')?.classList.add('hidden');
};

window.confirmarEscolhaProduto = async function() {
    const estado = window.produtoVariacaoAtual;
    if (!estado) return;

    const faltando = estado.grupos.find(grupo => !estado.selecionadas[grupo.campo]);
    if (faltando) {
        const alerta = document.getElementById('variacoes-produto-alerta');
        if (alerta) {
            alerta.textContent = `Escolha ${faltando.label.toLowerCase()} para continuar.`;
            alerta.classList.remove('hidden');
        }
        return;
    }

    await window.carrinhoManager.adicionarItem(
        estado.produtoId,
        estado.selecionadas.cor || null,
        estado.quantidade,
        estado.selecionadas
    );
    window.fecharEscolhaProduto();
};

window.fecharEscolhaProduto = function() {
    const modal = document.getElementById('modal-variacoes-produto');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    window.produtoVariacaoAtual = null;
};

window.finalizarCompra = async function() {
    try {
        if (window.carrinhoManager.items.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        // Verificar se o usuário está logado
        if (typeof window.verificarAuthParaCheckout === 'function') {
            const logado = await window.verificarAuthParaCheckout();
            if (!logado) {
                if (typeof window.mostrarModalLoginRequired === 'function') {
                    window.mostrarModalLoginRequired();
                } else {
                    window.location.href = 'login.html?redirect=index.html';
                }
                return;
            }
        }

        const mpConfig = await getMercadoPagoConfig();
        const onlineDisponivel = !!mpConfig.canUseOnlinePayments;

        // Remove qualquer modal existente antes de criar um novo
        fecharModalPagamento();
        
        const modalHTML = `
            <div id="payment-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 class="text-xl font-semibold mb-4">Escolha a forma de pagamento</h3>
                    <div class="space-y-4">
                        ${!onlineDisponivel ? `
                            <div class="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                                ${mpConfig.message || 'Cartao indisponivel no momento. Pix e dinheiro seguem pelo WhatsApp.'}
                            </div>
                        ` : ''}
                        <div class="space-y-2">
                            <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pagamento" value="Cartao de Credito" class="h-4 w-4 text-pink-500" ${onlineDisponivel ? 'checked' : 'disabled'}>
                                <span>
                                    <strong class="block">Cartao de credito</strong>
                                    <small class="text-gray-500">Pagamento online seguro pelo Mercado Pago</small>
                                </span>
                            </label>

                            <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pagamento" value="Cartao de Debito" class="h-4 w-4 text-pink-500" ${onlineDisponivel ? '' : 'disabled'}>
                                <span>
                                    <strong class="block">Cartao de debito</strong>
                                    <small class="text-gray-500">Pagamento online seguro pelo Mercado Pago</small>
                                </span>
                            </label>
                            
                            <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pagamento" value="PIX" class="h-4 w-4 text-pink-500" ${onlineDisponivel ? '' : 'checked'}>
                                <span>
                                    <strong class="block">PIX</strong>
                                    <small class="text-gray-500">Enviar pedido para a loja pelo WhatsApp</small>
                                </span>
                            </label>

                            <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pagamento" value="Dinheiro" class="h-4 w-4 text-pink-500">
                                <span>
                                    <strong class="block">Dinheiro</strong>
                                    <small class="text-gray-500">Enviar pedido para a loja pelo WhatsApp</small>
                                </span>
                            </label>
                        </div>
                        
                        <div class="flex space-x-4 mt-6">
                            <button type="button" 
                                    onclick="fecharModalPagamento()" 
                                    class="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="button" 
                                    onclick="confirmarPagamento()" 
                                    class="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adiciona o modal ao body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

    } catch (error) {
        console.error('Erro ao abrir modal de pagamento:', error);
        alert('Erro ao abrir opções de pagamento. Por favor, tente novamente.');
    }
}

function fecharModalPagamento() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.remove();
    }
}

function mostrarModalPix(pix) {
    const qrImg = pix.qr_code_base64 ? `data:image/png;base64,${pix.qr_code_base64}` : '';
    const modalHTML = `
        <div id="pix-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-5 max-w-md w-full mx-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-800">Pague com Pix</h3>
                    <button onclick="fecharModalPix()" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                </div>
                <p class="text-sm text-gray-500 mb-4">Escaneie o QR Code no app do seu banco ou copie o código Pix.</p>
                ${qrImg ? `<img src="${qrImg}" alt="QR Code Pix" class="w-56 h-56 mx-auto border rounded-xl p-2 mb-4">` : ''}
                <label class="block text-xs font-semibold text-gray-500 mb-1">Pix copia e cola</label>
                <textarea id="pix-copia-cola" readonly class="w-full h-24 border rounded-xl p-3 text-xs text-gray-600">${pix.qr_code || ''}</textarea>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    <button onclick="copiarCodigoPix()" class="px-4 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 font-semibold text-sm">
                        Copiar código Pix
                    </button>
                    <button onclick="verificarPagamentoPix('${pix.payment_id}')" class="px-4 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 font-semibold text-sm">
                        Já paguei
                    </button>
                </div>
                ${pix.ticket_url ? `<a href="${pix.ticket_url}" target="_blank" class="block text-center mt-3 text-sm text-pink-500 hover:underline">Abrir página do Pix</a>` : ''}
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.fecharModalPix = function() {
    document.getElementById('pix-modal')?.remove();
};

window.copiarCodigoPix = async function() {
    const campo = document.getElementById('pix-copia-cola');
    if (!campo?.value) return;
    await navigator.clipboard.writeText(campo.value);
    alert('Código Pix copiado.');
};

window.verificarPagamentoPix = async function(paymentId) {
    try {
        const response = await fetchApi(`/api/mercadopago/retorno?payment_id=${encodeURIComponent(paymentId)}`);
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.erro || 'Erro ao verificar pagamento.');
        }

        if (!result.approved) {
            alert('Pagamento ainda não aprovado. Aguarde alguns instantes e tente novamente.');
            return;
        }

        window.carrinhoManager.limparCarrinho();
        fecharModalPix();
        direcionarWhatsapp(result.whatsappLink);
    } catch (error) {
        console.error('Erro ao verificar Pix:', error);
        alert(error.message || 'Erro ao verificar pagamento Pix.');
    }
};

async function confirmarPagamento() {
    let whatsappWindow = null;
    let whatsappDirecionado = false;
    try {
        const selectedPayment = document.querySelector('input[name="pagamento"]:checked');

        if (!selectedPayment) {
            alert('Por favor, selecione uma forma de pagamento');
            return;
        }

        const cartItems = window.carrinhoManager.items;
        const totalPedido = window.carrinhoManager.calcularTotal();
        const mensagemFallback = criarMensagemPedido(cartItems, selectedPayment.value, totalPedido);
        const whatsappFallbackLink = criarWhatsappWebLink(mensagemFallback);
        whatsappWindow = window.open('', '_blank');
        const mpConfig = await getMercadoPagoConfig();

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            direcionarWhatsapp(whatsappFallbackLink, whatsappWindow);
            whatsappDirecionado = true;
            throw new Error('Faça login novamente para registrar a compra. O pedido foi aberto no WhatsApp.');
        }

        if (['Cartao de Credito', 'Cartao de Debito'].includes(selectedPayment.value) && !mpConfig.canUseOnlinePayments) {
            const modal = document.getElementById('payment-modal');
            if (modal) modal.remove();
            if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
            whatsappWindow = null;
            throw new Error(mpConfig.message || 'Cartao indisponivel no momento.');
        }

        if (['Cartao de Credito', 'Cartao de Debito'].includes(selectedPayment.value)) {
            if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
            whatsappWindow = null;

            const response = await fetchApi('/api/mercadopago/preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    payment_type: selectedPayment.value === 'Cartao de Debito' ? 'debit_card' : 'credit_card',
                    itens: cartItems.map(item => ({
                        produto_id: item.id,
                        quantidade: item.quantidade,
                        cor: formatarVariacoesPedido(item),
                    })),
                }),
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result.erro || 'Erro ao iniciar pagamento com Mercado Pago.');
            }

            localStorage.setItem('mp_venda_pendente', result.venda_id || '');
            localStorage.setItem('mp_pedido_whatsapp_fallback', whatsappFallbackLink);

            const modal = document.getElementById('payment-modal');
            if (modal) modal.remove();

            window.location.href = result.checkout_url;
            return;
        }

        const response = await fetchApi('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                forma_pagamento: selectedPayment.value,
                itens: cartItems.map(item => ({
                    produto_id: item.id,
                    quantidade: item.quantidade,
                    cor: formatarVariacoesPedido(item),
                })),
            }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            console.error('Checkout API falhou:', result);
            direcionarWhatsapp(result.whatsappLink || whatsappFallbackLink, whatsappWindow);
            whatsappDirecionado = true;
            window.carrinhoManager.limparCarrinho();
            const modal = document.getElementById('payment-modal');
            if (modal) modal.remove();
            alert('Nao foi possivel registrar a compra automaticamente, mas seu pedido foi aberto no WhatsApp.');
            return;
        }

        const modal = document.getElementById('payment-modal');
        if (modal) modal.remove();

        window.carrinhoManager.limparCarrinho();
        const abriuNovaAba = direcionarWhatsapp(result.whatsappLink || whatsappFallbackLink, whatsappWindow);
        whatsappDirecionado = true;
        if (abriuNovaAba) location.reload();

    } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
        if (!whatsappDirecionado && whatsappWindow && !whatsappWindow.closed) {
            whatsappWindow.close();
        }
        if (whatsappDirecionado) return;
        alert(error.message || 'Erro ao processar pagamento. Por favor, tente novamente.');
    }
}
// Funções globais de pagamento
window.confirmarPagamento = confirmarPagamento;
window.fecharModalPagamento = fecharModalPagamento;


// Funções de produtos
let allProducts = []; // Armazena todos os produtos carregados
let catalogoCategorias = [];
let catalogoSubcategorias = [];
let categoriaCatalogoAtiva = null;
let subcategoriaCatalogoAtiva = 'todos';

function escapeJsInline(value) {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/[\r\n]+/g, ' ');
}

function atualizarCabecalhoCatalogo(eyebrow, titulo, descricao) {
    const eyebrowElement = document.getElementById('catalogo-eyebrow');
    const tituloElement = document.getElementById('catalogo-titulo');
    const descricaoElement = document.getElementById('catalogo-descricao');
    if (eyebrowElement) eyebrowElement.textContent = eyebrow;
    if (tituloElement) tituloElement.textContent = titulo;
    if (descricaoElement) descricaoElement.textContent = descricao;
}

function getCategoriaImagem(categoria) {
    const imagemPropria = categoria?.imagem || categoria?.url_imagem || categoria?.imagem_url || categoria?.capa;
    if (imagemPropria) return imagemPropria;

    const produtoRepresentativo = allProducts.find(produto =>
        String(produto.categoria_id) === String(categoria.id)
    );
    return produtoRepresentativo ? getProdutoImagem(produtoRepresentativo) : DEFAULT_IMAGE;
}

function renderizarCardCategoria(categoria) {
    const categoriaId = escapeJsInline(categoria.id);
    const nomeCategoria = escapeHtml(categoria.nome || 'Categoria');
    const produtosDaCategoria = allProducts.filter(produto =>
        String(produto.categoria_id) === String(categoria.id)
    );
    const subcategoriasDaCategoria = catalogoSubcategorias.filter(subcategoria =>
        String(subcategoria.categoria_id) === String(categoria.id)
    );
    const totalProdutos = produtosDaCategoria.length;
    const resumo = totalProdutos === 1 ? '1 produto' : `${totalProdutos} produtos`;
    const complemento = subcategoriasDaCategoria.length
        ? `${subcategoriasDaCategoria.length} opções para filtrar`
        : 'Veja toda a seleção';

    return `
        <article class="catalog-category-card"
                 tabindex="0"
                 role="link"
                 onclick="abrirCategoriaPeloCard(event, '${categoriaId}')"
                 onkeydown="abrirCategoriaPeloCard(event, '${categoriaId}')"
                 aria-label="Ver produtos da categoria ${nomeCategoria}">
            <div class="catalog-category-media">
                <img src="${escapeHtml(getCategoriaImagem(categoria))}"
                     alt="Categoria ${nomeCategoria}"
                     onerror="this.src='${DEFAULT_IMAGE}'"
                     loading="lazy"
                     decoding="async">
                <span>${escapeHtml(resumo)}</span>
            </div>
            <div class="catalog-category-info">
                <div>
                    <h3>${nomeCategoria}</h3>
                    <p>${escapeHtml(complemento)}</p>
                </div>
                <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
            </div>
        </article>
    `;
}

function mostrarPainelCategorias({ scroll = false } = {}) {
    categoriaCatalogoAtiva = null;
    subcategoriaCatalogoAtiva = 'todos';

    const filtrosContainer = document.getElementById('categorias-buttons');
    const produtosContainer = document.getElementById('produtos-container');
    if (!produtosContainer) return;

    atualizarCabecalhoCatalogo(
        'Escolha seu universo',
        'Compre por categoria',
        'Encontre sua categoria e descubra todos os produtos selecionados para você.'
    );

    if (filtrosContainer) filtrosContainer.innerHTML = '';
    produtosContainer.classList.add('category-cards-grid');
    produtosContainer.innerHTML = catalogoCategorias.length
        ? catalogoCategorias.map(renderizarCardCategoria).join('')
        : '<div class="catalog-empty-state"><p>Nenhuma categoria disponível no momento.</p></div>';

    if (scroll) {
        document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderizarFiltrosSubcategorias(categoria, subcategoriaSelecionada = 'todos') {
    const filtrosContainer = document.getElementById('categorias-buttons');
    if (!filtrosContainer) return;

    const subcategorias = catalogoSubcategorias.filter(subcategoria =>
        String(subcategoria.categoria_id) === String(categoria.id)
    );

    const filtros = subcategorias.map(subcategoria => {
        const subcategoriaId = escapeJsInline(subcategoria.id);
        const ativa = String(subcategoria.id) === String(subcategoriaSelecionada);
        return `
            <button type="button"
                    class="catalog-filter-chip ${ativa ? 'active' : ''}"
                    onclick="filtrarPainelSubcategoria(event, '${subcategoriaId}')">
                ${escapeHtml(subcategoria.nome)}
            </button>`;
    }).join('');

    filtrosContainer.innerHTML = `
        <div class="catalog-panel-nav">
            <button type="button" class="catalog-back-button" onclick="mostrarPainelCategorias({ scroll: true })">
                <i class="bi bi-arrow-left" aria-hidden="true"></i>
                Todas as categorias
            </button>
            <div class="catalog-subcategory-filters" role="group" aria-label="Filtrar por subcategoria">
                <button type="button"
                        class="catalog-filter-chip ${subcategoriaSelecionada === 'todos' ? 'active' : ''}"
                        onclick="filtrarPainelSubcategoria(event, 'todos')">
                    Todos
                </button>
                ${filtros}
            </div>
        </div>
    `;
}

async function abrirPainelCategoria(categoriaId, subcategoriaId = 'todos', { scroll = true } = {}) {
    const categoria = catalogoCategorias.find(item => String(item.id) === String(categoriaId));
    if (!categoria) return;

    categoriaCatalogoAtiva = categoria.id;
    subcategoriaCatalogoAtiva = subcategoriaId;

    const produtosContainer = document.getElementById('produtos-container');
    if (!produtosContainer) return;

    const produtosDaCategoria = allProducts.filter(produto =>
        String(produto.categoria_id) === String(categoria.id)
    );
    const produtosFiltrados = subcategoriaId === 'todos'
        ? produtosDaCategoria
        : produtosDaCategoria.filter(produto =>
            String(produto.subcategoria_id) === String(subcategoriaId)
        );
    const subcategoria = catalogoSubcategorias.find(item =>
        String(item.id) === String(subcategoriaId)
    );

    atualizarCabecalhoCatalogo(
        subcategoria ? `Categoria ${categoria.nome}` : 'Todos os produtos',
        subcategoria ? subcategoria.nome : categoria.nome,
        subcategoria
            ? `Produtos de ${subcategoria.nome.toLowerCase()} selecionados para você.`
            : `Explore todos os produtos da categoria ${categoria.nome}.`
    );
    renderizarFiltrosSubcategorias(categoria, subcategoriaId);

    produtosContainer.classList.remove('category-cards-grid');
    mostrarSkeletonProdutos(produtosContainer, Math.min(Math.max(produtosFiltrados.length, 4), 8));
    produtosContainer.innerHTML = produtosFiltrados.length
        ? produtosFiltrados.map(renderizarProduto).join('')
        : `<div class="catalog-empty-state"><p>Nenhum produto encontrado${subcategoria ? ' nesta subcategoria' : ' nesta categoria'}.</p></div>`;

    closeAllSubmenus();
    if (scroll) {
        document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function abrirCategoriaPeloCard(event, categoriaId) {
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (event.type === 'keydown') event.preventDefault();
    abrirPainelCategoria(categoriaId);
}

function filtrarPainelSubcategoria(event, subcategoriaId) {
    event?.preventDefault();
    event?.stopPropagation();
    if (categoriaCatalogoAtiva === null) return;
    abrirPainelCategoria(categoriaCatalogoAtiva, subcategoriaId, { scroll: false });
}

window.mostrarPainelCategorias = mostrarPainelCategorias;
window.abrirPainelCategoria = abrirPainelCategoria;
window.abrirCategoriaPeloCard = abrirCategoriaPeloCard;
window.filtrarPainelSubcategoria = filtrarPainelSubcategoria;

// Função para carregar todos os produtos inicialmente
async function loadAllProducts() {
    const { data: produtos, error } = await supabase.from('produtos').select('*');
    if (error) {
        console.error('Erro ao carregar produtos:', error);
        return;
    }
    allProducts = produtos; // Armazena todos os produtos
}

// Função auxiliar para remover acentos e caracteres especiais
function normalizeText(text) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s]/g, ''); // Remove caracteres especiais
}

// Atualizar a função de pesquisa
async function filterProductsBySearchTerm(searchTerm) {
    try {
        if (!searchTerm.trim()) return;

        const normalizedSearchTerm = normalizeText(searchTerm);

        // Buscar todos os produtos e filtrar no cliente
        const { data, error } = await supabase
            .from('produtos')
            .select('*');

        if (error) {
            console.warn('Erro ao buscar produtos para pesquisa, usando mock:', error.message);
        }

        const produtos = fallbackProdutos(data);
        allProducts = produtos;

        const produtosContainer = document.getElementById('produtos-container');

        if (!produtosContainer) {
            console.error('Container de produtos não encontrado');
            return;
        }

        categoriaCatalogoAtiva = null;
        subcategoriaCatalogoAtiva = 'todos';
        produtosContainer.classList.remove('category-cards-grid');
        atualizarCabecalhoCatalogo(
            'Resultados da busca',
            `Busca por “${searchTerm}”`,
            'Confira os produtos encontrados em todas as categorias.'
        );
        const filtrosContainer = document.getElementById('categorias-buttons');
        if (filtrosContainer) {
            filtrosContainer.innerHTML = `
                <div class="catalog-panel-nav">
                    <button type="button" class="catalog-back-button" onclick="mostrarPainelCategorias({ scroll: true })">
                        <i class="bi bi-arrow-left" aria-hidden="true"></i>
                        Todas as categorias
                    </button>
                </div>`;
        }

        mostrarSkeletonProdutos(produtosContainer, 8);

        // Filtra os produtos localmente
        const produtosFiltrados = produtos.filter(produto => {
            const normalizedNome = normalizeText(produto.nome);
            const normalizedDescricao = produto.descricao ? normalizeText(produto.descricao) : '';
            
            return normalizedNome.includes(normalizedSearchTerm) || 
                   normalizedDescricao.includes(normalizedSearchTerm);
        });

        if (produtosFiltrados.length > 0) {
            produtosContainer.innerHTML = produtosFiltrados.map(renderizarProduto).join('');

            // Rolar suavemente até a seção de produtos
            document.getElementById('produtos').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Nenhum produto encontrado para "${searchTerm}"</p>
                    <p class="text-gray-400 mt-2">Tente usar palavras diferentes ou verifique a ortografia.</p>
                </div>
            `;
        }

        // Limpar o campo de pesquisa e esconder o botão
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        if (searchInput) searchInput.value = '';
        if (searchButton) searchButton.classList.add('hidden');

    } catch (error) {
        console.error('Erro ao pesquisar produtos:', error);
        const produtosContainer = document.getElementById('produtos-container');
        if (produtosContainer) {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-red-500">
                    <p>Erro ao realizar a busca. Por favor, tente novamente.</p>
                </div>
            `;
        }
    }
}

async function carregarProdutos(categoriaNome = 'todos') {
    try {
        const produtosContainer = document.getElementById('produtos-container');
        
        if (!produtosContainer) {
            console.error('Container de produtos não encontrado');
            return;
        }

        let query = supabase
            .from('produtos')
            .select('*');

        const { data, error } = await query;
        
        if (error) {
            console.warn('Erro ao buscar produtos, usando mock:', error.message);
        }

        const produtos = fallbackProdutos(data);
        allProducts = produtos;

        mostrarSkeletonProdutos(produtosContainer, 8);
        
        if (!produtos || produtos.length === 0) {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Nenhum produto encontrado.</p>
                </div>
            `;
            return;
        }
        
        produtosContainer.innerHTML = produtos.map(renderizarProduto).join('');

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        if (produtosContainer) {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-red-500">
                    Erro ao carregar produtos. Por favor, tente novamente mais tarde.
                </div>
            `;
        }
    }
}

// Função para renderizar um produto
// Skeleton screens: esqueletos de produto exibidos durante o carregamento assíncrono
function renderSkeletonProdutos(count = 8) {
    return Array.from({ length: count }, () => `
        <div class="skeleton-card" aria-hidden="true">
            <div class="skeleton-media"></div>
            <div class="skeleton-body">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-desc"></div>
                <div class="skeleton-line skeleton-desc short"></div>
                <div class="skeleton-buy">
                    <div class="skeleton-line skeleton-price"></div>
                    <div class="skeleton-btn"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function mostrarSkeletonProdutos(container, count = 8) {
    if (!container) return;
    container.innerHTML = renderSkeletonProdutos(count);
}

// Retorna produtos de demonstração quando o banco está indisponível ou vazio
function fallbackProdutos(data) {
    if (Array.isArray(data) && data.length > 0) return data;
    return MOCK_PRODUTOS.map(p => ({ ...p }));
}

function fallbackCategorias(data) {
    if (Array.isArray(data) && data.length > 0) return data;
    return MOCK_CATEGORIAS.map(c => ({ ...c }));
}

function fallbackSubcategorias(data) {
    if (Array.isArray(data) && data.length > 0) return data;
    return MOCK_SUBCATEGORIAS.map(s => ({ ...s }));
}

function renderSkeletonDestaque() {
    return `
        <div class="w-full flex-shrink-0" aria-hidden="true">
            <div class="mx-4">
                <div class="skeleton-card skeleton-destaque">
                    <div class="skeleton-media"></div>
                    <div class="skeleton-body">
                        <div class="skeleton-line skeleton-title" style="width: 40%"></div>
                        <div class="skeleton-line skeleton-desc"></div>
                        <div class="skeleton-line skeleton-desc short"></div>
                        <div class="skeleton-buy">
                            <div class="skeleton-line skeleton-price"></div>
                            <div class="skeleton-btn" style="width: 120px"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function mostrarSkeletonDestaque(container) {
    if (!container) return;
    container.innerHTML = renderSkeletonDestaque();
}

function renderizarProduto(produto) {
    const temDesconto = !!produto.em_promocao;
    const valorOriginal = produto.preco_original ? Number(produto.preco_original).toFixed(2) : '0.00';
    const valorPromocional = Number(produto.preco).toFixed(2);
    const valorFinal = temDesconto ? valorPromocional : Number(produto.preco).toFixed(2);
    const esgotado = produto.estoque !== undefined && produto.estoque !== null && Number(produto.estoque) <= 0;
    const nomeProduto = escapeHtml(produto.nome || 'Produto sem nome');
    const categoriaProduto = escapeHtml(produto.categoria?.nome || 'Sem categoria');
    const descricaoProduto = escapeHtml(produto.descricao || 'Conheça todos os detalhes deste produto.');

    return `
        <article class="product-card ${esgotado ? 'is-sold-out' : ''}"
                 tabindex="0"
                 onclick="abrirProdutoPeloCard(event, '${produto.id}')"
                 onkeydown="abrirProdutoPeloCard(event, '${produto.id}')"
                 aria-label="Ver detalhes de ${nomeProduto}">
            <button class="product-quick-view" onclick="abrirDetalheProduto('${produto.id}')" aria-label="Ver detalhes de ${nomeProduto}">
                <i class="bi bi-eye"></i>
            </button>
            <div class="product-media">
                <img src="${getProdutoImagem(produto)}"
                     alt="${nomeProduto}"
                     onerror="this.src='${DEFAULT_IMAGE}'"
                     loading="lazy"
                     decoding="async"
                     fetchpriority="low"
                     class="${esgotado ? 'grayscale' : ''}">

                ${esgotado ? `
                    <div class="sold-out-overlay"><span>Esgotado</span></div>
                ` : temDesconto ? `
                    <span class="product-badge">Oferta</span>
                ` : ''}
            </div>

            <div class="product-info">
                <div class="product-category">
                    ${categoriaProduto}
                </div>

                <h3 class="product-title">
                    ${nomeProduto}
                </h3>

                <p class="product-card-description">${descricaoProduto}</p>

                <div class="product-buy-row">
                    <div class="product-price">
                        ${temDesconto ? `
                            <del>R$ ${valorOriginal}</del>
                            <strong>R$ ${valorFinal}</strong>
                        ` : `
                            <strong>R$ ${valorFinal}</strong>
                        `}
                        <small>ou via Pix</small>
                    </div>
                    ${esgotado ? `
                        <button class="product-cart-button" disabled aria-label="Produto esgotado"><i class="bi bi-bag-x"></i><span>Esgotado</span></button>
                    ` : `
                        <button onclick="abrirEscolhaProduto('${produto.id}')" class="product-cart-button" aria-label="Adicionar ${nomeProduto} ao carrinho">
                            <i class="bi bi-bag-plus"></i><span>Adicionar ao carrinho</span>
                        </button>
                    `}
                </div>
            </div>
        </article>
    `;
}

function abrirProdutoPeloCard(event, produtoId) {
    if (event.target.closest('button')) return;
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (event.type === 'keydown') event.preventDefault();
    abrirDetalheProduto(produtoId);
}

window.abrirProdutoPeloCard = abrirProdutoPeloCard;

// Adicione este código ao seu script.js

// Configuração do slider
let currentSlide = 0;
const slider = document.getElementById('slider');
const slides = slider ? slider.children.length : 0;

function updateSlider() {
    if (!slider || slides === 0) return;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.hero-pagination button').forEach((button, index) => {
        button.classList.toggle('active', index === currentSlide);
        button.setAttribute('aria-current', index === currentSlide ? 'true' : 'false');
    });
}

function nextSlide() {
    if (slides === 0) return;
    currentSlide = (currentSlide + 1) % slides;
    updateSlider();
}

function prevSlide() {
    if (slides === 0) return;
    currentSlide = (currentSlide - 1 + slides) % slides;
    updateSlider();
}

function goToSlide(index) {
    if (slides === 0 || index < 0 || index >= slides) return;
    currentSlide = index;
    updateSlider();
}

window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;

let currentAnnouncement = 0;
const announcementTrack = document.getElementById('announcement-track');
const announcements = announcementTrack ? Array.from(announcementTrack.children) : [];
const ANNOUNCEMENTS_VISIBLE = 3;

if (announcementTrack && announcements.length > ANNOUNCEMENTS_VISIBLE) {
    announcements.slice(0, ANNOUNCEMENTS_VISIBLE).forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.dataset.announcementClone = 'true';
        announcementTrack.appendChild(clone);
    });
}

function updateAnnouncement(animate = true) {
    if (!announcementTrack || announcements.length === 0) return;
    if (!animate) announcementTrack.style.transition = 'none';
    announcementTrack.style.transform = `translateX(-${currentAnnouncement * (100 / ANNOUNCEMENTS_VISIBLE)}%)`;
    Array.from(announcementTrack.children).forEach((item, index) => {
        const visivel = index >= currentAnnouncement && index < currentAnnouncement + ANNOUNCEMENTS_VISIBLE;
        item.setAttribute('aria-hidden', visivel ? 'false' : 'true');
    });
    if (!animate) {
        announcementTrack.getBoundingClientRect();
        announcementTrack.style.transition = '';
    }
}

function nextAnnouncement() {
    if (announcements.length === 0) return;
    currentAnnouncement += 1;
    updateAnnouncement();
    if (currentAnnouncement === announcements.length) {
        setTimeout(() => {
            currentAnnouncement = 0;
            updateAnnouncement(false);
        }, 500);
    }
}

window.nextAnnouncement = nextAnnouncement;
updateAnnouncement();

if (announcements.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
        if (!document.hidden) nextAnnouncement();
    }, 3200);
}

window.abrirScoopPremiado = async function() {
    try {
        const { data: produto, error } = await supabase
            .from('produtos')
            .select('id')
            .eq('codigo_barras', SCOOP_PRODUCT_CODE)
            .maybeSingle();

        if (error) throw error;
        if (produto?.id) {
            await abrirDetalheProduto(produto.id);
            return;
        }

        abrirScoopPendente();
    } catch (error) {
        console.error('Erro ao localizar o Scoop Premiado:', error);
        abrirScoopPendente();
    }
};

// Opcional: Adicionar transição automática
if (slides > 1) {
    setInterval(nextSlide, 5000); // Muda slide a cada 5 segundos
}

// Função atualizada para carregar categorias com melhor tratamento de erro
// Renderiza as categorias e subcategorias dentro do menu principal (Shop All)
// Menu curado do cabeçalho: categorias e subcategorias exibidas no dropdown
const MENU_CATEGORIAS = {
    rosto: {
        categoriaId: 1,
        label: 'Rosto',
        itens: [
            { tipo: 'all', label: 'Ver tudo de rosto' },
            { tipo: 'sub', id: 22, label: 'Base Líquida' },
            { tipo: 'sub', id: 2, label: 'Corretivo' },
            { tipo: 'sub', id: 23, label: 'Pó Facial' },
            { tipo: 'sub', id: 3, label: 'Blush' },
            { tipo: 'sub', id: 4, label: 'Contorno' },
            { tipo: 'sub', id: 24, label: 'Bruma Fixadora' },
        ]
    },
    olhos: {
        categoriaId: 2,
        label: 'Olhos',
        itens: [
            { tipo: 'all', label: 'Ver tudo de olhos' },
            { tipo: 'sub', id: 5, label: 'Máscara de Cílios' },
            { tipo: 'sub', id: 25, label: 'Paletas de Sombras' },
            { tipo: 'sub', id: 26, label: 'Sombra e Iluminador' },
            { tipo: 'sub', id: 27, label: 'Marshmallow' },
            { tipo: 'sub', id: 28, label: 'Sombra Líquida e Primer' },
        ]
    },
    labios: {
        categoriaId: 3,
        label: 'Lábios',
        itens: [
            { tipo: 'all', label: 'Ver tudo de lábios' },
            { tipo: 'sub', id: 8, label: 'Batom' },
            { tipo: 'sub', id: 29, label: 'Óleo Labial' },
            { tipo: 'sub', id: 30, label: 'Gloss Plump' },
            { tipo: 'sub', id: 31, label: 'Lapiseira Labial' },
            { tipo: 'sub', id: 9, label: 'Gloss' },
        ]
    }
};

function renderizarMenuPrincipalCategorias() {
    Object.entries(MENU_CATEGORIAS).forEach(([chave, cat]) => {
        const container = document.getElementById(`main-nav-${chave}`);
        if (!container) return;
        container.innerHTML = cat.itens.map(item => {
            if (item.tipo === 'all') {
                return `
                    <button onclick="filterProducts(${cat.categoriaId})"
                        class="block w-full text-left px-4 py-2 text-sm font-semibold text-pink-500 hover:bg-pink-50 transition-colors">
                        ${item.label}
                    </button>
                `;
            }
            return `
                <button onclick="filterProductsBySubcategory(event, ${item.id})"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition-colors">
                    ${item.label}
                </button>
            `;
        }).join('');
    });
}

async function carregarCategorias() {
    try {
        const [categoriasResult, subcategoriasResult, produtosResult] = await Promise.all([
            supabase.from('categorias').select('*'),
            supabase.from('subcategorias').select('*'),
            supabase.from('produtos').select('*')
        ]);

        if (categoriasResult.error) {
            console.warn('Erro ao buscar categorias, usando mock:', categoriasResult.error.message);
        }
        if (subcategoriasResult.error) {
            console.warn('Erro ao buscar subcategorias, usando mock:', subcategoriasResult.error.message);
        }
        if (produtosResult.error) {
            console.warn('Erro ao buscar produtos para as categorias, usando mock:', produtosResult.error.message);
        }

        catalogoCategorias = fallbackCategorias(categoriasResult.data)
            .sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0));
        catalogoSubcategorias = fallbackSubcategorias(subcategoriasResult.data);
        allProducts = fallbackProdutos(produtosResult.data);

        // Os menus continuam levando para o mesmo painel contextual do catálogo.
        renderizarMenuPrincipalCategorias();
        renderizarMobileNavCategorias();
        mostrarPainelCategorias();

    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        catalogoCategorias = fallbackCategorias();
        catalogoSubcategorias = fallbackSubcategorias();
        allProducts = fallbackProdutos();
        if (document.getElementById('produtos-container')) {
            mostrarPainelCategorias();
        }
    }
}

window.toggleMobileNavCat = toggleMobileNavCat;

function toggleMobileNavCat(chave) {
    const panel = document.getElementById(`mobile-nav-${chave}`);
    const arrow = document.getElementById(`mobile-nav-${chave}-arrow`);
    if (!panel) return;
    const isHidden = panel.classList.contains('hidden');
    if (isHidden) {
        panel.classList.remove('hidden');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
        panel.classList.add('hidden');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
}

function renderizarMobileNavCategorias() {
    Object.entries(MENU_CATEGORIAS).forEach(([chave, cat]) => {
        const panel = document.getElementById(`mobile-nav-${chave}`);
        if (!panel) return;
        panel.innerHTML = cat.itens.map(item => {
            if (item.tipo === 'all') {
                return `
                    <button onclick="filterProducts(${cat.categoriaId}); closeMobileMenu();"
                        class="block w-full text-left px-3 py-2 text-sm font-semibold text-pink-500 hover:bg-pink-50 transition-colors rounded-lg">
                        ${item.label}
                    </button>
                `;
            }
            return `
                <button onclick="filterProductsBySubcategory(event, ${item.id}); closeMobileMenu();"
                    class="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition-colors rounded-lg">
                    ${item.label}
                </button>
            `;
        }).join('');
    });
}

// Adicione esta linha para tornar a função global
window.filterProductsBySubcategory = filterProductsBySubcategory;

// Função atualizada para filtrar por subcategoria
async function filterProductsBySubcategory(event, subcategoriaId) {
    event?.preventDefault();
    event?.stopPropagation();

    const subcategoria = catalogoSubcategorias.find(item =>
        String(item.id) === String(subcategoriaId)
    );
    if (!subcategoria) return;

    await abrirPainelCategoria(subcategoria.categoria_id, subcategoria.id);
}

// Funções de abertura/fechamento dos menus de subcategoria e mobile
function moveDropdownToBody(dropdown) {
    if (!dropdown.__originalParent) {
        dropdown.__originalParent = dropdown.parentElement;
        dropdown.__nextSibling = dropdown.nextSibling;
    }

    if (dropdown.parentElement !== document.body) {
        document.body.appendChild(dropdown);
    }
}

function restoreDropdownPosition(dropdown) {
    if (dropdown.__originalParent && dropdown.parentElement !== dropdown.__originalParent) {
        const nextSibling = dropdown.__nextSibling && dropdown.__nextSibling.parentElement === dropdown.__originalParent
            ? dropdown.__nextSibling
            : null;
        dropdown.__originalParent.insertBefore(dropdown, nextSibling);
    }
}

function closeAllSubmenus() {
    document.querySelectorAll('.subcategories-dropdown').forEach(dropdown => {
        dropdown.classList.add('hidden');
        restoreDropdownPosition(dropdown);
        dropdown.style.position = '';
        dropdown.style.top = '';
        dropdown.style.left = '';
        dropdown.style.width = '';
        dropdown.style.maxHeight = '';
        dropdown.style.zIndex = '';
    });
    // Reseta todas as setas para baixo
    document.querySelectorAll('.submenu-arrow').forEach(arrow => {
        arrow.style.transform = 'rotate(0deg)';
    });
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }
}

// Abre um submenu posicionando-o de forma fixa junto ao botão
function abrirSubmenu(button, dropdown) {
    if (!button || !dropdown) return;
    const btnRect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = Math.min(viewportWidth - 16, viewportWidth < 640 ? 260 : 208);
    const viewportMargin = 8;
    const spaceBelow = viewportHeight - btnRect.bottom - viewportMargin;
    const spaceAbove = btnRect.top - viewportMargin;

    let top = btnRect.bottom + 6;
    let left = btnRect.left;
    if (left + dropdownWidth > viewportWidth - viewportMargin) {
        left = viewportWidth - dropdownWidth - viewportMargin;
    }
    if (left < viewportMargin) left = viewportMargin;

    moveDropdownToBody(dropdown);
    dropdown.style.position = 'fixed';
    dropdown.style.top = top + 'px';
    dropdown.style.left = left + 'px';
    dropdown.style.width = dropdownWidth + 'px';
    dropdown.style.maxHeight = Math.max(160, spaceBelow) + 'px';
    dropdown.style.zIndex = '10000';
    dropdown.classList.remove('hidden');

    const dropdownRect = dropdown.getBoundingClientRect();
    if (dropdownRect.bottom > viewportHeight - viewportMargin && spaceAbove > spaceBelow) {
        top = Math.max(viewportMargin, btnRect.top - dropdownRect.height - 6);
        dropdown.style.top = top + 'px';
        dropdown.style.maxHeight = Math.max(160, spaceAbove) + 'px';
    }

    const arrow = button.querySelector('.submenu-arrow');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
}

// Hover no desktop: abre o dropdown ao passar o mouse e fecha ao sair
function setupMainNavHover() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.main-nav-dropdown').forEach(container => {
        const button = container.querySelector('[data-submenu-toggle]');
        const targetId = button ? button.dataset.submenuToggle : null;
        const dropdown = targetId ? document.getElementById(targetId) : null;
        if (!button || !dropdown) return;

        let closeTimer = null;
        const scheduleClose = () => {
            clearTimeout(closeTimer);
            closeTimer = setTimeout(() => closeAllSubmenus(), 180);
        };

        button.addEventListener('mouseenter', () => {
            clearTimeout(closeTimer);
            closeAllSubmenus();
            abrirSubmenu(button, dropdown);
        });
        button.addEventListener('mouseleave', scheduleClose);
        dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimer));
        dropdown.addEventListener('mouseleave', scheduleClose);
    });
}

// Fecha submenus ao rolar a página (necessário com position:fixed)
window.addEventListener('scroll', closeAllSubmenus, { passive: true });
window.addEventListener('resize', closeAllSubmenus, { passive: true });

// Controla abertura/fechamento de submenus e do menu mobile
document.addEventListener('click', function(event) {

    // --- Botão hambúrguer: toggle menu + troca de ícone ---
    const mobileToggle = event.target.closest('#mobile-menu-toggle');
    if (mobileToggle) {
        const mobileMenu = document.getElementById('mobile-menu');
        const iconHamburger = document.getElementById('icon-hamburger');
        const iconClose = document.getElementById('icon-close');
        if (mobileMenu) {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            // Alterna ícones
            if (iconHamburger && iconClose) {
                if (isHidden) {
                    iconHamburger.classList.add('hidden');
                    iconClose.classList.remove('hidden');
                } else {
                    iconHamburger.classList.remove('hidden');
                    iconClose.classList.add('hidden');
                }
            }
        }
        return;
    }

    // --- Botão de busca mobile ---
    const mobileSearchToggle = event.target.closest('#mobile-search-toggle');
    if (mobileSearchToggle) {
        const mobileSearchBar = document.getElementById('mobile-search-bar');
        if (mobileSearchBar) {
            mobileSearchBar.classList.toggle('hidden');
            if (!mobileSearchBar.classList.contains('hidden')) {
                const inp = document.getElementById('search-input-mobile');
                if (inp) inp.focus();
            }
        }
        return;
    }

    // --- Toggle de submenu de categoria ---
    const submenuToggle = event.target.closest('[data-submenu-toggle]');
    if (submenuToggle) {
        const targetId = submenuToggle.dataset.submenuToggle;
        const dropdown = document.getElementById(targetId);
        if (!dropdown) return;

        const isHidden = dropdown.classList.contains('hidden');

        // Fecha todos (e reseta todas as setas) antes de abrir outro
        closeAllSubmenus();

        if (isHidden) {
            abrirSubmenu(submenuToggle, dropdown);
        }
        // Se estava aberto, closeAllSubmenus já fechou e resetou a seta

        return;
    }

    // Fecha submenus ao clicar fora deles
    if (!event.target.closest('.dropdown-container')) {
        closeAllSubmenus();
    }

    // Fecha o menu mobile ao clicar em um link dentro dele
    if (event.target.closest('#mobile-menu a')) {
        closeMobileMenu();
    }

    // Fecha o menu mobile ao clicar fora dele
    if (!event.target.closest('#mobile-menu') && !event.target.closest('#mobile-menu-toggle')) {
        closeMobileMenu();
    }
});

// Função auxiliar: fecha menu mobile e restaura ícone hambúrguer
function closeMobileMenuWithIcon() {
    const mobileMenu = document.getElementById('mobile-menu');
    const iconHamburger = document.getElementById('icon-hamburger');
    const iconClose = document.getElementById('icon-close');
    if (mobileMenu) mobileMenu.classList.add('hidden');
    if (iconHamburger) iconHamburger.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
}

// Busca mobile: mostrar/ocultar botão
window.handleSearchInputMobile = function() {
    const input = document.getElementById('search-input-mobile');
    const searchButton = document.getElementById('search-button-mobile');
    if (!input || !searchButton) return;
    if (input.value.trim()) {
        searchButton.classList.remove('hidden');
    } else {
        searchButton.classList.add('hidden');
        filterProductsBySearchTerm('');
    }
}

// Função atualizada para filtrar produtos
window.filterProducts = async function(categoryId) {
    if (categoryId === 'todos') {
        mostrarPainelCategorias({ scroll: true });
        closeAllSubmenus();
        return;
    }
    await abrirPainelCategoria(categoryId);
}

// Função para testar a conexão com o Supabase
// Função para buscar produtos do banco de dados
async function fetchProducts() {
    try {
        const { data, error } = await supabase
            .from('produtos') // Substitua pelo nome da sua tabela
            .select('*');

        if (error) {
            throw error; // Lança o erro para ser capturado no catch
        }

        renderProducts(data); // Chama a função para renderizar os produtos
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        document.getElementById('produtos-container').innerHTML = '<p class="text-red-500">Erro ao carregar produtos.</p>';
    }
}

// Função para renderizar produtos na página
function renderProducts(products) {
    const container = document.getElementById('produtos-container');
    container.innerHTML = ''; // Limpa o container antes de adicionar novos produtos

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'border rounded-lg p-4 shadow-md';
        productElement.innerHTML = `
            <img src="${product.imagem || DEFAULT_IMAGE}" alt="${product.nome}" class="w-full h-40 object-cover mb-4">
            <h3 class="text-xl font-semibold">${product.nome}</h3>
            <p class="text-gray-600">R$ ${product.preco.toFixed(2)}</p>
            <button class="mt-2 bg-pink-500 text-white py-2 px-4 rounded">Adicionar ao Carrinho</button>
        `;
        container.appendChild(productElement);
    });
}

// Função para renderizar produtos em destaque
function renderizarProdutosDestaque(produtos) {
    const destaquesContainer = document.getElementById('destaques-container');
    if (!destaquesContainer) {
        console.error('Container de destaques não encontrado');
        return;
    }

    if (!produtos || produtos.length === 0) {
        destaquesContainer.innerHTML = `
            <div class="w-full flex-shrink-0">
                <div class="mx-4">
                    <div class="bg-white rounded-3xl shadow-lg p-6 text-center">
                        <p class="text-gray-500">Nenhum produto em destaque disponível</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    destaquesContainer.innerHTML = produtos.map((produto, index) => `
        <div class="w-full flex-shrink-0">
            <div class="mx-4">
                <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div class="relative">
                        <img src="${getProdutoImagem(produto)}"
                             alt="${produto.nome}"
                             onerror="this.src='${DEFAULT_IMAGE}'"
                             loading="lazy"
                             decoding="async"
                             class="w-full h-64 object-cover">

                        ${produto.em_promocao ? `
                            <div class="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1.5
                                        rounded-full font-medium shadow-lg">
                                Promoção
                            </div>
                        ` : ''}
                    </div>

                    <div class="p-6">
                        <div class="text-xs font-medium text-pink-500 mb-2 uppercase tracking-wider">
                            Categoria: ${produto.categoria?.nome || 'Sem categoria'}
                        </div>

                        <h3 class="text-lg font-semibold text-gray-800 mb-3 line-clamp-1">
                            ${produto.nome}
                        </h3>

                        <div class="flex flex-col gap-3">
                            <div>
                                ${produto.em_promocao ? `
                                    <span class="text-sm text-gray-400 line-through">
                                        R$ ${Number(produto.preco_original).toFixed(2)}
                                    </span>
                                    <span class="text-2xl font-bold text-pink-500 ml-2">
                                        R$ ${Number(produto.preco).toFixed(2)}
                                    </span>
                                ` : `
                                    <span class="text-2xl font-bold text-pink-500">
                                        R$ ${produto.preco.toFixed(2)}
                                    </span>
                                `}
                            </div>
                            
                            <div class="flex gap-2">
                                <button onclick="abrirDetalheProduto('${produto.id}')"
                                        class="flex-1 bg-gray-100 text-gray-800 py-3 rounded-2xl font-medium 
                                               hover:bg-gray-200 transition-all duration-300">
                                    Saiba Mais
                                </button>
                                <button onclick="abrirEscolhaProduto('${produto.id}')"
                                        class="flex-1 bg-pink-500 text-white py-3 rounded-2xl font-medium 
                                               hover:bg-pink-600 transition-all duration-300">
                                    Adicionar ao Carrinho
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Funções para controlar o carrossel
let currentDestaqueIndex = 0;

function showDestaque(index) {
    const container = document.getElementById('destaques-container');
    const items = container.children;
    const totalItems = items.length;

    // Garante que o índice esteja dentro dos limites
    if (index < 0) index = totalItems - 1;
    if (index >= totalItems) index = 0;

    currentDestaqueIndex = index;
    
    // Move o container para mostrar o item atual
    container.style.transform = `translateX(-${index * 100}%)`;
}

function nextDestaque() {
    showDestaque(currentDestaqueIndex + 1);
}

function prevDestaque() {
    showDestaque(currentDestaqueIndex - 1);
}

// Adicione estas funções ao escopo global
window.nextDestaque = nextDestaque;
window.prevDestaque = prevDestaque;

// Carregue os produtos em destaque quando a página carregar
async function carregarProdutosDestaque() {
    try {
        const destaquesContainer = document.getElementById('destaques-container');
        if (!destaquesContainer) {
            console.error('Container de destaque não encontrado');
            return;
        }
        
        const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('destaque',true);

        if (error) {
            console.warn('Erro ao buscar produtos em destaque, usando mock:', error.message);
        }

        let produtos = fallbackProdutos(data);
        produtos = produtos.filter(p => p.destaque === true);

        mostrarSkeletonDestaque(destaquesContainer);

        if (produtos && produtos.length > 0) {
            produtos.forEach(produto => {
                const temDesconto = !!produto.em_promocao;
                const valorOriginal = produto.preco_original ? Number(produto.preco_original).toFixed(2) : '0.00';
                const valorFinal = Number(produto.preco).toFixed(2);

                destaquesContainer.innerHTML += `
                    <div class="w-full flex-shrink-0">
                        <div class="mx-4">
                            <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div class="relative">
                                    <img src="${getProdutoImagem(produto)}"
                                         alt="${produto.nome}"
                                         onerror="this.src='${DEFAULT_IMAGE}'"
                                         loading="lazy"
                                         decoding="async"
                                         class="w-full h-64 object-cover">
                                    
                                    ${temDesconto ? `
                                        <div class="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1.5 
                                                    rounded-full font-medium shadow-lg">
                                            Promoção
                                        </div>
                                    ` : ''}
                                </div>

                                <div class="p-6">
                                    <div class="text-xs font-medium text-pink-500 mb-2 uppercase tracking-wider">
                                        Categoria: ${produto.categoria?.nome || 'Sem categoria'}
                                    </div>

                                    <h3 class="text-lg font-semibold text-gray-800 mb-3 line-clamp-1">
                                        ${produto.nome}
                                    </h3>

                                    <div class="flex flex-col gap-3">
                                        <div>
                                            ${temDesconto ? `
                                                <span class="text-sm text-gray-400 line-through">
                                                    R$ ${valorOriginal}
                                                </span>
                                            ` : ''}
                                            <span class="text-2xl font-bold text-pink-500 ${temDesconto ? 'ml-2' : ''}">
                                                R$ ${valorFinal}
                                            </span>
                                        </div>
                                        
                                        <div class="flex gap-2">
                                            <button onclick="abrirDetalheProduto('${produto.id}')"
                                                    class="flex-1 bg-gray-100 text-gray-800 py-3 rounded-2xl font-medium 
                                                           hover:bg-gray-200 transition-all duration-300">
                                                Saiba Mais
                                            </button>
                                            <button onclick="abrirEscolhaProduto('${produto.id}')"
                                                    class="flex-1 bg-pink-500 text-white py-3 rounded-2xl font-medium 
                                                           hover:bg-pink-600 transition-all duration-300">
                                                Adicionar ao Carrinho
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            // Inicializar o carrossel
            let currentSlide = 0;
            const slides = destaquesContainer.children;
            const totalSlides = slides.length;

            // Função para mostrar o slide atual
            function showSlide() {
                destaquesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            }

            // Funções para navegação
            window.nextDestaque = function() {
                currentSlide = (currentSlide + 1) % totalSlides;
                showSlide();
            };

            window.prevDestaque = function() {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide();
            };

            // Navegação automática opcional
            setInterval(window.nextDestaque, 5000); // Muda slide a cada 5 segundos

        } else {
            destaquesContainer.innerHTML = `
                <div class="w-full flex-shrink-0">
                    <div class="mx-4">
                        <div class="bg-white rounded-3xl shadow-lg p-6 text-center">
                            <p class="text-gray-500">Nenhum produto em destaque disponível</p>
                        </div>
                    </div>
                </div>
            `;
        }

    } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
        if (destaquesContainer) {
            destaquesContainer.innerHTML = `
                <div class="w-full flex-shrink-0">
                    <div class="mx-4">
                        <div class="bg-white rounded-3xl shadow-lg p-6 text-center">
                            <p class="text-red-500">Erro ao carregar produtos em destaque</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para carregar produtos em promoção
async function carregarProdutosPromocao() {
    try {
        const promocoesContainer = document.getElementById('ofertas-container');
        
        if (!promocoesContainer) {
            console.error('Container de promoções não encontrado');
            return;
        }

        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('em_promocao', true);

        if (error) {
            console.warn('Erro ao buscar produtos em promoção, usando mock:', error.message);
        }

        let produtos = fallbackProdutos(data);
        produtos = produtos.filter(p => p.em_promocao === true);

        mostrarSkeletonProdutos(promocoesContainer, 4);

        if (produtos && produtos.length > 0) {
            // Reutiliza exatamente a mesma função de renderização dos cards de produtos
            promocoesContainer.innerHTML = produtos.map(renderizarProduto).join('');
        } else {
            promocoesContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-white">Nenhum produto em promoção disponível no momento.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Erro ao carregar produtos em promoção:', error);
        const promocoesContainer = document.getElementById('ofertas-container');
        if (promocoesContainer) {
            promocoesContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-white">Erro ao carregar produtos em promoção. Por favor, tente novamente mais tarde.</p>
                </div>
            `;
        }
    }
}

// Atualizar o event listener DOMContentLoaded para incluir a chamada da nova função
document.addEventListener('DOMContentLoaded', async function() {
    try {
        
        if (!supabase) {
            throw new Error('Supabase não está inicializado');
        }
        
        
        window.carrinhoManager = new CarrinhoManager();
        
        await carregarCategorias();
        handleSearchInput();
        setupMainNavHover();

        // Vitrines abaixo da dobra não bloqueiam a interação inicial.
        Promise.allSettled([
            carregarProdutosDestaque(),
            carregarProdutosPromocao()
        ]);
        
    } catch (error) {
        console.error('Erro durante a inicialização:', error);
    }
});

// Adicionar a função ao escopo global
window.carregarProdutosPromocao = carregarProdutosPromocao;

let searchTimeout;

window.handleSearchInput = function() {
    const input = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const produtosSection = document.getElementById('produtos');
    
    if (!input || !searchButton) return;

    // Mostra ou esconde o botão de busca baseado se há texto no input
    if (input.value.trim()) {
        searchButton.classList.remove('hidden');
    } else {
        searchButton.classList.add('hidden');
        // Se o campo está vazio, mostra todos os produtos
        filterProductsBySearchTerm('');
    }
}

// Adicione também um event listener para a tecla Enter
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                const produtosSection = document.getElementById('produtos');
                if (produtosSection) {
                    produtosSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                filterProductsBySearchTerm(this.value.trim());
            }
        });
    }
});

// Adicione estas funções ao seu script.js

// Função para ordenar por preço (menor para maior)
window.ordenarPorMenorPreco = async function() {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .order('preco', { ascending: true });

        if (error) throw error;
        atualizarProdutos(produtos);
    } catch (error) {
        console.error('Erro ao ordenar produtos:', error);
    }
}

// Função para ordenar por preço (maior para menor)
window.ordenarPorMaiorPreco = async function() {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .order('preco', { ascending: false });

        if (error) throw error;
        atualizarProdutos(produtos);
    } catch (error) {
        console.error('Erro ao ordenar produtos:', error);
    }
}

// Função para ordenar por mais vendidos
window.ordenarPorMaisVendidos = async function() {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .order('vendas', { ascending: false });

        if (error) throw error;
        atualizarProdutos(produtos);
    } catch (error) {
        console.error('Erro ao ordenar produtos:', error);
    }
}

// Função auxiliar para atualizar a exibição dos produtos
function atualizarProdutos(produtos) {
    closeAllSubmenus(); // Fecha o dropdown de ordenação após selecionar
    const produtosContainer = document.getElementById('produtos-container');
    if (!produtosContainer) return;

    produtosContainer.innerHTML = '';
    
    if (produtos && produtos.length > 0) {
        produtosContainer.innerHTML = produtos.map(renderizarProduto).join('');
    } else {
        produtosContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500">Nenhum produto encontrado.</p>
            </div>
        `;
    }
}

// Adicione esta linha no início do arquivo
window.abrirDetalheProduto = abrirDetalheProduto;

function garantirModalProduto() {
    let modal = document.getElementById('modal-produto');
    if (modal) return modal;

    document.body.insertAdjacentHTML('beforeend', `
        <div id="modal-produto" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div id="modal-produto-painel" class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
                <div class="relative p-2" id="modal-content"></div>
            </div>
        </div>
    `);
    return document.getElementById('modal-produto');
}

function abrirScoopPendente() {
    const modal = garantirModalProduto();
    const modalContent = modal.querySelector('#modal-content');
    const painel = modal.querySelector('#modal-produto-painel');
    painel.className = 'scoop-product-panel bg-white w-full max-h-[92vh] overflow-y-auto mx-4';
    modalContent.className = 'relative';
    modalContent.innerHTML = `
        <button onclick="fecharModal()" class="scoop-modal-close" aria-label="Fechar">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
        <div class="scoop-product-grid">
            <div class="scoop-product-media">
                <img src="assets/scoop-premiado.png" alt="Scoop Premiado Menina Moça" width="1568" height="1024">
            </div>
            <div class="scoop-product-info">
                <span class="scoop-product-kicker">Edição especial · sem categoria</span>
                <h2>Scoop Premiado</h2>
                <p>O cadastro comercial está sendo finalizado. O produto será liberado para compra assim que preço e estoque forem informados.</p>
                <div class="scoop-pending-status"><i class="bi bi-clock" aria-hidden="true"></i> Em preparação</div>
                <button type="button" class="scoop-buy-button" disabled>Finalizar compra</button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// Função para abrir o modal com detalhes do produto
async function abrirDetalheProduto(produtoId) {
    try {
        let modal = garantirModalProduto();
        let modalContent = modal.querySelector('#modal-content');
        
        if (!modal || !modalContent) {
            console.error('Modal ou conteúdo do modal não encontrado');
            // Cria o modal dinamicamente se ele não existir
            const modalHTML = `
                <div id="modal-produto" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                    <div id="modal-produto-painel" class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
                        <div class="relative p-2" id="modal-content">
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            // Atualiza as referências
            modal = document.getElementById('modal-produto');
            modalContent = document.getElementById('modal-content');
        }

        const { data: dbProduto, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', produtoId)
            .single();

        let produto = dbProduto;
        if (error || !produto) {
            if (error) console.warn('Erro ao buscar produto no modal, usando mock:', error.message);
            produto = MOCK_PRODUTOS.find(p => String(p.id) === String(produtoId)) || null;
        }

        if (!produto) {
            modalContent.innerHTML = `<p class="p-6 text-center text-red-500">Produto não encontrado.</p>`;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
            return;
        }

        // Determina se o produto está em promoção e calcula os preços
        const temDesconto = !!produto.em_promocao;
        const valorOriginal = produto.preco_original ? Number(produto.preco_original).toFixed(2) : '0.00';
        const valorPromocional = Number(produto.preco).toFixed(2);
        const valorAtual = Number(produto.preco).toFixed(2);
        const nomeProduto = escapeHtml(produto.nome || 'Produto');
        const descricaoProduto = escapeHtml(produto.descricao || 'Descricao nao disponivel');
        const estoqueProduto = Math.max(0, Number(produto.estoque) || 0);
        const produtoScoop = produto.codigo_barras === SCOOP_PRODUCT_CODE;
        const produtoDisponivel = estoqueProduto > 0 && Number(produto.preco) > 0;
        const painel = modal.querySelector('#modal-produto-painel');

        if (painel) {
            painel.className = produtoScoop
                ? 'scoop-product-panel bg-white w-full max-h-[92vh] overflow-y-auto mx-4'
                : 'bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4';
        }
        modalContent.className = produtoScoop ? 'relative' : 'relative p-2';
        
        modalContent.innerHTML = `
            <button onclick="fecharModal()" class="${produtoScoop ? 'scoop-modal-close' : 'absolute top-4 right-4 text-gray-500 hover:text-gray-700'}" aria-label="Fechar">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div class="${produtoScoop ? 'scoop-product-grid' : 'grid grid-cols-1 md:grid-cols-2 gap-8 p-6'}">
                <!-- Imagem do Produto -->
                <div class="${produtoScoop ? 'scoop-product-media' : 'relative'}">
                    <img src="${getProdutoImagem(produto)}"
                         alt="${nomeProduto}"
                         class="${produtoScoop ? '' : 'w-full h-auto rounded-lg shadow-lg'}">
                    ${temDesconto ? `
                        <div class="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1.5 
                                    rounded-full font-medium shadow-lg">
                            Promoção
                        </div>
                    ` : ''}
                </div>

                <!-- Informações do Produto -->
                <div class="${produtoScoop ? 'scoop-product-info' : 'space-y-4'}">
                    ${produtoScoop ? '<span class="scoop-product-kicker">Edição especial · sem categoria</span>' : ''}
                    <h2 class="text-2xl font-bold text-gray-800">${nomeProduto}</h2>
                    
                    <div class="flex items-center space-x-2">
                        <span class="text-gray-600">Estoque:</span>
                        <span class="text-gray-600 font-semibold">${estoqueProduto} unidades</span>
                    </div>

                    ${renderProdutoAtributos(produto)}

                    <div class="flex flex-col">
                        ${produtoScoop && Number(produto.preco) <= 0 ? `
                            <span class="scoop-pending-status"><i class="bi bi-clock" aria-hidden="true"></i> Preço em definição</span>
                        ` : temDesconto ? `
                            <span class="text-sm text-gray-400 line-through">
                                R$ ${valorOriginal}
                            </span>
                            <span class="text-3xl font-bold text-pink-500">
                                R$ ${valorPromocional}
                            </span>
                        ` : `
                            <span class="text-3xl font-bold text-pink-500">
                                R$ ${valorAtual}
                            </span>
                        `}
                    </div>

                    <!-- Controle de Quantidade -->
                    <div class="mt-4 flex flex-col items-center">
                        <span class="text-gray-600">Quantidade:</span>
                        <div class="flex items-center gap-4 mt-2 justify-center">
                            <button onclick="atualizarQuantidadeModal(-1)"
                                    class="text-gray-600 text-lg font-medium">
                                -
                            </button>
                            <span id="quantidade-modal" data-estoque="${estoqueProduto}" class="text-black text-lg font-medium">1</span>
                            <button onclick="atualizarQuantidadeModal(1)"
                                    class="text-gray-600 text-lg font-medium">
                                +
                            </button>
                        </div>
                    </div>

                    <button onclick="abrirEscolhaProduto('${produto.id}', parseInt(document.getElementById('quantidade-modal')?.textContent || '1'))"
                            ${!produtoDisponivel ? 'disabled' : ''}
                            class="w-full bg-pink-500 text-white py-3 rounded-xl font-medium 
                                   hover:bg-pink-600 transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                        Adicionar ao Carrinho
                    </button>
                    ${produtoScoop ? `
                        <button onclick="finalizarCompraProduto('${produto.id}')"
                                ${!produtoDisponivel ? 'disabled' : ''}
                                class="scoop-buy-button" type="button">
                            Finalizar compra
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Descrição do Produto -->
            <div class="p-6 border-t border-gray-100">
                <h3 class="text-xl font-semibold mb-4">Descrição do Produto</h3>
                <p class="text-gray-600 leading-relaxed">
                    ${descricaoProduto}
                </p>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Erro ao abrir detalhes do produto:', error);
        alert('Erro ao carregar detalhes do produto');
    }
}

// Função para fechar o modal
function fecharModal() {
    const modal = document.getElementById('modal-produto');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

// Função para atualizar quantidade no modal
window.atualizarQuantidadeModal = function(delta) {
    try {
        const quantidadeElement = document.getElementById('quantidade-modal');
        if (quantidadeElement) {
            let quantidade = parseInt(quantidadeElement.textContent || '1');
            const estoque = Math.max(0, parseInt(quantidadeElement.dataset.estoque || '0'));
            const limite = estoque > 0 ? estoque : 1;
            quantidade = Math.min(limite, Math.max(1, quantidade + delta));
            quantidadeElement.textContent = quantidade;

            // Atualizar quantidade no carrinho se o item já existir
            const corSelecionada = document.querySelector('.cor-btn.bg-pink-600')?.dataset.cor;
            const produtoId = document.querySelector('[onclick^="comprarProdutoComCor"]')?.getAttribute('onclick').match(/'([^']+)'/)[1];

            if (corSelecionada && produtoId) {
                const item = window.carrinhoManager.items.find(item => 
                    String(item.id) === String(produtoId) && item.cor === corSelecionada
                );

                if (item) {
                    const quantidadeCarrinhoElement = document.getElementById(`quantidade-${produtoId}-${corSelecionada}`);
                    if (quantidadeCarrinhoElement) {
                        quantidadeCarrinhoElement.textContent = quantidade;
                    }
                    item.quantidade = quantidade;
                    window.carrinhoManager.saveToStorage();
                    window.carrinhoManager.atualizarCarrinhoUI();
                }
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar quantidade:', error);
    }
}

// Função para selecionar cor
window.selecionarCor = function(cor) {
    try {
        // Remove a classe ativa de todos os botões
        document.querySelectorAll('.cor-btn').forEach(btn => {
            btn.classList.remove('bg-pink-600');
            btn.classList.add('bg-pink-500');
        });

        // Adiciona a classe ativa ao botão selecionado
        const botaoSelecionado = document.querySelector(`[data-cor="${cor}"]`);
        if (botaoSelecionado) {
            botaoSelecionado.classList.remove('bg-pink-500');
            botaoSelecionado.classList.add('bg-pink-600');
        }

        // Atualiza o texto da cor selecionada
        const corSelecionadaElement = document.getElementById('cor-selecionada');
        if (corSelecionadaElement) {
            corSelecionadaElement.textContent = `Cor selecionada: ${cor}`;
        }
    } catch (error) {
        console.error('Erro ao selecionar cor:', error);
    }
}

// Função para comprar produto com cor
window.comprarProdutoComCor = async function(produtoId) {
    try {
        const quantidade = parseInt(document.getElementById('quantidade-modal')?.textContent || '1');
        await window.abrirEscolhaProduto(produtoId, quantidade);
    } catch (error) {
        console.error('Erro ao adicionar produto ao carrinho:', error);
        alert('Erro ao adicionar produto ao carrinho. Por favor, tente novamente.');
    }
}

window.finalizarCompraProduto = async function(produtoId) {
    try {
        const quantidade = parseInt(document.getElementById('quantidade-modal')?.textContent || '1');
        const adicionado = await window.carrinhoManager.adicionarItem(produtoId, null, quantidade, {});
        if (!adicionado) return;
        fecharModal();
        await window.finalizarCompra();
    } catch (error) {
        console.error('Erro ao finalizar a compra do produto:', error);
        alert('Não foi possível iniciar a compra. Tente novamente.');
    }
};

// Também exporte as outras funções relacionadas
window.fecharModal = fecharModal;
window.atualizarQuantidadeModal = window.atualizarQuantidadeModal;
window.comprarProdutoComCor = window.comprarProdutoComCor;
