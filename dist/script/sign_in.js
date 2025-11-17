"use strict";
// Desenvolvido por Carlos Liberato e Felipe Miranda
// Captura o botão de login e a área de mensagem na tela de login
const signinBtn = document.getElementById("login-btn");
const messageDiv_SIN = document.getElementById("signin-message");
// Ao carregar a página, verifica se já está logado via endpoint do backend
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/auth/verificar-sessao', {
            credentials: 'include',
            cache: 'no-cache'
        });
        const data = await response.json();
        if (data.logado) {
            // Se já estiver logado, redireciona para dashboard
            window.location.replace('/dashboard');
            return;
        }
    }
    catch (error) {
        console.error('Erro ao verificar sessão:', error);
    }
});
// Evento de clique no botão de login
signinBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    // Pega dados dos campos
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // Validação dos campos antes de enviar requisição
    if (!email || !password) {
        messageDiv_SIN.textContent = "Por favor, preencha todos os campos.";
        messageDiv_SIN.style.color = "red";
        messageDiv_SIN.style.fontSize = "12px";
        return;
    }
    // Feedback visual enquanto faz login
    signinBtn.disabled = true;
    messageDiv_SIN.textContent = "Tentando entrar...";
    messageDiv_SIN.style.color = "blue";
    messageDiv_SIN.style.fontSize = "12px";
    try {
        // Envia dados de login para o backend Node.js
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, senha: password }),
        });
        // Exibe retorno da API no DOM
        const message = await response.text();
        messageDiv_SIN.textContent = message;
        messageDiv_SIN.style.color = response.ok ? "green" : "red";
        if (response.ok) {
            // Em caso de sucesso, redireciona para dashboard
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 500);
        }
        else {
            // Se falhar, reabilita botão para nova tentativa
            signinBtn.disabled = false;
        }
    }
    catch (error) {
        // Erro local de rede/backend
        console.error("Erro ao conectar com o servidor:", error);
        messageDiv_SIN.textContent = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
        messageDiv_SIN.style.color = "red";
        messageDiv_SIN.style.fontSize = "12px";
        signinBtn.disabled = false;
    }
});
