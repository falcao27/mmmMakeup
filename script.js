import { createClient } from 'https://esm.sh/@supabase/supabase-js'
// Substitua os valores abaixo pelos seus dados do Supabase
const supabaseUrl = 'https://ixouszvipgklgdvmsyyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4b3VzenZpcGdrbGdkdm1zeXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NTc5ODgsImV4cCI6MjA0NzQzMzk4OH0.FxsdlpIFDHk9NDHp8mKn06_M54WasfIuTWLgA1L_ip8';

// Cria o cliente Supabase
export const supabase = createClient( supabaseUrl, supabaseKey);

// Adicione no início do seu arquivo, logo após a criação do cliente supabase
console.log('Testando conexão com Supabase...');

// Adicione isso logo após inicializar o cliente Supabase
document.body.insertAdjacentHTML('beforeend', `
    <div id="modal-produto" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div id="modal-content" class="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <!-- O conteúdo do modal será inserido dinamicamente aqui -->
        </div>
    </div>
`);

// Função para testar a conexão
async function testarConexao() {
    try {
        // Teste categorias
        const { data: categorias, error: catError } = await supabase
            .from('categorias')
            .select('*');
        console.log('Categorias:', categorias, 'Erro:', catError);

        // Teste subcategorias
        const { data: subcategorias, error: subError } = await supabase
            .from('subcategorias')
            .select('*');
        console.log('Subcategorias:', subcategorias, 'Erro:', subError);

        // Teste produtos
        const { data: produtos, error: prodError } = await supabase
            .from('produtos')
            .select('*');
        console.log('Produtos:', produtos, 'Erro:', prodError);

    } catch (error) {
        console.error('Erro ao testar conexão:', error);
    }
}

// Chame a função de teste quando a página carregar
document.addEventListener('DOMContentLoaded', testarConexao);

// Adicione no início do arquivo
console.log('Script carregado');

// Adicione esta função de teste
function testarConexaoSubcategorias() {
    supabase
        .from('subcategorias')
        .select('*')
        .then(({ data, error }) => {
            console.log('Teste subcategorias:', { data, error });
        });
}

// Chame a função quando a página carregar
document.addEventListener('DOMContentLoaded', testarConexaoSubcategorias);

// Constantes globais
const DEFAULT_IMAGE = 'https://placehold.co/400x300/pink/white?text=Menina+Moça';

// Função global para alternar o carrinho
window.toggleCarrinho = function() {
    console.log('Tentando alternar visibilidade do carrinho');
    const carrinho = document.getElementById('carrinho');
    if (carrinho) {
        console.log('Estado atual do carrinho:', carrinho.classList.contains('translate-x-full') ? 'fechado' : 'aberto');
        carrinho.classList.toggle('translate-x-full');
        console.log('Novo estado do carrinho:', carrinho.classList.contains('translate-x-full') ? 'fechado' : 'aberto');
    } else {
        console.error('Elemento do carrinho não encontrado');
    }
}

class CarrinhoManager {
    constructor() {
        this.items = [];
        this.loadFromStorage();
        this.atualizarCarrinhoUI();
    }

    async adicionarItem(produtoId, cor, quantidade = 1) {
        try {
            const feedbackElement = this.criarFeedbackElement('Adicionando ao carrinho...');

            const { data: produto, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('id', produtoId)
                .single();

            if (error) throw error;

            // Verifica se o produto tem cores e se uma cor foi selecionada
            if (produto.cores && !cor) {
                feedbackElement.textContent = 'Por favor, selecione uma cor antes de adicionar ao carrinho.';
                feedbackElement.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
                setTimeout(() => feedbackElement.remove(), 3000);
                return;
            }

            let itemExistente = this.items.find(item => 
                String(item.id) === String(produtoId) && 
                (!produto.cores || item.cor === cor)
            );

            if (itemExistente) {
                itemExistente.quantidade += quantidade;
            } else {
                // Usa o preço promocional se existir, senão usa o preço normal
                const precoAtual = produto.promocoe ? Number(produto.valor_promocoe) : Number(produto.preco);
                this.items.push({
                    ...produto,
                    cor: produto.cores ? cor : null,
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
        const itemId = `${item.id}-${item.cor || 'null'}`;
        return `
            <div class="flex items-center gap-4 p-4 border-b border-gray-100" id="item-${itemId}">
                <img src="${item.url_imagem || DEFAULT_IMAGE}" 
                     alt="${item.nome}" 
                     class="w-20 h-20 object-cover rounded-lg">
                
                <div class="flex-1">
                    <h3 class="font-medium text-gray-800">${item.nome}</h3>
                    ${item.cor ? `<p class="text-sm text-gray-500">Cor: ${item.cor}</p>` : ''}
                    <div class="text-pink-500 font-semibold">
                        R$ ${(item.precoAtual * item.quantidade).toFixed(2)}
                    </div>
                    
                    <div class="flex items-center justify-center gap-4 mt-2">
                        <button onclick="window.carrinhoManager.atualizarQuantidade('${item.id}', -1, ${item.cor ? `'${item.cor}'` : 'null'})" 
                                class="text-gray-600 text-lg font-medium">
                            -
                        </button>
                        <span id="quantidade-${itemId}" 
                              class="text-gray-600 text-lg font-medium">
                            ${item.quantidade}
                        </span>
                        <button onclick="window.carrinhoManager.atualizarQuantidade('${item.id}', 1, ${item.cor ? `'${item.cor}'` : 'null'})" 
                                class="text-gray-600 text-lg font-medium">
                            +
                        </button>
                    </div>
                </div>
                
                <button onclick="window.carrinhoManager.removerItem('${item.id}', ${item.cor ? `'${item.cor}'` : 'null'})" 
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
        console.log('Carregando carrinho do localStorage');
        const saved = localStorage.getItem('carrinho');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
                console.log('Carrinho carregado:', this.items);
            } catch (e) {
                console.error('Erro ao carregar carrinho do localStorage:', e);
                this.items = [];
            }
        }
    }

    saveToStorage() {
        console.log('Salvando carrinho no localStorage:', this.items);
        localStorage.setItem('carrinho', JSON.stringify(this.items));
    }

    removerItem(produtoId, cor) {
        console.log('Tentando remover item:', { produtoId, cor });
        console.log('Items antes:', this.items);
        
        // Ajuste na lógica do filtro para lidar com itens sem cor
        this.items = this.items.filter(item => {
            const idMatch = String(item.id) === String(produtoId);
            // Se o item não tem cor definida, só compara o ID
            if (!item.cor && !cor) return !idMatch;
            return !(idMatch && item.cor === cor);
        });
        
        console.log('Items depois:', this.items);
        this.saveToStorage();
        this.atualizarCarrinhoUI();
    }

    async atualizarQuantidade(produtoId, delta, cor) {
        try {
            console.log('Atualizando quantidade:', { produtoId, delta, cor });
            
            // Encontra o item considerando que cor pode ser null/undefined
            const item = this.items.find(item => {
                const idMatch = String(item.id) === String(produtoId);
                // Se o item não tem cor definida, ignora a comparação de cor
                if (!item.cor && !cor) return idMatch;
                return idMatch && item.cor === cor;
            });
            
            console.log('Item encontrado:', item);
            
            if (item) {
                const novaQuantidade = Math.max(1, item.quantidade + delta);
                if (novaQuantidade <= 0) {
                    await this.removerItem(produtoId, cor);
                } else {
                    item.quantidade = novaQuantidade;
                    this.saveToStorage();
                    this.atualizarCarrinhoUI();
                }
            } else {
                console.error('Item não encontrado:', { produtoId, cor });
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

// Funções globais
function toggleCarrinho() {
    console.log('Tentando alternar visibilidade do carrinho');
    const carrinho = document.getElementById('carrinho');
    if (carrinho) {
        console.log('Estado atual do carrinho:', carrinho.classList.contains('translate-x-full') ? 'fechado' : 'aberto');
        carrinho.classList.toggle('translate-x-full');
        console.log('Novo estado do carrinho:', carrinho.classList.contains('translate-x-full') ? 'fechado' : 'aberto');
    } else {
        console.error('Elemento do carrinho não encontrado');
    }
}

// Adicione esta função ao início do seu arquivo script.js para torná-la global
window.finalizarCompra = function() {
    try {
        if (window.carrinhoManager.items.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        // Remove qualquer modal existente antes de criar um novo
        fecharModalPagamento();
        
        const modalHTML = `
            <div id="payment-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 class="text-xl font-semibold mb-4">Escolha a forma de pagamento</h3>
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pagamento" value="Cartão de Crédito" class="h-4 w-4 text-pink-500">
                                <span>Cartão de Crédito</span>
                            </label>
                            
                            <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pagamento" value="Cartão de Débito" class="h-4 w-4 text-pink-500">
                                <span>Cartão de Débito</span>
                            </label>
                            
                            <label class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="pagamento" value="PIX" class="h-4 w-4 text-pink-500">
                                <span>PIX</span>
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

function confirmarPagamento() {
    try {
        const selectedPayment = document.querySelector('input[name="pagamento"]:checked');
        
        if (!selectedPayment) {
            alert('Por favor, selecione uma forma de pagamento');
            return;
        }

        // Criar a mensagem para o WhatsApp
        let message = 'Olá! Gostaria de fazer um pedido:\n\n';
        message += 'Itens do pedido:\n';
        
        const cartItems = window.carrinhoManager.items;
        let total = 0;
        
        cartItems.forEach(item => {
            const itemPreco = item.valor_promocoe || item.preco;
            const subtotal = itemPreco * item.quantidade;
            total += subtotal;
            
            message += `- ${item.nome} (${item.quantidade}x) - R$ ${subtotal.toFixed(2)}\n`;
            if (item.cor) {
                message += `  Cor: ${item.cor}\n`;
            }
        });
        
        message += `\nTotal: R$ ${total.toFixed(2)}`;
        message += `\nForma de pagamento: ${selectedPayment.value}`;

        // Número do WhatsApp da loja
        const phoneNumber = '5585988740788';
        
        // Criar o link do WhatsApp e redirecionar
        const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        // Atualizar estoque e quantidade vendida para cada item no carrinho
        Promise.all(cartItems.map(async (item) => {
            try {
                const { data: produto, error: fetchError } = await supabase
                    .from('produtos')
                    .select('estoque, qtd_vendidos')
                    .eq('id', item.id)
                    .single();

                if (fetchError) throw fetchError;

                if (produto.estoque < item.quantidade) {
                    throw new Error(`Desculpe, não há estoque suficiente para ${item.nome}. Disponível: ${produto.estoque}`);
                }

                const { error: updateError } = await supabase
                    .from('produtos')
                    .update({
                        estoque: produto.estoque - item.quantidade,
                        qtd_vendidos: (produto.qtd_vendidos || 0) + item.quantidade
                    })
                    .eq('id', item.id);

                if (updateError) throw updateError;
            } catch (error) {
                console.error('Erro ao atualizar estoque:', error);
                throw error;
            }
        })).then(() => {
            // Fechar o modal antes do redirecionamento
            const modal = document.getElementById('payment-modal');
            if (modal) {
                modal.remove();
            }
            
            // Limpar o carrinho
            window.carrinhoManager.limparCarrinho();
            
            // Redirecionar para o WhatsApp
            window.open(whatsappLink, '_blank');
            
            // Recarregar a página
            location.reload();
        }).catch(error => {
            alert(error.message || 'Erro ao processar pagamento. Por favor, tente novamente.');
        });

    } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
        alert('Erro ao processar pagamento. Por favor, tente novamente.');
    }
}

// Adicionar apenas as funções que ainda não existem ao escopo global
window.finalizarCompra = finalizarCompra;
window.confirmarPagamento = confirmarPagamento;
window.fecharModalPagamento = fecharModalPagamento;

// Para debugar e verificar se a função está sendo chamada
document.addEventListener('DOMContentLoaded', function() {
    const finalizarBtn = document.querySelector('button[onclick="finalizarCompra()"]');
    if (finalizarBtn) {
        console.log('Botão "Finalizar Compra" encontrado');
        finalizarBtn.addEventListener('click', function() {
            console.log('Botão clicado');
        });
    } else {
        console.error('Botão "Finalizar Compra" não encontrado no DOM');
    }
});

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

// Atualizar a função de pesquisa
async function filterProductsBySearchTerm(searchTerm) {
    try {
        if (!searchTerm.trim()) return;

        const normalizedSearchTerm = normalizeText(searchTerm);
        console.log('Termo de busca normalizado:', normalizedSearchTerm);

        // Buscar todos os produtos e filtrar no cliente
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select(`
                *,
                categoria:categoria_id (
                    id,
                    nome
                )
            `);

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
        console.log('Iniciando carregamento de produtos para categoria:', categoriaNome);
        const produtosContainer = document.getElementById('produtos-container');
        
        if (!produtosContainer) {
            console.error('Container de produtos não encontrado');
            return;
        }

        let query = supabase
            .from('produtos')
            .select(`
                *,
                categoria:categoria_id (
                    id,
                    nome
                )
            `);

        const { data: produtos, error } = await query;
        
        if (error) {
            console.error('Erro ao buscar produtos:', error);
            throw error;
        }

        console.log('Produtos recebidos:', produtos);

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
    const temDesconto = produto.promocoe && produto.valor_promocoe;
    // Adiciona verificação de segurança para os preços
    const valorOriginal = produto.preco ? Number(produto.preco).toFixed(2) : '0.00';
    const valorPromocional = produto.valor_promocoe ? Number(produto.valor_promocoe).toFixed(2) : '0.00';
    const valorFinal = temDesconto ? valorPromocional : valorOriginal;

    return `
        <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div class="relative">
                <img src="${produto.url_imagem || DEFAULT_IMAGE}" 
                     alt="${produto.nome}" 
                     onerror="this.src='${DEFAULT_IMAGE}'"
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
                    ${produto.nome || 'Produto sem nome'}
                </h3>

                <div class="flex flex-col gap-3">
                    <div>
                        ${temDesconto ? `
                            <span class="text-sm text-gray-400 line-through">
                                R$ ${valorOriginal}
                            </span>
                            <span class="text-2xl font-bold text-pink-500 ml-2">
                                R$ ${valorFinal}
                            </span>
                        ` : `
                            <span class="text-2xl font-bold text-pink-500">
                                R$ ${valorFinal}
                            </span>
                        `}
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="abrirDetalheProduto('${produto.id}')"
                                class="flex-1 bg-gray-100 text-gray-800 py-3 rounded-2xl font-medium 
                                       hover:bg-gray-200 transition-all duration-300">
                            Saiba Mais
                        </button>
                        <button onclick="window.carrinhoManager.adicionarItem('${produto.id}', '${produto.cores ? produto.cores.split(',')[0] : ''}')"
                                class="flex-1 bg-pink-500 text-white py-3 rounded-2xl font-medium 
                                       hover:bg-pink-600 transition-all duration-300">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Adicione este código ao seu script.js

// Configuração do slider
let currentSlide = 0;
const slider = document.getElementById('slider');
const slides = slider.children.length;

function updateSlider() {
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides;
    updateSlider();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides) % slides;
    updateSlider();
}

// Opcional: Adicionar transição automática
setInterval(nextSlide, 5000); // Muda slide a cada 5 segundos

// Função atualizada para carregar categorias com melhor tratamento de erro
async function carregarCategorias() {
    try {
        console.log('Iniciando carregamento de categorias...');
        
        const { data: categorias, error: catError } = await supabase
            .from('categorias')
            .select(`
                *,
                subcategorias (
                    id,
                    nome,
                    categoria_id
                )
            `);

        if (catError) throw catError;

        const categoriasButtons = document.getElementById('categorias-buttons');
        if (!categoriasButtons) {
            console.error('Elemento categorias-buttons não encontrado');
            return;
        }

        let buttonsHTML = `
            <div class="flex flex-wrap gap-4 items-center justify-center mb-8">
                <!-- Grupo de ordenação -->
                <div class="relative group mr-4">
                    <button class="category-btn px-6 py-2 text-sm rounded-full bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                        Ordenar por
                        <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    <div class="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 
                                mt-0 pt-2 w-48 transition-all duration-200">
                        <div class="bg-white rounded-xl shadow-lg py-2 transform translate-y-2 group-hover:translate-y-0">
                            <button 
                                onclick="ordenarPorMenorPreco()"
                                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors duration-150">
                                Menor Preço
                            </button>
                            <button 
                                onclick="ordenarPorMaiorPreco()"
                                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors duration-150">
                                Maior Preço
                            </button>
                            <button 
                                onclick="ordenarPorMaisVendidos()"
                                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors duration-150">
                                Mais Vendidos
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Botão Todos os Produtos -->
                <button onclick="filterProducts('todos')"
                    class="category-btn active px-6 py-2 text-sm rounded-full bg-white shadow-sm hover:shadow-md transition-all"
                    data-category="todos">
                    Todos os Produtos
                </button>

                <!-- Categorias existentes -->
                ${categorias.map(categoria => `
                    <div class="relative group">
                        <button 
                            onclick="filterProducts(${categoria.id})"
                            class="category-btn px-6 py-2 text-sm rounded-full bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                            data-category="${categoria.id}">
                            ${categoria.nome}
                            ${categoria.subcategorias.length > 0 ? `
                                <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            ` : ''}
                        </button>
                        
                        ${categoria.subcategorias.length > 0 ? `
                            <div class="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 
                                        mt-0 pt-2 w-48 transition-all duration-200">
                                <div class="bg-white rounded-xl shadow-lg py-2 transform translate-y-2 group-hover:translate-y-0">
                                    ${categoria.subcategorias.map(sub => `
                                        <button 
                                            onclick="filterProductsBySubcategory(event, ${sub.id})"
                                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors duration-150">
                                            ${sub.nome}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        categoriasButtons.innerHTML = buttonsHTML;

    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        const categoriasButtons = document.getElementById('categorias-buttons');
        if (categoriasButtons) {
            categoriasButtons.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-red-500">Erro ao carregar categorias</p>
                </div>
            `;
        }
    }
}

// Adicione esta linha para tornar a função global
window.filterProductsBySubcategory = filterProductsBySubcategory;

// Função atualizada para filtrar por subcategoria
async function filterProductsBySubcategory(event, subcategoriaId) {
    event.preventDefault(); // Previne o comportamento padrão do botão
    event.stopPropagation(); // Impede a propagação do evento para o botão da categoria
    
    try {
        console.log('Filtrando produtos por subcategoria:', subcategoriaId);
        
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select(`
                *,
                categoria:categoria_id (
                    id,
                    nome
                )
            `)
            .eq('subcategoria_id', subcategoriaId);

        if (error) throw error;

        const produtosContainer = document.getElementById('produtos-container');
        if (!produtosContainer) {
            console.error('Container de produtos não encontrado');
            return;
        }

        if (produtos && produtos.length > 0) {
            console.log('Produtos encontrados:', produtos.length);
            produtosContainer.innerHTML = produtos.map(produto => renderizarProduto(produto)).join('');
        } else {
            console.log('Nenhum produto encontrado para esta subcategoria');
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Nenhum produto encontrado nesta subcategoria.</p>
                </div>
            `;
        }

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

// Adiciona listener para fechar dropdowns ao clicar fora
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown-container')) {
        document.querySelectorAll('.subcategories-dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    }
});

// Função atualizada para filtrar produtos
window.filterProducts = async function(categoryId) {
    try {
        console.log('Filtrando produtos por categoria ID:', categoryId);
        
        let query = supabase
            .from('produtos')
            .select(`
                *,
                categoria:categoria_id (
                    id,
                    nome
                )
            `);

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
            console.log(`${produtos.length} produtos encontrados`);
        } else {
            produtosContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Nenhum produto encontrado nesta categoria.</p>
                </div>
            `;
        }

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

// Função para testar a conexão com o Supabase
async function testarConexaoSupabase(){
    try {
        const { data, error } = await window.supabaseClient
            .from('produtos')
            .select('count');
            
        if (error) throw error;

        console.log('Dados recebidos:', data);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

async function fetchData() {
    try {
        const { data, error } = await supabase
            .from('sua_tabela')
            .select('*');

        if (error) {
            throw error; // Lança o erro para ser capturado no catch
        }

        console.log('Dados recebidos:', data);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

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
            <img src="${product.url_imagem || DEFAULT_IMAGE}" alt="${product.nome}" class="w-full h-40 object-cover mb-4">
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
                        <img src="${produto.url_imagem || DEFAULT_IMAGE}" 
                             alt="${produto.nome}" 
                             onerror="this.src='${DEFAULT_IMAGE}'"
                             class="w-full h-64 object-cover">
                        
                        ${produto.promocoe ? `
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
                                ${produto.promocoe ? `
                                    <span class="text-sm text-gray-400 line-through">
                                        R$ ${produto.preco.toFixed(2)}
                                    </span>
                                    <span class="text-2xl font-bold text-pink-500 ml-2">
                                        R$ ${produto.valor_promocoe.toFixed(2)}
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
                                <button onclick="window.carrinhoManager.adicionarItem('${produto.id}', '${produto.cores ? produto.cores.split(',')[0] : ''}')"
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
        console.log('Iniciando carregamento de produtos em destaque...');
        const destaquesContainer = document.getElementById('destaques-container');
        if (!destaquesContainer) {
            console.error('Container de destaque não encontrado');
            return;
        }
        
        const { data: produtos, error } = await supabase
        .from('produtos')
        .select(`
            *,
            categoria:categoria_id (
                id,
                nome
            )
        `)
        .eq('destaque',true);

        if (error) {
            console.error('Erro ao buscar produtos em destaque:', error);
            throw error;
        }

        console.log('Produtos em destaque recebidos:', produtos);

        destaquesContainer.innerHTML = '';

        if (produtos && produtos.length > 0) {
            produtos.forEach(produto => {
                const temDesconto = produto.promocoe && produto.valor_promocoe;
                const valorOriginal = produto.preco ? produto.preco.toFixed(2) : '0.00';
                const valorFinal = temDesconto ? produto.valor_promocoe.toFixed(2) : valorOriginal;

                destaquesContainer.innerHTML += `
                    <div class="w-full flex-shrink-0">
                        <div class="mx-4">
                            <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div class="relative">
                                    <img src="${produto.url_imagem || DEFAULT_IMAGE}" 
                                         alt="${produto.nome}" 
                                         onerror="this.src='${DEFAULT_IMAGE}'"
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
                                            <button onclick="window.carrinhoManager.adicionarItem('${produto.id}', '${produto.cores ? produto.cores.split(',')[0] : ''}')"
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
        console.log('Iniciando carregamento de produtos em promoção...');
        const promocoesContainer = document.getElementById('ofertas-container');
        
        if (!promocoesContainer) {
            console.error('Container de promoções não encontrado');
            return;
        }

        const { data: produtos, error } = await supabase
            .from('produtos')
            .select(`
                *,
                categoria:categoria_id (
                    id,
                    nome
                )
            `)
            .eq('promocoe', true);

        if (error) {
            console.error('Erro ao buscar produtos em promoção:', error);
            throw error;
        }

        console.log('Produtos em promoção recebidos:', produtos);

        promocoesContainer.innerHTML = '';

        if (produtos && produtos.length > 0) {
            produtos.forEach(produto => {
                const temDesconto = produto.promocoe && produto.valor_promocoe;
                const valorOriginal = produto.preco ? produto.preco.toFixed(2) : '0.00';
                const valorFinal = temDesconto ? produto.valor_promocoe.toFixed(2) : valorOriginal;

                promocoesContainer.innerHTML += `
                    <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div class="relative">
                            <img src="${produto.url_imagem || DEFAULT_IMAGE}" 
                                 alt="${produto.nome}" 
                                 onerror="this.src='${DEFAULT_IMAGE}'"
                                 class="w-full h-64 object-cover">
                            
                            <div class="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1.5 
                                        rounded-full font-medium shadow-lg">
                                Promoção
                            </div>
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
                                    <span class="text-sm text-gray-400 line-through">
                                        R$ ${valorOriginal}
                                    </span>
                                    <span class="text-2xl font-bold text-pink-500 ml-2">
                                        R$ ${valorFinal}
                                    </span>
                                </div>
                                
                                <div class="flex gap-2">
                                    <button onclick="abrirDetalheProduto('${produto.id}')"
                                            class="flex-1 bg-gray-100 text-gray-800 py-3 rounded-2xl font-medium 
                                                   hover:bg-gray-200 transition-all duration-300">
                                        Saiba Mais
                                    </button>
                                    <button onclick="window.carrinhoManager.adicionarItem('${produto.id}', '${produto.cores ? produto.cores.split(',')[0] : ''}')"
                                            class="flex-1 bg-pink-500 text-white py-3 rounded-2xl font-medium 
                                                   hover:bg-pink-600 transition-all duration-300">
                                        Adicionar ao Carrinho
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
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
        console.log('Iniciando aplicação...');
        
        if (!supabase) {
            throw new Error('Supabase não está inicializado');
        }
        
        console.log('Supabase inicializado com sucesso');
        
        window.carrinhoManager = new CarrinhoManager();
        console.log('Carrinho inicializado');
        
        await carregarCategorias();
        await filterProducts('todos');
        await carregarProdutosDestaque();
        await carregarProdutosPromocao(); // Carrega produtos em promoção
        await loadAllProducts();
        handleSearchInput();
        
        console.log('Inicialização concluída com sucesso');
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

// Adicione esta linha no início do arquivo
window.abrirDetalheProduto = abrirDetalheProduto;

// Função para abrir o modal com detalhes do produto
async function abrirDetalheProduto(produtoId) {
    try {
        const modal = document.getElementById('modal-produto');
        const modalContent = document.getElementById('modal-content');
        
        if (!modal || !modalContent) {
            console.error('Modal ou conteúdo do modal não encontrado');
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
            // Atualiza as referências
            modal = document.getElementById('modal-produto');
            modalContent = document.getElementById('modal-content');
        }

        const { data: produto, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', produtoId)
            .single();

        if (error) throw error;

        // Processa as cores se existirem
        const cores = produto.cores ? produto.cores.split(',').map(cor => cor.trim()).filter(cor => cor) : [];
        
        // Determina se o produto está em promoção e calcula os preços
        const temDesconto = produto.promocoe && produto.valor_promocoe;
        const valorOriginal = produto.preco ? Number(produto.preco).toFixed(2) : '0.00';
        const valorPromocional = produto.valor_promocoe ? Number(produto.valor_promocoe).toFixed(2) : '0.00';
        
        modalContent.innerHTML = `
            <button onclick="fecharModal()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                <!-- Imagem do Produto -->
                <div class="relative">
                    <img src="${produto.url_imagem || DEFAULT_IMAGE}" 
                         alt="${produto.nome}"
                         class="w-full h-auto rounded-lg shadow-lg">
                    ${temDesconto ? `
                        <div class="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1.5 
                                    rounded-full font-medium shadow-lg">
                            Promoção
                        </div>
                    ` : ''}
                </div>

                <!-- Informações do Produto -->
                <div class="space-y-4">
                    <h2 class="text-2xl font-bold text-gray-800">${produto.nome}</h2>
                    
                    <div class="flex items-center space-x-2">
                        <span class="text-gray-600">Estoque:</span>
                        <span class="text-gray-600 font-semibold">${produto.estoque || 0} unidades</span>
                    </div>

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
                                R$ ${valorOriginal}
                            </span>
                        `}
                    </div>

                    ${cores.length > 0 ? `
                        <div class="space-y-2">
                            <span class="text-gray-600 font-medium">Selecione a cor:</span>
                            <div class="flex flex-wrap gap-2" id="cores-container">
                                ${cores.map((cor, index) => `
                                    <button 
                                        onclick="selecionarCor('${cor}')"
                                        class="cor-btn px-8 py-3 rounded-full transition-colors 
                                               ${index === 0 ? 'bg-pink-600' : 'bg-pink-500'} 
                                               text-white hover:bg-pink-600"
                                        data-cor="${cor}">
                                        ${cor}
                                    </button>
                                `).join('')}
                            </div>
                            <p id="cor-selecionada" class="text-sm text-gray-500 mt-2">
                                ${cores.length > 0 ? `Cor selecionada: ${cores[0]}` : ''}
                            </p>
                        </div>
                    ` : ''}

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

                    <button onclick="comprarProdutoComCor('${produto.id}')"
                            class="w-full bg-pink-500 text-white py-3 rounded-xl font-medium 
                                   hover:bg-pink-600 transition-all duration-300 mt-4">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>

            <!-- Descrição do Produto -->
            <div class="p-6 border-t border-gray-100">
                <h3 class="text-xl font-semibold mb-4">Descrição do Produto</h3>
                <p class="text-gray-600 leading-relaxed">
                    ${produto.descricao || 'Descrição não disponível'}
                </p>
            </div>
        `;

        // Se houver cores, seleciona a primeira por padrão
        if (cores.length > 0) {
            selecionarCor(cores[0]);
        }

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
            quantidade = Math.max(1, quantidade + delta); // Não permite quantidade menor que 1
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
        // Primeiro, busca o produto para verificar se tem cores
        const { data: produto, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', produtoId)
            .single();

        if (error) throw error;

        // Verifica se o produto tem cores definidas
        if (produto.cores) {
            const corSelecionada = document.querySelector('.cor-btn.bg-pink-600')?.dataset.cor;
            
            if (!corSelecionada) {
                const feedbackElement = document.createElement('div');
                feedbackElement.textContent = 'Por favor, selecione uma cor antes de adicionar ao carrinho.';
                feedbackElement.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
                document.body.appendChild(feedbackElement);
                setTimeout(() => feedbackElement.remove(), 3000);
                return;
            }
        }

        const quantidade = parseInt(document.getElementById('quantidade-modal')?.textContent || '1');
        const corSelecionada = produto.cores ? document.querySelector('.cor-btn.bg-pink-600')?.dataset.cor : '';
        
        await window.carrinhoManager.adicionarItem(produtoId, corSelecionada, quantidade);
        fecharModal();
    } catch (error) {
        console.error('Erro ao adicionar produto ao carrinho:', error);
        alert('Erro ao adicionar produto ao carrinho. Por favor, tente novamente.');
    }
}

// Também exporte as outras funções relacionadas
window.fecharModal = fecharModal;
window.atualizarQuantidadeModal = atualizarQuantidadeModal;
window.comprarProdutoComCor = comprarProdutoComCor;

// Função para buscar produtos por subcategoria
async function buscarProdutosPorSubcategoria(subcategoriaId) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        subprodutos!inner(*)
      `)
      .eq('subprodutos.id', subcategoriaId);

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

// Função para exibir produtos quando uma subcategoria é selecionada
async function selecionarSubcategoria(subcategoriaId) {
  const produtos = await buscarProdutosPorSubcategoria(subcategoriaId);
  const container = document.getElementById('produtos-container');
  
  container.innerHTML = ''; // Limpa o container

  produtos.forEach(produto => {
    // Cria o card do produto
    const card = `
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <img src="${produto.imagem}" alt="${produto.nome}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-semibold">${produto.nome}</h3>
          <p class="text-gray-600">R$ ${produto.preco.toFixed(2)}</p>
          <button onclick="abrirModal(${produto.id})" 
                  class="mt-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">
            Saiba Mais
          </button>
        </div>
      </div>
    `;
    
    container.innerHTML += card;
  });
}

// Função para lidar com a seleção de pagamento
function handlePaymentSelection() {
    const selectedPayment = document.querySelector('input[name="pagamento"]:checked');
    if (!selectedPayment) {
        alert('Por favor, selecione uma forma de pagamento');
        return;
    }
    
    // Monta a mensagem para o WhatsApp
    const message = `Olá! Gostaria de fazer um pedido com pagamento via ${selectedPayment.value}.`;
    
    // Número do WhatsApp da loja
    const phoneNumber = "5585988740788";
    
    // Cria o link do WhatsApp com a mensagem
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Redireciona para o WhatsApp
    window.location.href = whatsappLink;
}

// Se você precisar adicionar event listeners, faça isso após garantir que o DOM está carregado:
document.addEventListener('DOMContentLoaded', function() {
    // Aqui você pode adicionar seus event listeners com segurança
    const confirmarBtn = document.querySelector('.confirmar-btn');
    if (confirmarBtn) {
        confirmarBtn.addEventListener('click', handlePaymentSelection);
    }
});

// Adicione a função handleSearchInput
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






