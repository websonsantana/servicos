// Módulo principal da aplicação
const App = (() => {
    'use strict';
    
    // Estado da aplicação
    const state = {
        clientes: [],
        servicos: [],
        equipe: [],
        orcamentos: [],
        recibos: [],
        notificacoes: [],
        currentUser: null,
        currentClientePage: 1,
        currentServicoPage: 1,
        currentFuncionarioPage: 1,
        itemsPerPage: 10,
        servicesEvolutionChart: null,
        servicesStatusChart: null
    };

    // Expor o estado globalmente
    window.state = state;

    // Inicialização do aplicativo
    async function init() {
        try {
            // Configurar eventos
            setupEventListeners();
            
            // Verificar autenticação
            await checkAuth();
            
            // Carregar dados iniciais
            await carregarDadosIniciais();
            
            // Inicializar gráficos
            initCharts();
            
            // Mostrar dashboard por padrão
            showSection('dashboard');
        } catch (error) {
            console.error('Erro ao inicializar o aplicativo:', error);
            mostrarMensagem('Erro', 'Não foi possível inicializar o aplicativo', 'error');
        }
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Eventos de navegação
        document.querySelectorAll('[data-section]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const section = button.getAttribute('data-section');
                showSection(section);
            });
        });

        // Eventos de formulários
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formId = form.id;
                const handler = formHandlers[formId];
                if (handler) handler(e);
            });
        });

        // Eventos de clique para ações
        document.addEventListener('click', (e) => {
            const actionElement = e.target.closest('[data-action]');
            if (!actionElement) return;

            const action = actionElement.getAttribute('data-action');
            const id = actionElement.getAttribute('data-id');
            const handler = actionHandlers[action];
            
            if (handler) {
                e.preventDefault();
                handler(id, actionElement);
            }
        });
    }

    // Handlers de formulários
    const formHandlers = {
        'cliente-form': handleClienteSubmit,
        'servico-form': handleServicoSubmit,
        'funcionario-form': handleFuncionarioSubmit,
        'orcamento-form': handleOrcamentoSubmit,
        'recibo-form': handleReciboSubmit
    };

    // Funções de autenticação
    async function checkAuth() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session) {
                state.currentUser = session.user;
                updateAuthUI(true);
            } else {
                state.currentUser = null;
                updateAuthUI(false);
                mostrarMensagem('Atenção', 'Você não está autenticado. Algumas funções podem não estar disponíveis.', 'warning');
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            mostrarMensagem('Erro', 'Não foi possível verificar a autenticação', 'error');
        }
    }

    function updateAuthUI(isAuthenticated) {
        const authElements = document.querySelectorAll('[data-auth]');
        authElements.forEach(element => {
            const requiredAuth = element.getAttribute('data-auth') === 'true';
            if (isAuthenticated === requiredAuth) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });

        // Atualizar informações do usuário
        const userInfoElements = document.querySelectorAll('[data-user]');
        if (isAuthenticated && state.currentUser) {
            userInfoElements.forEach(element => {
                const userProperty = element.getAttribute('data-user');
                if (userProperty === 'email') {
                    element.textContent = state.currentUser.email;
                } else if (userProperty === 'name') {
                    element.textContent = state.currentUser.user_metadata?.full_name || 'Usuário';
                }
            });
        }
    }

    // Funções de navegação
    function showSection(sectionId) {
        // Esconder todas as seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Mostrar a seção solicitada
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        
        // Atualizar menu ativo
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeMenuItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        // Rolar para o topo
        window.scrollTo(0, 0);
    }

    // Funções de UI
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }


    // Funções de carregamento de dados
    async function carregarDadosIniciais() {
        showLoading();
        try {
            // Carregar clientes
            const { data: clientes, error: clientesError } = await supabase
                .from('clientes')
                .select('*')
                .order('nome');
            if (clientesError) throw clientesError;
            state.clientes = clientes || [];
            renderizarClientes();

            // Carregar serviços
            const { data: servicos, error: servicosError } = await supabase
                .from('servicos')
                .select('*')
                .order('descricao');
            if (servicosError) throw servicosError;
            state.servicos = servicos || [];
            renderizarServicos();

            // Carregar equipe
            const { data: equipe, error: equipeError } = await supabase
                .from('equipe')
                .select('*')
                .order('nome');
            if (equipeError) throw equipeError;
            state.equipe = equipe || [];
            renderizarEquipe();

            // Carregar orçamentos
            const { data: orcamentos, error: orcamentosError } = await supabase
                .from('orcamentos')
                .select('*')
                .order('created_at', { ascending: false });
            if (orcamentosError) throw orcamentosError;
            state.orcamentos = orcamentos || [];
            if (typeof renderizarOrcamentos === 'function') renderizarOrcamentos();

            // Carregar recibos
            const { data: recibos, error: recibosError } = await supabase
                .from('recibos')
                .select('*')
                .order('created_at', { ascending: false });
            if (recibosError) throw recibosError;
            state.recibos = recibos || [];
            if (typeof renderizarRecibos === 'function') renderizarRecibos();

            if (typeof updateDashboard === 'function') updateDashboard();
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            mostrarMensagem('Erro', 'Não foi possível carregar os dados iniciais', 'error');
        } finally {
            hideLoading();
        }
    }

    // Funções de renderização
    function renderizarServicos() {
        const tbody = document.getElementById('servicos-tbody');
        if (!tbody) return;
        
        const start = (state.currentServicoPage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        const servicosPaginados = state.servicos.slice(start, end);
        
        tbody.innerHTML = servicosPaginados.map(servico => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${servico.descricao || 'Sem descrição'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">R$ ${servico.valor ? servico.valor.toFixed(2) : '0,00'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${servico.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${servico.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-action="editar-servico" data-id="${servico.id}" class="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                    <button data-action="excluir-servico" data-id="${servico.id}" class="text-red-600 hover:text-red-900">Excluir</button>
                </td>
            </tr>
        `).join('');
        
        // Atualizar paginação
        updatePagination('servico', state.servicos.length, state.currentServicoPage);
    }

    function renderizarEquipe() {
        const tbody = document.getElementById('equipe-tbody');
        if (!tbody) return;
        
        const start = (state.currentFuncionarioPage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        const equipePaginados = state.equipe.slice(start, end);
        
        tbody.innerHTML = equipePaginados.map(funcionario => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            ${funcionario.foto_url ? 
                                `<img class="h-10 w-10 rounded-full" src="${funcionario.foto_url}" alt="${funcionario.nome || ''}">` :
                                `<span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 text-white">
                                    ${funcionario.nome ? funcionario.nome.charAt(0).toUpperCase() : '?'}
                                </span>`
                            }
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${funcionario.nome || 'Sem nome'}</div>
                            <div class="text-sm text-gray-500">${funcionario.cargo || 'Sem cargo'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${funcionario.email || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${funcionario.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${funcionario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-action="editar-funcionario" data-id="${funcionario.id}" class="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                    <button data-action="excluir-funcionario" data-id="${funcionario.id}" class="text-red-600 hover:text-red-900">Excluir</button>
                </td>
            </tr>
        `).join('');
        
        // Atualizar paginação
        updatePagination('funcionario', state.equipe.length, state.currentFuncionarioPage);
    }

    function renderizarClientes() {
        const tbody = document.getElementById('clientes-tbody');
        if (!tbody) return;
        
        const start = (state.currentClientePage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        const clientesPaginados = state.clientes.slice(start, end);
        
        tbody.innerHTML = clientesPaginados.map(cliente => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 text-white">
                                ${cliente.nome ? cliente.nome.charAt(0).toUpperCase() : '?'}
                            </span>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${cliente.nome || 'Sem nome'}</div>
                            <div class="text-sm text-gray-500">${cliente.email || 'Sem e-mail'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${cliente.telefone || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${cliente.status || 'Ativo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-action="editar-cliente" data-id="${cliente.id}" class="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                    <button data-action="excluir-cliente" data-id="${cliente.id}" class="text-red-600 hover:text-red-900">Excluir</button>
                </td>
            </tr>
        `).join('');
        
        // Atualizar paginação
        updatePagination('cliente', state.clientes.length, state.currentClientePage);
    }

    function renderizarOrcamentos() {
        const tbody = document.getElementById('orcamentos-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = state.orcamentos.map(orcamento => {
            const cliente = state.clientes.find(c => c.id === orcamento.cliente_id);
            const servico = state.servicos.find(s => s.id === orcamento.servico_id);
            const dataEmissao = new Date(orcamento.created_at).toLocaleDateString('pt-BR');
            const dataValidade = orcamento.validade ? new Date(orcamento.validade).toLocaleDateString('pt-BR') : 'N/A';
            
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${cliente ? cliente.nome : 'Cliente não encontrado'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${servico ? servico.descricao : 'Serviço não encontrado'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">R$ ${orcamento.valor ? orcamento.valor.toFixed(2) : '0,00'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${dataValidade}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${orcamento.status === 'aprovado' ? 'bg-green-100 text-green-800' : 
                              orcamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}">
                            ${orcamento.status ? orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1) : 'Pendente'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button data-action="visualizar-orcamento" data-id="${orcamento.id}" class="text-indigo-600 hover:text-indigo-900 mr-3">Visualizar</button>
                        <button data-action="excluir-orcamento" data-id="${orcamento.id}" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderizarRecibos() {
        const tbody = document.getElementById('recibos-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = state.recibos.map(recibo => {
            const cliente = state.clientes.find(c => c.id === recibo.cliente_id);
            const servico = state.servicos.find(s => s.id === recibo.servico_id);
            const dataEmissao = new Date(recibo.created_at).toLocaleDateString('pt-BR');
            
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${cliente ? cliente.nome : 'Cliente não encontrado'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${servico ? servico.descricao : 'Serviço não encontrado'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">R$ ${recibo.valor ? recibo.valor.toFixed(2) : '0,00'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${recibo.forma_pagamento ? recibo.forma_pagamento.charAt(0).toUpperCase() + recibo.forma_pagamento.slice(1) : 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${dataEmissao}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button data-action="visualizar-recibo" data-id="${recibo.id}" class="text-indigo-600 hover:text-indigo-900 mr-3">Visualizar</button>
                        <button data-action="excluir-recibo" data-id="${recibo.id}" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Inicializar gráficos
    function initCharts() {
        updateCharts();
    }

    // Mostrar mensagem
    function mostrarMensagem(titulo, mensagem, tipo = 'success') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: tipo,
            title: titulo,
            text: mensagem
        });
    }

    // Funções de paginação
    function updatePagination(type, totalItems, currentPage) {
        const totalPages = Math.ceil(totalItems / state.itemsPerPage);
        const paginationContainer = document.getElementById(`${type}-pagination`);
        
        if (!paginationContainer) return;
        
        let paginationHTML = `
            <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div class="flex justify-between flex-1 sm:hidden">
                    <button onclick="App.previousPage('${type}')" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" ${currentPage === 1 ? 'disabled' : ''}>
                        Anterior
                    </button>
                    <button onclick="App.nextPage('${type}')" class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" ${currentPage === totalPages ? 'disabled' : ''}>
                        Próximo
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Mostrando <span class="font-medium">${(currentPage - 1) * state.itemsPerPage + 1}</span>
                            a <span class="font-medium">${Math.min(currentPage * state.itemsPerPage, totalItems)}</span>
                            de <span class="font-medium">${totalItems}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button onclick="App.previousPage('${type}')" class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50" ${currentPage === 1 ? 'disabled' : ''}>
                                <span class="sr-only">Anterior</span>
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = currentPage <= 3 ? i + 1 : 
                                              currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                              currentPage - 2 + i;
                                if (pageNum < 1 || pageNum > totalPages) return '';
                                return `
                                    <button onclick="App.goToPage('${type}', ${pageNum})" class="relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === pageNum ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} border">
                                        ${pageNum}
                                    </button>
                                `;
                            }).join('')}
                            <button onclick="App.nextPage('${type}')" class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50" ${currentPage === totalPages ? 'disabled' : ''}>
                                <span class="sr-only">Próximo</span>
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
    }

    // Mostrar/ocultar loading
    function showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    }

    function hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }

    // Funções de manipulação de formulários
    async function handleClienteSubmit(e) {
        showLoading();
        try {
            const formData = new FormData(e.target);
            const clienteData = Object.fromEntries(formData.entries());
            
            // Validação básica
            if (!clienteData.nome) {
                throw new Error('O nome do cliente é obrigatório');
            }
            
            let result;
            if (clienteData.id) {
                // Atualizar cliente existente
                const { data, error } = await supabase
                    .from('clientes')
                    .update({
                        nome: clienteData.nome,
                        email: clienteData.email || null,
                        telefone: clienteData.telefone || null,
                        endereco: clienteData.endereco || null,
                        atualizado_em: new Date().toISOString()
                    })
                    .eq('id', clienteData.id)
                    .select();
                
                if (error) throw error;
                result = data[0];
                
                // Atualizar no estado local
                const index = state.clientes.findIndex(c => c.id === clienteData.id);
                if (index !== -1) {
                    state.clientes[index] = { ...state.clientes[index], ...result };
                }
                
                mostrarMensagem('Sucesso', 'Cliente atualizado com sucesso!');
            } else {
                // Criar novo cliente
                const { data, error } = await supabase
                    .from('clientes')
                    .insert([{
                        nome: clienteData.nome,
                        email: clienteData.email || null,
                        telefone: clienteData.telefone || null,
                        endereco: clienteData.endereco || null
                    }])
                    .select();
                
                if (error) throw error;
                result = data[0];
                
                // Adicionar ao estado local
                state.clientes.push(result);
                state.clientes.sort((a, b) => a.nome.localeCompare(b.nome));
                
                mostrarMensagem('Sucesso', 'Cliente cadastrado com sucesso!');
            }
            
            // Atualizar a UI
            renderizarClientes();
            
            // Fechar o modal
            hideModal('cliente');
            
            // Resetar o formulário
            e.target.reset();
            
            return result;
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            mostrarMensagem('Erro', error.message || 'Não foi possível salvar o cliente', 'error');
            throw error;
        } finally {
            hideLoading();
        }
    }

    async function handleServicoSubmit(e) {
        showLoading();
        try {
            const formData = new FormData(e.target);
            const servicoData = Object.fromEntries(formData.entries());
            
            // Validação básica
            if (!servicoData.descricao) {
                //throw new Error('A descrição do serviço é obrigatória');
            }
            
            if (!servicoData.valor) {
                throw new Error('O valor do serviço é obrigatório');
            }
            
            // Converter valor para número
            servicoData.valor = parseFloat(servicoData.valor.replace(/\./g, '').replace(',', '.'));
            
            let result;
            if (servicoData.id) {
                // Atualizar serviço existente
                const { data, error } = await supabase
                    .from('servicos')
                    .update({
                        descricao: servicoData.descricao,
                        valor: servicoData.valor,
                        duracao: servicoData.duracao || null,
                        status: servicoData.status || 'ativo',
                        atualizado_em: new Date().toISOString()
                    })
                    .eq('id', servicoData.id)
                    .select();
                
                if (error) throw error;
                result = data[0];
                
                // Atualizar no estado local
                const index = state.servicos.findIndex(s => s.id === servicoData.id);
                if (index !== -1) {
                    state.servicos[index] = { ...state.servicos[index], ...result };
                }
                
                mostrarMensagem('Sucesso', 'Serviço atualizado com sucesso!');
            } else {
                // Criar novo serviço
                const { data, error } = await supabase
                    .from('servicos')
                    .insert([{
                        descricao: servicoData.descricao,
                        valor: servicoData.valor,
                        duracao: servicoData.duracao || null,
                        status: servicoData.status || 'ativo'
                    }])
                    .select();
                
                if (error) throw error;
                result = data[0];
                
                // Adicionar ao estado local
                state.servicos.push(result);
                state.servicos.sort((a, b) => a.descricao.localeCompare(b.descricao));
                
                mostrarMensagem('Sucesso', 'Serviço cadastrado com sucesso!');
            }
            
            // Atualizar a UI
            renderizarServicos();
            
            // Fechar o modal
            hideModal('servico');
            
            // Resetar o formulário
            e.target.reset();
            
            return result;
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            mostrarMensagem('Erro', error.message || 'Não foi possível salvar o serviço', 'error');
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Handlers de ações
    const actionHandlers = {
        'editar-cliente': handleEditarCliente,
        'excluir-cliente': handleExcluirCliente,
        'editar-servico': handleEditarServico,
        'excluir-servico': handleExcluirServico,
        'editar-funcionario': handleEditarFuncionario,
        'excluir-funcionario': handleExcluirFuncionario
    };

    // Funções de manipulação de clientes
    async function handleEditarCliente(id) {
        try {
            const cliente = state.clientes.find(c => c.id === id);
            if (!cliente) {
                throw new Error('Cliente não encontrado');
            }
            
            // Preencher o formulário
            const form = document.getElementById('cliente-form');
            if (form) {
                form.reset();
                Object.keys(cliente).forEach(key => {
                    if (form.elements[key]) {
                        form.elements[key].value = cliente[key] || '';
                    }
                });
                
                // Mostrar o modal
                showModal('cliente');
                
                // Rolar para o topo do formulário
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Erro ao editar cliente:', error);
            mostrarMensagem('Erro', error.message || 'Não foi possível carregar os dados do cliente', 'error');
        }
    }
    
    async function handleExcluirCliente(id) {
        try {
            const confirmacao = await Swal.fire({
                title: 'Tem certeza?',
                text: 'Esta ação não pode ser desfeita!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar'
            });
            
            if (confirmacao.isConfirmed) {
                showLoading();
                
                // Excluir o cliente
                const { error } = await supabase
                    .from('clientes')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                // Atualizar o estado local
                state.clientes = state.clientes.filter(c => c.id !== id);
                
                // Atualizar a UI
                renderizarClientes();
                
                mostrarMensagem('Sucesso', 'Cliente excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            mostrarMensagem('Erro', 'Não foi possível excluir o cliente', 'error');
        } finally {
            hideLoading();
        }
    }

    // Funções de manipulação de serviços
    async function handleFuncionarioSubmit(e) {
        showLoading();
        try {
            const formData = new FormData(e.target);
            const funcionarioData = Object.fromEntries(formData.entries());
            
            // Validação básica
            if (!funcionarioData.nome) {
                throw new Error('O nome do funcionário é obrigatório');
            }
            
            // Processar a foto se existir
            let fotoUrl = funcionarioData.foto_url_antiga || '';
            const fotoInput = e.target.querySelector('input[type="file"]');
            
            if (fotoInput && fotoInput.files && fotoInput.files[0]) {
                const file = fotoInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`.replace(/[^a-z0-9.]/gi, '').toLowerCase();
                const filePath = `funcionarios/${fileName}`;
                
                // Fazer upload do arquivo
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('funcionarios')
                    .upload(filePath, file);
                
                if (uploadError) throw uploadError;
                
                // Obter URL pública
                const { data: { publicUrl } } = supabase.storage
                    .from('funcionarios')
                    .getPublicUrl(filePath);
                
                fotoUrl = publicUrl;
            }
            
            let result;
            if (funcionarioData.id) {
                // Atualizar funcionário existente
                const { data, error } = await supabase
                    .from('equipe')
                    .update({
                        nome: funcionarioData.nome,
                        email: funcionarioData.email || null,
                        telefone: funcionarioData.telefone || null,
                        cargo: funcionarioData.cargo || null,
                        foto_url: fotoUrl || null,
                        status: funcionarioData.status || 'ativo',
                        atualizado_em: new Date().toISOString()
                    })
                    .eq('id', funcionarioData.id)
                    .select();
                
                if (error) throw error;
                result = data[0];
                
                // Atualizar no estado local
                const index = state.equipe.findIndex(f => f.id === funcionarioData.id);
                if (index !== -1) {
                    state.equipe[index] = { ...state.equipe[index], ...result };
                }
                
                mostrarMensagem('Sucesso', 'Funcionário atualizado com sucesso!');
            } else {
                // Criar novo funcionário
                const { data, error } = await supabase
                    .from('equipe')
                    .insert([{
                        nome: funcionarioData.nome,
                        email: funcionarioData.email || null,
                        telefone: funcionarioData.telefone || null,
                        cargo: funcionarioData.cargo || null,
                        foto_url: fotoUrl || null,
                        status: funcionarioData.status || 'ativo'
                    }])
                    .select();
                
                if (error) throw error;
                result = data[0];
                
                // Adicionar ao estado local
                state.equipe.push(result);
                state.equipe.sort((a, b) => a.nome.localeCompare(b.nome));
                
                mostrarMensagem('Sucesso', 'Funcionário cadastrado com sucesso!');
            }
            
            // Atualizar a UI
            renderizarEquipe();
            
            // Fechar o modal
            hideModal('funcionario');
            
            // Resetar o formulário
            e.target.reset();
            
            return result;
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
            mostrarMensagem('Erro', error.message || 'Não foi possível salvar o funcionário', 'error');
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Funções de manipulação de serviços
    async function handleEditarServico(id) {
        try {
            const servico = state.servicos.find(s => s.id === id);
            if (!servico) {
                throw new Error('Serviço não encontrado');
            }
            
            // Preencher o formulário
            const form = document.getElementById('servico-form');
            if (form) {
                form.reset();
                Object.keys(servico).forEach(key => {
                    if (form.elements[key]) {
                        form.elements[key].value = servico[key] || '';
                    }
                });
                
                // Mostrar o modal
                showModal('servico');
                
                // Rolar para o topo do formulário
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Erro ao editar serviço:', error);
            mostrarMensagem('Erro', error.message || 'Não foi possível carregar os dados do serviço', 'error');
        }
    }
    
    async function handleExcluirServico(id) {
        try {
            const confirmacao = await Swal.fire({
                title: 'Tem certeza?',
                text: 'Esta ação não pode ser desfeita!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar'
            });
            
            if (confirmacao.isConfirmed) {
                showLoading();
                
                // Excluir o serviço
                const { error } = await supabase
                    .from('servicos')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                // Atualizar o estado local
                state.servicos = state.servicos.filter(s => s.id !== id);
                
                // Atualizar a UI
                renderizarServicos();
                
                mostrarMensagem('Sucesso', 'Serviço excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
            mostrarMensagem('Erro', 'Não foi possível excluir o serviço', 'error');
        } finally {
            hideLoading();
        }
    }

    // Funções de manipulação de funcionários
    async function handleEditarFuncionario(id) {
        try {
            const funcionario = state.equipe.find(f => f.id === id);
            if (!funcionario) {
                throw new Error('Funcionário não encontrado');
            }
            
            // Preencher o formulário
            const form = document.getElementById('funcionario-form');
            if (form) {
                form.reset();
                Object.keys(funcionario).forEach(key => {
                    if (form.elements[key]) {
                        form.elements[key].value = funcionario[key] || '';
                    }
                });
                
                // Adicionar a URL da foto antiga para referência
                const fotoAntigaInput = document.createElement('input');
                fotoAntigaInput.type = 'hidden';
                fotoAntigaInput.name = 'foto_url_antiga';
                fotoAntigaInput.value = funcionario.foto_url || '';
                form.appendChild(fotoAntigaInput);
                
                // Mostrar a prévia da foto se existir
                const fotoPreview = document.getElementById('foto-preview');
                if (fotoPreview && funcionario.foto_url) {
                    fotoPreview.src = funcionario.foto_url;
                    fotoPreview.classList.remove('hidden');
                }
                
                // Mostrar o modal
                showModal('funcionario');
                
                // Rolar para o topo do formulário
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Erro ao editar funcionário:', error);
            mostrarMensagem('Erro', error.message || 'Não foi possível carregar os dados do funcionário', 'error');
        }
    }
    
    async function handleExcluirFuncionario(id) {
        try {
            const confirmacao = await Swal.fire({
                title: 'Tem certeza?',
                text: 'Esta ação não pode ser desfeita!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar'
            });
            
            if (confirmacao.isConfirmed) {
                showLoading();
                
                // Excluir o funcionário
                const { error } = await supabase
                    .from('equipe')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                // Atualizar o estado local
                state.equipe = state.equipe.filter(f => f.id !== id);
                
                // Atualizar a UI
                renderizarEquipe();
                
                mostrarMensagem('Sucesso', 'Funcionário excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir funcionário:', error);
            mostrarMensagem('Erro', 'Não foi possível excluir o funcionário', 'error');
        } finally {
            hideLoading();
        }
    }

    // Funções auxiliares para o dashboard
    function updateDashboard() {
        // Atualizar contadores
        updateCounter('total-clientes', state.clientes.length);
        updateCounter('total-servicos', state.servicos.length);
        updateCounter('total-funcionarios', state.equipe.length);
        updateCounter('total-orcamentos', state.orcamentos.length);
        
        // Atualizar gráficos
        updateCharts();
    }
    
    function updateCounter(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = count;
        }
    }
    
    function updateCharts() {
        // Atualizar gráficos de evolução de serviços
        if (state.servicesEvolutionChart) {
            state.servicesEvolutionChart.destroy();
        }
        
        // Agrupar serviços por mês
        const servicosPorMes = {};
        state.servicos.forEach(servico => {
            if (servico.criado_em) {
                const data = new Date(servico.criado_em);
                const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
                
                if (!servicosPorMes[mesAno]) {
                    servicosPorMes[mesAno] = 0;
                }
                servicosPorMes[mesAno]++;
            }
        });
        
        const ctx = document.getElementById('services-evolution-chart');
        if (ctx) {
            state.servicesEvolutionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Object.keys(servicosPorMes),
                    datasets: [{
                        label: 'Serviços por Mês',
                        data: Object.values(servicosPorMes),
                        borderColor: 'rgb(99, 102, 241)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Evolução de Serviços'
                        }
                    }
                }
            });
        }
        
        // Atualizar gráfico de status de serviços
        if (state.servicesStatusChart) {
            state.servicesStatusChart.destroy();
        }
        
        const statusCount = {};
        state.servicos.forEach(servico => {
            const status = servico.status || 'ativo';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });
        
        const ctx2 = document.getElementById('services-status-chart');
        if (ctx2) {
            state.servicesStatusChart = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(statusCount).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                    datasets: [{
                        data: Object.values(statusCount),
                        backgroundColor: [
                            'rgb(34, 197, 94)', // Verde para ativo
                            'rgb(239, 68, 68)', // Vermelho para inativo
                            'rgb(249, 115, 22)' // Laranja para outros status
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Status dos Serviços'
                        }
                    }
                }
            });
        }
    }

    // Retornar métodos públicos
    return {
        init,
        showSection,
        showModal,
        hideModal,
        toggleSidebar,
        toggleMobileMenu,
        nextPage: (type) => {
            state[`current${type.charAt(0).toUpperCase() + type.slice(1)}Page`]++;
            if (type === 'cliente') renderizarClientes();
            else if (type === 'servico') renderizarServicos();
            else if (type === 'funcionario') renderizarEquipe();
        },
        previousPage: (type) => {
            if (state[`current${type.charAt(0).toUpperCase() + type.slice(1)}Page`] > 1) {
                state[`current${type.charAt(0).toUpperCase() + type.slice(1)}Page`]--;
                if (type === 'cliente') renderizarClientes();
                else if (type === 'servico') renderizarServicos();
                else if (type === 'funcionario') renderizarEquipe();
            }
        },
        goToPage: (type, page) => {
            state[`current${type.charAt(0).toUpperCase() + type.slice(1)}Page`] = page;
            if (type === 'cliente') renderizarClientes();
            else if (type === 'servico') renderizarServicos();
            else if (type === 'funcionario') renderizarEquipe();
        }
    };
})();

// Inicializar o aplicativo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

async function handleOrcamentoSubmit(e) {
    showLoading();
    try {
        const formData = new FormData(e.target);
        const orcamentoData = Object.fromEntries(formData.entries());
        // Validação básica
        if (!orcamentoData.cliente_id || !orcamentoData.servico_id || !orcamentoData.valor) {
            throw new Error('Preencha todos os campos obrigatórios do orçamento!');
        }
        let result;
        if (orcamentoData.id) {
            // Atualizar orçamento existente
            const { data, error } = await supabase
                .from('orcamentos')
                .update({
                    cliente_id: orcamentoData.cliente_id,
                    servico_id: orcamentoData.servico_id,
                    valor: parseFloat(orcamentoData.valor),
                    validade: orcamentoData.validade || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orcamentoData.id)
                .select();
            if (error) throw error;
            result = data[0];
            mostrarMensagem('Sucesso', 'Orçamento atualizado com sucesso!');
        } else {
            // Criar novo orçamento
            const { data, error } = await supabase
                .from('orcamentos')
                .insert([{
                    cliente_id: orcamentoData.cliente_id,
                    servico_id: orcamentoData.servico_id,
                    valor: parseFloat(orcamentoData.valor),
                    validade: orcamentoData.validade || null,
                    created_at: new Date().toISOString()
                }])
                .select();
            if (error) throw error;
            result = data[0];
            mostrarMensagem('Sucesso', 'Orçamento cadastrado com sucesso!');
        }
        // Atualizar a UI se necessário
        // renderizarOrcamentos();
        hideModal('orcamento');
        e.target.reset();
        return result;
    } catch (error) {
        console.error('Erro ao salvar orçamento:', error);
        mostrarMensagem('Erro', error.message || 'Não foi possível salvar o orçamento', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

async function handleReciboSubmit(e) {
    showLoading();
    try {
        const formData = new FormData(e.target);
        const reciboData = Object.fromEntries(formData.entries());
        // Validação básica
        if (!reciboData.cliente_id || !reciboData.servico_id || !reciboData.valor || !reciboData.forma_pagamento) {
            throw new Error('Preencha todos os campos obrigatórios do recibo!');
        }
        let result;
        if (reciboData.id) {
            // Atualizar recibo existente
            const { data, error } = await supabase
                .from('recibos')
                .update({
                    cliente_id: reciboData.cliente_id,
                    servico_id: reciboData.servico_id,
                    valor: parseFloat(reciboData.valor),
                    forma_pagamento: reciboData.forma_pagamento,
                    observacoes: reciboData.observacoes || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', reciboData.id)
                .select();
            if (error) throw error;
            result = data[0];
            mostrarMensagem('Sucesso', 'Recibo atualizado com sucesso!');
        } else {
            // Criar novo recibo
            const { data, error } = await supabase
                .from('recibos')
                .insert([{
                    cliente_id: reciboData.cliente_id,
                    servico_id: reciboData.servico_id,
                    valor: parseFloat(reciboData.valor),
                    forma_pagamento: reciboData.forma_pagamento,
                    observacoes: reciboData.observacoes || null,
                    created_at: new Date().toISOString()
                }])
                .select();
            if (error) throw error;
            result = data[0];
            mostrarMensagem('Sucesso', 'Recibo cadastrado com sucesso!');
        }
        // Atualizar a UI se necessário
        // renderizarRecibos();
        hideModal('recibo');
        e.target.reset();
        return result;
    } catch (error) {
        console.error('Erro ao salvar recibo:', error);
        mostrarMensagem('Erro', error.message || 'Não foi possível salvar o recibo', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

window.updateDashboard = updateDashboard;
