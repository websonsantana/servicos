// Funções para a aba de Histórico

// Função para carregar o histórico de serviços
async function carregarHistorico() {
    try {
        const { data, error } = await supabase
            .from('servicos')
            .select('*, clientes(*)')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        historico = data || [];
        renderizarHistorico();
        
        // Atualizar contadores
        const pendentes = historico.filter(s => s.status === 'pendente').length;
        const andamento = historico.filter(s => s.status === 'andamento').length;
        const concluidos = historico.filter(s => s.status === 'concluido').length;
        
        document.getElementById('pendentes-count').textContent = pendentes;
        document.getElementById('andamento-count').textContent = andamento;
        document.getElementById('concluidos-count').textContent = concluidos;
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        alert('Erro ao carregar histórico');
    }
}

// Função para renderizar o histórico na tabela
function renderizarHistorico() {
    const tbody = document.getElementById('historico-table');
    const filtro = document.getElementById('filter-historico').value;
    const busca = document.getElementById('search-historico').value.toLowerCase();
    
    tbody.innerHTML = '';
    
    let dadosFiltrados = [...historico];
    
    // Aplicar filtro de status
    if (filtro !== 'all') {
        dadosFiltrados = dadosFiltrados.filter(item => item.status === filtro);
    }
    
    // Aplicar busca
    if (busca) {
        dadosFiltrados = dadosFiltrados.filter(item => 
            (item.clientes?.nome || '').toLowerCase().includes(busca) || 
            (item.descricao || '').toLowerCase().includes(busca)
        );
    }
    
    dadosFiltrados.forEach(servico => {
        const tr = document.createElement('tr');
        
        // Definir classe de cor baseada no status
        let statusClass = '';
        switch (servico.status) {
            case 'pendente':
                statusClass = 'bg-yellow-100 text-yellow-800';
                break;
            case 'andamento':
                statusClass = 'bg-blue-100 text-blue-800';
                break;
            case 'aguardando':
                statusClass = 'bg-orange-100 text-orange-800';
                break;
            case 'concluido':
                statusClass = 'bg-green-100 text-green-800';
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-800';
        }
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${servico.clientes?.nome || 'Cliente não encontrado'}</td>
            <td class="px-6 py-4">${servico.descricao || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${getStatusText(servico.status)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">R$ ${parseFloat(servico.valor || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${new Date(servico.created_at).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="visualizarServico('${servico.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="gerarOrcamentoDeServico('${servico.id}')" class="text-green-600 hover:text-green-800 mr-2">
                    <i class="fas fa-file-invoice-dollar"></i>
                </button>
                <button onclick="gerarReciboDeServico('${servico.id}')" class="text-purple-600 hover:text-purple-800">
                    <i class="fas fa-receipt"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Função para visualizar um serviço do histórico
async function visualizarServico(id) {
    try {
        const { data, error } = await supabase
            .from('servicos')
            .select('*, clientes(*)')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        if (!data) {
            alert('Serviço não encontrado!');
            return;
        }
        
        // Preencher o modal de serviço com os dados
        document.getElementById('servico-modal-title').textContent = 'Visualizar Serviço';
        document.getElementById('servico-id').value = data.id;
        
        // Carregar clientes no select
        await carregarClientesNoSelect('servico-cliente');
        
        // Preencher os campos
        setTimeout(() => {
            document.getElementById('servico-cliente').value = data.cliente_id;
            document.getElementById('servico-descricao').value = data.descricao;
            document.getElementById('servico-valor').value = data.valor || '';
            document.getElementById('servico-status').value = data.status;
            document.getElementById('servico-observacoes').value = data.observacoes || '';
        }, 500);
        
        // Mostrar o modal
        document.getElementById('servico-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao visualizar serviço:', error);
        alert('Erro ao visualizar serviço');
    }
}

// Função para gerar um orçamento a partir de um serviço
function gerarOrcamentoDeServico(id) {
    const servico = historico.find(s => s.id === id);
    if (!servico) {
        alert('Serviço não encontrado!');
        return;
    }
    
    // Mostrar o modal de orçamento
    document.getElementById('orcamento-modal').classList.remove('hidden');
    document.getElementById('orcamento-print').classList.add('hidden');
    
    // Carregar clientes e serviços nos selects
    carregarClientesNoSelect('orcamento-cliente');
    carregarServicosNoSelect('orcamento-servico');
    
    // Preencher os campos com os dados do serviço
    setTimeout(() => {
        document.getElementById('orcamento-cliente').value = servico.cliente_id;
        document.getElementById('orcamento-servico').value = servico.id;
        document.getElementById('orcamento-valor').value = servico.valor || '';
        document.getElementById('orcamento-validade').value = '7';
    }, 500);
    
    // Gerar número de orçamento
    document.getElementById('orcamento-numero-print').textContent = 'ORC' + new Date().getTime().toString().slice(-6);
}

// Função para gerar um recibo a partir de um serviço
function gerarReciboDeServico(id) {
    const servico = historico.find(s => s.id === id);
    if (!servico) {
        alert('Serviço não encontrado!');
        return;
    }
    
    // Mostrar o modal de recibo
    document.getElementById('recibo-modal').classList.remove('hidden');
    document.getElementById('recibo-print').classList.add('hidden');
    
    // Carregar clientes e serviços nos selects
    carregarClientesNoSelect('recibo-cliente');
    carregarServicosNoSelect('recibo-servico');
    
    // Preencher os campos com os dados do serviço
    setTimeout(() => {
        document.getElementById('recibo-cliente').value = servico.cliente_id;
        document.getElementById('recibo-servico').value = servico.id;
        document.getElementById('recibo-valor').value = servico.valor || '';
        document.getElementById('recibo-forma-pagamento').value = 'Dinheiro';
    }, 500);
    
    // Gerar número de recibo
    document.getElementById('recibo-numero-print').textContent = 'REC' + new Date().getTime().toString().slice(-6);
}

// Função auxiliar para obter o texto do status
function getStatusText(status) {
    switch (status) {
        case 'pendente':
            return 'Pendente';
        case 'andamento':
            return 'Em Andamento';
        case 'aguardando':
            return 'Aguardando Peça';
        case 'concluido':
            return 'Concluído';
        default:
            return status;
    }
}

// Adicionar event listeners para filtro e busca
document.addEventListener('DOMContentLoaded', function() {
    // Filtro de status
    const filterHistorico = document.getElementById('filter-historico');
    if (filterHistorico) {
        filterHistorico.addEventListener('change', renderizarHistorico);
    }
    
    // Campo de busca
    const searchHistorico = document.getElementById('search-historico');
    if (searchHistorico) {
        searchHistorico.addEventListener('input', renderizarHistorico);
    }
});
