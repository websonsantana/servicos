import { 
    supabase, 
    handleError, 
    transformResponse, 
    validateRequired,
    withRetry,
    checkConnection,
    offlineCache
} from './supabase-config.js';

class API {
    constructor() {
        this.subscriptions = new Map();
        this.setupRealtimeListeners();
    }

    // Configuração dos listeners em tempo real
    setupRealtimeListeners() {
        ['clientes', 'servicos', 'equipe', 'orcamentos', 'recibos'].forEach(table => {
            const channel = supabase
                .channel(`public:${table}`)
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table 
                }, payload => {
                    const callbacks = this.subscriptions.get(table) || [];
                    callbacks.forEach(callback => callback(payload));
                })
                .subscribe();
        });
    }

    // Método genérico para operações CRUD com retry e cache
    async _executeOperation(operation, cacheKey = null, invalidateCache = false) {
        try {
            // Verifica conexão
            const isOnline = await checkConnection();
            
            // Se offline e tem cache, retorna do cache
            if (!isOnline && cacheKey) {
                const cachedData = offlineCache.get(cacheKey);
                if (cachedData) return cachedData;
            }
            
            // Executa operação com retry
            const result = await withRetry(async () => {
                const response = await operation();
                if (response.error) throw response.error;
                return response.data;
            });
            
            // Atualiza cache se necessário
            if (cacheKey && result) {
                offlineCache.set(cacheKey, result);
            }
            
            // Limpa cache se solicitado
            if (invalidateCache) {
                offlineCache.clear();
            }
            
            return result;
        } catch (error) {
            handleError(error);
        }
    }

    // Clientes
    async getClientes() {
        return this._executeOperation(
            () => supabase
                .from('clientes')
                .select('*')
                .order('created_at', { ascending: false }),
            'clientes_list'
        );
    }

    async getClienteById(id) {
        return this._executeOperation(
            () => supabase
                .from('clientes')
                .select('*')
                .eq('id', id)
                .single(),
            `cliente_${id}`
        );
    }

    async createCliente(cliente) {
        validateRequired(cliente, ['nome', 'email', 'telefone']);
        return this._executeOperation(
            () => supabase
                .from('clientes')
                .insert([cliente])
                .select()
                .single(),
            null,
            true
        );
    }

    async updateCliente(id, cliente) {
        validateRequired(cliente, ['nome', 'email', 'telefone']);
        return this._executeOperation(
            () => supabase
                .from('clientes')
                .update(cliente)
                .eq('id', id)
                .select()
                .single(),
            null,
            true
        );
    }

    async deleteCliente(id) {
        return this._executeOperation(
            () => supabase
                .from('clientes')
                .delete()
                .eq('id', id),
            null,
            true
        );
    }

    // Serviços
    async getServicos() {
        return this._executeOperation(
            () => supabase
                .from('servicos')
                .select(`
                    *,
                    clientes (id, nome),
                    equipe (id, nome)
                `)
                .order('created_at', { ascending: false }),
            'servicos_list'
        );
    }

    async getServicoById(id) {
        return this._executeOperation(
            () => supabase
                .from('servicos')
                .select(`
                    *,
                    clientes (id, nome),
                    equipe (id, nome)
                `)
                .eq('id', id)
                .single(),
            `servico_${id}`
        );
    }

    async createServico(servico) {
        validateRequired(servico, ['cliente_id', 'descricao', 'valor']);
        return this._executeOperation(
            () => supabase
                .from('servicos')
                .insert([servico])
                .select()
                .single(),
            null,
            true
        );
    }

    async updateServico(id, servico) {
        validateRequired(servico, ['cliente_id', 'descricao', 'valor']);
        return this._executeOperation(
            () => supabase
                .from('servicos')
                .update(servico)
                .eq('id', id)
                .select()
                .single(),
            null,
            true
        );
    }

    async deleteServico(id) {
        return this._executeOperation(
            () => supabase
                .from('servicos')
                .delete()
                .eq('id', id),
            null,
            true
        );
    }

    // Equipe
    async getEquipe() {
        return this._executeOperation(
            () => supabase
                .from('equipe')
                .select('*')
                .order('created_at', { ascending: false }),
            'equipe_list'
        );
    }

    async getFuncionarioById(id) {
        return this._executeOperation(
            () => supabase
                .from('equipe')
                .select('*')
                .eq('id', id)
                .single(),
            `funcionario_${id}`
        );
    }

    async criarFuncionario(funcionario) {
        validateRequired(funcionario, ['nome', 'cargo', 'email']);
        return this._executeOperation(
            () => supabase
                .from('equipe')
                .insert([funcionario])
                .select()
                .single(),
            null,
            true
        );
    }

    async atualizarFuncionario(id, funcionario) {
        validateRequired(funcionario, ['nome', 'cargo', 'email']);
        return this._executeOperation(
            () => supabase
                .from('equipe')
                .update(funcionario)
                .eq('id', id)
                .select()
                .single(),
            null,
            true
        );
    }

    async excluirFuncionario(id) {
        return this._executeOperation(
            () => supabase
                .from('equipe')
                .delete()
                .eq('id', id),
            null,
            true
        );
    }

    // Orçamentos
    async getOrcamentos() {
        return this._executeOperation(
            () => supabase
                .from('orcamentos')
                .select(`
                    *,
                    clientes (id, nome),
                    servicos (id, descricao)
                `)
                .order('created_at', { ascending: false }),
            'orcamentos_list'
        );
    }

    async getOrcamentoById(id) {
        return this._executeOperation(
            () => supabase
                .from('orcamentos')
                .select(`
                    *,
                    clientes (id, nome),
                    servicos (id, descricao)
                `)
                .eq('id', id)
                .single(),
            `orcamento_${id}`
        );
    }

    async createOrcamento(orcamento) {
        validateRequired(orcamento, ['cliente_id', 'servico_id', 'valor']);
        return this._executeOperation(
            () => supabase
                .from('orcamentos')
                .insert([orcamento])
                .select()
                .single(),
            null,
            true
        );
    }

    async updateOrcamento(id, orcamento) {
        validateRequired(orcamento, ['cliente_id', 'servico_id', 'valor']);
        return this._executeOperation(
            () => supabase
                .from('orcamentos')
                .update(orcamento)
                .eq('id', id)
                .select()
                .single(),
            null,
            true
        );
    }

    async deleteOrcamento(id) {
        return this._executeOperation(
            () => supabase
                .from('orcamentos')
                .delete()
                .eq('id', id),
            null,
            true
        );
    }

    // Recibos
    async getRecibos() {
        return this._executeOperation(
            () => supabase
                .from('recibos')
                .select(`
                    *,
                    clientes (id, nome),
                    servicos (id, descricao)
                `)
                .order('created_at', { ascending: false }),
            'recibos_list'
        );
    }

    async getReciboById(id) {
        return this._executeOperation(
            () => supabase
                .from('recibos')
                .select(`
                    *,
                    clientes (id, nome),
                    servicos (id, descricao)
                `)
                .eq('id', id)
                .single(),
            `recibo_${id}`
        );
    }

    async createRecibo(recibo) {
        validateRequired(recibo, ['cliente_id', 'servico_id', 'valor', 'forma_pagamento']);
        return this._executeOperation(
            () => supabase
                .from('recibos')
                .insert([recibo])
                .select()
                .single(),
            null,
            true
        );
    }

    async updateRecibo(id, recibo) {
        validateRequired(recibo, ['cliente_id', 'servico_id', 'valor', 'forma_pagamento']);
        return this._executeOperation(
            () => supabase
                .from('recibos')
                .update(recibo)
                .eq('id', id)
                .select()
                .single(),
            null,
            true
        );
    }

    async deleteRecibo(id) {
        return this._executeOperation(
            () => supabase
                .from('recibos')
                .delete()
                .eq('id', id),
            null,
            true
        );
    }

    // Autenticação
    async signIn(email, password) {
        return this._executeOperation(
            () => supabase.auth.signInWithPassword({
                email,
                password
            })
        );
    }

    async signOut() {
        return this._executeOperation(
            () => supabase.auth.signOut()
        );
    }

    async getCurrentUser() {
        return this._executeOperation(
            () => supabase.auth.getUser()
        );
    }

    // Gerenciamento de subscrições
    subscribeToChanges(table, callback) {
        if (!this.subscriptions.has(table)) {
            this.subscriptions.set(table, []);
        }
        this.subscriptions.get(table).push(callback);
        
        return () => {
            const callbacks = this.subscriptions.get(table);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }
}

export default new API();
