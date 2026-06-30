require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const crypto = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '5585988740788';
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const APP_URL = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const API_URL = (process.env.API_URL || APP_URL).replace(/\/$/, '');
const frontendPath = path.resolve(__dirname, '..', 'frontend');
const isLocalAppUrl = APP_URL.includes('localhost') || APP_URL.includes('127.0.0.1');
const allowedOrigins = [
    APP_URL,
    API_URL,
    process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : '',
    ...(process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean),
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    'http://localhost:5500',
    'http://127.0.0.1:5500',
].filter(Boolean);

function isAllowedOrigin(origin, req) {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;

    try {
        const originUrl = new URL(origin);
        const requestHost = req.get('host');

        if (requestHost && originUrl.host === requestHost) return true;
        if (['localhost', '127.0.0.1'].includes(originUrl.hostname)) return true;
    } catch (_) {
        return false;
    }

    return false;
}

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnv = requiredEnv.filter(name => !process.env[name]);
if (missingEnv.length > 0) {
    console.error(`Variaveis de ambiente ausentes: ${missingEnv.join(', ')}`);
    process.exit(1);
}

if (!fs.existsSync(path.join(frontendPath, 'index.html'))) {
    console.error(`Frontend nao encontrado em: ${frontendPath}`);
    console.error('No Render, publique o repositorio pela raiz do projeto, mantendo backend/ e frontend/ como pastas irmas.');
    process.exit(1);
}
// â”€â”€ Supabase Admin (service role â€“ apenas server-side) â”€â”€â”€â”€â”€â”€â”€â”€
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
    next();
});
app.use((req, res, next) => {
    cors({
        origin(origin, callback) {
            if (isAllowedOrigin(origin, req)) return callback(null, true);
            return callback(new Error(`Origem nao permitida pelo CORS: ${origin}`));
        },
    })(req, res, next);
});
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/mercadopago/config', (req, res) => {
    res.json({
        configured: Boolean(MERCADO_PAGO_ACCESS_TOKEN),
        canUseOnlinePayments: Boolean(MERCADO_PAGO_ACCESS_TOKEN),
        environment: isLocalAppUrl ? 'local' : 'production',
        message: '',
    });
});

// â”€â”€ Servir o frontend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(express.static(frontendPath, {
    index: 'index.html',
    fallthrough: true,
}));

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

function montarMensagemPedido(itensVenda, total, formaPagamento, vendaId) {
    let message = 'Ola! Gostaria de confirmar meu pedido:\n\nItens do pedido:\n';
    itensVenda.forEach(item => {
        message += `- ${item.nome_produto} (${item.quantidade}x) - R$ ${Number(item.subtotal).toFixed(2)}\n`;
        if (item.cor) message += `  Cor: ${item.cor}\n`;
    });
    message += `\nTotal: R$ ${Number(total).toFixed(2)}`;
    message += `\nForma de pagamento: ${formaPagamento}`;
    if (vendaId) message += `\nPedido: ${vendaId}`;
    return message;
}

function montarWhatsappLink(message) {
    return `https://web.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}

async function prepararItensCheckout(itens) {
    const itensVenda = [];
    let total = 0;

    for (const item of itens) {
        const produtoId = Number(item.produto_id);
        const quantidade = Number(item.quantidade || 0);

        if (!produtoId || quantidade < 1) {
            const err = new Error('Item invalido no carrinho.');
            err.status = 400;
            throw err;
        }

        const { data: produto, error: produtoErr } = await supabaseAdmin
            .from('produtos')
            .select('id, nome, preco, estoque, qtd_vendidos, imagem')
            .eq('id', produtoId)
            .single();

        if (produtoErr || !produto) {
            const err = new Error(`Produto nao encontrado: ${produtoId}`);
            err.status = 404;
            throw err;
        }

        if (Number(produto.estoque || 0) < quantidade) {
            const err = new Error(`Estoque insuficiente para "${produto.nome}". Disponivel: ${produto.estoque || 0}`);
            err.status = 409;
            throw err;
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
            imagem: produto.imagem || null,
            estoque_atual: Number(produto.estoque || 0),
            qtd_vendidos_atual: Number(produto.qtd_vendidos || 0),
        });
    }

    return { itensVenda, total: Number(total.toFixed(2)) };
}

async function baixarEstoqueSeConfirmado(vendaId) {
    const { data: venda, error: vendaErr } = await supabaseAdmin
        .from('vendas')
        .select('id, status, total, forma_pagamento, venda_itens(*)')
        .eq('id', vendaId)
        .single();

    if (vendaErr || !venda) throw vendaErr || new Error('Venda nao encontrada.');
    if (venda.status === 'confirmado') return venda;

    const itens = venda.venda_itens || [];
    for (const item of itens) {
        const { data: produto, error: prodErr } = await supabaseAdmin
            .from('produtos')
            .select('estoque, qtd_vendidos')
            .eq('id', item.produto_id)
            .single();

        if (prodErr || !produto) throw prodErr || new Error('Produto nao encontrado ao baixar estoque.');

        const novoEstoque = Number(produto.estoque || 0) - Number(item.quantidade || 0);
        if (novoEstoque < 0) throw new Error(`Estoque insuficiente para "${item.nome_produto}".`);

        const { error: updateErr } = await supabaseAdmin
            .from('produtos')
            .update({
                estoque: novoEstoque,
                qtd_vendidos: Number(produto.qtd_vendidos || 0) + Number(item.quantidade || 0),
            })
            .eq('id', item.produto_id);

        if (updateErr) throw updateErr;
    }

    const { data: vendaAtualizada, error: upVendaErr } = await supabaseAdmin
        .from('vendas')
        .update({ status: 'confirmado' })
        .eq('id', vendaId)
        .select('id, status, total, forma_pagamento, venda_itens(*)')
        .single();

    if (upVendaErr) throw upVendaErr;
    return vendaAtualizada;
}

async function consultarPagamentoMercadoPago(paymentId) {
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
        const err = new Error('MERCADO_PAGO_ACCESS_TOKEN nao configurado.');
        err.status = 500;
        throw err;
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(data.message || data.error || 'Erro ao consultar pagamento no Mercado Pago.');
        err.status = response.status;
        throw err;
    }
    return data;
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
        const { itensVenda, total } = await prepararItensCheckout(itens);

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
            .insert(itensVenda.map(({ estoque_atual, qtd_vendidos_atual, imagem, ...item }) => ({
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

        const message = montarMensagemPedido(itensVenda, total, forma_pagamento, venda.id);
        const whatsappLink = montarWhatsappLink(message);

        res.json({ venda_id: venda.id, total, whatsappLink });
    } catch (error) {
        console.error('Erro no checkout:', error);
        res.status(500).json({ erro: 'Erro ao finalizar compra. Tente novamente.' });
    }
});

app.post('/api/mercadopago/preference', verificarUsuario, async (req, res) => {
    const { itens, payment_type } = req.body;
    const tipoPagamento = ['credit_card', 'debit_card'].includes(payment_type) ? payment_type : 'credit_card';

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
        return res.status(500).json({ erro: 'MERCADO_PAGO_ACCESS_TOKEN nao configurado no backend.' });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ erro: 'Carrinho vazio.' });
    }

    try {
        const { itensVenda, total } = await prepararItensCheckout(itens);

        const { data: venda, error: vendaErr } = await supabaseAdmin
            .from('vendas')
            .insert({
                user_id: req.user.id,
                status: 'pendente',
                forma_pagamento: tipoPagamento === 'debit_card' ? 'Cartao de Debito Mercado Pago' : 'Cartao de Credito Mercado Pago',
                total,
            })
            .select()
            .single();

        if (vendaErr) throw vendaErr;

        const { error: itensErr } = await supabaseAdmin
            .from('venda_itens')
            .insert(itensVenda.map(({ estoque_atual, qtd_vendidos_atual, imagem, ...item }) => ({
                ...item,
                venda_id: venda.id,
            })));

        if (itensErr) throw itensErr;

        const preferenceBody = {
            items: itensVenda.map(item => ({
                id: String(item.produto_id),
                title: item.nome_produto,
                quantity: item.quantidade,
                unit_price: item.preco_unitario,
                currency_id: 'BRL',
                picture_url: item.imagem || undefined,
            })),
            external_reference: venda.id,
            back_urls: {
                success: `${APP_URL}/pagamento-sucesso.html`,
                failure: `${APP_URL}/pagamento-falha.html`,
                pending: `${APP_URL}/pagamento-pendente.html`,
            },
            metadata: {
                venda_id: venda.id,
                user_id: req.user.id,
                payment_type: tipoPagamento,
            },
            payment_methods: {
                excluded_payment_types: [
                    ...(tipoPagamento === 'credit_card' ? [{ id: 'debit_card' }] : [{ id: 'credit_card' }]),
                    { id: 'ticket' },
                    { id: 'bank_transfer' },
                    { id: 'atm' },
                    { id: 'prepaid_card' },
                    { id: 'account_money' },
                ],
            },
        };

        if (APP_URL.startsWith('https://')) {
            preferenceBody.auto_return = 'approved';
        }

        if (API_URL.startsWith('https://')) {
            preferenceBody.notification_url = `${API_URL}/api/mercadopago/webhook`;
        }

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferenceBody),
        });

        const preference = await mpResponse.json().catch(() => ({}));
        if (!mpResponse.ok) {
            console.error('Erro Mercado Pago preference:', preference);
            return res.status(mpResponse.status).json({
                erro: preference.message || preference.error || preference.cause?.[0]?.description || 'Erro ao criar pagamento no Mercado Pago.',
            });
        }

        const isLocalApp = APP_URL.includes('localhost') || APP_URL.includes('127.0.0.1');
        const checkoutUrl = isLocalApp
            ? preference.sandbox_init_point || preference.init_point
            : preference.init_point || preference.sandbox_init_point;

        res.json({
            venda_id: venda.id,
            preference_id: preference.id,
            checkout_url: checkoutUrl,
            total,
        });
    } catch (error) {
        console.error('Erro ao criar preferencia Mercado Pago:', error);
        res.status(error.status || 500).json({ erro: error.message || 'Erro ao iniciar pagamento.' });
    }
});

app.post('/api/mercadopago/pix', verificarUsuario, async (req, res) => {
    return res.status(410).json({ erro: 'Pix online desativado. Use o fluxo de WhatsApp.' });

    const { itens } = req.body;

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
        return res.status(500).json({ erro: 'MERCADO_PAGO_ACCESS_TOKEN nao configurado no backend.' });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ erro: 'Carrinho vazio.' });
    }

    try {
        const { itensVenda, total } = await prepararItensCheckout(itens);

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('nome, email')
            .eq('id', req.user.id)
            .maybeSingle();

        const payerEmail = profile?.email || req.user.email;
        if (!payerEmail) {
            return res.status(400).json({ erro: 'E-mail do cliente nao encontrado para gerar Pix.' });
        }

        const { data: venda, error: vendaErr } = await supabaseAdmin
            .from('vendas')
            .insert({
                user_id: req.user.id,
                status: 'pendente',
                forma_pagamento: 'Pix Mercado Pago',
                total,
            })
            .select()
            .single();

        if (vendaErr) throw vendaErr;

        const { error: itensErr } = await supabaseAdmin
            .from('venda_itens')
            .insert(itensVenda.map(({ estoque_atual, qtd_vendidos_atual, imagem, ...item }) => ({
                ...item,
                venda_id: venda.id,
            })));

        if (itensErr) throw itensErr;

        const paymentBody = {
            transaction_amount: total,
            description: `Pedido ${venda.id} - Menina Moca`,
            payment_method_id: 'pix',
            external_reference: venda.id,
            notification_url: API_URL.startsWith('https://') ? `${API_URL}/api/mercadopago/webhook` : undefined,
            payer: {
                email: payerEmail,
                first_name: profile?.nome || req.user.user_metadata?.nome || 'Cliente',
            },
            metadata: {
                venda_id: venda.id,
                user_id: req.user.id,
            },
        };

        Object.keys(paymentBody).forEach(key => paymentBody[key] === undefined && delete paymentBody[key]);

        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': crypto.randomUUID(),
            },
            body: JSON.stringify(paymentBody),
        });

        const payment = await mpResponse.json().catch(() => ({}));
        if (!mpResponse.ok) {
            console.error('Erro Mercado Pago Pix:', payment);
            const mpErro = payment.message || payment.error || payment.cause?.[0]?.description || '';
            return res.status(mpResponse.status).json({
                erro: mpErro || 'Erro ao gerar Pix no Mercado Pago.',
                detalhe: payment,
            });
        }

        const transactionData = payment.point_of_interaction?.transaction_data || {};
        res.json({
            venda_id: venda.id,
            payment_id: payment.id,
            status: payment.status,
            total,
            qr_code: transactionData.qr_code,
            qr_code_base64: transactionData.qr_code_base64,
            ticket_url: transactionData.ticket_url,
        });
    } catch (error) {
        console.error('Erro ao gerar Pix Mercado Pago:', error);
        res.status(error.status || 500).json({ erro: error.message || 'Erro ao gerar Pix.' });
    }
});

app.post('/api/mercadopago/webhook', async (req, res) => {
    try {
        const paymentId = req.body?.data?.id || req.body?.id || req.query?.id || req.query?.['data.id'];
        const type = req.body?.type || req.query?.type || req.body?.topic || req.query?.topic;

        if (!paymentId || !String(type || '').includes('payment')) {
            return res.sendStatus(200);
        }

        const payment = await consultarPagamentoMercadoPago(paymentId);
        const vendaId = payment.external_reference || payment.metadata?.venda_id;

        if (payment.status === 'approved' && vendaId) {
            await baixarEstoqueSeConfirmado(vendaId);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Erro webhook Mercado Pago:', error);
        res.sendStatus(200);
    }
});

app.get('/api/mercadopago/retorno', async (req, res) => {
    try {
        const paymentId = req.query.payment_id || req.query.collection_id;
        const vendaIdQuery = req.query.external_reference;

        if (!paymentId) {
            return res.status(400).json({ erro: 'payment_id ausente.' });
        }

        const payment = await consultarPagamentoMercadoPago(paymentId);
        const vendaId = payment.external_reference || payment.metadata?.venda_id || vendaIdQuery;

        if (payment.status !== 'approved') {
            return res.json({ status: payment.status, approved: false, venda_id: vendaId || null });
        }

        const venda = await baixarEstoqueSeConfirmado(vendaId);
        const message = montarMensagemPedido(venda.venda_itens || [], venda.total, venda.forma_pagamento || 'Mercado Pago', venda.id);

        res.json({
            status: payment.status,
            approved: true,
            venda_id: venda.id,
            whatsappLink: montarWhatsappLink(message),
        });
    } catch (error) {
        console.error('Erro retorno Mercado Pago:', error);
        res.status(error.status || 500).json({ erro: error.message || 'Erro ao validar pagamento.' });
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
    if (path.extname(req.path)) {
        return res.status(404).send('Arquivo nao encontrado.');
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Erro inesperado:', err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
    console.log(`\nâœ… Servidor rodando em http://localhost:${PORT}`);
    console.log(`Frontend: ${frontendPath}`);
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
