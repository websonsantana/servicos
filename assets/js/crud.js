// Funções CRUD genéricas
async function createRecord(table, data) {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert(data);
        
        if (error) throw error;
        return result;
    } catch (error) {
        console.error(`Erro ao criar registro em ${table}:`, error);
        throw error;
    }
}

async function readRecords(table, filters = {}) {
    try {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Erro ao ler registros de ${table}:`, error);
        throw error;
    }
}

async function updateRecord(table, id, data) {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id);
            
        if (error) throw error;
        return result;
    } catch (error) {
        console.error(`Erro ao atualizar registro em ${table}:`, error);
        throw error;
    }
}

async function deleteRecord(table, id) {
    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
            
        if (error) throw error;
    } catch (error) {
        console.error(`Erro ao deletar registro de ${table}:`, error);
        throw error;
    }
}

// Funções específicas para cada módulo
export const clientes = {
    async listar() {
        return readRecords('clientes');
    },
    async adicionar(cliente) {
        return createRecord('clientes', cliente);
    },
    async atualizar(id, cliente) {
        return updateRecord('clientes', id, cliente);
    },
    async remover(id) {
        return deleteRecord('clientes', id);
    }
};

export const servicos = {
    async listar() {
        return readRecords('servicos');
    },
    async adicionar(servico) {
        return createRecord('servicos', servico);
    },
    async atualizar(id, servico) {
        return updateRecord('servicos', id, servico);
    },
    async remover(id) {
        return deleteRecord('servicos', id);
    }
};

export const recibos = {
    async listar() {
        return readRecords('recibos');
    },
    async adicionar(recibo) {
        return createRecord('recibos', recibo);
    },
    async atualizar(id, recibo) {
        return updateRecord('recibos', id, recibo);
    },
    async remover(id) {
        return deleteRecord('recibos', id);
    }
};

export const orcamentos = {
    async listar() {
        return readRecords('orcamentos');
    },
    async adicionar(orcamento) {
        return createRecord('orcamentos', orcamento);
    },
    async atualizar(id, orcamento) {
        return updateRecord('orcamentos', id, orcamento);
    },
    async remover(id) {
        return deleteRecord('orcamentos', id);
    }
};

export const funcionarios = {
    async listar() {
        return readRecords('funcionarios');
    },
    async adicionar(funcionario) {
        return createRecord('funcionarios', funcionario);
    },
    async atualizar(id, funcionario) {
        return updateRecord('funcionarios', id, funcionario);
    },
    async remover(id) {
        return deleteRecord('funcionarios', id);
    }
};

// Função para formatar moeda
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para formatar data
export function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}
