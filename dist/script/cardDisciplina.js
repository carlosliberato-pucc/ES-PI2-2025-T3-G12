"use strict";
document.addEventListener('DOMContentLoaded', () => {
    // Lê IDs da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idInstituicao = urlParams.get('id_instituicao');
    const idCurso = urlParams.get('id_curso');
    if (!idInstituicao || !idCurso) {
        alert('ID da instituição ou ID curso não encontrado');
        window.location.href = '/dashboard';
        return;
    }
    // Seletores principais
    const btnsCard = document.querySelectorAll(".btn-card");
    const edicaoCard = document.querySelector(".edicao-card");
    const coresEdit = document.querySelectorAll('.cor-btn[data-context="edit"]');
    const createCardModal = document.querySelector('.create-card');
    const nomeInst = document.getElementById("nome");
    const siglaDisc = document.getElementById("sigla");
    const periodoSelect = document.getElementById("periodo");
    const codigoDisc = document.getElementById("codigo");
    const btnCriar = document.getElementById("btn-criar");
    const coresCreate = document.querySelectorAll('.cor-btn[data-context="create"]');
    const btnCreateCard = document.querySelectorAll(".btn-create-card");
    const modalOverlay = document.querySelector('.modal-overlay');
    let corSelecionada = 'rgb(10, 61, 183)';
    // Busca disciplinas do curso e gera cards
    const carregarDisciplinas = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/disciplinas?id_instituicao=${idInstituicao}&id_curso=${idCurso}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Erro ao carregar disciplinas:', response.status);
                return;
            }
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                result.data.forEach((disciplina) => {
                    const corSalva = localStorage.getItem(`cor_disciplina_${disciplina.id_disciplina}`);
                    const cor = corSalva || 'rgb(10, 61, 183)';
                    criarNovoCard(disciplina.nome, disciplina.sigla || 'Não informado', disciplina.periodo, disciplina.codigo, cor, disciplina.id_disciplina);
                });
                console.log(`${result.data.length} disciplinas carregados`);
            }
        }
        catch (erro) {
            console.error('Erro ao carregar disciplinas: ', erro);
        }
    };
    // Gera o card visual de disciplina
    const criarNovoCard = (nome, sigla, periodo, codigo, cor, id_disciplina) => {
        const section = document.querySelector("main section");
        const novoCard = document.createElement("div");
        novoCard.classList.add("card");
        novoCard.style.backgroundColor = cor;
        if (id_disciplina) {
            novoCard.dataset.id = id_disciplina.toString();
        }
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
        novoCard.addEventListener('click', (e) => {
            const clickedElement = e.target;
            if (!clickedElement.closest('.btn-card') && id_disciplina) {
                window.location.href = `/turmas?id_instituicao=${idInstituicao}&id_curso=${idCurso}&id_disciplina=${id_disciplina}`;
            }
        });
        section?.appendChild(novoCard);
        const btnNovoCard = novoCard.querySelector('.btn-card');
        adicionarEventoEdicao(btnNovoCard, novoCard);
    };
    // Criação de disciplina no banco e exibição
    const criarDisciplinaNoBanco = async (nome, sigla, cor, periodo, codigo) => {
        try {
            const response = await fetch(`http://localhost:3000/api/disciplinas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id_instituicao: idInstituicao, id_curso: idCurso, nome, sigla, codigo, periodo })
            });
            const result = await response.json();
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
    // Escolha de cor na criação
    coresCreate.forEach((corBtn) => {
        corBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            corSelecionada = window.getComputedStyle(corBtn).backgroundColor;
            coresCreate.forEach(el => el.style.border = 'none');
            corBtn.style.border = '3px solid #333';
        });
    });
    // Botão para criar disciplina
    btnCriar.addEventListener('click', async (e) => {
        e.preventDefault();
        const nome = nomeInst.value.trim();
        const sigla = siglaDisc.value.trim();
        const periodo = periodoSelect.options[periodoSelect.selectedIndex].text;
        const codigo = codigoDisc.value.trim();
        if (!nome) {
            alert("Digite o nome da instituição.");
            return;
        }
        if (!sigla) {
            alert("Digite a sigla da disciplina.");
            return;
        }
        btnCriar.disabled = true;
        const textoOriginal = btnCriar.textContent;
        btnCriar.textContent = 'Criando...';
        const sucesso = await criarDisciplinaNoBanco(nome, sigla, corSelecionada, periodo, codigo);
        btnCriar.disabled = false;
        btnCriar.textContent = textoOriginal;
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
    // Painel de edição de cor dos cards
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
            const btnDelete = edicaoCard.querySelector('.btn-open-delete');
            if (btnDelete && card.dataset.id) {
                btnDelete.setAttribute('data-id', card.dataset.id);
                btnDelete.disabled = false;
            }
        });
    };
    // Adiciona evento nos cards existentes
    btnsCard.forEach((btn) => {
        const card = btn.closest('.card');
        if (card) {
            adicionarEventoEdicao(btn, card);
        }
    });
    // Escolha de cor na edição
    coresEdit.forEach((corElement) => {
        corElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!cardAtual)
                return;
            const corSelecionada = window.getComputedStyle(corElement).backgroundColor;
            cardAtual.style.backgroundColor = corSelecionada;
            coresEdit.forEach(el => el.style.border = 'none');
            const salvarCor = (cor, id_disciplina) => {
                localStorage.setItem(`cor_disciplina_${id_disciplina}`, cor);
            };
            const instituicaoId = cardAtual.dataset.id;
            if (instituicaoId) {
                salvarCor(corSelecionada, instituicaoId);
            }
        });
    });
    // Fecha painéis ao clicar fora
    document.addEventListener('click', (e) => {
        const target = e.target;
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
        if (painelCreateAberto && !createCardModal.contains(target) && !target.closest('.btn-create-card')) {
            createCardModal.style.display = 'none';
            modalOverlay.classList.remove('ativo');
            painelCreateAberto = false;
        }
    });
    // Exibe as disciplinas ao abrir a tela
    carregarDisciplinas();
    // Deleção de disciplina
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
                const cardParaDeletar = document.querySelector(`.card[data-id="${disciplinaId}"]`);
                if (cardParaDeletar) {
                    cardParaDeletar.style.opacity = '0';
                    cardParaDeletar.style.transition = 'opacity 0.3s';
                    setTimeout(() => cardParaDeletar.remove(), 300);
                }
                localStorage.removeItem(`cor_disciplina_${disciplinaId}`);
                if (edicaoCard) {
                    edicaoCard.classList.remove('aberto');
                    edicaoCard.style.display = 'none';
                }
            }
            else {
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
