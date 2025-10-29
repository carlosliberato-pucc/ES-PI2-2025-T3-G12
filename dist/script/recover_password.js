"use strict";
// Desenvolvido por Felipe Miranda
// Script para página de recuperação de senha
const form = document.getElementById('recoverForm');
const emailInput = document.getElementById('email');
const recoverBtn = document.getElementById('recover-btn');
const messageDiv1 = document.getElementById('message');
console.log('🚀 Script recover_password.ts carregado!');
function showMessage1(text, type) {
    messageDiv1.textContent = text;
    messageDiv1.className = `message ${type}`;
    messageDiv1.style.display = 'block';
}
function hideMessage1() {
    messageDiv1.style.display = 'none';
}
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage1();
    const email = emailInput.value.trim();
    // Validação básica
    if (!email || !email.includes('@')) {
        showMessage1('Por favor, digite um e-mail válido', 'error');
        return;
    }
    // Desabilitar botão durante requisição
    recoverBtn.disabled = true;
    recoverBtn.innerHTML = '<strong>Enviando...</strong>';
    try {
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
            // Opcional: redirecionar após alguns segundos
            setTimeout(() => {
                window.location.href = '/sign_in.html';
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
