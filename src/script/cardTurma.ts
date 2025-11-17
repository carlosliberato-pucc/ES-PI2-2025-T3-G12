

// ============================================
// INTERFACES E TIPOS
// ============================================

interface FormulaData {
    tipo: string;
    formula: string;
}

interface ComponenteNota {
    id: string;
    nome: string;
    sigla: string;
    descricao: string;
}



// ============================================
// VARIÁVEIS GLOBAIS (com prefixo para evitar conflito)
// ============================================

let turmasFormulaAtual: FormulaData | null = null;
let turmasComponentesNota: ComponenteNota[] = [];
let turmasComponenteParaExcluir: string | null = null;
let temTurmasExistentes = false;

// ============================================
// FUNÇÕES DE INTEGRAÇÃO COM BACKEND
// ============================================

const API_BASE = 'http://localhost:3000/api';

const carregarFormulaDoBanco = async (idDisciplina: string): Promise<FormulaData | null> => {
    try {
        const response = await fetch(`${API_BASE}/disciplinas/${idDisciplina}/formula`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Erro ao carregar fórmula:', response.status);
            return null;
        }

        const result = await response.json();
        if (result.success && result.data && result.data.formula) {
            // O backend atualmente retorna expressao; tipo pode ser salvo/extendido pelo backend
            return {
                tipo: result.data.formula.tipo || 'aritmetica',
                formula: result.data.formula.expressao
            };
        }
        return null;
    } catch (erro) {
        console.error('Erro ao carregar fórmula:', erro);
        return null;
    }
};

const salvarFormulaNoBanco = async (idDisciplina: string, formula: FormulaData): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/disciplinas/${idDisciplina}/formula`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                tipo: formula.tipo,
                expressao: formula.formula,
                descricao: `Fórmula ${formula.tipo} para cálculo da nota final`
            })
        });

        const result = await response.json();
        if (!result.success) {
            alert(result.message || 'Erro ao salvar fórmula');
            return false;
        }
        return true;
    } catch (erro) {
        console.error('Erro ao salvar fórmula:', erro);
        alert('Erro ao conectar com o servidor');
        return false;
    }
};

const carregarComponentesDoBanco = async (idDisciplina: string): Promise<ComponenteNota[]> => {
    try {
        const response = await fetch(`${API_BASE}/disciplinas/${idDisciplina}/componentes`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Erro ao carregar componentes:', response.status);
            return [];
        }

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            return result.data.map((comp: any) => ({
                id: String(comp.id_compNota),
                nome: comp.nome,
                sigla: comp.sigla,
                descricao: comp.descricao || ''
            }));
        }
        return [];
    } catch (erro) {
        console.error('Erro ao carregar componentes:', erro);
        return [];
    }
};

const salvarComponenteNoBanco = async (idDisciplina: string, componente: Omit<ComponenteNota, 'id'>): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/disciplinas/${idDisciplina}/componentes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                nome: componente.nome,
                sigla: componente.sigla,
                descricao: componente.descricao
            })
        });

        const result = await response.json();
        if (!result.success) {
            alert(result.message || 'Erro ao criar componente');
            return false;
        }

        // Atualizar o ID local com o retornado do servidor
        turmasComponentesNota.push({
            ...componente,
            id: String(result.data.id_compNota)
        });

        return true;
    } catch (erro) {
        console.error('Erro ao criar componente:', erro);
        alert('Erro ao conectar com o servidor');
        return false;
    }
};

const removerComponenteNoBanco = async (idDisciplina: string, idComponente: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/disciplinas/${idDisciplina}/componentes/${idComponente}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const result = await response.json();
        if (!result.success) {
            alert(result.message || 'Erro ao remover componente');
            return false;
        }
        return true;
    } catch (erro) {
        console.error('Erro ao remover componente:', erro);
        alert('Erro ao conectar com o servidor');
        return false;
    }
};

// ============================================
// DOCUMENT READY
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const idInstituicao = urlParams.get('id_instituicao');
    const idCurso = urlParams.get('id_curso');
    const idDisciplina = urlParams.get('id_disciplina');

    //aquii
    if (!idInstituicao || !idCurso || !idDisciplina) {
        alert('Parâmetros da URL incompletos');
        window.location.href = '/dashboard';
        return;
    }



    // ========== ELEMENTOS DO DOM ==========
    const btnsCard = document.querySelectorAll<HTMLButtonElement>(".btn-card");
    const edicaoCard = document.querySelector<HTMLDivElement>(".edicao-card");
    const coresEdit = document.querySelectorAll<HTMLButtonElement>('.cor-btn[data-context="edit"]');
    const createCardModal = document.querySelector('.create-card') as HTMLDivElement;
    const nomeInst = document.getElementById("nome") as HTMLInputElement;
    const btnCriar = document.getElementById("btn-criar") as HTMLButtonElement;
    const coresCreate = document.querySelectorAll<HTMLButtonElement>('.cor-btn[data-context="create"]');
    const btnCreateCard = document.querySelectorAll<HTMLButtonElement>(".btn-create-card");
    const modalOverlay = document.querySelector('.modal-overlay') as HTMLDivElement;

    let corSelecionada = 'rgb(10, 61, 183)'; // cor padrão
    let painelCreateAberto = false;
    let painelEditAberto = false;
    let cardAtual: HTMLDivElement | null = null;

    const carregarTurmas = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/turmas?id_instituicao=${idInstituicao}&id_curso=${idCurso}&id_disciplina=${idDisciplina}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('Erro ao carregar turmas:', response.status);
                return;
            }

            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                result.data.forEach((turma: any) => {
                    // Buscar cor salva no localStorage
                    const corSalva = localStorage.getItem(`cor_turma_${turma.id_turma}`);
                    const cor = corSalva || 'rgb(10, 61, 183)';

                    // Criar card visual com dados do banco
                    criarNovoCard(turma.nome, cor, turma.id_turma);
                });

                console.log(`${result.data.length} turmas carregadas`);
                // atualizar flag de existência de turmas
                verificarTurmasExistentes();
            }
        } catch (erro) {
            console.error('Erro ao carregar turmas:', erro);
        }
    };

    const updateGerenciarButtons = (tem: boolean) => {
        const btnFormula = document.getElementById('manage_formula_btn') as HTMLButtonElement | null;
        const btnComponentes = document.getElementById('add_component_btn') as HTMLButtonElement | null;

        if (!btnFormula || !btnComponentes) return;

        if (!tem) {
            btnFormula.classList.add('disabled');
            btnComponentes.classList.add('disabled');
            btnFormula.title = 'Adicione uma turma primeiro';
            btnComponentes.title = 'Adicione uma turma primeiro';
            btnFormula.style.opacity = '0.6';
            btnComponentes.style.opacity = '0.6';
            btnFormula.style.cursor = 'not-allowed';
            btnComponentes.style.cursor = 'not-allowed';
        } else {
            btnFormula.classList.remove('disabled');
            btnComponentes.classList.remove('disabled');
            btnFormula.title = 'Gerenciar fórmula de média';
            btnComponentes.title = 'Gerenciar componentes de nota';
            btnFormula.style.opacity = '';
            btnComponentes.style.opacity = '';
            btnFormula.style.cursor = '';
            btnComponentes.style.cursor = '';
        }
    };

    const verificarTurmasExistentes = async () => {
        try {
            const response = await fetch(`${API_BASE}/turmas?id_instituicao=${idInstituicao}&id_curso=${idCurso}&id_disciplina=${idDisciplina}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('Erro ao verificar turmas:', response.status);
                temTurmasExistentes = false;
                updateGerenciarButtons(false);
                return false;
            }

            const result = await response.json();
            const temTurmas = result.success && Array.isArray(result.data) && result.data.length > 0;
            temTurmasExistentes = temTurmas;
            updateGerenciarButtons(temTurmas);
            return temTurmas;
        } catch (erro) {
            console.error('Erro ao verificar turmas:', erro);
            temTurmasExistentes = false;
            updateGerenciarButtons(false);
            return false;
        }
    };
    // ========================================
    // FUNÇÕES DE CARDS - CRIAR
    // ========================================

    const criarNovoCard = (nome: string, cor: string, id_turma?: number) => {
        const section = document.querySelector("main section");

        const novoCard = document.createElement("div") as HTMLDivElement;
        novoCard.classList.add("card");
        novoCard.style.backgroundColor = cor;

        if (id_turma) {
            novoCard.dataset.id = id_turma.toString();
        }

        novoCard.innerHTML = `
            <button class="btn-card">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path fill="#ffffff"
                        d="M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z" />
                </svg>
            </button>
            <div class="descricao" style="cursor:pointer">
                <h1 style="font-size:20px;">${nome}</h1>
                <h2>${nome}</h2>
            </div>                
        `;

        // Clicar no card leva para alunos (próxima etapa)
        novoCard.addEventListener('click', (e) => {
            const clickedElement = e.target as HTMLElement;
            if (!clickedElement.closest('.btn-card') && id_turma) {
                // Futura navegação para alunos
                window.location.href = `/turma_dashboard?id_instituicao=${idInstituicao}
                &id_curso=${idCurso}&id_disciplina=${idDisciplina}&id_turma=${id_turma}`;
            }
        });

        

        section?.appendChild(novoCard);

        // Adiciona evento ao botão do novo card
        const btnNovoCard = novoCard.querySelector('.btn-card') as HTMLButtonElement;
        adicionarEventoEdicao(btnNovoCard, novoCard);
    };

    const criarTurmaNoBanco = async (nome: string, cor: string): Promise<boolean> => {
        try {
            const response = await fetch(`http://localhost:3000/api/turmas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id_instituicao: idInstituicao,
                    id_curso: idCurso,
                    id_disciplina: idDisciplina,
                    nome
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('Turma criada no banco:', result.data);

                // Salvar cor no localStorage
                const id_turma = result.data.id_turma;
                localStorage.setItem(`cor_turma_${id_turma}`, cor);

                // Criar card visual com o ID do banco
                criarNovoCard(nome, cor, id_turma);

                // Atualiza estado de botões (agora existe pelo menos uma turma)
                verificarTurmasExistentes();

                return true;
            } else {
                alert(result.message || 'Erro ao criar turma');
                return false;
            }
        } catch (error) {
            console.error('Erro ao criar turma:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
            return false;
        }
    };


    coresCreate.forEach((corBtn) => {
        corBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            corSelecionada = window.getComputedStyle(corBtn).backgroundColor;
            coresCreate.forEach(el => el.style.border = 'none');
            corBtn.style.border = '3px solid #333';
        });
    });

    btnCriar.addEventListener('click', async (e) => {
        e.preventDefault();

        const nome = nomeInst.value.trim();

        if (!nome) {
            alert("Digite o nome da turma.");
            return;
        }

        // Desabilitar botão durante requisição
        btnCriar.disabled = true;
        const textoOriginal = btnCriar.textContent;
        btnCriar.textContent = 'Criando...';

        // Criar no banco de dados
        const sucesso = await criarTurmaNoBanco(nome, corSelecionada);

        // Reabilitar botão
        btnCriar.disabled = false;
        btnCriar.textContent = textoOriginal;

        if (sucesso) {
            // Limpar formulário
            nomeInst.value = '';
            corSelecionada = 'rgb(10, 61, 183)';
            coresCreate.forEach(el => el.style.border = 'none');

            // Fechar modal
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });

    const adicionarEventoBtnCreate = (btnCreate: HTMLButtonElement) => {
        btnCreate.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!painelCreateAberto) {
                createCardModal.style.display = 'block';
                modalOverlay.classList.add('ativo');
                painelCreateAberto = true;
            } else {
                createCardModal.style.display = 'none';
                modalOverlay.classList.remove('ativo');
                painelCreateAberto = false;
            }
        });
    };

    btnCreateCard.forEach((btnCreate) => {
        adicionarEventoBtnCreate(btnCreate);
    });

    // Botão de fechar no modal de criar turma
    const btnFecharCriar = document.getElementById('btn-fechar-criar');
    btnFecharCriar?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        createCardModal.style.display = 'none';
        modalOverlay.classList.remove('ativo');
        painelCreateAberto = false;
    });

    // ========================================
    // FUNÇÕES DE CARDS - EDITAR
    // ========================================

    if (!edicaoCard) {
        console.error('Painel de edição não encontrado!');
        return;
    }

    const adicionarEventoEdicao = (btn: HTMLButtonElement, card: HTMLDivElement) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (painelEditAberto && cardAtual === card) {
                edicaoCard.classList.remove('aberto');
                painelEditAberto = false;
                cardAtual = null;
                return;
            }

            const rect = card.getBoundingClientRect();
            const espacoDireita = window.innerWidth - (rect.right + 10);
            const larguraPainel = 200;

            if (espacoDireita >= larguraPainel) {
                edicaoCard.style.left = `${rect.right + 10}px`;
                edicaoCard.style.transformOrigin = 'left center';
            } else {
                edicaoCard.style.left = `${rect.left - larguraPainel - 10}px`;
                edicaoCard.style.transformOrigin = 'right center';
            }

            edicaoCard.style.top = `${rect.top}px`;
            edicaoCard.style.display = 'block';
            edicaoCard.classList.add('aberto');
            painelEditAberto = true;
            cardAtual = card;

            // Atualiza atributo data-id do botão de excluir no painel compartilhado
            const btnDelete = edicaoCard.querySelector('.btn-open-delete') as HTMLButtonElement | null;
            if (btnDelete) {
                if (card.dataset.id) btnDelete.setAttribute('data-id', card.dataset.id);
                else btnDelete.removeAttribute('data-id');
                btnDelete.disabled = false;
            }
        });
    };

    btnsCard.forEach((btn) => {
        const card = btn.closest('.card') as HTMLDivElement;
        if (card) {
            adicionarEventoEdicao(btn, card);
        }
    });

    coresEdit.forEach((corElement) => {
        corElement.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!cardAtual) return;

            const corSelecionada = window.getComputedStyle(corElement).backgroundColor;
            cardAtual.style.backgroundColor = corSelecionada;
            coresEdit.forEach(el => el.style.border = 'none');

            const salvarCor = (cor: string, instituicaoId: string) => {
                localStorage.setItem(`cor_instituicao_${instituicaoId}`, cor);
            };

            const instituicaoId = cardAtual.dataset.id;
            if (instituicaoId) {
                salvarCor(corSelecionada, instituicaoId);
            }
        });
    });

    const btnDeleteTurma = edicaoCard?.querySelector('.btn-open-delete') as HTMLButtonElement;

    btnDeleteTurma?.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        const turmaId = btnDeleteTurma.getAttribute('data-id');
        
        if (!turmaId) {
            alert('ID da turma não encontrado');
            return;
        }
        
        const confirmacao = confirm('Tem certeza que deseja deletar esta turma?\n\nEsta ação não pode ser desfeita.');
        
        if (!confirmacao) return;
        
        try {
            btnDeleteTurma.disabled = true;
            
            const response = await fetch(`http://localhost:3000/api/turmas/${turmaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                alert(data.message);
                
                // Remove o card da tela com animação
                const cardParaDeletar = document.querySelector(`.card[data-id="${turmaId}"]`) as HTMLDivElement;
                if (cardParaDeletar) {
                    cardParaDeletar.style.opacity = '0';
                    cardParaDeletar.style.transition = 'opacity 0.3s';
                    setTimeout(() => cardParaDeletar.remove(), 300);
                }
                
                // Remove cor do localStorage (se aplicável)
                localStorage.removeItem(`cor_turma_${turmaId}`);
                
                // Fecha o painel de edição
                if (edicaoCard) {
                    edicaoCard.classList.remove('aberto');
                    edicaoCard.style.display = 'none';
                }
                
            } else {
                alert(data.message || 'Erro ao deletar turma');
                btnDeleteTurma.disabled = false;
            }
            
        } catch (error) {
            console.error('Erro ao deletar turma:', error);
            alert('Erro ao processar a solicitação');
            btnDeleteTurma.disabled = false;
        }
    });

    // ========================================
    // MODAL DE FÓRMULA DE MÉDIA
    // ========================================

    const initModalFormula = () => {
        const btnGerenciar = document.getElementById('manage_formula_btn');
        const modalFormula = document.getElementById('modal_formula');
        const btnFecharArray = modalFormula?.querySelectorAll('.btn.secondary');
        const btnFechar = btnFecharArray?.[0];
        const btnCancelar = btnFecharArray?.[1];
        const btnSalvar = document.getElementById('save_formula_btn');
        const selectTipo = document.getElementById('formula_type') as HTMLSelectElement;
        const inputFormula = document.querySelector('#formula_display input[type="text"]') as HTMLInputElement;

        btnGerenciar?.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!temTurmasExistentes) {
                alert('Você precisa criar pelo menos uma turma antes de gerenciar a fórmula.');
                return;
            }

            if (createCardModal) createCardModal.style.display = 'none';
            modalOverlay?.classList.add('ativo');
            if (modalFormula) modalFormula.style.display = 'block';

            if (turmasFormulaAtual) {
                if (selectTipo) selectTipo.value = turmasFormulaAtual.tipo;
                if (inputFormula) inputFormula.value = turmasFormulaAtual.formula;
            } else {
                if (selectTipo) selectTipo.value = 'selecione';
                if (inputFormula) inputFormula.value = '';
            }
        });

        const fecharModalFormula = () => {
            if (modalFormula) modalFormula.style.display = 'none';

            const modalComponentes = document.getElementById('modal_componentes');
            const modalConfirmacao = document.getElementById('modal_confirmacao');

            const outrosModaisAbertos =
                (modalComponentes?.style.display === 'block') ||
                (modalConfirmacao?.style.display === 'block');

            if (!outrosModaisAbertos) {
                modalOverlay?.classList.remove('ativo');
            }
        };

        btnFechar?.addEventListener('click', (e) => {
            e.stopPropagation();
            fecharModalFormula();
        });

        btnCancelar?.addEventListener('click', (e) => {
            e.stopPropagation();
            fecharModalFormula();
        });

        btnSalvar?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectTipo && inputFormula && inputFormula.value.trim()) {
                const novaFormula: FormulaData = {
                    tipo: selectTipo.value,
                    formula: inputFormula.value.trim()
                };

                // Salvar no backend e atualizar UI apenas se sucesso
                if (idDisciplina) {
                    salvarFormulaNoBanco(idDisciplina, novaFormula).then(sucesso => {
                        if (sucesso) {
                            turmasFormulaAtual = novaFormula;
                            atualizarSidebarFormula();
                            fecharModalFormula();
                        }
                    });
                } else {
                    // fallback local
                    turmasFormulaAtual = novaFormula;
                    atualizarSidebarFormula();
                    fecharModalFormula();
                }
            }
        });
    };

    const atualizarSidebarFormula = () => {
        const divsFormula = document.querySelectorAll('.info-formula');

        if (divsFormula.length >= 2) {
            if (turmasFormulaAtual) {
                const tipoTexto = turmasFormulaAtual.tipo === 'aritmetica' ? 'Média Aritmética' : 'Média Ponderada';
                divsFormula[0].textContent = tipoTexto;
                divsFormula[1].textContent = turmasFormulaAtual.formula;
            } else {
                divsFormula[0].textContent = 'Nenhuma fórmula configurada';
                divsFormula[1].textContent = '';
                (divsFormula[0] as HTMLElement).style.fontStyle = 'italic';

            }
        }
    };

    // ========================================
    // MODAL DE COMPONENTES DE NOTA
    // ========================================

    const initModalComponentes = () => {
        const btnGerenciar = document.getElementById('add_component_btn');
        const modalComponentes = document.getElementById('modal_componentes');
        const btnFecharArray = modalComponentes?.querySelectorAll('.btn.secondary');
        const btnFechar = btnFecharArray?.[0];
        const btnAdicionar = document.getElementById('add_component_btn_modal');

        btnGerenciar?.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!temTurmasExistentes) {
                alert('Você precisa criar pelo menos uma turma antes de gerenciar os componentes de nota.');
                return;
            }

            if (createCardModal) createCardModal.style.display = 'none';
            modalOverlay?.classList.add('ativo');
            if (modalComponentes) modalComponentes.style.display = 'block';

            atualizarListaComponentesModal();
        });

        const fecharModalComponentes = () => {
            if (modalComponentes) modalComponentes.style.display = 'none';

            const modalFormula = document.getElementById('modal_formula');
            const modalConfirmacao = document.getElementById('modal_confirmacao');

            const outrosModaisAbertos =
                (modalFormula?.style.display === 'block') ||
                (modalConfirmacao?.style.display === 'block');

            if (!outrosModaisAbertos) {
                modalOverlay?.classList.remove('ativo');
            }
        };

        btnFechar?.addEventListener('click', (e) => {
            e.stopPropagation();
            fecharModalComponentes();
        });

        btnAdicionar?.addEventListener('click', (e) => {
            e.stopPropagation();
            const inputNome = document.getElementById('new_component_nome') as HTMLInputElement;
            const inputSigla = document.getElementById('new_component_sigla') as HTMLInputElement;
            const inputDescricao = document.getElementById('new_component_descricao') as HTMLInputElement;

            if (inputNome?.value.trim() && inputSigla?.value.trim() && inputDescricao?.value.trim()) {
                const novoComponente = {
                    nome: inputNome.value.trim(),
                    sigla: inputSigla.value.trim(),
                    descricao: inputDescricao.value.trim()
                };

                if (idDisciplina) {
                    salvarComponenteNoBanco(idDisciplina, novoComponente).then(sucesso => {
                        if (sucesso) {
                            atualizarSidebarComponentes();
                            atualizarListaComponentesModal();

                            inputNome.value = '';
                            inputSigla.value = '';
                            inputDescricao.value = '';
                        }
                    });
                } else {
                    // fallback local
                    const tempId = Date.now().toString();
                    turmasComponentesNota.push({ id: tempId, ...novoComponente });
                    atualizarSidebarComponentes();
                    atualizarListaComponentesModal();

                    inputNome.value = '';
                    inputSigla.value = '';
                    inputDescricao.value = '';
                }
            }
        });

        initModalConfirmacao();
    };

    const atualizarSidebarComponentes = () => {
        const containerSidebar = document.querySelector('.componentes-nota');
        const componentesAntigos = containerSidebar?.querySelectorAll('.info-componentes');
        componentesAntigos?.forEach(el => el.remove());

        if (turmasComponentesNota.length === 0) {
            const div = document.createElement('div');
            div.className = 'info-componentes';
            div.textContent = 'Nenhum componente adicionado';
            div.style.color = '#6c757d';
            div.style.fontStyle = 'italic';
            containerSidebar?.appendChild(div);
        } else {
            turmasComponentesNota.forEach(comp => {
                const div = document.createElement('div');
                div.className = 'info-componentes';
                div.textContent = comp.nome;
                containerSidebar?.appendChild(div);
            });
        }
    };

    const atualizarListaComponentesModal = () => {
        const listaContainer = document.getElementById('componentes_lista');
        if (!listaContainer) return;

        listaContainer.innerHTML = '';

        if (turmasComponentesNota.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'Nenhum componente adicionado ainda.';
            p.style.color = '#6c757d';
            p.style.fontStyle = 'italic';
            p.style.textAlign = 'center';
            p.style.padding = '20px';
            listaContainer.appendChild(p);
        } else {
            turmasComponentesNota.forEach(comp => {
                const div = document.createElement('div');
                div.className = 'info-componentes';
                div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';

                const span = document.createElement('span');
                span.textContent = `${comp.nome} - ${comp.sigla} - ${comp.descricao}`;

                const btnRemover = document.createElement('button');
                btnRemover.className = 'btn secondary';
                btnRemover.style.cssText = 'background: none; color: #dc3545; padding: 5px 10px; border: none; cursor: pointer;';
                btnRemover.textContent = 'X';
                btnRemover.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removerComponente(comp.id);
                });

                div.appendChild(span);
                div.appendChild(btnRemover);
                listaContainer.appendChild(div);
            });
        }
    };

    const removerComponente = (id: string) => {
        const componente = turmasComponentesNota.find(comp => comp.id === id);
        if (!componente) return;

        turmasComponenteParaExcluir = id;

        const nomeElemento = document.getElementById('confirmacao_nome');
        if (nomeElemento) nomeElemento.textContent = componente.nome;

        abrirModalConfirmacao();
    };

    // ========================================
    // MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
    // ========================================

    const initModalConfirmacao = () => {
        const btnCancelar = document.getElementById('btn_cancelar_exclusao');
        const btnConfirmar = document.getElementById('btn_confirmar_exclusao');

        btnCancelar?.addEventListener('click', (e) => {
            e.stopPropagation();
            fecharModalConfirmacao();
            turmasComponenteParaExcluir = null;
        });

        btnConfirmar?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (turmasComponenteParaExcluir) {
                if (idDisciplina) {
                    removerComponenteNoBanco(idDisciplina, turmasComponenteParaExcluir).then(sucesso => {
                        if (sucesso) {
                            turmasComponentesNota = turmasComponentesNota.filter(comp => comp.id !== turmasComponenteParaExcluir);
                            atualizarSidebarComponentes();
                            atualizarListaComponentesModal();
                            fecharModalConfirmacao();
                            turmasComponenteParaExcluir = null;
                        }
                    });
                } else {
                    turmasComponentesNota = turmasComponentesNota.filter(comp => comp.id !== turmasComponenteParaExcluir);
                    atualizarSidebarComponentes();
                    atualizarListaComponentesModal();
                    fecharModalConfirmacao();
                    turmasComponenteParaExcluir = null;
                }
            }
        });
    };

    const abrirModalConfirmacao = () => {
        const modalConfirmacao = document.getElementById('modal_confirmacao');
        if (modalConfirmacao) {
            modalConfirmacao.style.display = 'block';
            // Garante que o modal fique centralizado
            modalConfirmacao.style.position = 'fixed';
            modalConfirmacao.style.top = '50%';
            modalConfirmacao.style.left = '50%';
            modalConfirmacao.style.transform = 'translate(-50%, -50%)';
            modalConfirmacao.style.zIndex = '1001'; // Acima do overlay
        }
    };

    const fecharModalConfirmacao = () => {
        const modalConfirmacao = document.getElementById('modal_confirmacao');
        if (modalConfirmacao) modalConfirmacao.style.display = 'none';
    };

    // ========================================
    // EVENTO GLOBAL - FECHAR AO CLICAR FORA E NO OVERLAY
    // ========================================

    // Fechar ao clicar no overlay
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            // Fecha o modal de criar card se estiver aberto
            if (painelCreateAberto) {
                createCardModal.style.display = 'none';
                modalOverlay.classList.remove('ativo');
                painelCreateAberto = false;
            }

            // Fecha o modal de fórmula se estiver aberto
            const modalFormula = document.getElementById('modal_formula');
            if (modalFormula?.style.display === 'block') {
                modalFormula.style.display = 'none';
                modalOverlay.classList.remove('ativo');
            }

            // Fecha o modal de componentes se estiver aberto
            const modalComponentes = document.getElementById('modal_componentes');
            if (modalComponentes?.style.display === 'block') {
                modalComponentes.style.display = 'none';
                modalOverlay.classList.remove('ativo');
            }

            // Não fecha o modal de confirmação ao clicar fora (por segurança)
        }
    });

    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        if (painelEditAberto &&
            !edicaoCard.contains(target) &&
            !target.closest('.btn-card')) {
            edicaoCard.classList.remove('aberto');
            setTimeout(() => {
                edicaoCard.style.display = 'none';
            }, 300);
            painelEditAberto = false;
            cardAtual = null;
        }
    });

    // ========================================
    // INICIALIZAÇÃO DOS MODAIS DE CONFIG
    // ========================================

    const modalFormula = document.getElementById('modal_formula');
    const modalComponentes = document.getElementById('modal_componentes');
    const modalConfirmacao = document.getElementById('modal_confirmacao');

    if (modalFormula) modalFormula.style.display = 'none';
    if (modalComponentes) modalComponentes.style.display = 'none';
    if (modalConfirmacao) modalConfirmacao.style.display = 'none';

    // Carregar dados iniciais da disciplina
    if (idDisciplina) {
        carregarFormulaDoBanco(idDisciplina).then(formula => {
            turmasFormulaAtual = formula;
            atualizarSidebarFormula();
        });

        carregarComponentesDoBanco(idDisciplina).then(componentes => {
            turmasComponentesNota = componentes;
            atualizarSidebarComponentes();
        });
    }

    initModalFormula();
    initModalComponentes();

    atualizarSidebarFormula();
    atualizarSidebarComponentes();

    carregarTurmas();

});