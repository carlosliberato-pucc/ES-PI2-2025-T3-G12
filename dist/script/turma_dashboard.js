"use strict";
// Variável que guarda a fórmula atual selecionada pelo usuário
// Inicialmente nula porque nenhuma fórmula foi configurada ainda
let formulaAtual = null;
function initModalFormula() {
    // Seleciona elementos do DOM necessários para o modal
    const btnGerenciarFormula = document.getElementById('manage_formula_btn');
    const modalOverlay = document.getElementById('modal_container');
    const modalFormula = document.getElementById('modal_formula');
    const btnFechar = modalFormula?.querySelectorAll('.btn.secondary');
    const btnSalvar = document.getElementById('save_formula_btn');
    const selectTipo = document.getElementById('formula_type');
    const inputFormula = modalFormula?.querySelector('input[type="text"]');
    // ========================
    // Abrir modal
    // ========================
    btnGerenciarFormula?.addEventListener('click', () => {
        const modalComponentes = document.getElementById('modal_componentes');
        const modalAlunos = document.getElementById('modal_alunos');
        // Fecha os outros modais antes de abrir este
        modalComponentes?.style.setProperty('display', 'none');
        modalAlunos?.style.setProperty('display', 'none');
        // Mostra o overlay e o modal da fórmula
        modalOverlay?.style.setProperty('display', 'flex');
        modalFormula?.style.setProperty('display', 'block');
        // Carrega dados atuais no modal, se houver
        if (formulaAtual) {
            if (selectTipo)
                selectTipo.value = formulaAtual.tipo;
            if (inputFormula)
                inputFormula.value = formulaAtual.formula;
        }
        else {
            // Caso não haja fórmula atual, limpa os campos
            if (selectTipo)
                selectTipo.value = 'selecione';
            if (inputFormula)
                inputFormula.value = '';
        }
    });
    // ========================
    // Fechar modal
    // ========================
    btnFechar?.forEach(btn => {
        btn.addEventListener('click', () => {
            fecharModalFormula();
        });
    });
    // ========================
    // Salvar fórmula
    // ========================
    btnSalvar?.addEventListener('click', () => {
        if (selectTipo && inputFormula && inputFormula.value.trim()) {
            // Atualiza a fórmula atual
            formulaAtual = {
                tipo: selectTipo.value,
                formula: inputFormula.value.trim()
            };
            // Atualiza a sidebar com a nova fórmula
            atualizarSidebarFormula();
            // TODO: adicionar chamada para salvar no banco de dados
            // Ex: await salvarFormulaNoBanco(formulaAtual);
            // Fecha o modal
            fecharModalFormula();
        }
    });
    // ========================
    // Fechar modal ao clicar fora
    // ========================
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            fecharModalFormula();
            fecharModalComponentes(); // Também fecha outro modal se estiver aberto
        }
    });
}
// ========================
// Função para fechar modal de fórmula
// ========================
function fecharModalFormula() {
    const modalOverlay = document.getElementById('modal_container');
    const modalFormula = document.getElementById('modal_formula');
    // Oculta o modal
    modalFormula?.style.setProperty('display', 'none');
    // Só fecha o overlay se outro modal também estiver fechado
    const modalComponentes = document.getElementById('modal_componentes');
    if (modalComponentes?.style.display === 'none') {
        modalOverlay?.style.setProperty('display', 'none');
    }
}
// ========================
// Atualiza a sidebar com informações da fórmula
// ========================
function atualizarSidebarFormula() {
    const divsFormula = document.querySelectorAll('.info-formula');
    if (divsFormula.length >= 2) {
        if (formulaAtual) {
            // Exibe tipo de fórmula e conteúdo
            const tipoTexto = formulaAtual.tipo === 'selecione' ? 'Média Aritmética' : 'Média Ponderada';
            divsFormula[0].textContent = tipoTexto;
            divsFormula[1].textContent = formulaAtual.formula;
        }
        else {
            // Caso não haja fórmula, exibe mensagem padrão
            divsFormula[0].textContent = 'Nenhuma fórmula configurada';
            divsFormula[1].textContent = '';
        }
    }
}
/* ============================================
   MODAL DE ALUNOS — FUNCIONAL COMPLETO
============================================ */
// Array para armazenar alunos da turma
let alunosTurma = [];
function initModalAlunos() {
    const btnGerenciar = document.getElementById('manage_students_btn');
    const modalOverlay = document.getElementById('modal_container');
    const modalAlunos = document.getElementById('modal_alunos');
    const btnFechar = modalAlunos?.querySelector('.modal-header .btn');
    if (!modalOverlay || !modalAlunos)
        return;
    // ========================
    // Abas e painéis
    // ========================
    const tabs = modalAlunos.querySelectorAll('.tab-buttons .btn');
    const panels = modalAlunos.querySelectorAll('.tab-panel');
    function ativarAba(tabId) {
        tabs.forEach(btn => btn.classList.remove('active'));
        panels.forEach(panel => panel.style.display = 'none');
        const tabBtn = modalAlunos.querySelector(`[data-tab="${tabId}"]`);
        const tabPanel = modalAlunos.querySelector(`#${tabId}`);
        tabBtn?.classList.add('active');
        tabPanel.style.display = 'block';
    }
    // ========================
    // Abrir modal de alunos
    // ========================
    btnGerenciar?.addEventListener('click', () => {
        modalOverlay.style.display = 'flex';
        modalAlunos.style.display = 'block';
        ativarAba('tab-manual-aluno'); // Ativa a aba de cadastro manual
    });
    // ========================
    // Fechar modal de alunos
    // ========================
    btnFechar?.addEventListener('click', () => {
        modalAlunos.style.display = 'none';
        modalOverlay.style.display = 'none';
    });
    // ========================
    // Troca de abas
    // ========================
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (tabId)
                ativarAba(tabId);
        });
    });
    /* ======================
       ADICIONAR MANUALMENTE
    ======================= */
    const formManual = document.getElementById('form-aluno-manual');
    formManual?.addEventListener('submit', e => {
        e.preventDefault();
        const matInput = formManual.querySelector('#aluno-matricula');
        const nomeInput = formManual.querySelector('#aluno-nome');
        const matricula = matInput.value.trim();
        const nome = nomeInput.value.trim();
        if (!matricula || !nome)
            return;
        if (alunosTurma.some(a => a.matricula === matricula)) {
            alert('Já existe um aluno com essa matrícula!');
            return;
        }
        alunosTurma.push({ matricula, nome });
        atualizarTabelaAlunos();
        matInput.value = '';
        nomeInput.value = '';
    });
    /* ======================
       IMPORTAR CSV
    ======================= */
    const formImport = document.getElementById('form-aluno-import');
    const statusImport = document.getElementById('import-status');
    formImport?.addEventListener('submit', e => {
        e.preventDefault();
        const fileInput = formImport.querySelector('#csv-file');
        const file = fileInput.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result;
            const linhas = text.split('\n').map(l => l.trim()).filter(l => l);
            let count = 0;
            linhas.forEach(linha => {
                const [matricula, nome] = linha.split(',').map(x => x.trim());
                if (matricula && nome && !alunosTurma.some(a => a.matricula === matricula)) {
                    alunosTurma.push({ matricula, nome });
                    count++;
                }
            });
            atualizarTabelaAlunos();
            statusImport.textContent = `Importação concluída. ${count} alunos adicionados.`;
            fileInput.value = '';
        };
        reader.readAsText(file);
    });
    /* ======================
       EDITAR ALUNO
    ======================= */
    const formEdit = document.querySelector('#tab-edit-aluno form');
    const btnEditar = modalAlunos.querySelector('#tab-edit-aluno .btn');
    const inputsEdit = formEdit.querySelectorAll('input');
    const inputMatriculaBusca = inputsEdit[0]; // matrícula para buscar
    const inputNovaMatricula = inputsEdit[1]; // matrícula nova
    const inputNovoNome = inputsEdit[2]; // nome novo
    // Busca aluno ao sair do campo matrícula
    inputMatriculaBusca.addEventListener('blur', () => {
        const matricula = inputMatriculaBusca.value.trim();
        if (!matricula)
            return;
        const aluno = alunosTurma.find(a => a.matricula === matricula);
        if (aluno) {
            // Preenche os campos para edição
            inputNovaMatricula.value = aluno.matricula;
            inputNovoNome.value = aluno.nome;
        }
        else {
            inputNovaMatricula.value = '';
            inputNovoNome.value = '';
            alert('Aluno não encontrado!');
        }
    });
    // Salvar edição
    btnEditar?.addEventListener('click', e => {
        e.preventDefault();
        const matAntiga = inputMatriculaBusca.value.trim();
        const novaMat = inputNovaMatricula.value.trim();
        const novoNome = inputNovoNome.value.trim();
        const aluno = alunosTurma.find(a => a.matricula === matAntiga);
        if (!aluno) {
            alert('Aluno não encontrado!');
            return;
        }
        if (novaMat)
            aluno.matricula = novaMat;
        if (novoNome)
            aluno.nome = novoNome;
        atualizarTabelaAlunos();
        formEdit.reset();
        alert('Aluno atualizado com sucesso!');
    });
    /* ======================
       EXCLUIR ALUNO
    ======================= */
    const formDel = document.querySelector('#tab-delete-aluno form');
    const btnDeletar = modalAlunos.querySelector('#tab-delete-aluno .btn');
    btnDeletar?.addEventListener('click', e => {
        e.preventDefault();
        const inputs = formDel.querySelectorAll('input');
        const matricula = inputs[0].value.trim();
        const matriculaConfirm = inputs[1].value.trim();
        const nomeConfirm = inputs[2].value.trim();
        const indexMatricula = alunosTurma.findIndex(_a => _a.matricula === matricula && _a.nome === nomeConfirm);
        if (indexMatricula === -1) {
            alert('Aluno não encontrado!');
            return;
        }
        if (!matricula || !matriculaConfirm || !nomeConfirm) {
            alert('Erro: Campos vazios!');
            return;
        }
        alunosTurma.splice(indexMatricula, 1);
        atualizarTabelaAlunos();
        formDel.reset();
    });
    /* ======================
       FUNÇÃO AUXILIAR PARA ATUALIZAR TABELA
    ======================= */
    function atualizarTabelaAlunos() {
        const tabela = document.getElementById('grade_table');
        const tbody = tabela.querySelector('tbody');
        if (!tbody)
            return;
        // Limpa tabela
        tbody.innerHTML = '';
        // Para cada aluno, cria uma linha na tabela
        alunosTurma.forEach(aluno => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
      <td>${aluno.matricula}</td>
      <td>${aluno.nome}</td>
    `;
            // Adiciona inputs para cada componente existente
            const componentes = document.querySelectorAll('#grade_table thead th');
            componentes.forEach((th, i) => {
                if (i > 1 && !th.classList.contains('final-grade-col')) {
                    const td = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '0';
                    input.max = '10';
                    input.step = '0.1';
                    td.appendChild(input);
                    tr.appendChild(td);
                }
            });
            const tdFinal = document.createElement('td');
            tdFinal.className = 'final-grade-col';
            tdFinal.textContent = '-';
            tr.appendChild(tdFinal);
            tbody.appendChild(tr);
        });
    }
}
// ========================
// Fecha modal de alunos
// ========================
function fecharModalAlunos() {
    const modalOverlay = document.getElementById('modal_container');
    const modalAlunos = document.getElementById('modal_alunos');
    modalAlunos?.style.setProperty('display', 'none');
    // Só fecha o overlay se todos os outros modais estiverem fechados
    const modalComponentes = document.getElementById('modal_componentes');
    const modalFormula = document.getElementById('modal_formula');
    if (modalComponentes?.style.display === 'none' &&
        modalFormula?.style.display === 'none') {
        modalOverlay?.style.setProperty('display', 'none');
    }
}
// Array que armazena os componentes de nota
let componentesNota = [];
// Armazena temporariamente o ID do componente a ser excluído
let componenteParaExcluir = null;
function initModalComponentes() {
    const btnGerenciar = document.getElementById('add_component_btn');
    const modalOverlay = document.getElementById('modal_container');
    const modalComponentes = document.getElementById('modal_componentes');
    const btnFechar = modalComponentes?.querySelector('.modal-header .btn');
    const btnAdicionar = document.getElementById('add_component_btn_modal');
    // ========================
    // Abrir modal de componentes
    // ========================
    btnGerenciar?.addEventListener('click', () => {
        const modalFormula = document.getElementById('modal_formula');
        const modalAlunos = document.getElementById('modal_alunos');
        // Fecha outros modais antes de abrir este
        modalFormula?.style.setProperty('display', 'none');
        modalAlunos?.style.setProperty('display', 'none');
        modalOverlay?.style.setProperty('display', 'flex');
        modalComponentes?.style.setProperty('display', 'block');
        // Atualiza lista de componentes no modal
        atualizarListaComponentesModal();
    });
    // ========================
    // Fechar modal de componentes
    // ========================
    btnFechar?.addEventListener('click', () => {
        fecharModalComponentes();
    });
    // ========================
    // Adicionar novo componente
    // ========================
    btnAdicionar?.addEventListener('click', () => {
        const inputNome = document.getElementById('new_component_nome');
        const inputSigla = document.getElementById('new_component_sigla');
        const inputDescricao = document.getElementById('new_component_descricao');
        if (inputNome?.value.trim() && inputSigla?.value.trim() && inputDescricao?.value.trim()) {
            const novoComponente = {
                id: Date.now().toString(), // Gera ID único baseado no timestamp
                nome: inputNome.value.trim(),
                sigla: inputSigla.value.trim(),
                descricao: inputDescricao.value.trim()
            };
            // Adiciona componente ao array
            componentesNota.push(novoComponente);
            // ========================
            // Atualiza tabela principal
            // ========================
            const tabela = document.getElementById('grade_table');
            if (tabela) {
                const theadRow = tabela.querySelector('thead tr');
                const thFinal = tabela.querySelector('thead th.final-grade-col');
                // Adiciona novo cabeçalho na tabela
                const novoTh = document.createElement('th');
                novoTh.textContent = novoComponente.sigla;
                novoTh.style.textAlign = "center !important";
                theadRow?.insertBefore(novoTh, thFinal || null);
                const linhas = tabela.querySelectorAll('tbody tr');
                const haAlunos = alunosTurma.length > 0;
                // Adiciona input para cada aluno existente
                if (haAlunos && linhas.length > 0) {
                    linhas.forEach(linha => {
                        const tdFinal = linha.querySelector('td.final-grade-col');
                        const novaTd = document.createElement('td');
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.min = '0';
                        input.max = '10';
                        input.disabled = true; // <- importante
                        novaTd.appendChild(input);
                        linha.insertBefore(novaTd, tdFinal || null);
                    });
                }
            }
            // Atualiza sidebar e lista do modal
            atualizarSidebarComponentes();
            atualizarListaComponentesModal();
            // Limpa campos do formulário
            inputNome.value = '';
            inputSigla.value = '';
            inputDescricao.value = '';
        }
    });
    // Inicializa modal de confirmação para exclusão de componente
    initModalConfirmacao();
}
// ========================
// Fecha modal de componentes
// ========================
function fecharModalComponentes() {
    const modalOverlay = document.getElementById('modal_container');
    const modalComponentes = document.getElementById('modal_componentes');
    modalComponentes?.style.setProperty('display', 'none');
    // Só fecha overlay se outro modal também estiver fechado
    const modalFormula = document.getElementById('modal_formula');
    if (modalFormula?.style.display === 'none') {
        modalOverlay?.style.setProperty('display', 'none');
    }
}
// ========================
// Atualiza sidebar com componentes
// ========================
function atualizarSidebarComponentes() {
    const containerSidebar = document.querySelector('.componentes-nota');
    // Remove componentes antigos
    const componentesAntigos = containerSidebar?.querySelectorAll('.info-componentes');
    componentesAntigos?.forEach(el => el.remove());
    if (componentesNota.length === 0) {
        // Mostra mensagem caso não haja componentes
        const div = document.createElement('div');
        div.className = 'info-componentes';
        div.textContent = 'Nenhum componente adicionado';
        div.style.color = '#6c757d';
        div.style.fontStyle = 'italic';
        containerSidebar?.appendChild(div);
    }
    else {
        // Adiciona cada componente na sidebar
        componentesNota.forEach(comp => {
            const div = document.createElement('div');
            div.className = 'info-componentes';
            div.textContent = comp.nome;
            containerSidebar?.appendChild(div);
        });
    }
}
// ========================
// Atualiza lista de componentes no modal
// ========================
function atualizarListaComponentesModal() {
    const listaContainer = document.getElementById('componentes_lista');
    if (!listaContainer)
        return;
    listaContainer.innerHTML = '';
    if (componentesNota.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Nenhum componente adicionado ainda.';
        p.style.cssText = 'color: #6c757d; font-style: italic; text-align: center; padding: 20px;';
        listaContainer.appendChild(p);
    }
    else {
        // Adiciona cada componente com botão de remover
        componentesNota.forEach(comp => {
            const div = document.createElement('div');
            div.className = 'info-componentes';
            div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';
            const span = document.createElement('span');
            span.textContent = `${comp.sigla} - ${comp.nome}`;
            const btnRemover = document.createElement('button');
            btnRemover.className = 'btn secondary';
            btnRemover.style.cssText = 'background: none; color: #dc3545; padding: 5px 10px; border: none; cursor: pointer;';
            btnRemover.textContent = 'X';
            btnRemover.addEventListener('click', () => removerComponente(comp.id));
            div.appendChild(span);
            div.appendChild(btnRemover);
            listaContainer.appendChild(div);
        });
    }
}
// ========================
// Remove componente (chama modal de confirmação)
// ========================
function removerComponente(id) {
    const componente = componentesNota.find(comp => comp.id === id);
    if (!componente)
        return;
    componenteParaExcluir = id;
    const nomeElemento = document.getElementById('confirmacao_nome');
    if (nomeElemento) {
        nomeElemento.textContent = componente.nome;
    }
    abrirModalConfirmacao();
}
// ========================
// Inicializa modal de confirmação
// ========================
function initModalConfirmacao() {
    const btnCancelar = document.getElementById('btn_cancelar_exclusao');
    const btnConfirmar = document.getElementById('btn_confirmar_exclusao');
    btnCancelar?.addEventListener('click', () => {
        fecharModalConfirmacao();
        componenteParaExcluir = null;
    });
    btnConfirmar?.addEventListener('click', () => {
        if (componenteParaExcluir) {
            // Remove componente do array
            componentesNota = componentesNota.filter(comp => comp.id !== componenteParaExcluir);
            atualizarSidebarComponentes();
            atualizarListaComponentesModal();
            fecharModalConfirmacao();
            componenteParaExcluir = null;
        }
    });
}
function abrirModalConfirmacao() {
    const modalConfirmacao = document.getElementById('modal_confirmacao');
    const modalOverlay = document.getElementById('modal_container');
    // Escurece mais o fundo quando o modal de confirmação abre
    if (modalOverlay) {
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    }
    modalConfirmacao?.style.setProperty('display', 'block');
}
function fecharModalConfirmacao() {
    const modalConfirmacao = document.getElementById('modal_confirmacao');
    const modalOverlay = document.getElementById('modal_container');
    // Restaura a opacidade original do overlay
    if (modalOverlay) {
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    }
    modalConfirmacao?.style.setProperty('display', 'none');
}
// ========================
// FUNCIONALIDADES DA PLANILHA DE NOTAS
// ========================
document.addEventListener("DOMContentLoaded", () => {
    const tabela = document.getElementById("grade_table");
    const thead = tabela?.querySelector("thead");
    thead?.addEventListener("dblclick", (e) => {
        const th = e.target.closest("th");
        if (!th)
            return;
        const cabecalhos = Array.from(thead.querySelectorAll("th"));
        const indice = cabecalhos.indexOf(th);
        if (indice < 2 || th.classList.contains("final-grade-col"))
            return;
        const linhas = tabela?.querySelectorAll("tbody tr");
        const inputsColuna = [];
        linhas?.forEach((linha) => {
            const celula = linha.children[indice];
            if (!celula)
                return;
            const input = celula.querySelector("input");
            if (input)
                inputsColuna.push(input);
        });
        const colunaAtiva = th.dataset.ativa === "true";
        if (!colunaAtiva) {
            tabela?.querySelectorAll("tbody td input").forEach(inp => inp.disabled = true);
            cabecalhos.forEach(c => c.style.backgroundColor = "");
            inputsColuna.forEach(input => input.disabled = false);
            th.style.backgroundColor = "#ffc30f";
            th.dataset.ativa = "true";
        }
        else {
            inputsColuna.forEach(input => input.disabled = true);
            th.style.backgroundColor = "";
            th.dataset.ativa = "false";
        }
    });
});
// ========================
// NO FINAL DO ARQUIVO: Inicializa todos os modais e atualiza sidebars
// ========================
document.addEventListener('DOMContentLoaded', () => {
    initModalFormula(); // Inicializa modal de fórmulas
    initModalComponentes(); // Inicializa modal de componentes
    initModalAlunos(); // Inicializa modal de alunos
    atualizarSidebarFormula(); // Atualiza sidebar com fórmulas
    atualizarSidebarComponentes(); // Atualiza sidebar com componentes
});
