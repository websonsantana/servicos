// Configurações do aplicativo
const CONFIG = {
    SUPABASE_URL: 'https://bnyhgginbhsjeilcclzf.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueWhnZ2luYmhzamVpbGNjbHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODc2MTUsImV4cCI6MjA2NDQ2MzYxNX0.TnW7d8rcCIDuFOszn-wad2rs40QJqKhrplEye0qXAVA',
    ITEMS_PER_PAGE: 10
};

// Inicializar o cliente Supabase corretamente
const supabase = window.supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// Exportar para o escopo global
window.CONFIG = CONFIG;
window.supabase = supabase;
