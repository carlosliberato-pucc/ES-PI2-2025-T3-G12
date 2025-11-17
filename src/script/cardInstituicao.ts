// Aguarda o carregamento completo do DOM antes de executar todo o script

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os botões de menu dos cards existentes (podem ser estáticos)
    const btnsCard = document.querySelectorAll<HTMLButtonElement>(".btn-card");
    // Seleciona painel lateral de edição para mudança de cor/deletar
    const edicaoCard = document.querySelector<HTMLDivElement>(".edicao-card");
    // Seleciona botões de cor do painel de edição
    const coresEdit = document.querySelectorAll<HTMLButtonElement>('.cor-btn[data-context="edit"]');
    // Seleciona o modal de criar instituição
    const createCardModal = document.querySelector('.create-card') as HTMLDivElement;
    // Input do nome da instituição
    const nomeInst = document.getElementById("nome") as HTMLInputElement;
    // Input da abreviação da instituição
    const abrInst = document.getElementById("abreviacao") as HTMLInputElement;
    // Botão de criar instituição
    const btnCriar = document.getElementById("btn-criar") as HTMLButtonElement;
    // Botões de cor do modal de criação
    const coresCreate = document.querySelectorAll<HTMLButtonElement>('.cor-btn[data-context="create"]');
    // Botões que abrem o modal de criar instituição
    const btnCreateCard = document.querySelectorAll<HTMLButtonElement>(".btn-create-card");
    // Camada escura atrás do modal
    const modalOverlay = document.querySelector('.modal-overlay') as HTMLDivElement;

    // Define cor padrão na criação de novas instituições
    let corSelecionada = 'rgb(10, 61, 183)';

    // Função assíncrona que busca instituições no backend e mostra em cards visualmente
    const carregarInstituicoes = async () => {
        try {
            // Faz requisição GET para listar instituições
            const response = await fetch('http://localhost:3000/api/instituicoes', {
                method: 'GET',
                credentials: 'include'
            });

            // Se falha ao buscar, só registra o erro
            if (!response.ok) {
                console.error('Erro ao carregar instituições:', response.status);
                return;
            }

            // Transforma resposta em JSON
            const result = await response.json();

            // Se resposta com sucesso e lista de instituições
            if (result.success && Array.isArray(result.data)) {
                // Pega a seção onde os cards vão ser mostrados
                const section = document.querySelector("main section");
                
                // Para cada instituição recebida, cria um card
                result.data.forEach((instituicao: any) => {
                    // Busca cor salva para o card ou usa padrão
                    const corSalva = localStorage.getItem(`cor_instituicao_${instituicao.id_instituicao}`);
                    const cor = corSalva || 'rgb(10, 61, 183)';

                    // Monta card na interface
                    criarNovoCard(
                        instituicao.nome,
                        instituicao.abreviacao,
                        cor,
                        instituicao.id_instituicao
                    );
                });
                // Mostra no console a quantidade criada
                console.log(`${result.data.length} instituições carregadas`);
            }
        } catch (error) {
            console.error('Erro ao carregar instituições:', error);
        }
    };

    // Função que monta visualmente e insere um card de instituição na tela
    const criarNovoCard = (nome: string, abreviacao: string, cor: string, idInstituicao?: number) => {
        const section = document.querySelector("main section");

        // Cria o elemento div principal do card
        const novoCard = document.createElement("div") as HTMLDivElement;
        novoCard.classList.add("card");
        novoCard.style.backgroundColor = cor;
        
        // Se recebeu idInstituicao, guarda como atributo data no card
        if (idInstituicao) {
            novoCard.dataset.id = idInstituicao.toString();
        }
        // Define o HTML do card, incluindo botão, nome e abreviação
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
                <h2>${abreviacao}</h2>
            </div>                
        `;

        // Clicar no card (fora do menu) navega para a tela de cursos daquela instituição
        novoCard.addEventListener('click', (e) => {
            const clickedElement = e.target as HTMLElement;
            if (!clickedElement.closest('.btn-card') && idInstituicao) {
                window.location.href = `/cursos?id_instituicao=${idInstituicao}`;
            }
        });

        // Insere card na seção principal
        section?.appendChild(novoCard);

        // Liga botão de menu do card ao painel de edição
        const btnNovoCard = novoCard.querySelector('.btn-card') as HTMLButtonElement;
        adicionarEventoEdicao(btnNovoCard, novoCard);
    };

    // Função que cria nova instituição no banco e adiciona visualmente se sucesso
    const criarInstituicaoNoBanco = async (nome: string, abreviacao: string, cor: string): Promise<boolean> => {
        try {
            // Requisição POST para o backend
            const response = await fetch('http://localhost:3000/api/instituicoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ nome, abreviacao, cor })
            });

            // Resposta da API em JSON
            const result = await response.json();

            // Se criou com sucesso, salva cor e cria card
            if (result.success) {
                console.log('Instituição criada no banco:', result.data);
                
                // Salva cor escolhida no localStorage
                const idInstituicao = result.data.id_instituicao;
                localStorage.setItem(`cor_instituicao_${idInstituicao}`, cor);

                // Cria visualmente na tela
                criarNovoCard(nome, abreviacao, cor, idInstituicao);
                return true;
            } else {
                alert(result.message || 'Erro ao criar instituição');
                return false;
            }
        } catch (error) {
            console.error('Erro ao criar instituição:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
            return false;
        }
    };

    // Seleção de cor no modal de criação: aplica cor escolhida e destaque visual
    coresCreate.forEach((corBtn) => {
        corBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            corSelecionada = window.getComputedStyle(corBtn).backgroundColor;
            // Remove borda dos outros
            coresCreate.forEach(el => el.style.border = 'none');
            // Destaca o botão clicado
            corBtn.style.border = '3px solid #333';
        });
    });

    // Evento do botão de criar instituição: envia formulário pro backend
    btnCriar.addEventListener('click', async (e) => {
        e.preventDefault();
        const nome = nomeInst.value.trim();
        const abreviacao = abrInst.value.trim();
        // Validação dos campos obrigatórios
        if (!nome) {
            alert("Digite o nome da instituição.");
            return;
        }
        if (!abreviacao) {
            alert("Digite a sigla da instituição.");
            return;
        }
        // Feedback visual de carregamento
        btnCriar.disabled = true;
        const textoOriginal = btnCriar.textContent;
        btnCriar.textContent = 'Criando...';
        // Envia dados ao backend
        const sucesso = await criarInstituicaoNoBanco(nome, abreviacao, corSelecionada);
        // Restaura estado do botão
        btnCriar.disabled = false;
        btnCriar.textContent = textoOriginal;
        // Se sucesso, limpa modal e estado
        if (sucesso) {
            nomeInst.value = '';
            abrInst.value = '';
            corSelecionada = 'rgb(10, 61, 183)';
            coresCreate.forEach(el => el.style.border = 'none');
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });

    // Controle se painel de criação está aberto
    let painelCreateAberto = false;

    // Função centraliza abrir/fechar modal de criar instituição
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
    // Associa todos botões de abrir modal (caso haja mais de um)
    btnCreateCard.forEach((btnCreate) => {
        adicionarEventoBtnCreate(btnCreate);
    });

    // ===== PAINEL LATERAL DE EDIÇÃO (mudança cor/exclusão) =====
    let painelEditAberto = false;
    let cardAtual: HTMLDivElement | null = null;

    // Se não existe painel lateral, para execução
    if (!edicaoCard) {
        console.error('Painel de edição não encontrado!');
        return;
    }

    // Função liga botão menu do card ao painel lateral de edição
    const adicionarEventoEdicao = (btn: HTMLButtonElement, card: HTMLDivElement) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Se painel já aberto para este card, fecha
            if (painelEditAberto && cardAtual === card) {
                edicaoCard.classList.remove('aberto');
                painelEditAberto = false;
                cardAtual = null;
                return;
            }
            // Calcula posição: tenta abrir à direita, senão esquerda
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
            // Atrbui id ao botão de excluir do painel lateral
            const btnDelete = edicaoCard.querySelector('.btn-open-delete') as HTMLButtonElement | null;
            if (btnDelete) {
                if (card.dataset.id) btnDelete.setAttribute('data-id', card.dataset.id);
                else btnDelete.removeAttribute('data-id');
                btnDelete.disabled = false;
            }
        });
    };

    // Liga painel lateral aos cards já existentes
    btnsCard.forEach((btn) => {
        const card = btn.closest('.card') as HTMLDivElement;
        if (card) {
            adicionarEventoEdicao(btn, card);
        }
    });

    // Permite trocar cor do card pelo painel lateral de edição
    coresEdit.forEach((corElement) => {
        corElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!cardAtual) return;
            const corSelecionadaEdit = window.getComputedStyle(corElement).backgroundColor;
            // Muda cor do card
            cardAtual.style.backgroundColor = corSelecionadaEdit;
            // Destaca cor selecionada
            coresEdit.forEach(el => el.style.border = 'none');
            // Salva cor no localStorage
            const instituicaoId = cardAtual.dataset.id;
            if (instituicaoId) {
                localStorage.setItem(`cor_instituicao_${instituicaoId}`, corSelecionadaEdit);
                console.log(`Cor salva para instituição ${instituicaoId}`);
            }
        });
    });

    // Clique fora do painel lateral/modal fecha eles
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        // Fecha lateral
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
        // Fecha modal de criação
        if (painelCreateAberto && 
            !createCardModal.contains(target) && 
            !target.closest('.btn-create-card')) {
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });

    // Chama função para carregar cards das instituições ao abrir página
    carregarInstituicoes();

    // Seleciona botão de deletar da instituição no painel lateral
    const btnDeleteInst = edicaoCard?.querySelector('.btn-open-delete') as HTMLButtonElement;

    // Evento para deletar instituição via API
    btnDeleteInst?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const instituicaoId = btnDeleteInst.getAttribute('data-id');
        if (!instituicaoId) {
            alert('ID da instituição não encontrado');
            return;
        }
        const confirmacao = confirm('Tem certeza que deseja deletar esta instituição?\n\nATENÇÃO: Só é possível excluir instituições sem cursos vinculados.');
        if (!confirmacao) return;
        try {
            btnDeleteInst.disabled = true;
            const response = await fetch(`http://localhost:3000/api/instituicoes/${instituicaoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert(data.message);
                // Remove o card visualmente com animação fade
                const cardParaDeletar = document.querySelector(`.card[data-id="${instituicaoId}"]`) as HTMLDivElement;
                if (cardParaDeletar) {
                    cardParaDeletar.style.opacity = '0';
                    cardParaDeletar.style.transition = 'opacity 0.3s';
                    setTimeout(() => cardParaDeletar.remove(), 300);
                }
                // Limpa a cor personalizada salva
                localStorage.removeItem(`cor_instituicao_${instituicaoId}`);
                // Fecha painel lateral
                if (edicaoCard) {
                    edicaoCard.classList.remove('aberto');
                    edicaoCard.style.display = 'none';
                }
            } else {
                alert(data.message || 'Erro ao deletar instituição');
                btnDeleteInst.disabled = false;
            }
        } catch (error) {
            console.error('Erro ao deletar instituição:', error);
            alert('Erro ao processar a solicitação');
            btnDeleteInst.disabled = false;
        }
    });
});
