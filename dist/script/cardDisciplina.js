"use strict";
//Desenvolvido por Carlos Liberato
// Quando todo o DOM estiver pronto, executa esta função principal
// Inicializa variáveis importantes do contexto da página, como IDs vindos da URL
// Faz verificações, manipula cards de disciplinas e inicializa eventos
document.addEventListener('DOMContentLoaded', () => {
    // Pega parâmetros da URL para saber a instituição e o curso
    const urlParams = new URLSearchParams(window.location.search);
    const idInstituicao = urlParams.get('id_instituicao');
    const idCurso = urlParams.get('id_curso');
    // Se não encontrou os IDs essenciais, avisa e redireciona
    if (!idInstituicao || !idCurso) {
        alert('ID da instituição ou ID curso não encontrado');
        window.location.href = '/dashboard';
        return;
    }
    // Seleciona todos os botões internos dos cards de edição
    const btnsCard = document.querySelectorAll(".btn-card");
    // Seleciona o painel de edição (edit card lateral)
    const edicaoCard = document.querySelector(".edicao-card");
    // Seleciona botões de cor usados no painel de edição
    const coresEdit = document.querySelectorAll('.cor-btn[data-context="edit"]');
    // Seleciona modal de criar card/discipina e todos campos do formulário
    const createCardModal = document.querySelector('.create-card');
    const nomeInst = document.getElementById("nome");
    const siglaDisc = document.getElementById("sigla");
    const periodoSelect = document.getElementById("periodo");
    const codigoDisc = document.getElementById("codigo");
    const btnCriar = document.getElementById("btn-criar");
    // Botões coloridos do contexto criação
    const coresCreate = document.querySelectorAll('.cor-btn[data-context="create"]');
    // Botão que abre modal de criar card
    const btnCreateCard = document.querySelectorAll(".btn-create-card");
    // Camada que cobre a tela por trás do modal
    const modalOverlay = document.querySelector('.modal-overlay');
    // Cor padrão de nova disciplina
    let corSelecionada = 'rgb(10, 61, 183)';
    // Função assíncrona que busca todas disciplinas do backend e monta cards
    const carregarDisciplinas = async () => {
        try {
            // Requisição GET para API de disciplinas filtrando por instituição e curso
            const response = await fetch(`http://localhost:3000/api/disciplinas?id_instituicao=${idInstituicao}&id_curso=${idCurso}`, {
                method: 'GET',
                credentials: 'include' // inclui cookies de sessão
            });
            // Se erro, loga no console e encerra
            if (!response.ok) {
                console.error('Erro ao carregar disciplinas:', response.status);
                return;
            }
            // Converte resposta para JSON
            const result = await response.json();
            // Se resposta veio ok e é uma lista, cria um card para cada disciplina
            if (result.success && Array.isArray(result.data)) {
                result.data.forEach((disciplina) => {
                    // Busca cor personalizada salva ou usa cor padrão
                    const corSalva = localStorage.getItem(`cor_disciplina_${disciplina.id_disciplina}`);
                    const cor = corSalva || 'rgb(10, 61, 183)';
                    // Chama função que realmente monta o card na interface
                    criarNovoCard(disciplina.nome, disciplina.sigla || 'Não informado', disciplina.periodo, disciplina.codigo, cor, disciplina.id_disciplina);
                });
                // Loga quantidade de disciplinas carregadas
                console.log(`${result.data.length} disciplinas carregados`);
            }
        }
        catch (erro) {
            // Se houver qualquer erro, mostra mensagem no console
            console.error('Erro ao carregar disciplinas: ', erro);
        }
    };
    // Função que monta/verbaliza um novo card de disciplina na tela
    const criarNovoCard = (nome, sigla, periodo, codigo, cor, id_disciplina) => {
        // Seleciona a SEÇÃO onde ficam os cards
        const section = document.querySelector("main section");
        // Cria um novo elemento DIV para representar o card
        const novoCard = document.createElement("div");
        novoCard.classList.add("card");
        novoCard.style.backgroundColor = cor;
        // Se recebeu id_disciplina, armazena como atributo data-id no card
        if (id_disciplina) {
            novoCard.dataset.id = id_disciplina.toString();
        }
        // Define o conteúdo HTML do card
        novoCard.innerHTML = `
                    <button class="btn-card">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640">
                            <path fill="#ffffff"
                                d="M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z" />
                        </svg>
                    </button>
                    <div class="descricao">
                        <h1>${codigo} - ${nome}</h1>
                        <h2>${sigla} - ${periodo}</h2>
                    </div>                
        `;
        // Se clicou NO CARD (não no menu de edição), vai para a listagem de turmas daquela disciplina
        novoCard.addEventListener('click', (e) => {
            const clickedElement = e.target;
            if (!clickedElement.closest('.btn-card') && id_disciplina) {
                window.location.href = `/turmas?id_instituicao=${idInstituicao}&id_curso=${idCurso}&id_disciplina=${id_disciplina}`;
            }
        });
        // Adiciona o card como último filho da seção
        section?.appendChild(novoCard);
        // Pega botão interno do card e associa evento de abrir menu de edição
        const btnNovoCard = novoCard.querySelector('.btn-card');
        adicionarEventoEdicao(btnNovoCard, novoCard);
    };
    // Função assíncrona para criar disciplina no banco de dados via POST
    const criarDisciplinaNoBanco = async (nome, sigla, cor, periodo, codigo) => {
        try {
            // Requisita ao backend a criação da disciplina
            const response = await fetch(`http://localhost:3000/api/disciplinas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id_instituicao: idInstituicao, id_curso: idCurso, nome, sigla, codigo, periodo })
            });
            // Recebe JSON da resposta
            const result = await response.json();
            // Se deu certo, salva cor no localStorage e cria card na interface
            if (result.success) {
                console.log('Curso criado no banco:', result.data);
                const id_disciplina = result.data.id_disciplina;
                localStorage.setItem(`cor_disciplina_${id_disciplina}`, cor);
                criarNovoCard(nome, sigla, periodo, codigo, cor, id_disciplina);
                return true;
            }
            else {
                alert(result.message || 'Erro ao criar curso');
                return false;
            }
        }
        catch (error) {
            console.error('Erro ao criar disciplina:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
            return false;
        }
    };
    // Associa eventos de seleção de cor (contexto criar disciplina)
    coresCreate.forEach((corBtn) => {
        corBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Salva cor escolhida
            corSelecionada = window.getComputedStyle(corBtn).backgroundColor;
            // Remove borda de todos botões
            coresCreate.forEach(el => el.style.border = 'none');
            // Destaca a cor selecionada
            corBtn.style.border = '3px solid #333';
        });
    });
    // Evento de clique no botão de criar disciplina
    btnCriar.addEventListener('click', async (e) => {
        e.preventDefault();
        const nome = nomeInst.value.trim();
        const sigla = siglaDisc.value.trim();
        const periodo = periodoSelect.options[periodoSelect.selectedIndex].text;
        const codigo = codigoDisc.value.trim();
        // Validação dos campos
        if (!nome) {
            alert("Digite o nome da instituição.");
            return;
        }
        if (!sigla) {
            alert("Digite a sigla da disciplina.");
            return;
        }
        // Feedback de carregamento
        btnCriar.disabled = true;
        const textoOriginal = btnCriar.textContent;
        btnCriar.textContent = 'Criando...';
        // Cria disciplina de fato
        const sucesso = await criarDisciplinaNoBanco(nome, sigla, corSelecionada, periodo, codigo);
        // Restaura estado do botão
        btnCriar.disabled = false;
        btnCriar.textContent = textoOriginal;
        // Limpa e fecha modal apenas se operação deu certo
        if (sucesso) {
            nomeInst.value = '';
            siglaDisc.value = '';
            corSelecionada = 'rgb(10, 61, 183)';
            coresCreate.forEach(el => el.style.border = 'none');
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });
    // Controla painel de criação de nova disciplina
    let painelCreateAberto = false;
    // Função centraliza adicionar/remover modal de criar disciplina
    const adicionarEventoBtnCreate = (btnCreate) => {
        btnCreate.addEventListener('click', (e) => {
            e.stopPropagation();
            // Alterna painel de criação
            if (painelCreateAberto == false) {
                createCardModal.style.display = 'block';
                modalOverlay.classList.add('ativo');
                painelCreateAberto = true;
            }
            else {
                createCardModal.style.display = 'none';
                modalOverlay.classList.remove('ativo');
                painelCreateAberto = false;
            }
        });
    };
    // Adiciona evento de abrir modal criar disciplina a todos botões do tipo
    btnCreateCard.forEach((btnCreate) => {
        adicionarEventoBtnCreate(btnCreate);
    });
    // EDIÇÃO DE CARD - PAINEL LATERAL
    // Armazena se painel está aberto e o card referente
    let painelEditAberto = false;
    let cardAtual = null;
    // Checagem de existência do painel
    if (!edicaoCard) {
        console.error('Painel de edição não encontrado!');
        return;
    }
    // Função que liga botão de edição ao painel lateral
    const adicionarEventoEdicao = (btn, card) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Se já está aberto para este card, só fecha
            if (painelEditAberto && cardAtual === card) {
                edicaoCard.classList.remove('aberto');
                painelEditAberto = false;
                cardAtual = null;
                return;
            }
            // Calcula posição do painel: prioriza abrir à direita do card
            const rect = card.getBoundingClientRect();
            const espacoDireita = window.innerWidth - (rect.right + 10);
            const larguraPainel = 200;
            if (espacoDireita >= larguraPainel) {
                edicaoCard.style.left = `${rect.right + 10}px`;
                edicaoCard.style.transformOrigin = 'left center';
            }
            else {
                edicaoCard.style.left = `${rect.left - larguraPainel - 10}px`;
                edicaoCard.style.transformOrigin = 'right center';
            }
            edicaoCard.style.top = `${rect.top}px`;
            edicaoCard.style.display = 'block';
            edicaoCard.classList.add('aberto');
            painelEditAberto = true;
            cardAtual = card;
            // Atualiza botão de delete com id correto
            const btnDelete = edicaoCard.querySelector('.btn-open-delete');
            if (btnDelete && card.dataset.id) {
                btnDelete.setAttribute('data-id', card.dataset.id);
                btnDelete.disabled = false;
            }
        });
    };
    // Liga todos os botões de edição já presentes nos cards existentes
    btnsCard.forEach((btn) => {
        const card = btn.closest('.card');
        if (card) {
            adicionarEventoEdicao(btn, card);
        }
    });
    // Permite trocar a cor do card em edição clicando nas opções
    coresEdit.forEach((corElement) => {
        corElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!cardAtual)
                return;
            const corSelecionada = window.getComputedStyle(corElement).backgroundColor;
            // Aplica cor ao card na tela
            cardAtual.style.backgroundColor = corSelecionada;
            // Destaca visualmente qual está selecionada
            coresEdit.forEach(el => el.style.border = 'none');
            // Função que salva cor no localStorage
            const salvarCor = (cor, id_disciplina) => {
                localStorage.setItem(`cor_disciplina_${id_disciplina}`, cor);
            };
            // Só salva se o card tem data-id
            const instituicaoId = cardAtual.dataset.id;
            if (instituicaoId) {
                salvarCor(corSelecionada, instituicaoId);
            }
        });
    });
    // Fecha painel lateral de edição ao clicar fora dele
    document.addEventListener('click', (e) => {
        const target = e.target;
        // Fecha lateral se clicou fora	edicaoCard e não em botão menu
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
        // Fecha modal criação se clicou fora
        if (painelCreateAberto && !createCardModal.contains(target) && !target.closest('.btn-create-card')) {
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });
    // Carrega cards de disciplinas logo ao iniciar página
    carregarDisciplinas();
    // --- Evento para deletar disciplina ---
    const btnDeleteDisciplina = edicaoCard?.querySelector('.btn-open-delete');
    btnDeleteDisciplina?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const disciplinaId = btnDeleteDisciplina.getAttribute('data-id');
        if (!disciplinaId) {
            alert('ID da disciplina não encontrado');
            return;
        }
        const confirmacao = confirm('Tem certeza que deseja deletar esta disciplina?\n\nATENÇÃO: Só é possível excluir disciplinas sem turmas vinculadas.');
        if (!confirmacao)
            return;
        try {
            btnDeleteDisciplina.disabled = true;
            const response = await fetch(`http://localhost:3000/api/disciplinas/${disciplinaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert(data.message);
                // Remove o card visualmente da tela com animação
                const cardParaDeletar = document.querySelector(`.card[data-id="${disciplinaId}"]`);
                if (cardParaDeletar) {
                    cardParaDeletar.style.opacity = '0';
                    cardParaDeletar.style.transition = 'opacity 0.3s';
                    setTimeout(() => cardParaDeletar.remove(), 300);
                }
                // Remove cor personalizada desse card
                localStorage.removeItem(`cor_disciplina_${disciplinaId}`);
                // Fecha painel lateral
                if (edicaoCard) {
                    edicaoCard.classList.remove('aberto');
                    edicaoCard.style.display = 'none';
                }
            }
            else {
                // Se fracassou, mostra mensagem do backend
                alert(data.message || 'Erro ao deletar disciplina');
                btnDeleteDisciplina.disabled = false;
            }
        }
        catch (error) {
            console.error('Erro ao deletar disciplina:', error);
            alert('Erro ao processar a solicitação');
            btnDeleteDisciplina.disabled = false;
        }
    });
});
