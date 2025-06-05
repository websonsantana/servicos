// Funções de Navegação e UI

/**
 * Mostra uma seção específica e atualiza a navegação
 * @param {string} section - ID da seção a ser mostrada
 */
export function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar a seção selecionada
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
        section.classList.remove('hidden');
        
        // Atualizar título da página
        const title = section.querySelector('h2')?.textContent || sectionId;
        document.title = `TecnoService - ${title}`;
        
        // Atualizar navegação
        updateNavigation(sectionId);
        
        // Anunciar para leitores de tela
        announcePageChange(title);
    }
}

/**
 * Exibe um modal específico
 * @param {string} type - Tipo do modal (cliente, servico, funcionario, etc.)
 */
export function showModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    if (!modal) return;
    
    // Adicionar classe para mostrar o modal
    modal.classList.remove('hidden');
    
    // Focar no primeiro campo do formulário
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
        firstInput.focus();
    }
    
    // Adicionar event listeners para acessibilidade
    setupModalAccessibility(modal);
    
    // Anunciar para leitores de tela
    const title = modal.querySelector('h3')?.textContent || type;
    announceModalOpen(title);
}

/**
 * Esconde um modal
 * @param {string} type - Tipo do modal a ser escondido
 */
export function hideModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    if (!modal) return;
    
    // Esconder o modal
    modal.classList.add('hidden');
    
    // Remover event listeners de acessibilidade
    cleanupModalAccessibility(modal);
    
    // Retornar foco ao elemento que abriu o modal
    const opener = document.activeElement;
    if (opener) {
        opener.focus();
    }
    
    // Anunciar para leitores de tela
    announceModalClose();
}

/**
 * Alterna a barra lateral entre expandida e recolhida
 */
export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (!sidebar || !overlay) return;
    
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    
    if (isOpen) {
        // Fechar sidebar
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    } else {
        // Abrir sidebar
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    }
    
    // Anunciar para leitores de tela
    announceSidebarToggle(!isOpen);
}

/**
 * Alterna o menu móvel
 */
export function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    
    const isOpen = !mobileMenu.classList.contains('hidden');
    
    if (isOpen) {
        mobileMenu.classList.add('hidden');
    } else {
        mobileMenu.classList.remove('hidden');
    }
    
    // Anunciar para leitores de tela
    announceMobileMenuToggle(!isOpen);
}

/**
 * Mostra a sobreposição de carregamento
 */
export function showLoading() {
    const loading = document.getElementById('loading-overlay');
    if (!loading) return;
    
    loading.classList.remove('hidden');
    loading.setAttribute('aria-busy', 'true');
    
    // Anunciar para leitores de tela
    announceLoading(true);
}

/**
 * Esconde a sobreposição de carregamento
 */
export function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (!loading) return;
    
    loading.classList.add('hidden');
    loading.setAttribute('aria-busy', 'false');
    
    // Anunciar para leitores de tela
    announceLoading(false);
}

/**
 * Mostra um alerta simples
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de alerta (opcional)
 */
export function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.setAttribute('role', 'alert');
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    // Remover alerta após 5 segundos
    setTimeout(() => {
        alert.remove();
    }, 5000);
    
    // Anunciar para leitores de tela
    announceAlert(message, type);
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

// Funções de acessibilidade
function setupModalAccessibility(modal) {
    // Trap focus dentro do modal
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', handleModalKeydown);
    
    function handleModalKeydown(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
        
        if (e.key === 'Escape') {
            const modalId = modal.id.replace('-modal', '');
            hideModal(modalId);
        }
    }
    
    modal.handleModalKeydown = handleModalKeydown;
}

function cleanupModalAccessibility(modal) {
    if (modal.handleModalKeydown) {
        modal.removeEventListener('keydown', modal.handleModalKeydown);
        delete modal.handleModalKeydown;
    }
}

// Funções de anúncio para leitores de tela
function announcePageChange(title) {
    const announcer = document.getElementById('announcer');
    if (!announcer) return;
    
    announcer.textContent = `Página alterada para ${title}`;
}

function announceModalOpen(title) {
    const announcer = document.getElementById('announcer');
    if (!announcer) return;
    
    announcer.textContent = `Modal ${title} aberto`;
}

function announceModalClose() {
    const announcer = document.getElementById('announcer');
    if (!announcer) return;
    
    announcer.textContent = 'Modal fechado';
}

function announceSidebarToggle(isOpen) {
    const announcer = document.getElementById('announcer');
    if (!announcer) return;
    
    announcer.textContent = `Menu lateral ${isOpen ? 'aberto' : 'fechado'}`;
}

function announceMobileMenuToggle(isOpen) {
    const announcer = document.getElementById('announcer');
    if (!announcer) return;
    
    announcer.textContent = `Menu mobile ${isOpen ? 'aberto' : 'fechado'}`;
}

function announceLoading(isLoading) {
    const announcer = document.getElementById('announcer');
    if (!announcer) return;
    
    announcer.textContent = isLoading ? 'Carregando...' : 'Carregamento concluído';
}

function announceAlert(message, type) {
    const announcer = document.getElementById('announcer');
    if (!announcer) return;
    
    announcer.textContent = `Alerta ${type}: ${message}`;
}

// Funções de navegação
function updateNavigation(currentSection) {
    // Atualizar links ativos no menu
    document.querySelectorAll('[data-section]').forEach(link => {
        const section = link.getAttribute('data-section');
        if (section === currentSection) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
    
    // Atualizar breadcrumbs
    updateBreadcrumbs(currentSection);
}

function updateBreadcrumbs(currentSection) {
    const breadcrumbs = document.getElementById('breadcrumbs');
    if (!breadcrumbs) return;
    
    const items = [
        { label: 'Início', section: 'dashboard' },
        { label: currentSection.charAt(0).toUpperCase() + currentSection.slice(1), section: currentSection }
    ];
    
    breadcrumbs.innerHTML = items
        .map((item, index) => {
            if (index === items.length - 1) {
                return `<span class="text-gray-500">${item.label}</span>`;
            }
            return `
                <a href="#" 
                   data-section="${item.section}"
                   class="text-blue-600 hover:text-blue-800"
                   onclick="showSection('${item.section}'); return false;">
                    ${item.label}
                </a>
                <span class="mx-2 text-gray-400">/</span>
            `;
        })
        .join('');
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
