// =======================
// ARRAYS GLOBAIS
// =======================
let alunosTurma: { matricula: string; nome: string }[] = [];
let componentesNotas: { id_compNota: number; nome: string; sigla: string }[] = [];
let notasTurma: Record<string, number> = {}; // chave: `${matricula}_${id_compNota}`


// =======================
// CARREGAR COMPONENTES DA DISCIPLINA
// =======================
async function carregarComponentes(disciplinaId: number): Promise<any[]> {
  const resp = await fetch('/api/componentes/' + disciplinaId, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!resp.ok) {
    console.error('Erro ao carregar componentes:', resp.statusText);
    return [];
  }
  const json = await resp.json();
  return (json.success && Array.isArray(json.data)) ? json.data : [];
}


async function carregarNotasTurma(fk_turma: number): Promise<void> {
  const resp = await fetch('/api/notas/turma/' + fk_turma, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!resp.ok) {
    console.error('Erro ao carregar notas:', resp.statusText);
    return;
  }
  const json = await resp.json();
  notasTurma = {};
  if (json.success && Array.isArray(json.data)) {
    json.data.forEach((linha: any) => {
      if (linha.nota != null)
        notasTurma[`${linha.matricula}_${linha.id_compNota}`] = Number(linha.nota);
    });
  }
}


// =======================
// MONTAR CABEÇALHO DINÂMICO DA TABELA
// =======================
async function montarGradeTable(disciplinaId: number) {
  componentesNotas = await carregarComponentes(disciplinaId);

  const tabela = document.getElementById("grade_table") as HTMLTableElement | null;
  if (!tabela) return;
  let thead = tabela.querySelector('thead');
  if (!thead) {
    thead = document.createElement('thead');
    tabela.appendChild(thead);
  }
  thead.innerHTML = '<tr><th>Matrícula</th><th>Nome</th>' +
    componentesNotas.map(c => `<th>${c.sigla}</th>`).join('') +
    '<th class="final-grade-col">Final</th></tr>';
}

// =======================
// ATUALIZAR TABELA DE ALUNOS
// =======================
function atualizarTabelaAlunos(): void {
  const tabela = document.getElementById('grade_table') as HTMLTableElement | null;
  if (!tabela) return;
  const tbody = tabela.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  // O FOR de alunos vem primeiro
  alunosTurma.forEach(aluno => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${aluno.matricula}</td><td>${aluno.nome}</td>`;
    
    // E DENTRO do for de alunos, gera os inputs dos componentes
    componentesNotas.forEach(comp => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '10';
      input.step = '0.1';
      input.dataset.componente = String(comp.id_compNota);
      input.disabled = true;
      const chaveNota = `${aluno.matricula}_${comp.id_compNota}`;
      if (notasTurma && notasTurma[chaveNota] != null) {
        input.value = String(notasTurma[chaveNota]).replace('.', ',');
      }
      // Evento para salvar
      input.addEventListener('change', async () => {
        let valor = parseFloat(input.value.replace(',', '.'));
        if (isNaN(valor)) return;
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
        notasTurma[`${aluno.matricula}_${comp.id_compNota}`] = valor;
      });
      td.appendChild(input);
      tr.appendChild(td);
    });

    const tdFinal = document.createElement('td');
    tdFinal.className = 'final-grade-col';
    tdFinal.textContent = '-';
    tr.appendChild(tdFinal);
    tbody.appendChild(tr);
  });
}




// =======================
// BACKEND HELPERS (ALUNOS)
// =======================

async function salvarAlunoBackend(matricula: string, nome: string, fk_turma: number): Promise<void> {
  await fetch('/api/turma_dashboard/' + fk_turma + '/alunos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ matricula, nome })
  });
}

async function carregarAlunosDaTurma(fk_turma: number): Promise<void> {
  const resp = await fetch('/api/turma_dashboard/' + fk_turma + '/alunos', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!resp.ok) {
    console.error('Erro ao carregar alunos:', resp.statusText);
    return;
  }
  const json = await resp.json();
  if (json.success && Array.isArray(json.data)) {
    alunosTurma = json.data.map((a: any) => ({
      matricula: String(a.matricula),
      nome: String(a.nome)
    }));
    atualizarTabelaAlunos();
  }
}

// =======================
// MODAL DE ALUNOS
// =======================
function initModalAlunos(): void {
  const btnGerenciar = document.getElementById('manage_students_btn');
  const modalOverlay = document.getElementById('modal_container');
  const modalAlunos = document.getElementById('modal_alunos')!;
  const btnFechar = modalAlunos?.querySelector('.modal-header .btn') as HTMLButtonElement | null;

  if (!modalOverlay || !modalAlunos) return;

  // Abas e painéis
  const tabs = modalAlunos.querySelectorAll('.tab-buttons .btn');
  const panels = modalAlunos.querySelectorAll('.tab-panel');
  function ativarAba(tabId: string) {
    tabs.forEach(btn => btn.classList.remove('active'));
    panels.forEach(panel => (panel as HTMLElement).style.display = 'none');
    const tabBtn = modalAlunos.querySelector(`[data-tab="${tabId}"]`);
    const tabPanel = modalAlunos.querySelector(`#${tabId}`);
    tabBtn?.classList.add('active');
    (tabPanel as HTMLElement).style.display = 'block';
  }

  // Abrir modal
  btnGerenciar?.addEventListener('click', () => {
    modalOverlay.style.display = 'flex';
    modalAlunos.style.display = 'block';
    ativarAba('tab-manual-aluno');
  });
  // Fechar modal
  btnFechar?.addEventListener('click', () => {
    modalAlunos.style.display = 'none';
    modalOverlay.style.display = 'none';
  });
  // Troca de abas
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) ativarAba(tabId);
    });
  });
  // Fechar no overlay
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      if (modalAlunos.style.display === 'block') {
        modalAlunos.style.display = 'none';
        modalOverlay.style.display = 'none';
      }
    }
  });

  // Adicionar manualmente
  const formManual = document.getElementById('form-aluno-manual') as HTMLFormElement;
  formManual?.addEventListener('submit', async e => {
    e.preventDefault();
    const matInput = formManual.querySelector('#aluno-matricula') as HTMLInputElement;
    const nomeInput = formManual.querySelector('#aluno-nome') as HTMLInputElement;
    const matricula = matInput.value.trim();
    const nome = nomeInput.value.trim();
    if (!matricula || !nome) return;

    if (alunosTurma.some(a => a.matricula === matricula)) {
      alert('Já existe um aluno com essa matrícula!');
      return;
    }
    const fk_turmaInput = document.getElementById('id-turma') as HTMLInputElement;
    const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;

    await salvarAlunoBackend(matricula, nome, fk_turma);
    alunosTurma.push({ matricula, nome });
    atualizarTabelaAlunos();

    matInput.value = '';
    nomeInput.value = '';
  });

  // Importar CSV
  const formImport = document.getElementById('form-aluno-import') as HTMLFormElement;
  const statusImport = document.getElementById('import-status') as HTMLElement;
  formImport?.addEventListener('submit', e => {
    e.preventDefault();
    const fileInput = formImport.querySelector('#csv-file') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result as string;
      const linhas = text.split('\n').map(l => l.trim()).filter(l => l);
      let count = 0;
      const fk_turmaInput = document.getElementById('id-turma') as HTMLInputElement;
      const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
      for (const linha of linhas) {
        const [matricula, nome] = linha.split(',').map(x => x.trim());
        if (matricula && nome && !alunosTurma.some(a => a.matricula === matricula)) {
          await salvarAlunoBackend(matricula, nome, fk_turma);
          alunosTurma.push({ matricula, nome });
          count++;
        }
      }
      atualizarTabelaAlunos();
      statusImport.textContent = `Importação concluída. ${count} alunos adicionados.`;
      fileInput.value = '';
    };
    reader.readAsText(file);
  });

  // Editar aluno
  const formEdit = document.querySelector('#tab-edit-aluno form') as HTMLFormElement;
  const btnEditar = modalAlunos.querySelector('#tab-edit-aluno .btn') as HTMLButtonElement;
  const inputsEdit = formEdit.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
  const inputMatriculaBusca = inputsEdit[0];
  const inputNovaMatricula = inputsEdit[1];
  const inputNovoNome = inputsEdit[2];

  inputMatriculaBusca.addEventListener('blur', () => {
    const matricula = inputMatriculaBusca.value.trim();
    if (!matricula) return;
    const aluno = alunosTurma.find(a => a.matricula === matricula);
    if (aluno) {
      inputNovaMatricula.value = aluno.matricula;
      inputNovoNome.value = aluno.nome;
    } else {
      inputNovaMatricula.value = '';
      inputNovoNome.value = '';
      alert('Aluno não encontrado!');
    }
  });
  btnEditar?.addEventListener('click', async e => {
    e.preventDefault();
    const matAntiga = inputMatriculaBusca.value.trim();
    const novaMat = inputNovaMatricula.value.trim();
    const novoNome = inputNovoNome.value.trim();
    const fk_turmaInput = document.getElementById('id-turma') as HTMLInputElement | null;
    const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
    const aluno = alunosTurma.find(a => a.matricula === matAntiga);
    if (!aluno) {
      alert('Aluno não encontrado!');
      return;
    }
    // Backend PUT
    const resp = await fetch(`/api/turma_dashboard/${fk_turma}/alunos/${matAntiga}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ novaMatricula: novaMat, novoNome })
    });
    if (!resp.ok) {
      alert('Falha ao editar aluno!');
      return;
    }
    if (novaMat) aluno.matricula = novaMat;
    if (novoNome) aluno.nome = novoNome;
    atualizarTabelaAlunos();
    formEdit.reset();
    alert('Aluno atualizado com sucesso!');
  });

  // Excluir aluno
  const formDel = document.querySelector('#tab-delete-aluno form') as HTMLFormElement;
  const btnDeletar = modalAlunos.querySelector('#tab-delete-aluno .btn') as HTMLButtonElement;
  btnDeletar?.addEventListener('click', async e => {
    e.preventDefault();
    const inputs = formDel.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    const matricula = inputs[0].value.trim();
    const matriculaConfirm = inputs[1].value.trim();
    const nomeConfirm = inputs[2].value.trim();
    if (!matricula || !matriculaConfirm || !nomeConfirm) {
      alert('Erro: Campos vazios!');
      return;
    }
    if (matricula !== matriculaConfirm) {
      alert('Erro: Matrículas não coincidem!');
      return;
    }
    const indexMatricula = alunosTurma.findIndex(a => a.matricula === matricula && a.nome === nomeConfirm);
    if (indexMatricula === -1) {
      alert('Aluno não encontrado!');
      return;
    }
    // id da turma
    const fk_turmaInput = document.getElementById('id-turma') as HTMLInputElement | null;
    const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
    // Backend DELETE
    const resp = await fetch(`/api/turma_dashboard/${fk_turma}/alunos/${matricula}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nome: nomeConfirm })
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => null);
      alert(`Falha ao excluir aluno: ${data?.message || resp.statusText}`);
      return;
    }
    alunosTurma.splice(indexMatricula, 1);
    atualizarTabelaAlunos();
    formDel.reset();
    alert('Aluno deletado com sucesso!');
  });
}

// ============================================================
// FUNCIONALIDADES DA PLANILHA DE NOTAS (opcional e ajustável)
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const tabela = document.getElementById("grade_table") as HTMLTableElement | null;
  const thead = tabela?.querySelector("thead") as HTMLTableSectionElement | null;

  thead?.addEventListener("dblclick", (e) => {
    const th = (e.target as HTMLElement).closest("th") as HTMLTableCellElement | null;
    if (!th) return;
    const cabecalhos = Array.from(thead.querySelectorAll("th"));
    const indice = cabecalhos.indexOf(th);
    if (indice < 2 || th.classList.contains("final-grade-col")) return;
    const linhas = tabela?.querySelectorAll("tbody tr");
    const inputsColuna: HTMLInputElement[] = [];
    linhas?.forEach((linha) => {
      const celula = linha.children[indice] as HTMLTableCellElement | undefined;
      if (!celula) return;
      const input = celula.querySelector("input") as HTMLInputElement | null;
      if (input) inputsColuna.push(input);
    });
    const colunaAtiva = th.dataset.ativa === "true";
    if (!colunaAtiva) {
      tabela?.querySelectorAll("tbody td input").forEach(inp => (inp as HTMLInputElement).disabled = true);
      cabecalhos.forEach(c => (c as HTMLElement).style.backgroundColor = "");
      inputsColuna.forEach(input => input.disabled = false);
      th.style.backgroundColor = "#ffc30f";
      th.dataset.ativa = "true";
    } else {
      inputsColuna.forEach(input => input.disabled = true);
      th.style.backgroundColor = "";
      th.dataset.ativa = "false";
    }
  });
});

// =======================
// INICIALIZAÇÃO COMPLETA
// =======================
document.addEventListener('DOMContentLoaded', async () => {
  const fk_turmaInput = document.getElementById('id-turma') as HTMLInputElement | null;
  const disciplinaInput = document.getElementById('id-disciplina') as HTMLInputElement | null;
  const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
  const disciplinaId = disciplinaInput ? Number(disciplinaInput.value) : 1;

  await montarGradeTable(disciplinaId);
  await carregarAlunosDaTurma(fk_turma);
  await carregarNotasTurma(fk_turma);
  atualizarTabelaAlunos();
  initModalAlunos();
});
