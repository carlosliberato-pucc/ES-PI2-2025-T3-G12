"use strict";
// Desenvolvido por Carlos Liberato
// Captura o botão de login pelo ID "login-btn"
const signinBtn = document.getElementById("login-btn");
// Captura o elemento DIV onde as mensagens de status (sucesso/erro) serão exibidas.
const messageDiv_SIN = document.getElementById("signin-message");
document.addEventListener('DOMContentLoaded', async () => {
    // Verifica se já está logado
    try {
        const response = await fetch('http://localhost:3000/auth/verificar-sessao', {
            credentials: 'include',
            cache: 'no-cache'
        });
        const data = await response.json();
        if (data.logado) {
            // Já está logado! Redireciona para o dashboard
            console.log('✅ Usuário já está logado, redirecionando...');
            window.location.replace('/dashboard.html');
            return; // Para a execução do resto do código
        }
    }
    catch (error) {
        console.error('Erro ao verificar sessão:', error);
    }
});
// Adiciona um "ouvinte" para o evento de clique no botão de login.
signinBtn.addEventListener("click", async (e) => {
    // Impede que o botão execute qualquer ação padrão do navegador (como recarregar a página).
    e.preventDefault();
    // Pega os valores digitados nos campos de e-mail e senha.
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // Verifica se ambos os campos estão preenchidos ANTES de enviar ao servidor.
    if (!email || !password) {
        messageDiv_SIN.textContent = "Por favor, preencha todos os campos.";
        messageDiv_SIN.style.color = "red";
        messageDiv_SIN.style.fontSize = "12px";
        return; // Sai da função, não prossegue.
    }
    //Feedback Visual
    signinBtn.disabled = true; // Desabilita o botão para evitar cliques duplicados.
    messageDiv_SIN.textContent = "Tentando entrar...";
    messageDiv_SIN.style.color = "blue"; // Alerta visual que está em andamento.
    messageDiv_SIN.style.fontSize = "12px";
    try {
        // Envia uma requisição POST para o endpoint de login do seu servidor Node.js.
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            // Envia e-mail e a senha (correta no backend: 'senha') em formato JSON.
            body: JSON.stringify({ email, senha: password }),
        });
        // Obtém a mensagem de sucesso ou erro enviada pelo servidor.
        const message = await response.text();
        messageDiv_SIN.textContent = message;
        // Se o status da resposta for 200 (ok), a mensagem fica verde; caso contrário (401, 500), fica vermelha.
        messageDiv_SIN.style.color = response.ok ? "green" : "red";
        if (response.ok) {
            // Se o login for bem-sucedido, redireciona para o dashboard após 1.5 segundos.
            setTimeout(() => {
                window.location.href = "/dashboard.html";
            }, 500);
        }
        else {
            // Se houver falha (401, 500), reabilita o botão para permitir nova tentativa.
            signinBtn.disabled = false;
        }
    }
    catch (error) {
        // Trata erros que ocorrem antes mesmo de o servidor responder (ex: servidor offline).
        console.error("Erro ao conectar com o servidor:", error);
        messageDiv_SIN.textContent = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
        messageDiv_SIN.style.color = "red";
        messageDiv_SIN.style.fontSize = "12px";
        signinBtn.disabled = false; // Reabilita o botão.
    }
});
