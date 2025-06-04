// Utilitários de data
function formatarData(data, incluirHora = false) {
    if (!data) return 'N/A';
    
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return 'Data inválida';
    
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    
    let dataFormatada = `${dia}/${mes}/${ano}`;
    
    if (incluirHora) {
        const hora = String(dataObj.getHours()).padStart(2, '0');
        const minutos = String(dataObj.getMinutes()).padStart(2, '0');
        dataFormatada += ` ${hora}:${minutos}`;
    }
    
    return dataFormatada;
}

function calcularDiferencaDias(dataInicio, dataFim) {
    const umDia = 24 * 60 * 60 * 1000; // horas*minutos*segundos*milissegundos
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    // Resetar o horário para meia-noite para comparar apenas as datas
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);
    
    const diffDias = Math.round(Math.abs((inicio - fim) / umDia));
    return diffDias;
}

// Utilitários de formatação
function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarDocumento(documento) {
    if (!documento) return '';
    
    // Remove caracteres não numéricos
    const numeros = documento.replace(/\D/g, '');
    
    // Verifica se é CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (numeros.length === 11) {
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numeros.length === 14) {
        return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    // Retorna o valor original se não for CPF nem CNPJ
    return documento;
}

// Utilitários de validação
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[\D]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    const digito1 = resto >= 10 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    const digito2 = resto >= 10 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
}

// Utilitários de manipulação de arrays e objetos
function filtrarPorTermo(array, termo, campos) {
    if (!termo) return array;
    
    const termoLower = termo.toLowerCase();
    
    return array.filter(item => {
        return campos.some(campo => {
            const valor = campo.split('.').reduce((obj, key) => 
                obj && obj[key], item
            );
            
            return String(valor || '').toLowerCase().includes(termoLower);
        });
    });
}

function ordenarArray(array, campo, direcao = 'asc') {
    return [...array].sort((a, b) => {
        let valorA = a[campo];
        let valorB = b[campo];
        
        // Se for data, converter para timestamp
        if (campo.toLowerCase().includes('data') || campo.toLowerCase().includes('dt_')) {
            valorA = new Date(valorA).getTime();
            valorB = new Date(valorB).getTime();
        }
        
        // Se for string, converter para minúsculas para comparação case-insensitive
        if (typeof valorA === 'string') valorA = valorA.toLowerCase();
        if (typeof valorB === 'string') valorB = valorB.toLowerCase();
        
        if (valorA < valorB) return direcao === 'asc' ? -1 : 1;
        if (valorA > valorB) return direcao === 'asc' ? 1 : -1;
        return 0;
    });
}

// Utilitários de interface
function mostrarMensagem(titulo, mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
        tipo === 'success' ? 'bg-green-500' :
        tipo === 'error' ? 'bg-red-500' :
        tipo === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
    }`;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                ${tipo === 'success' ? '✓' :
                  tipo === 'error' ? '✕' :
                  tipo === 'warning' ? '⚠' :
                  'ℹ'}
            </div>
            <div class="ml-3">
                <h3 class="font-medium">${titulo}</h3>
                <p class="text-sm">${mensagem}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                &times;
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
    
    return toast;
}

function mostrarCarregamento(mensagem = 'Carregando...') {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    overlay.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div class="flex items-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                <span class="text-gray-800">${mensagem}</span>
            </div>
        </div>
    `;
    
    overlay.id = 'loading-overlay';
    document.body.appendChild(overlay);
    
    return {
        fechar: () => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }
    };
}

// Exportar funções para o escopo global
window.formatarData = formatarData;
window.calcularDiferencaDias = calcularDiferencaDias;
window.formatarMoeda = formatarMoeda;
window.formatarDocumento = formatarDocumento;
window.validarEmail = validarEmail;
window.validarCPF = validarCPF;
window.filtrarPorTermo = filtrarPorTermo;
window.ordenarArray = ordenarArray;
window.mostrarMensagem = mostrarMensagem;
window.mostrarCarregamento = mostrarCarregamento;
