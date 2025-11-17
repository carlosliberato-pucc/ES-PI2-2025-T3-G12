"use strict";
// Desenvolvido por Carlos Liberato (Funções de armazenar, criar, listar e excluir cards)
// Felipe (Funções de armazenar, listar e excluir cards)
document.addEventListener('DOMContentLoaded', () => {
    // Pegar ID da instituição da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idInstituicao = urlParams.get('id_instituicao');
    if (!idInstituicao) {
        alert('ID da instituição não encontrado');
        window.location.href = '/dashboard';
        return;
    }
    const btnsCard = document.querySelectorAll(".btn-card");
    const edicaoCard = document.querySelector(".edicao-card");
    const coresEdit = document.querySelectorAll('.cor-btn[data-context="edit"]');
    const periodoSelect = document.getElementById("periodo");
    const createCardModal = document.querySelector('.create-card');
    const nomeInst = document.getElementById("nome");
    const btnCriar = document.getElementById("btn-criar");
    const coresCreate = document.querySelectorAll('.cor-btn[data-context="create"]');
    const btnCreateCard = document.querySelectorAll(".btn-create-card");
    const modalOverlay = document.querySelector('.modal-overlay');
    let corSelecionada = 'rgb(10, 61, 183)'; // cor padrão
    // carregar cursos
    const carregarCursos = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/cursos?id_instituicao=${idInstituicao}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Erro ao carregar cursos:', response.status);
                return;
            }
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                result.data.forEach((curso) => {
                    // Buscar cor salva no localStorage
                    const corSalva = localStorage.getItem(`cor_curso_${curso.id_curso}`);
                    const cor = corSalva || 'rgb(10, 61, 183)';
                    // Criar card visual com dados do banco
                    criarNovoCard(curso.nome, curso.periodo || 'Não informado', cor, curso.id_curso);
                });
                console.log(`${result.data.length} cursos carregados`);
            }
        }
        catch (error) {
            console.error('Erro ao carregar cursos:', error);
        }
    };
    // criar card
    const criarNovoCard = (nome, periodo, cor, idCurso) => {
        const section = document.querySelector("main section");
        const novoCard = document.createElement("div");
        novoCard.classList.add("card");
        novoCard.style.backgroundColor = cor;
        // Adicionar ID ao dataset
        if (idCurso) {
            novoCard.dataset.id = idCurso.toString();
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
                <h2>${periodo}</h2>
            </div>                
        `;
        // Adicionar evento de clique no card para navegar às disciplinas
        novoCard.addEventListener('click', (e) => {
            const clickedElement = e.target;
            if (!clickedElement.closest('.btn-card') && idCurso) {
                window.location.href = `/disciplinas?id_instituicao=${idInstituicao}&id_curso=${idCurso}`;
            }
        });
        section?.appendChild(novoCard);
        // Adiciona evento ao botão do novo card
        const btnNovoCard = novoCard.querySelector('.btn-card');
        adicionarEventoEdicao(btnNovoCard, novoCard);
    };
    // criar curso no banco
    const criarCursoNoBanco = async (nome, periodo, cor) => {
        try {
            const response = await fetch(`http://localhost:3000/api/cursos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id_instituicao: idInstituicao, nome, periodo })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Curso criado no banco:', result.data);
                // Salvar cor no localStorage
                const idCurso = result.data.id_curso;
                localStorage.setItem(`cor_curso_${idCurso}`, cor);
                // Criar card visual com o ID do banco
                criarNovoCard(nome, periodo, cor, idCurso);
                return true;
            }
            else {
                alert(result.message || 'Erro ao criar curso');
                return false;
            }
        }
        catch (error) {
            console.error('Erro ao criar curso:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
            return false;
        }
    };
    // seleção de cores
    coresCreate.forEach((corBtn) => {
        corBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            corSelecionada = window.getComputedStyle(corBtn).backgroundColor;
            // Feedback visual
            coresCreate.forEach(el => el.style.border = 'none');
            corBtn.style.border = '3px solid #333';
        });
    });
    // botão de criar curso
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
        // Desabilitar botão durante a requisição
        btnCriar.disabled = true;
        const textoOriginal = btnCriar.textContent;
        btnCriar.textContent = 'Criando...';
        // Criar no banco de dados
        const sucesso = await criarCursoNoBanco(nome, periodo, corSelecionada);
        // Reabilitar botão
        btnCriar.disabled = false;
        btnCriar.textContent = textoOriginal;
        if (sucesso) {
            // Limpar formulário
            nomeInst.value = '';
            periodoSelect.value = '';
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
            // Atualiza atributo data-id do botão de excluir no painel compartilhado
            const btnDelete = edicaoCard.querySelector('.btn-open-delete');
            if (btnDelete) {
                if (card.dataset.id)
                    btnDelete.setAttribute('data-id', card.dataset.id);
                else
                    btnDelete.removeAttribute('data-id');
                btnDelete.disabled = false;
            }
        });
    };
    // Adiciona evento nos cards existentes (se houver cards estáticos no HTML)
    btnsCard.forEach((btn) => {
        const card = btn.closest('.card');
        if (card) {
            adicionarEventoEdicao(btn, card);
        }
    });
    // Seleciona a cor ao clicar em uma das opções
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
            const cursoId = cardAtual.dataset.id;
            if (cursoId) {
                localStorage.setItem(`cor_curso_${cursoId}`, corSelecionadaEdit);
                console.log(`💾 Cor salva para curso ${cursoId}`);
            }
        });
    });
    // Fecha o painel ao clicar fora dele
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
    carregarCursos();
    const btnDeleteCurso = edicaoCard?.querySelector('.btn-open-delete');
    btnDeleteCurso?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const cursoId = btnDeleteCurso.getAttribute('data-id');
        if (!cursoId) {
            alert('ID do curso não encontrado');
            return;
        }
        const confirmacao = confirm('Tem certeza que deseja deletar este curso?\n\nATENÇÃO: Só é possível excluir cursos sem disciplinas vinculadas.');
        if (!confirmacao)
            return;
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
                // Remove o card da tela com animação
                const cardParaDeletar = document.querySelector(`.card[data-id="${cursoId}"]`);
                if (cardParaDeletar) {
                    cardParaDeletar.style.opacity = '0';
                    cardParaDeletar.style.transition = 'opacity 0.3s';
                    setTimeout(() => cardParaDeletar.remove(), 300);
                }
                // Remove cor do localStorage
                localStorage.removeItem(`cor_curso_${cursoId}`);
                // Fecha o painel de edição
                if (edicaoCard) {
                    edicaoCard.classList.remove('aberto');
                    edicaoCard.style.display = 'none';
                }
            }
            else {
                // Mensagem de erro do servidor (incluindo validação de hierarquia)
                alert(data.message || 'Erro ao deletar curso');
                btnDeleteCurso.disabled = false;
            }
        }
        catch (error) {
            console.error('Erro ao deletar curso:', error);
            alert('Erro ao processar a solicitação');
            btnDeleteCurso.disabled = false;
        }
    });
});
