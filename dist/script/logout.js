"use strict";
// Desenvolvido por Felipe Miranda
// Seleciona botão de logout no header/menu
const logoutBtn = document.getElementById("logout-btn");
// Adiciona evento de clique para logout
logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    // Previne múltiplos cliques durante a requisição
    logoutBtn.style.pointerEvents = 'none';
    try {
        // Faz POST para endpoint de logout (encerra sessão no backend)
        const response = await fetch('http://localhost:3000/auth/logout', {
            method: 'POST',
            credentials: 'include' // Necessário para enviar cookie de sessão
        });
        if (response.ok) {
            // Logout bem-sucedido, redireciona para tela inicial/login
            window.location.href = '/';
        }
        else {
            alert('Erro ao fazer logout. Tente novamente.');
            logoutBtn.style.pointerEvents = 'auto';
        }
    }
    catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao conectar com o servidor.');
        logoutBtn.style.pointerEvents = 'auto';
    }
});
