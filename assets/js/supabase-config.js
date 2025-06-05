// Configuração do Supabase
const SUPABASE_URL = 'https://bnyhgginbhsjeilcclzf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueWhnZ2luYmhzamVpbGNjbHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODc2MTUsImV4cCI6MjA2NDQ2MzYxNX0.TnW7d8rcCIDuFOszn-wad2rs40QJqKhrplEye0qXAVA';

// Inicialização do cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabase = supabase;

// Configurações de timeout e retry
const TIMEOUT_DURATION = 30000; // 30 segundos
const MAX_RETRIES = 3;

// Funções de utilidade para tratamento de erros
const handleError = (error) => {
    console.error('Erro na operação:', error);
    
    // Tratamento específico para erros de rede
    if (!navigator.onLine) {
        throw new Error('Sem conexão com a internet. Por favor, verifique sua conexão.');
    }
    
    // Tratamento específico para erros do Supabase
    if (error.code === 'PGRST301') {
        throw new Error('Dados não encontrados.');
    }
    
    throw error;
};

// Funções de utilidade para transformação de dados
const transformResponse = (data) => {
    if (!data) return null;
    return Array.isArray(data) ? data : [data];
};

// Funções de utilidade para validação
const validateRequired = (data, fields) => {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${missing.join(', ')}`);
    }
};

// Função para retry automático em caso de falha
const withRetry = async (operation, retries = MAX_RETRIES) => {
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), TIMEOUT_DURATION)
        );
        
        return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return withRetry(operation, retries - 1);
        }
        throw error;
    }
};

// Função para verificar o estado da conexão
const checkConnection = async () => {
    try {
        const { data, error } = await supabase.from('health_check').select('count').single();
        return !error;
    } catch {
        return false;
    }
};

// Função para gerenciar cache offline
const offlineCache = {
    set: (key, value) => {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
            value,
            timestamp: Date.now()
        }));
    },
    get: (key, maxAge = 3600000) => { // 1 hora por padrão
        const cached = localStorage.getItem(`cache_${key}`);
        if (!cached) return null;
        
        const { value, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > maxAge) {
            localStorage.removeItem(`cache_${key}`);
            return null;
        }
        
        return value;
    },
    clear: () => {
        Object.keys(localStorage)
            .filter(key => key.startsWith('cache_'))
            .forEach(key => localStorage.removeItem(key));
    }
};

// Função de autenticação
async function checkAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'index.html';
        }
        return session;
    } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        window.location.href = 'index.html';
    }
}

// Função para fazer logout
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro ao sair:', error);
        alert('Erro ao sair. Tente novamente.');
    }
}

// Exportar funções úteis
export {
    supabase,
    checkAuth,
    logout,
    handleError,
    transformResponse,
    validateRequired,
    withRetry,
    checkConnection,
    offlineCache,
    TIMEOUT_DURATION,
    MAX_RETRIES
};