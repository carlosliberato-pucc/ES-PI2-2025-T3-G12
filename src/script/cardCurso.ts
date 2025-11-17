// Desenvolvido por Carlos Liberato

// Quando o DOM está carregado, inicia toda lógica da página
// Prepara para manipular e exibir os cards de cursos

document.addEventListener('DOMContentLoaded', () => {
    // Busca ID da instituição na URL para filtrar cursos desse local
    const urlParams = new URLSearchParams(window.location.search);
    const idInstituicao = urlParams.get('id_instituicao');

    // Se não encontrou a instituição, avisa e retorna para a dashboard
    if (!idInstituicao) {
        alert('ID da instituição não encontrado');
        window.location.href = '/dashboard';
        return;
    }

    // Seleciona botões dos cards existentes (caso haja no HTML)
    const btnsCard = document.querySelectorAll<HTMLButtonElement>(".btn-card");
    // Painel lateral de edição de cor/exclusão
    const edicaoCard = document.querySelector<HTMLDivElement>(".edicao-card");
    // Botões de cor para edição no painel lateral
    const coresEdit = document.querySelectorAll<HTMLButtonElement>('.cor-btn[data-context="edit"]');
    // Select de período no formulário de criação
    const periodoSelect = document.getElementById("periodo") as HTMLSelectElement;
    // Modal de criação de novo card de curso
    const createCardModal = document.querySelector('.create-card') as HTMLDivElement;
    // Input do nome do curso
    const nomeInst = document.getElementById("nome") as HTMLInputElement;
    // Botão de criar curso
    const btnCriar = document.getElementById("btn-criar") as HTMLButtonElement;
    // Botões de cor para criar novo curso
    const coresCreate = document.querySelectorAll<HTMLButtonElement>('.cor-btn[data-context="create"]');
    // Botões que abrem o modal de criar card
    const btnCreateCard = document.querySelectorAll<HTMLButtonElement>(".btn-create-card");
    // Camada escura por trás dos modais
    const modalOverlay = document.querySelector('.modal-overlay') as HTMLDivElement;

    // Cor padrão quando cria curso/novo card
    let corSelecionada = 'rgb(10, 61, 183)';

    // Função para buscar cursos do backend e montar cards na tela
    const carregarCursos = async () => {
        try {
            // Requisição para API de cursos filtrando pela instituição
            const response = await fetch(`http://localhost:3000/api/cursos?id_instituicao=${idInstituicao}`, {
                method: 'GET',
                credentials: 'include'
            });

            // Se deu erro na carregando, só loga e para
            if (!response.ok) {
                console.error('Erro ao carregar cursos:', response.status);
                return;
            }

            // Transforma resposta em JSON
            const result = await response.json();

            // Se resposta é sucesso e tem lista de cursos
            if (result.success && Array.isArray(result.data)) {
                result.data.forEach((curso: any) => {
                    // Busca cor personalizada salva para esse curso ou define padrão
                    const corSalva = localStorage.getItem(`cor_curso_${curso.id_curso}`);
                    const cor = corSalva || 'rgb(10, 61, 183)';

                    // Cria card visual para cada curso recuperado do backend
                    criarNovoCard(
                        curso.nome,
                        curso.periodo || 'Não informado',
                        cor,
                        curso.id_curso
                    );
                });
                // Loga a quantidade carregada
                console.log(`${result.data.length} cursos carregados`);
            }
        } catch (error) {
            // Registra qualquer erro
            console.error('Erro ao carregar cursos:', error);
        }
    };

    // Função para criar card de curso visualmente e inserir na tela
    const criarNovoCard = (nome: string, periodo: string, cor: string, idCurso?: number) => {
        const section = document.querySelector("main section");

        // Cria elemento div para o card
        const novoCard = document.createElement("div") as HTMLDivElement;
        novoCard.classList.add("card");
        novoCard.style.backgroundColor = cor;

        // Adiciona id do curso como data-attribute para referência
        if (idCurso) {
            novoCard.dataset.id = idCurso.toString();
        }

        // Define HTML interno do card incluindo botão, nome e período
        novoCard.innerHTML = `
            <button class="btn-card">
                <svg xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640">
                    <path fill="#ffffff"
                        d="M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z" />
                </svg>
            </button>
            <div class="descricao" style="cursor:pointer">
                <h1>${nome}</h1>
                <h2>${periodo}</h2>
            </div>                
        `;

        // Se clicou no card (fora do botão), navega para disciplinas desse curso
        novoCard.addEventListener('click', (e) => {
            const clickedElement = e.target as HTMLElement;
            if (!clickedElement.closest('.btn-card') && idCurso) {
                window.location.href = `/disciplinas?id_instituicao=${idInstituicao}&id_curso=${idCurso}`;
            }
        });

        // Insere card na seção principal
        section?.appendChild(novoCard);

        // Liga botão interno à função de abrir painel de edição
        const btnNovoCard = novoCard.querySelector('.btn-card') as HTMLButtonElement;
        adicionarEventoEdicao(btnNovoCard, novoCard);
    };

    // Função para criar curso novo no banco e adicionar ao visual se sucesso
    const criarCursoNoBanco = async (nome: string, periodo: string, cor: string): Promise<boolean> => {
        try {
            // POST para API de cursos
            const response = await fetch(`http://localhost:3000/api/cursos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id_instituicao: idInstituicao, nome, periodo })
            });

            // Transforma em JSON
            const result = await response.json();

            // Caso sucesso, salva cor, cria card visualmente
            if (result.success) {
                console.log('Curso criado no banco:', result.data);
                const idCurso = result.data.id_curso;
                localStorage.setItem(`cor_curso_${idCurso}`, cor);
                criarNovoCard(nome, periodo, cor, idCurso);
                return true;
            } else {
                alert(result.message || 'Erro ao criar curso');
                return false;
            }
        } catch (error) {
            console.error('Erro ao criar curso:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
            return false;
        }
    };

    // Lógica para manipular os botões de cor no modal de criar curso
    coresCreate.forEach((corBtn) => {
        corBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            corSelecionada = window.getComputedStyle(corBtn).backgroundColor;
            // Visualmente destaca botão selecionado
            coresCreate.forEach(el => el.style.border = 'none');
            corBtn.style.border = '3px solid #333';
        });
    });

    // Evento do botão de criar curso (no modal)
    btnCriar.addEventListener('click', async (e) => {
        e.preventDefault();
        const nome = nomeInst.value.trim();
        const periodo = periodoSelect.options[periodoSelect.selectedIndex].text;
        if (!nome) {
            alert("Digite o nome do curso.");
            return;
        }
        if (!periodo) {
            alert("Selecione um período.");
            return;
        }
        // Mostra feedback visual ao usuário
        btnCriar.disabled = true;
        const textoOriginal = btnCriar.textContent;
        btnCriar.textContent = 'Criando...';
        // Cria curso no banco
        const sucesso = await criarCursoNoBanco(nome, periodo, corSelecionada);
        // Restaura estado do botão
        btnCriar.disabled = false;
        btnCriar.textContent = textoOriginal;
        // Se sucesso, limpa tela/modal
        if (sucesso) {
            nomeInst.value = '';
            periodoSelect.value = '';
            corSelecionada = 'rgb(10, 61, 183)';
            coresCreate.forEach(el => el.style.border = 'none');
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });

    // Flag que controla o modal de criação aberto
    let painelCreateAberto = false;

    // Função centraliza abrir/fechar modal de criar curso
    const adicionarEventoBtnCreate = (btnCreate: HTMLButtonElement) => {
        btnCreate.addEventListener('click', (e) => {
            e.stopPropagation();
            if (painelCreateAberto == false) {
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
    // Liga todos botões do tipo para abrir modal de criar curso
    btnCreateCard.forEach((btnCreate) => {
        adicionarEventoBtnCreate(btnCreate);
    });

    // Controle de painel lateral de edição de cor/deletar
    let painelEditAberto = false;
    let cardAtual: HTMLDivElement | null = null;

    // Checa se painel existe antes de prosseguir
    if (!edicaoCard) {
        console.error('Painel de edição não encontrado!');
        return;
    }

    // Função para associar o botão de menu ao painel lateral de edição
    const adicionarEventoEdicao = (btn: HTMLButtonElement, card: HTMLDivElement) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Se já está aberto pra esse card, fecha
            if (painelEditAberto && cardAtual === card) {
                edicaoCard.classList.remove('aberto');
                painelEditAberto = false;
                cardAtual = null;
                return;
            }
            // Calcula posição do painel: tenta abrir à direita do card, senão à esquerda
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
            // Atualiza botão de excluir do painel com o ID do card
            const btnDelete = edicaoCard.querySelector('.btn-open-delete') as HTMLButtonElement | null;
            if (btnDelete) {
                if (card.dataset.id) btnDelete.setAttribute('data-id', card.dataset.id);
                else btnDelete.removeAttribute('data-id');
                btnDelete.disabled = false;
            }
        });
    };

    // Liga todos botões de menu dos cards já presentes
    btnsCard.forEach((btn) => {
        const card = btn.closest('.card') as HTMLDivElement;
        if (card) {
            adicionarEventoEdicao(btn, card);
        }
    });

    // Permite trocar cor do card via painel lateral
    coresEdit.forEach((corElement) => {
        corElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!cardAtual) return;
            const corSelecionadaEdit = window.getComputedStyle(corElement).backgroundColor;
            // Aplica nova cor
            cardAtual.style.backgroundColor = corSelecionadaEdit;
            coresEdit.forEach(el => el.style.border = 'none');
            // Salva cor personalizada no localStorage
            const cursoId = cardAtual.dataset.id;
            if (cursoId) {
                localStorage.setItem(`cor_curso_${cursoId}`, corSelecionadaEdit);
                console.log(`💾 Cor salva para curso ${cursoId}`);
            }
        });
    });

    // Fecha painel lateral e modal ao clicar fora
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        // Fecha painel lateral se clique não for dentro dele ou em botão menu
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
        // Fecha modal de criação se clicar fora
        if (painelCreateAberto &&
            !createCardModal.contains(target) &&
            !target.closest('.btn-create-card')) {
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });

    // Carrega todos os cards/cursos ao abrir página
    carregarCursos();

    // Botão de excluir cursos no painel lateral
    const btnDeleteCurso = edicaoCard?.querySelector('.btn-open-delete') as HTMLButtonElement;

    // Evento para deletar curso via API
    btnDeleteCurso?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const cursoId = btnDeleteCurso.getAttribute('data-id');
        if (!cursoId) {
            alert('ID do curso não encontrado');
            return;
        }
        const confirmacao = confirm('Tem certeza que deseja deletar este curso?\n\nATENÇÃO: Só é possível excluir cursos sem disciplinas vinculadas.');
        if (!confirmacao) return;
        try {
            btnDeleteCurso.disabled = true;
            const response = await fetch(`http://localhost:3000/api/cursos/${cursoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert(data.message);
                // Remove o card da tela com animação fade
                const cardParaDeletar = document.querySelector(`.card[data-id="${cursoId}"]`) as HTMLDivElement;
                if (cardParaDeletar) {
                    cardParaDeletar.style.opacity = '0';
                    cardParaDeletar.style.transition = 'opacity 0.3s';
                    setTimeout(() => cardParaDeletar.remove(), 300);
                }
                // Remove cor personalizada
                localStorage.removeItem(`cor_curso_${cursoId}`);
                // Fecha painel lateral pós-exclusão
                if (edicaoCard) {
                    edicaoCard.classList.remove('aberto');
                    edicaoCard.style.display = 'none';
                }
            } else {
                alert(data.message || 'Erro ao deletar curso');
                btnDeleteCurso.disabled = false;
            }
        } catch (error) {
            console.error('Erro ao deletar curso:', error);
            alert('Erro ao processar a solicitação');
            btnDeleteCurso.disabled = false;
        }
    });
});
