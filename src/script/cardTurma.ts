// Desenvolvido por Carlos Liberato (Funções de armazenar, criar, listar e excluir cards)
// Funcionalidades: Criar, editar e excluir turmas; gerenciar fórmulas de média e componentes de nota

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

// Estado global da aplicação para gerenciamento de fórmulas e componentes
let turmasFormulaAtual: FormulaData | null = null;
let turmasComponentesNota: ComponenteNota[] = [];
let turmasComponenteParaExcluir: string | null = null;
let temTurmasExistentes = false;

const API_BASE = 'http://localhost:3000/api';

/**
 * Busca a fórmula de cálculo de média configurada para uma disciplina
 * @param idDisciplina - ID da disciplina no banco de dados
 * @returns Objeto FormulaData ou null se não houver fórmula configurada
 */
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

/**
 * Persiste a fórmula de cálculo de média no banco de dados
 * @param idDisciplina - ID da disciplina
 * @param formula - Objeto contendo tipo e expressão da fórmula
 * @returns true se salvou com sucesso, false caso contrário
 */
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

/**
 * Carrega todos os componentes de nota (ex: P1, P2, trabalhos) de uma disciplina
 * @param idDisciplina - ID da disciplina
 * @returns Array de componentes ou array vazio em caso de erro
 */
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

/**
 * Cria um novo componente de nota no banco de dados
 * @param idDisciplina - ID da disciplina
 * @param componente - Dados do componente (sem ID, que será gerado pelo backend)
 * @returns true se criou com sucesso, false caso contrário
 */
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

        // Atualiza o estado local com o ID retornado pelo backend
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

/**
 * Remove um componente de nota do banco de dados
 * @param idDisciplina - ID da disciplina
 * @param idComponente - ID do componente a ser removido
 * @returns true se removeu com sucesso, false caso contrário
 */
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

// Inicialização quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    // Extrai parâmetros da URL para identificar instituição, curso e disciplina
    const urlParams = new URLSearchParams(window.location.search);
    const idInstituicao = urlParams.get('id_instituicao');
    const idCurso = urlParams.get('id_curso');
    const idDisciplina = urlParams.get('id_disciplina');

    // Validação: redireciona se parâmetros essenciais estiverem ausentes
    if (!idInstituicao || !idCurso || !idDisciplina) {
        alert('Parâmetros da URL incompletos');
        window.location.href = '/dashboard';
        return;
    }

    // Referências aos elementos do DOM
    const btnsCard = document.querySelectorAll<HTMLButtonElement>(".btn-card");
    const edicaoCard = document.querySelector<HTMLDivElement>(".edicao-card");
    const coresEdit = document.querySelectorAll<HTMLButtonElement>('.cor-btn[data-context="edit"]');
    const createCardModal = document.querySelector('.create-card') as HTMLDivElement;
    const nomeInst = document.getElementById("nome") as HTMLInputElement;
    const btnCriar = document.getElementById("btn-criar") as HTMLButtonElement;
    const coresCreate = document.querySelectorAll<HTMLButtonElement>('.cor-btn[data-context="create"]');
    const btnCreateCard = document.querySelectorAll<HTMLButtonElement>(".btn-create-card");
    const modalOverlay = document.querySelector('.modal-overlay') as HTMLDivElement;

    // Estado local da interface
    let corSelecionada = 'rgb(10, 61, 183)';
    let painelCreateAberto = false;
    let painelEditAberto = false;
    let cardAtual: HTMLDivElement | null = null;

    /**
     * Carrega todas as turmas da disciplina atual do banco de dados
     * e cria os cards visuais correspondentes na interface
     */
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
                    // Recupera a cor personalizada salva no localStorage
                    const corSalva = localStorage.getItem(`cor_turma_${turma.id_turma}`);
                    const cor = corSalva || 'rgb(10, 61, 183)';

                    criarNovoCard(turma.nome, cor, turma.id_turma);
                });

                console.log(`${result.data.length} turmas carregadas`);
                verificarTurmasExistentes();
            }
        } catch (erro) {
            console.error('Erro ao carregar turmas:', erro);
        }
    };

    /**
     * Habilita ou desabilita os botões de gerenciar fórmula e componentes
     * baseado na existência de turmas
     * @param tem - true se existem turmas, false caso contrário
     */
    const updateGerenciarButtons = (tem: boolean) => {
        const btnFormula = document.getElementById('manage_formula_btn') as HTMLButtonElement | null;
        const btnComponentes = document.getElementById('add_component_btn') as HTMLButtonElement | null;

        if (!btnFormula || !btnComponentes) return;

        if (!tem) {
            // Desabilita botões quando não há turmas
            btnFormula.classList.add('disabled');
            btnComponentes.classList.add('disabled');
            btnFormula.title = 'Adicione uma turma primeiro';
            btnComponentes.title = 'Adicione uma turma primeiro';
            btnFormula.style.opacity = '0.6';
            btnComponentes.style.opacity = '0.6';
            btnFormula.style.cursor = 'not-allowed';
            btnComponentes.style.cursor = 'not-allowed';
        } else {
            // Habilita botões quando há turmas
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

    /**
     * Verifica se existem turmas cadastradas para a disciplina atual
     * e atualiza o estado dos botões de gerenciamento
     * @returns true se existem turmas, false caso contrário
     */
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

    /**
     * Cria um novo card visual representando uma turma
     * @param nome - Nome da turma
     * @param cor - Cor de fundo do card (RGB)
     * @param id_turma - ID opcional da turma no banco de dados
     */
    const criarNovoCard = (nome: string, cor: string, id_turma?: number) => {
        const section = document.querySelector("main section");

        const novoCard = document.createElement("div") as HTMLDivElement;
        novoCard.classList.add("card");
        novoCard.style.backgroundColor = cor;

        if (id_turma) {
            novoCard.dataset.id = id_turma.toString();
        }

        // Template HTML do card com botão de menu e informações da turma
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

        // Ao clicar no card (exceto no botão de menu), navega para dashboard da turma
        novoCard.addEventListener('click', (e) => {
            const clickedElement = e.target as HTMLElement;
            if (!clickedElement.closest('.btn-card') && id_turma) {
                window.location.href = `/turma_dashboard?id_instituicao=${idInstituicao}
                &id_curso=${idCurso}&id_disciplina=${idDisciplina}&id_turma=${id_turma}`;
            }
        });

        section?.appendChild(novoCard);

        // Adiciona funcionalidade de edição ao botão do card
        const btnNovoCard = novoCard.querySelector('.btn-card') as HTMLButtonElement;
        adicionarEventoEdicao(btnNovoCard, novoCard);
    };

    /**
     * Cria uma nova turma no banco de dados e atualiza a interface
     * @param nome - Nome da turma
     * @param cor - Cor personalizada do card
     * @returns true se criou com sucesso, false caso contrário
     */
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

                const id_turma = result.data.id_turma;
                localStorage.setItem(`cor_turma_${id_turma}`, cor);

                criarNovoCard(nome, cor, id_turma);

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

    // Event listeners para seleção de cor no modal de criação
    coresCreate.forEach((corBtn) => {
        corBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            corSelecionada = window.getComputedStyle(corBtn).backgroundColor;
            coresCreate.forEach(el => el.style.border = 'none');
            corBtn.style.border = '3px solid #333';
        });
    });

    // Handler do botão de criar turma no modal
    btnCriar.addEventListener('click', async (e) => {
        e.preventDefault();

        const nome = nomeInst.value.trim();

        if (!nome) {
            alert("Digite o nome da turma.");
            return;
        }

        // Feedback visual durante a requisição
        btnCriar.disabled = true;
        const textoOriginal = btnCriar.textContent;
        btnCriar.textContent = 'Criando...';

        const sucesso = await criarTurmaNoBanco(nome, corSelecionada);

        btnCriar.disabled = false;
        btnCriar.textContent = textoOriginal;

        if (sucesso) {
            // Limpa o formulário e fecha o modal
            nomeInst.value = '';
            corSelecionada = 'rgb(10, 61, 183)';
            coresCreate.forEach(el => el.style.border = 'none');

            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });

    /**
     * Adiciona evento de clique aos botões de criar turma
     * @param btnCreate - Botão que abre o modal de criação
     */
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

    // Botão de fechar o modal de criar turma
    const btnFecharCriar = document.getElementById('btn-fechar-criar');
    btnFecharCriar?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        createCardModal.style.display = 'none';
        modalOverlay.classList.remove('ativo');
        painelCreateAberto = false;
    });

    if (!edicaoCard) {
        console.error('Painel de edição não encontrado!');
        return;
    }

    /**
     * Adiciona funcionalidade de edição ao botão de menu de um card
     * Posiciona o painel de edição adjacente ao card clicado
     * @param btn - Botão de menu do card
     * @param card - Card da turma
     */
    const adicionarEventoEdicao = (btn: HTMLButtonElement, card: HTMLDivElement) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Toggle: fecha se já estiver aberto no mesmo card
            if (painelEditAberto && cardAtual === card) {
                edicaoCard.classList.remove('aberto');
                painelEditAberto = false;
                cardAtual = null;
                return;
            }

            // Calcula posicionamento do painel baseado no espaço disponível
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

            // Atualiza o ID no botão de deletar para referenciar a turma correta
            const btnDelete = edicaoCard.querySelector('.btn-open-delete') as HTMLButtonElement | null;
            if (btnDelete) {
                if (card.dataset.id) btnDelete.setAttribute('data-id', card.dataset.id);
                else btnDelete.removeAttribute('data-id');
                btnDelete.disabled = false;
            }
        });
    };

    // Adiciona eventos de edição aos cards existentes
    btnsCard.forEach((btn) => {
        const card = btn.closest('.card') as HTMLDivElement;
        if (card) {
            adicionarEventoEdicao(btn, card);
        }
    });

    // Event listeners para trocar cor do card no painel de edição
    coresEdit.forEach((corElement) => {
        corElement.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!cardAtual) return;

            const corSelecionada = window.getComputedStyle(corElement).backgroundColor;
            cardAtual.style.backgroundColor = corSelecionada;
            coresEdit.forEach(el => el.style.border = 'none');

            // Persiste a cor no localStorage
            const salvarCor = (cor: string, instituicaoId: string) => {
                localStorage.setItem(`cor_instituicao_${instituicaoId}`, cor);
            };

            const instituicaoId = cardAtual.dataset.id;
            if (instituicaoId) {
                salvarCor(corSelecionada, instituicaoId);
            }
        });
    });

    // Handler do botão de deletar turma
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
                
                // Remove o card com animação de fade out
                const cardParaDeletar = document.querySelector(`.card[data-id="${turmaId}"]`) as HTMLDivElement;
                if (cardParaDeletar) {
                    cardParaDeletar.style.opacity = '0';
                    cardParaDeletar.style.transition = 'opacity 0.3s';
                    setTimeout(() => cardParaDeletar.remove(), 300);
                }
                
                localStorage.removeItem(`cor_turma_${turmaId}`);
                
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

    /**
     * Inicializa o modal de gerenciamento de fórmula de média
     * Permite configurar se a média é aritmética ou ponderada e sua expressão
     */
    const initModalFormula = () => {
        const btnGerenciar = document.getElementById('manage_formula_btn');
        const modalFormula = document.getElementById('modal_formula');
        const btnFecharArray = modalFormula?.querySelectorAll('.btn.secondary');
        const btnFechar = btnFecharArray?.[0];
        const btnCancelar = btnFecharArray?.[1];
        const btnSalvar = document.getElementById('save_formula_btn');
        const selectTipo = document.getElementById('formula_type') as HTMLSelectElement;
        const inputFormula = document.querySelector('#formula_display input[type="text"]') as HTMLInputElement;

        // Abre o modal e carrega dados existentes
        btnGerenciar?.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!temTurmasExistentes) {
                alert('Você precisa criar pelo menos uma turma antes de gerenciar a fórmula.');
                return;
            }

            if (createCardModal) createCardModal.style.display = 'none';
            modalOverlay?.classList.add('ativo');
            if (modalFormula) modalFormula.style.display = 'block';

            // Preenche campos com dados existentes
            if (turmasFormulaAtual) {
                if (selectTipo) selectTipo.value = turmasFormulaAtual.tipo;
                if (inputFormula) inputFormula.value = turmasFormulaAtual.formula;
            } else {
                if (selectTipo) selectTipo.value = 'selecione';
                if (inputFormula) inputFormula.value = '';
            }
        });

        // Função auxiliar para fechar o modal de fórmula
        const fecharModalFormula = () => {
            if (modalFormula) modalFormula.style.display = 'none';

            const modalComponentes = document.getElementById('modal_componentes');
            const modalConfirmacao = document.getElementById('modal_confirmacao');

            // Mantém overlay se outros modais estiverem abertos
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

        // Salva a fórmula no backend e atualiza a interface
        btnSalvar?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectTipo && inputFormula && inputFormula.value.trim()) {
                const novaFormula: FormulaData = {
                    tipo: selectTipo.value,
                    formula: inputFormula.value.trim()
                };

                if (idDisciplina) {
                    salvarFormulaNoBanco(idDisciplina, novaFormula).then(sucesso => {
                        if (sucesso) {
                            turmasFormulaAtual = novaFormula;
                            atualizarSidebarFormula();
                            fecharModalFormula();
                        }
                    });
                } else {
                    turmasFormulaAtual = novaFormula;
                    atualizarSidebarFormula();
                    fecharModalFormula();
                }
            }
        });
    };

    /**
     * Atualiza a exibição da fórmula na sidebar lateral
     * Mostra o tipo de média e a expressão configurada
     */
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

    /**
     * Inicializa o modal de gerenciamento de componentes de nota
     * Permite adicionar componentes como P1, P2, trabalhos, etc.
     */
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

        // Handler para adicionar novo componente de nota
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

                            // Limpa o formulário
                            inputNome.value = '';
                            inputSigla.value = '';
                            inputDescricao.value = '';
                        }
                    });
                } else {
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

    /**
     * Atualiza a lista de componentes exibida na sidebar
     * Mostra todos os componentes cadastrados ou mensagem de lista vazia
     */
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

    /**
     * Atualiza a lista completa de componentes dentro do modal
     * Inclui botões de remoção para cada componente
     */
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

    /**
     * Prepara a remoção de um componente
     * Abre modal de confirmação para evitar exclusões acidentais
     * @param id - ID do componente a ser removido
     */
    const removerComponente = (id: string) => {
        const componente = turmasComponentesNota.find(comp => comp.id === id);
        if (!componente) return;

        turmasComponenteParaExcluir = id;

        const nomeElemento = document.getElementById('confirmacao_nome');
        if (nomeElemento) nomeElemento.textContent = componente.nome;

        abrirModalConfirmacao();
    };

    /**
     * Inicializa o modal de confirmação de exclusão de componente
     * Garante que o usuário confirme antes de remover um componente
     */
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

    /**
     * Abre o modal de confirmação de exclusão
     * Posiciona centralmente e com z-index apropriado
     */
    const abrirModalConfirmacao = () => {
        const modalConfirmacao = document.getElementById('modal_confirmacao');
        if (modalConfirmacao) {
            modalConfirmacao.style.display = 'block';
            modalConfirmacao.style.position = 'fixed';
            modalConfirmacao.style.top = '50%';
            modalConfirmacao.style.left = '50%';
            modalConfirmacao.style.transform = 'translate(-50%, -50%)';
            modalConfirmacao.style.zIndex = '1001';
        }
    };

    /**
     * Fecha o modal de confirmação de exclusão
     */
    const fecharModalConfirmacao = () => {
        const modalConfirmacao = document.getElementById('modal_confirmacao');
        if (modalConfirmacao) modalConfirmacao.style.display = 'none';
    };

    // Event listener para fechar modais ao clicar no overlay
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            if (painelCreateAberto) {
                createCardModal.style.display = 'none';
                modalOverlay.classList.remove('ativo');
                painelCreateAberto = false;
            }

            const modalFormula = document.getElementById('modal_formula');
            if (modalFormula?.style.display === 'block') {
                modalFormula.style.display = 'none';
                modalOverlay.classList.remove('ativo');
            }

            const modalComponentes = document.getElementById('modal_componentes');
            if (modalComponentes?.style.display === 'block') {
                modalComponentes.style.display = 'none';
                modalOverlay.classList.remove('ativo');
            }
        }
    });

    // Event listener global para fechar painel de edição ao clicar fora
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

    // Garante que os modais estejam ocultos ao iniciar
    const modalFormula = document.getElementById('modal_formula');
    const modalComponentes = document.getElementById('modal_componentes');
    const modalConfirmacao = document.getElementById('modal_confirmacao');

    if (modalFormula) modalFormula.style.display = 'none';
    if (modalComponentes) modalComponentes.style.display = 'none';
    if (modalConfirmacao) modalConfirmacao.style.display = 'none';

    // Carrega dados iniciais da disciplina do backend
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

    // Inicializa todos os sistemas de modais
    initModalFormula();
    initModalComponentes();

    // Atualiza interface inicial
    atualizarSidebarFormula();
    atualizarSidebarComponentes();

    // Carrega turmas existentes do banco de dados
    carregarTurmas();

});
