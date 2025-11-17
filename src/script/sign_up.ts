// Desenvolvido por Carlos Liberato (Cadastro)
// Felipe Miranda (Sessão)

// Captura o botão de cadastro e a área de mensagem na tela de signup
const signupBtn = document.getElementById("signup-btn") as HTMLButtonElement;
const messageDiv_SUP = document.getElementById("signup-message") as HTMLDivElement; 

// Ao carregar a página, verifica se já está logado
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/auth/verificar-sessao', {
            credentials: 'include',
            cache: 'no-cache'
        });
        const data = await response.json();
        if (data.logado) {
            // Se já estiver logado, redireciona para dashboard
            console.log('Usuário já está logado, redirecionando...');
            window.location.replace('/dashboard');
            return;
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
    }
});

// Evento de clique no botão de cadastro
signupBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // Evita recarregar a página no submit

    // Pega valores digitados pelo usuário
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const phone = (document.getElementById("phone") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const confirmPassword = (document.getElementById("confirm-password") as HTMLInputElement).value;

    // Validação dos campos obrigatórios
    if (!name || !email || !phone || !password || !confirmPassword) {
        messageDiv_SUP.textContent = "Por favor, preencha todos os campos.";
        messageDiv_SUP.style.color = "red";
        messageDiv_SUP.style.fontSize = "12px"
        return;
    }

    // Campos de senha: confirmação
    if (password != confirmPassword){
        messageDiv_SUP.textContent = "Erro: As senhas não se conferem.";
        messageDiv_SUP.style.color = "red";
        messageDiv_SUP.style.fontSize = "12px";
        return;
    }

    // Validação tamanho mínimo da senha
    if (password.length < 8){
        messageDiv_SUP.textContent = "Erro: A senha deve ter no mínimo 8 caracteres.";
        messageDiv_SUP.style.color = "red";
        messageDiv_SUP.style.fontSize = "12px";
        return;
    }

    // Feedback visual durante cadastro
    signupBtn.disabled = true;
    messageDiv_SUP.textContent = "Tentando cadastrar...";
    messageDiv_SUP.style.color = "blue";
    messageDiv_SUP.style.fontSize = "12px"

    try {
        // Envia os dados de signup ao backend (POST /auth/register)
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ nome: name, email, telefone: phone, senha: password }),
        });

        const message = await response.text();
        messageDiv_SUP.textContent = message;
        messageDiv_SUP.style.color = response.ok ? "green" : "red";
        
        // Se cadastro ok, redireciona; se falha, reabilita botão
        if (response.ok) {
            setTimeout(() => {
                window.location.href = "/dashboard"
            }, 500)
        }else{
            signupBtn.disabled = false;
        }
    } catch (error) {
        // Erro de rede ou backend
        console.error("Erro ao conectar com o servidor:", error);
        messageDiv_SUP.textContent = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
        messageDiv_SUP.style.color = "red";
        messageDiv_SUP.style.fontSize = "12px"
        signupBtn.disabled = false;
    }
});
