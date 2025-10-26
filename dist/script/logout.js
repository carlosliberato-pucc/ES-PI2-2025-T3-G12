"use strict";
const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    logoutBtn.style.pointerEvents = 'none';
    console.log('Link was clicked!');
    try {
        const response = await fetch('http://localhost:3000/auth/logout', {
            method: 'POST',
            credentials: 'include' // Importante para enviar cookies
        });
        if (response.ok) {
            // Redireciona para página de login
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
