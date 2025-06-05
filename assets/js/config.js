// Configuração do Supabase
const SUPABASE_URL = 'https://bnyhgginbhsjeilcclzf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueWhnZ2luYmhzamVpbGNjbHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODc2MTUsImV4cCI6MjA2NDQ2MzYxNX0.TnW7d8rcCIDuFOszn-wad2rs40QJqKhrplEye0qXAVA';

// Inicialização correta do cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabase = supabase;

// Configurações globais
const config = {
    // Configurações de paginação
    pagination: {
        itemsPerPage: 10,
        maxPages: 5
    },
    
    // Configurações de data
    dateFormat: {
        display: 'DD/MM/YYYY',
        input: 'YYYY-MM-DD'
    },
    
    // Configurações de moeda
    currency: {
        locale: 'pt-BR',
        currency: 'BRL'
    },
    
    // Configurações de upload
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    }
};

// Funções de formatação
const formatters = {
    // Formatar data
    formatDate(date, format = config.dateFormat.display) {
        if (!date) return '-';
        return dayjs(date).format(format);
    },
    
    // Formatar moeda
    formatCurrency(value) {
        if (!value) return 'R$ 0,00';
        return new Intl.NumberFormat(config.currency.locale, {
            style: 'currency',
            currency: config.currency.currency
        }).format(value);
    },
    
    // Formatar telefone
    formatPhone(phone) {
        if (!phone) return '-';
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    },
    
    // Formatar CPF/CNPJ
    formatDocument(document) {
        if (!document) return '-';
        if (document.length === 11) {
            return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
};

// Exportar configurações e funções
window.config = config;
window.formatters = formatters;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_KEY = SUPABASE_KEY;
