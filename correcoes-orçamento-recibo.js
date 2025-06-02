// FUNÇÕES CORRIGIDAS PARA ORÇAMENTOS E RECIBOS
// Copie e substitua estas funções no seu arquivo index.html

// Função para gerar um novo orçamento
function gerarOrcamento() {
    document.getElementById('orcamento-modal').classList.remove('hidden');
    document.getElementById('orcamento-print').classList.add('hidden');
    
    // Limpar campos
    document.getElementById('orcamento-cliente').value = '';
    document.getElementById('orcamento-servico').value = '';
    document.getElementById('orcamento-valor').value = '';
    document.getElementById('orcamento-validade').value = '7';
    
    carregarClientesNoSelect('orcamento-cliente');
    carregarServicosNoSelect('orcamento-servico');
    
    // Gerar número de orçamento
    document.getElementById('orcamento-numero-print').textContent = 'ORC' + new Date().getTime().toString().slice(-6);
}

// Função para salvar orçamento
async function salvarOrcamento() {
    const cliente_id = document.getElementById('orcamento-cliente').value;
    const servico_id = document.getElementById('orcamento-servico').value;
    const valor = document.getElementById('orcamento-valor').value;
    const validade = document.getElementById('orcamento-validade').value;
    const observacoes = "Orçamento válido por " + validade + " dias.";
    
    if (!cliente_id || !servico_id || !valor) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('orcamentos')
            .insert([{ cliente_id, servico_id, valor, validade, observacoes }]);
        
        if (error) throw error;
        
        alert('Orçamento salvo com sucesso!');
        document.getElementById('orcamento-modal').classList.add('hidden');
        carregarOrcamentos();
    } catch (error) {
        console.error('Erro ao salvar orçamento:', error);
        alert('Erro ao salvar orçamento');
    }
}

// Função para imprimir orçamento
function imprimirOrcamento() {
    try {
        const clienteSelect = document.getElementById('orcamento-cliente');
        const servicoSelect = document.getElementById('orcamento-servico');
        
        if (!clienteSelect || !servicoSelect || clienteSelect.selectedIndex === -1 || servicoSelect.selectedIndex === -1) {
            alert('Selecione um cliente e um serviço antes de imprimir');
            return;
        }
        
        const cliente = clienteSelect.options[clienteSelect.selectedIndex].text;
        const servico = servicoSelect.options[servicoSelect.selectedIndex].text;
        const valor = parseFloat(document.getElementById('orcamento-valor').value).toFixed(2);
        const validade = document.getElementById('orcamento-validade').value;
        
        // Gerar número de orçamento se não existir
        if (!document.getElementById('orcamento-numero-print').textContent || 
            document.getElementById('orcamento-numero-print').textContent === '0001') {
            document.getElementById('orcamento-numero-print').textContent = 'ORC' + new Date().getTime().toString().slice(-6);
        }
        
        // Preencher dados para impressão
        document.getElementById('orcamento-cliente-print').textContent = cliente;
        document.getElementById('orcamento-data-print').textContent = new Date().toLocaleDateString();
        document.getElementById('orcamento-validade-print').textContent = validade + ' dias';
        document.getElementById('orcamento-descricao-print').textContent = servico;
        document.getElementById('orcamento-valor-print').textContent = 'R$ ' + valor;
        document.getElementById('orcamento-observacoes-print').textContent = 'Orçamento válido por ' + validade + ' dias.';
        
        // Mostrar área de impressão
        document.getElementById('orcamento-print').classList.remove('hidden');
        
        // Imprimir
        setTimeout(() => {
            window.print();
            document.getElementById('orcamento-print').classList.add('hidden');
        }, 500);
    } catch (error) {
        console.error('Erro ao imprimir orçamento:', error);
        alert('Erro ao imprimir orçamento. Verifique se todos os campos estão preenchidos.');
    }
}

// Função para visualizar orçamento
async function visualizarOrcamento(id) {
    try {
        const { data, error } = await supabase
            .from('orcamentos')
            .select('*, clientes(*), servicos(*)')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        if (!data) {
            alert('Orçamento não encontrado!');
            return;
        }
        
        // Mostrar o modal correto
        document.getElementById('orcamento-modal').classList.remove('hidden');
        document.getElementById('orcamento-print').classList.remove('hidden');
        
        // Preencher dados para visualização/impressão
        document.getElementById('orcamento-numero-print').textContent = 'ORC' + new Date(data.created_at).getTime().toString().slice(-6);
        document.getElementById('orcamento-cliente-print').textContent = data.clientes?.nome || 'Cliente não encontrado';
        document.getElementById('orcamento-data-print').textContent = new Date(data.created_at).toLocaleDateString();
        document.getElementById('orcamento-validade-print').textContent = data.validade + ' dias';
        document.getElementById('orcamento-descricao-print').textContent = data.servicos?.descricao || 'Serviço não encontrado';
        document.getElementById('orcamento-valor-print').textContent = 'R$ ' + parseFloat(data.valor).toFixed(2);
        document.getElementById('orcamento-observacoes-print').textContent = data.observacoes || 'Orçamento válido por ' + data.validade + ' dias.';
        
        // Preencher campos do formulário também (para edição se necessário)
        carregarClientesNoSelect('orcamento-cliente');
        carregarServicosNoSelect('orcamento-servico');
        setTimeout(() => {
            document.getElementById('orcamento-cliente').value = data.cliente_id;
            document.getElementById('orcamento-servico').value = data.servico_id;
            document.getElementById('orcamento-valor').value = data.valor;
            document.getElementById('orcamento-validade').value = data.validade || 7;
        }, 500); // Pequeno atraso para garantir que os selects foram carregados
    } catch (error) {
        console.error('Erro ao visualizar orçamento:', error);
        alert('Erro ao visualizar orçamento');
    }
}

// Função para gerar um novo recibo
function gerarRecibo() {
    document.getElementById('recibo-modal').classList.remove('hidden');
    document.getElementById('recibo-print').classList.add('hidden');
    
    // Limpar campos manualmente já que não temos um form
    document.getElementById('recibo-cliente').value = '';
    document.getElementById('recibo-servico').value = '';
    document.getElementById('recibo-valor').value = '';
    document.getElementById('recibo-forma-pagamento').value = 'Dinheiro';
    
    carregarClientesNoSelect('recibo-cliente');
    carregarServicosNoSelect('recibo-servico');
    
    // Gerar número de recibo
    document.getElementById('recibo-numero-print').textContent = 'REC' + new Date().getTime().toString().slice(-6);
    document.getElementById('recibo-data-print').textContent = new Date().toLocaleDateString();
}

// Função para salvar recibo
async function salvarRecibo() {
    const cliente_id = document.getElementById('recibo-cliente').value;
    const servico_id = document.getElementById('recibo-servico').value;
    const valor = document.getElementById('recibo-valor').value;
    const forma_pagamento = document.getElementById('recibo-forma-pagamento').value;
    
    if (!cliente_id || !servico_id || !valor) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('recibos')
            .insert([{ cliente_id, servico_id, valor, forma_pagamento }]);
        
        if (error) throw error;
        
        alert('Recibo salvo com sucesso!');
        document.getElementById('recibo-modal').classList.add('hidden');
        carregarRecibos();
    } catch (error) {
        console.error('Erro ao salvar recibo:', error);
        alert('Erro ao salvar recibo');
    }
}

// Função para imprimir recibo
function imprimirRecibo() {
    try {
        const clienteSelect = document.getElementById('recibo-cliente');
        const servicoSelect = document.getElementById('recibo-servico');
        
        if (!clienteSelect || !servicoSelect || clienteSelect.selectedIndex === -1 || servicoSelect.selectedIndex === -1) {
            alert('Selecione um cliente e um serviço antes de imprimir');
            return;
        }
        
        const cliente = clienteSelect.options[clienteSelect.selectedIndex].text;
        const servico = servicoSelect.options[servicoSelect.selectedIndex].text;
        const valor = parseFloat(document.getElementById('recibo-valor').value);
        const formaPagamento = document.getElementById('recibo-forma-pagamento').value;
        
        // Gerar número de recibo se não existir
        if (!document.getElementById('recibo-numero-print').textContent || 
            document.getElementById('recibo-numero-print').textContent === '0001') {
            document.getElementById('recibo-numero-print').textContent = 'REC' + new Date().getTime().toString().slice(-6);
        }
        
        // Preencher dados para impressão
        document.getElementById('recibo-cliente-print').textContent = cliente;
        document.getElementById('recibo-data-print').textContent = new Date().toLocaleDateString();
        document.getElementById('recibo-descricao-print').textContent = servico;
        document.getElementById('recibo-valor-extenso-print').textContent = valorParaExtenso(valor);
        document.getElementById('recibo-forma-pagamento-print').textContent = formaPagamento;
        
        // Mostrar área de impressão
        document.getElementById('recibo-print').classList.remove('hidden');
        
        // Imprimir
        setTimeout(() => {
            window.print();
            document.getElementById('recibo-print').classList.add('hidden');
        }, 500);
    } catch (error) {
        console.error('Erro ao imprimir recibo:', error);
        alert('Erro ao imprimir recibo. Verifique se todos os campos estão preenchidos.');
    }
}

// Função para visualizar recibo
async function visualizarRecibo(id) {
    try {
        const { data, error } = await supabase
            .from('recibos')
            .select('*, clientes(*), servicos(*)')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        if (!data) {
            alert('Recibo não encontrado!');
            return;
        }
        
        document.getElementById('recibo-modal').classList.remove('hidden');
        document.getElementById('recibo-print').classList.remove('hidden');
        
        // Preencher dados para impressão
        document.getElementById('recibo-numero-print').textContent = 'REC' + new Date(data.created_at).getTime().toString().slice(-6);
        document.getElementById('recibo-cliente-print').textContent = data.clientes?.nome || 'Cliente não encontrado';
        document.getElementById('recibo-descricao-print').textContent = data.servicos?.descricao || 'Serviço não encontrado';
        document.getElementById('recibo-valor-extenso-print').textContent = valorParaExtenso(data.valor);
        document.getElementById('recibo-forma-pagamento-print').textContent = data.forma_pagamento || 'Não informado';
        document.getElementById('recibo-data-print').textContent = new Date(data.created_at).toLocaleDateString();
        
        // Preencher campos do formulário também (para edição se necessário)
        carregarClientesNoSelect('recibo-cliente');
        carregarServicosNoSelect('recibo-servico');
        setTimeout(() => {
            document.getElementById('recibo-cliente').value = data.cliente_id;
            document.getElementById('recibo-servico').value = data.servico_id;
            document.getElementById('recibo-valor').value = data.valor;
            document.getElementById('recibo-forma-pagamento').value = data.forma_pagamento || 'Dinheiro';
        }, 500); // Pequeno atraso para garantir que os selects foram carregados
    } catch (error) {
        console.error('Erro ao visualizar recibo:', error);
        alert('Erro ao visualizar recibo');
    }
}

// Função para converter valor para extenso (caso não exista no código original)
function valorParaExtenso(valor) {
    if (valor === 0 || !valor) return 'zero reais';
    
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    
    const parteInteira = Math.floor(parseFloat(valor));
    const centavos = Math.round((parseFloat(valor) - parteInteira) * 100);
    
    let extenso = '';
    
    if (parteInteira > 0) {
        if (parteInteira === 1) {
            extenso = 'um real';
        } else {
            // Simplificado para valores até 99
            const unidade = parteInteira % 10;
            const dezena = Math.floor(parteInteira / 10) % 10;
            
            if (dezena === 1 && unidade > 0) {
                extenso = especiais[unidade] + ' reais';
            } else {
                if (dezena > 0) extenso += dezenas[dezena];
                if (dezena > 0 && unidade > 0) extenso += ' e ';
                if (unidade > 0) extenso += unidades[unidade];
                extenso += ' reais';
            }
        }
    }
    
    if (centavos > 0) {
        if (parteInteira > 0) extenso += ' e ';
        
        if (centavos === 1) {
            extenso += 'um centavo';
        } else {
            const unidadeCent = centavos % 10;
            const dezenaCent = Math.floor(centavos / 10) % 10;
            
            if (dezenaCent === 1 && unidadeCent > 0) {
                extenso += especiais[unidadeCent] + ' centavos';
            } else {
                if (dezenaCent > 0) extenso += dezenas[dezenaCent];
                if (dezenaCent > 0 && unidadeCent > 0) extenso += ' e ';
                if (unidadeCent > 0) extenso += unidades[unidadeCent];
                extenso += ' centavos';
            }
        }
    }
    
    return extenso;
}
