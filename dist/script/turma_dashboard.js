"use strict";
// Desenvolvido por Carlos Liberato
// Armazena lista de alunos da turma atual com matrícula e nome
let alunosTurma = [];
// Armazena componentes de nota (provas, trabalhos, etc.) da disciplina
let componentesNotas = [];
// Dicionário que mapeia notas individuais usando chave composta: "matricula_idComponente"
let notasTurma = {};
// Armazena a fórmula de cálculo da nota final (expressão matemática e tipo)
let formulaDisciplina = null;
// ID da turma atual sendo gerenciada
let fk_turma = 1;
// ID da disciplina atual
let disciplinaId = 1;
// Sigla da disciplina atual (para nome do arquivo CSV)
let siglaDisciplinaAtual = 'DISC';
// Nome da turma atual (para nome do arquivo CSV)
let nomeTurmaAtual = '';
// Busca componentes de nota (P1, P2, etc.) de uma disciplina específica
async function carregarComponentes(disciplinaId) {
    // Faz requisição GET para endpoint de componentes
    const resp = await fetch('/api/componentes/' + disciplinaId, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Inclui cookies de autenticação
    });
    // Se houver erro na requisição, registra no console e retorna array vazio
    if (!resp.ok) {
        console.error('Erro ao carregar componentes:', resp.statusText);
        return [];
    }
    // Converte resposta para JSON
    const json = await resp.json();
    // Retorna array de componentes se sucesso, senão retorna array vazio
    return (json.success && Array.isArray(json.data)) ? json.data : [];
}
// Carrega todas as notas já cadastradas para uma turma específica
async function carregarNotasTurma(fk_turma) {
    // Requisita notas da turma ao backend
    const resp = await fetch('/api/notas/turma/' + fk_turma, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    // Em caso de erro, apenas registra no console
    if (!resp.ok) {
        console.error('Erro ao carregar notas:', resp.statusText);
        return;
    }
    // Converte resposta para JSON
    const json = await resp.json();
    // Limpa objeto de notas antes de popular
    notasTurma = {};
    // Popula dicionário de notas usando chave composta "matricula_idComponente"
    if (json.success && Array.isArray(json.data)) {
        json.data.forEach((linha) => {
            // Só adiciona se nota não for nula
            if (linha.nota != null)
                notasTurma[`${linha.matricula}_${linha.id_compNota}`] = Number(linha.nota);
        });
    }
}
// Busca a fórmula de cálculo configurada para a disciplina
async function carregarFormula(disciplinaId) {
    // Faz GET no endpoint de fórmula da disciplina
    const resp = await fetch('/api/disciplinas/' + disciplinaId + '/formula', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    // Em caso de erro, registra no console
    if (!resp.ok) {
        console.error('Erro ao carregar fórmula:', resp.statusText);
        return;
    }
    // Converte resposta para JSON
    const json = await resp.json();
    // Se encontrou fórmula, armazena na variável global
    if (json.success && json.data.formula) {
        formulaDisciplina = json.data.formula;
    }
}
// Cria cabeçalho dinâmico da tabela baseado nos componentes da disciplina
async function montarGradeTable(disciplinaId) {
    // Carrega componentes de nota da disciplina
    componentesNotas = await carregarComponentes(disciplinaId);
    // Busca elemento da tabela no DOM
    const tabela = document.getElementById("grade_table");
    if (!tabela)
        return;
    // Busca ou cria elemento thead
    let thead = tabela.querySelector('thead');
    if (!thead) {
        thead = document.createElement('thead');
        tabela.appendChild(thead);
    }
    // Monta HTML do cabeçalho: Matrícula, Nome, componentes dinâmicos, e Nota Final
    thead.innerHTML = '<tr><th>Matrícula</th><th>Nome</th>' +
        componentesNotas.map(c => `<th>${c.sigla}</th>`).join('') +
        '<th class="final-grade-col">Final</th></tr>';
}
// Atualiza corpo da tabela com dados dos alunos e suas notas
async function atualizarTabelaAlunos() {
    // Busca tabela no DOM
    const tabela = document.getElementById('grade_table');
    if (!tabela)
        return;
    // Busca tbody da tabela
    const tbody = tabela.querySelector('tbody');
    if (!tbody)
        return;
    // Carrega notas finais já calculadas do backend
    const notasFinaisMap = await carregarNotasFinais(fk_turma);
    // Limpa conteúdo atual do tbody
    tbody.innerHTML = '';
    // Para cada aluno, cria uma linha na tabela
    alunosTurma.forEach(aluno => {
        // Cria linha da tabela
        const tr = document.createElement('tr');
        // Adiciona colunas de matrícula e nome
        tr.innerHTML = `<td>${aluno.matricula}</td><td>${aluno.nome}</td>`;
        // Para cada componente de nota, cria célula com input
        componentesNotas.forEach(comp => {
            const td = document.createElement('td');
            // Cria input numérico para nota
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.max = '10';
            input.step = '0.01'; // Permite decimais
            // Armazena dados da nota no input
            input.dataset.matricula = aluno.matricula;
            input.dataset.componente = String(comp.id_compNota);
            // Input inicia desabilitado (precisa duplo-clique no cabeçalho)
            input.disabled = true;
            // Monta chave para buscar nota existente
            const chaveNota = `${aluno.matricula}_${comp.id_compNota}`;
            // Se já existe nota cadastrada, preenche o input
            if (notasTurma && notasTurma[chaveNota] != null) {
                input.value = String(notasTurma[chaveNota]);
            }
            // Adiciona listener para salvar nota quando alterada
            input.addEventListener('change', async () => {
                // Converte valor para número
                let valor = parseFloat(input.value);
                // Valida se está entre 0 e 10
                if (isNaN(valor) || valor < 0 || valor > 10) {
                    alert('Nota deve ser de 0 a 10!');
                    input.value = '';
                    return;
                }
                // Envia nota ao backend
                await fetch('/api/notas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        matricula: aluno.matricula,
                        idComponente: comp.id_compNota,
                        valor
                    })
                });
                // Atualiza cache local de notas
                notasTurma[`${aluno.matricula}_${comp.id_compNota}`] = valor;
            });
            // Adiciona input à célula e célula à linha
            td.appendChild(input);
            tr.appendChild(td);
        });
        // Cria coluna de nota final
        const tdFinal = document.createElement('td');
        tdFinal.className = 'final-grade-col';
        // Se existe nota final salva no banco, exibe
        if (notasFinaisMap[aluno.matricula] != null) {
            const notaFinal = notasFinaisMap[aluno.matricula];
            tdFinal.textContent = notaFinal.toFixed(2);
            tdFinal.style.fontWeight = 'bold';
            // Verde se aprovado (>=5), vermelho se reprovado
            tdFinal.style.color = notaFinal >= 5 ? '#28a745' : '#dc3545';
        }
        else {
            // Sem nota final ainda
            tdFinal.textContent = '-';
        }
        // Adiciona célula final e linha ao tbody
        tr.appendChild(tdFinal);
        tbody.appendChild(tr);
    });
}
// Busca notas finais já calculadas e salvas no banco
async function carregarNotasFinais(fk_turma) {
    // Requisita notas finais ao backend
    const resp = await fetch(`/api/nota-final/${fk_turma}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    // Em caso de erro, retorna objeto vazio
    if (!resp.ok) {
        console.error('Erro ao carregar notas finais:', resp.statusText);
        return {};
    }
    // Converte resposta para JSON
    const json = await resp.json();
    // Cria dicionário matricula -> nota final
    const notasFinaisMap = {};
    // Popula dicionário com notas recebidas
    if (json.success && Array.isArray(json.data)) {
        json.data.forEach((linha) => {
            if (linha.valor != null) {
                notasFinaisMap[linha.matricula] = Number(linha.valor);
            }
        });
    }
    return notasFinaisMap;
}
// Valida se fórmula de cálculo está correta
function validarFormula(expressao, tipo) {
    // Para média ponderada, valida soma dos pesos
    if (tipo === 'ponderada') {
        // Extrai todos os pesos (números após asterisco)
        const pesos = expressao.match(/\*\s*([\d.]+)/g);
        if (!pesos)
            return { valido: false, mensagem: 'Fórmula ponderada inválida' };
        // Soma todos os pesos encontrados
        const somaPesos = pesos.reduce((acc, p) => {
            const peso = parseFloat(p.replace('*', '').trim());
            return acc + peso;
        }, 0);
        // Pesos devem somar 1.0 (100%) com tolerância de 0.001
        if (Math.abs(somaPesos - 1.0) > 0.001) {
            return {
                valido: false,
                mensagem: `Erro: Soma dos pesos é ${somaPesos.toFixed(3)}. Deve ser 1.0 para nota máxima de 10.00`
            };
        }
    }
    // Para média aritmética, valida divisor
    else if (tipo === 'aritmetica') {
        // Busca número após barra (divisor)
        const divMatch = expressao.match(/\/\s*(\d+)/);
        if (divMatch) {
            const divisor = Number(divMatch[1]);
            // Divisor deve ser igual ao número de componentes
            if (divisor !== componentesNotas.length) {
                return {
                    valido: false,
                    mensagem: `Divisor ${divisor} diferente do número de componentes (${componentesNotas.length})`
                };
            }
        }
    }
    // Fórmula válida
    return { valido: true, mensagem: '' };
}
// Calcula nota final de um aluno específico
function calcularNotaFinal(matricula) {
    // Se não há fórmula configurada, não pode calcular
    if (!formulaDisciplina)
        return null;
    // Verifica se todas as notas dos componentes estão preenchidas
    for (const comp of componentesNotas) {
        const chave = `${matricula}_${comp.id_compNota}`;
        // Se falta alguma nota, não pode calcular
        if (notasTurma[chave] == null) {
            return null;
        }
    }
    // Copia expressão da fórmula para manipulação
    let expressao = formulaDisciplina.expressao;
    // Substitui cada sigla (P1, P2, etc.) pela nota real do aluno
    componentesNotas.forEach(comp => {
        const chave = `${matricula}_${comp.id_compNota}`;
        const nota = notasTurma[chave] || 0;
        // Cria regex para substituir sigla por número
        const regex = new RegExp(`\\b${comp.sigla}\\b`, 'g');
        expressao = expressao.replace(regex, String(nota));
    });
    // Avalia expressão matemática
    try {
        const notaFinal = eval(expressao);
        // Limita nota final a 10.00 se exceder
        if (notaFinal > 10.00) {
            console.warn(`Nota calculada (${notaFinal}) excede 10.00 para aluno ${matricula}`);
            return 10.00;
        }
        return notaFinal;
    }
    catch (e) {
        // Se erro na avaliação, registra e retorna nulo
        console.error('Erro ao avaliar expressão:', e);
        return null;
    }
}
// Calcula notas finais de todos os alunos da turma
async function calcularTodasNotasFinais() {
    // Verifica se há fórmula configurada
    if (!formulaDisciplina) {
        alert('Nenhuma fórmula cadastrada para esta disciplina!');
        return;
    }
    // Valida se fórmula está correta
    const validacao = validarFormula(formulaDisciplina.expressao, formulaDisciplina.tipo);
    if (!validacao.valido) {
        alert(validacao.mensagem);
        return;
    }
    // Busca tabela no DOM
    const tabela = document.getElementById('grade_table');
    if (!tabela)
        return;
    // Busca todas as linhas de alunos
    const linhas = tabela.querySelectorAll('tbody tr');
    // Array para rastrear alunos sem todas as notas
    let alunosSemNotas = [];
    // Processa cada linha/aluno
    for (let idx = 0; idx < linhas.length; idx++) {
        const aluno = alunosTurma[idx];
        if (!aluno)
            continue;
        // Calcula nota final do aluno
        const notaFinal = calcularNotaFinal(aluno.matricula);
        // Busca célula de nota final na linha
        const tdFinal = linhas[idx].querySelector('.final-grade-col');
        // Se não conseguiu calcular (falta notas)
        if (notaFinal === null) {
            alunosSemNotas.push(aluno.nome);
            tdFinal.textContent = '-';
        }
        else {
            // Salva nota final no backend
            try {
                await fetch('/api/nota-final', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        matricula: aluno.matricula,
                        turma: fk_turma,
                        valor: Number(notaFinal.toFixed(2))
                    })
                });
            }
            catch (error) {
                console.error('Erro ao salvar nota final:', error);
            }
            // Atualiza célula com nota final
            tdFinal.textContent = notaFinal.toFixed(2);
            tdFinal.style.fontWeight = 'bold';
            // Verde se aprovado, vermelho se reprovado
            tdFinal.style.color = notaFinal >= 5 ? '#28a745' : '#dc3545';
        }
    }
    // Se há alunos sem todas as notas, exibe alerta
    if (alunosSemNotas.length > 0) {
        alert(`Atenção: ${alunosSemNotas.length} aluno(s) não têm todas as notas preenchidas:\n${alunosSemNotas.join(', ')}`);
    }
    else {
        alert('Notas finais calculadas com sucesso!');
    }
}
// Envia dados de novo aluno ao backend
async function salvarAlunoBackend(matricula, nome, fk_turma) {
    await fetch('/api/turma_dashboard/' + fk_turma + '/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ matricula, nome })
    });
}
// Carrega lista de alunos da turma do backend
async function carregarAlunosDaTurma(fk_turma) {
    // Requisita alunos da turma
    const resp = await fetch('/api/turma_dashboard/' + fk_turma + '/alunos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    // Em caso de erro, apenas registra
    if (!resp.ok) {
        console.error('Erro ao carregar alunos:', resp.statusText);
        return;
    }
    // Converte resposta para JSON
    const json = await resp.json();
    // Popula array global de alunos
    if (json.success && Array.isArray(json.data)) {
        alunosTurma = json.data.map((a) => ({
            matricula: String(a.matricula),
            nome: String(a.nome)
        }));
    }
}
// Inicializa modal de gerenciamento de alunos
function initModalAlunos() {
    // Busca elementos do DOM
    const btnGerenciar = document.getElementById('manage_students_btn');
    const modalOverlay = document.getElementById('modal_container');
    const modalAlunos = document.getElementById('modal_alunos');
    const btnFechar = modalAlunos?.querySelector('.modal-header .btn');
    // Se elementos não existem, não continua
    if (!modalOverlay || !modalAlunos)
        return;
    // Busca abas e painéis do modal
    const tabs = modalAlunos.querySelectorAll('.tab-buttons .btn');
    const panels = modalAlunos.querySelectorAll('.tab-panel');
    // Função para ativar aba específica
    function ativarAba(tabId) {
        // Remove classe active de todas as abas
        tabs.forEach(btn => btn.classList.remove('active'));
        // Esconde todos os painéis
        panels.forEach(panel => panel.style.display = 'none');
        // Busca aba e painel específicos
        const tabBtn = modalAlunos.querySelector(`[data-tab="${tabId}"]`);
        const tabPanel = modalAlunos.querySelector(`#${tabId}`);
        // Ativa aba e mostra painel correspondente
        tabBtn?.classList.add('active');
        tabPanel.style.display = 'block';
    }
    // Abre modal ao clicar no botão gerenciar
    btnGerenciar?.addEventListener('click', () => {
        modalOverlay.style.display = 'flex';
        modalAlunos.style.display = 'block';
        ativarAba('tab-manual-aluno'); // Abre na aba de cadastro manual
    });
    // Fecha modal ao clicar no X
    btnFechar?.addEventListener('click', () => {
        modalAlunos.style.display = 'none';
        modalOverlay.style.display = 'none';
    });
    // Adiciona listener de troca de aba em cada botão
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (tabId)
                ativarAba(tabId);
        });
    });
    // Fecha modal ao clicar fora dele
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            if (modalAlunos.style.display === 'block') {
                modalAlunos.style.display = 'none';
                modalOverlay.style.display = 'none';
            }
        }
    });
    // CADASTRO MANUAL DE ALUNO
    const formManual = document.getElementById('form-aluno-manual');
    formManual?.addEventListener('submit', async (e) => {
        e.preventDefault(); // Previne reload da página
        // Busca campos do formulário
        const matInput = formManual.querySelector('#aluno-matricula');
        const nomeInput = formManual.querySelector('#aluno-nome');
        // Obtém valores dos campos
        const matricula = matInput.value.trim();
        const nome = nomeInput.value.trim();
        // Valida se campos estão preenchidos
        if (!matricula || !nome)
            return;
        // Verifica se matrícula já existe
        if (alunosTurma.some(a => a.matricula === matricula)) {
            alert('Já existe um aluno com essa matrícula!');
            return;
        }
        // Busca ID da turma
        const fk_turmaInput = document.getElementById('id-turma');
        const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
        // Salva aluno no backend
        await salvarAlunoBackend(matricula, nome, fk_turma);
        // Adiciona aluno ao array local
        alunosTurma.push({ matricula, nome });
        // Atualiza tabela
        atualizarTabelaAlunos();
        // Limpa campos do formulário
        matInput.value = '';
        nomeInput.value = '';
    });
    // IMPORTAÇÃO DE ALUNOS POR CSV
    const formImport = document.getElementById('form-aluno-import');
    const statusImport = document.getElementById('import-status');
    formImport?.addEventListener('submit', e => {
        e.preventDefault(); // Previne reload
        // Busca arquivo selecionado
        const fileInput = formImport.querySelector('#csv-file');
        const file = fileInput.files?.[0];
        if (!file)
            return;
        // Lê conteúdo do arquivo
        const reader = new FileReader();
        reader.onload = async () => {
            // Obtém texto do arquivo
            const text = reader.result;
            // Divide em linhas e remove vazias
            const linhas = text.split('\n').map(l => l.trim()).filter(l => l);
            // Contador de alunos importados
            let count = 0;
            // Busca ID da turma
            const fk_turmaInput = document.getElementById('id-turma');
            const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
            // Processa cada linha do CSV
            for (const linha of linhas) {
                // Separa matrícula e nome por vírgula
                const [matricula, nome] = linha.split(',').map(x => x.trim());
                // Se dados válidos e matrícula não existe, adiciona aluno
                if (matricula && nome && !alunosTurma.some(a => a.matricula === matricula)) {
                    await salvarAlunoBackend(matricula, nome, fk_turma);
                    alunosTurma.push({ matricula, nome });
                    count++;
                }
            }
            // Atualiza tabela
            atualizarTabelaAlunos();
            // Exibe mensagem de sucesso
            statusImport.textContent = `Importação concluída. ${count} alunos adicionados.`;
            // Limpa input de arquivo
            fileInput.value = '';
        };
        // Inicia leitura do arquivo
        reader.readAsText(file);
    });
    // EDIÇÃO DE ALUNO
    const formEdit = modalAlunos.querySelector('#tab-edit-aluno form');
    const btnEditar = modalAlunos.querySelector('#tab-edit-aluno .btn');
    const inputsEdit = formEdit.querySelectorAll('input');
    // Campos do formulário de edição
    const inputMatriculaBusca = inputsEdit[0]; // Matrícula para buscar
    const inputNovaMatricula = inputsEdit[1]; // Nova matrícula
    const inputNovoNome = inputsEdit[2]; // Novo nome
    // Ao sair do campo de busca, preenche dados do aluno
    inputMatriculaBusca.addEventListener('blur', () => {
        const matricula = inputMatriculaBusca.value.trim();
        if (!matricula)
            return;
        // Busca aluno no array
        const aluno = alunosTurma.find(a => a.matricula === matricula);
        // Se encontrou, preenche campos
        if (aluno) {
            inputNovaMatricula.value = aluno.matricula;
            inputNovoNome.value = aluno.nome;
        }
        else {
            // Se não encontrou, limpa campos e avisa
            inputNovaMatricula.value = '';
            inputNovoNome.value = '';
            alert('Aluno não encontrado!');
        }
    });
    // Ao clicar em editar
    btnEditar?.addEventListener('click', async (e) => {
        e.preventDefault();
        // Obtém valores dos campos
        const matAntiga = inputMatriculaBusca.value.trim();
        const novaMat = inputNovaMatricula.value.trim();
        const novoNome = inputNovoNome.value.trim();
        // Busca ID da turma
        const fk_turmaInput = document.getElementById('id-turma');
        const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
        // Busca aluno no array
        const aluno = alunosTurma.find(a => a.matricula === matAntiga);
        if (!aluno) {
            alert('Aluno não encontrado!');
            return;
        }
        // Envia atualização ao backend
        const resp = await fetch(`/api/turma_dashboard/${fk_turma}/alunos/${matAntiga}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ novaMatricula: novaMat, novoNome })
        });
        // Se erro, avisa usuário
        if (!resp.ok) {
            alert('Falha ao editar aluno!');
            return;
        }
        // Atualiza dados no array local
        if (novaMat)
            aluno.matricula = novaMat;
        if (novoNome)
            aluno.nome = novoNome;
        // Atualiza tabela
        atualizarTabelaAlunos();
        // Limpa formulário
        formEdit.reset();
        alert('Aluno atualizado com sucesso!');
    });
    // EXCLUSÃO DE ALUNO
    const formDel = modalAlunos.querySelector('#tab-delete-aluno form');
    const btnDeletar = modalAlunos.querySelector('#tab-delete-aluno .btn');
    btnDeletar?.addEventListener('click', async (e) => {
        e.preventDefault();
        // Busca campos do formulário
        const inputs = formDel.querySelectorAll('input');
        const matricula = inputs[0].value.trim(); // Matrícula
        const matriculaConfirm = inputs[1].value.trim(); // Confirmação da matrícula
        const nomeConfirm = inputs[2].value.trim(); // Confirmação do nome
        // Valida se todos os campos estão preenchidos
        if (!matricula || !matriculaConfirm || !nomeConfirm) {
            alert('Erro: Campos vazios!');
            return;
        }
        // Valida se matrículas coincidem
        if (matricula !== matriculaConfirm) {
            alert('Erro: Matrículas não coincidem!');
            return;
        }
        // Busca índice do aluno no array
        const indexMatricula = alunosTurma.findIndex(a => a.matricula === matricula && a.nome === nomeConfirm);
        // Se não encontrou, avisa
        if (indexMatricula === -1) {
            alert('Aluno não encontrado!');
            return;
        }
        // Busca ID da turma
        const fk_turmaInput = document.getElementById('id-turma');
        const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
        // Envia requisição de exclusão ao backend
        const resp = await fetch(`/api/turma_dashboard/${fk_turma}/alunos/${matricula}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ nome: nomeConfirm })
        });
        // Se erro, exibe mensagem
        if (!resp.ok) {
            const data = await resp.json().catch(() => null);
            alert(`Falha ao excluir aluno: ${data?.message || resp.statusText}`);
            return;
        }
        // Remove aluno do array local
        alunosTurma.splice(indexMatricula, 1);
        // Atualiza tabela
        atualizarTabelaAlunos();
        // Limpa formulário
        formDel.reset();
        alert('Aluno deletado com sucesso!');
    });
}
// Inicializa funcionalidade de duplo-clique para habilitar edição de coluna
document.addEventListener("DOMContentLoaded", () => {
    // Busca tabela e cabeçalho
    const tabela = document.getElementById("grade_table");
    const thead = tabela?.querySelector("thead");
    // Adiciona listener de duplo-clique no cabeçalho
    thead?.addEventListener("dblclick", (e) => {
        // Busca célula th clicada
        const th = e.target.closest("th");
        if (!th)
            return;
        // Obtém todos os cabeçalhos
        const cabecalhos = Array.from(thead.querySelectorAll("th"));
        // Encontra índice da coluna clicada
        const indice = cabecalhos.indexOf(th);
        // Ignora colunas de matrícula (0), nome (1) e final
        if (indice < 2 || th.classList.contains("final-grade-col"))
            return;
        // Busca todas as linhas da tabela
        const linhas = tabela?.querySelectorAll("tbody tr");
        // Coleta todos os inputs desta coluna
        const inputsColuna = [];
        linhas?.forEach((linha) => {
            const celula = linha.children[indice];
            if (!celula)
                return;
            const input = celula.querySelector("input");
            if (input)
                inputsColuna.push(input);
        });
        // Verifica se coluna já está ativa
        const colunaAtiva = th.dataset.ativa === "true";
        // Se não estava ativa, ativa esta coluna
        if (!colunaAtiva) {
            // Desabilita todos os inputs
            tabela?.querySelectorAll("tbody td input").forEach(inp => inp.disabled = true);
            // Remove destaque de todos os cabeçalhos
            cabecalhos.forEach(c => c.style.backgroundColor = "");
            // Habilita inputs desta coluna
            inputsColuna.forEach(input => input.disabled = false);
            // Destaca cabeçalho em amarelo
            th.style.backgroundColor = "#ffc30f";
            th.dataset.ativa = "true";
        }
        else {
            // Se já estava ativa, desativa
            inputsColuna.forEach(input => input.disabled = true);
            th.style.backgroundColor = "";
            th.dataset.ativa = "false";
        }
    });
});
// Exporta notas para arquivo CSV
async function exportarNotasCSV() {
    // Valida se todas as notas estão preenchidas
    let todasNotasPreenchidas = true;
    let alunosSemNotas = [];
    // Para cada aluno, verifica se tem todas as notas
    for (const aluno of alunosTurma) {
        // Verifica cada componente de nota
        for (const comp of componentesNotas) {
            const chaveNota = `${aluno.matricula}_${comp.id_compNota}`;
            // Se falta nota, marca como incompleto
            if (notasTurma[chaveNota] == null) {
                todasNotasPreenchidas = false;
                if (!alunosSemNotas.includes(aluno.nome)) {
                    alunosSemNotas.push(aluno.nome);
                }
            }
        }
        // Verifica se tem nota final calculada
        const notaFinal = calcularNotaFinal(aluno.matricula);
        if (notaFinal === null) {
            todasNotasPreenchidas = false;
            if (!alunosSemNotas.includes(aluno.nome)) {
                alunosSemNotas.push(aluno.nome);
            }
        }
    }
    // Se há pendências, não permite exportação
    if (!todasNotasPreenchidas) {
        alert('Não é possível exportar as notas!\n\n' +
            'Todas as notas devem estar atribuídas e o cálculo final deve ser realizado para todos os estudantes.\n\n' +
            `Alunos com pendências (${alunosSemNotas.length}):\n${alunosSemNotas.join(', ')}`);
        return;
    }
    // Busca informações da turma e disciplina (não utilizadas, mas mantidas)
    const turmaInfo = await buscarInfoTurma(fk_turma);
    const disciplinaInfo = await buscarInfoDisciplina(disciplinaId);
    // Gera timestamp para nome do arquivo
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    const segundo = String(agora.getSeconds()).padStart(2, '0');
    const milissegundo = String(agora.getMilliseconds()).padStart(3, '0');
    // Usa variáveis globais para nome do arquivo
    const nomeTurma = nomeTurmaAtual || `Turma_${fk_turma}`;
    const siglaDisciplina = siglaDisciplinaAtual || 'DISC';
    // Monta nome do arquivo: YYYY-MM-DD_HHmmssms-TurmaX-SIGLA.csv
    const nomeArquivo = `${ano}-${mes}-${dia}_${hora}${minuto}${segundo}${milissegundo}-${nomeTurma}-${siglaDisciplina}.csv`;
    // Monta cabeçalho do CSV
    let csvContent = 'Matrícula,Nome';
    // Adiciona cada componente ao cabeçalho
    componentesNotas.forEach(comp => {
        csvContent += `,${comp.sigla}`;
    });
    csvContent += ',Nota Final\n';
    // Para cada aluno, adiciona linha no CSV
    alunosTurma.forEach(aluno => {
        // Adiciona matrícula e nome
        csvContent += `${aluno.matricula},${aluno.nome}`;
        // Adiciona nota de cada componente
        componentesNotas.forEach(comp => {
            const chaveNota = `${aluno.matricula}_${comp.id_compNota}`;
            const nota = notasTurma[chaveNota];
            csvContent += `,${nota != null ? nota.toFixed(2) : '-'}`;
        });
        // Adiciona nota final
        const notaFinal = calcularNotaFinal(aluno.matricula);
        csvContent += `,${notaFinal != null ? notaFinal.toFixed(2) : '-'}`;
        csvContent += '\n';
    });
    // Cria blob com conteúdo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // Cria link temporário para download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    // Configura link para download
    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo);
    link.style.visibility = 'hidden';
    // Adiciona link ao DOM, clica e remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// Busca informações da turma (nome) no backend
async function buscarInfoTurma(fk_turma) {
    try {
        // Requisita dados da turma
        const resp = await fetch(`/api/turmas/${fk_turma}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        // Se erro, retorna null
        if (!resp.ok) {
            console.error('Erro ao buscar info da turma:', resp.statusText);
            return null;
        }
        // Converte para JSON e retorna dados
        const json = await resp.json();
        return json.success && json.data ? json.data : null;
    }
    catch (error) {
        console.error('Erro ao buscar info da turma:', error);
        return null;
    }
}
// Busca informações da disciplina (sigla) no backend
async function buscarInfoDisciplina(disciplinaId) {
    try {
        // Requisita dados da disciplina
        const resp = await fetch(`/api/disciplinas/${disciplinaId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        // Se erro, retorna null
        if (!resp.ok) {
            console.error('Erro ao buscar info da disciplina:', resp.statusText);
            return null;
        }
        // Converte para JSON e retorna dados
        const json = await resp.json();
        return json.success && json.data ? json.data : null;
    }
    catch (error) {
        console.error('Erro ao buscar info da disciplina:', error);
        return null;
    }
}
// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    // Busca parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    // Busca inputs hidden com IDs
    const fk_turmaInput = document.getElementById('id-turma');
    const disciplinaInput = document.getElementById('id-disciplina');
    // Define IDs globais a partir dos inputs ou URL
    fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : Number(urlParams.get('id_turma')) || 1;
    disciplinaId = disciplinaInput ? Number(disciplinaInput.value) : Number(urlParams.get('id_disciplina')) || 1;
    // Carrega informações de turma e disciplina no início
    const turmaInfo = await buscarInfoTurma(fk_turma);
    const disciplinaInfo = await buscarInfoDisciplina(disciplinaId);
    // Armazena em variáveis globais para uso posterior
    if (turmaInfo)
        nomeTurmaAtual = turmaInfo.nome;
    if (disciplinaInfo)
        siglaDisciplinaAtual = disciplinaInfo.sigla;
    // Executa carregamento inicial de dados
    await montarGradeTable(disciplinaId); // Monta cabeçalho da tabela
    await carregarAlunosDaTurma(fk_turma); // Carrega lista de alunos
    await carregarNotasTurma(fk_turma); // Carrega notas existentes
    await carregarFormula(disciplinaId); // Carrega fórmula de cálculo
    await atualizarTabelaAlunos(); // Renderiza tabela completa
    // Inicializa modal de gerenciamento de alunos
    initModalAlunos();
    // Adiciona listener ao botão de calcular notas finais
    const btnCalcular = document.getElementById('btn-calcular-notas');
    btnCalcular?.addEventListener('click', calcularTodasNotasFinais);
    // Adiciona listener ao botão de exportar CSV
    const btnExportar = document.getElementById('export_grades_btn');
    btnExportar?.addEventListener('click', exportarNotasCSV);
});
