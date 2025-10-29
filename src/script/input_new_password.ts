// Desenvolvido por Felipe Miranda
// Script para redefinição de senha

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const loadingDiv = document.getElementById('loading') as HTMLDivElement;
const formDiv = document.getElementById('resetForm') as HTMLDivElement;
const passwordForm = document.getElementById('passwordForm') as HTMLFormElement;
const novaSenhaInput = document.getElementById('novaSenha') as HTMLInputElement;
const confirmarSenhaInput = document.getElementById('confirmarSenha') as HTMLInputElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const messageDiv = document.getElementById('message') as HTMLDivElement;

function showMessage(text: string, type: 'success' | 'error') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

function hideMessage() {
    messageDiv.style.display = 'none';
}

// Validar token ao carregar página
async function validarToken() {
    if (!token) {
        loadingDiv.innerHTML = `
            <h2 style="color: #e74c3c;">Token Inválido</h2>
            <p style="color: #666; margin: 20px 0;">
                Link de recuperação inválido ou incompleto.
            </p>
            <a href="/recover_password.html" 
               style="color: #667eea; text-decoration: none; font-weight: 600;">
                Solicitar nova recuperação →
            </a>
        `;
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/auth/validate-token?token=${token}`, {
            credentials: 'include'
        });
        
        const data = await response.json();

        if (data.success) {
            // Token válido, mostrar formulário
            loadingDiv.style.display = 'none';
            formDiv.style.display = 'block';
        } else {
            // Token inválido/expirado
            loadingDiv.innerHTML = `
                <h2 style="color: #e74c3c;">Token Expirado</h2>
                <p style="color: #666; margin: 20px 0;">
                    ${data.message || 'Este link de recuperação expirou ou já foi utilizado.'}
                </p>
                <a href="/recover_password.html" 
                   style="color: #667eea; text-decoration: none; font-weight: 600;">
                    Solicitar nova recuperação →
                </a>
            `;
        }
    } catch (error) {
        console.error('Erro ao validar token:', error);
        loadingDiv.innerHTML = `
            <h2 style="color: #e74c3c;">Erro</h2>
            <p style="color: #666;">Erro ao conectar com o servidor.</p>
        `;
    }
}

// Redefinir senha
passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const novaSenha = novaSenhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    // Validações
    if (novaSenha.length < 6) {
        showMessage('A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }

    if (novaSenha !== confirmarSenha) {
        showMessage('As senhas não coincidem', 'error');
        return;
    }

    resetBtn.disabled = true;
    resetBtn.innerHTML = '<strong>Redefinindo...</strong>';

    try {
        const response = await fetch('http://localhost:3000/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token, novaSenha })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Senha redefinida com sucesso! Redirecionando...', 'success');
            
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                window.location.href = '/sign_in.html';
            }, 2000);
        } else {
            showMessage(data.message || 'Erro ao redefinir senha', 'error');
            resetBtn.disabled = false;
            resetBtn.innerHTML = '<strong>Redefinir Senha</strong>';
        }

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        showMessage('Erro ao conectar com o servidor', 'error');
        resetBtn.disabled = false;
        resetBtn.innerHTML = '<strong>Redefinir Senha</strong>';
    }
});

// Validar token ao carregar a página
validarToken();