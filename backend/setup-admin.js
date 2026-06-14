/**
 * setup-admin.js – Cria o usuário administrador no Supabase
 *
 * Pré-requisito: preencha SUPABASE_SERVICE_ROLE_KEY no .env
 * Execute:  node setup-admin.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function criarAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('❌ Configure ADMIN_EMAIL e ADMIN_PASSWORD no arquivo .env');
        process.exit(1);
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'COLE_AQUI_SUA_SERVICE_ROLE_KEY') {
        console.error('❌ Configure SUPABASE_SERVICE_ROLE_KEY no .env');
        console.error('   Obtenha em: Supabase Dashboard → Settings → API → service_role');
        process.exit(1);
    }

    console.log('\n🔧 Criando usuário admin...');
    console.log(`   Email: ${email}`);

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome: 'Administrador' }
    });

    if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
            console.log('ℹ️  Usuário já existe no Supabase Auth.');
        } else {
            console.error('❌ Erro ao criar usuário:', authError.message);
            process.exit(1);
        }
    } else {
        console.log('✅ Usuário criado no Supabase Auth');
    }

    // 2. Buscar o usuário para obter o ID
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('❌ Erro ao listar usuários:', listError.message);
        process.exit(1);
    }

    const adminUser = users.users.find(u => u.email === email);
    if (!adminUser) {
        console.error('❌ Usuário admin não encontrado após criação');
        process.exit(1);
    }

    // 3. Marcar is_admin=true no app_metadata do JWT (bypass RLS, confiável no frontend)
    const { error: metaError } = await supabase.auth.admin.updateUserById(adminUser.id, {
        app_metadata: { is_admin: true }
    });

    if (metaError) {
        console.error('❌ Erro ao atualizar app_metadata:', metaError.message);
        process.exit(1);
    }

    console.log('✅ app_metadata.is_admin = true configurado no JWT');

    // 4. Garantir perfil na tabela profiles com is_admin = true
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: adminUser.id,
            email,
            nome: 'Administrador',
            is_admin: true
        }, { onConflict: 'id' });

    if (profileError) {
        console.warn('⚠️  Aviso ao atualizar profiles:', profileError.message);
        console.warn('   O login ainda funcionará via app_metadata.');
    } else {
        console.log('✅ Perfil admin configurado na tabela profiles');
    }
    console.log('\n🎉 Admin criado com sucesso!');
    console.log('─'.repeat(50));
    console.log(`📧 Email : ${email}`);
    console.log(`🔑 Senha : ${password}`);
    console.log(`🌐 Painel: http://localhost:${process.env.PORT || 3000}/admin.html`);
    console.log('─'.repeat(50));
    console.log('\n⚠️  Guarde essas credenciais em local seguro!\n');
}

criarAdmin().catch(err => {
    console.error('Erro inesperado:', err);
    process.exit(1);
});
