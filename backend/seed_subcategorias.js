require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const novas = [
    { nome: 'Base Líquida', categoria_id: 1 },
    { nome: 'Pó Facial', categoria_id: 1 },
    { nome: 'Bruma Fixadora', categoria_id: 1 },
    { nome: 'Paletas de Sombras', categoria_id: 2 },
    { nome: 'Sombra e Iluminador', categoria_id: 2 },
    { nome: 'Marshmallow', categoria_id: 2 },
    { nome: 'Sombra Líquida e Primer', categoria_id: 2 },
    { nome: 'Óleo Labial', categoria_id: 3 },
    { nome: 'Gloss Plump', categoria_id: 3 },
    { nome: 'Lapiseira Labial', categoria_id: 3 },
];

(async () => {
    const { data: existentes, error: errList } = await supabase
        .from('subcategorias')
        .select('nome, categoria_id');
    if (errList) { console.error('Erro ao listar:', errList.message); process.exit(1); }

    const existentesSet = new Set((existentes || []).map(s => `${s.categoria_id}|${s.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`));

    let criadas = 0;
    for (const nova of novas) {
        const chave = `${nova.categoria_id}|${nova.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`;
        if (existentesSet.has(chave)) {
            console.log(`Já existe: [${nova.categoria_id}] ${nova.nome}`);
            continue;
        }
        const { data, error } = await supabase
            .from('subcategorias')
            .insert({ nome: nova.nome, categoria_id: nova.categoria_id })
            .select('id, nome, categoria_id');
        if (error) {
            console.error(`Erro ao criar "${nova.nome}":`, error.message);
        } else {
            console.log(`Criada: [${data[0].categoria_id}] ${data[0].nome} (id ${data[0].id})`);
            criadas++;
        }
    }
    console.log(`\nTotal criadas: ${criadas}`);
})();
