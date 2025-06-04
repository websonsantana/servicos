// Funções de Navegação e UI

/**
 * Mostra uma seção específica e atualiza a navegação
 * @param {string} section - ID da seção a ser mostrada
 */
function showSection(section) {
    // Atualizar título da página
    const titles = {
        'dashboard': 'Dashboard',
        'clientes': 'Clientes',
        'servicos': 'Serviços',
        'kanban': 'Quadro Kanban',
        'equipe': 'Equipe',
        'orcamentos': 'Orçamentos',
        'recibos': 'Recibos',
        'relatorios': 'Relatórios',
        'historico': 'Histórico'
    };
    
    document.getElementById('page-title').textContent = titles[section] || section;
    
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Mostrar a seção selecionada
    document.getElementById(`${section}-section`).classList.remove('hidden');
    
    // Atualizar menu ativo
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('active');
    });
    
    document.querySelectorAll('.mobile-footer-item').forEach(el => {
        el.classList.remove('active');
    });
    
    const desktopItem = document.querySelector(`.menu-item[onclick="showSection('${section}')"]`);
    if (desktopItem) desktopItem.classList.add('active');
    
    const mobileItem = document.querySelector(`.mobile-footer-item[onclick="showSection('${section}')"]`);
    if (mobileItem) mobileItem.classList.add('active');
    
    // Atualizar gráficos se for a seção de dashboard ou relatórios
    if (section === 'dashboard' || section === 'relatorios') {
        setTimeout(() => {
            updateCharts();
        }, 100);
    }
}

/**
 * Exibe um modal específico
 * @param {string} type - Tipo do modal (cliente, servico, funcionario, etc.)
 */
function showModal(type) {
    document.getElementById(`${type}-modal`).classList.remove('hidden');
    
    // Resetar formulário se for um novo item
    if (type !== 'orcamento' && type !== 'recibo') {
        document.getElementById(`${type}-form`).reset();
        document.getElementById(`${type}-id`).value = '';
        
        if (type === 'cliente') {
            document.getElementById('cliente-modal-title').textContent = 'Novo Cliente';
        } else if (type === 'servico') {
            document.getElementById('servico-modal-title').textContent = 'Novo Serviço';
            // Atualizar selects
            atualizarSelectClientes('servico-cliente');
            atualizarSelectFuncionarios('servico-tecnico');
        } else if (type === 'funcionario') {
            document.getElementById('funcionario-modal-title').textContent = 'Novo Funcionário';
            // Resetar preview da foto
            document.getElementById('funcionario-foto-preview').src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23D1D5DB'%3E%3Cpath d='M12 15a3 3 0 100-6 3 3 0 000 6z' /%3E%3Cpath fill-rule='evenodd' d='M1 12a11 11 0 1122 0 11 11 0 01-22 0zm16 0a5 5 0 11-10 0 5 5 0 0110 0z' clip-rule='evenodd' /%3E%3C/svg%3E";
        }
    }
}

/**
 * Esconde um modal
 * @param {string} type - Tipo do modal a ser escondido
 */
function hideModal(type) {
    document.getElementById(`${type}-modal`).classList.add('hidden');
    
    // Esconder área de impressão se aplicável
    if (type === 'orcamento' || type === 'recibo') {
        document.getElementById(`${type}-print`).classList.add('hidden');
    }
}

/**
 * Alterna a barra lateral entre expandida e recolhida
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    const mainContent = document.getElementById('main-content');
    mainContent.classList.toggle('ml-64');
    mainContent.classList.toggle('ml-20');
}

/**
 * Alterna o menu móvel
 */
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

/**
 * Mostra a sobreposição de carregamento
 */
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

/**
 * Esconde a sobreposição de carregamento
 */
function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

/**
 * Mostra um alerta simples
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de alerta (opcional)
 */
function showAlert(message, type = 'info') {
    // Implementação simplificada - você pode usar um toast ou modal de alerta
    alert(message);
}

// Função para atualizar select de técnicos
function atualizarSelectFuncionarios(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Selecione</option>';
    if (window.state && window.state.equipe) {
        console.log('Equipe carregada:', window.state.equipe);
        window.state.equipe.forEach(func => {
            select.innerHTML += `<option value="${func.id}">${func.nome} (${func.cargo || 'Sem cargo'})</option>`;
        });
    } else {
        console.warn('Nenhum funcionário encontrado no state!');
    }
}

// Função para atualizar select de clientes
function atualizarSelectClientes(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Limpar o select
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    
    // Carregar clientes do estado global
    if (window.state && window.state.clientes) {
        console.log('Clientes carregados:', window.state.clientes);
        window.state.clientes.forEach(cliente => {
            select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
        });
    } else {
        console.warn('Nenhum cliente encontrado no state!');
    }
}

// Função placeholder para evitar erro caso updateCharts não esteja implementada
function updateCharts() {
  // Aqui você pode implementar os gráficos futuramente
}

// Garante que ao abrir o modal de serviço, os selects são atualizados
const botaoNovoServico = document.querySelector('button[onclick="showModal(\'servico\')"]');
if (botaoNovoServico) {
    botaoNovoServico.addEventListener('click', function() {
        setTimeout(function() {
            atualizarSelectClientes('servico-cliente');
            atualizarSelectFuncionarios('servico-tecnico');
        }, 100);
    });
}

// Exportar funções para o escopo global
window.showSection = showSection;
window.showModal = showModal;
window.hideModal = hideModal;
window.toggleSidebar = toggleSidebar;
window.toggleMobileMenu = toggleMobileMenu;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showAlert = showAlert;
