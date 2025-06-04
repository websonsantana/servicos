// Configuração do Supabase
const SUPABASE_URL = 'https://bnyhgginbhsjeilcclzf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueWhnZ2luYmhzamVpbGNjbHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkzNDg0NTksImV4cCI6MjAxNDkyNDQ1OX0.9XJvqgMQlqC7XZ6B8zLWmZ8vQ8Q5bZ8Z3Z1J2ZJZJZQ';

// Objeto com as funções de API
const api = {
    // Clientes
    async getClientes() {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nome', { ascending: true });
        
        if (error) throw error;
        return data;
    },
    
    async getClienteById(id) {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    async createCliente(cliente) {
        const { data, error } = await supabase
            .from('clientes')
            .insert([cliente])
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    async updateCliente(id, cliente) {
        const { data, error } = await supabase
            .from('clientes')
            .update(cliente)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    async deleteCliente(id) {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },
    
    // Serviços
    async getServicos() {
        const { data, error } = await supabase
            .from('servicos')
            .select(`
                *,
                cliente:clientes(*),
                tecnico:equipe(*)
            `)
            .order('data_inicio', { ascending: false });
        
        if (error) throw error;
        return data;
    },
    
    async getServicoById(id) {
        const { data, error } = await supabase
            .from('servicos')
            .select(`
                *,
                cliente:clientes(*),
                tecnico:equipe(*)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    async createServico(servico) {
        const { data, error } = await supabase
            .from('servicos')
            .insert([servico])
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    async updateServico(id, servico) {
        const { data, error } = await supabase
            .from('servicos')
            .update(servico)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    async deleteServico(id) {
        const { error } = await supabase
            .from('servicos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },
    
    // Equipe (funcionários)
    async getEquipe() {
        const { data, error } = await supabase
            .from('equipe')
            .select('*')
            .order('nome', { ascending: true });
        if (error) throw error;
        return data;
    },
    async getFuncionarioById(id) {
        const { data, error } = await supabase
            .from('equipe')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },
    async criarFuncionario(funcionarioData) {
        const { data, error } = await supabase
            .from('equipe')
            .insert([funcionarioData])
            .select();
        if (error) throw error;
        return data[0];
    },
    async atualizarFuncionario(id, funcionarioData) {
        const { data, error } = await supabase
            .from('equipe')
            .update(funcionarioData)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },
    async excluirFuncionario(id) {
        const { error } = await supabase
            .from('equipe')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },
    
    // Orçamentos
    async getOrcamentos() {
        const { data, error } = await supabase
            .from('orcamentos')
            .select(`
                *,
                cliente:clientes(*),
                servico:servicos(*)
            `)
            .order('data_emissao', { ascending: false });
        
        if (error) throw error;
        return data;
    },
    
    async getOrcamentoById(id) {
        const { data, error } = await supabase
            .from('orcamentos')
            .select(`
                *,
                cliente:clientes(*),
                servico:servicos(*)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    async createOrcamento(orcamento) {
        const { data, error } = await supabase
            .from('orcamentos')
            .insert([orcamento])
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    async updateOrcamento(id, orcamento) {
        const { data, error } = await supabase
            .from('orcamentos')
            .update(orcamento)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    async deleteOrcamento(id) {
        const { error } = await supabase
            .from('orcamentos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },
    
    // Recibos
    async getRecibos() {
        const { data, error } = await supabase
            .from('recibos')
            .select(`
                *,
                cliente:clientes(*),
                servico:servicos(*)
            `)
            .order('data_emissao', { ascending: false });
        
        if (error) throw error;
        return data;
    },
    
    async getReciboById(id) {
        const { data, error } = await supabase
            .from('recibos')
            .select(`
                *,
                cliente:clientes(*),
                servico:servicos(*)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    async createRecibo(recibo) {
        const { data, error } = await supabase
            .from('recibos')
            .insert([recibo])
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    async updateRecibo(id, recibo) {
        const { data, error } = await supabase
            .from('recibos')
            .update(recibo)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    async deleteRecibo(id) {
        const { error } = await supabase
            .from('recibos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },
    
    // Notificações
    async getNotificacoes() {
        const { data, error } = await supabase
            .from('notificacoes')
            .select('*')
            .order('data_criacao', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        return data;
    },
    
    async marcarNotificacaoLida(id) {
        const { error } = await supabase
            .from('notificacoes')
            .update({ lida: true })
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },
    
    // Autenticação
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },
    
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    },
    
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    }
};

// Exportar a instância da API para o escopo global
window.api = api;
