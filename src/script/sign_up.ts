// Desenvolvido por Carlos Liberato

// Captura o botão de cadastro pelo ID "signup-btn".
const signupBtn = document.getElementById("signup-btn") as HTMLButtonElement;
// Captura o elemento DIV onde as mensagens de status (sucesso/erro) serão exibidas.
const messageDiv_SUP = document.getElementById("signup-message") as HTMLDivElement; 

// Adiciona um "ouvinte" para o evento de clique no botão de cadastro.
signupBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // Impede a ação padrão do botão (como recarregar a página).

    // 1. Captura de Dados: Pega os valores digitados nos campos do formulário.
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const phone = (document.getElementById("phone") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

    // Verifica se todos os campos obrigatórios foram preenchidos.
    if (!name || !email || !phone || !password) {
        messageDiv_SUP.textContent = "Por favor, preencha todos os campos.";
        messageDiv_SUP.style.color = "red";
        return; // Sai da função, impedindo o envio da requisição.
    }

    //Feedback Visual
    signupBtn.disabled = true; // Desabilita o botão para evitar envio duplicado.
    messageDiv_SUP.textContent = "Tentando cadastrar...";
    messageDiv_SUP.style.color = "blue"; // Alerta visual de processamento.

    try {
        // Envia uma requisição POST para o endpoint de cadastro (/auth/register).
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Mapeia os dados do frontend para os nomes que o backend espera (nome, telefone, senha).
            body: JSON.stringify({ nome: name, email, telefone: phone, senha: password }),
        });

        const message = await response.text();
        messageDiv_SUP.textContent = message;
        // Se o status for 200 (ok), a mensagem fica verde (sucesso); caso contrário (400, 500), fica vermelha (erro).
        messageDiv_SUP.style.color = response.ok ? "green" : "red";
        
        // 6. Ação em Caso de Falha:
        if (!response.ok) {
            // Se o cadastro falhar (e-mail duplicado, erro no servidor), reabilita o botão para nova tentativa.
            signupBtn.disabled = false;
        }

    } catch (error) {
        // Lida com falhas de rede ou servidor inacessível.
        console.error("Erro ao conectar com o servidor:", error);
        messageDiv_SUP.textContent = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
        messageDiv_SUP.style.color = "red";
        signupBtn.disabled = false; // Reabilita o botão.
    }
});