import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const SUPABASE_URL  = 'https://ixouszvipgklgdvmsyyw.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4b3VzenZpcGdrbGdkdm1zeXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NTc5ODgsImV4cCI6MjA0NzQzMzk4OH0.FxsdlpIFDHk9NDHp8mKn06_M54WasfIuTWLgA1L_ip8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)


// ── Registrar novo usuário ────────────────────────────────────
export async function registrar({ nome, email, senha, telefone = '' }) {

    const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
            data: {
                nome,
                telefone
            }
        }
    })

    if (error) throw error

    return data
}


// ── Fazer login ───────────────────────────────────────────────
export async function login({ email, senha }) {

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
    })

    if (error) throw error

    return data
}


// ── Fazer logout ──────────────────────────────────────────────
export async function logout() {

    const { error } = await supabase.auth.signOut()

    if (error) throw error
}


// ── Obter usuário atual ───────────────────────────────────────
export async function getUsuarioAtual() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) return user

    return {
        ...user,
        ...profile
    }
}


// ── Verificar se está logado ──────────────────────────────────
export async function estaLogado() {

    const { data: { session } } = await supabase.auth.getSession()

    return !!session
}


// ── Ouvir mudanças de autenticação ───────────────────────────
export function onAuthChange(callback) {

    supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session)
    })

}


// ── Recuperar senha ───────────────────────────────────────────
export async function recuperarSenha(email) {

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login.html?reset=true`
    })

    if (error) throw error

}   