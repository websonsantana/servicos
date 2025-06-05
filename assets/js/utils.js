// Utilitários de data
export function formatDate(date, incluirHora = false) {
    if (!date) return 'N/A';
    
    const dataObj = new Date(date);
    if (isNaN(dataObj.getTime())) return 'Data inválida';
    
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(incluirHora ? {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        } : {})
    };
    
    return new Intl.DateTimeFormat('pt-BR', options).format(dataObj);
}

export function calcularDiferencaDias(dataInicio, dataFim) {
    const umDia = 24 * 60 * 60 * 1000;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim || new Date());
    
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);
    
    return Math.round(Math.abs((inicio - fim) / umDia));
}

export function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 30) {
        return formatDate(date);
    } else if (days > 0) {
        return `${days} dia${days > 1 ? 's' : ''} atrás`;
    } else if (hours > 0) {
        return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else if (minutes > 0) {
        return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    } else {
        return 'Agora mesmo';
    }
}

// Utilitários de formatação
export function formatCurrency(valor, currency = 'BRL') {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency
    }).format(valor);
}

export function formatPhone(telefone) {
    if (!telefone) return '';
    
    const numeros = telefone.replace(/\D/g, '');
    
    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
}

export function formatDocument(documento, tipo = 'auto') {
    if (!documento) return '';
    
    const numeros = documento.replace(/\D/g, '');
    
    if (tipo === 'auto') {
        tipo = numeros.length === 11 ? 'cpf' : 'cnpj';
    }
    
    if (tipo === 'cpf' && numeros.length === 11) {
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (tipo === 'cnpj' && numeros.length === 14) {
        return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return documento;
}

// Utilitários de validação
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

export function validateCPF(cpf) {
    if (!cpf) return false;
    
    cpf = cpf.replace(/[\D]/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    const digito1 = resto >= 10 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    const digito2 = resto >= 10 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
}

export function validateCNPJ(cnpj) {
    if (!cnpj) return false;
    
    cnpj = cnpj.replace(/[\D]/g, '');
    
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito
    let soma = 0;
    let peso = 2;
    for (let i = 11; i >= 0; i--) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 9 ? 2 : peso + 1;
    }
    let digito = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (digito !== parseInt(cnpj.charAt(12))) return false;
    
    // Validação do segundo dígito
    soma = 0;
    peso = 2;
    for (let i = 12; i >= 0; i--) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 9 ? 2 : peso + 1;
    }
    digito = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    
    return digito === parseInt(cnpj.charAt(13));
}

// Utilitários de manipulação de arrays e objetos
export function filtrarPorTermo(array, termo, campos) {
    if (!termo || !array) return array || [];
    
    const termoLower = termo.toLowerCase().trim();
    
    return array.filter(item => {
        return campos.some(campo => {
            const valor = campo.split('.').reduce((obj, key) => 
                obj && obj[key], item
            );
            
            return String(valor || '').toLowerCase().includes(termoLower);
        });
    });
}

export function ordenarArray(array, campo, direcao = 'asc') {
    if (!array || !campo) return array || [];
    
    const collator = new Intl.Collator('pt-BR', {
        numeric: true,
        sensitivity: 'base'
    });
    
    return [...array].sort((a, b) => {
        let valorA = campo.split('.').reduce((obj, key) => obj && obj[key], a);
        let valorB = campo.split('.').reduce((obj, key) => obj && obj[key], b);
        
        // Tratar valores nulos/undefined
        if (valorA === null || valorA === undefined) return direcao === 'asc' ? -1 : 1;
        if (valorB === null || valorB === undefined) return direcao === 'asc' ? 1 : -1;
        
        // Se for data, converter para timestamp
        if (campo.toLowerCase().includes('data') || campo.toLowerCase().includes('dt_')) {
            valorA = new Date(valorA).getTime();
            valorB = new Date(valorB).getTime();
            return direcao === 'asc' ? valorA - valorB : valorB - valorA;
        }
        
        // Se for número, comparar numericamente
        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return direcao === 'asc' ? valorA - valorB : valorB - valorA;
        }
        
        // Comparar strings usando collator
        const comparacao = collator.compare(String(valorA), String(valorB));
        return direcao === 'asc' ? comparacao : -comparacao;
    });
}

// Utilitários de armazenamento
export function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Erro ao ler ${key} do localStorage:`, error);
        return defaultValue;
    }
}

export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error);
        return false;
    }
}

// Utilitários de performance
export function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit = 300) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Utilitários de URL
export function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params) {
        result[key] = value;
    }
    
    return result;
}

export function buildQueryString(params) {
    return Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}

// Utilitários de formulário
export function validarFormulario(form, campos) {
    const erros = {};
    
    campos.forEach(({ nome, tipo, obrigatorio, min, max, regex, mensagem }) => {
        const valor = form[nome];
        
        if (obrigatorio && !valor) {
            erros[nome] = mensagem || 'Campo obrigatório';
            return;
        }
        
        if (!valor) return;
        
        switch (tipo) {
            case 'email':
                if (!validateEmail(valor)) {
                    erros[nome] = mensagem || 'E-mail inválido';
                }
                break;
            
            case 'cpf':
                if (!validateCPF(valor)) {
                    erros[nome] = mensagem || 'CPF inválido';
                }
                break;
            
            case 'cnpj':
                if (!validateCNPJ(valor)) {
                    erros[nome] = mensagem || 'CNPJ inválido';
                }
                break;
            
            case 'telefone':
                if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(valor)) {
                    erros[nome] = mensagem || 'Telefone inválido';
                }
                break;
            
            case 'numero':
                const num = Number(valor);
                if (isNaN(num)) {
                    erros[nome] = mensagem || 'Número inválido';
                } else if (min !== undefined && num < min) {
                    erros[nome] = mensagem || `Valor mínimo: ${min}`;
                } else if (max !== undefined && num > max) {
                    erros[nome] = mensagem || `Valor máximo: ${max}`;
                }
                break;
            
            case 'texto':
                if (min !== undefined && valor.length < min) {
                    erros[nome] = mensagem || `Mínimo de ${min} caracteres`;
                } else if (max !== undefined && valor.length > max) {
                    erros[nome] = mensagem || `Máximo de ${max} caracteres`;
                }
                break;
            
            case 'regex':
                if (regex && !regex.test(valor)) {
                    erros[nome] = mensagem || 'Formato inválido';
                }
                break;
        }
    });
    
    return {
        valido: Object.keys(erros).length === 0,
        erros
    };
}

// Exportar todas as funções
export {
    formatDate,
    formatCurrency,
    formatPhone,
    formatDocument,
    formatRelativeTime,
    validateEmail,
    validateCPF,
    validateCNPJ,
    filtrarPorTermo,
    ordenarArray,
    calcularDiferencaDias,
    getLocalStorage,
    setLocalStorage,
    debounce,
    throttle,
    getQueryParams,
    buildQueryString,
    validarFormulario
};
