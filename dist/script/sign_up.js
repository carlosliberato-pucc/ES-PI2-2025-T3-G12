"use strict";
// src/script/sign_up.ts
// OBSERVAÇÃO: O script agora só pega o botão e a div de mensagem (que deve ser adicionada)
const signupBtn = document.getElementById("signup-btn");
const messageDiv_SUP = document.getElementById("signup-message"); // Este ID precisa existir no HTML!
// Usando 'click' no botão, já que não há <form>
signupBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do botão (que seria tentar submeter o formulário se estivesse em um)
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    // 1. Validação de campos vazios
    if (!name || !email || !phone || !password) {
        messageDiv_SUP.textContent = "Por favor, preencha todos os campos.";
        messageDiv_SUP.style.color = "red";
        return;
    }
    // Feedback visual
    signupBtn.disabled = true;
    messageDiv_SUP.textContent = "Tentando cadastrar...";
    messageDiv_SUP.style.color = "blue";
    try {
        // 2. Faz a requisição POST para a API de registro
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Os nomes das chaves (nome, telefone, senha) correspondem ao authController
            body: JSON.stringify({ nome: name, email, telefone: phone, senha: password }),
        });
        const message = await response.text();
        messageDiv_SUP.textContent = message;
        messageDiv_SUP.style.color = response.ok ? "green" : "red";
        // Se falhar ou se for um sucesso sem redirecionamento, reabilita
        if (!response.ok) {
            signupBtn.disabled = false;
        }
    }
    catch (error) {
        // 3. Trata erros de conexão
        console.error("Erro ao conectar com o servidor:", error);
        messageDiv_SUP.textContent = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
        messageDiv_SUP.style.color = "red";
        signupBtn.disabled = false;
    }
});
