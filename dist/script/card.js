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
    //Create Card
    const criarNovoCard = (nome, abreviacao, cor) => {
        const section = document.querySelector("main section");
        const novoCard = document.createElement("div");
        novoCard.classList.add("card");
        novoCard.style.backgroundColor = cor;
        novoCard.innerHTML = `
                    <button class="btn-card">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                            <path fill="#ffffff"
                                d="M320 208C289.1 208 264 182.9 264 152C264 121.1 289.1 96 320 96C350.9 96 376 121.1 376 152C376 182.9 350.9 208 320 208zM320 432C350.9 432 376 457.1 376 488C376 518.9 350.9 544 320 544C289.1 544 264 518.9 264 488C264 457.1 289.1 432 320 432zM376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320z" />
                        </svg>
                    </button>
                    <div class="descricao">
                        <h1>${nome}</h1>
                        <h2>${abreviacao}</h2>
                    </div>                
        `;
        section?.appendChild(novoCard);
        // Adiciona evento ao botão do novo card
        const btnNovoCard = novoCard.querySelector('.btn-card');
        adicionarEventoEdicao(btnNovoCard, novoCard);
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
    btnCriar.addEventListener('click', (e) => {
        e.preventDefault();
        const nome = nomeInst.value.trim();
        const abreviacao = abrInst.value.trim();
        if (!nome) {
            alert("Digite o nome da instituição.");
            return;
        }
        criarNovoCard(nome, abreviacao, corSelecionada);
        nomeInst.value = '';
        abrInst.value = '';
        corSelecionada = 'rgb(10, 61, 183)';
        coresCreate.forEach(el => el.style.border = 'none');
        createCardModal.style.display = 'none';
        modalOverlay.classList.remove('ativo');
        painelCreateAberto = false;
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
    //Edit Card
    let painelEditAberto = false;
    let cardAtual = null;
    // Verifica se o painel existe
    if (!edicaoCard) {
        console.error('Painel de edição não encontrado!');
        return;
    }
    // Adiciona evento de clique em cada botão dos cards
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
    // Adiciona evento nos cards existentes
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
            const corSelecionada = window.getComputedStyle(corElement).backgroundColor;
            // Aplica a cor ao card atual
            cardAtual.style.backgroundColor = corSelecionada;
            // Feedback visual
            coresEdit.forEach(el => el.style.border = 'none');
            const salvarCor = (cor, instituicaoId) => {
                localStorage.setItem(`cor_instituicao_${instituicaoId}`, cor);
            };
            // Opcional: salvar cor
            const instituicaoId = cardAtual.dataset.id;
            if (instituicaoId) {
                salvarCor(corSelecionada, instituicaoId);
            }
        });
    });
    // Fecha o painel ao clicar fora dele
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
});
