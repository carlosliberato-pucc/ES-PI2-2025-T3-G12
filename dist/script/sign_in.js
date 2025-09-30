"use strict";
// src/script/sign_in.ts
// NOTA: Não podemos pegar o loginForm, pois ele não existe no seu HTML atual.
// Apenas pegamos o botão e a DIV de mensagem.
const signinBtn = document.getElementById("login-btn");
const messageDiv_SIN = document.getElementById("signin-message"); // Este ID DEVE EXISTIR no HTML!
// Adiciona um evento de CLICK ao botão.
signinBtn.addEventListener("click", async (e) => {
    // Usamos e.preventDefault() para evitar que o navegador tente submeter algo,
    // embora seja menos crítico sem a tag <form>.
    e.preventDefault();
    // Pega os valores dos campos de email e senha
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // 1. Validação de campos vazios
    if (!email || !password) {
        messageDiv_SIN.textContent = "Por favor, preencha todos os campos.";
        messageDiv_SIN.style.color = "red";
        return;
    }
    // Feedback visual
    signinBtn.disabled = true;
    messageDiv_SIN.textContent = "Tentando entrar...";
    messageDiv_SIN.style.color = "blue";
    try {
        // 2. Faz a requisição POST para a API de login
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // ENVIO CORRETO: 'senha' (igual ao Controller)
            body: JSON.stringify({ email, senha: password }),
        });
        // Pega a resposta do servidor
        const message = await response.text();
        messageDiv_SIN.textContent = message;
        messageDiv_SIN.style.color = response.ok ? "green" : "red";
        if (response.ok) {
            // Se o login for bem-sucedido, redireciona
            setTimeout(() => {
                window.location.href = "/dashboard.html";
            }, 1500);
        }
        else {
            // Se falhar, reabilita o botão
            signinBtn.disabled = false;
        }
    }
    catch (error) {
        // 3. Trata erros de conexão
        console.error("Erro ao conectar com o servidor:", error);
        messageDiv_SIN.textContent = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
        messageDiv_SIN.style.color = "red";
        // Reabilita o botão em caso de erro
        signinBtn.disabled = false;
    }
});
