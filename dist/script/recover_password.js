"use strict";
// Desenvolvido por Felipe Miranda
// Script para página de recuperação de senha
// Seletores de elementos principais da tela de recuperação
const form = document.getElementById('recoverForm');
const emailInput = document.getElementById('email');
const recoverBtn = document.getElementById('recover-btn');
const messageDiv1 = document.getElementById('message');
console.log('🚀 Script recover_password.ts carregado!');
// Exibe mensagens ao usuário (sucesso ou erro)
function showMessage1(text, type) {
    messageDiv1.textContent = text;
    messageDiv1.className = `message ${type}`;
    messageDiv1.style.display = 'block';
}
// Esconde a mensagem visual
function hideMessage1() {
    messageDiv1.style.display = 'none';
}
// Manipula submissão do formulário de recuperação
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage1();
    const email = emailInput.value.trim();
    // Validação de e-mail
    if (!email || !email.includes('@')) {
        showMessage1('Por favor, digite um e-mail válido', 'error');
        return;
    }
    // Desabilita botão durante a requisição
    recoverBtn.disabled = true;
    recoverBtn.innerHTML = '<strong>Enviando...</strong>';
    try {
        // Envia solicitação de recuperação para o backend
        const response = await fetch('http://localhost:3000/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (data.success) {
            showMessage1('Se o e-mail existir em nosso sistema, você receberá um link de recuperação. Verifique sua caixa de entrada e spam.', 'success');
            emailInput.value = '';
            // Após 5 segundos, redireciona para o login (opcional)
            setTimeout(() => {
                window.location.href = '/sign_in';
            }, 5000);
        }
        else {
            showMessage1(data.message || 'Erro ao processar solicitação', 'error');
        }
    }
    catch (error) {
        console.error('Erro ao solicitar recuperação:', error);
        showMessage1('Erro ao conectar com o servidor. Tente novamente.', 'error');
    }
    finally {
        recoverBtn.disabled = false;
        recoverBtn.innerHTML = '<strong>Enviar</strong>';
    }
});
