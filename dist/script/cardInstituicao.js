"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const btnsCard = document.querySelectorAll(".btn-card");
    const edicaoCard = document.querySelector(".edicao-card");
    const coresEdit = document.querySelectorAll('.cor-btn[data-context="edit"]');
    const createCardModal = document.querySelector('.create-card');
    const nomeInst = document.getElementById("nome");
    const abrInst = document.getElementById("abreviacao");
    const btnCriar = document.getElementById("btn-criar");
    const coresCreate = document.querySelectorAll('.cor-btn[data-context="create"]');
    const btnCreateCard = document.querySelectorAll(".btn-create-card");
    const modalOverlay = document.querySelector('.modal-overlay');
    let corSelecionada = 'rgb(10, 61, 183)'; // cor padrão
    const carregarInstituicoes = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/instituicoes', {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Erro ao carregar instituições:', response.status);
                return;
            }
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                // Limpar apenas os cards dinâmicos (opcional)
                const section = document.querySelector("main section");
                result.data.forEach((instituicao) => {
                    // Buscar cor salva no localStorage
                    const corSalva = localStorage.getItem(`cor_instituicao_${instituicao.id_instituicao}`);
                    const cor = corSalva || 'rgb(10, 61, 183)';
                    // Criar card visual com dados do banco
                    criarNovoCard(instituicao.nome, instituicao.abreviacao, cor, instituicao.id_instituicao);
                });
                console.log(`${result.data.length} instituições carregadas`);
            }
        }
        catch (error) {
            console.error('Erro ao carregar instituições:', error);
        }
    };
    const criarNovoCard = (nome, abreviacao, cor, idInstituicao) => {
        const section = document.querySelector("main section");
        const novoCard = document.createElement("div");
        novoCard.classList.add("card");
        novoCard.style.backgroundColor = cor;
        // Adicionar ID ao dataset
        if (idInstituicao) {
            novoCard.dataset.id = idInstituicao.toString();
        }
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
        // Adicionar evento de clique no card para navegar aos cursos
        novoCard.addEventListener('click', (e) => {
            // Não navegar se clicar no botão de edição
            const clickedElement = e.target;
            if (!clickedElement.closest('.btn-card') && idInstituicao) {
                window.location.href = `/cursos?id_instituicao=${idInstituicao}`;
            }
        });
        section?.appendChild(novoCard);
        // Adiciona evento ao botão do novo card
        const btnNovoCard = novoCard.querySelector('.btn-card');
        adicionarEventoEdicao(btnNovoCard, novoCard);
    };
    const criarInstituicaoNoBanco = async (nome, abreviacao, cor) => {
        try {
            const response = await fetch('http://localhost:3000/api/instituicoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ nome, abreviacao, cor })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Instituição criada no banco:', result.data);
                // Salvar cor no localStorage
                const idInstituicao = result.data.id_instituicao;
                localStorage.setItem(`cor_instituicao_${idInstituicao}`, cor);
                // Criar card visual com o ID do banco
                criarNovoCard(nome, abreviacao, cor, idInstituicao);
                return true;
            }
            else {
                alert(result.message || 'Erro ao criar instituição');
                return false;
            }
        }
        catch (error) {
            console.error('Erro ao criar instituição:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
            return false;
        }
    };
    coresCreate.forEach((corBtn) => {
        corBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            corSelecionada = window.getComputedStyle(corBtn).backgroundColor;
            // Feedback visual
            coresCreate.forEach(el => el.style.border = 'none');
            corBtn.style.border = '3px solid #333';
        });
    });
    btnCriar.addEventListener('click', async (e) => {
        e.preventDefault();
        const nome = nomeInst.value.trim();
        const abreviacao = abrInst.value.trim();
        if (!nome) {
            alert("Digite o nome da instituição.");
            return;
        }
        if (!abreviacao) {
            alert("Digite a sigla da instituição.");
            return;
        }
        // Desabilitar botão durante a requisição
        btnCriar.disabled = true;
        const textoOriginal = btnCriar.textContent;
        btnCriar.textContent = 'Criando...';
        // Criar no banco de dados
        const sucesso = await criarInstituicaoNoBanco(nome, abreviacao, corSelecionada);
        // Reabilitar botão
        btnCriar.disabled = false;
        btnCriar.textContent = textoOriginal;
        if (sucesso) {
            // Limpar formulário
            nomeInst.value = '';
            abrInst.value = '';
            corSelecionada = 'rgb(10, 61, 183)';
            coresCreate.forEach(el => el.style.border = 'none');
            // Fechar modal
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });
    let painelCreateAberto = false;
    const adicionarEventoBtnCreate = (btnCreate) => {
        btnCreate.addEventListener('click', (e) => {
            e.stopPropagation();
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
    btnCreateCard.forEach((btnCreate) => {
        adicionarEventoBtnCreate(btnCreate);
    });
    // ==================== EDIT CARD ====================
    let painelEditAberto = false;
    let cardAtual = null;
    if (!edicaoCard) {
        console.error('Painel de edição não encontrado!');
        return;
    }
    const adicionarEventoEdicao = (btn, card) => {
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
        });
    };
    // Adiciona evento nos cards existentes (se houver cards estáticos no HTML)
    btnsCard.forEach((btn) => {
        const card = btn.closest('.card');
        if (card) {
            adicionarEventoEdicao(btn, card);
        }
    });
    coresEdit.forEach((corElement) => {
        corElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!cardAtual)
                return;
            const corSelecionadaEdit = window.getComputedStyle(corElement).backgroundColor;
            // Aplica a cor ao card atual
            cardAtual.style.backgroundColor = corSelecionadaEdit;
            // Feedback visual
            coresEdit.forEach(el => el.style.border = 'none');
            // Salvar cor no localStorage
            const instituicaoId = cardAtual.dataset.id;
            if (instituicaoId) {
                localStorage.setItem(`cor_instituicao_${instituicaoId}`, corSelecionadaEdit);
                console.log(`Cor salva para instituição ${instituicaoId}`);
            }
        });
    });
    document.addEventListener('click', (e) => {
        const target = e.target;
        // Fechar painel de edição
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
        // Fechar modal de criação
        if (painelCreateAberto &&
            !createCardModal.contains(target) &&
            !target.closest('.btn-create-card')) {
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });
    carregarInstituicoes();
});
