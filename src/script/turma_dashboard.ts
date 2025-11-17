// =======================
// ARRAYS GLOBAIS
// =======================
let alunosTurma: { matricula: string; nome: string }[] = [];
let componentesNotas: { id_compNota: number; nome: string; sigla: string }[] = [];
let notasTurma: Record<string, number> = {}; // chave: `${matricula}_${id_compNota}`
let formulaDisciplina: { expressao: string; tipo: string } | null = null;
let fk_turma: number = 1;           // Agora global
let disciplinaId: number = 1;       // Agora global
interface NotaFinal {
  matricula: string | number;
  nome: string;
  nota_final: string | number;
}


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

// =======================
// CARREGAR NOTAS DA TURMA
// =======================
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
// CARREGAR FÓRMULA DA DISCIPLINA
// =======================
async function carregarFormula(disciplinaId: number): Promise<void> {
  const resp = await fetch('/api/disciplinas/' + disciplinaId + '/formula', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!resp.ok) {
    console.error('Erro ao carregar fórmula:', resp.statusText);
    return;
  }
  const json = await resp.json();
  if (json.success && json.data.formula) {
    formulaDisciplina = json.data.formula;
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
async function atualizarTabelaAlunos(): Promise<void> {
  const tabela = document.getElementById('grade_table') as HTMLTableElement | null;
  if (!tabela) return;
  
  const tbody = tabela.querySelector('tbody');
  if (!tbody) return;
  
  // Carregar notas finais do backend
  const notasFinaisMap = await carregarNotasFinais(fk_turma);
  
  tbody.innerHTML = '';
  
  alunosTurma.forEach(aluno => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${aluno.matricula}</td><td>${aluno.nome}</td>`;
    
    // Criar colunas para cada componente de nota
    componentesNotas.forEach(comp => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '10';
      input.step = '0.01';
      input.dataset.matricula = aluno.matricula;
      input.dataset.componente = String(comp.id_compNota);
      input.disabled = true;
      
      const chaveNota = `${aluno.matricula}_${comp.id_compNota}`;
      if (notasTurma && notasTurma[chaveNota] != null) {
        input.value = String(notasTurma[chaveNota]);
      }
      
      input.addEventListener('change', async () => {
        let valor = parseFloat(input.value);
        if (isNaN(valor) || valor < 0 || valor > 10) {
          alert('Nota deve ser de 0 a 10!');
          input.value = '';
          return;
        }
        
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
    
    // Coluna de nota final
    const tdFinal = document.createElement('td');
    tdFinal.className = 'final-grade-col';
    
    // Verifica se existe nota final salva no banco
    if (notasFinaisMap[aluno.matricula] != null) {
      const notaFinal = notasFinaisMap[aluno.matricula];
      tdFinal.textContent = notaFinal.toFixed(2);
      tdFinal.style.fontWeight = 'bold';
      tdFinal.style.color = notaFinal >= 5 ? '#28a745' : '#dc3545';
    } else {
      tdFinal.textContent = '-';
    }
    
    tr.appendChild(tdFinal);
    tbody.appendChild(tr);
  });
}

// =======================
// FUNÇÃO AUXILIAR PARA CARREGAR NOTAS FINAIS
// =======================
async function carregarNotasFinais(fk_turma: number): Promise<Record<string, number>> {
  const resp = await fetch(`/api/nota-final/${fk_turma}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  
  if (!resp.ok) {
    console.error('Erro ao carregar notas finais:', resp.statusText);
    return {};
  }
  
  const json = await resp.json();
  const notasFinaisMap: Record<string, number> = {};
  
  if (json.success && Array.isArray(json.data)) {
    json.data.forEach((linha: any) => {
      if (linha.valor != null) {
        notasFinaisMap[linha.matricula] = Number(linha.valor);
      }
    });
  }
  
  return notasFinaisMap;
}

// =======================
// VALIDAÇÃO DA FÓRMULA
// =======================
function validarFormula(expressao: string, tipo: string): { valido: boolean; mensagem: string } {
  if (tipo === 'ponderada') {
    const pesos = expressao.match(/\*\s*([\d.]+)/g);
    if (!pesos) return { valido: false, mensagem: 'Fórmula ponderada inválida' };

    const somaPesos = pesos.reduce((acc, p) => {
      const peso = parseFloat(p.replace('*', '').trim());
      return acc + peso;
    }, 0);

    if (Math.abs(somaPesos - 1.0) > 0.001) {
      return {
        valido: false,
        mensagem: `Erro: Soma dos pesos é ${somaPesos.toFixed(3)}. Deve ser 1.0 para nota máxima de 10.00`
      };
    }
  } else if (tipo === 'aritmetica') {
    const divMatch = expressao.match(/\/\s*(\d+)/);
    if (divMatch) {
      const divisor = Number(divMatch[1]);
      if (divisor !== componentesNotas.length) {
        return {
          valido: false,
          mensagem: `Divisor ${divisor} diferente do número de componentes (${componentesNotas.length})`
        };
      }
    }
  }
  return { valido: true, mensagem: '' };
}

// =======================
// CALCULAR NOTA FINAL DE UM ALUNO
// =======================
function calcularNotaFinal(matricula: string): number | null {
  if (!formulaDisciplina) return null;

  for (const comp of componentesNotas) {
    const chave = `${matricula}_${comp.id_compNota}`;
    if (notasTurma[chave] == null) {
      return null;
    }
  }

  let expressao = formulaDisciplina.expressao;
  componentesNotas.forEach(comp => {
    const chave = `${matricula}_${comp.id_compNota}`;
    const nota = notasTurma[chave] || 0;
    const regex = new RegExp(`\\b${comp.sigla}\\b`, 'g');
    expressao = expressao.replace(regex, String(nota));
  });

  try {
    const notaFinal = eval(expressao);


    if (notaFinal > 10.00) {
      console.warn(`Nota calculada (${notaFinal}) excede 10.00 para aluno ${matricula}`);
      return 10.00;
    }

    return notaFinal;
  } catch (e) {
    console.error('Erro ao avaliar expressão:', e);
    return null;
  }
}

// =======================
// CALCULAR TODAS AS NOTAS FINAIS
// =======================
async function calcularTodasNotasFinais(): Promise<void> {
  if (!formulaDisciplina) {
    alert('Nenhuma fórmula cadastrada para esta disciplina!');
    return;
  }

  const validacao = validarFormula(formulaDisciplina.expressao, formulaDisciplina.tipo);
  if (!validacao.valido) {
    alert(validacao.mensagem);
    return;
  }

  const tabela = document.getElementById('grade_table') as HTMLTableElement | null;
  if (!tabela) return;
  const linhas = tabela.querySelectorAll('tbody tr');

  let alunosSemNotas: string[] = [];

  for (let idx = 0; idx < linhas.length; idx++) {
    const aluno = alunosTurma[idx];
    if (!aluno) continue;

    const notaFinal = calcularNotaFinal(aluno.matricula);
    const tdFinal = linhas[idx].querySelector('.final-grade-col') as HTMLTableCellElement;

    if (notaFinal === null) {
      alunosSemNotas.push(aluno.nome);
      tdFinal.textContent = '-';
    } else {
      // Salvar nota final no backend
      try {
        await fetch('/api/nota-final', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            matricula: aluno.matricula,
            turma: fk_turma,  // passe a turma atual do contexto
            valor: Number(notaFinal.toFixed(2))
          })
        });
      } catch (error) {
        console.error('Erro ao salvar nota final:', error);
      }

      tdFinal.textContent = notaFinal.toFixed(2);
      tdFinal.style.fontWeight = 'bold';
      tdFinal.style.color = notaFinal >= 5 ? '#28a745' : '#dc3545';
    }
  }

  if (alunosSemNotas.length > 0) {
    alert(`Atenção: ${alunosSemNotas.length} aluno(s) não têm todas as notas preenchidas:\n${alunosSemNotas.join(', ')}`);
  } else {
    alert('Notas finais calculadas com sucesso!');
  }
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

  btnGerenciar?.addEventListener('click', () => {
    modalOverlay.style.display = 'flex';
    modalAlunos.style.display = 'block';
    ativarAba('tab-manual-aluno');
  });
  btnFechar?.addEventListener('click', () => {
    modalAlunos.style.display = 'none';
    modalOverlay.style.display = 'none';
  });
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) ativarAba(tabId);
    });
  });
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      if (modalAlunos.style.display === 'block') {
        modalAlunos.style.display = 'none';
        modalOverlay.style.display = 'none';
      }
    }
  });

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
    const fk_turmaInput = document.getElementById('id-turma') as HTMLInputElement | null;
    const fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
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

// =======================
// DUPLO CLIQUE PARA LIBERAR COLUNA
// =======================
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
// EXPORTAR NOTAS PARA CSV
// =======================
async function exportarNotasCSV(): Promise<void> {
  // Validar se todas as notas estão preenchidas
  let todasNotasPreenchidas = true;
  let alunosSemNotas: string[] = [];
  
  for (const aluno of alunosTurma) {
    // Verificar se todas as notas de componentes estão preenchidas
    for (const comp of componentesNotas) {
      const chaveNota = `${aluno.matricula}_${comp.id_compNota}`;
      if (notasTurma[chaveNota] == null) {
        todasNotasPreenchidas = false;
        if (!alunosSemNotas.includes(aluno.nome)) {
          alunosSemNotas.push(aluno.nome);
        }
      }
    }
    
    // Verificar se a nota final foi calculada
    const notaFinal = calcularNotaFinal(aluno.matricula);
    if (notaFinal === null) {
      todasNotasPreenchidas = false;
      if (!alunosSemNotas.includes(aluno.nome)) {
        alunosSemNotas.push(aluno.nome);
      }
    }
  }
  
  // Se não estiver tudo preenchido, mostrar aviso
  if (!todasNotasPreenchidas) {
    alert(
      'Não é possível exportar as notas!\n\n' +
      'Todas as notas devem estar atribuídas e o cálculo final deve ser realizado para todos os estudantes.\n\n' +
      `Alunos com pendências (${alunosSemNotas.length}):\n${alunosSemNotas.join(', ')}`
    );
    return;
  }
  
  // Buscar informações da turma e disciplina para o nome do arquivo
  const turmaInfo = await buscarInfoTurma(fk_turma);
  const disciplinaInfo = await buscarInfoDisciplina(disciplinaId);
  
  // Gerar nome do arquivo: YYYY-MM-DD_HHmmssms-TurmaX_Sigla.csv
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  const segundo = String(agora.getSeconds()).padStart(2, '0');
  const milissegundo = String(agora.getMilliseconds()).padStart(3, '0');
  
  const nomeTurma = turmaInfo?.nome || `T${fk_turma}`;
  const siglaDisciplina = disciplinaInfo?.sigla || 'DISC';
  
  const nomeArquivo = `${ano}-${mes}-${dia}_${hora}${minuto}${segundo}${milissegundo}-${nomeTurma}-${siglaDisciplina}.csv`;
  
  // Montar conteúdo CSV
  let csvContent = 'Matrícula,Nome';
  
  // Adicionar cabeçalhos dos componentes
  componentesNotas.forEach(comp => {
    csvContent += `,${comp.sigla}`;
  });
  csvContent += ',Nota Final\n';
  
  // Adicionar dados dos alunos
  alunosTurma.forEach(aluno => {
    csvContent += `${aluno.matricula},${aluno.nome}`;
    
    // Adicionar notas dos componentes
    componentesNotas.forEach(comp => {
      const chaveNota = `${aluno.matricula}_${comp.id_compNota}`;
      const nota = notasTurma[chaveNota];
      csvContent += `,${nota != null ? nota.toFixed(2) : '-'}`;
    });
    
    // Adicionar nota final
    const notaFinal = calcularNotaFinal(aluno.matricula);
    csvContent += `,${notaFinal != null ? notaFinal.toFixed(2) : '-'}`;
    csvContent += '\n';
  });
  
  // Criar blob e fazer download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', nomeArquivo);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log(`Arquivo exportado: ${nomeArquivo}`);
}

// =======================
// BUSCAR INFORMAÇÕES DA TURMA
// =======================
async function buscarInfoTurma(fk_turma: number): Promise<{ nome: string } | null> {
  try {
    const resp = await fetch(`/api/turmas/${fk_turma}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!resp.ok) {
      console.error('Erro ao buscar info da turma:', resp.statusText);
      return null;
    }
    
    const json = await resp.json();
    return json.success && json.data ? json.data : null;
  } catch (error) {
    console.error('Erro ao buscar info da turma:', error);
    return null;
  }
}

// =======================
// BUSCAR INFORMAÇÕES DA DISCIPLINA
// =======================
async function buscarInfoDisciplina(disciplinaId: number): Promise<{ sigla: string } | null> {
  try {
    const resp = await fetch(`/api/disciplinas/${disciplinaId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (!resp.ok) {
      console.error('Erro ao buscar info da disciplina:', resp.statusText);
      return null;
    }
    
    const json = await resp.json();
    return json.success && json.data ? json.data : null;
  } catch (error) {
    console.error('Erro ao buscar info da disciplina:', error);
    return null;
  }
}

// =======================
// INICIALIZAÇÃO COMPLETA
// =======================
document.addEventListener('DOMContentLoaded', async () => {
  const fk_turmaInput = document.getElementById('id-turma') as HTMLInputElement | null;
  const disciplinaInput = document.getElementById('id-disciplina') as HTMLInputElement | null;
  
  fk_turma = fk_turmaInput ? Number(fk_turmaInput.value) : 1;
  disciplinaId = disciplinaInput ? Number(disciplinaInput.value) : 1;
  
  await montarGradeTable(disciplinaId);
  await carregarAlunosDaTurma(fk_turma);
  await carregarNotasTurma(fk_turma);
  await carregarFormula(disciplinaId);
  await atualizarTabelaAlunos();
  
  initModalAlunos();
  
  const btnCalcular = document.getElementById('btn-calcular-notas');
  btnCalcular?.addEventListener('click', calcularTodasNotasFinais);
  
  // ADICIONE ESTA LINHA:
  const btnExportar = document.getElementById('export_grades_btn');
  btnExportar?.addEventListener('click', exportarNotasCSV);
});

