import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabaseUrl = 'https://ixouszvipgklgdvmsyyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4b3VzenZpcGdrbGdkdm1zeXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NTc5ODgsImV4cCI6MjA0NzQzMzk4OH0.FxsdlpIFDHk9NDHp8mKn06_M54WasfIuTWLgA1L_ip8';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Constantes globais
const DEFAULT_IMAGE = 'https://placehold.co/400x300/pink/white?text=Menina+Moca';
const STORE_WHATSAPP_PHONE = '5585988740788';
let mercadoPagoConfigCache = null;

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

            const { data: produto, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('id', produtoId)
                .single();

            if (error) throw error;

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

        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            alert('Erro ao adicionar produto ao carrinho');
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
        const { data: produto, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', produtoId)
            .single();

        if (error) throw error;

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

// Atualizar a funÃ§Ã£o de pesquisa
async function filterProductsBySearchTerm(searchTerm) {
    try {
        if (!searchTerm.trim()) return;

        const normalizedSearchTerm = normalizeText(searchTerm);

        // Buscar todos os produtos e filtrar no cliente
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*');

        if (error) throw error;

        const produtosContainer = document.getElementById('produtos-container');
        if (!produtosContainer) return;

        produtosContainer.innerHTML = '';

        // Filtra os produtos localmente
        const produtosFiltrados = produtos.filter(produto => {
            const normalizedNome = normalizeText(produto.nome);
            const normalizedDescricao = produto.descricao ? normalizeText(produto.descricao) : '';
            
            return normalizedNome.includes(normalizedSearchTerm) || 
                   normalizedDescricao.includes(normalizedSearchTerm);
        });

        if (produtosFiltrados.length > 0) {
            produtosFiltrados.forEach(produto => {
                produtosContainer.innerHTML += renderizarProduto(produto);
            });

            // Rolar suavemente atÃ© a seÃ§Ã£o de produtos
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

        // Limpar o campo de pesquisa e esconder o botÃ£o
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

        const { data: produtos, error } = await query;
        
        if (error) {
            console.error('Erro ao buscar produtos:', error);
            throw error;
        }


        produtosContainer.innerHTML = '';
        
        if (!produtos || produtos.length === 0) {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Nenhum produto encontrado.</p>
                </div>
            `;
            return;
        }
        
        produtos.forEach(produto => {
            produtosContainer.innerHTML += renderizarProduto(produto);
        });

        // Armazena todos os produtos para filtragem
        allProducts = produtos; // Armazena todos os produtos

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
function renderizarProduto(produto) {
    const temDesconto = !!produto.em_promocao;
    const valorOriginal = produto.preco_original ? Number(produto.preco_original).toFixed(2) : '0.00';
    const valorPromocional = Number(produto.preco).toFixed(2);
    const valorFinal = temDesconto ? valorPromocional : Number(produto.preco).toFixed(2);
    const esgotado = produto.estoque !== undefined && produto.estoque !== null && Number(produto.estoque) <= 0;
    const nomeProduto = escapeHtml(produto.nome || 'Produto sem nome');
    const categoriaProduto = escapeHtml(produto.categoria?.nome || 'Sem categoria');

    return `
        <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${esgotado ? 'opacity-80' : ''}">
            <div class="relative">
                <img src="${getProdutoImagem(produto)}"
                     alt="${nomeProduto}"
                     onerror="this.src='${DEFAULT_IMAGE}'"
                     class="w-full h-36 sm:h-44 object-cover ${esgotado ? 'grayscale' : ''}">

                <!-- Badge de promoÃ§Ã£o OU esgotado (não aparecem juntos) -->
                ${esgotado ? `
                    <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span class="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase shadow-lg">
                            Esgotado
                        </span>
                    </div>
                ` : temDesconto ? `
                    <div class="absolute top-2 right-2 bg-pink-500 text-white px-2 py-0.5 
                                rounded-full text-xs font-medium shadow-md">
                        PromoÃ§Ã£o
                    </div>
                ` : ''}
            </div>

            <div class="p-2 sm:p-3">
                <div class="text-[10px] sm:text-xs font-medium text-pink-500 mb-1 uppercase tracking-wider truncate">
                    ${categoriaProduto}
                </div>

                <h3 class="text-sm sm:text-base font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">
                    ${nomeProduto}
                </h3>

                <div class="flex flex-col gap-2">
                    <div>
                        ${temDesconto ? `
                            <span class="text-xs text-gray-400 line-through">
                                R$ ${valorOriginal}
                            </span>
                            <span class="text-base sm:text-lg font-bold ${esgotado ? 'text-gray-400' : 'text-pink-500'} ml-1">
                                R$ ${valorFinal}
                            </span>
                        ` : `
                            <span class="text-base sm:text-lg font-bold ${esgotado ? 'text-gray-400' : 'text-pink-500'}">
                                R$ ${valorFinal}
                            </span>
                        `}
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-1.5">
                        <button onclick="abrirDetalheProduto('${produto.id}')"
                                class="flex-1 bg-gray-100 text-gray-800 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium 
                                       hover:bg-gray-200 transition-all duration-300">
                            Saiba Mais
                        </button>
                        ${esgotado ? `
                            <button disabled
                                    class="flex-1 bg-gray-200 text-gray-400 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium cursor-not-allowed">
                                Esgotado
                            </button>
                        ` : `
                            <button onclick="abrirEscolhaProduto('${produto.id}')"
                                    class="flex-1 bg-pink-500 text-white py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium 
                                           hover:bg-pink-600 transition-all duration-300">
                                + Carrinho
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Adicione este cÃ³digo ao seu script.js

// ConfiguraÃ§Ã£o do slider
let currentSlide = 0;
const slider = document.getElementById('slider');
const slides = slider ? slider.children.length : 0;

function updateSlider() {
    if (!slider || slides === 0) return;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
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

// Opcional: Adicionar transiÃ§Ã£o automÃ¡tica
if (slides > 1) {
    setInterval(nextSlide, 5000); // Muda slide a cada 5 segundos
}

// Função atualizada para carregar categorias com melhor tratamento de erro
async function carregarCategorias() {
    try {

        // Queries separadas para garantir que todas as subcategorias sejam retornadas
        const { data: categorias, error: catError } = await supabase
            .from('categorias')
            .select('*');

        if (catError) throw catError;

        const { data: todasSubcategorias, error: subError } = await supabase
            .from('subcategorias')
            .select('*');

        if (subError) throw subError;

        // Agrupa subcategorias por categoria_id
        const subPorCategoria = {};
        (todasSubcategorias || []).forEach(sub => {
            if (!subPorCategoria[sub.categoria_id]) {
                subPorCategoria[sub.categoria_id] = [];
            }
            subPorCategoria[sub.categoria_id].push(sub);
        });

        const categoriasButtons = document.getElementById('categorias-buttons');
        if (!categoriasButtons) {
            console.error('Elemento categorias-buttons não encontrado');
            return;
        }

        const categoriasHTML = categorias.map(categoria => {
            const subs = subPorCategoria[categoria.id] || [];
            const temSubs = subs.length > 0;
            const subsHTML = subs.map(sub =>
                `<button onclick="filterProductsBySubcategory(event, ${sub.id})"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors">
                    ${sub.nome}
                </button>`
            ).join('');

            const dropdownHTML = temSubs ? `
                <div id="submenu-${categoria.id}" class="subcategories-dropdown hidden">
                    <div class="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                        <p class="px-4 py-1 text-[11px] font-semibold text-pink-400 uppercase tracking-wider">${categoria.nome}</p>
                        <div class="border-t border-gray-100 my-1"></div>
                        ${subsHTML}
                    </div>
                </div>` : '';

            const btnAttr = temSubs
                ? `data-submenu-toggle="submenu-${categoria.id}"`
                : `onclick="filterProducts(${categoria.id})"`;

            const arrowHTML = temSubs
                ? `<svg class="w-3.5 h-3.5 submenu-arrow transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`
                : '';

            return `<div class="relative dropdown-container">
                <button ${btnAttr}
                    class="category-btn px-5 py-2 text-sm rounded-full bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
                    data-category="${categoria.id}">
                    ${categoria.nome}${arrowHTML}
                </button>
                ${dropdownHTML}
            </div>`;
        }).join('');

        const buttonsHTML = `
            <div class="flex flex-wrap gap-3 items-center justify-center mb-8">
                <div class="relative dropdown-container">
                    <button data-submenu-toggle="submenu-ordenar"
                            class="category-btn px-5 py-2 text-sm rounded-full bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                        Ordenar por
                        <svg class="w-3.5 h-3.5 submenu-arrow transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                    <div id="submenu-ordenar" class="subcategories-dropdown hidden">
                        <div class="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                            <p class="px-4 py-1 text-[11px] font-semibold text-pink-400 uppercase tracking-wider">Ordenar</p>
                            <div class="border-t border-gray-100 my-1"></div>
                            <button onclick="ordenarPorMenorPreco()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors">Menor PreÃ§o</button>
                            <button onclick="ordenarPorMaiorPreco()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors">Maior PreÃ§o</button>
                            <button onclick="ordenarPorMaisVendidos()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors">Mais Vendidos</button>
                        </div>
                    </div>
                </div>
                <button onclick="filterProducts('todos')"
                    class="category-btn active px-5 py-2 text-sm rounded-full bg-white shadow-sm hover:shadow-md transition-all"
                    data-category="todos">
                    Todos os Produtos
                </button>
                ${categoriasHTML}
            </div>
        `;

        categoriasButtons.innerHTML = buttonsHTML;

    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        const categoriasButtons = document.getElementById('categorias-buttons');
        if (categoriasButtons) {
            categoriasButtons.innerHTML = '<div class="text-center py-4"><p class="text-red-500">Erro ao carregar categorias</p></div>';
        }
    }
}

// Adicione esta linha para tornar a funÃ§Ã£o global
window.filterProductsBySubcategory = filterProductsBySubcategory;

// Função atualizada para filtrar por subcategoria
async function filterProductsBySubcategory(event, subcategoriaId) {
    event.preventDefault(); // Previne o comportamento padrÃ£o do botÃ£o
    event.stopPropagation(); // Impede a propagaÃ§Ã£o do evento para o botÃ£o da categoria
    
    try {
        
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('subcategoria_id', subcategoriaId);

        if (error) throw error;

        const produtosContainer = document.getElementById('produtos-container');
        if (!produtosContainer) {
            console.error('Container de produtos não encontrado');
            return;
        }

        if (produtos && produtos.length > 0) {
            produtosContainer.innerHTML = produtos.map(produto => renderizarProduto(produto)).join('');
        } else {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Nenhum produto encontrado nesta subcategoria.</p>
                </div>
            `;
        }

        // Fecha o menu de subcategorias apÃ³s a seleÃ§Ã£o
        closeAllSubmenus();

    } catch (error) {
        console.error('Erro ao filtrar produtos por subcategoria:', error);
        const produtosContainer = document.getElementById('produtos-container');
        if (produtosContainer) {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-500">Erro ao carregar produtos. Por favor, tente novamente.</p>
                </div>
            `;
        }
    }
}

// Funções de abertura/fechamento dos menus de subcategoria e mobile
function closeAllSubmenus() {
    document.querySelectorAll('.subcategories-dropdown').forEach(dropdown => {
        dropdown.classList.add('hidden');
        dropdown.style.position = '';
        dropdown.style.top = '';
        dropdown.style.left = '';
        dropdown.style.width = '';
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

// Fecha submenus ao rolar a pÃ¡gina (necessÃ¡rio com position:fixed)
window.addEventListener('scroll', closeAllSubmenus, { passive: true });
window.addEventListener('resize', closeAllSubmenus, { passive: true });

// Controla abertura/fechamento de submenus e do menu mobile
document.addEventListener('click', function(event) {

    // --- BotÃ£o hambÃºrguer: toggle menu + troca de Ã­cone ---
    const mobileToggle = event.target.closest('#mobile-menu-toggle');
    if (mobileToggle) {
        const mobileMenu = document.getElementById('mobile-menu');
        const iconHamburger = document.getElementById('icon-hamburger');
        const iconClose = document.getElementById('icon-close');
        if (mobileMenu) {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            // Alterna Ã­cones
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

    // --- BotÃ£o de busca mobile ---
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
            // Calcula posiÃ§Ã£o usando getBoundingClientRect para position:fixed
            const btnRect = submenuToggle.getBoundingClientRect();
            const dropdownWidth = 208; // w-52 = 13rem = 208px
            const viewportWidth = window.innerWidth;

            let top = btnRect.bottom + 6;
            let left = btnRect.left;
            if (left + dropdownWidth > viewportWidth - 8) {
                left = viewportWidth - dropdownWidth - 8;
            }
            if (left < 8) left = 8;

            dropdown.style.position = 'fixed';
            dropdown.style.top = top + 'px';
            dropdown.style.left = left + 'px';
            dropdown.style.width = dropdownWidth + 'px';
            dropdown.style.zIndex = '9999';
            dropdown.classList.remove('hidden');

            // Gira a seta do botÃ£o para cima (aberto)
            const arrow = submenuToggle.querySelector('.submenu-arrow');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
        }
        // Se estava aberto, closeAllSubmenus jÃ¡ fechou e resetou a seta

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

// Função auxiliar: fecha menu mobile e restaura Ã­cone hambÃºrguer
function closeMobileMenuWithIcon() {
    const mobileMenu = document.getElementById('mobile-menu');
    const iconHamburger = document.getElementById('icon-hamburger');
    const iconClose = document.getElementById('icon-close');
    if (mobileMenu) mobileMenu.classList.add('hidden');
    if (iconHamburger) iconHamburger.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
}

// Busca mobile: mostrar/ocultar botÃ£o
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
    try {
        
        let query = supabase
            .from('produtos')
            .select('*');

        // Aplicar filtro apenas se não for "todos"
        if (categoryId !== 'todos') {
            query = query.eq('categoria_id', categoryId);
        }
        
        
        const { data: produtos, error } = await query;

        if (error) throw error;

        const produtosContainer = document.getElementById('produtos-container');
        produtosContainer.innerHTML = '';

        if (produtos && produtos.length > 0) {
            produtos.forEach(produto => {
                produtosContainer.innerHTML += renderizarProduto(produto);
            });
        } else {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Nenhum produto encontrado nesta categoria.</p>
                </div>
            `;
        }

        // Fecha qualquer submenu aberto apÃ³s filtrar por categoria
        closeAllSubmenus();

    } catch (error) {
        console.error('Erro ao filtrar produtos:', error);
        const produtosContainer = document.getElementById('produtos-container');
        if (produtosContainer) {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-500">Erro ao carregar produtos. Por favor, tente novamente.</p>
                </div>
            `;
        }
    }
}

// Função para testar a conexÃ£o com o Supabase
// Função para buscar produtos do banco de dados
async function fetchProducts() {
    try {
        const { data, error } = await supabase
            .from('produtos') // Substitua pelo nome da sua tabela
            .select('*');

        if (error) {
            throw error; // LanÃ§a o erro para ser capturado no catch
        }

        renderProducts(data); // Chama a funÃ§Ã£o para renderizar os produtos
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        document.getElementById('produtos-container').innerHTML = '<p class="text-red-500">Erro ao carregar produtos.</p>';
    }
}

// Função para renderizar produtos na pÃ¡gina
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
                        <p class="text-gray-500">Nenhum produto em destaque disponÃ­vel</p>
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
                             class="w-full h-64 object-cover">

                        ${produto.em_promocao ? `
                            <div class="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1.5
                                        rounded-full font-medium shadow-lg">
                                PromoÃ§Ã£o
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

    // Garante que o Ã­ndice esteja dentro dos limites
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

// Adicione estas funÃ§Ãµes ao escopo global
window.nextDestaque = nextDestaque;
window.prevDestaque = prevDestaque;

// Carregue os produtos em destaque quando a pÃ¡gina carregar
async function carregarProdutosDestaque() {
    try {
        const destaquesContainer = document.getElementById('destaques-container');
        if (!destaquesContainer) {
            console.error('Container de destaque não encontrado');
            return;
        }
        
        const { data: produtos, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('destaque',true);

        if (error) {
            console.error('Erro ao buscar produtos em destaque:', error);
            throw error;
        }


        destaquesContainer.innerHTML = '';

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
                                         class="w-full h-64 object-cover">
                                    
                                    ${temDesconto ? `
                                        <div class="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1.5 
                                                    rounded-full font-medium shadow-lg">
                                            PromoÃ§Ã£o
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

            // Funções para navegaÃ§Ã£o
            window.nextDestaque = function() {
                currentSlide = (currentSlide + 1) % totalSlides;
                showSlide();
            };

            window.prevDestaque = function() {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide();
            };

            // NavegaÃ§Ã£o automÃ¡tica opcional
            setInterval(window.nextDestaque, 5000); // Muda slide a cada 5 segundos

        } else {
            destaquesContainer.innerHTML = `
                <div class="w-full flex-shrink-0">
                    <div class="mx-4">
                        <div class="bg-white rounded-3xl shadow-lg p-6 text-center">
                            <p class="text-gray-500">Nenhum produto em destaque disponÃ­vel</p>
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

// Função para carregar produtos em promoÃ§Ã£o
async function carregarProdutosPromocao() {
    try {
        const promocoesContainer = document.getElementById('ofertas-container');
        
        if (!promocoesContainer) {
            console.error('Container de promoÃ§Ãµes não encontrado');
            return;
        }

        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('em_promocao', true);

        if (error) {
            console.error('Erro ao buscar produtos em promoÃ§Ã£o:', error);
            throw error;
        }


        promocoesContainer.innerHTML = '';

        if (produtos && produtos.length > 0) {
            // Reutiliza exatamente a mesma funÃ§Ã£o de renderizaÃ§Ã£o dos cards de produtos
            produtos.forEach(produto => {
                promocoesContainer.innerHTML += renderizarProduto(produto);
            });
        } else {
            promocoesContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-white">Nenhum produto em promoÃ§Ã£o disponÃ­vel no momento.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Erro ao carregar produtos em promoÃ§Ã£o:', error);
        const promocoesContainer = document.getElementById('ofertas-container');
        if (promocoesContainer) {
            promocoesContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-white">Erro ao carregar produtos em promoÃ§Ã£o. Por favor, tente novamente mais tarde.</p>
                </div>
            `;
        }
    }
}

// Atualizar o event listener DOMContentLoaded para incluir a chamada da nova funÃ§Ã£o
document.addEventListener('DOMContentLoaded', async function() {
    try {
        
        if (!supabase) {
            throw new Error('Supabase não está inicializado');
        }
        
        
        window.carrinhoManager = new CarrinhoManager();
        
        await carregarCategorias();
        await filterProducts('todos');
        await carregarProdutosDestaque();
        await carregarProdutosPromocao(); // Carrega produtos em promoÃ§Ã£o
        await loadAllProducts();
        handleSearchInput();
        
    } catch (error) {
        console.error('Erro durante a inicializaÃ§Ã£o:', error);
    }
});

// Adicionar a funÃ§Ã£o ao escopo global
window.carregarProdutosPromocao = carregarProdutosPromocao;

let searchTimeout;

window.handleSearchInput = function() {
    const input = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const produtosSection = document.getElementById('produtos');
    
    if (!input || !searchButton) return;

    // Mostra ou esconde o botÃ£o de busca baseado se hÃ¡ texto no input
    if (input.value.trim()) {
        searchButton.classList.remove('hidden');
    } else {
        searchButton.classList.add('hidden');
        // Se o campo está vazio, mostra todos os produtos
        filterProductsBySearchTerm('');
    }
}

// Adicione tambÃ©m um event listener para a tecla Enter
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

// Adicione estas funÃ§Ãµes ao seu script.js

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

// Função auxiliar para atualizar a exibiÃ§Ã£o dos produtos
function atualizarProdutos(produtos) {
    closeAllSubmenus(); // Fecha o dropdown de ordenaÃ§Ã£o apÃ³s selecionar
    const produtosContainer = document.getElementById('produtos-container');
    if (!produtosContainer) return;

    produtosContainer.innerHTML = '';
    
    if (produtos && produtos.length > 0) {
        produtos.forEach(produto => {
            produtosContainer.innerHTML += renderizarProduto(produto);
        });
    } else {
        produtosContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500">Nenhum produto encontrado.</p>
            </div>
        `;
    }
}

// Adicione esta linha no inÃ­cio do arquivo
window.abrirDetalheProduto = abrirDetalheProduto;

// Função para abrir o modal com detalhes do produto
async function abrirDetalheProduto(produtoId) {
    try {
        let modal = document.getElementById('modal-produto');
        let modalContent = document.getElementById('modal-content');
        
        if (!modal || !modalContent) {
            console.error('Modal ou conteÃºdo do modal não encontrado');
            // Cria o modal dinamicamente se ele não existir
            const modalHTML = `
                <div id="modal-produto" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
                        <div class="relative p-2" id="modal-content">
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            // Atualiza as referÃªncias
            modal = document.getElementById('modal-produto');
            modalContent = document.getElementById('modal-content');
        }

        const { data: produto, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', produtoId)
            .single();

        if (error) throw error;

        // Determina se o produto está em promoÃ§Ã£o e calcula os preços
        const temDesconto = !!produto.em_promocao;
        const valorOriginal = produto.preco_original ? Number(produto.preco_original).toFixed(2) : '0.00';
        const valorPromocional = Number(produto.preco).toFixed(2);
        const valorAtual = Number(produto.preco).toFixed(2);
        const nomeProduto = escapeHtml(produto.nome || 'Produto');
        const descricaoProduto = escapeHtml(produto.descricao || 'Descricao nao disponivel');
        
        modalContent.innerHTML = `
            <button onclick="fecharModal()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                <!-- Imagem do Produto -->
                <div class="relative">
                    <img src="${getProdutoImagem(produto)}"
                         alt="${nomeProduto}"
                         class="w-full h-auto rounded-lg shadow-lg">
                    ${temDesconto ? `
                        <div class="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1.5 
                                    rounded-full font-medium shadow-lg">
                            PromoÃ§Ã£o
                        </div>
                    ` : ''}
                </div>

                <!-- InformaÃ§Ãµes do Produto -->
                <div class="space-y-4">
                    <h2 class="text-2xl font-bold text-gray-800">${nomeProduto}</h2>
                    
                    <div class="flex items-center space-x-2">
                        <span class="text-gray-600">Estoque:</span>
                        <span class="text-gray-600 font-semibold">${produto.estoque || 0} unidades</span>
                    </div>

                    ${renderProdutoAtributos(produto)}

                    <div class="flex flex-col">
                        ${temDesconto ? `
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
                            <span id="quantidade-modal" class="text-black text-lg font-medium">1</span>
                            <button onclick="atualizarQuantidadeModal(1)"
                                    class="text-gray-600 text-lg font-medium">
                                +
                            </button>
                        </div>
                    </div>

                    <button onclick="abrirEscolhaProduto('${produto.id}', parseInt(document.getElementById('quantidade-modal')?.textContent || '1'))"
                            class="w-full bg-pink-500 text-white py-3 rounded-xl font-medium 
                                   hover:bg-pink-600 transition-all duration-300 mt-4">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>

            <!-- DescriÃ§Ã£o do Produto -->
            <div class="p-6 border-t border-gray-100">
                <h3 class="text-xl font-semibold mb-4">DescriÃ§Ã£o do Produto</h3>
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
            quantidade = Math.max(1, quantidade + delta); // NÃ£o permite quantidade menor que 1
            quantidadeElement.textContent = quantidade;

            // Atualizar quantidade no carrinho se o item jÃ¡ existir
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
        // Remove a classe ativa de todos os botÃµes
        document.querySelectorAll('.cor-btn').forEach(btn => {
            btn.classList.remove('bg-pink-600');
            btn.classList.add('bg-pink-500');
        });

        // Adiciona a classe ativa ao botÃ£o selecionado
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

// TambÃ©m exporte as outras funÃ§Ãµes relacionadas
window.fecharModal = fecharModal;
window.atualizarQuantidadeModal = window.atualizarQuantidadeModal;
window.comprarProdutoComCor = window.comprarProdutoComCor;
