require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnv = requiredEnv.filter(name => !process.env[name]);
if (missingEnv.length > 0) {
    console.error(`Variaveis de ambiente ausentes: ${missingEnv.join(', ')}`);
    process.exit(1);
}
// â”€â”€ Supabase Admin (service role â€“ apenas server-side) â”€â”€â”€â”€â”€â”€â”€â”€
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// â”€â”€ Servir o frontend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// â”€â”€ Middleware: verificar token Supabase + is_admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function verificarAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token nÃ£o fornecido' });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ erro: 'Token invÃ¡lido ou expirado' });

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) return res.status(403).json({ erro: 'Acesso negado. NÃ£o Ã© administrador.' });

    req.user = user;
    next();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ROTAS DE USUÃRIOS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

async function verificarUsuario(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token nao fornecido' });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ erro: 'Token invalido ou expirado' });

    req.user = user;
    next();
}

app.post('/api/checkout', verificarUsuario, async (req, res) => {
    const { forma_pagamento, itens } = req.body;

    if (!forma_pagamento) {
        return res.status(400).json({ erro: 'Selecione uma forma de pagamento.' });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ erro: 'Carrinho vazio.' });
    }

    try {
        const itensVenda = [];
        let total = 0;

        for (const item of itens) {
            const produtoId = Number(item.produto_id);
            const quantidade = Number(item.quantidade || 0);

            if (!produtoId || quantidade < 1) {
                return res.status(400).json({ erro: 'Item invalido no carrinho.' });
            }

            const { data: produto, error: produtoErr } = await supabaseAdmin
                .from('produtos')
                .select('id, nome, preco, estoque, qtd_vendidos')
                .eq('id', produtoId)
                .single();

            if (produtoErr || !produto) {
                return res.status(404).json({ erro: `Produto nao encontrado: ${produtoId}` });
            }

            if (Number(produto.estoque || 0) < quantidade) {
                return res.status(409).json({
                    erro: `Estoque insuficiente para "${produto.nome}". Disponivel: ${produto.estoque || 0}`,
                });
            }

            const preco = Number(produto.preco || 0);
            const subtotal = Number((preco * quantidade).toFixed(2));
            total += subtotal;

            itensVenda.push({
                produto_id: produto.id,
                nome_produto: produto.nome,
                preco_unitario: preco,
                quantidade,
                cor: item.cor || null,
                subtotal,
                estoque_atual: Number(produto.estoque || 0),
                qtd_vendidos_atual: Number(produto.qtd_vendidos || 0),
            });
        }

        total = Number(total.toFixed(2));

        const { data: venda, error: vendaErr } = await supabaseAdmin
            .from('vendas')
            .insert({
                user_id: req.user.id,
                status: 'pendente',
                forma_pagamento,
                total,
            })
            .select()
            .single();

        if (vendaErr) throw vendaErr;

        const { error: itensErr } = await supabaseAdmin
            .from('venda_itens')
            .insert(itensVenda.map(({ estoque_atual, qtd_vendidos_atual, ...item }) => ({
                ...item,
                venda_id: venda.id,
            })));

        if (itensErr) throw itensErr;

        for (const item of itensVenda) {
            const { error: updateErr } = await supabaseAdmin
                .from('produtos')
                .update({
                    estoque: item.estoque_atual - item.quantidade,
                    qtd_vendidos: item.qtd_vendidos_atual + item.quantidade,
                })
                .eq('id', item.produto_id);

            if (updateErr) throw updateErr;
        }

        let message = 'Ola! Gostaria de fazer um pedido:\n\nItens do pedido:\n';
        itensVenda.forEach(item => {
            message += `- ${item.nome_produto} (${item.quantidade}x) - R$ ${item.subtotal.toFixed(2)}\n`;
            if (item.cor) message += `  Cor: ${item.cor}\n`;
        });
        message += `\nTotal: R$ ${total.toFixed(2)}`;
        message += `\nForma de pagamento: ${forma_pagamento}`;

        const whatsappLink = `https://wa.me/5585988740788?text=${encodeURIComponent(message)}`;

        res.json({ venda_id: venda.id, total, whatsappLink });
    } catch (error) {
        console.error('Erro no checkout:', error);
        res.status(500).json({ erro: 'Erro ao finalizar compra. Tente novamente.' });
    }
});

app.delete('/api/admin/usuarios/:id', verificarAdmin, async (req, res) => {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
    if (error) return res.status(500).json({ erro: error.message });
    res.json({ mensagem: 'UsuÃ¡rio removido com sucesso' });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ROTAS DE ESTOQUE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Registrar movimentaÃ§Ã£o de estoque (via service role â€” bypassa RLS)
app.post('/api/admin/estoque/movimentar', verificarAdmin, async (req, res) => {
    const { produto_id, tipo, quantidade, motivo } = req.body;

    if (!produto_id || !tipo || !quantidade) {
        return res.status(400).json({ erro: 'produto_id, tipo e quantidade sÃ£o obrigatÃ³rios.' });
    }

    const tiposValidos = ['entrada', 'saida', 'ajuste', 'venda', 'devolucao'];
    if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ erro: `Tipo invÃ¡lido. Use: ${tiposValidos.join(', ')}` });
    }

    // Busca estoque atual
    const { data: produto, error: fetchErr } = await supabaseAdmin
        .from('produtos')
        .select('estoque, nome')
        .eq('id', produto_id)
        .single();

    if (fetchErr || !produto) return res.status(404).json({ erro: 'Produto nÃ£o encontrado.' });

    const delta = ['saida'].includes(tipo) ? -quantidade : quantidade;
    const novoEstoque = produto.estoque + delta;

    if (novoEstoque < 0) {
        return res.status(400).json({ erro: `Estoque insuficiente. Atual: ${produto.estoque}` });
    }

    // Atualiza estoque
    const { error: upErr } = await supabaseAdmin
        .from('produtos')
        .update({ estoque: novoEstoque })
        .eq('id', produto_id);

    if (upErr) return res.status(500).json({ erro: upErr.message });

    // Registra movimentaÃ§Ã£o
    const { data: mov, error: movErr } = await supabaseAdmin
        .from('estoque_movimentos')
        .insert({
            produto_id,
            tipo,
            quantidade,
            estoque_antes: produto.estoque,
            estoque_depois: novoEstoque,
            motivo: motivo || null,
            admin_id: req.user.id
        })
        .select()
        .single();

    if (movErr) {
        // Tabela pode nÃ£o existir â€“ retorna sucesso parcial
        return res.json({ mensagem: 'Estoque atualizado. (MovimentaÃ§Ã£o nÃ£o registrada â€” execute a migraÃ§Ã£o SQL)', novoEstoque });
    }

    res.json({ mensagem: 'Estoque atualizado com sucesso', novoEstoque, movimentacao: mov });
});

// Buscar produto por cÃ³digo de barras
app.get('/api/admin/produtos/barcode/:codigo', verificarAdmin, async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('produtos')
        .select('*, categorias(nome), subcategorias(nome)')
        .eq('codigo_barras', req.params.codigo)
        .maybeSingle();

    if (error) return res.status(500).json({ erro: error.message });
    if (!data) return res.status(404).json({ erro: 'Produto nÃ£o encontrado com este cÃ³digo.' });
    res.json(data);
});

// Alerta de estoque crÃ­tico
app.get('/api/admin/estoque/alertas', verificarAdmin, async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('produtos')
        .select('id, nome, estoque, codigo_barras, categorias(nome)')
        .lt('estoque', 5)
        .order('estoque', { ascending: true });

    if (error) return res.status(500).json({ erro: error.message });
    res.json({ alertas: data || [], total: data?.length || 0 });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ROTAS DE RELATÃ“RIOS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Resumo de vendas por perÃ­odo
app.get('/api/admin/relatorios/vendas', verificarAdmin, async (req, res) => {
    const dias = parseInt(req.query.dias || 30);
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);

    const { data: vendas, error: vErr } = await supabaseAdmin
        .from('vendas')
        .select('id, total, status, forma_pagamento, created_at, user_id')
        .gte('created_at', desde.toISOString());

    if (vErr) return res.status(500).json({ erro: vErr.message });

    const vAtivas = vendas.filter(v => v.status !== 'cancelado');
    const totalReceita = vAtivas.reduce((s, v) => s + Number(v.total || 0), 0);
    const ticketMedio  = vAtivas.length ? totalReceita / vAtivas.length : 0;

    // Agrupar por dia
    const porDia = {};
    vAtivas.forEach(v => {
        const dia = v.created_at.slice(0, 10);
        if (!porDia[dia]) porDia[dia] = { pedidos: 0, receita: 0 };
        porDia[dia].pedidos++;
        porDia[dia].receita += Number(v.total || 0);
    });

    // Agrupar por pagamento
    const porPagamento = {};
    vAtivas.forEach(v => {
        const k = v.forma_pagamento || 'NÃ£o informado';
        if (!porPagamento[k]) porPagamento[k] = { pedidos: 0, receita: 0 };
        porPagamento[k].pedidos++;
        porPagamento[k].receita += Number(v.total || 0);
    });

    // Agrupar por status
    const porStatus = {};
    vendas.forEach(v => {
        if (!porStatus[v.status]) porStatus[v.status] = 0;
        porStatus[v.status]++;
    });

    res.json({
        periodo: { dias, desde: desde.toISOString() },
        resumo: {
            totalPedidos: vendas.length,
            pedidosAtivos: vAtivas.length,
            totalReceita: totalReceita.toFixed(2),
            ticketMedio: ticketMedio.toFixed(2),
            cancelamentos: vendas.filter(v => v.status === 'cancelado').length,
        },
        porDia,
        porPagamento,
        porStatus,
    });
});

// Top produtos mais vendidos por perÃ­odo
app.get('/api/admin/relatorios/top-produtos', verificarAdmin, async (req, res) => {
    const dias  = parseInt(req.query.dias || 30);
    const limit = parseInt(req.query.limit || 10);
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);

    const { data, error } = await supabaseAdmin
        .from('venda_itens')
        .select('produto_id, nome_produto, quantidade, subtotal, vendas!inner(created_at, status)')
        .gte('vendas.created_at', desde.toISOString())
        .neq('vendas.status', 'cancelado');

    if (error) return res.status(500).json({ erro: error.message });

    const agrupado = {};
    (data || []).forEach(i => {
        const k = i.produto_id || i.nome_produto;
        if (!agrupado[k]) agrupado[k] = { produto_id: i.produto_id, nome: i.nome_produto, qtd: 0, receita: 0 };
        agrupado[k].qtd     += i.quantidade;
        agrupado[k].receita += Number(i.subtotal || 0);
    });

    const top = Object.values(agrupado)
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, limit);

    res.json({ periodo: { dias }, top });
});

// MovimentaÃ§Ãµes de estoque
app.get('/api/admin/estoque/movimentos', verificarAdmin, async (req, res) => {
    const { produto_id, tipo, limit = 100 } = req.query;
    let q = supabaseAdmin
        .from('estoque_movimentos')
        .select('*, produtos(nome, codigo_barras)')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

    if (produto_id) q = q.eq('produto_id', produto_id);
    if (tipo)       q = q.eq('tipo', tipo);

    const { data, error } = await q;
    if (error) return res.status(500).json({ erro: error.message });
    res.json(data || []);
});

// â”€â”€ SPA fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\nâœ… Servidor rodando em http://localhost:${PORT}`);
    console.log(`ðŸ”‘ Painel admin:    http://localhost:${PORT}/admin.html`);
    console.log(`ðŸ›ï¸  Loja:            http://localhost:${PORT}/\n`);
    console.log('ðŸ“‹ Rotas disponÃ­veis:');
    console.log('   DELETE /api/admin/usuarios/:id');
    console.log('   POST   /api/admin/estoque/movimentar');
    console.log('   GET    /api/admin/estoque/alertas');
    console.log('   GET    /api/admin/estoque/movimentos');
    console.log('   GET    /api/admin/produtos/barcode/:codigo');
    console.log('   GET    /api/admin/relatorios/vendas?dias=30');
    console.log('   GET    /api/admin/relatorios/top-produtos?dias=30&limit=10\n');
});
